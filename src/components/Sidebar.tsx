import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  Library,
  ClipboardCheck,
  Award,
  BarChart3,
  Settings,
  LogOut,
  GraduationCap,
  ChevronRight,
  Menu,
  Shield,
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const baseNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'my-courses', label: 'My Courses', icon: BookOpen },
  { id: 'course-library', label: 'Course Library', icon: Library },
  { id: 'assessments', label: 'Assessments', icon: ClipboardCheck },
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const { user, signOut, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = isAdmin
    ? [...baseNavItems, { id: 'admin', label: 'Admin Panel', icon: Shield }]
    : baseNavItems;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setMobileOpen(false)} />
      )}
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 bg-white rounded-lg shadow-md border border-slate-100 flex items-center justify-center"
      >
        <Menu className="w-5 h-5 text-slate-700" />
      </button>
      <aside className={`w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-40 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-800 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary-900 leading-tight">Onboard LMS</h1>
              <p className="text-xs text-slate-500">Learning Management</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary-50 text-primary-800'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-primary-700'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-primary-500'}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 text-primary-500" />}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg mb-3">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{user?.full_name || 'Guest'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.job_title || 'Employee'}</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
