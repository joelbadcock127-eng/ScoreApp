import { NextRequest, NextResponse } from 'next/server';
import { getConfig } from '@/lib/server/config';
import { computeScores, questionMax } from '@/lib/scoring';
import { supabaseAdmin } from '@/lib/server/supabase';
import { answersSummaryHtml, emailButton, mergeFields, resultEmailFields, sendEmail, withEmailHeader } from '@/lib/server/email';
import { isSurvey } from '@/lib/scoring';
import { stripTags } from '@/lib/richtext';
import { AnswerDetail, ScorecardConfig } from '@/lib/types';

// Fire the result email (to the lead) and the new-lead notification (to the
// owner) after completion. Failures are logged, never surfaced to the lead.
async function sendCompletionEmails(
  config: ScorecardConfig,
  lead: { id: string; first_name: string; last_name: string; email: string; status: string },
  score: number,
  origin: string,
  answersSummary: string
) {
  const survey = isSurvey(config);
  const resultsLink = `${origin}/results/${lead.id}`;
  const fields = resultEmailFields(
    {
      first_name: lead.first_name,
      last_name: lead.last_name,
      email: lead.email,
      status: 'Completed',
      score,
      scorecard_name: config.title,
      results_link: resultsLink,
      report_link: `${origin}/api/report/${lead.id}`,
      answers_summary: answersSummary,
    },
    config.branding.primaryColor
  );
  // Respondent-facing merge fields must stay score/report-free for surveys:
  // the report route 404s in survey mode, and internal triage scores are never
  // shown to respondents. Owner notifications keep the real values.
  const respondentFields = survey
    ? {
        ...fields,
        score: '',
        report_link: resultsLink,
        report_download: emailButton(resultsLink, 'View my responses', config.branding.primaryColor),
      }
    : fields;
  const jobs: Promise<unknown>[] = [];

  const re = config.resultEmail;
  if (re?.enabled && lead.email) {
    jobs.push(
      sendEmail({
        to: [lead.email],
        subject: stripTags(mergeFields(re.subject, respondentFields)),
        html: withEmailHeader(mergeFields(re.content, respondentFields), re.headerImage),
        fromAddress: re.fromAddress || undefined,
        fromName: re.fromName || undefined,
        replyTo: re.replyTo || undefined,
        apiKey: config.email?.apiKey,
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
        apiKey: config.email?.apiKey,
      })
    );
  }

  const results = await Promise.allSettled(jobs);
  for (const r of results) {
    if (r.status === 'rejected') {
      console.error('[email] send threw:', r.reason);
    } else if (r.value && typeof r.value === 'object' && 'sent' in r.value) {
      const v = r.value as { sent: boolean; provider: string; error?: string };
      // sendEmail returns { sent:false } instead of throwing, so log those too
      // — otherwise a rejected provider send is completely invisible.
      if (!v.sent) console.error(`[email] ${v.provider} did not send:`, v.error ?? '(no provider configured)');
    }
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
    // Validate and score against the scorecard this lead belongs to.
    const { data: leadRow } = await sb.from('leads').select('scorecard_id').eq('id', params.id).maybeSingle();
    const config = await getConfig(leadRow?.scorecard_id ?? undefined);
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
    // The readable answers (option labels / typed text), sanitised to known
    // question ids and bounded sizes. Untrusted input — never rendered unescaped.
    const rawDetails = body.answer_details;
    const answerDetails: Record<string, AnswerDetail> = {};
    if (rawDetails && typeof rawDetails === 'object') {
      for (const q of config.questions) {
        const d = (rawDetails as Record<string, unknown>)[q.id];
        if (!d || typeof d !== 'object') continue;
        const { value, selected, text } = d as AnswerDetail;
        const clean: AnswerDetail = {};
        if (typeof value === 'number' && Number.isFinite(value)) clean.value = value;
        if (Array.isArray(selected)) {
          clean.selected = selected.slice(0, 50).map((s) => String(s).slice(0, 300));
        }
        if (typeof text === 'string' && text.trim()) clean.text = text.slice(0, 4000);
        if (Object.keys(clean).length) answerDetails[q.id] = clean;
      }
    }

    const { categoryScores, score_total, score_max, overall_percent } = computeScores(config, answers);
    const duration = Number(body.duration_seconds);
    const update = {
      answers,
      score_total,
      score_max,
      overall_percent,
      category_scores: categoryScores,
      status: 'completed',
      duration_seconds: Number.isFinite(duration) ? Math.max(0, Math.round(duration)) : null,
      completed_at: new Date().toISOString(),
    };
    let { data: lead, error } = await sb
      .from('leads')
      .update({ ...update, answer_details: answerDetails })
      .eq('id', params.id)
      .select('id, first_name, last_name, email, status')
      .maybeSingle();
    // Databases that haven't run the answer_details migration yet: store
    // everything else rather than failing the whole completion. ONLY for the
    // missing-column error — any other failure must surface, not silently
    // drop the respondent's written answers.
    const missingColumn =
      error && (error.code === 'PGRST204' || error.code === '42703' || /answer_details/i.test(error.message ?? ''));
    if (missingColumn) {
      console.error('[leads] answer_details column missing (run the 20260719 migration); storing without it');
      ({ data: lead, error } = await sb
        .from('leads')
        .update(update)
        .eq('id', params.id)
        .select('id, first_name, last_name, email, status')
        .maybeSingle());
    }
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (lead) {
      const summary = answersSummaryHtml(config.questions, answers, answerDetails);
      await sendCompletionEmails(config, lead, overall_percent, req.nextUrl.origin, summary).catch((e) =>
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
