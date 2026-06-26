import { ArrowRight, Target } from 'lucide-react';
import type { FeatureBenefitData } from '../../lib/blocks';
import { cn } from '../../lib/cn';
import { ACCENT, BlockFallback, IconBubble, tokensFor, VisualShell, type Surface } from './_shared';

// Maps a capability (feature / value prop) to why it matters for the customer.
// Each row: Feature → Benefit, so reps learn to translate, not just list.
export function FeatureBenefit({ data, surface }: { data: FeatureBenefitData; surface: Surface }) {
  const pairs = Array.isArray(data?.pairs) ? data.pairs.filter((p) => p?.feature?.trim() || p?.benefit?.trim()) : [];
  if (pairs.length === 0) return <BlockFallback surface={surface} message="No feature/benefit pairs provided." />;
  const t = tokensFor(surface);

  return (
    <VisualShell surface={surface} Icon={Target} eyebrow={data.eyebrow || 'Feature → Benefit'} title={data.title || 'Why It Matters'}>
      <ul className="space-y-2.5">
        {pairs.map((pair, i) => (
          <li key={i} className={cn('rounded-xl p-3.5', t.card)}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2.5 sm:w-[42%] flex-shrink-0">
                <IconBubble icon={pair.icon} surface={surface} size={32} />
                <span className={cn('text-[15px] lg:text-[16px] font-semibold leading-snug', t.textPrimary)}>{pair.feature}</span>
              </div>
              <ArrowRight
                className="hidden sm:block w-4 h-4 flex-shrink-0 rotate-90 sm:rotate-0"
                style={{ color: ACCENT }}
                aria-hidden="true"
              />
              <span className={cn('text-[14px] lg:text-[15px] leading-relaxed flex-1', t.textSecondary)}>{pair.benefit}</span>
            </div>
          </li>
        ))}
      </ul>
    </VisualShell>
  );
}
