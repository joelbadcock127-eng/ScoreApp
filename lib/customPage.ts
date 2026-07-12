import { CustomPage, CustomPageSlot, ScorecardConfig } from './types';
import { sanitizeRichText } from './richtext';
import { tierFor } from './scoring';

// ————————————————————————————————————————————————————————————————————————
// AI-designed custom pages: sanitising, merge-tag rendering and inline charts.
// The model produces a design shell (HTML + CSS) that references content only
// through merge tags; slot values and live score data are merged in here.
//
// Merge tag grammar (also documented in the generation prompt):
//   {{text:key}}   plain text slot (escaped)
//   {{rich:key}}   limited rich text slot (b/i/u/p/br/a survive)
//   {{image:key}}  image URL slot (use inside src="...")
//   {{scorecard.title}}
// Results pages additionally get live data:
//   {{lead.first_name}} {{lead.last_name}} {{lead.email}} {{lead.business}}
//   {{score.overall}} {{score.total}} {{score.max}}
//   {{tier.key}} {{tier.label}} {{tier.color}} {{tier.headline}} {{tier.body}}
//   {{category:KEY.label}} .percent .tierLabel .color .text
//   {{report.url}}
//   {{#if tier=low}}…{{/if}}  (also tier=low,medium)
//   {{chart:overall}} {{chart:categories}}
// Behaviour hooks: any element with data-start-scorecard opens the lead form.
// ————————————————————————————————————————————————————————————————————————

