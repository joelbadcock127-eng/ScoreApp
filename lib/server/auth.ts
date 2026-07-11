import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

const COOKIE = 'sc_admin';

function expectedToken() {
  const password = process.env.ADMIN_PASSWORD || '';
  return createHmac('sha256', password).update('scoreapp-admin').digest('hex');
}

export function adminToken(password: string): string | null {
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) return null;
  return expectedToken();
}

export function isAdmin(): boolean {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return false;
  const expected = expectedToken();
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

export const ADMIN_COOKIE = COOKIE;
