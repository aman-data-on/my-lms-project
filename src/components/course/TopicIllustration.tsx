import { useState, type ReactNode } from 'react';

// ─── Topic illustrations ───────────────────────────────────────────────────
// A small library of simple, flat vector illustrations that share ONE visual
// language: a soft rose panel (brand red family), restrained geometry, white
// cards with neutral strokes, dashed red connectors, and the brand red as the
// single evident accent. No stock photos, no clip-art — every illustration is
// purpose-built and inline (no external assets).
//
// `TopicIllustration` infers which illustration best fits a topic from its
// title + lead text, so lessons that would otherwise leave the intro's right
// column empty get a relevant, on-brand visual automatically.

export type IllustrationKind =
  | 'infra'
  | 'ecosystem'
  | 'architecture'
  | 'comparison'
  | 'process'
  | 'journey'
  | 'products'
  | 'concept';

// Shared palette — keep every illustration on the same brand language.
const NODE = '#FFFFFF';
const STROKE = '#E6E5E0';
const LINE = '#D9D5D0';
const LINE2 = '#E6E2DD';
const GREEN = '#10B981';
const INDIGO = '#6366F1';
const AMBER = '#F59E0B';

// Keyword → illustration mapping. Ordered most-specific first; `infra` is broad
// so it sits late, and anything unmatched falls back to a neutral concept mark.
const RULES: [RegExp, IllustrationKind][] = [
  [/compar|versus|\bvs\.?\b|difference|differ|alternative|better than|trade.?off|pros and cons/i, 'comparison'],
  [/journey|life ?cycle|customer experience|adoption|stages of|funnel/i, 'journey'],
  [/process|work ?flow|step.?by.?step|\bsteps\b|how it works|how to|deploy|provision|pipeline|procedure|onboard/i, 'process'],
  [/architecture|tech stack|\bstack\b|layer|layered|components|catalog|catalogue|built on/i, 'architecture'],
  [/ecosystem|relationship|fits? together|works? together|portfolio|landscape|how .*connect/i, 'ecosystem'],
  [/products?|offerings?|solutions?|service catalog|our services|product suite|line ?up/i, 'products'],
  [/infrastructure|infra\b|hosting|data ?cent(er|re)|server|hardware|\bcloud\b|network|compute|storage|colocation/i, 'infra'],
];

export function inferIllustrationKind(text: string): IllustrationKind {
  for (const [re, kind] of RULES) if (re.test(text)) return kind;
  return 'concept';
}

const LABELS: Record<IllustrationKind, string> = {
  infra: 'Cloud infrastructure illustration',
  ecosystem: 'Ecosystem relationship illustration',
  architecture: 'Layered architecture illustration',
  comparison: 'Comparison illustration',
  process: 'Process flow illustration',
  journey: 'Customer journey illustration',
  products: 'Product relationship illustration',
  concept: 'Concept illustration',
};

