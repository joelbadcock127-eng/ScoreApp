import { LeadFormField } from '@/lib/types';

// Renders the configurable lead form fields. First name / last name share a row like ScoreApp.
export default function LeadFormFields({
  fields,
  defaults = {},
}: {
  fields: LeadFormField[];
  defaults?: Record<string, string | boolean>;
}) {
  const enabled = fields.filter((f) => f.enabled);
  const nameRow = enabled.filter((f) => f.key === 'first_name' || f.key === 'last_name');
  const rest = enabled.filter((f) => !nameRow.includes(f));

  const input = (f: LeadFormField) => (
    <input
      key={f.key}
      name={f.key}
      type={f.type}
      required={f.required}
      defaultValue={(defaults[f.key] as string) ?? ''}
      placeholder={`${f.label}${f.required ? ' *' : ''}`}
      className="w-full rounded-lg border border-gray-300 px-4 py-4 text-base outline-none placeholder:text-gray-400 focus:border-primary"
    />
  );

  return (
    <div className="space-y-4">
      {nameRow.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">{nameRow.map(input)}</div>
      )}
      {rest.map((f) =>
        f.type === 'checkbox' ? (
          <label key={f.key} className="flex items-start gap-3 text-sm leading-relaxed text-ink">
            <input
              type="checkbox"
              name={f.key}
              defaultChecked={defaults[f.key] === true}
              className="mt-1 h-4 w-4 flex-none accent-primary"
            />
            {f.label}
          </label>
        ) : (
          input(f)
        )
      )}
    </div>
  );
}
