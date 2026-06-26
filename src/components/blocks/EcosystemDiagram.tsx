import { ArrowDown, Share2 } from 'lucide-react';
import type { EcosystemData } from '../../lib/blocks';
import { cn } from '../../lib/cn';
import { ACCENT, BlockFallback, IconBubble, tokensFor, withAlpha, VisualShell, type Surface } from './_shared';

// Shows how entities relate. Two layouts:
//   stack — vertical tiers connected top→bottom (e.g. infra → platform → customers)
//   hub   — a centre node surrounded by spoke nodes
export function EcosystemDiagram({ data, surface }: { data: EcosystemData; surface: Surface }) {
  const nodes = Array.isArray(data?.nodes) ? data.nodes.filter((n) => n?.label?.trim()) : [];
  if (nodes.length === 0) return <BlockFallback surface={surface} message="No ecosystem nodes provided." />;
  const layout = data.layout === 'hub' ? 'hub' : 'stack';
  const t = tokensFor(surface);

  return (
    <VisualShell surface={surface} Icon={Share2} eyebrow={data.eyebrow || 'Relationship'} title={data.title || 'How It Connects'}>
      {layout === 'hub' ? <Hub nodes={nodes} surface={surface} /> : <Stack nodes={nodes} surface={surface} />}
      {data.relationship && (
        <p className={cn('mt-4 text-[14px] lg:text-[15px] leading-relaxed rounded-xl px-4 py-3', t.cardSubtle, t.textSecondary)}>
          {data.relationship}
        </p>
      )}
    </VisualShell>
  );
}

function NodeCard({ node, surface }: { node: EcosystemData['nodes'][number]; surface: Surface }) {
  const t = tokensFor(surface);
  const accent = node.accent || ACCENT;
  return (
    <div
      className="rounded-xl px-4 py-3 w-full"
      style={{ background: withAlpha(accent, t.isDark ? '12' : '0D'), border: `1px solid ${withAlpha(accent, t.isDark ? '3A' : '33')}` }}
    >
      <div className="flex items-center gap-2.5">
        <IconBubble icon={node.icon} accent={accent} surface={surface} />
        <div className="min-w-0">
          <p className={cn('text-[15px] lg:text-[16px] font-semibold leading-tight truncate', t.textPrimary)}>{node.label}</p>
          {node.sublabel && <p className={cn('text-[12px] lg:text-[13px] leading-tight mt-0.5', t.textSecondary)}>{node.sublabel}</p>}
        </div>
      </div>
      {node.caption && <p className={cn('text-[13px] lg:text-[14px] leading-relaxed mt-2', t.textSecondary)}>{node.caption}</p>}
    </div>
  );
}

function Stack({ nodes, surface }: { nodes: EcosystemData['nodes']; surface: Surface }) {
  const t = tokensFor(surface);
  return (
    <div className="flex flex-col items-center">
      {nodes.map((node, i) => (
        <div key={i} className="w-full flex flex-col items-center">
          <NodeCard node={node} surface={surface} />
          {i < nodes.length - 1 && (
            <span
              className={cn('my-2 inline-flex items-center justify-center w-6 h-6 rounded-full', t.chip)}
              aria-hidden="true"
            >
              <ArrowDown className="w-3.5 h-3.5" style={{ color: ACCENT }} />
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function Hub({ nodes, surface }: { nodes: EcosystemData['nodes']; surface: Surface }) {
  const [center, ...spokes] = nodes;
  return (
    <div className="flex flex-col items-center gap-3">
      <NodeCard node={center} surface={surface} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
        {spokes.map((node, i) => (
          <NodeCard key={i} node={node} surface={surface} />
        ))}
      </div>
    </div>
  );
}
