import { CategoryScore, ScorecardConfig } from '@/lib/types';
import { buildResultsData, mergeCustomPage } from '@/lib/customPage';

// Public renderer for an AI-designed results page: merges the lead's real
// scores, tier copy and per-category advice into the design shell.
export default function CustomResultsPage({
  config,
  lead,
}: {
  config: ScorecardConfig;
  lead: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    business: string;
    overall_percent: number;
    category_scores: CategoryScore[];
  };
}) {
  const page = config.customPages!.results!;
  const data = buildResultsData(config, {
    id: lead.id,
    first_name: lead.first_name,
    last_name: lead.last_name,
    email: lead.email,
    business: lead.business,
    overall_percent: lead.overall_percent,
    category_scores: lead.category_scores.map((c) => ({ key: c.key, label: c.label, percent: c.percent })),
  });
  const html = mergeCustomPage(page, data);
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `.cp-page img{max-width:100%}${page.css}` }} />
      <main dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
