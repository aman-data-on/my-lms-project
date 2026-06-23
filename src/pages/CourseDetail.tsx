import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { safeHtml } from '../lib/sanitize';
import {
  fetchCourse,
  fetchLessons,
  fetchLessonProgress,
  upsertLessonProgress,
  upsertEnrollment,
  insertActivity,
} from '../lib/api';
import { pushLessonCompletion, markLessonCompleteInProgress } from '../lib/reportData';
import {
  ChevronLeft, Play, FileText, HelpCircle, CheckCircle2, Lock,
  Clock, Award, BookOpen, Check
} from 'lucide-react';
import { BlockRenderer } from '../components/BlockRenderer';
import { CourseIndex, type IndexPhase, type IndexModule } from '../components/CourseIndex';
import type { BlockBase } from '../lib/blocks';

interface Lesson {
  id: string;
  title: string;
  type: string;
  video_url: string | null;
  duration: string | null;
  order_index: number;
  section: string | null;
}

interface Course {
  id: string;
  title: string;
  description: string;
  department: string;
  thumbnail_url: string | null;
  duration: string;
}

// ─── Lesson Content Renderer with TOC + Read Time ───────────────────
function LessonContent({
  lesson,
  course,
  completedLessons,
  currentLessonIndex,
  totalLessons,
  userId,
  onMarkComplete,
}: {
  lesson: any;
  course: any;
  completedLessons: Set<string>;
  currentLessonIndex: number;
  totalLessons: number;
  userId: string;
  onMarkComplete: () => void;
}) {
  // Parse blocks from lesson.video_url
  const blocks: BlockBase[] = useMemo(() => {
    if (!lesson.video_url) return [];
    const trimmed = lesson.video_url.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed;
      } catch { /* fall through */ }
    }
    return [{ id: 'legacy-text', type: 'text' as const, data: { html: trimmed } }];
  }, [lesson.video_url]);

  // Calculate read time (200 words/min, min 1 min)
  const readTime = useMemo(() => {
    const allText = blocks.map(b => {
      if (b.type === 'text' && b.data.html) return b.data.html.replace(/<[^>]+>/g, ' ');
      return JSON.stringify(b.data).replace(/<[^>]+>/g, ' ');
    }).join(' ');
    const words = allText.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  }, [blocks]);

  // Extract headings for TOC
  const headings = useMemo(() => {
    const result: { id: string; level: number; text: string }[] = [];
    blocks.forEach(b => {
      if (b.type === 'text' && b.data.html) {
        const matches = b.data.html.match(/<h([1-4])[^>]*>(.*?)<\/h\1>/gi);
        if (matches) {
          matches.forEach((m: string) => {
            const levelMatch = m.match(/<h([1-4])/i);
            const textMatch = m.match(/>([^<]*)</);
            if (levelMatch && textMatch && textMatch[1].trim()) {
              const text = textMatch[1].trim();
              result.push({
                id: `heading-${result.length}`,
                level: parseInt(levelMatch[1]),
                text,
              });
            }
          });
        }
      }
    });
    return result;
  }, [blocks]);

  const scrollToHeading = (idx: number) => {
    const el = document.getElementById(`heading-${idx}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex gap-6">
      {/* Main content */}
      <div className="flex-1 space-y-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              {lesson.type === 'video' ? 'Video' : lesson.type === 'quiz' ? 'Quiz' : 'Reading'}
            </span>
            <span className="text-sm text-slate-400 flex items-center gap-1">
              <Clock className="w-4 h-4" /> {lesson.duration || '5 min'}
            </span>
            <span className="text-sm text-slate-400 flex items-center gap-1">
              ~ {readTime} min read
            </span>
          </div>

          <h3 className="text-2xl font-bold text-slate-800 mb-6">{lesson.title}</h3>

          {blocks.length > 0 ? (
            <div>
              {blocks.map((block) => {
                // Add heading IDs for TOC scroll
                if (block.type === 'text' && block.data.html) {
                  let headingIdx = 0;
                  const html = block.data.html.replace(/<h([1-4])/gi, (_match: string, level: string) => {
                    return `<h${level} id="heading-${headingIdx++}"`;
                  });
                  return <BlockRenderer key={block.id} block={{ ...block, data: { ...block.data, html } }} lessonId={lesson.id} userId={userId} />;
                }
                return <BlockRenderer key={block.id} block={block} lessonId={lesson.id} userId={userId} />;
              })}
            </div>
          ) : lesson.video_url ? (
            <div
              className="prose prose-slate max-w-none [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-slate-800 [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:text-slate-600 [&_p]:text-base [&_p]:leading-relaxed [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_ol]:mb-4 [&_li]:text-slate-600 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_table]:mb-4 [&_th]:bg-primary-800 [&_th]:text-white [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_td]:px-3 [&_td]:py-2 [&_td]:border-b [&_td]:border-slate-100 [&_tr:nth-child(even)]:bg-slate-50 [&_div]:rounded-lg [&_strong]:text-slate-800"
              dangerouslySetInnerHTML={{ __html: safeHtml(lesson.video_url) }}
            />
          ) : (
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-600 text-base leading-relaxed mb-4">
                {course?.description}
              </p>
              <p className="text-slate-600 text-base leading-relaxed mb-4">
                This lesson covers the fundamental concepts and best practices related to {lesson.title.toLowerCase()}.
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                {completedLessons.size === totalLessons - 1 && !completedLessons.has(lesson.id)
                  ? 'Final Lesson — Complete to finish the course'
                  : completedLessons.has(lesson.id)
                    ? currentLessonIndex < totalLessons - 1 ? 'Completed — Continue to next lesson' : 'Course Completed'
                    : `Lesson ${currentLessonIndex + 1} of ${totalLessons}`}
              </p>
            </div>
            <button
              onClick={onMarkComplete}
              className="flex items-center gap-2 px-6 py-3 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-900 transition-colors"
            >
              <Check className="w-4 h-4" />
              {completedLessons.size === totalLessons - 1 && !completedLessons.has(lesson.id)
                ? 'Complete Course'
                : completedLessons.has(lesson.id)
                  ? currentLessonIndex < totalLessons - 1 ? 'Continue to Next Lesson' : 'Course Completed'
                  : 'Mark as Complete & Continue'}
            </button>
          </div>
        </div>
      </div>

      {/* Sticky TOC - desktop only */}
      {headings.length > 0 && (
        <div className="hidden xl:block w-56 flex-shrink-0">
          <div className="sticky top-4 bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">On this page</h4>
            <ul className="space-y-1.5">
              {headings.map((h, i) => (
                <li key={i} style={{ marginLeft: (h.level - 1) * 12 }}>
                  <button
                    onClick={() => scrollToHeading(i)}
                    className="text-left text-sm text-slate-600 hover:text-primary-700 transition-colors leading-snug"
                  >
                    {h.text}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CourseDetail({ courseId, onNavigate }: { courseId: string; onNavigate: (page: string, data?: any) => void }) {
  const { user, isAdmin } = useAuth();
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const queryClient = useQueryClient();

  const { data: course, isLoading: courseLoading } = useQuery<Course>({ queryKey: ['course', courseId], queryFn: () => fetchCourse(courseId), enabled: !!user && !!courseId });
  const { data: lessons = [], isLoading: lessonsLoading } = useQuery<Lesson[]>({ queryKey: ['lessons', courseId], queryFn: () => fetchLessons(courseId), enabled: !!user && !!courseId });
  const { data: progressData = [], isLoading: progressLoading } = useQuery<any[]>({ queryKey: ['progress', user?.id], queryFn: () => fetchLessonProgress(user!.id), enabled: !!user });

  const loading = courseLoading || lessonsLoading || progressLoading;
  const completedLessons = useMemo(() => new Set<string>((progressData || []).map((p: any) => p.lesson_id)), [progressData]);

  useEffect(() => {
    if (!user) return;
    // Find the first incomplete lesson or default to first lesson when data loads
    const completedSet = new Set<string>((progressData || []).map((p: any) => p.lesson_id));
    const firstIncomplete = (lessons || []).findIndex((l: Lesson) => !completedSet.has(l.id));
    setCurrentLessonIndex(firstIncomplete >= 0 ? firstIncomplete : 0);
  }, [lessons, progressData, user]);

  const progressPercent = lessons.length > 0 ? Math.round((completedLessons.size / lessons.length) * 100) : 0;

  const isLessonAccessible = (index: number) => {
    if (isAdmin) return true;
    if (index === 0) return true;
    // A lesson is accessible if the previous lesson is completed
    return completedLessons.has(lessons[index - 1].id);
  };

  const currentLesson = lessons[currentLessonIndex];

  const markCompleteAndContinue = async () => {
    if (!user || !currentLesson) return;

    try {
      // Mark current lesson as complete
      if (!completedLessons.has(currentLesson.id)) {
        await upsertLessonProgress({
          user_id: user.id,
          lesson_id: currentLesson.id,
          completed: true,
          completed_at: new Date().toISOString(),
        });
        // Invalidate progress query so UI updates
        queryClient.invalidateQueries({ queryKey: ['progress', user.id] });
        pushLessonCompletion(user.id, currentLesson.id, courseId, currentLesson.duration || null);
        markLessonCompleteInProgress(user.id, courseId, currentLesson.id);
      }

      // Recompute progress from latest cached data
      const newCompletedCount = (completedLessons.size || 0) + (completedLessons.has(currentLesson.id) ? 0 : 1);
      const newProgress = Math.round((newCompletedCount / lessons.length) * 100);

      if (newCompletedCount === lessons.length) {
        await upsertEnrollment({
          user_id: user.id,
          course_id: courseId,
          progress_percent: 100,
          status: 'completed',
          completed_at: new Date().toISOString(),
        });
        await insertActivity({
          user_id: user.id,
          type: 'course_completed',
          title: 'Completed a course',
          description: course?.title,
        });
        queryClient.invalidateQueries({ queryKey: ['enrollments', user.id] });
        setShowCongrats(true);
      } else {
        const status = newProgress === 100 ? 'completed' : 'in_progress';
        await upsertEnrollment({
          user_id: user.id,
          course_id: courseId,
          progress_percent: newProgress,
          status,
          completed_at: status === 'completed' ? new Date().toISOString() : null,
        });
        queryClient.invalidateQueries({ queryKey: ['enrollments', user.id] });
        setCurrentLessonIndex(currentLessonIndex + 1);
      }
    } catch (err) {
      console.error('Error marking lesson complete', err);
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return Play;
      case 'quiz': return HelpCircle;
      case 'document': return FileText;
      default: return BookOpen;
    }
  };

  const getLessonStatus = (index: number, lesson: Lesson) => {
    if (completedLessons.has(lesson.id)) return 'completed';
    if (index === currentLessonIndex) return 'current';
    if (isLessonAccessible(index)) return 'available';
    return 'locked';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('course-library')}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-slate-800 truncate">{course.title}</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">{course.department}</span>
            <span className="text-xs text-slate-400">{course.duration}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg p-4 border border-slate-100">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-600">Course Progress</span>
          <span className="font-semibold text-primary-700">{completedLessons.size} of {lessons.length} lessons completed</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5">
          <div className="bg-primary-500 rounded-full h-2.5 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Congrats Modal */}
      {showCongrats && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-2xl">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Congratulations!</h3>
            <p className="text-slate-600 mb-6">You have completed the course "{course.title}".</p>
            <button
              onClick={() => onNavigate('assessments')}
              className="px-6 py-3 bg-primary-800 text-white font-medium rounded-lg hover:bg-primary-900 transition-colors"
            >
              Take Assessment
            </button>
          </div>
        </div>
      )}

      {/* Course Index */}
      {(() => {
        // Group lessons by section
        const sectionMap: Record<string, number[]> = {};
        const sectionOrder: string[] = [];
        (lessons || []).forEach((l, idx) => {
          const sec = l.section || 'General';
          if (!sectionMap[sec]) { sectionMap[sec] = []; sectionOrder.push(sec); }
          sectionMap[sec].push(idx);
        });

        const PHASE_COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444'];

        const indexPhases: IndexPhase[] = sectionOrder.map((secName, pIdx) => ({
          number: pIdx + 1,
          name: secName,
          color: PHASE_COLORS[pIdx % PHASE_COLORS.length],
          bgColor: PHASE_COLORS[pIdx % PHASE_COLORS.length] + '10',
          borderColor: PHASE_COLORS[pIdx % PHASE_COLORS.length],
          description: '',
          modules: sectionMap[secName].map(lIdx => ({
            id: lessons[lIdx].id,
            title: lessons[lIdx].title,
            type: lessons[lIdx].type,
            duration: lessons[lIdx].duration,
            lessonIndex: lIdx,
          } as IndexModule)),
        }));

        const getPhaseStatusForIndex = (phaseNum: number): 'completed' | 'in_progress' | 'locked' | 'not_started' => {
          const phaseMods = indexPhases.find(p => p.number === phaseNum);
          if (!phaseMods) return 'not_started';
          const allDone = phaseMods.modules.every(m => lessons[m.lessonIndex] && completedLessons.has(lessons[m.lessonIndex].id));
          if (allDone) return 'completed';
          const anyDone = phaseMods.modules.some(m => lessons[m.lessonIndex] && completedLessons.has(lessons[m.lessonIndex].id));
          const firstModIdx = phaseMods.modules[0]?.lessonIndex ?? 0;
          const phaseUnlocked = isAdmin || isLessonAccessible(firstModIdx);
          if (!phaseUnlocked) return 'locked';
          if (anyDone) return 'in_progress';
          // Check if current lesson is in this phase
          if (phaseMods.modules.some(m => m.lessonIndex === currentLessonIndex)) return 'in_progress';
          return 'not_started';
        };

        const getModuleStatusForIndex = (mod: IndexModule): 'completed' | 'current' | 'available' | 'locked' => {
          const lessonId = lessons[mod.lessonIndex]?.id;
          if (!lessonId) return 'locked';
          if (completedLessons.has(lessonId)) return 'completed';
          if (currentLessonIndex === mod.lessonIndex) return 'current';
          if (!isLessonAccessible(mod.lessonIndex)) return 'locked';
          return 'available';
        };

        const isPhaseUnlockedFn = (phaseNum: number): boolean => {
          const phaseMods = indexPhases.find(p => p.number === phaseNum);
          if (!phaseMods) return false;
          const firstModIdx = phaseMods.modules[0]?.lessonIndex ?? 0;
          return isAdmin || isLessonAccessible(firstModIdx);
        };

        return (
          <CourseIndex
            courseId={courseId}
            userId={user?.id || ''}
            phases={indexPhases}
            getPhaseStatus={getPhaseStatusForIndex}
            getModuleStatus={getModuleStatusForIndex}
            isPhaseUnlocked={isPhaseUnlockedFn}
            isAdmin={!!isAdmin}
            onModuleClick={(lessonIdx) => setCurrentLessonIndex(lessonIdx)}
          />
        );
      })()}

      <div className="flex gap-6">
        {/* Curriculum Sidebar */}
        <div className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden flex-shrink-0`}>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin">
            <div className="p-4 border-b border-slate-100 sticky top-0 bg-white">
              <h3 className="font-semibold text-slate-800">Course Curriculum</h3>
              <p className="text-xs text-slate-500 mt-1">{lessons.length} lessons</p>
            </div>
            <div className="divide-y divide-slate-50">
              {(() => {
                // Group by section to add phase anchors
                const sectionGroups: { name: string; startIndex: number }[] = [];
                let lastSection: string | null = null;
                lessons.forEach((l, idx) => {
                  const sec = l.section || 'General';
                  if (sec !== lastSection) {
                    sectionGroups.push({ name: sec, startIndex: idx });
                    lastSection = sec;
                  }
                });
                return lessons.map((lesson, idx) => {
                  const status = getLessonStatus(idx, lesson);
                  const Icon = getLessonIcon(lesson.type);
                  const sectionIdx = sectionGroups.findIndex(g => g.startIndex === idx);
                  return (
                    <button
                      key={lesson.id}
                      id={sectionIdx >= 0 ? `phase-${sectionIdx + 1}` : undefined}
                      onClick={() => {
                        if (status !== 'locked') setCurrentLessonIndex(idx);
                      }}
                      className={`w-full flex items-start gap-3 p-4 text-left transition-colors scroll-mt-4 ${
                        status === 'current' ? 'bg-primary-50' : 'hover:bg-slate-50'
                      } ${status === 'locked' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                    <div className="mt-0.5">
                      {status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : status === 'current' || status === 'available' ? (
                        <Play className="w-5 h-5 text-primary-600" />
                      ) : (
                        <Lock className="w-5 h-5 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${status === 'current' ? 'text-primary-800' : 'text-slate-700'}`}>
                        {idx + 1}. {lesson.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Icon className={`w-3.5 h-3.5 ${status === 'current' ? 'text-primary-500' : 'text-slate-400'}`} />
                        <span className="text-xs text-slate-400">{lesson.duration || 'N/A'}</span>
                      </div>
                    </div>
                  </button>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mb-3 flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800 font-medium"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {sidebarOpen ? 'Hide Curriculum' : 'Show Curriculum'}
          </button>

          {currentLesson && (
            <LessonContent
              lesson={currentLesson}
              course={course}
              completedLessons={completedLessons}
              currentLessonIndex={currentLessonIndex}
              totalLessons={lessons.length}
              userId={user?.id || ''}
              onMarkComplete={markCompleteAndContinue}
            />
          )}
        </div>
      </div>
    </div>
  );
}
