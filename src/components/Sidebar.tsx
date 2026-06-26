import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';
import { cn } from '../lib/cn';
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
  ChevronLeft,
  Menu,
  Shield,
  X,
} from 'lucide-react';

const FOCUSABLE_SELECTORS = [
  'a[href]:not([disabled])',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

const baseNavItems = [
  { id: 'dashboard',      label: 'Dashboard',     icon: LayoutDashboard },
  { id: 'my-courses',     label: 'My Courses',     icon: BookOpen        },
  { id: 'course-library', label: 'Course Library', icon: Library         },
  { id: 'assessments',    label: 'Assessments',    icon: ClipboardCheck  },
  { id: 'certificates',   label: 'Certificates',   icon: Award           },
  { id: 'reports',        label: 'Reports',        icon: BarChart3       },
  { id: 'settings',       label: 'Settings',       icon: Settings        },
];

interface SidebarProps {
  /** Pinned = user clicked to keep sidebar persistently open */
  pinned: boolean;
  onTogglePin: () => void;
}

export default function Sidebar({ pinned, onTogglePin }: SidebarProps) {
  const { user, signOut, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const asideRef  = useRef<HTMLElement>(null);
  const hasOpenedRef = useRef(false);

  // Sidebar is visually expanded when pinned OR when the cursor is over it
  const expanded = pinned || hovered;

  const navItems = isAdmin
    ? [...baseNavItems, { id: 'admin', label: 'Admin Panel', icon: Shield }]
    : baseNavItems;

  const navigate = useNavigate();
  const close = () => setMobileOpen(false);

  const handleMouseEnter = () => {
    clearTimeout(leaveTimer.current);
    setHovered(true);
  };

  const handleMouseLeave = () => {
    // Small debounce so moving between child elements doesn't flicker
    leaveTimer.current = setTimeout(() => setHovered(false), 120);
  };

  // Move focus into the drawer when it opens
  useEffect(() => {
    if (!mobileOpen || !asideRef.current) return;
    hasOpenedRef.current = true;
    const first = asideRef.current.querySelector<HTMLElement>(FOCUSABLE_SELECTORS);
    first?.focus();
  }, [mobileOpen]);

  // Return focus to the trigger when the drawer closes
  useEffect(() => {
    if (!mobileOpen && hasOpenedRef.current) {
      triggerRef.current?.focus();
    }
  }, [mobileOpen]);

  // Focus trap + Escape key (mobile drawer only)
  useEffect(() => {
    if (!mobileOpen || !asideRef.current) return;
    const aside = asideRef.current;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') return;
      const els = Array.from(aside.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS));
      if (els.length === 0) return;
      const first = els[0];
      const last  = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }

    function handleFocusin(e: FocusEvent) {
      const target = e.target as Node | null;
      if (target && !aside.contains(target) && !triggerRef.current?.contains(target)) {
        aside.querySelector<HTMLElement>(FOCUSABLE_SELECTORS)?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusin);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusin);
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Backdrop — closes mobile drawer on click */}
      {mobileOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={close}
        />
      )}

      {/* Hamburger / close trigger — mobile only */}
      <Button
        ref={triggerRef}
        iconOnly
        variant="ghost"
        onClick={() => setMobileOpen(prev => !prev)}
        aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={mobileOpen}
        aria-controls="sidebar-nav"
        className="fixed top-3 left-3 z-50 md:hidden bg-white shadow-md border-slate-100 focus-visible:ring-primary-500"
      >
        {mobileOpen
          ? <X    className="w-5 h-5 text-slate-700" aria-hidden="true" />
          : <Menu className="w-5 h-5 text-slate-700" aria-hidden="true" />
        }
      </Button>

      {/* Sidebar */}
      <aside
        ref={asideRef}
        id="sidebar-nav"
        aria-label="Site navigation"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          // Mobile: always full-width when open
          'w-[min(90vw,18rem)]',
          // Desktop: narrow when collapsed, full when expanded
          expanded ? 'md:w-64' : 'md:w-16',
          'bg-white border-r border-slate-200',
          'flex flex-col h-screen fixed left-0 top-0 z-40',
          'transition-[width,transform] duration-300 motion-reduce:transition-none',
          'overflow-y-auto overflow-x-hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        {/* ── Brand header ─────────────────────────────────────────────────── */}
        <div className={cn(
          'border-b border-slate-100 flex-shrink-0',
          expanded ? 'p-6' : 'p-3',
        )}>
          <div className={cn('flex items-center', expanded ? 'gap-3' : 'justify-center')}>
            {/* Logo icon */}
            <div className="w-10 h-10 bg-primary-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-6 h-6 text-white" aria-hidden="true" />
            </div>

            {/* Brand text + controls — only when expanded */}
            {expanded && (
              <>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-bold text-primary-900 leading-tight whitespace-nowrap">Onboard LMS</h1>
                  <p className="text-xs text-slate-500 whitespace-nowrap">Learning Management</p>
                </div>

                {/* Desktop pin/unpin toggle — sits right of brand text */}
                <button
                  onClick={onTogglePin}
                  aria-label={pinned ? 'Unpin sidebar' : 'Pin sidebar open'}
                  className={cn(
                    'hidden md:flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0',
                    'transition-colors duration-150',
                    pinned
                      ? 'text-primary-600 bg-primary-50 hover:bg-primary-100'
                      : 'text-slate-400 hover:text-primary-600 hover:bg-slate-100',
                  )}
                >
                  {pinned
                    ? <ChevronLeft  className="w-4 h-4" aria-hidden="true" />
                    : <ChevronLeft  className="w-4 h-4 opacity-60" aria-hidden="true" />
                  }
                </button>

                {/* Mobile inline close button */}
                <Button
                  iconOnly
                  variant="ghost"
                  onClick={close}
                  aria-label="Close navigation"
                  className="md:hidden -mr-2 text-slate-500"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* ── Navigation ───────────────────────────────────────────────────── */}
        <nav
          className={cn(
            'flex-1 overflow-y-auto scrollbar-thin space-y-0.5',
            expanded ? 'p-4' : 'p-2',
          )}
          aria-label="Main navigation"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const to = item.id === 'dashboard' ? '/' : `/${item.id}`;
            return (
              <NavLink
                key={item.id}
                to={to}
                onClick={close}
                title={!expanded ? item.label : undefined}
                aria-label={!expanded ? item.label : undefined}
                className={({ isActive }) =>
                  cn(
                    'w-full flex items-center min-h-[44px] rounded-lg',
                    'text-sm font-medium transition-all duration-200 group',
                    expanded ? 'gap-3 px-4 py-2.5' : 'justify-center px-2 py-2.5',
                    isActive
                      ? 'bg-primary-50 text-primary-800'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-primary-700',
                  )
                }
              >
                <Icon
                  className="w-5 h-5 text-slate-400 group-hover:text-primary-500 flex-shrink-0"
                  aria-hidden="true"
                />
                {expanded && (
                  <>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    <ChevronRight
                      className="w-4 h-4 text-primary-500 opacity-0 group-data-[active=true]:opacity-100 flex-shrink-0"
                      aria-hidden="true"
                    />
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* ── User footer ──────────────────────────────────────────────────── */}
        <div className={cn(
          'flex-shrink-0 border-t border-slate-100',
          expanded ? 'p-4' : 'p-2',
        )}>
          {expanded ? (
            <>
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg mb-3">
                <div
                  className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm flex-shrink-0"
                  aria-hidden="true"
                >
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{user?.full_name || 'Guest'}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.job_title || 'Employee'}</p>
                </div>
              </div>
              <button
                onClick={() => { signOut(); navigate('/auth'); }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 min-h-[44px] rounded-lg',
                  'text-sm font-medium text-slate-600',
                  'hover:bg-red-50 hover:text-red-600 transition-all duration-200',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                )}
              >
                <LogOut className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm"
                title={user?.full_name || 'Guest'}
              >
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <button
                onClick={() => { signOut(); navigate('/auth'); }}
                title="Sign Out"
                aria-label="Sign Out"
                className={cn(
                  'w-full flex items-center justify-center p-2.5 min-h-[40px] rounded-lg',
                  'text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                )}
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
