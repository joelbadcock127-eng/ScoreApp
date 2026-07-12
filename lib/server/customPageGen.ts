import Anthropic from '@anthropic-ai/sdk';
import { CustomPage, ScorecardConfig } from '../types';
import { sanitizeCustomPage } from '../customPage';
import { stripTags } from '../richtext';

// AI-designed custom pages: the model writes a full responsive HTML/CSS page
// but must reference every piece of editable content through merge tags
// backed by slots — so the editor keeps working and redesigns never eat
// copy edits. Design generation uses Sonnet (design quality matters far more
// here than in copywriting); without an API key we fall back to a hand-built
// sample template so the flow can be tested for free.

const DESIGN_MODEL = 'claude-sonnet-5';
// Edits are much cheaper on Haiku and usually small, targeted changes.
// Set AI_EDIT_MODEL=claude-sonnet-5 if you want top design quality on edits too.
const EDIT_MODEL = process.env.AI_EDIT_MODEL || 'claude-haiku-4-5';

function mockMode(): boolean {
  return process.env.AI_BUILDER_MOCK === '1' || !process.env.ANTHROPIC_API_KEY;
}

export function customPageStatus() {
  return { mock: mockMode() };
}

const PAGE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['html', 'css', 'slots'],
  properties: {
    html: { type: 'string' },
    css: { type: 'string' },
    slots: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['key', 'type', 'label', 'value'],
        properties: {
          key: { type: 'string' },
          type: { type: 'string', enum: ['text', 'rich', 'image'] },
          label: { type: 'string' },
          value: { type: 'string' },
        },
      },
    },
  },
} as const;

const SHARED_RULES = `
RULES for the HTML you produce:
- One single root element: <div class="cp-page"> … </div>. Scope EVERY CSS selector under .cp-page.
- Plain HTML + CSS only. No <script>, <style>, <svg>, <iframe>, <form>, no event handler attributes, no external CSS/JS. Decorative shapes must be CSS (gradients, borders, border-radius, pseudo-elements).
- Mobile-first responsive: fluid widths, CSS grid/flex that stacks on small screens, no fixed pixel page widths, readable at 375px wide and great on desktop. Use clamp() for display type sizes.
- EVERY piece of visible copy must come from a merge tag — never hardcode copy in the HTML:
  {{text:key}} for plain text, {{rich:key}} for short passages that may contain bold/italic, {{image:key}} inside src="" for images.
  For every tag you use, include a matching entry in "slots" with a sensible label and the actual copy as its value (write the copy — do not leave placeholders like "lorem").
- Buttons that should start the scorecard: <button data-start-scorecard class="...">{{text:ctaLabel}}</button> (any element with data-start-scorecard works). Include at least one prominent one.
- Design quality bar: this must look like a hand-crafted premium marketing page, not a generic template. Strong typographic hierarchy, generous whitespace, cohesive palette built from the brand colours, subtle depth (soft shadows / gradient accents). No lorem ipsum, no emoji soup.
- CSS goes in the "css" field only (never inside html), all selectors prefixed with .cp-page.`;

const RESULTS_RULES = `
Extra merge tags available on this RESULTS page (live per-lead data — use them, do not invent slot copy for data):
  {{lead.first_name}} {{lead.business}} — greet the reader personally.
  {{score.overall}} — overall percentage number. {{tier.label}} {{tier.color}} — their result tier.
  {{tier.headline}} {{tier.body}} — the tier-specific result copy (body is pre-formatted paragraphs; place inside a <div>).
  Charts (pre-rendered, inherit text colour from their container — pick the 2–3 that best fit your design; always include one overall chart and one per-category chart):
    {{chart:overall}} donut of the overall score · {{chart:gauge}} speedometer with tier-coloured segments and needle ·
    {{chart:categories}} horizontal per-category score bars · {{chart:donuts}} a small donut per category ·
    {{chart:radar}} spider/radar chart of the categories · {{chart:tiers}} horizontal tier band with a marker at the score.
  {{category:KEY.label}} {{category:KEY.percent}} {{category:KEY.tierLabel}} {{category:KEY.color}} {{category:KEY.text}} — per-category values and tier-specific advice text; build one block/card per category using the exact KEYs listed below.
  {{report.url}} — href for the "open your PDF report" button/link (plain <a> tag, not data-start-scorecard).
  Conditional blocks: {{#if tier=low}}…{{/if}} (also tier=low,medium) to show different sections per result tier.`;

