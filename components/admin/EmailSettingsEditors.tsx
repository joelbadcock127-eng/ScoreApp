'use client';

/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NotificationsConfig, ResultEmailConfig, ShareAppearanceConfig } from '@/lib/types';
import { ImagePicker, RichText, TextInput, Toggle } from '@/components/admin/editor/ui';

function SaveBar({ onSave, saving, message }: { onSave: () => void; saving: boolean; message: string }) {
  return (
    <div className="mt-8 flex items-center justify-end gap-4 border-t border-gray-200 pt-5">
      {message && <span className="text-sm text-muted">{message}</span>}
      <button
        onClick={onSave}
        disabled={saving}
        className="rounded-md bg-primary px-8 py-2.5 font-medium text-white hover:brightness-110 disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  );
}

function useSave(body: () => Record<string, unknown>) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  async function save() {
    setSaving(true);
    setMessage('');
    const res = await fetch('/api/admin/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body()),
    });
    setSaving(false);
    setMessage(res.ok ? 'Saved.' : 'Save failed.');
    if (res.ok) router.refresh();
  }
  return { save, saving, message };
}

const CARD = 'rounded-xl border border-gray-200 bg-white p-6';
const SECTION_LABEL = 'text-xs font-semibold uppercase tracking-wide text-ink';
const HINT = 'mt-2 text-sm text-muted';

// ——— Share Appearance ———————————————————————————————————————————————
export function ShareAppearanceEditor({ initial }: { initial: ShareAppearanceConfig }) {
  const [v, setV] = useState(initial);
  const { save, saving, message } = useSave(() => ({ shareAppearance: v }));
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold">Share Appearance</h1>
      <div className="mt-6 grid gap-8 md:grid-cols-[260px,1fr]">
        <div>
          <p className={SECTION_LABEL}>Appearance</p>
          <p className={HINT}>
            Control how your scorecard appears when shared on social media platforms such as Facebook and LinkedIn.
          </p>
        </div>
        <div className={CARD}>
          <p className={SECTION_LABEL}>Title</p>
          <TextInput className="mt-2" value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} />
          <p className={HINT}>Something to pique the interest of others on social media, e.g. Discover your influence score</p>

          <p className={`${SECTION_LABEL} mt-6`}>Description</p>
          <textarea
            value={v.description}
            onChange={(e) => setV({ ...v, description: e.target.value })}
            rows={3}
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <p className={HINT}>
            A brief description of your scorecard, usually between 2 and 4 sentences. This will be displayed for example
            below the title of the post on Facebook.
          </p>

          <p className={`${SECTION_LABEL} mt-6`}>Image</p>
          {v.image && (
            <div className="mt-2 rounded-lg border border-dashed border-gray-300 p-3">
              <img src={v.image} alt="" className="mx-auto max-h-56 object-contain" />
            </div>
          )}
          <ImagePicker label="" value={v.image} onChange={(image) => setV({ ...v, image })} />
          <p className={HINT}>Recommended dimensions are 1280 x 720</p>
          <SaveBar onSave={save} saving={saving} message={message} />
        </div>
      </div>
    </div>
  );
}

// ——— Notifications ———————————————————————————————————————————————————
export function NotificationsEditor({ initial }: { initial: NotificationsConfig }) {
  const [v, setV] = useState(initial);
  const { save, saving, message } = useSave(() => ({ notifications: v }));
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold">Notification Settings</h1>

      <div className={`${CARD} mt-6 flex items-start justify-between gap-6`}>
        <div>
          <p className={SECTION_LABEL}>Send notifications</p>
          <p className={HINT}>Choose if you would like an email notification when you receive new leads</p>
        </div>
        <Toggle on={v.enabled} onChange={(enabled) => setV({ ...v, enabled })} label="Send notifications" />
      </div>

      <p className={`${SECTION_LABEL} mt-8`}>Recipients</p>
      <p className={HINT}>Add a comma separated list of emails who should receive these notifications</p>
      <div className={`${CARD} mt-3`}>
        <p className={SECTION_LABEL}>Notification email</p>
        <TextInput
          className="mt-2"
          value={v.recipients}
          placeholder="you@example.com, teammate@example.com"
          onChange={(e) => setV({ ...v, recipients: e.target.value })}
        />
      </div>

      <p className={`${SECTION_LABEL} mt-8`}>Content</p>
      <p className={HINT}>Customise the notification email when you receive a new lead</p>
      <div className={`${CARD} mt-3`}>
        <p className={SECTION_LABEL}>Subject</p>
        <TextInput className="mt-2" value={v.subject} onChange={(e) => setV({ ...v, subject: e.target.value })} />
        <p className={HINT}>
          Merge fields: {'{first_name} {last_name} {scorecard_name}'}
        </p>

        <p className={`${SECTION_LABEL} mt-6`}>Email content</p>
        <RichText
          value={v.content}
          onChange={(content) => setV({ ...v, content })}
          className="mt-2 min-h-[160px] rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <p className={HINT}>
          Merge fields: {'{first_name} {last_name} {email} {status} {score} {scorecard_name} {results_link} {report_link}'}
        </p>
        <SaveBar onSave={save} saving={saving} message={message} />
      </div>
    </div>
  );
}

