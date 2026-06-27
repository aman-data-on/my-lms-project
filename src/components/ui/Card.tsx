import { type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds hover shadow transition — use for interactive cards. */
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
};

export function Card({ hover = false, padding = 'md', className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-slate-100 shadow-sm',
        hover && [
          'transition-[box-shadow,border-color,transform] duration-200 ease-out cursor-pointer',
          'hover:shadow-xl hover:border-primary-200 hover:-translate-y-1',
          'active:translate-y-0 active:shadow-md active:duration-100',
          'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        ],
        paddingStyles[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
