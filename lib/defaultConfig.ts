import { ScorecardConfig } from './types';

// All copy transcribed from the live ScoreApp scorecard (accesoai.scoreapp.com)
// and the reference screenshots in docs/reference-screenshots.
export const defaultConfig: ScorecardConfig = {
  title: 'The AI Opportunity Assessment',
  copyright: '© Copyright',
  landing: {
    heroTitle: 'Identify your biggest AI wins in minutes',
    heroSubtitle: 'Answer 21 questions and we’ll send you a personalised report',
    heroBody:
      'The Untapped AI Opportunity Assessment is a free, practical diagnostic designed for small business owners who want to find out where AI could quickly make life easier. In just a few minutes, you’ll pinpoint bottlenecks, wasted time, and missed revenue opportunities - without needing any technical knowledge or AI experience.',
    heroBullets: [
      'It takes just 3 minutes',
      'It’s completely free',
      'Receive customised results instantly',
    ],
    heroCta: 'Take the Scorecard',
    howItWorksLabel: 'How it works',
    howItWorksTitle: 'Assess Your Business in Four Key Areas',
    howItWorksBody:
      'AI adoption is moving fast. Almost 60% of small businesses are now reported to be using AI, more than double the level reported in 2025. This assessment shows where AI could give your business a practical edge before competitors use it to reply faster, follow up better, save time and look more organised. Get clear, tailored feedback across four key areas: Marketing & Sales, People, Finance and Systems.',
    categoryCards: [
      {
        key: 'marketing',
        title: 'Marketing and Sales',
        body: 'Identify where AI can save time, improve follow-up, and boost the consistency of your sales and marketing efforts.',
        image: '/images/card-1.png',
      },
      {
        key: 'people',
        title: 'People',
        body: 'See how automation can reduce reliance on key people, make your team more productive, and help knowledge flow across your business.',
        image: '/images/card-4.png',
      },
      {
        key: 'finance',
        title: 'Finance',
        body: 'Spot gaps in financial visibility and discover ways to automate reporting, invoicing, and cash flow insights.',
        image: '/images/card-2.png',
      },
      {
        key: 'systems',
        title: 'Systems',
        body: 'Find out where repetitive admin and manual processes are slowing you down - and how to create smoother, more scalable systems.',
        image: '/images/card-3.png',
      },
    ],
    bottomTitle: 'See Where AI Can Make the Biggest Difference',
    bottomBody:
      'Find your business’s most valuable AI opportunity in under 3 minutes. Get a tailored, practical results you can act on immediately.',
    bottomCta: 'Get Started',
    bottomNote: 'It’s free and only takes 2 minutes',
  },
  leadForm: {
    heading: 'Enter your details below to start the scorecard',
    fields: [
      { key: 'first_name', label: 'First name', type: 'text', required: true, enabled: true },
      { key: 'last_name', label: 'Last name', type: 'text', required: true, enabled: true },
      { key: 'email', label: 'Email', type: 'email', required: true, enabled: true },
      { key: 'business', label: 'Business', type: 'text', required: true, enabled: true },
      {
        key: 'contact_opt_in',
        label:
          'Please tick if you would like to be contacted to discuss your results and how best to implement AI into your business operations',
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
  categories: [
    { key: 'marketing', label: 'Marketing and Sales' },
    { key: 'people', label: 'People' },
    { key: 'finance', label: 'Finance' },
    { key: 'systems', label: 'Systems' },
  ],
  questions: [
    // Marketing and Sales
    {
      id: 'q1',
      category: 'marketing',
      text: 'Does your website consistently generate quality leads?',
      min: 1, max: 5, start: 3,
      labels: { left: 'No useful leads', center: 'Inconsistent', right: 'Strong lead flow' },
    },
    {
      id: 'q2',
      category: 'marketing',
      text: 'Are your social media posts consistent, high quality and effective in generating engagement and leads?',
      min: 1, max: 5, start: 3,
      labels: { left: 'Not active', center: 'Some engagement', right: 'Highly effective' },
    },
    {
      id: 'q3',
      category: 'marketing',
      text: 'How promptly and effectively are sales enquiries answered?',
      min: 1, max: 5, start: 3,
      labels: { left: 'Slow or missed', center: 'Depends on workload', right: 'Fast and consistent' },
    },
    {
      id: 'q4',
      category: 'marketing',
      text: 'How sensitive are your customers to price increases?',
      min: 1, max: 5, start: 3,
      labels: { left: 'Not sensitive', center: 'Mixed', right: 'Highly sensitive' },
    },
    {
      id: 'q5',
      category: 'marketing',
      text: 'Would it be an advantage to your business to be able to easily and cheaply create interesting marketing content?',
      min: 1, max: 5, start: 3,
      labels: { left: 'Little benefit', center: 'Useful', right: 'Major advantage' },
    },
    // People
    {
      id: 'q6',
      category: 'people',
      text: 'To what extent does your business rely on you or a small number of key employees?',
      min: 1, max: 5, start: 3,
      labels: { left: 'Heavy reliance', center: 'Some reliance', right: 'Low reliance' },
    },
    {
      id: 'q7',
      category: 'people',
      text: 'How easy would it be to recruit capable replacements for you or your key employees?',
      min: 1, max: 5, start: 3,
      labels: { left: 'Extremely difficult', center: 'Possible but hard', right: 'Relatively easy' },
    },
    {
      id: 'q8',
      category: 'people',
      text: 'How manageable are wages and associated employment costs for your business?',
      min: 1, max: 5, start: 3,
      labels: { left: 'Very concerning', center: 'Some pressure', right: 'Easily manageable' },
    },
    {
      id: 'q9',
      category: 'people',
      text: 'How many hours per week do you usually spend working in the business?',
      min: 1, max: 5, start: 3,
      labels: { left: 'Under 20', center: '31 to 40', right: '55+' },
    },
    {
      id: 'q10',
      category: 'people',
      text: 'Have you and your key employees undertaken training in how to use AI to improve efficiency and effectiveness?',
      min: 1, max: 5, start: 3,
      labels: { left: 'None', center: 'Some basics', right: 'Well developed' },
    },
    {
      id: 'q11',
      category: 'people',
      text: 'How efficiently can people find the information or answers they need without interrupting others, chasing something or delaying a task?',
      min: 1, max: 5, start: 3,
      labels: { left: 'Very inefficent', center: 'Somewhat', right: 'Very efficent' },
    },
    // Finance
    {
      id: 'q12',
      category: 'finance',
      text: 'Is the correct financial information provided to the right people at the right time?',
      min: 1, max: 5, start: 3,
      labels: { left: 'Often missing', center: 'Basic but manual', right: 'Consistently timely' },
    },
    {
      id: 'q13',
      category: 'finance',
      text: 'Is business profit sufficient to provide you with your desired lifestyle?',
      min: 1, max: 5, start: 3,
      labels: { left: 'Not at all', center: 'Somewhat', right: 'Comfortably' },
    },
    {
      id: 'q14',
      category: 'finance',
      text: 'How steady is the flow of the right kind of work?',
      min: 1, max: 5, start: 3,
      labels: { left: 'Highly unpredictable', center: 'Reasonably steady', right: 'Strong and predictable' },
    },
    // Systems
    {
      id: 'q15',
      category: 'systems',
      text: 'Does every customer receive the same great experience when they deal with your business?',
      min: 1, max: 5, start: 3,
      labels: { left: 'Varies greatly', center: 'Generally acceptable', right: 'Consistently excellent' },
    },
    {
      id: 'q16',
      category: 'systems',
      text: 'Is every key process documented, regularly updated and easily accessible?',
      min: 1, max: 5, start: 3,
      labels: { left: 'Mostly undocumented', center: 'Partly documented', right: 'Clear and current' },
    },
    {
      id: 'q17',
      category: 'systems',
      text: 'How reliable are your business processes at preventing mistakes that cost time, money or cause customer frustration?',
      min: 1, max: 5, start: 3,
      labels: { left: 'Unreliable', center: 'Somewhat reliable', right: 'Very reliable' },
    },
    {
      id: 'q18',
      category: 'systems',
      text: 'How effectively has your business reduced the amount of time spent on repetitive administration and manual data entry?',
      min: 1, max: 5, start: 3,
      labels: { left: 'Almost none', center: 'Some tasks', right: 'Almost completely' },
    },
    {
      id: 'q19',
      category: 'systems',
      text: 'Are notes from calls, meetings, visits or jobs always communicated clearly to the relevant employees?',
      min: 1, max: 5, start: 3,
      labels: { left: 'Often missed', center: 'Usually communicated', right: 'Consistently captured' },
    },
    {
      id: 'q20',
      category: 'systems',
      text: 'How often do customers or employees ask the same basic questions repeatedly?',
      min: 1, max: 5, start: 3,
      labels: { left: 'Almost never', center: 'Several times a week', right: 'Constantly' },
    },
    {
      id: 'q21',
      category: 'systems',
      text: 'Are customer communications proactive, including communication with past customers?',
      min: 1, max: 5, start: 3,
      labels: { left: 'Highly reactive', center: 'Some proactive contact', right: 'Highly proactive' },
    },
    {
      id: 'q22',
      category: 'systems',
      text: 'Do bottlenecks occur because one person must check, approve, rewrite or answer something?',
      min: 1, max: 5, start: 3,
      labels: { left: 'Constantly', center: 'Several times a week', right: 'Almost never' },
    },
    {
      id: 'q23',
      category: 'systems',
      text: 'Is there an easily accessible database containing all key business and customer information?',
      min: 1, max: 5, start: 3,
      labels: { left: 'No reliable source', center: 'Incomplete central records', right: 'Complete and searchable' },
    },
  ],
  results: {
    thanksPrefix: 'Thank you for taking the',
    overallHeading: 'Your Overall Score',
    tierIntros: {
      low: {
        headline: 'You have a major untapped AI opportunity.',
        body: [
          'Your score suggests your business may be losing a lot of time through repeat tasks, slow replies, manual follow up, customer chasing, or important information sitting in one person’s head. The upside is that the first improvements could be very visible.',
          'Do not try to automate everything at once. Start with the biggest bottleneck shown in your category scores below, then build one simple AI assisted system that saves time straight away.',
        ],
      },
      medium: {
        headline: 'You have clear AI quick wins.',
        body: [
          'Your score suggests there are parts of the business where time, follow up, customer updates, or repeat admin may be costing more than they should. You probably do not need a huge AI overhaul. You need a few practical improvements that remove friction and save time each week. Start with your lowest scoring category below. That is likely where AI can make the fastest and most useful difference.',
        ],
      },
      high: {
        headline: 'You have a focused AI opportunity.',
        body: [
          'Your score suggests your business already has some strong habits in place, or fewer obvious repeat tasks slowing things down. AI could still help, but the best move is not to change everything. Look for one small, high value task that happens often, such as answering common questions, writing repeat messages, summarising notes, or creating reusable templates.',
          'Your category scores below will show whether one area stands out as the best place to start.',
        ],
      },
    },
    categoryScoresNote: '',
    emailedNote: 'Your full report has been emailed to',
    changeEmailLabel: 'Change email address',
    categoryHeading: 'Your AI opportunity by area',
    categorySub: [
      'Lower scores mean a bigger chance for AI to save time, reduce missed opportunities, or make the business easier to run.',
      'Your full report includes more specific recommendations based on your answers.',
    ],
    categoryTexts: {
      marketing: {
        low: 'Your Marketing and Sales score suggests that attracting, converting, or following up with leads may be inconsistent or heavily reliant on manual effort. You might be missing out on potential customers due to delayed responses, lost leads, or irregular communication. Consider automating follow-up emails or lead tracking to reduce missed opportunities and free up valuable time. Even simple tools can help ensure every enquiry gets a timely, professional response.',
        medium: 'Your Marketing and Sales results indicate some strong efforts, but there’s likely room for improvement in consistency and responsiveness. Occasional manual processes or gaps in follow-up could be limiting your growth. Introducing AI-powered scheduling or sales pipeline reminders can help ensure every lead is nurtured and no opportunity falls through the cracks. Streamlining these workflows can create more predictable sales outcomes.',
        high: 'Your business is performing well in Marketing and Sales, with processes that support steady lead flow and engagement. However, there may still be untapped opportunities in personalising customer journeys or analysing sales data more effectively. Exploring advanced AI tools for customer segmentation or automated content creation could further boost your results and give you a competitive edge.',
      },
      people: {
        low: 'Your People score points to challenges in managing team information, onboarding, or sharing key knowledge. Critical tasks or know-how may be tied to a few individuals, increasing business risk and slowing growth. Consider implementing simple AI-driven knowledge bases or workflow documentation tools to make processes accessible to everyone and reduce dependency on any one person.',
        medium: 'You have some effective systems in place for team management, but there may still be bottlenecks around scheduling, communication, or training. Semi-automated onboarding or AI-powered scheduling assistants could help reduce admin and keep your team aligned. Focusing on consistency in processes will make your business less vulnerable to staff changes.',
        high: 'Your team appears well-supported with strong communication and accessible knowledge. To build even more resilience, you could explore AI tools for performance feedback or skills tracking, ensuring your team continues to grow and adapt as your business evolves.',
      },
      finance: {
        low: 'Your Finance score suggests that financial visibility, reporting, or billing may be manual or delayed. This can lead to cash flow surprises or missed opportunities for cost savings. Introducing AI-powered invoicing or expense tracking can give you real-time insights, helping you make faster and more informed decisions.',
        medium: 'Your Finance processes are generally sound, but there may be inefficiencies in monitoring key metrics or forecasting. Automating regular reporting or using AI to spot unusual spending can help you stay ahead of issues and identify new opportunities for growth.',
        high: 'Your financial management is strong, with good systems for tracking and reporting. To push further, consider AI-driven scenario planning or automated reminders for outstanding invoices. These steps can fine-tune your cash flow and keep your finances running smoothly.',
      },
      systems: {
        low: 'Your Systems score indicates that many processes may still be manual, leading to wasted time, errors, or inconsistent delivery. Automating repetitive tasks—such as appointment booking or document management—could free up hours each week and improve overall reliability.',
        medium: 'Some systems are working well, but there’s still reliance on manual steps or disconnected tools. Connecting your key platforms or setting up simple automations between them can reduce double-handling and help your business run more smoothly day-to-day.',
        high: 'Your operations are well systemised, making your business efficient and scalable. For further gains, look at opportunities to integrate AI-driven analytics or predictive maintenance tools to anticipate issues and stay ahead of the curve.',
      },
    },
    cta: {
      heading: 'Next steps?',
      leftTitle: 'View Your Detailed Report',
      leftBody:
        'Explore your results across Marketing and Sales, People, Finance and Systems. Your personalised report includes practical recommendations, implementation examples and estimated time and cost savings. It has also been emailed to you.',
      leftButton: 'Open my Report',
      rightTitle: 'Request a Personal Review',
      rightBody:
        'Would you like me to examine your answers personally? Open your details and tick the review box to register your interest. If I identify a practical and commercially worthwhile opportunity, I will contact you directly.',
      rightButton: 'Request a Review',
    },
    share:
      'Share this assessment with your network and help them discover their own untapped AI opportunities.',
    changeDetails: {
      heading: 'Update your details',
      subheading: 'We’ll resend your results to your updated email address',
      submitLabel: 'Submit',
    },
  },
};
