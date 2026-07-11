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

export type QuestionType = 'linear' | 'yesno' | 'buttons' | 'checkboxes' | 'radio' | 'text';

export interface QuestionOption {
  label: string;
  score: number;
}

export interface Question {
  id: string;
  category: string;
  text: string; // plain text fallback
  textHtml?: string; // sanitized rich text (b/i/u only)
  type?: QuestionType; // defaults to 'linear'
  instruction?: string;
  showInstruction?: boolean;
  required?: boolean;
  min: number;
  max: number;
  start: number;
  labels: { left: string; center: string; right: string };
  options?: QuestionOption[]; // for choice types
}

// Answers: linear => number score, choice => option index, checkboxes => indices, text => string
export type AnswerValue = number | number[] | string;

export interface Category {
  key: string;
  label: string;
  description?: string;
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

export interface ThemeConfig {
  backgroundColor: string;
  headingColor: string;
  bodyColor: string;
  headingFont: string;
  bodyFont: string;
  headingSize: number;
  bodySize: number;
}

export interface QuestionsPageConfig {
  header: { show: boolean; logoMaxWidth: number; alignment: 'left' | 'center' | 'right' };
  questions: { align: 'left' | 'center'; showBack: boolean; showCategoryName: boolean };
  progress: { show: boolean };
  footer: { show: boolean };
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

export interface LandingConfig {
  header: { logoMaxWidth: number; alignment: 'left' | 'center' | 'right' };
  heroTitle: string; // sanitized rich text allowed
  heroSubtitle: string;
  heroBody: string;
  heroBullets: string[];
  heroCta: string;
  heroImage: string;
  heroImagePosition: 'left' | 'right';
  bannerBackground: string; // css color or 'transparent'
  howItWorksLabel: string;
  howItWorksTitle: string;
  howItWorksBody: string;
  categoriesPerRow: 1 | 2 | 4;
  categoryCards: { key: string; title: string; body: string; image: string }[];
  bottomTitle: string;
  bottomBody: string;
  bottomCta: string;
  bottomNote: string;
  footer: { show: boolean };
}

export interface ScorecardConfig {
  title: string;
  copyright: string;
  branding: Branding;
  theme: ThemeConfig;
  questionsPage: QuestionsPageConfig;
  pdf: PdfConfig;
  landing: LandingConfig;
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
  answers: Record<string, AnswerValue>;
  score_total: number | null;
  score_max: number | null;
  overall_percent: number | null;
  category_scores: CategoryScore[] | null;
  status: string;
  duration_seconds: number | null;
  created_at: string;
  completed_at: string | null;
}
