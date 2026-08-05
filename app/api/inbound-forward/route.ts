import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getConfig } from '@/lib/server/config';
import { sendEmail } from '@/lib/server/email';
import { supabaseAdmin } from '@/lib/server/supabase';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// Resend "email.received" webhook → forward the reply to a real inbox.
//
// Replies to joel@accesoai.com.au land in Resend (inbound receiving), Resend
// calls this endpoint, and we send a copy on to INBOUND_FORWARD_TO (or the
// owner account's email). The forward's reply-to is the original sender, so
// replying from Gmail goes straight back to them.
//
// Set RESEND_WEBHOOK_SECRET (whsec_…, shown when the webhook is created) to
// verify calls are really from Resend; without it we still forward but log a
// warning. Verification is the standard svix scheme.

function verifySvix(body: string, headers: Headers, secret: string): boolean {
  const id = headers.get('svix-id');
  const timestamp = headers.get('svix-timestamp');
  const signatures = headers.get('svix-signature');
  if (!id || !timestamp || !signatures) return false;
  // Reject stale timestamps (5 min) to block replays.
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const expected = createHmac('sha256', key).update(`${id}.${timestamp}.${body}`).digest('base64');
  return signatures.split(' ').some((part) => {
    const sig = part.split(',')[1] ?? '';
    try {
      return sig.length > 0 && timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    } catch {
      return false;
    }
  });
}

async function forwardTarget(): Promise<string> {
  if (process.env.INBOUND_FORWARD_TO) return process.env.INBOUND_FORWARD_TO;
  const sb = supabaseAdmin();
  const { data } = await sb.from('accounts').select('email').order('id', { ascending: true }).limit(1).maybeSingle();
  return data?.email ?? '';
}

// Full message content: the webhook payload sometimes carries text/html; if
// not, try Resend's received-email endpoints (path differs across API
// versions, so try both).
async function fetchReceivedBody(emailId: string, apiKey: string): Promise<{ html?: string; text?: string }> {
  for (const path of [`/emails/received/${emailId}`, `/emails/receiving/${emailId}`]) {
    try {
      const res = await fetch(`https://api.resend.com${path}`, { headers: { Authorization: `Bearer ${apiKey}` } });
      if (!res.ok) continue;
      const json = (await res.json()) as { html?: string; text?: string };
      if (json.html || json.text) return { html: json.html, text: json.text };
    } catch {
      /* try next */
    }
  }
  return {};
}

const esc = (s: string) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function POST(req: NextRequest) {
  const raw = await req.text();

  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (secret) {
    if (!verifySvix(raw, req.headers, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  } else {
    console.warn('[inbound] RESEND_WEBHOOK_SECRET not set — forwarding without signature verification');
  }

  let payload: { type?: string; data?: Record<string, unknown> };
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  // Only inbound mail is forwarded; other events are acknowledged and dropped.
  if (payload.type !== 'email.received') return NextResponse.json({ ok: true, ignored: payload.type });

  const d = payload.data ?? {};
  const from = String(d.from ?? '');
  const to = Array.isArray(d.to) ? d.to.map(String).join(', ') : String(d.to ?? '');
  const subject = String(d.subject ?? '(no subject)');
  const emailId = String(d.email_id ?? d.id ?? '');

  const target = await forwardTarget();
  if (!target) {
    console.error('[inbound] no forward target (set INBOUND_FORWARD_TO)');
    return NextResponse.json({ ok: false, error: 'No forward target' }, { status: 200 });
  }

  const config = await getConfig().catch(() => null);
  const apiKey = process.env.RESEND_API_KEY || config?.email?.apiKey || '';

  let html = typeof d.html === 'string' ? d.html : '';
  let text = typeof d.text === 'string' ? d.text : '';
  if (!html && !text && emailId && apiKey) {
    const body = await fetchReceivedBody(emailId, apiKey);
    html = body.html ?? '';
    text = body.text ?? '';
  }

  const banner =
    `<div style="font-family:Inter,Arial,sans-serif;font-size:13px;color:#6b7280;` +
    `border-bottom:1px solid #e5e7eb;padding-bottom:10px;margin-bottom:16px;">` +
    `Reply received by <b>${esc(to || 'your Resend inbox')}</b> from <b>${esc(from)}</b>. ` +
    `Hit reply and your answer goes straight back to them.` +
    `</div>`;
  const content = html || (text ? `<pre style="white-space:pre-wrap;font-family:inherit;">${esc(text)}</pre>` : '') ||
    `<p style="font-family:Inter,Arial,sans-serif;">The message body couldn't be fetched — view it in the Resend dashboard (Emails → Received).</p>`;

  // Extract a bare address for reply-to ("Name <a@b.c>" → a@b.c).
  const replyTo = /<([^>]+)>/.exec(from)?.[1] ?? from;

  const result = await sendEmail({
    to: [target],
    subject: `Re: ${subject}`.replace(/^Re: Re:/i, 'Re:'),
    html: banner + content,
    fromAddress: config?.resultEmail?.fromAddress || undefined,
    fromName: 'Reply forwarder',
    replyTo: replyTo || undefined,
    apiKey: apiKey || undefined,
  });
  if (!result.sent) console.error('[inbound] forward failed:', result.error);
  return NextResponse.json({ ok: result.sent });
}
