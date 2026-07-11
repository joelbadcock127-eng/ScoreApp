import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/server/auth';
import { getConfig, saveConfig } from '@/lib/server/config';
import { supabaseAdmin } from '@/lib/server/supabase';

const BUCKET = 'branding';

// PUT: save colours { primaryColor, secondaryColor }
export async function PUT(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  const config = await getConfig();
  const hex = /^#[0-9a-fA-F]{6}$/;
  if (hex.test(String(body.primaryColor))) config.branding.primaryColor = String(body.primaryColor);
  if (hex.test(String(body.secondaryColor))) config.branding.secondaryColor = String(body.secondaryColor);
  await saveConfig(config);
  return NextResponse.json({ ok: true });
}

// POST multipart: { kind: 'logo' | 'icon', file } — uploads to Supabase Storage.
export async function POST(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const form = await req.formData().catch(() => null);
  const kind = form?.get('kind');
  const file = form?.get('file');
  if (!form || (kind !== 'logo' && kind !== 'icon' && kind !== 'asset') || !(file instanceof File)) {
    return NextResponse.json({ error: 'Invalid upload' }, { status: 400 });
  }
  if (file.size > 4 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 4 MB)' }, { status: 400 });
  }

  const sb = supabaseAdmin();
  // Ensure the public bucket exists (idempotent).
  await sb.storage.createBucket(BUCKET, { public: true }).catch(() => {});

  const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
  const path = `${kind}-${Date.now()}.${ext}`;
  const { error } = await sb.storage
    .from(BUCKET)
    .upload(path, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type || 'image/png',
      upsert: true,
    });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
  if (kind !== 'asset') {
    // Generic assets are referenced from wherever they were uploaded (e.g. the
    // landing editor); only logo/icon update the branding config directly.
    const config = await getConfig();
    if (kind === 'logo') config.branding.logoUrl = data.publicUrl;
    else config.branding.iconUrl = data.publicUrl;
    await saveConfig(config);
  }
  return NextResponse.json({ ok: true, url: data.publicUrl });
}
