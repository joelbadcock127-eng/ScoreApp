# Pulse survey redesign (scorecard 11)

A from-scratch redesign of the **Table Tennis Club Pulse Check** landing and
thank-you pages, built as custom-designed page shells (HTML + CSS + editable
slots) and stored in scorecard 11's config in the database. It replaces the
previous dark "floating balls" look with a light, editorial design: warm paper
background, Devonport navy and paddle red, Bricolage Grotesque display type,
and real photography.

**The club survey template (`lib/surveyTemplate.ts`) is deliberately
untouched.** New scorecards created from the template keep the old design;
only the live pulse survey (scorecard 11) uses this one.

## Files

- `design.mjs` - the source of record for both page shells and every copy slot.
- `apply.mjs` - pushes the design into scorecard 11's config (sanitized through
  the app's own `sanitizeCustomPage`, exactly as the editor would save it).
- `assets/` - source images, also uploaded to the public `scorecard-images`
  storage bucket under `pulse/` (that is what the pages reference):
  - `dtta-desktop.jpg` / `dtta-mobile.jpg` - live screenshots of the club site
    we built (dtta.vercel.app), desktop home and mobile fixtures/ladders.
  - `joel.jpg` - Joel at the table (from the club site's coach photos).
  - `club-doubles.jpg` - pennant night at the Devonport clubrooms.

## Re-applying after edits

```bash
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/pulse-survey-redesign/apply.mjs
```

Content tweaks do not need this script at all: every line of copy and every
image is a slot, editable in Admin -> Custom Design.

## Rolling back

The previous pages are exactly what `surveyLandingPage()` and
`surveyThanksPage()` in `lib/surveyTemplate.ts` return, so restoring them is a
matter of writing those two objects back into `config.customPages` for
scorecard 11.

## Gotcha worth knowing

`@import` in custom page CSS never works in production: the app injects the
page CSS after a base rule, and browsers ignore any `@import` that is not at
the very top of a stylesheet. That is why this design loads its display font
with plain `@font-face` rules instead. (The old template pages silently fell
back to Inter for the same reason.)
