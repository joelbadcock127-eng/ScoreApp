import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server/supabase';
import { ADMIN_COOKIE, hashPassword, SESSION_COOKIE, sessionToken, verifyPassword } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setSession(res: NextResponse, accountId: number) {
  res.cookies.set(SESSION_COOKIE, sessionToken(accountId), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
}

// POST { action: 'login' | 'signup', email, password, name? }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  if (!password) return NextResponse.json({ error: 'Enter your password.' }, { status: 400 });

  const sb = supabaseAdmin();

  if (body.action === 'signup') {
    const name = String(body.name ?? '').trim().slice(0, 120) || email.split('@')[0];
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }
    const { data: existing } = await sb.from('accounts').select('id').ilike('email', email).maybeSingle();
    if (existing) return NextResponse.json({ error: 'An account with that email already exists — log in instead.' }, { status: 409 });
    const { data, error } = await sb
      .from('accounts')
      .insert({ name, email, password_hash: hashPassword(password), role: 'member' })
      .select('id')
      .single();
    if (error) return NextResponse.json({ error: 'Could not create the account.' }, { status: 500 });
    const res = NextResponse.json({ ok: true, id: data.id });
    setSession(res, data.id as number);
    return res;
  }

  // login (default)
  const { data: account } = await sb
    .from('accounts')
    .select('id, password_hash')
    .ilike('email', email)
    .maybeSingle();
  if (!account || !verifyPassword(password, account.password_hash as string)) {
    return NextResponse.json({ error: 'Incorrect email or password.' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true, id: account.id });
  setSession(res, account.id as number);
  return res;
}

// DELETE — log out
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}
