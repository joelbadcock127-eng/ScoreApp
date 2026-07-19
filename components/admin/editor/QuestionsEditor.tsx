'use client';

/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Question,
  QuestionOption,
  QuestionType,
  QuestionsPageConfig,
  ScorecardConfig,
} from '@/lib/types';
import { stripTags } from '@/lib/richtext';
import { DEFAULT_QUESTIONS_PAGE, defaultOptionsFor } from '@/components/QuizFlow';
import {
  ColorField,
  EyeIcon,
  FieldLabel,
  FieldRow,
  RailButton,
  RichText,
  SelectInput,
  SliderField,
  TextInput,
  Toggle,
  TrashIcon,
} from './ui';
import ThemePanel from './ThemePanel';
import TopBar from './TopBar';

type Rail = 'questions' | 'categories' | 'sections' | 'theme' | 'page';
type Section = 'header' | 'questions' | 'progress' | 'footer';

const TYPE_LABELS: { value: QuestionType; label: string }[] = [
  { value: 'scale', label: 'Linear Scale' },
  { value: 'yes_no', label: 'Yes/No/Maybe' },
  { value: 'buttons', label: 'Multiple Choice Buttons' },
  { value: 'checkboxes', label: 'Multiple Choice Checkboxes' },
  { value: 'radio', label: 'Multiple Choice Radio Button' },
  { value: 'text', label: 'Open Text' },
];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'category';
}

