import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { fetchDashboardData } from '../lib/api';
import { formatTimeAgo, formatDate } from '../lib/utils';
import {
  BookOpen, Award, ClipboardCheck, Clock, ArrowRight, Play, Calendar, TrendingUp,
  Zap, Trophy
} from 'lucide-react';

interface DashboardStats {
  coursesEnrolled: number;
  coursesCompleted: number;
  certificatesEarned: number;
  pendingAssessments: number;
}

interface CourseWithProgress {
  id: string;
  title: string;
  description: string;
  department: string;
  thumbnail_url: string | null;
  duration: string;
  progress_percent: number;
  status: string;
}

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string | null;
  created_at: string;
}

interface UpcomingItem {
  id: string;
  title: string;
  course_name: string | null;
  due_date: string;
  type: string;
}

export default function Dashboard({ onNavigate }: { onNavigate: (page: string, data?: any) => void }) {
  const { user } = useAuth();

  const { data: dashboardData, isLoading } = useQuery<{
    stats: DashboardStats;
    continueCourse: CourseWithProgress | null;
    activities: ActivityItem[];
    upcoming: UpcomingItem[];
  }>({
    queryKey: ['dashboard', user?.id],
    queryFn: () => fetchDashboardData(user!.id),
    enabled: !!user,
  });

  const stats = dashboardData?.stats ?? { coursesEnrolled: 0, coursesCompleted: 0, certificatesEarned: 0, pendingAssessments: 0 };
  const continueCourse = dashboardData?.continueCourse ?? null;
  const activities = dashboardData?.activities ?? [];
  const upcoming = dashboardData?.upcoming ?? [];

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="rounded-3xl bg-slate-200 h-44" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 rounded-2xl bg-slate-200" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-60 rounded-2xl bg-slate-200" />
            <div className="h-44 rounded-2xl bg-slate-200" />
          </div>
          <div className="space-y-4">
            <div className="h-56 rounded-2xl bg-slate-200" />
            <div className="h-48 rounded-2xl bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Courses Enrolled', value: stats.coursesEnrolled, icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
    { label: 'Courses Completed', value: stats.coursesCompleted, icon: Award, color: 'bg-green-50 text-green-600' },
    { label: 'Certificates Earned', value: stats.certificatesEarned, icon: Trophy, color: 'bg-amber-50 text-amber-600' },
    { label: 'Pending Assessments', value: stats.pendingAssessments, icon: ClipboardCheck, color: 'bg-rose-50 text-rose-600' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'course_enrolled': return BookOpen;
      case 'lesson_completed': return Play;
      case 'assessment_started': return ClipboardCheck;
      case 'assessment_completed': return Award;
      case 'certificate_earned': return Trophy;
      default: return Zap;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.full_name?.split(' ')[0] || 'Employee'}!</h2>
            <p className="text-primary-100 mb-4">{user?.onboarding_batch || 'Onboarding in progress'} &middot; {user?.job_title}</p>
            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-xs">
                <div className="flex justify-between text-sm mb-1">
                  <span>Overall Onboarding Progress</span>
                  <span className="font-semibold">{Math.round(((stats.coursesCompleted + stats.certificatesEarned) / Math.max(stats.coursesEnrolled * 2, 1)) * 100)}%</span>
                </div>
                <div className="w-full bg-primary-900/30 rounded-full h-2.5">
                  <div
                    className="bg-white rounded-full h-2.5 transition-all duration-1000"
                    style={{ width: `${Math.round(((stats.coursesCompleted + stats.certificatesEarned) / Math.max(stats.coursesEnrolled * 2, 1)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-10 h-10 text-white/80" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Learning */}
        <div className="lg:col-span-2 space-y-6">
          {continueCourse && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Play className="w-5 h-5 text-primary-600" />
                  Continue Learning
                </h3>
                <button
                  onClick={() => onNavigate('my-courses')}
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"
                >
                  My Courses <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-4">
                <div className="w-32 h-24 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                  {continueCourse.thumbnail_url ? (
                    <img src={continueCourse.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-primary-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                      {continueCourse.department}
                    </span>
                    <span className="text-xs text-slate-400">{continueCourse.duration}</span>
                  </div>
                  <h4 className="font-semibold text-slate-800 truncate">{continueCourse.title}</h4>
                  <p className="text-sm text-slate-500 line-clamp-1 mt-0.5">{continueCourse.description}</p>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Progress</span>
                      <span className="font-medium text-primary-700">{continueCourse.progress_percent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-primary-500 rounded-full h-2 transition-all" style={{ width: `${continueCourse.progress_percent}%` }} />
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('course-detail', { courseId: continueCourse.id, courseTitle: continueCourse.title })}
                  className="self-center px-4 py-2 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-900 transition-colors"
                >
                  Resume
                </button>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              <button
                onClick={() => onNavigate('course-library')}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 hover:bg-primary-50 border border-slate-100 hover:border-primary-200 transition-all"
              >
                <BookOpen className="w-6 h-6 text-primary-600" />
                <span className="text-sm font-medium text-slate-700">Browse Courses</span>
              </button>
              <button
                onClick={() => onNavigate('assessments')}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 hover:bg-primary-50 border border-slate-100 hover:border-primary-200 transition-all"
              >
                <ClipboardCheck className="w-6 h-6 text-primary-600" />
                <span className="text-sm font-medium text-slate-700">Take Assessment</span>
              </button>
              <button
                onClick={() => onNavigate('certificates')}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 hover:bg-primary-50 border border-slate-100 hover:border-primary-200 transition-all"
              >
                <Award className="w-6 h-6 text-primary-600" />
                <span className="text-sm font-medium text-slate-700">View Certificates</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-600" />
              Upcoming
            </h3>
            <div className="space-y-3">
              {upcoming.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No upcoming deadlines</p>
              ) : (
                upcoming.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onNavigate('assessments')}
                    className="w-full text-left flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-primary-50 transition-colors cursor-pointer"
                  >
                    <Clock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.course_name}</p>
                      <p className="text-xs text-primary-600 mt-1">Due {formatDate(item.due_date)}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {activities.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">No recent activity</p>
              )}
              {activities.map((act) => {
                const Icon = getActivityIcon(act.type);
                return (
                  <div key={act.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{act.title}</p>
                      {act.description && <p className="text-xs text-slate-500">{act.description}</p>}
                      <p className="text-xs text-slate-400 mt-0.5">{formatTimeAgo(act.created_at)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
