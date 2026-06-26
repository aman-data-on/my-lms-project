export type BlockType =
  // ── Document-flow blocks (rendered in the reading column) ──
  | 'text'
  | 'callout'
  | 'key_takeaway'
  | 'learning_objectives'
  | 'stat_card'
  | 'two_column'
  | 'accordion'
  | 'image_caption'
  | 'checklist'
  | 'quote'
  | 'download_resource'
  // ── Learning-visual blocks (rendered by VisualBlockRenderer) ──
  | 'timeline'
  | 'flashcard'
  | 'knowledge_check'
  | 'comparison'
  | 'ecosystem_diagram'
  | 'process_flow'
  | 'architecture_diagram'
  | 'feature_benefit'
  | 'use_case_cards'
  | 'scenario_cards'
  | 'data_visualization'
  | 'key_facts';

export interface BlockBase {
  id: string;
  type: BlockType;
  data: Record<string, any>;
}

// ─── Typed data schemas for every block ────────────────────────────────
// These describe the `data` payload each block type expects. Renderers are
// defensive (see VisualBlockRenderer + per-block guards) so partial or
// malformed data degrades gracefully rather than crashing the page.

/** Shared header fields most learning visuals accept. */
export interface VisualHeader {
  /** Small mono uppercase kicker above the title, e.g. "Relationship". */
  eyebrow?: string;
  /** Bold panel title. */
  title?: string;
}

export interface TimelineStep {
  date?: string;
  title: string;
  description?: string;
  icon?: string;
  /** Hex accent used for the dot + year badge. */
  color?: string;
}
export interface TimelineData extends VisualHeader {
  steps: TimelineStep[];
}

export interface ComparisonColumn {
  label: string;
  subtitle?: string;
  icon?: string;
  /** Hex accent for this column's header. */
  accent?: string;
  points: string[];
}
export interface ComparisonData extends VisualHeader {
  columns: ComparisonColumn[];
}

export interface EcosystemNode {
  label: string;
  sublabel?: string;
  icon?: string;
  accent?: string;
  /** One-line role caption shown under the node. */
  caption?: string;
}
export interface EcosystemData extends VisualHeader {
  /** "stack" = layered tiers connected top→bottom; "hub" = centre + spokes. */
  layout?: 'stack' | 'hub';
  nodes: EcosystemNode[];
  /** Optional summary of how the nodes relate. */
  relationship?: string;
}

export interface ProcessStep {
  title: string;
  description?: string;
  icon?: string;
}
export interface ProcessFlowData extends VisualHeader {
  steps: ProcessStep[];
}

export interface ArchComponent {
  label: string;
  icon?: string;
}
export interface ArchLayer {
  name: string;
  sublabel?: string;
  accent?: string;
  components: ArchComponent[];
}
export interface ArchitectureData extends VisualHeader {
  layers: ArchLayer[];
}

export interface FeatureBenefitPair {
  feature: string;
  benefit: string;
  icon?: string;
}
export interface FeatureBenefitData extends VisualHeader {
  pairs: FeatureBenefitPair[];
}

export interface UseCase {
  persona?: string;
  title: string;
  description: string;
  icon?: string;
  accent?: string;
}
export interface UseCaseCardsData extends VisualHeader {
  cases: UseCase[];
}

export interface Scenario {
  situation: string;
  recommended: string;
  note?: string;
  icon?: string;
}
export interface ScenarioCardsData extends VisualHeader {
  scenarios: Scenario[];
}

export interface DataPoint {
  label: string;
  value: number;
  /** Optional formatted display, e.g. "22,000+". Falls back to value. */
  display?: string;
  accent?: string;
}
export interface DataVisualizationData extends VisualHeader {
  kind?: 'bar' | 'stat';
  unit?: string;
  points: DataPoint[];
  caption?: string;
}

export interface KeyFact {
  /** Big headline value, e.g. "22,000+". */
  value: string;
  label: string;
  sublabel?: string;
  /** Lucide icon name (users | globe | cloud | server | shield | layers …). */
  icon?: string;
}
export interface KeyFactsData extends VisualHeader {
  facts: KeyFact[];
}

export interface FlashcardItem {
  front: string;
  back: string;
}
export interface FlashcardData extends VisualHeader {
  cards: FlashcardItem[];
}

export interface KCQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}
export interface KnowledgeCheckData extends VisualHeader {
  questions: KCQuestion[];
}

