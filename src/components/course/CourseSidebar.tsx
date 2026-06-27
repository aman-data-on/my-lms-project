import { Check, ChevronLeft, LayoutGrid, Lock, Trophy, Zap } from 'lucide-react';

export interface SidebarTopic {
  id: string;
  label: string;            // e.g. "1.1" or "1"
  title: string;
  status: 'done' | 'active' | 'upcoming';
}

// Light course sidebar — clean off-white rail, brand red as the single accent,
// ink-black headings, green checks for completed lessons, locks for ones not yet
// reached. The rail auto-collapses to a slim icon strip and expands on hover
// (desktop), so the reading canvas can use the full screen width.
//
// Colour language (no dark surfaces):
const BG = '#FFFFFF';
const BG_SUBTLE = '#FBFAF8';
const BG_ACTIVE = '#FFF1F0';
const BG_BADGE = '#F2F1ED';
const BORDER = '#ECEAE5';
const INK = '#1A1A1A';
const INK_DIM = '#4A4347';
const INK_MUTE = '#94908C';
const ACCENT = '#ED3237';
const GREEN = '#16A34A';
const TRACK = '#EFE4E2';
const AMBER = '#E08A00';

export function CourseSidebar({
  courseTitle,
  moduleNumber,
  moduleTitle,
  topics,
  overviewActive,
  progressDone,
  progressTotal,
  onBack,
  onSelectOverview,
  onSelectTopic,
  /** When true the rail renders fully expanded (mobile drawer); hover-collapse is disabled. */
  forceExpanded = false,
}: {
  courseTitle: string;
  moduleNumber: number;
  moduleTitle: string;
  topics: SidebarTopic[];
  overviewActive: boolean;
  progressDone: number;
  progressTotal: number;
  onBack: () => void;
  onSelectOverview: () => void;
  onSelectTopic: (index: number) => void;
  forceExpanded?: boolean;
}) {
  const pct = progressTotal > 0 ? Math.round((progressDone / progressTotal) * 100) : 0;

  // `group` + peer-less hover: when collapsed, the rail shows only icons; on
  // hover the parent wrapper widens (see LessonWorkspace) and labels fade in.
  // We drive label visibility purely off the wrapper width via CSS so there is
  // no React state to thrash on every mouse move.
  const expandable = !forceExpanded;

  return (
    <aside
      className="w-full h-full flex flex-col overflow-hidden"
      style={{ background: BG, borderRight: `1px solid ${BORDER}` }}
    >
      {/* Brand — height matches the top bar so the two top edges align */}
      <button
        onClick={onBack}
        aria-label="Back to courses"
        title={courseTitle}
        className="flex-shrink-0 flex items-center gap-2.5 px-[18px] h-16 border-b transition-colors hover:bg-[#FBF6F6]"
        style={{ borderColor: BORDER }}
      >
        <span
          className="flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-xl shadow-sm"
          style={{ background: ACCENT, boxShadow: '0 2px 8px rgba(237,50,55,0.35)' }}
          aria-hidden="true"
        >
          <Zap className="w-[18px] h-[18px] text-white" fill="#fff" strokeWidth={1.5} />
        </span>
        <span
          className={`text-[17px] font-extrabold tracking-tight whitespace-nowrap transition-opacity duration-200 ${expandable ? 'opacity-0 group-hover/rail:opacity-100' : 'opacity-100'}`}
          style={{ color: INK }}
        >
          leapswitch
        </span>
      </button>

      {/* Module identity + progress */}
      <div className="flex-shrink-0 px-[18px] pt-5 pb-5 border-b" style={{ borderColor: BORDER }}>
        {/* Collapsed: a single progress ring stands in for the whole block */}
        {expandable && (
          <div className="group-hover/rail:hidden flex justify-center">
            <ProgressRing pct={pct} size={40} />
          </div>
        )}

        <div className={expandable ? 'hidden group-hover/rail:block' : 'block'}>
          <p className="text-[12px] font-bold tracking-wide" style={{ color: ACCENT }}>Module {moduleNumber}</p>
          <h2 className="text-[16px] font-bold leading-snug mt-1" style={{ color: INK }}>{moduleTitle}</h2>
          <div className="mt-3.5">
            <p className="text-[12px] mb-2 font-medium" style={{ color: INK_MUTE }}>
              {progressDone} / {progressTotal} completed
            </p>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: TRACK }}>
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{ width: `${pct}%`, background: ACCENT }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lesson navigation */}
      <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2.5 py-3" aria-label="Module lessons">
        <ul className="space-y-1">
          <li>
            <SidebarItem
              active={overviewActive}
              status="active"
              title="Overview"
              onClick={onSelectOverview}
              isOverview
              expandable={expandable}
            />
          </li>
          {topics.map((topic, i) => (
            <li key={topic.id}>
              <SidebarItem
                active={topic.status === 'active'}
                status={topic.status}
                label={topic.label}
                title={topic.title}
                onClick={() => onSelectTopic(i)}
                expandable={expandable}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* Unlock / completion card */}
      <div className="flex-shrink-0 px-3 pb-3 pt-2">
        {/* Collapsed: just the trophy chip */}
        {expandable && (
          <div className="group-hover/rail:hidden flex justify-center">
            <span
              className="inline-flex items-center justify-center w-10 h-10 rounded-full"
              style={{
                background: pct >= 100 ? 'rgba(224,138,0,0.12)' : '#F4F2EE',
                color: pct >= 100 ? AMBER : INK_MUTE,
              }}
              aria-hidden="true"
            >
              <Trophy className="w-5 h-5" />
            </span>
          </div>
        )}

        <div
          className={`rounded-2xl border px-4 py-4 text-center ${expandable ? 'hidden group-hover/rail:block' : 'block'}`}
          style={{ background: BG_SUBTLE, borderColor: BORDER }}
        >
          <span
            className="mx-auto inline-flex items-center justify-center w-11 h-11 rounded-full"
            style={{
              background: pct >= 100 ? 'rgba(224,138,0,0.14)' : '#F1EFEB',
              color: pct >= 100 ? AMBER : INK_MUTE,
            }}
            aria-hidden="true"
          >
            <Trophy className="w-5 h-5" />
          </span>
          <p className="text-[12px] leading-snug mt-2.5 font-medium" style={{ color: INK_DIM }}>
            {pct >= 100 ? 'Module complete — well done!' : 'Complete all lessons to unlock the module'}
          </p>
          <div className="mt-3 flex items-center gap-2.5">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: TRACK }}>
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{ width: `${pct}%`, background: ACCENT }}
              />
            </div>
            <span className="text-[11px] font-bold tabular-nums" style={{ color: ACCENT }}>{pct}%</span>
          </div>
        </div>
      </div>

      {/* Collapse hint chevron (desktop, collapsed state) */}
      {expandable && (
        <div className="group-hover/rail:hidden flex-shrink-0 flex justify-center pb-3" aria-hidden="true">
          <span
            className="inline-flex items-center justify-center w-7 h-7 rounded-lg"
            style={{ background: BG_BADGE, color: INK_MUTE }}
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
          </span>
        </div>
      )}
    </aside>
  );
}

