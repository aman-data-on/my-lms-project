import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  /** Icon-only buttons: renders a 44×44px minimum target and expects an aria-label on the parent. */
  iconOnly?: boolean;
  children?: ReactNode;
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:   'bg-primary-700 text-white shadow-sm hover:bg-primary-800 hover:shadow-lg focus-visible:ring-primary-500 active:bg-primary-800 active:shadow-sm',
  secondary: 'bg-primary-50 text-primary-700 hover:bg-primary-100 hover:text-primary-800 hover:shadow-sm focus-visible:ring-primary-500 active:bg-primary-200/70 active:shadow-none',
  ghost:     'border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-primary-300 hover:shadow-sm focus-visible:ring-slate-400 active:bg-slate-100 active:shadow-none',
  danger:    'bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-lg focus-visible:ring-red-500 active:bg-red-800 active:shadow-sm',
};

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-5 py-3 text-sm gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      iconOnly = false,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled || undefined}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg',
          'transition-[background-color,box-shadow,border-color,transform,color] duration-200 ease-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
          'hover:-translate-y-px active:translate-y-px active:duration-100',
          'disabled:opacity-50 disabled:shadow-none disabled:translate-y-0 disabled:pointer-events-none',
          'motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:translate-y-0',
          iconOnly
            ? 'min-h-[44px] min-w-[44px] p-2.5'
            : sizeStyles[size],
          variantStyles[variant],
          className,
        )}
        {...props}
      >
        {loading && (
          <span
            aria-hidden="true"
            className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"
          />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
