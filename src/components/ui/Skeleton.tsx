import { cn } from '../../lib/cn';

/** Base pulse block — compose into page-specific skeleton layouts. */
function SkeletonBase({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse bg-slate-200 rounded', className)}
    />
  );
}

/** One or more lines of skeleton text. Last line at 3/4 width to feel natural. */
export function SkeletonText({
  lines = 1,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  if (lines === 1) {
    return <SkeletonBase className={cn('h-4', className)} />;
  }
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBase
          key={i}
          className={cn('h-4', i === lines - 1 && 'w-3/4')}
        />
      ))}
    </div>
  );
}

/** Generic rectangular placeholder — pass height/width via className. */
export function SkeletonRect({ className }: { className?: string }) {
  return <SkeletonBase className={cn('rounded-lg', className)} />;
}

/**
 * Full skeleton card matching the standard card layout used across pages.
 * Use inside a grid to avoid layout shift on load.
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'bg-white rounded-xl border border-slate-100 shadow-sm p-6 animate-pulse',
        className,
      )}
    >
      <SkeletonBase className="h-36 rounded-lg mb-4" />
      <SkeletonBase className="h-4 w-3/4 mb-2" />
      <SkeletonBase className="h-3 w-full mb-1" />
      <SkeletonBase className="h-3 w-5/6 mb-4" />
      <div className="flex justify-between items-center">
        <SkeletonBase className="h-5 w-20 rounded-full" />
        <SkeletonBase className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Stat card skeleton matching the 4-KPI row on the Dashboard.
 */
export function SkeletonStatCard({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'bg-white rounded-xl border border-slate-100 shadow-sm p-6 animate-pulse',
        className,
      )}
    >
      <SkeletonBase className="w-10 h-10 rounded-lg mb-4" />
      <SkeletonBase className="h-7 w-12 mb-2" />
      <SkeletonBase className="h-3 w-3/4" />
    </div>
  );
}
