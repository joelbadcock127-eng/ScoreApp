import { ScorecardConfig } from '@/lib/types';
import LandingView from './LandingView';
import CustomLandingPage from './CustomLandingPage';

// Renders whichever landing page mode the scorecard uses: the component-based
// view, or the AI-designed custom page.
export default function ScorecardLanding({
  config,
  scorecardId,
  leadId,
  preview = false,
  hideChrome = false,
}: {
  config: ScorecardConfig;
  scorecardId?: number;
  // An invited visitor (their lead id from the invite link): the start
  // button skips the details form. preview: a test run that saves nothing.
  leadId?: string;
  preview?: boolean;
  hideChrome?: boolean;
}) {
  if (config.landingMode === 'custom' && config.customPages?.landing) {
    return <CustomLandingPage config={config} scorecardId={scorecardId} leadId={leadId} preview={preview} />;
  }
  return <LandingView config={config} scorecardId={scorecardId} leadId={leadId} preview={preview} hideChrome={hideChrome} />;
}
