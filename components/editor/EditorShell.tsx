'use client';

import Link from 'next/link';
import Spinner from '@/components/Spinner';

// Full-screen editor chrome: back arrow + title, centered breadcrumb tab, Save.
export default function EditorShell({
  title,
  crumb,
  saving,
  dirty,
  onSave,
  children,
}: {
  title: string;
  crumb: string;
  saving: boolean;
  dirty: boolean;
  onSave: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col bg-gray-100">
      <div className="flex flex-none items-center justify-between border-b border-gray-200 bg-white px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/admin"
            className="flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50"
            aria-label="Back to admin"
          >
            ‹
          </Link>
          <p className="truncate font-medium">{title}</p>
        </div>
        <div className="hidden items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm md:flex">
          <span className="text-muted">{crumb.split('>')[0].trim()}</span>
          <span aria-hidden className="text-muted">›</span>
          <span className="font-medium">{crumb.split('>')[1]?.trim()}</span>
        </div>
        <button
          onClick={onSave}
          disabled={saving || !dirty}
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-40"
        >
          {saving && <Spinner className="h-4 w-4 text-white" />}
          Save →
        </button>
      </div>
      <div className="flex min-h-0 flex-1">{children}</div>
    </div>
  );
}

export function RailButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full flex-col items-center gap-1 rounded-lg px-1 py-2.5 text-[10px] leading-tight ${
        active ? 'bg-navy text-white' : 'text-ink hover:bg-gray-100'
      }`}
    >
      <span className="[&>svg]:h-5 [&>svg]:w-5">{children}</span>
      {label}
    </button>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="mb-1.5 text-sm font-medium">{label}</p>
      {children}
    </div>
  );
}

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 flex-none rounded-full transition ${checked ? 'bg-primary' : 'bg-gray-300'}`}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
          checked ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  );
}

export const inputCls =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary';
