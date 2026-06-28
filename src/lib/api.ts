import { supabase } from './supabase';
import { slugify } from './slugify';

interface UpcomingItem {
  id: string;
  title: string;
  course_name: string | null;
  due_date: string;
  type: string;
}

export async function fetchCourse(courseId: string) {
  const { data, error } = await supabase.from('courses').select('*').eq('id', courseId).single();
  if (error) throw error;
  return data;
}

export async function fetchAllCourses(): Promise<{ id: string; title: string }[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('id, title')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as { id: string; title: string }[];
}

export async function fetchLessons(courseId: string) {
  const { data, error } = await supabase.from('lessons').select('*').eq('course_id', courseId).order('order_index');
  if (error) throw error;
  return data || [];
}

export async function fetchLessonProgress(userId: string) {
  const { data, error } = await supabase.from('lesson_progress').select('*').eq('user_id', userId).eq('completed', true);
  if (error) throw error;
  return data || [];
}

export async function upsertLessonProgress(payload: any) {
  // Keyed by the natural unique constraint so re-completing a lesson UPDATES the
  // existing row instead of 409-ing on a duplicate (user_id, lesson_id).
  const { data, error } = await supabase
    .from('lesson_progress')
    .upsert(payload, { onConflict: 'user_id,lesson_id' });
  if (error) throw error;
  return data;
}

// ─── Topic-level progress (granular layer; rolls up into lesson_progress) ──────
export async function fetchTopicProgress(userId: string, courseId?: string) {
  let q = supabase.from('topic_progress').select('*').eq('user_id', userId);
  if (courseId) q = q.eq('course_id', courseId);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

/** Idempotent upsert keyed by (user_id, lesson_id, topic_key). */
export async function upsertTopicProgress(payload: any) {
  const { data, error } = await supabase
    .from('topic_progress')
    .upsert(payload, { onConflict: 'user_id,lesson_id,topic_key' });
  if (error) throw error;
  return data;
}

/** Bulk upsert (used when finishing a lesson marks all its topics complete). */
export async function upsertTopicProgressMany(rows: any[]) {
  if (!rows.length) return null;
  const { data, error } = await supabase
    .from('topic_progress')
    .upsert(rows, { onConflict: 'user_id,lesson_id,topic_key' });
  if (error) throw error;
  return data;
}

export async function upsertEnrollment(payload: any) {
  // Keyed by the natural unique constraint so updating an existing enrollment
  // UPDATES it instead of 409-ing on a duplicate (user_id, course_id).
  const { data, error } = await supabase
    .from('enrollments')
    .upsert(payload, { onConflict: 'user_id,course_id' });
  if (error) throw error;
  return data;
}

export async function insertActivity(payload: any) {
  const { data, error } = await supabase.from('activities').insert(payload);
  if (error) throw error;
  return data;
}

export async function fetchMyCourses(userId: string) {
  const { data, error } = await supabase
    .from('enrollments')
    .select('progress_percent, status, enrolled_at, courses(id, title, description, department, thumbnail_url, duration)')
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row: any) => ({
    id: row.courses.id,
    title: row.courses.title,
    description: row.courses.description,
    department: row.courses.department,
    thumbnail_url: row.courses.thumbnail_url,
    duration: row.courses.duration,
    progress_percent: row.progress_percent,
    status: row.status,
    enrolled_at: row.enrolled_at,
  }));
}

export async function fetchCourseLibrary(userId: string) {
  const [{ data: courseData, error: courseError }, { data: enrollData, error: enrollError }] = await Promise.all([
    supabase.from('courses').select('*').eq('status', 'published').order('created_at', { ascending: false }),
    supabase.from('enrollments').select('course_id, status, progress_percent').eq('user_id', userId),
  ]);
  if (courseError) throw courseError;
  if (enrollError) throw enrollError;
  return { courses: courseData || [], enrollments: enrollData || [] };
}

export async function enrollInCourse(userId: string, courseId: string, courseTitle: string) {
  const { error: enrollError } = await supabase.from('enrollments').insert({ user_id: userId, course_id: courseId, status: 'in_progress', progress_percent: 0 });
  if (enrollError) throw enrollError;
  await supabase.from('activities').insert({ user_id: userId, type: 'course_enrolled', title: 'Enrolled in a new course', description: courseTitle });
}

