import { getConfig, getHostCustomDomain, getHostSubdomain } from '@/lib/server/config';
import { isAdmin } from '@/lib/server/auth';
import ScorecardLanding from '@/components/ScorecardLanding';
import MarketingPage from '@/components/marketing/MarketingPage';

export const dynamic = 'force-dynamic';

function isScorecardHost() {
  return getHostSubdomain() != null || getHostCustomDomain() != null;
}

// Social share (Open Graph / Twitter) metadata from Settings → Share Appearance.
export async function generateMetadata() {
  if (!isScorecardHost()) {
    return {
      title: 'Acceso AI Scorecards',
      description: 'Build branded lead-generation scorecards with AI-drafted questions, results and PDF reports.',
    };
  }
  const config = await getConfig();
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

// The base domain lands on the marketing page (Log in / Get started lead to
// /login; logged-in visitors get a Dashboard button instead of a redirect);
// scorecard subdomains and custom domains land straight on their scorecard.
export default async function RootPage({
  searchParams,
}: {
  searchParams?: { chrome?: string };
}) {
  if (isScorecardHost()) {
    const config = await getConfig();
    return <ScorecardLanding config={config} hideChrome={searchParams?.chrome === '0'} />;
  }
  return <MarketingPage loggedIn={isAdmin()} />;
}
