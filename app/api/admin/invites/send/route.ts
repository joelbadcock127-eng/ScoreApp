import { NextRequest, NextResponse } from 'next/server';
import { getSessionAccount, getSessionAccountId } from '@/lib/server/auth';
import { getActiveOrDefaultId, getConfig, listMyScorecards } from '@/lib/server/config';
import { sendEmail } from '@/lib/server/email';
import { InviteRecipient, renderInvite } from '@/lib/server/invites';
import { supabaseAdmin } from '@/lib/server/supabase';
import { stripTags } from '@/lib/richtext';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// One click sends one batch; the client keeps calling while `remaining` > 0.
// Small batches keep each invocation well inside serverless time limits and
// under provider rate limits.
const BATCH_SIZE = 20;
const SEND_GAP_MS = 550; // Resend allows ~2 requests/second

async function ownedScorecardId(): Promise<number | null> {
  if (getSessionAccountId() == null) return null;
  const id = await getActiveOrDefaultId();
  const mine = await listMyScorecards();
  return mine.some((s) => s.id === id) ? id : null;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function POST(req: NextRequest) {
  const accountId = getSessionAccountId();
  const scorecardId = await ownedScorecardId();
  if (accountId == null || scorecardId == null) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const config = await getConfig(scorecardId);
  const ie = config.inviteEmail;

  if (!ie || !stripTags(ie.content ?? '').trim() || !(ie.subject ?? '').trim()) {
    return NextResponse.json({ error: 'Write and save the invite email (subject and content) first.' }, { status: 400 });
  }
  if (!ie.senderName.trim()) {
    return NextResponse.json(
      { error: 'Add your sender identification (business name) first — anti-spam law requires every bulk email to say who it’s from.' },
      { status: 400 }
    );
  }

  const origin = req.nextUrl.origin;
  const sb = supabaseAdmin();

  // ——— Test send: the rendered invite with sample data, to the admin. ————
  if (body.test) {
    const account = await getSessionAccount();
    const to = String(body.to ?? account?.email ?? '').trim();
    if (!/.+@.+\..+/.test(to)) {
      return NextResponse.json({ error: 'Enter a valid email address for the test.' }, { status: 400 });
    }
    const sample: InviteRecipient = {
      id: '00000000-0000-0000-0000-000000000000',
      first_name: 'Test',
      last_name: 'Recipient',
      email: to,
      business: 'Example Pty Ltd',
    };
    // Send the test exactly like a real invite (same subject, same mailbox-level
    // unsubscribe headers) so its spam/inbox placement reflects the real send.
    // "[Test]"-style bracket prefixes and missing List-Unsubscribe headers both
    // score worse with spam filters than the production email would.
    const { subject, html, unsubscribeUrl } = renderInvite(config, sample, origin);
    const result = await sendEmail({
      to: [to],
      subject: stripTags(subject),
      html,
      fromAddress: ie.fromAddress || undefined,
      fromName: ie.fromName || undefined,
      replyTo: ie.replyTo || undefined,
      apiKey: config.email?.apiKey,
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    });
    if (result.sent) return NextResponse.json({ ok: true, provider: result.provider, to });
    return NextResponse.json(
      { error: result.provider === 'none' ? 'No email provider configured. Add a Resend API key in Result Email settings.' : result.error },
      { status: 502 }
    );
  }

  // ——— Real batch. Requires the sender's explicit consent confirmation. ——
  if (body.confirm !== true) {
    return NextResponse.json(
      { error: 'Confirm that your recipients consented to hear from you before sending.' },
      { status: 400 }
    );
  }

  const { data: queued, error } = await sb
    .from('leads')
    .select('id, first_name, last_name, email, business')
    .eq('scorecard_id', scorecardId)
    .eq('status', 'invited')
    .is('invited_at', null)
    .order('created_at', { ascending: true })
    .limit(BATCH_SIZE);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const batch = (queued ?? []) as InviteRecipient[];
  if (batch.length === 0) return NextResponse.json({ sent: 0, failed: 0, remaining: 0, errors: [] });

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
    const { subject, html, unsubscribeUrl } = renderInvite(config, lead, origin);
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

  const { count: remaining } = await sb
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('scorecard_id', scorecardId)
    .eq('status', 'invited')
    .is('invited_at', null);

  return NextResponse.json({ sent, failed, remaining: remaining ?? 0, errors });
}
