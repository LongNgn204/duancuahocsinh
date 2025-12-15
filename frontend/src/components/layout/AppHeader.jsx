// src/components/layout/AppHeader.jsx
// Chú thích: Header với logo, notification, user auth button
import { Link } from 'react-router-dom';
import { Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function AppHeader() {
  const { user, isLoggedIn, openAuthModal, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Logo - Thêm padding-left trên mobile để tránh đè vào nút sidebar (nút ở top-20) */}
          <Link to="/app" className="flex items-center gap-3 group pl-14 md:pl-0">
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

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* User Button */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[--surface-border] rounded-full">
                  <User size={16} className="text-[--brand]" />
                  <span className="text-sm font-medium">{user?.username}</span>
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
                className="flex items-center gap-2 px-3 py-1.5 bg-[--brand]/20 text-[--brand] rounded-full hover:bg-[--brand]/30 transition-colors text-sm font-medium"
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
