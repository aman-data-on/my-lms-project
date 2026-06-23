import { supabase } from './supabase';

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
  const { data, error } = await supabase.from('lesson_progress').upsert(payload);
  if (error) throw error;
  return data;
}

export async function upsertEnrollment(payload: any) {
  const { data, error } = await supabase.from('enrollments').upsert(payload);
  if (error) throw error;
  return data;
}

export async function insertActivity(payload: any) {
  const { data, error } = await supabase.from('activities').insert(payload);
  if (error) throw error;
  return data;
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
  const continueCourse = continueCourseRecord?.courses ? {
    id: continueCourseRecord.courses[0]?.id,
    title: continueCourseRecord.courses[0]?.title,
    description: continueCourseRecord.courses[0]?.description,
    department: continueCourseRecord.courses[0]?.department,
    thumbnail_url: continueCourseRecord.courses[0]?.thumbnail_url,
    duration: continueCourseRecord.courses[0]?.duration,
    progress_percent: continueCourseRecord.progress_percent,
    status: continueCourseRecord.status,
  } : null;

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
