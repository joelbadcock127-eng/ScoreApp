import { NextRequest, NextResponse } from 'next/server';
import { getSessionAccountId } from '@/lib/server/auth';
import { listMyScorecards } from '@/lib/server/config';
import { supabaseAdmin } from '@/lib/server/supabase';

export const dynamic = 'force-dynamic';

// DELETE: permanently remove one lead (test entries, duplicates, mistakes).
// Only leads on a scorecard the logged-in account owns. Their responses go
// with them, so the admin confirms in the UI first.
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const accountId = getSessionAccountId();
  if (accountId == null) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const sb = supabaseAdmin();
  const { data: lead } = await sb.from('leads').select('id, scorecard_id').eq('id', params.id).maybeSingle();
  if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const mine = await listMyScorecards();
  if (!mine.some((s) => s.id === lead.scorecard_id)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await sb.from('leads').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
