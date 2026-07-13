import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/server/auth';
import { getConfig, saveConfig } from '@/lib/server/config';
import { sanitizeRichText } from '@/lib/richtext';
import { sanitizeCustomPage } from '@/lib/customPage';
import {
  ButtonAction,
  Category,
  LeadFormField,
  Question,
  QuestionOption,
  QuestionType,
  QuestionsPageConfig,
  Tier,
} from '@/lib/types';

const QUESTION_TYPES: QuestionType[] = ['scale', 'yes_no', 'buttons', 'checkboxes', 'radio', 'text'];
const ALIGNS = ['left', 'center', 'right'] as const;

function color(v: unknown, fallback: string) {
  return /^#[0-9a-fA-F]{6}$/.test(String(v)) ? String(v) : fallback;
}
function align(v: unknown, fallback: 'left' | 'center' | 'right') {
  return ALIGNS.includes(v as (typeof ALIGNS)[number]) ? (v as 'left' | 'center' | 'right') : fallback;
}
function num(v: unknown, fallback: number, min: number, max: number) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
}

const ACTION_TYPES = ['lead-form', 'page', 'url', 'report', 'details'] as const;
const ACTION_PAGES = ['landing', 'quiz', 'results'] as const;
function action(v: unknown, fallback: ButtonAction | undefined): ButtonAction | undefined {
  if (!v || typeof v !== 'object') return fallback;
  const a = v as ButtonAction;
  if (!ACTION_TYPES.includes(a.type)) return fallback;
  return {
    type: a.type,
    page: ACTION_PAGES.includes(a.page as (typeof ACTION_PAGES)[number]) ? a.page : undefined,
    url: a.url ? String(a.url).slice(0, 500) : undefined,
  };
}

const EXTRA_TYPES = [
  'banner2', 'form', 'cta2', 'testimonials', 'categories2', 'video', 'html', 'content', 'faq',
  'overall-score', 'radar', 'thermometer', 'traffic-light', 'speed', 'donut',
];

// Shared sanitiser for gallery-added sections (landing + results pages).
function sanitizeExtras(v: unknown): ReturnType<typeof mapExtra>[] | undefined {
  if (!Array.isArray(v)) return undefined;
  return v.slice(0, 20).map(mapExtra).filter((x) => x.id);
}
function mapExtra(x: Record<string, unknown>) {
  return {
    id: String(x.id ?? '').replace(/[^a-z0-9]/gi, '').slice(0, 30),
    type: (EXTRA_TYPES.includes(String(x.type)) ? String(x.type) : 'content') as never,
    style: x.style != null ? String(x.style).slice(0, 30) : undefined,
    title: x.title != null ? sanitizeRichText(String(x.title)).slice(0, 300) : undefined,
    body: x.body != null ? sanitizeRichText(String(x.body)).slice(0, 2000) : undefined,
    button: x.button != null ? sanitizeRichText(String(x.button)).slice(0, 120) : undefined,
    action: action(x.action, undefined),
    image: x.image != null ? String(x.image).slice(0, 500) : undefined,
    url: x.url != null ? String(x.url).slice(0, 500) : undefined,
    html: x.html != null ? String(x.html).slice(0, 20000) : undefined,
    items: Array.isArray(x.items)
      ? (x.items as Record<string, string>[]).slice(0, 12).map((it) => ({
          title: sanitizeRichText(String(it.title ?? '')).slice(0, 300),
          body: sanitizeRichText(String(it.body ?? '')).slice(0, 1500),
          meta: it.meta != null ? sanitizeRichText(String(it.meta)).slice(0, 200) : undefined,
        }))
      : undefined,
    chartPosition: x.chartPosition === 'left' ? ('left' as const) : x.chartPosition === 'right' ? ('right' as const) : undefined,
    format: x.format === 'outof100' ? ('outof100' as const) : x.format === 'percent' ? ('percent' as const) : undefined,
    showTiers: x.showTiers != null ? Boolean(x.showTiers) : undefined,
    showEmailNote: x.showEmailNote != null ? Boolean(x.showEmailNote) : undefined,
    color: x.color != null && /^#[0-9a-fA-F]{6}$/.test(String(x.color)) ? String(x.color) : undefined,
  };
}

