'use client';

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CreateScorecardModal from '@/components/admin/CreateScorecardModal';

// Top account bar: square icon, account dropdown, a scorecard switcher
// listing recent scorecards with Go to Scorecards / Create Scorecard, an
// open-in-new-tab link, help, log out and avatar.
export interface ScorecardEntry {
  id: number;
  name: string;
  is_default: boolean;
  updated_at: string;
}

export default function AccountBar({
  accountName,
  isOwner = false,
  scorecardTitle,
  iconUrl,
  thumbUrl,
  scorecards = [],
  activeId,
}: {
  accountName: string;
  isOwner?: boolean;
  scorecardTitle: string;
  iconUrl: string;
  thumbUrl: string;
  scorecards?: ScorecardEntry[];
  activeId?: number;
}) {
  const [open, setOpen] = useState<'account' | 'scorecards' | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  async function activate(id: number) {
    if (id === activeId) return setOpen(null);
    setBusy(true);
    await fetch('/api/admin/scorecards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'activate', id }),
    });
    setOpen(null);
    setBusy(false);
    router.refresh();
  }

  function createScorecard() {
    setOpen(null);
    setCreateOpen(true);
  }

  async function logout() {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/');
    router.refresh();
  }

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={ref} className="relative z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
      <div className="flex items-center gap-1">
        <Link href="/account/scorecards" title="Your scorecards" className="mr-2 rounded hover:opacity-80">
          <img src={iconUrl || '/images/icon.png'} alt="Your scorecards" className="h-8 w-8 rounded object-contain" />
        </Link>
        <span className="h-6 w-px bg-gray-200" aria-hidden />

        {/* Account dropdown */}
        <button
          onClick={() => setOpen(open === 'account' ? null : 'account')}
          className="ml-2 flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[15px] font-medium hover:bg-gray-100"
        >
          {accountName}
          <span aria-hidden className={`text-muted transition-transform ${open === 'account' ? 'rotate-180' : ''}`}>⌄</span>
        </button>

        {/* Scorecard dropdown */}
        <button
          onClick={() => setOpen(open === 'scorecards' ? null : 'scorecards')}
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[15px] hover:bg-gray-100"
        >
          {scorecardTitle}
          <span aria-hidden className={`text-muted transition-transform ${open === 'scorecards' ? 'rotate-180' : ''}`}>⌄</span>
        </button>

        <Link href={activeId != null ? `/s/${activeId}` : '/'} target="_blank" className="ml-1 text-primary hover:opacity-70" aria-label="Open scorecard" title="Open scorecard">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5 h-[18px] w-[18px]">
            <path d="M14 5h5v5M19 5 10.5 13.5M19 14v5H5V5h5" />
          </svg>
        </Link>

        {/* Account menu — Account settings / Billing / Users and Permissions */}
        {open === 'account' && (
          <div className="absolute left-12 top-full mt-1 w-64 rounded-xl border border-gray-200 bg-white p-2 shadow-card">
            <p className="truncate px-2 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-widest text-muted">
              {accountName}
            </p>
            {[
              {
                href: '/account/settings',
                label: 'Account settings',
                icon: (
                  <>
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M18 6l-1.4 1.4M7.4 16.6 6 18" />
                  </>
                ),
              },
              {
                href: '/account/billing',
                label: 'Billing',
                icon: (
                  <>
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 9.5h18M6.5 15h4" />
                  </>
                ),
              },
              {
                href: '/account/users',
                label: 'Users and Permissions',
                icon: (
                  <>
                    <circle cx="9" cy="8" r="3" />
                    <path d="M3.8 19.5c.6-3 2.6-4.7 5.2-4.7s4.6 1.7 5.2 4.7" />
                    <path d="M15.5 5.8a3 3 0 0 1 0 4.4M17.5 15.3c1.4.8 2.3 2.2 2.6 4.2" />
                  </>
                ),
              },
              ...(isOwner
                ? [
                    {
                      href: '/account/manage-accounts',
                      label: 'Manage accounts',
                      icon: (
                        <>
                          <rect x="3" y="4" width="18" height="16" rx="2" />
                          <circle cx="9" cy="10" r="2" />
                          <path d="M5.8 16.5c.5-1.8 1.7-2.8 3.2-2.8s2.7 1 3.2 2.8M15 9.5h4M15 13h4" />
                        </>
                      ),
                    },
                  ]
                : []),
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(null)}
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm text-ink hover:bg-gray-50"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-[18px] w-[18px] text-muted"
                >
                  {item.icon}
                </svg>
                {item.label}
              </Link>
            ))}
            <button
              onClick={logout}
              className="mt-1 flex w-full items-center gap-2.5 rounded-md border-t border-gray-100 px-2 pb-2 pt-2.5 text-left text-sm text-ink hover:bg-gray-50"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-[18px] w-[18px] text-muted"
              >
                <path d="M14 4h5v16h-5M10 8l-4 4 4 4M6 12h9" />
              </svg>
              Log out
            </button>
          </div>
        )}

        {/* Scorecards menu */}
        {open === 'scorecards' && (
          <div className="absolute left-40 top-full mt-1 w-[380px] rounded-xl border border-gray-200 bg-white shadow-card">
            <div className="flex items-center justify-between px-4 pb-1 pt-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">Recent</p>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-4 w-4 text-primary">
                <circle cx="11" cy="11" r="6.5" />
                <path d="m20 20-3.8-3.8" />
              </svg>
            </div>
            <div className="max-h-72 overflow-y-auto px-2 pb-1">
              {(scorecards.length ? scorecards : [{ id: activeId ?? 1, name: scorecardTitle, is_default: true, updated_at: '' }]).map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => activate(sc.id)}
                  disabled={busy}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-gray-50 disabled:opacity-60"
                >
                  <div className="relative flex h-11 w-14 flex-none items-center justify-center overflow-hidden rounded border border-gray-200 bg-white">
                    {sc.id === activeId ? (
                      <img src={thumbUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs font-semibold text-muted">{sc.name.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate text-sm font-medium">
                      {sc.name}
                      <span
                        className={`h-2 w-2 flex-none rounded-full ${sc.id === activeId ? 'bg-green-500' : 'bg-gray-300'}`}
                        aria-hidden
                      />
                    </p>
                    <p className="text-xs text-muted">{sc.id === activeId ? 'Currently editing' : sc.is_default ? 'Live · default' : 'Live'}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="border-t border-gray-100 px-4 py-2.5">
              <Link
                href="/account/scorecards"
                onClick={() => setOpen(null)}
                className="flex items-center gap-2 py-1.5 text-sm font-medium text-primary hover:underline"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-4 w-4">
                  <path d="M4 6h16M7 12h10M10 18h4" />
                </svg>
                Go to Scorecards
              </Link>
              <button onClick={createScorecard} disabled={busy} className="flex items-center gap-2 py-1.5 text-sm font-medium text-primary hover:underline disabled:opacity-60">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-4 w-4">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
                Create Scorecard
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <a
          href="mailto:support@accesoai.com.au"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-muted hover:bg-gray-50"
          aria-label="Help"
          title="Contact support"
        >
          ?
        </a>
        <button
          onClick={logout}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-muted hover:bg-gray-50"
          aria-label="Log out"
          title="Log out"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M14 4h5v16h-5M10 8l-4 4 4 4M6 12h9" />
          </svg>
        </button>
        <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-sm font-semibold text-muted" aria-label="Account avatar">
          {accountName.slice(0, 1).toUpperCase()}
        </span>
      </div>
      <CreateScorecardModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
