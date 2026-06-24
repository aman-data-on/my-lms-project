import { useState, useEffect } from 'react';
import {
  ChevronDown, ChevronUp, ChevronRight, CheckCircle2, PlayCircle, Lock,
  BookOpen, Play, FileText, ArrowRight
} from 'lucide-react';
import { cn } from '../lib/cn';

export interface IndexPhase {
  number: number;
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description?: string;
  modules: IndexModule[];
}

export interface IndexModule {
  id: string;
  title: string;
  type: string;
  duration: string | null;
  description?: string;
  lessonIndex: number;
}

type PhaseStatus = 'completed' | 'in_progress' | 'locked' | 'not_started';
type ModuleStatus = 'completed' | 'current' | 'available' | 'locked';

interface CourseIndexProps {
  courseId: string;
  userId: string;
  phases: IndexPhase[];
  getPhaseStatus: (phaseNum: number) => PhaseStatus;
  getModuleStatus: (module: IndexModule, lessonIndex: number) => ModuleStatus;
  isPhaseUnlocked: (phaseNum: number) => boolean;
  isAdmin: boolean;
  onModuleClick: (lessonIndex: number) => void;
}

// Strip redundant "Phase N — " prefix if the name already contains it
function cleanPhaseName(name: string): string {
  return name.replace(/^Phase \d+\s*[—–-]\s*/i, '');
}

export function CourseIndex({
  courseId,
  userId,
  phases,
  getPhaseStatus,
  getModuleStatus,
  isPhaseUnlocked,
  isAdmin,
  onModuleClick,
}: CourseIndexProps) {
  const storageKey = `course-index-${courseId}-${userId}`;
  const [allCollapsed, setAllCollapsed] = useState(false);
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(
    () => new Set(phases.map(p => p.number)),
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) setAllCollapsed(saved === 'true');
    } catch { /* ignore */ }
  }, [storageKey]);

  const toggleAll = () => {
    const next = !allCollapsed;
    setAllCollapsed(next);
    try { localStorage.setItem(storageKey, String(next)); } catch { /* ignore */ }
  };

  const togglePhase = (phaseNum: number) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phaseNum)) next.delete(phaseNum);
      else next.add(phaseNum);
      return next;
    });
  };

  if (phases.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div>
          <h3 className="font-semibold text-slate-800">Course Curriculum</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {phases.length} phases · {phases.reduce((acc, p) => acc + p.modules.length, 0)} lessons
          </p>
        </div>
        <button
          onClick={toggleAll}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 font-medium px-3 py-1.5 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {allCollapsed ? (
            <><ChevronDown className="w-4 h-4" /> Show all</>
          ) : (
            <><ChevronUp className="w-4 h-4" /> Hide all</>
          )}
        </button>
      </div>

      {/* Body */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: allCollapsed ? '0px' : '6000px' }}
      >
        <div className="divide-y divide-slate-50">
          {phases.map((phase) => {
            const phaseStatus = getPhaseStatus(phase.number);
            const unlocked = isAdmin || isPhaseUnlocked(phase.number);
            const isPhaseOpen = expandedPhases.has(phase.number);
            const cleanName = cleanPhaseName(phase.name);

            const totalMods = phase.modules.length;
            const completedMods = phase.modules.filter(m => {
              const s = getModuleStatus(m, m.lessonIndex);
              return s === 'completed';
            }).length;

            return (
              <div key={phase.number}>
                {/* Phase header — click to expand/collapse */}
                <button
                  onClick={() => togglePhase(phase.number)}
                  aria-expanded={isPhaseOpen}
                  className={cn(
                    'w-full flex items-center gap-3 px-6 py-4 text-left transition-colors',
                    !unlocked ? 'opacity-70' : 'hover:bg-slate-50',
                  )}
                >
                  {/* Phase colour dot */}
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: phase.color }}
                    aria-hidden="true"
                  />

                  {/* Phase label + meta */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
                        Phase {phase.number}
                      </span>
                      <span className="font-semibold text-slate-800 text-sm leading-snug">
                        {cleanName}
                      </span>
                    </div>
                    {unlocked ? (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {completedMods} / {totalMods} completed
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <Lock className="w-3 h-3" aria-hidden="true" />
                        Complete previous phase to unlock
                      </p>
                    )}
                  </div>

                  {/* Status badge */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {phaseStatus === 'completed' && (
                      <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" aria-hidden="true" /> Done
                      </span>
                    )}
                    {phaseStatus === 'in_progress' && unlocked && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full flex items-center gap-1">
                        <PlayCircle className="w-3 h-3" aria-hidden="true" /> In progress
                      </span>
                    )}
                    {isPhaseOpen
                      ? <ChevronDown className="w-4 h-4 text-slate-400" aria-hidden="true" />
                      : <ChevronRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
                    }
                  </div>
                </button>

                {/* Module list */}
                {isPhaseOpen && (
                  <div className="pb-2">
                    {phase.modules.map((mod) => {
                      const modStatus = isAdmin ? 'available' : getModuleStatus(mod, mod.lessonIndex);
                      const isLocked = modStatus === 'locked';
                      const isCompleted = modStatus === 'completed';
                      const isCurrent = modStatus === 'current';

                      const globalLessonNum = mod.lessonIndex + 1;

                      const typeIcon = mod.type === 'video'
                        ? Play
                        : mod.type === 'quiz' || mod.type === 'assessment'
                          ? FileText
                          : BookOpen;

                      const subText = mod.duration || 'N/A';

                      return (
                        <button
                          key={mod.id + '-' + mod.lessonIndex}
                          onClick={() => {
                            if (!isLocked || isAdmin) onModuleClick(mod.lessonIndex);
                          }}
                          disabled={isLocked && !isAdmin}
                          className={cn(
                            'w-full flex items-center gap-3 px-6 py-3 text-left transition-colors',
                            isLocked
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-slate-50 cursor-pointer',
                            isCurrent ? 'bg-primary-50 hover:bg-primary-50' : '',
                          )}
                        >
                          {/* Lesson number */}
                          <span
                            className={cn(
                              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                              isCompleted
                                ? 'bg-green-100 text-green-700'
                                : isCurrent
                                  ? 'bg-primary-100 text-primary-700'
                                  : isLocked
                                    ? 'bg-slate-100 text-slate-400'
                                    : 'bg-slate-100 text-slate-600',
                            )}
                            aria-hidden="true"
                          >
                            {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : globalLessonNum}
                          </span>

                          {/* Title + meta */}
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              'text-sm font-medium truncate',
                              isLocked ? 'text-slate-400' : isCurrent ? 'text-primary-800' : 'text-slate-700',
                            )}>
                              {mod.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {(() => {
                                const Icon = typeIcon;
                                return <Icon className="w-3 h-3 text-slate-400" aria-hidden="true" />;
                              })()}
                              <span className="text-xs text-slate-400">{subText}</span>
                            </div>
                          </div>

                          {/* Right status */}
                          <div className="flex-shrink-0">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" aria-hidden="true" />
                            ) : isCurrent ? (
                              <span className="w-2 h-2 rounded-full bg-primary-500" aria-hidden="true" />
                            ) : isLocked ? (
                              <Lock className="w-4 h-4 text-slate-300" aria-hidden="true" />
                            ) : (
                              <ArrowRight className="w-4 h-4 text-slate-300" aria-hidden="true" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
