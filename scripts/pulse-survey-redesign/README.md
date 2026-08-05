# Pulse survey redesign (scorecard 11)

The design system for the **Table Tennis Club Pulse Check** landing and
thank-you pages, built as custom-designed page shells (HTML + CSS + editable
slots) and stored in scorecard 11's config in the database.

Current look (2026 refresh): a clean, official design. White and cool grey
sections, deep navy ink, one electric blue accent (#1D63ED) for every action,
Space Grotesk display type, professional stock photography and no emojis
(icons are inline SVG data URIs in the CSS). The respondent-facing result
email, branding colours, lead form button and question screen colours are
applied together with the pages so the whole flow matches.

**The club survey template (`lib/surveyTemplate.ts`) is deliberately
untouched.** New scorecards created from the template keep the old design;
only the live pulse survey (scorecard 11) uses this one.

## Files

- `design.mjs` - the source of record: both page shells, every copy slot,
  the result email, and the palette patches (branding, lead form button,
  question screen colours, share description).
- `apply.mjs` - pushes all of it into scorecard 11's config (pages sanitized
  through the app's own `sanitizeCustomPage`, exactly as the editor would
  save them).
- `assets/` - source images, uploaded to the public `scorecard-images`
  storage bucket under `pulse/` (that is what the pages reference):
  - `dtta-desktop.jpg` / `dtta-mobile.jpg` - live screenshots of the club
    system we built (devtt.com.au), desktop home and mobile fixtures/ladders.
  - `joel.jpg` - Joel at the table (photographer: Jonah Smith Pro Visuals).
  - `club-doubles.jpg` - pennant night at the Devonport clubrooms
    (not referenced by the current design, kept for rollback).

Stock photography (hero and full-width band) is hotlinked from the Unsplash
CDN, which its licence allows. Both URLs are image slots, so they can be
swapped in Admin -> Custom Design without touching code.

## Re-applying after edits

```bash
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/pulse-survey-redesign/apply.mjs
```

Content tweaks do not need this script at all: every line of copy and every
image is a slot, editable in Admin -> Custom Design.

## Rolling back

The previous (first-generation) pages are exactly what `surveyLandingPage()`
and `surveyThanksPage()` in `lib/surveyTemplate.ts` return, so restoring them
is a matter of writing those two objects back into `config.customPages` for
scorecard 11. The interim "warm paper" design lives in this folder's git
history.

## Gotchas worth knowing

- `@import` in custom page CSS never works in production: the app injects the
  page CSS after a base rule, and browsers ignore any `@import` that is not
  at the very top of a stylesheet. That is why the display font loads with
  plain `@font-face` rules instead.
- The HTML sanitizer strips `<svg>` entirely. Icons therefore live in the
  CSS as `url("data:image/svg+xml,...")` backgrounds, which the CSS
  sanitizer allows.
