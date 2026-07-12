import Anthropic from '@anthropic-ai/sdk';
import { AiBrief, AiContent, AiGeneration, AiPdf, AiResults, AiStrategy } from '../ai/brief';
import { blankConfig } from '../blankConfig';
import { ScorecardConfig } from '../types';

// Content generation for the AI Builder. One fixed scorecard engine +
// renderer; Haiku generates ONLY structured content (schema-constrained JSON)
// that populates it — never code, HTML or scoring architecture. Scoring stays
// fixed: every question is a 1–5 scale, high = good, tiers low/medium/high.

const MODEL = 'claude-haiku-4-5';

function mockMode(): boolean {
  return process.env.AI_BUILDER_MOCK === '1' || !process.env.ANTHROPIC_API_KEY;
}

export function aiBuilderStatus() {
  return { mock: mockMode() };
}

// ——— JSON schemas (structured outputs) ————————————————————————————————

const TIER_ENUM = { type: 'string', enum: ['low', 'medium', 'high'] } as const;
const STR = { type: 'string' } as const;
const STR_ARR = { type: 'array', items: STR } as const;

const STRATEGY_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'subtitle', 'promise', 'categories', 'tiers', 'ctaHeading', 'ctaButton'],
  properties: {
    title: STR,
    subtitle: STR,
    promise: STR,
    categories: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['key', 'label', 'description'],
        properties: { key: STR, label: STR, description: STR },
      },
    },
    tiers: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['key', 'label', 'summary'],
        properties: { key: TIER_ENUM, label: STR, summary: STR },
      },
    },
    ctaHeading: STR,
    ctaButton: STR,
  },
} as const;

const CONTENT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['landing', 'questions'],
  properties: {
    landing: {
      type: 'object',
      additionalProperties: false,
      required: [
        'heroTitle', 'heroSubtitle', 'heroBody', 'heroBullets', 'heroCta',
        'howItWorksLabel', 'howItWorksTitle', 'howItWorksBody', 'categoryCards',
        'bottomTitle', 'bottomBody', 'bottomCta', 'bottomNote', 'leadFormHeading',
      ],
      properties: {
        heroTitle: STR,
        heroSubtitle: STR,
        heroBody: STR,
        heroBullets: STR_ARR,
        heroCta: STR,
        howItWorksLabel: STR,
        howItWorksTitle: STR,
        howItWorksBody: STR,
        categoryCards: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['categoryKey', 'title', 'body'],
            properties: { categoryKey: STR, title: STR, body: STR },
          },
        },
        bottomTitle: STR,
        bottomBody: STR,
        bottomCta: STR,
        bottomNote: STR,
        leadFormHeading: STR,
      },
    },
    questions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'categoryKey', 'text', 'labels'],
        properties: {
          id: STR,
          categoryKey: STR,
          text: STR,
          labels: {
            type: 'object',
            additionalProperties: false,
            required: ['left', 'center', 'right'],
            properties: { left: STR, center: STR, right: STR },
          },
        },
      },
    },
  },
} as const;

const RESULTS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['tierIntros', 'categoryHeading', 'categorySub', 'categoryTexts', 'cta', 'share'],
  properties: {
    tierIntros: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['tier', 'headline', 'body'],
        properties: { tier: TIER_ENUM, headline: STR, body: STR_ARR },
      },
    },
    categoryHeading: STR,
    categorySub: STR_ARR,
    categoryTexts: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['categoryKey', 'tier', 'text'],
        properties: { categoryKey: STR, tier: TIER_ENUM, text: STR },
      },
    },
    cta: {
      type: 'object',
      additionalProperties: false,
      required: ['heading', 'leftTitle', 'leftBody', 'leftButton', 'rightTitle', 'rightBody', 'rightButton'],
      properties: {
        heading: STR, leftTitle: STR, leftBody: STR, leftButton: STR,
        rightTitle: STR, rightBody: STR, rightButton: STR,
      },
    },
    share: STR,
  },
} as const;

const PDF_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['coverTitle', 'howToReadTitle', 'howToRead', 'keysHeading', 'categories', 'closingTitle', 'closing'],
  properties: {
    coverTitle: STR,
    howToReadTitle: STR,
    howToRead: STR_ARR,
    keysHeading: STR,
    categories: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['categoryKey', 'tier', 'intro', 'exampleTitle', 'example'],
        properties: { categoryKey: STR, tier: TIER_ENUM, intro: STR_ARR, exampleTitle: STR, example: STR_ARR },
      },
    },
    closingTitle: STR,
    closing: STR_ARR,
  },
} as const;

