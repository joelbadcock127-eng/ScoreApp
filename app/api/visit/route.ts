import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server/supabase';
import { getActiveOrDefaultId, listScorecards } from '@/lib/server/config';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const path = typeof body.path === 'string' ? body.path.slice(0, 200) : '/';
  let scorecardId: number | null = null;
  const wanted = Number(body.scorecard_id);
  if (Number.isInteger(wanted) && wanted > 0 && (await listScorecards()).some((s) => s.id === wanted)) {
    scorecardId = wanted;
  }
  await supabaseAdmin()
    .from('visits')
    .insert({ path, scorecard_id: scorecardId ?? (await getActiveOrDefaultId()) });
  return NextResponse.json({ ok: true });
}
