import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { fetchMyCourses } from '../lib/api';
import { BookOpen, Clock, Play, CheckCircle2 } from 'lucide-react';


export default function MyCourses({ onNavigate }: { onNavigate: (page: string, data?: any) => void }) {
  const { user } = useAuth();
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['my-courses', user?.id],
    queryFn: () => fetchMyCourses(user!.id),
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">My Courses</h2>
        <p className="text-sm text-slate-500 mt-1">Track your learning progress</p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No courses yet</h3>
          <p className="text-sm text-slate-500 mb-4">Browse the course library to start learning</p>
          <button
            onClick={() => onNavigate('course-library')}
            className="px-5 py-2.5 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-900 transition-colors"
          >
            Browse Courses
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex gap-5 hover:shadow-md transition-shadow">
              <div className="w-40 h-28 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary-50">
                    <BookOpen className="w-10 h-10 text-primary-200" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                    {course.department}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration}</span>
                </div>
                <h3 className="font-semibold text-slate-800">{course.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-1 mt-1">{course.description}</p>
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex-1 max-w-xs">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Progress</span>
                      <span className="font-medium text-primary-700">{course.progress_percent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-primary-500 rounded-full h-2 transition-all" style={{ width: `${course.progress_percent}%` }} />
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('course-detail', { courseId: course.id, courseTitle: course.title })}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      course.status === 'completed'
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : 'bg-primary-800 text-white hover:bg-primary-900'
                    }`}
                  >
                    {course.status === 'completed' ? (
                      <><CheckCircle2 className="w-4 h-4" /> Review</>
                    ) : (
                      <><Play className="w-4 h-4" /> Continue</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