// ——— Generation calls ————————————————————————————————————————————————

function briefBlock(brief: AiBrief): string {
  return [
    `Business name: ${brief.businessName}`,
    `Scorecard name: ${brief.scorecardName}`,
    `What the scorecard is about: ${brief.description}`,
    `Target audience: ${brief.audience}`,
    `What the score should measure (high score = good): ${brief.outcome}`,
    `Desired call to action after results: ${brief.cta}`,
    `Tone of voice: ${brief.tone}`,
    `Number of scoring categories: ${brief.categoriesCount}`,
    `Approximate total number of questions: ${brief.questionsCount}`,
  ].join('\n');
}

function strategyBlock(s: AiStrategy): string {
  return [
    `Scorecard title: ${s.title}`,
    `Subtitle: ${s.subtitle}`,
    `Promise to the visitor: ${s.promise}`,
    `Categories: ${s.categories.map((c) => `${c.key} = "${c.label}" (${c.description})`).join('; ')}`,
    `Result tiers: ${s.tiers.map((t) => `${t.key} = "${t.label}" (${t.summary})`).join('; ')}`,
  ].join('\n');
}

const SYSTEM = `You write content for lead-generation scorecards (interactive assessments a business publishes to capture leads). You write in UK English, plainly and concretely, without hype or filler. Every question you write is answered on a 1–5 scale where 5 is always the strongest/most positive answer. Scores work as: overall percentage = points earned / points possible; low/medium/high result tiers. You only produce content — the platform owns layout, scoring and code. Respond with JSON matching the requested schema exactly.`;

async function callHaiku<T>(prompt: string, schema: object, maxTokens: number): Promise<T> {
  const client = new Anthropic();
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: SYSTEM,
    messages: [{ role: 'user', content: prompt }],
    output_config: { format: { type: 'json_schema', schema: schema as Record<string, unknown> } },
  });
  if (response.stop_reason === 'max_tokens') {
    throw new Error('Generation ran out of space — try fewer categories or questions.');
  }
  const text = response.content.find((b) => b.type === 'text');
  if (!text || text.type !== 'text') throw new Error('The model returned no content.');
  return JSON.parse(text.text) as T;
}

export async function generateStrategy(brief: AiBrief): Promise<AiStrategy> {
  if (mockMode()) return mockStrategy(brief);
  const s = await callHaiku<AiStrategy>(
    `Plan a lead-generation scorecard from this brief:\n\n${briefBlock(brief)}\n\n` +
      `Produce: a compelling scorecard title (based on the scorecard name), a one-line subtitle, the promise to the visitor, ` +
      `exactly ${brief.categoriesCount} scoring categories (short lowercase kebab-case key, a 1–3 word label, one-sentence description of what it measures), ` +
      `exactly 3 result tiers with keys low, medium and high (give each a short label in the brand's voice and a one-sentence summary of what that result means), ` +
      `and a call-to-action heading and button label that lead to: ${brief.cta}.`,
    STRATEGY_SCHEMA,
    2000
  );
  return repairStrategy(brief, s);
}

export async function generateContent(brief: AiBrief, strategy: AiStrategy): Promise<AiContent> {
  if (mockMode()) return mockContent(brief, repairStrategy(brief, strategy));
  const s = repairStrategy(brief, strategy);
  const perCat = Math.max(2, Math.round(brief.questionsCount / s.categories.length));
  const c = await callHaiku<AiContent>(
    `Write the landing page and questions for this scorecard.\n\nBrief:\n${briefBlock(brief)}\n\nAgreed strategy:\n${strategyBlock(s)}\n\n` +
      `Landing page: heroTitle (punchy, benefit-led), heroSubtitle (mentions how quick it is), heroBody (2–3 sentences), exactly 3 heroBullets, ` +
      `heroCta button label, howItWorksLabel (e.g. "How it works"), howItWorksTitle, howItWorksBody (2–3 sentences), ` +
      `one categoryCard per category (categoryKey must match the strategy keys; title = category label; body = one benefit-led sentence about what the visitor learns), ` +
      `bottomTitle, bottomBody (1–2 sentences), bottomCta, bottomNote (reassurance, e.g. free / takes X minutes), and leadFormHeading.\n\n` +
      `Questions: about ${perCat} per category (${s.categories.length * perCat} total), ids q1, q2, q3… in order, grouped by category. ` +
      `Each question is a single clear self-assessment sentence the audience can rate 1–5, phrased so 5 is always the best answer. ` +
      `labels are short scale anchors: left = worst (1), center = middle (3), right = best (5). No duplicate or overlapping questions.`,
    CONTENT_SCHEMA,
    8000
  );
  return repairContent(brief, s, c);
}

