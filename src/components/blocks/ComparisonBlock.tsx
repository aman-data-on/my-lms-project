import { Scale } from 'lucide-react';
import type { ComparisonData } from '../../lib/blocks';
import { cn } from '../../lib/cn';
import { ACCENT, BlockFallback, IconBubble, tokensFor, withAlpha, VisualShell, type Surface } from './_shared';

// Side-by-side comparison of two (or more) products / approaches / roles.
// Columns stack on narrow screens so nothing is squeezed.
export function ComparisonBlock({ data, surface }: { data: ComparisonData; surface: Surface }) {
  const columns = Array.isArray(data?.columns) ? data.columns.filter((c) => c?.label?.trim()) : [];
  if (columns.length === 0) return <BlockFallback surface={surface} message="No comparison columns provided." />;
  const t = tokensFor(surface);

  return (
    <VisualShell surface={surface} Icon={Scale} eyebrow={data.eyebrow || 'Comparison'} title={data.title || 'Side by Side'}>
      <div className={cn('grid gap-3', columns.length >= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2')}>
        {columns.map((col, i) => {
          const accent = col.accent || ACCENT;
          const points = Array.isArray(col.points) ? col.points.filter(Boolean) : [];
          return (
            <div key={i} className={cn('rounded-xl overflow-hidden flex flex-col', t.card)}>
              <div
                className="px-4 py-3 border-b flex items-center gap-2.5"
                style={{ background: withAlpha(accent, t.isDark ? '14' : '0D'), borderColor: withAlpha(accent, '30') }}
              >
                {col.icon && <IconBubble icon={col.icon} accent={accent} surface={surface} size={26} />}
                <div className="min-w-0">
                  <p className={cn('text-[14px] font-bold leading-tight', t.textPrimary)}>{col.label}</p>
                  {col.subtitle && <p className={cn('text-[11px] leading-tight mt-0.5', t.textSecondary)}>{col.subtitle}</p>}
                </div>
              </div>
              <ul className="px-4 py-3 space-y-2 flex-1">
                {points.map((pt, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <span className="mt-[7px] w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: accent }} aria-hidden="true" />
                    <span className={cn('text-[13px] leading-relaxed', t.textSecondary)}>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </VisualShell>
  );
}
