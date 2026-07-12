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

async function loadImage(url: string | undefined, origin: string): Promise<Buffer | null> {
  if (!url) return null;
  try {
    if (url.startsWith('/')) {
      // Local public asset: read straight from disk.
      return await readFile(path.join(process.cwd(), 'public', url));
    }
    const res = await fetch(url.startsWith('http') ? url : `${origin}${url}`);
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
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
