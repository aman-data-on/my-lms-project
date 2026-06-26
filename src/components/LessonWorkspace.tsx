import { useState, useMemo, useEffect, useCallback, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { safeHtml } from '../lib/sanitize';
import type { BlockBase } from '../lib/blocks';
import DOMPurify from 'dompurify';
import { VisualBlockRenderer } from './blocks/VisualBlockRenderer';
import { CourseSidebar, type SidebarTopic } from './course/CourseSidebar';
import { CourseTopBar } from './course/CourseTopBar';
import { LessonHeader } from './course/LessonHeader';
import { LearningObjectiveCallout } from './course/LearningObjectiveCallout';
import { LessonNavigation } from './course/LessonNavigation';
import { TopicIllustration } from './course/TopicIllustration';

// ── Domain types ──────────────────────────────────────────────────────────────

interface Lesson {
  id: string; title: string; type: string;
  video_url: string | null; duration: string | null;
  order_index: number; section: string | null;
}
interface Course {
  id: string; title: string; description: string;
  department: string; thumbnail_url: string | null; duration: string;
}

export interface LessonWorkspaceProps {
  lesson: Lesson; course: Course; userId: string; lessonIndex: number;
  isCurrentCompleted: boolean; isLastLesson: boolean; isCourseDone: boolean;
  /** Overall course progress for the top bar (0–100). */
  courseProgressPercent?: number;
  onBack: () => void; onMarkComplete: () => Promise<void>;
  onPrevLesson: () => void; onNextLesson: () => void; onAssessment: () => void;
}

// ── Content parsing ─────────────────────────────────────────────────────────────

function parseBlocks(videoUrl: string | null): BlockBase[] {
  if (!videoUrl) return [];
  const t = videoUrl.trim();
  if (t.startsWith('[')) {
    try { const p = JSON.parse(t); if (Array.isArray(p)) return p; } catch { /* */ }
  }
  return [{ id: 'legacy', type: 'text' as const, data: { html: t } }];
}

// Extracts an embedded image/iframe from text HTML so it can render as a figure.
function extractMediaFromHtml(html: string): { textHtml: string; mediaHtml: string | null } {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const media = [
    ...Array.from(doc.querySelectorAll('figure')),
    ...Array.from(doc.querySelectorAll('img')).filter(el => !el.closest('figure')),
    ...Array.from(doc.querySelectorAll('iframe')).filter(el => !el.closest('figure')),
  ];
  if (!media.length) return { textHtml: html, mediaHtml: null };
  const parts = media.map(el => { const o = el.outerHTML; el.remove(); return o; });
  doc.querySelectorAll('p,div').forEach(el => { if (!el.textContent?.trim() && !el.children.length) el.remove(); });
  return { textHtml: doc.body.innerHTML.trim(), mediaHtml: parts.join('\n').trim() || null };
}

function sanitizeMediaHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['src', 'frameborder', 'allowfullscreen', 'loading', 'width', 'height', 'allow'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
}

// Pulls a single heading + structured fields out of one text block's HTML.
interface ParsedText {
  title: string;          // leading heading text (raw)
  leadHtml: string;       // remaining prose HTML
  objective: string | null;   // "Your goal: …" / "Goal: …" sentence
  summary: string | null;      // "Module summary: …" blockquote text
  mediaHtml: string | null;    // embedded image/iframe
}

function parseTextBlock(html: string): ParsedText {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  let title = '';
  let objective: string | null = null;
  let summary: string | null = null;

  // Title = first heading.
  const h = doc.querySelector('h1,h2,h3,h4');
  if (h) { title = h.textContent?.trim() || ''; h.remove(); }

  // Objective = a paragraph beginning with "Your goal:" / "Goal:".
  Array.from(doc.querySelectorAll('p')).forEach(p => {
    const txt = (p.textContent || '').trim();
    if (/^(your\s+goal|goal)\s*:/i.test(txt)) {
      objective = txt.replace(/^(your\s+goal|goal)\s*:\s*/i, '').trim();
      p.remove();
    }
  });

  // Summary = a blockquote mentioning "module summary".
  Array.from(doc.querySelectorAll('blockquote')).forEach(bq => {
    const txt = (bq.textContent || '').trim();
    if (/module\s+summary/i.test(txt)) {
      summary = txt.replace(/^module\s+summary\s*:\s*/i, '').trim();
      bq.remove();
    }
  });

  const { textHtml, mediaHtml } = extractMediaFromHtml(doc.body.innerHTML);
  return { title, leadHtml: textHtml.trim(), objective, summary, mediaHtml };
}

interface Topic {
  id: string;
  label: string;            // "1.1"
  title: string;
  leadHtml: string;
  preview: string;          // short plain-text snippet for the overview card
  objective: string | null;
  visuals: BlockBase[];     // one or more visuals that belong to this topic
  mediaHtml: string | null;
  illustrationSrc: string | null;  // optional explicit intro illustration image
}

// A short, clean plain-text snippet of a topic's lead, for the overview cards.
function plainPreview(html: string, max = 120): string {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 60 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

// Visuals that are vertical/compact enough to sit BESIDE the intro prose in the
// right column (so the intro never reads as a narrow column next to dead space).
// Wider grids — timeline, feature/use-case/scenario cards, comparison, the
// key-facts strip — read better stacked full-width below the intro.
const SIDE_FRIENDLY = new Set<BlockBase['type']>(['ecosystem_diagram', 'architecture_diagram']);

// Card-grid visuals that pair well BESIDE a diagram in a horizontal row (e.g.
// "What CloudPe Offers" next to "Built for Every Team"). feature_benefit is
// excluded — its feature→benefit rows read better at full width.
const PAIR_CARDS = new Set<BlockBase['type']>(['use_case_cards', 'comparison', 'scenario_cards']);

function stripLeadingNumber(s: string): string {
  return s.replace(/^\d+(\.\d+)*\s*[—.\-:]?\s*/, '').trim() || s;
}

// Builds the module's topics by pairing each text section with the visual block
// that follows it (natural document-flow topics, not slides). Also lifts the
// module summary + module objective out for the overview screen.
function buildModule(blocks: BlockBase[], moduleNumber: number) {
  const topics: Topic[] = [];
  let moduleSummary: string | null = null;
  let i = 0;
  while (i < blocks.length) {
    const block = blocks[i];
    if (block.type === 'text' && block.data?.html) {
      const parsed = parseTextBlock(block.data.html);
      if (parsed.summary) moduleSummary = parsed.summary;
      // Consume all consecutive visual blocks that follow this text section.
      const visuals: BlockBase[] = [];
      let k = i + 1;
      while (k < blocks.length && blocks[k].type !== 'text') { visuals.push(blocks[k]); k += 1; }
      topics.push({
        id: block.id,
        label: `${moduleNumber}.${topics.length + 1}`,
        title: stripLeadingNumber(parsed.title) || `Topic ${topics.length + 1}`,
        leadHtml: parsed.leadHtml,
        preview: plainPreview(parsed.leadHtml),
        objective: parsed.objective,
        visuals,
        mediaHtml: parsed.mediaHtml,
        illustrationSrc: (block.data?.illustration as string) || null,
      });
      i = k;
    } else {
      // A standalone visual with no preceding text → its own topic.
      topics.push({
        id: block.id,
        label: `${moduleNumber}.${topics.length + 1}`,
        title: (block.data?.title as string) || 'Visual',
        leadHtml: '',
        preview: '',
        objective: null,
        visuals: [block],
        mediaHtml: null,
        illustrationSrc: null,
      });
      i += 1;
    }
  }
  // Module objective = the first topic's objective (shown on its page).
  return { topics, moduleSummary };
}

// ── Prose rendering ─────────────────────────────────────────────────────────────
// Renders concept HTML as natural document flow (no cards), readable line length.

function ProseBlock({ html, widthClass = 'max-w-[70ch]' }: { html: string; widthClass?: string }) {
  if (!html?.trim()) return null;
  return (
    <div
      className={`${widthClass} text-[#3A3338]
        [&_p]:mt-4 first:[&_p]:mt-0 [&_p]:leading-[1.75]
        [&_strong]:text-[#221B1D] [&_strong]:font-semibold
        [&_em]:italic
        [&_a]:text-[#ED3237] [&_a]:underline [&_a]:underline-offset-2
        [&_h4]:text-[#221B1D] [&_h4]:font-semibold [&_h4]:text-[17px] [&_h4]:mt-6 [&_h4]:mb-1
        [&_ul]:mt-4 [&_ul]:space-y-2 [&_ul>li]:relative [&_ul>li]:pl-5
        [&_ul>li]:before:content-[''] [&_ul>li]:before:absolute [&_ul>li]:before:left-0 [&_ul>li]:before:top-[0.7em]
        [&_ul>li]:before:w-1.5 [&_ul>li]:before:h-1.5 [&_ul>li]:before:rounded-full [&_ul>li]:before:bg-[#ED3237]/60
        [&_ol]:mt-4 [&_ol]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-5
        [&_li]:leading-[1.7]
        [&_blockquote]:mt-4 [&_blockquote]:border-l-2 [&_blockquote]:border-[#ED3237]/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[#5E555A]`}
      style={{ fontSize: 'clamp(1rem, 0.96rem + 0.25vw, 1.125rem)' }}
      dangerouslySetInnerHTML={{ __html: safeHtml(html) }}
    />
  );
}

function MediaFigure({ html }: { html: string }) {
  return (
    <div
      className="rounded-xl border border-[#E6E5E0] bg-white overflow-hidden p-3
        [&_img]:w-full [&_img]:rounded-lg [&_img]:block
        [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-lg [&_iframe]:border-0
        [&_figcaption]:text-[13px] [&_figcaption]:text-[#6B6E76] [&_figcaption]:mt-2 [&_figcaption]:text-center"
      dangerouslySetInnerHTML={{ __html: sanitizeMediaHtml(html) }}
    />
  );
}

// ── Topic page ───────────────────────────────────────────────────────────────

function TopicPage({
  topic, moduleNumber, moduleTitle,
}: {
  topic: Topic; moduleNumber: number; moduleTitle: string;
}) {
  const hasProse = !!topic.leadHtml.trim();
  const renderVisual = (v: BlockBase, key: string | number) => (
    <VisualBlockRenderer key={key} block={v} surface="tinted" lessonId={topic.id} userId="" />
  );

  // Pair a diagram (architecture/ecosystem) with a following card-grid into a
  // horizontal row — e.g. "What CloudPe Offers" beside "Built for Every Team".
  const diagramIdx = topic.visuals.findIndex((v) => SIDE_FRIENDLY.has(v.type));
  const pairCardIdx = diagramIdx >= 0
    ? topic.visuals.findIndex((v, i) => i !== diagramIdx && PAIR_CARDS.has(v.type))
    : -1;
  const hasPair = diagramIdx >= 0 && pairCardIdx >= 0;

  // The intro's right column carries a visual so prose never sits next to dead
  // space: an explicit illustration image, else a compact diagram (only when
  // it's not being paired below), else an inferred illustration. When a pair
  // exists, the diagram goes into the row and the intro stays prose-only.
  // A short lead beside a tall diagram leaves dead space under the text, so a
  // diagram only sits BESIDE the prose when the lead is long enough to balance
  // it; otherwise it renders full-width below a readable lead.
  const proseWords = topic.leadHtml.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  const sideDiagramIdx = hasPair ? -1 : diagramIdx;
  const placeDiagramBeside = sideDiagramIdx >= 0 && proseWords >= 80;

  let introRight: ReactNode = null;
  let introIsIllustration = false;
  let sideConsumed = -1;
  if (topic.illustrationSrc) {
    introRight = <TopicIllustration src={topic.illustrationSrc} title={topic.title} text={topic.leadHtml} />;
    introIsIllustration = true;
  } else if (placeDiagramBeside) {
    introRight = renderVisual(topic.visuals[sideDiagramIdx], 'side');
    sideConsumed = sideDiagramIdx;
  } else if (sideDiagramIdx < 0 && !hasPair && hasProse) {
    introRight = <TopicIllustration title={topic.title} text={topic.leadHtml} />;
    introIsIllustration = true;
  }

  // Content flow below the intro: the paired row at the diagram's position, then
  // everything else full-width (skipping anything already shown in the intro).
  const skip = new Set<number>();
  if (sideConsumed >= 0) skip.add(sideConsumed);
  if (hasPair) skip.add(pairCardIdx);
  const content: ReactNode[] = [];
  topic.visuals.forEach((v, i) => {
    if (skip.has(i)) return;
    if (hasPair && i === diagramIdx) {
      // items-stretch + h-full so both panels share the same height; equal grid
      // columns give them the same width.
      content.push(
        <div key="pair" className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch [&>*]:h-full">
          {renderVisual(topic.visuals[diagramIdx], 'pair-d')}
          {renderVisual(topic.visuals[pairCardIdx], 'pair-c')}
        </div>,
      );
      return;
    }
    content.push(renderVisual(v, i));
  });

  // The lead definition and its "Your goal" callout belong together in the
  // reading column, so the goal follows the definition immediately. When the
  // intro has no side visual, the lead spans the full width so it reads as a
  // header above the content rather than a narrow column beside dead space.
  const intro = (
    <div>
      <ProseBlock html={topic.leadHtml} widthClass={introRight ? 'max-w-[70ch]' : 'max-w-[78ch]'} />
      {topic.objective && (
        <div className="mt-6">
          <LearningObjectiveCallout text={topic.objective} />
        </div>
      )}
    </div>
  );

  return (
    <article>
      <LessonHeader
        breadcrumbs={[`Module ${moduleNumber}`, moduleTitle, topic.title]}
        number={topic.label}
        title={topic.title}
      />

      {/* One rhythm scale for the whole page — uniform section gaps, no ad-hoc margins. */}
      <div className="mt-6 lg:mt-8 space-y-8 lg:space-y-10">
        {introRight ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
            {intro}
            {/* Illustration is sized to roughly match the intro text height and
                top-aligned, so it sits beside the prose without pushing it down
                or leaving a gap below "Your goal". */}
            <div className={introIsIllustration ? 'w-full lg:max-w-[400px] lg:justify-self-center' : 'w-full'}>{introRight}</div>
          </div>
        ) : (
          intro
        )}

        {topic.mediaHtml && <MediaFigure html={topic.mediaHtml} />}

        {content}
      </div>
    </article>
  );
}

// ── Module overview ─────────────────────────────────────────────────────────────

function ModuleOverview({
  moduleNumber, moduleTitle, summary, topics, onSelectTopic,
}: {
  moduleNumber: number; moduleTitle: string; summary: string | null; topics: Topic[]; onSelectTopic: (i: number) => void;
}) {
  // Estimated time: ~200 wpm of lead prose + a small allowance per visual block.
  const words = topics.reduce(
    (a, t) => a + t.leadHtml.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length + t.visuals.length * 40,
    0,
  );
  const readMins = Math.max(1, Math.round(words / 200));
  return (
    <div>
      {/* Hero — summary, meta and primary CTA beside a relevant illustration so
          the landing reads as a complete, intentional page (not a short list). */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div>
          <LessonHeader
            breadcrumbs={[`Module ${moduleNumber}`, moduleTitle]}
            category="Module overview"
            title={moduleTitle}
            lead={summary || undefined}
          />
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-[#6B6E76]">
            <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#ED3237]" aria-hidden="true" />{topics.length} topics</span>
            <span aria-hidden="true">·</span>
            <span>~{readMins} min</span>
          </div>
          <button
            onClick={() => onSelectTopic(0)}
            aria-label={topics[0]?.title ? `Start lesson: ${topics[0].label} ${topics[0].title}` : 'Start lesson'}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-[14px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ED3237] focus-visible:ring-offset-2"
            style={{ background: '#ED3237', boxShadow: '0 1px 6px rgba(237,50,55,0.25)' }}
          >
            Start lesson →
          </button>
        </div>
        <div className="w-full lg:max-w-[460px] lg:justify-self-center">
          <TopicIllustration title={moduleTitle} text={summary || ''} />
        </div>
      </div>

      <section className="mt-10 lg:mt-12">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#6B6E76]">
            Topics in this module
          </h2>
          <span className="text-[12px] text-[#938890] tabular-nums">{topics.length} topics · ~{readMins} min</span>
        </div>
        <ol className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {topics.map((topic, i) => (
            <li key={topic.id}>
              <button
                onClick={() => onSelectTopic(i)}
                className="group h-full w-full text-left flex items-start gap-3.5 rounded-xl border border-[#E6E5E0] bg-white hover:border-[#F1C9CB] hover:bg-[#FFFBFB] transition-colors px-4 py-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ED3237] focus-visible:ring-offset-1"
              >
                <span className="flex-shrink-0 mt-0.5 w-9 h-9 rounded-lg bg-[#FFF1F0] text-[#ED3237] text-[13px] font-bold flex items-center justify-center tabular-nums">
                  {topic.label}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold text-[#221B1D] leading-snug">{topic.title}</span>
                  {topic.preview && (
                    <span className="block text-[13px] text-[#6B6E76] leading-snug mt-1 line-clamp-2">{topic.preview}</span>
                  )}
                </span>
                <span className="flex-shrink-0 self-center text-[#ED3237] translate-x-0 group-hover:translate-x-0.5 opacity-40 group-hover:opacity-100 transition-all text-[18px]">→</span>
              </button>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

// ── Main workspace ───────────────────────────────────────────────────────────

export function LessonWorkspace({
  lesson, course, lessonIndex,
  isCurrentCompleted, isCourseDone,
  courseProgressPercent,
  onBack, onMarkComplete, onPrevLesson, onNextLesson, onAssessment,
}: LessonWorkspaceProps) {
  const moduleNumber = lessonIndex + 1;
  const moduleTitle = useMemo(
    () => lesson.title.replace(/^module\s+\d+\s*[—–-]\s*/i, '').trim() || lesson.title,
    [lesson.title],
  );

  const { topics, moduleSummary } = useMemo(
    () => buildModule(parseBlocks(lesson.video_url), moduleNumber),
    [lesson.video_url, moduleNumber],
  );

  // active = -1 → overview; 0..n-1 → topic
  const [active, setActive] = useState(-1);
  const [maxReached, setMaxReached] = useState(-1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => { setActive(-1); setMaxReached(-1); setSidebarOpen(false); }, [lesson.id]);

  const total = topics.length;
  const lastIndex = total - 1;
  const isOverview = active < 0;
  const isLastTopic = active === lastIndex;

  const goTo = useCallback((i: number) => {
    setActive(i);
    setMaxReached(m => Math.max(m, i));
    setSidebarOpen(false);
    document.getElementById('lesson-scroll')?.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const overallPercent = typeof courseProgressPercent === 'number'
    ? courseProgressPercent
    : (isCourseDone ? 100 : 0);

  // Sidebar topic states
  const sidebarTopics: SidebarTopic[] = topics.map((t, i) => ({
    id: t.id,
    label: t.label,
    title: t.title,
    status: isCurrentCompleted ? 'done' : i === active ? 'active' : i <= maxReached && i < active ? 'done' : i < maxReached ? 'done' : 'upcoming',
  }));
  const doneCount = isCurrentCompleted ? total : Math.max(0, Math.min(total, maxReached));

  const handlePrev = () => {
    if (isOverview) { onPrevLesson(); return; }
    if (active === 0) { setActive(-1); return; }
    goTo(active - 1);
  };

  const handleNext = async () => {
    if (isOverview) { goTo(0); return; }
    if (!isLastTopic) { goTo(active + 1); return; }
    // Last topic
    if (isCurrentCompleted) { isCourseDone ? onAssessment() : onNextLesson(); return; }
    setCompleting(true);
    try { await onMarkComplete(); } finally { setCompleting(false); }
  };

  const nextLabel = isOverview
    ? 'Start lesson'
    : !isLastTopic
    ? 'Next'
    : isCurrentCompleted
    ? (isCourseDone ? 'Take Assessment' : 'Next Module')
    : 'Complete & Continue';

  const prevDisabled = isOverview && lessonIndex === 0;

  const sidebar = (
    <CourseSidebar
      courseTitle={course.title}
      moduleNumber={moduleNumber}
      moduleTitle={moduleTitle}
      topics={sidebarTopics}
      overviewActive={isOverview}
      progressDone={doneCount}
      progressTotal={total}
      onBack={onBack}
      onSelectOverview={() => { setActive(-1); setSidebarOpen(false); }}
      onSelectTopic={goTo}
    />
  );

  return (
    <div className="fixed inset-0 z-[60] flex" style={{ background: '#FAFAF8' }}>
      {/* Desktop persistent sidebar */}
      <div className="hidden lg:block w-[280px] flex-shrink-0">{sidebar}</div>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Module navigation">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
          <div className="absolute left-0 top-0 h-full w-[280px] max-w-[85vw] shadow-2xl" style={{ background: '#191B1F' }}>
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
              className="absolute right-2 top-2 z-10 w-8 h-8 rounded-lg flex items-center justify-center text-[#C7CACF] hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
            {sidebar}
          </div>
        </div>
      )}

      {/* Main workspace */}
      <main className="flex-1 min-w-0 flex flex-col">
        <CourseTopBar courseTitle={course.title} overallPercent={overallPercent} onMenu={() => setSidebarOpen(true)} />

        <div id="lesson-scroll" className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1560px] min-w-0 px-5 sm:px-8 lg:px-14 pt-6 lg:pt-8 pb-10 lg:pb-12">
            {isOverview ? (
              <ModuleOverview
                moduleNumber={moduleNumber}
                moduleTitle={moduleTitle}
                summary={moduleSummary}
                topics={topics}
                onSelectTopic={goTo}
              />
            ) : (
              <TopicPage
                topic={topics[active] ?? topics[0]}
                moduleNumber={moduleNumber}
                moduleTitle={moduleTitle}
              />
            )}
          </div>
        </div>

        {/* Sticky lesson nav — always reachable without scrolling (topic pages
            only; the overview has its own "Start lesson" CTA). */}
        {!isOverview && (
          <div className="flex-shrink-0 border-t border-[#E6E5E0] bg-white/95 backdrop-blur">
            <div className="mx-auto w-full max-w-[1560px] px-5 sm:px-8 lg:px-14 py-3">
              <LessonNavigation
                onPrev={handlePrev}
                onNext={handleNext}
                prevDisabled={prevDisabled}
                nextLabel={nextLabel}
                busy={completing}
                sticky
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
