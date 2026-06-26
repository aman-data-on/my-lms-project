import { Component, type ReactNode } from 'react';
import type { BlockBase } from '../../lib/blocks';
import { BlockRenderer } from '../BlockRenderer';
import { BlockFallback, type Surface } from './_shared';
import { TimelineBlock } from './TimelineBlock';
import { ComparisonBlock } from './ComparisonBlock';
import { EcosystemDiagram } from './EcosystemDiagram';
import { ProcessFlow } from './ProcessFlow';
import { ArchitectureDiagram } from './ArchitectureDiagram';
import { FeatureBenefit } from './FeatureBenefit';
import { UseCaseCards } from './UseCaseCards';
import { ScenarioCards } from './ScenarioCards';
import { DataVisualization } from './DataVisualization';
import { Flashcards } from './Flashcards';
import { KnowledgeCheck } from './KnowledgeCheck';
import { KeyFactsStrip } from './KeyFactsStrip';

// ─── Error boundary ────────────────────────────────────────────────────
// A single malformed block must never take down the whole learning page.
class BlockErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error('[VisualBlockRenderer] block failed to render:', error);
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

// ─── Central renderer ──────────────────────────────────────────────────
// Maps block.type → component. Learning visuals are surface-aware; legacy
// document blocks delegate to the existing light-surface BlockRenderer.
export function VisualBlockRenderer({
  block,
  surface = 'tinted',
  lessonId,
  userId,
}: {
  block: BlockBase | null | undefined;
  surface?: Surface;
  lessonId: string;
  userId: string;
}) {
  if (!block || typeof block !== 'object' || typeof block.type !== 'string') {
    return <BlockFallback surface={surface} />;
  }
  const data: any = block.data ?? {};

  let node: ReactNode;
  switch (block.type) {
    case 'timeline': node = <TimelineBlock data={data} surface={surface} />; break;
    case 'comparison': node = <ComparisonBlock data={data} surface={surface} />; break;
    case 'ecosystem_diagram': node = <EcosystemDiagram data={data} surface={surface} />; break;
    case 'process_flow': node = <ProcessFlow data={data} surface={surface} />; break;
    case 'architecture_diagram': node = <ArchitectureDiagram data={data} surface={surface} />; break;
    case 'feature_benefit': node = <FeatureBenefit data={data} surface={surface} />; break;
    case 'use_case_cards': node = <UseCaseCards data={data} surface={surface} />; break;
    case 'scenario_cards': node = <ScenarioCards data={data} surface={surface} />; break;
    case 'data_visualization': node = <DataVisualization data={data} surface={surface} />; break;
    case 'flashcard': node = <Flashcards data={data} surface={surface} />; break;
    case 'knowledge_check': node = <KnowledgeCheck data={data} surface={surface} />; break;
    case 'key_facts': node = <KeyFactsStrip data={data} surface={surface} />; break;
    // Legacy document-flow blocks (text/callout/quote/…) — keep working via
    // the existing renderer rather than failing.
    default:
      node = (
        <div className="h-full overflow-y-auto rounded-2xl border border-[#E6E5E0] p-5" style={{ background: '#FFFFFF' }}>
          <BlockRenderer block={block} lessonId={lessonId} userId={userId} />
        </div>
      );
  }

  return <BlockErrorBoundary fallback={<BlockFallback surface={surface} />}>{node}</BlockErrorBoundary>;
}
