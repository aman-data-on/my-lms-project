import { useState, useEffect } from 'react';
import {
  Map, ChevronUp, ChevronDown, CheckCircle2, PlayCircle, Lock, Circle,
  BookOpen, Play, ClipboardList, FileText, Clock, ArrowRight
} from 'lucide-react';

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
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) setCollapsed(saved === 'true');
    } catch { /* ignore */ }
  }, [storageKey]);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem(storageKey, String(next)); } catch { /* ignore */ }
  };

  const scrollToPhase = (phaseNum: number) => {
    const el = document.getElementById(`phase-${phaseNum}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (phases.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-primary-600 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center gap-3">
          <Map className="w-5 h-5 text-primary-600" />
          <div>
            <h3 className="font-bold text-slate-800">Course Index</h3>
            <p className="text-xs text-slate-400">Full course overview</p>
          </div>
        </div>
        <button
          onClick={toggleCollapse}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 font-medium px-3 py-1.5 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {collapsed ? 'Show' : 'Hide'}
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {/* Body with smooth max-height transition */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: collapsed ? '0px' : '3000px' }}
      >
        <div className="px-6 pb-6 space-y-4">
          {phases.map((phase, idx) => {
            const phaseStatus = getPhaseStatus(phase.number);
            const unlocked = isAdmin || isPhaseUnlocked(phase.number);

            const totalModules = phase.modules.length;
            const completedModules = phase.modules.filter(m => {
              const s = isAdmin ? 'available' : getModuleStatus(m, m.lessonIndex);
              return s === 'completed';
            }).length;
            const progressPct = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

            let headerBg = '';
            if (phaseStatus === 'completed') headerBg = 'bg-green-50';
            else if (phaseStatus === 'in_progress' && unlocked) headerBg = 'bg-blue-50';
            else if (!unlocked) headerBg = 'bg-gray-50';

            let statusBadge;
            if (phaseStatus === 'completed') {
              statusBadge = <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
            } else if (phaseStatus === 'in_progress' && unlocked) {
              statusBadge = <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex items-center gap-1"><PlayCircle className="w-3 h-3" /> In Progress</span>;
            } else if (phaseStatus === 'locked' || !unlocked) {
              statusBadge = <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full flex items-center gap-1"><Lock className="w-3 h-3" /> Locked</span>;
            } else {
              statusBadge = <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full flex items-center gap-1"><Circle className="w-3 h-3" /> Not Started</span>;
            }

            return (
              <div key={phase.number}>
                {/* Divider between phases */}
                {idx > 0 && <hr className="border-slate-100 mb-4" />}

                {/* Phase header - clickable to scroll */}
                <button
                  onClick={() => scrollToPhase(phase.number)}
                  className={`w-full flex items-center justify-between text-left mb-3 py-1 px-2 -mx-2 rounded-lg transition-colors ${headerBg} group`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: phase.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-slate-800 text-base group-hover:text-primary-700 transition-colors">
                        Phase {phase.number} — {phase.name}
                      </span>
                      {phase.description && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">{phase.description}</p>
                      )}
                    </div>
                    {/* Mini progress */}
                    <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                      {!unlocked ? (
                        <span className="text-xs text-gray-400">Locked</span>
                      ) : (
                        <>
                          <span className="text-xs text-gray-500">{completedModules} / {totalModules}</span>
                          <div className="w-20 bg-gray-200 rounded-full h-1">
                            <div
                              className="rounded-full h-1 transition-all"
                              style={{ width: `${progressPct}%`, backgroundColor: phase.color }}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  {statusBadge}
                </button>

                {/* Module grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-5">
                  {phase.modules.map((mod) => {
                    const modStatus = isAdmin ? 'available' : getModuleStatus(mod, mod.lessonIndex);
                    const isLocked = modStatus === 'locked';
                    const isCompleted = modStatus === 'completed';
                    const isCurrent = modStatus === 'current';

                    const typeIcon = mod.type === 'video'
                      ? Play
                      : mod.type === 'quiz' || mod.type === 'assessment'
                        ? FileText
                        : mod.type === 'task'
                          ? ClipboardList
                          : BookOpen;

                    const subText = mod.description
                      ? mod.description
                      : [
                          mod.type === 'video' ? 'Video' : mod.type === 'quiz' || mod.type === 'assessment' ? 'Assessment' : mod.type === 'task' ? 'Task' : 'Reading',
                          mod.duration || 'N/A',
                        ].join(' · ');

                    return (
                      <button
                        key={mod.id + '-' + mod.lessonIndex}
                        onClick={() => {
                          if (!isLocked || isAdmin) onModuleClick(mod.lessonIndex);
                        }}
                        disabled={isLocked && !isAdmin}
                        className={`flex items-center gap-3 p-2.5 rounded-lg border text-left transition-all duration-150 ease-in-out ${
                          isLocked
                            ? 'border-gray-100 cursor-not-allowed opacity-50'
                            : 'border-slate-200 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
                        } ${isCurrent ? 'border-blue-300 bg-blue-50' : ''}`}
                      >
                        {/* Left: type icon */}
                        {(() => {
                          const Icon = typeIcon;
                          return <Icon className={`w-4 h-4 flex-shrink-0 ${isLocked ? 'text-gray-300' : isCompleted ? 'text-slate-400' : 'text-primary-500'}`} />;
                        })()}

                        {/* Middle: title + subtext */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${isLocked ? 'text-gray-400' : 'text-slate-700'}`}>
                            {mod.title}
                          </p>
                          <p className="text-xs text-slate-400 truncate">{subText}</p>
                        </div>

                        {/* Right: status icon (20px) */}
                        <div className="flex-shrink-0">
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : isCurrent ? (
                            <Clock className="w-5 h-5 text-blue-500" />
                          ) : isLocked ? (
                            <Lock className="w-5 h-5 text-gray-300" />
                          ) : (
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
