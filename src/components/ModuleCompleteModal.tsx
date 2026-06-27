import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Award, CheckCircle2, ArrowRight, LayoutDashboard } from 'lucide-react';
import { Button } from './ui/Button';
import { ProgressBar } from './ui/ProgressBar';

// ─────────────────────────────────────────────────────────────────────────────
// Module-completion celebration. Shown after a learner marks a module complete —
// the next module is unlocked but navigation is deliberate (Continue / Back),
// never automatic. Professional tone: a single brand-red Award mark, no confetti.
// All copy is real: the module name and learning objective come from the DB.
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
  /** Continue → next module. */
  onContinue: () => void;
  /** Dismiss (ESC, backdrop, secondary button) → the global dashboard. */
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

  // Focus trap + Escape. ESC routes to the dashboard (onDismiss) — never to the
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

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative w-full max-w-md rounded-2xl bg-white p-7 text-center shadow-2xl sm:p-8 mcm-panel"
      >
        {/* Award — brand red, 48px */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
          <Award className="h-12 w-12 text-primary-600" strokeWidth={1.75} aria-hidden="true" />
        </div>

        <h2 id={titleId} className="text-xl font-bold text-slate-900">Module Complete</h2>
        <p className="mt-1 text-base font-semibold text-slate-700">{moduleName}</p>

        {objective && (
          <p id={descId} className="mx-auto mt-3 max-w-[42ch] text-sm leading-relaxed text-slate-500">
            {objective}
          </p>
        )}

        {/* Course progress */}
        <div className="mt-6">
          <ProgressBar value={pct} size="md" />
          <p className="mt-2 text-xs font-medium tabular-nums text-slate-500">
            {completedCount} / {totalModules} modules complete
          </p>
        </div>

        {/* Next module unlocked */}
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
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      <style>{`
        .mcm-backdrop { animation: mcmFade 300ms ease-out both; }
        .mcm-panel { animation: mcmIn 300ms ease-out both; }
        @keyframes mcmFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes mcmIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .mcm-backdrop, .mcm-panel { animation: none; }
        }
      `}</style>
    </div>,
    document.body,
  );
}
