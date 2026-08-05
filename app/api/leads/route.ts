import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server/supabase';
import { getActiveOrDefaultId, getConfig, listScorecards } from '@/lib/server/config';

// Lead columns with their own storage; everything else the lead form collects
// goes into custom_fields keyed by the form field's key.
const STANDARD_KEYS = new Set(['first_name', 'last_name', 'email', 'business', 'contact_opt_in']);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const sb = supabaseAdmin();
  // Explicit scorecard (distinct /s/<id> URLs) — must exist; else cookie/host/default.
  let scorecardId: number | null = null;
  const wanted = Number(body.scorecard_id);
  if (Number.isInteger(wanted) && wanted > 0) {
    const all = await listScorecards();
    if (all.some((s) => s.id === wanted)) scorecardId = wanted;
  }
  const resolvedId = scorecardId ?? (await getActiveOrDefaultId());

  // Custom lead-form fields (anything beyond the standard columns) are kept
  // only for keys that actually exist on this scorecard's enabled form fields,
  // so the column can't be stuffed with arbitrary payloads.
  const customFields: Record<string, string | boolean> = {};
  try {
    const config = await getConfig(resolvedId);
    for (const f of config.leadForm?.fields ?? []) {
      if (!f.enabled || STANDARD_KEYS.has(f.key) || !(f.key in body)) continue;
      const v = (body as Record<string, unknown>)[f.key];
      customFields[f.key] = f.type === 'checkbox' ? Boolean(v) : String(v ?? '').slice(0, 500);
    }
  } catch (e) {
    console.error('[leads] custom field capture failed:', e);
  }

  const row = {
    first_name: String(body.first_name ?? '').slice(0, 200),
    last_name: String(body.last_name ?? '').slice(0, 200),
    email: String(body.email ?? '').slice(0, 320),
    business: String(body.business ?? '').slice(0, 300),
    contact_opt_in: Boolean(body.contact_opt_in),
    status: 'started',
    scorecard_id: resolvedId,
  };
  let { data, error } = await sb
    .from('leads')
    .insert({ ...row, custom_fields: customFields })
    .select('id')
    .single();
  // Databases that haven't run the 20260805 migration yet: store the lead
  // without custom fields rather than losing it.
  const missingColumn =
    error && (error.code === 'PGRST204' || error.code === '42703' || /custom_fields/i.test(error.message ?? ''));
  if (missingColumn) {
    console.error('[leads] custom_fields column missing (run the 20260805 migration); storing without it');
    ({ data, error } = await sb.from('leads').insert(row).select('id').single());
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data!.id });
}