export async function generateResults(brief: AiBrief, strategy: AiStrategy): Promise<AiResults> {
  if (mockMode()) return mockResults(brief, repairStrategy(brief, strategy));
  const s = repairStrategy(brief, strategy);
  const r = await callHaiku<AiResults>(
    `Write the results page content for this scorecard.\n\nBrief:\n${briefBlock(brief)}\n\nAgreed strategy:\n${strategyBlock(s)}\n\n` +
      `Produce: tierIntros for low, medium and high (headline + 1–2 short paragraphs each; speak directly to the reader about what their overall score means and what to do first — low = biggest opportunity, framed positively; high = strong position, focus on refinement), ` +
      `categoryHeading (title above the per-category breakdown), 1–2 categorySub sentences explaining how to read the category scores, ` +
      `categoryTexts: one entry for EVERY category × tier combination (${s.categories.length} categories × 3 tiers = ${s.categories.length * 3} entries; 2–3 sentences each, specific to that category at that level, with one practical next step), ` +
      `a results call-to-action (heading; left card = view/open the detailed report: leftTitle, leftBody 1–2 sentences, leftButton; right card = ${brief.cta}: rightTitle, rightBody 1–2 sentences, rightButton), ` +
      `and a one-sentence share message.`,
    RESULTS_SCHEMA,
    8000
  );
  return repairResults(s, r);
}

export async function generatePdf(brief: AiBrief, strategy: AiStrategy): Promise<AiPdf> {
  if (mockMode()) return mockPdf(brief, repairStrategy(brief, strategy));
  const s = repairStrategy(brief, strategy);
  const p = await callHaiku<AiPdf>(
    `Write the PDF report content for this scorecard.\n\nBrief:\n${briefBlock(brief)}\n\nAgreed strategy:\n${strategyBlock(s)}\n\n` +
      `Produce: coverTitle ("${s.title} Report" or similar), howToReadTitle, howToRead (2 short paragraphs explaining how to interpret low/medium/high scores), ` +
      `keysHeading (one sentence introducing the ${s.categories.length} areas scored), ` +
      `categories: one entry for EVERY category × tier combination (${s.categories.length * 3} entries; intro = 2 short paragraphs about what that score means in that area and the highest-value improvements; exampleTitle = "Example: …" naming a realistic scenario for the audience; example = 2 short paragraphs walking through that concrete example), ` +
      `closingTitle and closing (2 short paragraphs telling the reader what to do next, leading to: ${brief.cta}).`,
    PDF_SCHEMA,
    12000
  );
  return repairPdf(s, p);
}

// ——— Repair + validation (code, not another API call) ————————————————

function slug(v: string): string {
  return v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40) || 'area';
}

export function repairStrategy(brief: AiBrief, s: AiStrategy): AiStrategy {
  const seen = new Set<string>();
  const categories = (s.categories ?? [])
    .slice(0, Math.max(2, Math.min(6, brief.categoriesCount || 4)))
    .map((c, i) => {
      let key = slug(c.key || c.label || `area-${i + 1}`);
      while (seen.has(key)) key = `${key}-${i + 1}`;
      seen.add(key);
      return { key, label: (c.label || `Area ${i + 1}`).slice(0, 80), description: c.description ?? '' };
    });
  const byKey = new Map((s.tiers ?? []).map((t) => [t.key, t]));
  const tiers = (['low', 'medium', 'high'] as const).map((key) => ({
    key,
    label: byKey.get(key)?.label || key[0].toUpperCase() + key.slice(1),
    summary: byKey.get(key)?.summary || '',
  }));
  return {
    title: s.title || brief.scorecardName,
    subtitle: s.subtitle || '',
    promise: s.promise || '',
    categories: categories.length ? categories : [{ key: 'general', label: 'General', description: '' }],
    tiers,
    ctaHeading: s.ctaHeading || 'Next steps?',
    ctaButton: s.ctaButton || 'Get in touch',
  };
}

