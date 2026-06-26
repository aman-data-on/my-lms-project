import { TrendingUp } from 'lucide-react';
import type { TimelineData } from '../../lib/blocks';
import { cn } from '../../lib/cn';
import { ACCENT, BlockFallback, tokensFor, withAlpha, VisualShell, type Surface } from './_shared';
import { resolveBlockIcon } from './icons';

// Milestone progression styled like the reference: a circular icon badge on
// top, a year pill, title + description, and an accent node. Responsive grid
// (1→2→3→4 cols), full-width, no nested scrollbar — the page scrolls.
export function TimelineBlock({ data, surface }: { data: TimelineData; surface: Surface }) {
  const steps = Array.isArray(data?.steps) ? data.steps.filter((s) => s?.title?.trim()) : [];
  if (steps.length === 0) return <BlockFallback surface={surface} message="No timeline milestones provided." />;
  const t = tokensFor(surface);

  return (
    <VisualShell surface={surface} Icon={TrendingUp} eyebrow={data.eyebrow || 'Timeline'} title={data.title || 'Growth Timeline'}>
      <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr gap-x-4 gap-y-7 pt-2">
        {steps.map((step, i) => {
          const c = step.color || ACCENT;
          const Icon = resolveBlockIcon(step.icon);
          return (
            <li key={i} className="flex flex-col items-center text-center h-full">
              {/* Icon badge */}
              <span
                className="flex-shrink-0 inline-flex items-center justify-center w-14 h-14 rounded-full leading-none"
                style={{ background: withAlpha(c, '14'), border: `2px solid ${withAlpha(c, '55')}` }}
                aria-hidden="true"
              >
                {Icon
                  ? <Icon style={{ width: 24, height: 24, color: c }} strokeWidth={2} />
                  : <span className="w-3 h-3 rounded-full" style={{ background: c }} />}
              </span>

              {/* Card — flex-1 so every card fills its row to an equal height */}
              <div className={cn('mt-3 w-full flex-1 rounded-xl border px-3.5 py-3.5 flex flex-col items-center', t.card)}>
                {step.date && (
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold tabular-nums"
                    style={{ background: withAlpha(c, '16'), color: c }}
                  >
                    {step.date}
                  </span>
                )}
                <h4 className={cn('text-[14.5px] font-bold leading-snug mt-2', t.textPrimary)}>{step.title}</h4>
                {step.description && (
                  <p className={cn('text-[12.5px] leading-relaxed mt-1', t.textSecondary)}>{step.description}</p>
                )}
              </div>

              {/* Node */}
              <span className="mt-2.5 w-2.5 h-2.5 rounded-full" style={{ background: c, boxShadow: `0 0 0 4px ${withAlpha(c, '22')}` }} aria-hidden="true" />
            </li>
          );
        })}
      </ol>
    </VisualShell>
  );
}
