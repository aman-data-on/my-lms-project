import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight, ArrowLeft, Check, Zap, Trophy, Target,
  ChevronRight, Lock, Menu, X,
  Building2, Cloud, Layers, Clock, Boxes, TrendingUp, Users, Share2,
  type LucideIcon,
} from 'lucide-react';
import { resolveBlockIcon } from './blocks/icons';
import { TopicIllustration, type DiagramContent } from './course/TopicIllustration';
import { safeHtml } from '../lib/sanitize';

// ─────────────────────────────────────────────────────────────────────────────
// Module 1 — Company Overview reader, styled with the "Kinetic Enterprise"
// design system (docs/design/companyoverview.md). Single-scroll lesson body
// driven by the lesson's DB blocks, plus a GitBook-style full-course navigation
// rail (Phase → Module → Topic) fed by `courseTree` from CourseDetail. Theme is
// scoped under `.m1k` so it never leaks to the modules that use LessonWorkspace.
// ─────────────────────────────────────────────────────────────────────────────

interface Lesson { id: string; title: string; video_url: string | null; duration: string | null; }
interface Course { title: string; }

export interface NavTopic { id: string; title: string; }
export interface NavModule {
  lessonIndex: number; id: string; title: string;
  completed: boolean; accessible: boolean; topics: NavTopic[];
}
export interface NavPhase { name: string; modules: NavModule[]; }

export interface Module1ReaderProps {
  lesson: Lesson;
  course: Course;
  courseProgressPercent: number;
  isCurrentCompleted: boolean;
  isCourseDone: boolean;
  courseTree: NavPhase[];
  currentLessonIndex: number;
  onSelectModule: (lessonIndex: number) => void;
  onBack: () => void;
  onMarkComplete: () => Promise<void> | void;
  onNextLesson: () => void;
  onAssessment: () => void;
}

interface Block { id: string; type: string; data: Record<string, any>; }

function parseBlocks(raw: string | null): Block[] {
  if (!raw) return [];
  try { const p = JSON.parse(raw.trim()); return Array.isArray(p) ? p : []; } catch { return []; }
}

interface ParsedText { heading: string; goal: string | null; summary: string | null; html: string; }
function parseText(html: string): ParsedText {
  const doc = new DOMParser().parseFromString(html || '', 'text/html');
  let heading = '';
  const h = doc.querySelector('h1,h2,h3,h4');
  if (h) { heading = h.textContent?.trim() || ''; h.remove(); }
  let goal: string | null = null;
  doc.querySelectorAll('p').forEach((p) => {
    const t = (p.textContent || '').trim();
    if (/^(your\s+goal|goal)\s*:/i.test(t)) { goal = t.replace(/^(your\s+goal|goal)\s*:\s*/i, '').trim(); p.remove(); }
  });
  let summary: string | null = null;
  doc.querySelectorAll('blockquote').forEach((bq) => {
    const t = (bq.textContent || '').trim();
    if (/module\s+summary/i.test(t)) { summary = t.replace(/^module\s+summary\s*:\s*/i, '').trim(); bq.remove(); }
  });
  return { heading, goal, summary, html: doc.body.innerHTML.trim() };
}

const numbered = (heading: string) => heading.match(/^(\d+\.\d+)\s+(.*)/);
const stripModulePrefix = (t: string) => t.replace(/^module\s+\d+\s*[—–-]\s*/i, '').trim() || t;
const plain = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const wordCount = (html: string) => { const t = plain(html); return t ? t.split(' ').length : 0; };

// Real, source-derived labeled diagram for each Module 1 text topic, so the
// right-column visual teaches the concept on its own (no generic skeletons).
function diagramForTopic(heading: string): DiagramContent | undefined {
  const h = heading.toLowerCase();
  if (h.includes('leapswitch networks')) {
    return { shape: 'hub', center: 'Leapswitch', nodes: [
      { label: 'Startups', sub: 'scale fast' }, { label: 'Enterprises', sub: 'business-critical' },
      { label: 'Government', sub: 'compliance' }, { label: 'Tech companies', sub: 'build & ship' },
    ] };
  }
  if (h.includes('what leapswitch provides')) {
    return { shape: 'stack', layers: [
      { name: 'Cloud & application platforms', items: ['CloudPe', 'CloudJiffy'] },
      { name: 'Managed services & protection', items: ['Managed Services', 'Backup & DR'] },
      { name: 'Core infrastructure', items: ['Compute', 'Storage', 'Network', 'Colocation'] },
    ] };
  }
  if (h.includes('cloudpe') && h.includes('who we are')) {
    return { shape: 'flow', steps: [
      { label: 'Leapswitch', sub: 'builds & runs the infrastructure' },
      { label: 'CloudPe', sub: 'delivers compute, storage, GPU' },
      { label: 'Customers', sub: 'run & scale their workloads' },
    ] };
  }
  if (h.includes('cloudpe in practice')) {
    return { shape: 'hub', center: 'CloudPe', nodes: [
      { label: 'Predictable pricing', sub: 'transparent' }, { label: 'India-hosted', sub: 'data residency' },
      { label: 'Enterprise support', sub: 'real engineers' }, { label: 'AI-ready', sub: 'GPU platform' },
    ] };
  }
  return undefined;
}

/** Stable topic list for a lesson — shared by the reader (DOM ids) and the
 *  course tree (sidebar) so scroll-spy ids always line up. */
export function deriveTopics(videoUrl: string | null): NavTopic[] {
  const topics: NavTopic[] = [{ id: 'overview', title: 'Overview' }];
  for (const b of parseBlocks(videoUrl)) {
    if (b.type === 'text') {
      const h = parseText(b.data?.html || '').heading;
      if (h) { const m = numbered(h); topics.push({ id: b.id, title: m ? m[2] : h }); }
    } else if (typeof b.data?.title === 'string' && b.data.title.trim()) {
      topics.push({ id: b.id, title: b.data.title.trim() });
    }
  }
  return topics;
}

// Short milestone tag for the growth-arc points (real, from the step title).
function shortLabel(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('founded')) return 'Founded';
  if (t.includes('rebrand')) return 'Rebrand';
  if (t.includes('cloudjiffy')) return 'CloudJiffy';
  if (t.includes('cloudpe')) return 'CloudPe';
  if (t.includes('acquisition')) return 'Acquired';
  if (t.includes('global expansion')) return 'Global';
  if (t.includes('india')) return 'India';
  if (t.includes('presence') || t.includes('present')) return 'Today';
  return title.split(' ')[0];
}