/** Maps each block type to its data payload shape. */
export interface BlockDataMap {
  text: { html: string };
  callout: { type: 'info' | 'warning' | 'tip' | 'success'; text: string };
  key_takeaway: { text: string };
  learning_objectives: { items: string[] };
  stat_card: { stat: string; label: string };
  two_column: { leftText: string; rightText: string; isImageLeft?: boolean; leftImageUrl?: string };
  accordion: { items: { question: string; answer: string }[] };
  image_caption: { url: string; caption?: string; size?: 'small' | 'medium' | 'full' };
  checklist: { items: string[] };
  quote: { text: string; author?: string };
  download_resource: { label: string; url: string };
  timeline: TimelineData;
  flashcard: FlashcardData;
  knowledge_check: KnowledgeCheckData;
  comparison: ComparisonData;
  ecosystem_diagram: EcosystemData;
  process_flow: ProcessFlowData;
  architecture_diagram: ArchitectureData;
  feature_benefit: FeatureBenefitData;
  use_case_cards: UseCaseCardsData;
  scenario_cards: ScenarioCardsData;
  data_visualization: DataVisualizationData;
  key_facts: KeyFactsData;
}

/** A fully-typed, discriminated block. */
export type Block = {
  [K in BlockType]: { id: string; type: K; data: BlockDataMap[K] };
}[BlockType];

/** Block types handled by VisualBlockRenderer's learning-visual components. */
export const VISUAL_BLOCK_TYPES: BlockType[] = [
  'timeline', 'flashcard', 'knowledge_check', 'comparison', 'ecosystem_diagram',
  'process_flow', 'architecture_diagram', 'feature_benefit', 'use_case_cards',
  'scenario_cards', 'data_visualization', 'key_facts',
];

export function isVisualBlock(type: string): boolean {
  return VISUAL_BLOCK_TYPES.includes(type as BlockType);
}

export const BLOCK_DEFINITIONS: { type: BlockType; label: string; icon: string }[] = [
  { type: 'text', label: 'Text Block', icon: 'Type' },
  { type: 'callout', label: 'Callout Box', icon: 'Info' },
  { type: 'key_takeaway', label: 'Key Takeaway', icon: 'Star' },
  { type: 'learning_objectives', label: 'Learning Objectives', icon: 'Target' },
  { type: 'stat_card', label: 'Stat Card', icon: 'BarChart3' },
  { type: 'two_column', label: 'Two Column', icon: 'Columns' },
  { type: 'accordion', label: 'Accordion / FAQ', icon: 'ChevronDown' },
  { type: 'image_caption', label: 'Image + Caption', icon: 'Image' },
  { type: 'knowledge_check', label: 'Knowledge Check', icon: 'HelpCircle' },
  { type: 'checklist', label: 'Checklist', icon: 'CheckSquare' },
  { type: 'quote', label: 'Quote', icon: 'Quote' },
  { type: 'timeline', label: 'Timeline', icon: 'GitCommit' },
  { type: 'flashcard', label: 'Flashcards', icon: 'Layers' },
  { type: 'download_resource', label: 'Download Resource', icon: 'Download' },
];

export function defaultBlockData(type: BlockType): Record<string, any> {
  switch (type) {
    case 'text':
      return { html: '' };
    case 'callout':
      return { type: 'info', text: '' };
    case 'key_takeaway':
      return { text: '' };
    case 'learning_objectives':
      return { items: [''] };
    case 'stat_card':
      return { stat: '', label: '' };
    case 'two_column':
      return { leftText: '', rightText: '', isImageLeft: false, leftImageUrl: '' };
    case 'accordion':
      return { items: [{ question: '', answer: '' }] };
    case 'image_caption':
      return { url: '', caption: '', size: 'medium' };
    case 'knowledge_check':
      return { questions: [{ question: '', options: ['', '', '', ''], correct: 0 }] };
    case 'checklist':
      return { items: [''] };
    case 'quote':
      return { text: '', author: '' };
    case 'timeline':
      return { steps: [{ title: '', description: '', date: '' }] };
    case 'flashcard':
      return { cards: [{ front: '', back: '' }] };
    case 'download_resource':
      return { label: '', url: '' };
    case 'comparison':
      return { columns: [{ label: '', points: [''] }, { label: '', points: [''] }] };
    case 'ecosystem_diagram':
      return { layout: 'stack', nodes: [{ label: '' }] };
    case 'process_flow':
      return { steps: [{ title: '' }] };
    case 'architecture_diagram':
      return { layers: [{ name: '', components: [{ label: '' }] }] };
    case 'feature_benefit':
      return { pairs: [{ feature: '', benefit: '' }] };
    case 'use_case_cards':
      return { cases: [{ title: '', description: '' }] };
    case 'scenario_cards':
      return { scenarios: [{ situation: '', recommended: '' }] };
    case 'data_visualization':
      return { kind: 'bar', points: [{ label: '', value: 0 }] };
    case 'key_facts':
      return { facts: [{ value: '', label: '' }] };
    default:
      return {};
  }
}

export function newBlock(type: BlockType): BlockBase {
  return {
    id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    data: defaultBlockData(type),
  };
}
