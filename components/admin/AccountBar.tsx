'use client';

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

// Top account bar copied from ScoreApp: square icon, account dropdown, a
// scorecard switcher listing recent scorecards with Go to Scorecards /
// Create Scorecard, an open-in-new-tab link, help and avatar.
export default function AccountBar({
  accountName,
  scorecardTitle,
  iconUrl,
  thumbUrl,
}: {
  accountName: string;
  scorecardTitle: string;
  iconUrl: string;
  thumbUrl: string;
}) {
  const [open, setOpen] = useState<'account' | 'scorecards' | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const roadmap = () => alert('Multiple scorecards and accounts are coming soon.');

  return (
    <div ref={ref} className="relative z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
      <div className="flex items-center gap-1">
        <img src={iconUrl} alt="" className="mr-2 h-8 w-8 rounded object-contain" />
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

        <Link href="/" target="_blank" className="ml-1 text-primary hover:opacity-70" aria-label="Open scorecard" title="Open scorecard">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5 h-[18px] w-[18px]">
            <path d="M14 5h5v5M19 5 10.5 13.5M19 14v5H5V5h5" />
          </svg>
        </Link>

        {/* Account menu */}
        {open === 'account' && (
          <div className="absolute left-12 top-full mt-1 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-card">
            <p className="px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-widest text-muted">Account</p>
            <div className="rounded-md px-2 py-2 text-sm font-medium">{accountName}</div>
            <button onClick={roadmap} className="block w-full rounded-md px-2 py-2 text-left text-sm text-muted hover:bg-gray-50">
              ⊕ Add account
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
            <div className="px-2 pb-1">
              <div className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-gray-50">
                <div className="relative h-11 w-14 flex-none overflow-hidden rounded border border-gray-200 bg-white">
                  <img src={thumbUrl} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate text-sm font-medium">
                    {scorecardTitle}
                    <span className="h-2 w-2 flex-none rounded-full bg-green-500" aria-hidden />
                  </p>
                  <p className="text-xs text-muted">Live</p>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 px-4 py-2.5">
              <button onClick={roadmap} className="flex items-center gap-2 py-1.5 text-sm font-medium text-primary hover:underline">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-4 w-4">
                  <path d="M4 6h16M7 12h10M10 18h4" />
                </svg>
                Go to Scorecards
              </button>
              <button onClick={roadmap} className="flex items-center gap-2 py-1.5 text-sm font-medium text-primary hover:underline">
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
          href="https://github.com/joelbadcock127-eng/ScoreApp"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-muted hover:bg-gray-50"
          aria-label="Help"
          title="Help"
        >
          ?
        </a>
        <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-sm font-semibold text-muted" aria-label="Account avatar">
          {accountName.slice(0, 1).toUpperCase()}
        </span>
      </div>
    </div>
  );
}
