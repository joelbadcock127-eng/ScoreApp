import { cookies } from 'next/headers';
import { defaultConfig } from '../defaultConfig';
import { blankConfig } from '../blankConfig';
import { ScorecardConfig } from '../types';
import { supabaseAdmin } from './supabase';

export const SCORECARD_COOKIE = 'sc_scorecard';

export interface ScorecardSummary {
  id: number;
  name: string;
  is_default: boolean;
  updated_at: string;
  created_at: string;
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
    .select('id, name, is_default, updated_at, created_at')
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
  return all.find((s) => s.is_default)?.id ?? all[0]?.id ?? 1;
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
