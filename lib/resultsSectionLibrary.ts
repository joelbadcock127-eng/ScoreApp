import { ExtraSection } from './types';

// "Add a section" gallery for the results editor: tailored score sections on
// top (the Overall score tab has six chart designs), the standard landing
// sections below.

export interface ResultsDesign {
  key: string;
  label: string;
  make: (scorecardTitle: string) => Omit<ExtraSection, 'id'>;
}

const seedText = (scorecardTitle: string) => ({
  title: `Thank you for taking the<br><b>${scorecardTitle}</b>`,
  body: 'Your answers put you in this score band. Below you’ll find what that means and the areas where a few focused changes will move the needle fastest.',
  showEmailNote: true,
  showTiers: true,
  format: 'percent' as const,
});

export const OVERALL_SCORE_DESIGNS: ResultsDesign[] = [
  {
    key: 'overall-score',
    label: 'Score card',
    make: (t) => ({ type: 'overall-score', chartPosition: 'right', ...seedText(t) }),
  },
  {
    key: 'radar',
    label: 'Radar chart',
    make: (t) => ({ type: 'radar', ...seedText(t) }),
  },
  {
    key: 'thermometer',
    label: 'Thermometer',
    make: (t) => ({ type: 'thermometer', ...seedText(t) }),
  },
  {
    key: 'traffic-light',
    label: 'Traffic light',
    make: (t) => ({ type: 'traffic-light', ...seedText(t) }),
  },
  {
    key: 'speed',
    label: 'Speed chart',
    make: (t) => ({ type: 'speed', chartPosition: 'right', ...seedText(t) }),
  },
  {
    key: 'donut',
    label: 'Donut chart',
    make: (t) => ({ type: 'donut', ...seedText(t) }),
  },
];

// Tabs in the gallery's TAILORED FOR RESULTS group. Only "Overall score" has
// designs so far; the rest re-add core sections or are on the roadmap.
export const TAILORED_TABS: { key: string; label: string; core?: 'categoryScores' | 'share'; soon?: boolean }[] = [
  { key: 'overall-score', label: 'Overall score' },
  { key: 'category-scores', label: 'Category scores', core: 'categoryScores' },
  { key: 'individual-category', label: 'Individual category', soon: true },
  { key: 'smart-sections', label: 'Smart Sections', soon: true },
  { key: 'answer-insights', label: 'Answer insights', soon: true },
  { key: 'share', label: 'Share', core: 'share' },
];
