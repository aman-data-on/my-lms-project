import type { ReactNode, ComponentType } from 'react';
import { cn } from '../../lib/cn';
import { resolveBlockIcon } from './icons';

// ─── Surface model ─────────────────────────────────────────────────────
// Learning visuals render on one of two LIGHT surfaces — no black backgrounds.
//   'tinted' — soft warm-rose panel (brand red family), used in the reader's
//              VisualPanel; white inner cards keep content crisp.
//   'plain'  — neutral white, used inline / on already-light contexts.
// Red is the single evident accent; the rest of the palette stays minimal.

export type Surface = 'tinted' | 'plain';

export const ACCENT = '#ED3237';

// ─── Interaction language (shared so every surface feels consistent) ──────
// Premium, restrained: short 150–200ms transitions, warm border, a soft shadow
// and a 2px rise on hover; movement is removed under prefers-reduced-motion.

/** Tangible hover for content cards (use-case / feature / comparison / scenario /
 *  timeline). Multi-property so it reads at a glance: 3px lift, accent border, a
 *  deeper accent-tinted shadow and a faint warm tint. Reserve for genuine content
 *  cards — NOT purely informational KPI/stat readouts (keep those static). */
export const HOVER_CARD =
  'transition-[border-color,box-shadow,transform,background-color] duration-200 ease-out ' +
  'hover:border-[#ED3237]/55 hover:bg-[#FFF7F6] hover:-translate-y-[3px] ' +
  'hover:shadow-[0_18px_38px_-20px_rgba(237,50,55,0.42)] ' +
  'motion-reduce:transition-none motion-reduce:hover:translate-y-0';

/** Tactile press + keyboard focus ring for clickable surfaces (press is quick). */
export const PRESSABLE =
  'transition-[background-color,border-color,box-shadow,transform,color] duration-200 ease-out ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ED3237] focus-visible:ring-offset-1 ' +
  'active:translate-y-px active:duration-100 motion-reduce:transition-none motion-reduce:active:translate-y-0';

export interface SurfaceTokens {
  /** Retained for token-shape compatibility; both surfaces are light. */
  isDark: boolean;
  /** Panel background (inline style colour). */
  panel: string;
  /** Standard content card classes. */
  card: string;
  /** Quieter card variant. */
  cardSubtle: string;
  textPrimary: string;
  textSecondary: string;
  /** For small non-essential labels only — not body copy. */
  textMuted: string;
  /** Border colour class for dividers. */
  divider: string;
  /** Connector / rail background class. */
  rail: string;
  /** Neutral chip. */
  chip: string;
}

// "tinted" = the primary surface for learning visuals: a soft warm-rose panel
// (brand red family) with white inner cards. No black backgrounds anywhere —
// red carries the brand as the evident accent, the palette stays minimal.
const TINTED: SurfaceTokens = {
  isDark: false,
  panel: '#FBEAE7',
  card: 'bg-white border border-[#F3D9D6]',
  cardSubtle: 'bg-[#FFF6F5] border border-[#F3D9D6]',
  textPrimary: 'text-[#221B1D]',
  textSecondary: 'text-[#5E555A]',
  textMuted: 'text-[#938890]',
  divider: 'border-[#F1D2CE]',
  rail: 'bg-[#EFCFCB]',
  chip: 'bg-white border border-[#F3D9D6] text-[#5E555A]',
};

// "plain" = neutral white surface for inline / on-light contexts.
const PLAIN: SurfaceTokens = {
  isDark: false,
  panel: '#FFFFFF',
  card: 'bg-white border border-[#E6E5E0]',
  cardSubtle: 'bg-[#FAFAF8] border border-[#E6E5E0]',
  textPrimary: 'text-[#221B1D]',
  textSecondary: 'text-[#5E555A]',
  textMuted: 'text-[#938890]',
  divider: 'border-[#E6E5E0]',
  rail: 'bg-[#E6E5E0]',
  chip: 'bg-[#F2F1ED] border border-[#E6E5E0] text-[#5E555A]',
};

