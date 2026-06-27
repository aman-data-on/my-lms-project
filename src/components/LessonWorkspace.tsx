import { useState, useMemo, useEffect, useCallback, type ReactNode } from 'react';
import {
  ArrowRight, BookOpen, Boxes, CheckCircle2, Cloud, Clock, GitCompare, Layers,
  Network, PlayCircle, Rocket, Route, Sparkles, Workflow, X, type LucideIcon,
} from 'lucide-react';
import { inferIllustrationKind, type IllustrationKind } from './course/TopicIllustration';
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
  const sideIndex = hasPair ? -1 : diagramIdx;
  const sideVisual = sideIndex >= 0 ? topic.visuals[sideIndex] : null;
  const introRight: ReactNode = topic.illustrationSrc
    ? <TopicIllustration src={topic.illustrationSrc} title={topic.title} text={topic.leadHtml} />
    : sideVisual
    ? renderVisual(sideVisual, 'side')
    : (!hasPair && hasProse)
    ? <TopicIllustration title={topic.title} text={topic.leadHtml} />
    : null;

  // Content flow below the intro: the paired row at the diagram's position, then
  // everything else full-width (skipping anything already shown).
  const skip = new Set<number>();
  if (sideVisual) skip.add(sideIndex);
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
      <ProseBlock html={topic.leadHtml} widthClass={introRight ? 'max-w-[70ch]' : 'max-w-none'} />
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
      <div className="mt-8 lg:mt-10 space-y-8 lg:space-y-10">
        {introRight ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {intro}
            <div className="w-full">{introRight}</div>
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

// Topic glyph — maps an inferred illustration kind to a crisp lucide icon so
// each overview card carries a relevant, on-brand mark (no new facts, purely
// presentational). Falls back to a book for unmatched concepts.
const KIND_ICON: Record<IllustrationKind, LucideIcon> = {
  infra: Cloud,
  ecosystem: Network,
  architecture: Layers,
  comparison: GitCompare,
  process: Workflow,
  journey: Route,
  products: Boxes,
  concept: BookOpen,
};

function ModuleOverview({
  moduleNumber, moduleTitle, summary, topics, onSelectTopic,
}: {
  moduleNumber: number; moduleTitle: string; summary: string | null; topics: Topic[]; onSelectTopic: (i: number) => void;
}) {
  const ACCENT = '#ED3237';

  return (
    <div className="animate-fade-in">
      {/* ── Hero band ──────────────────────────────────────────────────────
          A warm rose gradient panel that fills the top of the canvas with a
          decorative motif on the right, so wide screens never read as empty. */}
      <section
        className="relative overflow-hidden rounded-3xl border border-[#F1DFDF] px-6 sm:px-10 py-9 lg:py-11"
        style={{ background: 'linear-gradient(115deg,#FFFFFF 0%,#FFF6F5 48%,#FFEDEC 100%)' }}
      >
        {/* Decorative geometry (purely presentational, aria-hidden) */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -right-16 -top-20 w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle,rgba(237,50,55,0.10),transparent 70%)' }} />
          <div className="absolute right-10 bottom-[-3rem] w-48 h-48 rounded-full border-[1.5px] border-[#F4C9CB]/60" />
          <div className="absolute right-40 top-8 w-24 h-24 rounded-2xl border-[1.5px] border-[#F4C9CB]/50 rotate-12" />
        </div>

        <div className="relative max-w-[62ch]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 backdrop-blur border border-[#F1DFDF] px-3 py-1 text-[12px] font-bold tracking-wide" style={{ color: ACCENT }}>
            <Sparkles className="w-3.5 h-3.5" /> Module {moduleNumber}
          </span>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9A8E8E]">Module overview</p>
          <h1
            className="mt-1.5 font-extrabold text-[#1A1A1A] leading-[1.1] tracking-tight"
            style={{ fontSize: 'clamp(1.9rem, 1.4rem + 2vw, 3rem)' }}
          >
            {moduleTitle}
          </h1>
          {summary && (
            <p className="mt-4 text-[#4A4347] leading-relaxed" style={{ fontSize: 'clamp(1rem, 0.96rem + 0.25vw, 1.18rem)' }}>
              {summary}
            </p>
          )}

          {/* Quick stats + primary CTA — interactive entry point */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectTopic(0)}
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-[15px] font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#ED3237]"
              style={{ background: ACCENT, boxShadow: '0 6px 18px rgba(237,50,55,0.30)' }}
            >
              <PlayCircle className="w-5 h-5" />
              Start lesson
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/70 border border-[#F1DFDF] px-3.5 py-2.5 text-[13px] font-semibold text-[#4A4347]">
              <Layers className="w-4 h-4" style={{ color: ACCENT }} /> {topics.length} topics
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/70 border border-[#F1DFDF] px-3.5 py-2.5 text-[13px] font-semibold text-[#4A4347]">
              <Clock className="w-4 h-4" style={{ color: ACCENT }} /> Self-paced
            </span>
          </div>
        </div>
      </section>

      {/* ── Topics grid ─────────────────────────────────────────────────────
          Rich, animated cards that fill wide screens (up to 3 columns). Each
          card carries a relevant glyph, the same number + title + preview as
          before — no content changes, just presentation. */}
      <section className="mt-9 lg:mt-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.12em] text-[#6B6E76]">
            <span className="inline-block w-6 h-[2px] rounded-full" style={{ background: ACCENT }} aria-hidden="true" />
            Topics in this module
          </h2>
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#9A8E8E] tabular-nums">
            <BookOpen className="w-3.5 h-3.5" /> {topics.length} topics
          </span>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
          {topics.map((topic, i) => {
            const Glyph = KIND_ICON[inferIllustrationKind(`${topic.title} ${topic.preview}`)];
            return (
              <li key={topic.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 70}ms` }}>
                <button
                  onClick={() => onSelectTopic(i)}
                  className="group relative h-full w-full text-left flex flex-col rounded-2xl border border-[#ECEAE5] bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#F1C9CB] hover:shadow-[0_14px_30px_rgba(26,26,26,0.10)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ED3237] focus-visible:ring-offset-2 overflow-hidden"
                >
                  {/* top accent sweep on hover */}
                  <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" style={{ background: ACCENT }} />

                  <div className="flex items-center justify-between">
                    <span
                      className="inline-flex items-center justify-center w-12 h-12 rounded-xl transition-colors group-hover:scale-105 duration-200"
                      style={{ background: '#FFF1F0', color: ACCENT }}
                      aria-hidden="true"
                    >
                      <Glyph className="w-6 h-6" strokeWidth={1.75} />
                    </span>
                    <span className="text-[13px] font-bold tabular-nums px-2.5 py-1 rounded-lg bg-[#F4F2EE] text-[#9A8E8E] group-hover:bg-[#FFF1F0] group-hover:text-[#ED3237] transition-colors">
                      {topic.label}
                    </span>
                  </div>

                  <h3 className="mt-4 text-[16px] font-bold text-[#1A1A1A] leading-snug">{topic.title}</h3>
                  {topic.preview && (
                    <p className="mt-1.5 text-[13.5px] text-[#6B6E76] leading-relaxed line-clamp-3">{topic.preview}</p>
                  )}

                  <span className="mt-4 pt-3 border-t border-[#F1EFEB] flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: ACCENT }}>
                    Start topic
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      {/* ── Encouragement strip ─────────────────────────────────────────────
          Fills the lower canvas on wide screens; motivational, no new facts. */}
      <section className="mt-9 lg:mt-12">
        <div
          className="relative overflow-hidden rounded-2xl border border-[#ECEAE5] bg-white px-6 py-6 sm:px-8 flex flex-col sm:flex-row sm:items-center gap-5"
        >
          <span aria-hidden="true" className="absolute -left-8 -bottom-10 w-40 h-40 rounded-full" style={{ background: 'radial-gradient(circle,rgba(237,50,55,0.06),transparent 70%)' }} />
          <span
            className="relative flex-shrink-0 inline-flex items-center justify-center w-14 h-14 rounded-2xl"
            style={{ background: '#FFF1F0', color: ACCENT }}
            aria-hidden="true"
          >
            <Rocket className="w-7 h-7" strokeWidth={1.75} />
          </span>
          <div className="relative min-w-0 flex-1">
            <h3 className="text-[16px] font-bold text-[#1A1A1A]">Ready to begin?</h3>
            <p className="text-[14px] text-[#6B6E76] leading-relaxed mt-0.5">
              Work through each topic at your own pace — your progress saves automatically as you go.
            </p>
          </div>
          <div className="relative flex items-center gap-3 text-[13px] font-medium text-[#6B6E76]">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#16A34A]" /> Auto-saved</span>
          </div>
          <button
            onClick={() => onSelectTopic(0)}
            className="group relative inline-flex flex-shrink-0 items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[14px] font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#ED3237]"
            style={{ background: ACCENT, boxShadow: '0 4px 14px rgba(237,50,55,0.28)' }}
          >
            Start lesson
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </button>
        </div>
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

  const upNextTitle = isOverview
    ? topics[0]?.title
    : !isLastTopic
    ? topics[active + 1]?.title
    : (isCurrentCompleted && !isCourseDone ? 'Next module' : null);

  const prevDisabled = isOverview && lessonIndex === 0;

  const buildSidebar = (forceExpanded: boolean) => (
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
      forceExpanded={forceExpanded}
    />
  );

  return (
    <div className="fixed inset-0 z-[60] flex" style={{ background: '#FAFAF8' }}>
      {/* Desktop rail — collapsed to an icon strip; auto-expands on hover.
          `group/rail` drives the label fades inside CourseSidebar; the width
          animates so the reading canvas reclaims the space when not hovered. */}
      <div className="hidden lg:block flex-shrink-0 w-[76px] hover:w-[280px] group/rail transition-[width] duration-300 ease-out overflow-hidden shadow-[2px_0_16px_rgba(26,26,26,0.04)] hover:shadow-[6px_0_28px_rgba(26,26,26,0.10)] z-[65]">
        {/* inner is fixed at full width so its content never reflows; the outer
            wrapper clips to the animated width, so labels slide into view. */}
        <div className="h-full w-[280px]">
          {buildSidebar(false)}
        </div>
      </div>

      {/* Mobile drawer (light) */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Module navigation">
          <div className="absolute inset-0 bg-[#1A1A1A]/40 backdrop-blur-[2px] animate-fade-in" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
          <div className="absolute left-0 top-0 h-full w-[280px] max-w-[85vw] shadow-2xl animate-slide-in-left" style={{ background: '#FFFFFF' }}>
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
              className="absolute right-2 top-2 z-10 w-8 h-8 rounded-lg flex items-center justify-center text-[#94908C] hover:bg-[#F2F1ED]"
            >
              <X className="w-4 h-4" />
            </button>
            {buildSidebar(true)}
          </div>
        </div>
      )}

      {/* Main workspace */}
      <main className="flex-1 min-w-0 flex flex-col">
        <CourseTopBar courseTitle={course.title} overallPercent={overallPercent} onMenu={() => setSidebarOpen(true)} />

        <div id="lesson-scroll" className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          {/* The overview uses a wider canvas (cards + hero fill the screen);
              topic reading pages keep a narrower, more readable measure. */}
          <div className={`mx-auto w-full min-w-0 px-5 sm:px-8 lg:px-14 py-8 lg:py-12 ${isOverview ? 'max-w-[1600px]' : 'max-w-[1320px]'}`}>
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

            <LessonNavigation
              onPrev={handlePrev}
              onNext={handleNext}
              prevDisabled={prevDisabled}
              nextLabel={nextLabel}
              upNextTitle={upNextTitle}
              busy={completing}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
