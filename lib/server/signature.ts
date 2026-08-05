// Account-wide email signature: stored once on the accounts table and
// appended to invite + result emails for every scorecard in the account.
// Rendered with tables and inline styles only, so it survives email clients.
import { EmailSignature } from '../types';
import { supabaseAdmin } from './supabase';

export const BLANK_SIGNATURE: EmailSignature = {
  enabled: false,
  imageUrl: '',
  name: '',
  role: '',
  company: '',
  phone: '',
  website: '',
  accentColor: '#1c78fe',
};

function esc(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Accepts only sane values from the editor; everything is length-capped so a
// bad save can never bloat every future email.
export function cleanSignature(raw: unknown): EmailSignature {
  const r = (raw ?? {}) as Record<string, unknown>;
  const str = (v: unknown, max: number) => String(v ?? '').slice(0, max);
  const color = /^#[0-9a-fA-F]{3,8}$/.test(String(r.accentColor ?? '')) ? String(r.accentColor) : '#1c78fe';
  const url = (v: unknown, max: number) => {
    const s = str(v, max).trim();
    return !s || /^https?:\/\//i.test(s) || s.startsWith('/') ? s : `https://${s}`;
  };
  return {
    enabled: Boolean(r.enabled),
    imageUrl: url(r.imageUrl, 500),
    name: str(r.name, 120),
    role: str(r.role, 160),
    company: str(r.company, 160),
    phone: str(r.phone, 60),
    website: url(r.website, 300),
    accentColor: color,
  };
}

/** The signature block as email-safe HTML, or '' when disabled/empty. */
export function renderSignature(sig: EmailSignature | null | undefined): string {
  if (!sig?.enabled) return '';
  const hasText = [sig.name, sig.role, sig.company, sig.phone, sig.website].some((s) => s && s.trim());
  if (!hasText && !sig.imageUrl) return '';
  const accent = esc(sig.accentColor || '#1c78fe');
  const font = 'font-family:Inter,Arial,sans-serif;';

  const roleLine = [sig.role, sig.company].filter((s) => s.trim()).map(esc).join(' · ');
  const site = sig.website.trim();
  const siteLabel = site.replace(/^https?:\/\//i, '').replace(/\/$/, '');
  const contactBits = [
    sig.phone.trim() ? `<span style="color:#6b7280;">${esc(sig.phone)}</span>` : '',
    site ? `<a href="${esc(site)}" target="_blank" rel="noopener" style="color:${accent};text-decoration:none;">${esc(siteLabel)}</a>` : '',
  ].filter(Boolean);

  const image = sig.imageUrl
    ? `<td style="vertical-align:top;padding-right:14px;">` +
      `<img src="${esc(sig.imageUrl)}" alt="" width="56" height="56" ` +
      `style="display:block;width:56px;height:56px;border-radius:50%;object-fit:cover;" /></td>`
    : '';

  return (
    `<table cellpadding="0" cellspacing="0" role="presentation" ` +
    `style="margin-top:28px;border-top:2px solid ${accent};padding-top:14px;width:auto;"><tr>` +
    image +
    `<td style="vertical-align:top;">` +
    (sig.name.trim() ? `<p style="margin:0;${font}font-size:15px;font-weight:700;color:#111827;">${esc(sig.name)}</p>` : '') +
    (roleLine ? `<p style="margin:2px 0 0;${font}font-size:13px;color:#6b7280;">${roleLine}</p>` : '') +
    (contactBits.length
      ? `<p style="margin:6px 0 0;${font}font-size:13px;">${contactBits.join('<span style="color:#d1d5db;"> &nbsp;·&nbsp; </span>')}</p>`
      : '') +
    `</td></tr></table>`
  );
}

export async function getAccountSignature(accountId: number): Promise<EmailSignature> {
  const sb = supabaseAdmin();
  const { data } = await sb.from('accounts').select('email_signature').eq('id', accountId).maybeSingle();
  return data?.email_signature ? cleanSignature(data.email_signature) : BLANK_SIGNATURE;
}

export async function saveAccountSignature(accountId: number, sig: EmailSignature): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb
    .from('accounts')
    .update({ email_signature: sig, updated_at: new Date().toISOString() })
    .eq('id', accountId);
  if (error) throw error;
}

/** Signature HTML for the account that owns a scorecard ('' when none/disabled). */
export async function signatureHtmlForScorecard(scorecardId: number): Promise<string> {
  try {
    const sb = supabaseAdmin();
    const { data } = await sb.from('scorecard_config').select('account_id').eq('id', scorecardId).maybeSingle();
    if (data?.account_id == null) return '';
    return renderSignature(await getAccountSignature(data.account_id));
  } catch (e) {
    console.error('[signature] load failed:', e);
    return ''; // never block an email over a signature
  }
}
