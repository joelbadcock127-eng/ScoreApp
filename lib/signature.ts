// Account-wide email signature: validation and rendering. Pure module (no
// server imports) so the admin editor renders the SAME preview the emails
// get, live in the browser; DB load/save lives in lib/server/signature.ts.
// Layout follows the classic signature-builder pattern: photo | accent
// divider | details (name, job title | company, P/M/E lines, address,
// social badges), with an optional clickable banner underneath.
import { EmailSignature } from './types';

export const BLANK_SIGNATURE: EmailSignature = {
  enabled: false,
  firstName: '',
  lastName: '',
  jobTitle: '',
  email: '',
  phone: '',
  mobile: '',
  company: '',
  website: '',
  address: '',
  photoUrl: '',
  logoUrl: '',
  bannerUrl: '',
  bannerLink: '',
  accentColor: '#1c78fe',
  textColor: '#111827',
  font: 'arial',
  fontSize: 'medium',
  photoShape: 'circle',
  facebook: '',
  twitter: '',
  youtube: '',
  linkedin: '',
  instagram: '',
};

// Email-safe font stacks (web fonts don't survive email clients).
export const SIGNATURE_FONTS: Record<string, { label: string; stack: string }> = {
  arial: { label: 'Arial', stack: 'Arial,Helvetica,sans-serif' },
  georgia: { label: 'Georgia', stack: 'Georgia,Times,serif' },
  verdana: { label: 'Verdana', stack: 'Verdana,Geneva,sans-serif' },
  tahoma: { label: 'Tahoma', stack: 'Tahoma,Geneva,sans-serif' },
  trebuchet: { label: 'Trebuchet MS', stack: "'Trebuchet MS',Helvetica,sans-serif" },
};

const FONT_SIZES = { small: 12, medium: 13, large: 15 } as const;
const PHOTO_RADIUS = { circle: '50%', rounded: '12px', square: '0' } as const;

