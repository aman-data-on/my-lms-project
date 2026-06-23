import { useState } from 'react';
import {
  Info, AlertTriangle, Lightbulb, CheckCircle2, Star,
  ChevronDown, HelpCircle, CheckSquare,
  Quote as QuoteIcon, Download, Check, ChevronLeft, ChevronRight
} from 'lucide-react';
import type { BlockBase } from '../lib/blocks';

// ─── Student Block Renderer ──────────────────────────────────────────
export function BlockRenderer({ block, lessonId, userId }: { block: BlockBase; lessonId: string; userId: string }) {
  switch (block.type) {
    case 'text': return <TextBlockView data={block.data} />;
    case 'callout': return <CalloutBlockView data={block.data} />;
    case 'key_takeaway': return <KeyTakeawayBlockView data={block.data} />;
    case 'learning_objectives': return <LearningObjectivesBlockView data={block.data} />;
    case 'stat_card': return <StatCardBlockView data={block.data} />;
    case 'two_column': return <TwoColumnBlockView data={block.data} />;
    case 'accordion': return <AccordionBlockView data={block.data} />;
    case 'image_caption': return <ImageCaptionBlockView data={block.data} />;
    case 'knowledge_check': return <KnowledgeCheckBlockView data={block.data} />;
    case 'checklist': return <ChecklistBlockView data={block.data} lessonId={lessonId} userId={userId} />;
    case 'quote': return <QuoteBlockView data={block.data} />;
    case 'timeline': return <TimelineBlockView data={block.data} />;
    case 'flashcard': return <FlashcardBlockView data={block.data} />;
    case 'download_resource': return <DownloadResourceBlockView data={block.data} />;
    default: return null;
  }
}

// ─── 1. Text Block ────────────────────────────────────────────────────
function TextBlockView({ data }: { data: any }) {
  if (!data.html) return null;
  return (
    <div
      className="prose prose-slate max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-slate-800 [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-800 [&_h2]:mt-5 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-slate-700 [&_h3]:mt-4 [&_h3]:mb-2 [&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-slate-700 [&_h4]:mt-3 [&_h4]:mb-2 [&_p]:text-slate-600 [&_p]:text-base [&_p]:leading-relaxed [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_ol]:mb-4 [&_li]:text-slate-600 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_table]:mb-4 [&_th]:bg-primary-800 [&_th]:text-white [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_td]:px-3 [&_td]:py-2 [&_td]:border-b [&_td]:border-slate-100 [&_tr:nth-child(even)]:bg-slate-50 [&_strong]:text-slate-800 [&_blockquote]:border-l-4 [&_blockquote]:border-primary-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-600 [&_blockquote]:my-4 [&_pre]:bg-slate-800 [&_pre]:text-slate-100 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4 [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_hr]:border-slate-200 [&_hr]:my-6 [&_mark]:bg-yellow-200 [&_mark]:px-1 [&_mark]:rounded"
      dangerouslySetInnerHTML={{ __html: data.html }}
    />
  );
}

