import { ChevronLeft, ChevronRight } from 'lucide-react';

const ACCENT = '#ED3237';

// End-of-content navigation: secondary Previous + contextual "Up next" + the
// primary "Next →" CTA. Lives at the natural end of the lesson, not as a
// detached slideshow bar.
export function LessonNavigation({
  onPrev,
  onNext,
  prevDisabled,
  nextLabel,
  upNextTitle,
  busy,
  sticky = false,
}: {
  onPrev: () => void;
  onNext: () => void;
  prevDisabled?: boolean;
  nextLabel: string;
  upNextTitle?: string | null;
  busy?: boolean;
  /** When true, render compact (no top margin/border) for use in a sticky footer bar. */
  sticky?: boolean;
}) {
  return (
    <div className={sticky
      ? 'flex flex-row items-center gap-3'
      : 'mt-10 pt-6 border-t border-[#E6E5E0] flex flex-col sm:flex-row sm:items-center gap-4'}
    >
      <button
        onClick={onPrev}
        disabled={prevDisabled}
        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#E6E5E0] text-[#5E555A] text-[14px] font-medium hover:bg-[#F2F1ED] disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ED3237]"
      >
        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        Previous
      </button>

      <div className="flex-1" />

      {upNextTitle && (
        <div className="text-left sm:text-right min-w-0">
          <p className="text-[11px] text-[#6B6E76] leading-none">Up next</p>
          <p className="text-[13px] font-medium text-[#221B1D] leading-snug truncate max-w-[260px]">{upNextTitle}</p>
        </div>
      )}

      <button
        onClick={onNext}
        disabled={busy}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-white text-[14px] font-semibold transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-60"
        style={{ background: ACCENT, boxShadow: '0 1px 6px rgba(237,50,55,0.25)' }}
      >
        {busy ? 'Saving…' : (
          <>
            {nextLabel}
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </>
        )}
      </button>
    </div>
  );
}
