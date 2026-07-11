'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ColorField, FieldLabel, FieldRow, SelectInput, SliderField, TextInput, Toggle } from './editor/ui';

export type EmbedType = 'full' | 'inline' | 'popup' | 'chat';

const STYLE_LABELS: Record<EmbedType, string> = {
  full: 'Full page',
  inline: 'Inline block',
  popup: 'Pop up',
  chat: 'Chat style',
};

// Settings → Embed → configurator: preview on the left, EMBED STYLE and
// STYLE SETTINGS panels on the right and a "Get the code" modal, per ScoreApp.
export default function EmbedConfigurator({
  initialType,
  primaryColor,
}: {
  initialType: EmbedType;
  primaryColor: string;
}) {
  const router = useRouter();
  const [type, setType] = useState<EmbedType>(initialType);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [keepInside, setKeepInside] = useState(false);
  const [hideChrome, setHideChrome] = useState(false);
  // Inline
  const [width, setWidth] = useState(100);
  const [widthUnit, setWidthUnit] = useState<'%' | 'px'>('%');
  const [autoHeight, setAutoHeight] = useState(true);
  // Popup / chat
  const [popupSize, setPopupSize] = useState<'full' | 'large' | 'medium'>('full');
  const [buttonText, setButtonText] = useState('Start the quiz');
  const [buttonColor, setButtonColor] = useState(primaryColor);
  const [fontSize, setFontSize] = useState(16);
  const [radius, setRadius] = useState(5);
  const [autoOpen, setAutoOpen] = useState(0);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('https://your-site');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // Keep the URL in sync when the Style dropdown switches type.
  function switchType(t: EmbedType) {
    setType(t);
    router.replace(`/admin/settings/embed/${t}`);
  }

  const scorecardUrl = `${origin}/${hideChrome ? '?chrome=0' : ''}${keepInside ? (hideChrome ? '&' : '?') + 'sa_target=self' : ''}`;

  function snippet(): string {
    const attrs: string[] = [`data-sa-url="${scorecardUrl}"`, `data-sa-view="${type}"`];
    if (type === 'inline') {
      attrs.push(`data-sa-width="${width}${widthUnit}"`);
      if (autoHeight) attrs.push('data-sa-auto-height="1"');
    }
    if (type === 'popup') {
      attrs.push(
        `data-sa-size="${popupSize}"`,
        `data-sa-button-text="${buttonText}"`,
        `data-sa-button-bg-color="${buttonColor}"`,
        'data-sa-button-color="#FFFFFF"',
        `data-sa-font-size="${fontSize}"`,
        `data-sa-radius="${radius}"`
      );
    }
    if (type === 'chat') {
      attrs.push(
        `data-sa-auto-open="${autoOpen}"`,
        `data-sa-button-text="${buttonText}"`,
        `data-sa-button-bg-color="${buttonColor}"`,
        'data-sa-button-color="#FFFFFF"',
        `data-sa-font-size="${fontSize}"`
      );
    }
    return `<div ${attrs.join(' ')}></div>\n<script src="${origin}/embed.js"></script>`;
  }

  const skeleton = (
    <div className="pointer-events-none space-y-4 p-8" aria-hidden>
      <div className="h-5 w-56 rounded-full bg-gray-300/80" />
      <div className="h-4 w-full rounded-full bg-gray-200" />
      <div className="h-4 w-full rounded-full bg-gray-200" />
      <div className="h-4 w-3/4 rounded-full bg-gray-200" />
      <div className="h-5 w-56 rounded-full bg-gray-300/80 !mt-10" />
      <div className="h-4 w-full rounded-full bg-gray-200" />
      <div className="h-4 w-full rounded-full bg-gray-200" />
      <div className="h-4 w-2/3 rounded-full bg-gray-200" />
      <div className="h-4 w-full rounded-full bg-gray-200" />
      <div className="h-5 w-56 rounded-full bg-gray-300/80 !mt-10" />
      <div className="h-4 w-full rounded-full bg-gray-200" />
      <div className="h-4 w-4/5 rounded-full bg-gray-200" />
    </div>
  );

  return (
    <div className="-m-6 flex min-h-[calc(100vh-0px)] md:-m-10">
      {/* Preview area */}
      <div className="min-w-0 flex-1 px-6 py-5">
        <div className="relative flex items-center justify-center">
          <Link
            href="/admin/settings/embed"
            className="absolute left-0 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-ink hover:text-primary"
          >
            <span aria-hidden>←</span> Share
          </Link>
          <div className="flex items-center gap-2 text-muted">
            <button
              onClick={() => setDevice('mobile')}
              aria-label="Mobile preview"
              className={device === 'mobile' ? 'text-primary' : 'hover:text-ink'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                <rect x="8" y="3" width="8" height="18" rx="1.5" />
                <path d="M11.5 18h1" strokeLinecap="round" />
              </svg>
            </button>
            <button
              onClick={() => setDevice('desktop')}
              aria-label="Desktop preview"
              className={device === 'desktop' ? 'text-primary' : 'hover:text-ink'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                <rect x="3" y="5" width="18" height="12" rx="1.5" />
                <path d="M9 20h6M12 17v3" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className={`mx-auto mt-5 ${device === 'mobile' ? 'max-w-[400px]' : 'max-w-4xl'}`}>
          {(type === 'full' || type === 'inline') && (
            <div
              className="mx-auto overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card"
              style={
                type === 'inline' && device === 'desktop'
                  ? { width: widthUnit === 'px' ? Math.min(896, width) : `${Math.min(100, width)}%` }
                  : undefined
              }
            >
              <iframe
                src={hideChrome ? '/?chrome=0' : '/'}
                title="Scorecard preview"
                className="h-[72vh] w-full"
              />
            </div>
          )}

          {type === 'popup' && (
            <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card">
              {skeleton}
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="px-8 py-3 font-medium text-white shadow-card"
                  style={{ backgroundColor: buttonColor, fontSize, borderRadius: radius }}
                >
                  {buttonText || 'Start the quiz'}
                </span>
              </div>
            </div>
          )}

          {type === 'chat' && (
            <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card">
              {skeleton}
              <span
                className="absolute bottom-5 right-5 flex items-center gap-2 rounded-full px-5 py-2.5 font-medium text-white shadow-card"
                style={{ backgroundColor: buttonColor, fontSize }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path d="M21 12a9 9 0 1 0-4 7.5L21 21l-1-4A9 9 0 0 0 21 12Z" />
                </svg>
                {buttonText || 'Start the quiz'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Settings rail */}
      <div className="w-[300px] flex-none border-l border-gray-200 bg-white px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink">Embed style</p>

        <FieldLabel>Style</FieldLabel>
        <SelectInput value={type} onChange={(e) => switchType(e.target.value as EmbedType)}>
          {(Object.keys(STYLE_LABELS) as EmbedType[]).map((t) => (
            <option key={t} value={t}>
              {STYLE_LABELS[t]}
            </option>
          ))}
        </SelectInput>

        <FieldLabel>Starting screen</FieldLabel>
        <SelectInput value="home" onChange={() => {}}>
          <option value="home">Scorecard home page</option>
        </SelectInput>

        <FieldRow label="Keep user inside embed">
          <Toggle on={keepInside} onChange={setKeepInside} label="Keep user inside embed" />
        </FieldRow>
        <FieldRow label="Hide header / footer">
          <Toggle on={hideChrome} onChange={setHideChrome} label="Hide header / footer" />
        </FieldRow>

        {type === 'chat' && (
          <>
            <FieldLabel>Auto open</FieldLabel>
            <SelectInput value={String(autoOpen)} onChange={(e) => setAutoOpen(Number(e.target.value))}>
              <option value="0">Don&apos;t auto open</option>
              <option value="3">After 3 seconds</option>
              <option value="5">After 5 seconds</option>
              <option value="10">After 10 seconds</option>
            </SelectInput>
          </>
        )}

        {type !== 'full' && (
          <p className="mt-6 border-t border-gray-200 pt-4 text-xs font-semibold uppercase tracking-widest text-ink">
            Style settings
          </p>
        )}

        {type === 'inline' && (
          <>
            <FieldLabel>Width</FieldLabel>
            <div className="flex items-center gap-2">
              <TextInput type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} />
              <SelectInput
                className="!w-20"
                value={widthUnit}
                onChange={(e) => setWidthUnit(e.target.value as '%' | 'px')}
              >
                <option value="%">%</option>
                <option value="px">px</option>
              </SelectInput>
            </div>
            <FieldRow label="Auto height">
              <Toggle on={autoHeight} onChange={setAutoHeight} label="Auto height" />
            </FieldRow>
          </>
        )}

        {type === 'popup' && (
          <>
            <FieldLabel>Popup size</FieldLabel>
            <SelectInput value={popupSize} onChange={(e) => setPopupSize(e.target.value as typeof popupSize)}>
              <option value="full">Full</option>
              <option value="large">Large</option>
              <option value="medium">Medium</option>
            </SelectInput>
            <FieldLabel>Button style</FieldLabel>
            <SelectInput value="button" onChange={() => {}}>
              <option value="button">Button</option>
            </SelectInput>
          </>
        )}

        {(type === 'popup' || type === 'chat') && (
          <>
            <FieldLabel>Button text</FieldLabel>
            <TextInput value={buttonText} onChange={(e) => setButtonText(e.target.value)} placeholder="Start the quiz" />
            <ColorField label="Button color" value={buttonColor} onChange={setButtonColor} />
            <SliderField label="Font size" value={fontSize} min={12} max={24} onChange={setFontSize} />
            {type === 'popup' && (
              <SliderField label="Rounded corners" value={radius} min={0} max={30} onChange={setRadius} />
            )}
          </>
        )}

        <button
          onClick={() => {
            setCopied(false);
            setShowCode(true);
          }}
          className="mt-8 w-full rounded-lg bg-primary py-2.5 font-medium text-white transition hover:brightness-110"
        >
          Get the code
        </button>
      </div>

      {/* Get code modal */}
      {showCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-6" onClick={() => setShowCode(false)}>
          <div className="w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-card" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 pb-4">
              <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-gray-900 p-5 font-mono text-[13px] leading-relaxed text-gray-100">
                {snippet()}
              </pre>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-5">
              <button
                onClick={() => setShowCode(false)}
                className="rounded-md border border-gray-300 px-5 py-2 text-sm font-medium text-primary hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(snippet());
                  setCopied(true);
                }}
                className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-white hover:brightness-110"
              >
                {copied ? 'Copied!' : 'Copy code'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
