'use client';

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Category, Question, QuestionsPageConfig, QuestionOption } from '@/lib/types';
import { sanitizeRichText } from '@/lib/richtext';
import Spinner from './Spinner';

export const DEFAULT_QUESTIONS_PAGE: QuestionsPageConfig = {
  header: { show: true, align: 'center', maxWidth: 250, topMargin: 13, bottomMargin: 13 },
  questions: {
    align: 'center',
    showBack: true,
    showCategory: false,
    optionTextColor: '#152042',
    buttonColor: '#1c78fe',
    questionTextColor: '#152042',
    backgroundColor: '#ffffff',
  },
  progress: { show: true },
  footer: { show: false },
};

export function defaultOptionsFor(type: string): QuestionOption[] {
  if (type === 'yes_no') {
    return [
      { label: 'Yes', score: 5 },
      { label: 'Maybe', score: 3 },
      { label: 'No', score: 1 },
    ];
  }
  return [
    { label: 'Option 1', score: 1 },
    { label: 'Option 2', score: 3 },
    { label: 'Option 3', score: 5 },
  ];
}

// One question per screen, rendered per answer format (linear scale, yes/no,
// buttons, checkboxes, radio list or open text) and styled by the Sections
// settings from the questions editor.
export default function QuizFlow({
  leadId,
  questions,
  categories = [],
  logoUrl,
  copyright = '',
  page,
  preview = false,
}: {
  leadId: string;
  questions: Question[];
  categories?: Category[];
  logoUrl: string;
  copyright?: string;
  page?: QuestionsPageConfig;
  preview?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [choices, setChoices] = useState<Record<string, number[]>>({}); // selected option indices
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const startedAt = useRef(Date.now());
  const router = useRouter();

  const cfg = page ?? DEFAULT_QUESTIONS_PAGE;
  const q = questions[index];
  const type = q.type ?? 'scale';
  const options = q.options && q.options.length ? q.options : defaultOptionsFor(type);
  const value = answers[q.id] ?? q.start;
  const selected = choices[q.id] ?? [];
  const percent = Math.round((index / questions.length) * 100);
  const range = Array.from({ length: q.max - q.min + 1 }, (_, i) => q.min + i);
  const category = categories.find((c) => c.key === q.category);

  const alignClass =
    cfg.questions.align === 'left' ? 'text-left' : cfg.questions.align === 'right' ? 'text-right' : 'text-center';
  const headerJustify =
    cfg.header.align === 'left' ? 'justify-start' : cfg.header.align === 'right' ? 'justify-end' : 'justify-center';

  function labelFor(v: number) {
    if (v === q.min) return q.labels.left;
    if (v === q.max) return q.labels.right;
    if (v === Math.ceil((q.min + q.max) / 2)) return q.labels.center;
    return '';
  }

  function scoreFor(qq: Question, idxs: number[]): number {
    const opts = qq.options && qq.options.length ? qq.options : defaultOptionsFor(qq.type ?? 'scale');
    const t = qq.type ?? 'scale';
    if (t === 'checkboxes') return idxs.reduce((s, i) => s + Math.max(0, opts[i]?.score ?? 0), 0);
    return Math.max(0, opts[idxs[0]]?.score ?? 0);
  }

  const answered =
    type === 'scale'
      ? true
      : type === 'text'
        ? !q.required || Boolean((texts[q.id] ?? '').trim())
        : selected.length > 0 || !q.required;

  function pick(i: number) {
    if (type === 'checkboxes') {
      const next = selected.includes(i) ? selected.filter((s) => s !== i) : [...selected, i];
      setChoices({ ...choices, [q.id]: next });
    } else {
      setChoices({ ...choices, [q.id]: [i] });
    }
  }

  async function next() {
    const score =
      type === 'scale' ? value : type === 'text' ? 0 : selected.length ? scoreFor(q, selected) : 0;
    const withCurrent = { ...answers, [q.id]: score };
    setAnswers(withCurrent);
    if (index < questions.length - 1) {
      setIndex(index + 1);
      return;
    }
    setSubmitting(true);
    setError('');
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

  const optionStyle = { color: cfg.questions.optionTextColor };
  const buttonColor = cfg.questions.buttonColor;

  return (
    <main className="flex min-h-screen flex-col" style={{ backgroundColor: cfg.questions.backgroundColor }}>
      {submitting && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white/90 backdrop-blur-sm">
          <Spinner className="h-10 w-10 text-primary" />
          <p className="text-lg text-navy">Calculating your results…</p>
        </div>
      )}
      {cfg.header.show && (
        <header
          className={`flex px-6 ${headerJustify}`}
          style={{ paddingTop: cfg.header.topMargin, paddingBottom: cfg.header.bottomMargin }}
        >
          <img src={logoUrl} alt="Logo" className="h-24 w-auto object-contain" style={{ maxWidth: cfg.header.maxWidth }} />
        </header>
      )}

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 pb-16">
        {cfg.questions.showBack && index > 0 ? (
          <button
            onClick={() => setIndex(index - 1)}
            className="mx-auto mb-6 flex items-center gap-2 text-base hover:opacity-70"
            style={optionStyle}
          >
            <span aria-hidden>←</span> BACK
          </button>
        ) : (
          <div className="mb-6 h-6" />
        )}

        {cfg.questions.showCategory && category && (
          <p className={`mb-2 text-sm font-semibold uppercase tracking-widest text-muted ${alignClass}`}>
            {category.label}
          </p>
        )}

        {q.instruction && (
          <p className={`mb-3 text-base text-muted ${alignClass}`}>{q.instruction}</p>
        )}

        <h1
          className={`${alignClass} text-3xl font-medium leading-snug md:text-4xl`}
          style={{ color: cfg.questions.questionTextColor }}
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(q.text) }}
        />

        {type === 'scale' && (
          <div className="mx-auto mt-12 w-full max-w-2xl">
            <div className="flex items-start justify-between">
              {range.map((v) => (
                <label key={v} className="flex w-1/5 cursor-pointer flex-col items-center gap-2">
                  <span className="text-lg" style={optionStyle}>
                    {v}
                  </span>
                  <input
                    type="radio"
                    name={q.id}
                    checked={value === v}
                    onChange={() => setAnswers({ ...answers, [q.id]: v })}
                    className="peer sr-only"
                  />
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 peer-checked:[&>span]:block"
                    style={{ borderColor: buttonColor }}
                  >
                    <span className="hidden h-3.5 w-3.5 rounded-full" style={{ backgroundColor: buttonColor }} />
                  </span>
                  <span className="min-h-[2.5rem] px-1 text-center text-base leading-tight" style={optionStyle}>
                    {labelFor(v)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {(type === 'yes_no' || type === 'buttons') && (
          <div className="mx-auto mt-12 flex w-full max-w-md flex-col gap-3">
            {options.map((o, i) => {
              const active = selected[0] === i;
              return (
                <button
                  key={i}
                  onClick={() => pick(i)}
                  className="rounded-lg border-2 px-6 py-3.5 text-lg font-medium transition"
                  style={
                    active
                      ? { backgroundColor: buttonColor, borderColor: buttonColor, color: '#fff' }
                      : { borderColor: buttonColor, color: cfg.questions.optionTextColor }
                  }
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        )}

        {type === 'radio' && (
          <div className="mx-auto mt-12 flex w-full max-w-md flex-col gap-4">
            {options.map((o, i) => {
              const active = selected[0] === i;
              return (
                <label key={i} className="flex cursor-pointer items-center gap-3 text-lg" style={optionStyle}>
                  <input type="radio" name={q.id} checked={active} onChange={() => pick(i)} className="sr-only" />
                  <span
                    className="flex h-6 w-6 flex-none items-center justify-center rounded-full border-2"
                    style={{ borderColor: buttonColor }}
                  >
                    {active && <span className="h-3 w-3 rounded-full" style={{ backgroundColor: buttonColor }} />}
                  </span>
                  {o.label}
                </label>
              );
            })}
          </div>
        )}

        {type === 'checkboxes' && (
          <div className="mx-auto mt-12 flex w-full max-w-md flex-col gap-4">
            {options.map((o, i) => {
              const active = selected.includes(i);
              return (
                <label key={i} className="flex cursor-pointer items-center gap-3 text-lg" style={optionStyle}>
                  <input type="checkbox" checked={active} onChange={() => pick(i)} className="sr-only" />
                  <span
                    className="flex h-6 w-6 flex-none items-center justify-center rounded-md border-2"
                    style={{ borderColor: buttonColor, backgroundColor: active ? buttonColor : 'transparent' }}
                  >
                    {active && (
                      <svg viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="2.5" className="h-4 w-4">
                        <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  {o.label}
                </label>
              );
            })}
          </div>
        )}

        {type === 'text' && (
          <textarea
            value={texts[q.id] ?? ''}
            onChange={(e) => setTexts({ ...texts, [q.id]: e.target.value })}
            rows={4}
            placeholder="Type your answer…"
            className="mx-auto mt-12 w-full max-w-xl rounded-lg border-2 border-gray-300 p-4 text-lg outline-none focus:border-primary"
            style={optionStyle}
          />
        )}

        {error && <p className="mt-6 text-center text-tier-low">{error}</p>}

        <button
          onClick={next}
          disabled={submitting || !answered}
          className="mx-auto mt-10 w-full max-w-xs rounded-md py-3.5 text-lg font-medium text-white transition hover:brightness-110 disabled:opacity-60"
          style={{ backgroundColor: buttonColor }}
        >
          Next
        </button>
      </div>

      {cfg.progress.show && (
        <div className="bg-gray-100 px-6 py-4">
          <p className="text-center text-lg text-ink">{percent}% Complete</p>
          <div className="mx-auto mt-2 h-1.5 w-full max-w-xs rounded-full bg-blue-200">
            <div
              className="h-1.5 rounded-full transition-all"
              style={{ width: `${percent}%`, backgroundColor: buttonColor }}
            />
          </div>
        </div>
      )}

      {cfg.footer.show && (
        <footer className="flex items-center justify-between border-t border-gray-200 bg-white px-8 py-5">
          <img src={logoUrl} alt="" className="h-10 w-auto object-contain" />
          <span className="text-sm text-muted">{copyright}</span>
        </footer>
      )}
    </main>
  );
}
