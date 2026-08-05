import { LeadFormField } from '@/lib/types';
import { MergeFieldOption } from '@/components/admin/editor/ui';

// The merge fields each email editor's "Insert field" menu offers. Base lists
// mirror exactly what the server merges (lib/server/invites.ts and
// lib/server/email.ts); lead-form fields are layered on top — standard keys
// just relabel the existing entry (e.g. business shown as "Club name"),
// custom keys become new entries, since their values are stored per lead and
// merged into result/notification emails.

const PERSON: MergeFieldOption[] = [
  { token: '{first_name}', label: 'First name' },
  { token: '{last_name}', label: 'Last name' },
  { token: '{email}', label: 'Email address' },
  { token: '{business}', label: 'Business / organisation' },
];

const INVITE_BASE: MergeFieldOption[] = [
  ...PERSON,
  { token: '{scorecard_name}', label: 'Scorecard name' },
  { token: '{invite_link}', label: 'Personal invite link', hint: 'Plain URL' },
  { token: '{invite_button}', label: 'Invite button', hint: 'Styled button with the personal link' },
];

const RESULT_BASE: MergeFieldOption[] = [
  ...PERSON,
  { token: '{status}', label: 'Lead status' },
  { token: '{score}', label: 'Overall score' },
  { token: '{scorecard_name}', label: 'Scorecard name' },
  { token: '{results_link}', label: 'Results page link', hint: 'Plain URL' },
  { token: '{report_link}', label: 'PDF report link', hint: 'Plain URL' },
  { token: '{answers_summary}', label: 'All answers', hint: 'Every question with their answer' },
];

const RESULT_BUTTONS: MergeFieldOption[] = [
  { token: '{results_button}', label: 'Results button', hint: 'Styled button to the results page' },
  { token: '{report_download}', label: 'Report button', hint: 'Styled button to the PDF report' },
];

const STANDARD_KEYS = new Set(['first_name', 'last_name', 'email', 'business']);

function withLeadFields(base: MergeFieldOption[], leadFields: LeadFormField[], includeCustom: boolean): MergeFieldOption[] {
  const out = base.map((o) => ({ ...o }));
  for (const f of leadFields) {
    if (!f.enabled || !/^[a-z0-9_]+$/i.test(f.key) || f.key === 'contact_opt_in') continue;
    if (STANDARD_KEYS.has(f.key)) {
      const existing = out.find((o) => o.token === `{${f.key}}`);
      if (existing && f.label.trim()) existing.label = f.label.trim();
    } else if (includeCustom) {
      out.push({ token: `{${f.key}}`, label: f.label.trim() || f.key, hint: 'Lead form field' });
    }
  }
  return out;
}

// Invites are sent before the lead form runs, so custom fields have no value
// yet — the invite menu sticks to fields an import can fill.
export function inviteMergeFields(leadFields: LeadFormField[] = []): MergeFieldOption[] {
  return withLeadFields(INVITE_BASE, leadFields, false);
}

export function notificationMergeFields(leadFields: LeadFormField[] = []): MergeFieldOption[] {
  return withLeadFields(RESULT_BASE, leadFields, true);
}

export function resultMergeFields(leadFields: LeadFormField[] = []): MergeFieldOption[] {
  return withLeadFields([...RESULT_BASE, ...RESULT_BUTTONS], leadFields, true);
}
