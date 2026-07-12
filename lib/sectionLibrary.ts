import { ExtraSection } from './types';

export interface SectionPreset {
  key: string;
  label: string;
  make: () => Omit<ExtraSection, 'id'>;
}

export interface SectionCategory {
  key: string;
  label: string;
  presets: SectionPreset[];
}

const LOREM =
  'Use this space to tell visitors more about your business, your scorecard and the value they’ll get from completing it.';

// The "Add a section" gallery: categories and design variants, mirroring the
// ScoreApp section library.
export const SECTION_LIBRARY: SectionCategory[] = [
  {
    key: 'banners',
    label: 'Banners',
    presets: [
      {
        key: 'banner-image-right',
        label: 'Image right',
        make: () => ({
          type: 'banner2',
          style: 'image-right',
          title: 'Take your business to the next level',
          body: LOREM,
          button: 'Get Started',
          action: { type: 'lead-form' },
          image: '/images/hero-report.png',
        }),
      },
      {
        key: 'banner-dark',
        label: 'Dark',
        make: () => ({
          type: 'banner2',
          style: 'dark',
          title: 'Take your business to the next level',
          body: LOREM,
          button: 'Get Started',
          action: { type: 'lead-form' },
        }),
      },
      {
        key: 'banner-image-left',
        label: 'Image left',
        make: () => ({
          type: 'banner2',
          style: 'image-left',
          title: 'Take your business to the next level',
          body: LOREM,
          button: 'Get Started',
          action: { type: 'lead-form' },
          image: '/images/hero-report.png',
        }),
      },
    ],
  },
  {
    key: 'forms',
    label: 'On page forms',
    presets: [
      {
        key: 'form-light',
        label: 'Simple form',
        make: () => ({
          type: 'form',
          style: 'light',
          title: 'Enter your details to get started',
          body: 'Start the scorecard right here — it only takes a few minutes.',
        }),
      },
      {
        key: 'form-dark',
        label: 'Dark form',
        make: () => ({
          type: 'form',
          style: 'dark',
          title: 'Enter your details to get started',
          body: 'Start the scorecard right here — it only takes a few minutes.',
        }),
      },
      {
        key: 'form-image',
        label: 'Form with image',
        make: () => ({
          type: 'form',
          style: 'image-right',
          title: 'Take your business to the next level',
          body: 'Enter your details below to start the scorecard.',
          image: '/images/hero-report.png',
        }),
      },
    ],
  },
  {
    key: 'ctas',
    label: 'Call to actions',
    presets: [
      {
        key: 'cta-light',
        label: 'Light',
        make: () => ({
          type: 'cta2',
          style: 'light',
          title: 'Uncover your strengths and weaknesses',
          body: 'Answer the questions and instantly see how you can improve.',
          button: 'Get Started',
          action: { type: 'lead-form' },
        }),
      },
      {
        key: 'cta-dark',
        label: 'Dark',
        make: () => ({
          type: 'cta2',
          style: 'dark',
          title: 'Uncover your strengths and weaknesses',
          body: 'Answer the questions and instantly see how you can improve.',
          button: 'Get Started',
          action: { type: 'lead-form' },
        }),
      },
      {
        key: 'cta-boxed',
        label: 'Boxed',
        make: () => ({
          type: 'cta2',
          style: 'boxed',
          title: 'Uncover your strengths and weaknesses',
          body: 'Answer the questions and instantly see how you can improve.',
          button: 'Get Started',
          action: { type: 'lead-form' },
        }),
      },
    ],
  },
  {
    key: 'testimonials',
    label: 'Testimonials',
    presets: [
      {
        key: 'testimonials-cards',
        label: 'Cards',
        make: () => ({
          type: 'testimonials',
          style: 'cards',
          title: 'Don’t just take our word for it — see what others have to say',
          items: [
            { title: 'Harriette Bedell', meta: 'CEO, The Ridge Company', body: 'This scorecard was eye-opening. In minutes I knew exactly where to focus next.' },
            { title: 'Marcus Chen', meta: 'Founder, Northbeam', body: 'Simple, fast and surprisingly accurate. The report alone is worth it.' },
          ],
        }),
      },
      {
        key: 'testimonials-dark',
        label: 'Dark quote',
        make: () => ({
          type: 'testimonials',
          style: 'dark',
          title: '',
          items: [
            { title: 'Harriette Bedell', meta: 'CEO, The Ridge Company', body: 'The scorecard puts it in perspective. If you want to become more visible, valuable and connected in your industry, this will give you your baseline.' },
          ],
        }),
      },
      {
        key: 'testimonials-grid',
        label: 'Grid',
        make: () => ({
          type: 'testimonials',
          style: 'grid',
          title: 'Customer testimonials',
          items: [
            { title: 'Jane Sanders', meta: 'Poolshop Co.', body: 'Loved how quick it was — and the recommendations were spot on.' },
            { title: 'Amir Patel', meta: 'Fieldworks', body: 'We found two quick wins in the first week after taking it.' },
            { title: 'Sofia Reyes', meta: 'Brightside Studio', body: 'A great conversation starter with my team about where to improve.' },
          ],
        }),
      },
    ],
  },
  {
    key: 'categories',
    label: 'Categories',
    presets: [
      {
        key: 'categories-light',
        label: 'Light grid',
        make: () => ({
          type: 'categories2',
          style: 'light',
          title: 'You’ll be scored against the following key areas:',
          body: '',
        }),
      },
      {
        key: 'categories-dark',
        label: 'Dark grid',
        make: () => ({
          type: 'categories2',
          style: 'dark',
          title: 'You’ll be scored against the following key areas:',
          body: '',
        }),
      },
    ],
  },
  {
    key: 'videos',
    label: 'Videos',
    presets: [
      {
        key: 'video-full',
        label: 'Full width',
        make: () => ({
          type: 'video',
          style: 'full',
          title: 'Want to know more?',
          body: 'Take a look at our latest video.',
          url: '',
        }),
      },
      {
        key: 'video-side',
        label: 'Video with text',
        make: () => ({
          type: 'video',
          style: 'side',
          title: 'Take your business to the next level',
          body: LOREM,
          button: 'Get Started',
          action: { type: 'lead-form' },
          url: '',
        }),
      },
    ],
  },
  {
    key: 'advanced',
    label: 'Advanced',
    presets: [
      {
        key: 'custom-html',
        label: 'Custom HTML',
        make: () => ({
          type: 'html',
          html: '<div style="padding:40px;text-align:center;border:1px dashed #cbd5e1;border-radius:12px;">Your custom HTML here</div>',
        }),
      },
    ],
  },
  {
    key: 'content',
    label: 'Content',
    presets: [
      {
        key: 'content-image',
        label: 'Text with image',
        make: () => ({
          type: 'content',
          style: 'image-right',
          title: 'How it works',
          body: LOREM,
          image: '/images/card-1.png',
        }),
      },
      {
        key: 'content-centered',
        label: 'Centered text',
        make: () => ({
          type: 'content',
          style: 'centered',
          title: '4 minutes is all you get',
          body: LOREM,
        }),
      },
    ],
  },
  {
    key: 'faq',
    label: 'FAQ',
    presets: [
      {
        key: 'faq-list',
        label: 'Accordion',
        make: () => ({
          type: 'faq',
          style: 'list',
          title: 'FAQs',
          items: [
            { title: 'How is my score calculated?', body: 'Your score is calculated from your answers across each category, weighted equally.' },
            { title: 'How long does it take to complete?', body: 'Most people finish in under four minutes.' },
            { title: 'Can I retake the quiz?', body: 'Yes — you can retake it at any time and compare your results.' },
          ],
        }),
      },
      {
        key: 'faq-two-col',
        label: 'Two columns',
        make: () => ({
          type: 'faq',
          style: 'two-col',
          title: 'FAQs',
          items: [
            { title: 'How is my score calculated?', body: 'Your score is calculated from your answers across each category, weighted equally.' },
            { title: 'How long does it take to complete?', body: 'Most people finish in under four minutes.' },
            { title: 'Are there any penalties for wrong answers?', body: 'No — there are no wrong answers, only honest ones.' },
            { title: 'Can I share my results?', body: 'Yes, your results page has share buttons built in.' },
          ],
        }),
      },
    ],
  },
];