export async function fetchCertificates(userId: string) {
  const { data, error } = await supabase.from('certificates').select('*').eq('user_id', userId).order('issued_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function updateProfile(userId: string, data: { full_name: string; employee_id: string; department: string; job_title: string }) {
  const { error } = await supabase.from('profiles').update({ ...data, updated_at: new Date().toISOString() }).eq('id', userId);
  if (error) throw error;
}

export const SALES_COURSE_ID = 'cdbf91e9-7a4a-430d-8def-7a119a90e4b4';

export const SALES_ASSESSMENT_ORDER = [
  'Phase 1 Assessment — Company & Products',
  'Phase 2 Assessment — Customers & Market',
  'Phase 3 Assessment — Competitive Positioning',
  'Phase 4 Assessment — Sales Skills',
  'Scenario-Based Final Assessment',
];

export async function fetchAssessmentsData(userId: string) {
  const [
    { data: aData, error: aError },
    { data: cData, error: cError },
    { data: atData, error: atError },
  ] = await Promise.all([
    supabase.from('assessments').select('*, courses(title, department, thumbnail_url)').order('created_at', { ascending: false }),
    supabase.from('courses').select('id, title'),
    supabase.from('assessment_attempts').select('*').eq('user_id', userId),
  ]);
  if (aError) throw aError;
  if (cError) throw cError;
  if (atError) throw atError;

  const assessmentsList = (aData || []).filter((a: any) => a.course_id);

  // Batch fetch all question counts in one query instead of N serial queries
  const questionCounts: Record<string, number> = {};
  if (assessmentsList.length > 0) {
    const ids = assessmentsList.map((a: any) => a.id);
    const { data: qData } = await supabase.from('questions').select('assessment_id').in('assessment_id', ids);
    for (const q of qData || []) {
      questionCounts[q.assessment_id] = (questionCounts[q.assessment_id] || 0) + 1;
    }
  }

  // Group assessments by course
  const groups: Record<string, any> = {};
  for (const a of assessmentsList) {
    const cid = a.course_id;
    if (!groups[cid]) {
      groups[cid] = {
        course_id: cid,
        course_title: a.courses?.title || 'Unknown Course',
        department: a.courses?.department || '',
        thumbnail_url: a.courses?.thumbnail_url || null,
        assessments: [],
      };
    }
    groups[cid].assessments.push(a);
  }

  // Sort assessments within Sales course by defined phase order
  if (groups[SALES_COURSE_ID]) {
    groups[SALES_COURSE_ID].assessments.sort((a: any, b: any) => {
      const idxA = SALES_ASSESSMENT_ORDER.indexOf(a.title);
      const idxB = SALES_ASSESSMENT_ORDER.indexOf(b.title);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
  }

  const courseGroups = Object.values(groups).sort((a: any, b: any) => {
    if (a.course_id === SALES_COURSE_ID) return -1;
    if (b.course_id === SALES_COURSE_ID) return 1;
    return a.course_title.localeCompare(b.course_title);
  });

  return { courseGroups, allCourses: cData || [], attempts: atData || [], questionCounts };
}

export async function fetchAssessmentQuestions(assessmentId: string) {
  const { data, error } = await supabase.from('questions').select('*').eq('assessment_id', assessmentId).order('order_index');
  if (error) throw error;
  return data || [];
}

export async function startAssessmentAttempt(userId: string, assessmentId: string, assessmentTitle: string) {
  await supabase.from('assessment_attempts').insert({ user_id: userId, assessment_id: assessmentId, status: 'in_progress' });
  await supabase.from('activities').insert({ user_id: userId, type: 'assessment_started', title: 'Started an assessment', description: assessmentTitle });
}

export async function submitAssessment(params: {
  userId: string;
  assessmentId: string;
  assessmentTitle: string;
  courseId: string | null;
  courseName: string;
  score: number;
  passed: boolean;
  answers: Record<string, any>;
  salesPhaseIndex?: number;
}) {
  const { userId, assessmentId, assessmentTitle, courseId, courseName, score, passed, answers, salesPhaseIndex } = params;

  await supabase.from('assessment_attempts').update({
    score,
    status: passed ? 'passed' : 'failed',
    answers,
    submitted_at: new Date().toISOString(),
  }).eq('user_id', userId).eq('assessment_id', assessmentId).eq('status', 'in_progress');

  await supabase.from('activities').insert({
    user_id: userId,
    type: 'assessment_completed',
    title: passed ? 'Passed an assessment' : 'Completed an assessment',
    description: `${assessmentTitle} - Score: ${score}%`,
  });

  if (passed) {
    await supabase.from('certificates').insert({
      user_id: userId,
      course_id: courseId,
      course_name: courseName,
      score,
      certificate_id: `LMS-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    });

    if (courseId === SALES_COURSE_ID && salesPhaseIndex !== undefined && salesPhaseIndex !== -1) {
      const phaseNum = salesPhaseIndex + 1;
      await supabase.from('phase_progress').update({
        assessment_passed: true,
        assessment_score: score,
        status: 'completed',
      }).eq('user_id', userId).eq('course_id', SALES_COURSE_ID).eq('phase_number', phaseNum);

      if (phaseNum < 5) {
        await supabase.from('phase_progress').update({ status: 'in_progress' })
          .eq('user_id', userId).eq('course_id', SALES_COURSE_ID).eq('phase_number', phaseNum + 1);
      }
    }
  }
}

export async function createAssessment(
  data: { title: string; course_id: string | null; time_limit: number; passing_score: number },
  questions: any[]
) {
  const { data: assessment, error } = await supabase.from('assessments').insert(data).select().single();
  if (error) throw error;
  for (const q of questions) {
    await supabase.from('questions').insert({
      assessment_id: assessment.id,
      type: q.type,
      question_text: q.question_text,
      options: q.options || null,
      correct_answer: q.correct_answer || null,
      matching_pairs: q.matching_pairs || null,
      manual_grading: q.manual_grading || false,
      order_index: q.order_index,
    });
  }
}

export async function fetchDashboardData(userId: string) {
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from('enrollments')
    .select('status, course_id, progress_percent, status, courses(id, title, description, department, thumbnail_url, duration)')
    .eq('user_id', userId);
  if (enrollmentsError) throw enrollmentsError;

  const enrolled = enrollments?.length || 0;
  const completed = (enrollments || []).filter((e: any) => e.status === 'completed').length;
  const stats = {
    coursesEnrolled: enrolled,
    coursesCompleted: completed,
    certificatesEarned: 0,
    pendingAssessments: 0,
  };

  const continueCourseRecord = (enrollments || []).find((e: any) => e.status === 'in_progress');
  // Supabase returns a to-one embed (`courses(...)`) as an OBJECT. Normalize
  // defensively so an array shape (future relationship change) also works —
  // reading `courses[0]` against an object was leaving every field undefined,
  // which silently broke the dashboard's Continue button (empty slug → no nav).
  const cc = continueCourseRecord
    ? (Array.isArray(continueCourseRecord.courses) ? continueCourseRecord.courses[0] : continueCourseRecord.courses)
    : null;
  const continueCourse = cc ? {
    id: cc.id,
    title: cc.title,
    description: cc.description,
    department: cc.department,
    thumbnail_url: cc.thumbnail_url,
    duration: cc.duration,
    progress_percent: continueCourseRecord?.progress_percent ?? 0,
    status: continueCourseRecord?.status,
    resumeLessonSlug: null as string | null,
  } : null;

  // Compute the continue-course progress from ACTUAL lesson completion so the
  // dashboard matches the course page (the stored enrollments.progress_percent
  // can be stale / 0), and resolve the resume target = the first incomplete
  // lesson (a new user with no completions resolves to the first lesson /
  // Module 1). The reader then resumes the last incomplete topic within it.
  if (continueCourse?.id) {
    const { data: courseLessons } = await supabase
      .from('lessons')
      .select('id, title, order_index')
      .eq('course_id', continueCourse.id)
      .order('order_index');
    const courseLessonsArr = (courseLessons || []) as { id: string; title: string }[];
    const lessonIds = courseLessonsArr.map((l) => l.id);
    if (lessonIds.length > 0) {
      const { data: doneRows } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', userId)
        .eq('completed', true)
        .in('lesson_id', lessonIds);
      const doneSet = new Set((doneRows || []).map((r: any) => r.lesson_id));
      continueCourse.progress_percent = Math.round((doneSet.size / lessonIds.length) * 100);
      const resume = courseLessonsArr.find((l) => !doneSet.has(l.id)) || courseLessonsArr[0];
      continueCourse.resumeLessonSlug = resume ? slugify(resume.title) : null;
    }
  }

  const { data: certs, error: certsError } = await supabase
    .from('certificates')
    .select('id')
    .eq('user_id', userId);
  if (certsError) throw certsError;
  stats.certificatesEarned = certs?.length || 0;

  const { data: attempts, error: attemptsError } = await supabase
    .from('assessment_attempts')
    .select('status')
    .eq('user_id', userId)
    .in('status', ['in_progress', 'started']);
  if (attemptsError) throw attemptsError;
  stats.pendingAssessments = (attempts?.length || 0);

  const { data: activities, error: activitiesError } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(6);
  if (activitiesError) throw activitiesError;

  let upcoming: UpcomingItem[] = [];
  if (enrolled > 0) {
    const { data: assessments, error: assessmentsError } = await supabase
      .from('assessments')
      .select('id, title, course_id, courses(title)')
      .limit(3);
    if (assessmentsError) throw assessmentsError;

    const dueDate = new Date(Date.now() + 7 * 86400000);
    upcoming = (assessments || []).map((a: any) => ({
      id: a.id,
      title: a.title,
      course_name: a.courses?.title || null,
      due_date: dueDate.toISOString(),
      type: 'assessment',
    }));
  }

  return {
    stats,
    continueCourse,
    activities: activities || [],
    upcoming,
  };
}