function landingSeed(config: ScorecardConfig): string {
  const l = config.landing;
  return [
    `Scorecard title: ${config.title}`,
    `Hero title: ${stripTags(l.heroTitle)}`,
    `Hero subtitle: ${stripTags(l.heroSubtitle)}`,
    `Hero body: ${stripTags(l.heroBody)}`,
    `Hero bullets: ${l.heroBullets.map(stripTags).join(' | ')}`,
    `CTA label: ${stripTags(l.heroCta)}`,
    `Section: ${stripTags(l.howItWorksTitle)} — ${stripTags(l.howItWorksBody)}`,
    `Categories: ${config.categories.map((c) => c.label).join(', ')}`,
    ...l.categoryCards.map((c) => `Category card "${stripTags(c.title)}": ${stripTags(c.body)} (image: ${c.image || 'none'})`),
    `Bottom CTA: ${stripTags(l.bottomTitle)} — ${stripTags(l.bottomBody)} — button: ${stripTags(l.bottomCta)} — note: ${stripTags(l.bottomNote)}`,
    config.branding.logoUrl ? `Logo image URL: ${config.branding.logoUrl}` : 'No logo image — use the business name as a wordmark.',
  ].join('\n');
}

function resultsSeed(config: ScorecardConfig): string {
  const r = config.results;
  return [
    `Scorecard title: ${config.title}`,
    `Overall heading: ${stripTags(r.overallHeading)}`,
    `Category section heading: ${stripTags(r.categoryHeading)} — ${r.categorySub.map(stripTags).join(' ')}`,
    `Category KEYS and labels: ${config.categories.map((c) => `${c.key} = "${c.label}"`).join('; ')}`,
    `Tiers: ${config.tiers.map((t) => `${t.key} (“${t.label}”, ${t.from}–${t.to}%)`).join('; ')}`,
    `CTA section: ${stripTags(r.cta.heading)} — left: ${stripTags(r.cta.leftTitle)} (${stripTags(r.cta.leftButton)}, links to the PDF report) — right: ${stripTags(r.cta.rightTitle)}: ${stripTags(r.cta.rightBody)} (${stripTags(r.cta.rightButton)})`,
    config.branding.logoUrl ? `Logo image URL: ${config.branding.logoUrl}` : 'No logo image — use the business name as a wordmark.',
  ].join('\n');
}

