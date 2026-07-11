'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Tab = 'landing' | 'questions' | 'results' | 'pdf';

const TAB_META: Record<
  Tab,
  { group: string; pageName: string; src: string; badge?: string }
> = {
  landing: { group: 'Landing Pages', pageName: 'Main Landing Page', src: '/', badge: 'HOME PAGE' },
  questions: { group: 'Questions', pageName: 'Questions Flow', src: '/quiz?preview=1' },
  results: { group: 'Result Pages', pageName: 'Main Result Page', src: '/results/preview', badge: 'DEFAULT' },
  pdf: { group: 'PDF Reports', pageName: 'Main Report', src: '/api/report/preview?tier=medium', badge: 'DEFAULT' },
};

const CONTENT_RAIL: { href: string; label: string; tab?: Tab }[] = [
  { href: '/admin/editor/landing', label: 'Landing Pages' },
  { href: '/admin/editor/questions', label: 'Questions' },
  { href: '/admin/build/results', label: 'Result Pages', tab: 'results' },
  { href: '/admin/build/pdf', label: 'PDF Reports', tab: 'pdf' },
];

// ScoreApp-style build screen: top bar with a centered dropdown tab,
// desktop/mobile toggle (hidden for PDF) and a live preview underneath.
export default function BuildScreen({ tab }: { tab: Tab }) {
  const meta = TAB_META[tab];
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [menuOpen, setMenuOpen] = useState(false);
  const [pdfTier, setPdfTier] = useState<'low' | 'medium' | 'high'>('medium');
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const src = tab === 'pdf' ? `/api/report/preview?tier=${pdfTier}` : meta.src;

  return (
    <div className="-m-6 flex h-[calc(100vh-0px)] flex-col md:-m-10">
      {/* Top bar */}
      <div className="relative z-20 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="w-40" />

        {/* Centered dropdown tab */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm hover:bg-gray-100"
          >
            <span className="text-muted">{meta.group}</span>
            <span aria-hidden className="text-muted">›</span>
            <span className="max-w-[180px] truncate font-medium">{meta.pageName}</span>
            {meta.badge && (
              <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-700">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                {meta.badge}
              </span>
            )}
            <span aria-hidden className={`text-muted transition-transform ${menuOpen ? 'rotate-180' : ''}`}>⌄</span>
          </button>

          {menuOpen && (
            <div className="absolute left-1/2 top-full mt-2 flex w-[560px] max-w-[90vw] -translate-x-1/2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card">
              <div className="w-44 flex-none border-r border-gray-100 p-3">
                <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-widest text-muted">
                  Content
                </p>
                {CONTENT_RAIL.map((c) => (
                  <button
                    key={c.href}
                    onClick={() => {
                      setMenuOpen(false);
                      router.push(c.href);
                    }}
                    className={`block w-full rounded-md px-2 py-2 text-left text-sm ${
                      c.tab === tab ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="flex-1 p-4">
                <p className="font-semibold">
                  {meta.group} <span className="ml-1 text-sm font-normal text-muted">1 page</span>
                </p>
                <div className="mt-3 rounded-lg border border-gray-200 p-3">
                  {meta.badge && (
                    <span className="flex w-fit items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      {meta.badge}
                    </span>
                  )}
                  <p className="mt-1 font-medium">{meta.pageName}</p>
                  <p className="mt-0.5 text-xs text-muted">Live</p>
                </div>
                <button
                  disabled
                  className="mt-3 w-full cursor-not-allowed rounded-lg border border-dashed border-gray-300 py-2.5 text-sm text-muted"
                  title="Editor features coming later"
                >
                  + Add page
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Device toggle (hidden for PDF) */}
        <div className="flex w-40 items-center justify-end gap-2">
          {tab === 'pdf' ? (
            <select
              value={pdfTier}
              onChange={(e) => setPdfTier(e.target.value as typeof pdfTier)}
              className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
            >
              <option value="low">Low sample</option>
              <option value="medium">Medium sample</option>
              <option value="high">High sample</option>
            </select>
          ) : (
            <div className="flex rounded-lg border border-gray-200 p-0.5">
              <button
                onClick={() => setDevice('desktop')}
                aria-label="Desktop preview"
                className={`rounded-md px-2.5 py-1.5 ${device === 'desktop' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <rect x="3" y="5" width="18" height="12" rx="1.5" />
                  <path d="M9 20h6M12 17v3" strokeLinecap="round" />
                </svg>
              </button>
              <button
                onClick={() => setDevice('mobile')}
                aria-label="Mobile preview"
                className={`rounded-md px-2.5 py-1.5 ${device === 'mobile' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <rect x="8" y="3" width="8" height="18" rx="1.5" />
                  <path d="M11.5 18h1" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 overflow-hidden bg-gray-100 p-4">
        {tab === 'pdf' ? (
          <div className="mx-auto h-full max-w-4xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow-card">
            <iframe key={src} src={src} title="PDF preview" className="h-full w-full" />
          </div>
        ) : device === 'desktop' ? (
          <div className="mx-auto h-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-card">
            <iframe key={src} src={src} title="Preview" className="h-full w-full" />
          </div>
        ) : (
          <div className="flex h-full items-start justify-center overflow-y-auto py-2">
            <div className="h-[780px] w-[390px] flex-none overflow-hidden rounded-[36px] border-8 border-gray-800 bg-white shadow-card">
              <iframe key={src + '-m'} src={src} title="Mobile preview" className="h-full w-full" />
            </div>
          </div>
        )}
      </div>

      <p className="border-t border-gray-200 bg-white px-4 py-2 text-center text-xs text-muted">
        Preview only — editing tools are on the roadmap.{' '}
        <Link href={src} target="_blank" className="text-primary hover:underline">
          Open in new tab ↗
        </Link>
      </p>
    </div>
  );
}
