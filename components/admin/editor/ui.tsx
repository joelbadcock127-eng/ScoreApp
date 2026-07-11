'use client';

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react';
import { sanitizeRichText } from '@/lib/richtext';

export function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-5 w-9 flex-none rounded-full transition ${on ? 'bg-primary' : 'bg-gray-300'}`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
          on ? 'left-[18px]' : 'left-0.5'
        }`}
      />
    </button>
  );
}

export function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-sm text-ink">{label}</span>
      {children}
    </div>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-1.5 mt-4 text-sm text-ink">{children}</p>;
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary ${props.className ?? ''}`}
    />
  );
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm outline-none focus:border-primary ${props.className ?? ''}`}
    />
  );
}

export function ColorField({
  label,
  sub,
  value,
  onChange,
}: {
  label: string;
  sub?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div>
        <p className="text-sm text-ink">{label}</p>
        {sub && <p className="text-xs text-muted">{sub}</p>}
      </div>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-10 flex-none cursor-pointer rounded border border-gray-300"
      />
    </div>
  );
}

export function SliderField({
  label,
  value,
  min,
  max,
  unit = 'px',
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="py-2">
      <p className="text-sm text-ink">{label}</p>
      <div className="mt-1.5 flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <span className="w-14 flex-none rounded border border-gray-200 px-1.5 py-0.5 text-center text-xs text-muted">
          {value}
          {unit}
        </span>
      </div>
    </div>
  );
}

// contentEditable rich text with a floating Bold / Italic / Underline toolbar,
// like the ScoreApp page editors. Emits sanitized HTML (b/i/u/br only).
export function RichText({
  value,
  onChange,
  className = '',
  style,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);

  // Only push external value into the DOM when not editing, so the caret survives typing.
  useEffect(() => {
    const el = ref.current;
    if (el && !focused && el.innerHTML !== value) el.innerHTML = value;
  }, [value, focused]);

  function exec(cmd: 'bold' | 'italic' | 'underline') {
    document.execCommand(cmd);
    if (ref.current) onChange(sanitizeRichText(ref.current.innerHTML));
  }

  return (
    <div className="relative">
      {focused && (
        <div
          className="absolute -top-11 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-card"
          onMouseDown={(e) => e.preventDefault() /* keep selection */}
        >
          <button
            type="button"
            onClick={() => exec('bold')}
            className="rounded px-2.5 py-1 text-sm font-bold hover:bg-gray-100"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => exec('italic')}
            className="rounded px-2.5 py-1 text-sm italic hover:bg-gray-100"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => exec('underline')}
            className="rounded px-2.5 py-1 text-sm underline hover:bg-gray-100"
          >
            U
          </button>
        </div>
      )}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          if (ref.current) onChange(sanitizeRichText(ref.current.innerHTML));
        }}
        onInput={() => {
          if (ref.current) onChange(sanitizeRichText(ref.current.innerHTML));
        }}
        className={`cursor-text rounded outline-none ring-primary/40 transition focus:ring-2 ${className}`}
        style={style}
      />
    </div>
  );
}

// Icon rail button used down the far-left of the editors.
export function RailButton({
  active,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full flex-col items-center gap-1 py-2 text-[11px] leading-tight text-ink"
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
          active ? 'bg-gray-900 text-white' : 'text-ink hover:bg-gray-100'
        }`}
      >
        {children}
      </span>
      {label}
    </button>
  );
}

export function EyeIcon({ off = false, className = 'h-4 w-4' }: { off?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.8" />
      {off && <path d="M4 20 20 4" />}
    </svg>
  );
}

export function TrashIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className}>
      <path d="M4 7h16M10 4h4M9 7v13M15 7v13M6 7l1 14h10l1-14" strokeLinejoin="round" />
    </svg>
  );
}
