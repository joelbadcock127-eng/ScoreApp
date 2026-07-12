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
