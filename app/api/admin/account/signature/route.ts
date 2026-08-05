import { NextRequest, NextResponse } from 'next/server';
import { getSessionAccountId, isAdmin } from '@/lib/server/auth';
import { BLANK_SIGNATURE, cleanSignature, getAccountSignature, renderSignature, saveAccountSignature } from '@/lib/server/signature';

export const dynamic = 'force-dynamic';

// The account-wide email signature (one per account, applies to invite and
// result emails on every scorecard). GET also returns the rendered HTML so
// the editor can show a live preview identical to what emails append.
export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const accountId = getSessionAccountId();
  if (accountId == null) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const signature = await getAccountSignature(accountId).catch(() => BLANK_SIGNATURE);
  return NextResponse.json({ signature, previewHtml: renderSignature({ ...signature, enabled: true }) });
}

export async function PUT(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const accountId = getSessionAccountId();
  if (accountId == null) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const signature = cleanSignature((body as { signature?: unknown }).signature);
  await saveAccountSignature(accountId, signature);
  return NextResponse.json({ ok: true, signature, previewHtml: renderSignature({ ...signature, enabled: true }) });
}