function esc(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Accepts only sane values from the editor; everything is length-capped so a
// bad save can never bloat every future email. Also migrates the earlier
// one-line schema (name/role/imageUrl) transparently.
export function cleanSignature(raw: unknown): EmailSignature {
  const r = (raw ?? {}) as Record<string, unknown>;
  const str = (v: unknown, max: number) => String(v ?? '').slice(0, max);
  const color = (v: unknown, fallback: string) => (/^#[0-9a-fA-F]{3,8}$/.test(String(v ?? '')) ? String(v) : fallback);
  const url = (v: unknown, max: number) => {
    const s = str(v, max).trim();
    return !s || /^https?:\/\//i.test(s) || s.startsWith('/') ? s : `https://${s}`;
  };
  const oneOf = <T extends string>(v: unknown, options: readonly T[], fallback: T): T =>
    options.includes(v as T) ? (v as T) : fallback;

  // Legacy fields from the first version of this feature.
  const legacyName = str(r.name, 120).trim();
  const [legacyFirst, ...legacyRest] = legacyName.split(/\s+/);

  return {
    enabled: Boolean(r.enabled),
    firstName: str(r.firstName ?? legacyFirst, 80),
    lastName: str(r.lastName ?? legacyRest.join(' '), 80),
    jobTitle: str(r.jobTitle ?? r.role, 160),
    email: str(r.email, 320),
    phone: str(r.phone, 60),
    mobile: str(r.mobile, 60),
    company: str(r.company, 160),
    website: url(r.website, 300),
    address: str(r.address, 300),
    photoUrl: url(r.photoUrl ?? r.imageUrl, 500),
    logoUrl: url(r.logoUrl, 500),
    bannerUrl: url(r.bannerUrl, 500),
    bannerLink: url(r.bannerLink, 500),
    accentColor: color(r.accentColor, '#1c78fe'),
    textColor: color(r.textColor, '#111827'),
    font: oneOf(String(r.font ?? 'arial'), Object.keys(SIGNATURE_FONTS), 'arial'),
    fontSize: oneOf(r.fontSize as string, ['small', 'medium', 'large'] as const, 'medium'),
    photoShape: oneOf(r.photoShape as string, ['circle', 'rounded', 'square'] as const, 'circle'),
    facebook: url(r.facebook, 300),
    twitter: url(r.twitter, 300),
    youtube: url(r.youtube, 300),
    linkedin: url(r.linkedin, 300),
    instagram: url(r.instagram, 300),
  };
}

// Social links render as small lettered badges — text survives every email
// client, no icon hosting required.
const SOCIALS: { key: keyof EmailSignature; label: string; title: string }[] = [
  { key: 'facebook', label: 'f', title: 'Facebook' },
  { key: 'twitter', label: 'X', title: 'X' },
  { key: 'youtube', label: '▶', title: 'YouTube' },
  { key: 'linkedin', label: 'in', title: 'LinkedIn' },
  { key: 'instagram', label: 'ig', title: 'Instagram' },
];

/** The signature block as email-safe HTML, or '' when disabled/empty. */
export function renderSignature(sig: EmailSignature | null | undefined): string {
  if (!sig?.enabled) return '';
  const s = sig;
  const hasContent =
    [s.firstName, s.lastName, s.jobTitle, s.email, s.phone, s.mobile, s.company, s.website, s.address]
      .some((v) => v && v.trim()) || Boolean(s.photoUrl || s.bannerUrl);
  if (!hasContent) return '';

  const accent = esc(s.accentColor);
  const text = esc(s.textColor);
  const muted = '#6b7280';
  const px = FONT_SIZES[s.fontSize] ?? 13;
  const font = `font-family:${SIGNATURE_FONTS[s.font]?.stack ?? SIGNATURE_FONTS.arial.stack};`;
  const line = (extra = '') => `margin:0;${font}font-size:${px}px;line-height:1.55;color:${text};${extra}`;
  const label = (t: string) => `<b style="color:${text};">${t}:</b>`;
  const alink = (href: string, txt: string) =>
    `<a href="${esc(href)}" target="_blank" rel="noopener" style="color:${accent};text-decoration:none;">${esc(txt)}</a>`;
  const sep = `<span style="color:${muted};"> | </span>`;

  const name = [s.firstName, s.lastName].filter((v) => v.trim()).join(' ');
  const roleLine = [s.jobTitle, s.company].filter((v) => v.trim()).map(esc).join(' | ');
  const phones = [
    s.phone.trim() ? `${label('P')} <span style="color:${muted};">${esc(s.phone)}</span>` : '',
    s.mobile.trim() ? `${label('M')} <span style="color:${muted};">${esc(s.mobile)}</span>` : '',
  ].filter(Boolean);
  const siteLabel = s.website.replace(/^https?:\/\//i, '').replace(/\/$/, '');
  const online = [
    s.email.trim()
      ? `${label('E')} <a href="mailto:${esc(s.email)}" style="color:${muted};text-decoration:none;">${esc(s.email)}</a>`
      : '',
    s.website.trim() ? alink(s.website, siteLabel) : '',
  ].filter(Boolean);

  const badges = SOCIALS.filter((so) => String(s[so.key]).trim())
    .map(
      (so) =>
        `<td style="padding:0 6px 0 0;"><a href="${esc(String(s[so.key]))}" target="_blank" rel="noopener" title="${so.title}" ` +
        `style="display:inline-block;width:22px;height:22px;background:${text};border-radius:4px;text-align:center;` +
        `${font}font-size:11px;font-weight:700;line-height:22px;color:#ffffff;text-decoration:none;">${so.label}</a></td>`
    )
    .join('');

  const photo = s.photoUrl
    ? `<td style="vertical-align:top;padding-right:14px;">` +
      `<img src="${esc(s.photoUrl)}" alt="" width="84" height="84" ` +
      `style="display:block;width:84px;height:84px;border-radius:${PHOTO_RADIUS[s.photoShape]};object-fit:cover;" /></td>`
    : '';
  const divider = `<td style="width:3px;background:${accent};font-size:0;line-height:0;">&nbsp;</td>`;

  const details =
    `<td style="vertical-align:top;padding-left:14px;">` +
    (s.logoUrl ? `<img src="${esc(s.logoUrl)}" alt="" height="24" style="display:block;height:24px;margin:0 0 6px;" />` : '') +
    (name ? `<p style="${line(`font-size:${px + 3}px;font-weight:700;`)}">${esc(name)}</p>` : '') +
    (roleLine ? `<p style="${line(`color:${muted};`)}">${roleLine}</p>` : '') +
    (phones.length ? `<p style="${line('margin-top:6px;')}">${phones.join(sep)}</p>` : '') +
    (online.length ? `<p style="${line()}">${online.join(sep)}</p>` : '') +
    (s.address.trim() ? `<p style="${line(`color:${muted};`)}">${esc(s.address)}</p>` : '') +
    (badges
      ? `<table cellpadding="0" cellspacing="0" role="presentation" style="margin-top:8px;"><tr>${badges}</tr></table>`
      : '') +
    `</td>`;

  const banner = s.bannerUrl
    ? `<p style="margin:12px 0 0;">` +
      (s.bannerLink ? `<a href="${esc(s.bannerLink)}" target="_blank" rel="noopener">` : '') +
      `<img src="${esc(s.bannerUrl)}" alt="" width="420" style="display:block;width:100%;max-width:420px;border-radius:6px;" />` +
      (s.bannerLink ? `</a>` : '') +
      `</p>`
    : '';

  return (
    `<table cellpadding="0" cellspacing="0" role="presentation" style="margin-top:28px;"><tr>` +
    photo +
    divider +
    details +
    `</tr></table>` +
    banner
  );
}
