'use client';

/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Category,
  Question,
  QuestionType,
  QuestionsPageConfig,
  ScorecardConfig,
  ThemeConfig,
} from '@/lib/types';
import { questionType } from '@/lib/scoring';
import QuestionInput from '@/components/QuestionInput';
import EditableText from './EditableText';
import EditorShell, { Field, RailButton, Toggle, inputCls } from './EditorShell';

type Panel = 'questions' | 'categories' | 'sections' | 'theme' | 'settings';
type SectionKey = 'header' | 'questions' | 'progress' | 'footer';

const TYPE_LABELS: Record<QuestionType, string> = {
  linear: 'Linear Scale',
  yesno: 'Yes/No/Maybe',
  buttons: 'Multiple Choice Buttons',
  checkboxes: 'Multiple Choice Checkboxes',
  radio: 'Multiple Choice Radio Button',
  text: 'Open Text',
};

export default function QuestionsEditor({ initial }: { initial: ScorecardConfig }) {
  const [questions, setQuestions] = useState<Question[]>(initial.questions);
  const [categories, setCategories] = useState<Category[]>(initial.categories);
  const [theme, setTheme] = useState<ThemeConfig>(initial.theme);
  const [primary, setPrimary] = useState(initial.branding.primaryColor);
  const [secondary, setSecondary] = useState(initial.branding.secondaryColor);
  const [page, setPage] = useState<QuestionsPageConfig>(initial.questionsPage);
  const [panel, setPanel] = useState<Panel>('questions');
  const [qIndex, setQIndex] = useState(0);
  const [catIndex, setCatIndex] = useState(0);
  const [section, setSection] = useState<SectionKey>('questions');
  const [qTab, setQTab] = useState<'question' | 'answers'>('question');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const q = questions[qIndex];

  function mark<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setDirty(true);
    };
  }
  const setQs = mark(setQuestions);
  const setCats = mark(setCategories);
  const setTh = mark(setTheme);
  const setPg = mark(setPage);

  function updateQ(patch: Partial<Question>) {
    setQs(questions.map((x, i) => (i === qIndex ? { ...x, ...patch } : x)));
  }

  function changeType(type: QuestionType) {
    const patch: Partial<Question> = { type };
    if (['yesno', 'buttons', 'checkboxes', 'radio'].includes(type) && !(q.options ?? []).length) {
      patch.options =
        type === 'yesno'
          ? [
              { label: 'Yes', score: 5 },
              { label: 'No', score: 1 },
              { label: 'Maybe', score: 3 },
            ]
          : [
              { label: 'Option 1', score: 1 },
              { label: 'Option 2', score: 3 },
              { label: 'Option 3', score: 5 },
            ];
    }
    updateQ(patch);
  }

  function addQuestion() {
    const nq: Question = {
      id: `q${Date.now()}`,
      category: categories[0]?.key ?? 'marketing',
      text: 'New question',
      textHtml: 'New question',
      type: 'linear',
      required: true,
      min: 1,
      max: 5,
      start: 3,
      labels: { left: '', center: '', right: '' },
    };
    setQs([...questions, nq]);
    setQIndex(questions.length);
    setPanel('questions');
  }

  function move(arrSetter: typeof setQs, arr: Question[], i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    const copy = [...arr];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    arrSetter(copy);
    setQIndex(j);
  }

  function moveCat(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= categories.length) return;
    const copy = [...categories];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    setCats(copy);
    setCatIndex(j);
  }

  async function save() {
    setSaving(true);
    const res = await fetch('/api/admin/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questions,
        categories,
        theme,
        branding: { primaryColor: primary, secondaryColor: secondary },
        questionsPage: page,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setDirty(false);
      router.refresh();
    }
  }

  const type = q ? questionType(q) : 'linear';

  return (
    <EditorShell
      title={initial.title}
      crumb="Questions > Questions Flow"
      saving={saving}
      dirty={dirty}
      onSave={save}
    >
      {/* Icon rail */}
      <div className="w-[76px] flex-none space-y-1 overflow-y-auto border-r border-gray-200 bg-white p-2">
        <RailButton label="Add question" onClick={addQuestion}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </RailButton>
        <RailButton label="Questions" active={panel === 'questions'} onClick={() => setPanel('questions')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" strokeLinecap="round" />
          </svg>
        </RailButton>
        <RailButton label="Categories" active={panel === 'categories'} onClick={() => setPanel('categories')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="8" height="8" rx="1.5" />
            <rect x="13" y="3" width="8" height="8" rx="1.5" />
            <rect x="3" y="13" width="8" height="8" rx="1.5" />
            <rect x="13" y="13" width="8" height="8" rx="1.5" />
          </svg>
        </RailButton>
        <RailButton label="Sections" active={panel === 'sections'} onClick={() => setPanel('sections')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 7l8-4 8 4-8 4-8-4zM4 12l8 4 8-4M4 17l8 4 8-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </RailButton>
        <RailButton label="Theme" active={panel === 'theme'} onClick={() => setPanel('theme')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 3c-5 0-9 3.8-9 8.5S7 20 12 20c.9 0 1.5-.6 1.5-1.4 0-.5-.2-.8-.5-1.1-.3-.3-.5-.7-.5-1.1 0-.8.7-1.4 1.5-1.4H16c2.8 0 5-2.2 5-5C21 6 17 3 12 3z" />
            <path d="M7.5 11.5h.01M10.5 7.5h.01M14.5 7.5h.01M17 11h.01" strokeLinecap="round" />
          </svg>
        </RailButton>
        <RailButton label="Page Settings" active={panel === 'settings'} onClick={() => setPanel('settings')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 8h10M18 8h2M4 16h2M10 16h10M14 5.5v5M6 13.5v5" strokeLinecap="round" />
          </svg>
        </RailButton>
      </div>

      {/* Contextual panel */}
      <div className="w-[300px] flex-none overflow-y-auto border-r border-gray-200 bg-white">
        {panel === 'questions' && (
          <div className="p-4">
            <h2 className="mb-3 text-lg font-semibold">Questions</h2>
            <div className="space-y-1">
              {questions.map((question, i) => (
                <div
                  key={question.id}
                  onClick={() => setQIndex(i)}
                  className={`group flex cursor-pointer items-start gap-2 rounded-md px-2.5 py-2 text-sm ${
                    i === qIndex ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="flex-1">{question.text}</span>
                  <span className="hidden flex-none gap-1 group-hover:flex">
                    <button onClick={(e) => { e.stopPropagation(); move(setQs, questions, i, -1); }} className="text-muted hover:text-ink">↑</button>
                    <button onClick={(e) => { e.stopPropagation(); move(setQs, questions, i, 1); }} className="text-muted hover:text-ink">↓</button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQs(questions.filter((_, j) => j !== i));
                        setQIndex(Math.max(0, qIndex - (i <= qIndex ? 1 : 0)));
                      }}
                      className="text-muted hover:text-tier-low"
                    >
                      ✕
                    </button>
                  </span>
                </div>
              ))}
            </div>
            <button onClick={addQuestion} className="mt-3 text-sm font-medium text-primary hover:underline">
              + Add question
            </button>
            <div className="mt-6 border-t border-gray-200 pt-4">
              <p className="text-sm font-semibold">End logic</p>
              <p className="mt-2 text-sm text-muted">All users → Main Result Page</p>
            </div>
          </div>
        )}

        {panel === 'categories' && (
          <div className="p-4">
            <h2 className="mb-3 text-lg font-semibold">Categories</h2>
            <div className="space-y-1">
              {categories.map((c, i) => (
                <div
                  key={c.key}
                  onClick={() => setCatIndex(i)}
                  className={`group flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm ${
                    i === catIndex ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="flex-1">{c.label}</span>
                  <span className="hidden flex-none gap-1 group-hover:flex">
                    <button onClick={(e) => { e.stopPropagation(); moveCat(i, -1); }} className="text-muted hover:text-ink">↑</button>
                    <button onClick={(e) => { e.stopPropagation(); moveCat(i, 1); }} className="text-muted hover:text-ink">↓</button>
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                setCats([...categories, { key: `category-${Date.now()}`, label: 'New category', description: '' }]);
                setCatIndex(categories.length);
              }}
              className="mt-3 text-sm font-medium text-primary hover:underline"
            >
              + Add category
            </button>
          </div>
        )}

        {panel === 'sections' && (
          <div className="p-4">
            <h2 className="mb-3 text-lg font-semibold">Sections</h2>
            {(
              [
                { key: 'header', label: 'Header', show: page.header.show, toggle: (v: boolean) => setPg({ ...page, header: { ...page.header, show: v } }) },
                { key: 'questions', label: 'Questions', show: true, toggle: null },
                { key: 'progress', label: 'Progress', show: page.progress.show, toggle: (v: boolean) => setPg({ ...page, progress: { show: v } }) },
                { key: 'footer', label: 'Footer', show: page.footer.show, toggle: (v: boolean) => setPg({ ...page, footer: { show: v } }) },
              ] as { key: SectionKey; label: string; show: boolean; toggle: ((v: boolean) => void) | null }[]
            ).map((s) => (
              <div
                key={s.key}
                onClick={() => setSection(s.key)}
                className={`flex cursor-pointer items-center justify-between rounded-md px-2.5 py-2.5 text-sm ${
                  section === s.key ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'
                }`}
              >
                <span className={s.show ? '' : 'text-muted line-through'}>{s.label}</span>
                {s.toggle && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      s.toggle!(!s.show);
                    }}
                    aria-label={s.show ? `Hide ${s.label}` : `Show ${s.label}`}
                    className="text-muted hover:text-ink"
                  >
                    {s.show ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4.5 w-4.5 h-5 w-5">
                        <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                        <path d="M3 3l18 18M10.5 6a10 10 0 0 1 11 6 15 15 0 0 1-3.2 4M6.5 6.5A14 14 0 0 0 2.5 12s3.5 6.5 9.5 6.5a9 9 0 0 0 3.5-.7" strokeLinecap="round" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {panel === 'theme' && (
          <div className="p-4">
            <h2 className="mb-3 text-lg font-semibold">Theme settings</h2>
            <details open className="mb-3 rounded-lg border border-gray-200 p-3">
              <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide">Logos</summary>
              <div className="mt-3 space-y-3 text-sm">
                <div>
                  <p className="mb-1 text-muted">Main logo</p>
                  <img src={initial.branding.logoUrl} alt="logo" className="h-14 rounded border border-gray-200 bg-white p-1" />
                </div>
                <div>
                  <p className="mb-1 text-muted">Square icon</p>
                  <img src={initial.branding.iconUrl} alt="icon" className="h-12 w-12 rounded border border-gray-200 bg-white p-1" />
                </div>
                <a href="/admin/settings/branding" className="inline-block text-primary hover:underline">
                  Change in Branding settings →
                </a>
              </div>
            </details>
            <details open className="mb-3 rounded-lg border border-gray-200 p-3">
              <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide">Colours</summary>
              <div className="mt-3 space-y-3 text-sm">
                {(
                  [
                    ['Primary colour', primary, (v: string) => { setPrimary(v); setDirty(true); }],
                    ['Secondary colour', secondary, (v: string) => { setSecondary(v); setDirty(true); }],
                    ['Background colour', theme.backgroundColor, (v: string) => setTh({ ...theme, backgroundColor: v })],
                    ['Heading text colour', theme.headingColor, (v: string) => setTh({ ...theme, headingColor: v })],
                    ['Body text colour', theme.bodyColor, (v: string) => setTh({ ...theme, bodyColor: v })],
                  ] as [string, string, (v: string) => void][]
                ).map(([label, value, set]) => (
                  <div key={label} className="flex items-center justify-between gap-2">
                    <span>{label}</span>
                    <span className="flex items-center gap-1.5">
                      <input type="color" value={value} onChange={(e) => set(e.target.value)} className="h-7 w-9 cursor-pointer rounded border border-gray-300" />
                      <code className="text-xs text-muted">{value}</code>
                    </span>
                  </div>
                ))}
              </div>
            </details>
            <details open className="rounded-lg border border-gray-200 p-3">
              <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide">Typography</summary>
              <div className="mt-3 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span>Heading</span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-muted">{theme.headingFont},</span>
                    <input
                      type="number"
                      value={theme.headingSize}
                      min={20}
                      max={96}
                      onChange={(e) => setTh({ ...theme, headingSize: Number(e.target.value) })}
                      className="w-16 rounded border border-gray-300 px-2 py-1"
                    />
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span>Body text</span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-muted">{theme.bodyFont},</span>
                    <input
                      type="number"
                      value={theme.bodySize}
                      min={10}
                      max={32}
                      onChange={(e) => setTh({ ...theme, bodySize: Number(e.target.value) })}
                      className="w-16 rounded border border-gray-300 px-2 py-1"
                    />
                  </span>
                </div>
              </div>
            </details>
          </div>
        )}

        {panel === 'settings' && (
          <div className="p-4">
            <h2 className="mb-3 text-lg font-semibold">Page Settings</h2>
            <Field label="Question align">
              <select
                value={page.questions.align}
                onChange={(e) => setPg({ ...page, questions: { ...page.questions, align: e.target.value as 'left' | 'center' } })}
                className={inputCls}
              >
                <option value="center">Center</option>
                <option value="left">Left</option>
              </select>
            </Field>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium">Show Back button</p>
              <Toggle checked={page.questions.showBack} onChange={(v) => setPg({ ...page, questions: { ...page.questions, showBack: v } })} />
            </div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium">Show Category Name</p>
              <Toggle checked={page.questions.showCategoryName} onChange={(v) => setPg({ ...page, questions: { ...page.questions, showCategoryName: v } })} />
            </div>
          </div>
        )}
      </div>

      {/* Center preview */}
      <div className="min-w-0 flex-1 overflow-y-auto p-4">
        <div className="mx-auto flex min-h-full max-w-4xl flex-col rounded-lg bg-white shadow-card" style={{ backgroundColor: theme.backgroundColor }}>
          {page.header.show && (
            <header
              className={`flex py-6 ${
                page.header.alignment === 'left' ? 'justify-start pl-8' : page.header.alignment === 'right' ? 'justify-end pr-8' : 'justify-center'
              } ${panel === 'sections' && section === 'header' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => { setPanel('sections'); setSection('header'); }}
            >
              <img src={initial.branding.logoUrl} alt="Logo" style={{ maxWidth: page.header.logoMaxWidth, maxHeight: 96 }} />
            </header>
          )}
          <div className="flex flex-1 flex-col justify-center px-8 pb-12">
            {q ? (
              <>
                {page.questions.showBack && (
                  <p className="mb-6 text-center text-base" style={{ color: theme.headingColor }}>← BACK</p>
                )}
                {page.questions.showCategoryName && (
                  <p className="mb-2 text-center text-sm font-semibold uppercase tracking-wide text-muted">
                    {categories.find((c) => c.key === q.category)?.label}
                  </p>
                )}
                {q.showInstruction && (
                  <p className={`mb-3 ${page.questions.align === 'left' ? 'text-left' : 'text-center'} text-base`} style={{ color: secondary }}>
                    {q.instruction || 'Instruction text…'}
                  </p>
                )}
                <EditableText
                  html={q.textHtml || q.text}
                  onChange={(html) => updateQ({ textHtml: html, text: html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() })}
                  className={`${page.questions.align === 'left' ? 'text-left' : 'text-center'} text-3xl font-medium leading-snug md:text-4xl`}
                  style={{ color: secondary }}
                />
                <QuestionInput question={q} value={undefined} onChange={() => {}} optionColor={secondary} />
                <button className="mx-auto mt-10 w-full max-w-xs rounded-md py-3.5 text-lg font-medium text-white" style={{ backgroundColor: primary }}>
                  Next
                </button>
              </>
            ) : (
              <p className="text-center text-muted">No questions — add one from the rail.</p>
            )}
          </div>
          {page.progress.show && (
            <div
              className={`bg-gray-100 px-6 py-4 ${panel === 'sections' && section === 'progress' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => { setPanel('sections'); setSection('progress'); }}
            >
              <p className="text-center text-lg" style={{ color: theme.headingColor }}>50% Complete</p>
              <div className="mx-auto mt-2 h-1.5 w-full max-w-xs rounded-full bg-blue-200">
                <div className="h-1.5 w-1/2 rounded-full" style={{ backgroundColor: primary }} />
              </div>
            </div>
          )}
          {page.footer.show && (
            <footer
              className={`flex items-center justify-between px-8 py-6 ${panel === 'sections' && section === 'footer' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => { setPanel('sections'); setSection('footer'); }}
            >
              <img src={initial.branding.logoUrl} alt="Logo" className="h-12 w-auto" />
              <p className="text-muted">{initial.copyright}</p>
            </footer>
          )}
        </div>
      </div>

      {/* Right settings pane */}
      <div className="w-[300px] flex-none overflow-y-auto border-l border-gray-200 bg-white p-4">
        {panel === 'questions' && q && (
          <>
            <div className="mb-4 flex gap-6 border-b border-gray-200 text-sm font-medium">
              {(['question', 'answers'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setQTab(t)}
                  className={`border-b-2 pb-2 uppercase tracking-wide ${
                    qTab === t ? 'border-primary text-primary' : 'border-transparent text-muted'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {qTab === 'question' ? (
              <>
                <Field label="">
                  <select value={type} onChange={(e) => changeType(e.target.value as QuestionType)} className={inputCls}>
                    {Object.entries(TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </Field>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-medium">Show instruction</p>
                  <Toggle checked={Boolean(q.showInstruction)} onChange={(v) => updateQ({ showInstruction: v })} />
                </div>
                {q.showInstruction && (
                  <Field label="Instruction">
                    <input value={q.instruction ?? ''} onChange={(e) => updateQ({ instruction: e.target.value })} className={inputCls} />
                  </Field>
                )}
                {type === 'linear' && (
                  <>
                    <Field label="Score range">
                      <div className="flex items-center gap-2">
                        <input type="number" value={q.min} min={0} max={9} onChange={(e) => updateQ({ min: Number(e.target.value) })} className={inputCls} />
                        <span className="text-sm text-muted">to</span>
                        <input type="number" value={q.max} min={1} max={10} onChange={(e) => updateQ({ max: Number(e.target.value) })} className={inputCls} />
                      </div>
                    </Field>
                    <Field label="Starting score">
                      <input type="number" value={q.start} min={q.min} max={q.max} onChange={(e) => updateQ({ start: Number(e.target.value) })} className={inputCls} />
                    </Field>
                  </>
                )}
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-medium">Required</p>
                  <Toggle checked={q.required !== false} onChange={(v) => updateQ({ required: v })} />
                </div>
                {type === 'linear' && (
                  <div className="border-t border-gray-200 pt-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Labels</p>
                    {(['left', 'center', 'right'] as const).map((pos) => (
                      <Field key={pos} label={pos[0].toUpperCase() + pos.slice(1)}>
                        <input
                          value={q.labels[pos]}
                          onChange={(e) => updateQ({ labels: { ...q.labels, [pos]: e.target.value } })}
                          className={inputCls}
                        />
                      </Field>
                    ))}
                  </div>
                )}
                {type !== 'linear' && type !== 'text' && (
                  <div className="border-t border-gray-200 pt-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Options & scores</p>
                    {(q.options ?? []).map((o, i) => (
                      <div key={i} className="mb-2 flex items-center gap-2">
                        <input
                          value={o.label}
                          onChange={(e) =>
                            updateQ({ options: (q.options ?? []).map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })
                          }
                          className={inputCls}
                        />
                        <input
                          type="number"
                          value={o.score}
                          min={0}
                          onChange={(e) =>
                            updateQ({ options: (q.options ?? []).map((x, j) => (j === i ? { ...x, score: Number(e.target.value) } : x)) })
                          }
                          className="w-16 rounded-md border border-gray-300 px-2 py-2 text-sm outline-none focus:border-primary"
                        />
                        <button
                          onClick={() => updateQ({ options: (q.options ?? []).filter((_, j) => j !== i) })}
                          className="text-muted hover:text-tier-low"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => updateQ({ options: [...(q.options ?? []), { label: `Option ${(q.options ?? []).length + 1}`, score: 0 }] })}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      + Add option
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Answer</p>
                <Field label="Scoring category">
                  <select value={q.category} onChange={(e) => updateQ({ category: e.target.value })} className={inputCls}>
                    {categories.map((c) => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </Field>
                <button
                  onClick={() => {
                    setCats([...categories, { key: `category-${Date.now()}`, label: 'New category', description: '' }]);
                    setPanel('categories');
                    setCatIndex(categories.length);
                  }}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  + Add scoring category
                </button>
              </>
            )}
          </>
        )}

        {panel === 'categories' && categories[catIndex] && (
          <>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Category</p>
            <Field label="Name">
              <input
                value={categories[catIndex].label}
                onChange={(e) => setCats(categories.map((c, i) => (i === catIndex ? { ...c, label: e.target.value } : c)))}
                className={inputCls}
              />
            </Field>
            <Field label="Description">
              <textarea
                value={categories[catIndex].description ?? ''}
                rows={3}
                onChange={(e) => setCats(categories.map((c, i) => (i === catIndex ? { ...c, description: e.target.value } : c)))}
                className={inputCls}
              />
            </Field>
            <button
              onClick={() => {
                if (categories.length <= 1) return;
                setCats(categories.filter((_, i) => i !== catIndex));
                setCatIndex(0);
              }}
              disabled={categories.length <= 1}
              className="mt-2 rounded-md border border-tier-low px-4 py-2 text-sm font-medium text-tier-low hover:bg-red-50 disabled:opacity-40"
            >
              Remove Category
            </button>
            <p className="mt-3 text-xs text-muted">
              {`Questions in this category: ${questions.filter((x) => x.category === categories[catIndex].key).length}`}
            </p>
          </>
        )}

        {panel === 'sections' && (
          <>
            {section === 'header' && (
              <>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Header</p>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-medium">Show header</p>
                  <Toggle checked={page.header.show} onChange={(v) => setPg({ ...page, header: { ...page.header, show: v } })} />
                </div>
                <Field label="Logo max-width (px)">
                  <input
                    type="number"
                    value={page.header.logoMaxWidth}
                    min={60}
                    max={600}
                    onChange={(e) => setPg({ ...page, header: { ...page.header, logoMaxWidth: Number(e.target.value) } })}
                    className={inputCls}
                  />
                </Field>
                <Field label="Logo alignment">
                  <select
                    value={page.header.alignment}
                    onChange={(e) => setPg({ ...page, header: { ...page.header, alignment: e.target.value as 'left' | 'center' | 'right' } })}
                    className={inputCls}
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </Field>
              </>
            )}
            {section === 'questions' && (
              <>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Question styles</p>
                <Field label="Question align">
                  <select
                    value={page.questions.align}
                    onChange={(e) => setPg({ ...page, questions: { ...page.questions, align: e.target.value as 'left' | 'center' } })}
                    className={inputCls}
                  >
                    <option value="center">Center</option>
                    <option value="left">Left</option>
                  </select>
                </Field>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-medium">Show Back button</p>
                  <Toggle checked={page.questions.showBack} onChange={(v) => setPg({ ...page, questions: { ...page.questions, showBack: v } })} />
                </div>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-medium">Show Category Name</p>
                  <Toggle checked={page.questions.showCategoryName} onChange={(v) => setPg({ ...page, questions: { ...page.questions, showCategoryName: v } })} />
                </div>
                <Field label="Background colour">
                  <input
                    type="color"
                    value={theme.backgroundColor === 'transparent' ? '#ffffff' : theme.backgroundColor}
                    onChange={(e) => setTh({ ...theme, backgroundColor: e.target.value })}
                    className="h-9 w-12 cursor-pointer rounded border border-gray-300"
                  />
                </Field>
              </>
            )}
            {section === 'progress' && (
              <>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Progress</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Show progress bar</p>
                  <Toggle checked={page.progress.show} onChange={(v) => setPg({ ...page, progress: { show: v } })} />
                </div>
              </>
            )}
            {section === 'footer' && (
              <>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Footer</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Show footer</p>
                  <Toggle checked={page.footer.show} onChange={(v) => setPg({ ...page, footer: { show: v } })} />
                </div>
              </>
            )}
          </>
        )}

        {(panel === 'theme' || panel === 'settings') && (
          <p className="text-sm text-muted">Changes preview live in the centre. Hit Save to apply to the live scorecard.</p>
        )}
      </div>
    </EditorShell>
  );
}
