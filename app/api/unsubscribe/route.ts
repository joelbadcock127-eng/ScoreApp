import { NextRequest, NextResponse } from 'next/server';
import { parseUnsubscribeToken } from '@/lib/server/invites';
import { supabaseAdmin } from '@/lib/server/supabase';

export const dynamic = 'force-dynamic';

// Public unsubscribe endpoint, linked from every invite footer and the
// List-Unsubscribe header. GET renders a tiny confirmation page; POST is the
// mailbox providers' one-click flow. Both are idempotent.

async function unsubscribe(token: string | null): Promise<boolean> {
  const leadId = parseUnsubscribeToken(token);
  if (!leadId) return false;
  const sb = supabaseAdmin();
  const { data: lead } = await sb
    .from('leads')
    .select('id, email, scorecard_id')
    .eq('id', leadId)
    .maybeSingle<{ id: string; email: string; scorecard_id: number }>();
  if (!lead?.email) return false;
  const { data: sc } = await sb
    .from('scorecard_config')
    .select('account_id')
    .eq('id', lead.scorecard_id)
    .maybeSingle<{ account_id: number | null }>();
  if (sc?.account_id != null) {
    await sb
      .from('suppressions')
      .upsert(
        { account_id: sc.account_id, email: lead.email.toLowerCase(), reason: 'unsubscribe' },
        { onConflict: 'account_id,email', ignoreDuplicates: true }
      );
  }
  await sb.from('leads').update({ contact_opt_in: false }).eq('id', lead.id);
  return true;
}

function page(title: string, body: string, status = 200) {
  return new NextResponse(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"/>` +
      `<meta name="viewport" content="width=device-width, initial-scale=1"/>` +
      `<meta name="robots" content="noindex"/><title>${title}</title></head>` +
      `<body style="margin:0;display:grid;place-items:center;min-height:100vh;background:#f9fafb;` +
      `font-family:Inter,Arial,sans-serif;color:#152042;">` +
      `<div style="max-width:420px;padding:40px;text-align:center;">` +
      `<h1 style="font-size:22px;margin:0 0 12px;">${title}</h1>` +
      `<p style="font-size:15px;line-height:1.6;color:#616366;margin:0;">${body}</p>` +
      `</div></body></html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

export async function GET(req: NextRequest) {
  const ok = await unsubscribe(req.nextUrl.searchParams.get('t'));
  if (!ok) return page('Link not recognised', 'This unsubscribe link is invalid or has expired.', 400);
  return page('You’re unsubscribed', 'You won’t receive any more emails from this sender.');
}

// RFC 8058 one-click unsubscribe (mailbox providers POST with no body needed).
export async function POST(req: NextRequest) {
  const ok = await unsubscribe(req.nextUrl.searchParams.get('t'));
  return NextResponse.json({ ok }, { status: ok ? 200 : 400 });
}
