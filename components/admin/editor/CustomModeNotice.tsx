import Link from 'next/link';
import AiSparkleIcon from '@/components/AiSparkleIcon';

// Shown instead of the standard Landing/Results editor when that page is live
// with a custom AI design — so the two editors never silently disagree about
// what visitors actually see.
export default function CustomModeNotice({ page }: { page: 'landing' | 'results' }) {
  const label = page === 'landing' ? 'landing page' : 'results page';
  return (
    <div className="mx-auto mt-16 max-w-xl text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-card">
        <AiSparkleIcon className="h-9 w-9" />
      </div>
      <h1 className="mt-6 text-2xl font-bold">This {label} is live with a custom AI design</h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
        Visitors currently see the AI-designed page, so that’s where your edits belong — every word, image and colour
        is editable there, plus the AI chat for design changes. Your standard {label} is kept safe underneath and can
        go live again with one click.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/admin/build/custom"
          className="rounded-md bg-primary px-7 py-2.5 font-medium text-white hover:brightness-110"
        >
          Open Custom Design
        </Link>
        <Link
          href={`/admin/build/${page}?standard=1`}
          className="rounded-md border border-gray-300 px-6 py-2.5 text-sm font-medium text-ink hover:bg-gray-50"
        >
          Edit the standard version anyway
        </Link>
      </div>
      <p className="mt-4 text-xs text-muted">
        To make the standard version live again: Custom Design → switch the page to “Standard editor” → Save.
      </p>
    </div>
  );
}
