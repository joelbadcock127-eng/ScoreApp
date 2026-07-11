import { getConfig } from '@/lib/server/config';
import StartScorecard from '@/components/StartScorecard';
import VisitBeacon from '@/components/VisitBeacon';
import LandingView from '@/components/LandingView';

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const config = await getConfig();
  return (
    <StartScorecard leadForm={config.leadForm}>
      <VisitBeacon />
      <LandingView landing={config.landing} branding={config.branding} copyright={config.copyright} />
    </StartScorecard>
  );
}
