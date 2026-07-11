import { redirect } from 'next/navigation';
import { getConfig } from '@/lib/server/config';
import QuizFlow from '@/components/QuizFlow';

export const dynamic = 'force-dynamic';

export default async function QuizPage({
  searchParams,
}: {
  searchParams: { lead?: string };
}) {
  const leadId = searchParams.lead;
  if (!leadId) redirect('/');
  const config = await getConfig();
  return <QuizFlow leadId={leadId} questions={config.questions} />;
}
