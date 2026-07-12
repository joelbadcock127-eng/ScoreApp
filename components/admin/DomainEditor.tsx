'use client';

import { useState } from 'react';

// Settings → Domain: choose the subdomain this scorecard publishes on.
export default function DomainEditor({
  scorecardId,
  initialDomain,
  baseDomain,
}: {
  scorecardId: number;
  initialDomain: string;
  baseDomain: string;
}) {
  const [domain, setDomain] = useState(initialDomain);
  const [saved, setSaved] = useState(initialDomain);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const clean = domain.trim().toLowerCase();
  const liveUrl = clean ? `https://www.${clean}.${baseDomain}` : `https://www.${baseDomain}`;

  async function save() {
    setSaving(true);
    setMessage('');
    const res = await fetch('/api/admin/scorecards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set-domain', id: scorecardId, domain: clean }),
    });
    const json = await res.json().catch(() => ({}));
    setSaving(false);
    if (res.ok) {
      setSaved(clean);
      setMessage('Saved — your scorecard now answers on this address.');
    } else {
      setMessage(json.error || 'Save failed.');
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold">Domain</h1>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink">Your scorecard address</p>
        <p className="mt-2 text-sm text-muted">
          Pick the subdomain this scorecard publishes on. Visitors who open this address see this scorecard —
          each scorecard can have its own.
        </p>

        <div className="mt-6 flex items-center overflow-hidden rounded-lg border border-gray-300 focus-within:border-primary">
          <span className="flex-none bg-gray-50 px-3 py-2.5 text-sm text-muted">https://www.</span>
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            placeholder="yourname"
            className="w-full min-w-0 border-x border-gray-200 px-3 py-2.5 text-sm font-medium outline-none"
          />
          <span className="flex-none bg-gray-50 px-3 py-2.5 text-sm text-muted">.{baseDomain}</span>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Live URL</p>
            <p className="truncate text-sm font-medium text-primary">{liveUrl}</p>
          </div>
          {saved && (
            <a
              href={`https://www.${saved}.${baseDomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-none text-sm font-medium text-primary hover:underline"
            >
              Open ↗
            </a>
          )}
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={save}
            disabled={saving || clean === saved}
            className="rounded-md bg-primary px-8 py-2.5 font-medium text-white hover:brightness-110 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          {message && <span className="text-sm text-muted">{message}</span>}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5 text-sm leading-relaxed">
        <p className="font-semibold">One-time hosting setup (already done? then you’re finished)</p>
        <p className="mt-1 text-muted">
          For subdomains to reach the app automatically, the hosting needs a wildcard once:
        </p>
        <ul className="mt-2 list-disc pl-5 text-muted">
          <li>
            DNS: add a wildcard record <code className="rounded bg-white px-1">*.{baseDomain}</code> (and{' '}
            <code className="rounded bg-white px-1">*.www.{baseDomain}</code> if you use the www form) pointing at your
            app host.
          </li>
          <li>Hosting (e.g. Vercel): add <code className="rounded bg-white px-1">*.{baseDomain}</code> as a domain on the project.</li>
        </ul>
        <p className="mt-2 text-muted">
          After that, every subdomain saved here works instantly — no further setup per scorecard.
        </p>
      </div>
    </div>
  );
}
