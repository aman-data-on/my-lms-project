import { Layers } from 'lucide-react';
import type { ArchitectureData } from '../../lib/blocks';
import { cn } from '../../lib/cn';
import { ACCENT, BlockFallback, tokensFor, withAlpha, VisualShell, type Surface } from './_shared';
import { resolveBlockIcon } from './icons';

// Layered architecture / product stack. Each layer is a band of component
// chips; layers read top→bottom. Chips wrap on narrow screens.
export function ArchitectureDiagram({ data, surface }: { data: ArchitectureData; surface: Surface }) {
  const layers = Array.isArray(data?.layers) ? data.layers.filter((l) => l?.name?.trim()) : [];
  if (layers.length === 0) return <BlockFallback surface={surface} message="No architecture layers provided." />;
  const t = tokensFor(surface);

  return (
    <VisualShell surface={surface} Icon={Layers} eyebrow={data.eyebrow || 'Architecture'} title={data.title || 'How It Is Built'}>
      <div className="space-y-2.5">
        {layers.map((layer, i) => {
          const accent = layer.accent || ACCENT;
          const components = Array.isArray(layer.components) ? layer.components.filter((c) => c?.label?.trim()) : [];
          return (
            <div
              key={i}
              className="rounded-xl px-4 py-3"
              style={{ background: withAlpha(accent, t.isDark ? '10' : '0A'), border: `1px solid ${withAlpha(accent, t.isDark ? '33' : '2E')}` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1 h-[14px] rounded-full flex-shrink-0" style={{ background: accent }} aria-hidden="true" />
                <p className={cn('text-[12px] font-mono font-bold uppercase tracking-[0.12em]', t.textPrimary)}>{layer.name}</p>
                {layer.sublabel && <span className={cn('text-[11px]', t.textMuted)}>· {layer.sublabel}</span>}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {components.map((c, j) => {
                  const Icon = resolveBlockIcon(c.icon);
                  return (
                    <span key={j} className={cn('inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px]', t.chip)}>
                      {Icon && <Icon className="w-3.5 h-3.5" style={{ color: accent }} aria-hidden="true" />}
                      {c.label}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </VisualShell>
  );
}
