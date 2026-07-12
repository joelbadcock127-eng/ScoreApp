import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server/supabase';
import { getActiveOrDefaultId } from '@/lib/server/config';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from('leads')
    .insert({
      first_name: String(body.first_name ?? '').slice(0, 200),
      last_name: String(body.last_name ?? '').slice(0, 200),
      email: String(body.email ?? '').slice(0, 320),
      business: String(body.business ?? '').slice(0, 300),
      contact_opt_in: Boolean(body.contact_opt_in),
      status: 'started',
      scorecard_id: await getActiveOrDefaultId(),
    })
    .select('id')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
