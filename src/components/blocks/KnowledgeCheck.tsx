import { useState } from 'react';
import { HelpCircle, Check, X } from 'lucide-react';
import type { KnowledgeCheckData, KCQuestion } from '../../lib/blocks';
import { cn } from '../../lib/cn';
import { ACCENT, BlockFallback, tokensFor, withAlpha, VisualShell, type Surface } from './_shared';

// Inline self-check after a meaningful concept. Reveals correctness on answer.
export function KnowledgeCheck({ data, surface }: { data: KnowledgeCheckData; surface: Surface }) {
  const questions = Array.isArray(data?.questions) ? data.questions.filter((q) => q?.question?.trim()) : [];
  if (questions.length === 0) return <BlockFallback surface={surface} message="No questions provided." />;

  return (
    <VisualShell surface={surface} Icon={HelpCircle} eyebrow={data.eyebrow || 'Knowledge Check'} title={data.title || 'Check Your Understanding'}>
      <div className="space-y-4">
        {questions.map((q, i) => (
          <Question key={i} q={q} surface={surface} />
        ))}
      </div>
    </VisualShell>
  );
}

function Question({ q, surface }: { q: KCQuestion; surface: Surface }) {
  const [selected, setSelected] = useState<number | null>(null);
  const t = tokensFor(surface);
  const options = Array.isArray(q.options) ? q.options : [];
  const answered = selected !== null;
  const isRight = selected === q.correct;

  return (
    <div className={cn('rounded-xl p-4', t.cardSubtle)}>
      <p className={cn('flex items-start gap-2 text-[14px] font-semibold mb-3', t.textPrimary)}>
        <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: ACCENT }} aria-hidden="true" />
        {q.question}
      </p>
      <div className="space-y-2" role="group">
        {options.map((opt, i) => {
          if (!opt?.trim()) return null;
          const correct = i === q.correct;
          const chosen = selected === i;
          let style: React.CSSProperties | undefined;
          let cls = t.card;
          if (answered) {
            if (correct) { cls = ''; style = { background: 'rgba(16,185,129,0.14)', border: '1px solid rgba(16,185,129,0.5)' }; }
            else if (chosen) { cls = ''; style = { background: 'rgba(239,68,68,0.14)', border: '1px solid rgba(239,68,68,0.5)' }; }
            else { cls = cn(t.card, 'opacity-55'); }
          }
          return (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => setSelected(i)}
              className={cn('w-full flex items-center justify-between gap-2 text-left px-3 py-2.5 rounded-lg text-[13px] transition-colors', cls, t.textPrimary)}
              style={style}
            >
              <span>{opt}</span>
              {answered && correct && <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#10B981' }} />}
              {answered && chosen && !correct && <X className="w-4 h-4 flex-shrink-0" style={{ color: '#EF4444' }} />}
            </button>
          );
        })}
      </div>
      {answered && (
        <div
          className="mt-3 rounded-lg px-3 py-2 text-[12.5px] leading-relaxed"
          style={{ background: withAlpha(ACCENT, t.isDark ? '12' : '0A') }}
        >
          <span className={cn('font-semibold', t.textPrimary)}>{isRight ? 'Correct! ' : 'Not quite. '}</span>
          <span className={t.textSecondary}>
            {q.explanation || (isRight ? 'Well done.' : 'The correct answer is highlighted in green.')}
          </span>
        </div>
      )}
    </div>
  );
}
