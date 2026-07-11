import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/server/auth';
import { getConfig, saveConfig } from '@/lib/server/config';
import { sanitizeRichText } from '@/lib/richtext';
import {
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

  await saveConfig(config);
  return NextResponse.json({ ok: true });
}
