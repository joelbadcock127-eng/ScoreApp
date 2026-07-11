'use client';

import { useState } from 'react';
import { LeadFormField, ScorecardConfig } from '@/lib/types';

type LeadForm = ScorecardConfig['leadForm'];

export default function LeadFormEditor({ initial }: { initial: LeadForm }) {
  const [form, setForm] = useState<LeadForm>(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  function updateField(i: number, patch: Partial<LeadFormField>) {
    setForm({
      ...form,
      fields: form.fields.map((f, j) => (j === i ? { ...f, ...patch } : f)),
    });
  }

  async function save() {
    setSaving(true);
    setMessage('');
    const res = await fetch('/api/admin/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadForm: form }),
    });
    setSaving(false);
    setMessage(res.ok ? 'Saved.' : 'Save failed.');
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold">Lead Form</h1>
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Form Fields</p>
        <p className="mt-2 text-muted">
          Add or remove fields to this Scorecard lead form. Name and email fields are included by
          default but you can adjust settings or disable as required.
        </p>

        <label className="mt-6 block text-sm font-medium">Form heading</label>
        <input
          value={form.heading}
          onChange={(e) => setForm({ ...form, heading: e.target.value })}
          className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-primary"
        />

        <div className="mt-8 grid grid-cols-[1fr,110px,100px,90px,40px] items-center gap-4 text-xs font-semibold uppercase tracking-wide text-muted">
          <span>Label</span>
          <span>Type</span>
          <span>Required</span>
          <span>Enabled</span>
          <span />
        </div>
        {form.fields.map((f, i) => {
          const core = ['first_name', 'last_name', 'email'].includes(f.key);
          return (
            <div key={f.key + i} className="mt-3 grid grid-cols-[1fr,110px,100px,90px,40px] items-center gap-4">
              <textarea
                value={f.label}
                rows={f.label.length > 60 ? 3 : 1}
                onChange={(e) => updateField(i, { label: e.target.value })}
                className="resize-none rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-primary"
              />
              <select
                value={f.type}
                disabled={core}
                onChange={(e) => updateField(i, { type: e.target.value as LeadFormField['type'] })}
                className="rounded-md border border-gray-300 px-2 py-2 outline-none focus:border-primary disabled:bg-gray-50"
              >
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="checkbox">Checkbox</option>
              </select>
              <input
                type="checkbox"
                checked={f.required}
                onChange={(e) => updateField(i, { required: e.target.checked })}
                className="h-5 w-5 accent-primary"
              />
              <input
                type="checkbox"
                checked={f.enabled}
                disabled={core}
                onChange={(e) => updateField(i, { enabled: e.target.checked })}
                className="h-5 w-5 accent-primary"
              />
              <button
                onClick={() => setForm({ ...form, fields: form.fields.filter((_, j) => j !== i) })}
                disabled={core}
                className="text-muted hover:text-tier-low disabled:opacity-30"
                aria-label="Remove field"
              >
                ✕
              </button>
            </div>
          );
        })}

        <button
          onClick={() =>
            setForm({
              ...form,
              fields: [
                ...form.fields,
                {
                  key: `custom_${Date.now()}`,
                  label: 'New field',
                  type: 'text',
                  required: false,
                  enabled: true,
                },
              ],
            })
          }
          className="mt-5 text-sm font-medium text-primary hover:underline"
        >
          + Add Field
        </button>

        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={save}
            disabled={saving}
            className="rounded-md bg-primary px-8 py-2.5 font-medium text-white hover:bg-blue-600 disabled:opacity-60"
          >
            Save
          </button>
          {message && <span className="text-sm text-muted">{message}</span>}
        </div>
      </div>
    </div>
  );
}
