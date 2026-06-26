import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { fetchCourseLibrary, enrollInCourse } from '../lib/api';
import {
  Search, BookOpen, Clock, ChevronDown, Play,
  CheckCircle2, Circle
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  department: string;
  thumbnail_url: string | null;
  duration: string;
  lessons?: { count: number }[];
}

interface Enrollment {
  course_id: string;
  status: string;
  progress_percent: number;
}

const DEPARTMENTS = ['All', 'HR', 'IT', 'Finance', 'Sales', 'Operations', 'Marketing'];
const STATUSES = ['All', 'In Progress', 'Completed', 'Not Started'];

export default function CourseLibrary({ onNavigate }: { onNavigate: (page: string, data?: any) => void }) {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const { data, isLoading } = useQuery({
    queryKey: ['course-library', user?.id],
    queryFn: () => fetchCourseLibrary(user!.id),
    enabled: !!user,
  });
  const courses: Course[] = data?.courses ?? [];
  const enrollments: Enrollment[] = data?.enrollments ?? [];

  const enrollMutation = useMutation({
    mutationFn: ({ courseId, courseTitle }: { courseId: string; courseTitle: string }) =>
      enrollInCourse(user!.id, courseId, courseTitle),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['course-library', user?.id] }),
  });

  const getEnrollment = (courseId: string) => enrollments.find(e => e.course_id === courseId);

  const getStatus = (courseId: string) => {
    const e = getEnrollment(courseId);
    if (!e) return 'Not Started';
    if (e.status === 'completed') return 'Completed';
    if (e.status === 'in_progress') return 'In Progress';
    return 'Not Started';
  };

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'All' || c.department === deptFilter;
    const matchesStatus = statusFilter === 'All' || getStatus(c.id) === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleEnroll = (courseId: string) => {
    const courseTitle = courses.find(c => c.id === courseId)?.title ?? '';
    enrollMutation.mutate({ courseId, courseTitle });
  };

  const deptColors: Record<string, string> = {
    HR: 'bg-rose-50 text-rose-700 border-rose-200',
    IT: 'bg-blue-50 text-blue-700 border-blue-200',
    Finance: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Sales: 'bg-amber-50 text-amber-700 border-amber-200',
    Operations: 'bg-slate-50 text-slate-700 border-slate-200',
    Marketing: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Course Library</h2>
          <p className="text-sm text-slate-500 mt-1">Browse and enroll in available courses</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
          />
        </div>
        <div className="relative">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="pl-4 pr-10 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm appearance-none bg-white min-w-[140px]"
          >
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-4 pr-10 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm appearance-none bg-white min-w-[140px]"
          >
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const status = getStatus(course.id);
            const enrollment = getEnrollment(course.id);
            return (
              <div key={course.id} className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                <div className="relative h-40 bg-slate-100 overflow-hidden">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-50">
                      <BookOpen className="w-12 h-12 text-primary-200" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${deptColors[course.department] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                      {course.department}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-slate-800 mb-1 line-clamp-1">{course.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-3">{course.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {course.duration}</span>
                  </div>
                  {enrollment && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">Progress</span>
                        <span className="font-medium text-primary-700">{enrollment.progress_percent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div className="bg-primary-500 rounded-full h-1.5 transition-all" style={{ width: `${enrollment.progress_percent}%` }} />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      status === 'Completed' ? 'bg-green-50 text-green-700' :
                      status === 'In Progress' ? 'bg-blue-50 text-blue-700' :
                      'bg-slate-50 text-slate-600'
                    }`}>
                      {status === 'Completed' ? <CheckCircle2 className="w-3 h-3 inline mr-1" /> : status === 'In Progress' ? <Play className="w-3 h-3 inline mr-1" /> : <Circle className="w-3 h-3 inline mr-1" />}
                      {status}
                    </span>
                    {status === 'Not Started' && !isAdmin ? (
                      <button
                        onClick={() => handleEnroll(course.id)}
                        className="px-4 py-1.5 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-900 transition-colors"
                      >
                        Enroll
                      </button>
                    ) : (
                      <button
                        onClick={() => onNavigate('course-detail', { courseId: course.id, courseTitle: course.title })}
                        className="px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-medium rounded-lg hover:bg-primary-100 transition-colors"
                      >
                        {status === 'Completed' ? 'Review' : isAdmin ? 'Open' : 'Continue'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
