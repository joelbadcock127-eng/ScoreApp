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
}

export function mergeFields(template: string, fields: Record<string, string | number>): string {
  return template.replace(/\{([a-z_]+)\}/g, (m, key) => {
    const v = fields[key];
    return v === undefined ? m : String(v);
  });
}

export async function sendEmail(msg: EmailMessage): Promise<{ sent: boolean; provider: string; error?: string }> {
  const from = msg.fromName
    ? `${msg.fromName} <${msg.fromAddress || 'onboarding@resend.dev'}>`
    : msg.fromAddress || 'onboarding@resend.dev';

  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: msg.to,
          subject: msg.subject,
          html: msg.html,
          ...(msg.replyTo ? { reply_to: msg.replyTo } : {}),
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
          sender: { email: msg.fromAddress || 'no-reply@example.com', name: msg.fromName || undefined },
          to: msg.to.map((email) => ({ email })),
          subject: msg.subject,
          htmlContent: msg.html,
          ...(msg.replyTo ? { replyTo: { email: msg.replyTo } } : {}),
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
