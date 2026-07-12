'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/Modal';

// "Create Scorecard" chooser: start from a blank scorecard or hand the whole
// first draft to the AI Builder.
export default function CreateScorecardModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [manual, setManual] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function createBlank(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError('');
    const res = await fetch('/api/admin/scorecards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', name: name.trim() }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error || 'Could not create the scorecard.');
      setBusy(false);
      return;
    }
    router.push('/admin');
    router.refresh();
  }

  function close() {
    setManual(false);
    setName('');
    setError('');
    onClose();
  }

  return (
    <Modal open={open} onClose={close}>
      <h2 className="text-center text-2xl font-bold">Create a scorecard</h2>

      {!manual ? (
        <div className="mt-6 grid gap-4">
          {/* AI option */}
          <button
            onClick={() => {
              close();
              router.push('/account/ai-builder');
            }}
            className="group flex items-start gap-4 rounded-xl border-2 border-primary/30 bg-primary/5 p-5 text-left transition hover:border-primary"
          >
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-primary text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <path d="M12 3l1.7 4.6L18 9l-4.3 1.4L12 15l-1.7-4.6L6 9l4.3-1.4L12 3Z" />
                <path d="M18.5 14.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1Z" />
              </svg>
            </span>
            <span>
              <span className="flex items-center gap-2 font-semibold">
                Build it with AI
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  Recommended
                </span>
              </span>
              <span className="mt-1 block text-sm text-muted">
                Describe your business and get a complete draft — landing page, questions, results and PDF report — in
                minutes. Everything stays editable.
              </span>
            </span>
          </button>

          {/* Manual option */}
          <button
            onClick={() => setManual(true)}
            className="flex items-start gap-4 rounded-xl border border-gray-200 p-5 text-left transition hover:border-gray-400"
          >
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-gray-100 text-ink">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <path d="M14 4l6 6-10 10H4v-6L14 4Z" />
                <path d="M12 6l6 6" />
              </svg>
            </span>
            <span>
              <span className="font-semibold">Start from scratch</span>
              <span className="mt-1 block text-sm text-muted">
                A blank scorecard with placeholder content you build up yourself in the editors.
              </span>
            </span>
          </button>
        </div>
      ) : (
        <form onSubmit={createBlank} className="mt-6">
          <label className="block text-xs font-semibold uppercase tracking-wide text-ink">Scorecard name</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. The Business Growth Scorecard"
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-primary"
          />
          {error && <p className="mt-3 text-sm text-tier-low">{error}</p>}
          <div className="mt-5 flex items-center justify-between">
            <button type="button" onClick={() => setManual(false)} className="text-sm font-medium text-muted hover:text-ink">
              ← Back
            </button>
            <button
              disabled={busy || !name.trim()}
              className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-white hover:brightness-110 disabled:opacity-50"
            >
              {busy ? 'Creating…' : 'Create scorecard'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
