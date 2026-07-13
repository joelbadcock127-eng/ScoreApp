'use client';

import { useCallback, useEffect, useState } from 'react';

type DomainStatus = 'live' | 'mismatch' | 'reachable' | 'unreachable';
interface StatusTarget {
  label: string;
  host: string;
  status: DomainStatus;
}

// Settings → Domain: the scorecard's built-in link, a managed subdomain, and
// a fully custom domain the customer owns.
export default function DomainEditor({
  scorecardId,
  initialDomain,
  initialCustomDomain = '',
  baseDomain,
  allowCustomDomain = true,
}: {
  scorecardId: number;
  initialDomain: string;
  initialCustomDomain?: string;
  baseDomain: string;
  allowCustomDomain?: boolean;
}) {
  const [domain, setDomain] = useState(initialDomain);
  const [saved, setSaved] = useState(initialDomain);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [custom, setCustom] = useState(initialCustomDomain);
  const [customSaved, setCustomSaved] = useState(initialCustomDomain);
  const [customSaving, setCustomSaving] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [statuses, setStatuses] = useState<StatusTarget[] | null>(null);
  const [checking, setChecking] = useState(false);

  const checkStatus = useCallback(async () => {
    setChecking(true);
    try {
      const res = await fetch(`/api/admin/domain-status?id=${scorecardId}`, { cache: 'no-store' });
      const json = await res.json().catch(() => ({}));
      setStatuses(res.ok ? json.targets ?? [] : []);
    } catch {
      setStatuses([]);
    } finally {
      setChecking(false);
    }
  }, [scorecardId]);

  useEffect(() => {
    if (initialDomain || initialCustomDomain) checkStatus();
  }, [initialDomain, initialCustomDomain, checkStatus]);

  const clean = domain.trim().toLowerCase();
  const liveUrl = clean ? `https://${clean}.${baseDomain}` : `https://${baseDomain}`;
  const cleanCustom = custom
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/^www\./, '');

  async function post(body: Record<string, unknown>) {
    const res = await fetch('/api/admin/scorecards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok, json };
  }

  async function save() {
    setSaving(true);
    setMessage('');
    const { ok, json } = await post({ action: 'set-domain', id: scorecardId, domain: clean });
    setSaving(false);
    if (ok) {
      setSaved(clean);
      setMessage('Saved — your scorecard now answers on this address.');
      setTimeout(checkStatus, 500);
    } else {
      setMessage(json.error || 'Save failed.');
    }
  }

  async function saveCustom() {
    setCustomSaving(true);
    setCustomMessage('');
    const { ok, json } = await post({ action: 'set-custom-domain', id: scorecardId, domain: cleanCustom });
    setCustomSaving(false);
    if (ok) {
      setCustomSaved(cleanCustom);
      setCustomMessage(cleanCustom ? 'Saved — complete the DNS step below and it goes live.' : 'Removed.');
      setTimeout(checkStatus, 500);
    } else {
      setCustomMessage(json.error || 'Save failed.');
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold">Domain</h1>

      {/* Built-in distinct link */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink">Built-in link</p>
        <p className="mt-2 text-sm text-muted">
          Every scorecard has its own link that always works — share it as-is, or set up a nicer address below.
        </p>
        <div className="mt-4 flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
          <p className="truncate text-sm font-medium text-primary">/s/{scorecardId}</p>
          <a
            href={`/s/${scorecardId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-none text-sm font-medium text-primary hover:underline"
          >
            Open ↗
          </a>
        </div>
      </div>

      {/* Live status of connected domains */}
      {(saved || customSaved) && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink">Domain status</p>
            <button
              onClick={checkStatus}
              disabled={checking}
              className="text-xs font-medium text-primary hover:underline disabled:opacity-60"
            >
              {checking ? 'Checking…' : 'Re-check'}
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {(statuses ?? []).map((t) => (
              <StatusRow key={t.host} target={t} />
            ))}
            {statuses && statuses.length === 0 && !checking && (
              <p className="text-sm text-muted">Nothing to check yet.</p>
            )}
            {!statuses && <p className="text-sm text-muted">Checking…</p>}
          </div>
          <p className="mt-3 text-xs text-muted">
            New domains can take a few minutes (occasionally longer) to go live while DNS propagates and the SSL
            certificate is issued.
          </p>
        </div>
      )}

      {/* Managed subdomain */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink">Free subdomain</p>
        <p className="mt-2 text-sm text-muted">
          Pick the subdomain this scorecard publishes on. Visitors who open this address see this scorecard —
          each scorecard can have its own.
        </p>

        <div className="mt-6 flex items-center overflow-hidden rounded-lg border border-gray-300 focus-within:border-primary">
          <span className="flex-none bg-gray-50 px-3 py-2.5 text-sm text-muted">https://</span>
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            placeholder="yourname"
            className="w-full min-w-0 border-x border-gray-200 px-3 py-2.5 text-sm font-medium outline-none"
          />
          <span className="flex-none bg-gray-50 px-3 py-2.5 text-sm text-muted">.{baseDomain}</span>
        </div>
        <p className="mt-2 text-xs text-muted">
          Use this exact address (no <code className="rounded bg-gray-50 px-1">www.</code>). The{' '}
          <code className="rounded bg-gray-50 px-1">www.</code> version also works only if you add a separate{' '}
          <code className="rounded bg-gray-50 px-1">www.{clean || 'yourname'}</code> record and domain too.
        </p>

        <div className="mt-4 flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Live URL</p>
            <p className="truncate text-sm font-medium text-primary">{liveUrl}</p>
          </div>
          {saved && (
            <a
              href={`https://${saved}.${baseDomain}`}
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

      {/* Custom owned domain — hidden entirely when the owner has not enabled
          this feature for the account. */}
      {allowCustomDomain && (
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink">Your own domain</p>
        <p className="mt-2 text-sm text-muted">
          Already own a domain? Point it here and this scorecard answers on it — e.g.{' '}
          <code className="rounded bg-gray-50 px-1">scorecard.yourbusiness.com</code> or a domain bought just for it.
        </p>

        <div className="mt-6 flex items-center overflow-hidden rounded-lg border border-gray-300 focus-within:border-primary">
          <span className="flex-none bg-gray-50 px-3 py-2.5 text-sm text-muted">https://</span>
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value.toLowerCase().replace(/[^a-z0-9.\-/:]/g, ''))}
            placeholder="scorecard.yourbusiness.com"
            className="w-full min-w-0 border-l border-gray-200 px-3 py-2.5 text-sm font-medium outline-none"
          />
        </div>
        <p className="mt-2 text-xs text-muted">www. is optional — both forms will work.</p>

        {customSaved && (
          <div className="mt-4 flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Live URL</p>
              <p className="truncate text-sm font-medium text-primary">https://{customSaved}</p>
            </div>
            <a
              href={`https://${customSaved}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-none text-sm font-medium text-primary hover:underline"
            >
              Open ↗
            </a>
          </div>
        )}

        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={saveCustom}
            disabled={customSaving || cleanCustom === customSaved}
            className="rounded-md bg-primary px-8 py-2.5 font-medium text-white hover:brightness-110 disabled:opacity-60"
          >
            {customSaving ? 'Saving…' : cleanCustom || !customSaved ? 'Save' : 'Remove'}
          </button>
          {customMessage && <span className="text-sm text-muted">{customMessage}</span>}
        </div>

        <div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm leading-relaxed">
          <p className="font-semibold">Connect your domain (2 steps, done at your domain provider)</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted">
            <li>
              Add a <b>CNAME</b> record for your domain (e.g. <code className="rounded bg-white px-1">scorecard</code>)
              pointing to your app host (on Vercel: <code className="rounded bg-white px-1">cname.vercel-dns.com</code>).
              For a root domain use an A/ALIAS record instead.
            </li>
            <li>
              Add the domain to the hosting project (Vercel → Settings → Domains) so it issues the SSL certificate.
            </li>
          </ol>
          <p className="mt-2 text-muted">
            Once DNS propagates (usually minutes), the app recognises the domain automatically and serves this
            scorecard — nothing else to configure here.
          </p>
        </div>
      </div>
      )}

      <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5 text-sm leading-relaxed">
        <p className="font-semibold">One-time hosting setup for free subdomains (already done? then you’re finished)</p>
        <p className="mt-1 text-muted">
          For {baseDomain} subdomains to reach the app automatically, the hosting needs a wildcard once:
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

// One connected-domain status line with a coloured pill.
function StatusRow({ target }: { target: StatusTarget }) {
  const map: Record<DomainStatus, { label: string; dot: string; text: string }> = {
    live: { label: 'Live', dot: 'bg-green-500', text: 'text-green-700' },
    mismatch: { label: 'Serving a different scorecard', dot: 'bg-amber-500', text: 'text-amber-700' },
    reachable: { label: 'Reachable — finishing setup', dot: 'bg-amber-500', text: 'text-amber-700' },
    unreachable: { label: 'Not connected yet', dot: 'bg-gray-400', text: 'text-muted' },
  };
  const s = map[target.status];
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{target.host}</p>
        <p className="text-[11px] uppercase tracking-wide text-muted">{target.label}</p>
      </div>
      <span className={`flex flex-none items-center gap-1.5 text-xs font-semibold ${s.text}`}>
        <span className={`h-2 w-2 rounded-full ${s.dot}`} />
        {s.label}
      </span>
    </div>
  );
}
