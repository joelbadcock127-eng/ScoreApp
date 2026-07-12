import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/server/auth';
import { createScorecard, listScorecards, SCORECARD_COOKIE } from '@/lib/server/config';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ scorecards: await listScorecards() });
}

// POST { action: 'create', name } | { action: 'activate', id }
export async function POST(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  if (body.action === 'create') {
    const name = String(body.name ?? '').trim();
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
    const id = await createScorecard(name);
    const res = NextResponse.json({ ok: true, id });
    res.cookies.set(SCORECARD_COOKIE, String(id), { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 });
    return res;
  }

  if (body.action === 'activate') {
    const id = Number(body.id);
    if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    const exists = (await listScorecards()).some((s) => s.id === id);
    if (!exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const res = NextResponse.json({ ok: true, id });
    res.cookies.set(SCORECARD_COOKIE, String(id), { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 });
    return res;
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