// ——— Result Email ————————————————————————————————————————————————————
export function ResultEmailEditor({ initial }: { initial: ResultEmailConfig }) {
  const [v, setV] = useState(initial);
  const { save, saving, message } = useSave(() => ({ resultEmail: v }));
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold">Result Email Settings</h1>

      <div className={`${CARD} mt-6 flex items-start justify-between gap-6`}>
        <div>
          <p className={SECTION_LABEL}>Send result email</p>
          <p className={HINT}>Choose if you would like an email to be sent to your lead when they complete your scorecard</p>
        </div>
        <Toggle on={v.enabled} onChange={(enabled) => setV({ ...v, enabled })} label="Send result email" />
      </div>

      <p className={`${SECTION_LABEL} mt-8`}>Email from</p>
      <p className={HINT}>Customise who the email appears to be sent from</p>
      <div className={`${CARD} mt-3`}>
        <p className={SECTION_LABEL}>From address</p>
        <TextInput
          className="mt-2"
          value={v.fromAddress}
          placeholder="results@yourdomain.com (must be verified with your email provider)"
          onChange={(e) => setV({ ...v, fromAddress: e.target.value })}
        />
        <p className={`${SECTION_LABEL} mt-5`}>From name</p>
        <TextInput className="mt-2" value={v.fromName} onChange={(e) => setV({ ...v, fromName: e.target.value })} />
        <p className={`${SECTION_LABEL} mt-5`}>Reply to email</p>
        <TextInput
          className="mt-2"
          value={v.replyTo}
          placeholder="you@yourdomain.com"
          onChange={(e) => setV({ ...v, replyTo: e.target.value })}
        />
      </div>

      <p className={`${SECTION_LABEL} mt-8`}>Content</p>
      <p className={HINT}>Write an email that links to further results, follow up, or offers etc</p>
      <div className={`${CARD} mt-3`}>
        <p className={SECTION_LABEL}>Subject</p>
        <TextInput className="mt-2" value={v.subject} onChange={(e) => setV({ ...v, subject: e.target.value })} />
        <p className={HINT}>Merge fields: {'{first_name} {last_name} {scorecard_name}'}</p>

        <p className={`${SECTION_LABEL} mt-6`}>Email content</p>
        <RichText
          value={v.content}
          onChange={(content) => setV({ ...v, content })}
          className="mt-2 min-h-[200px] rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <p className={HINT}>
          Merge fields: {'{first_name} {last_name} {email} {score} {scorecard_name} {results_link} {report_link}'}
        </p>
        <SaveBar onSave={save} saving={saving} message={message} />
      </div>

      <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5 text-sm leading-relaxed text-ink">
        <p className="font-semibold">Connecting an email service</p>
        <p className="mt-1">
          Emails are held until a sending provider is connected — just set one environment variable, no code changes:
        </p>
        <ul className="mt-2 list-disc pl-5">
          <li>
            <b>Resend</b> (recommended): free for 3,000 emails/month, domain verified in minutes — set{' '}
            <code className="rounded bg-white px-1">RESEND_API_KEY</code>
          </li>
          <li>
            <b>Brevo</b>: free for 300 emails/day — set <code className="rounded bg-white px-1">BREVO_API_KEY</code>
          </li>
          <li>
            <b>Amazon SES</b>: cheapest at scale (~$0.10 per 1,000) but more setup — can be added on request
          </li>
        </ul>
      </div>
    </div>
  );
}
