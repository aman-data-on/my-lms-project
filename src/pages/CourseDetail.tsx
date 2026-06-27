import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchCourse,
  fetchLessons,
  fetchLessonProgress,
  upsertLessonProgress,
  upsertEnrollment,
  insertActivity,
} from '../lib/api';
import { slugify } from '../lib/slugify';
import { pushLessonCompletion, markLessonCompleteInProgress } from '../lib/reportData';
import { Play, CheckCircle2, Clock, Award } from 'lucide-react';
import { LessonWorkspace } from '../components/LessonWorkspace';
import { Module1Reader, deriveTopics, type NavPhase } from '../components/Module1Reader';
import { ConfettiEffect } from '../components/ConfettiEffect';
import { CourseIndex, type IndexPhase, type IndexModule } from '../components/CourseIndex';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';

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

// ─── Main component ───────────────────────────────────────────────────────────
export default function CourseDetail({
  courseId,
  courseSlug,
  onNavigate,
}: {
  courseId: string;
  courseSlug: string;
  onNavigate: (page: string, data?: any) => void;
}) {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { lessonSlug } = useParams<{ courseSlug: string; lessonSlug?: string }>();

  const [showCongrats, setShowCongrats] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showHappyMsg, setShowHappyMsg] = useState(false);

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

  // Derive current lesson index from the URL slug
  const currentLessonIndex = useMemo(() => {
    if (!lessonSlug || !lessons.length) return -1;
    const idx = lessons.findIndex(l => slugify(l.title) === lessonSlug);
    return idx >= 0 ? idx : -1;
  }, [lessonSlug, lessons]);

  const isReaderView = !!lessonSlug && currentLessonIndex >= 0;

  const firstIncompleteIndex = useMemo(() => {
    if (!lessons.length) return 0;
    const idx = lessons.findIndex(l => !completedLessons.has(l.id));
    return idx >= 0 ? idx : 0;
  }, [lessons, completedLessons]);

  const goToLesson = (idx: number) => {
    const lesson = lessons[idx];
    if (lesson) navigate(`/course/${courseSlug}/lesson/${slugify(lesson.title)}`);
  };
  const goToOverview = () => navigate(`/course/${courseSlug}`);

  // If lessonSlug doesn't match any lesson, fall back to overview
  useEffect(() => {
    if (lessonSlug && lessons.length > 0 && currentLessonIndex < 0) {
      navigate(`/course/${courseSlug}`, { replace: true });
    }
  }, [lessonSlug, lessons.length, currentLessonIndex, courseSlug, navigate]);

  const progressPercent =
    lessons.length > 0 ? Math.round((completedLessons.size / lessons.length) * 100) : 0;

  const isLessonAccessible = (index: number) => {
    if (isAdmin) return true;
    if (index === 0) return true;
    return completedLessons.has(lessons[index - 1].id);
  };

  const currentLesson = isReaderView ? (lessons[currentLessonIndex] ?? null) : null;
  const isCurrentCompleted = !!(currentLesson && completedLessons.has(currentLesson.id));
  const isLastLesson = currentLessonIndex === lessons.length - 1;
  const isCourseDone = completedLessons.size === lessons.length && lessons.length > 0;

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
        setShowCelebration(true);
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
        setShowCelebration(true);
        goToLesson(currentLessonIndex + 1);
      }
    } catch (err) {
      console.error('Error marking lesson complete', err);
    }
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

  // Full Phase → Module → Topic tree for the Module 1 (Kinetic) reader's rail.
  const courseTree: NavPhase[] = useMemo(() =>
    sectionOrder.map((secName) => ({
      name: secName,
      modules: (sectionMap[secName] || []).map((lIdx) => ({
        lessonIndex: lIdx,
        id: lessons[lIdx].id,
        title: lessons[lIdx].title,
        completed: completedLessons.has(lessons[lIdx].id),
        accessible: isAdmin || lIdx === 0 || completedLessons.has(lessons[lIdx - 1]?.id),
        topics: deriveTopics(lessons[lIdx].video_url),
      })),
    })),
  [sectionOrder, sectionMap, lessons, completedLessons, isAdmin]);

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

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) return null;

  return (
    <>
      {showCelebration && (
        <ConfettiEffect onDone={() => setShowCelebration(false)} />
      )}

      {showHappyMsg && (
        <HappyLearningToast onDone={() => setShowHappyMsg(false)} />
      )}

      {/* ── Overview ─────────────────────────────────────────────────────── */}
      {!isReaderView && (
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
                className="text-slate-800 font-medium truncate max-w-[32ch] sm:max-w-[48ch]"
                aria-current="page"
                title={course.title}
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
              <p className="text-slate-600 text-base leading-relaxed mb-6">
                {course.description}
              </p>
            )}

            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-600 font-medium">Your progress</span>
                <span className="text-slate-500 tabular-nums">
                  {completedLessons.size} of {lessons.length} lessons
                </span>
              </div>
              <ProgressBar value={progressPercent} size="md" showValue />
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                onClick={() => goToLesson(isCourseDone ? 0 : firstIncompleteIndex)}
                disabled={lessons.length === 0}
              >
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
            onModuleClick={goToLesson}
          />
        </div>
      )}

      {/* ── Lesson workspace ─────────────────────────────────────────────────── */}
      {/* Module 1 (Company Overview) uses the Kinetic Enterprise reader; all other
          modules keep the standard LessonWorkspace. */}
      {isReaderView && currentLesson && /company overview/i.test(currentLesson.title) && currentLessonIndex === 0 ? (
        <Module1Reader
          lesson={currentLesson}
          course={course}
          courseProgressPercent={progressPercent}
          isCurrentCompleted={isCurrentCompleted}
          isCourseDone={isCourseDone}
          courseTree={courseTree}
          currentLessonIndex={currentLessonIndex}
          onSelectModule={goToLesson}
          onBack={goToOverview}
          onMarkComplete={markCompleteAndContinue}
          onNextLesson={() => {
            setShowCelebration(true);
            setShowHappyMsg(true);
            goToLesson(currentLessonIndex + 1);
          }}
          onAssessment={() => onNavigate('assessments')}
        />
      ) : isReaderView && currentLesson && (
        <LessonWorkspace
          lesson={currentLesson}
          course={course}
          userId={user?.id || ''}
          lessonIndex={currentLessonIndex}
          isCurrentCompleted={isCurrentCompleted}
          isLastLesson={isLastLesson}
          isCourseDone={isCourseDone}
          onBack={goToOverview}
          onMarkComplete={markCompleteAndContinue}
          onPrevLesson={() => { if (currentLessonIndex > 0) goToLesson(currentLessonIndex - 1); }}
          onNextLesson={() => {
            setShowCelebration(true);
            setShowHappyMsg(true);
            goToLesson(currentLessonIndex + 1);
          }}
          onAssessment={() => onNavigate('assessments')}
        />
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
                  goToOverview();
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

// ── Happy Learning toast ───────────────────────────────────────────────────────
function HappyLearningToast({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="fixed top-8 left-1/2 -translate-x-1/2 z-[95] pointer-events-none"
      style={{ animation: 'happyIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both, happyOut 0.4s ease-in 2.3s both' }}
    >
      <div className="flex items-center gap-3 bg-white border border-slate-100 shadow-2xl rounded-2xl px-6 py-4">
        <span className="text-3xl select-none" aria-hidden="true">🎉</span>
        <div>
          <p className="text-base font-bold text-slate-800 leading-tight">Happy Learning!</p>
          <p className="text-xs text-slate-500 mt-0.5">Keep up the great work</p>
        </div>
      </div>
      <style>{`
        @keyframes happyIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-16px) scale(0.9); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0)      scale(1);   }
        }
        @keyframes happyOut {
          from { opacity: 1; transform: translateX(-50%) translateY(0)     scale(1);   }
          to   { opacity: 0; transform: translateX(-50%) translateY(-10px) scale(0.95); }
        }
      `}</style>
    </div>
  );
}
