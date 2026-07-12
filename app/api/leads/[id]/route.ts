import { NextRequest, NextResponse } from 'next/server';
import { getConfig } from '@/lib/server/config';
import { computeScores, questionMax } from '@/lib/scoring';
import { supabaseAdmin } from '@/lib/server/supabase';
import { mergeFields, sendEmail } from '@/lib/server/email';
import { stripTags } from '@/lib/richtext';
import { ScorecardConfig } from '@/lib/types';

// Fire the result email (to the lead) and the new-lead notification (to the
// owner) after completion. Failures are logged, never surfaced to the lead.
async function sendCompletionEmails(
  config: ScorecardConfig,
  lead: { id: string; first_name: string; last_name: string; email: string; status: string },
  score: number,
  origin: string
) {
  const fields = {
    first_name: lead.first_name,
    last_name: lead.last_name,
    email: lead.email,
    status: 'Completed',
    score,
    scorecard_name: config.title,
    results_link: `${origin}/results/${lead.id}`,
    report_link: `${origin}/api/report/${lead.id}`,
  };
  const jobs: Promise<unknown>[] = [];

  const re = config.resultEmail;
  if (re?.enabled && lead.email) {
    jobs.push(
      sendEmail({
        to: [lead.email],
        subject: stripTags(mergeFields(re.subject, fields)),
        html: mergeFields(re.content, fields),
        fromAddress: re.fromAddress || undefined,
        fromName: re.fromName || undefined,
        replyTo: re.replyTo || undefined,
      })
    );
  }

  const n = config.notifications;
  const recipients = (n?.recipients ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => /.+@.+\..+/.test(s));
  if (n?.enabled && recipients.length) {
    jobs.push(
      sendEmail({
        to: recipients,
        subject: stripTags(mergeFields(n.subject, fields)),
        html: mergeFields(n.content, fields),
      })
    );
  }

  const results = await Promise.allSettled(jobs);
  for (const r of results) {
    if (r.status === 'rejected') console.error('[email] send failed:', r.reason);
  }
}

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
    const answers: Record<string, number> = {};
    for (const q of config.questions) {
      const type = q.type ?? 'scale';
      const v = Number((body.answers ?? {})[q.id]);
      // Scale answers must sit within the question range; option-based answers
      // store the achieved score (0..questionMax); open text is unscored.
      const min = type === 'scale' ? q.min : 0;
      const max = type === 'scale' ? q.max : Math.max(questionMax(q), 0);
      if (!Number.isInteger(v) || v < min || v > max) {
        return NextResponse.json({ error: `Missing answer for ${q.id}` }, { status: 400 });
      }
      answers[q.id] = v;
    }
    const { categoryScores, score_total, score_max, overall_percent } = computeScores(config, answers);
    const duration = Number(body.duration_seconds);
    const { data: lead, error } = await sb
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
      .eq('id', params.id)
      .select('id, first_name, last_name, email, status')
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (lead) {
      await sendCompletionEmails(config, lead, overall_percent, req.nextUrl.origin).catch((e) =>
        console.error('[email]', e)
      );
    }
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
