// src/components/layout/Sidebar.jsx
// Chú thích: Sidebar v4.2 - Thêm Journey (Hành trình XP)
import { NavLink } from 'react-router-dom';
import {
  Home, Heart, Bot, Gamepad2, Sparkles,
  BookOpenCheck, Timer, Library, Settings, Moon,
  ChevronLeft, ChevronRight, BarChart3, Trophy,
  Shield, Star, Menu, X, Bell
} from 'lucide-react';
import { useState, useEffect } from 'react';

const sections = [
  {
    label: 'Chính',
    items: [
      { icon: Home, label: 'Trang chủ', path: '/app' },
      { icon: Bot, label: 'Tâm sự với AI', path: '/chat' },
      { icon: BarChart3, label: 'Thống kê', path: '/analytics' },
    ],
  },

  {
    label: 'Sức khỏe',
    items: [
      { icon: Heart, label: 'Góc An Yên', path: '/breathing' },
      { icon: Sparkles, label: 'Lọ Biết Ơn', path: '/gratitude' },
      { icon: Timer, label: 'Hẹn giờ Tập trung', path: '/focus' },
      { icon: BookOpenCheck, label: 'Nhật ký', path: '/journal' },
      { icon: Moon, label: 'Hỗ trợ giấc ngủ', path: '/sleep' },
    ],
  },
  {
    label: 'Thư giãn',
    items: [
      { icon: Gamepad2, label: 'Trò chơi', path: '/games' },
      { icon: Trophy, label: 'Thành tích', path: '/achievements' },
      { icon: Star, label: 'Hành trình', path: '/journey', badge: 'Mới' },
      { icon: Bell, label: 'Góc Nhỏ', path: '/corner' },
    ],
  },
  {
    label: 'Học tập',
    items: [
      { icon: Library, label: 'Thư viện', path: '/resources' },
    ],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar when route changes + listen for toggle events from header
  useEffect(() => {
    const handleRouteChange = () => setMobileOpen(false);
    const handleToggle = () => setMobileOpen(prev => !prev);
    const handleClose = () => setMobileOpen(false);

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('toggle-sidebar', handleToggle);
    window.addEventListener('close-sidebar', handleClose);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('toggle-sidebar', handleToggle);
      window.removeEventListener('close-sidebar', handleClose);
    };
  }, []);

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

    <aside
      className={`
          flex flex-col
          ${collapsed ? 'w-20' : 'w-64 md:w-56 lg:w-64'}
        shrink-0 
        glass-strong
        border-r border-[--surface-border]
          h-screen fixed md:sticky md:top-16 top-0
        transition-all duration-300 ease-out
          z-40
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
        {/* Collapse Toggle - Desktop only */}
      <button
        onClick={() => setCollapsed(!collapsed)}
          className="hidden md:block absolute -right-3 top-6 z-10 p-1.5 rounded-full bg-[--surface] border border-[--surface-border] shadow-sm hover:shadow-md transition-all"
        aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

        {/* Mobile Close Button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden absolute top-4 right-4 p-2 rounded-xl hover:bg-[--surface-border] transition-colors"
          aria-label="Đóng sidebar"
        >
          <X size={20} />
        </button>

      <div className="flex-1 overflow-y-auto py-6 px-3">
        {/* Brand - Only show when not collapsed */}
        {!collapsed && (
          <div className="px-3 mb-6">
            <div className="text-sm uppercase tracking-wider text-[--text-secondary] font-semibold">
              Bạn Đồng Hành
            </div>
          </div>
        )}

        {/* Navigation Sections */}
        {sections.map((sec, secIdx) => (
          <div key={sec.label} className={secIdx > 0 ? 'mt-6' : ''}>
            {/* Section Label */}
            {!collapsed && (
              <div className="px-3 mb-2 text-sm uppercase tracking-wide text-[--text-secondary] font-semibold">
                {sec.label}
              </div>
            )}

            {/* Section Items */}
            <nav className="space-y-1">
              {sec.items.map(({ icon: Icon, label, path, badge }) => (
                <NavLink
                  key={path}
                  to={path}
                  title={collapsed ? label : undefined}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 
                    ${collapsed ? 'justify-center px-3' : 'px-3'} 
                    py-2.5 rounded-xl
                    transition-all duration-200
                    group
                    ${isActive
                      ? 'bg-gradient-to-r from-[--brand]/15 to-[--brand]/5 text-[--brand] shadow-sm'
                      : 'text-[--text-secondary] hover:bg-[--surface-border] hover:text-[--text]'
                    }
                  `}
                  end={path === '/'}
                >
                  {({ isActive }) => (
                    <>
                      <div className={`
                        shrink-0 
                        transition-transform duration-200 
                        group-hover:scale-110
                        ${isActive ? 'text-[--brand]' : ''}
                      `}>
                        <Icon size={20} />
                      </div>
                      {!collapsed && (
                        <span className={`truncate text-base font-medium ${isActive ? 'font-semibold text-[--brand]' : 'text-[--text]'}`}>
                          {label}
                        </span>
                      )}
                      {/* Badge for new items */}
                      {badge && !collapsed && (
                        <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-[--accent] text-white font-semibold">
                          {badge}
                        </span>
                      )}
                      {/* Active indicator */}
                      {isActive && !collapsed && !badge && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[--brand] animate-pulse" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

          </div>
        ))}
      </div>

      {/* Footer - Settings */}
      <div className="p-3 border-t border-[--surface-border]">
        <NavLink
          to="/settings"
          title={collapsed ? 'Cài đặt' : undefined}
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) => `
            flex items-center gap-3 
            ${collapsed ? 'justify-center' : ''} 
            px-3 py-2.5 rounded-xl
            transition-all duration-200
            ${isActive
              ? 'bg-[--brand]/10 text-[--brand]'
              : 'text-[--text-secondary] hover:bg-[--surface-border] hover:text-[--text]'
            }
          `}
        >
          <Settings size={20} />
          {!collapsed && <span className="text-base font-medium text-[--text]">Cài đặt</span>}
        </NavLink>
      </div>
    </aside>
    </>
  );
}