export function tokensFor(surface: Surface): SurfaceTokens {
  return surface === 'plain' ? PLAIN : TINTED;
}

/** Adds transparency to a hex colour for tints/glows. `hex8('#ED3237','22')`. */
export function withAlpha(hex: string, alpha: string): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex;
  return `${hex}${alpha}`;
}

// ─── Panel chrome ──────────────────────────────────────────────────────
// Shared shell: red accent strip, optional header with a consistent (lucide)
// icon, and NATURAL height — the page scrolls, never the block (no nested
// scrollbars), per the visual-reference spec.
export function VisualShell({
  surface,
  eyebrow,
  title,
  Icon,
  footer,
  children,
  pad = true,
}: {
  surface: Surface;
  eyebrow?: string;
  title?: string;
  /** A lucide icon component (consistent icon system — never emoji). */
  Icon?: ComponentType<{ className?: string }>;
  /** Optional footer (e.g. a summary line). */
  footer?: ReactNode;
  children: ReactNode;
  pad?: boolean;
}) {
  const t = tokensFor(surface);
  return (
    <div
      className="rounded-xl overflow-hidden border shadow-sm flex flex-col"
      style={{ background: t.panel, borderColor: t.panel === '#FFFFFF' ? '#E6E5E0' : '#F1D2CE' }}
    >
      <div className="h-[3px] flex-shrink-0" style={{ background: ACCENT }} />
      {(eyebrow || title) && (
        <header className={cn('flex items-center gap-3 px-5 sm:px-6 pt-4 pb-3.5 border-b', t.divider)}>
          {Icon && (
            <span
              className="flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg"
              style={{ background: withAlpha(ACCENT, '14'), border: `1px solid ${withAlpha(ACCENT, '30')}`, color: ACCENT }}
              aria-hidden="true"
            >
              <Icon className="w-[18px] h-[18px]" />
            </span>
          )}
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-0.5" style={{ color: ACCENT }}>
                {eyebrow}
              </p>
            )}
            {title && (
              <h3 className={cn('font-bold leading-tight tracking-tight', t.textPrimary)} style={{ fontSize: 'clamp(1.0625rem, 0.95rem + 0.5vw, 1.375rem)' }}>
                {title}
              </h3>
            )}
          </div>
        </header>
      )}
      <div className={cn('flex-1', pad && 'p-4 sm:p-5')}>{children}</div>
      {footer && <div className={cn('border-t px-5 sm:px-6 py-3', t.divider)}>{footer}</div>}
    </div>
  );
}

/** Graceful fallback when a block has missing or malformed data. */
export function BlockFallback({
  surface,
  message = 'This visual could not be displayed.',
}: {
  surface: Surface;
  message?: string;
}) {
  const t = tokensFor(surface);
  return (
    <div
      className="rounded-xl min-h-[96px] flex items-center justify-center p-6 text-center border border-[#E6E5E0]"
      style={{ background: '#FAFAF8' }}
    >
      <p className={cn('text-sm', t.textMuted)}>{message}</p>
    </div>
  );
}

/**
 * Small icon badge used across visuals. Resolves a semantic icon NAME to a
 * consistent lucide glyph (never a raw emoji); falls back to a neutral dot.
 */
export function IconBubble({
  icon,
  accent = ACCENT,
  surface,
  size = 28,
}: {
  icon?: string;
  accent?: string;
  surface: Surface;
  size?: number;
}) {
  const t = tokensFor(surface);
  const Icon = resolveBlockIcon(icon);
  const glyph = Math.round(size * 0.52);
  return (
    <span
      className="inline-flex items-center justify-center rounded-lg flex-shrink-0 leading-none"
      style={{
        width: size,
        height: size,
        background: withAlpha(accent, t.isDark ? '22' : '14'),
        border: `1px solid ${withAlpha(accent, t.isDark ? '40' : '30')}`,
      }}
      aria-hidden="true"
    >
      {Icon
        ? <Icon style={{ width: glyph, height: glyph, color: accent }} strokeWidth={2} />
        : <span style={{ width: 6, height: 6, borderRadius: 999, background: accent }} />}
    </span>
  );
}
