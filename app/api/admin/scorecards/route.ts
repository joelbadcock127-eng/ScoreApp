import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/server/auth';
import {
  BASE_DOMAIN,
  createScorecard,
  deleteScorecard,
  listScorecards,
  setDefaultScorecard,
  setScorecardCustomDomain,
  setScorecardDomain,
  SCORECARD_COOKIE,
} from '@/lib/server/config';

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

  if (body.action === 'set-default') {
    const id = Number(body.id);
    if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    const exists = (await listScorecards()).some((s) => s.id === id);
    if (!exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await setDefaultScorecard(id);
    return NextResponse.json({ ok: true, id });
  }

  if (body.action === 'delete') {
    const id = Number(body.id);
    if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    const all = await listScorecards();
    const target = all.find((s) => s.id === id);
    if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (target.is_default) return NextResponse.json({ error: 'The live (default) scorecard cannot be deleted.' }, { status: 400 });
    if (all.length <= 1) return NextResponse.json({ error: 'You need at least one scorecard.' }, { status: 400 });
    await deleteScorecard(id);
    const res = NextResponse.json({ ok: true });
    // If the deleted scorecard was the one being edited, point the cookie back at the default.
    const fallback = all.find((s) => s.is_default && s.id !== id) ?? all.find((s) => s.id !== id);
    if (fallback) res.cookies.set(SCORECARD_COOKIE, String(fallback.id), { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 });
    return res;
  }

  if (body.action === 'set-domain') {
    const id = Number(body.id);
    if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    const raw = String(body.domain ?? '').trim().toLowerCase();
    if (raw === '') {
      await setScorecardDomain(id, null);
      return NextResponse.json({ ok: true, domain: null });
    }
    if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(raw) || raw === 'www') {
      return NextResponse.json(
        { error: 'Use only lowercase letters, numbers and hyphens (not starting or ending with a hyphen).' },
        { status: 400 }
      );
    }
    const taken = (await listScorecards()).some((s) => s.domain === raw && s.id !== id);
    if (taken) return NextResponse.json({ error: 'That subdomain is already used by another scorecard.' }, { status: 409 });
    await setScorecardDomain(id, raw);
    return NextResponse.json({ ok: true, domain: raw });
  }

  if (body.action === 'set-custom-domain') {
    const id = Number(body.id);
    if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    const raw = String(body.domain ?? '')
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '')
      .replace(/^www\./, '');
    if (raw === '') {
      await setScorecardCustomDomain(id, null);
      return NextResponse.json({ ok: true, customDomain: null });
    }
    // Must be a real hostname with at least one dot, and not one of ours.
    if (!/^(?=.{4,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(raw)) {
      return NextResponse.json({ error: 'Enter a valid domain, e.g. scorecard.yourbusiness.com' }, { status: 400 });
    }
    if (raw === BASE_DOMAIN || raw.endsWith(`.${BASE_DOMAIN}`)) {
      return NextResponse.json(
        { error: `That is a managed ${BASE_DOMAIN} address — use the subdomain field above instead.` },
        { status: 400 }
      );
    }
    const taken = (await listScorecards()).some((s) => s.custom_domain === raw && s.id !== id);
    if (taken) return NextResponse.json({ error: 'That domain is already used by another scorecard.' }, { status: 409 });
    await setScorecardCustomDomain(id, raw);
    return NextResponse.json({ ok: true, customDomain: raw });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
