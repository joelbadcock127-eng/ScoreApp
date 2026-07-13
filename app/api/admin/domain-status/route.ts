import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/server/auth';
import { BASE_DOMAIN, listMyScorecards } from '@/lib/server/config';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

type Status = 'live' | 'mismatch' | 'reachable' | 'unreachable';

// Server-side probe of a scorecard's connected domains: fetches /api/whoami on
// each and reports whether the domain is live and serving THIS scorecard.
async function probe(host: string, expectId: number): Promise<Status> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(`https://${host}/api/whoami`, {
      signal: ctrl.signal,
      redirect: 'follow',
      cache: 'no-store',
      headers: { accept: 'application/json' },
    });
    clearTimeout(t);
    if (!res.ok) return 'reachable';
    const json = (await res.json().catch(() => null)) as { scorecardId?: number | null } | null;
    if (json && typeof json.scorecardId === 'number') return json.scorecardId === expectId ? 'live' : 'mismatch';
    return 'reachable';
  } catch {
    return 'unreachable';
  }
}

export async function GET(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = Number(new URL(req.url).searchParams.get('id'));
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  const sc = (await listMyScorecards()).find((s) => s.id === id);
  if (!sc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const targets: { label: string; host: string }[] = [];
  if (sc.domain) targets.push({ label: 'Subdomain', host: `${sc.domain}.${BASE_DOMAIN}` });
  if (sc.custom_domain) targets.push({ label: 'Custom domain', host: sc.custom_domain });

  const results = await Promise.all(
    targets.map(async (t) => ({ ...t, status: await probe(t.host, id) }))
  );
  return NextResponse.json({ targets: results });
}
