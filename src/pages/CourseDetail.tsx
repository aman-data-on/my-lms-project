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
  ChevronLeft, ChevronRight, Play,
  CheckCircle2, Lock, Clock, Award, BookOpen, Check, X, AlignLeft,
} from 'lucide-react';
import { BlockRenderer } from '../components/BlockRenderer';
import { CourseIndex, type IndexPhase, type IndexModule } from '../components/CourseIndex';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { cn } from '../lib/cn';
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

// ─── Lesson content — blocks only, no TOC or action bar ──────────────────────
function LessonContent({
  lesson,
  course,
  userId,
}: {
  lesson: Lesson;
  course: Course;
  userId: string;
}) {
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

  const readTime = useMemo(() => {
    const allText = blocks.map(b => {
      if (b.type === 'text' && b.data.html) return b.data.html.replace(/<[^>]+>/g, ' ');
      return JSON.stringify(b.data).replace(/<[^>]+>/g, ' ');
    }).join(' ');
    const words = allText.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  }, [blocks]);

  return (
    <article>
      {/* Lesson meta */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
          <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
          {lesson.type === 'video' ? 'Video' : lesson.type === 'quiz' ? 'Quiz' : 'Reading'}
        </span>
        {lesson.duration && (
          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            {lesson.duration}
          </span>
        )}
        <span className="text-xs text-slate-400">~ {readTime} min read</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 leading-snug">
        {lesson.title}
      </h1>

      {blocks.length > 0 ? (
        <div className="space-y-1">
          {blocks.map((block) => {
            if (block.type === 'text' && block.data.html) {
              let idx = 0;
              const html = block.data.html.replace(/<h([1-4])/gi, (_m: string, level: string) => {
                return `<h${level} id="heading-${idx++}"`;
              });
              return (
                <BlockRenderer
                  key={block.id}
                  block={{ ...block, data: { ...block.data, html } }}
                  lessonId={lesson.id}
                  userId={userId}
                />
              );
            }
            return (
              <BlockRenderer key={block.id} block={block} lessonId={lesson.id} userId={userId} />
            );
          })}
        </div>
      ) : lesson.video_url ? (
        <div
          className="prose prose-slate max-w-none [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-slate-800 [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:text-slate-600 [&_p]:text-base [&_p]:leading-relaxed [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_ol]:mb-4 [&_li]:text-slate-600 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_table]:mb-4 [&_th]:bg-primary-800 [&_th]:text-white [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_td]:px-3 [&_td]:py-2 [&_td]:border-b [&_td]:border-slate-100 [&_tr:nth-child(even)]:bg-slate-50 [&_strong]:text-slate-800"
          dangerouslySetInnerHTML={{ __html: safeHtml(lesson.video_url) }}
        />
      ) : (
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-600 text-base leading-relaxed mb-4">{course.description}</p>
          <p className="text-slate-600 text-base leading-relaxed mb-4">
            This lesson covers the fundamental concepts and best practices related to{' '}
            {lesson.title.toLowerCase()}.
          </p>
        </div>
      )}
    </article>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CourseDetail({
  courseId,
  onNavigate,
}: {
  courseId: string;
  onNavigate: (page: string, data?: any) => void;
}) {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const [view, setView] = useState<'overview' | 'reader'>('overview');
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [curriculumOpen, setCurriculumOpen] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);

  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: ['course', courseId],
    queryFn: () => fetchCourse(courseId),
    enabled: !!user && !!courseId,
  });
  const { data: lessons = [], isLoading: lessonsLoading } = useQuery<Lesson[]>({
    queryKey: ['lessons', courseId],
    queryFn: () => fetchLessons(courseId),
    enabled: !!user && !!courseId,
  });
  const { data: progressData = [], isLoading: progressLoading } = useQuery<any[]>({
    queryKey: ['progress', user?.id],
    queryFn: () => fetchLessonProgress(user!.id),
    enabled: !!user,
  });

  const loading = courseLoading || lessonsLoading || progressLoading;
  const completedLessons = useMemo(
    () => new Set<string>((progressData || []).map((p: any) => p.lesson_id)),
    [progressData],
  );

  useEffect(() => {
    if (!user || !lessons.length) return;
    const completedSet = new Set<string>((progressData || []).map((p: any) => p.lesson_id));
    const firstIncomplete = lessons.findIndex(l => !completedSet.has(l.id));
    setCurrentLessonIndex(firstIncomplete >= 0 ? firstIncomplete : 0);
  }, [lessons, progressData, user]);

  const progressPercent =
    lessons.length > 0 ? Math.round((completedLessons.size / lessons.length) * 100) : 0;

  const isLessonAccessible = (index: number) => {
    if (isAdmin) return true;
    if (index === 0) return true;
    return completedLessons.has(lessons[index - 1].id);
  };

  const currentLesson = lessons[currentLessonIndex];
  const isCurrentCompleted = !!(currentLesson && completedLessons.has(currentLesson.id));
  const isLastLesson = currentLessonIndex === lessons.length - 1;
  const isCourseDone = completedLessons.size === lessons.length && lessons.length > 0;

  const actionLabel = isCurrentCompleted
    ? isLastLesson ? 'Course Complete' : 'Next Lesson'
    : isLastLesson ? 'Complete Course' : 'Mark Complete & Continue';

  const markCompleteAndContinue = async () => {
    if (!user || !currentLesson) return;
    try {
      if (!completedLessons.has(currentLesson.id)) {
        await upsertLessonProgress({
          user_id: user.id,
          lesson_id: currentLesson.id,
          completed: true,
          completed_at: new Date().toISOString(),
        });
        queryClient.invalidateQueries({ queryKey: ['progress', user.id] });
        pushLessonCompletion(user.id, currentLesson.id, courseId, currentLesson.duration || null);
        markLessonCompleteInProgress(user.id, courseId, currentLesson.id);
      }

      const newCompletedCount =
        completedLessons.size + (completedLessons.has(currentLesson.id) ? 0 : 1);
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

  const getLessonStatus = (index: number, lesson: Lesson) => {
    if (completedLessons.has(lesson.id)) return 'completed';
    if (index === currentLessonIndex) return 'current';
    if (isLessonAccessible(index)) return 'available';
    return 'locked';
  };

  // ─── CourseIndex data ─────────────────────────────────────────────────────
  const PHASE_COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444'];

  const { sectionMap, sectionOrder } = useMemo(() => {
    const map: Record<string, number[]> = {};
    const order: string[] = [];
    lessons.forEach((l, idx) => {
      const sec = l.section || 'General';
      if (!map[sec]) { map[sec] = []; order.push(sec); }
      map[sec].push(idx);
    });
    return { sectionMap: map, sectionOrder: order };
  }, [lessons]);

  const indexPhases: IndexPhase[] = useMemo(() =>
    sectionOrder.map((secName, pIdx) => ({
      number: pIdx + 1,
      name: secName,
      color: PHASE_COLORS[pIdx % PHASE_COLORS.length],
      bgColor: PHASE_COLORS[pIdx % PHASE_COLORS.length] + '10',
      borderColor: PHASE_COLORS[pIdx % PHASE_COLORS.length],
      description: '',
      modules: (sectionMap[secName] || []).map(lIdx => ({
        id: lessons[lIdx].id,
        title: lessons[lIdx].title,
        type: lessons[lIdx].type,
        duration: lessons[lIdx].duration,
        lessonIndex: lIdx,
      } as IndexModule)),
    })),
  [sectionOrder, sectionMap, lessons]);

  const getPhaseStatus = (phaseNum: number): 'completed' | 'in_progress' | 'locked' | 'not_started' => {
    const phase = indexPhases.find(p => p.number === phaseNum);
    if (!phase) return 'not_started';
    const allDone = phase.modules.every(
      m => lessons[m.lessonIndex] && completedLessons.has(lessons[m.lessonIndex].id),
    );
    if (allDone) return 'completed';
    const anyDone = phase.modules.some(
      m => lessons[m.lessonIndex] && completedLessons.has(lessons[m.lessonIndex].id),
    );
    const firstModIdx = phase.modules[0]?.lessonIndex ?? 0;
    if (!isAdmin && !isLessonAccessible(firstModIdx)) return 'locked';
    if (anyDone) return 'in_progress';
    if (phase.modules.some(m => m.lessonIndex === currentLessonIndex)) return 'in_progress';
    return 'not_started';
  };

  const getModuleStatus = (mod: IndexModule, _li: number): 'completed' | 'current' | 'available' | 'locked' => {
    const lessonId = lessons[mod.lessonIndex]?.id;
    if (!lessonId) return 'locked';
    if (completedLessons.has(lessonId)) return 'completed';
    if (currentLessonIndex === mod.lessonIndex) return 'current';
    if (!isLessonAccessible(mod.lessonIndex)) return 'locked';
    return 'available';
  };

  const isPhaseUnlocked = (phaseNum: number): boolean => {
    const phase = indexPhases.find(p => p.number === phaseNum);
    if (!phase) return false;
    const firstModIdx = phase.modules[0]?.lessonIndex ?? 0;
    return isAdmin || isLessonAccessible(firstModIdx);
  };

  const openLesson = (lessonIdx: number) => {
    setCurrentLessonIndex(lessonIdx);
    setView('reader');
    setCurriculumOpen(false);
  };

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) return null;

  // ─── Curriculum drawer content (shared between reader and standalone) ─────
  const SectionGroups: { name: string; startIndex: number }[] = [];
  let lastSection: string | null = null;
  lessons.forEach((l, idx) => {
    const sec = l.section || 'General';
    if (sec !== lastSection) {
      SectionGroups.push({ name: sec, startIndex: idx });
      lastSection = sec;
    }
  });

  return (
    <>
      {/* ── Overview ─────────────────────────────────────────────────────── */}
      {view === 'overview' && (
        <div className="space-y-6">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('my-courses')}
                  className="text-slate-500 hover:text-primary-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
                >
                  My Courses
                </button>
              </li>
              <li aria-hidden="true" className="text-slate-300">/</li>
              <li
                className="text-slate-800 font-medium truncate max-w-[60ch]"
                aria-current="page"
              >
                {course.title}
              </li>
            </ol>
          </nav>

          {/* Course header card */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full">
                {course.department}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                {course.duration}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3 leading-tight">
              {course.title}
            </h1>

            {course.description && (
              <p className="text-slate-600 text-base leading-relaxed mb-6 max-w-2xl">
                {course.description}
              </p>
            )}

            {/* Progress */}
            <div className="mb-6 max-w-md">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-600 font-medium">Your progress</span>
                <span className="text-slate-500">
                  {completedLessons.size} of {lessons.length} lessons
                </span>
              </div>
              <ProgressBar value={progressPercent} size="md" showValue />
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={() => setView('reader')} disabled={lessons.length === 0}>
                {isCourseDone ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                    Review Course
                  </>
                ) : completedLessons.size > 0 ? (
                  <>
                    <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                    Continue Learning
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                    Start Course
                  </>
                )}
              </Button>
              {isCourseDone && (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => onNavigate('assessments')}
                >
                  <Award className="w-4 h-4" aria-hidden="true" />
                  Take Assessment
                </Button>
              )}
            </div>
          </div>

          {/* Curriculum index */}
          <CourseIndex
            courseId={courseId}
            userId={user?.id || ''}
            phases={indexPhases}
            getPhaseStatus={getPhaseStatus}
            getModuleStatus={getModuleStatus}
            isPhaseUnlocked={isPhaseUnlocked}
            isAdmin={!!isAdmin}
            onModuleClick={openLesson}
          />
        </div>
      )}

      {/* ── Reader overlay ──────────────────────────────────────────────────── */}
      {view === 'reader' && (
        <div className="fixed inset-0 z-[60] bg-slate-50 flex flex-col">
          {/* Top bar */}
          <header className="flex-shrink-0 bg-white border-b border-slate-200 px-4 h-14 flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('overview')}
              className="gap-1.5 flex-shrink-0"
              aria-label="Back to course overview"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline text-sm">Overview</span>
            </Button>

            <p className="flex-1 min-w-0 text-sm font-medium text-slate-700 truncate text-center px-2">
              {currentLesson?.title}
            </p>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurriculumOpen(true)}
              aria-label="Open course curriculum"
              className="gap-1.5 flex-shrink-0"
            >
              <AlignLeft className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline text-sm">Contents</span>
            </Button>
          </header>

          {/* Scrollable reading area */}
          <main className="flex-1 overflow-y-auto" id="lesson-content">
            <div className="max-w-[820px] mx-auto px-4 md:px-8 py-8">
              {currentLesson && (
                <LessonContent
                  lesson={currentLesson}
                  course={course}
                  userId={user?.id || ''}
                />
              )}
            </div>
          </main>

          {/* Bottom action bar */}
          <div className="flex-shrink-0 bg-white border-t border-slate-200 px-4 py-3 flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentLessonIndex(prev => prev - 1)}
              disabled={currentLessonIndex === 0}
              aria-label="Previous lesson"
              className="flex-shrink-0"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <div className="flex-1 text-center">
              <p className="text-xs text-slate-500">
                {isCurrentCompleted
                  ? 'Completed'
                  : `Lesson ${currentLessonIndex + 1} of ${lessons.length}`}
              </p>
              <ProgressBar
                value={progressPercent}
                size="sm"
                className="mt-1 max-w-[180px] mx-auto"
              />
            </div>

            {isCurrentCompleted && !isLastLesson ? (
              <Button
                size="sm"
                onClick={() => setCurrentLessonIndex(prev => prev + 1)}
                className="flex-shrink-0 gap-1.5"
              >
                <span className="hidden sm:inline">Next Lesson</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            ) : isCourseDone && isCurrentCompleted ? (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onNavigate('assessments')}
                className="flex-shrink-0 gap-1.5"
              >
                <Award className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Assessment</span>
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={markCompleteAndContinue}
                className="flex-shrink-0 gap-1.5"
              >
                <Check className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">{actionLabel}</span>
                <span className="sm:hidden">{isLastLesson ? 'Finish' : 'Complete'}</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ── Curriculum drawer — sibling of reader, z-[80] ─────────────────── */}
      {curriculumOpen && view === 'reader' && (
        <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Course curriculum">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-black/40"
            onClick={() => setCurriculumOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[90vw] bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100 flex-shrink-0">
              <div>
                <h2 className="font-semibold text-slate-800 text-sm">Course Curriculum</h2>
                <p className="text-xs text-slate-400 mt-0.5">{lessons.length} lessons</p>
              </div>
              <Button
                variant="ghost"
                iconOnly
                onClick={() => setCurriculumOpen(false)}
                aria-label="Close curriculum"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {lessons.map((lesson, idx) => {
                const status = getLessonStatus(idx, lesson);
                const isCurrent = idx === currentLessonIndex;
                const sectionStart = SectionGroups.find(g => g.startIndex === idx);

                return (
                  <div key={lesson.id}>
                    {sectionStart && (
                      <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
                          {sectionStart.name}
                        </p>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        if (status !== 'locked' || isAdmin) openLesson(idx);
                      }}
                      disabled={status === 'locked' && !isAdmin}
                      aria-current={isCurrent ? 'true' : undefined}
                      className={cn(
                        'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors',
                        isCurrent ? 'bg-primary-50' : 'hover:bg-slate-50',
                        status === 'locked' && !isAdmin
                          ? 'opacity-50 cursor-not-allowed'
                          : 'cursor-pointer',
                      )}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" aria-hidden="true" />
                        ) : status === 'locked' ? (
                          <Lock className="w-4 h-4 text-slate-300" aria-hidden="true" />
                        ) : (
                          <span
                            className={cn(
                              'w-4 h-4 rounded-full border-2 block',
                              isCurrent ? 'border-primary-500 bg-primary-500' : 'border-slate-300',
                            )}
                            aria-hidden="true"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-sm font-medium truncate',
                            isCurrent ? 'text-primary-800' : 'text-slate-700',
                            status === 'locked' && 'text-slate-400',
                          )}
                        >
                          {idx + 1}. {lesson.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{lesson.duration || 'N/A'}</p>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Congrats overlay — z-[90] ───────────────────────────────────────── */}
      {showCongrats && (
        <div className="fixed inset-0 z-[90] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-2xl">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="w-10 h-10 text-green-600" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Congratulations!</h2>
            <p className="text-slate-600 mb-6">
              You have completed{' '}
              <span className="font-semibold">{course.title}</span>.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => onNavigate('assessments')}>Take Assessment</Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowCongrats(false);
                  setView('overview');
                }}
              >
                Back to Overview
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
