// ─── localStorage data helpers for Reports ──────────────────────────

export interface LoginEntry {
  userId: string;
  date: string; // ISO
}

export interface LessonCompletionEntry {
  userId: string;
  lessonId: string;
  courseId: string;
  completedAt: string; // ISO
  duration: string | null;
}

export interface AssessmentScoreEntry {
  score: number;
  passed: boolean;
  attemptedAt: string;
}

export interface CourseProgressEntry {
  completedLessons: string[];
  completedAt: string | null;
  assessmentScores: Record<string, AssessmentScoreEntry>;
}

export interface CourseProgressMap {
  [userId: string]: {
    [courseId: string]: CourseProgressEntry;
  };
}

function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

// ─── loginHistory ────────────────────────────────────────────────────
export function getLoginHistory(): LoginEntry[] {
  return getItem<LoginEntry[]>('loginHistory', []);
}

export function pushLoginHistory(userId: string) {
  const entries = getLoginHistory();
  entries.push({ userId, date: new Date().toISOString() });
  setItem('loginHistory', entries);
}

// ─── lessonCompletions ───────────────────────────────────────────────
export function getLessonCompletions(): LessonCompletionEntry[] {
  return getItem<LessonCompletionEntry[]>('lessonCompletions', []);
}

export function pushLessonCompletion(
  userId: string,
  lessonId: string,
  courseId: string,
  duration: string | null
) {
  const entries = getLessonCompletions();
  entries.push({
    userId,
    lessonId,
    courseId,
    completedAt: new Date().toISOString(),
    duration,
  });
  setItem('lessonCompletions', entries);
}

// ─── courseProgress ──────────────────────────────────────────────────
export function getCourseProgress(): CourseProgressMap {
  return getItem<CourseProgressMap>('courseProgress', {});
}

export function setCourseProgress(map: CourseProgressMap) {
  setItem('courseProgress', map);
}

export function markLessonCompleteInProgress(
  userId: string,
  courseId: string,
  lessonId: string
) {
  const map = getCourseProgress();
  if (!map[userId]) map[userId] = {};
  if (!map[userId][courseId]) {
    map[userId][courseId] = { completedLessons: [], completedAt: null, assessmentScores: {} };
  }
  if (!map[userId][courseId].completedLessons.includes(lessonId)) {
    map[userId][courseId].completedLessons.push(lessonId);
  }
  setCourseProgress(map);
}

export function markAssessmentInProgress(
  userId: string,
  courseId: string,
  assessmentId: string,
  score: number,
  passed: boolean
) {
  const map = getCourseProgress();
  if (!map[userId]) map[userId] = {};
  if (!map[userId][courseId]) {
    map[userId][courseId] = { completedLessons: [], completedAt: null, assessmentScores: {} };
  }
  map[userId][courseId].assessmentScores[assessmentId] = {
    score,
    passed,
    attemptedAt: new Date().toISOString(),
  };
  setCourseProgress(map);
}

// ─── users ───────────────────────────────────────────────────────────
export interface ReportUser {
  id: string;
  email: string;
  full_name: string;
  employee_id: string;
  department: string;
  job_title: string;
  role: string;
}

export function getUsers(): ReportUser[] {
  return getItem<ReportUser[]>('users', []);
}

export function setUsers(users: ReportUser[]) {
  setItem('users', users);
}

export function getCurrentUser(): ReportUser | null {
  return getItem<ReportUser | null>('currentUser', null);
}

// ─── courses ─────────────────────────────────────────────────────────
export interface ReportCourse {
  id: string;
  title: string;
  department: string;
  status: string;
  duration: string;
}

export function getCourses(): ReportCourse[] {
  return getItem<ReportCourse[]>('courses', []);
}

export function setCourses(courses: ReportCourse[]) {
  setItem('courses', courses);
}

// ─── Time helpers ────────────────────────────────────────────────────
export function parseDurationToMinutes(dur: string | null): number {
  if (!dur) return 0;
  const hMatch = dur.match(/(\d+)\s*h/i);
  const mMatch = dur.match(/(\d+)\s*m/i);
  let mins = 0;
  if (hMatch) mins += parseInt(hMatch[1]) * 60;
  if (mMatch) mins += parseInt(mMatch[1]);
  return mins;
}

export function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function isThisWeek(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return d >= monday && d <= sunday;
}

export function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return d.toLocaleDateString();
}

export function getWeekDays(): string[] {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
}

export function getDayName(dateStr: string): string {
  const d = new Date(dateStr);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[d.getDay()];
}

// ─── Streak calculation ──────────────────────────────────────────────
export function computeStreak(userId: string): { current: number; best: number } {
  const logins = getLoginHistory().filter(e => e.userId === userId).map(e => e.date.slice(0, 10));
  const completions = getLessonCompletions().filter(e => e.userId === userId).map(e => e.completedAt.slice(0, 10));
  const allDates = Array.from(new Set([...logins, ...completions])).sort();
  if (allDates.length === 0) return { current: 0, best: 0 };

  let current = 0;
  let best = 0;
  let streak = 0;
  const today = new Date().toISOString().slice(0, 10);

  for (let i = 0; i < allDates.length; i++) {
    if (i === 0) {
      streak = 1;
    } else {
      const prev = new Date(allDates[i - 1]);
      const curr = new Date(allDates[i]);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        streak++;
      } else {
        streak = 1;
      }
    }
    best = Math.max(best, streak);
    if (allDates[i] === today) current = streak;
  }

  // If today has no activity, check if yesterday ended a streak
  if (current === 0) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.toISOString().slice(0, 10);
    let tempStreak = 0;
    for (let i = allDates.length - 1; i >= 0; i--) {
      const expected = new Date(yesterday);
      expected.setDate(expected.getDate() - tempStreak);
      if (allDates[i] === expected.toISOString().slice(0, 10)) {
        tempStreak++;
      } else {
        break;
      }
    }
    current = tempStreak;
  }

  return { current, best };
}