// Shared frame: rose gradient panel, border, decorative dots, brand gradients.
// Every motif is drawn inside this so the whole set reads as one language.
function Frame({ uid, label, className, children }: { uid: string; label: string; className?: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 440 320" role="img" aria-label={label} className={className} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFF6F5" />
          <stop offset="1" stopColor="#FFFDFC" />
        </linearGradient>
        <linearGradient id={`${uid}-red`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FF5A5F" />
          <stop offset="1" stopColor="#ED3237" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="440" height="320" rx="20" fill={`url(#${uid}-bg)`} stroke="#F3DAD8" />
      <circle cx="60" cy="52" r="4" fill="#FBCFD1" />
      <circle cx="392" cy="80" r="5" fill="#FBCFD1" />
      <circle cx="384" cy="262" r="4" fill="#F3DAD8" />
      {children}
    </svg>
  );
}

const dash = { stroke: '#ED3237', strokeWidth: 2, strokeDasharray: '2 6', strokeLinecap: 'round' as const, fill: 'none', opacity: 0.55 };

// Small reusable white card with a couple of content lines.
function MiniCard({ x, y, w = 84, h = 50, accent = '#ED3237', lines = 2 }: { x: number; y: number; w?: number; h?: number; accent?: string; lines?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="10" fill={NODE} stroke={STROKE} />
      <rect x={x} y={y} width={w} height="6" rx="3" fill={accent} opacity="0.85" />
      <rect x={x + 12} y={y + 18} width={w - 36} height="5" rx="2.5" fill={LINE} />
      {lines > 1 && <rect x={x + 12} y={y + 30} width={w - 50} height="5" rx="2.5" fill={LINE2} />}
    </g>
  );
}

// ── Motifs ───────────────────────────────────────────────────────────────────

function Infra({ uid }: { uid: string }) {
  return (
    <>
      <g style={dash}>
        <path d="M150 150 L120 206" />
        <path d="M220 156 L220 206" />
        <path d="M290 150 L320 206" />
      </g>
      <path d="M168 150 a40 40 0 0 1 6 -78 a46 46 0 0 1 86 -6 a36 36 0 0 1 12 84 z" fill={`url(#${uid}-red)`} />
      <path d="M226 86 l-22 30 h16 l-8 26 26 -34 h-16 z" fill="#fff" />
      {[88, 188, 288].map((x, i) => (
        <g key={i}>
          <rect x={x} y="208" width="64" height="58" rx="10" fill={NODE} stroke={STROKE} />
          <rect x={x} y="208" width="64" height="7" rx="3.5" fill="#ED3237" opacity={i === 1 ? 0.9 : 0.45} />
          <rect x={x + 12} y="228" width="40" height="5" rx="2.5" fill={LINE} />
          <rect x={x + 12} y="240" width="28" height="5" rx="2.5" fill={LINE2} />
          <circle cx={x + 50} cy="254" r="3" fill={GREEN} />
        </g>
      ))}
      <circle cx="120" cy="206" r="4" fill="#ED3237" />
      <circle cx="220" cy="206" r="4" fill="#ED3237" />
      <circle cx="320" cy="206" r="4" fill="#ED3237" />
    </>
  );
}

function Ecosystem({ uid }: { uid: string }) {
  // Central hub linked to three satellite nodes (relationship).
  return (
    <>
      <g style={dash}>
        <path d="M220 160 L220 92" />
        <path d="M210 172 L120 240" />
        <path d="M230 172 L320 240" />
      </g>
      {/* satellites */}
      <MiniCard x={178} y={44} accent={INDIGO} />
      <MiniCard x={60} y={232} accent={GREEN} />
      <MiniCard x={296} y={232} accent={AMBER} />
      {/* hub */}
      <rect x="190" y="130" width="60" height="60" rx="16" fill={`url(#${uid}-red)`} />
      <circle cx="220" cy="160" r="13" fill="#fff" opacity="0.92" />
      <circle cx="220" cy="160" r="5" fill="#ED3237" />
    </>
  );
}

function Architecture() {
  const layers = [
    { y: 64, accent: INDIGO, chips: [70, 150] },
    { y: 138, accent: GREEN, chips: [70, 150, 230] },
    { y: 212, accent: '#ED3237', chips: [70, 150, 230] },
  ];
  return (
    <>
      {layers.map((l, i) => (
        <g key={i}>
          <rect x="56" y={l.y} width="328" height="60" rx="12" fill={`${l.accent}14`} stroke={`${l.accent}40`} />
          <rect x="56" y={l.y} width="6" height="60" rx="3" fill={l.accent} />
          {l.chips.map((cx, j) => (
            <g key={j}>
              <rect x={cx} y={l.y + 18} width="72" height="24" rx="7" fill={NODE} stroke={STROKE} />
              <rect x={cx + 12} y={l.y + 27} width="40" height="6" rx="3" fill={LINE} />
            </g>
          ))}
        </g>
      ))}
    </>
  );
}

function Comparison({ uid }: { uid: string }) {
  const Panel = ({ x, accent }: { x: number; accent: string }) => (
    <g>
      <rect x={x} y="64" width="150" height="192" rx="14" fill={NODE} stroke={STROKE} />
      <rect x={x} y="64" width="150" height="34" rx="14" fill={accent} />
      <rect x={x} y="86" width="150" height="12" fill={accent} />
      {[120, 150, 180, 210].map((y, i) => (
        <g key={i}>
          <circle cx={x + 22} cy={y} r="5" fill={`${accent}33`} stroke={accent} />
          <rect x={x + 38} y={y - 4} width={i % 2 ? 64 : 86} height="7" rx="3.5" fill={i < 2 ? LINE : LINE2} />
        </g>
      ))}
    </g>
  );
  return (
    <>
      <Panel x={50} accent="#ED3237" />
      <Panel x={240} accent={INDIGO} />
      <circle cx="220" cy="160" r="24" fill={`url(#${uid}-red)`} />
      <text x="220" y="166" textAnchor="middle" fontSize="15" fontWeight="700" fill="#fff" fontFamily="system-ui, sans-serif">VS</text>
    </>
  );
}

function Process({ uid }: { uid: string }) {
  const xs = [92, 220, 348];
  return (
    <>
      <g style={dash}>
        <path d="M124 132 L188 132" />
        <path d="M252 132 L316 132" />
      </g>
      {/* arrowheads */}
      {[180, 308].map((x, i) => (
        <path key={i} d={`M${x} 126 l8 6 -8 6 z`} fill="#ED3237" opacity="0.7" />
      ))}
      {xs.map((x, i) => (
        <g key={i}>
          <circle cx={x} cy="132" r="28" fill={i === 0 ? `url(#${uid}-red)` : NODE} stroke={i === 0 ? 'none' : '#ED3237'} strokeWidth="2" />
          <circle cx={x} cy="132" r="9" fill={i === 0 ? '#fff' : '#ED3237'} opacity={i === 0 ? 0.92 : 0.85} />
          <MiniCard x={x - 50} y={186} w={100} h={52} lines={2} />
        </g>
      ))}
    </>
  );
}

function Journey({ uid }: { uid: string }) {
  return (
    <>
      <path d="M64 248 C150 210 168 150 240 156 S356 120 380 70" style={{ ...dash, opacity: 0.7 }} />
      {/* milestones */}
      <circle cx="64" cy="248" r="14" fill={`url(#${uid}-red)`} />
      <circle cx="64" cy="248" r="5" fill="#fff" />
      {[[176, 168, INDIGO], [268, 150, GREEN], [340, 100, AMBER]].map(([cx, cy, c], i) => (
        <g key={i}>
          <circle cx={cx as number} cy={cy as number} r="10" fill={NODE} stroke={c as string} strokeWidth="2" />
          <circle cx={cx as number} cy={cy as number} r="3.5" fill={c as string} />
        </g>
      ))}
      {/* destination flag */}
      <line x1="380" y1="70" x2="380" y2="40" stroke="#ED3237" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M380 42 l26 8 -26 10 z" fill={`url(#${uid}-red)`} />
    </>
  );
}

function Products({ uid }: { uid: string }) {
  const tiles = [
    { x: 56, y: 60, accent: '#ED3237' },
    { x: 256, y: 60, accent: INDIGO },
    { x: 56, y: 176, accent: GREEN },
    { x: 256, y: 176, accent: AMBER },
  ];
  const centers = tiles.map((t) => [t.x + 64, t.y + 42]);
  return (
    <>
      <g style={dash}>
        {centers.map(([cx, cy], i) => <path key={i} d={`M220 160 L${cx} ${cy}`} />)}
      </g>
      {tiles.map((t, i) => (
        <g key={i}>
          <rect x={t.x} y={t.y} width="128" height="84" rx="12" fill={NODE} stroke={STROKE} />
          <rect x={t.x + 14} y={t.y + 16} width="26" height="26" rx="8" fill={`${t.accent}1F`} stroke={`${t.accent}55`} />
          <rect x={t.x + 14} y={t.y + 52} width="84" height="6" rx="3" fill={LINE} />
          <rect x={t.x + 14} y={t.y + 64} width="56" height="6" rx="3" fill={LINE2} />
        </g>
      ))}
      <circle cx="220" cy="160" r="20" fill={`url(#${uid}-red)`} />
      <circle cx="220" cy="160" r="7" fill="#fff" opacity="0.92" />
    </>
  );
}

function Concept({ uid }: { uid: string }) {
  return (
    <>
      <rect x="120" y="84" width="170" height="160" rx="14" fill={NODE} stroke={STROKE} />
      <rect x="120" y="84" width="170" height="30" rx="14" fill="#ED3237" opacity="0.9" />
      <rect x="120" y="104" width="170" height="10" fill="#ED3237" opacity="0.9" />
      {[140, 166, 192, 218].map((y, i) => (
        <rect key={i} x="140" y={y} width={i === 3 ? 84 : 130} height="8" rx="4" fill={i % 2 ? LINE2 : LINE} />
      ))}
      {/* spark */}
      <g transform="translate(322 96)">
        <circle cx="0" cy="0" r="22" fill={`url(#${uid}-red)`} />
        <path d="M0 -11 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3 z" fill="#fff" />
      </g>
    </>
  );
}

const MOTIFS: Record<IllustrationKind, (p: { uid: string }) => ReactNode> = {
  infra: Infra,
  ecosystem: Ecosystem,
  architecture: () => <Architecture />,
  comparison: Comparison,
  process: Process,
  journey: Journey,
  products: Products,
  concept: Concept,
};

// A real image (e.g. a bespoke topic illustration) framed in the same rose
// panel as the vector motifs, so it sits in one consistent visual language.
function ImageFrame({ src, alt, className, onError }: { src: string; alt: string; className?: string; onError: () => void }) {
  return (
    <div
      className={`rounded-[20px] border p-3 sm:p-5 flex items-center justify-center ${className ?? ''}`}
      style={{ background: 'linear-gradient(135deg,#FFF6F5,#FFFDFC)', borderColor: '#F3DAD8' }}
    >
      <img src={src} alt={alt} onError={onError} loading="lazy" className="w-full h-auto block rounded-lg" />
    </div>
  );
}

// Public component. With `src`, renders that image (falling back to an inferred
// vector illustration if it fails to load); otherwise picks a vector motif from
// the topic's title + text.
export function TopicIllustration({
  src,
  kind,
  title = '',
  text = '',
  className,
}: {
  src?: string;
  kind?: IllustrationKind;
  title?: string;
  text?: string;
  className?: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  if (src && !imgFailed) {
    return <ImageFrame src={src} alt={title || 'Topic illustration'} className={className} onError={() => setImgFailed(true)} />;
  }
  const resolved = kind ?? inferIllustrationKind(`${title} ${text}`);
  const uid = `ti-${resolved}`;
  const Motif = MOTIFS[resolved];
  return (
    <Frame uid={uid} label={LABELS[resolved]} className={className}>
      <Motif uid={uid} />
    </Frame>
  );
}
