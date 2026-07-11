import { notFound } from 'next/navigation';
import { getConfig } from '@/lib/server/config';
import { supabaseAdmin } from '@/lib/server/supabase';
import { CategoryScore, Lead } from '@/lib/types';
import ResultsView from '@/components/ResultsView';

export const dynamic = 'force-dynamic';

export default async function ResultsPage({ params }: { params: { id: string } }) {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) notFound();
  const [config, { data: lead }] = await Promise.all([
    getConfig(),
    supabaseAdmin().from('leads').select('*').eq('id', params.id).maybeSingle<Lead>(),
  ]);
  if (!lead || lead.status !== 'completed' || lead.overall_percent == null) notFound();

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
