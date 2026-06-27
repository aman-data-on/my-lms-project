import { useState, useMemo } from 'react';
import {
  Clock, TrendingUp, BookOpen, Award, BarChart3, Calendar, ChevronDown, ChevronUp,
  CheckCircle2, Search, Download, User, Users, ClipboardList,
  ArrowUpRight, AlertTriangle, BookOpen as LessonIcon,
  PlayCircle, Circle
} from 'lucide-react';
import {
  getLoginHistory, getLessonCompletions, getCourseProgress, getUsers, getCurrentUser, getCourses,
  parseDurationToMinutes, formatMinutes, isThisWeek, timeAgo, getWeekDays, getDayName, computeStreak,
} from '../lib/reportData';

export default function Reports() {
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';
  const [view, setView] = useState<'employee' | 'admin'>(isAdmin ? 'admin' : 'employee');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Reports</h2>
          <p className="text-sm text-slate-500 mt-1">
            {view === 'employee' ? 'Track your learning analytics and progress' : 'Company-wide learning analytics'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
              <button
                onClick={() => setView('employee')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${view === 'employee' ? 'bg-primary-700 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                My Report
              </button>
              <button
                onClick={() => setView('admin')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${view === 'admin' ? 'bg-primary-700 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Admin
              </button>
            </div>
          )}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4" /> Download Report
          </button>
          <span className="text-xs text-slate-400 hidden sm:inline">Last updated: just now</span>
        </div>
      </div>

      {view === 'employee' ? <EmployeeReport userId={currentUser?.id || ''} /> : <AdminReport />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// EMPLOYEE REPORT
// ═══════════════════════════════════════════════════════════════════════

function EmployeeReport({ userId }: { userId: string }) {
  const completions = useMemo(() => getLessonCompletions().filter(e => e.userId === userId), [userId]);
  const progressMap = useMemo(() => getCourseProgress()[userId] || {}, [userId]);
  const courses = useMemo(() => getCourses(), []);
  const streak = useMemo(() => computeStreak(userId), [userId]);

  // ── Stat Cards ─────────────────────────────────────────────────────
  const totalMinutes = completions.reduce((sum, e) => sum + parseDurationToMinutes(e.duration), 0);
  const thisWeekMinutes = completions
    .filter(e => isThisWeek(e.completedAt))
    .reduce((sum, e) => sum + parseDurationToMinutes(e.duration), 0);

  const allScores: { score: number; courseId: string }[] = [];
  Object.entries(progressMap).forEach(([courseId, entry]) => {
    Object.values(entry.assessmentScores).forEach(a => {
      allScores.push({ score: a.score, courseId });
    });
  });
  const avgScore = allScores.length > 0 ? Math.round(allScores.reduce((s, a) => s + a.score, 0) / allScores.length) : null;
  const bestScore = allScores.length > 0 ? allScores.reduce((b, a) => a.score > b.score ? a : b, allScores[0]) : null;

  const enrolledCourseIds = Object.keys(progressMap);
  const completedCourses = enrolledCourseIds.filter(cid => {
    const course = courses.find(c => c.id === cid);
    if (!course) return false;
    const entry = progressMap[cid];
    // A course is "completed" if it has at least one lesson and all are done
    // We approximate by checking if completedLessons count > 0 (since we don't know total from localStorage alone)
    // Use courseProgress completedAt as the signal
    return entry.completedAt && entry.completedLessons.length > 0;
  });
  const inProgressCourses = enrolledCourseIds.filter(cid => !completedCourses.includes(cid));

  // ── Weekly Activity ────────────────────────────────────────────────
  const weekDays = getWeekDays();
  const weeklyData = useMemo(() => {
    const counts: Record<string, number> = {};
    weekDays.forEach(d => counts[d] = 0);
    completions.filter(e => isThisWeek(e.completedAt)).forEach(e => {
      const day = getDayName(e.completedAt);
      counts[day] = (counts[day] || 0) + 1;
    });
    const maxCount = Math.max(...Object.values(counts), 1);
    return weekDays.map(day => ({ day, count: counts[day] || 0, pct: ((counts[day] || 0) / maxCount) * 100 }));
  }, [completions]);
  const weeklyTotal = weeklyData.reduce((s, d) => s + d.count, 0);

  // ── Department Progress ────────────────────────────────────────────
  const departments = ['Sales', 'HR', 'IT', 'Finance', 'Operations', 'Management'];
  const deptProgress = useMemo(() => {
    return departments.map(dept => {
      const deptCourses = courses.filter(c => c.department === dept && c.status === 'published');
      if (deptCourses.length === 0) return null;
      const enrolled = deptCourses.filter(c => enrolledCourseIds.includes(c.id));
      if (enrolled.length === 0) return null;
      let completed = 0;
      let total = 0;
      enrolled.forEach(c => {
        const entry = progressMap[c.id];
        if (entry) {
          completed += entry.completedLessons.length;
          total += entry.completedLessons.length + 5; // approximate total
        }
      });
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { dept, pct, enrolled: enrolled.length };
    }).filter(Boolean) as { dept: string; pct: number; enrolled: number }[];
  }, [courses, enrolledCourseIds, progressMap]);

  // ── Course Progress Table ──────────────────────────────────────────
  const courseRows = useMemo(() => {
    return enrolledCourseIds.map(cid => {
      const course = courses.find(c => c.id === cid);
      if (!course) return null;
      const entry = progressMap[cid];
      const completedCount = entry?.completedLessons.length || 0;
      const courseCompletions = completions.filter(c => c.courseId === cid);
      const lastAccessed = courseCompletions.length > 0
        ? courseCompletions.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0].completedAt
        : null;
      const scores = Object.values(entry?.assessmentScores || {});
      const avg = scores.length > 0 ? Math.round(scores.reduce((s, a) => s + a.score, 0) / scores.length) : null;
      let status: string;
      if (entry?.completedAt) status = 'Completed';
      else if (completedCount > 0) status = 'In Progress';
      else status = 'Not Started';
      return {
        courseName: course.title,
        dept: course.department,
        completed: completedCount,
        total: completedCount + 5,
        avg,
        status,
        lastAccessed,
      };
    }).filter(Boolean) as any[];
  }, [enrolledCourseIds, courses, progressMap, completions]);

  // ── Assessment History ─────────────────────────────────────────────
  const assessmentRows = useMemo(() => {
    const rows: any[] = [];
    Object.entries(progressMap).forEach(([cid, entry]) => {
      const course = courses.find(c => c.id === cid);
      Object.entries(entry.assessmentScores || {}).forEach(([aid, a]) => {
        rows.push({
          name: `Assessment ${aid.slice(-4)}`,
          course: course?.title || 'Unknown',
          score: a.score,
          passed: a.passed,
          date: a.attemptedAt,
        });
      });
    });
    return rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
  }, [progressMap, courses]);

  // ── Recent Activity ────────────────────────────────────────────────
  const recentActivity = useMemo(() => {
    const items: { type: string; text: string; course: string; date: string; color: string }[] = [];
    completions.forEach(e => {
      const course = courses.find(c => c.id === e.courseId);
      items.push({
        type: 'lesson',
        text: `Completed lesson`,
        course: course?.title || e.courseId,
        date: e.completedAt,
        color: 'border-l-blue-400',
      });
    });
    Object.entries(progressMap).forEach(([cid, entry]) => {
      const course = courses.find(c => c.id === cid);
      Object.values(entry.assessmentScores || {}).forEach(a => {
        items.push({
          type: 'assessment',
          text: `Scored ${a.score}% on assessment`,
          course: course?.title || cid,
          date: a.attemptedAt,
          color: 'border-l-indigo-400',
        });
      });
    });
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 15);
  }, [completions, progressMap, courses]);

  // ── Performance Insights ───────────────────────────────────────────
  const strongest = bestScore;
  const weakest = allScores.length > 0 ? allScores.reduce((w, a) => a.score < w.score ? a : w, allScores[0]) : null;

  const hasData = completions.length > 0 || allScores.length > 0;

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Clock} label="Total Learning Time" value={formatMinutes(totalMinutes)} sub={`+ ${thisWeekMinutes} min this week`} />
        <StatCard icon={TrendingUp} label="Avg. Course Score" value={avgScore !== null ? `${avgScore}%` : 'N/A'} sub={strongest ? `Best: ${courses.find(c => c.id === strongest.courseId)?.title || ''}` : 'No assessments yet'} />
        <StatCard icon={BookOpen} label="Courses Completed" value={String(completedCourses.length)} sub={`${inProgressCourses.length} in progress`} />
        <StatCard icon={Calendar} label="Learning Streak" value={`${streak.current} days`} sub={`Best: ${streak.best} days`} />
      </div>

      {/* Weekly Activity + Department Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Weekly Activity</h3>
          <div className="space-y-3">
            {weeklyData.map((d) => (
              <div key={d.day} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-8">{d.day}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2">
                  <div className="bg-primary-600 rounded-full h-2 transition-all" style={{ width: `${d.pct}%` }} />
                </div>
                <span className="text-xs text-slate-500 w-10 text-right">{d.count}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-500 mt-4">{weeklyTotal} lessons completed this week</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Department Progress</h3>
          <div className="space-y-4">
            {deptProgress.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <BookOpen className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Not enrolled in any courses yet</p>
              </div>
            )}
            {deptProgress.map((item) => (
              <div key={item.dept}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-700 font-medium">{item.dept}</span>
                  <span className="text-slate-500">{item.pct}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-primary-600 rounded-full h-2 transition-all" style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Course Progress Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 overflow-x-auto">
        <h3 className="font-semibold text-slate-800 mb-4">Course Progress</h3>
        {courseRows.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <BookOpen className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">No enrolled courses yet. Start learning to see progress here.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-500">
                <th className="pb-3 font-medium">Course Name</th>
                <th className="pb-3 font-medium">Department</th>
                <th className="pb-3 font-medium">Progress</th>
                <th className="pb-3 font-medium">Score</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Last Accessed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {courseRows.map((row, i) => (
                <tr key={i}>
                  <td className="py-3 font-medium text-slate-700">{row.courseName}</td>
                  <td className="py-3 text-slate-500">{row.dept}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-100 rounded-full h-1.5">
                        <div className="bg-primary-600 rounded-full h-1.5" style={{ width: `${Math.min(100, (row.completed / row.total) * 100)}%` }} />
                      </div>
                      <span className="text-xs text-slate-500">{row.completed} of {row.total}</span>
                    </div>
                  </td>
                  <td className="py-3 text-slate-500">{row.avg !== null ? `${row.avg}%` : '—'}</td>
                  <td className="py-3">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="py-3 text-slate-500">{row.lastAccessed ? timeAgo(row.lastAccessed) : 'Never'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Assessment History */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 overflow-x-auto">
        <h3 className="font-semibold text-slate-800 mb-4">Assessment History</h3>
        {assessmentRows.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <ClipboardList className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">No assessments taken yet</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-500">
                <th className="pb-3 font-medium">Assessment Name</th>
                <th className="pb-3 font-medium">Course</th>
                <th className="pb-3 font-medium">Score</th>
                <th className="pb-3 font-medium">Result</th>
                <th className="pb-3 font-medium">Date Taken</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {assessmentRows.map((row, i) => (
                <tr key={i}>
                  <td className="py-3 font-medium text-slate-700">{row.name}</td>
                  <td className="py-3 text-slate-500">{row.course}</td>
                  <td className="py-3 text-slate-700 font-medium">{row.score}%</td>
                  <td className="py-3">
                    {row.passed ? (
                      <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">Passed</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-red-50 text-red-700 text-xs font-medium rounded-full">Failed</span>
                    )}
                  </td>
                  <td className="py-3 text-slate-500">{timeAgo(row.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Recent Activity + Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Clock className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg bg-slate-50 border-l-4 ${item.color}`}>
                  {item.type === 'lesson' ? <LessonIcon className="w-4 h-4 text-blue-500 mt-0.5" /> : item.type === 'assessment' ? <ClipboardList className="w-4 h-4 text-indigo-500 mt-0.5" /> : <Award className="w-4 h-4 text-amber-500 mt-0.5" />}
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">{item.text} <span className="font-medium">{item.course}</span></p>
                    <p className="text-xs text-slate-400">{timeAgo(item.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Performance Insights</h3>
          {!hasData ? (
            <div className="text-center py-8 text-slate-400">
              <TrendingUp className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Complete more lessons and assessments to see insights</p>
            </div>
          ) : (
            <div className="space-y-4">
              {strongest && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-100">
                  <ArrowUpRight className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Strongest Subject</p>
                    <p className="text-sm text-green-700">{courses.find(c => c.id === strongest.courseId)?.title || 'Course'} — {strongest.score}%</p>
                  </div>
                </div>
              )}
              {weakest && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-100">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Needs Attention</p>
                    <p className="text-sm text-amber-700">{courses.find(c => c.id === weakest.courseId)?.title || 'Course'} — {weakest.score}%</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// ADMIN REPORT
// ═══════════════════════════════════════════════════════════════════════

function AdminReport() {
  const users = useMemo(() => getUsers(), []);
  const courses = useMemo(() => getCourses(), []);
  const allCompletions = useMemo(() => getLessonCompletions(), []);
  const allLogins = useMemo(() => getLoginHistory(), []);
  const allProgress = useMemo(() => getCourseProgress(), []);

  const employees = users.filter(u => u.role === 'employee');

  // ── Company Stat Cards ─────────────────────────────────────────────
  const totalEmployees = employees.length;

  // Avg completion rate across all employees and enrolled courses
  let totalCompletionPct = 0;
  let completionCount = 0;
  employees.forEach(emp => {
    const empProgress = allProgress[emp.id] || {};
    Object.entries(empProgress).forEach(([cid, entry]) => {
      const course = courses.find(c => c.id === cid);
      if (!course) return;
      const pct = entry.completedLessons.length / (entry.completedLessons.length + 5); // approximate
      totalCompletionPct += Math.min(1, pct);
      completionCount++;
    });
  });
  const avgCompletionRate = completionCount > 0 ? Math.round((totalCompletionPct / completionCount) * 100) : 0;

  // Assessments passed across all users
  let assessmentsPassed = 0;
  Object.values(allProgress).forEach(userProgress => {
    Object.values(userProgress).forEach(entry => {
      Object.values(entry.assessmentScores || {}).forEach(a => {
        if (a.passed) assessmentsPassed++;
      });
    });
  });

  // Active this week
  const activeThisWeek = new Set<string>();
  allCompletions.filter(e => isThisWeek(e.completedAt)).forEach(e => activeThisWeek.add(e.userId));
  allLogins.filter(e => isThisWeek(e.date)).forEach(e => activeThisWeek.add(e.userId));

  // ── Course Enrollment & Completion Table ───────────────────────────
  const publishedCourses = courses.filter(c => c.status === 'published');
  const courseTableRows = useMemo(() => {
    return publishedCourses.map(course => {
      let enrolled = 0;
      let completed = 0;
      const scores: number[] = [];
      Object.entries(allProgress).forEach(([, userProgress]) => {
        const entry = userProgress[course.id];
        if (entry) {
          enrolled++;
          if (entry.completedAt) completed++;
          Object.values(entry.assessmentScores || {}).forEach(a => scores.push(a.score));
        }
      });
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : null;
      const rate = enrolled > 0 ? Math.round((completed / enrolled) * 100) : 0;
      return { courseName: course.title, dept: course.department, enrolled, completed, avgScore, rate };
    }).sort((a, b) => b.enrolled - a.enrolled);
  }, [publishedCourses, allProgress]);

  // ── Employee Progress Table ────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const employeeRows = useMemo(() => {
    return employees.map(emp => {
      const empProgress = allProgress[emp.id] || {};
      const enrolledIds = Object.keys(empProgress);
      const completedCount = enrolledIds.filter(cid => empProgress[cid]?.completedAt).length;
      const scores: number[] = [];
      Object.values(empProgress).forEach(entry => {
        Object.values(entry.assessmentScores || {}).forEach(a => scores.push(a.score));
      });
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : null;
      const lastLogin = allLogins.filter(l => l.userId === emp.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      const lastCompletion = allCompletions.filter(c => c.userId === emp.id).sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];
      const lastActive = lastLogin ? lastLogin.date : (lastCompletion ? lastCompletion.completedAt : null);
      return {
        id: emp.id,
        name: emp.full_name || emp.email,
        email: emp.email,
        dept: emp.department,
        enrolled: enrolledIds.length,
        completed: completedCount,
        avgScore,
        lastActive,
        courses: enrolledIds.map(cid => {
          const course = courses.find(c => c.id === cid);
          const entry = empProgress[cid];
          return {
            courseName: course?.title || cid,
            progress: entry?.completedLessons.length || 0,
            total: (entry?.completedLessons.length || 0) + 5,
            status: entry?.completedAt ? 'Completed' : entry?.completedLessons.length ? 'In Progress' : 'Not Started',
          };
        }),
      };
    }).filter(row =>
      row.name.toLowerCase().includes(search.toLowerCase()) ||
      row.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [employees, allProgress, allLogins, allCompletions, courses, search]);

  // ── Department Summary ─────────────────────────────────────────────
  const deptSummary = useMemo(() => {
    return departments.map(dept => {
      const deptEmployees = employees.filter(e => e.department === dept);
      const deptCourses = publishedCourses.filter(c => c.department === dept);
      if (deptEmployees.length === 0 && deptCourses.length === 0) return null;
      let totalPct = 0;
      let count = 0;
      let totalScore = 0;
      let scoreCount = 0;
      deptEmployees.forEach(emp => {
        const empProgress = allProgress[emp.id] || {};
        deptCourses.forEach(course => {
          const entry = empProgress[course.id];
          if (entry) {
            const pct = entry.completedLessons.length / (entry.completedLessons.length + 5);
            totalPct += Math.min(1, pct);
            count++;
            Object.values(entry.assessmentScores || {}).forEach(a => { totalScore += a.score; scoreCount++; });
          }
        });
      });
      const avgRate = count > 0 ? Math.round((totalPct / count) * 100) : 0;
      const avgScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : null;
      return { dept, employees: deptEmployees.length, courses: deptCourses.length, avgRate, avgScore };
    }).filter(Boolean) as any[];
  }, [employees, publishedCourses, allProgress]);

  // ── Recent Activity (company-wide) ─────────────────────────────────
  const companyActivity = useMemo(() => {
    const items: { user: string; action: string; course: string; date: string }[] = [];
    allCompletions.forEach(e => {
      const user = users.find(u => u.id === e.userId);
      const course = courses.find(c => c.id === e.courseId);
      items.push({
        user: user?.full_name || user?.email || e.userId,
        action: 'completed a lesson',
        course: course?.title || e.courseId,
        date: e.completedAt,
      });
    });
    Object.entries(allProgress).forEach(([uid, userProgress]) => {
      const user = users.find(u => u.id === uid);
      void uid;
      Object.entries(userProgress).forEach(([cid, entry]) => {
        const course = courses.find(c => c.id === cid);
        Object.values(entry.assessmentScores || {}).forEach(a => {
          items.push({
            user: user?.full_name || user?.email || uid,
            action: `scored ${a.score}% on assessment`,
            course: course?.title || cid,
            date: a.attemptedAt,
          });
        });
      });
    });
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20);
  }, [allCompletions, allProgress, users, courses]);

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Employees" value={String(totalEmployees)} sub="Active learners" />
        <StatCard icon={BarChart3} label="Avg Completion Rate" value={`${avgCompletionRate}%`} sub="Across all courses" />
        <StatCard icon={CheckCircle2} label="Assessments Passed" value={String(assessmentsPassed)} sub="Company-wide" />
        <StatCard icon={Calendar} label="Active This Week" value={String(activeThisWeek.size)} sub="Unique users" />
      </div>

      {/* Course Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 overflow-x-auto">
        <h3 className="font-semibold text-slate-800 mb-4">Course Enrollment & Completion</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-slate-500">
              <th className="pb-3 font-medium">Course Name</th>
              <th className="pb-3 font-medium">Department</th>
              <th className="pb-3 font-medium">Enrolled</th>
              <th className="pb-3 font-medium">Completed</th>
              <th className="pb-3 font-medium">Avg Score</th>
              <th className="pb-3 font-medium">Completion Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {courseTableRows.map((row, i) => (
              <tr key={i}>
                <td className="py-3 font-medium text-slate-700">{row.courseName}</td>
                <td className="py-3 text-slate-500">{row.dept}</td>
                <td className="py-3 text-slate-700">{row.enrolled}</td>
                <td className="py-3 text-slate-700">{row.completed}</td>
                <td className="py-3 text-slate-500">{row.avgScore !== null ? `${row.avgScore}%` : '—'}</td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-slate-100 rounded-full h-1.5">
                      <div className="bg-primary-600 rounded-full h-1.5" style={{ width: `${row.rate}%` }} />
                    </div>
                    <span className="text-xs text-slate-500">{row.rate}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Employee Progress Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Employee Progress</h3>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none w-64"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-500">
                <th className="pb-3 font-medium">Employee</th>
                <th className="pb-3 font-medium">Department</th>
                <th className="pb-3 font-medium">Courses Enrolled</th>
                <th className="pb-3 font-medium">Courses Completed</th>
                <th className="pb-3 font-medium">Avg Score</th>
                <th className="pb-3 font-medium">Last Active</th>
                <th className="pb-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {employeeRows.map((row) => (
                <>
                  <tr key={row.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                          {row.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-700">{row.name}</p>
                          <p className="text-xs text-slate-400">{row.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-slate-500">{row.dept}</td>
                    <td className="py-3 text-slate-700">{row.enrolled}</td>
                    <td className="py-3 text-slate-700">{row.completed}</td>
                    <td className="py-3 text-slate-500">{row.avgScore !== null ? `${row.avgScore}%` : '—'}</td>
                    <td className="py-3 text-slate-500">{row.lastActive ? timeAgo(row.lastActive) : 'Never'}</td>
                    <td className="py-3">
                      {expandedRow === row.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </td>
                  </tr>
                  {expandedRow === row.id && (
                    <tr>
                      <td colSpan={7} className="py-3 px-4 bg-slate-50">
                        <div className="space-y-2">
                          {row.courses.map((c: any, ci: number) => (
                            <div key={ci} className="flex items-center justify-between text-sm">
                              <span className="text-slate-700 font-medium">{c.courseName}</span>
                              <div className="flex items-center gap-3">
                                <div className="w-24 bg-slate-200 rounded-full h-1.5">
                                  <div className="bg-primary-600 rounded-full h-1.5" style={{ width: `${Math.min(100, (c.progress / c.total) * 100)}%` }} />
                                </div>
                                <StatusBadge status={c.status} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Department Summary */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Department Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deptSummary.map((d) => (
            <div key={d.dept} className="bg-slate-50 rounded-lg p-4 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-primary-500" />
                <span className="font-semibold text-slate-800">{d.dept}</span>
              </div>
              <div className="space-y-1 text-sm text-slate-600">
                <p>{d.employees} employees</p>
                <p>{d.courses} courses</p>
                <p>Avg completion: {d.avgRate}%</p>
                {d.avgScore !== null && <p>Avg score: {d.avgScore}%</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Company Recent Activity */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Recent Activity</h3>
        {companyActivity.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Clock className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">No recent activity across the company</p>
          </div>
        ) : (
          <div className="space-y-3">
            {companyActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border-l-4 border-l-primary-300">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {item.user.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-700"><span className="font-medium">{item.user}</span> {item.action} <span className="font-medium">{item.course}</span></p>
                  <p className="text-xs text-slate-400">{timeAgo(item.date)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary-600" />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'Completed') {
    return <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
  }
  if (status === 'In Progress') {
    return <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full flex items-center gap-1 w-fit"><PlayCircle className="w-3 h-3" /> In Progress</span>;
  }
  return <span className="px-2 py-0.5 bg-slate-50 text-slate-500 text-xs font-medium rounded-full flex items-center gap-1 w-fit"><Circle className="w-3 h-3" /> Not Started</span>;
}

const departments = ['Sales', 'HR', 'IT', 'Finance', 'Operations', 'Management'];
