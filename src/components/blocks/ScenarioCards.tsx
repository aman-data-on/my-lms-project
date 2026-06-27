import { ArrowRight, Lightbulb, MessageSquare } from 'lucide-react';
import type { ScenarioCardsData } from '../../lib/blocks';
import { cn } from '../../lib/cn';
import { ACCENT, BlockFallback, HOVER_CARD, tokensFor, withAlpha, VisualShell, type Surface } from './_shared';
import { resolveBlockIcon } from './icons';

// Real-world situation → recommended solution. Teaches applied judgement.
export function ScenarioCards({ data, surface }: { data: ScenarioCardsData; surface: Surface }) {
  const scenarios = Array.isArray(data?.scenarios) ? data.scenarios.filter((s) => s?.situation?.trim()) : [];
  if (scenarios.length === 0) return <BlockFallback surface={surface} message="No scenarios provided." />;
  const t = tokensFor(surface);

  return (
    <VisualShell surface={surface} Icon={Lightbulb} eyebrow={data.eyebrow || 'Scenario'} title={data.title || 'Situation → Solution'}>
      <div className="space-y-2.5">
        {scenarios.map((s, i) => (
          <div key={i} className={cn('rounded-xl p-3.5', t.card, HOVER_CARD)}>
            <div className="flex items-start gap-2.5">
              {(() => { const Icon = resolveBlockIcon(s.icon) ?? MessageSquare; return <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: ACCENT }} aria-hidden="true" />; })()}
              <div className="min-w-0 flex-1">
                <p className={cn('text-[13px] leading-relaxed', t.textPrimary)}>{s.situation}</p>
                <div
                  className="mt-2.5 flex items-start gap-2 rounded-lg px-3 py-2"
                  style={{ background: withAlpha(ACCENT, t.isDark ? '14' : '0D'), border: `1px solid ${withAlpha(ACCENT, '2E')}` }}
                >
                  <ArrowRight className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: ACCENT }} aria-hidden="true" />
                  <div className="min-w-0">
                    <p className={cn('text-[13px] font-semibold leading-snug', t.textPrimary)}>{s.recommended}</p>
                    {s.note && <p className={cn('text-[12px] leading-relaxed mt-0.5', t.textSecondary)}>{s.note}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </VisualShell>
  );
}
