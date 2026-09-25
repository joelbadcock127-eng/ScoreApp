'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScorecardConfig } from '@/lib/types';
import LeadFormFields from './LeadFormFields';
import Spinner from './Spinner';

// The lead form rendered directly on the page ("On page forms" section):
// same fields and flow as the popup, submits and heads into the questions.
export default function InlineLeadForm({
  leadForm,
  scorecardId,
  leadId,
  preview = false,
  disabled = false,
}: {
  leadForm: ScorecardConfig['leadForm'];
  scorecardId?: number;
  // Invite visitors are already a lead: the form updates their details
  // rather than creating a second lead. Previews save nothing.
  leadId?: string;
  preview?: boolean;
  disabled?: boolean;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (disabled) return;
    setSubmitting(true);
    setError('');
    const form = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {};
    for (const f of leadForm.fields.filter((f) => f.enabled)) {
      payload[f.key] = f.type === 'checkbox' ? form.get(f.key) === 'on' : form.get(f.key) ?? '';
    }
    if (scorecardId != null) payload.scorecard_id = scorecardId;
    try {
      if (preview) {
        router.push(scorecardId != null ? `/quiz?preview=1&scorecard=${scorecardId}` : '/quiz?preview=1');
        return;
      }
      if (leadId) {
        const res = await fetch(`/api/leads/${leadId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'update_details', ...payload }),
        });
        if (!res.ok) throw new Error('Something went wrong. Please try again.');
        router.push(`/quiz?lead=${leadId}`);
        return;
      }
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
    <form onSubmit={onSubmit} className={disabled ? 'pointer-events-none' : ''}>
      <LeadFormFields fields={leadForm.fields} />
      {error && <p className="mt-4 text-sm text-tier-low">{error}</p>}
      <button
        type="submit"
        disabled={submitting || disabled}
        className="mt-6 flex w-full items-center justify-center gap-3 rounded-md bg-primary py-3.5 text-lg font-medium text-white transition hover:brightness-110 disabled:opacity-70"
        style={leadForm.buttonColor ? { backgroundColor: leadForm.buttonColor } : undefined}
      >
        {submitting && <Spinner className="h-5 w-5 text-white" />}
        {submitting ? 'Starting…' : leadForm.submitLabel}
      </button>
    </form>
  );
}