export async function generateCustomPage(
  config: ScorecardConfig,
  page: 'landing' | 'results',
  instructions?: string
): Promise<CustomPage> {
  if (mockMode()) {
    return sanitizeCustomPage(page === 'landing' ? mockLanding(config) : mockResults(config));
  }

  const brand = `Brand: primary colour ${config.branding.primaryColor}, secondary/dark colour ${config.branding.secondaryColor}. Heading font ${config.branding.headingFont || 'Inter'}, body font ${config.branding.bodyFont || 'Inter'} (system fallbacks are fine).`;
  const prompt =
    page === 'landing'
      ? `Design the LANDING page for a lead-generation scorecard. Its only goal is getting the visitor to click a data-start-scorecard button.\n\n${brand}\n\nContent to design around (use this copy as the slot values, improving phrasing only where it is clearly placeholder text):\n${landingSeed(config)}\n${SHARED_RULES}\n${instructions ? `\nDesign direction from the owner (follow it): ${instructions}` : ''}`
      : `Design the RESULTS page a lead sees after completing a scorecard: personal greeting, overall score with chart, tier result copy, per-category breakdown with advice, then next-step CTAs (PDF report + contact).\n\n${brand}\n\nContent to design around:\n${resultsSeed(config)}\n${SHARED_RULES}\n${RESULTS_RULES}\n${instructions ? `\nDesign direction from the owner (follow it): ${instructions}` : ''}`;

  const client = new Anthropic();
  const stream = client.messages.stream({
    model: DESIGN_MODEL,
    max_tokens: 24000,
    system:
      'You are a senior web designer producing production-quality, responsive marketing pages as HTML + CSS with a merge-tag content system. You follow the tag grammar exactly and respond with JSON matching the requested schema.',
    messages: [{ role: 'user', content: prompt }],
    output_config: { format: { type: 'json_schema', schema: PAGE_SCHEMA as unknown as Record<string, unknown> } },
  });
  const response = await stream.finalMessage();
  if (response.stop_reason === 'max_tokens') throw new Error('The design ran out of space — try again with simpler instructions.');
  const text = response.content.find((b) => b.type === 'text');
  if (!text || text.type !== 'text') throw new Error('The model returned no design.');
  const raw = JSON.parse(text.text) as CustomPage;
  return repairPage(sanitizeCustomPage(raw));
}

// ——— Chat edits ———————————————————————————————————————————————————————

const EDIT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['html', 'css', 'slots', 'changeSummary'],
  properties: {
    ...PAGE_SCHEMA.properties,
    changeSummary: { type: 'string' },
  },
} as const;

export interface CustomPageEdit {
  customPage: CustomPage;
  changeSummary: string;
}

// Apply a conversational edit ("make the hero darker", "add a testimonials
// section") to an existing custom page. The model returns the complete
// updated page plus a one-line summary for the chat thread.
export async function editCustomPage(
  config: ScorecardConfig,
  page: 'landing' | 'results',
  current: CustomPage,
  instruction: string
): Promise<CustomPageEdit> {
  if (mockMode()) return mockEdit(current, instruction);

  const prompt =
    `You are editing an existing custom ${page} page for the scorecard "${config.title}". ` +
    `Apply ONLY the requested change and keep everything else identical — same structure, same merge tags, same slot keys, and the SAME slot values unless the request is about the copy itself. ` +
    `You may add new slots (with written copy) if the request adds new content, and remove slots whose tags you remove.\n` +
    `${SHARED_RULES}\n${page === 'results' ? RESULTS_RULES + '\n' : ''}` +
    `\nCURRENT CSS:\n${current.css}\n\nCURRENT HTML:\n${current.html}\n\nCURRENT SLOTS (JSON):\n${JSON.stringify(current.slots)}\n\n` +
    `REQUESTED CHANGE: ${instruction}\n\n` +
    `Return the complete updated page (full html, full css, full slots array) plus changeSummary: one plain sentence describing what you changed.`;

  const client = new Anthropic();
  const stream = client.messages.stream({
    model: EDIT_MODEL,
    max_tokens: 24000,
    system:
      'You are a senior web designer making precise edits to an existing HTML/CSS page that uses a merge-tag content system. You change only what is asked, preserve everything else byte-for-byte where possible, and respond with JSON matching the requested schema.',
    messages: [{ role: 'user', content: prompt }],
    output_config: { format: { type: 'json_schema', schema: EDIT_SCHEMA as unknown as Record<string, unknown> } },
  });
  const response = await stream.finalMessage();
  if (response.stop_reason === 'max_tokens') throw new Error('The edit ran out of space — try a smaller change.');
  const text = response.content.find((b) => b.type === 'text');
  if (!text || text.type !== 'text') throw new Error('The model returned no edit.');
  const raw = JSON.parse(text.text) as CustomPage & { changeSummary: string };
  return {
    customPage: repairPage(sanitizeCustomPage(raw)),
    changeSummary: String(raw.changeSummary ?? 'Updated the design.').slice(0, 300),
  };
}

