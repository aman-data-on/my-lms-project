import { Workflow } from 'lucide-react';
import type { ProcessFlowData } from '../../lib/blocks';
import { cn } from '../../lib/cn';
import { ACCENT, BlockFallback, tokensFor, VisualShell, type Surface } from './_shared';
import { resolveBlockIcon } from './icons';

// Ordered steps in a workflow / sequence. Numbered nodes on a connecting rail.
export function ProcessFlow({ data, surface }: { data: ProcessFlowData; surface: Surface }) {
  const steps = Array.isArray(data?.steps) ? data.steps.filter((s) => s?.title?.trim()) : [];
  if (steps.length === 0) return <BlockFallback surface={surface} message="No process steps provided." />;
  const t = tokensFor(surface);

  return (
    <VisualShell surface={surface} Icon={Workflow} eyebrow={data.eyebrow || 'Process'} title={data.title || 'Step by Step'}>
      <ol className="relative">
        {steps.map((step, i) => (
          <li key={i} className="relative flex gap-3.5 pb-5 last:pb-0">
            {i < steps.length - 1 && (
              <span className={cn('absolute left-[15px] top-8 bottom-0 w-px', t.rail)} aria-hidden="true" />
            )}
            <span
              className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold"
              style={{ background: ACCENT, color: '#fff' }}
            >
              {i + 1}
            </span>
            <div className="min-w-0 pt-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                {(() => { const Icon = resolveBlockIcon(step.icon); return Icon ? <Icon className="w-4 h-4 flex-shrink-0" style={{ color: ACCENT }} aria-hidden="true" /> : null; })()}
                <h4 className={cn('text-[14px] font-semibold leading-snug', t.textPrimary)}>{step.title}</h4>
              </div>
              {step.description && <p className={cn('text-[12.5px] leading-relaxed mt-1', t.textSecondary)}>{step.description}</p>}
            </div>
          </li>
        ))}
      </ol>
    </VisualShell>
  );
}
