import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/server/auth';
import { supabaseAdmin } from '@/lib/server/supabase';
import { Lead } from '@/lib/types';

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data, error } = await supabaseAdmin()
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .returns<Lead[]>();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const header = [
    'first_name', 'last_name', 'email', 'business', 'contact_opt_in',
    'status', 'created_at', 'duration_seconds', 'overall_percent', 'score_total', 'score_max',
  ];
  const rows = data.map((l) =>
    [
      l.first_name, l.last_name, l.email, l.business, l.contact_opt_in,
      l.status, l.created_at, l.duration_seconds, l.overall_percent, l.score_total, l.score_max,
    ].map(esc).join(',')
  );
  const csv = [header.join(','), ...rows].join('\n');
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="leads.csv"',
    },
  });
}
