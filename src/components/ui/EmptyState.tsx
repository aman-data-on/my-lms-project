import { type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Button } from './Button';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
}

interface EmptyStateProps {
  /** Lucide icon or any React node rendered above the title. */
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-slate-100 p-12 text-center',
        className,
      )}
    >
      {icon && (
        <div className="flex justify-center mb-4" aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-700 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 mb-5 max-w-sm mx-auto">{description}</p>
      )}
      {action && (
        <Button
          variant={action.variant ?? 'primary'}
          onClick={action.onClick}
          size="md"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
