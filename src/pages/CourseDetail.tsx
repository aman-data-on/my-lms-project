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
  fetchTopicProgress,
  upsertTopicProgress,
  upsertTopicProgressMany,
} from '../lib/api';
import { slugify } from '../lib/slugify';
import { pushLessonCompletion, markLessonCompleteInProgress } from '../lib/reportData';
import {
  toTopicConfigs,
  indexRowsByKey,
  computeModuleCompletion,
  computeResumeTopic,
  type TopicProgressRow,
} from '../lib/completion';
import { Play, CheckCircle2, Clock, Award, PartyPopper } from 'lucide-react';
import { LessonWorkspace } from '../components/LessonWorkspace';
import { Module1Reader, deriveTopics, lessonObjective, stripModulePrefix, type NavPhase } from '../components/Module1Reader';
import { ModuleCompleteModal } from '../components/ModuleCompleteModal';
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
  // Per-module completion celebration (snapshot taken when a module is marked
  // complete; the modal stays until the learner chooses Continue or Back).
  const [completion, setCompletion] = useState<{
    moduleName: string;
    objective: string | null;
    completedCount: number;
    totalModules: number;
    nextModuleNumber: number | null;
    nextModuleName: string | null;
    nextIndex: number;
  } | null>(null);

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
  // Granular topic-level progress (rolls up into lesson_progress above).
  const { data: topicProgressData = [] } = useQuery<any[]>({
    queryKey: ['topicProgress', user?.id, courseId],
    queryFn: () => fetchTopicProgress(user!.id, courseId),
    enabled: !!user && !!courseId,
  });

  const loading = courseLoading || lessonsLoading || progressLoading;
  const completedLessons = useMemo(
    () => new Set<string>((progressData || []).map((p: any) => p.lesson_id)),
    [progressData],
  );

  // Topic rows grouped by lesson — used for rollup, resume and analytics.
  const topicRowsByLesson = useMemo(() => {
    const m = new Map<string, TopicProgressRow[]>();
    for (const r of topicProgressData || []) {
      const arr = m.get(r.lesson_id) || [];
      arr.push(r);
      m.set(r.lesson_id, arr);
    }
    return m;
  }, [topicProgressData]);

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

  // Guard the reader: an invalid slug OR a locked lesson both fall back to the
  // overview. This is what stops a learner bypassing progression by typing a URL
  // (data integrity — unlocking is driven by persisted progress, not the UI).
  useEffect(() => {
    if (!lessonSlug || lessons.length === 0 || progressLoading) return;
    const locked = currentLessonIndex > 0 && !completedLessons.has(lessons[currentLessonIndex - 1]?.id);
    if (currentLessonIndex < 0 || (!isAdmin && locked)) {
      navigate(`/course/${courseSlug}`, { replace: true });
    }
  }, [lessonSlug, lessons, currentLessonIndex, completedLessons, isAdmin, progressLoading, courseSlug, navigate]);

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

  // ─── Topic-level progress: granular tracking + rollup ─────────────────────
  // Optimistically patch the topic_progress cache so rollup/resume see writes
  // immediately (before the refetch lands).
  const patchTopicCache = (lessonId: string, topicKey: string, patch: Record<string, any>) => {
    if (!user) return;
    queryClient.setQueryData<any[]>(['topicProgress', user.id, courseId], (old = []) => {
      const idx = old.findIndex((r) => r.lesson_id === lessonId && r.topic_key === topicKey);
      if (idx >= 0) {
        const copy = [...old];
        copy[idx] = { ...copy[idx], ...patch };
        return copy;
      }
      return [...old, {
        user_id: user.id, course_id: courseId, lesson_id: lessonId, topic_key: topicKey, ...patch,
      }];
    });
  };

  // Write lesson_progress (the unlock authority) + enrollment. Returns whether
  // this completion finished the whole course. Identical effect to the old
  // module-completion path — existing consumers are untouched.
  const persistLessonComplete = async (lesson: Lesson): Promise<boolean> => {
    if (!user) return false;
    if (completedLessons.has(lesson.id)) return false;
    const now = new Date().toISOString();
    await upsertLessonProgress({
      user_id: user.id, lesson_id: lesson.id, completed: true, completed_at: now,
    });
    queryClient.setQueryData<any[]>(['progress', user.id], (old = []) =>
      old.some((p) => p.lesson_id === lesson.id)
        ? old
        : [...old, { lesson_id: lesson.id, completed: true }]);
    queryClient.invalidateQueries({ queryKey: ['progress', user.id] });
    pushLessonCompletion(user.id, lesson.id, courseId, lesson.duration || null);
    markLessonCompleteInProgress(user.id, courseId, lesson.id);

    const newCount = completedLessons.size + 1;
    const pct = Math.round((newCount / lessons.length) * 100);
    const status = pct === 100 ? 'completed' : 'in_progress';
    await upsertEnrollment({
      user_id: user.id, course_id: courseId, progress_percent: pct, status,
      completed_at: status === 'completed' ? now : null,
    });
    queryClient.invalidateQueries({ queryKey: ['enrollments', user.id] });
    return newCount === lessons.length;
  };

  // If every required topic of a lesson is complete, roll up to lesson_progress
  // (this is what unlocks the next module — driven by topic completion).
  const maybeRollupLesson = async (lesson: Lesson) => {
    if (!user || completedLessons.has(lesson.id)) return;
    const all = (queryClient.getQueryData<any[]>(['topicProgress', user.id, courseId]) || [])
      .filter((r) => r.lesson_id === lesson.id);
    const configs = toTopicConfigs(deriveTopics(lesson.video_url));
    if (computeModuleCompletion(configs, indexRowsByKey(all)).isComplete) {
      await persistLessonComplete(lesson);
    }
  };

  // Reader callback: a topic came into view → record visit (never downgrades a
  // completed topic; bumps visited_at for resume + analytics).
  const handleTopicView = (topicKey: string) => {
    if (!user || !currentLesson) return;
    const now = new Date().toISOString();
    // A view records the visit ONLY — it never sends `status`, so on first visit
    // the DB defaults it to 'in_progress' and on any later visit the existing
    // status is left intact (a completed topic can never be downgraded by a
    // stray re-view, even if a refetch races the optimistic cache).
    const existing = (queryClient.getQueryData<any[]>(['topicProgress', user.id, courseId]) || [])
      .find((r) => r.lesson_id === currentLesson.id && r.topic_key === topicKey);
    patchTopicCache(currentLesson.id, topicKey, {
      status: existing?.status ?? 'in_progress', topic_type: 'reading', visited_at: now,
    });
    void upsertTopicProgress({
      user_id: user.id, course_id: courseId, lesson_id: currentLesson.id,
      topic_key: topicKey, topic_type: 'reading', visited_at: now,
    });
  };

  // Reader callback: a topic was completed (e.g. scrolled past) → mark complete
  // then attempt the module rollup.
  const handleTopicComplete = async (topicKey: string) => {
    if (!user || !currentLesson) return;
    const now = new Date().toISOString();
    patchTopicCache(currentLesson.id, topicKey, {
      status: 'completed', topic_type: 'reading', progress_ratio: 1, visited_at: now, completed_at: now,
    });
    await upsertTopicProgress({
      user_id: user.id, course_id: courseId, lesson_id: currentLesson.id,
      topic_key: topicKey, topic_type: 'reading', status: 'completed',
      progress_ratio: 1, visited_at: now, completed_at: now,
    });
    await maybeRollupLesson(currentLesson);
  };

  // Finishing a lesson marks ALL its canonical topics complete (covers the
  // paginated reader + acts as the safety net), then rolls up. Returns course-done.
  const handleLessonFinish = async (lesson: Lesson): Promise<boolean> => {
    if (!user) return false;
    const now = new Date().toISOString();
    const configs = toTopicConfigs(deriveTopics(lesson.video_url));
    configs.forEach((c) =>
      patchTopicCache(lesson.id, c.key, {
        status: 'completed', topic_type: c.type, progress_ratio: 1, visited_at: now, completed_at: now,
      }));
    await upsertTopicProgressMany(configs.map((c) => ({
      user_id: user.id, course_id: courseId, lesson_id: lesson.id,
      topic_key: c.key, topic_type: c.type, status: 'completed',
      progress_ratio: 1, visited_at: now, completed_at: now,
    })));
    return persistLessonComplete(lesson);
  };

  // Exact resume target within the current lesson (first-incomplete-required →
  // last-visited → first-topic).
  const resumeTopicKey = useMemo(() => {
    if (!currentLesson) return null;
    const rowsArr = (topicRowsByLesson.get(currentLesson.id) || []) as TopicProgressRow[];
    if (rowsArr.length === 0) return null; // fresh lesson → reader uses its default landing
    const configs = toTopicConfigs(deriveTopics(currentLesson.video_url));
    return computeResumeTopic(configs, indexRowsByKey(rowsArr));
  }, [currentLesson, topicRowsByLesson]);

  const markCompleteAndContinue = async () => {
    if (!user || !currentLesson) return;
    try {
      const wasCompleted = isCurrentCompleted;
      // Marks the module complete in the DB, persists progress and rolls up so
      // the next module is unlocked. Returns whether this finished the course.
      const courseDone = await handleLessonFinish(currentLesson);
      if (courseDone) {
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
        // Celebrate the module in a modal — the next module is now unlocked, but
        // we do NOT navigate; the learner advances deliberately. Counts are
        // snapshotted here (the just-completed module included).
        const nextIndex = currentLessonIndex + 1;
        const nextLesson = lessons[nextIndex] ?? null;
        setCompletion({
          moduleName: stripModulePrefix(currentLesson.title),
          objective: lessonObjective(currentLesson.video_url),
          completedCount: completedLessons.size + (wasCompleted ? 0 : 1),
          totalModules: lessons.length,
          nextModuleNumber: nextLesson ? nextIndex + 1 : null,
          nextModuleName: nextLesson ? stripModulePrefix(nextLesson.title) : null,
          nextIndex,
        });
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
      {/* All Phase-1 modules (the first section) use the unified premium reader
          (single-scroll, scroll-spy, Kinetic theme); later phases keep the
          standard LessonWorkspace until they are migrated. */}
      {isReaderView && currentLesson && sectionOrder.length > 0 && (currentLesson.section || 'General') === sectionOrder[0] ? (
        <Module1Reader
          lesson={currentLesson}
          course={course}
          courseProgressPercent={progressPercent}
          isCurrentCompleted={isCurrentCompleted}
          isCourseDone={isCourseDone}
          courseTree={courseTree}
          currentLessonIndex={currentLessonIndex}
          onSelectModule={goToLesson}
          resumeTopicKey={resumeTopicKey}
          onTopicView={handleTopicView}
          onTopicComplete={handleTopicComplete}
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
          resumeTopicKey={resumeTopicKey}
          onTopicView={handleTopicView}
          onTopicComplete={handleTopicComplete}
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

      {/* ── Module-complete celebration (per module, not course end) ─────────── */}
      <ModuleCompleteModal
        open={!!completion}
        moduleName={completion?.moduleName ?? ''}
        objective={completion?.objective ?? null}
        completedCount={completion?.completedCount ?? 0}
        totalModules={completion?.totalModules ?? 0}
        nextModuleNumber={completion?.nextModuleNumber ?? null}
        nextModuleName={completion?.nextModuleName ?? null}
        onContinue={() => {
          const idx = completion?.nextIndex;
          setCompletion(null);
          if (idx != null) goToLesson(idx);
        }}
        onDismiss={() => {
          setCompletion(null);
          goToOverview();
        }}
      />
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
        <span className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-50 text-primary-600" aria-hidden="true">
          <PartyPopper className="w-5 h-5" />
        </span>
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
