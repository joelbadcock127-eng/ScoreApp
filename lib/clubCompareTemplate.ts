import { CustomPage, ScorecardConfig } from './types';
import { sanitizeCustomPage } from './customPage';
import { clubSurveyConfig } from './surveyTemplate';
import {
  landingPage,
  thanksPage,
  inviteEmail,
  resultEmail,
  brandingPatch,
  questionColorsPatch,
  leadFormButtonColor,
  shareDescription,
} from '../scripts/pulse-survey-redesign/design.mjs';

// The club survey with the "How does your club compare?" landing page.
// Same 12 questions, lead form and survey mode as the club survey template;
// the pages, colours and emails come from the pulse survey design file, so a
// new scorecard gets the design without touching the live pulse survey.
// Pages are stored sanitised, exactly as the Custom Design editor saves them.
export function clubCompareConfig(name: string): ScorecardConfig {
  const base = clubSurveyConfig(name);
  return {
    ...base,
    landingMode: 'custom',
    resultsMode: 'custom',
    customPages: {
      // The design file is plain JS, so its slot types widen to string; the
      // sanitiser normalises every slot anyway.
      landing: sanitizeCustomPage(landingPage() as CustomPage),
      results: sanitizeCustomPage(thanksPage() as CustomPage),
    },
    branding: { ...base.branding, ...brandingPatch },
    leadForm: { ...base.leadForm, buttonColor: leadFormButtonColor },
    questionsPage: {
      ...base.questionsPage!,
      questions: { ...base.questionsPage!.questions, ...questionColorsPatch },
    },
    resultEmail: { ...base.resultEmail!, subject: resultEmail.subject, content: resultEmail.content },
    // Sender details stay blank for the owner to fill in under Distribution.
    inviteEmail: {
      fromAddress: '',
      fromName: '',
      replyTo: '',
      subject: inviteEmail.subject,
      content: inviteEmail.content,
      senderName: '',
      senderAddress: '',
    },
    shareAppearance: { ...base.shareAppearance!, description: shareDescription },
  };
}
