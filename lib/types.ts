export type TierKey = string;

export interface Tier {
  key: TierKey;
  label: string;
  color: string;
  from: number; // score % from
  to: number; // score % to
}

export interface LeadFormField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'checkbox';
  required: boolean;
  enabled: boolean;
}

export interface Question {
  id: string;
  category: string;
  text: string;
  min: number;
  max: number;
  start: number;
  labels: { left: string; center: string; right: string };
}

export interface Category {
  key: string;
  label: string;
}

export interface TierContent {
  headline: string;
  body: string[];
}

export interface Branding {
  logoUrl: string;
  iconUrl: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface PdfCategoryContent {
  intro: string[];
  exampleTitle: string;
  example: string[];
}

export interface PdfConfig {
  coverTitle: string;
  howToReadTitle: string;
  howToRead: string[];
  keysHeading: string;
  categories: Record<string, Record<TierKey, PdfCategoryContent>>;
  closingTitle: string;
  closing: string[];
}

export interface ScorecardConfig {
  title: string;
  copyright: string;
  branding: Branding;
  pdf: PdfConfig;
  landing: {
    heroTitle: string;
    heroSubtitle: string;
    heroBody: string;
    heroBullets: string[];
    heroCta: string;
    howItWorksLabel: string;
    howItWorksTitle: string;
    howItWorksBody: string;
    categoryCards: { key: string; title: string; body: string; image: string }[];
    bottomTitle: string;
    bottomBody: string;
    bottomCta: string;
    bottomNote: string;
  };
  leadForm: {
    heading: string;
    fields: LeadFormField[];
    submitLabel: string;
  };
  tiers: Tier[];
  categories: Category[];
  questions: Question[];
  results: {
    thanksPrefix: string;
    overallHeading: string;
    tierIntros: Record<TierKey, TierContent>;
    categoryScoresNote: string;
    emailedNote: string;
    changeEmailLabel: string;
    categoryHeading: string;
    categorySub: string[];
    categoryTexts: Record<string, Record<TierKey, string>>;
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
    changeDetails: {
      heading: string;
      subheading: string;
      submitLabel: string;
    };
  };
}

export interface CategoryScore {
  key: string;
  label: string;
  score: number;
  max: number;
  percent: number;
}

export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  business: string;
  contact_opt_in: boolean;
  answers: Record<string, number>;
  score_total: number | null;
  score_max: number | null;
  overall_percent: number | null;
  category_scores: CategoryScore[] | null;
  status: string;
  duration_seconds: number | null;
  created_at: string;
  completed_at: string | null;
}