export function escapeHtml(v: string): string {
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ——— HTML sanitiser (allowlist) ————————————————————————————————————————

const ALLOWED_TAGS = new Set([
  'a', 'abbr', 'article', 'aside', 'b', 'blockquote', 'br', 'button', 'div', 'em',
  'figcaption', 'figure', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header',
  'hr', 'i', 'img', 'li', 'main', 'nav', 'ol', 'p', 'section', 'small', 'span',
  'strong', 'sub', 'sup', 'u', 'ul',
]);

// Tags whose entire content must go, not just the tags themselves.
const STRIP_WITH_CONTENT = ['script', 'style', 'iframe', 'object', 'embed', 'svg', 'math', 'title', 'textarea', 'select', 'noscript'];

const URL_ATTR = new Set(['href', 'src']);

function safeUrl(v: string, allowAnchors = false): string | null {
  const url = v.trim();
  if (!url) return null;
  if (/^(https?:)?\/\//i.test(url)) return url.startsWith('//') ? `https:${url}` : url;
  if (url.startsWith('/') || url.startsWith('{{')) return url; // site-relative or merge tag
  if (allowAnchors && url.startsWith('#')) return url;
  if (/^mailto:|^tel:/i.test(url)) return url;
  return null;
}

function sanitizeStyleValue(v: string): string | null {
  const s = v.replace(/\s+/g, ' ');
  if (/expression|javascript:|behavior|@import|<|>/i.test(s)) return null;
  // url(...) only for https / site-relative / data images
  if (/url\(/i.test(s) && !/url\(\s*['"]?(https:\/\/|\/|data:image\/)/i.test(s)) return null;
  return s;
}

function sanitizeAttrs(tag: string, raw: string): string {
  const out: string[] = [];
  const re = /([a-zA-Z-]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|[^\s"'>]+))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    const name = m[1].toLowerCase();
    const value = m[3] ?? m[4] ?? (m[2] ? String(m[2]) : '');
    if (name.startsWith('on')) continue;
    if (name === 'class' || name === 'id' || name === 'alt' || name === 'title' || name === 'role' || name.startsWith('aria-')) {
      out.push(`${name}="${escapeHtml(value)}"`);
    } else if (name === 'data-start-scorecard' || name === 'data-slot') {
      out.push(value ? `${name}="${escapeHtml(value)}"` : name);
    } else if (URL_ATTR.has(name)) {
      const url = safeUrl(value, name === 'href');
      if (url) out.push(`${name}="${escapeHtml(url)}"`);
    } else if (name === 'target' && value === '_blank') {
      out.push('target="_blank" rel="noopener noreferrer"');
    } else if ((name === 'width' || name === 'height') && /^[0-9%pxem.]+$/.test(value)) {
      out.push(`${name}="${value}"`);
    } else if (name === 'loading' && (value === 'lazy' || value === 'eager')) {
      out.push(`loading="${value}"`);
    } else if (name === 'style') {
      const s = sanitizeStyleValue(value);
      if (s) out.push(`style="${escapeHtml(s)}"`);
    }
  }
  return out.length ? ' ' + out.join(' ') : '';
}

export function sanitizeCustomHtml(html: string): string {
  let out = String(html).replace(/<!--[\s\S]*?-->/g, '');
  for (const tag of STRIP_WITH_CONTENT) {
    out = out.replace(new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi'), '');
    out = out.replace(new RegExp(`<\\/?${tag}[^>]*>`, 'gi'), '');
  }
  out = out.replace(/<\s*(\/?)\s*([a-zA-Z0-9]+)([^>]*?)(\/?)\s*>/g, (_m, slash: string, tag: string, attrs: string, selfClose: string) => {
    const t = tag.toLowerCase();
    if (!ALLOWED_TAGS.has(t)) return '';
    if (slash) return `</${t}>`;
    if (t === 'br' || t === 'hr') return `<${t}>`;
    const cleaned = sanitizeAttrs(t, attrs);
    if (t === 'img') return `<img${cleaned}>`;
    return `<${t}${cleaned}${selfClose ? ' /' : ''}>`;
  });
  return out;
}

export function sanitizeCustomCss(css: string): string {
  return String(css)
    .replace(/<\/?style[^>]*>/gi, '')
    .replace(/@import[^;]*;?/gi, '')
    .replace(/expression\s*\(/gi, '(')
    .replace(/behavior\s*:/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/url\(\s*(['"]?)(?!https:\/\/|\/|data:image\/)[^)]*\)/gi, 'none')
    .replace(/<\//g, '');
}

export function sanitizeCustomPage(page: CustomPage): CustomPage {
  const slots: CustomPageSlot[] = (page.slots ?? [])
    .filter((s) => s && s.key)
    .slice(0, 80)
    .map((s) => ({
      key: String(s.key).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 60),
      type: s.type === 'image' ? 'image' : s.type === 'rich' ? 'rich' : 'text',
      label: String(s.label ?? s.key).slice(0, 80),
      value:
        s.type === 'image'
          ? String(s.value ?? '').slice(0, 500)
          : s.type === 'rich'
            ? sanitizeRichText(String(s.value ?? '')).slice(0, 5000)
            : String(s.value ?? '').slice(0, 2000),
    }));
  return {
    html: sanitizeCustomHtml(String(page.html ?? '')).slice(0, 120000),
    css: sanitizeCustomCss(String(page.css ?? '')).slice(0, 60000),
    slots,
    updatedAt: new Date().toISOString(),
  };
}

// ——— Live data for merge tags ————————————————————————————————————————

export interface CustomPageData {
  scorecardTitle: string;
  lead?: { first_name: string; last_name: string; email: string; business: string };
  overall?: number;
  total?: number;
  max?: number;
  tier?: { key: string; label: string; color: string; headline: string; body: string };
  categories?: {
    key: string;
    label: string;
    percent: number;
    tierLabel: string;
    color: string;
    text: string;
  }[];
  reportUrl?: string;
}

export function buildResultsData(
  config: ScorecardConfig,
  lead: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    business: string;
    overall_percent: number;
    category_scores: { key: string; label: string; percent: number }[];
  }
): CustomPageData {
  const tier = tierFor(lead.overall_percent, config.tiers);
  const intro = config.results.tierIntros[tier.key];
  return {
    scorecardTitle: config.title,
    lead: {
      first_name: lead.first_name,
      last_name: lead.last_name,
      email: lead.email,
      business: lead.business,
    },
    overall: lead.overall_percent,
    tier: {
      key: tier.key,
      label: tier.label,
      color: tier.color,
      headline: intro?.headline ?? '',
      body: (intro?.body ?? []).map((p) => `<p>${sanitizeRichText(p)}</p>`).join(''),
    },
    categories: lead.category_scores.map((c) => {
      const catTier = tierFor(c.percent, config.tiers);
      return {
        key: c.key,
        label: c.label,
        percent: c.percent,
        tierLabel: catTier.label,
        color: catTier.color,
        text: sanitizeRichText(config.results.categoryTexts[c.key]?.[catTier.key] ?? ''),
      };
    }),
    reportUrl: `/api/report/${lead.id}`,
  };
}

// Deterministic sample data so the editor preview shows a realistic result.
export function sampleResultsData(config: ScorecardConfig): CustomPageData {
  const percents = [42, 84, 63, 71, 55, 78];
  return buildResultsData(config, {
    id: 'preview',
    first_name: 'Alex',
    last_name: 'Taylor',
    email: 'alex@example.com',
    business: 'Example Co',
    overall_percent: 68,
    category_scores: config.categories.map((c, i) => ({
      key: c.key,
      label: c.label,
      percent: percents[i % percents.length],
    })),
  });
}

// ——— Inline charts (string SVG/HTML so they work everywhere) ————————————

function overallChart(data: CustomPageData): string {
  const pct = Math.max(0, Math.min(100, data.overall ?? 0));
  const color = data.tier?.color || '#1c78fe';
  const r = 80;
  const c = 2 * Math.PI * r;
  const filled = (pct / 100) * c;
  return (
    `<div class="cp-chart-overall" style="display:flex;justify-content:center;">` +
    `<svg viewBox="0 0 200 200" width="220" height="220" role="img" aria-label="Overall score ${pct}%">` +
    `<circle cx="100" cy="100" r="${r}" fill="none" stroke="#e8eaee" stroke-width="18"></circle>` +
    `<circle cx="100" cy="100" r="${r}" fill="none" stroke="${escapeHtml(color)}" stroke-width="18" stroke-linecap="round" ` +
    `stroke-dasharray="${filled.toFixed(1)} ${(c - filled).toFixed(1)}" transform="rotate(-90 100 100)"></circle>` +
    `<text x="100" y="97" text-anchor="middle" font-size="44" font-weight="700" fill="currentColor">${pct}%</text>` +
    `<text x="100" y="128" text-anchor="middle" font-size="16" fill="${escapeHtml(color)}" font-weight="600">${escapeHtml(
      data.tier?.label ?? ''
    )}</text>` +
    `</svg></div>`
  );
}

function categoriesChart(data: CustomPageData): string {
  const rows = (data.categories ?? [])
    .map(
      (c) =>
        `<div class="cp-chart-row" style="margin:14px 0;">` +
        `<div style="display:flex;justify-content:space-between;font-size:15px;margin-bottom:6px;">` +
        `<span style="font-weight:600;">${escapeHtml(c.label)}</span>` +
        `<span>${c.percent}% · ${escapeHtml(c.tierLabel)}</span></div>` +
        `<div style="background:#e8eaee;border-radius:99px;height:12px;overflow:hidden;">` +
        `<div style="width:${Math.max(0, Math.min(100, c.percent))}%;height:100%;border-radius:99px;background:${escapeHtml(c.color)};"></div>` +
        `</div></div>`
    )
    .join('');
  return `<div class="cp-chart-categories">${rows}</div>`;
}

// ——— Merge ————————————————————————————————————————————————————————————

export function mergeCustomPage(page: CustomPage, data: CustomPageData): string {
  const slotMap = new Map(page.slots.map((s) => [s.key, s]));
  let html = page.html;

  // {{#if tier=low}} … {{/if}} — keep the block only for matching tiers.
  html = html.replace(/\{\{#if\s+tier=([a-z0-9,_-]+)\s*\}\}([\s\S]*?)\{\{\/if\}\}/gi, (_m, keys: string, body: string) =>
    data.tier && keys.toLowerCase().split(',').includes(data.tier.key.toLowerCase()) ? body : ''
  );

  // Charts.
  html = html.replace(/\{\{chart:overall\}\}/gi, () => overallChart(data));
  html = html.replace(/\{\{chart:categories\}\}/gi, () => categoriesChart(data));

  // Slots.
  html = html.replace(/\{\{(text|rich|image):([a-zA-Z0-9_-]+)\}\}/g, (_m, kind: string, key: string) => {
    const slot = slotMap.get(key);
    if (!slot) return '';
    if (kind === 'image') return escapeHtml(slot.value);
    if (kind === 'rich') return sanitizeRichText(slot.value);
    return escapeHtml(slot.value);
  });

  // Data tags.
  const catMap = new Map((data.categories ?? []).map((c) => [c.key, c]));
  html = html.replace(/\{\{category:([a-zA-Z0-9_-]+)\.([a-zA-Z]+)\}\}/g, (_m, key: string, prop: string) => {
    const c = catMap.get(key);
    if (!c) return '';
    if (prop === 'label') return escapeHtml(c.label);
    if (prop === 'percent') return String(c.percent);
    if (prop === 'tierLabel' || prop === 'tier') return escapeHtml(c.tierLabel);
    if (prop === 'color') return escapeHtml(c.color);
    if (prop === 'text') return c.text; // already sanitized rich text
    return '';
  });

  const simple: Record<string, string> = {
    'scorecard.title': escapeHtml(data.scorecardTitle),
    'lead.first_name': escapeHtml(data.lead?.first_name ?? ''),
    'lead.last_name': escapeHtml(data.lead?.last_name ?? ''),
    'lead.email': escapeHtml(data.lead?.email ?? ''),
    'lead.business': escapeHtml(data.lead?.business ?? ''),
    'score.overall': String(data.overall ?? ''),
    'score.total': String(data.total ?? ''),
    'score.max': String(data.max ?? ''),
    'tier.key': escapeHtml(data.tier?.key ?? ''),
    'tier.label': escapeHtml(data.tier?.label ?? ''),
    'tier.color': escapeHtml(data.tier?.color ?? ''),
    'tier.headline': escapeHtml(data.tier?.headline ?? ''),
    'tier.body': data.tier?.body ?? '', // pre-sanitized paragraphs
    'report.url': escapeHtml(data.reportUrl ?? '#'),
  };
  html = html.replace(/\{\{([a-zA-Z.:_-]+)\}\}/g, (_m, tag: string) => simple[tag] ?? '');

  return html;
}

// Full document for the editor's iframe preview (isolated from app styles).
export function buildPreviewSrcdoc(page: CustomPage, data: CustomPageData): string {
  return (
    '<!doctype html><html><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    `<style>*,*::before,*::after{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,sans-serif}img{max-width:100%}${page.css}</style>` +
    '</head><body>' +
    mergeCustomPage(page, data) +
    '</body></html>'
  );
}
