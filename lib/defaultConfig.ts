import { ScorecardConfig } from './types';

// Default scorecard content for the AI Opportunity Assessment.
export const defaultConfig: ScorecardConfig = {
  title: 'The AI Opportunity Assessment',
  copyright: '© Copyright',
  branding: {
    logoUrl: '/images/logo.png',
    iconUrl: '/images/icon.png',
    primaryColor: '#1c78fe',
    secondaryColor: '#152042',
  },
  pdf: {
    coverTitle: 'The AI Opportunity Assessment Report',
    howToReadTitle: 'How to Read Your AI Opportunity Report',
    howToRead: [
      'Your scores show how effectively each area of your business operates today and where AI could create the greatest improvement. This report breaks down your results across Marketing and Sales, People, Finance and Systems.',
      'A low score indicates significant gaps, inefficiencies or reliance on manual work, meaning AI and automation could make a substantial impact. A medium score suggests that you have a reasonable foundation, but there are clear opportunities to improve consistency, save time and strengthen performance. A high score means the area is already operating effectively, so the focus shifts towards refining processes, scaling what works and exploring more advanced uses of AI.',
      'Each category page will explain your result and provide specific actions, practical strategies and relevant examples of how AI could be used in your situation, helping you identify what to prioritise and where to begin.',
    ],
    keysHeading: 'We have scored you against the following 4 Transformation Keys:',
    categories: {
      marketing: {
        low: {
          intro: [
            'Your score suggests that your business may be losing potential customers through inconsistent marketing, slow enquiry responses or a website that does not reliably turn visitors into leads. Marketing activity may depend heavily on available time, while follow-up is handled manually and opportunities can be missed when the business becomes busy. This indicates a significant opportunity to use AI and automation to improve consistency, reduce administration and convert more enquiries into paying customers.',
            'The highest-value priorities are usually to improve website lead capture, respond to new enquiries faster, create a reliable follow-up process and make content production easier. AI can help draft social media posts, emails, website content and customer responses using information already available within the business. Simple automations can acknowledge enquiries immediately, collect missing details, notify the right employee and remind staff when follow-up is required. Depending on enquiry volume, these changes could reduce marketing and sales administration by approximately 25–40%, cut content creation time by more than half and help the business respond to most new leads within minutes rather than hours.',
          ],
          exampleTitle: 'Example: Improving Enquiry Handling in a Plumbing Business',
          example: [
            'A plumbing business receives enquiries through its website, Facebook page, email and missed phone calls. The owner currently reviews them between jobs or at the end of the day, meaning some customers wait several hours and contact another plumber.',
            'A simple central enquiry workflow could collect each lead, identify whether the request is urgent and send an immediate response asking for the customer’s suburb, photos and preferred appointment time. Emergency jobs would be flagged for immediate attention, while routine quote requests would be added to a follow-up list with an automatically prepared response for the owner to approve.',
            'A basic version could usually be set up within one to two weeks using the business’s existing website, email and customer management tools. The business would need to spend several hours confirming the questions, response rules and escalation process. Depending on the existing systems and level of customisation, implementation could cost approximately $1,000–$3,000, with relatively low ongoing software costs.',
          ],
        },
        medium: {
          intro: [
            'Your score suggests that your business has some effective marketing and sales practices, but results may still depend on manual effort and inconsistent follow-up. Your website, social media or enquiry process may generate leads, yet opportunities can still be lost through slow responses, irregular content or limited staff time. AI and automation could improve conversion rates without significantly increasing advertising spend or workload.',
            'The main opportunities are to connect marketing channels, respond faster, qualify leads and standardise follow-up. AI can draft emails, social posts, website content and sales responses using existing business knowledge. Automations can capture enquiries, collect required information, schedule appointments and create follow-up reminders. These improvements could reduce marketing and sales administration by 20–35%, cut content preparation time by more than half and help the business manage more enquiries without additional staff.',
          ],
          exampleTitle: 'Example: Streamlining Enquiries in an Accounting Firm',
          example: [
            'An accounting firm receives enquiries through its website, email, referrals and social media. An employee currently reads each message, asks standard questions, sends a booking link and manually enters the details into the customer management system. During busy periods, follow-up is often delayed.',
            'An automated workflow could immediately send a professional response and a short form asking about the client’s business, turnover, accounting software and required service. AI could summarise and classify the enquiry, prepare a response and direct specialist matters to the right accountant. Suitable prospects could receive a booking link automatically, while their details and follow-up tasks are added to the firm’s systems.',
            'A basic workflow could usually be implemented within one to two weeks using the firm’s existing website, email, calendar and customer management software. Staff may need four to six hours to approve the questions, qualification rules and responses. Implementation could cost approximately $1,500–$4,000, with modest ongoing software costs.',
            'This could save five to eight staff hours per week, reduce response times from hours to minutes and improve enquiry-to-consultation conversion by 10–20%, while allowing staff to focus on higher-value advisory work.',
          ],
        },
        high: {
          intro: [
            'Your score suggests that your business already has strong marketing and sales foundations. Enquiries are generally handled well, content is reasonably consistent and your existing systems are producing results. The main opportunity is no longer fixing major gaps, but using AI to improve personalisation, speed, conversion and scale without adding unnecessary staff or complexity.',
            'The highest-value priorities are usually to improve lead segmentation, personalise follow-up, reuse existing content more effectively and identify which enquiries are most likely to convert. AI can tailor messages by client type, prepare content for different channels, summarise enquiry patterns and suggest the next best action for each prospect. These improvements could reduce marketing and sales administration by 15–25%, increase content output without lowering quality and improve conversion from qualified enquiry to consultation by 5–15%.',
          ],
          exampleTitle: 'Example: Optimising Lead Follow-Up in an Accounting Firm',
          example: [
            'An accounting firm already responds quickly to enquiries and uses a customer management system to track prospects. However, most follow-up emails are similar, regardless of whether the prospect is a sole trader, growing company or established employer.',
            'A lightweight AI workflow could review each enquiry, identify the prospect’s business type and likely needs, then prepare a tailored response using approved firm information. It could recommend relevant services, create follow-up tasks and alert staff when a high-value prospect shows strong buying intent. Existing articles, guides and updates could also be automatically repurposed into emails and social media content for different client groups.',
            'Because the firm already has sound systems, this could often be added within several days using existing email, calendar and customer management tools. Staff would mainly need to approve the messaging, client categories and escalation rules. Setup costs may be limited to a small configuration project and modest ongoing software fees.',
            'This could save three to six staff hours per week, improve the relevance of every follow-up and help convert more high-value prospects without increasing advertising spend. It also gives the firm a more scalable marketing process while allowing accountants to remain focused on relationships and advisory work.',
          ],
        },
      },
      people: {
        low: {
          intro: [
            'Your score suggests that the business depends heavily on you, with limited capacity to delegate or step away. Long working hours, repeated questions and information held mainly in your head may be slowing growth and creating unnecessary pressure. Limited AI training may also mean simple opportunities to save time are being missed.',
            'The greatest gains are likely to come from documenting your knowledge, automating repetitive administration and creating reliable ways for information to be found without your involvement. AI can draft emails, prepare proposals, summarise meetings, organise client notes and answer routine questions using approved business information. These changes could reduce weekly administration by 25–40%, save five to ten hours per week and make it easier to serve more clients without immediately hiring staff.',
          ],
          exampleTitle: 'Example: Reducing Owner Dependence for a Business Consultant',
          example: [
            'A solo consultant spends much of each week replying to similar client questions, preparing proposals, writing meeting notes and searching through emails for past information. Because everything depends on the owner, client work slows whenever they are busy or unavailable.',
            'A simple AI-supported workflow could record and summarise meetings, create follow-up tasks, draft proposals from approved templates and store key client information in one searchable location. A private AI assistant could also use the consultant’s services, processes and frequently asked questions to prepare consistent draft responses for review.',
            'A basic setup could be completed within several days using existing email, document and meeting tools. The consultant may need three to five hours to organise templates, common questions and service information. Setup could cost approximately $500–$2,000, with low ongoing software costs.',
            'This could save five to eight hours per week, reduce interruptions and allow the consultant to spend more time on paid client work. It would also make the business less dependent on memory and create a stronger foundation for eventually hiring support or taking time away.',
          ],
        },
        medium: {
          intro: [
            'Your score suggests that the business has some useful systems in place, but still depends heavily on you for decisions, client knowledge and day-to-day delivery. You may be managing a reasonable workload, yet repeated questions, manual administration and information spread across different tools can still create delays. There is a clear opportunity to use AI to improve capacity without immediately adding wages or hiring support.',
            'The main priorities are to centralise knowledge, reduce repetitive work and make routine tasks easier to complete without your direct involvement. AI can summarise meetings, draft proposals and emails, organise client information, prepare follow-up actions and answer common questions using approved business material. These changes could reduce administration by 20–30% and return four to seven hours each week for client work, sales or business development.',
          ],
          exampleTitle: 'Example: Increasing Capacity for Business Consultants',
          example: [
            'A consultant already uses templates and online tools, but still spends several hours each week preparing meeting notes, rewriting similar proposals, locating client information and responding to recurring questions. Work continues to move, but growth is limited by the consultant’s available time.',
            'A simple workflow could automatically summarise each client meeting, save key decisions, create follow-up tasks and prepare a draft email. Approved proposal templates and service information could then be used by AI to generate a first draft for review. Client notes and common answers could also be stored in one searchable knowledge base.',
            'This could be implemented within a few days using existing email, meeting and document tools. The consultant may need three to four hours to organise templates and confirm the workflow, with setup costs of approximately $500–$1,500 and low ongoing fees.',
            'The result could be four to six hours saved each week, faster client follow-up and capacity for one or two additional clients each month without increasing working hours or hiring immediately.',
          ],
        },
        high: {
          intro: [
            'Your score suggests that the business is already well organised, with manageable working hours, accessible information and limited dependence on repetitive manual work. You are likely using effective tools and processes already. The opportunity now is to use AI more strategically to protect your time, increase delivery capacity and make the business easier to scale.',
            'The main priorities are to deepen AI capability, automate remaining low-value tasks and turn your existing knowledge into reusable systems. AI can prepare meeting summaries, draft client deliverables, organise research, maintain internal knowledge and support consistent decision-making. These improvements could reduce administration by a further 10–20% and free two to four hours each week without compromising service quality.',
          ],
          exampleTitle: 'Example: Expanding Capacity for a Solo Business Consultant',
          example: [
            'A solo consultant already uses templates, structured client files and efficient online tools. However, they still spend time preparing reports, reviewing meeting notes and adapting similar recommendations for different clients.',
            'A lightweight AI workflow could summarise each meeting, update the client record, generate follow-up actions and prepare the first draft of a report using approved templates and past work. The consultant would then review, refine and approve the output rather than starting from scratch.',
            'Because the existing systems are strong, the workflow could be introduced within a few days with minimal disruption. Setup may require only two to three hours of the consultant’s time and a small configuration cost, with low ongoing software fees.',
            'This could save two to four hours per week, shorten turnaround times and allow the consultant to serve additional clients or spend more time on higher-value strategy and relationship work.',
          ],
        },
      },
      finance: {
        low: {
          intro: [
            'Your score suggests that the business may lack timely financial visibility, consistent profitability or a steady flow of the right kind of work. Important decisions may be based on outdated reports or instinct, making it harder to manage cash flow, protect margins and identify which products or customers generate the strongest returns.',
            'The main priorities are to improve financial reporting, monitor profitability more regularly and use sales data to support purchasing and marketing decisions. AI and automation can combine information from accounting, sales and inventory systems, highlight unusual changes and prepare simple weekly summaries. This could reduce financial administration by 20–30%, improve stock decisions and help the owner respond to problems before they affect cash flow.',
          ],
          exampleTitle: 'Example: Improving Financial Visibility in a Local Bookshop',
          example: [
            'A local bookshop receives monthly financial reports, but the owner has limited visibility between reporting periods. Staff manually compare sales, stock levels and supplier invoices, while slow-selling books may remain on shelves and popular titles sell out.',
            'A simple workflow could collect sales, inventory and accounting data each week. AI would prepare a short summary showing revenue, cash position, overdue bills, product margins, bestselling categories and stock that is not moving. It could also flag unusual costs and recommend which titles to reorder, discount or promote.',
            'A basic version could be introduced within one to two weeks using the shop’s existing point-of-sale and accounting systems. The owner may need three to five hours to confirm the reports and alert thresholds. Setup could cost approximately $1,000–$3,000, with low ongoing software fees.',
            'This could save three to five hours per week, reduce excess stock by 10–20% and improve cash flow by directing purchasing towards books that sell reliably. Better visibility would also help the owner make faster decisions about pricing, promotions and expenses.',
          ],
        },
        medium: {
          intro: [
            'Your score suggests that the business has reasonable financial controls, but important information may still arrive too late or lack the detail needed for confident decisions. Profitability may be acceptable, yet cash flow, stock purchasing and sales consistency could still improve. AI and automation can provide clearer, faster reporting and help the owner focus on the products and activities that generate the strongest returns.',
            'The main opportunities are to create simple weekly financial summaries, track margins by product category and identify changes in sales patterns earlier. AI can combine information from accounting, sales and inventory systems, flag unusual costs and highlight which products are improving or weakening. This could reduce financial administration by 15–25%, improve purchasing decisions and strengthen profit without requiring a large system change.',
          ],
          exampleTitle: 'Example: Improving Profitability in a Local Bookshop',
          example: [
            'A local bookshop already uses accounting and point-of-sale software, but the owner still reviews several reports separately. They can see total sales and profit, but it takes time to understand which categories, promotions and customer groups are producing the best results.',
            'A lightweight workflow could combine weekly sales, stock and expense data into one summary. AI could highlight bestselling and slow-moving categories, changing margins, upcoming payments and stock likely to run out. It could also suggest which products to reorder, promote or discount based on recent sales.',
            'Because the shop already has digital systems, this could be introduced within several days. The owner may need two to four hours to approve the report format and key alerts, with setup costs of approximately $750–$2,000 and low ongoing fees.',
            'This could save two to four hours per week, reduce excess stock by 5–15% and improve margins by directing spending towards products with stronger demand. It would also give the owner earlier warning of cash flow or profitability issues.',
          ],
        },
        high: {
          intro: [
            'Your score suggests that the business already has strong financial visibility, reliable profitability and a healthy flow of suitable work. The opportunity is now to use AI for better forecasting, faster decisions and more precise control over stock, margins and cash flow.',
            'The main priorities are to identify small profit leaks, predict demand and improve purchasing decisions. AI can analyse sales, stock and expense data, forecast busy and quiet periods, highlight margin changes and recommend where money should be invested. These improvements could reduce financial administration by a further 10–15% and strengthen profitability without major changes to existing systems.',
          ],
          exampleTitle: 'Example: Forecasting Demand in a Local Bookshop',
          example: [
            'A local bookshop already uses integrated accounting and point-of-sale software and reviews its financial performance regularly. However, purchasing decisions still rely partly on past experience, particularly when planning for holidays, school terms and local events.',
            'A lightweight AI workflow could analyse previous sales, seasonal patterns, stock levels and upcoming events. Each week, it could recommend which titles and categories to reorder, identify products likely to sell slowly and forecast short-term cash requirements. The owner would receive a concise summary rather than reviewing multiple reports.',
            'Because the shop’s systems are already well organised, this could usually be added within a few days. Setup may require two to three hours to confirm forecasting rules and reports, with a modest configuration cost and low ongoing fees.',
            'This could save one to three hours per week, reduce avoidable stock shortages and improve purchasing accuracy by 5–10%. Even a small improvement in stock turnover and margins could generate meaningful additional profit across the year.',
          ],
        },
      },
      systems: {
        low: {
          intro: [
            'Your score suggests that key systems may rely on memory, individual employees or inconsistent manual processes. Customer experiences may vary, information can be difficult to find and repeated questions, data entry or approval bottlenecks may consume significant staff time. Costly mistakes are also more likely when processes are not documented or information is not shared reliably.',
            'The main priorities are to document essential processes, centralise business information and automate repetitive communication and administration. AI can turn existing knowledge into simple procedures, summarise notes, answer common staff questions and trigger proactive customer updates. These changes could reduce routine administration by 25–40%, lower avoidable errors and help the business operate more consistently during busy periods or staff absences.',
          ],
          exampleTitle: 'Example: Improving Operations in a Takeaway Shop',
          example: [
            'A takeaway shop handles phone, online and counter orders, but procedures vary between employees. Staff repeatedly ask about recipes, allergen information, refunds, stock and opening tasks. Customer complaints and special requests may be written on paper or passed on verbally, creating missed information and inconsistent service.',
            'A simple workflow could create one searchable knowledge base containing recipes, procedures, supplier details, customer policies and common questions. AI could help staff quickly find approved answers, while digital forms could record complaints, equipment issues and shift notes. Each submission would be summarised, sent to the right person and added to a central record. Automated messages could also notify customers when orders are delayed or ready for collection.',
            'A basic system could be introduced within one to two weeks using existing tablets, email and online forms. The owner and senior staff may need four to six hours to organise information and approve procedures. Setup could cost approximately $1,000–$3,000, with low ongoing software costs.',
            'This could save five to eight staff hours per week, reduce repeated questions and data entry by around 30% and lower the risk of missed instructions or customer complaints. It would also help new employees become productive faster and give customers a more consistent experience.',
          ],
        },
        medium: {
          intro: [
            'Your score suggests that the business has some reliable systems, but parts of the operation may still depend on individual employees, manual checks or information stored across different places. Customer service is generally consistent, although repeated questions, incomplete handovers and approval bottlenecks may still create delays during busy periods.',
            'The main opportunities are to centralise procedures, improve communication between shifts and automate routine updates. AI can help staff find approved answers, summarise notes, organise customer information and identify recurring issues. These improvements could reduce routine administration by 15–25%, improve consistency and free managers from repeatedly answering the same questions.',
          ],
          exampleTitle: 'Example: Streamlining Systems in a Takeaway Shop',
          example: [
            'A takeaway shop already uses online ordering and digital rosters, but staff still rely on group chats, paper notes and verbal instructions for stock issues, customer complaints and shift handovers. Managers are often interrupted to confirm procedures or approve simple decisions.',
            'A lightweight workflow could capture shift notes, complaints, equipment problems and stock shortages through one digital form. AI could summarise each submission, assign it to the right person and create a clear handover for the next shift. A searchable knowledge base could also give staff quick access to recipes, allergen information, refund rules and opening or closing procedures.',
            'Because the shop already uses digital tools, this could be introduced within several days. The owner and senior staff may need three to four hours to organise key information and approve workflows, with setup costs of approximately $750–$2,000 and low ongoing fees.',
            'This could save three to five staff hours per week, reduce repeated questions by 20–30% and improve shift handovers, order accuracy and customer service without adding more management time.',
          ],
        },
        high: {
          intro: [
            'Your score suggests that the business already has reliable systems, accessible information and consistent customer service. Most key processes are documented, routine questions are handled efficiently and operational bottlenecks are limited. The opportunity now is to use AI to improve forecasting, quality control and communication without adding complexity.',
            'The main priorities are to identify small inefficiencies, detect recurring issues earlier and make existing systems more proactive. AI can analyse customer feedback, shift notes, stock records and order data to highlight patterns and recommend action. These improvements could reduce routine administration by a further 10–15%, improve accuracy and help managers make faster decisions.',
          ],
          exampleTitle: 'Example: Optimising Operations in a Takeaway Shop',
          example: [
            'A takeaway shop already uses online ordering, digital rosters and documented procedures. However, managers still review customer feedback, stock issues and shift notes manually to identify recurring problems.',
            'A lightweight AI workflow could summarise daily shift information, group similar complaints and flag trends such as repeated order errors, ingredient shortages or unusually long preparation times. It could also prepare a short management summary with suggested actions and automatically assign follow-up tasks.',
            'Because the shop already has strong digital systems, this could be added within a few days. Setup may require two to three hours to connect existing information and approve the alerts, with a modest configuration cost and low ongoing fees.',
            'This could save one to three management hours per week, reduce repeat errors and help the shop respond to problems before they affect more customers. It would also support more consistent service as order volumes or staff numbers increase.',
          ],
        },
      },
    },
    closingTitle: 'Turn Your Results Into a Practical Next Step',
    closing: [
      'Your report has identified where AI and automation could create the greatest value in your business. The next step is determining which opportunity is practical, commercially worthwhile and capable of producing a measurable return.',
      'I personally review selected assessments where the results indicate a strong opportunity. To register your interest, reply to the email that delivered this report with “Personal review”. I will examine your answers and, if I believe there is a strong fit, contact you with an initial observation and an invitation to discuss the opportunity further.',
    ],
    images: {},
    panel: { background: '#152042', buttonColor: '#1c78fe', imagePosition: 'left' },
    footerText: '',
    hidden: [],
  },
  questionsPage: {
    header: { show: true, align: 'center', maxWidth: 250, topMargin: 13, bottomMargin: 13 },
    questions: {
      align: 'center',
      showBack: true,
      showCategory: false,
      optionTextColor: '#152042',
      buttonColor: '#1c78fe',
      questionTextColor: '#152042',
      backgroundColor: '#ffffff',
    },
    progress: { show: true },
    footer: { show: false },
  },
  resultsPage: {
    order: ['speedChart', 'categoryScores', 'cta', 'share'],
    hidden: [],
    speedChart: { chartPosition: 'right', showOverall: true, scoreFormat: 'percent', showTiers: true },
    categories: { itemsPerRow: 2, showScores: true, showTier: true },
    share: { facebook: true, twitter: true, linkedin: true, background: '#152042', linksColor: '#ffffff' },
  },
  shareAppearance: {
    title: 'The AI Opportunity Assessment for Small Business Owners',
    description:
      'Discover where AI and automation could save time, reduce repetitive work, improve sales, strengthen systems, and reduce owner dependency in your small business.',
    image: '/images/hero-report.png',
  },
  notifications: {
    enabled: true,
    recipients: '',
    subject: '{first_name} {last_name} started the {scorecard_name}',
    content:
      '<p><b>Congratulations!</b></p><p>You just got a new lead.</p><p>Name: {first_name} {last_name}<br>Email: {email}<br>Status: {status}<br>Score: {score}%</p>',
  },
  resultEmail: {
    enabled: true,
    fromAddress: '',
    fromName: '',
    replyTo: '',
    subject: '{scorecard_name} Report',
    content:
      '<p>Dear {first_name},</p><p>Thank you for completing {scorecard_name}. You scored {score}%.</p><p>You can view your results and download your full PDF report here: {results_link}</p>',
  },
  landing: {
    heroImage: '/images/hero-report.png',
    sectionOrder: ['banner', 'categories', 'cta'],
    heroCtaAction: { type: 'lead-form' },
    bottomCtaAction: { type: 'lead-form' },
    imagePosition: 'right',
    categoriesPerRow: 2,
    showHeader: true,
    showFooter: true,
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
