// Email sending, provider-agnostic and ready to switch on with a single env
// var. Without credentials it logs and no-ops so the app keeps working.
//
// Supported (checked in order):
//   RESEND_API_KEY   → https://resend.com  (recommended: free 3k emails/mo,
//                      one API call, verified domain in minutes)
//   BREVO_API_KEY    → https://brevo.com   (free 300 emails/day)
//
// Other cheap options if these don't suit: Amazon SES (~$0.10 per 1,000, more
// setup) or Postmark (transactional-focused, $15/mo).

export interface EmailMessage {
  to: string[];
  subject: string;
  html: string;
  fromAddress?: string;
  fromName?: string;
  replyTo?: string;
  /** Provider API key from the scorecard config (falls back to env vars). */
  apiKey?: string;
}

// Free-mail domains can't be verified as senders, so mail from them would be
// rejected. Send from the provider's shared address and keep the owner's
// address as the reply-to instead.
const FREE_MAIL = /@(gmail|googlemail|outlook|hotmail|live|yahoo|icloud|me|aol)\./i;

export function mergeFields(template: string, fields: Record<string, string | number>): string {
  return template.replace(/\{([a-z_]+)\}/g, (m, key) => {
    const v = fields[key];
    return v === undefined ? m : String(v);
  });
}

// A styled call-to-action button for emails (inline styles — email clients
// ignore <style> blocks). Used for {report_download} and {results_button}.
export function emailButton(url: string, label: string, color = '#1c78fe'): string {
  return (
    `<a href="${url}" target="_blank" rel="noopener" style="display:inline-block;` +
    `background:${color};color:#ffffff;text-decoration:none;font-weight:600;` +
    `font-family:Inter,Arial,sans-serif;font-size:15px;padding:12px 24px;border-radius:8px;margin:6px 0;">` +
    `${label}</a>`
  );
}

export interface ResultEmailContext {
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  score: number;
  scorecard_name: string;
  results_link: string;
  report_link: string;
  /** Optional {answers_summary} block: the respondent's actual answers as HTML. */
  answers_summary?: string;
}

// Renders every question with the respondent's readable answer (option labels
// and typed text from answer_details, numeric fallback otherwise) for the
// {answers_summary} merge field. Question text and answers are user/lead
// content, so both are escaped.
export function answersSummaryHtml(
  questions: { id: string; text: string; type?: string; min: number; max: number }[],
  answers: Record<string, number>,
  details?: Record<string, { value?: number; selected?: string[]; text?: string }> | null
): string {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const rows = questions.map((q) => {
    const d = details?.[q.id];
    let answer = '';
    if (d?.selected?.length) answer = d.selected.join(', ');
    else if (d?.text) answer = d.text;
    else if ((q.type ?? 'scale') === 'scale') answer = `${answers[q.id] ?? d?.value ?? '—'} / ${q.max}`;
    else if ((q.type ?? 'scale') === 'text') answer = '(no answer)';
    else answer = String(answers[q.id] ?? d?.value ?? '—');
    const question = q.text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return (
      `<tr><td style="padding:8px 0 2px;font-family:Inter,Arial,sans-serif;font-size:14px;color:#152042;"><b>${esc(question)}</b></td></tr>` +
      `<tr><td style="padding:0 0 8px;font-family:Inter,Arial,sans-serif;font-size:14px;color:#4a5578;border-bottom:1px solid #e8ebf2;">${esc(answer)}</td></tr>`
    );
  });
  return `<table cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;">${rows.join('')}</table>`;
}

// Merge fields available in result / notification emails, including the
// ready-made button snippets that expand to HTML.
export function resultEmailFields(ctx: ResultEmailContext, color = '#1c78fe'): Record<string, string | number> {
  return {
    ...ctx,
    answers_summary: ctx.answers_summary ?? '',
    report_download: emailButton(ctx.report_link, 'Download my report (PDF)', color),
    results_button: emailButton(ctx.results_link, 'View my results', color),
  };
}

// Prepend the scorecard's email logo (if set) to the email body.
export function withEmailHeader(html: string, headerImage?: string): string {
  if (!headerImage) return html;
  return (
    `<div style="text-align:center;margin:0 0 20px;">` +
    `<img src="${headerImage}" alt="" style="max-height:64px;max-width:240px;height:auto;" /></div>` +
    html
  );
}

export async function sendEmail(msg: EmailMessage): Promise<{ sent: boolean; provider: string; error?: string }> {
  let fromAddress = msg.fromAddress || 'onboarding@resend.dev';
  let replyTo = msg.replyTo;
  if (FREE_MAIL.test(fromAddress)) {
    replyTo = replyTo || fromAddress;
    fromAddress = 'onboarding@resend.dev';
  }
  const from = msg.fromName ? `${msg.fromName} <${fromAddress}>` : fromAddress;
  const resendKey = msg.apiKey || process.env.RESEND_API_KEY;

  if (resendKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: msg.to,
          subject: msg.subject,
          html: msg.html,
          ...(replyTo ? { reply_to: replyTo } : {}),
        }),
      });
      if (!res.ok) return { sent: false, provider: 'resend', error: await res.text() };
      return { sent: true, provider: 'resend' };
    } catch (err) {
      return { sent: false, provider: 'resend', error: String(err) };
    }
  }

  if (process.env.BREVO_API_KEY) {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: { email: fromAddress, name: msg.fromName || undefined },
          to: msg.to.map((email) => ({ email })),
          subject: msg.subject,
          htmlContent: msg.html,
          ...(replyTo ? { replyTo: { email: replyTo } } : {}),
        }),
      });
      if (!res.ok) return { sent: false, provider: 'brevo', error: await res.text() };
      return { sent: true, provider: 'brevo' };
    } catch (err) {
      return { sent: false, provider: 'brevo', error: String(err) };
    }
  }

  console.log(
    `[email] no provider configured (set RESEND_API_KEY or BREVO_API_KEY) — would send "${msg.subject}" to ${msg.to.join(', ')}`
  );
  return { sent: false, provider: 'none' };
}