// Growth arc: the same timeline data as a rising trajectory — a learner sees the
// company's growth shape (2006 → today) and the scale it reached, from the visual
// alone. All labels (years + milestones + the impact stat) are real source data.
function GrowthArc({ steps }: { steps: any[] }) {
  const valid = steps.filter((s) => s && (s.date || s.title));
  const n = Math.max(1, valid.length - 1);
  const baseY = 268, topY = 126, x0 = 42, x1 = 420;
  const pts = valid.map((s, i) => ({
    x: x0 + (i / n) * (x1 - x0),
    y: baseY - (i / n) * (baseY - topY),
    date: String(s.date || '').replace(/(\d{4})[–-]\d{2}(\d{2})/, '$1–$2'),
    label: shortLabel(String(s.title || '')),
    last: i === valid.length - 1,
  }));
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const area = `M${pts[0].x.toFixed(1)} ${baseY} ${pts.map((p) => `L${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')} L${pts[pts.length - 1].x.toFixed(1)} ${baseY} Z`;
  const F = 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  return (
    <svg viewBox="0 0 460 320" role="img" aria-label="Leapswitch growth from 2006 to 22,000+ customers today" style={{ width: '100%', height: 'auto', display: 'block' }} fontFamily={F}>
      <rect x="0" y="0" width="460" height="320" rx="16" fill="#EEF4FB" stroke="#D4DFEB" />
      {/* axes */}
      <line x1="26" y1={baseY} x2="436" y2={baseY} stroke="#C7D6E6" strokeWidth="1.5" />
      <line x1="26" y1={baseY} x2="26" y2="60" stroke="#C7D6E6" strokeWidth="1.5" />
      <path d="M26 56 l-4 8 h8 z" fill="#9FB3C7" />
      <text x="14" y="160" fontSize="9" fontWeight="600" fill="#7C8CA0" textAnchor="middle" transform="rotate(-90 14 160)">GROWTH</text>
      {/* trajectory */}
      <path d={area} fill="#B7102A" opacity="0.07" />
      <path d={line} fill="none" stroke="#B7102A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* impact callout near the present endpoint */}
      <g>
        <rect x="300" y="70" width="138" height="36" rx="9" fill="#fff" stroke="#D4DFEB" />
        <text x="314" y="86" fontSize="13" fontWeight="700" fill="#B7102A">22,000+</text>
        <text x="314" y="99" fontSize="9.5" fill="#5A6B7A">customers today</text>
      </g>
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={p.last ? 6 : 4} fill={p.last ? '#B7102A' : '#fff'} stroke="#B7102A" strokeWidth="2" />
          <text x={p.x} y={p.y - 11} fontSize="9" fontWeight="600" fill="#16212B" textAnchor="middle">{p.label}</text>
          <text x={p.x} y={baseY + 17} fontSize="8.5" fill="#5A6B7A" textAnchor="middle">{p.date}</text>
        </g>
      ))}
    </svg>
  );
}

function BIcon({ name, size = 18 }: { name?: string; size?: number }) {
  // Never render an empty slot — fall back to a neutral icon if a name is unknown.
  const C = resolveBlockIcon(name) ?? Layers;
  return <C width={size} height={size} strokeWidth={2} />;
}

// Semantic heading icon for a section, chosen by block type / topic.
function headIcon(block: Block): LucideIcon {
  switch (block.type) {
    case 'timeline': return Clock;
    case 'architecture_diagram': return Boxes;
    case 'feature_benefit': return TrendingUp;
    case 'ecosystem_diagram': return Share2;
    case 'use_case_cards': return Users;
    case 'key_facts': return BarChartFallback;
    case 'text': {
      const h = parseText(block.data?.html || '').heading.toLowerCase();
      if (h.includes('leapswitch networks')) return Building2;
      if (h.includes('what leapswitch provides')) return Layers;
      if (h.includes('cloudpe')) return Cloud;
      return Layers;
    }
    default: return Layers;
  }
}
// key_facts has no heading in this reader, but keep a sensible default available.
const BarChartFallback = Boxes;

