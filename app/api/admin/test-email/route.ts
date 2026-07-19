import { NextRequest, NextResponse } from 'next/server';
import { getSessionAccount, isAdmin } from '@/lib/server/auth';
import { getConfig } from '@/lib/server/config';
import { answersSummaryHtml, mergeFields, resultEmailFields, sendEmail, withEmailHeader } from '@/lib/server/email';
import { stripTags } from '@/lib/richtext';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// Sends a real result email to a chosen address using the scorecard's current
// email settings, and returns the provider's ACTUAL response — so failures
// (unverified sender/domain, bad key, restricted recipient) are visible in the
// UI instead of silently swallowed at completion time.
export async function POST(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const account = await getSessionAccount();
  const to = String(body.to ?? account?.email ?? '').trim();
  if (!/.+@.+\..+/.test(to)) {
    return NextResponse.json({ error: 'Enter a valid email address to send the test to.' }, { status: 400 });
  }

  const config = await getConfig();
  const re = config.resultEmail;
  if (!re) return NextResponse.json({ error: 'No result email configured.' }, { status: 400 });

  const fields = resultEmailFields(
    {
      first_name: 'Test',
      last_name: 'Lead',
      email: to,
      status: 'Completed',
      score: 72,
      scorecard_name: config.title,
      results_link: `${req.nextUrl.origin}/results/preview`,
      report_link: `${req.nextUrl.origin}/`,
      answers_summary: answersSummaryHtml(
        config.questions,
        Object.fromEntries(config.questions.map((q) => [q.id, q.max]))
      ),
    },
    config.branding.primaryColor
  );

  const result = await sendEmail({
    to: [to],
    subject: '[Test] ' + stripTags(mergeFields(re.subject || '{scorecard_name} Report', fields)),
    html: withEmailHeader(mergeFields(re.content || '<p>This is a test result email.</p>', fields), re.headerImage),
    fromAddress: re.fromAddress || undefined,
    fromName: re.fromName || undefined,
    replyTo: re.replyTo || undefined,
    apiKey: config.email?.apiKey,
  });

  if (result.sent) {
    return NextResponse.json({ ok: true, provider: result.provider, to });
  }
  return NextResponse.json(
    {
      error:
        result.provider === 'none'
          ? 'No email provider is connected. Add your Resend API key below (or set RESEND_API_KEY) and save first.'
          : `${result.provider} rejected the send: ${result.error || 'unknown error'}`,
      provider: result.provider,
      raw: result.error,
    },
    { status: 502 }
  );
}
