import { NextRequest, NextResponse } from 'next/server';
import { getSessionAccountId } from '@/lib/server/auth';
import { getActiveOrDefaultId, listMyScorecards } from '@/lib/server/config';
import { supabaseAdmin } from '@/lib/server/supabase';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IMPORT_CAP = 2000;

// The scorecard the admin is working on, only if their account owns it.
async function ownedScorecardId(): Promise<number | null> {
  if (getSessionAccountId() == null) return null;
  const id = await getActiveOrDefaultId();
  const mine = await listMyScorecards();
  return mine.some((s) => s.id === id) ? id : null;
}

// GET: recipient summary + recent recipients for the Distribution tab.
export async function GET() {
  const accountId = getSessionAccountId();
  const scorecardId = await ownedScorecardId();
  if (accountId == null || scorecardId == null) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const sb = supabaseAdmin();
  const { data: leads, error } = await sb
    .from('leads')
    .select('id, first_name, last_name, email, status, invited_at, created_at')
    .eq('scorecard_id', scorecardId)
    .in('status', ['invited', 'completed'])
    .not('email', 'eq', '')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { count: suppressed } = await sb
    .from('suppressions')
    .select('id', { count: 'exact', head: true })
    .eq('account_id', accountId);

  // Only invite-originated rows: organic completions have no invited_at.
  const rows = (leads ?? []).filter((l) => l.status === 'invited' || l.invited_at != null);
  const queued = rows.filter((l) => l.status === 'invited' && !l.invited_at).length;
  const sent = rows.filter((l) => l.invited_at != null && l.status !== 'completed').length;
  const completed = rows.filter((l) => l.invited_at != null && l.status === 'completed').length;
  return NextResponse.json({
    queued,
    sent,
    completed,
    suppressed: suppressed ?? 0,
    recent: rows.slice(0, 100),
  });
}

// POST: import a recipient list. Body: { rows: [{email, first_name?, last_name?, business?}] }
// Dedupes, validates, and skips suppressed addresses and existing recipients.
export async function POST(req: NextRequest) {
  const accountId = getSessionAccountId();
  const scorecardId = await ownedScorecardId();
  if (accountId == null || scorecardId == null) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const rows = Array.isArray(body?.rows) ? body.rows.slice(0, IMPORT_CAP) : null;
  if (!rows) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const seen = new Set<string>();
  const clean: { email: string; first_name: string; last_name: string; business: string }[] = [];
  let invalid = 0;
  for (const r of rows) {
    const email = String(r?.email ?? '').trim().toLowerCase().slice(0, 320);
    if (!EMAIL_RE.test(email)) {
      invalid++;
      continue;
    }
    if (seen.has(email)) continue;
    seen.add(email);
    clean.push({
      email,
      first_name: String(r?.first_name ?? '').trim().slice(0, 200),
      last_name: String(r?.last_name ?? '').trim().slice(0, 200),
      business: String(r?.business ?? '').trim().slice(0, 300),
    });
  }
  if (clean.length === 0) {
    return NextResponse.json({ imported: 0, skipped: 0, invalid, suppressed: 0 });
  }

  const sb = supabaseAdmin();
  const emails = clean.map((c) => c.email);

  // Never import anyone who has unsubscribed from this account.
  const { data: sup } = await sb
    .from('suppressions')
    .select('email')
    .eq('account_id', accountId)
    .in('email', emails);
  const suppressedSet = new Set((sup ?? []).map((s) => String(s.email).toLowerCase()));

  // Skip addresses already on this scorecard (any status) so re-imports
  // never double-send.
  const { data: existing } = await sb
    .from('leads')
    .select('email')
    .eq('scorecard_id', scorecardId)
    .in('email', emails);
  const existingSet = new Set((existing ?? []).map((l) => String(l.email).toLowerCase()));

  const toInsert = clean
    .filter((c) => !suppressedSet.has(c.email) && !existingSet.has(c.email))
    .map((c) => ({ ...c, status: 'invited', contact_opt_in: false, scorecard_id: scorecardId }));

  if (toInsert.length > 0) {
    const { error } = await sb.from('leads').insert(toInsert);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({
    imported: toInsert.length,
    skipped: existingSet.size,
    suppressed: clean.length - toInsert.length - existingSet.size,
    invalid,
  });
}
