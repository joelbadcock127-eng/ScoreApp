'use client';

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { InviteEmailConfig, LeadFormField } from '@/lib/types';
import { ImagePicker, RichText, SpacingSelect, TextInput } from '@/components/admin/editor/ui';
import { inviteMergeFields } from '@/components/admin/mergeFields';
import SignatureEditor from '@/components/admin/SignatureEditor';

const CARD = 'rounded-xl border border-gray-200 bg-white p-6';
const SECTION_LABEL = 'text-xs font-semibold uppercase tracking-wide text-ink';
const HINT = 'mt-2 text-sm text-muted';
const FREE_MAIL_RE = /@(gmail|googlemail|outlook|hotmail|live|yahoo|icloud|me|aol)\./i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Recipient {
  id: string;
  first_name: string;
  last_name: string;
  business: string;
  email: string;
  status: string;
  invited_at: string | null;
}

interface Summary {
  queued: number;
  sent: number;
  completed: number;
  suppressed: number;
  drip: { perDay: number; startedAt: string | null; sentToday: number } | null;
  recent: Recipient[];
}

type ParsedRow = { email: string; first_name: string; last_name: string; business: string };
type Column = 'email' | 'first_name' | 'last_name' | 'business' | null;

// Recognise a header row ("Email, First name, Last name, Club") so columns
// can be mapped by name; otherwise columns are positional after the email:
// first name, last name, business. Empty cells keep their position, so
// "info@club.org.au, , , Some Club" puts the club in business, not first name.
function headerColumns(cells: string[]): Column[] | null {
  const cols = cells.map<Column>((c) => {
    const h = c.toLowerCase();
    if (/e-?mail/.test(h)) return 'email';
    if (/first|given|contact|^name$/.test(h)) return 'first_name';
    if (/last|surname|family/.test(h)) return 'last_name';
    if (/business|club|organi[sz]ation|association|company|org\b/.test(h)) return 'business';
    return null;
  });
  return cols.includes('email') ? cols : null;
}

// Parse pasted text / CSV into recipient rows. Accepts one address per line,
// optionally followed by first name, last name, business (comma/semicolon/tab
// separated, in any of the common export shapes).
function parseRows(text: string): ParsedRow[] {
  const rows: ParsedRow[] = [];
  let header: Column[] | null = null;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const cells = line.split(/[,;\t]/).map((c) => c.trim().replace(/^"|"$/g, ''));
    // The email can be in any column (e.g. "Name, email" exports).
    const emailIdx = cells.findIndex((c) => EMAIL_RE.test(c));
    if (emailIdx === -1) {
      if (rows.length === 0 && !header) header = headerColumns(cells);
      continue; // header row or junk
    }
    const row: ParsedRow = { email: cells[emailIdx], first_name: '', last_name: '', business: '' };
    if (header) {
      header.forEach((col, i) => {
        if (col && col !== 'email' && cells[i]) row[col] = cells[i];
      });
    } else {
      const rest = cells.filter((_, i) => i !== emailIdx);
      row.first_name = rest[0] ?? '';
      row.last_name = rest[1] ?? '';
      row.business = rest[2] ?? '';
    }
    rows.push(row);
  }
  return rows;
}

function StatChip({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-center">
      <span className={`block text-2xl font-bold ${tone}`}>{value}</span>
      <span className="text-xs font-medium text-muted">{label}</span>
    </div>
  );
}

