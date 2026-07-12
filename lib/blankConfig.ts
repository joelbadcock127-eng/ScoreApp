import { ScorecardConfig } from './types';

// Starter content for a freshly created scorecard. Built from scratch —
// deliberately NOT derived from the AI Opportunity scorecard, so nothing from
// that scorecard leaks into new ones. Every field is generic placeholder copy
// the owner replaces in the editors (or that the AI Builder fills in).
export function blankConfig(name: string): ScorecardConfig {
  const tierText = {
    low: 'Write the copy your lower-scoring visitors should read here.',
    medium: 'Write the copy your mid-scoring visitors should read here.',
    high: 'Write the copy your top-scoring visitors should read here.',
  };

  return {
    title: name,
    copyright: '© Copyright',
    branding: {
      logoUrl: '',
      iconUrl: '',
      primaryColor: '#1c78fe',
      secondaryColor: '#152042',
    },
    shareAppearance: { title: name, description: '', image: '' },
    notifications: {
      enabled: false,
      recipients: '',
      subject: '{first_name} {last_name} started the {scorecard_name}',
      content:
        '<p><b>New lead</b></p><p>Name: {first_name} {last_name}<br>Email: {email}<br>Status: {status}<br>Score: {score}%</p>',
    },
    resultEmail: {
      enabled: false,
      fromAddress: '',
      fromName: '',
      replyTo: '',
      subject: '{scorecard_name} Report',
      content:
        '<p>Dear {first_name},</p><p>Thank you for completing {scorecard_name}. You scored {score}%.</p><p>You can view your results and download your full PDF report here: {results_link}</p>',
    },
    landing: {
      heroImage: '',
      sectionOrder: ['banner', 'categories', 'cta'],
      heroCtaAction: { type: 'lead-form' },
      bottomCtaAction: { type: 'lead-form' },
      imagePosition: 'right',
      categoriesPerRow: 2,
      showHeader: false,
      showFooter: true,
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
    },
    leadForm: {
      heading: 'Enter your details below to start the scorecard',
      fields: [
        { key: 'first_name', label: 'First name', type: 'text', required: true, enabled: true },
        { key: 'last_name', label: 'Last name', type: 'text', required: true, enabled: true },
        { key: 'email', label: 'Email', type: 'email', required: true, enabled: true },
        { key: 'business', label: 'Business', type: 'text', required: false, enabled: true },
        {
          key: 'contact_opt_in',
          label: 'Please tick if you would like to be contacted about your results',
          type: 'checkbox',
          required: false,
          enabled: true,
        },
      ],
      submitLabel: 'Start',
    },
    tiers: [
      { key: 'low', label: 'Low', color: '#d41f34', from: 0, to: 50 },
      { key: 'medium', label: 'Medium', color: '#f26527', from: 51, to: 79 },
      { key: 'high', label: 'High', color: '#66bc46', from: 80, to: 100 },
    ],
    categories: [{ key: 'general', label: 'General' }],
    questions: [1, 2, 3].map((n) => ({
      id: `q${n}`,
      category: 'general',
      type: 'scale' as const,
      text: `Question ${n} — replace this with your own question`,
      min: 1,
      max: 5,
      start: 3,
      labels: { left: 'Not at all', center: 'Somewhat', right: 'Absolutely' },
    })),
    results: {
      thanksPrefix: 'Thank you for taking the',
      overallHeading: 'Your Overall Score',
      tierIntros: {
        low: { headline: 'There’s a big opportunity here.', body: [tierText.low] },
        medium: { headline: 'You’re on the right track.', body: [tierText.medium] },
        high: { headline: 'You’re in great shape.', body: [tierText.high] },
      },
      categoryScoresNote: '',
      emailedNote: 'Your full report has been emailed to',
      changeEmailLabel: 'Change email address',
      categoryHeading: 'Your score by area',
      categorySub: ['Lower scores show where there is the most room to improve.'],
      categoryTexts: { general: { ...tierText } },
      cta: {
        heading: 'Next steps?',
        leftTitle: 'View Your Detailed Report',
        leftBody: 'Tell the reader what their personalised report contains and why it is worth opening.',
        leftButton: 'Open my Report',
        rightTitle: 'Get in touch',
        rightBody: 'Invite the reader to take the next step with you — a call, a review or a follow-up.',
        rightButton: 'Contact us',
      },
      share: 'Share this scorecard with your network.',
      changeDetails: {
        heading: 'Update your details',
        subheading: 'We’ll resend your results to your updated email address',
        submitLabel: 'Submit',
      },
    },
    pdf: {
      coverTitle: `${name} Report`,
      howToReadTitle: 'How to read your report',
      howToRead: [
        'Explain how to interpret the scores in this report.',
        'Add more detail about what low, medium and high scores mean for the reader.',
      ],
      keysHeading: 'We have scored you against the following areas:',
      categories: {
        general: {
          low: { intro: [tierText.low], exampleTitle: 'Example', example: ['Add a practical example here.'] },
          medium: { intro: [tierText.medium], exampleTitle: 'Example', example: ['Add a practical example here.'] },
          high: { intro: [tierText.high], exampleTitle: 'Example', example: ['Add a practical example here.'] },
        },
      },
      closingTitle: 'What to do next',
      closing: ['Tell the reader what to do next with their results.'],
      images: {},
      hidden: [],
    },
  };
}
