// DB load/save for the account-wide email signature. Validation and the
// HTML renderer live in lib/signature.ts (pure, shared with the admin
// editor so its live preview matches sent emails exactly).
import { EmailSignature } from '../types';
import { BLANK_SIGNATURE, cleanSignature, renderSignature } from '../signature';
import { supabaseAdmin } from './supabase';

export { BLANK_SIGNATURE, cleanSignature, renderSignature };

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
