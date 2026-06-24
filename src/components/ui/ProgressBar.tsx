import { cn } from '../../lib/cn';

interface ProgressBarProps {
  /** Value between 0 and 100. */
  value: number;
  size?: 'sm' | 'md';
  /** Visible label shown above the bar on the left side. */
  label?: string;
  /** Show the numeric percentage on the right. */
  showValue?: boolean;
  className?: string;
}

const sizeStyles: Record<NonNullable<ProgressBarProps['size']>, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
};

export function ProgressBar({
  value,
  size = 'sm',
  label,
  showValue = false,
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between text-xs mb-1">
          {label && <span className="text-slate-500">{label}</span>}
          {showValue && (
            <span className="font-medium text-primary-700">{clamped}%</span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? `${clamped}% complete`}
        className={cn('w-full bg-slate-100 rounded-full overflow-hidden', sizeStyles[size])}
      >
        <div
          aria-hidden="true"
          className="bg-primary-500 rounded-full h-full transition-all duration-500 motion-reduce:transition-none"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