// ─── 2. Callout Box ──────────────────────────────────────────────────
function CalloutBlockView({ data }: { data: any }) {
  const config: Record<string, { bg: string; border: string; text: string; Icon: any }> = {
    info: { bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-800', Icon: Info },
    warning: { bg: 'bg-amber-50', border: 'border-amber-400', text: 'text-amber-800', Icon: AlertTriangle },
    tip: { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-800', Icon: Lightbulb },
    success: { bg: 'bg-teal-50', border: 'border-teal-400', text: 'text-teal-800', Icon: CheckCircle2 },
  };
  const c = config[data.type] || config.info;
  const Icon = c.Icon;
  return (
    <div className={`${c.bg} ${c.border} border-l-4 rounded-r-lg p-4 my-4 flex items-start gap-3`}>
      <Icon className={`w-5 h-5 ${c.text} mt-0.5 flex-shrink-0`} />
      <p className={`${c.text} text-sm leading-relaxed flex-1`}>{data.text}</p>
    </div>
  );
}

// ─── 3. Key Takeaway ─────────────────────────────────────────────────
function KeyTakeawayBlockView({ data }: { data: any }) {
  if (!data.text) return null;
  return (
    <div className="bg-indigo-50 border-l-4 border-indigo-400 rounded-r-lg p-5 my-4">
      <div className="flex items-center gap-2 mb-2">
        <Star className="w-5 h-5 text-indigo-600" />
        <span className="font-bold text-indigo-800">Key Takeaway</span>
      </div>
      <p className="text-indigo-700 text-sm leading-relaxed">{data.text}</p>
    </div>
  );
}

// ─── 4. Learning Objectives ──────────────────────────────────────────
function LearningObjectivesBlockView({ data }: { data: any }) {
  const items = (data.items || []).filter((i: string) => i.trim());
  if (items.length === 0) return null;
  return (
    <div className="bg-blue-50 rounded-lg p-5 my-4">
      <p className="font-bold text-slate-800 mb-3">By the end of this lesson, you will:</p>
      <ul className="space-y-2">
        {items.map((item: string, i: number) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── 5. Stat Card ────────────────────────────────────────────────────
function StatCardBlockView({ data }: { data: any }) {
  if (!data.stat) return null;
  return (
    <div className="rounded-lg p-6 my-4 text-center bg-gradient-to-br from-primary-700 to-primary-900 text-white shadow-lg">
      <p className="text-4xl font-extrabold mb-1">{data.stat}</p>
      <p className="text-sm text-primary-100">{data.label}</p>
    </div>
  );
}

// ─── 6. Two Column ───────────────────────────────────────────────────
function TwoColumnBlockView({ data }: { data: any }) {
  if (data.isImageLeft && data.leftImageUrl) {
    return (
      <div className="grid grid-cols-2 gap-4 my-4">
        <div className="rounded-lg overflow-hidden">
          <img src={data.leftImageUrl} alt="" className="w-full object-cover" />
        </div>
        <div
          className="text-sm text-slate-600 leading-relaxed prose prose-slate max-w-none [&_p]:mb-3 [&_strong]:text-slate-800 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4"
          dangerouslySetInnerHTML={{ __html: data.rightText }}
        />
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 my-4">
      <div
        className="text-sm text-slate-600 leading-relaxed prose prose-slate max-w-none [&_p]:mb-3 [&_strong]:text-slate-800"
        dangerouslySetInnerHTML={{ __html: data.leftText }}
      />
      <div
        className="text-sm text-slate-600 leading-relaxed prose prose-slate max-w-none [&_p]:mb-3 [&_strong]:text-slate-800"
        dangerouslySetInnerHTML={{ __html: data.rightText }}
      />
    </div>
  );
}

// ─── 7. Accordion / FAQ ──────────────────────────────────────────────
function AccordionBlockView({ data }: { data: any }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const items = (data.items || []).filter((i: any) => i.question.trim());
  if (items.length === 0) return null;
  return (
    <div className="my-4 space-y-2">
      {items.map((item: any, i: number) => (
        <div key={i} className="border border-slate-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors"
          >
            <span className="font-medium text-slate-800 text-sm">{item.question}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openIdx === i ? 'rotate-180' : ''}`} />
          </button>
          {openIdx === i && (
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
              <p className="text-sm text-slate-600 leading-relaxed">{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── 8. Image with Caption ───────────────────────────────────────────
function ImageCaptionBlockView({ data }: { data: any }) {
  if (!data.url) return null;
  const widthClass = data.size === 'small' ? 'w-2/5' : data.size === 'full' ? 'w-full' : 'w-[70%]';
  return (
    <div className="my-4 flex flex-col items-center">
      <div className={widthClass}>
        <img src={data.url} alt={data.caption || ''} className="w-full rounded-lg" />
        {data.caption && <p className="text-center text-sm italic text-slate-500 mt-2">{data.caption}</p>}
      </div>
    </div>
  );
}

// ─── 9. Knowledge Check ───────────────────────────────────────────────
function KnowledgeCheckBlockView({ data }: { data: any }) {
  const questions = (data.questions || []).filter((q: any) => q.question.trim());
  if (questions.length === 0) return null;
  return (
    <div className="my-4 space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-primary-700">
        <HelpCircle className="w-4 h-4" /> Knowledge Check
      </div>
      {questions.map((q: any, qi: number) => (
        <KnowledgeCheckQuestion key={qi} question={q} />
      ))}
    </div>
  );
}

function KnowledgeCheckQuestion({ question }: { question: any }) {
  const [selected, setSelected] = useState<number | null>(null);
  const options = question.options || [];
  return (
    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
      <p className="font-medium text-slate-800 mb-3 text-sm">{question.question}</p>
      <div className="space-y-2">
        {options.map((opt: string, i: number) => {
          if (!opt.trim()) return null;
          const isCorrect = i === question.correct;
          const isSelected = selected === i;
          let bg = 'bg-white border-slate-200 hover:border-primary-300';
          if (selected !== null) {
            if (isCorrect) bg = 'bg-green-50 border-green-400 text-green-800';
            else if (isSelected) bg = 'bg-red-50 border-red-400 text-red-800';
            else bg = 'bg-white border-slate-200 opacity-60';
          }
          return (
            <button
              key={i}
              onClick={() => setSelected(i)}
              disabled={selected !== null}
              className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${bg}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <p className={`text-xs mt-2 ${selected === question.correct ? 'text-green-600' : 'text-red-600'}`}>
          {selected === question.correct ? 'Correct!' : 'Not quite — the correct answer is highlighted in green.'}
        </p>
      )}
    </div>
  );
}

// ─── 10. Checklist ───────────────────────────────────────────────────
function ChecklistBlockView({ data, lessonId, userId }: { data: any; lessonId: string; userId: string }) {
  const storageKey = `checklist-${lessonId}-${userId}`;
  const [checked, setChecked] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const toggle = (idx: number) => {
    const next = new Set(checked);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setChecked(next);
    localStorage.setItem(storageKey, JSON.stringify([...next]));
  };

  const items = (data.items || []).filter((i: string) => i.trim());
  if (items.length === 0) return null;
  return (
    <div className="my-4 bg-slate-50 rounded-lg p-5 border border-slate-200">
      <div className="flex items-center gap-2 mb-3">
        <CheckSquare className="w-4 h-4 text-slate-600" />
        <span className="font-semibold text-slate-700 text-sm">Checklist</span>
      </div>
      <ul className="space-y-2">
        {items.map((item: string, i: number) => (
          <li key={i}>
            <button onClick={() => toggle(i)} className="flex items-start gap-2 w-full text-left group">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 flex-shrink-0 transition-colors ${checked.has(i) ? 'bg-green-500 border-green-500' : 'border-slate-300 group-hover:border-primary-400'}`}>
                {checked.has(i) && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className={`text-sm ${checked.has(i) ? 'line-through text-slate-400' : 'text-slate-700'}`}>{item}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── 11. Quote ───────────────────────────────────────────────────────
function QuoteBlockView({ data }: { data: any }) {
  if (!data.text) return null;
  return (
    <div className="bg-slate-50 rounded-lg p-6 my-4 relative">
      <QuoteIcon className="w-8 h-8 text-primary-300 absolute top-3 left-3" />
      <blockquote className="text-lg italic text-slate-700 leading-relaxed pl-8">
        {data.text}
      </blockquote>
      {data.author && <p className="text-right text-sm text-slate-500 mt-2">— {data.author}</p>}
    </div>
  );
}

// ─── 12. Timeline ────────────────────────────────────────────────────
function TimelineBlockView({ data }: { data: any }) {
  const steps = (data.steps || []).filter((s: any) => s.title.trim());
  if (steps.length === 0) return null;
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#EC4899'];
  return (
    <div className="relative my-6 pl-8">
      <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-200" />
      <div className="space-y-5">
        {steps.map((step: any, i: number) => {
          const color = colors[i % colors.length];
          return (
            <div key={i} className="relative">
              <div
                className="absolute -left-7 top-1 w-4 h-4 rounded-full border-2 border-white shadow"
                style={{ background: color }}
              />
              {step.date && <span className="text-xs font-semibold text-slate-400">{step.date}</span>}
              <h4 className="font-semibold text-slate-800 text-sm">{step.title}</h4>
              {step.description && <p className="text-sm text-slate-600 mt-1 leading-relaxed">{step.description}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 13. Flashcard ───────────────────────────────────────────────────
function FlashcardBlockView({ data }: { data: any }) {
  const cards = (data.cards || []).filter((c: any) => c.front.trim() || c.back.trim());
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  if (cards.length === 0) return null;
  const card = cards[idx];
  const goNext = () => { setFlipped(false); setIdx((idx + 1) % cards.length); };
  const goPrev = () => { setFlipped(false); setIdx((idx - 1 + cards.length) % cards.length); };
  return (
    <div className="my-4 flex flex-col items-center">
      <div className="text-xs text-slate-400 mb-2">{idx + 1} / {cards.length}</div>
      <button
        onClick={() => setFlipped(!flipped)}
        className="w-80 h-48 rounded-xl shadow-md cursor-pointer flex items-center justify-center p-6 text-center transition-colors"
        style={{
          background: flipped ? 'linear-gradient(135deg, #1E3A8A, #3B82F6)' : 'white',
          border: flipped ? 'none' : '2px solid #E2E8F0',
        }}
      >
        <p className={`text-base font-medium ${flipped ? 'text-white' : 'text-slate-700'}`}>
          {flipped ? card.back : card.front}
        </p>
      </button>
      <div className="flex items-center gap-4 mt-3">
        <button onClick={goPrev} className="p-2 hover:bg-slate-100 rounded-lg">
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
        <button onClick={goNext} className="p-2 hover:bg-slate-100 rounded-lg">
          <ChevronRight className="w-5 h-5 text-slate-600" />
        </button>
      </div>
    </div>
  );
}

// ─── 14. Download Resource ────────────────────────────────────────────
function DownloadResourceBlockView({ data }: { data: any }) {
  if (!data.url) return null;
  return (
    <a
      href={data.url}
      download
      className="flex items-center gap-3 bg-primary-50 border border-primary-200 rounded-lg px-5 py-3 hover:bg-primary-100 transition-colors my-4 w-fit"
    >
      <Download className="w-5 h-5 text-primary-600" />
      <div>
        <p className="text-sm font-medium text-primary-800">{data.label || 'Download Resource'}</p>
        <p className="text-xs text-primary-500">Click to download</p>
      </div>
    </a>
  );
}
