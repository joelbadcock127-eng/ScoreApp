import { getConfig } from '@/lib/server/config';
import LandingView from '@/components/LandingView';

export const dynamic = 'force-dynamic';

// Social share (Open Graph / Twitter) metadata from Settings → Share Appearance.
export async function generateMetadata() {
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

export default async function LandingPage({
  searchParams,
}: {
  searchParams?: { chrome?: string };
}) {
  const config = await getConfig();
  // ?chrome=0 is used by the website embeds to hide the header and footer.
  return <LandingView config={config} hideChrome={searchParams?.chrome === '0'} />;
}
