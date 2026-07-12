import { cookies, headers } from 'next/headers';
import * as React from 'react';

const cache: <T extends (...args: never[]) => unknown>(fn: T) => T =
  typeof React.cache === 'function' ? React.cache : (fn) => fn;
import { defaultConfig } from '../defaultConfig';
import { blankConfig } from '../blankConfig';
import { ScorecardConfig } from '../types';
import { supabaseAdmin } from './supabase';
import { getSessionAccountId } from './auth';

export const SCORECARD_COOKIE = 'sc_scorecard';

export interface ScorecardSummary {
  id: number;
  name: string;
  is_default: boolean;
  account_id: number | null;
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
  // Vercel preview/production hosts are the app itself, not a customer domain.
  if (host.endsWith('.vercel.app')) return null;
  return host.replace(/^www\./, '') || null;
}

// The scorecard the current admin is editing (set by the scorecard switcher).
export function getActiveScorecardId(): number | null {
  try {
    const v = cookies().get(SCORECARD_COOKIE)?.value;
    const id = Number(v);
    return Number.isInteger(id) && id > 0 ? id : null;
  } catch {
    return null; // outside a request context
  }
}

// All scorecards (public/internal use: host + /s/<id> resolution). Memoised
// per request so layouts and pages share one query.
export const listScorecards = cache(async (): Promise<ScorecardSummary[]> => {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from('scorecard_config')
    .select('id, name, is_default, account_id, domain, custom_domain, updated_at, created_at')
    .order('created_at', { ascending: true })
    .returns<ScorecardSummary[]>();
  if (error) throw error;
  return data ?? [];
});

// The logged-in account's own scorecards — what every admin surface shows.
export async function listMyScorecards(): Promise<ScorecardSummary[]> {
  const accountId = getSessionAccountId();
  if (accountId == null) return [];
  return (await listScorecards()).filter((s) => s.account_id === accountId);
}

export async function createScorecard(name: string): Promise<number> {
  const accountId = getSessionAccountId();
  if (accountId == null) throw new Error('Not logged in');
  return insertScorecard(name, blankConfig(name), accountId);
}

export async function insertScorecard(name: string, config: ScorecardConfig, accountId: number): Promise<number> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from('scorecard_config')
    .insert({ name: name.slice(0, 120), config, account_id: accountId })
    .select('id')
    .single();
  if (error) throw error;
  return data.id as number;
}

const fetchConfigById = cache(async (id: number): Promise<ScorecardConfig | null> => {
  const sb = supabaseAdmin();
  const { data, error } = await sb.from('scorecard_config').select('config').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? { ...defaultConfig, ...(data.config as ScorecardConfig) } : null;
});

export async function getConfig(id?: number): Promise<ScorecardConfig> {
  // Explicit id (public /s/<id> pages and admin APIs) is trusted by callers.
  if (id != null) {
    const byId = await fetchConfigById(id);
    if (byId) return byId;
  }

  const all = await listScorecards();

  // Admin editing context: the switcher cookie, but only for scorecards the
  // logged-in account actually owns.
  const accountId = getSessionAccountId();
  const wanted = getActiveScorecardId();
  if (accountId != null && wanted != null && all.some((s) => s.id === wanted && s.account_id === accountId)) {
    const byCookie = await fetchConfigById(wanted);
    if (byCookie) return byCookie;
  }

  // Public visitors: resolve by host.
  const sub = getHostSubdomain();
  if (sub) {
    const match = all.find((s) => s.domain === sub);
    if (match) {
      const byDomain = await fetchConfigById(match.id);
      if (byDomain) return byDomain;
    }
  }
  const custom = getHostCustomDomain();
  if (custom) {
    const match = all.find((s) => s.custom_domain === custom);
    if (match) {
      const byCustom = await fetchConfigById(match.id);
      if (byCustom) return byCustom;
    }
  }

  // Logged-in account with no cookie: their first scorecard.
  if (accountId != null) {
    const mine = all.filter((s) => s.account_id === accountId);
    const pick = mine.find((s) => s.is_default) ?? mine[0];
    if (pick) {
      const cfg = await fetchConfigById(pick.id);
      if (cfg) return cfg;
    }
  }

  const def = all.find((s) => s.is_default) ?? all[0];
  if (def) {
    const cfg = await fetchConfigById(def.id);
    if (cfg) return cfg;
  }

  // First run: seed the database with the default scorecard content.
  const sb = supabaseAdmin();
  await sb
    .from('scorecard_config')
    .upsert({ id: 1, config: defaultConfig, name: defaultConfig.title, is_default: true });
  return defaultConfig;
}

// Resolved id for queries that filter by scorecard. For a logged-in account
// this stays within their own scorecards; for public visitors it resolves by
// host and falls back to the default.
export const getActiveOrDefaultId = cache(async (): Promise<number> => {
  const all = await listScorecards();
  const accountId = getSessionAccountId();
  const mine = accountId != null ? all.filter((s) => s.account_id === accountId) : [];

  const wanted = getActiveScorecardId();
  if (wanted != null && (accountId != null ? mine : all).some((s) => s.id === wanted)) return wanted;

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

  if (mine.length) return (mine.find((s) => s.is_default) ?? mine[0]).id;
  return all.find((s) => s.is_default)?.id ?? all[0]?.id ?? 1;
});

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

// Settings for the logged-in account.
export const getAccount = cache(async (): Promise<AccountSettings> => {
  const accountId = getSessionAccountId();
  if (accountId == null) return { name: 'My Account', email: '', users: [] };
  const sb = supabaseAdmin();
  const { data } = await sb.from('accounts').select('name, email, users').eq('id', accountId).maybeSingle();
  if (!data) return { name: 'My Account', email: '', users: [] };
  return { name: data.name, email: data.email, users: (data.users as AccountSettings['users']) ?? [] };
});

export async function saveAccount(a: AccountSettings) {
  const accountId = getSessionAccountId();
  if (accountId == null) throw new Error('Not logged in');
  const sb = supabaseAdmin();
  const { error } = await sb
    .from('accounts')
    .update({ name: a.name, email: a.email, users: a.users, updated_at: new Date().toISOString() })
    .eq('id', accountId);
  if (error) throw error;
}

export async function saveConfig(config: ScorecardConfig, id?: number) {
  const accountId = getSessionAccountId();
  if (accountId == null) throw new Error('Not logged in');
  const mine = await listMyScorecards();
  const target = id ?? getActiveScorecardId() ?? undefined;
  const resolved =
    target != null && mine.some((s) => s.id === target)
      ? target
      : (mine.find((s) => s.is_default) ?? mine[0])?.id;
  if (resolved == null) throw new Error('No scorecard to save');
  const sb = supabaseAdmin();
  const { error } = await sb
    .from('scorecard_config')
    .update({ config, name: config.title, updated_at: new Date().toISOString() })
    .eq('id', resolved);
  if (error) throw error;
}
