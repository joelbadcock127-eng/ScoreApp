import { CategoryScore, ScorecardConfig, Tier } from './types';

export function tierFor(percent: number, tiers: Tier[]): Tier {
  const t = tiers.find((t) => percent >= t.from && percent <= t.to);
  return t ?? tiers[tiers.length - 1];
}

export function computeScores(config: ScorecardConfig, answers: Record<string, number>) {
  const categoryScores: CategoryScore[] = config.categories.map((cat) => {
    const qs = config.questions.filter((q) => q.category === cat.key);
    const score = qs.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
    const max = qs.reduce((sum, q) => sum + q.max, 0);
    return {
      key: cat.key,
      label: cat.label,
      score,
      max,
      percent: max ? Math.round((score / max) * 100) : 0,
    };
  });
  const score_total = categoryScores.reduce((s, c) => s + c.score, 0);
  const score_max = categoryScores.reduce((s, c) => s + c.max, 0);
  const overall_percent = score_max ? Math.round((score_total / score_max) * 100) : 0;
  return { categoryScores, score_total, score_max, overall_percent };
}
