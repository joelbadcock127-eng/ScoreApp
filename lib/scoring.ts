import { AnswerValue, CategoryScore, Question, ScorecardConfig, Tier } from './types';

export function tierFor(percent: number, tiers: Tier[]): Tier {
  const t = tiers.find((t) => percent >= t.from && percent <= t.to);
  return t ?? tiers[tiers.length - 1];
}

export function questionType(q: Question) {
  return q.type ?? 'linear';
}

export function questionMax(q: Question): number {
  const type = questionType(q);
  if (type === 'linear') return q.max;
  if (type === 'text') return 0;
  const scores = (q.options ?? []).map((o) => Number(o.score) || 0);
  if (!scores.length) return 0;
  if (type === 'checkboxes') return scores.filter((s) => s > 0).reduce((a, b) => a + b, 0);
  return Math.max(...scores);
}

export function questionScore(q: Question, v: AnswerValue | undefined): number {
  if (v == null) return 0;
  const type = questionType(q);
  if (type === 'linear') {
    const n = Number(v);
    return Number.isFinite(n) ? Math.min(q.max, Math.max(q.min, n)) : 0;
  }
  if (type === 'text') return 0;
  const options = q.options ?? [];
  if (type === 'checkboxes') {
    if (!Array.isArray(v)) return 0;
    return v.reduce((sum, idx) => sum + (Number(options[idx]?.score) || 0), 0);
  }
  const idx = Number(v);
  return Number(options[idx]?.score) || 0;
}

// Human-readable answer for the admin Answers tab.
export function answerLabel(q: Question, v: AnswerValue | undefined): string {
  if (v == null) return 'Not answered';
  const type = questionType(q);
  if (type === 'linear') {
    const n = Number(v);
    const label = n === q.min ? q.labels.left : n === q.max ? q.labels.right : n === Math.ceil((q.min + q.max) / 2) ? q.labels.center : '';
    return label ? `${n} / ${q.max} — ${label}` : `${n} / ${q.max}`;
  }
  if (type === 'text') return String(v) || '—';
  const options = q.options ?? [];
  if (type === 'checkboxes') {
    if (!Array.isArray(v) || !v.length) return 'None selected';
    return v.map((i) => options[i]?.label ?? `Option ${i + 1}`).join(', ');
  }
  return options[Number(v)]?.label ?? '—';
}

export function computeScores(config: ScorecardConfig, answers: Record<string, AnswerValue>) {
  const categoryScores: CategoryScore[] = config.categories.map((cat) => {
    const qs = config.questions.filter((q) => q.category === cat.key);
    const score = qs.reduce((sum, q) => sum + questionScore(q, answers[q.id]), 0);
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
