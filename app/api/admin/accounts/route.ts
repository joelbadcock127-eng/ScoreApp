import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server/supabase';
import { getSessionAccount, hashPassword } from '@/lib/server/auth';
import { listScorecards } from '@/lib/server/config';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function requireOwner() {
  const account = await getSessionAccount();
  return account?.role === 'owner' ? account : null;
}

export async function GET() {
  const owner = await requireOwner();
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const sb = supabaseAdmin();
  const [{ data: accounts }, scorecards] = await Promise.all([
    sb
      .from('accounts')
      .select('id, name, email, role, created_at, features, ai_used')
      .order('created_at', { ascending: true }),
    listScorecards(),
  ]);
  return NextResponse.json({
    accounts: (accounts ?? []).map((a) => ({
      ...a,
      scorecards: scorecards.filter((s) => s.account_id === a.id).map((s) => ({ id: s.id, name: s.name })),
    })),
  });
}

// POST { action: 'create' | 'rename' | 'reset-password' | 'delete', ... }
export async function POST(req: NextRequest) {
  const owner = await requireOwner();
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  const sb = supabaseAdmin();

  if (body.action === 'create') {
    const name = String(body.name ?? '').trim().slice(0, 120);
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    if (!name) return NextResponse.json({ error: 'Name required.' }, { status: 400 });
    if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    const { data: existing } = await sb.from('accounts').select('id').ilike('email', email).maybeSingle();
    if (existing) return NextResponse.json({ error: 'An account with that email already exists.' }, { status: 409 });
    const { data, error } = await sb
      .from('accounts')
      .insert({ name, email, password_hash: hashPassword(password), role: 'member' })
      .select('id')
      .single();
    if (error) return NextResponse.json({ error: 'Could not create the account.' }, { status: 500 });
    return NextResponse.json({ ok: true, id: data.id });
  }

  const id = Number(body.id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  if (body.action === 'rename') {
    const name = String(body.name ?? '').trim().slice(0, 120);
    if (!name) return NextResponse.json({ error: 'Name required.' }, { status: 400 });
    const { error } = await sb.from('accounts').update({ name, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) return NextResponse.json({ error: 'Rename failed.' }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (body.action === 'set-features') {
    const f = body.features ?? {};
    const features = {
      custom_domain: f.custom_domain !== false,
      custom_design: f.custom_design !== false,
      ai_limit:
        f.ai_limit == null || f.ai_limit === '' ? null : Math.max(0, Math.min(100000, Math.round(Number(f.ai_limit)))),
    };
    if (features.ai_limit != null && !Number.isFinite(features.ai_limit)) {
      return NextResponse.json({ error: 'AI limit must be a number.' }, { status: 400 });
    }
    const { error } = await sb
      .from('accounts')
      .update({ features, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return NextResponse.json({ error: 'Could not save features.' }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (body.action === 'reset-ai-usage') {
    const { error } = await sb.from('accounts').update({ ai_used: 0 }).eq('id', id);
    if (error) return NextResponse.json({ error: 'Could not reset usage.' }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (body.action === 'reset-password') {
    const password = String(body.password ?? '');
    if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    const { error } = await sb
      .from('accounts')
      .update({ password_hash: hashPassword(password), updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return NextResponse.json({ error: 'Reset failed.' }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (body.action === 'delete') {
    if (id === owner.id) return NextResponse.json({ error: 'You can’t delete your own owner account.' }, { status: 400 });
    const { data: target } = await sb.from('accounts').select('id, role').eq('id', id).maybeSingle();
    if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (target.role === 'owner') return NextResponse.json({ error: 'Owner accounts cannot be deleted.' }, { status: 400 });
    // Keep their scorecards: reassign to the owner account rather than deleting data.
    const { error: moveErr } = await sb.from('scorecard_config').update({ account_id: owner.id }).eq('account_id', id);
    if (moveErr) return NextResponse.json({ error: 'Could not reassign scorecards.' }, { status: 500 });
    const { error } = await sb.from('accounts').delete().eq('id', id);
    if (error) return NextResponse.json({ error: 'Delete failed.' }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
