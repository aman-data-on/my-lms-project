import { type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';
  size?: 'sm' | 'md';
}

const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
  success: 'bg-green-50 text-green-700',
  warning: 'bg-amber-50 text-amber-700',
  error:   'bg-red-50 text-red-700',
  info:    'bg-blue-50 text-blue-700',
  neutral: 'bg-slate-50 text-slate-700',
  primary: 'bg-primary-50 text-primary-700',
};

const sizeStyles: Record<NonNullable<BadgeProps['size']>, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

export function Badge({
  variant = 'neutral',
  size = 'md',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full',
        sizeStyles[size],
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * Tailwind class strings for department badges — matches the colour system
 * established in CourseLibrary and the DESIGN_SYSTEM docs.
 * Usage: <span className={cn(badgeBase, DEPT_BADGE[dept])}>Finance</span>
 */
export const DEPT_BADGE: Record<string, string> = {
  HR:         'bg-rose-50 text-rose-700 border border-rose-200',
  IT:         'bg-blue-50 text-blue-700 border border-blue-200',
  Finance:    'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Sales:      'bg-amber-50 text-amber-700 border border-amber-200',
  Operations: 'bg-slate-50 text-slate-700 border border-slate-200',
  Marketing:  'bg-purple-50 text-purple-700 border border-purple-200',
  Management: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
};

export const DEPT_BADGE_FALLBACK = 'bg-slate-50 text-slate-700 border border-slate-200';
