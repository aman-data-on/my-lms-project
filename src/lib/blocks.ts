export type BlockType =
  | 'text'
  | 'callout'
  | 'key_takeaway'
  | 'learning_objectives'
  | 'stat_card'
  | 'two_column'
  | 'accordion'
  | 'image_caption'
  | 'knowledge_check'
  | 'checklist'
  | 'quote'
  | 'timeline'
  | 'flashcard'
  | 'download_resource';

export interface BlockBase {
  id: string;
  type: BlockType;
  data: Record<string, any>;
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
