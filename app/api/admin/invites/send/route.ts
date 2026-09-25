import { NextRequest, NextResponse } from 'next/server';
import { getSessionAccount, getSessionAccountId } from '@/lib/server/auth';
import { getActiveOrDefaultId, getConfig, listMyScorecards, publicOrigin, saveConfig } from '@/lib/server/config';
import { sendEmail } from '@/lib/server/email';
import { InviteRecipient, inviteLandingUrl, renderInvite } from '@/lib/server/invites';
import { DRIP_MAX_PER_DAY, inviteBlocker, sendDripAllowance, sendInvitePass } from '@/lib/server/inviteSend';
import { signatureHtmlForScorecard } from '@/lib/server/signature';
import { stripTags } from '@/lib/richtext';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// POST actions:
//   { test: true, to }                  a rendered test invite to one address
//   { confirm: true }                   one batch (~20) of the queue; the
//                                       client keeps calling while remaining > 0
//   { confirm: true, drip: { perDay } } start a drip: record it on the
//                                       scorecard, send today's allowance now;
//                                       the daily job sends the rest
//   { drip: { enabled: false } }        pause the drip (queue stays)

async function ownedScorecardId(): Promise<number | null> {
  if (getSessionAccountId() == null) return null;
  const id = await getActiveOrDefaultId();
  const mine = await listMyScorecards();
  return mine.some((s) => s.id === id) ? id : null;
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

  // ——— Pause a drip: no email involved, so no template checks. ——————————
  if (body.drip && typeof body.drip === 'object' && body.drip.enabled === false) {
    if (ie?.drip) {
      config.inviteEmail = { ...ie, drip: { ...ie.drip, enabled: false } };
      await saveConfig(config, scorecardId);
    }
    return NextResponse.json({ ok: true, drip: null });
  }

  const blocker = inviteBlocker(config);
  if (blocker || !ie) return NextResponse.json({ error: blocker ?? 'No invite email configured.' }, { status: 400 });

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
    // Links point at the scorecard's own address, not the admin host.
    const origin = await publicOrigin(scorecardId, req.nextUrl.origin);
    const signatureHtml = await signatureHtmlForScorecard(scorecardId);
    // Send the test exactly like a real invite (same subject, same mailbox-level
    // unsubscribe headers) so its spam/inbox placement reflects the real send.
    // The sample lead is not a real row, so its link opens the landing page
    // in preview: the start button runs the questions without saving and
    // ends on this scorecard's thank-you page.
    const testLink = inviteLandingUrl(origin, req.nextUrl.origin, scorecardId, 'preview=1');
    const { subject, html, unsubscribeUrl } = renderInvite(config, sample, origin, signatureHtml, testLink);
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

  // ——— Real sends require the sender's explicit consent confirmation. ——
  if (body.confirm !== true) {
    return NextResponse.json(
      { error: 'Confirm that your recipients consented to hear from you before sending.' },
      { status: 400 }
    );
  }

  try {
    // ——— Start a drip: save it, then send today's allowance. ————————————
    if (body.drip && typeof body.drip === 'object') {
      const perDay = Math.round(Number(body.drip.perDay));
      if (!Number.isFinite(perDay) || perDay < 1 || perDay > DRIP_MAX_PER_DAY) {
        return NextResponse.json({ error: `Enter how many to send per day, from 1 to ${DRIP_MAX_PER_DAY}.` }, { status: 400 });
      }
      config.inviteEmail = { ...ie, drip: { enabled: true, perDay, startedAt: new Date().toISOString() } };
      await saveConfig(config, scorecardId);
      const r = await sendDripAllowance(scorecardId, accountId, config, req.nextUrl.origin);
      return NextResponse.json({ ...r, drip: { perDay } });
    }

    // ——— Send everything, one batch per call. ——————————————————————————
    const r = await sendInvitePass(scorecardId, accountId, config, req.nextUrl.origin);
    return NextResponse.json(r);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Send failed.' }, { status: 500 });
  }
}
