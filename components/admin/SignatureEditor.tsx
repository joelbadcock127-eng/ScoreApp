'use client';

import { useEffect, useState } from 'react';
import { EmailSignature } from '@/lib/types';
import { ColorField, ImagePicker, TextInput, Toggle } from '@/components/admin/editor/ui';

const SECTION_LABEL = 'text-xs font-semibold uppercase tracking-wide text-ink';
const HINT = 'mt-2 text-sm text-muted';

// Account-wide email signature editor: one signature per account, appended to
// invite and result emails on EVERY scorecard. Rendered as a collapsible card
// so it sits quietly inside the Distribution / Result Email settings pages.
// The preview comes from the server's real renderer, so what you see is
// byte-for-byte what emails append.
export default function SignatureEditor() {
  const [open, setOpen] = useState(false);
  const [sig, setSig] = useState<EmailSignature | null>(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/account/signature')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!cancelled && json?.signature) {
          setSig(json.signature);
          setPreview(json.previewHtml ?? '');
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

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
    if (res.ok && json.previewHtml !== undefined) setPreview(json.previewHtml);
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
            Your details and photo, appended to invite and result emails for every scorecard in this account.
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
                  Turn the signature on and it signs off every invite and result email automatically. There is one
                  signature per account, so editing it here updates all your scorecards at once.
                </p>
                <Toggle on={sig.enabled} onChange={(enabled) => setSig({ ...sig, enabled })} label="Signature enabled" />
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <p className={SECTION_LABEL}>Name</p>
                  <TextInput
                    className="mt-2"
                    value={sig.name}
                    placeholder="Joel Badcock"
                    onChange={(e) => setSig({ ...sig, name: e.target.value })}
                  />
                </div>
                <div>
                  <p className={SECTION_LABEL}>Role</p>
                  <TextInput
                    className="mt-2"
                    value={sig.role}
                    placeholder="Treasurer"
                    onChange={(e) => setSig({ ...sig, role: e.target.value })}
                  />
                </div>
                <div>
                  <p className={SECTION_LABEL}>Company / organisation</p>
                  <TextInput
                    className="mt-2"
                    value={sig.company}
                    placeholder="Devonport Table Tennis Association"
                    onChange={(e) => setSig({ ...sig, company: e.target.value })}
                  />
                </div>
                <div>
                  <p className={SECTION_LABEL}>Phone</p>
                  <TextInput
                    className="mt-2"
                    value={sig.phone}
                    placeholder="0400 000 000"
                    onChange={(e) => setSig({ ...sig, phone: e.target.value })}
                  />
                </div>
                <div>
                  <p className={SECTION_LABEL}>Website</p>
                  <TextInput
                    className="mt-2"
                    value={sig.website}
                    placeholder="devtt.com.au"
                    onChange={(e) => setSig({ ...sig, website: e.target.value })}
                  />
                </div>
                <div>
                  <p className={SECTION_LABEL}>Accent colour</p>
                  <ColorField label="Rule and name colour" value={sig.accentColor} onChange={(accentColor) => setSig({ ...sig, accentColor })} />
                </div>
              </div>

              <p className={`${SECTION_LABEL} mt-5`}>Photo or logo</p>
              <p className={HINT}>Shown as a small circle beside your details. Square images work best.</p>
              <ImagePicker label="" value={sig.imageUrl} onChange={(imageUrl) => setSig({ ...sig, imageUrl })} />

              {preview && (
                <>
                  <p className={`${SECTION_LABEL} mt-5`}>Preview</p>
                  <div
                    className="mt-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4"
                    // Server-rendered by our own sanitised renderer.
                    dangerouslySetInnerHTML={{ __html: preview }}
                  />
                </>
              )}

              <div className="mt-6 flex items-center justify-end gap-4 border-t border-gray-100 pt-5">
                {message && <span className="text-sm text-muted">{message}</span>}
                <button
                  onClick={save}
                  disabled={saving}
                  className="rounded-md bg-primary px-8 py-2.5 font-medium text-white hover:brightness-110 disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save signature'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
