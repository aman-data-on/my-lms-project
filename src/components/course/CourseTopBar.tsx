import { Bell, ChevronDown, HelpCircle, Menu, User } from 'lucide-react';

const ACCENT = '#ED3237';

// Top bar for the main workspace: sidebar toggle (mobile), programme name,
// overall progress, and account actions. Height matches the sidebar brand band.
export function CourseTopBar({
  courseTitle,
  overallPercent,
  onMenu,
}: {
  courseTitle: string;
  overallPercent: number;
  onMenu: () => void;
}) {
  return (
    <header className="flex-shrink-0 h-16 bg-white border-b border-[#E6E5E0] flex items-center gap-3 px-4 lg:px-6">
      <button
        onClick={onMenu}
        aria-label="Open module menu"
        className="lg:hidden flex-shrink-0 w-9 h-9 rounded-lg border border-[#E6E5E0] flex items-center justify-center text-[#5E555A] hover:bg-[#F2F1ED] active:scale-95 transition-[background-color,transform] duration-150 ease-out motion-reduce:transition-none motion-reduce:active:scale-100"
      >
        <Menu className="w-5 h-5" />
      </button>

      <span className="text-[15px] font-bold text-[#221B1D] truncate">{courseTitle}</span>

      <div className="ml-auto flex items-center gap-3 lg:gap-5 min-w-0">
        {/* Overall course progress */}
        <div className="hidden sm:flex items-center gap-2.5">
          <span className="text-[12px] text-[#6B6E76] whitespace-nowrap">Course progress</span>
          <div className="w-24 lg:w-32 h-1.5 rounded-full bg-[#EFE4E2] overflow-hidden">
            <div className="h-full rounded-full transition-[width] duration-300" style={{ width: `${overallPercent}%`, background: ACCENT }} />
          </div>
          <span className="text-[12px] font-semibold tabular-nums" style={{ color: ACCENT }}>{overallPercent}%</span>
        </div>

        <span className="hidden lg:block w-px h-6 bg-[#E6E5E0]" aria-hidden="true" />

        {/* Account actions */}
        <div className="flex items-center gap-1">
          <button aria-label="Help" className="hidden sm:flex w-9 h-9 rounded-lg items-center justify-center text-[#6B6E76] hover:bg-[#F2F1ED] active:scale-95 transition-[background-color,transform] duration-150 ease-out motion-reduce:transition-none motion-reduce:active:scale-100">
            <HelpCircle className="w-5 h-5" />
          </button>
          <button aria-label="Notifications" className="hidden sm:flex w-9 h-9 rounded-lg items-center justify-center text-[#6B6E76] hover:bg-[#F2F1ED] active:scale-95 transition-[background-color,transform] duration-150 ease-out motion-reduce:transition-none motion-reduce:active:scale-100">
            <Bell className="w-5 h-5" />
          </button>
          <button aria-label="Account" className="flex items-center gap-1 pl-1 rounded-lg hover:bg-[#F2F1ED] active:scale-95 transition-[background-color,transform] duration-150 ease-out motion-reduce:transition-none motion-reduce:active:scale-100 py-1 pr-1.5">
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ background: ACCENT }} aria-hidden="true">
              <User className="w-4 h-4" />
            </span>
            <ChevronDown className="w-4 h-4 text-[#6B6E76]" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
