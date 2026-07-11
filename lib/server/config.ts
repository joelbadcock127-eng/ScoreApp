import { defaultConfig } from '../defaultConfig';
import { ScorecardConfig } from '../types';
import { supabaseAdmin } from './supabase';

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === 'object' && !Array.isArray(v);
}

// Merge stored config over defaults, recursively for nested objects, so that
// config keys added in newer code versions fall back to their defaults instead
// of disappearing when an older stored object wins a shallow merge.
function deepMerge<T>(def: T, stored: unknown): T {
  if (!isPlainObject(def) || !isPlainObject(stored)) {
    return (stored === undefined ? def : stored) as T;
  }
  const out: Record<string, unknown> = { ...def };
  for (const key of Object.keys(stored)) {
    const d = (def as Record<string, unknown>)[key];
    const s = stored[key];
    out[key] = isPlainObject(d) && isPlainObject(s) ? deepMerge(d, s) : s;
  }
  return out as T;
}

export async function getConfig(): Promise<ScorecardConfig> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from('scorecard_config')
    .select('config')
    .eq('id', 1)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    // First run: seed the database with the default scorecard content.
    await sb.from('scorecard_config').upsert({ id: 1, config: defaultConfig });
    return defaultConfig;
  }
  return deepMerge(defaultConfig, data.config);
}

export async function saveConfig(config: ScorecardConfig) {
  const sb = supabaseAdmin();
  const { error } = await sb
    .from('scorecard_config')
    .upsert({ id: 1, config, updated_at: new Date().toISOString() });
  if (error) throw error;
}
