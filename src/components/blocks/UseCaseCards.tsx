import { Users } from 'lucide-react';
import type { UseCaseCardsData } from '../../lib/blocks';
import { cn } from '../../lib/cn';
import { ACCENT, BlockFallback, HOVER_CARD, IconBubble, tokensFor, withAlpha, VisualShell, type Surface } from './_shared';

// Cards showing how different customer types / industries use a product.
// Each card is vertically centred: icon badge on top, then persona, title and
// description — all centre-aligned. Equal-height cells (auto-rows-fr).
export function UseCaseCards({ data, surface }: { data: UseCaseCardsData; surface: Surface }) {
  const cases = Array.isArray(data?.cases) ? data.cases.filter((c) => c?.title?.trim()) : [];
  if (cases.length === 0) return <BlockFallback surface={surface} message="No use cases provided." />;
  const t = tokensFor(surface);

  return (
    <VisualShell surface={surface} Icon={Users} eyebrow={data.eyebrow || 'Use Cases'} title={data.title || 'Who Uses This'}>
      <div className="grid grid-cols-1 sm:grid-cols-2 auto-rows-fr gap-2.5">
        {cases.map((c, i) => {
          const accent = c.accent || ACCENT;
          return (
            <div key={i} className={cn('group rounded-xl p-4 h-full flex flex-col items-center justify-center text-center', t.card, HOVER_CARD)}>
              <IconBubble icon={c.icon} accent={accent} surface={surface} size={44} />
              {c.persona && (
                <p className="mt-3 text-[9px] font-mono font-bold uppercase tracking-[0.16em]" style={{ color: accent }}>
                  {c.persona}
                </p>
              )}
              <p className={cn('text-[14px] font-semibold leading-tight mt-1 transition-colors duration-200', t.textPrimary)}>{c.title}</p>
              <p className={cn('text-[12.5px] leading-relaxed mt-1.5 transition-colors duration-200 group-hover:text-[#3A3338]', t.textSecondary)}>{c.description}</p>
              <span className="mt-3 h-[2px] w-8 rounded-full" style={{ background: withAlpha(accent, '99') }} aria-hidden="true" />
            </div>
          );
        })}
      </div>
    </VisualShell>
  );
}
