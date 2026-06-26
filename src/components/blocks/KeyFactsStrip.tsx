import type { KeyFactsData } from '../../lib/blocks';
import { cn } from '../../lib/cn';
import { BlockFallback, type Surface } from './_shared';

const ACCENT = '#ED3237';

// ─── Flat illustration icons (blue/navy family, matching the lesson art) ──────
// Each ~48px, drawn in the same palette as the Who-We-Are illustration so the
// facts strip reads as part of one visual language — not generic UI icons.

function PeopleIcon() {
  return (
    <svg viewBox="0 0 56 48" width="48" height="42" aria-hidden="true">
      {/* back people */}
      <g fill="#9CC6EA">
        <circle cx="13" cy="16" r="7" />
        <path d="M2 44c0-7 5-12 11-12s11 5 11 12z" />
        <circle cx="43" cy="16" r="7" />
        <path d="M32 44c0-7 5-12 11-12s11 5 11 12z" />
      </g>
      {/* front person */}
      <g fill="#2E6CA8">
        <circle cx="28" cy="13" r="9" />
        <path d="M12 46c0-9 7-15 16-15s16 6 16 15z" />
      </g>
    </svg>
  );
}

function ServersIcon() {
  const Unit = ({ y, fill }: { y: number; fill: string }) => (
    <g>
      <rect x="9" y={y} width="34" height="11" rx="2.5" fill={fill} />
      <circle cx="14.5" cy={y + 5.5} r="1.7" fill="#5FD2C2" />
      <circle cx="19.5" cy={y + 5.5} r="1.7" fill="#9CC6EA" />
      <rect x="31" y={y + 3.5} width="8" height="4" rx="1" fill="#3E6E9C" />
    </g>
  );
  return (
    <svg viewBox="0 0 52 48" width="46" height="42" aria-hidden="true">
      <Unit y={5} fill="#274C70" />
      <Unit y={19} fill="#1F3E5E" />
      <Unit y={33} fill="#274C70" />
    </svg>
  );
}

function CloudIcon() {
  return (
    <svg viewBox="0 0 60 44" width="52" height="38" aria-hidden="true">
      {/* lighter back puff */}
      <path d="M40 38a10 10 0 0 0 2-20 12 12 0 0 0-22-3 10 10 0 0 0-2 23z" fill="#BFE0F2" transform="translate(8 -4)" />
      {/* front cloud */}
      <path d="M16 40a11 11 0 0 1 2-21 13 13 0 0 1 24-2 10 10 0 0 1 2 23z" fill="#7FB7DD" />
    </svg>
  );
}

function FactIcon({ name }: { name?: string }) {
  switch ((name || '').toLowerCase()) {
    case 'users':
    case 'people':
      return <PeopleIcon />;
    case 'servers':
    case 'server':
      return <ServersIcon />;
    case 'cloud':
    default:
      return <CloudIcon />;
  }
}

// A clean strip of 3–4 canonical facts: a flat illustration icon, a bold red
// value, then label + sublabel. Light surface, no invented data (the caller
// supplies validated facts).
export function KeyFactsStrip({ data }: { data: KeyFactsData; surface: Surface }) {
  const facts = Array.isArray(data?.facts) ? data.facts.filter((f) => f?.value?.trim() && f?.label?.trim()).slice(0, 4) : [];
  if (facts.length === 0) return <BlockFallback surface="plain" message="No key facts provided." />;

  return (
    <div className="rounded-xl border border-[#EAEAEA] bg-white">
      <ul className={cn('grid grid-cols-1 sm:grid-cols-2', facts.length >= 3 && 'lg:grid-cols-3')}>
        {facts.map((fact, i) => (
          <li key={i} className="flex items-center gap-4 px-6 py-6">
            <span className="flex-shrink-0 w-14 flex items-center justify-center" aria-hidden="true">
              <FactIcon name={fact.icon} />
            </span>
            <div className="min-w-0">
              <p className="text-[22px] font-extrabold leading-none" style={{ color: ACCENT }}>{fact.value}</p>
              <p className="text-[13px] font-medium text-[#44434A] leading-snug mt-1.5">{fact.label}</p>
              {fact.sublabel && <p className="text-[12.5px] text-[#8A8790] leading-snug">{fact.sublabel}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
