import { Check, Lock, Trophy, Zap } from 'lucide-react';

export interface SidebarTopic {
  id: string;
  label: string;            // e.g. "1.1" or "1"
  title: string;
  status: 'done' | 'active' | 'upcoming';
}

// Dark course sidebar (matches the approved reference): near-black rail, red as
// the single accent, green checks for completed lessons, locks for ones not yet
// reached. One consistent spacing scale; the active lesson is unmistakable
// (tinted row + flush red bar + red badge + red check).
const BG = '#191B1F';
const BG_ACTIVE = '#24272E';
const BG_BADGE = '#2A2D34';
const BORDER = '#2B2E35';
const TXT = '#F4F4F5';
const TXT_DIM = '#C7CACF';
const TXT_MUTE = '#73767E';
const ACCENT = '#ED3237';
const GREEN = '#34D399';
const TRACK = '#2C2F36';
const AMBER = '#F2B032';

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
}) {
  const pct = progressTotal > 0 ? Math.round((progressDone / progressTotal) * 100) : 0;

  return (
    <aside className="w-full h-full flex flex-col" style={{ background: BG }}>
      {/* Brand — height matches the top bar so the two top edges align */}
      <button
        onClick={onBack}
        aria-label="Back to courses"
        title={courseTitle}
        className="flex-shrink-0 flex items-center gap-2.5 px-5 h-16 border-b transition-colors hover:bg-white/[0.03]"
        style={{ borderColor: BORDER }}
      >
        <span className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: ACCENT }} aria-hidden="true">
          <Zap className="w-[18px] h-[18px] text-white" fill="#fff" strokeWidth={1.5} />
        </span>
        <span className="text-[16px] font-bold tracking-tight" style={{ color: TXT }}>leapswitch</span>
      </button>

      {/* Module identity + progress */}
      <div className="flex-shrink-0 px-5 pt-5 pb-5 border-b" style={{ borderColor: BORDER }}>
        <p className="text-[12px] font-bold" style={{ color: ACCENT }}>Module {moduleNumber}</p>
        <h2 className="text-[16px] font-bold leading-snug mt-1" style={{ color: TXT }}>{moduleTitle}</h2>
        <div className="mt-3.5">
          <p className="text-[12px] mb-2" style={{ color: TXT_MUTE }}>{progressDone} / {progressTotal} completed</p>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: TRACK }}>
            <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${pct}%`, background: ACCENT }} />
          </div>
        </div>
      </div>

      {/* Lesson navigation */}
      <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-3" aria-label="Module lessons">
        <ul className="space-y-0.5">
          <li>
            <SidebarItem active={overviewActive} status="active" title="Overview" onClick={onSelectOverview} isOverview />
          </li>
          {topics.map((topic, i) => (
            <li key={topic.id}>
              <SidebarItem
                active={topic.status === 'active'}
                status={topic.status}
                label={topic.label}
                title={topic.title}
                onClick={() => onSelectTopic(i)}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* Unlock / completion card */}
      <div className="flex-shrink-0 px-4 pb-4 pt-2">
        <div className="rounded-xl border px-4 py-4 text-center" style={{ background: '#1E2025', borderColor: BORDER }}>
          <span
            className="mx-auto inline-flex items-center justify-center w-10 h-10 rounded-full"
            style={{ background: pct >= 100 ? 'rgba(242,176,50,0.16)' : 'rgba(255,255,255,0.05)', color: pct >= 100 ? AMBER : TXT_MUTE }}
            aria-hidden="true"
          >
            <Trophy className="w-5 h-5" />
          </span>
          <p className="text-[12px] leading-snug mt-2.5" style={{ color: TXT_DIM }}>
            {pct >= 100 ? 'Module complete — well done!' : 'Complete all topics to finish this module'}
          </p>
          <div className="mt-3 flex items-center gap-2.5">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: TRACK }}>
              <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${pct}%`, background: ACCENT }} />
            </div>
            <span className="text-[11px] font-bold tabular-nums" style={{ color: ACCENT }}>{pct}%</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SidebarItem({
  active, status, label, title, onClick, isOverview = false,
}: {
  active: boolean; status: 'done' | 'active' | 'upcoming'; label?: string; title: string; onClick: () => void; isOverview?: boolean;
}) {
  const locked = status === 'upcoming';
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`group relative w-full flex items-center gap-3 rounded-lg pl-3 pr-2.5 py-2.5 text-left transition-[background-color,transform] duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ED3237] focus-visible:ring-inset motion-reduce:transition-none ${active ? '' : 'hover:translate-x-[3px] active:translate-x-[1px]'}`}
      style={{ background: active ? BG_ACTIVE : 'transparent' }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full" style={{ background: ACCENT }} aria-hidden="true" />}

      {/* number / status badge */}
      <span
        className="flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-bold transition-transform duration-150 ease-out group-hover:scale-105 group-active:scale-95 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        style={{
          background: active ? ACCENT : BG_BADGE,
          color: active ? '#fff' : status === 'done' ? TXT_DIM : TXT_MUTE,
        }}
        aria-hidden="true"
      >
        {isOverview ? '•' : label}
      </span>

      <span
        className="flex-1 min-w-0 text-[13px] leading-snug line-clamp-2"
        style={{ color: active ? TXT : locked ? TXT_MUTE : TXT_DIM, fontWeight: active ? 600 : 500 }}
      >
        {title}
      </span>

      {/* right indicator */}
      {!isOverview && (
        <span className="flex-shrink-0" aria-hidden="true">
          {active ? <Check className="w-4 h-4" style={{ color: ACCENT }} />
            : status === 'done' ? <Check className="w-4 h-4" style={{ color: GREEN }} />
            : <Lock className="w-3.5 h-3.5" style={{ color: TXT_MUTE }} />}
        </span>
      )}
    </button>
  );
}
