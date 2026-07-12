import { defaultConfig } from './defaultConfig';
import { ScorecardConfig } from './types';

// Starter content for a freshly created scorecard: same structure as the
// default (so every editor works immediately) with generic placeholder copy.
export function blankConfig(name: string): ScorecardConfig {
  const c: ScorecardConfig = JSON.parse(JSON.stringify(defaultConfig));
  const tierText = {
    low: 'Write the copy your lower-scoring visitors should read here.',
    medium: 'Write the copy your mid-scoring visitors should read here.',
    high: 'Write the copy your top-scoring visitors should read here.',
  };

  c.title = name;
  c.landing = {
    ...c.landing,
    heroTitle: name,
    heroSubtitle: 'Answer a few questions and get your personalised score',
    heroBody:
      'Use this space to explain what your scorecard measures, who it is for and what people will learn from their results.',
    heroBullets: ['It only takes a few minutes', 'It’s completely free', 'Receive customised results instantly'],
    heroCta: 'Start the Scorecard',
    howItWorksLabel: 'How it works',
    howItWorksTitle: 'What we measure',
    howItWorksBody: 'Describe the areas your scorecard assesses and why they matter to your audience.',
    categoryCards: [
      {
        key: 'general',
        title: 'General',
        body: 'Describe this scoring category and what a visitor will learn about it.',
        image: '/images/card-1.png',
      },
    ],
    bottomTitle: 'Ready to see your score?',
    bottomBody: 'Wrap up with a short, punchy reason to start the scorecard now.',
    bottomCta: 'Get Started',
    bottomNote: 'It’s free and only takes a few minutes',
  };
  c.categories = [{ key: 'general', label: 'General' }];
  c.questions = [1, 2, 3].map((n) => ({
    id: `q${n}`,
    category: 'general',
    type: 'scale' as const,
    text: `Question ${n} — replace this with your own question`,
    min: 1,
    max: 5,
    start: 3,
    labels: { left: 'Not at all', center: 'Somewhat', right: 'Absolutely' },
  }));
  c.results = {
    ...c.results,
    tierIntros: {
      low: { headline: 'There’s a big opportunity here.', body: [tierText.low] },
      medium: { headline: 'You’re on the right track.', body: [tierText.medium] },
      high: { headline: 'You’re in great shape.', body: [tierText.high] },
    },
    categoryTexts: { general: { ...tierText } },
  };
  c.pdf = {
    ...c.pdf,
    coverTitle: `${name} Report`,
    howToRead: [
      'Explain how to interpret the scores in this report.',
      'Add more detail about what low, medium and high scores mean for the reader.',
    ],
    categories: {
      general: {
        low: { intro: [tierText.low], exampleTitle: 'Example', example: ['Add a practical example here.'] },
        medium: { intro: [tierText.medium], exampleTitle: 'Example', example: ['Add a practical example here.'] },
        high: { intro: [tierText.high], exampleTitle: 'Example', example: ['Add a practical example here.'] },
      },
    },
    closing: ['Tell the reader what to do next with their results.'],
    images: {},
    hidden: [],
  };
  c.shareAppearance = { title: name, description: '', image: '' };
  return c;
}
