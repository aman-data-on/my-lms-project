import { Target } from 'lucide-react';

const ACCENT = '#ED3237';

// Compact objective callout: icon + label + objective text. Accessible
// contrast, restrained padding — no large empty regions.
export function LearningObjectiveCallout({
  label = 'Your goal',
  text,
}: {
  label?: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#F1D2CE] bg-[#FFF6F5] px-4 py-3.5">
      <span
        className="flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg"
        style={{ background: 'rgba(237,50,55,0.12)', border: '1px solid rgba(237,50,55,0.30)', color: ACCENT }}
        aria-hidden="true"
      >
        <Target className="w-[18px] h-[18px]" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: ACCENT }}>{label}</p>
        <p className="text-[14.5px] text-[#221B1D] leading-relaxed mt-0.5">{text}</p>
      </div>
    </div>
  );
}