export default function DistributionEditor({
  initial,
  leadFields = [],
}: {
  initial: InviteEmailConfig;
  leadFields?: LeadFormField[];
}) {
  const router = useRouter();
  const [v, setV] = useState(initial);

  // ——— Save sender + template ————————————————————————————————————————
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  async function save() {
    setSaving(true);
    setSaveMsg('');
    const res = await fetch('/api/admin/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteEmail: v }),
    });
    setSaving(false);
    setSaveMsg(res.ok ? 'Saved.' : 'Save failed.');
    if (res.ok) router.refresh();
  }

  // ——— Recipient summary ———————————————————————————————————————————————
  const [summary, setSummary] = useState<Summary | null>(null);
  const refresh = useCallback(async () => {
    const res = await fetch('/api/admin/invites');
    if (res.ok) setSummary(await res.json());
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);

  // ——— Import ———————————————————————————————————————————————————————————
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const parsed = parseRows(importText);

  async function runImport() {
    if (parsed.length === 0) return;
    setImporting(true);
    setImportMsg('');
    const res = await fetch('/api/admin/invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows: parsed }),
    });
    const json = await res.json().catch(() => ({}));
    setImporting(false);
    if (!res.ok) {
      setImportMsg(json.error || 'Import failed.');
      return;
    }
    const parts = [`${json.imported} added`];
    if (json.skipped) parts.push(`${json.skipped} already on this scorecard`);
    if (json.suppressed) parts.push(`${json.suppressed} unsubscribed (skipped)`);
    if (json.invalid) parts.push(`${json.invalid} invalid`);
    setImportMsg(parts.join ? parts.join(' · ') : 'Imported.');
    setImportText('');
    refresh();
  }

  function onFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImportText(String(reader.result ?? ''));
    reader.readAsText(file);
  }

  // ——— Test send ————————————————————————————————————————————————————————
  const [testTo, setTestTo] = useState('');
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState<{ ok: boolean; text: string } | null>(null);
  async function sendTest() {
    setTesting(true);
    setTestMsg(null);
    const res = await fetch('/api/admin/invites/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true, to: testTo }),
    });
    const json = await res.json().catch(() => ({}));
    setTesting(false);
    setTestMsg(
      res.ok
        ? { ok: true, text: `Sent to ${json.to}. Check the inbox (and spam).` }
        : { ok: false, text: json.error || 'Send failed.' }
    );
  }

  // ——— Bulk send ————————————————————————————————————————————————————————
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState<{ sent: number; failed: number; remaining: number } | null>(null);
  const [sendErr, setSendErr] = useState('');
  const stopRef = useRef(false);

  // ——— Remove queued recipients before they are sent. ——————————————————
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [removing, setRemoving] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const allRows = summary?.recent ?? [];
  const allPicked = allRows.length > 0 && allRows.every((r) => picked.has(r.id));
  // Sent or completed rows are history: removing them needs a second click.
  const pickedSent = allRows.filter((r) => picked.has(r.id) && (r.invited_at || r.status === 'completed')).length;
  function togglePick(id: string) {
    const next = new Set(picked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setPicked(next);
    setConfirmRemove(false);
  }
  function togglePickAll() {
    setPicked(allPicked ? new Set() : new Set(allRows.map((r) => r.id)));
    setConfirmRemove(false);
  }
  async function removePicked() {
    if (picked.size === 0) return;
    if (pickedSent > 0 && !confirmRemove) {
      setConfirmRemove(true);
      return;
    }
    setRemoving(true);
    await fetch('/api/admin/invites', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: Array.from(picked), includeSent: pickedSent > 0 }),
    });
    setPicked(new Set());
    setConfirmRemove(false);
    setRemoving(false);
    refresh();
  }

  // ——— Drip: a fixed number per day instead of the whole queue at once. ——
  const [drip, setDrip] = useState(false);
  const [perDay, setPerDay] = useState(10);
  const dripOn = summary?.drip ?? null;

  async function startDrip() {
    setSending(true);
    setSendErr('');
    const res = await fetch('/api/admin/invites/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirm: true, drip: { perDay } }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) setSendErr(json.error || 'Send failed.');
    else {
      setProgress({ sent: json.sent ?? 0, failed: json.failed ?? 0, remaining: json.remaining ?? 0 });
      if (json.errors?.length) setSendErr(json.errors[0]);
    }
    setSending(false);
    refresh();
  }

  async function pauseDrip() {
    setSending(true);
    await fetch('/api/admin/invites/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drip: { enabled: false } }),
    });
    setSending(false);
    refresh();
  }

  async function sendAll() {
    setSending(true);
    setSendErr('');
    stopRef.current = false;
    let sent = 0;
    let failed = 0;
    // Batches loop until the queue is empty; each API call sends ~20.
    for (;;) {
      const res = await fetch('/api/admin/invites/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSendErr(json.error || 'Send failed.');
        break;
      }
      sent += json.sent ?? 0;
      failed += json.failed ?? 0;
      setProgress({ sent, failed, remaining: json.remaining ?? 0 });
      if (json.errors?.length) setSendErr(json.errors[0]);
      if (stopRef.current || !json.remaining || (json.sent === 0 && json.failed === 0)) break;
      if (json.failed > 0 && json.sent === 0) break; // provider trouble — don't hammer
    }
    setSending(false);
    refresh();
  }

  const queued = summary?.queued ?? 0;
  const freeMailSender = FREE_MAIL_RE.test(v.fromAddress);

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold">Distribution</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Import a list and send everyone a personal invite link to this scorecard. Each recipient is tracked as a lead
        from the moment their invite is sent, and an unsubscribe link is added to every email automatically.
      </p>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatChip label="Queued" value={queued} tone="text-primary" />
        <StatChip label="Invited" value={summary?.sent ?? 0} tone="text-navy" />
        <StatChip label="Completed" value={summary?.completed ?? 0} tone="text-tier-high" />
        <StatChip label="Unsubscribed" value={summary?.suppressed ?? 0} tone="text-muted" />
      </div>

      {/* Sender */}
      <p className={`${SECTION_LABEL} mt-10`}>Sender</p>
      <p className={HINT}>
        Who the invite comes from. The from address must be on the domain verified with your email provider — the
        reply-to can be any inbox.
      </p>
      <div className={`${CARD} mt-3`}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className={SECTION_LABEL}>From name</p>
            <TextInput
              className="mt-2"
              value={v.fromName}
              placeholder="Joel from Acceso AI"
              onChange={(e) => setV({ ...v, fromName: e.target.value })}
            />
          </div>
          <div>
            <p className={SECTION_LABEL}>From address</p>
            <TextInput
              className="mt-2"
              value={v.fromAddress}
              placeholder="invites@yourdomain.com"
              onChange={(e) => setV({ ...v, fromAddress: e.target.value })}
            />
          </div>
        </div>
        {freeMailSender && (
          <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
            You can’t send <b>from</b> a Gmail/Outlook/free address — use an address on your verified domain and put
            this one in “Reply to” instead.
          </p>
        )}
        <div className="mt-5">
          <p className={SECTION_LABEL}>Reply to</p>
          <TextInput
            className="mt-2"
            value={v.replyTo}
            placeholder="you@anywhere.com"
            onChange={(e) => setV({ ...v, replyTo: e.target.value })}
          />
        </div>
        <p className="mt-3 text-xs text-muted">
          The little profile picture next to the sender in Gmail can’t be set from here — mailbox providers pull it
          from the from-address’s own Google account photo, or from the domain’s BIMI record. See the note under Email
          signature below.
        </p>
        <div className="mt-6 border-t border-gray-100 pt-5">
          <p className={SECTION_LABEL}>Sender identification</p>
          <p className={HINT}>
            Shown in the footer of every invite. Anti-spam law (Spam Act / CAN-SPAM) requires bulk email to identify
            the sender — business name is required, a physical or postal address is strongly recommended.
          </p>
          <div className="mt-3 grid gap-5 sm:grid-cols-2">
            <TextInput
              value={v.senderName}
              placeholder="Business name (required to send)"
              onChange={(e) => setV({ ...v, senderName: e.target.value })}
            />
            <TextInput
              value={v.senderAddress}
              placeholder="Street or postal address"
              onChange={(e) => setV({ ...v, senderAddress: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Invite email */}
      <p className={`${SECTION_LABEL} mt-10`}>Invite email</p>
      <p className={HINT}>The email every recipient gets, with their own personal link.</p>
      <div className={`${CARD} mt-3`}>
        <p className={SECTION_LABEL}>Subject</p>
        <TextInput className="mt-2" value={v.subject} onChange={(e) => setV({ ...v, subject: e.target.value })} />
        <div className="mt-6 flex items-center justify-between gap-4">
          <p className={SECTION_LABEL}>Content</p>
          <SpacingSelect value={v.lineSpacing} onChange={(lineSpacing) => setV({ ...v, lineSpacing })} />
        </div>
        <RichText
          value={v.content}
          onChange={(content) => setV({ ...v, content })}
          mergeFields={inviteMergeFields(leadFields)}
          className="mt-2 min-h-[180px] rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <p className={HINT}>
          Use <b>Insert merge field</b> to drop in the recipient’s details —{' '}
          <code className="rounded bg-gray-50 px-1">{'{invite_button}'}</code> becomes a styled button with their
          personal link. An unsubscribe footer is appended automatically.
        </p>
        <p className={`${SECTION_LABEL} mt-6`}>Header image</p>
        {v.headerImage && (
          <div className="mt-2 rounded-lg border border-dashed border-gray-300 p-3">
            <img src={v.headerImage} alt="" className="mx-auto max-h-16 object-contain" />
          </div>
        )}
        <ImagePicker label="" value={v.headerImage ?? ''} onChange={(headerImage) => setV({ ...v, headerImage })} />

        <div className="mt-8 flex items-center justify-end gap-4 border-t border-gray-200 pt-5">
          {saveMsg && <span className="text-sm text-muted">{saveMsg}</span>}
          <button
            onClick={save}
            disabled={saving}
            className="rounded-md bg-primary px-8 py-2.5 font-medium text-white hover:brightness-110 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-lg bg-gray-50 p-4">
          <span className="text-sm font-medium text-ink">Send a test to</span>
          <input
            value={testTo}
            onChange={(e) => setTestTo(e.target.value)}
            placeholder="you@example.com"
            className="w-56 rounded-md border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-primary"
          />
          <button
            onClick={sendTest}
            disabled={testing}
            className="rounded-md border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
          >
            {testing ? 'Sending…' : 'Send test'}
          </button>
          {testMsg && (
            <span className={`text-sm ${testMsg.ok ? 'text-tier-high' : 'text-tier-low'}`}>{testMsg.text}</span>
          )}
        </div>
        <p className={HINT}>Save first — the test uses the last saved version. The link in the test opens the landing page exactly as a recipient sees it, then a preview run of the questions and the thank-you page; nothing is recorded as a lead.</p>
      </div>

      {/* Signature (account-wide) */}
      <p className={`${SECTION_LABEL} mt-10`}>Email signature</p>
      <p className={HINT}>
        Signed off automatically at the bottom of invite and result emails, on every scorecard in this account.
      </p>
      <SignatureEditor />
      <p className={HINT}>
        Want your photo in the little circle next to the sender in Gmail too? That avatar is controlled by the inbox,
        not the email: create a Google account for your from-address and set its profile photo (fastest), or set up
        BIMI on the domain. The signature above puts your face inside the email itself, which every recipient sees.
      </p>

      {/* Import */}
      <p className={`${SECTION_LABEL} mt-10`}>Import recipients</p>
      <p className={HINT}>
        Paste addresses (one per line, optionally “email, first name, last name, business”; leave a cell empty to skip it, as in “info@club.org.au, , , Some Club”) or upload a CSV with a header row. Duplicates,
        addresses already on this scorecard, and anyone who has unsubscribed are skipped automatically.
      </p>
      <div className={`${CARD} mt-3`}>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          rows={6}
          placeholder={'sarah@example.com, Sarah, Nguyen, Acme Fitness\njames@example.com'}
          className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm outline-none focus:border-primary"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Upload CSV…
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.txt"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <button
            onClick={runImport}
            disabled={importing || parsed.length === 0}
            className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-white hover:brightness-110 disabled:opacity-60"
          >
            {importing ? 'Importing…' : `Add ${parsed.length || ''} recipient${parsed.length === 1 ? '' : 's'}`}
          </button>
          {importMsg && <span className="text-sm text-muted">{importMsg}</span>}
        </div>
      </div>

      {/* Send */}
      <p className={`${SECTION_LABEL} mt-10`}>Send</p>
      <div className={`${CARD} mt-3`}>
        {queued > 500 && (
          <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Large send ({queued} queued). If this domain hasn’t sent bulk email before, consider starting with a few
            hundred and building up over days — a sudden blast from a fresh domain is the fastest route to the spam
            folder. Resend’s free plan also caps sending at 100 emails/day; anything over stays queued and can be sent
            tomorrow.
          </p>
        )}
        <label className="flex cursor-pointer items-start gap-3 text-sm text-ink">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[color:var(--primary)]"
          />
          <span>
            I confirm these recipients gave consent to hear from me (they’re my customers, subscribers or opted-in
            contacts) and my sender identification above is accurate. Sending unsolicited bulk email is unlawful in
            most countries, including under the Australian Spam Act.
          </span>
        </label>
        {dripOn ? (
          <div className="mt-5 rounded-md bg-blue-50 px-4 py-3 text-sm text-ink">
            <p>
              <b>Drip is running:</b> {dripOn.perDay} a day. {dripOn.sentToday} sent in the last 24 hours, {queued} still
              queued. The next lot goes out automatically each morning until the queue is empty. Anything you import
              joins the queue.
            </p>
            <button
              onClick={pauseDrip}
              disabled={sending}
              className="mt-3 rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
            >
              {sending ? 'Pausing…' : 'Pause drip'}
            </button>
          </div>
        ) : (
          <label className="mt-4 flex cursor-pointer flex-wrap items-center gap-3 text-sm text-ink">
            <input
              type="checkbox"
              checked={drip}
              onChange={(e) => setDrip(e.target.checked)}
              className="h-4 w-4 accent-[color:var(--primary)]"
            />
            <span>Drip</span>
            {drip && (
              <>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={perDay}
                  onChange={(e) => setPerDay(Math.max(1, Math.min(100, Math.round(Number(e.target.value) || 1))))}
                  className="w-20 rounded-md border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-primary"
                />
                <span className="text-muted">
                  per day. Sends that many now, then the same again each morning until the queue is empty. Watch the
                  replies from the first day or two before the rest go out.
                </span>
              </>
            )}
          </label>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-4">
          {!dripOn && (
            <button
              onClick={drip ? startDrip : sendAll}
              disabled={sending || !consent || queued === 0}
              className="rounded-md bg-primary px-8 py-2.5 font-medium text-white hover:brightness-110 disabled:opacity-60"
            >
              {sending
                ? 'Sending…'
                : queued === 0
                  ? 'Nothing queued'
                  : drip
                    ? `Start drip: ${Math.min(perDay, queued)} today, ${perDay} a day`
                    : `Send ${queued} invite${queued === 1 ? '' : 's'}`}
            </button>
          )}
          {sending && !drip && (
            <button
              onClick={() => (stopRef.current = true)}
              className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
            >
              Stop after this batch
            </button>
          )}
          {progress && (
            <span className="text-sm text-muted">
              {progress.sent} sent{progress.failed > 0 ? `, ${progress.failed} failed` : ''}
              {progress.remaining > 0 ? `, ${progress.remaining} to go` : ' — done'}
            </span>
          )}
        </div>
        {sendErr && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{sendErr}</p>}
      </div>

      {/* Recipients */}
      {summary && summary.recent.length > 0 && (
        <>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
            <p className={SECTION_LABEL}>Recipients</p>
            <div className="flex items-center gap-3">
              {confirmRemove && (
                <span className="text-sm text-tier-low">
                  {pickedSent} of these {pickedSent === 1 ? 'has' : 'have'} been sent or completed. Their answers go too.
                </span>
              )}
              <button
                onClick={removePicked}
                disabled={removing || picked.size === 0}
                className={`rounded-md border px-4 py-1.5 text-sm font-medium disabled:opacity-50 ${
                  confirmRemove
                    ? 'border-tier-low bg-tier-low text-white hover:brightness-110'
                    : 'border-gray-300 bg-white text-tier-low hover:bg-red-50'
                }`}
              >
                {removing
                  ? 'Removing…'
                  : confirmRemove
                    ? `Yes, erase ${picked.size}`
                    : picked.size > 0
                      ? `Remove ${picked.size}`
                      : 'Tick rows to remove them'}
              </button>
            </div>
          </div>
          <div className={`${CARD} mt-3 overflow-x-auto p-0`}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-muted">
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label="Select all"
                      checked={allPicked}
                      onChange={togglePickAll}
                      className="h-4 w-4 accent-[color:var(--primary)]"
                    />
                  </th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Business</th>
                  <th className="px-5 py-3 font-semibold">Greeting</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {summary.recent.map((r) => (
                  <tr key={r.id} className={picked.has(r.id) ? 'bg-red-50/60' : undefined}>
                    <td className="px-4 py-2.5">
                      <input
                        type="checkbox"
                        aria-label={`Select ${r.email}`}
                        checked={picked.has(r.id)}
                        onChange={() => togglePick(r.id)}
                        className="h-4 w-4 accent-[color:var(--primary)]"
                      />
                    </td>
                    <td className="px-5 py-2.5">{r.email}</td>
                    <td className="px-5 py-2.5">{[r.first_name, r.last_name].filter(Boolean).join(' ')}</td>
                    <td className="px-5 py-2.5 text-muted">{r.business}</td>
                    {/* Exactly what {first_name_business} renders for this row. */}
                    <td className="px-5 py-2.5 text-muted">
                      {(r.first_name || '').trim() || (r.business || '').trim() ? (
                        <>Hi {(r.first_name || '').trim() || (r.business || '').trim()},</>
                      ) : (
                        <span className="font-semibold text-tier-low">Hi , (no name or business)</span>
                      )}
                    </td>
                    <td className="px-5 py-2.5">
                      {r.status === 'completed' ? (
                        <span className="rounded-full bg-tier-high/10 px-2.5 py-0.5 text-xs font-bold text-tier-high">
                          Completed
                        </span>
                      ) : r.invited_at ? (
                        <span className="rounded-full bg-navy/10 px-2.5 py-0.5 text-xs font-bold text-navy">Invited</span>
                      ) : (
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                          Queued
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
