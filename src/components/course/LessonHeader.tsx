import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn';

const ACCENT = '#ED3237';

// Standard lesson header: breadcrumbs → compact topic metadata → title →
// optional lead. Controlled sizing (clamp), no oversized badge / all-caps.
export function LessonHeader({
  breadcrumbs,
  number,
  category,
  title,
  lead,
}: {
  breadcrumbs: string[];
  number?: string;
  category?: string;
  title: string;
  lead?: string;
}) {
  return (
    <header>
      {breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-x-1 gap-y-0.5 text-[12px] text-[#6B6E76] mb-3">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="inline-flex items-center gap-1 min-w-0">
              {i > 0 && <ChevronRight className="w-3 h-3 text-[#B8B2AE] flex-shrink-0" aria-hidden="true" />}
              <span className={cn('break-words', i === breadcrumbs.length - 1 && 'text-[#221B1D] font-medium')}>{crumb}</span>
            </span>
          ))}
        </nav>
      )}

      {category && (
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6B6E76] mb-1.5">{category}</p>
      )}

      <div className="flex items-baseline gap-2.5 sm:gap-3.5">
        {number && (
          <span
            className="font-bold tabular-nums flex-shrink-0 leading-[1.15]"
            style={{ color: ACCENT, fontSize: 'clamp(1.5rem, 1.2rem + 1.4vw, 2.125rem)' }}
          >
            {number}
          </span>
        )}
        <h1
          className="font-bold text-[#221B1D] leading-[1.15] tracking-tight"
          style={{ fontSize: 'clamp(1.5rem, 1.2rem + 1.4vw, 2.125rem)' }}
        >
          {title}
        </h1>
      </div>

      {lead && (
        <p
          className="text-[#3A3338] leading-relaxed mt-3 max-w-[68ch]"
          style={{ fontSize: 'clamp(1rem, 0.96rem + 0.2vw, 1.125rem)' }}
        >
          {lead}
        </p>
      )}
    </header>
  );
}
