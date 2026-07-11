import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server/supabase';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const path = typeof body.path === 'string' ? body.path.slice(0, 200) : '/';
  await supabaseAdmin().from('visits').insert({ path });
  return NextResponse.json({ ok: true });
}
