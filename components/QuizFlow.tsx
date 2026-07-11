'use client';

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnswerValue, Branding, Question, QuestionsPageConfig, ThemeConfig } from '@/lib/types';
import { questionType } from '@/lib/scoring';
import Spinner from './Spinner';
import QuestionInput from './QuestionInput';

// One question per screen, all answer types, honouring theme + page settings.
// In preview mode (admin Build section) nothing is saved; completion opens the results preview.
export default function QuizFlow({
  leadId,
  questions,
  branding,
  theme,
  page,
  copyright,
  categoryLabels,
  preview = false,
}: {
  leadId: string;
  questions: Question[];
  branding: Branding;
  theme: ThemeConfig;
  page: QuestionsPageConfig;
  copyright: string;
  categoryLabels: Record<string, string>;
  preview?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const startedAt = useRef(Date.now());
  const router = useRouter();

  const q = questions[index];
  const type = questionType(q);
  const value = answers[q.id] ?? (type === 'linear' ? q.start : type === 'checkboxes' ? [] : type === 'text' ? '' : undefined);
  const percent = Math.round((index / questions.length) * 100);
  const answered = type === 'text' ? true : type === 'checkboxes' ? true : value !== undefined;
  const required = q.required !== false;

  async function next() {
    if (required && !answered) {
      setError('Please select an answer.');
      return;
    }
    const withCurrent = { ...answers, ...(value !== undefined ? { [q.id]: value } : {}) };
    setAnswers(withCurrent);
    setError('');
    if (index < questions.length - 1) {
      setIndex(index + 1);
      return;
    }
    setSubmitting(true);
    if (preview) {
      router.push('/results/preview');
      return;
    }
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

  const align = page.questions.align === 'left' ? 'text-left' : 'text-center';

  return (
    <main
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: theme.backgroundColor, fontFamily: theme.bodyFont }}
    >
      {submitting && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white/90 backdrop-blur-sm">
          <Spinner className="h-10 w-10 text-primary" />
          <p className="text-lg text-navy">Calculating your results…</p>
        </div>
      )}
      {page.header.show && (
        <header
          className={`flex py-6 ${
            page.header.alignment === 'left' ? 'justify-start pl-8' : page.header.alignment === 'right' ? 'justify-end pr-8' : 'justify-center'
          }`}
        >
          <img
            src={branding.logoUrl}
            alt="Logo"
            className="h-auto w-auto"
            style={{ maxWidth: page.header.logoMaxWidth, maxHeight: 96 }}
          />
        </header>
      )}

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 pb-16">
        {page.questions.showBack && index > 0 ? (
          <button
            onClick={() => setIndex(index - 1)}
            className="mx-auto mb-6 flex items-center gap-2 text-base hover:text-primary"
            style={{ color: theme.headingColor }}
          >
            <span aria-hidden>←</span> BACK
          </button>
        ) : (
          <div className="mb-6 h-6" />
        )}

        {page.questions.showCategoryName && (
          <p className={`mb-2 text-sm font-semibold uppercase tracking-wide text-muted ${align}`}>
            {categoryLabels[q.category] ?? ''}
          </p>
        )}

        {q.showInstruction && q.instruction && (
          <p className={`mb-3 text-base ${align}`} style={{ color: 'var(--secondary)' }}>
            {q.instruction}
          </p>
        )}

        <h1
          className={`${align} text-3xl font-medium leading-snug md:text-4xl`}
          style={{ color: 'var(--secondary)' }}
          dangerouslySetInnerHTML={{ __html: q.textHtml || q.text }}
        />

        <QuestionInput
          question={q}
          value={value}
          onChange={(v) => setAnswers({ ...answers, [q.id]: v })}
          optionColor={'var(--secondary)'}
        />

        {error && <p className="mt-6 text-center text-tier-low">{error}</p>}

        <button
          onClick={next}
          disabled={submitting}
          className="mx-auto mt-10 w-full max-w-xs rounded-md bg-primary py-3.5 text-lg font-medium text-white transition hover:brightness-110 disabled:opacity-60"
        >
          Next
        </button>
      </div>

      {page.progress.show && (
        <div className="bg-gray-100 px-6 py-4">
          <p className="text-center text-lg" style={{ color: theme.headingColor }}>
            {percent}% Complete
          </p>
          <div className="mx-auto mt-2 h-1.5 w-full max-w-xs rounded-full bg-blue-200">
            <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
          </div>
        </div>
      )}

      {page.footer.show && (
        <footer className="flex items-center justify-between px-8 py-6">
          <img src={branding.logoUrl} alt="Logo" className="h-14 w-auto" />
          <p className="text-muted">{copyright}</p>
        </footer>
      )}
    </main>
  );
}
