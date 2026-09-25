import { ScorecardConfig } from '@/lib/types';
import { mergeCustomPage } from '@/lib/customPage';
import StartScorecard from '@/components/StartScorecard';
import VisitBeacon from '@/components/VisitBeacon';

// Public renderer for an AI-designed landing page. The shell + slots are
// sanitized at save time; the merged HTML is safe to inject. Any element
// with [data-start-scorecard] opens the normal lead form.
export default function CustomLandingPage({
  config,
  scorecardId,
  leadId,
  preview = false,
}: {
  config: ScorecardConfig;
  scorecardId?: number;
  leadId?: string;
  preview?: boolean;
}) {
  const page = config.customPages!.landing!;
  const html = mergeCustomPage(page, { scorecardTitle: config.title });
  return (
    <StartScorecard leadForm={config.leadForm} scorecardId={scorecardId} leadId={leadId} preview={preview}>
      <VisitBeacon scorecardId={scorecardId} />
      <style dangerouslySetInnerHTML={{ __html: `.cp-page img{max-width:100%}${page.css}` }} />
      <main dangerouslySetInnerHTML={{ __html: html }} />
    </StartScorecard>
  );
}
