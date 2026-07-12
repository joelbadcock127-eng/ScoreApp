import Link from 'next/link';

export default function AiBuilderPage() {
  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold">AI Builder</h1>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
          New
        </span>
      </div>
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
            <path d="M12 3l1.7 4.6L18 9l-4.3 1.4L12 15l-1.7-4.6L6 9l4.3-1.4L12 3Z" />
            <path d="M18.5 14.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1Z" />
          </svg>
        </div>
        <p className="mt-4 text-lg font-semibold">Describe your business, get a scorecard</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          The AI Builder will draft questions, score tiers and result pages from a short description. It&apos;s on the
          roadmap — in the meantime, start from a template and customise it in minutes.
        </p>
        <Link
          href="/account/templates"
          className="mt-6 inline-block rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-white hover:brightness-110"
        >
          Browse templates
        </Link>
      </div>
    </div>
  );
}
