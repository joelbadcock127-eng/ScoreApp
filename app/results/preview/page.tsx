import { getConfig, listScorecards } from '@/lib/server/config';
import { isSurvey } from '@/lib/scoring';
import ResultsView from '@/components/ResultsView';
import CustomResultsPage from '@/components/CustomResultsPage';
import { sampleResults } from '@/lib/sampleData';

export const dynamic = 'force-dynamic';

// Sample result used by the admin Build section preview and by the link in
// test invites. ?tier=low|medium|high picks the sample score; ?scorecard=<id>
// previews that scorecard rather than the one the request resolves to.
export default async function ResultsPreviewPage({
  searchParams,
}: {
  searchParams: { tier?: string; scorecard?: string };
}) {
  let scorecardId: number | undefined;
  const wanted = Number(searchParams.scorecard);
  if (Number.isInteger(wanted) && wanted > 0) {
    const all = await listScorecards();
    if (all.some((s) => s.id === wanted)) scorecardId = wanted;
  }
  const config = await getConfig(scorecardId);
  const tier = ['low', 'medium', 'high'].includes(searchParams.tier ?? '')
    ? (searchParams.tier as string)
    : 'high';
  const lead = sampleResults(config, tier);

  // A survey with a custom thank-you page previews that page (score-free, the
  // same rule the real results route applies), so a test run ends where a
  // real respondent would.
  const survey = isSurvey(config);
  const scoreyShell = /\{\{\s*(chart:|score\.|tier\.|category:|#if\s+tier)/i.test(
    config.customPages?.results?.html ?? ''
  );
  if (survey && config.resultsMode === 'custom' && config.customPages?.results && !scoreyShell) {
    return <CustomResultsPage config={config} survey lead={lead} />;
  }

  return <ResultsView config={config} lead={lead} reportHref={`/api/report/preview?tier=${tier}`} />;
}
