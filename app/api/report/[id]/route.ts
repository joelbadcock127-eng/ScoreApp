import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { getConfig } from '@/lib/server/config';
import { supabaseAdmin } from '@/lib/server/supabase';
import { CategoryScore, Lead } from '@/lib/types';
import { ReportDocument, ReportData, PdfImages } from '@/lib/pdf/ReportDocument';
import { sampleResults } from '@/lib/sampleData';
import { readFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// react-pdf can only decode JPEG and PNG, and full-resolution phone photos
// balloon the PDF to many megabytes. Convert anything else (webp, gif, …) and
// downscale/recompress so every embedded image stays lean. If sharp is ever
// unavailable the original buffer is used as-is.
async function normalizeImage(buf: Buffer): Promise<Buffer> {
  try {
    const sharp = (await import('sharp')).default;
    const img = sharp(buf, { failOn: 'none' }).rotate(); // apply EXIF orientation
    const meta = await img.metadata();
    const resized = img.resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true });
    // Keep transparency (logos) as PNG; photos become quality-80 JPEG.
    if (meta.hasAlpha) return await resized.png().toBuffer();
    return await resized.jpeg({ quality: 80, mozjpeg: true }).toBuffer();
  } catch (err) {
    console.error('[report] image normalize failed, using original:', err);
    return buf;
  }
}

async function loadImage(url: string | undefined, origin: string): Promise<Buffer | null> {
  if (!url) return null;
  try {
    let buf: Buffer;
    if (url.startsWith('/')) {
      // Local public asset: read straight from disk.
      buf = await readFile(path.join(process.cwd(), 'public', url));
    } else {
      const res = await fetch(url.startsWith('http') ? url : `${origin}${url}`);
      if (!res.ok) return null;
      buf = Buffer.from(await res.arrayBuffer());
    }
    return await normalizeImage(buf);
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  let config = await getConfig();

  let data: ReportData;
  if (params.id === 'preview') {
    const tier = req.nextUrl.searchParams.get('tier') ?? 'medium';
    const sample = sampleResults(config, ['low', 'medium', 'high'].includes(tier) ? tier : 'medium');
    data = {
      firstName: sample.first_name,
      lastName: sample.last_name,
      business: sample.business,
      overallPercent: sample.overall_percent,
      categoryScores: sample.category_scores,
      date: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }),
    };
  } else {
    if (!/^[0-9a-f-]{36}$/i.test(params.id)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const { data: lead } = await supabaseAdmin()
      .from('leads')
      .select('*')
      .eq('id', params.id)
      .maybeSingle<Lead>();
    if (!lead || lead.status !== 'completed' || lead.overall_percent == null) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (lead.scorecard_id) config = await getConfig(lead.scorecard_id);
    data = {
      firstName: lead.first_name,
      lastName: lead.last_name,
      business: lead.business,
      overallPercent: lead.overall_percent,
      categoryScores: (lead.category_scores ?? []) as CategoryScore[],
      date: new Date(lead.completed_at ?? lead.created_at).toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    };
  }

  const origin = req.nextUrl.origin;
  const imgCfg = config.pdf.images ?? {};
  const categoryImages: Record<string, Buffer | null> = {};
  await Promise.all(
    config.categories.map(async (c) => {
      categoryImages[c.key] = await loadImage(imgCfg.categories?.[c.key], origin);
    })
  );
  const images: PdfImages = {
    logo: await loadImage(config.branding.logoUrl, origin),
    cover: await loadImage(imgCfg.cover, origin),
    howToRead: await loadImage(imgCfg.howToRead, origin),
    categories: categoryImages,
    closing: await loadImage(imgCfg.closing, origin),
  };
  const pdf = await renderToBuffer(
    React.createElement(ReportDocument, { config, data, images }) as never
  );

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="ai-opportunity-report.pdf"`,
      'Cache-Control': 'no-store',
    },
  });
}
