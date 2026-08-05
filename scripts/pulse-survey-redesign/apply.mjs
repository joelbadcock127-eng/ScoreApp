// Applies the pulse survey redesign (design.mjs) to scorecard 11's config.
//
// Run from the repo root with the same env the app uses:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/pulse-survey-redesign/apply.mjs
//
// tsx is needed because the sanitizer lives in the app's TypeScript lib; the
// pages are stored already-sanitized, exactly as the custom page editor would
// save them. Only scorecard 11 is touched. Besides the two custom pages this
// also applies the matching palette (branding, lead form button, question
// screen colours), the result email and the share description, so the whole
// respondent flow lines up with the design.
import { createClient } from '@supabase/supabase-js';
import { sanitizeCustomPage } from '../../lib/customPage';
import {
  landingPage,
  thanksPage,
  resultEmail,
  brandingPatch,
  questionColorsPatch,
  leadFormButtonColor,
  shareDescription,
} from './design.mjs';

const SCORECARD_ID = 11;

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });

const { data, error } = await sb.from('scorecard_config').select('config').eq('id', SCORECARD_ID).single();
if (error) throw error;

const config = data.config;
config.customPages = {
  landing: sanitizeCustomPage(landingPage()),
  results: sanitizeCustomPage(thanksPage()),
};
config.landingMode = 'custom';
config.resultsMode = 'custom';
config.branding = { ...config.branding, ...brandingPatch };
config.leadForm = { ...config.leadForm, buttonColor: leadFormButtonColor };
config.questionsPage = {
  ...config.questionsPage,
  questions: { ...config.questionsPage?.questions, ...questionColorsPatch },
};
config.resultEmail = { ...config.resultEmail, subject: resultEmail.subject, content: resultEmail.content };
config.shareAppearance = { ...config.shareAppearance, description: shareDescription };

const { error: upErr } = await sb
  .from('scorecard_config')
  .update({ config, updated_at: new Date().toISOString() })
  .eq('id', SCORECARD_ID);
if (upErr) throw upErr;

console.log(`Applied pulse survey redesign to scorecard ${SCORECARD_ID}.`);
