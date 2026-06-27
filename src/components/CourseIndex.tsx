import { useState } from 'react';
import {
  ChevronDown, CheckCircle2, PlayCircle, Lock,
  BookOpen, Play, FileText, ArrowRight,
} from 'lucide-react';
import { cn } from '../lib/cn';
import { tidyTitle, parseDurationMinutes, formatMinutes } from '../lib/utils';

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
  /** Phase numbers to expand on first render. When provided, only those phases open; others stay collapsed. */
  defaultExpandedPhases?: number[];
}

function cleanPhaseName(name: string): string {
  return name.replace(/^Phase \d+\s*[—–-]\s*/i, '');
}

export function CourseIndex({
  courseId,
  phases,
  getPhaseStatus,
  getModuleStatus,
  isPhaseUnlocked,
  isAdmin,
  onModuleClick,
  defaultExpandedPhases,
}: CourseIndexProps) {
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(() =>
    defaultExpandedPhases ? new Set(defaultExpandedPhases) : new Set(),
  );

  const togglePhase = (phaseNum: number) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phaseNum)) {
        next.delete(phaseNum);
      } else {
        // Accordion: close all others, open only this one
        next.clear();
        next.add(phaseNum);
      }
      return next;
    });
  };

  const expandAll = () => setExpandedPhases(new Set(phases.map(p => p.number)));
  const collapseAll = () => setExpandedPhases(new Set());
  const anyExpanded = expandedPhases.size > 0;

  if (phases.length === 0) return null;

  const totalLessons = phases.reduce((acc, p) => acc + p.modules.length, 0);

  return (
    <div>
      {/* Curriculum header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h3 className="font-semibold text-slate-800">Course Curriculum</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {phases.length} phases · {totalLessons} lessons
          </p>
        </div>
        <button
          onClick={anyExpanded ? collapseAll : expandAll}
          className="text-sm text-slate-500 hover:text-primary-700 font-medium px-3 py-1.5 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {anyExpanded ? 'Collapse all' : 'Expand all'}
        </button>
      </div>

      {/* Phase cards */}
      <div className="space-y-3">
        {phases.map((phase) => {
          const phaseStatus = getPhaseStatus(phase.number);
          const unlocked = isAdmin || isPhaseUnlocked(phase.number);
          const isOpen = expandedPhases.has(phase.number);
          const cleanName = cleanPhaseName(phase.name);
          const panelId = `phase-panel-${courseId}-${phase.number}`;
          const triggerId = `phase-trigger-${courseId}-${phase.number}`;

          const totalMods = phase.modules.length;
          const completedMods = phase.modules.filter(m =>
            getModuleStatus(m, m.lessonIndex) === 'completed',
          ).length;
          const phaseMinutes = phase.modules.reduce((acc, m) => acc + parseDurationMinutes(m.duration), 0);
          const phaseTime = formatMinutes(phaseMinutes);

          const isCurrentPhase = phaseStatus === 'in_progress';
          const isCompletePhase = phaseStatus === 'completed';

          return (
            <div
              key={phase.number}
              className={cn(
                'bg-white rounded-xl border overflow-hidden',
                isCurrentPhase
                  ? 'border-primary-200 shadow-sm'
                  : isCompletePhase
                  ? 'border-green-100'
                  : 'border-slate-200',
                unlocked && 'transition-shadow duration-200 hover:shadow-md',
                !unlocked && 'opacity-60',
              )}
            >
              {/* Phase trigger */}
              <button
                id={triggerId}
                onClick={() => { if (unlocked) togglePhase(phase.number); }}
                aria-expanded={unlocked ? isOpen : undefined}
                aria-disabled={!unlocked || undefined}
                aria-controls={panelId}
                className={cn(
                  'w-full flex items-center gap-3 px-5 py-4 text-left min-h-[64px] transition-[background-color,transform] duration-200 ease-out motion-reduce:transition-none',
                  isCurrentPhase
                    ? 'hover:bg-primary-50/60 active:translate-y-[0.5px] active:duration-100'
                    : unlocked
                    ? 'hover:bg-slate-100 active:translate-y-[0.5px] active:duration-100'
                    : 'cursor-default',
                )}
              >
                {/* Phase state indicator — brand state system (not a rainbow):
                    completed = darker brand red, current = brand red, locked/
                    upcoming = neutral gray. The "Completed" pill (below) carries
                    the check. */}
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5 transition-colors"
                  style={{
                    backgroundColor:
                      isCompletePhase ? '#9B1C20'        // primary-800 — completed
                      : isCurrentPhase ? '#ED3237'        // primary-600 — current
                      : '#CBD5E1',                        // slate-300 — locked / upcoming
                  }}
                  aria-hidden="true"
                />

                {/* Phase label */}
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                    Phase {phase.number}
                  </p>
                  <p className={cn(
                    'text-sm font-semibold leading-snug truncate',
                    !unlocked
                      ? 'text-slate-400'
                      : isCurrentPhase
                      ? 'text-primary-900'
                      : 'text-slate-800',
                  )}>
                    {cleanName}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {unlocked ? (
                      `${completedMods} of ${totalMods} lessons completed${phaseTime ? ` · ${phaseTime}` : ''}`
                    ) : (
                      <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3" aria-hidden="true" />
                        Complete Phase {phase.number - 1} to unlock
                      </span>
                    )}
                  </p>
                </div>

                {/* Status + chevron */}
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  {isCompletePhase && (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                      <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                      Completed
                    </span>
                  )}
                  {isCurrentPhase && unlocked && (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                      <PlayCircle className="w-3 h-3" aria-hidden="true" />
                      In progress
                    </span>
                  )}
                  {!unlocked ? (
                    <Lock className="w-4 h-4 text-slate-300" aria-hidden="true" />
                  ) : (
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 text-slate-400 transition-transform duration-200',
                        isOpen && 'rotate-180',
                      )}
                      aria-hidden="true"
                    />
                  )}
                </div>
              </button>

              {/* Module panel — CSS grid animation */}
              <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                className={cn(
                  'grid transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none',
                  isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                )}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-slate-100">
                    {!unlocked ? (
                      <div className="flex items-center gap-2 px-5 py-4 text-sm text-slate-500">
                        <Lock className="w-4 h-4 text-slate-300 flex-shrink-0" aria-hidden="true" />
                        Complete Phase {phase.number - 1} to unlock this phase.
                      </div>
                    ) : (
                      phase.modules.map((mod, modIdx) => {
                        const modStatus = isAdmin
                          ? 'available'
                          : getModuleStatus(mod, mod.lessonIndex);
                        const isLocked = modStatus === 'locked';
                        const isCompleted = modStatus === 'completed';
                        const isCurrent = modStatus === 'current';
                        const globalNum = mod.lessonIndex + 1;

                        const TypeIcon =
                          mod.type === 'video'
                            ? Play
                            : mod.type === 'quiz' || mod.type === 'assessment'
                            ? FileText
                            : BookOpen;

                        return (
                          <button
                            key={`${mod.id}-${mod.lessonIndex}`}
                            onClick={() => {
                              if (!isLocked || isAdmin) onModuleClick(mod.lessonIndex);
                            }}
                            disabled={isLocked && !isAdmin}
                            title={isLocked && !isAdmin ? `Complete Module ${mod.lessonIndex} to unlock` : undefined}
                            className={cn(
                              'group w-full flex items-center gap-3 px-5 py-3 text-left min-h-[44px] transition-[background-color,transform,box-shadow] duration-200 ease-out motion-reduce:transition-none',
                              modIdx > 0 && 'border-t border-slate-50',
                              isLocked && !isAdmin
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-primary-50/50 active:translate-y-[0.5px] active:duration-100 cursor-pointer',
                              !isLocked && !isCurrent && 'hover:shadow-[inset_3px_0_0_0_rgba(237,50,55,0.5)]',
                              isCurrent && 'bg-primary-50 hover:bg-primary-50/80 shadow-[inset_3px_0_0_0_#ED3237]',
                            )}
                          >
                            {/* State icon */}
                            <div className="w-5 flex-shrink-0 flex items-center justify-center">
                              {isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" aria-hidden="true" />
                              ) : isLocked ? (
                                <Lock className="w-3.5 h-3.5 text-slate-300" aria-hidden="true" />
                              ) : isCurrent ? (
                                <span className="w-2 h-2 rounded-full bg-primary-600 block" aria-hidden="true" />
                              ) : (
                                <span className="text-xs font-semibold text-slate-400 tabular-nums w-5 text-center">
                                  {globalNum}
                                </span>
                              )}
                            </div>

                            {/* Title + meta */}
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                'text-sm font-medium truncate',
                                isLocked
                                  ? 'text-slate-400'
                                  : isCurrent
                                  ? 'text-primary-800'
                                  : 'text-slate-700',
                              )}>
                                {!isCompleted && (
                                  <span className="text-slate-300 mr-1 text-xs">{globalNum}.</span>
                                )}
                                {tidyTitle(mod.title)}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <TypeIcon className="w-3 h-3 text-slate-300" aria-hidden="true" />
                                <span className="text-xs text-slate-400">
                                  {mod.duration || 'N/A'}
                                </span>
                              </div>
                            </div>

                            {/* Right arrow for available/current */}
                            {!isLocked && !isCompleted && (
                              <ArrowRight
                                className={cn(
                                  'w-3.5 h-3.5 flex-shrink-0 transition-[transform,color] duration-150 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none',
                                  isCurrent ? 'text-primary-300 group-hover:text-primary-500' : 'text-slate-200 group-hover:text-slate-400',
                                )}
                                aria-hidden="true"
                              />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
