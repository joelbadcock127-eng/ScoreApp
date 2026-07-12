'use client';

/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import { Branding } from '@/lib/types';
import { ColorField, ImagePicker, TextInput } from './ui';

type Accordion = 'logos' | 'colours' | 'typography' | null;

// Theme settings panel shared by the questions and landing page editors:
// LOGOS, COLOURS and TYPOGRAPHY accordions editing the scorecard branding.
export default function ThemePanel({
  branding,
  onChange,
}: {
  branding: Branding;
  onChange: (b: Branding) => void;
}) {
  const [open, setOpen] = useState<Accordion>('logos');

  function patch(p: Partial<Branding>) {
    onChange({ ...branding, ...p });
  }

  function Header({ id, label }: { id: Exclude<Accordion, null>; label: string }) {
    const isOpen = open === id;
    return (
      <button
        onClick={() => setOpen(isOpen ? null : id)}
        className="flex w-full items-center justify-between border-t border-gray-200 py-3 text-xs font-semibold uppercase tracking-widest text-ink"
      >
        {label}
        <span aria-hidden className={`text-muted transition-transform ${isOpen ? 'rotate-90' : ''}`}>
          ›
        </span>
      </button>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
      <p className="pb-3 text-lg font-semibold">Theme settings</p>

      <Header id="logos" label="Logos" />
      {open === 'logos' && (
        <div className="pb-4">
          <div className="rounded-lg border border-gray-200 p-3">
            <img src={branding.logoUrl} alt="Main logo" className="mx-auto h-14 w-auto object-contain" />
          </div>
          <ImagePicker label="Main logo" value={branding.logoUrl} onChange={(v) => patch({ logoUrl: v })} />
          <ImagePicker label="Square icon" value={branding.iconUrl} onChange={(v) => patch({ iconUrl: v })} />
        </div>
      )}

      <Header id="colours" label="Colours" />
      {open === 'colours' && (
        <div className="pb-4">
          <ColorField
            label="Primary colour"
            sub={branding.primaryColor}
            value={branding.primaryColor}
            onChange={(v) => patch({ primaryColor: v })}
          />
          <ColorField
            label="Secondary colour"
            sub={branding.secondaryColor}
            value={branding.secondaryColor}
            onChange={(v) => patch({ secondaryColor: v })}
          />
          <ColorField
            label="Background colour"
            sub={branding.backgroundColor ?? '#ffffff'}
            value={branding.backgroundColor ?? '#ffffff'}
            onChange={(v) => patch({ backgroundColor: v })}
          />
          <ColorField
            label="Heading text colour"
            sub={branding.headingTextColor ?? '#0c0d0d'}
            value={branding.headingTextColor ?? '#0c0d0d'}
            onChange={(v) => patch({ headingTextColor: v })}
          />
          <ColorField
            label="Body text colour"
            sub={branding.bodyTextColor ?? '#616366'}
            value={branding.bodyTextColor ?? '#616366'}
            onChange={(v) => patch({ bodyTextColor: v })}
          />
        </div>
      )}

      <Header id="typography" label="Typography" />
      {open === 'typography' && (
        <div className="pb-4">
          <p className="mt-2 text-sm text-muted">
            {branding.headingFont ?? 'Inter'}, {branding.headingSize ?? 48}
          </p>
          <p
            className="mt-1 truncate font-bold"
            style={{ fontSize: Math.min(40, branding.headingSize ?? 48), color: branding.headingTextColor ?? '#0c0d0d' }}
          >
            Heading
          </p>
          <div className="mt-2 flex items-center gap-2">
            <TextInput
              value={branding.headingFont ?? 'Inter'}
              onChange={(e) => patch({ headingFont: e.target.value })}
            />
            <TextInput
              type="number"
              className="!w-20"
              value={branding.headingSize ?? 48}
              onChange={(e) => patch({ headingSize: Number(e.target.value) })}
            />
          </div>

          <p className="mt-6 border-t border-gray-100 pt-4 text-sm text-muted">
            {branding.bodyFont ?? 'Inter'}, {branding.bodySize ?? 16}
          </p>
          <p style={{ fontSize: branding.bodySize ?? 16, color: branding.bodyTextColor ?? '#616366' }}>Body text</p>
          <div className="mt-2 flex items-center gap-2">
            <TextInput value={branding.bodyFont ?? 'Inter'} onChange={(e) => patch({ bodyFont: e.target.value })} />
            <TextInput
              type="number"
              className="!w-20"
              value={branding.bodySize ?? 16}
              onChange={(e) => patch({ bodySize: Number(e.target.value) })}
            />
          </div>
        </div>
      )}
      <div className="border-t border-gray-200" />
    </div>
  );
}