// Sample-mode edits: a few keyword-driven demo changes so the chat flow can
// be exercised without an API key.
function mockEdit(current: CustomPage, instruction: string): CustomPageEdit {
  const wants = instruction.toLowerCase();
  let css = current.css;
  let summary: string;
  if (/dark|night|black/.test(wants)) {
    css += `\n.cp-page{background:#0f172a !important;color:#e2e8f0}.cp-page h1,.cp-page h2,.cp-page h3{color:#f1f5f9 !important}.cp-page p{color:#94a3b8}.cp-page .cp-card{background:#1e293b !important;border-color:#334155 !important}.cp-page .cp-card p{color:#94a3b8 !important}`;
    summary = 'Sample mode: switched the page to a dark theme.';
  } else if (/round|pill/.test(wants)) {
    css += `\n.cp-page .cp-btn{border-radius:999px !important}.cp-page .cp-card{border-radius:28px !important}`;
    summary = 'Sample mode: rounded off the buttons and cards.';
  } else if (/big|larger|bold/.test(wants)) {
    css += `\n.cp-page h1{font-size:clamp(42px,7vw,76px) !important;font-weight:900}`;
    summary = 'Sample mode: made the headline bigger and bolder.';
  } else {
    css += `\n.cp-page .cp-btn{box-shadow:0 10px 28px rgba(0,0,0,.18)}`;
    summary =
      'Sample mode can only demo a few changes (try “dark theme”, “rounder buttons”, “bigger headline”). Add ANTHROPIC_API_KEY for real AI edits.';
  }
  return { customPage: { ...current, css, updatedAt: new Date().toISOString() }, changeSummary: summary };
}

// Ensure every merge tag referenced in the HTML has a slot behind it.
function repairPage(page: CustomPage): CustomPage {
  const have = new Set(page.slots.map((s) => s.key));
  const re = /\{\{(text|rich|image):([a-zA-Z0-9_-]+)\}\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(page.html))) {
    const [, kind, key] = m;
    if (!have.has(key)) {
      have.add(key);
      page.slots.push({
        key,
        type: kind === 'image' ? 'image' : kind === 'rich' ? 'rich' : 'text',
        label: key.replace(/[-_]/g, ' '),
        value: '',
      });
    }
  }
  return page;
}

// ——— Sample-mode templates (no API key needed) ————————————————————————

