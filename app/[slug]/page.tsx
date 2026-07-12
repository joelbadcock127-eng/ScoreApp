import { notFound } from 'next/navigation';
import { getConfig, listScorecards, ScorecardSummary } from '@/lib/server/config';
import ScorecardLanding from '@/components/ScorecardLanding';

export const dynamic = 'force-dynamic';

// Pretty path URLs: a scorecard with a subdomain slug (Settings → Domain) is
// also reachable at /<slug> on the main site — e.g. the AI Opportunity
// Assessment ("assessment") lives at /assessment. Real app routes (/account,
// /admin, /login, /quiz, /results, /s, …) always win over this catch-all.
async function resolveBySlug(slug: string): Promise<ScorecardSummary | null> {
  if (!/^[a-z0-9-]{1,63}$/.test(slug)) return null;
  const all = await listScorecards();
  return all.find((s) => s.domain === slug) ?? null;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const sc = await resolveBySlug(params.slug);
  if (!sc) return {};
  const config = await getConfig(sc.id);
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

export default async function SlugLandingPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { chrome?: string };
}) {
  const sc = await resolveBySlug(params.slug);
  if (!sc) notFound();
  const config = await getConfig(sc.id);
  return <ScorecardLanding config={config} scorecardId={sc.id} hideChrome={searchParams?.chrome === '0'} />;
}
