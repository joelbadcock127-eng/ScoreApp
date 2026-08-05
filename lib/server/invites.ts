import { createHmac, timingSafeEqual } from 'crypto';
import { ScorecardConfig } from '../types';
import { applyEmailSpacing, emailButton, mergeFields, withEmailHeader } from './email';

// ——— Unsubscribe tokens: <leadId>.<hmac> ————————————————————————————————
// Signed with the same secret chain as sessions so no new env var is needed.

function secret(): string {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dev';
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(`unsub.${payload}`).digest('hex');
}

export function unsubscribeToken(leadId: string): string {
  return `${leadId}.${sign(leadId)}`;
}

/** Returns the lead id if the token is valid, else null. */
export function parseUnsubscribeToken(token: string | undefined | null): string | null {
  if (!token) return null;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;
  const leadId = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  const expected = sign(leadId);
  try {
    if (!timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  return /^[0-9a-f-]{36}$/i.test(leadId) ? leadId : null;
}

// ——— Invite email rendering ————————————————————————————————————————————

export interface InviteRecipient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  business: string;
}

export function inviteFields(
  lead: InviteRecipient,
  config: ScorecardConfig,
  inviteLink: string,
  primaryColor: string
): Record<string, string> {
  return {
    first_name: lead.first_name || 'there',
    last_name: lead.last_name,
    email: lead.email,
    business: lead.business,
    scorecard_name: config.title,
    invite_link: inviteLink,
    invite_button: emailButton(inviteLink, `Get your score`, primaryColor),
  };
}

// The compliance footer appended to EVERY invite: who is sending (anti-spam
// laws require sender identification) and a working one-click unsubscribe.
// Deliberately not a merge field — it can't be forgotten or removed.
export function inviteFooter(senderName: string, senderAddress: string, unsubscribeUrl: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const identity = [senderName, senderAddress].filter(Boolean).map(esc).join(' · ');
  return (
    `<div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;` +
    `font-family:Inter,Arial,sans-serif;font-size:12px;line-height:1.6;color:#9ca3af;">` +
    (identity ? `<p style="margin:0 0 4px;">You received this email from ${identity}.</p>` : '') +
    `<p style="margin:0;">Don&rsquo;t want these emails? ` +
    `<a href="${unsubscribeUrl}" style="color:#6b7280;">Unsubscribe</a>.</p>` +
    `</div>`
  );
}

/** Full invite HTML for one recipient: header image + merged body + account
 *  signature + compliance footer. */
export function renderInvite(
  config: ScorecardConfig,
  lead: InviteRecipient,
  origin: string,
  signatureHtml = ''
): { subject: string; html: string; unsubscribeUrl: string } {
  const ie = config.inviteEmail;
  if (!ie) throw new Error('No invite email configured');
  const inviteLink = `${origin}/quiz?lead=${lead.id}`;
  const unsubscribeUrl = `${origin}/api/unsubscribe?t=${encodeURIComponent(unsubscribeToken(lead.id))}`;
  const fields = inviteFields(lead, config, inviteLink, config.branding.primaryColor);
  const body = applyEmailSpacing(mergeFields(ie.content, fields), ie.lineSpacing);
  const html =
    withEmailHeader(body, ie.headerImage) +
    signatureHtml +
    inviteFooter(ie.senderName, ie.senderAddress, unsubscribeUrl);
  return { subject: mergeFields(ie.subject, fields), html, unsubscribeUrl };
}