function mockLanding(config: ScorecardConfig): CustomPage {
  const l = config.landing;
  return {
    html: `<div class="cp-page">
  <header class="cp-nav"><span class="cp-wordmark">{{text:brandName}}</span><button data-start-scorecard class="cp-btn cp-btn-sm">{{text:navCta}}</button></header>
  <section class="cp-hero">
    <div class="cp-hero-inner">
      <p class="cp-kicker">{{text:kicker}}</p>
      <h1>{{text:heroTitle}}</h1>
      <p class="cp-sub">{{rich:heroSubtitle}}</p>
      <button data-start-scorecard class="cp-btn cp-btn-lg">{{text:heroCta}}</button>
      <p class="cp-note">{{text:heroNote}}</p>
    </div>
  </section>
  <section class="cp-cats">
    <h2>{{text:catsTitle}}</h2>
    <p class="cp-cats-sub">{{rich:catsBody}}</p>
    <div class="cp-grid">${config.categories
      .map(
        (c, i) => `
      <div class="cp-card"><span class="cp-card-n">${String(i + 1).padStart(2, '0')}</span><h3>{{text:cat${i}Title}}</h3><p>{{text:cat${i}Body}}</p></div>`
      )
      .join('')}
    </div>
  </section>
  <section class="cp-cta">
    <h2>{{text:bottomTitle}}</h2>
    <p>{{rich:bottomBody}}</p>
    <button data-start-scorecard class="cp-btn cp-btn-lg cp-btn-invert">{{text:bottomCta}}</button>
    <p class="cp-note">{{text:bottomNote}}</p>
  </section>
  <footer class="cp-footer">{{text:footerText}}</footer>
</div>`,
    css: `.cp-page{--p:${config.branding.primaryColor};--d:${config.branding.secondaryColor};font-family:Inter,system-ui,sans-serif;color:#14181f;background:#fff}
.cp-page .cp-nav{display:flex;justify-content:space-between;align-items:center;padding:18px clamp(20px,5vw,56px)}
.cp-page .cp-wordmark{font-weight:800;letter-spacing:-0.02em;font-size:18px;color:var(--d)}
.cp-page .cp-hero{background:radial-gradient(1200px 500px at 70% -10%,color-mix(in srgb,var(--p) 18%,#fff),#fff);padding:clamp(48px,9vw,110px) 20px;text-align:center}
.cp-page .cp-hero-inner{max-width:760px;margin:0 auto}
.cp-page .cp-kicker{display:inline-block;background:color-mix(in srgb,var(--p) 12%,#fff);color:var(--p);font-weight:600;font-size:13px;letter-spacing:.08em;text-transform:uppercase;padding:6px 14px;border-radius:99px}
.cp-page h1{font-size:clamp(34px,6vw,60px);line-height:1.05;letter-spacing:-0.03em;margin:22px 0 0;color:var(--d)}
.cp-page .cp-sub{font-size:clamp(17px,2.2vw,21px);color:#4c5560;margin:20px auto 0;max-width:600px;line-height:1.55}
.cp-page .cp-btn{background:var(--p);color:#fff;border:0;border-radius:12px;font-weight:600;cursor:pointer;transition:transform .15s,box-shadow .15s}
.cp-page .cp-btn:hover{transform:translateY(-1px);box-shadow:0 12px 30px color-mix(in srgb,var(--p) 35%,transparent)}
.cp-page .cp-btn-sm{padding:10px 18px;font-size:14px}
.cp-page .cp-btn-lg{padding:16px 34px;font-size:17px;margin-top:30px}
.cp-page .cp-note{font-size:13px;color:#7a828c;margin-top:12px}
.cp-page .cp-cats{max-width:1080px;margin:0 auto;padding:clamp(48px,8vw,90px) 20px;text-align:center}
.cp-page h2{font-size:clamp(26px,4vw,38px);letter-spacing:-0.02em;color:var(--d);margin:0}
.cp-page .cp-cats-sub{color:#4c5560;max-width:640px;margin:14px auto 40px;line-height:1.6}
.cp-page .cp-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:18px;text-align:left}
.cp-page .cp-card{border:1px solid #e7eaee;border-radius:16px;padding:26px;background:#fff;box-shadow:0 6px 24px rgba(16,24,40,.05)}
.cp-page .cp-card-n{font-weight:800;color:var(--p);font-size:13px;letter-spacing:.1em}
.cp-page .cp-card h3{margin:10px 0 8px;font-size:19px;color:var(--d)}
.cp-page .cp-card p{margin:0;color:#4c5560;font-size:15px;line-height:1.55}
.cp-page .cp-cta{background:var(--d);color:#fff;text-align:center;padding:clamp(48px,8vw,90px) 20px}
.cp-page .cp-cta h2{color:#fff}
.cp-page .cp-cta p{color:rgba(255,255,255,.75);max-width:560px;margin:14px auto 0;line-height:1.6}
.cp-page .cp-btn-invert{background:#fff;color:var(--d)}
.cp-page .cp-cta .cp-note{color:rgba(255,255,255,.55)}
.cp-page .cp-footer{text-align:center;padding:26px;color:#7a828c;font-size:13px}`,
    slots: [
      { key: 'brandName', type: 'text', label: 'Brand name', value: config.title },
      { key: 'navCta', type: 'text', label: 'Nav button', value: stripTags(config.landing.heroCta) || 'Start now' },
      { key: 'kicker', type: 'text', label: 'Kicker', value: 'Free assessment' },
      { key: 'heroTitle', type: 'text', label: 'Hero title', value: stripTags(l.heroTitle) },
      { key: 'heroSubtitle', type: 'rich', label: 'Hero subtitle', value: stripTags(l.heroSubtitle) },
      { key: 'heroCta', type: 'text', label: 'Hero button', value: stripTags(l.heroCta) },
      { key: 'heroNote', type: 'text', label: 'Hero note', value: stripTags(l.bottomNote) },
      { key: 'catsTitle', type: 'text', label: 'Categories title', value: stripTags(l.howItWorksTitle) },
      { key: 'catsBody', type: 'rich', label: 'Categories intro', value: stripTags(l.howItWorksBody) },
      ...config.categories.flatMap((c, i) => [
        { key: `cat${i}Title`, type: 'text' as const, label: `${c.label} — title`, value: stripTags(l.categoryCards[i]?.title ?? c.label) },
        { key: `cat${i}Body`, type: 'text' as const, label: `${c.label} — body`, value: stripTags(l.categoryCards[i]?.body ?? c.description ?? '') },
      ]),
      { key: 'bottomTitle', type: 'text', label: 'Bottom title', value: stripTags(l.bottomTitle) },
      { key: 'bottomBody', type: 'rich', label: 'Bottom body', value: stripTags(l.bottomBody) },
      { key: 'bottomCta', type: 'text', label: 'Bottom button', value: stripTags(l.bottomCta) },
      { key: 'bottomNote', type: 'text', label: 'Bottom note', value: stripTags(l.bottomNote) },
      { key: 'footerText', type: 'text', label: 'Footer', value: config.copyright },
    ],
  };
}