// PUT accepts any of: tiers, leadForm, title, copyright, branding, landing,
// questions, categories, questionsPage — used by the settings pages and the
// full-screen page editors. Admin-only.
export async function PUT(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const config = await getConfig();

  if (Array.isArray(body.tiers)) {
    const tiers: Tier[] = body.tiers.map((t: Tier) => ({
      key: String(t.key || t.label).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      label: String(t.label).slice(0, 60),
      color: color(t.color, '#616366'),
      from: num(t.from, 0, 0, 100),
      to: num(t.to, 0, 0, 100),
    }));
    if (!tiers.length) return NextResponse.json({ error: 'At least one tier required' }, { status: 400 });
    config.tiers = tiers;
  }

  if (body.leadForm) {
    const fields: LeadFormField[] = (body.leadForm.fields ?? []).map((f: LeadFormField) => ({
      key: String(f.key),
      label: String(f.label).slice(0, 500),
      type: f.type === 'checkbox' ? 'checkbox' : f.type === 'email' ? 'email' : 'text',
      required: Boolean(f.required),
      enabled: Boolean(f.enabled),
    }));
    config.leadForm = {
      heading: String(body.leadForm.heading ?? config.leadForm.heading).slice(0, 300),
      submitLabel: String(body.leadForm.submitLabel ?? config.leadForm.submitLabel).slice(0, 60),
      fields: fields.length ? fields : config.leadForm.fields,
    };
  }

  if (typeof body.title === 'string') config.title = body.title.slice(0, 120);
  if (typeof body.copyright === 'string') config.copyright = sanitizeRichText(body.copyright).slice(0, 200);

  if (body.branding && typeof body.branding === 'object') {
    const b = body.branding;
    config.branding = {
      ...config.branding,
      logoUrl: String(b.logoUrl ?? config.branding.logoUrl).slice(0, 500),
      iconUrl: String(b.iconUrl ?? config.branding.iconUrl).slice(0, 500),
      primaryColor: color(b.primaryColor, config.branding.primaryColor),
      secondaryColor: color(b.secondaryColor, config.branding.secondaryColor),
      backgroundColor: b.backgroundColor != null ? color(b.backgroundColor, '#ffffff') : config.branding.backgroundColor,
      headingTextColor:
        b.headingTextColor != null ? color(b.headingTextColor, '#0c0d0d') : config.branding.headingTextColor,
      bodyTextColor: b.bodyTextColor != null ? color(b.bodyTextColor, '#616366') : config.branding.bodyTextColor,
      headingFont: b.headingFont != null ? String(b.headingFont).slice(0, 80) : config.branding.headingFont,
      headingSize: b.headingSize != null ? num(b.headingSize, 48, 10, 120) : config.branding.headingSize,
      bodyFont: b.bodyFont != null ? String(b.bodyFont).slice(0, 80) : config.branding.bodyFont,
      bodySize: b.bodySize != null ? num(b.bodySize, 16, 8, 48) : config.branding.bodySize,
    };
  }

  if (Array.isArray(body.categories)) {
    const categories: Category[] = body.categories
      .map((c: Category) => ({
        key: String(c.key).toLowerCase().replace(/[^a-z0-9-]+/g, '-'),
        label: String(c.label).slice(0, 80),
        description: c.description != null ? String(c.description).slice(0, 500) : undefined,
        icon: c.icon != null ? String(c.icon).slice(0, 300) : undefined,
      }))
      .filter((c: Category) => c.key && c.label);
    if (!categories.length) return NextResponse.json({ error: 'At least one category required' }, { status: 400 });
    config.categories = categories;
  }

  if (Array.isArray(body.questions)) {
    const catKeys = new Set(config.categories.map((c) => c.key));
    const questions: Question[] = body.questions
      .map((q: Question) => {
        const type = QUESTION_TYPES.includes(q.type as QuestionType) ? (q.type as QuestionType) : 'scale';
        const min = num(q.min, 1, 0, 10);
        const max = Math.max(min + 1, num(q.max, 5, 1, 11));
        const options: QuestionOption[] | undefined = Array.isArray(q.options)
          ? q.options
              .map((o: QuestionOption) => ({
                label: String(o.label).slice(0, 300),
                score: num(o.score, 0, 0, 100),
              }))
              .slice(0, 20)
          : undefined;
        return {
          id: String(q.id).slice(0, 40),
          category: catKeys.has(String(q.category)) ? String(q.category) : config.categories[0].key,
          type,
          text: sanitizeRichText(String(q.text)).slice(0, 2000),
          instruction: q.instruction != null ? String(q.instruction).slice(0, 500) : undefined,
          required: q.required != null ? Boolean(q.required) : undefined,
          min,
          max,
          start: num(q.start, min, min, max),
          labels: {
            left: String(q.labels?.left ?? '').slice(0, 120),
            center: String(q.labels?.center ?? '').slice(0, 120),
            right: String(q.labels?.right ?? '').slice(0, 120),
          },
          options,
        };
      })
      .filter((q: Question) => q.id && q.text);
    if (!questions.length) return NextResponse.json({ error: 'At least one question required' }, { status: 400 });
    config.questions = questions;
  }

  if (body.questionsPage && typeof body.questionsPage === 'object') {
    const p = body.questionsPage as QuestionsPageConfig;
    config.questionsPage = {
      header: {
        show: Boolean(p.header?.show),
        align: align(p.header?.align, 'center'),
        maxWidth: num(p.header?.maxWidth, 250, 40, 600),
        topMargin: num(p.header?.topMargin, 13, 0, 120),
        bottomMargin: num(p.header?.bottomMargin, 13, 0, 120),
      },
      questions: {
        align: align(p.questions?.align, 'center'),
        showBack: Boolean(p.questions?.showBack),
        showCategory: Boolean(p.questions?.showCategory),
        optionTextColor: color(p.questions?.optionTextColor, '#152042'),
        buttonColor: color(p.questions?.buttonColor, '#1c78fe'),
        questionTextColor: color(p.questions?.questionTextColor, '#152042'),
        backgroundColor: color(p.questions?.backgroundColor, '#ffffff'),
      },
      progress: { show: Boolean(p.progress?.show) },
      footer: { show: Boolean(p.footer?.show) },
    };
  }

  if (body.results && typeof body.results === 'object') {
    const res = body.results;
    const cur = config.results;
    const str = (v: unknown, fallback: string, len = 4000) =>
      v != null ? sanitizeRichText(String(v)).slice(0, len) : fallback;
    const strArr = (v: unknown, fallback: string[], len = 4000) =>
      Array.isArray(v) ? v.map((x) => sanitizeRichText(String(x)).slice(0, len)).slice(0, 12) : fallback;
    const tierRecord = (v: unknown, fallback: Record<string, { headline: string; body: string[] }>) => {
      if (!v || typeof v !== 'object') return fallback;
      const out: Record<string, { headline: string; body: string[] }> = {};
      for (const [k, val] of Object.entries(v as Record<string, { headline?: string; body?: string[] }>)) {
        out[k.slice(0, 60)] = { headline: str(val?.headline, '', 1000), body: strArr(val?.body, []) };
      }
      return out;
    };
    const textRecord = (v: unknown, fallback: Record<string, Record<string, string>>) => {
      if (!v || typeof v !== 'object') return fallback;
      const out: Record<string, Record<string, string>> = {};
      for (const [cat, tiers] of Object.entries(v as Record<string, Record<string, string>>)) {
        out[cat.slice(0, 60)] = {};
        for (const [t, text] of Object.entries(tiers ?? {})) out[cat.slice(0, 60)][t.slice(0, 60)] = str(text, '');
      }
      return out;
    };
    config.results = {
      ...cur,
      thanksPrefix: str(res.thanksPrefix, cur.thanksPrefix, 300),
      overallHeading: str(res.overallHeading, cur.overallHeading, 300),
      tierIntros: tierRecord(res.tierIntros, cur.tierIntros),
      emailedNote: str(res.emailedNote, cur.emailedNote, 300),
      changeEmailLabel: str(res.changeEmailLabel, cur.changeEmailLabel, 120),
      categoryHeading: str(res.categoryHeading, cur.categoryHeading, 300),
      categorySub: strArr(res.categorySub, cur.categorySub, 600),
      categoryTexts: textRecord(res.categoryTexts, cur.categoryTexts),
      cta: res.cta
        ? {
            heading: str(res.cta.heading, cur.cta.heading, 300),
            leftTitle: str(res.cta.leftTitle, cur.cta.leftTitle, 300),
            leftBody: str(res.cta.leftBody, cur.cta.leftBody),
            leftButton: str(res.cta.leftButton, cur.cta.leftButton, 120),
            leftAction: action(res.cta.leftAction, cur.cta.leftAction),
            rightTitle: str(res.cta.rightTitle, cur.cta.rightTitle, 300),
            rightBody: str(res.cta.rightBody, cur.cta.rightBody),
            rightButton: str(res.cta.rightButton, cur.cta.rightButton, 120),
            rightAction: action(res.cta.rightAction, cur.cta.rightAction),
          }
        : cur.cta,
      share: str(res.share, cur.share, 600),
      changeDetails: res.changeDetails
        ? {
            heading: String(res.changeDetails.heading ?? cur.changeDetails.heading).slice(0, 200),
            subheading: String(res.changeDetails.subheading ?? cur.changeDetails.subheading).slice(0, 300),
            submitLabel: String(res.changeDetails.submitLabel ?? cur.changeDetails.submitLabel).slice(0, 60),
          }
        : cur.changeDetails,
    };
  }

  if (body.resultsPage && typeof body.resultsPage === 'object') {
    const p = body.resultsPage;
    const SECTIONS = ['speedChart', 'categoryScores', 'cta', 'share'];
    const extras = sanitizeExtras(p.extraSections) ?? config.resultsPage?.extraSections ?? [];
    const extraIds = extras.map((x: { id: string }) => x.id);
    const VALID = [...SECTIONS, ...extraIds];
    const HIDEABLE = ['header', 'footer', ...VALID];
    config.resultsPage = {
      order: Array.isArray(p.order)
        ? p.order.filter((k: string, i: number, a: string[]) => VALID.includes(k) && a.indexOf(k) === i)
        : SECTIONS,
      extraSections: extras,
      hidden: Array.isArray(p.hidden) ? p.hidden.filter((k: string) => HIDEABLE.includes(k)) : [],
      speedChart: {
        chartPosition: p.speedChart?.chartPosition === 'left' ? 'left' : 'right',
        showOverall: Boolean(p.speedChart?.showOverall),
        scoreFormat: p.speedChart?.scoreFormat === 'outof100' ? 'outof100' : 'percent',
        showTiers: Boolean(p.speedChart?.showTiers),
      },
      categories: {
        itemsPerRow: num(p.categories?.itemsPerRow, 2, 1, 4),
        showScores: Boolean(p.categories?.showScores),
        showTier: Boolean(p.categories?.showTier),
      },
      share: {
        facebook: Boolean(p.share?.facebook),
        twitter: Boolean(p.share?.twitter),
        linkedin: Boolean(p.share?.linkedin),
        background: color(p.share?.background, '#152042'),
        linksColor: color(p.share?.linksColor, '#ffffff'),
      },
    };
  }

  if (body.pdf && typeof body.pdf === 'object') {
    const p = body.pdf;
    const cur = config.pdf;
    const str = (v: unknown, fallback: string, len = 4000) =>
      v != null ? sanitizeRichText(String(v)).slice(0, len) : fallback;
    const strArr = (v: unknown, fallback: string[], len = 4000) =>
      Array.isArray(v) ? v.map((x) => sanitizeRichText(String(x)).slice(0, len)).slice(0, 20) : fallback;
    const url = (v: unknown) => String(v ?? '').slice(0, 500);
    const catContent = (v: unknown, fallback: typeof cur.categories) => {
      if (!v || typeof v !== 'object') return fallback;
      const out: typeof cur.categories = {};
      for (const [cat, tiers] of Object.entries(v as Record<string, Record<string, { intro?: string[]; exampleTitle?: string; example?: string[] }>>)) {
        out[cat.slice(0, 60)] = {};
        for (const [t, content] of Object.entries(tiers ?? {})) {
          out[cat.slice(0, 60)][t.slice(0, 60)] = {
            intro: strArr(content?.intro, []),
            exampleTitle: str(content?.exampleTitle, '', 500),
            example: strArr(content?.example, []),
          };
        }
      }
      return out;
    };
    const PAGE_KEY = /^(cover|howToRead|keys|closing|cat:[a-z0-9-]+)$/;
    config.pdf = {
      coverTitle: str(p.coverTitle, cur.coverTitle, 300),
      howToReadTitle: str(p.howToReadTitle, cur.howToReadTitle, 300),
      howToRead: strArr(p.howToRead, cur.howToRead),
      keysHeading: str(p.keysHeading, cur.keysHeading, 300),
      categories: catContent(p.categories, cur.categories),
      closingTitle: str(p.closingTitle, cur.closingTitle, 300),
      closing: strArr(p.closing, cur.closing),
      images: p.images
        ? {
            cover: url(p.images.cover),
            howToRead: url(p.images.howToRead),
            closing: url(p.images.closing),
            categories: Object.fromEntries(
              Object.entries((p.images.categories ?? {}) as Record<string, string>).map(([k, v]) => [
                k.slice(0, 60),
                url(v),
              ])
            ),
          }
        : cur.images,
      panel: p.panel
        ? {
            background: color(p.panel.background, '#152042'),
            buttonColor: color(p.panel.buttonColor, '#1c78fe'),
            imagePosition: p.panel.imagePosition === 'right' ? 'right' : 'left',
          }
        : cur.panel,
      footerText: p.footerText != null ? str(p.footerText, '', 200) : cur.footerText,
      hidden: Array.isArray(p.hidden) ? p.hidden.filter((k: string) => PAGE_KEY.test(k)).slice(0, 20) : cur.hidden,
    };
  }

  if (body.landing && typeof body.landing === 'object') {
    const l = body.landing;
    const str = (v: unknown, fallback: string, len = 2000) =>
      v != null ? sanitizeRichText(String(v)).slice(0, len) : fallback;
    config.landing = {
      ...config.landing,
      heroImage: l.heroImage != null ? String(l.heroImage).slice(0, 500) : config.landing.heroImage,
      imagePosition: l.imagePosition === 'left' ? 'left' : l.imagePosition === 'right' ? 'right' : config.landing.imagePosition,
      categoriesPerRow: l.categoriesPerRow != null ? num(l.categoriesPerRow, 2, 1, 4) : config.landing.categoriesPerRow,
      showHeader: l.showHeader != null ? Boolean(l.showHeader) : config.landing.showHeader,
      showFooter: l.showFooter != null ? Boolean(l.showFooter) : config.landing.showFooter,
      extraSections: sanitizeExtras(l.extraSections) ?? config.landing.extraSections,
      sectionOrder: Array.isArray(l.sectionOrder)
        ? l.sectionOrder
            .map((k: string) => String(k).slice(0, 40))
            .filter((k: string, i: number, a: string[]) => a.indexOf(k) === i)
        : config.landing.sectionOrder,
      heroCtaAction: action(l.heroCtaAction, config.landing.heroCtaAction),
      bottomCtaAction: action(l.bottomCtaAction, config.landing.bottomCtaAction),
      heroTitle: str(l.heroTitle, config.landing.heroTitle),
      heroSubtitle: str(l.heroSubtitle, config.landing.heroSubtitle),
      heroBody: str(l.heroBody, config.landing.heroBody),
      heroBullets: Array.isArray(l.heroBullets)
        ? l.heroBullets.map((b: unknown) => sanitizeRichText(String(b)).slice(0, 300)).slice(0, 10)
        : config.landing.heroBullets,
      heroCta: str(l.heroCta, config.landing.heroCta, 120),
      howItWorksLabel: str(l.howItWorksLabel, config.landing.howItWorksLabel, 200),
      howItWorksTitle: str(l.howItWorksTitle, config.landing.howItWorksTitle, 300),
      howItWorksBody: str(l.howItWorksBody, config.landing.howItWorksBody),
      categoryCards: Array.isArray(l.categoryCards)
        ? l.categoryCards
            .map((c: { key?: string; title?: string; body?: string; image?: string }) => ({
              key: String(c.key ?? '').slice(0, 60),
              title: sanitizeRichText(String(c.title ?? '')).slice(0, 200),
              body: sanitizeRichText(String(c.body ?? '')).slice(0, 1000),
              image: String(c.image ?? '').slice(0, 500),
            }))
            .slice(0, 12)
        : config.landing.categoryCards,
      bottomTitle: str(l.bottomTitle, config.landing.bottomTitle, 300),
      bottomBody: str(l.bottomBody, config.landing.bottomBody),
      bottomCta: str(l.bottomCta, config.landing.bottomCta, 120),
      bottomNote: str(l.bottomNote, config.landing.bottomNote, 300),
    };
  }

  if (body.shareAppearance && typeof body.shareAppearance === 'object') {
    const sa = body.shareAppearance;
    config.shareAppearance = {
      title: String(sa.title ?? '').slice(0, 200),
      description: String(sa.description ?? '').slice(0, 600),
      image: String(sa.image ?? '').slice(0, 500),
    };
  }

  if (body.notifications && typeof body.notifications === 'object') {
    const n = body.notifications;
    config.notifications = {
      enabled: Boolean(n.enabled),
      recipients: String(n.recipients ?? '').slice(0, 1000),
      subject: String(n.subject ?? '').slice(0, 300),
      content: sanitizeRichText(String(n.content ?? '')).slice(0, 8000),
    };
  }

  if (body.email && typeof body.email === 'object') {
    config.email = {
      provider: String(body.email.provider ?? 'resend').slice(0, 40),
      apiKey: String(body.email.apiKey ?? '').slice(0, 200),
    };
  }

  if (body.resultEmail && typeof body.resultEmail === 'object') {
    const r = body.resultEmail;
    config.resultEmail = {
      enabled: Boolean(r.enabled),
      fromAddress: String(r.fromAddress ?? '').slice(0, 320),
      fromName: String(r.fromName ?? '').slice(0, 120),
      replyTo: String(r.replyTo ?? '').slice(0, 320),
      subject: String(r.subject ?? '').slice(0, 300),
      content: sanitizeRichText(String(r.content ?? '')).slice(0, 8000),
      headerImage: r.headerImage != null ? String(r.headerImage).slice(0, 500) : config.resultEmail?.headerImage,
    };
  }

  // AI-designed custom pages: which mode each page renders in, plus the
  // sanitized design shells + content slots.
  if (body.landingMode === 'components' || body.landingMode === 'custom') config.landingMode = body.landingMode;
  if (body.resultsMode === 'components' || body.resultsMode === 'custom') config.resultsMode = body.resultsMode;
  if (body.customPages && typeof body.customPages === 'object') {
    config.customPages = { ...config.customPages };
    if (body.customPages.landing) config.customPages.landing = sanitizeCustomPage(body.customPages.landing);
    if (body.customPages.results) config.customPages.results = sanitizeCustomPage(body.customPages.results);
  }

  await saveConfig(config);
  return NextResponse.json({ ok: true });
}
