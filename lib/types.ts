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

// Answer formats supported by the questions editor. Existing configs without a
// type are treated as 'scale' (the original 1-5 linear scale).
export type QuestionType = 'scale' | 'yes_no' | 'buttons' | 'checkboxes' | 'radio' | 'text';

export interface QuestionOption {
  label: string;
  score: number;
}

export interface Question {
  id: string;
  category: string;
  type?: QuestionType;
  text: string;
  instruction?: string;
  required?: boolean;
  min: number;
  max: number;
  start: number;
  labels: { left: string; center: string; right: string };
  options?: QuestionOption[];
}

export interface Category {
  key: string;
  label: string;
  description?: string;
  icon?: string;
}

// Layout/styling for the questions flow page, edited via the Sections rail.
export interface QuestionsPageConfig {
  header: {
    show: boolean;
    align: 'left' | 'center' | 'right';
    maxWidth: number;
    topMargin: number;
    bottomMargin: number;
  };
  questions: {
    align: 'left' | 'center' | 'right';
    showBack: boolean;
    showCategory: boolean;
    optionTextColor: string;
    buttonColor: string;
    questionTextColor: string;
    backgroundColor: string;
  };
  progress: { show: boolean };
  footer: { show: boolean };
}

export interface TierContent {
  headline: string;
  body: string[];
}

// Where a call-to-action button takes the visitor.
export interface ButtonAction {
  type: 'lead-form' | 'page' | 'url' | 'report' | 'details';
  page?: 'landing' | 'quiz' | 'results';
  url?: string;
}

export interface ShareAppearanceConfig {
  title: string;
  description: string;
  image: string;
}

export interface NotificationsConfig {
  enabled: boolean;
  recipients: string; // comma separated
  subject: string;
  content: string; // rich html with {merge_fields}
}

export interface ResultEmailConfig {
  enabled: boolean;
  fromAddress: string;
  fromName: string;
  replyTo: string;
  subject: string;
  content: string; // rich html with {merge_fields}
}

export interface Branding {
  logoUrl: string;
  iconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  // Theme extras (edited via the Theme rail in the editors)
  backgroundColor?: string;
  headingTextColor?: string;
  bodyTextColor?: string;
  headingFont?: string;
  headingSize?: number;
  bodyFont?: string;
  bodySize?: number;
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
  // Editor-managed extras (all optional so existing configs keep working)
  images?: {
    cover?: string;
    howToRead?: string;
    categories?: Record<string, string>;
    closing?: string;
  };
  panel?: {
    background: string;
    buttonColor: string;
    imagePosition: 'left' | 'right';
  };
  footerText?: string;
  hidden?: string[]; // page keys: cover | howToRead | keys | cat:<key> | closing
}

export interface ScorecardConfig {
  title: string;
  copyright: string;
  branding: Branding;
  pdf: PdfConfig;
  questionsPage?: QuestionsPageConfig;
  resultsPage?: ResultsPageConfig;
  shareAppearance?: ShareAppearanceConfig;
  notifications?: NotificationsConfig;
  resultEmail?: ResultEmailConfig;
  landing: {
    heroImage?: string;
    imagePosition?: 'left' | 'right';
    categoriesPerRow?: number;
    showHeader?: boolean;
    showFooter?: boolean;
    sectionOrder?: ('banner' | 'categories' | 'cta')[];
    heroCtaAction?: ButtonAction;
    bottomCtaAction?: ButtonAction;
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
      leftAction?: ButtonAction;
      rightTitle: string;
      rightBody: string;
      rightButton: string;
      rightAction?: ButtonAction;
    };
    share: string;
    changeDetails: {
      heading: string;
      subheading: string;
      submitLabel: string;
    };
  };
}

// Results page layout/styling, edited via the results editor Sections rail.
export type ResultsSectionKey = 'speedChart' | 'categoryScores' | 'cta' | 'share';

export interface ResultsPageConfig {
  order: ResultsSectionKey[]; // middle sections, in render order (removed = deleted)
  hidden: string[]; // section keys currently hidden (header/footer included)
  speedChart: {
    chartPosition: 'left' | 'right';
    showOverall: boolean;
    scoreFormat: 'percent' | 'outof100';
    showTiers: boolean;
  };
  categories: {
    itemsPerRow: number;
    showScores: boolean;
    showTier: boolean;
  };
  share: {
    facebook: boolean;
    twitter: boolean;
    linkedin: boolean;
    background: string;
    linksColor: string;
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
