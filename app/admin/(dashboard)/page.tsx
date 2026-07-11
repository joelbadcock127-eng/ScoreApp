import Link from 'next/link';
import { supabaseAdmin } from '@/lib/server/supabase';
import { Lead } from '@/lib/types';

export const dynamic = 'force-dynamic';

function fmtDate(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} : ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fmtDuration(s: number | null) {
  if (s == null) return '—';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

export default async function LeadsPage({ searchParams }: { searchParams: { q?: string } }) {
  const sb = supabaseAdmin();
  let query = sb
    .from('leads')
    .select('*')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(500);
  if (searchParams.q) {
    query = query.or(
      `first_name.ilike.%${searchParams.q}%,last_name.ilike.%${searchParams.q}%,email.ilike.%${searchParams.q}%`
    );
  }
  const { data: leads, error } = await query.returns<Lead[]>();
  if (error) throw new Error(error.message);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Leads</h1>
        <a
          href="/api/admin/export"
          className="rounded-md bg-primary px-5 py-2.5 font-medium text-white hover:bg-blue-600"
        >
          Export ↓
        </a>
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center gap-4 border-b border-gray-200 px-6 py-4">
          <form className="flex items-center gap-4">
            <input
              name="q"
              defaultValue={searchParams.q ?? ''}
              placeholder="Search"
              className="w-44 rounded-md border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-primary"
            />
          </form>
          <p className="text-sm">{leads.length} results</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[15px]">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wide text-muted">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 text-right font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link href={`/admin/leads/${l.id}`} className="font-medium text-ink hover:text-primary">
                      {l.first_name} {l.last_name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">{l.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {fmtDate(l.created_at)}
                    <span className="ml-3 text-muted">⏱ {fmtDuration(l.duration_seconds)}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium">{l.overall_percent}%</td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-muted">
                    No leads yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