// ScoreApp-style full-screen questions editor: icon rail, question list,
// live preview in the middle and editable fields on the right.
export default function QuestionsEditor({ initialConfig }: { initialConfig: ScorecardConfig }) {
  const router = useRouter();
  const [config, setConfig] = useState<ScorecardConfig>({
    ...initialConfig,
    questionsPage: initialConfig.questionsPage ?? DEFAULT_QUESTIONS_PAGE,
  });
  const [rail, setRail] = useState<Rail>('questions');
  const [selQ, setSelQ] = useState(config.questions[0]?.id ?? '');
  const [selCat, setSelCat] = useState(config.categories[0]?.key ?? '');
  const [selSection, setSelSection] = useState<Section>('questions');
  const [rightTab, setRightTab] = useState<'question' | 'answers'>('question');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [panelWidth, setPanelWidth] = useState(330);

  // Drag the divider next to the questions list to widen/narrow the panel.
  function startPanelResize(e: React.MouseEvent) {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = panelWidth;
    function onMove(ev: MouseEvent) {
      setPanelWidth(Math.min(640, Math.max(240, startWidth + ev.clientX - startX)));
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  const page = config.questionsPage!;
  const q = config.questions.find((x) => x.id === selQ) ?? config.questions[0];
  const type: QuestionType = q?.type ?? 'scale';
  const category = config.categories.find((c) => c.key === selCat) ?? config.categories[0];

  function patch(p: Partial<ScorecardConfig>) {
    setConfig((c) => ({ ...c, ...p }));
    setDirty(true);
  }
  function patchQuestion(id: string, p: Partial<Question>) {
    patch({ questions: config.questions.map((x) => (x.id === id ? { ...x, ...p } : x)) });
  }
  function patchPage(p: Partial<QuestionsPageConfig>) {
    patch({ questionsPage: { ...page, ...p } });
  }

  function addQuestion() {
    const id = `q${Date.now().toString(36)}`;
    const nq: Question = {
      id,
      category: config.categories[0]?.key ?? '',
      type: 'scale',
      text: 'New question',
      min: 1,
      max: 5,
      start: 3,
      labels: { left: '', center: '', right: '' },
    };
    patch({ questions: [...config.questions, nq] });
    setSelQ(id);
    setRail('questions');
    setRightTab('question');
  }

  function removeQuestion(id: string) {
    if (config.questions.length <= 1) return alert('Keep at least one question.');
    if (!confirm('Delete this question?')) return;
    const rest = config.questions.filter((x) => x.id !== id);
    patch({ questions: rest });
    if (selQ === id) setSelQ(rest[0].id);
  }

  function moveQuestion(from: number, to: number) {
    if (to < 0 || to >= config.questions.length || from === to) return;
    const list = [...config.questions];
    const [item] = list.splice(from, 1);
    list.splice(to, 0, item);
    patch({ questions: list });
  }

  function addCategory(assignToCurrent = false) {
    const label = prompt('New scoring category name');
    if (!label) return;
    const key = slugify(label);
    if (config.categories.some((c) => c.key === key)) return alert('That category already exists.');
    const cats = [...config.categories, { key, label }];
    patch({ categories: cats, ...(assignToCurrent && q ? { questions: config.questions.map((x) => (x.id === q.id ? { ...x, category: key } : x)) } : {}) });
    setSelCat(key);
  }

  function removeCategory(key: string) {
    if (config.questions.some((x) => x.category === key))
      return alert('This category still has questions assigned to it. Move them first.');
    if (config.categories.length <= 1) return alert('Keep at least one category.');
    const rest = config.categories.filter((c) => c.key !== key);
    patch({ categories: rest });
    if (selCat === key) setSelCat(rest[0].key);
  }

  function moveCategory(from: number, to: number) {
    if (to < 0 || to >= config.categories.length || from === to) return;
    const list = [...config.categories];
    const [item] = list.splice(from, 1);
    list.splice(to, 0, item);
    patch({ categories: list });
  }

  async function save() {
    setSaving(true);
    const res = await fetch('/api/admin/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: config.title,
        copyright: config.copyright,
        branding: config.branding,
        questions: config.questions,
        categories: config.categories,
        questionsPage: config.questionsPage,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setDirty(false);
      router.refresh();
    } else {
      alert('Save failed.');
    }
  }

  const options: QuestionOption[] = q?.options && q.options.length ? q.options : defaultOptionsFor(type);
  const alignClass =
    page.questions.align === 'left' ? 'text-left' : page.questions.align === 'right' ? 'text-right' : 'text-center';
  const headerJustify =
    page.header.align === 'left' ? 'justify-start' : page.header.align === 'right' ? 'justify-end' : 'justify-center';

  const sectionOutline = (s: Section) =>
    rail === 'sections'
      ? `cursor-pointer ${selSection === s ? 'outline outline-2 outline-primary' : 'outline outline-1 outline-transparent hover:outline-primary/40'}`
      : '';

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-gray-100">
      <TopBar
        title={config.title}
        content="questions"
        device={device}
        setDevice={setDevice}
        dirty={dirty}
        saving={saving}
        onSave={save}
      />

      <div className="flex min-h-0 flex-1">
        {/* Icon rail */}
        <div className="flex w-[72px] flex-none flex-col items-center gap-1 border-r border-gray-200 bg-white py-3">
          <RailButton label="Add question" onClick={addQuestion}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-5 w-5">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </RailButton>
          <RailButton label="Questions" active={rail === 'questions'} onClick={() => setRail('questions')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-5 w-5">
              <path d="M9 6h11M9 12h11M9 18h11" />
              <path d="M4 5l1-1v4M3.5 11h2l-2 3h2" />
              <circle cx="4.5" cy="18" r="1" />
            </svg>
          </RailButton>
          <RailButton label="Categories" active={rail === 'categories'} onClick={() => setRail('categories')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <path d="M4 10h16M10 10v10" />
            </svg>
          </RailButton>
          <RailButton label="Sections" active={rail === 'sections'} onClick={() => setRail('sections')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" className="h-5 w-5">
              <path d="M12 3 3 8l9 5 9-5-9-5Z" />
              <path d="m3 13 9 5 9-5" />
            </svg>
          </RailButton>
          <RailButton label="Theme" active={rail === 'theme'} onClick={() => setRail('theme')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <path d="M12 21a9 9 0 1 1 9-9c0 2.5-1.5 3.5-3 3.5h-2a2.5 2.5 0 0 0-2 4c.4.6 0 1.5-2 1.5Z" />
            </svg>
          </RailButton>
          <RailButton label="Page Settings" active={rail === 'page'} onClick={() => setRail('page')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-5 w-5">
              <path d="M4 7h16M4 12h16M4 17h16" />
              <circle cx="9" cy="7" r="1.8" fill="white" />
              <circle cx="15" cy="12" r="1.8" fill="white" />
              <circle cx="7" cy="17" r="1.8" fill="white" />
            </svg>
          </RailButton>
        </div>

        {/* Panel column (resizable via the divider on its right edge) */}
        <div className="flex flex-none flex-col bg-white" style={{ width: panelWidth }}>
          {rail === 'questions' && (
            <>
              <p className="flex-none px-5 pb-2 pt-4 text-lg font-semibold">Questions</p>
              <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
                {config.questions.map((item, i) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => setDragIdx(i)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (dragIdx != null) moveQuestion(dragIdx, i);
                      setDragIdx(null);
                    }}
                    onClick={() => {
                      setSelQ(item.id);
                      setRightTab('question');
                    }}
                    className={`group flex cursor-pointer items-start gap-2 rounded-md px-2 py-2 text-[13.5px] leading-snug ${
                      item.id === selQ ? 'bg-gray-200/70' : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="mt-1 flex-none cursor-grab text-muted" aria-hidden>
                      ⠿
                    </span>
                    <span className="min-w-0 flex-1">{stripTags(item.text) || 'Untitled question'}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeQuestion(item.id);
                      }}
                      className="hidden flex-none text-muted hover:text-tier-low group-hover:block"
                      aria-label="Delete question"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex-none border-t border-gray-200 px-5 py-4">
                <p className="font-semibold">End logic</p>
                <p className="mt-2 text-sm text-muted">All users</p>
                <p className="mt-1 text-sm font-medium">
                  {config.mode === 'survey' ? 'Thank You Page (survey mode)' : 'Main Result Page'}
                </p>
              </div>
            </>
          )}

          {rail === 'categories' && (
            <>
              <p className="flex-none px-5 pb-2 pt-4 text-lg font-semibold">Categories</p>
              <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
                {config.categories.map((c, i) => (
                  <div
                    key={c.key}
                    draggable
                    onDragStart={() => setDragIdx(i)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (dragIdx != null) moveCategory(dragIdx, i);
                      setDragIdx(null);
                    }}
                    onClick={() => setSelCat(c.key)}
                    className={`group flex cursor-pointer items-center gap-2 rounded-md px-3 py-2.5 text-sm ${
                      c.key === selCat ? 'bg-gray-200/70' : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="flex-none cursor-grab text-muted" aria-hidden>
                      ⠿
                    </span>
                    <span className="min-w-0 flex-1">{c.label}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCategory(c.key);
                      }}
                      className="hidden flex-none text-muted hover:text-tier-low group-hover:block"
                      aria-label="Delete category"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addCategory(false)}
                  className="mt-2 flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:underline"
                >
                  ⊕ Add category
                </button>
              </div>
            </>
          )}

          {rail === 'sections' && (
            <>
              <p className="flex-none px-5 pb-2 pt-4 text-lg font-semibold">Sections</p>
              <div className="px-3">
                {(
                  [
                    { key: 'header' as Section, label: 'Header', show: page.header.show, toggleable: true },
                    { key: 'questions' as Section, label: 'Questions', show: true, toggleable: false },
                    { key: 'progress' as Section, label: 'Progress', show: page.progress.show, toggleable: true },
                    { key: 'footer' as Section, label: 'Footer', show: page.footer.show, toggleable: true },
                  ]
                ).map((s) => (
                  <div
                    key={s.key}
                    onClick={() => setSelSection(s.key)}
                    className={`flex cursor-pointer items-center justify-between rounded-md px-3 py-2.5 text-sm ${
                      selSection === s.key ? 'bg-gray-200/70' : 'hover:bg-gray-100'
                    } ${s.show ? '' : 'text-muted'}`}
                  >
                    <span>{s.label}</span>
                    {s.toggleable && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (s.key === 'header') patchPage({ header: { ...page.header, show: !page.header.show } });
                          if (s.key === 'progress') patchPage({ progress: { show: !page.progress.show } });
                          if (s.key === 'footer') patchPage({ footer: { show: !page.footer.show } });
                        }}
                        className="text-muted hover:text-ink"
                        aria-label={s.show ? `Hide ${s.label}` : `Show ${s.label}`}
                        title={s.show ? 'Hide section' : 'Show section'}
                      >
                        <EyeIcon off={!s.show} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {rail === 'theme' && (
            <ThemePanel
              branding={config.branding}
              onChange={(b) => patch({ branding: b })}
            />
          )}

          {rail === 'page' && (
            <div className="overflow-y-auto px-5 py-4">
              <p className="text-lg font-semibold">Page Settings</p>
              <FieldLabel>Scorecard title</FieldLabel>
              <TextInput value={config.title} onChange={(e) => patch({ title: e.target.value })} />
              <FieldLabel>Copyright</FieldLabel>
              <TextInput value={config.copyright} onChange={(e) => patch({ copyright: e.target.value })} />
            </div>
          )}
        </div>

        {/* Resize handle */}
        <div
          onMouseDown={startPanelResize}
          title="Drag to resize"
          className="w-1 flex-none cursor-col-resize border-l border-gray-200 transition hover:bg-primary/30 active:bg-primary/40"
        />

        {/* Preview */}
        <div className="min-w-0 flex-1 overflow-y-auto p-5">
          <div
            className={`mx-auto flex min-h-full flex-col shadow-card ${device === 'mobile' ? 'max-w-[400px]' : 'max-w-5xl'}`}
            style={{ backgroundColor: page.questions.backgroundColor }}
          >
            {page.header.show && (
              <div
                onClick={() => rail === 'sections' && setSelSection('header')}
                className={`flex px-6 ${headerJustify} ${sectionOutline('header')}`}
                style={{ paddingTop: page.header.topMargin, paddingBottom: page.header.bottomMargin }}
              >
                <img
                  src={config.branding.logoUrl}
                  alt=""
                  className="h-20 w-auto object-contain"
                  style={{ maxWidth: page.header.maxWidth }}
                />
              </div>
            )}

            <div
              onClick={() => rail === 'sections' && setSelSection('questions')}
              className={`mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-12 ${sectionOutline('questions')}`}
            >
              {page.questions.showBack && (
                <p className="mb-6 flex items-center justify-center gap-2 text-base" style={{ color: page.questions.optionTextColor }}>
                  <span aria-hidden>←</span> BACK
                </p>
              )}
              {page.questions.showCategory && q && (
                <p className={`mb-2 text-sm font-semibold uppercase tracking-widest text-muted ${alignClass}`}>
                  {config.categories.find((c) => c.key === q.category)?.label}
                </p>
              )}
              {q?.instruction != null && (
                <p className={`mb-3 text-base text-muted ${alignClass}`}>{q.instruction || 'Instruction text'}</p>
              )}

              {q && rail === 'questions' ? (
                <RichText
                  value={q.text}
                  onChange={(html) => patchQuestion(q.id, { text: html })}
                  className={`${alignClass} border border-dashed border-primary/40 px-2 py-1 text-3xl font-medium leading-snug md:text-4xl`}
                  style={{ color: page.questions.questionTextColor }}
                />
              ) : (
                q && (
                  <h1
                    className={`${alignClass} text-3xl font-medium leading-snug md:text-4xl`}
                    style={{ color: page.questions.questionTextColor }}
                    dangerouslySetInnerHTML={{ __html: q.text }}
                  />
                )
              )}

              {/* Answer preview */}
              {q && type === 'scale' && (
                <div className="mx-auto mt-12 w-full max-w-2xl">
                  <div className="flex items-start justify-between">
                    {Array.from({ length: q.max - q.min + 1 }, (_, i) => q.min + i).map((v) => (
                      <div key={v} className="flex w-1/5 flex-col items-center gap-2">
                        <span className="text-lg" style={{ color: page.questions.optionTextColor }}>
                          {v}
                        </span>
                        <span
                          className="flex h-7 w-7 items-center justify-center rounded-full border-2"
                          style={{ borderColor: page.questions.buttonColor }}
                        >
                          {v === q.start && (
                            <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: page.questions.buttonColor }} />
                          )}
                        </span>
                        <span
                          className="min-h-[2.5rem] px-1 text-center text-base leading-tight"
                          style={{ color: page.questions.optionTextColor }}
                        >
                          {v === q.min ? q.labels.left : v === q.max ? q.labels.right : v === Math.ceil((q.min + q.max) / 2) ? q.labels.center : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {q && (type === 'yes_no' || type === 'buttons') && (
                <div className="mx-auto mt-12 flex w-full max-w-md flex-col gap-3">
                  {options.map((o, i) => (
                    <div
                      key={i}
                      className="rounded-lg border-2 px-6 py-3.5 text-center text-lg font-medium"
                      style={
                        i === 0
                          ? { backgroundColor: page.questions.buttonColor, borderColor: page.questions.buttonColor, color: '#fff' }
                          : { borderColor: page.questions.buttonColor, color: page.questions.optionTextColor }
                      }
                    >
                      {o.label}
                    </div>
                  ))}
                </div>
              )}
              {q && (type === 'radio' || type === 'checkboxes') && (
                <div className="mx-auto mt-12 flex w-full max-w-md flex-col gap-4">
                  {options.map((o, i) => (
                    <div key={i} className="flex items-center gap-3 text-lg" style={{ color: page.questions.optionTextColor }}>
                      <span
                        className={`flex h-6 w-6 flex-none items-center justify-center border-2 ${type === 'radio' ? 'rounded-full' : 'rounded-md'}`}
                        style={{
                          borderColor: page.questions.buttonColor,
                          backgroundColor: type === 'checkboxes' && i === 0 ? page.questions.buttonColor : 'transparent',
                        }}
                      >
                        {type === 'radio' && i === 0 && (
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: page.questions.buttonColor }} />
                        )}
                        {type === 'checkboxes' && i === 0 && (
                          <svg viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="2.5" className="h-4 w-4">
                            <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      {o.label}
                    </div>
                  ))}
                </div>
              )}
              {q && type === 'text' && (
                <div className="mx-auto mt-12 w-full max-w-xl rounded-lg border-2 border-gray-300 p-4 text-lg text-muted">
                  Type your answer…
                </div>
              )}

              <div
                className="mx-auto mt-10 w-full max-w-xs rounded-md py-3.5 text-center text-lg font-medium text-white"
                style={{ backgroundColor: page.questions.buttonColor }}
              >
                Next
              </div>
            </div>

            {page.progress.show && (
              <div
                onClick={() => rail === 'sections' && setSelSection('progress')}
                className={`bg-gray-100 px-6 py-4 ${sectionOutline('progress')}`}
              >
                <p className="text-center text-lg text-ink">50% Complete</p>
                <div className="mx-auto mt-2 h-1.5 w-full max-w-xs rounded-full bg-blue-200">
                  <div className="h-1.5 w-1/2 rounded-full" style={{ backgroundColor: page.questions.buttonColor }} />
                </div>
              </div>
            )}
            {page.footer.show && (
              <div
                onClick={() => rail === 'sections' && setSelSection('footer')}
                className={`flex items-center justify-between border-t border-gray-200 bg-white px-8 py-5 ${sectionOutline('footer')}`}
              >
                <img src={config.branding.logoUrl} alt="" className="h-10 w-auto object-contain" />
                <span className="text-sm text-muted">{config.copyright}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right pane */}
        <div className="w-[300px] flex-none overflow-y-auto border-l border-gray-200 bg-white px-5 py-4">
          {rail === 'questions' && q && (
            <>
              <div className="flex gap-5 border-b border-gray-200 pb-2 text-sm font-semibold uppercase tracking-wide">
                <button
                  onClick={() => setRightTab('question')}
                  className={rightTab === 'question' ? 'text-ink' : 'text-muted hover:text-ink'}
                >
                  Question
                </button>
                <button
                  onClick={() => setRightTab('answers')}
                  className={rightTab === 'answers' ? 'text-ink' : 'text-muted hover:text-ink'}
                >
                  Answers
                </button>
              </div>

              {rightTab === 'question' ? (
                <div className="pb-8">
                  <FieldLabel>Answer type</FieldLabel>
                  <SelectInput
                    value={type}
                    onChange={(e) => {
                      const t = e.target.value as QuestionType;
                      patchQuestion(q.id, {
                        type: t,
                        options:
                          t === 'scale' || t === 'text'
                            ? q.options
                            : q.options && q.options.length
                              ? q.options
                              : defaultOptionsFor(t),
                      });
                    }}
                  >
                    {TYPE_LABELS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </SelectInput>

                  <FieldRow label="Show instruction">
                    <Toggle
                      on={q.instruction != null}
                      onChange={(on) => patchQuestion(q.id, { instruction: on ? '' : undefined })}
                      label="Show instruction"
                    />
                  </FieldRow>
                  {q.instruction != null && (
                    <TextInput
                      value={q.instruction}
                      placeholder="Instruction text"
                      onChange={(e) => patchQuestion(q.id, { instruction: e.target.value })}
                    />
                  )}

                  {type === 'scale' && (
                    <>
                      <FieldLabel>Score range</FieldLabel>
                      <div className="flex items-center gap-2">
                        <TextInput
                          type="number"
                          value={q.min}
                          onChange={(e) => patchQuestion(q.id, { min: Number(e.target.value) })}
                        />
                        <span className="text-sm text-muted">to</span>
                        <TextInput
                          type="number"
                          value={q.max}
                          onChange={(e) => patchQuestion(q.id, { max: Number(e.target.value) })}
                        />
                      </div>
                      <FieldLabel>Starting score</FieldLabel>
                      <TextInput
                        type="number"
                        value={q.start}
                        onChange={(e) => patchQuestion(q.id, { start: Number(e.target.value) })}
                      />
                    </>
                  )}

                  <FieldRow label="Required">
                    <Toggle
                      on={q.required ?? type === 'scale'}
                      onChange={(on) => patchQuestion(q.id, { required: on })}
                      label="Required"
                    />
                  </FieldRow>
                  <FieldRow label="Jump to">
                    <Toggle on={false} onChange={() => alert('Jump logic is on the roadmap.')} label="Jump to" />
                  </FieldRow>

                  {type === 'scale' && (
                    <>
                      <p className="mt-6 border-t border-gray-200 pt-4 text-xs font-semibold uppercase tracking-wide text-muted">
                        Labels
                      </p>
                      <FieldLabel>Left</FieldLabel>
                      <TextInput
                        value={q.labels.left}
                        onChange={(e) => patchQuestion(q.id, { labels: { ...q.labels, left: e.target.value } })}
                      />
                      <FieldLabel>Center</FieldLabel>
                      <TextInput
                        value={q.labels.center}
                        onChange={(e) => patchQuestion(q.id, { labels: { ...q.labels, center: e.target.value } })}
                      />
                      <FieldLabel>Right</FieldLabel>
                      <TextInput
                        value={q.labels.right}
                        onChange={(e) => patchQuestion(q.id, { labels: { ...q.labels, right: e.target.value } })}
                      />
                    </>
                  )}

                  {type !== 'scale' && type !== 'text' && (
                    <>
                      <p className="mt-6 border-t border-gray-200 pt-4 text-xs font-semibold uppercase tracking-wide text-muted">
                        Options
                      </p>
                      <div className="mt-1 grid grid-cols-[1fr,64px,24px] items-center gap-2 text-xs text-muted">
                        <span>Label</span>
                        <span>Score</span>
                        <span />
                      </div>
                      {options.map((o, i) => (
                        <div key={i} className="mt-2 grid grid-cols-[1fr,64px,24px] items-center gap-2">
                          <TextInput
                            value={o.label}
                            onChange={(e) =>
                              patchQuestion(q.id, {
                                options: options.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)),
                              })
                            }
                          />
                          <TextInput
                            type="number"
                            value={o.score}
                            onChange={(e) =>
                              patchQuestion(q.id, {
                                options: options.map((x, j) => (j === i ? { ...x, score: Number(e.target.value) } : x)),
                              })
                            }
                          />
                          <button
                            onClick={() => patchQuestion(q.id, { options: options.filter((_, j) => j !== i) })}
                            className="text-muted hover:text-tier-low"
                            aria-label="Remove option"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() =>
                          patchQuestion(q.id, { options: [...options, { label: `Option ${options.length + 1}`, score: 1 }] })
                        }
                        className="mt-3 text-sm font-medium text-primary hover:underline"
                      >
                        + Add option
                      </button>
                    </>
                  )}

                  <p className="mt-6 border-t border-gray-200 pt-4 text-xs font-semibold uppercase tracking-wide text-muted">
                    Media
                  </p>
                  <FieldRow label="Image or video">
                    <button
                      onClick={() => alert('Question media is on the roadmap.')}
                      className="rounded-md border border-primary px-2.5 py-1 text-primary hover:bg-blue-50"
                      aria-label="Add media"
                    >
                      +
                    </button>
                  </FieldRow>
                </div>
              ) : (
                <div className="pb-8">
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">Answer</p>
                  <FieldLabel>Scoring category</FieldLabel>
                  <SelectInput
                    value={q.category}
                    onChange={(e) => patchQuestion(q.id, { category: e.target.value })}
                  >
                    {config.categories.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </SelectInput>
                  <button
                    onClick={() => addCategory(true)}
                    className="mt-3 text-sm font-medium text-primary hover:underline"
                  >
                    + Add scoring category
                  </button>
                </div>
              )}
            </>
          )}

          {rail === 'categories' && category && (
            <>
              <p className="border-b border-gray-200 pb-2 text-sm font-semibold uppercase tracking-wide">Category</p>
              <FieldLabel>Name</FieldLabel>
              <TextInput
                value={category.label}
                onChange={(e) =>
                  patch({
                    categories: config.categories.map((c) =>
                      c.key === category.key ? { ...c, label: e.target.value } : c
                    ),
                  })
                }
              />
              <FieldLabel>Description</FieldLabel>
              <textarea
                value={category.description ?? ''}
                onChange={(e) =>
                  patch({
                    categories: config.categories.map((c) =>
                      c.key === category.key ? { ...c, description: e.target.value } : c
                    ),
                  })
                }
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <FieldLabel>Icon (emoji or image URL)</FieldLabel>
              <TextInput
                value={category.icon ?? ''}
                placeholder="e.g. 📈 or /images/icon.png"
                onChange={(e) =>
                  patch({
                    categories: config.categories.map((c) =>
                      c.key === category.key ? { ...c, icon: e.target.value } : c
                    ),
                  })
                }
              />
              <p className="mt-4 text-xs text-muted">
                {config.questions.filter((x) => x.category === category.key).length} questions score against this
                category.
              </p>
            </>
          )}

          {rail === 'sections' && (
            <>
              <p className="border-b border-gray-200 pb-2 text-sm font-semibold uppercase tracking-wide">
                {selSection === 'header'
                  ? 'Header'
                  : selSection === 'questions'
                    ? 'Question Styles'
                    : selSection === 'progress'
                      ? 'Progress'
                      : 'Footer'}
              </p>

              {selSection === 'header' && (
                <>
                  <FieldRow label="Show header">
                    <Toggle
                      on={page.header.show}
                      onChange={(on) => patchPage({ header: { ...page.header, show: on } })}
                      label="Show header"
                    />
                  </FieldRow>
                  <SliderField
                    label="Logo max-width"
                    value={page.header.maxWidth}
                    min={60}
                    max={400}
                    onChange={(v) => patchPage({ header: { ...page.header, maxWidth: v } })}
                  />
                  <FieldLabel>Logo alignment</FieldLabel>
                  <SelectInput
                    value={page.header.align}
                    onChange={(e) =>
                      patchPage({ header: { ...page.header, align: e.target.value as 'left' | 'center' | 'right' } })
                    }
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </SelectInput>
                  <SliderField
                    label="Top margin"
                    value={page.header.topMargin}
                    min={0}
                    max={80}
                    onChange={(v) => patchPage({ header: { ...page.header, topMargin: v } })}
                  />
                  <SliderField
                    label="Bottom margin"
                    value={page.header.bottomMargin}
                    min={0}
                    max={80}
                    onChange={(v) => patchPage({ header: { ...page.header, bottomMargin: v } })}
                  />
                </>
              )}

              {selSection === 'questions' && (
                <>
                  <FieldLabel>Question align</FieldLabel>
                  <SelectInput
                    value={page.questions.align}
                    onChange={(e) =>
                      patchPage({
                        questions: { ...page.questions, align: e.target.value as 'left' | 'center' | 'right' },
                      })
                    }
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </SelectInput>
                  <FieldRow label="Show Back button">
                    <Toggle
                      on={page.questions.showBack}
                      onChange={(on) => patchPage({ questions: { ...page.questions, showBack: on } })}
                      label="Show Back button"
                    />
                  </FieldRow>
                  <FieldRow label="Show Category Name">
                    <Toggle
                      on={page.questions.showCategory}
                      onChange={(on) => patchPage({ questions: { ...page.questions, showCategory: on } })}
                      label="Show Category Name"
                    />
                  </FieldRow>
                  <ColorField
                    label="Option Text Colour"
                    value={page.questions.optionTextColor}
                    onChange={(v) => patchPage({ questions: { ...page.questions, optionTextColor: v } })}
                  />
                  <ColorField
                    label="Button Colour"
                    value={page.questions.buttonColor}
                    onChange={(v) => patchPage({ questions: { ...page.questions, buttonColor: v } })}
                  />
                  <ColorField
                    label="Question Text Colour"
                    value={page.questions.questionTextColor}
                    onChange={(v) => patchPage({ questions: { ...page.questions, questionTextColor: v } })}
                  />
                  <ColorField
                    label="Background Colour"
                    value={page.questions.backgroundColor}
                    onChange={(v) => patchPage({ questions: { ...page.questions, backgroundColor: v } })}
                  />
                </>
              )}

              {selSection === 'progress' && (
                <FieldRow label="Show progress bar">
                  <Toggle
                    on={page.progress.show}
                    onChange={(on) => patchPage({ progress: { show: on } })}
                    label="Show progress bar"
                  />
                </FieldRow>
              )}

              {selSection === 'footer' && (
                <>
                  <FieldRow label="Show footer">
                    <Toggle
                      on={page.footer.show}
                      onChange={(on) => patchPage({ footer: { show: on } })}
                      label="Show footer"
                    />
                  </FieldRow>
                  <FieldLabel>Copyright text</FieldLabel>
                  <TextInput value={config.copyright} onChange={(e) => patch({ copyright: e.target.value })} />
                </>
              )}
            </>
          )}

          {(rail === 'theme' || rail === 'page') && (
            <p className="pt-2 text-sm text-muted">
              {rail === 'theme'
                ? 'Theme changes apply across the scorecard. Edit them in the panel on the left.'
                : 'Page settings are edited in the panel on the left.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
