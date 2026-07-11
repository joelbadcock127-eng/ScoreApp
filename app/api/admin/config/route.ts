import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/server/auth';
import { getConfig, saveConfig } from '@/lib/server/config';
import { sanitizeRichText, stripHtml } from '@/lib/sanitizeHtml';
import {
  Category,
  LandingConfig,
  LeadFormField,
  Question,
  QuestionsPageConfig,
  QuestionType,
  ThemeConfig,
  Tier,
} from '@/lib/types';

const HEX = /^#[0-9a-fA-F]{6}$/;
const TYPES: QuestionType[] = ['linear', 'yesno', 'buttons', 'checkboxes', 'radio', 'text'];

function str(v: unknown, max = 500) {
  return String(v ?? '').slice(0, max);
}
function num(v: unknown, min: number, max: number, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
}
function color(v: unknown, fallback: string) {
  const s = String(v ?? '');
  return HEX.test(s) || s === 'transparent' ? s : fallback;
}
function slug(v: unknown) {
  return String(v ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

function cleanQuestion(raw: Question, categories: Category[]): Question | null {
  const type = TYPES.includes(raw.type as QuestionType) ? (raw.type as QuestionType) : 'linear';
  const textHtml = sanitizeRichText(String(raw.textHtml ?? raw.text ?? ''), 1000);
  const text = stripHtml(textHtml) || 'Untitled question';
  if (!raw.id) return null;
  const catKeys = categories.map((c) => c.key);
  const q: Question = {
    id: str(raw.id, 40),
    category: catKeys.includes(raw.category) ? raw.category : catKeys[0],
    text,
    textHtml,
    type,
    instruction: str(raw.instruction, 500),
    showInstruction: Boolean(raw.showInstruction),
    required: raw.required !== false,
    min: num(raw.min, 0, 10, 1),
    max: num(raw.max, 1, 10, 5),
    start: num(raw.start, 0, 10, 3),
    labels: {
      left: str(raw.labels?.left, 120),
      center: str(raw.labels?.center, 120),
      right: str(raw.labels?.right, 120),
    },
  };
  if (q.max <= q.min) q.max = q.min + 1;
  q.start = Math.min(q.max, Math.max(q.min, q.start));
  if (type !== 'linear' && type !== 'text') {
    const options = Array.isArray(raw.options) ? raw.options : [];
    q.options = options
      .slice(0, 12)
      .map((o) => ({ label: str(o?.label, 200) || 'Option', score: num(o?.score, 0, 100, 0) }));
    if (!q.options.length) q.options = [{ label: 'Option 1', score: 1 }];
  }
  return q;
}

// PUT accepts any subset of editable config slices.
export async function PUT(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const config = await getConfig();

  if (Array.isArray(body.tiers)) {
    const tiers: Tier[] = body.tiers.map((t: Tier) => ({
      key: slug(t.key || t.label),
      label: str(t.label, 60),
      color: color(t.color, '#616366'),
      from: num(t.from, 0, 100, 0),
      to: num(t.to, 0, 100, 100),
    }));
    if (tiers.length) config.tiers = tiers;
  }

  if (body.leadForm) {
    const fields: LeadFormField[] = (body.leadForm.fields ?? []).map((f: LeadFormField) => ({
      key: str(f.key, 60),
      label: str(f.label, 500),
      type: f.type === 'checkbox' ? 'checkbox' : f.type === 'email' ? 'email' : 'text',
      required: Boolean(f.required),
      enabled: Boolean(f.enabled),
    }));
    config.leadForm = {
      heading: str(body.leadForm.heading ?? config.leadForm.heading, 300),
      submitLabel: str(body.leadForm.submitLabel ?? config.leadForm.submitLabel, 60),
      fields: fields.length ? fields : config.leadForm.fields,
    };
  }

  if (Array.isArray(body.categories)) {
    const categories: Category[] = body.categories
      .map((c: Category) => ({
        key: slug(c.key || c.label),
        label: str(c.label, 100) || 'Category',
        description: str(c.description, 500),
      }))
      .filter((c: Category) => c.key);
    if (categories.length) {
      config.categories = categories;
      // Reassign questions whose category no longer exists.
      const keys = categories.map((c) => c.key);
      config.questions = config.questions.map((q) =>
        keys.includes(q.category) ? q : { ...q, category: keys[0] }
      );
    }
  }

  if (Array.isArray(body.questions)) {
    const questions = body.questions
      .map((q: Question) => cleanQuestion(q, config.categories))
      .filter(Boolean) as Question[];
    if (questions.length) config.questions = questions;
  }

  if (body.theme) {
    const t = body.theme as ThemeConfig;
    config.theme = {
      backgroundColor: color(t.backgroundColor, config.theme.backgroundColor),
      headingColor: color(t.headingColor, config.theme.headingColor),
      bodyColor: color(t.bodyColor, config.theme.bodyColor),
      headingFont: str(t.headingFont, 60) || 'Inter',
      bodyFont: str(t.bodyFont, 60) || 'Inter',
      headingSize: num(t.headingSize, 20, 96, config.theme.headingSize),
      bodySize: num(t.bodySize, 10, 32, config.theme.bodySize),
    };
  }

  if (body.branding) {
    if (HEX.test(String(body.branding.primaryColor))) config.branding.primaryColor = body.branding.primaryColor;
    if (HEX.test(String(body.branding.secondaryColor))) config.branding.secondaryColor = body.branding.secondaryColor;
  }

  if (body.questionsPage) {
    const p = body.questionsPage as QuestionsPageConfig;
    config.questionsPage = {
      header: {
        show: Boolean(p.header?.show),
        logoMaxWidth: num(p.header?.logoMaxWidth, 60, 600, 250),
        alignment: ['left', 'center', 'right'].includes(p.header?.alignment) ? p.header.alignment : 'center',
      },
      questions: {
        align: p.questions?.align === 'left' ? 'left' : 'center',
        showBack: Boolean(p.questions?.showBack),
        showCategoryName: Boolean(p.questions?.showCategoryName),
      },
      progress: { show: Boolean(p.progress?.show) },
      footer: { show: Boolean(p.footer?.show) },
    };
  }

  if (body.landing) {
    const l = body.landing as LandingConfig;
    const cur = config.landing;
    config.landing = {
      header: {
        logoMaxWidth: num(l.header?.logoMaxWidth, 60, 600, cur.header.logoMaxWidth),
        alignment: ['left', 'center', 'right'].includes(l.header?.alignment) ? l.header.alignment : cur.header.alignment,
      },
      heroTitle: sanitizeRichText(str(l.heroTitle ?? cur.heroTitle, 2000), 500),
      heroSubtitle: sanitizeRichText(str(l.heroSubtitle ?? cur.heroSubtitle, 2000), 500),
      heroBody: str(l.heroBody ?? cur.heroBody, 2000),
      heroBullets: Array.isArray(l.heroBullets)
        ? l.heroBullets.map((b) => str(b, 200)).filter(Boolean).slice(0, 8)
        : cur.heroBullets,
      heroCta: str(l.heroCta ?? cur.heroCta, 80),
      heroImage: str(l.heroImage ?? cur.heroImage, 500),
      heroImagePosition: l.heroImagePosition === 'left' ? 'left' : 'right',
      bannerBackground: color(l.bannerBackground, cur.bannerBackground),
      howItWorksLabel: str(l.howItWorksLabel ?? cur.howItWorksLabel, 120),
      howItWorksTitle: str(l.howItWorksTitle ?? cur.howItWorksTitle, 200),
      howItWorksBody: str(l.howItWorksBody ?? cur.howItWorksBody, 2000),
      categoriesPerRow: [1, 2, 4].includes(Number(l.categoriesPerRow)) ? (Number(l.categoriesPerRow) as 1 | 2 | 4) : cur.categoriesPerRow,
      categoryCards: Array.isArray(l.categoryCards)
        ? l.categoryCards.slice(0, 8).map((c) => ({
            key: slug(c.key || c.title) || 'card',
            title: str(c.title, 120),
            body: str(c.body, 600),
            image: str(c.image, 500),
          }))
        : cur.categoryCards,
      bottomTitle: str(l.bottomTitle ?? cur.bottomTitle, 200),
      bottomBody: str(l.bottomBody ?? cur.bottomBody, 1000),
      bottomCta: str(l.bottomCta ?? cur.bottomCta, 80),
      bottomNote: str(l.bottomNote ?? cur.bottomNote, 200),
      footer: { show: l.footer ? Boolean(l.footer.show) : cur.footer.show },
    };
  }

  await saveConfig(config);
  return NextResponse.json({ ok: true });
}
