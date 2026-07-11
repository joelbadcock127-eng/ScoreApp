/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/server/auth';
import { getConfig } from '@/lib/server/config';
import AdminNav, { AdminNavMobile } from '@/components/admin/AdminNav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isAdmin()) redirect('/admin/login');
  const config = await getConfig();
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden w-60 flex-none border-r border-gray-200 bg-white px-4 py-5 md:block">
        <Link href="/admin" className="flex items-center gap-2 px-2">
          <img src={config.branding.iconUrl} alt="" className="h-9 w-9" />
          <span className="text-[15px] font-semibold">{config.title}</span>
        </Link>
        <AdminNav />
        <div className="mt-8 border-t border-gray-200 pt-4">
          <Link
            href="/"
            target="_blank"
            className="block rounded-md px-3 py-2 text-[15px] text-muted hover:bg-gray-100"
          >
            View Scorecard ↗
          </Link>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="overflow-x-auto border-b border-gray-200 bg-white px-6 py-3 md:hidden">
          <AdminNavMobile />
        </div>
        <div className="p-6 md:p-10">{children}</div>
      </div>
    </div>
  );
}
