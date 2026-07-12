import { NextRequest, NextResponse } from 'next/server';
import { getSessionAccountId, isAdmin } from '@/lib/server/auth';
import { insertScorecard, SCORECARD_COOKIE } from '@/lib/server/config';
import {
  aiBuilderStatus,
  assembleConfig,
  generateContent,
  generatePdf,
  generateResults,
  generateStrategy,
  validateGeneration,
} from '@/lib/server/aiBuilder';
import { AiBrief, AiGeneration } from '@/lib/ai/brief';

export const dynamic = 'force-dynamic';
// Generation calls can take a while; allow the route to run long where the
// platform supports it.
export const maxDuration = 300;

function cleanBrief(raw: Record<string, unknown>): AiBrief {
  const str = (v: unknown, len = 600) => String(v ?? '').trim().slice(0, len);
  const num = (v: unknown, fallback: number, min: number, max: number) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.round(n))) : fallback;
  };
  const color = (v: unknown, fallback: string) => (/^#[0-9a-fA-F]{6}$/.test(String(v)) ? String(v) : fallback);
  return {
    businessName: str(raw.businessName, 120),
    scorecardName: str(raw.scorecardName, 120),
    description: str(raw.description, 2000),
    audience: str(raw.audience),
    outcome: str(raw.outcome),
    cta: str(raw.cta),
    tone: str(raw.tone, 40) || 'Professional',
    categoriesCount: num(raw.categoriesCount, 4, 2, 6),
    questionsCount: num(raw.questionsCount, 12, 4, 40),
    primaryColor: color(raw.primaryColor, '#1c78fe'),
    secondaryColor: color(raw.secondaryColor, '#152042'),
    logoUrl: str(raw.logoUrl, 500) || undefined,
  };
}

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(aiBuilderStatus());
}

// POST { step: 'strategy' | 'content' | 'results' | 'pdf' | 'save', brief, strategy?, generation? }
export async function POST(req: NextRequest) {
  const accountId = getSessionAccountId();
  if (accountId == null) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const brief = cleanBrief(body.brief ?? {});
  if (!brief.description && body.step !== 'save') {
    return NextResponse.json({ error: 'Describe your scorecard first.' }, { status: 400 });
  }

  try {
    if (body.step === 'strategy') {
      return NextResponse.json({ strategy: await generateStrategy(brief), ...aiBuilderStatus() });
    }
    if (body.step === 'content') {
      if (!body.strategy) return NextResponse.json({ error: 'Missing strategy' }, { status: 400 });
      return NextResponse.json({ content: await generateContent(brief, body.strategy) });
    }
    if (body.step === 'results') {
      if (!body.strategy) return NextResponse.json({ error: 'Missing strategy' }, { status: 400 });
      return NextResponse.json({ results: await generateResults(brief, body.strategy) });
    }
    if (body.step === 'pdf') {
      if (!body.strategy) return NextResponse.json({ error: 'Missing strategy' }, { status: 400 });
      return NextResponse.json({ pdf: await generatePdf(brief, body.strategy) });
    }
    if (body.step === 'save') {
      const g = body.generation as AiGeneration | undefined;
      if (!g?.strategy || !g.content || !g.results || !g.pdf) {
        return NextResponse.json({ error: 'Missing generation' }, { status: 400 });
      }
      const config = assembleConfig(brief, g);
      const name = config.title || brief.scorecardName || 'AI scorecard';
      const id = await insertScorecard(name, config, accountId);
      const res = NextResponse.json({ ok: true, id, warnings: validateGeneration(g) });
      // Point the editor at the new scorecard so "Edit" opens it immediately.
      res.cookies.set(SCORECARD_COOKIE, String(id), { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 });
      return res;
    }
    return NextResponse.json({ error: 'Unknown step' }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Generation failed.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
