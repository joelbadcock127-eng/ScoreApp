import { ScorecardConfig } from '@/lib/types';
import LandingView from './LandingView';
import CustomLandingPage from './CustomLandingPage';

// Renders whichever landing page mode the scorecard uses: the component-based
// view, or the AI-designed custom page.
export default function ScorecardLanding({
  config,
  scorecardId,
  hideChrome = false,
}: {
  config: ScorecardConfig;
  scorecardId?: number;
  hideChrome?: boolean;
}) {
  if (config.landingMode === 'custom' && config.customPages?.landing) {
    return <CustomLandingPage config={config} scorecardId={scorecardId} />;
  }
  return <LandingView config={config} scorecardId={scorecardId} hideChrome={hideChrome} />;
}
