import { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Layers } from 'lucide-react';
import type { FlashcardData } from '../../lib/blocks';
import { cn } from '../../lib/cn';
import { ACCENT, BlockFallback, tokensFor, withAlpha, VisualShell, type Surface } from './_shared';

// Term → definition recall. Click/Enter flips; arrows move between cards.
export function Flashcards({ data, surface }: { data: FlashcardData; surface: Surface }) {
  const cards = Array.isArray(data?.cards) ? data.cards.filter((c) => c?.front?.trim() || c?.back?.trim()) : [];
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  if (cards.length === 0) return <BlockFallback surface={surface} message="No flashcards provided." />;
  const t = tokensFor(surface);
  const card = cards[Math.min(idx, cards.length - 1)];
  const go = (d: number) => { setFlipped(false); setIdx((idx + d + cards.length) % cards.length); };

  return (
    <VisualShell surface={surface} Icon={Layers} eyebrow={data.eyebrow || 'Flashcards'} title={data.title || 'Quick Recall'}>
      <div className="flex flex-col items-center">
        <p className={cn('text-[11px] font-mono mb-2', t.textMuted)}>{idx + 1} / {cards.length}</p>
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          aria-pressed={flipped}
          aria-label={flipped ? 'Show term' : 'Reveal answer'}
          className={cn(
            'w-full min-h-[150px] rounded-2xl flex flex-col items-center justify-center text-center px-6 py-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ED3237]',
            t.card,
          )}
          style={flipped ? { background: withAlpha(ACCENT, t.isDark ? '1A' : '0D'), borderColor: withAlpha(ACCENT, '40') } : undefined}
        >
          <span className="text-[9px] font-mono font-bold uppercase tracking-[0.16em] mb-2" style={{ color: ACCENT }}>
            {flipped ? 'Answer' : 'Term'}
          </span>
          <span className={cn('text-[16px] font-medium leading-snug', t.textPrimary)}>{flipped ? card.back : card.front}</span>
          <span className={cn('mt-3 inline-flex items-center gap-1 text-[11px]', t.textMuted)}>
            <RotateCcw className="w-3 h-3" aria-hidden="true" /> tap to flip
          </span>
        </button>
        <div className="flex items-center gap-2 mt-3">
          <button type="button" onClick={() => go(-1)} aria-label="Previous card" className={cn('p-2 rounded-lg', t.chip)}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next card" className={cn('p-2 rounded-lg', t.chip)}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </VisualShell>
  );
}
