import { cn } from '../../lib/cn';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const sizeStyles: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-4',
  lg: 'w-10 h-10 border-4',
};

export function Spinner({ size = 'md', label = 'Loading…', className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn('inline-flex items-center justify-center', className)}
    >
      <span
        aria-hidden="true"
        className={cn(
          'border-primary-200 border-t-primary-600 rounded-full animate-spin',
          sizeStyles[size],
        )}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

/** Full-area centred spinner — drop-in for page-level loading states. */
export function PageSpinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="md" label={label} />
    </div>
  );
}
