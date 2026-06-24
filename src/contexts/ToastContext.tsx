import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '../lib/cn';

// ─── Types ───────────────────────────────────────────────────────────

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

// ─── Context ─────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Variant config ───────────────────────────────────────────────────

const VARIANT_CONFIG: Record<
  ToastVariant,
  { borderColor: string; iconColor: string; Icon: typeof CheckCircle2 }
> = {
  success: { borderColor: 'border-l-green-500',  iconColor: 'text-green-600',  Icon: CheckCircle2 },
  error:   { borderColor: 'border-l-red-500',    iconColor: 'text-red-600',    Icon: AlertCircle  },
  warning: { borderColor: 'border-l-amber-500',  iconColor: 'text-amber-600',  Icon: AlertTriangle },
  info:    { borderColor: 'border-l-blue-500',   iconColor: 'text-blue-600',   Icon: Info         },
};

const AUTO_DISMISS_MS = 4000;

// ─── Provider ────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message: string, variant: ToastVariant = 'info') => {
    setToasts(prev => {
      // Deduplicate: ignore if the same message+variant is already showing
      if (prev.some(t => t.message === message && t.variant === variant)) {
        return prev;
      }
      const id = crypto.randomUUID();
      // Schedule auto-dismiss (closure over id)
      setTimeout(() => {
        setToasts(current => current.filter(t => t.id !== id));
      }, AUTO_DISMISS_MS);
      return [...prev, { id, message, variant }];
    });
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {createPortal(
        /*
         * aria-live="polite" announces new toasts to screen readers without
         * interrupting whatever the user is currently reading.
         * aria-atomic="false" lets the reader announce each child toast
         * independently rather than re-reading the whole list.
         */
        <div
          aria-live="polite"
          aria-atomic="false"
          role="status"
          className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none"
        >
          {toasts.map(t => {
            const { borderColor, iconColor, Icon } = VARIANT_CONFIG[t.variant];
            return (
              <div
                key={t.id}
                className={cn(
                  'pointer-events-auto flex items-start gap-3 rounded-xl shadow-lg',
                  'bg-white border-l-4 p-4 w-80 max-w-[calc(100vw-3rem)]',
                  borderColor,
                )}
              >
                <Icon
                  className={cn('w-5 h-5 flex-shrink-0 mt-0.5', iconColor)}
                  aria-hidden="true"
                />
                <p className="flex-1 text-sm text-slate-700 leading-snug">
                  {t.message}
                </p>
                <button
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss notification"
                  className={cn(
                    'flex-shrink-0 min-h-[28px] min-w-[28px] flex items-center justify-center',
                    'rounded-md hover:bg-slate-100 transition-colors',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                  )}
                >
                  <X className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────

/**
 * Returns the `toast(message, variant?)` function.
 * Must be called inside a component tree wrapped by <ToastProvider>.
 */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within <ToastProvider>');
  }
  return ctx;
}