function repairContent(brief: AiBrief, s: AiStrategy, c: AiContent): AiContent {
  const catKeys = s.categories.map((x) => x.key);
  const fallbackKey = catKeys[0];
  const questions = (c.questions ?? [])
    .filter((q) => q.text?.trim())
    .map((q, i) => ({
      id: `q${i + 1}`,
      categoryKey: catKeys.includes(q.categoryKey) ? q.categoryKey : fallbackKey,
      text: q.text.trim(),
      labels: {
        left: q.labels?.left || 'Not at all',
        center: q.labels?.center || 'Somewhat',
        right: q.labels?.right || 'Completely',
      },
    }));
  const cards = s.categories.map((cat) => {
    const found = (c.landing?.categoryCards ?? []).find((x) => x.categoryKey === cat.key);
    return {
      categoryKey: cat.key,
      title: found?.title || cat.label,
      body: found?.body || cat.description,
    };
  });
  return { landing: { ...c.landing, categoryCards: cards }, questions };
}

function repairResults(s: AiStrategy, r: AiResults): AiResults {
  const tiers = ['low', 'medium', 'high'] as const;
  const intros = tiers.map((tier) => {
    const found = (r.tierIntros ?? []).find((t) => t.tier === tier);
    return found ?? { tier, headline: s.tiers.find((t) => t.key === tier)?.label || tier, body: [''] };
  });
  const texts: AiResults['categoryTexts'] = [];
  for (const cat of s.categories) {
    for (const tier of tiers) {
      const found = (r.categoryTexts ?? []).find((x) => x.categoryKey === cat.key && x.tier === tier);
      texts.push(found ?? { categoryKey: cat.key, tier, text: '' });
    }
  }
  return { ...r, tierIntros: intros, categoryTexts: texts };
}

function repairPdf(s: AiStrategy, p: AiPdf): AiPdf {
  const tiers = ['low', 'medium', 'high'] as const;
  const cats: AiPdf['categories'] = [];
  for (const cat of s.categories) {
    for (const tier of tiers) {
      const found = (p.categories ?? []).find((x) => x.categoryKey === cat.key && x.tier === tier);
      cats.push(
        found ?? { categoryKey: cat.key, tier, intro: [''], exampleTitle: 'Example', example: [''] }
      );
    }
  }
  return { ...p, categories: cats };
}

// Warnings shown on the review screen (the "validation" step, done in code so
// it costs nothing).
export function validateGeneration(g: AiGeneration): string[] {
  const warnings: string[] = [];
  const texts = g.content.questions.map((q) => q.text.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim());
  const dupes = texts.filter((t, i) => texts.indexOf(t) !== i);
  if (dupes.length) warnings.push(`${dupes.length} question(s) look like duplicates — review the Questions step.`);
  for (const cat of g.strategy.categories) {
    const n = g.content.questions.filter((q) => q.categoryKey === cat.key).length;
    if (n === 0) warnings.push(`Category “${cat.label}” has no questions.`);
    else if (n === 1) warnings.push(`Category “${cat.label}” only has one question — scores will be coarse.`);
  }
  for (const t of g.results.tierIntros) {
    if (!t.headline.trim() || !t.body.join('').trim()) warnings.push(`The ${t.tier} result intro is empty.`);
  }
  const emptyTexts = g.results.categoryTexts.filter((t) => !t.text.trim()).length;
  if (emptyTexts) warnings.push(`${emptyTexts} category result text(s) came back empty.`);
  const emptyPdf = g.pdf.categories.filter((c) => !c.intro.join('').trim()).length;
  if (emptyPdf) warnings.push(`${emptyPdf} PDF section(s) came back empty.`);
  return warnings;
}

// ——— Assembly: generated content → a normal ScorecardConfig ————————————

const CARD_IMAGES = ['/images/card-1.png', '/images/card-2.png', '/images/card-3.png', '/images/card-4.png'];

