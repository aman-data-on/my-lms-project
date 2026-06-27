import { lazy, Suspense, useState } from 'react';
import { cn } from './lib/cn';
import { Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import Sidebar from './components/Sidebar';
import { fetchAllCourses, SALES_COURSE_ID } from './lib/api';
import { slugify } from './lib/slugify';

const AuthPage = lazy(() => import('./pages/AuthPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MyCourses = lazy(() => import('./pages/MyCourses'));
const CourseLibrary = lazy(() => import('./pages/CourseLibrary'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const SalesOnboardingCourse = lazy(() => import('./pages/SalesOnboardingCourse'));
const Assessments = lazy(() => import('./pages/Assessments'));
const Certificates = lazy(() => import('./pages/Certificates'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const CourseBuilder = lazy(() => import('./pages/CourseBuilder'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />;
  return children;
}

// Prevents authenticated users from seeing the auth page — redirects them to
// wherever they came from, or the dashboard.
function RedirectAuthenticated({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname || '/';
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );
  if (user) return <Navigate to={from} replace />;
  return children;
}

// Guards a route so only users whose profile.role === 'admin' can access it.
// A non-admin who navigates directly to /admin or /course-builder is redirected
// to the dashboard. RequireAuth must wrap this (auth check happens first).
function RequireAdmin({ children }: { children: JSX.Element }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

function RouteWrappers() {
  const navigate = useNavigate();

  const mapNavigate = (page: string, data?: any) => {
    switch (page) {
      case 'dashboard': return navigate('/');
      case 'my-courses': return navigate('/my-courses');
      case 'course-library': return navigate('/course-library');
      case 'course-detail': {
        // Build the slug from the title (the route matches by slugified title, so
        // a raw courseId would never match). Guard empty → never navigate to a
        // dead `/course/` that just bounces back to the dashboard.
        const slug = data?.slug ?? (data?.courseTitle ? slugify(data.courseTitle) : '');
        if (!slug) return;
        const lessonPart = data?.lessonSlug ? `/lesson/${data.lessonSlug}` : '';
        return navigate(`/course/${slug}${lessonPart}`);
      }
      case 'assessments': return navigate('/assessments');
      case 'certificates': return navigate('/certificates');
      case 'reports': return navigate('/reports');
      case 'settings': return navigate('/settings');
      case 'admin': return navigate('/admin');
      case 'course-builder': return navigate('/course-builder');
      default: return navigate('/');
    }
  };

  return (
    <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/auth" element={<RedirectAuthenticated><AuthPage /></RedirectAuthenticated>} />
      <Route path="/" element={<RequireAuth><Dashboard onNavigate={mapNavigate} /></RequireAuth>} />
      <Route path="/my-courses" element={<RequireAuth><MyCourses onNavigate={mapNavigate} /></RequireAuth>} />
      <Route path="/course-library" element={<RequireAuth><CourseLibrary onNavigate={mapNavigate} /></RequireAuth>} />
      <Route path="/course/:courseSlug" element={<RequireAuth><CourseRouteWrapper onNavigate={mapNavigate} /></RequireAuth>} />
      <Route path="/course/:courseSlug/lesson/:lessonSlug" element={<RequireAuth><CourseRouteWrapper onNavigate={mapNavigate} /></RequireAuth>} />
      <Route path="/assessments" element={<RequireAuth><Assessments onNavigate={mapNavigate} /></RequireAuth>} />
      <Route path="/certificates" element={<RequireAuth><Certificates /></RequireAuth>} />
      <Route path="/reports" element={<RequireAuth><Reports /></RequireAuth>} />
      <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
      <Route path="/admin" element={<RequireAuth><RequireAdmin><AdminPanel onNavigate={mapNavigate} /></RequireAdmin></RequireAuth>} />
      <Route path="/course-builder" element={<RequireAuth><RequireAdmin><CourseBuilder onNavigate={mapNavigate} /></RequireAdmin></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
}

function CourseRouteWrapper({ onNavigate }: { onNavigate: (page: string, data?: any) => void }) {
  const { courseSlug = '' } = useParams<{ courseSlug: string }>();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses-all'],
    queryFn: fetchAllCourses,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <PageLoader />;

  const course = courses.find(c => slugify(c.title) === courseSlug);
  if (!course) return <Navigate to="/my-courses" replace />;

  if (course.id === SALES_COURSE_ID) {
    return <SalesOnboardingCourse onNavigate={onNavigate} />;
  }

  return <CourseDetail courseId={course.id} courseSlug={courseSlug} onNavigate={onNavigate} />;
}

function AppContent() {
  const { user, loading } = useAuth();
  const [sidebarPinned, setSidebarPinned] = useState(false);

  const showSidebar = !loading && !!user;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {showSidebar && (
        <>
          <a
            href="#main-content"
            className="absolute -top-full left-1/2 -translate-x-1/2 z-[200] focus-visible:top-4 px-4 py-2 bg-primary-700 text-white rounded-lg text-sm font-medium shadow-lg whitespace-nowrap transition-[top] motion-reduce:transition-none focus:outline-none"
          >
            Skip to main content
          </a>
          <Sidebar pinned={sidebarPinned} onTogglePin={() => setSidebarPinned(p => !p)} />
        </>
      )}
      <main
        id="main-content"
        tabIndex={-1}
        className={cn(
          'flex-1 ml-0 overflow-y-auto min-h-screen focus:outline-none',
          'transition-[margin-left] duration-300 motion-reduce:transition-none',
          showSidebar
            ? cn('px-4 md:px-8 pb-4 md:pb-8 pt-14 md:pt-8', sidebarPinned ? 'md:ml-64' : 'md:ml-16')
            : 'p-0',
        )}
      >
        {showSidebar ? (
          <div className="max-w-6xl mx-auto">
            <RouteWrappers />
          </div>
        ) : (
          <RouteWrappers />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
