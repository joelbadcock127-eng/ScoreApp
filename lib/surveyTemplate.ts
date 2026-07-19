import { ScorecardConfig } from './types';

// A complete, ready-to-send survey scorecard for table tennis / sports club
// committees: mode 'survey', so respondents get a thank-you page instead of
// scores, while the owner still sees internal triage scores and every answer.
// Everything here is standard builder-editable config — no special-case pages.
const placeholderTier = {
  low: 'Internal note: this respondent’s answers suggest the club is under real pressure here.',
  medium: 'Internal note: this respondent’s answers suggest the club is managing but stretched here.',
  high: 'Internal note: this respondent’s answers suggest the club is in good shape here.',
};

export function clubSurveyConfig(name: string): ScorecardConfig {
  return {
    title: name,
    copyright: '© Copyright',
    mode: 'survey',
    branding: {
      logoUrl: '',
      iconUrl: '',
      primaryColor: '#1c78fe',
      secondaryColor: '#152042',
    },
    shareAppearance: {
      title: name,
      description:
        'A 3-minute survey on what it really takes to run a table tennis club — volunteers, admin, money and growth. Add your club’s voice and receive the national summary.',
      image: '',
    },
    notifications: {
      enabled: true,
      recipients: '',
      subject: '{first_name} {last_name} completed the {scorecard_name}',
      content:
        '<p><b>New survey response</b></p><p>Name: {first_name} {last_name}<br>Email: {email}</p><p>Their answers:</p>{answers_summary}',
    },
    resultEmail: {
      enabled: true,
      fromAddress: '',
      fromName: '',
      replyTo: '',
      subject: 'Thanks {first_name} — your {scorecard_name} responses',
      content:
        '<p>Hi {first_name},</p>' +
        '<p>Thanks for taking a few minutes to complete the {scorecard_name} — your responses have been recorded.</p>' +
        '<p>For your records, here’s what you told us:</p>' +
        '{answers_summary}' +
        '<p>We’ll email you the summary of results from clubs across the country once responses are in. ' +
        'And if any of the jobs above are ones you’d like off your plate sooner, just reply to this email — happy to chat.</p>',
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
      heroTitle: 'The Table Tennis Club Pulse Check',
      heroSubtitle: '12 quick questions about what it really takes to run your club',
      heroBody:
        'Table tennis in Australia runs on committee volunteers — and at most clubs, a handful of people carry the registrations, the fees, the fixtures and the paperwork. This short survey is building a picture of where that load sits across clubs. Tell us how it looks at yours, and we’ll send you the summary so you can see how other clubs handle the same jobs.',
      heroBullets: [
        'Takes about 3 minutes',
        'Results shared back with every club that takes part',
        'Written for committee members — presidents, secretaries, treasurers',
      ],
      heroCta: 'Start the survey',
      howItWorksLabel: 'What we ask about',
      howItWorksTitle: 'Four pressure points every committee knows',
      howItWorksBody:
        'Every question comes from the realities of running a club: the reliance on one or two key people, the admin that eats up evenings, the money jobs nobody loves, and keeping members coming through the door.',
      categoryCards: [
        {
          key: 'people',
          title: 'Volunteers & key people',
          body: 'How much rests on one or two sets of shoulders — and what happens when they need a break.',
          image: '/images/card-4.png',
        },
        {
          key: 'admin',
          title: 'Admin & time',
          body: 'Registrations, fixtures, minutes and newsletters — where the volunteer hours actually go.',
          image: '/images/card-3.png',
        },
        {
          key: 'money',
          title: 'Money & funding',
          body: 'Collecting fees, chasing grants and knowing where the club stands financially.',
          image: '/images/card-2.png',
        },
        {
          key: 'growth',
          title: 'Members & growth',
          body: 'Membership trends, junior pathways and what’s working at growing clubs.',
          image: '/images/card-1.png',
        },
      ],
      bottomTitle: 'Add your club’s voice',
      bottomBody:
        'The more clubs take part, the more useful the picture becomes. Results are reported in aggregate — no individual club is singled out — and every participating club receives the summary.',
      bottomCta: 'Take the survey',
      bottomNote: 'About 3 minutes — one response per club is plenty',
    },
    leadForm: {
      heading: 'A few details so we can send you the results summary',
      fields: [
        { key: 'first_name', label: 'First name', type: 'text', required: true, enabled: true },
        { key: 'last_name', label: 'Last name', type: 'text', required: true, enabled: true },
        { key: 'email', label: 'Email', type: 'email', required: true, enabled: true },
        { key: 'business', label: 'Club name', type: 'text', required: true, enabled: true },
        {
          key: 'contact_opt_in',
          label: 'Happy to be contacted about the survey results',
          type: 'checkbox',
          required: false,
          enabled: true,
        },
      ],
      submitLabel: 'Start the survey',
    },
    // Internal triage only — respondents never see tiers in survey mode.
    tiers: [
      { key: 'low', label: 'Under pressure', color: '#d41f34', from: 0, to: 40 },
      { key: 'medium', label: 'Stretched', color: '#f26527', from: 41, to: 70 },
      { key: 'high', label: 'Healthy', color: '#66bc46', from: 71, to: 100 },
    ],
    categories: [
      { key: 'people', label: 'Volunteers & Key People' },
      { key: 'admin', label: 'Admin & Time' },
      { key: 'money', label: 'Money & Funding' },
      { key: 'growth', label: 'Members & Growth' },
    ],
    questionsPage: {
      header: { show: true, align: 'center', maxWidth: 250, topMargin: 13, bottomMargin: 13 },
      questions: {
        align: 'center',
        showBack: true,
        showCategory: true,
        optionTextColor: '#152042',
        buttonColor: '#1c78fe',
        questionTextColor: '#152042',
        backgroundColor: '#ffffff',
      },
      progress: { show: true },
      footer: { show: false },
    },
    questions: [
      // Volunteers & key people
      {
        id: 'q1',
        category: 'people',
        type: 'radio',
        required: true,
        text: 'How much does your club rely on one or two key people to keep everything running?',
        min: 1, max: 5, start: 3,
        labels: { left: '', center: '', right: '' },
        options: [
          { label: 'Everything would stop without them', score: 1 },
          { label: 'They carry most of it, others help a bit', score: 2 },
          { label: 'The load is shared, but they’d be hard to replace', score: 3 },
          { label: 'We could hand things over smoothly', score: 5 },
        ],
      },
      {
        id: 'q2',
        category: 'people',
        type: 'buttons',
        required: true,
        text: 'If your secretary or treasurer stepped away tomorrow, how quickly could someone take over?',
        min: 1, max: 5, start: 3,
        labels: { left: '', center: '', right: '' },
        options: [
          { label: 'Within a week — it’s all documented', score: 5 },
          { label: 'Within a season, with some pain', score: 3 },
          { label: 'Honestly, we don’t know', score: 1 },
        ],
      },
      {
        id: 'q3',
        category: 'people',
        type: 'scale',
        text: 'How is your committee travelling for energy right now?',
        min: 1, max: 5, start: 3,
        labels: { left: 'Running on fumes', center: 'Managing, but stretched', right: 'Fresh and well supported' },
      },
      // Admin & time
      {
        id: 'q4',
        category: 'admin',
        type: 'checkboxes',
        required: true,
        instruction: 'Tick all that apply',
        text: 'Which jobs soak up the most volunteer time at your club?',
        min: 1, max: 5, start: 3,
        labels: { left: '', center: '', right: '' },
        options: [
          { label: 'Registrations & memberships', score: 0 },
          { label: 'Chasing fees & payments', score: 0 },
          { label: 'Fixtures, results & grading', score: 0 },
          { label: 'Grant applications & reporting', score: 0 },
          { label: 'Newsletters, website & social media', score: 0 },
          { label: 'Venue & equipment bookings', score: 0 },
          { label: 'Committee paperwork — minutes, agendas, compliance', score: 0 },
        ],
      },
      {
        id: 'q5',
        category: 'admin',
        type: 'radio',
        required: true,
        text: 'How are your membership records kept?',
        min: 1, max: 5, start: 3,
        labels: { left: '', center: '', right: '' },
        options: [
          { label: 'Paper, memory, or one person’s laptop', score: 1 },
          { label: 'Spreadsheets that mostly work', score: 3 },
          { label: 'A proper system, but only one person can drive it', score: 4 },
          { label: 'A system the whole committee can use', score: 5 },
        ],
      },
      {
        id: 'q6',
        category: 'admin',
        type: 'scale',
        text: 'Out of every 10 hours your committee puts in, how much goes to paperwork rather than actual table tennis?',
        min: 1, max: 5, start: 3,
        labels: { left: 'Almost all paperwork', center: 'About half and half', right: 'Mostly table tennis' },
      },
      // Money & funding
      {
        id: 'q7',
        category: 'money',
        type: 'radio',
        required: true,
        text: 'How does collecting fees and memberships actually go each season?',
        min: 1, max: 5, start: 3,
        labels: { left: '', center: '', right: '' },
        options: [
          { label: 'We chase people for months', score: 1 },
          { label: 'Most pay on time, some need chasing', score: 3 },
          { label: 'Smooth — it mostly takes care of itself', score: 5 },
        ],
      },
      {
        id: 'q8',
        category: 'money',
        type: 'buttons',
        required: true,
        text: 'Do you know, today, whether the club will be better or worse off financially this year?',
        min: 1, max: 5, start: 3,
        labels: { left: '', center: '', right: '' },
        options: [
          { label: 'Yes — we have clear, current numbers', score: 5 },
          { label: 'Roughly', score: 3 },
          { label: 'We’ll find out at the AGM', score: 1 },
        ],
      },
      // Members & growth
      {
        id: 'q9',
        category: 'growth',
        type: 'radio',
        required: true,
        text: 'Which best describes your membership over the last three seasons?',
        min: 1, max: 5, start: 3,
        labels: { left: '', center: '', right: '' },
        options: [
          { label: 'Growing', score: 5 },
          { label: 'Holding steady', score: 3 },
          { label: 'Slowly shrinking', score: 2 },
          { label: 'Shrinking fast', score: 1 },
        ],
      },
      {
        id: 'q10',
        category: 'growth',
        type: 'scale',
        text: 'How strong is your junior pathway right now?',
        min: 1, max: 5, start: 3,
        labels: { left: 'No juniors coming through', center: 'A few, but patchy', right: 'Strong and growing' },
      },
      // Open answers — often the most valuable part of a survey
      {
        id: 'q11',
        category: 'admin',
        type: 'text',
        required: true,
        text: 'If you could hand one club job to someone (or something) else tomorrow, which job would it be?',
        min: 1, max: 5, start: 3,
        labels: { left: '', center: '', right: '' },
      },
      {
        id: 'q12',
        category: 'admin',
        type: 'text',
        required: false,
        instruction: 'Optional',
        text: 'Anything else about running the club you wish took less time?',
        min: 1, max: 5, start: 3,
        labels: { left: '', center: '', right: '' },
      },
    ],
    results: {
      thanksPrefix: 'Thanks for completing the',
      overallHeading: 'Overall',
      surveyThanks: {
        headline: 'Your responses have been recorded.',
        body: [
          'Every response builds a clearer picture of what it takes to keep a table tennis club running in Australia — and where the load sits heaviest.',
          'We’ll compile the results and email you the summary as soon as it’s ready, so you can see how your club compares with others juggling the same jobs.',
        ],
      },
      tierIntros: {
        low: { headline: 'Thanks for your honesty.', body: [placeholderTier.low] },
        medium: { headline: 'Thanks for taking part.', body: [placeholderTier.medium] },
        high: { headline: 'Thanks for taking part.', body: [placeholderTier.high] },
      },
      categoryScoresNote: '',
      emailedNote: 'A copy of your responses has been emailed to',
      changeEmailLabel: 'Change email address',
      categoryHeading: 'Where clubs feel it most',
      categorySub: ['Internal view — respondents never see these scores.'],
      categoryTexts: {
        people: { ...placeholderTier },
        admin: { ...placeholderTier },
        money: { ...placeholderTier },
        growth: { ...placeholderTier },
      },
      cta: {
        heading: 'While you’re here',
        leftTitle: 'Get the summary first',
        leftBody:
          'We send the results summary to every club that takes part. Take a second to check your details are right so it reaches you.',
        leftButton: 'Check my details',
        leftAction: { type: 'details' },
        rightTitle: 'Want the admin load lighter sooner?',
        rightBody:
          'We build simple tools that take club admin off volunteers’ plates — registrations, fee reminders, comms and more. If today’s questions hit close to home, we’d be glad to show you what that looks like.',
        rightButton: 'Get in touch',
        rightAction: { type: 'url', url: 'https://accesoai.com.au' },
      },
      share: 'Know another club committee whose voice belongs in this? Share the survey with them.',
      changeDetails: {
        heading: 'Update your details',
        subheading: 'We’ll send the results summary to your updated email address',
        submitLabel: 'Update',
      },
    },
    resultsPage: {
      order: ['speedChart', 'cta', 'share'],
      hidden: [],
      speedChart: { chartPosition: 'right', showOverall: false, scoreFormat: 'percent', showTiers: false },
      categories: { itemsPerRow: 2, showScores: false, showTier: false },
      share: { facebook: true, twitter: false, linkedin: true, background: '#152042', linksColor: '#ffffff' },
    },
    // Required by the config shape; the respondent-facing report is disabled in
    // survey mode, so this stays placeholder until the owner ever needs it.
    pdf: {
      coverTitle: `${name} — Summary`,
      howToReadTitle: 'How to read this report',
      howToRead: ['Surveys don’t send respondents a PDF report. This section is unused while the scorecard is in survey mode.'],
      keysHeading: 'Survey themes:',
      categories: {
        people: {
          low: { intro: [placeholderTier.low], exampleTitle: 'Example', example: ['—'] },
          medium: { intro: [placeholderTier.medium], exampleTitle: 'Example', example: ['—'] },
          high: { intro: [placeholderTier.high], exampleTitle: 'Example', example: ['—'] },
        },
        admin: {
          low: { intro: [placeholderTier.low], exampleTitle: 'Example', example: ['—'] },
          medium: { intro: [placeholderTier.medium], exampleTitle: 'Example', example: ['—'] },
          high: { intro: [placeholderTier.high], exampleTitle: 'Example', example: ['—'] },
        },
        money: {
          low: { intro: [placeholderTier.low], exampleTitle: 'Example', example: ['—'] },
          medium: { intro: [placeholderTier.medium], exampleTitle: 'Example', example: ['—'] },
          high: { intro: [placeholderTier.high], exampleTitle: 'Example', example: ['—'] },
        },
        growth: {
          low: { intro: [placeholderTier.low], exampleTitle: 'Example', example: ['—'] },
          medium: { intro: [placeholderTier.medium], exampleTitle: 'Example', example: ['—'] },
          high: { intro: [placeholderTier.high], exampleTitle: 'Example', example: ['—'] },
        },
      },
      closingTitle: 'Next steps',
      closing: ['Unused in survey mode.'],
      images: {},
      hidden: [],
    },
  };
}
