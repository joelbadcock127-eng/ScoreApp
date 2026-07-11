'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScorecardConfig } from '@/lib/types';
import LeadFormFields from './LeadFormFields';
import Modal from './Modal';
import Spinner from './Spinner';

// Wraps the results page; any element with [data-change-details] opens the
// "Update your details" popup (used by "Change email address" and "Request a Review").
export default function ChangeDetails({
  leadId,
  leadForm,
  changeDetails,
  defaults,
  children,
}: {
  leadId: string;
  leadForm: ScorecardConfig['leadForm'];
  changeDetails: ScorecardConfig['results']['changeDetails'];
  defaults: Record<string, string | boolean>;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('[data-change-details]');
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
    const payload: Record<string, unknown> = { action: 'update_details' };
    for (const f of leadForm.fields.filter((f) => f.enabled)) {
      payload[f.key] = f.type === 'checkbox' ? form.get(f.key) === 'on' : form.get(f.key) ?? '';
    }
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Could not update your details. Please try again.');
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {children}
      <Modal open={open} onClose={() => setOpen(false)}>
        <h2 className="text-center text-2xl font-semibold">{changeDetails.heading}</h2>
        <p className="mt-2 text-center text-muted">{changeDetails.subheading}</p>
        <form onSubmit={onSubmit} className="mt-6">
          <LeadFormFields fields={leadForm.fields} defaults={defaults} />
          {error && <p className="mt-4 text-sm text-tier-low">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-md bg-primary py-4 text-lg font-medium text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {submitting && <Spinner className="h-5 w-5 text-white" />}
            {submitting ? 'Saving…' : changeDetails.submitLabel}
          </button>
        </form>
      </Modal>
    </>
  );
}
