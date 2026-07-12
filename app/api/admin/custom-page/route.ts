import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/server/auth';
import { getConfig } from '@/lib/server/config';
import { customPageStatus, generateCustomPage } from '@/lib/server/customPageGen';

export const dynamic = 'force-dynamic';
// Design generation can take a while; allow long runs where supported.
export const maxDuration = 300;

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(customPageStatus());
}

// POST { page: 'landing' | 'results', instructions? } → generated CustomPage
// for the scorecard currently being edited. The editor reviews + saves it via
// the normal config API; nothing is persisted here.
export async function POST(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  const page = body?.page === 'results' ? 'results' : body?.page === 'landing' ? 'landing' : null;
  if (!page) return NextResponse.json({ error: 'page must be "landing" or "results"' }, { status: 400 });
  const instructions = String(body?.instructions ?? '').slice(0, 1000);

  try {
    const config = await getConfig();
    const customPage = await generateCustomPage(config, page, instructions || undefined);
    return NextResponse.json({ customPage, ...customPageStatus() });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Generation failed.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
