import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import * as React from 'react';
import { supabaseAdmin } from './supabase';

// React.cache exists in the server runtime; fall back to identity elsewhere
// (scripts, tests) so importing this module never crashes.
const cache: <T extends (...args: never[]) => unknown>(fn: T) => T =
  typeof React.cache === 'function' ? React.cache : (fn) => fn;

export const SESSION_COOKIE = 'sc_session';
const SESSION_DAYS = 30;

// ——— Passwords (scrypt, no external deps) ————————————————————————————

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `s2$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = String(stored || '').split('$');
  if (scheme !== 's2' || !salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  try {
    return timingSafeEqual(candidate, Buffer.from(hash, 'hex'));
  } catch {
    return false;
  }
}

// ——— Session tokens: <accountId>.<expiresEpoch>.<hmac> ————————————————

function secret(): string {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dev';
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('hex');
}

export function sessionToken(accountId: number): string {
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = `${accountId}.${expires}`;
  return `${payload}.${sign(payload)}`;
}

export function parseSessionToken(token: string | undefined): number | null {
  if (!token) return null;
  const [id, expires, mac] = token.split('.');
  if (!id || !expires || !mac) return null;
  const expected = sign(`${id}.${expires}`);
  try {
    if (!timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  if (Number(expires) < Date.now()) return null;
  const accountId = Number(id);
  return Number.isInteger(accountId) && accountId > 0 ? accountId : null;
}

// ——— Request helpers ————————————————————————————————————————————————

// Synchronous: verifies the signed cookie without touching the database.
// Enough for "is this request from a logged-in account" checks in API routes.
export function getSessionAccountId(): number | null {
  try {
    return parseSessionToken(cookies().get(SESSION_COOKIE)?.value);
  } catch {
    return null; // outside a request context
  }
}

export function isAdmin(): boolean {
  return getSessionAccountId() != null;
}

export interface SessionAccount {
  id: number;
  name: string;
  email: string;
  role: 'owner' | 'member';
  users: { name: string; email: string; role: string }[];
}

// Full account row for the current session, memoised per request.
export const getSessionAccount = cache(async (): Promise<SessionAccount | null> => {
  const id = getSessionAccountId();
  if (id == null) return null;
  const sb = supabaseAdmin();
  const { data } = await sb.from('accounts').select('id, name, email, role, users').eq('id', id).maybeSingle();
  if (!data) return null;
  return {
    id: data.id as number,
    name: data.name as string,
    email: data.email as string,
    role: data.role === 'owner' ? 'owner' : 'member',
    users: (data.users as SessionAccount['users']) ?? [],
  };
});

export async function isOwner(): Promise<boolean> {
  return (await getSessionAccount())?.role === 'owner';
}

// Kept for the legacy admin cookie clearing on logout.
export const ADMIN_COOKIE = 'sc_admin';
