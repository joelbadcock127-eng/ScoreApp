import { cookies, headers } from 'next/headers';
import { defaultConfig } from '../defaultConfig';
import { blankConfig } from '../blankConfig';
import { ScorecardConfig } from '../types';
import { supabaseAdmin } from './supabase';

export const SCORECARD_COOKIE = 'sc_scorecard';

export interface ScorecardSummary {
  id: number;
  name: string;
  is_default: boolean;
  domain?: string | null;
  custom_domain?: string | null;
  updated_at: string;
  created_at: string;
}

export const BASE_DOMAIN = process.env.PUBLIC_BASE_DOMAIN || 'accesoai.com.au';

function requestHost(): string {
  try {
    return (headers().get('x-forwarded-host') ?? headers().get('host') ?? '').split(':')[0].toLowerCase();
  } catch {
    return ''; // outside a request context
  }
}

// Managed-subdomain resolution: www.<sub>.<base> or <sub>.<base> → the
// scorecard whose `domain` column matches <sub>. Returns null when the host is
// the bare base domain, localhost, or an unrecognised host.
export function getHostSubdomain(): string | null {
  const host = requestHost();
  if (!host || !host.endsWith(`.${BASE_DOMAIN}`)) return null;
  const sub = host.slice(0, -(BASE_DOMAIN.length + 1)).replace(/^www\./, '');
  return /^[a-z0-9-]{1,63}$/.test(sub) && sub !== 'www' ? sub : null;
}

// Fully custom domains the customer owns (e.g. scorecard.mybusiness.com):
// the request host, with any leading www. stripped, matched against the
// `custom_domain` column.
export function getHostCustomDomain(): string | null {
  const host = requestHost();
  if (!host || host === 'localhost' || host.endsWith(`.${BASE_DOMAIN}`) || host === BASE_DOMAIN) return null;
  return host.replace(/^www\./, '') || null;
}

// The scorecard the current request is working with: admins carry a cookie
// set by the scorecard switcher; public visitors fall back to the default.
export function getActiveScorecardId(): number | null {
  try {
    const v = cookies().get(SCORECARD_COOKIE)?.value;
    const id = Number(v);
    return Number.isInteger(id) && id > 0 ? id : null;
  } catch {
    return null; // outside a request context
  }
}

export async function listScorecards(): Promise<ScorecardSummary[]> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from('scorecard_config')
    .select('id, name, is_default, domain, custom_domain, updated_at, created_at')
    .order('created_at', { ascending: true })
    .returns<ScorecardSummary[]>();
  if (error) throw error;
  return data ?? [];
}

export async function createScorecard(name: string): Promise<number> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from('scorecard_config')
    .insert({ name: name.slice(0, 120), config: blankConfig(name) })
    .select('id')
    .single();
  if (error) throw error;
  return data.id as number;
}

export async function getConfig(id?: number): Promise<ScorecardConfig> {
  const sb = supabaseAdmin();
  const wanted = id ?? getActiveScorecardId();

  if (wanted != null) {
    const { data, error } = await sb
      .from('scorecard_config')
      .select('config')
      .eq('id', wanted)
      .maybeSingle();
    if (error) throw error;
    if (data) return { ...defaultConfig, ...(data.config as ScorecardConfig) };
    // Stale cookie / deleted scorecard: fall through to the default.
  }

  const sub = getHostSubdomain();
  if (sub) {
    const { data: byDomain } = await sb
      .from('scorecard_config')
      .select('config')
      .eq('domain', sub)
      .maybeSingle();
    if (byDomain) return { ...defaultConfig, ...(byDomain.config as ScorecardConfig) };
  }

  const custom = getHostCustomDomain();
  if (custom) {
    const { data: byCustom } = await sb
      .from('scorecard_config')
      .select('config')
      .eq('custom_domain', custom)
      .maybeSingle();
    if (byCustom) return { ...defaultConfig, ...(byCustom.config as ScorecardConfig) };
  }

  const { data: def, error: defErr } = await sb
    .from('scorecard_config')
    .select('config')
    .eq('is_default', true)
    .limit(1)
    .maybeSingle();
  if (defErr) throw defErr;
  if (def) return { ...defaultConfig, ...(def.config as ScorecardConfig) };

  // First run: seed the database with the default scorecard content.
  await sb
    .from('scorecard_config')
    .upsert({ id: 1, config: defaultConfig, name: defaultConfig.title, is_default: true });
  return defaultConfig;
}

// Resolved id for queries that filter by scorecard (cookie if valid, else default row).
export async function getActiveOrDefaultId(): Promise<number> {
  const all = await listScorecards();
  const wanted = getActiveScorecardId();
  if (wanted != null && all.some((s) => s.id === wanted)) return wanted;
  const sub = getHostSubdomain();
  if (sub) {
    const byDomain = all.find((s) => s.domain === sub);
    if (byDomain) return byDomain.id;
  }
  const custom = getHostCustomDomain();
  if (custom) {
    const byCustom = all.find((s) => s.custom_domain === custom);
    if (byCustom) return byCustom.id;
  }
  return all.find((s) => s.is_default)?.id ?? all[0]?.id ?? 1;
}

export async function setDefaultScorecard(id: number) {
  const sb = supabaseAdmin();
  const { error: clearErr } = await sb.from('scorecard_config').update({ is_default: false }).eq('is_default', true);
  if (clearErr) throw clearErr;
  const { error } = await sb.from('scorecard_config').update({ is_default: true }).eq('id', id);
  if (error) throw error;
}

export async function deleteScorecard(id: number) {
  const sb = supabaseAdmin();
  const { error } = await sb.from('scorecard_config').delete().eq('id', id);
  if (error) throw error;
}

export async function setScorecardDomain(id: number, domain: string | null) {
  const sb = supabaseAdmin();
  const { error } = await sb.from('scorecard_config').update({ domain }).eq('id', id);
  if (error) throw error;
}

export async function setScorecardCustomDomain(id: number, customDomain: string | null) {
  const sb = supabaseAdmin();
  const { error } = await sb.from('scorecard_config').update({ custom_domain: customDomain }).eq('id', id);
  if (error) throw error;
}

export interface AccountSettings {
  name: string;
  email: string;
  users: { name: string; email: string; role: 'owner' | 'admin' | 'editor' | 'viewer' }[];
}

export async function getAccount(): Promise<AccountSettings> {
  const sb = supabaseAdmin();
  const { data } = await sb.from('account').select('name, email, users').eq('id', 1).maybeSingle();
  if (data) return { name: data.name, email: data.email, users: (data.users as AccountSettings['users']) ?? [] };
  await sb.from('account').upsert({ id: 1, name: 'My Account', email: '' });
  return { name: 'My Account', email: '', users: [] };
}

export async function saveAccount(a: AccountSettings) {
  const sb = supabaseAdmin();
  const { error } = await sb
    .from('account')
    .upsert({ id: 1, name: a.name, email: a.email, users: a.users, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function saveConfig(config: ScorecardConfig, id?: number) {
  const sb = supabaseAdmin();
  const target = id ?? getActiveScorecardId() ?? 1;
  const { error } = await sb
    .from('scorecard_config')
    .update({ config, name: config.title, updated_at: new Date().toISOString() })
    .eq('id', target);
  if (error) throw error;
}
