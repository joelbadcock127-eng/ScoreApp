import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminToken } from '@/lib/server/auth';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const token = adminToken(String(body.password ?? ''));
  if (!token) return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}
