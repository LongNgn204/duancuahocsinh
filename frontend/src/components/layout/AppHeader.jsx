// src/components/layout/AppHeader.jsx
// Chú thích: Simplified Header - chỉ logo và notification bell
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/app" className="flex items-center gap-3 group">
            <div className="relative">
              <img
                src="/logo.png"
                alt="Bạn Đồng Hành"
                className="w-10 h-10 rounded-xl shadow-lg shadow-[--brand]/20 group-hover:shadow-xl group-hover:shadow-[--brand]/30 transition-all duration-300 object-cover"
              />
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-lg gradient-text tracking-tight">Bạn Đồng Hành</div>
              <div className="text-[10px] text-[--muted] -mt-1">Hỗ trợ Tâm lý Học đường</div>
            </div>
          </Link>

          {/* Right Actions - chỉ notification và theme */}
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <button
              className="relative p-2 rounded-xl text-[--muted] hover:text-[--text] hover:bg-[--surface-border] transition-colors"
              aria-label="Thông báo"
            >
              <Bell size={20} />
              {/* Notification dot */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[--accent] rounded-full" />
            </button>

            {/* Theme Toggle */}
            <ThemeToggle variant="inline" />
          </div>
        </div>
      </div>
    </header>
  );
}
