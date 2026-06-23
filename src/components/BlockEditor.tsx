import { useRef } from 'react';
import {
  Type, Info, Star, Target, BarChart3, Columns3, ChevronDown, Image as ImageIcon,
  HelpCircle, CheckSquare, Quote as QuoteIcon, GitCommit, Layers, Download,
  Trash2, ArrowUp, ArrowDown, Plus, X, Bold, Italic, Underline, Strikethrough,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Code, Minus, Highlighter
} from 'lucide-react';
import type { BlockBase, BlockType } from '../lib/blocks';
import { BLOCK_DEFINITIONS } from '../lib/blocks';

// ─── Block Editor Wrapper ────────────────────────────────────────────
export function BlockEditor({
  block,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  block: BlockBase;
  onChange: (data: Record<string, any>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const label = BLOCK_DEFINITIONS.find(b => b.type === block.type)?.label || block.type;
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-1">
          <button onClick={onMoveUp} disabled={!canMoveUp} className="p-1 hover:bg-slate-200 rounded disabled:opacity-30">
            <ArrowUp className="w-3.5 h-3.5 text-slate-500" />
          </button>
          <button onClick={onMoveDown} disabled={!canMoveDown} className="p-1 hover:bg-slate-200 rounded disabled:opacity-30">
            <ArrowDown className="w-3.5 h-3.5 text-slate-500" />
          </button>
          <button onClick={onDelete} className="p-1 hover:bg-red-50 rounded text-red-400 hover:text-red-600">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <BlockEditorInner block={block} onChange={onChange} />
      </div>
    </div>
  );
}

function BlockEditorInner({ block, onChange }: { block: BlockBase; onChange: (data: Record<string, any>) => void }) {
  const d = block.data;
  const set = (key: string, val: any) => onChange({ ...d, [key]: val });

  switch (block.type) {
    // 1. Text Block
    case 'text':
      return <TextBlockEditor html={d.html || ''} onChange={(html) => set('html', html)} />;

    // 2. Callout
    case 'callout':
      return (
        <div className="space-y-2">
          <select value={d.type || 'info'} onChange={(e) => set('type', e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
            <option value="info">Info (blue)</option>
            <option value="warning">Warning (yellow)</option>
            <option value="tip">Tip (green)</option>
            <option value="success">Success (teal)</option>
          </select>
          <textarea value={d.text || ''} onChange={(e) => set('text', e.target.value)} rows={2} placeholder="Callout text..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
        </div>
      );

    // 3. Key Takeaway
    case 'key_takeaway':
      return <textarea value={d.text || ''} onChange={(e) => set('text', e.target.value)} rows={2} placeholder="Key takeaway text..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />;

    // 4. Learning Objectives
    case 'learning_objectives':
      return (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">By the end of this lesson, you will:</p>
          {(d.items || ['']).map((item: string, i: number) => (
            <div key={i} className="flex gap-2">
              <input value={item} onChange={(e) => { const items = [...(d.items || [])]; items[i] = e.target.value; set('items', items); }} placeholder="Objective..." className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
              <button onClick={() => { const items = (d.items || []).filter((_: any, idx: number) => idx !== i); set('items', items.length ? items : ['']); }} className="p-2 text-red-400 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          <button onClick={() => set('items', [...(d.items || []), ''])} className="text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"><Plus className="w-3 h-3" /> Add Objective</button>
        </div>
      );

    // 5. Stat Card
    case 'stat_card':
      return (
        <div className="grid grid-cols-2 gap-2">
          <input value={d.stat || ''} onChange={(e) => set('stat', e.target.value)} placeholder='Big number (e.g. "92%")' className="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          <input value={d.label || ''} onChange={(e) => set('label', e.target.value)} placeholder='Label (e.g. "Customer Satisfaction")' className="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
        </div>
      );

    // 6. Two Column
    case 'two_column':
      return (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={!!d.isImageLeft} onChange={(e) => set('isImageLeft', e.target.checked)} />
            Image on left + Text on right
          </label>
          {d.isImageLeft ? (
            <>
              <input value={d.leftImageUrl || ''} onChange={(e) => set('leftImageUrl', e.target.value)} placeholder="Left image URL" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
              <textarea value={d.rightText || ''} onChange={(e) => set('rightText', e.target.value)} rows={3} placeholder="Right column rich text (HTML supported)" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <textarea value={d.leftText || ''} onChange={(e) => set('leftText', e.target.value)} rows={4} placeholder="Left column (HTML)" className="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
              <textarea value={d.rightText || ''} onChange={(e) => set('rightText', e.target.value)} rows={4} placeholder="Right column (HTML)" className="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
            </div>
          )}
        </div>
      );

    // 7. Accordion / FAQ
    case 'accordion':
      return (
        <div className="space-y-2">
          {(d.items || [{ question: '', answer: '' }]).map((item: any, i: number) => (
            <div key={i} className="bg-slate-50 rounded-lg p-3 space-y-2">
              <div className="flex gap-2">
                <input value={item.question} onChange={(e) => { const items = [...(d.items || [])]; items[i] = { ...items[i], question: e.target.value }; set('items', items); }} placeholder="Question..." className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                <button onClick={() => { const items = (d.items || []).filter((_: any, idx: number) => idx !== i); set('items', items.length ? items : [{ question: '', answer: '' }]); }} className="p-2 text-red-400 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
              </div>
              <textarea value={item.answer} onChange={(e) => { const items = [...(d.items || [])]; items[i] = { ...items[i], answer: e.target.value }; set('items', items); }} rows={2} placeholder="Answer..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
            </div>
          ))}
          <button onClick={() => set('items', [...(d.items || []), { question: '', answer: '' }])} className="text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"><Plus className="w-3 h-3" /> Add Item</button>
        </div>
      );

    // 8. Image with Caption
    case 'image_caption':
      return (
        <div className="space-y-2">
          <input value={d.url || ''} onChange={(e) => set('url', e.target.value)} placeholder="Image URL" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          <input value={d.caption || ''} onChange={(e) => set('caption', e.target.value)} placeholder="Caption text..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          <select value={d.size || 'medium'} onChange={(e) => set('size', e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
            <option value="small">Small (40%)</option>
            <option value="medium">Medium (70%)</option>
            <option value="full">Full Width (100%)</option>
          </select>
        </div>
      );

    // 9. Knowledge Check
    case 'knowledge_check':
      return (
        <div className="space-y-3">
          {(d.questions || [{ question: '', options: ['', '', '', ''], correct: 0 }]).map((q: any, qi: number) => (
            <div key={qi} className="bg-slate-50 rounded-lg p-3 space-y-2">
              <div className="flex gap-2">
                <input value={q.question} onChange={(e) => { const questions = [...(d.questions || [])]; questions[qi] = { ...q, question: e.target.value }; set('questions', questions); }} placeholder="Question text..." className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                <button onClick={() => { const questions = (d.questions || []).filter((_: any, idx: number) => idx !== qi); set('questions', questions.length ? questions : [{ question: '', options: ['', '', '', ''], correct: 0 }]); }} className="p-2 text-red-400 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
              </div>
              {(q.options || []).map((opt: string, oi: number) => (
                <div key={oi} className="flex items-center gap-2 ml-4">
                  <input type="radio" checked={q.correct === oi} onChange={() => { const questions = [...(d.questions || [])]; questions[qi] = { ...q, correct: oi }; set('questions', questions); }} className="w-4 h-4" />
                  <input value={opt} onChange={(e) => { const options = [...q.options]; options[oi] = e.target.value; const questions = [...(d.questions || [])]; questions[qi] = { ...q, options }; set('questions', questions); }} placeholder={`Option ${oi + 1}`} className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm" />
                </div>
              ))}
            </div>
          ))}
          <button onClick={() => set('questions', [...(d.questions || []), { question: '', options: ['', '', '', ''], correct: 0 }])} className="text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"><Plus className="w-3 h-3" /> Add Question</button>
        </div>
      );

    // 10. Checklist
    case 'checklist':
      return (
        <div className="space-y-2">
          {(d.items || ['']).map((item: string, i: number) => (
            <div key={i} className="flex gap-2">
              <input value={item} onChange={(e) => { const items = [...(d.items || [])]; items[i] = e.target.value; set('items', items); }} placeholder="Checklist item..." className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
              <button onClick={() => { const items = (d.items || []).filter((_: any, idx: number) => idx !== i); set('items', items.length ? items : ['']); }} className="p-2 text-red-400 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          <button onClick={() => set('items', [...(d.items || []), ''])} className="text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"><Plus className="w-3 h-3" /> Add Item</button>
        </div>
      );

    // 11. Quote
    case 'quote':
      return (
        <div className="space-y-2">
          <textarea value={d.text || ''} onChange={(e) => set('text', e.target.value)} rows={2} placeholder="Quote text..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          <input value={d.author || ''} onChange={(e) => set('author', e.target.value)} placeholder="Author name..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
        </div>
      );

    // 12. Timeline
    case 'timeline':
      return (
        <div className="space-y-2">
          {(d.steps || [{ title: '', description: '', date: '' }]).map((step: any, i: number) => (
            <div key={i} className="bg-slate-50 rounded-lg p-3 space-y-2">
              <div className="flex gap-2">
                <input value={step.date || ''} onChange={(e) => { const steps = [...(d.steps || [])]; steps[i] = { ...step, date: e.target.value }; set('steps', steps); }} placeholder="Year/Date" className="w-28 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                <input value={step.title || ''} onChange={(e) => { const steps = [...(d.steps || [])]; steps[i] = { ...step, title: e.target.value }; set('steps', steps); }} placeholder="Step title..." className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                <button onClick={() => { const steps = (d.steps || []).filter((_: any, idx: number) => idx !== i); set('steps', steps.length ? steps : [{ title: '', description: '', date: '' }]); }} className="p-2 text-red-400 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
              </div>
              <textarea value={step.description || ''} onChange={(e) => { const steps = [...(d.steps || [])]; steps[i] = { ...step, description: e.target.value }; set('steps', steps); }} rows={2} placeholder="Description..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
            </div>
          ))}
          <button onClick={() => set('steps', [...(d.steps || []), { title: '', description: '', date: '' }])} className="text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"><Plus className="w-3 h-3" /> Add Step</button>
        </div>
      );

    // 13. Flashcard
    case 'flashcard':
      return (
        <div className="space-y-2">
          {(d.cards || [{ front: '', back: '' }]).map((card: any, i: number) => (
            <div key={i} className="bg-slate-50 rounded-lg p-3 space-y-2">
              <div className="flex gap-2">
                <input value={card.front} onChange={(e) => { const cards = [...(d.cards || [])]; cards[i] = { ...card, front: e.target.value }; set('cards', cards); }} placeholder="Front text..." className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                <button onClick={() => { const cards = (d.cards || []).filter((_: any, idx: number) => idx !== i); set('cards', cards.length ? cards : [{ front: '', back: '' }]); }} className="p-2 text-red-400 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
              </div>
              <input value={card.back} onChange={(e) => { const cards = [...(d.cards || [])]; cards[i] = { ...card, back: e.target.value }; set('cards', cards); }} placeholder="Back text..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
            </div>
          ))}
          <button onClick={() => set('cards', [...(d.cards || []), { front: '', back: '' }])} className="text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"><Plus className="w-3 h-3" /> Add Card</button>
        </div>
      );

    // 14. Download Resource
    case 'download_resource':
      return (
        <div className="space-y-2">
          <input value={d.label || ''} onChange={(e) => set('label', e.target.value)} placeholder='Label (e.g. "Download Sales Playbook PDF")' className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          <input value={d.url || ''} onChange={(e) => set('url', e.target.value)} placeholder="File URL..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
        </div>
      );

    default:
      return null;
  }
}

// ─── Text Block Editor with Rich Text Toolbar ────────────────────────
function TextBlockEditor({ html, onChange }: { html: string; onChange: (html: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const wrapSelection = (before: string, after: string = before) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = html.substring(start, end) || 'text';
    const newHtml = html.substring(0, start) + before + selected + after + html.substring(end);
    onChange(newHtml);
    setTimeout(() => { el.focus(); el.setSelectionRange(start + before.length, end + before.length); }, 0);
  };

  const insertTag = (tag: string) => wrapSelection(`<${tag}>`, `</${tag}>`);
  const insertBlock = (block: string) => {
    const el = ref.current;
    if (!el) return;
    const pos = el.selectionStart;
    const newHtml = html.substring(0, pos) + block + html.substring(pos);
    onChange(newHtml);
  };

  const ToolbarBtn = ({ onClick, children, title }: { onClick: () => void; children: React.ReactNode; title: string }) => (
    <button onClick={onClick} title={title} className="px-2 py-1 hover:bg-slate-200 rounded text-slate-600 text-sm font-medium transition-colors">{children}</button>
  );

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1.5">
        {/* Group 1: Headings */}
        <div className="flex items-center gap-0.5">
          <ToolbarBtn onClick={() => insertTag('h1')} title="Heading 1">H1</ToolbarBtn>
          <ToolbarBtn onClick={() => insertTag('h2')} title="Heading 2">H2</ToolbarBtn>
          <ToolbarBtn onClick={() => insertTag('h3')} title="Heading 3">H3</ToolbarBtn>
          <ToolbarBtn onClick={() => insertTag('h4')} title="Heading 4">H4</ToolbarBtn>
        </div>
        <div className="w-px h-5 bg-slate-200 mx-1" />
        {/* Group 2: Formatting */}
        <div className="flex items-center gap-0.5">
          <ToolbarBtn onClick={() => wrapSelection('<strong>')} title="Bold"><Bold className="w-3.5 h-3.5" /></ToolbarBtn>
          <ToolbarBtn onClick={() => wrapSelection('<em>')} title="Italic"><Italic className="w-3.5 h-3.5" /></ToolbarBtn>
          <ToolbarBtn onClick={() => wrapSelection('<u>')} title="Underline"><Underline className="w-3.5 h-3.5" /></ToolbarBtn>
          <ToolbarBtn onClick={() => wrapSelection('<s>')} title="Strikethrough"><Strikethrough className="w-3.5 h-3.5" /></ToolbarBtn>
        </div>
        <div className="w-px h-5 bg-slate-200 mx-1" />
        {/* Group 3: Lists */}
        <div className="flex items-center gap-0.5">
          <ToolbarBtn onClick={() => insertBlock('<ul>\n  <li>Item</li>\n</ul>\n')} title="Bullet List"><List className="w-3.5 h-3.5" /></ToolbarBtn>
          <ToolbarBtn onClick={() => insertBlock('<ol>\n  <li>Item</li>\n</ol>\n')} title="Numbered List"><ListOrdered className="w-3.5 h-3.5" /></ToolbarBtn>
        </div>
        <div className="w-px h-5 bg-slate-200 mx-1" />
        {/* Group 4: Alignment */}
        <div className="flex items-center gap-0.5">
          <ToolbarBtn onClick={() => wrapSelection('<div style="text-align:left">')} title="Align Left"><AlignLeft className="w-3.5 h-3.5" /></ToolbarBtn>
          <ToolbarBtn onClick={() => wrapSelection('<div style="text-align:center">')} title="Align Center"><AlignCenter className="w-3.5 h-3.5" /></ToolbarBtn>
          <ToolbarBtn onClick={() => wrapSelection('<div style="text-align:right">')} title="Align Right"><AlignRight className="w-3.5 h-3.5" /></ToolbarBtn>
        </div>
        <div className="w-px h-5 bg-slate-200 mx-1" />
        {/* Group 5: Extras */}
        <div className="flex items-center gap-0.5">
          <ToolbarBtn onClick={() => insertBlock('<blockquote>Quote</blockquote>\n')} title="Blockquote"><QuoteIcon className="w-3.5 h-3.5" /></ToolbarBtn>
          <ToolbarBtn onClick={() => insertBlock('<pre><code>code</code></pre>\n')} title="Code Block"><Code className="w-3.5 h-3.5" /></ToolbarBtn>
          <ToolbarBtn onClick={() => insertBlock('<hr />\n')} title="Horizontal Divider"><Minus className="w-3.5 h-3.5" /></ToolbarBtn>
          <ToolbarBtn onClick={() => wrapSelection('<mark>')} title="Highlight"><Highlighter className="w-3.5 h-3.5" /></ToolbarBtn>
        </div>
      </div>
      {/* Textarea */}
      <textarea
        ref={ref}
        value={html}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        placeholder="Write lesson content here... Use the toolbar above for formatting."
        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
      />
      {/* Preview */}
      {html && (
        <details className="mt-1">
          <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700">Preview</summary>
          <div
            className="mt-2 p-3 border border-slate-200 rounded-lg prose prose-slate max-w-none [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-semibold [&_p]:text-sm [&_p]:text-slate-600 [&_p]:mb-2"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </details>
      )}
    </div>
  );
}

// ─── Block Picker Panel ───────────────────────────────────────────────
export function BlockPicker({ onInsert, onClose }: { onInsert: (type: BlockType) => void; onClose: () => void }) {
  const iconMap: Record<string, any> = { Type, Info, Star, Target, BarChart3, Columns3, ChevronDown, ImageIcon, HelpCircle, CheckSquare, QuoteIcon, GitCommit, Layers, Download };
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Add a Block</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded"><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {BLOCK_DEFINITIONS.map((b) => {
            const Icon = iconMap[b.icon] || Type;
            return (
              <button
                key={b.type}
                onClick={() => { onInsert(b.type); onClose(); }}
                className="flex flex-col items-center gap-2 p-4 border border-slate-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-colors text-center"
              >
                <Icon className="w-6 h-6 text-primary-600" />
                <span className="text-sm font-medium text-slate-700">{b.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
