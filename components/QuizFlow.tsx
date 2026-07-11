'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Question } from '@/lib/types';

// One question per screen: numbered 1-5 radios with left/center/right labels,
// Back link, Next button and a completion bar pinned to the bottom — as per ScoreApp.
export default function QuizFlow({ leadId, questions }: { leadId: string; questions: Question[] }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const startedAt = useRef(Date.now());
  const router = useRouter();

  const q = questions[index];
  const value = answers[q.id] ?? q.start;
  const percent = Math.round((index / questions.length) * 100);
  const range = Array.from({ length: q.max - q.min + 1 }, (_, i) => q.min + i);

  function labelFor(v: number) {
    if (v === q.min) return q.labels.left;
    if (v === q.max) return q.labels.right;
    if (v === Math.ceil((q.min + q.max) / 2)) return q.labels.center;
    return '';
  }

  async function next() {
    const withCurrent = { ...answers, [q.id]: value };
    setAnswers(withCurrent);
    if (index < questions.length - 1) {
      setIndex(index + 1);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete',
          answers: withCurrent,
          duration_seconds: (Date.now() - startedAt.current) / 1000,
        }),
      });
      if (!res.ok) throw new Error('Could not submit your answers. Please try again.');
      router.push(`/results/${leadId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col">
      <header className="flex justify-center py-6">
        <Image src="/images/logo.png" alt="Acceso AI" width={140} height={140} className="h-24 w-auto" priority />
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 pb-16">
        {index > 0 && (
          <button
            onClick={() => setIndex(index - 1)}
            className="mx-auto mb-6 flex items-center gap-2 text-base text-ink hover:text-primary"
          >
            <span aria-hidden>←</span> BACK
          </button>
        )}
        {index === 0 && <div className="mb-6 h-6" />}

        <h1 className="text-center text-3xl font-medium leading-snug text-navy md:text-4xl">
          {q.text}
        </h1>

        <div className="mx-auto mt-12 w-full max-w-2xl">
          <div className="flex items-start justify-between">
            {range.map((v) => (
              <label key={v} className="flex w-1/5 cursor-pointer flex-col items-center gap-2">
                <span className="text-lg text-ink">{v}</span>
                <input
                  type="radio"
                  name={q.id}
                  checked={value === v}
                  onChange={() => setAnswers({ ...answers, [q.id]: v })}
                  className="peer sr-only"
                />
                <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-primary peer-checked:[&>span]:block">
                  <span className="hidden h-3.5 w-3.5 rounded-full bg-primary" />
                </span>
                <span className="min-h-[2.5rem] px-1 text-center text-base leading-tight text-ink">
                  {labelFor(v)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {error && <p className="mt-6 text-center text-tier-low">{error}</p>}

        <button
          onClick={next}
          disabled={submitting}
          className="mx-auto mt-10 w-full max-w-xs rounded-md bg-primary py-3.5 text-lg font-medium text-white transition hover:bg-blue-600 disabled:opacity-60"
        >
          {submitting ? '…' : 'Next'}
        </button>
      </div>

      <div className="bg-gray-100 px-6 py-4">
        <p className="text-center text-lg text-ink">{percent}% Complete</p>
        <div className="mx-auto mt-2 h-1.5 w-full max-w-xs rounded-full bg-blue-200">
          <div
            className="h-1.5 rounded-full bg-primary transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </main>
  );
}
