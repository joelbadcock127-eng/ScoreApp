import { notFound } from 'next/navigation';
import { getConfig } from '@/lib/server/config';
import QuestionsEditor from '@/components/admin/editor/QuestionsEditor';
import LandingEditor from '@/components/admin/editor/LandingEditor';
import ResultsEditor from '@/components/admin/editor/ResultsEditor';
import PdfEditor from '@/components/admin/editor/PdfEditor';
import CustomPagesEditor from '@/components/admin/editor/CustomPagesEditor';

export const dynamic = 'force-dynamic';

const TABS = ['landing', 'questions', 'results', 'pdf', 'custom'] as const;

export default async function BuildPage({ params }: { params: { tab: string } }) {
  if (!TABS.includes(params.tab as (typeof TABS)[number])) notFound();
  const config = await getConfig();
  if (params.tab === 'questions') return <QuestionsEditor initialConfig={config} />;
  if (params.tab === 'landing') return <LandingEditor initialConfig={config} />;
  if (params.tab === 'results') return <ResultsEditor initialConfig={config} />;
  if (params.tab === 'custom') return <CustomPagesEditor initialConfig={config} />;
  return <PdfEditor initialConfig={config} />;
}
