import { supabase } from './supabase';

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
