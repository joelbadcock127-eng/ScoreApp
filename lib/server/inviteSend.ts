import { ScorecardConfig } from '../types';
import { sendEmail } from './email';
import { InviteRecipient, inviteLandingUrl, renderInvite } from './invites';
import { signatureHtmlForScorecard } from './signature';
import { supabaseAdmin } from './supabase';
import { publicOrigin } from './config';
import { stripTags } from '../richtext';

// One send pass over a scorecard's queue, shared by the Send button and the
// daily drip job. Sends up to `limit` queued invites (oldest first), honours
// suppressions at send time, and marks each lead invited as it goes.

const BATCH_SIZE = 20;
const SEND_GAP_MS = 550; // Resend allows ~2 requests/second

export const DRIP_MAX_PER_DAY = 100;

export interface SendPassResult {
  sent: number;
  failed: number;
  remaining: number;
  errors: string[];
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Why a scorecard cannot send invites yet, or null when it can. */
export function inviteBlocker(config: ScorecardConfig): string | null {
  const ie = config.inviteEmail;
  if (!ie || !stripTags(ie.content ?? '').trim() || !(ie.subject ?? '').trim()) {
    return 'Write and save the invite email (subject and content) first.';
  }
  if (!ie.senderName.trim()) {
    return 'Add your sender identification (business name) first — anti-spam law requires every bulk email to say who it’s from.';
  }
  return null;
}

/** Queued invites: imported, not yet sent. */
export async function queuedCount(scorecardId: number): Promise<number> {
  const { count } = await supabaseAdmin()
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('scorecard_id', scorecardId)
    .eq('status', 'invited')
    .is('invited_at', null);
  return count ?? 0;
}

/** Invites sent in the last 24 hours, the window the drip limit applies to. */
export async function sentInLastDay(scorecardId: number): Promise<number> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabaseAdmin()
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('scorecard_id', scorecardId)
    .gte('invited_at', since);
  return count ?? 0;
}

export async function sendInvitePass(
  scorecardId: number,
  accountId: number,
  config: ScorecardConfig,
  fallbackOrigin: string,
  limit = BATCH_SIZE
): Promise<SendPassResult> {
  const ie = config.inviteEmail!;
  const sb = supabaseAdmin();
  const take = Math.max(0, Math.min(limit, BATCH_SIZE));
  if (take === 0) return { sent: 0, failed: 0, remaining: await queuedCount(scorecardId), errors: [] };

  const { data: queued, error } = await sb
    .from('leads')
    .select('id, first_name, last_name, email, business')
    .eq('scorecard_id', scorecardId)
    .eq('status', 'invited')
    .is('invited_at', null)
    .order('created_at', { ascending: true })
    .limit(take);
  if (error) throw new Error(error.message);
  const batch = (queued ?? []) as InviteRecipient[];
  if (batch.length === 0) return { sent: 0, failed: 0, remaining: 0, errors: [] };

  // Links point at the scorecard's own address, and the account signature
  // (if configured) is appended to every invite.
  const [origin, signatureHtml] = await Promise.all([
    publicOrigin(scorecardId, fallbackOrigin),
    signatureHtmlForScorecard(scorecardId),
  ]);

  // Suppression is re-checked at send time, not just at import, so an
  // unsubscribe between the two is always honoured.
  const { data: sup } = await sb
    .from('suppressions')
    .select('email')
    .eq('account_id', accountId)
    .in('email', batch.map((l) => l.email));
  const suppressedSet = new Set((sup ?? []).map((s) => String(s.email).toLowerCase()));

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];
  for (const lead of batch) {
    if (suppressedSet.has(lead.email.toLowerCase())) {
      // Drop silently from the queue — they asked not to be emailed.
      await sb.from('leads').update({ invited_at: new Date().toISOString(), status: 'unsubscribed' }).eq('id', lead.id);
      continue;
    }
    const inviteLink = inviteLandingUrl(origin, fallbackOrigin, scorecardId, `lead=${lead.id}`);
    const { subject, html, unsubscribeUrl } = renderInvite(config, lead, origin, signatureHtml, inviteLink);
    const result = await sendEmail({
      to: [lead.email],
      subject: stripTags(subject),
      html,
      fromAddress: ie.fromAddress || undefined,
      fromName: ie.fromName || undefined,
      replyTo: ie.replyTo || undefined,
      apiKey: config.email?.apiKey,
      // One-click unsubscribe at the mailbox level (Gmail/Yahoo require this
      // for bulk senders).
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    });
    if (result.sent) {
      sent++;
      await sb.from('leads').update({ invited_at: new Date().toISOString() }).eq('id', lead.id);
    } else {
      failed++;
      if (errors.length < 3) errors.push(result.error || 'send failed');
      if (result.provider === 'none' || /rate|quota|limit|429/i.test(result.error ?? '')) break; // stop the batch, keep the queue
    }
    await sleep(SEND_GAP_MS);
  }

  return { sent, failed, remaining: await queuedCount(scorecardId), errors };
}

/**
 * Sends what the drip allows right now: today's allowance minus what has
 * already gone out in the last 24 hours, in batches. Used by the Start drip
 * button (first day) and the daily job (every day after).
 */
export async function sendDripAllowance(
  scorecardId: number,
  accountId: number,
  config: ScorecardConfig,
  fallbackOrigin: string
): Promise<SendPassResult & { allowance: number }> {
  const perDay = Math.min(DRIP_MAX_PER_DAY, Math.max(1, Number(config.inviteEmail?.drip?.perDay) || 0));
  const already = await sentInLastDay(scorecardId);
  let allowance = Math.max(0, perDay - already);
  const total: SendPassResult = { sent: 0, failed: 0, remaining: await queuedCount(scorecardId), errors: [] };
  while (allowance > 0 && total.remaining > 0) {
    const pass = await sendInvitePass(scorecardId, accountId, config, fallbackOrigin, allowance);
    total.sent += pass.sent;
    total.failed += pass.failed;
    total.remaining = pass.remaining;
    total.errors.push(...pass.errors.filter((e) => !total.errors.includes(e)));
    allowance -= pass.sent + pass.failed;
    if (pass.sent === 0) break; // provider trouble or nothing sendable: keep the queue
  }
  return { ...total, allowance: Math.max(0, perDay - already) };
}