export function assembleConfig(brief: AiBrief, g: AiGeneration): ScorecardConfig {
  const config = blankConfig(g.strategy.title || brief.scorecardName);
  const { strategy, content, results, pdf } = g;

  config.branding = {
    ...config.branding,
    logoUrl: brief.logoUrl || '',
    iconUrl: brief.logoUrl || '',
    primaryColor: brief.primaryColor || config.branding.primaryColor,
    secondaryColor: brief.secondaryColor || config.branding.secondaryColor,
  };

  config.landing = {
    ...config.landing,
    showHeader: Boolean(brief.logoUrl),
    heroTitle: content.landing.heroTitle,
    heroSubtitle: content.landing.heroSubtitle,
    heroBody: content.landing.heroBody,
    heroBullets: content.landing.heroBullets.slice(0, 5),
    heroCta: content.landing.heroCta,
    howItWorksLabel: content.landing.howItWorksLabel,
    howItWorksTitle: content.landing.howItWorksTitle,
    howItWorksBody: content.landing.howItWorksBody,
    categoryCards: content.landing.categoryCards.map((c, i) => ({
      key: c.categoryKey,
      title: c.title,
      body: c.body,
      image: CARD_IMAGES[i % CARD_IMAGES.length],
    })),
    bottomTitle: content.landing.bottomTitle,
    bottomBody: content.landing.bottomBody,
    bottomCta: content.landing.bottomCta,
    bottomNote: content.landing.bottomNote,
  };

  config.leadForm = { ...config.leadForm, heading: content.landing.leadFormHeading };
  config.categories = strategy.categories.map((c) => ({ key: c.key, label: c.label, description: c.description }));
  config.questions = content.questions.map((q) => ({
    id: q.id,
    category: q.categoryKey,
    type: 'scale' as const,
    text: q.text,
    min: 1,
    max: 5,
    start: 3,
    labels: q.labels,
  }));

  config.tiers = config.tiers.map((t) => ({
    ...t,
    label: strategy.tiers.find((x) => x.key === t.key)?.label || t.label,
  }));

  const tierIntros: ScorecardConfig['results']['tierIntros'] = {};
  for (const t of results.tierIntros) tierIntros[t.tier] = { headline: t.headline, body: t.body };
  const categoryTexts: ScorecardConfig['results']['categoryTexts'] = {};
  for (const t of results.categoryTexts) {
    categoryTexts[t.categoryKey] = categoryTexts[t.categoryKey] ?? {};
    categoryTexts[t.categoryKey][t.tier] = t.text;
  }
  config.results = {
    ...config.results,
    tierIntros,
    categoryHeading: results.categoryHeading,
    categorySub: results.categorySub,
    categoryTexts,
    cta: { ...config.results.cta, ...results.cta },
    share: results.share,
  };

  const pdfCategories: ScorecardConfig['pdf']['categories'] = {};
  for (const c of pdf.categories) {
    pdfCategories[c.categoryKey] = pdfCategories[c.categoryKey] ?? {};
    pdfCategories[c.categoryKey][c.tier] = {
      intro: c.intro,
      exampleTitle: c.exampleTitle,
      example: c.example,
    };
  }
  config.pdf = {
    ...config.pdf,
    coverTitle: pdf.coverTitle,
    howToReadTitle: pdf.howToReadTitle,
    howToRead: pdf.howToRead,
    keysHeading: pdf.keysHeading,
    categories: pdfCategories,
    closingTitle: pdf.closingTitle,
    closing: pdf.closing,
  };

  config.shareAppearance = { title: g.strategy.title, description: g.strategy.subtitle, image: '' };
  return config;
}

// ——— Mock generation (no API key / AI_BUILDER_MOCK=1) ————————————————
// Deterministic sample output so the whole builder flow can be exercised
// without spending API credits.

function mockStrategy(brief: AiBrief): AiStrategy {
  const names = ['Foundations', 'Growth', 'Efficiency', 'Customers', 'Team', 'Resilience'];
  const n = Math.max(2, Math.min(6, brief.categoriesCount || 4));
  return {
    title: brief.scorecardName || `The ${brief.businessName} Scorecard`,
    subtitle: `See how ${brief.audience || 'your business'} measures up in minutes`,
    promise: `A personalised score showing ${brief.outcome || 'where you stand and what to improve first'}.`,
    categories: Array.from({ length: n }, (_, i) => ({
      key: slug(names[i]),
      label: names[i],
      description: `How well ${brief.audience || 'you'} perform on ${names[i].toLowerCase()}.`,
    })),
    tiers: [
      { key: 'low', label: 'Big Opportunity', summary: 'Plenty of quick wins available.' },
      { key: 'medium', label: 'On Track', summary: 'A solid base with clear next steps.' },
      { key: 'high', label: 'Front Runner', summary: 'Strong performance — time to refine.' },
    ],
    ctaHeading: 'Next steps?',
    ctaButton: brief.cta ? brief.cta.slice(0, 30) : 'Book a call',
  };
}

