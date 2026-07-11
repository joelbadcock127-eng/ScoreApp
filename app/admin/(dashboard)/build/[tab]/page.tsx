import { notFound } from 'next/navigation';
import { getConfig } from '@/lib/server/config';
import BuildScreen from '@/components/admin/BuildScreen';
import QuestionsEditor from '@/components/admin/editor/QuestionsEditor';
import LandingEditor from '@/components/admin/editor/LandingEditor';
import ResultsEditor from '@/components/admin/editor/ResultsEditor';

export const dynamic = 'force-dynamic';

const TABS = ['landing', 'questions', 'results', 'pdf'] as const;

export default async function BuildPage({ params }: { params: { tab: string } }) {
  if (!TABS.includes(params.tab as (typeof TABS)[number])) notFound();
  if (params.tab === 'questions') {
    const config = await getConfig();
    return <QuestionsEditor initialConfig={config} />;
  }
  if (params.tab === 'landing') {
    const config = await getConfig();
    return <LandingEditor initialConfig={config} />;
  }
  if (params.tab === 'results') {
    const config = await getConfig();
    return <ResultsEditor initialConfig={config} />;
  }
  return <BuildScreen tab="pdf" />;
}
