// src/components/layout/Sidebar.jsx
// Chú thích: Sidebar v4.0 - Full navigation với tất cả features
import { NavLink } from 'react-router-dom';
import {
  Home, Heart, MessageCircle, Gamepad2, Sparkles,
  BookOpenCheck, Timer, Library, Settings, Moon,
  ChevronLeft, ChevronRight, BarChart3, Trophy
} from 'lucide-react';
import { useState } from 'react';

const sections = [
  {
    label: 'Chính',
    items: [
      { icon: Home, label: 'Trang chủ', path: '/app' },
      { icon: MessageCircle, label: 'Tâm sự (Chat)', path: '/chat' },
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

  return (
    <aside
      className={`
        hidden md:flex flex-col
        ${collapsed ? 'w-20' : 'w-64'}
        shrink-0 
        glass-strong
        border-r border-[--surface-border]
        md:h-screen md:sticky md:top-16
        transition-all duration-300 ease-out
      `}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 z-10 p-1.5 rounded-full bg-[--surface] border border-[--surface-border] shadow-sm hover:shadow-md transition-all"
        aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className="flex-1 overflow-y-auto py-6 px-3">
        {/* Brand - Only show when not collapsed */}
        {!collapsed && (
          <div className="px-3 mb-6">
            <div className="text-xs uppercase tracking-widest text-[--muted] font-semibold">
              Bạn Đồng Hành
            </div>
          </div>
        )}

        {/* Navigation Sections */}
        {sections.map((sec, secIdx) => (
          <div key={sec.label} className={secIdx > 0 ? 'mt-6' : ''}>
            {/* Section Label */}
            {!collapsed && (
              <div className="px-3 mb-2 text-xs uppercase tracking-wide text-[--muted] font-medium">
                {sec.label}
              </div>
            )}

            {/* Section Items */}
            <nav className="space-y-1">
              {sec.items.map(({ icon: Icon, label, path }) => (
                <NavLink
                  key={path}
                  to={path}
                  title={collapsed ? label : undefined}
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
                        <span className={`truncate text-sm font-medium ${isActive ? 'font-semibold' : ''}`}>
                          {label}
                        </span>
                      )}
                      {/* Active indicator */}
                      {isActive && !collapsed && (
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
          {!collapsed && <span className="text-sm font-medium">Cài đặt</span>}
        </NavLink>
      </div>
    </aside>
  );
}