function ProgressRing({ pct, size = 40 }: { pct: number; size?: number }) {
  const stroke = 3.5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <span className="relative inline-flex" style={{ width: size, height: size }} aria-hidden="true">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={TRACK} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={ACCENT}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          className="transition-[stroke-dasharray] duration-700"
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tabular-nums"
        style={{ color: ACCENT }}
      >
        {pct}
      </span>
    </span>
  );
}

function SidebarItem({
  active, status, label, title, onClick, isOverview = false, expandable,
}: {
  active: boolean;
  status: 'done' | 'active' | 'upcoming';
  label?: string;
  title: string;
  onClick: () => void;
  isOverview?: boolean;
  expandable: boolean;
}) {
  const locked = status === 'upcoming';
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      title={title}
      className="group relative w-full flex items-center gap-3 rounded-xl pl-2.5 pr-2.5 py-2.5 text-left transition-colors"
      style={{ background: active ? BG_ACTIVE : 'transparent' }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = BG_SUBTLE; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      {active && (
        <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full" style={{ background: ACCENT }} aria-hidden="true" />
      )}

      {/* number / status badge */}
      <span
        className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg text-[11px] font-bold transition-colors"
        style={{
          background: active ? ACCENT : BG_BADGE,
          color: active ? '#fff' : status === 'done' ? GREEN : INK_MUTE,
        }}
        aria-hidden="true"
      >
        {isOverview ? <LayoutGrid className="w-4 h-4" /> : status === 'done' ? <Check className="w-4 h-4" strokeWidth={3} /> : label}
      </span>

      <span
        className={`flex-1 min-w-0 text-[13px] leading-snug line-clamp-2 whitespace-nowrap overflow-hidden transition-opacity duration-200 ${expandable ? 'opacity-0 group-hover/rail:opacity-100' : 'opacity-100'}`}
        style={{ color: active ? INK : locked ? INK_MUTE : INK_DIM, fontWeight: active ? 600 : 500 }}
      >
        {title}
      </span>

      {/* right indicator */}
      {!isOverview && (
        <span
          className={`flex-shrink-0 transition-opacity duration-200 ${expandable ? 'opacity-0 group-hover/rail:opacity-100' : 'opacity-100'}`}
          aria-hidden="true"
        >
          {active ? <Check className="w-4 h-4" style={{ color: ACCENT }} strokeWidth={2.5} />
            : status === 'done' ? <Check className="w-4 h-4" style={{ color: GREEN }} strokeWidth={2.5} />
            : <Lock className="w-3.5 h-3.5" style={{ color: INK_MUTE }} />}
        </span>
      )}
    </button>
  );
}
