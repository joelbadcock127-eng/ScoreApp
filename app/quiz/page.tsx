import { redirect } from 'next/navigation';
import { getConfig } from '@/lib/server/config';
import { supabaseAdmin } from '@/lib/server/supabase';
import QuizFlow from '@/components/QuizFlow';
import { faviconIcons } from '@/lib/favicon';

export const dynamic = 'force-dynamic';

// Favicon from the scorecard the lead started on (matching the page body's
// own config resolution), not whatever the request host would resolve to.
export async function generateMetadata({ searchParams }: { searchParams: { lead?: string } }) {
  let scorecardId: number | undefined;
  if (searchParams.lead) {
    const { data } = await supabaseAdmin()
      .from('leads')
      .select('scorecard_id')
      .eq('id', searchParams.lead)
      .maybeSingle();
    if (data?.scorecard_id) scorecardId = data.scorecard_id as number;
  }
  return { icons: faviconIcons(await getConfig(scorecardId)) };
}

export default async function QuizPage({
  searchParams,
}: {
  searchParams: { lead?: string; preview?: string };
}) {
  const preview = searchParams.preview === '1';
  const leadId = searchParams.lead;
  if (!leadId && !preview) redirect('/');
  // Questions must come from the scorecard the lead started on, not the default.
  let scorecardId: number | undefined;
  if (leadId) {
    const { data } = await supabaseAdmin().from('leads').select('scorecard_id').eq('id', leadId).maybeSingle();
    if (data?.scorecard_id) scorecardId = data.scorecard_id as number;
  }
  const config = await getConfig(scorecardId);
  return (
    <QuizFlow
      leadId={leadId ?? 'preview'}
      questions={config.questions}
      categories={config.categories}
      logoUrl={config.branding.logoUrl}
      logoLinkUrl={config.branding.logoLinkUrl}
      copyright={config.copyright}
      page={config.questionsPage}
      preview={preview}
      mode={config.mode ?? 'scorecard'}
    />
  );
}
