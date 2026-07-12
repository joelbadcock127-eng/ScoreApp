import { NextRequest, NextResponse } from 'next/server';
import { aiRemaining, canUseCustomDesign, getSessionAccount, isAdmin, recordAiUse } from '@/lib/server/auth';
import { getConfig } from '@/lib/server/config';
import { customPageStatus, editCustomPage, generateCustomPage } from '@/lib/server/customPageGen';
import { sanitizeCustomPage } from '@/lib/customPage';

export const dynamic = 'force-dynamic';
// Design generation can take a while; allow long runs where supported.
export const maxDuration = 300;

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(customPageStatus());
}

// POST — two actions, neither persists anything (the editor saves via the
// normal config API after review):
//   { page, instructions? }                      → generate a fresh design
//   { page, action: 'edit', customPage, instruction } → chat edit of the
//     current design; returns the updated page + a one-line change summary.
export async function POST(req: NextRequest) {
  const account = await getSessionAccount();
  if (!account) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canUseCustomDesign(account)) {
    return NextResponse.json({ error: 'Custom Design (AI) is not enabled for this account.' }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const page = body?.page === 'results' ? 'results' : body?.page === 'landing' ? 'landing' : null;
  if (!page) return NextResponse.json({ error: 'page must be "landing" or "results"' }, { status: 400 });

  // Every live generation/edit counts one against the AI usage cap.
  if (!customPageStatus().mock) {
    if (aiRemaining(account) < 1) {
      return NextResponse.json(
        { error: 'This account has reached its AI usage limit — ask the site owner to raise it.' },
        { status: 403 }
      );
    }
    await recordAiUse(account.id, account.aiUsed);
  }

  try {
    const config = await getConfig();

    if (body.action === 'edit') {
      const instruction = String(body.instruction ?? '').trim().slice(0, 1000);
      if (!instruction) return NextResponse.json({ error: 'Tell the AI what to change.' }, { status: 400 });
      if (!body.customPage?.html) return NextResponse.json({ error: 'No custom page to edit.' }, { status: 400 });
      const current = sanitizeCustomPage(body.customPage);
      const result = await editCustomPage(config, page, current, instruction);
      return NextResponse.json({ ...result, ...customPageStatus() });
    }

    const instructions = String(body?.instructions ?? '').slice(0, 1000);
    const customPage = await generateCustomPage(config, page, instructions || undefined);
    return NextResponse.json({ customPage, ...customPageStatus() });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Generation failed.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
