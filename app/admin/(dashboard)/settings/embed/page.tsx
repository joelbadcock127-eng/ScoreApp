import Link from 'next/link';
import { headers } from 'next/headers';
import { getConfig } from '@/lib/server/config';
import CopyLinkButton from '@/components/admin/CopyLinkButton';

export const dynamic = 'force-dynamic';

function EmbedIcon({ kind }: { kind: 'full' | 'inline' | 'popup' | 'chat' }) {
  const common = {
    viewBox: '0 0 48 48',
    className: 'h-12 w-12 flex-none',
  };
  // Simple two-tone pictograms like the ScoreApp cards.
  switch (kind) {
    case 'full':
      return (
        <svg {...common}>
          <rect x="4" y="8" width="40" height="32" rx="4" fill="#dbeafe" />
          <rect x="9" y="13" width="30" height="22" rx="2" fill="#1c78fe" />
          <rect x="12" y="17" width="12" height="3" rx="1.5" fill="#fff" />
          <rect x="12" y="23" width="24" height="2.5" rx="1.25" fill="#bfdbfe" />
          <rect x="12" y="28" width="18" height="2.5" rx="1.25" fill="#bfdbfe" />
        </svg>
      );
    case 'inline':
      return (
        <svg {...common}>
          <rect x="4" y="8" width="40" height="32" rx="4" fill="#dbeafe" />
          <rect x="9" y="12" width="20" height="3" rx="1.5" fill="#93c5fd" />
          <rect x="9" y="19" width="30" height="14" rx="2" fill="#1c78fe" />
          <rect x="9" y="36" width="26" height="3" rx="1.5" fill="#93c5fd" />
        </svg>
      );
    case 'popup':
      return (
        <svg {...common}>
          <rect x="4" y="8" width="40" height="32" rx="4" fill="#dbeafe" />
          <rect x="12" y="14" width="24" height="20" rx="3" fill="#1c78fe" />
          <rect x="17" y="20" width="14" height="3" rx="1.5" fill="#fff" />
          <rect x="17" y="26" width="10" height="2.5" rx="1.25" fill="#bfdbfe" />
        </svg>
      );
    case 'chat':
      return (
        <svg {...common}>
          <rect x="4" y="8" width="40" height="32" rx="4" fill="#dbeafe" />
          <rect x="22" y="16" width="18" height="18" rx="3" fill="#1c78fe" />
          <circle cx="27" cy="25" r="1.5" fill="#fff" />
          <circle cx="31" cy="25" r="1.5" fill="#fff" />
          <circle cx="35" cy="25" r="1.5" fill="#fff" />
        </svg>
      );
  }
}

const OPTIONS = [
  {
    type: 'full',
    title: 'Full page',
    body: 'Embed your Scorecard full screen over the top of your web page',
  },
  {
    type: 'inline',
    title: 'Inline',
    body: 'Embed your Scorecard within the content of an existing web page',
  },
  {
    type: 'popup',
    title: 'Pop up',
    body: 'Add a button to your web page that opens your Scorecard in a pop up window',
  },
  {
    type: 'chat',
    title: 'Chat style',
    body: 'Embed your Scorecard in a chat style window',
  },
] as const;

export default async function EmbedPage() {
  const config = await getConfig();
  const h = headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? 'https';
  const url = `${proto}://${host}`;

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-bold">Embed and share</h1>

      {/* Share your link */}
      <h2 className="mt-8 text-xl font-semibold">Share your link</h2>
      <div className="mt-4 flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-6 sm:flex-row sm:items-center">
        <div className="relative h-28 w-44 flex-none overflow-hidden rounded-lg border border-gray-200 bg-white">
          <iframe
            src="/"
            title="Scorecard preview"
            className="pointer-events-none absolute left-0 top-0 h-[768px] w-[1280px] origin-top-left"
            style={{ transform: 'scale(0.14)' }}
            tabIndex={-1}
          />
        </div>
        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-green-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Live
          </span>
          <h3 className="mt-2 text-lg font-semibold">{config.title}</h3>
          <a href={url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1.5 break-all text-primary hover:underline">
            {url} <span aria-hidden>↗</span>
          </a>
          <div className="mt-3">
            <CopyLinkButton url={url} />
          </div>
        </div>
      </div>

      {/* Embed on your website */}
      <h2 className="mt-10 text-xl font-semibold">Embed on your website</h2>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        {OPTIONS.map((o) => (
          <Link
            key={o.type}
            href={`/admin/settings/embed/${o.type}`}
            className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-6 transition hover:border-primary hover:shadow-card"
          >
            <EmbedIcon kind={o.type} />
            <span>
              <span className="block text-lg font-semibold">{o.title}</span>
              <span className="mt-1 block text-[15px] leading-snug text-muted">{o.body}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
