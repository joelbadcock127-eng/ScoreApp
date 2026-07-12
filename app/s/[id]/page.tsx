import { notFound } from 'next/navigation';
import { getConfig, listScorecards } from '@/lib/server/config';
import LandingView from '@/components/LandingView';

export const dynamic = 'force-dynamic';

// Each scorecard's own distinct public URL: /s/<id>. The whole flow (lead
// form, quiz, results, emails) stays on this scorecard.
async function resolveId(param: string): Promise<number | null> {
  const id = Number(param);
  if (!Number.isInteger(id) || id <= 0) return null;
  const all = await listScorecards();
  return all.some((s) => s.id === id) ? id : null;
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const id = await resolveId(params.id);
  if (id == null) return {};
  const config = await getConfig(id);
  const sa = config.shareAppearance;
  if (!sa) return { title: config.title };
  const images = sa.image ? [{ url: sa.image, width: 1280, height: 720 }] : undefined;
  return {
    title: sa.title || config.title,
    description: sa.description,
    openGraph: { title: sa.title || config.title, description: sa.description, images },
    twitter: { card: 'summary_large_image', title: sa.title || config.title, description: sa.description, images },
  };
}

export default async function ScorecardLandingPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { chrome?: string };
}) {
  const id = await resolveId(params.id);
  if (id == null) notFound();
  const config = await getConfig(id);
  return <LandingView config={config} scorecardId={id} hideChrome={searchParams?.chrome === '0'} />;
}
