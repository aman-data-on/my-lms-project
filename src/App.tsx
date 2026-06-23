import { useState } from 'react';
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

function AppContent() {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [pageData, setPageData] = useState<any>(null);

  const handleNavigate = (page: string, data?: any) => {
    setActivePage(page);
    setPageData(data || null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard onNavigate={handleNavigate} />;
      case 'my-courses': return <MyCourses onNavigate={handleNavigate} />;
      case 'course-library': return <CourseLibrary onNavigate={handleNavigate} />;
      case 'course-detail':
        if (pageData?.courseId === 'cdbf91e9-7a4a-430d-8def-7a119a90e4b4') {
          return <SalesOnboardingCourse onNavigate={handleNavigate} />;
        }
        return <CourseDetail courseId={pageData?.courseId} onNavigate={handleNavigate} />;
      case 'assessments': return <Assessments onNavigate={handleNavigate} />;
      case 'certificates': return <Certificates />;
      case 'reports': return <Reports />;
      case 'settings': return <Settings />;
      case 'admin': return <AdminPanel onNavigate={handleNavigate} />;
      case 'course-builder': return <CourseBuilder editingCourseId={pageData?.editingCourseId} onNavigate={handleNavigate} />;
      default: return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar activePage={activePage} onNavigate={handleNavigate} />
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-8 overflow-y-auto min-h-screen">
        <div className="max-w-6xl mx-auto">
          {renderPage()}
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