export function Module1Reader({
  lesson, course, courseProgressPercent, isCurrentCompleted, isCourseDone,
  courseTree, currentLessonIndex, onSelectModule,
  onBack, onMarkComplete, onNextLesson, onAssessment,
}: Module1ReaderProps) {
  const blocks = useMemo(() => parseBlocks(lesson.video_url), [lesson.video_url]);
  const activeTopics = useMemo(() => deriveTopics(lesson.video_url), [lesson.video_url]);
  const firstGoal = useMemo(() => {
    const b = blocks.find((x) => x.type === 'text');
    return b ? parseText(b.data?.html || '').goal : null;
  }, [blocks]);

  const currentPhaseName = useMemo(
    () => courseTree.find((p) => p.modules.some((m) => m.lessonIndex === currentLessonIndex))?.name,
    [courseTree, currentLessonIndex],
  );

  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(() => new Set(currentPhaseName ? [currentPhaseName] : []));
  const [expandedModules, setExpandedModules] = useState<Set<number>>(() => new Set([currentLessonIndex]));
  const [activeTopic, setActiveTopic] = useState('overview');
  const [maxReached, setMaxReached] = useState(0);
  const [busy, setBusy] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const maxRef = useRef(0);

  // Keep the current phase/module expanded if the active lesson changes.
  useEffect(() => {
    setExpandedModules((s) => new Set(s).add(currentLessonIndex));
    if (currentPhaseName) setExpandedPhases((s) => new Set(s).add(currentPhaseName));
  }, [currentLessonIndex, currentPhaseName]);

  // Timeline reveal + topic scroll-spy (IntersectionObserver, no scroll handlers).
  useEffect(() => {
    const root = rootRef.current; const scroller = scrollRef.current;
    if (!root || !scroller) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const reveals = Array.from(root.querySelectorAll<HTMLElement>('.reveal'));
    if (reduce) reveals.forEach((el) => el.classList.add('in'));
    else {
      const ro = new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) {
          const i = reveals.indexOf(e.target as HTMLElement);
          (e.target as HTMLElement).style.transitionDelay = `${Math.min(i, 8) * 70}ms`;
          (e.target as HTMLElement).classList.add('in');
          ro.unobserve(e.target);
        }
      }), { root: scroller, threshold: 0.2 });
      reveals.forEach((el) => ro.observe(el));
    }

    const spy = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting) {
          const id = (e.target as HTMLElement).dataset.topic || 'overview';
          setActiveTopic(id);
          const idx = activeTopics.findIndex((t) => t.id === id);
          if (idx > maxRef.current) { maxRef.current = idx; setMaxReached(idx); }
        }
      });
    }, { root: scroller, rootMargin: '-42% 0px -52% 0px' });
    root.querySelectorAll<HTMLElement>('[data-topic]').forEach((el) => spy.observe(el));

    return () => spy.disconnect();
  }, [activeTopics]);

  // Keep the active topic visible inside the rail as it changes.
  useEffect(() => {
    rootRef.current?.querySelector('.topic.is-active')?.scrollIntoView({ block: 'nearest' });
  }, [activeTopic]);

  const goToTopic = (id: string) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    rootRef.current?.querySelector(`[data-topic="${CSS.escape(id)}"]`)
      ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  const togglePhase = (name: string) => setExpandedPhases((s) => {
    const n = new Set(s); n.has(name) ? n.delete(name) : n.add(name); return n;
  });
  const toggleModule = (idx: number) => setExpandedModules((s) => {
    const n = new Set(s); n.has(idx) ? n.delete(idx) : n.add(idx); return n;
  });

  const moduleTitle = stripModulePrefix(lesson.title);
  const activeIdx = activeTopics.findIndex((t) => t.id === activeTopic);
  const atLast = activeIdx >= activeTopics.length - 1;

  const primaryLabel = !atLast
    ? `Next: ${activeTopics[activeIdx + 1]?.title || ''}`
    : isCurrentCompleted ? (isCourseDone ? 'Take assessment' : 'Next module') : 'Mark complete & continue';

  const onPrimary = async () => {
    if (!atLast) { goToTopic(activeTopics[activeIdx + 1].id); return; }
    if (isCurrentCompleted) { isCourseDone ? onAssessment() : onNextLesson(); return; }
    setBusy(true);
    try { await onMarkComplete(); } finally { setBusy(false); }
  };

  // ─── Content sections (each is a scroll-spy target via data-topic) ──────────
  const renderBlock = (b: Block) => {
    switch (b.type) {
      case 'text': {
        const t = parseText(b.data?.html || '');
        const m = numbered(t.heading);
        const HIcon = headIcon(b);
        const head = t.heading && (
          <div className="sec-head">
            <span className="eyebrow mono eyebrow--ic"><HIcon size={14} strokeWidth={2.2} aria-hidden="true" />{m ? `Topic ${m[1]}` : 'In focus'}</span>
            <h2>{m ? m[2] : t.heading}</h2>
          </div>
        );
        const prose = t.html && <div className="prose" dangerouslySetInnerHTML={{ __html: safeHtml(t.html) }} />;
        const summary = t.summary && (
          <div className="summary split__summary"><span className="mono">Module summary</span><p>{t.summary}</p></div>
        );
        // Short text (<20 words) reads in a centered column — never stretched and
        // never padded with a decorative visual. Everything longer becomes a
        // text + concept-illustration two-column so no topic is paragraph-only.
        if (wordCount(t.html) < 20) {
          return (
            <section key={b.id} id={`sec-${b.id}`} data-topic={b.id} className="m1-sec m1-sec--read">
              {head}{prose}{summary}
            </section>
          );
        }
        return (
          <section key={b.id} id={`sec-${b.id}`} data-topic={b.id} className="m1-sec m1-sec--split">
            <div className="split__main">{head}{prose}</div>
            <div className="split__aside">
              <TopicIllustration tone="cool" content={diagramForTopic(t.heading)} title={m ? m[2] : t.heading} text={plain(t.html)} />
            </div>
            {summary}
          </section>
        );
      }
      case 'timeline': {
        const steps: any[] = Array.isArray(b.data?.steps) ? b.data.steps : [];
        return (
          <section key={b.id} id={`sec-${b.id}`} data-topic={b.id} className="m1-sec m1-sec--wide">
            <SecHead Icon={headIcon(b)} eyebrow={b.data?.eyebrow} title={b.data?.title} />
            <div className="tl-grid">
              <div className="timeline timeline--tight">
                {steps.map((s, i) => (
                  <div className="tl reveal" key={i}>
                    <div className="tl__date">{s.date}</div>
                    <div className="tl__body">
                      <span className={`tl__node${i === steps.length - 1 ? ' is-last' : ''}`} />
                      <div className="tl__t">{s.title}</div>
                      {s.description && <div className="tl__d">{s.description}</div>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="tl-chart"><GrowthArc steps={steps} /></div>
            </div>
          </section>
        );
      }
      case 'key_facts': {
        const facts: any[] = Array.isArray(b.data?.facts) ? b.data.facts : [];
        return (
          <section key={b.id} id={`sec-${b.id}`} data-topic={b.id} className="m1-sec m1-sec--wide">
            <div className="facts">
              {facts.map((f, i) => (
                <div className="fact" key={i}>
                  <span className="fact__ic"><BIcon name={f.icon} size={18} /></span>
                  <div className="fact__v">{f.value}</div>
                  <div className="fact__l">{f.label}</div>
                  {f.sublabel && <div className="fact__s">{f.sublabel}</div>}
                </div>
              ))}
            </div>
          </section>
        );
      }
      case 'architecture_diagram': {
        const layers: any[] = Array.isArray(b.data?.layers) ? b.data.layers : [];
        return (
          <section key={b.id} id={`sec-${b.id}`} data-topic={b.id} className="m1-sec m1-sec--wide">
            <SecHead Icon={headIcon(b)} eyebrow={b.data?.eyebrow} title={b.data?.title} />
            <div className="arch">
              {layers.map((l, i) => (
                <div className="layer" key={i}>
                  <div className="layer__name">
                    <span className="layer__tick" style={{ background: l.accent || 'var(--m1-accent)' }} />
                    {l.name}
                  </div>
                  <div className="chips">
                    {(Array.isArray(l.components) ? l.components : []).map((c: any, j: number) => (
                      <span className="chip" key={j}><BIcon name={c.icon} size={15} />{c.label}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      }
      case 'feature_benefit': {
        const pairs: any[] = Array.isArray(b.data?.pairs) ? b.data.pairs : [];
        return (
          <section key={b.id} id={`sec-${b.id}`} data-topic={b.id} className="m1-sec m1-sec--wide">
            <SecHead Icon={headIcon(b)} eyebrow={b.data?.eyebrow} title={b.data?.title} />
            <div className="fb">
              {pairs.map((p, i) => (
                <div className="fbrow" key={i}>
                  <span className="fbrow__ic"><BIcon name={p.icon} size={19} /></span>
                  <div><h4>{p.feature}</h4>{p.benefit && <p>{p.benefit}</p>}</div>
                </div>
              ))}
            </div>
          </section>
        );
      }
      case 'ecosystem_diagram': {
        const nodes: any[] = Array.isArray(b.data?.nodes) ? b.data.nodes : [];
        return (
          <section key={b.id} id={`sec-${b.id}`} data-topic={b.id} className="m1-sec m1-sec--wide">
            <SecHead Icon={headIcon(b)} eyebrow={b.data?.eyebrow} title={b.data?.title} />
            <div className="eco">
              {nodes.map((n, i) => (
                <div key={i}>
                  <div className="eco__node">
                    <span className="eco__ic" style={{ background: n.accent || 'var(--m1-accent)' }}><BIcon name={n.icon} size={20} /></span>
                    <div>
                      <div className="eco__t">{n.label}</div>
                      {n.sublabel && <div className="eco__sub">{n.sublabel}</div>}
                      {n.caption && <div className="eco__cap">{n.caption}</div>}
                    </div>
                  </div>
                  {i < nodes.length - 1 && <div className="eco__link" aria-hidden="true" />}
                </div>
              ))}
            </div>
            {b.data?.relationship && <p className="eco__rel"><strong>The relationship:</strong> {b.data.relationship}</p>}
          </section>
        );
      }
      case 'use_case_cards': {
        const cases: any[] = Array.isArray(b.data?.cases) ? b.data.cases : [];
        return (
          <section key={b.id} id={`sec-${b.id}`} data-topic={b.id} className="m1-sec m1-sec--wide">
            <SecHead Icon={headIcon(b)} eyebrow={b.data?.eyebrow} title={b.data?.title} center />
            <div className="cards">
              {cases.map((c, i) => (
                <div className="uc" key={i}>
                  <div className="uc__top">
                    <span className="uc__ic" style={{ background: c.accent || 'var(--m1-accent)' }}><BIcon name={c.icon} size={19} /></span>
                  </div>
                  <h4>{c.title}</h4>{c.description && <p>{c.description}</p>}
                </div>
              ))}
            </div>
          </section>
        );
      }
      default:
        return null;
    }
  };

  // ─── Sidebar: topic status within a module ──────────────────────────────────
  const topicStatus = (mod: NavModule, topicIdx: number, topicId: string):
    'completed' | 'current' | 'visited' | 'upcoming' | 'locked' => {
    if (!mod.accessible) return 'locked';
    if (mod.completed) return 'completed';
    if (mod.lessonIndex === currentLessonIndex) {
      if (topicId === activeTopic) return 'current';
      if (topicIdx <= maxReached) return 'visited';
      return 'upcoming';
    }
    return 'upcoming';
  };

  return (
    <div className="m1k" ref={rootRef}>
      <style>{M1_CSS}</style>
      <div className="app">
        {drawerOpen && <div className="scrim" onClick={() => setDrawerOpen(false)} aria-hidden="true" />}
        {/* ── GitBook-style course rail ────────────────────────────────────── */}
        <aside className={`rail${drawerOpen ? ' open' : ''}`}>
          <button className="rail__close" onClick={() => setDrawerOpen(false)} aria-label="Close navigation"><X size={18} /></button>
          <button className="rail__brand" onClick={onBack} aria-label="Back to course overview" title={course.title}>
            <span className="rail__mark" aria-hidden="true"><Zap size={17} fill="#fff" strokeWidth={1.5} /></span>
            <span className="rail__word">leapswitch</span>
          </button>

          <div className="rail__course">
            <span className="mono">Course</span>
            <div className="rail__course-t">{course.title}</div>
          </div>

          <nav className="nav" aria-label="Course navigation">
            {courseTree.map((phase, pi) => {
              const total = phase.modules.length;
              const done = phase.modules.filter((m) => m.completed).length;
              const open = expandedPhases.has(phase.name);
              const isCurrentPhase = phase.name === currentPhaseName;
              return (
                <div className="ph" key={phase.name}>
                  <button className={`ph__head${isCurrentPhase ? ' is-current' : ''}`} onClick={() => togglePhase(phase.name)} aria-expanded={open}>
                    <ChevronRight className={`chev${open ? ' open' : ''}`} size={15} />
                    <span className="ph__txt">
                      <span className="ph__kicker mono">Phase {pi + 1}</span>
                      <span className="ph__name">{phase.name}</span>
                    </span>
                    <span className="ph__count mono">{done}/{total}</span>
                  </button>
                  <div className="ph__bar"><span style={{ width: `${total ? (done / total) * 100 : 0}%` }} /></div>

                  <div className={`acc${open ? ' open' : ''}`}>
                    <div>
                      <div className="mods">
                        {phase.modules.map((mod) => {
                          const mOpen = expandedModules.has(mod.lessonIndex);
                          const isCurrentMod = mod.lessonIndex === currentLessonIndex;
                          const topics = isCurrentMod ? activeTopics : mod.topics;
                          const tDone = mod.completed ? topics.length : isCurrentMod ? Math.min(topics.length, maxReached + 1) : 0;
                          return (
                            <div className={`mod${isCurrentMod ? ' is-current' : ''}`} key={mod.id}>
                              <button className="mod__head" onClick={() => toggleModule(mod.lessonIndex)} aria-expanded={mOpen} disabled={!mod.accessible}>
                                <ChevronRight className={`chev${mOpen ? ' open' : ''}`} size={14} />
                                <span className="mod__title">{mod.title}</span>
                                <span className="mod__status" aria-hidden="true">
                                  {!mod.accessible ? <Lock size={13} />
                                    : mod.completed ? <Check size={14} className="ok" />
                                    : isCurrentMod ? <span className="dot dot--current" />
                                    : <span className="dot" />}
                                </span>
                              </button>
                              {mod.accessible && (
                                <div className="mod__meta">{tDone}/{topics.length} topics</div>
                              )}

                              <div className={`acc${mOpen ? ' open' : ''}`}>
                                <div>
                                  <ul className="topics">
                                    {topics.map((tp, ti) => {
                                      const st = topicStatus(mod, ti, tp.id);
                                      return (
                                        <li key={tp.id}>
                                          <button
                                            className={`topic is-${st}${isCurrentMod && tp.id === activeTopic ? ' is-active' : ''}`}
                                            onClick={() => { isCurrentMod ? goToTopic(tp.id) : onSelectModule(mod.lessonIndex); setDrawerOpen(false); }}
                                            disabled={st === 'locked'}
                                            aria-current={isCurrentMod && tp.id === activeTopic ? 'true' : undefined}
                                          >
                                            <span className="topic__mark" aria-hidden="true">
                                              {st === 'completed' ? <Check size={12} />
                                                : st === 'locked' ? <Lock size={11} />
                                                : <span className="tdot" />}
                                            </span>
                                            <span className="topic__txt">{tp.title}</span>
                                          </button>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="rail__foot">
            <div className="badge-card">
              <div className="ring" aria-hidden="true"><Trophy size={17} /></div>
              <p>{isCurrentCompleted ? `${moduleTitle} complete — well done.` : 'Read through to finish this module'}</p>
            </div>
          </div>
        </aside>

        {/* ── Content stage ────────────────────────────────────────────────── */}
        <div className="main">
          <header className="topbar">
            <button className="menu-btn" onClick={() => setDrawerOpen(true)} aria-label="Open course navigation"><Menu size={18} /></button>
            <span className="topbar__crumb mono">{currentPhaseName ? `${currentPhaseName} · ` : ''}{moduleTitle}</span>
            <span className="topbar__spacer" />
            <span className="topbar__prog">
              <span className="track"><span style={{ width: `${courseProgressPercent}%` }} /></span>
              <span className="pct mono">{courseProgressPercent}%</span>
            </span>
          </header>

          <div className="scroll" ref={scrollRef}>
            <main className="stage">
              <section id="sec-overview" data-topic="overview" className="hero">
                <div className="hero__grid">
                  <div className="hero__inner">
                    <span className="eyebrow mono eyebrow--ic"><Building2 size={14} strokeWidth={2.2} aria-hidden="true" />Module 01 · Company Overview</span>
                    <h1>The infrastructure company <em>behind the cloud you sell.</em></h1>
                    <p className="hero__lead">
                      Leapswitch Networks builds and runs the infrastructure; CloudPe is the cloud platform
                      customers actually use. Know both, and you can explain who we are in one confident sentence.
                    </p>
                    <div className="stats">
                      <div className="stat"><div className="stat__v">2006</div><div className="stat__l">Founded</div><div className="stat__s">nearly two decades</div></div>
                      <div className="stat"><div className="stat__v">22,000+</div><div className="stat__l">Customers</div><div className="stat__s">served globally</div></div>
                      <div className="stat"><div className="stat__v">India</div><div className="stat__l">Hosted</div><div className="stat__s">data sovereignty</div></div>
                    </div>
                    {firstGoal && (
                      <div className="goal">
                        <span className="goal__ic"><Target size={20} /></span>
                        <div>
                          <span className="goal__k mono">Your goal</span>
                          <p>{firstGoal.charAt(0).toUpperCase() + firstGoal.slice(1)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="hero__aside">
                    <TopicIllustration tone="cool" title={moduleTitle} content={{ shape: 'flow', steps: [
                      { label: 'Leapswitch', sub: 'builds & runs the infrastructure' },
                      { label: 'CloudPe', sub: 'the cloud platform on top' },
                      { label: 'Customers', sub: 'run & scale their workloads' },
                    ] }} />
                  </div>
                </div>
              </section>

              {blocks.map((b) => renderBlock(b))}

              <nav className="lessonnav" aria-label="Lesson navigation">
                <button className="btn btn--ghost" disabled={activeIdx <= 0}
                  onClick={() => activeIdx > 0 && goToTopic(activeTopics[activeIdx - 1].id)}>
                  <ArrowLeft size={16} /> Previous
                </button>
                <button className="btn btn--primary" onClick={onPrimary} disabled={busy}>
                  <span className="btn__txt">{busy ? 'Saving…' : primaryLabel}</span>
                  {!busy && <ArrowRight size={17} strokeWidth={2.2} />}
                </button>
              </nav>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecHead({ eyebrow, title, center, Icon }: { eyebrow?: string; title?: string; center?: boolean; Icon?: LucideIcon }) {
  if (!eyebrow && !title) return null;
  return (
    <div className={`sec-head${center ? ' center' : ''}`}>
      {eyebrow && <span className={`eyebrow mono${Icon ? ' eyebrow--ic' : ''}`}>{Icon && <Icon size={14} strokeWidth={2.2} aria-hidden="true" />}{eyebrow}</span>}
      {title && <h2>{title}</h2>}
    </div>
  );
}

// ─── Scoped Kinetic Enterprise stylesheet (all selectors under `.m1k`) ─────────
const M1_CSS = `
.m1k{position:fixed;inset:0;z-index:60;overflow:hidden;
  --ground:#f6faff;--surface:#ffffff;--surface-low:#ecf5fe;--surface-c:#e6eff8;--surface-highest:#dbe4ed;
  --obsidian:#293138;--obsidian-deep:#1f262c;--obsidian-line:#3a434b;
  --text:#141d23;--text-warm:#5b403f;--muted:#5f5e60;--inverse-on:#e9f2fb;--inverse-dim:#aeb9c4;
  --m1-accent:#b7102a;--m1-accent-2:#db313f;--outline:#d4dfeb;--outline-warm:#e4bebc;--green:#34d399;
  --r-sm:4px;--r-lg:8px;--r-xl:12px;--r-pill:9999px;
  /* Adaptive layout tokens. Widths resolve against the content area (the .scroll
     container, which already excludes the rail). Reading stays comfortable;
     visuals break out wide; both fill the workspace on laptop/desktop and cap on
     ultra-wide so lines stay readable without leaving huge gutters. */
  --pad:clamp(20px,3.5cqi,56px);--w-read:min(100%,820px);--w-wide:min(100%,1520px);
  --display:'Hanken Grotesk',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
  --body:'Inter',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
  --mono:'JetBrains Mono',ui-monospace,'SF Mono',Menlo,monospace;
  background:var(--ground);color:var(--text);font-family:var(--body);font-size:16px;line-height:1.5;-webkit-font-smoothing:antialiased;}
.m1k *{box-sizing:border-box;}
.m1k h1,.m1k h2,.m1k h3,.m1k h4{font-family:var(--display);margin:0;color:var(--text);letter-spacing:-0.01em;}
.m1k p{margin:0;}
.m1k .mono{font-family:var(--mono);text-transform:uppercase;letter-spacing:0.08em;font-size:12px;font-weight:500;}
.m1k button:focus-visible{outline:2px solid var(--m1-accent);outline-offset:-2px;border-radius:var(--r-sm);}

.m1k .app{display:grid;grid-template-columns:300px 1fr;height:100%;}

/* ── Rail ── */
.m1k .rail{background:var(--obsidian);color:var(--inverse-on);height:100%;display:flex;flex-direction:column;border-right:1px solid var(--obsidian-line);min-height:0;}
.m1k .rail__close{display:none;position:absolute;top:14px;right:12px;z-index:2;width:32px;height:32px;border-radius:var(--r-lg);border:0;background:rgba(255,255,255,.06);color:var(--inverse-on);cursor:pointer;align-items:center;justify-content:center;}
.m1k .rail__brand{display:flex;align-items:center;gap:10px;height:60px;padding:0 20px;border:0;border-bottom:1px solid var(--obsidian-line);background:transparent;cursor:pointer;width:100%;flex-shrink:0;}
.m1k .rail__brand:hover{background:rgba(255,255,255,.03);}
.m1k .rail__mark{width:28px;height:28px;border-radius:var(--r-lg);background:var(--m1-accent);display:grid;place-items:center;flex-shrink:0;color:#fff;}
.m1k .rail__word{font-family:var(--display);font-weight:700;font-size:16px;letter-spacing:-0.02em;color:#fff;}
.m1k .rail__course{padding:16px 20px 14px;border-bottom:1px solid var(--obsidian-line);flex-shrink:0;}
.m1k .rail__course .mono{color:var(--m1-accent-2);font-size:11px;}
.m1k .rail__course-t{font-family:var(--display);font-weight:700;font-size:15px;line-height:1.3;margin-top:5px;color:#fff;}

.m1k .nav{flex:1;overflow-y:auto;padding:8px 8px 16px;min-height:0;}
.m1k .nav::-webkit-scrollbar{width:8px;}
.m1k .nav::-webkit-scrollbar-thumb{background:#3a434b;border-radius:8px;}

/* phase */
.m1k .ph{margin-top:4px;}
.m1k .ph__head{width:100%;display:flex;align-items:center;gap:8px;padding:9px 10px 7px;border:0;background:transparent;cursor:pointer;text-align:left;border-radius:var(--r-lg);color:var(--inverse-on);}
.m1k .ph__head:hover{background:rgba(255,255,255,.04);}
.m1k .ph__txt{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px;}
.m1k .ph__kicker{font-size:10px;color:var(--m1-accent-2);}
.m1k .ph__head.is-current .ph__kicker{color:var(--m1-accent-2);}
.m1k .ph__name{font-size:13px;font-weight:600;line-height:1.25;color:#fff;}
.m1k .ph__count{font-size:10.5px;color:var(--inverse-dim);flex-shrink:0;}
.m1k .ph__bar{height:3px;border-radius:var(--r-pill);background:#39424a;margin:0 10px 2px;overflow:hidden;}
.m1k .ph__bar>span{display:block;height:100%;background:var(--m1-accent);border-radius:var(--r-pill);transition:width .4s;}
.m1k .chev{flex-shrink:0;color:var(--inverse-dim);transition:transform .2s;}
.m1k .chev.open{transform:rotate(90deg);}

/* accordion animation (max-height — robust when nested). NB: class is "acc",
   not "collapse" — Tailwind's global .collapse utility sets visibility:collapse. */
.m1k .acc{overflow:hidden;max-height:0;transition:max-height .28s ease;}
.m1k .acc.open{max-height:2400px;}

/* modules */
.m1k .mods{padding:2px 0 6px 8px;margin-left:9px;border-left:1px solid var(--obsidian-line);}
.m1k .mod{border-radius:var(--r-lg);}
.m1k .mod__head{width:100%;display:flex;align-items:center;gap:7px;padding:7px 8px;border:0;background:transparent;cursor:pointer;text-align:left;border-radius:var(--r-sm);color:var(--inverse-dim);}
.m1k .mod__head:hover{background:rgba(255,255,255,.04);color:var(--inverse-on);}
.m1k .mod__head:disabled{opacity:.5;cursor:not-allowed;}
.m1k .mod.is-current .mod__title{color:#fff;font-weight:600;}
.m1k .mod__title{flex:1;min-width:0;font-size:12.5px;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.m1k .mod__status{flex-shrink:0;display:grid;place-items:center;width:16px;height:16px;}
.m1k .mod__status .ok{color:var(--green);}
.m1k .dot{width:7px;height:7px;border-radius:50%;border:1.5px solid var(--inverse-dim);display:block;}
.m1k .dot--current{border-color:var(--m1-accent);background:var(--m1-accent);}
.m1k .mod__meta{font-size:10px;color:var(--inverse-dim);padding:0 8px 4px 30px;margin-top:-2px;}

/* topics */
.m1k .topics{list-style:none;margin:0;padding:2px 0 6px 12px;margin-left:11px;border-left:1px solid var(--obsidian-line);display:flex;flex-direction:column;gap:1px;}
.m1k .topic{width:100%;display:flex;align-items:center;gap:9px;padding:6px 9px;border:0;background:transparent;cursor:pointer;text-align:left;border-radius:var(--r-sm);color:var(--inverse-dim);position:relative;transition:background .15s,color .15s;}
.m1k .topic:hover{background:rgba(255,255,255,.045);color:var(--inverse-on);}
.m1k .topic:disabled{opacity:.5;cursor:not-allowed;}
.m1k .topic.is-active{background:rgba(255,255,255,.07);color:#fff;font-weight:600;}
.m1k .topic.is-active::before{content:"";position:absolute;left:-13px;top:6px;bottom:6px;width:2px;border-radius:2px;background:var(--m1-accent);}
.m1k .topic__mark{flex-shrink:0;width:14px;display:grid;place-items:center;color:var(--inverse-dim);}
.m1k .topic.is-completed .topic__mark{color:var(--green);}
.m1k .topic.is-active .topic__mark{color:var(--m1-accent);}
.m1k .tdot{width:5px;height:5px;border-radius:50%;background:currentColor;opacity:.55;display:block;}
.m1k .topic.is-visited .tdot{opacity:.9;}
.m1k .topic.is-current .tdot{background:var(--m1-accent);opacity:1;width:6px;height:6px;}
.m1k .topic__txt{flex:1;min-width:0;font-size:12.5px;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}

.m1k .rail__foot{padding:12px;border-top:1px solid var(--obsidian-line);flex-shrink:0;}
.m1k .badge-card{background:var(--obsidian-deep);border:1px solid var(--obsidian-line);border-radius:var(--r-xl);padding:13px;text-align:center;}
.m1k .badge-card .ring{width:34px;height:34px;border-radius:var(--r-pill);display:grid;place-items:center;margin:0 auto 8px;background:rgba(255,255,255,.05);color:var(--inverse-dim);}
.m1k .badge-card p{font-size:11.5px;color:var(--inverse-dim);line-height:1.4;}

/* ── Main ── */
.m1k .main{display:flex;flex-direction:column;min-width:0;min-height:0;}
.m1k .topbar{height:60px;display:flex;align-items:center;gap:14px;padding:0 40px;background:rgba(246,250,255,.85);backdrop-filter:blur(10px);border-bottom:1px solid var(--outline);flex-shrink:0;}
.m1k .menu-btn{display:none;align-items:center;justify-content:center;width:36px;height:36px;border-radius:var(--r-lg);border:1px solid var(--outline);background:var(--surface);color:var(--text);cursor:pointer;flex-shrink:0;}
.m1k .scrim{display:none;}
.m1k .topbar__crumb{font-size:11px;color:var(--muted);letter-spacing:.06em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.m1k .topbar__spacer{flex:1;}
.m1k .topbar__prog{display:flex;align-items:center;gap:10px;flex-shrink:0;}
.m1k .track{height:6px;border-radius:var(--r-pill);background:var(--surface-highest);overflow:hidden;width:128px;}
.m1k .track>span{display:block;height:100%;background:var(--m1-accent);border-radius:var(--r-pill);transition:width .5s;}
.m1k .topbar__prog .pct{font-size:12px;color:var(--m1-accent);font-weight:600;}
.m1k .scroll{flex:1;overflow-y:auto;overflow-x:hidden;min-height:0;scroll-behavior:smooth;container-type:inline-size;}
.m1k .stage{width:100%;max-width:var(--w-wide);margin:0 auto;padding:0 var(--pad) 96px;}
/* Per-section widths: text reads in a narrow column, visuals break out wide.
   Both share the same left edge so the eye doesn't travel between sections. */
/* Uniform top rhythm for every section (so spacing doesn't depend on whether a
   section has a heading) — this is what keeps a tall split illustration from
   riding up into the section above it. */
.m1k .m1-sec{scroll-margin-top:24px;margin-top:56px;}
.m1k .m1-sec--read{max-width:var(--w-read);}
.m1k .m1-sec--wide{max-width:100%;}
/* Text + concept: prose left (55%), instructional SVG right (45%). Top-aligned. */
.m1k .m1-sec--split{max-width:var(--w-wide);display:grid;grid-template-columns:minmax(0,55fr) minmax(0,45fr);gap:44px;align-items:start;}
.m1k .split__main{min-width:0;}
.m1k .split__aside{min-width:0;width:100%;}
.m1k .split__summary{grid-column:1 / -1;}

.m1k .prose{max-width:none;}
.m1k .prose p{font-size:18px;line-height:1.72;color:#27313a;margin-top:16px;}
.m1k .prose p:first-child{margin-top:0;}
.m1k .prose strong{color:var(--text);font-weight:600;}

.m1k .eyebrow{display:inline-flex;align-items:center;gap:9px;color:var(--m1-accent);}
.m1k .eyebrow::before{content:"";width:18px;height:2px;background:var(--m1-accent);border-radius:2px;}
.m1k .eyebrow--ic{gap:7px;}
.m1k .eyebrow--ic::before{display:none;}
.m1k .sec-head{margin:0 0 22px;}
.m1k .sec-head .eyebrow{margin-bottom:12px;}
.m1k .sec-head h2{font-size:32px;line-height:1.18;letter-spacing:-0.02em;}
.m1k .sec-head.center{text-align:center;}
.m1k .sec-head.center .eyebrow{justify-content:center;}

.m1k .hero{padding:48px 0 8px;position:relative;scroll-margin-top:24px;max-width:var(--w-wide);}
.m1k .hero__grid{display:grid;grid-template-columns:minmax(0,55fr) minmax(0,45fr);gap:48px;align-items:center;}
.m1k .hero__aside{width:100%;min-width:0;}
.m1k .hero__dots{position:absolute;inset:0;background-image:radial-gradient(var(--surface-highest) 1px,transparent 1px);background-size:22px 22px;-webkit-mask-image:linear-gradient(180deg,#000,transparent 70%);mask-image:linear-gradient(180deg,#000,transparent 70%);opacity:.55;pointer-events:none;}
.m1k .hero__inner{position:relative;}
.m1k .hero h1{font-size:clamp(34px,4.6vw,52px);line-height:1.05;letter-spacing:-0.03em;max-width:18ch;margin-top:16px;}
.m1k .hero h1 em{font-style:normal;color:var(--m1-accent);}
.m1k .hero__lead{max-width:60ch;font-size:19px;line-height:1.65;color:#2c3640;margin-top:20px;}
.m1k .stats{display:flex;flex-wrap:wrap;gap:14px;margin-top:32px;}
.m1k .stat{background:var(--surface);border:1px solid var(--outline);border-radius:var(--r-xl);padding:16px 20px;min-width:148px;}
.m1k .stat__v{font-family:var(--display);font-weight:700;font-size:26px;letter-spacing:-0.02em;}
.m1k .stat__l{margin-top:4px;font-size:13px;color:var(--text-warm);}
.m1k .stat__s{font-size:12px;color:var(--muted);}
.m1k .goal{margin-top:30px;display:flex;gap:14px;align-items:flex-start;background:var(--surface-low);border:1px solid var(--outline);border-left:3px solid var(--m1-accent);border-radius:var(--r-lg);padding:16px 18px;}
.m1k .goal__ic{color:var(--m1-accent);flex-shrink:0;margin-top:1px;}
.m1k .goal__k{display:block;color:var(--m1-accent);font-weight:600;font-size:11px;}
.m1k .goal p{margin-top:4px;font-size:15px;line-height:1.55;color:#2c3640;}

.m1k .tl-grid{display:grid;grid-template-columns:1fr 1fr;gap:36px;align-items:center;}
.m1k .tl-chart{width:100%;min-width:0;}
.m1k .timeline--tight .tl{padding:8px 0;}
.m1k .timeline{position:relative;padding-left:8px;}
.m1k .timeline::before{content:"";position:absolute;left:84px;top:8px;bottom:8px;width:2px;background:var(--outline);}
.m1k .tl{position:relative;display:grid;grid-template-columns:72px 1fr;gap:24px;padding:14px 0;}
.m1k .tl__date{font-family:var(--mono);font-size:12px;font-weight:600;color:var(--text-warm);text-align:right;padding-top:3px;}
.m1k .tl__body{position:relative;padding-left:30px;}
.m1k .tl__node{position:absolute;left:-9px;top:3px;width:16px;height:16px;border-radius:var(--r-pill);background:var(--surface);border:2px solid var(--m1-accent);box-shadow:0 0 0 4px var(--ground);}
.m1k .tl__node.is-last{background:var(--m1-accent);}
.m1k .tl__t{font-family:var(--display);font-weight:600;font-size:17px;}
.m1k .tl__d{font-size:14.5px;color:var(--muted);margin-top:3px;line-height:1.5;max-width:52ch;}
.m1k .reveal{opacity:0;transform:translateY(14px);transition:opacity .5s ease,transform .5s cubic-bezier(.2,.7,.3,1);}
.m1k .reveal.in{opacity:1;transform:none;}

.m1k .facts{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
.m1k .fact{background:var(--obsidian);color:var(--inverse-on);border-radius:var(--r-xl);padding:24px;}
.m1k .fact__ic{width:34px;height:34px;border-radius:var(--r-lg);background:rgba(255,255,255,.08);display:grid;place-items:center;color:#fff;margin-bottom:16px;}
.m1k .fact__v{font-family:var(--display);font-weight:700;font-size:30px;letter-spacing:-0.02em;color:#fff;}
.m1k .fact__l{margin-top:6px;font-size:14px;font-weight:600;}
.m1k .fact__s{font-size:13px;color:var(--inverse-dim);margin-top:2px;}

.m1k .arch{display:flex;flex-direction:column;gap:12px;}
.m1k .layer{background:var(--surface);border:1px solid var(--outline);border-radius:var(--r-xl);padding:16px 18px;display:grid;grid-template-columns:180px 1fr;gap:18px;align-items:center;}
.m1k .layer__name{display:flex;align-items:center;gap:10px;font-family:var(--display);font-weight:600;font-size:15px;}
.m1k .layer__tick{width:8px;height:34px;border-radius:var(--r-pill);flex-shrink:0;}
.m1k .chips{display:flex;flex-wrap:wrap;gap:8px;}
.m1k .chip{display:inline-flex;align-items:center;gap:7px;background:var(--surface-c);border:1px solid var(--outline);border-radius:var(--r-pill);padding:7px 13px;font-size:13.5px;font-weight:500;color:#2c3640;}
.m1k .chip svg{color:var(--muted);}

.m1k .fb{display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:14px;}
.m1k .fbrow{display:flex;gap:14px;background:var(--surface);border:1px solid var(--outline);border-radius:var(--r-lg);padding:16px 18px;transition:border-color .15s,box-shadow .15s;}
.m1k .fbrow:hover{border-color:var(--outline-warm);box-shadow:-3px 0 0 0 var(--m1-accent);}
.m1k .fbrow__ic{width:38px;height:38px;border-radius:var(--r-lg);background:var(--surface-low);color:var(--m1-accent);display:grid;place-items:center;flex-shrink:0;}
.m1k .fbrow h4{font-size:15.5px;font-weight:600;}
.m1k .fbrow p{font-size:14px;color:var(--muted);margin-top:4px;line-height:1.55;}

.m1k .eco{display:flex;flex-direction:column;max-width:860px;}
.m1k .eco__node{display:flex;gap:16px;background:var(--surface);border:1px solid var(--outline);border-radius:var(--r-xl);padding:18px 20px;align-items:flex-start;}
.m1k .eco__ic{width:42px;height:42px;border-radius:var(--r-lg);display:grid;place-items:center;color:#fff;flex-shrink:0;}
.m1k .eco__t{font-family:var(--display);font-weight:600;font-size:17px;}
.m1k .eco__sub{font-size:12.5px;color:var(--text-warm);font-weight:500;margin-top:1px;}
.m1k .eco__cap{font-size:14px;color:var(--muted);margin-top:7px;line-height:1.5;}
.m1k .eco__link{height:26px;width:2px;background:var(--outline);margin:0 0 0 41px;position:relative;}
.m1k .eco__link::after{content:"";position:absolute;left:-3px;bottom:0;width:8px;height:8px;border-right:2px solid var(--m1-accent);border-bottom:2px solid var(--m1-accent);transform:rotate(45deg);}
.m1k .eco__rel{margin-top:16px;background:var(--surface-low);border:1px dashed var(--outline-warm);border-radius:var(--r-lg);padding:14px 16px;font-size:14px;color:#2c3640;line-height:1.55;max-width:680px;}

.m1k .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;}
.m1k .uc{background:var(--surface);border:1px solid var(--outline);border-radius:var(--r-xl);padding:22px;transition:border-color .15s,transform .15s;}
.m1k .uc:hover{border-color:var(--outline-warm);transform:translateY(-2px);}
.m1k .uc__top{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
.m1k .uc__ic{width:40px;height:40px;border-radius:var(--r-lg);display:grid;place-items:center;color:#fff;}
.m1k .uc__tag{color:var(--text-warm);font-size:11px;}
.m1k .uc h4{font-size:17px;font-weight:600;}
.m1k .uc p{font-size:14px;color:var(--muted);margin-top:7px;line-height:1.55;}

.m1k .summary{margin-top:34px;background:var(--obsidian);color:var(--inverse-on);border-radius:var(--r-xl);padding:32px 34px;}
.m1k .summary .mono{color:var(--m1-accent-2);}
.m1k .summary p{font-family:var(--display);font-weight:600;font-size:22px;line-height:1.4;color:#fff;margin-top:12px;max-width:48ch;letter-spacing:-0.01em;}

.m1k .lessonnav{margin-top:48px;padding-top:22px;border-top:1px solid var(--outline);display:flex;align-items:center;justify-content:space-between;gap:16px;}
.m1k .btn{display:inline-flex;align-items:center;gap:9px;font-family:var(--body);font-weight:600;font-size:14.5px;border-radius:var(--r-sm);padding:12px 20px;cursor:pointer;border:1px solid transparent;transition:background .15s,border-color .15s;max-width:60%;}
.m1k .btn__txt{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.m1k .btn--ghost{background:transparent;border-color:var(--outline);color:var(--muted);}
.m1k .btn--ghost[disabled]{opacity:.45;cursor:not-allowed;}
.m1k .btn--primary{background:var(--m1-accent);color:#fff;box-shadow:0 1px 6px rgba(183,16,42,.28);}
.m1k .btn--primary:hover{background:#9d0d24;}
.m1k .btn--primary[disabled]{opacity:.7;cursor:default;}

@media (max-width:980px){
  .m1k .app{grid-template-columns:1fr;}
  .m1k .rail{position:fixed;top:0;left:0;height:100%;width:300px;max-width:86vw;z-index:80;transform:translateX(-100%);transition:transform .25s ease;}
  .m1k .rail.open{transform:none;box-shadow:0 0 50px rgba(20,29,35,.5);}
  .m1k .rail__close{display:flex;}
  .m1k .scrim{display:block;position:fixed;inset:0;background:rgba(20,29,35,.5);z-index:70;}
  .m1k .menu-btn{display:flex;}
  .m1k .facts,.m1k .fb,.m1k .cards{grid-template-columns:1fr;}
  .m1k .hero__grid,.m1k .m1-sec--split,.m1k .tl-grid{grid-template-columns:1fr;gap:24px;}
  .m1k .hero__aside,.m1k .split__aside{max-width:440px;}
  .m1k .layer{grid-template-columns:1fr;gap:12px;}
  .m1k .topbar,.m1k .stage{padding-left:16px;padding-right:16px;}
  .m1k .tl{grid-template-columns:58px 1fr;gap:14px;}
  .m1k .timeline::before{left:69px;}
}
@media (prefers-reduced-motion:reduce){
  .m1k .reveal{opacity:1;transform:none;transition:none;}
  .m1k .scroll{scroll-behavior:auto;}
  .m1k .acc,.m1k .rail{transition:none;}
}
`;
