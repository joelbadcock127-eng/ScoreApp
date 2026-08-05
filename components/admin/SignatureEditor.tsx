'use client';

import { useEffect, useMemo, useState } from 'react';
import { EmailSignature } from '@/lib/types';
import { BLANK_SIGNATURE, SIGNATURE_FONTS, cleanSignature, renderSignature } from '@/lib/signature';
import { ImagePicker, SelectInput, TextInput, Toggle } from '@/components/admin/editor/ui';

const SECTION_LABEL = 'text-xs font-semibold uppercase tracking-wide text-ink';
const FIELD_LABEL = 'text-xs font-medium text-muted';

type SectionKey = 'personal' | 'company' | 'graphics' | 'style' | 'social';

function Field({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className={FIELD_LABEL}>{label}</p>
      <TextInput className="mt-1" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

// Account-wide email signature editor, structured like the classic signature
// builders: collapsible detail sections on the left, a live preview (with a
// dark-mode toggle) on the right. One signature per account — it signs off
// invite and result emails on every scorecard. The preview uses the exact
// renderer the emails use, so what you see is what recipients get.
export default function SignatureEditor() {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<SectionKey>('personal');
  const [sig, setSig] = useState<EmailSignature | null>(null);
  const [darkPreview, setDarkPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/account/signature')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!cancelled) setSig(json?.signature ?? BLANK_SIGNATURE);
      })
      .catch(() => setSig(BLANK_SIGNATURE));
    return () => {
      cancelled = true;
    };
  }, []);

  // Live preview straight from the shared renderer (always shown enabled, so
  // you can design the signature before switching it on).
  const previewHtml = useMemo(
    () => (sig ? renderSignature({ ...cleanSignature(sig), enabled: true }) : ''),
    [sig]
  );

  async function save() {
    if (!sig) return;
    setSaving(true);
    setMessage('');
    const res = await fetch('/api/admin/account/signature', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signature: sig }),
    });
    const json = await res.json().catch(() => ({}));
    setSaving(false);
    setMessage(res.ok ? 'Saved.' : json.error || 'Save failed.');
    if (res.ok && json.signature) setSig(json.signature);
  }

  const upd = (patch: Partial<EmailSignature>) => setSig((s) => (s ? { ...s, ...patch } : s));

  function SectionHead({ id, title }: { id: SectionKey; title: string }) {
    const active = section === id;
    return (
      <button
        type="button"
        onClick={() => setSection(active ? ('' as SectionKey) : id)}
        className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm font-semibold ${
          active ? 'border-primary/40 bg-primary/5 text-ink' : 'border-gray-200 bg-white text-ink hover:bg-gray-50'
        }`}
      >
        {title}
        <span className={`text-muted transition-transform ${active ? 'rotate-180' : ''}`}>▾</span>
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 p-6 text-left"
      >
        <span>
          <span className={SECTION_LABEL}>Email signature</span>
          <span className="mt-1 block text-sm text-muted">
            Your details, photo, socials and banner, appended to invite and result emails for every scorecard in this
            account.
          </span>
        </span>
        <span className="flex items-center gap-3">
          {sig && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                sig.enabled ? 'bg-tier-high/10 text-tier-high' : 'bg-gray-100 text-muted'
              }`}
            >
              {sig.enabled ? 'On' : 'Off'}
            </span>
          )}
          <span className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
        </span>
      </button>

      {open && (
        <div className="border-t border-gray-100 p-6">
          {!sig ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : (
            <>
              <div className="flex items-start justify-between gap-6">
                <p className="text-sm text-muted">
                  Fill in the sections and watch the preview build itself. One signature per account, so saving here
                  updates every scorecard at once.
                </p>
                <Toggle on={sig.enabled} onChange={(enabled) => upd({ enabled })} label="Signature enabled" />
              </div>

              <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(300px,380px),1fr]">
                {/* ——— Detail sections ——— */}
                <div className="space-y-2">
                  <SectionHead id="personal" title="Personal data" />
                  {section === 'personal' && (
                    <div className="grid grid-cols-2 gap-3 rounded-md border border-gray-100 bg-gray-50/60 p-3">
                      <Field label="First name" value={sig.firstName} placeholder="Joel" onChange={(firstName) => upd({ firstName })} />
                      <Field label="Last name" value={sig.lastName} placeholder="Badcock" onChange={(lastName) => upd({ lastName })} />
                      <Field label="Job title" value={sig.jobTitle} placeholder="Treasurer" onChange={(jobTitle) => upd({ jobTitle })} />
                      <Field label="Email address" value={sig.email} placeholder="joel@accesoai.com.au" onChange={(email) => upd({ email })} />
                      <Field label="Phone number" value={sig.phone} placeholder="(03) 6400 0000" onChange={(phone) => upd({ phone })} />
                      <Field label="Mobile number" value={sig.mobile} placeholder="0400 000 000" onChange={(mobile) => upd({ mobile })} />
                    </div>
                  )}

                  <SectionHead id="company" title="Company data" />
                  {section === 'company' && (
                    <div className="grid gap-3 rounded-md border border-gray-100 bg-gray-50/60 p-3">
                      <Field
                        label="Company / organisation"
                        value={sig.company}
                        placeholder="Devonport Table Tennis Association"
                        onChange={(company) => upd({ company })}
                      />
                      <Field label="Website" value={sig.website} placeholder="devtt.com.au" onChange={(website) => upd({ website })} />
                      <Field
                        label="Address"
                        value={sig.address}
                        placeholder="34 Forbes St, Devonport TAS"
                        onChange={(address) => upd({ address })}
                      />
                    </div>
                  )}

                  <SectionHead id="graphics" title="Graphics" />
                  {section === 'graphics' && (
                    <div className="rounded-md border border-gray-100 bg-gray-50/60 p-3">
                      <p className={FIELD_LABEL}>Profile photo</p>
                      <ImagePicker label="" value={sig.photoUrl} onChange={(photoUrl) => upd({ photoUrl })} />
                      <p className={`${FIELD_LABEL} mt-2`}>Company logo (small, above the name)</p>
                      <ImagePicker label="" value={sig.logoUrl} onChange={(logoUrl) => upd({ logoUrl })} />
                      <p className={`${FIELD_LABEL} mt-2`}>Banner (wide image below the signature)</p>
                      <ImagePicker label="" value={sig.bannerUrl} onChange={(bannerUrl) => upd({ bannerUrl })} />
                      <div className="mt-2">
                        <Field
                          label="Banner click-through link"
                          value={sig.bannerLink}
                          placeholder="https://devtt.com.au"
                          onChange={(bannerLink) => upd({ bannerLink })}
                        />
                      </div>
                    </div>
                  )}

                  <SectionHead id="style" title="Style" />
                  {section === 'style' && (
                    <div className="grid grid-cols-2 gap-3 rounded-md border border-gray-100 bg-gray-50/60 p-3">
                      <div>
                        <p className={FIELD_LABEL}>Accent colour</p>
                        <input
                          type="color"
                          value={sig.accentColor}
                          onChange={(e) => upd({ accentColor: e.target.value })}
                          className="mt-1 h-9 w-full cursor-pointer rounded border border-gray-300"
                        />
                      </div>
                      <div>
                        <p className={FIELD_LABEL}>Text colour</p>
                        <input
                          type="color"
                          value={sig.textColor}
                          onChange={(e) => upd({ textColor: e.target.value })}
                          className="mt-1 h-9 w-full cursor-pointer rounded border border-gray-300"
                        />
                      </div>
                      <div>
                        <p className={FIELD_LABEL}>Font</p>
                        <SelectInput className="mt-1" value={sig.font} onChange={(e) => upd({ font: e.target.value })}>
                          {Object.entries(SIGNATURE_FONTS).map(([key, f]) => (
                            <option key={key} value={key}>
                              {f.label}
                            </option>
                          ))}
                        </SelectInput>
                      </div>
                      <div>
                        <p className={FIELD_LABEL}>Font size</p>
                        <SelectInput
                          className="mt-1"
                          value={sig.fontSize}
                          onChange={(e) => upd({ fontSize: e.target.value as EmailSignature['fontSize'] })}
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </SelectInput>
                      </div>
                      <div>
                        <p className={FIELD_LABEL}>Photo shape</p>
                        <SelectInput
                          className="mt-1"
                          value={sig.photoShape}
                          onChange={(e) => upd({ photoShape: e.target.value as EmailSignature['photoShape'] })}
                        >
                          <option value="circle">Circle</option>
                          <option value="rounded">Rounded</option>
                          <option value="square">Square</option>
                        </SelectInput>
                      </div>
                    </div>
                  )}

                  <SectionHead id="social" title="Social media links" />
                  {section === 'social' && (
                    <div className="grid gap-3 rounded-md border border-gray-100 bg-gray-50/60 p-3">
                      <Field label="Facebook" value={sig.facebook} placeholder="facebook.com/yourclub" onChange={(facebook) => upd({ facebook })} />
                      <Field label="X (Twitter)" value={sig.twitter} placeholder="x.com/yourclub" onChange={(twitter) => upd({ twitter })} />
                      <Field label="YouTube" value={sig.youtube} placeholder="youtube.com/@yourclub" onChange={(youtube) => upd({ youtube })} />
                      <Field label="LinkedIn" value={sig.linkedin} placeholder="linkedin.com/company/yourclub" onChange={(linkedin) => upd({ linkedin })} />
                      <Field label="Instagram" value={sig.instagram} placeholder="instagram.com/yourclub" onChange={(instagram) => upd({ instagram })} />
                    </div>
                  )}
                </div>

                {/* ——— Live preview ——— */}
                <div>
                  <div className="flex items-center justify-between">
                    <p className={SECTION_LABEL}>Signature preview</p>
                    <button
                      type="button"
                      onClick={() => setDarkPreview((d) => !d)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        darkPreview ? 'bg-gray-900 text-white' : 'border border-gray-300 bg-white text-ink hover:bg-gray-50'
                      }`}
                    >
                      {darkPreview ? '☾ Dark mode preview' : '☾ Dark mode preview'}
                    </button>
                  </div>
                  <div
                    className={`mt-2 min-h-[180px] rounded-lg border border-dashed p-5 ${
                      darkPreview ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    {previewHtml ? (
                      // Our own sanitised renderer — the same one emails use.
                      <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                    ) : (
                      <p className="text-sm text-muted">Fill in some details and the preview appears here.</p>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    Rendered with the exact code emails use. On dark backgrounds some mail apps invert colours, so
                    check your text colour reads well both ways.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-4 border-t border-gray-100 pt-5">
                {message && <span className="text-sm text-muted">{message}</span>}
                <button
                  onClick={save}
                  disabled={saving}
                  className="rounded-md bg-primary px-8 py-2.5 font-medium text-white hover:brightness-110 disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Apply signature'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
