'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScorecardConfig } from '@/lib/types';
import LeadFormFields from './LeadFormFields';
import Modal from './Modal';
import Spinner from './Spinner';

// Wraps the landing page; any element with [data-start-scorecard] opens the lead form modal.
export default function StartScorecard({
  leadForm,
  children,
}: {
  leadForm: ScorecardConfig['leadForm'];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('[data-start-scorecard]');
      if (target) setOpen(true);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const form = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {};
    for (const f of leadForm.fields.filter((f) => f.enabled)) {
      payload[f.key] = f.type === 'checkbox' ? form.get(f.key) === 'on' : form.get(f.key) ?? '';
    }
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Something went wrong. Please try again.');
      const { id } = await res.json();
      router.push(`/quiz?lead=${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setSubmitting(false);
    }
  }

  return (
    <>
      {children}
      <Modal open={open} onClose={() => setOpen(false)}>
        <p className="text-center text-lg">{leadForm.heading}</p>
        <form onSubmit={onSubmit} className="mt-6">
          <LeadFormFields fields={leadForm.fields} />
          {error && <p className="mt-4 text-sm text-tier-low">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-md bg-primary py-4 text-lg font-medium text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {submitting && <Spinner className="h-5 w-5 text-white" />}
            {submitting ? 'Starting…' : leadForm.submitLabel}
          </button>
        </form>
      </Modal>
    </>
  );
}
