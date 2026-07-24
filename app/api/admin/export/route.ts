import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/server/auth';
import { supabaseAdmin } from '@/lib/server/supabase';
import { getActiveOrDefaultId, getConfig } from '@/lib/server/config';
import { stripTags } from '@/lib/richtext';
import { AnswerDetail, Lead } from '@/lib/types';

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const scorecardId = await getActiveOrDefaultId();
  const [config, { data, error }] = await Promise.all([
    getConfig(scorecardId),
    supabaseAdmin()
      .from('leads')
      .select('*')
      .eq('scorecard_id', scorecardId)
      .order('created_at', { ascending: false })
      .returns<Lead[]>(),
  ]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const esc = (v: unknown) => {
    let s = String(v ?? '');
    // Neutralise spreadsheet formula injection in free-text answers; plain
    // numbers (e.g. negative durations) are safe and stay untouched.
    if (/^[=+\-@\t\r]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };

  // One column per question: the readable answer where we have it (option
  // labels / typed text). Text questions never fall back to their placeholder
  // numeric score — blank means unanswered. Numeric fallback only for scale
  // answers and legacy leads without answer_details.
  const answerFor = (l: Lead, q: { id: string; type?: string }) => {
    const d = (l.answer_details ?? undefined)?.[q.id] as AnswerDetail | undefined;
    if (d?.selected?.length) return d.selected.join('; ');
    if (d?.text) return d.text;
    if ((q.type ?? 'scale') === 'text') return '';
    if (d?.selected) return ''; // option question answered with nothing ticked
    return l.answers?.[q.id] ?? '';
  };

  const header = [
    'first_name', 'last_name', 'email', 'business', 'contact_opt_in',
    'status', 'created_at', 'duration_seconds', 'overall_percent', 'score_total', 'score_max',
    ...config.questions.map((q) => stripTags(q.text).slice(0, 120)),
  ];
  const rows = data.map((l) =>
    [
      l.first_name, l.last_name, l.email, l.business, l.contact_opt_in,
      l.status, l.created_at, l.duration_seconds, l.overall_percent, l.score_total, l.score_max,
      ...config.questions.map((q) => answerFor(l, q)),
    ].map(esc).join(',')
  );
  const csv = [header.map(esc).join(','), ...rows].join('\n');
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="leads.csv"',
    },
  });
}
