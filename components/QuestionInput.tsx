'use client';

import { AnswerValue, Question } from '@/lib/types';
import { questionType } from '@/lib/scoring';

// Renders the answer control for every supported question type.
export default function QuestionInput({
  question: q,
  value,
  onChange,
  optionColor = '#152042',
}: {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (v: AnswerValue) => void;
  optionColor?: string;
}) {
  const type = questionType(q);

  if (type === 'linear') {
    const range = Array.from({ length: q.max - q.min + 1 }, (_, i) => q.min + i);
    const current = Number(value ?? q.start);
    const labelFor = (v: number) => {
      if (v === q.min) return q.labels.left;
      if (v === q.max) return q.labels.right;
      if (v === Math.ceil((q.min + q.max) / 2)) return q.labels.center;
      return '';
    };
    return (
      <div className="mx-auto mt-12 w-full max-w-2xl">
        <div className="flex items-start justify-between">
          {range.map((v) => (
            <label key={v} className="flex w-1/5 cursor-pointer flex-col items-center gap-2">
              <span className="text-lg" style={{ color: optionColor }}>{v}</span>
              <input
                type="radio"
                checked={current === v}
                onChange={() => onChange(v)}
                className="peer sr-only"
              />
              <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-primary peer-checked:[&>span]:block">
                <span className="hidden h-3.5 w-3.5 rounded-full bg-primary" />
              </span>
              <span className="min-h-[2.5rem] px-1 text-center text-base leading-tight" style={{ color: optionColor }}>
                {labelFor(v)}
              </span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'text') {
    return (
      <textarea
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        placeholder="Type your answer…"
        className="mx-auto mt-10 w-full max-w-xl rounded-lg border border-gray-300 px-4 py-3 text-base outline-none focus:border-primary"
      />
    );
  }

  const options = q.options ?? [];

  if (type === 'buttons' || type === 'yesno') {
    const current = value === undefined ? -1 : Number(value);
    return (
      <div className={`mx-auto mt-10 flex w-full max-w-xl ${type === 'yesno' ? 'flex-row justify-center gap-4' : 'flex-col gap-3'}`}>
        {options.map((o, i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            className={`rounded-lg border-2 px-6 py-3.5 text-lg transition ${
              current === i
                ? 'border-primary bg-primary text-white'
                : 'border-gray-300 bg-white hover:border-primary'
            }`}
            style={current === i ? undefined : { color: optionColor }}
          >
            {o.label}
          </button>
        ))}
      </div>
    );
  }

  if (type === 'radio') {
    const current = value === undefined ? -1 : Number(value);
    return (
      <div className="mx-auto mt-10 flex w-full max-w-xl flex-col gap-3">
        {options.map((o, i) => (
          <label
            key={i}
            className={`flex cursor-pointer items-center gap-3 rounded-lg border px-5 py-3.5 transition ${
              current === i ? 'border-primary bg-blue-50/50' : 'border-gray-300 bg-white hover:border-primary'
            }`}
          >
            <input type="radio" checked={current === i} onChange={() => onChange(i)} className="peer sr-only" />
            <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full border-2 border-primary">
              {current === i && <span className="h-3 w-3 rounded-full bg-primary" />}
            </span>
            <span className="text-lg" style={{ color: optionColor }}>{o.label}</span>
          </label>
        ))}
      </div>
    );
  }

  // checkboxes
  const selected = Array.isArray(value) ? value : [];
  const toggle = (i: number) =>
    onChange(selected.includes(i) ? selected.filter((x) => x !== i) : [...selected, i]);
  return (
    <div className="mx-auto mt-10 flex w-full max-w-xl flex-col gap-3">
      {options.map((o, i) => (
        <label
          key={i}
          className={`flex cursor-pointer items-center gap-3 rounded-lg border px-5 py-3.5 transition ${
            selected.includes(i) ? 'border-primary bg-blue-50/50' : 'border-gray-300 bg-white hover:border-primary'
          }`}
        >
          <input type="checkbox" checked={selected.includes(i)} onChange={() => toggle(i)} className="peer sr-only" />
          <span className="flex h-6 w-6 flex-none items-center justify-center rounded-md border-2 border-primary text-primary">
            {selected.includes(i) && (
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <span className="text-lg" style={{ color: optionColor }}>{o.label}</span>
        </label>
      ))}
    </div>
  );
}
