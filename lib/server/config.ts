import { defaultConfig } from '../defaultConfig';
import { ScorecardConfig } from '../types';
import { supabaseAdmin } from './supabase';

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
  // Merge so newly added config keys fall back to defaults.
  return { ...defaultConfig, ...(data.config as ScorecardConfig) };
}

export async function saveConfig(config: ScorecardConfig) {
  const sb = supabaseAdmin();
  const { error } = await sb
    .from('scorecard_config')
    .upsert({ id: 1, config, updated_at: new Date().toISOString() });
  if (error) throw error;
}
