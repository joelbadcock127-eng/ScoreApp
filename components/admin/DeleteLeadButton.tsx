'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Two step delete for one lead: the first click asks, the second removes.
// Used on the lead detail page for test entries and mistakes.
export default function DeleteLeadButton({ leadId, label }: { leadId: string; label: string }) {
  const [arm, setArm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function remove() {
    setBusy(true);
    setError('');
    const res = await fetch(`/api/admin/leads/${leadId}`, { method: 'DELETE' });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error || 'Could not delete this lead.');
      setBusy(false);
      return;
    }
    router.push('/admin/leads');
    router.refresh();
  }

  if (!arm) {
    return (
      <button
        onClick={() => setArm(true)}
        className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-tier-low hover:bg-red-50"
      >
        Delete this lead
      </button>
    );
  }
  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm">
      <p className="text-ink">
        Permanently delete <b>{label}</b> and their answers? This cannot be undone.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={remove}
          disabled={busy}
          className="rounded-md bg-tier-low px-4 py-2 font-medium text-white hover:brightness-110 disabled:opacity-60"
        >
          {busy ? 'Deleting…' : 'Yes, delete'}
        </button>
        <button
          onClick={() => setArm(false)}
          disabled={busy}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 font-medium hover:bg-gray-50"
        >
          Keep
        </button>
      </div>
      {error && <p className="mt-2 text-tier-low">{error}</p>}
    </div>
  );
}
