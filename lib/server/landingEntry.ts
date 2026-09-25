import { questionsFirst } from '../scoring';
import { ScorecardConfig } from '../types';
import { supabaseAdmin } from './supabase';

// Shared by every public landing route (/, /s/<id>, /<slug>). Reads the
// visitor's entry state from the query string and decides where they go:
//   ?lead=<id>    an invited visitor, if the lead belongs to this scorecard
//                 and has not already completed it
//   ?preview=1    a test run (the link in test invites) that saves nothing
// With "open on the first question" on, everyone is sent to the questions;
// otherwise they see the landing page with the start button wired to match.

export interface LandingEntry {
  leadId?: string;
  preview: boolean;
  /** Where to redirect instead of rendering the landing page, if anywhere. */
  redirectTo?: string;
}

export async function resolveLandingEntry(
  scorecardId: number,
  config: ScorecardConfig,
  searchParams: { lead?: string; preview?: string } | undefined
): Promise<LandingEntry> {
  const preview = searchParams?.preview === '1';
  let leadId: string | undefined;
  const raw = searchParams?.lead;
  if (raw && /^[0-9a-f-]{36}$/i.test(raw)) {
    const { data } = await supabaseAdmin()
      .from('leads')
      .select('id, status')
      .eq('id', raw)
      .eq('scorecard_id', scorecardId)
      .maybeSingle<{ id: string; status: string }>();
    if (data && data.status !== 'completed') leadId = data.id;
  }
  const entry: LandingEntry = { leadId, preview };
  if (questionsFirst(config)) {
    entry.redirectTo = leadId
      ? `/quiz?lead=${leadId}`
      : preview
        ? `/quiz?preview=1&scorecard=${scorecardId}`
        : `/quiz?scorecard=${scorecardId}`;
  }
  return entry;
}
