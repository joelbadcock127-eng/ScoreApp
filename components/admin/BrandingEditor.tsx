'use client';

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Branding } from '@/lib/types';
import Spinner from '@/components/Spinner';

function UploadBox({
  label,
  url,
  uploading,
  onPick,
}: {
  label: string;
  url: string;
  uploading: boolean;
  onPick: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <div className="mt-2 flex items-center gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-28 w-56 items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50 transition hover:border-primary"
          title="Click to replace"
        >
          {uploading ? (
            <Spinner className="h-6 w-6 text-primary" />
          ) : url ? (
            <img src={url} alt={label} className="max-h-full max-w-full object-contain" />
          ) : (
            <span className="text-sm text-muted">Upload {label.toLowerCase()}</span>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onPick(f);
            e.target.value = '';
          }}
        />
      </div>
    </div>
  );
}

export default function BrandingEditor({ initial }: { initial: Branding }) {
  const [branding, setBranding] = useState(initial);
  const [uploading, setUploading] = useState<'logo' | 'icon' | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  async function upload(kind: 'logo' | 'icon', file: File) {
    setUploading(kind);
    setMessage('');
    const form = new FormData();
    form.set('kind', kind);
    form.set('file', file);
    const res = await fetch('/api/admin/branding', { method: 'POST', body: form });
    setUploading(null);
    if (res.ok) {
      const { url } = await res.json();
      setBranding((b) => (kind === 'logo' ? { ...b, logoUrl: url } : { ...b, iconUrl: url }));
      router.refresh();
    } else {
      setMessage('Upload failed.');
    }
  }

  async function saveColors() {
    setSaving(true);
    setMessage('');
    const res = await fetch('/api/admin/branding', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        primaryColor: branding.primaryColor,
        secondaryColor: branding.secondaryColor,
      }),
    });
    setSaving(false);
    setMessage(res.ok ? 'Saved.' : 'Save failed.');
    if (res.ok) router.refresh();
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-bold">Branding Settings</h1>

      {/* Logo + icon */}
      <div className="mt-8 grid gap-8 border-t border-gray-200 pt-8 md:grid-cols-[280px,1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide">Logo</p>
          <p className="mt-2 text-muted">This will be used throughout your scorecard by default</p>
        </div>
        <div className="space-y-8 rounded-xl border border-gray-200 bg-white p-8">
          <UploadBox
            label="Logo"
            url={branding.logoUrl}
            uploading={uploading === 'logo'}
            onPick={(f) => upload('logo', f)}
          />
          <UploadBox
            label="Icon"
            url={branding.iconUrl}
            uploading={uploading === 'icon'}
            onPick={(f) => upload('icon', f)}
          />
        </div>
      </div>

      {/* Colours */}
      <div className="mt-8 grid gap-8 border-t border-gray-200 pt-8 md:grid-cols-[280px,1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide">Branding</p>
          <p className="mt-2 text-muted">
            These colours will be used by default throughout your scorecard but can be easily
            overwritten
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-8">
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide">Primary brand color</p>
              <p className="mt-1 text-sm text-muted">Used for buttons and accents</p>
              <input
                type="color"
                value={branding.primaryColor}
                onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                className="mt-3 h-12 w-14 cursor-pointer rounded-lg border border-gray-300"
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide">Secondary brand color</p>
              <p className="mt-1 text-sm text-muted">Used for headers and backgrounds</p>
              <input
                type="color"
                value={branding.secondaryColor}
                onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                className="mt-3 h-12 w-14 cursor-pointer rounded-lg border border-gray-300"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-end gap-4 border-t border-gray-200 pt-6">
        {message && <span className="text-sm text-muted">{message}</span>}
        <button
          onClick={saveColors}
          disabled={saving}
          className="rounded-md bg-primary px-8 py-2.5 font-medium text-white hover:brightness-110 disabled:opacity-60"
        >
          Save
        </button>
      </div>
    </div>
  );
}
