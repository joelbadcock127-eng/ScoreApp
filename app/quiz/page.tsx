import { redirect } from 'next/navigation';
import { getConfig } from '@/lib/server/config';
import QuizFlow from '@/components/QuizFlow';

export const dynamic = 'force-dynamic';

export default async function QuizPage({
  searchParams,
}: {
  searchParams: { lead?: string; preview?: string };
}) {
  const preview = searchParams.preview === '1';
  const leadId = searchParams.lead;
  if (!leadId && !preview) redirect('/');
  const config = await getConfig();
  return (
    <QuizFlow
      leadId={leadId ?? 'preview'}
      questions={config.questions}
      categories={config.categories}
      logoUrl={config.branding.logoUrl}
      copyright={config.copyright}
      page={config.questionsPage}
      preview={preview}
    />
  );
}