function mockContent(brief: AiBrief, s: AiStrategy): AiContent {
  const perCat = Math.max(2, Math.round((brief.questionsCount || 12) / s.categories.length));
  const questions: AiContent['questions'] = [];
  s.categories.forEach((cat) => {
    for (let i = 0; i < perCat; i++) {
      questions.push({
        id: `q${questions.length + 1}`,
        categoryKey: cat.key,
        text: `[Sample] How confident are you in your ${cat.label.toLowerCase()} (question ${i + 1})?`,
        labels: { left: 'Not at all', center: 'Somewhat', right: 'Completely' },
      });
    }
  });
  return {
    landing: {
      heroTitle: s.title,
      heroSubtitle: s.subtitle,
      heroBody: `${s.promise} Built for ${brief.audience || 'you'} — no jargon, just practical insight.`,
      heroBullets: ['It only takes a few minutes', 'It’s completely free', 'Get personalised results instantly'],
      heroCta: 'Start the Scorecard',
      howItWorksLabel: 'How it works',
      howItWorksTitle: `What we measure`,
      howItWorksBody: `We score you across ${s.categories.length} areas: ${s.categories.map((c) => c.label).join(', ')}. Answer honestly and your results will show exactly where to focus first.`,
      categoryCards: s.categories.map((c) => ({
        categoryKey: c.key,
        title: c.label,
        body: c.description,
      })),
      bottomTitle: 'Ready to see your score?',
      bottomBody: 'Take the scorecard now and get your personalised results instantly.',
      bottomCta: 'Get Started',
      bottomNote: 'Free · takes just a few minutes',
      leadFormHeading: 'Enter your details below to start the scorecard',
    },
    questions,
  };
}

function mockResults(brief: AiBrief, s: AiStrategy): AiResults {
  const tiers = ['low', 'medium', 'high'] as const;
  return {
    tierIntros: [
      { tier: 'low', headline: 'There’s a big opportunity here.', body: ['[Sample] Your score shows plenty of headroom. Start with your lowest-scoring area below — that is where the fastest wins are.'] },
      { tier: 'medium', headline: 'You’re on the right track.', body: ['[Sample] You have a solid base. A few focused improvements would move you into the top tier.'] },
      { tier: 'high', headline: 'You’re in great shape.', body: ['[Sample] Strong results across the board. Focus on refining what already works.'] },
    ],
    categoryHeading: 'Your score by area',
    categorySub: ['Lower scores show where there is the most room to improve.'],
    categoryTexts: s.categories.flatMap((c) =>
      tiers.map((tier) => ({
        categoryKey: c.key,
        tier,
        text: `[Sample] Your ${c.label} score is ${tier}. Here is what that means and one practical next step to improve it.`,
      }))
    ),
    cta: {
      heading: s.ctaHeading,
      leftTitle: 'View Your Detailed Report',
      leftBody: 'Your personalised report breaks down every area with practical recommendations.',
      leftButton: 'Open my Report',
      rightTitle: brief.cta || 'Get in touch',
      rightBody: 'Want to talk through your results? We’ll show you exactly where to start.',
      rightButton: s.ctaButton,
    },
    share: 'Share this scorecard with your network.',
  };
}

function mockPdf(brief: AiBrief, s: AiStrategy): AiPdf {
  const tiers = ['low', 'medium', 'high'] as const;
  return {
    coverTitle: `${s.title} Report`,
    howToReadTitle: 'How to read your report',
    howToRead: [
      '[Sample] Your scores show how each area performs today and where the biggest improvements are available.',
      'A low score means significant room to improve; a high score means the area is working well and the focus shifts to refinement.',
    ],
    keysHeading: `We have scored you against the following ${s.categories.length} areas:`,
    categories: s.categories.flatMap((c) =>
      tiers.map((tier) => ({
        categoryKey: c.key,
        tier,
        intro: [`[Sample] What a ${tier} score in ${c.label} means for ${brief.audience || 'you'}, and the highest-value improvements to make.`],
        exampleTitle: `Example: improving ${c.label.toLowerCase()}`,
        example: ['[Sample] A short, concrete walkthrough of what this looks like in practice.'],
      }))
    ),
    closingTitle: 'What to do next',
    closing: ['[Sample] Pick your lowest-scoring area and act on it this week.', brief.cta || 'Get in touch to talk through your results.'],
  };
}
