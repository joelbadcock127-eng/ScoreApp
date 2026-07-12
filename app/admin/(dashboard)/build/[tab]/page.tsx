import { notFound, redirect } from 'next/navigation';
import { canUseCustomDesign, getSessionAccount } from '@/lib/server/auth';
import { getConfig } from '@/lib/server/config';
import QuestionsEditor from '@/components/admin/editor/QuestionsEditor';
import LandingEditor from '@/components/admin/editor/LandingEditor';
import ResultsEditor from '@/components/admin/editor/ResultsEditor';
import PdfEditor from '@/components/admin/editor/PdfEditor';
import CustomPagesEditor from '@/components/admin/editor/CustomPagesEditor';
import CustomModeNotice from '@/components/admin/editor/CustomModeNotice';

export const dynamic = 'force-dynamic';

const TABS = ['landing', 'questions', 'results', 'pdf', 'custom'] as const;

export default async function BuildPage({
  params,
  searchParams,
}: {
  params: { tab: string };
  searchParams?: { standard?: string };
}) {
  if (!TABS.includes(params.tab as (typeof TABS)[number])) notFound();
  const config = await getConfig();
  const editStandardAnyway = searchParams?.standard === '1';
  if (params.tab === 'questions') return <QuestionsEditor initialConfig={config} />;
  if (params.tab === 'landing') {
    if (config.landingMode === 'custom' && config.customPages?.landing && !editStandardAnyway) {
      return <CustomModeNotice page="landing" />;
    }
    return <LandingEditor initialConfig={config} />;
  }
  if (params.tab === 'results') {
    if (config.resultsMode === 'custom' && config.customPages?.results && !editStandardAnyway) {
      return <CustomModeNotice page="results" />;
    }
    return <ResultsEditor initialConfig={config} />;
  }
  if (params.tab === 'custom') {
    const account = await getSessionAccount();
    if (!account || !canUseCustomDesign(account)) redirect('/admin/build/landing');
    return <CustomPagesEditor initialConfig={config} />;
  }
  return <PdfEditor initialConfig={config} />;
}
