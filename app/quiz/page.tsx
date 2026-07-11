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
      branding={config.branding}
      theme={config.theme}
      page={config.questionsPage}
      copyright={config.copyright}
      categoryLabels={Object.fromEntries(config.categories.map((c) => [c.key, c.label]))}
      preview={preview}
    />
  );
}
