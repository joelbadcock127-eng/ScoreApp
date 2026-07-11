import { ResultsData } from '@/components/ResultsView';
import { ScorecardConfig } from './types';

// Sample answers per tier, mirroring ScoreApp's editor previews (High shows 90%).
const TIER_PERCENT: Record<string, number> = { low: 25, medium: 65, high: 90 };

export function sampleResults(config: ScorecardConfig, tier: string): ResultsData {
  const pct = TIER_PERCENT[tier] ?? 65;
  return {
    id: 'preview',
    email: 'john.smith@example.com',
    first_name: 'John',
    last_name: 'Smith',
    business: 'Example Business',
    contact_opt_in: false,
    overall_percent: pct,
    category_scores: config.categories.map((c) => {
      const qs = config.questions.filter((q) => q.category === c.key);
      const max = qs.reduce((s, q) => s + q.max, 0);
      return {
        key: c.key,
        label: c.label,
        score: Math.round((pct / 100) * max),
        max,
        percent: pct,
      };
    }),
  };
}
