import { NextRequest, NextResponse } from 'next/server';
import { listScorecards, fetchConfigById } from '@/lib/server/config';
import { inviteBlocker, sendDripAllowance } from '@/lib/server/inviteSend';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// Daily drip job (vercel.json schedules it). For every scorecard with a drip
// running, sends today's allowance from its queue. Vercel calls it with
// "Authorization: Bearer <CRON_SECRET>"; without that env var set, the job
// refuses to run so it can never be triggered from outside.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const fallbackOrigin = process.env.PUBLIC_APP_HOST
    ? `https://${process.env.PUBLIC_APP_HOST.replace(/^https?:\/\//, '')}`
    : req.nextUrl.origin;

  const report: Record<number, unknown> = {};
  for (const sc of await listScorecards()) {
    const config = await fetchConfigById(sc.id);
    const drip = config?.inviteEmail?.drip;
    if (!config || !drip?.enabled || sc.account_id == null) continue;
    if (inviteBlocker(config)) {
      report[sc.id] = { skipped: inviteBlocker(config) };
      continue;
    }
    try {
      const r = await sendDripAllowance(sc.id, sc.account_id, config, fallbackOrigin);
      report[sc.id] = { sent: r.sent, failed: r.failed, remaining: r.remaining, errors: r.errors };
    } catch (e) {
      report[sc.id] = { error: e instanceof Error ? e.message : String(e) };
    }
  }
  return NextResponse.json({ ok: true, ranAt: new Date().toISOString(), scorecards: report });
}