function mockResults(config: ScorecardConfig): CustomPage {
  return {
    html: `<div class="cp-page">
  <header class="cp-nav"><span class="cp-wordmark">{{text:brandName}}</span></header>
  <section class="cp-hero">
    <p class="cp-kicker">{{text:kicker}}</p>
    <h1>{{text:greeting}} {{lead.first_name}}</h1>
    <p class="cp-sub">{{tier.headline}}</p>
    <div class="cp-score">{{chart:overall}}</div>
    <div class="cp-tierbody">{{tier.body}}</div>
  </section>
  <section class="cp-breakdown">
    <h2>{{text:breakdownTitle}}</h2>
    <p class="cp-cats-sub">{{text:breakdownSub}}</p>
    {{chart:categories}}
    <div class="cp-grid">${config.categories
      .map(
        (c) => `
      <div class="cp-card"><div class="cp-card-top"><h3>{{category:${c.key}.label}}</h3><span class="cp-pill" style="background:{{category:${c.key}.color}}">{{category:${c.key}.percent}}%</span></div><p>{{category:${c.key}.text}}</p></div>`
      )
      .join('')}
    </div>
  </section>
  <section class="cp-cta">
    <h2>{{text:ctaTitle}}</h2>
    <p>{{rich:ctaBody}}</p>
    <a class="cp-btn cp-btn-lg cp-btn-invert" href="{{report.url}}" target="_blank">{{text:reportCta}}</a>
  </section>
  <footer class="cp-footer">{{text:footerText}}</footer>
</div>`,
    css: `.cp-page{--p:${config.branding.primaryColor};--d:${config.branding.secondaryColor};font-family:Inter,system-ui,sans-serif;color:#14181f;background:#fff}
.cp-page .cp-nav{display:flex;justify-content:center;padding:18px}
.cp-page .cp-wordmark{font-weight:800;font-size:18px;color:var(--d)}
.cp-page .cp-hero{background:radial-gradient(1100px 460px at 50% -10%,color-mix(in srgb,var(--p) 16%,#fff),#fff);padding:clamp(36px,7vw,80px) 20px;text-align:center}
.cp-page .cp-kicker{display:inline-block;background:color-mix(in srgb,var(--p) 12%,#fff);color:var(--p);font-weight:600;font-size:13px;letter-spacing:.08em;text-transform:uppercase;padding:6px 14px;border-radius:99px}
.cp-page h1{font-size:clamp(30px,5vw,48px);letter-spacing:-0.03em;margin:20px 0 0;color:var(--d)}
.cp-page .cp-sub{font-size:clamp(17px,2.2vw,22px);color:#4c5560;margin:14px auto 0;max-width:620px;font-weight:600}
.cp-page .cp-score{margin:26px auto 0;color:var(--d)}
.cp-page .cp-tierbody{max-width:640px;margin:8px auto 0;color:#4c5560;line-height:1.65;text-align:left}
.cp-page .cp-breakdown{max-width:900px;margin:0 auto;padding:clamp(40px,7vw,80px) 20px;text-align:center}
.cp-page h2{font-size:clamp(24px,4vw,34px);letter-spacing:-0.02em;color:var(--d);margin:0}
.cp-page .cp-cats-sub{color:#4c5560;max-width:600px;margin:12px auto 34px;line-height:1.6}
.cp-page .cp-chart-categories{max-width:620px;margin:0 auto 40px;text-align:left}
.cp-page .cp-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px;text-align:left}
.cp-page .cp-card{border:1px solid #e7eaee;border-radius:16px;padding:24px;background:#fff;box-shadow:0 6px 24px rgba(16,24,40,.05)}
.cp-page .cp-card-top{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px}
.cp-page .cp-card h3{margin:0;font-size:18px;color:var(--d)}
.cp-page .cp-pill{color:#fff;font-weight:700;font-size:13px;border-radius:99px;padding:4px 12px}
.cp-page .cp-card p{margin:0;color:#4c5560;font-size:15px;line-height:1.6}
.cp-page .cp-cta{background:var(--d);color:#fff;text-align:center;padding:clamp(40px,7vw,80px) 20px}
.cp-page .cp-cta h2{color:#fff}
.cp-page .cp-cta p{color:rgba(255,255,255,.75);max-width:560px;margin:14px auto 0;line-height:1.6}
.cp-page .cp-btn{display:inline-block;text-decoration:none;background:var(--p);color:#fff;border:0;border-radius:12px;font-weight:600;cursor:pointer}
.cp-page .cp-btn-lg{padding:16px 34px;font-size:17px;margin-top:28px}
.cp-page .cp-btn-invert{background:#fff;color:var(--d)}
.cp-page .cp-footer{text-align:center;padding:26px;color:#7a828c;font-size:13px}`,
    slots: [
      { key: 'brandName', type: 'text', label: 'Brand name', value: config.title },
      { key: 'kicker', type: 'text', label: 'Kicker', value: 'Your results' },
      { key: 'greeting', type: 'text', label: 'Greeting (before first name)', value: 'Great work,' },
      { key: 'breakdownTitle', type: 'text', label: 'Breakdown title', value: stripTags(config.results.categoryHeading) },
      { key: 'breakdownSub', type: 'text', label: 'Breakdown subtitle', value: stripTags(config.results.categorySub[0] ?? '') },
      { key: 'ctaTitle', type: 'text', label: 'CTA title', value: stripTags(config.results.cta.heading) },
      { key: 'ctaBody', type: 'rich', label: 'CTA body', value: stripTags(config.results.cta.leftBody) },
      { key: 'reportCta', type: 'text', label: 'Report button', value: stripTags(config.results.cta.leftButton) },
      { key: 'footerText', type: 'text', label: 'Footer', value: config.copyright },
    ],
  };
}
