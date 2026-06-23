import { useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import MyCourses from './pages/MyCourses';
import CourseLibrary from './pages/CourseLibrary';
import CourseDetail from './pages/CourseDetail';
import SalesOnboardingCourse from './pages/SalesOnboardingCourse';
import Assessments from './pages/Assessments';
import Certificates from './pages/Certificates';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import AdminPanel from './pages/AdminPanel';
import CourseBuilder from './pages/CourseBuilder';

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function RouteWrappers() {
  const navigate = useNavigate();

  const mapNavigate = (page: string, data?: any) => {
    switch (page) {
      case 'dashboard': return navigate('/');
      case 'my-courses': return navigate('/my-courses');
      case 'course-library': return navigate('/course-library');
      case 'course-detail': return navigate(`/course/${data?.courseId}`);
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
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/" element={<RequireAuth><Dashboard onNavigate={mapNavigate} /></RequireAuth>} />
      <Route path="/my-courses" element={<RequireAuth><MyCourses onNavigate={mapNavigate} /></RequireAuth>} />
      <Route path="/course-library" element={<RequireAuth><CourseLibrary onNavigate={mapNavigate} /></RequireAuth>} />
      <Route path="/course/:courseId" element={<RequireAuth><CourseRouteWrapper onNavigate={mapNavigate} /></RequireAuth>} />
      <Route path="/assessments" element={<RequireAuth><Assessments onNavigate={mapNavigate} /></RequireAuth>} />
      <Route path="/certificates" element={<RequireAuth><Certificates /></RequireAuth>} />
      <Route path="/reports" element={<RequireAuth><Reports /></RequireAuth>} />
      <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
      <Route path="/admin" element={<RequireAuth><AdminPanel onNavigate={mapNavigate} /></RequireAuth>} />
      <Route path="/course-builder" element={<RequireAuth><CourseBuilder onNavigate={mapNavigate} /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function CourseRouteWrapper({ onNavigate }: { onNavigate: (page: string, data?: any) => void }) {
  const params = useParams();
  const courseId = params.courseId || '';
  // If this is the special sales onboarding course, render its special page
  if (courseId === 'cdbf91e9-7a4a-430d-8def-7a119a90e4b4') {
    return <SalesOnboardingCourse onNavigate={onNavigate} />;
  }
  return <CourseDetail courseId={courseId} onNavigate={onNavigate} />;
}

function AppContent() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-8 overflow-y-auto min-h-screen">
        <div className="max-w-6xl mx-auto">
          <RouteWrappers />
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
