'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type ContentKey = 'landing' | 'questions' | 'results' | 'pdf';

const CONTENT: { key: ContentKey; label: string; pageName: string; badge?: string }[] = [
  { key: 'landing', label: 'Landing Pages', pageName: 'Main Landing Page', badge: 'HOME PAGE' },
  { key: 'questions', label: 'Questions', pageName: 'Questions Flow' },
  { key: 'results', label: 'Result Pages', pageName: 'Main Result Page', badge: 'DEFAULT' },
  { key: 'pdf', label: 'PDF Reports', pageName: 'Main Report', badge: 'DEFAULT' },
];

function ContentIcon({ k }: { k: ContentKey }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: 'h-4 w-4',
  };
  switch (k) {
    case 'landing':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 9h18" />
        </svg>
      );
    case 'questions':
      return (
        <svg {...common}>
          <path d="M21 12a9 9 0 1 0-4 7.5L21 21l-1-4A9 9 0 0 0 21 12Z" />
        </svg>
      );
    case 'results':
      return (
        <svg {...common}>
          <path d="M4 19 9 12l4 3 7-9" />
          <path d="M4 21h16" />
        </svg>
      );
    case 'pdf':
      return (
        <svg {...common}>
          <path d="M6 3h8l4 4v14H6V3Z" />
          <path d="M14 3v4h4M9 12h6M9 16h6" />
        </svg>
      );
  }
}

// Shared editor top bar: back button, scorecard title, centre content-switcher
// dropdown (jump between the Landing / Questions / Results / PDF editors),
// device toggle and Save.
export default function TopBar({
  title,
  content,
  device,
  setDevice,
  dirty,
  saving,
  onSave,
  showDevice = true,
}: {
  title: string;
  content: ContentKey;
  device: 'desktop' | 'mobile';
  setDevice: (d: 'desktop' | 'mobile') => void;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  showDevice?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const current = CONTENT.find((c) => c.key === content)!;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative z-30 flex flex-none items-center justify-between border-b border-gray-200 bg-white px-3 py-2.5">
      <div className="flex w-1/4 min-w-0 items-center gap-3">
        <Link
          href="/admin"
          className="flex h-8 w-8 flex-none items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50"
          aria-label="Back to dashboard"
        >
          ‹
        </Link>
        <span className="truncate text-[15px] font-medium">{title}</span>
      </div>

      {/* Centre content-switcher tab */}
      <div ref={menuRef} className="relative">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-1.5 text-sm hover:bg-gray-50"
        >
          <span className="text-muted">
            <ContentIcon k={content} />
          </span>
          <span className="text-muted">{current.label}</span>
          <span className="text-muted">›</span>
          <span className="max-w-[180px] truncate font-semibold">{current.pageName}</span>
          {current.badge && (
            <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-700">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              {current.badge}
            </span>
          )}
          <span aria-hidden className={`text-muted transition-transform ${menuOpen ? 'rotate-180' : ''}`}>
            ⌄
          </span>
        </button>

        {menuOpen && (
          <div className="absolute left-1/2 top-full mt-2 flex w-[620px] max-w-[92vw] -translate-x-1/2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card">
            <div className="w-52 flex-none border-r border-gray-100 bg-gray-50/60 p-3">
              <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-widest text-muted">Content</p>
              {CONTENT.map((c) => (
                <button
                  key={c.key}
                  onClick={() => {
                    setMenuOpen(false);
                    if (c.key !== content) router.push(`/admin/build/${c.key}`);
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm ${
                    c.key === content ? 'bg-white font-medium shadow-sm' : 'hover:bg-gray-100'
                  }`}
                >
                  <span className="text-muted">
                    <ContentIcon k={c.key} />
                  </span>
                  {c.label}
                </button>
              ))}
            </div>
            <div className="flex-1 p-4">
              <p className="font-semibold">
                {current.label} <span className="ml-1 text-sm font-normal text-muted">1 page</span>
              </p>
              <div className="mt-3 rounded-lg border border-gray-200 p-3">
                {current.badge && (
                  <span className="flex w-fit items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    {current.badge}
                  </span>
                )}
                <p className="mt-1 font-medium">{current.pageName}</p>
                <p className="mt-0.5 text-xs text-muted">Live</p>
              </div>
              <button
                disabled
                className="mt-3 w-full cursor-not-allowed rounded-lg border border-dashed border-gray-300 py-2.5 text-sm text-muted"
                title="Multiple pages are on the roadmap"
              >
                ⊕ Add page
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex w-1/4 items-center justify-end gap-2">
        {showDevice && (
          <div className="hidden rounded-lg border border-gray-200 p-0.5 sm:flex">
            <button
              onClick={() => setDevice('desktop')}
              aria-label="Desktop preview"
              className={`rounded-md px-2 py-1 ${device === 'desktop' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <rect x="3" y="5" width="18" height="12" rx="1.5" />
                <path d="M9 20h6M12 17v3" strokeLinecap="round" />
              </svg>
            </button>
            <button
              onClick={() => setDevice('mobile')}
              aria-label="Mobile preview"
              className={`rounded-md px-2 py-1 ${device === 'mobile' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <rect x="8" y="3" width="8" height="18" rx="1.5" />
                <path d="M11.5 18h1" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
        <button
          onClick={onSave}
          disabled={!dirty || saving}
          className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Save →'}
        </button>
      </div>
    </div>
  );
}
