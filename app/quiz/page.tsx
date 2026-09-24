import { redirect } from 'next/navigation';
import { getConfig, listScorecards } from '@/lib/server/config';
import { questionsFirst } from '@/lib/scoring';
import { supabaseAdmin } from '@/lib/server/supabase';
import QuizFlow from '@/components/QuizFlow';
import { faviconIcons } from '@/lib/favicon';

export const dynamic = 'force-dynamic';

type Params = { lead?: string; preview?: string; scorecard?: string };

// An explicit ?scorecard=<id> (questions-first surveys and test invites) must
// name a scorecard that exists; anything else is ignored.
async function scorecardParam(raw: string | undefined): Promise<number | undefined> {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) return undefined;
  const all = await listScorecards();
  return all.some((s) => s.id === id) ? id : undefined;
}

async function leadScorecardId(leadId: string | undefined): Promise<number | undefined> {
  if (!leadId || !/^[0-9a-f-]{36}$/i.test(leadId)) return undefined;
  const { data } = await supabaseAdmin().from('leads').select('scorecard_id').eq('id', leadId).maybeSingle();
  return data?.scorecard_id ? (data.scorecard_id as number) : undefined;
}

// Favicon from the scorecard the lead started on (matching the page body's
// own config resolution), not whatever the request host would resolve to.
export async function generateMetadata({ searchParams }: { searchParams: Params }) {
  const scorecardId = (await leadScorecardId(searchParams.lead)) ?? (await scorecardParam(searchParams.scorecard));
  return { icons: faviconIcons(await getConfig(scorecardId)) };
}

// Three ways in:
//   ?lead=<id>                 a lead who came through the form or an invite
//   ?preview=1[&scorecard=id]  runs the questions without saving (admin
//                              preview, and the link in test invites)
//   ?scorecard=<id>            a questions-first survey: the questions come
//                              first and the lead form is asked at the end
export default async function QuizPage({ searchParams }: { searchParams: Params }) {
  const preview = searchParams.preview === '1';
  const leadId = searchParams.lead;
  const explicitId = await scorecardParam(searchParams.scorecard);

  if (leadId) {
    // Questions must come from the scorecard the lead started on, not the default.
    const config = await getConfig(await leadScorecardId(leadId));
    return <QuizFlow leadId={leadId} {...common(config)} />;
  }

  if (preview) {
    const config = await getConfig(explicitId);
    return <QuizFlow leadId="preview" preview previewScorecardId={explicitId} {...common(config)} />;
  }

  if (explicitId != null) {
    const config = await getConfig(explicitId);
    // Only questions-first surveys start here; anything else gets its landing page.
    if (!questionsFirst(config)) redirect(`/s/${explicitId}`);
    return <QuizFlow leadId="pending" scorecardId={explicitId} leadForm={config.leadForm} {...common(config)} />;
  }

  redirect('/');
}

function common(config: Awaited<ReturnType<typeof getConfig>>) {
  return {
    questions: config.questions,
    categories: config.categories,
    logoUrl: config.branding.logoUrl,
    logoLinkUrl: config.branding.logoLinkUrl,
    copyright: config.copyright,
    page: config.questionsPage,
    mode: config.mode ?? 'scorecard',
  };
}
