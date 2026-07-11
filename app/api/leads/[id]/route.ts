import { NextRequest, NextResponse } from 'next/server';
import { getConfig } from '@/lib/server/config';
import { computeScores, questionType } from '@/lib/scoring';
import { AnswerValue } from '@/lib/types';
import { supabaseAdmin } from '@/lib/server/supabase';

const UUID_RE = /^[0-9a-f-]{36}$/i;

// Public endpoint keyed by unguessable lead UUID (same model as ScoreApp result links).
// action: "complete" (submit answers) | "update_details" (change details popup)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const sb = supabaseAdmin();

  if (body.action === 'complete') {
    const config = await getConfig();
    const answers: Record<string, AnswerValue> = {};
    for (const q of config.questions) {
      const raw = (body.answers ?? {})[q.id];
      const type = questionType(q);
      const required = q.required !== false;
      if (type === 'linear') {
        const v = Number(raw);
        if (!Number.isInteger(v) || v < q.min || v > q.max) {
          if (required) return NextResponse.json({ error: `Missing answer for ${q.id}` }, { status: 400 });
          continue;
        }
        answers[q.id] = v;
      } else if (type === 'text') {
        if (typeof raw === 'string' && raw.trim()) answers[q.id] = String(raw).slice(0, 2000);
        else if (required && !(typeof raw === 'string')) answers[q.id] = '';
      } else if (type === 'checkboxes') {
        const arr = Array.isArray(raw) ? raw.map(Number).filter((i) => Number.isInteger(i) && i >= 0 && i < (q.options ?? []).length) : [];
        answers[q.id] = arr;
      } else {
        const idx = Number(raw);
        if (!Number.isInteger(idx) || idx < 0 || idx >= (q.options ?? []).length) {
          if (required) return NextResponse.json({ error: `Missing answer for ${q.id}` }, { status: 400 });
          continue;
        }
        answers[q.id] = idx;
      }
    }
    const { categoryScores, score_total, score_max, overall_percent } = computeScores(config, answers);
    const duration = Number(body.duration_seconds);
    const { error } = await sb
      .from('leads')
      .update({
        answers,
        score_total,
        score_max,
        overall_percent,
        category_scores: categoryScores,
        status: 'completed',
        duration_seconds: Number.isFinite(duration) ? Math.max(0, Math.round(duration)) : null,
        completed_at: new Date().toISOString(),
      })
      .eq('id', params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (body.action === 'update_details') {
    const update: Record<string, unknown> = {};
    if (body.first_name !== undefined) update.first_name = String(body.first_name).slice(0, 200);
    if (body.last_name !== undefined) update.last_name = String(body.last_name).slice(0, 200);
    if (body.email !== undefined) update.email = String(body.email).slice(0, 320);
    if (body.business !== undefined) update.business = String(body.business).slice(0, 300);
    if (body.contact_opt_in !== undefined) update.contact_opt_in = Boolean(body.contact_opt_in);
    const { error } = await sb.from('leads').update(update).eq('id', params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
