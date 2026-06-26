import { BarChart3 } from 'lucide-react';
import type { DataVisualizationData } from '../../lib/blocks';
import { cn } from '../../lib/cn';
import { ACCENT, BlockFallback, tokensFor, withAlpha, VisualShell, type Surface } from './_shared';

// Renders real numbers only — horizontal bars or a stat grid. No fabricated
// data: the migration must supply genuine figures or omit this block.
export function DataVisualization({ data, surface }: { data: DataVisualizationData; surface: Surface }) {
  const points = Array.isArray(data?.points)
    ? data.points.filter((p) => p && typeof p.value === 'number' && p.label?.trim())
    : [];
  if (points.length === 0) return <BlockFallback surface={surface} message="No data points provided." />;
  const t = tokensFor(surface);
  const kind = data.kind === 'stat' ? 'stat' : 'bar';
  const max = Math.max(...points.map((p) => p.value), 0) || 1;

  return (
    <VisualShell surface={surface} Icon={BarChart3} eyebrow={data.eyebrow || 'By the Numbers'} title={data.title || 'Key Metrics'}>
      {kind === 'stat' ? (
        <div className="grid grid-cols-2 gap-2.5">
          {points.map((p, i) => {
            const accent = p.accent || ACCENT;
            return (
              <div key={i} className={cn('rounded-xl p-4 text-center', t.card)}>
                <p className="text-2xl font-extrabold leading-none" style={{ color: accent }}>
                  {p.display ?? `${p.value}${data.unit ?? ''}`}
                </p>
                <p className={cn('text-[12px] mt-1.5 leading-snug', t.textSecondary)}>{p.label}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {points.map((p, i) => {
            const accent = p.accent || ACCENT;
            const pct = Math.max(4, Math.round((p.value / max) * 100));
            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className={cn('text-[13px]', t.textSecondary)}>{p.label}</span>
                  <span className={cn('text-[13px] font-bold', t.textPrimary)}>{p.display ?? `${p.value}${data.unit ?? ''}`}</span>
                </div>
                <div className={cn('h-2.5 rounded-full overflow-hidden', t.rail)}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: accent, boxShadow: `0 0 8px ${withAlpha(accent, '66')}` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
      {data.caption && <p className={cn('mt-4 text-[12px] leading-relaxed', t.textMuted)}>{data.caption}</p>}
    </VisualShell>
  );
}
