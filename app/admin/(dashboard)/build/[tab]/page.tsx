import { notFound } from 'next/navigation';
import BuildScreen from '@/components/admin/BuildScreen';

export const dynamic = 'force-dynamic';

const TABS = ['landing', 'questions', 'results', 'pdf'] as const;

export default function BuildPage({ params }: { params: { tab: string } }) {
  if (!TABS.includes(params.tab as (typeof TABS)[number])) notFound();
  return <BuildScreen tab={params.tab as (typeof TABS)[number]} />;
}
