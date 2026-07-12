// What the user tells the AI Builder before generation. Collected by the
// wizard in two steps (branding, then scorecard description) and passed to
// every generation call.
export interface AiBrief {
  businessName: string;
  scorecardName: string;
  description: string; // what the scorecard is about / what it should do
  audience: string; // who will take it
  outcome: string; // what the score should measure / what a high score means
  cta: string; // what should happen after the results (book a call, etc.)
  tone: string; // writing style
  categoriesCount: number; // 2–6
  questionsCount: number; // approximate total
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
}

export const TONES = ['Professional', 'Friendly', 'Bold', 'Reassuring', 'Playful'] as const;

export interface AiStrategy {
  title: string;
  subtitle: string;
  promise: string;
  categories: { key: string; label: string; description: string }[];
  tiers: { key: 'low' | 'medium' | 'high'; label: string; summary: string }[];
  ctaHeading: string;
  ctaButton: string;
}

export interface AiContent {
  landing: {
    heroTitle: string;
    heroSubtitle: string;
    heroBody: string;
    heroBullets: string[];
    heroCta: string;
    howItWorksLabel: string;
    howItWorksTitle: string;
    howItWorksBody: string;
    categoryCards: { categoryKey: string; title: string; body: string }[];
    bottomTitle: string;
    bottomBody: string;
    bottomCta: string;
    bottomNote: string;
    leadFormHeading: string;
  };
  questions: {
    id: string;
    categoryKey: string;
    text: string;
    labels: { left: string; center: string; right: string };
  }[];
}

export interface AiResults {
  tierIntros: { tier: 'low' | 'medium' | 'high'; headline: string; body: string[] }[];
  categoryHeading: string;
  categorySub: string[];
  categoryTexts: { categoryKey: string; tier: 'low' | 'medium' | 'high'; text: string }[];
  cta: {
    heading: string;
    leftTitle: string;
    leftBody: string;
    leftButton: string;
    rightTitle: string;
    rightBody: string;
    rightButton: string;
  };
  share: string;
}

export interface AiPdf {
  coverTitle: string;
  howToReadTitle: string;
  howToRead: string[];
  keysHeading: string;
  categories: {
    categoryKey: string;
    tier: 'low' | 'medium' | 'high';
    intro: string[];
    exampleTitle: string;
    example: string[];
  }[];
  closingTitle: string;
  closing: string[];
}

export interface AiGeneration {
  strategy: AiStrategy;
  content: AiContent;
  results: AiResults;
  pdf: AiPdf;
}
