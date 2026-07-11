import { CategoryScore, Question, ScorecardConfig, Tier } from './types';

export function tierFor(percent: number, tiers: Tier[]): Tier {
  const t = tiers.find((t) => percent >= t.from && percent <= t.to);
  return t ?? tiers[tiers.length - 1];
}

// Maximum score a single question can contribute, by answer format.
// Answers always store the achieved score as a number, so summing stays simple:
//  - scale: the chosen 1..max value
//  - single-choice (yes/no/maybe, buttons, radio): the chosen option's score
//  - checkboxes: sum of every ticked option's score
//  - open text: unscored (excluded from totals)
export function questionMax(q: Question): number {
  const type = q.type ?? 'scale';
  if (type === 'text') return 0;
  if (type === 'checkboxes') return (q.options ?? []).reduce((s, o) => s + Math.max(0, o.score), 0);
  if (type === 'scale') return q.max;
  return Math.max(0, ...(q.options ?? []).map((o) => o.score));
}

export function isScored(q: Question): boolean {
  return questionMax(q) > 0;
}

export function computeScores(config: ScorecardConfig, answers: Record<string, number>) {
  const categoryScores: CategoryScore[] = config.categories.map((cat) => {
    const qs = config.questions.filter((q) => q.category === cat.key && isScored(q));
    const score = qs.reduce((sum, q) => sum + Math.min(answers[q.id] ?? 0, questionMax(q)), 0);
    const max = qs.reduce((sum, q) => sum + questionMax(q), 0);
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
