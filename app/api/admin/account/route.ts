import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/server/auth';
import { getAccount, saveAccount } from '@/lib/server/config';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await getAccount());
}

export async function PUT(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  const ROLES = ['owner', 'admin', 'editor', 'viewer'];
  await saveAccount({
    name: String(body.name ?? 'My Account').slice(0, 120),
    email: String(body.email ?? '').slice(0, 320),
    users: Array.isArray(body.users)
      ? body.users.slice(0, 50).map((u: { name?: string; email?: string; role?: string }) => ({
          name: String(u.name ?? '').slice(0, 120),
          email: String(u.email ?? '').slice(0, 320),
          role: (ROLES.includes(String(u.role)) ? u.role : 'editor') as 'owner' | 'admin' | 'editor' | 'viewer',
        }))
      : [],
  });
  return NextResponse.json({ ok: true });
}
