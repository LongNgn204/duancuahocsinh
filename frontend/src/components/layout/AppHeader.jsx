// src/components/layout/AppHeader.jsx
// Chú thích: Header với logo, notification, user auth button
import { Link } from 'react-router-dom';
import { Bell, User, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function AppHeader() {
  const { user, isLoggedIn, openAuthModal, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="h-16 flex items-center justify-between gap-3">
          {/* Mobile Sidebar Toggle */}
          <button
            className="md:hidden p-2 rounded-xl bg-[--surface] border border-[--surface-border] shadow-sm hover:shadow-md transition-all"
            aria-label="Mở/Đóng sidebar"
            onClick={() => window.dispatchEvent(new Event('toggle-sidebar'))}
          >
            <Menu size={20} />
          </button>

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
              <div className="text-xs text-[--text-secondary] -mt-0.5 font-medium">Trường học Hạnh phúc</div>
            </div>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* User Button */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[--surface-border] rounded-full">
                  <User size={16} className="text-[--brand]" />
                  <span className="text-base font-semibold text-[--text]">{user?.username}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-[--muted] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  aria-label="Đăng xuất"
                  title="Đăng xuất"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-2 px-3 py-1.5 bg-[--brand]/20 text-[--brand] rounded-full hover:bg-[--brand]/30 transition-colors text-base font-semibold"
              >
                <User size={16} />
                <span className="hidden sm:inline">Đăng nhập</span>
              </button>
            )}

            {/* Notification Bell */}
            <button
              className="relative p-2 rounded-xl text-[--muted] hover:text-[--text] hover:bg-[--surface-border] transition-colors"
              aria-label="Thông báo"
            >
              <Bell size={20} />
              {/* Notification dot */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[--accent] rounded-full" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
