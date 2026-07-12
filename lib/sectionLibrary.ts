import { ExtraSection } from './types';

export interface SectionPreset {
  key: string;
  label: string;
  make: () => Omit<ExtraSection, 'id'>;
}

export interface SectionCategory {
  key: string;
  label: string;
  blurb: string;
  presets: SectionPreset[];
}

// The "Add a section" gallery: one carefully designed, fully editable section
// per type. Every piece of text inside is edited inline in the preview; images,
// button actions and video URLs live in the right-hand panel.
export const SECTION_LIBRARY: SectionCategory[] = [
  {
    key: 'banners',
    label: 'Banners',
    blurb: 'A bold, dark hero band with a headline, supporting copy, call to action and image.',
    presets: [
      {
        key: 'banner',
        label: 'Spotlight banner',
        make: () => ({
          type: 'banner2',
          title: 'Discover what’s holding your business back',
          body: 'Benchmark yourself against businesses like yours and get a personalised report with the exact next steps to grow — in under four minutes.',
          button: 'Start the Scorecard',
          action: { type: 'lead-form' },
          image: '/images/hero-report.png',
        }),
      },
    ],
  },
  {
    key: 'forms',
    label: 'On page forms',
    blurb: 'Capture leads right on the page — no popup needed.',
    presets: [
      {
        key: 'form',
        label: 'Inline lead form',
        make: () => ({
          type: 'form',
          title: 'Get your personalised report',
          body: 'Enter your details and start the scorecard right here. Your results and tailored recommendations arrive the moment you finish.',
        }),
      },
    ],
  },
  {
    key: 'ctas',
    label: 'Call to actions',
    blurb: 'A boxed, high-contrast prompt that moves visitors to start.',
    presets: [
      {
        key: 'cta',
        label: 'Boxed call to action',
        make: () => ({
          type: 'cta2',
          title: 'Ready to see your score?',
          body: 'Take the free 4-minute assessment and get a personalised action plan, instantly.',
          button: 'Get Started',
          action: { type: 'lead-form' },
        }),
      },
    ],
  },
  {
    key: 'testimonials',
    label: 'Testimonials',
    blurb: 'Three five-star cards with quote, name and role — all editable.',
    presets: [
      {
        key: 'testimonials',
        label: 'Five-star cards',
        make: () => ({
          type: 'testimonials',
          title: 'Loved by business owners',
          body: 'Here’s what people say after taking the scorecard.',
          items: [
            {
              title: 'Harriette Bedell',
              meta: 'CEO, The Ridge Company',
              body: 'Eye-opening. In four minutes I knew exactly where to focus next — the report alone is worth it.',
            },
            {
              title: 'Marcus Chen',
              meta: 'Founder, Northbeam',
              body: 'Simple, fast and surprisingly accurate. We found two quick wins in the first week.',
            },
            {
              title: 'Sofia Reyes',
              meta: 'Director, Brightside Studio',
              body: 'A brilliant conversation starter with my team about where to improve. Highly recommended.',
            },
          ],
        }),
      },
    ],
  },
  {
    key: 'categories',
    label: 'Categories',
    blurb: 'Show the key areas visitors will be scored against.',
    presets: [
      {
        key: 'categories',
        label: 'Score areas grid',
        make: () => ({
          type: 'categories2',
          title: 'You’ll be scored across these key areas',
          body: 'Every question maps to one of the areas below, so your report shows exactly where to focus first.',
        }),
      },
    ],
  },
  {
    key: 'videos',
    label: 'Videos',
    blurb: 'A YouTube or Vimeo video beside your pitch and call to action.',
    presets: [
      {
        key: 'video',
        label: 'Video with text',
        make: () => ({
          type: 'video',
          title: 'See how it works',
          body: 'Watch a quick walkthrough of the scorecard and the personalised report you’ll receive at the end.',
          button: 'Get Started',
          action: { type: 'lead-form' },
          url: '',
        }),
      },
    ],
  },
  {
    key: 'content',
    label: 'Content',
    blurb: 'A classic text-and-image block for telling your story.',
    presets: [
      {
        key: 'content',
        label: 'Text with image',
        make: () => ({
          type: 'content',
          title: 'Why take the scorecard?',
          body: 'Most businesses guess at what to improve next. The scorecard replaces guesswork with data: you’ll see how you compare on the things that actually drive growth, and leave with a clear, prioritised list of next steps.',
          image: '/images/card-1.png',
        }),
      },
    ],
  },
  {
    key: 'faq',
    label: 'FAQ',
    blurb: 'An accordion of the questions visitors ask before starting.',
    presets: [
      {
        key: 'faq',
        label: 'Accordion',
        make: () => ({
          type: 'faq',
          title: 'Frequently asked questions',
          items: [
            {
              title: 'How long does it take?',
              body: 'Most people finish in under four minutes — and your results appear instantly.',
            },
            {
              title: 'How is my score calculated?',
              body: 'Your answers are scored across each category and combined into an overall percentage, so you can see both the big picture and the detail.',
            },
            {
              title: 'What do I get at the end?',
              body: 'A personalised results page and a downloadable PDF report with recommendations tailored to your answers.',
            },
            {
              title: 'Is my data safe?',
              body: 'Yes — your answers are only used to build your report and are never shared with third parties.',
            },
          ],
        }),
      },
    ],
  },
  {
    key: 'advanced',
    label: 'Advanced',
    blurb: 'Drop in your own HTML for anything the gallery doesn’t cover.',
    presets: [
      {
        key: 'html',
        label: 'Custom HTML',
        make: () => ({
          type: 'html',
          html: '<div style="padding:40px;text-align:center;border:1px dashed #cbd5e1;border-radius:12px;">Your custom HTML here</div>',
        }),
      },
    ],
  },
];
