import { notFound } from 'next/navigation';
import { getConfig } from '@/lib/server/config';
import { isSurvey } from '@/lib/scoring';
import { supabaseAdmin } from '@/lib/server/supabase';
import { CategoryScore, Lead } from '@/lib/types';
import ResultsView from '@/components/ResultsView';
import CustomResultsPage from '@/components/CustomResultsPage';

export const dynamic = 'force-dynamic';

export default async function ResultsPage({ params }: { params: { id: string } }) {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) notFound();
  const { data: lead } = await supabaseAdmin()
    .from('leads')
    .select('*')
    .eq('id', params.id)
    .maybeSingle<Lead>();
  const config = await getConfig(lead?.scorecard_id);
  if (!lead || lead.status !== 'completed' || lead.overall_percent == null) notFound();

  // Surveys always use the component-based thank-you page: AI-designed custom
  // results pages are built around scores/tiers and would leak them.
  if (config.resultsMode === 'custom' && config.customPages?.results && !isSurvey(config)) {
    return (
      <CustomResultsPage
        config={config}
        lead={{
          id: lead.id,
          first_name: lead.first_name,
          last_name: lead.last_name,
          email: lead.email,
          business: lead.business,
          overall_percent: lead.overall_percent,
          category_scores: (lead.category_scores ?? []) as CategoryScore[],
        }}
      />
    );
  }

  return (
    <ResultsView
      config={config}
      lead={{
        id: lead.id,
        email: lead.email,
        first_name: lead.first_name,
        last_name: lead.last_name,
        business: lead.business,
        contact_opt_in: lead.contact_opt_in,
        overall_percent: lead.overall_percent,
        category_scores: (lead.category_scores ?? []) as CategoryScore[],
      }}
      reportHref={`/api/report/${lead.id}`}
    />
  );
}
