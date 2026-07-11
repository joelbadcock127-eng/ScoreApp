import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/server/auth';
import { getConfig, saveConfig } from '@/lib/server/config';
import { LeadFormField, Tier } from '@/lib/types';

// PUT { tiers?: Tier[], leadForm?: { heading, submitLabel, fields } }
export async function PUT(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const config = await getConfig();

  if (Array.isArray(body.tiers)) {
    const tiers: Tier[] = body.tiers.map((t: Tier) => ({
      key: String(t.key || t.label).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      label: String(t.label).slice(0, 60),
      color: /^#[0-9a-fA-F]{6}$/.test(String(t.color)) ? String(t.color) : '#616366',
      from: Math.max(0, Math.min(100, Number(t.from) || 0)),
      to: Math.max(0, Math.min(100, Number(t.to) || 0)),
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

  await saveConfig(config);
  return NextResponse.json({ ok: true });
}
