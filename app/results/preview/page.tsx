import { getConfig } from '@/lib/server/config';
import ResultsView from '@/components/ResultsView';
import { sampleResults } from '@/lib/sampleData';

export const dynamic = 'force-dynamic';

// Sample result used by the admin Build section preview. ?tier=low|medium|high
export default async function ResultsPreviewPage({
  searchParams,
}: {
  searchParams: { tier?: string };
}) {
  const config = await getConfig();
  const tier = ['low', 'medium', 'high'].includes(searchParams.tier ?? '')
    ? (searchParams.tier as string)
    : 'high';
  const lead = sampleResults(config, tier);
  return <ResultsView config={config} lead={lead} reportHref={`/api/report/preview?tier=${tier}`} />;
}
