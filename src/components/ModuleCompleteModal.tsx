import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Award, CheckCircle2, ArrowRight, LayoutGrid } from 'lucide-react';
import { Button } from './ui/Button';
import { ProgressBar } from './ui/ProgressBar';

// ─────────────────────────────────────────────────────────────────────────────
// Module-completion celebration. Shown after a learner marks a module complete —
// the next module is auto-unlocked on completion (no manual step); navigation stays
// deliberate (Continue to the next module / Return to Course Overview). Premium,
// subtle celebration (a brand-red
// Award mark that pops in with a soft ring + a few sparkles) — no flashy confetti.
// The module name + learning objective are real (from the DB); the headline and
// encouragement line are UI copy, not lesson facts.
// ─────────────────────────────────────────────────────────────────────────────

const FOCUSABLE = [
  'button:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export interface ModuleCompleteModalProps {
  open: boolean;
  /** Name of the module just completed (module-number prefix stripped). */
  moduleName: string;
  /** The module's authored learning objective ("Goal") — null hides the line. */
  objective: string | null;
  /** Modules completed so far (this one included) and total in the course. */
  completedCount: number;
  totalModules: number;
  /** Next module's 1-based number + name; null when there is no next module. */
  nextModuleNumber: number | null;
  nextModuleName: string | null;
  /** Primary "Continue to Module N" → close + navigate to the (already-unlocked) next module. */
  onContinue: () => void;
  /** Dismiss (ESC, backdrop, secondary button) → the course overview page. */
  onDismiss: () => void;
}

export function ModuleCompleteModal({
  open,
  moduleName,
  objective,
  completedCount,
  totalModules,
  nextModuleNumber,
  nextModuleName,
  onContinue,
  onDismiss,
}: ModuleCompleteModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();

  // Keep dismiss stable inside the key handler.
  const onDismissRef = useRef(onDismiss);
  useEffect(() => { onDismissRef.current = onDismiss; });

  // Focus trap + Escape. ESC routes to the course overview (onDismiss) — never to the
  // next module — so dismissing is always a safe, non-advancing action.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const prevFocused = document.activeElement as HTMLElement | null;
    const focusables = () => Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
    focusables()[0]?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.preventDefault(); onDismissRef.current(); return; }
      if (e.key !== 'Tab') return;
      const els = focusables();
      if (els.length === 0) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      prevFocused?.focus();
    };
  }, [open]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  const pct = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;
  const hasNext = nextModuleNumber != null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      {...(objective ? { 'aria-describedby': descId } : {})}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm mcm-backdrop"
        aria-hidden="true"
        onClick={onDismiss}
      />

      {/* Panel — centered, responsive, scrolls if the viewport is short */}
      <div
        ref={panelRef}
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-7 text-center shadow-2xl sm:p-8 mcm-panel"
      >
        {/* Success icon + subtle celebration (ring pulse + sparkles) */}
        <div className="relative mx-auto mb-5 h-16 w-16">
          <span className="mcm-ring absolute inset-0 rounded-full bg-primary-200" aria-hidden="true" />
          <span className="mcm-spark mcm-spark--1 absolute h-1.5 w-1.5 rounded-full bg-primary-400" aria-hidden="true" />
          <span className="mcm-spark mcm-spark--2 absolute h-1 w-1 rounded-full bg-primary-500" aria-hidden="true" />
          <span className="mcm-spark mcm-spark--3 absolute h-1.5 w-1.5 rounded-full bg-primary-300" aria-hidden="true" />
          <span className="mcm-spark mcm-spark--4 absolute h-1 w-1 rounded-full bg-primary-400" aria-hidden="true" />
          <span className="mcm-icon relative flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
            <Award className="h-12 w-12 text-primary-600" strokeWidth={1.75} aria-hidden="true" />
          </span>
        </div>

        {/* Headline + motivational message */}
        <h2 id={titleId} className="text-2xl font-bold text-slate-900">Congratulations!</h2>
        <p className="mx-auto mt-1.5 max-w-[40ch] text-sm leading-relaxed text-slate-500">
          Great work — you’ve completed another module. Keep up the momentum.
        </p>

        {/* Module completion summary */}
        <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-600">Module complete</p>
          <p className="mt-0.5 text-base font-semibold text-slate-800">{moduleName}</p>
          {objective && (
            <p id={descId} className="mx-auto mt-1 max-w-[42ch] text-sm leading-relaxed text-slate-500">
              {objective}
            </p>
          )}
        </div>

        {/* Progress update + current completion percentage */}
        <div className="mt-5 text-left">
          <ProgressBar value={pct} size="md" label="Course progress" showValue />
          <p className="mt-1.5 text-center text-xs font-medium tabular-nums text-slate-500">
            {completedCount} of {totalModules} modules complete
          </p>
        </div>

        {/* Next module unlocked + name */}
        {hasNext && (
          <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>
              Module {nextModuleNumber} unlocked
              {nextModuleName && <span className="text-emerald-600/80"> · {nextModuleName}</span>}
            </span>
          </div>
        )}

        {/* Actions — primary first in DOM (initial focus); row-reverse puts it on
            the right on desktop and on top on mobile. */}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row-reverse">
          {hasNext && (
            <Button size="lg" onClick={onContinue} className="sm:flex-1">
              Continue to Module {nextModuleNumber}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
          <Button variant="secondary" size="lg" onClick={onDismiss} className="sm:flex-1">
            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
            Return to Course Overview
          </Button>
        </div>
      </div>

      <style>{`
        .mcm-backdrop { animation: mcmFade 300ms ease-out both; }
        .mcm-panel { animation: mcmIn 320ms ease-out both; }
        .mcm-icon { animation: mcmPop 460ms cubic-bezier(0.22, 1, 0.36, 1) both; }
        .mcm-ring { animation: mcmRing 900ms ease-out both; }
        .mcm-spark { opacity: 0; }
        .mcm-spark--1 { top: -2px; left: 10px; animation: mcmSpark 760ms ease-out 140ms both; }
        .mcm-spark--2 { top: 8px; right: -4px; animation: mcmSpark 760ms ease-out 240ms both; }
        .mcm-spark--3 { bottom: 0; left: -2px; animation: mcmSpark 760ms ease-out 320ms both; }
        .mcm-spark--4 { bottom: 6px; right: 8px; animation: mcmSpark 760ms ease-out 200ms both; }
        @keyframes mcmFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes mcmIn {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes mcmPop {
          from { opacity: 0; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes mcmRing {
          from { opacity: 0.45; transform: scale(0.8); }
          to   { opacity: 0; transform: scale(1.9); }
        }
        @keyframes mcmSpark {
          0%   { opacity: 0; transform: scale(0.4); }
          45%  { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.6) translateY(-5px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .mcm-backdrop, .mcm-panel, .mcm-icon { animation: none; }
          .mcm-ring, .mcm-spark { animation: none; opacity: 0; }
        }
      `}</style>
    </div>,
    document.body,
  );
}
