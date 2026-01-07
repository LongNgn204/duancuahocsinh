// src/components/layout/Sidebar.jsx
// Chú thích: Sidebar v4.6 - Thêm tất cả games vào mục Thư giãn
import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Home, Heart, Bot, Gamepad2, Sparkles,
  BookOpenCheck, Timer, Library, Settings, Moon,
  ChevronLeft, ChevronRight, BarChart3, Trophy,
  Shield, Star, Menu, X, Bell, AlertTriangle, Phone,
  MousePointer2, Coffee, Brain, Palette
} from 'lucide-react';
import SOSOverlay from '../sos/SOSOverlay';

const sections = [
  {
    label: 'Chính',
    items: [
      { icon: Home, label: 'Trang chủ', path: '/app' },
      { icon: Bot, label: 'Trò chuyện', path: '/chat' },
      { icon: Phone, label: 'Gọi điện AI', path: '/voice-call', badge: 'Mới' },
    ],
  },
  {
    label: 'Sức khỏe tinh thần',
    items: [
      { icon: Sparkles, label: 'Liều thuốc tinh thần', path: '/wellness' },
      { icon: Heart, label: 'Góc An Yên', path: '/breathing' },
      { icon: Brain, label: 'Góc Kiến Thức', path: '/knowledge-hub' },
      { icon: Star, label: 'Lọ Biết Ơn', path: '/gratitude' },
      { icon: Timer, label: 'Góc Nhỏ', path: '/corner' },
      { icon: Shield, label: 'SOS', path: '/emergency', badge: 'SOS' },
    ],
  },
  // Chú thích: Gom tất cả games vào một dashboard "Trò Chơi", Bảng Màu Cảm Xúc để riêng
  {
    label: 'Thư giãn',
    items: [
      { icon: BookOpenCheck, label: 'Kể Chuyện', path: '/stories' },
      { icon: Gamepad2, label: 'Trò Chơi', path: '/games' },
      { icon: Palette, label: 'Bảng Màu Cảm Xúc', path: '/games/emotion-palette' },
    ],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);

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
          w-72 sm:w-64 ${collapsed ? 'md:w-16' : 'md:w-52 lg:w-60'}
        shrink-0 
        glass-strong
        border-r border-[--surface-border]
          md:h-screen md:sticky md:top-16 
          fixed top-16 bottom-0 left-0
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

        {/* Mobile Close Button - Larger touch target */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden absolute top-3 right-3 p-3 min-w-[44px] min-h-[44px] rounded-xl bg-[--surface-border]/50 hover:bg-[--surface-border] transition-colors flex items-center justify-center"
          aria-label="Đóng sidebar"
        >
          <X size={20} />
        </button>

        {/* Scrollable content area with mobile-optimized padding */}
        <div className="flex-1 overflow-y-auto py-4 px-3 sm:px-3 pt-14 md:pt-4">
          {/* Brand - Only show when not collapsed */}
          {!collapsed && (
            <div className="px-2 mb-4 md:mb-6">
              <div className="text-sm uppercase tracking-wider text-[--brand] font-bold">
                Bạn Đồng Hành
              </div>
            </div>
          )}

          {/* Navigation Sections */}
          {sections.map((sec, secIdx) => (
            <div key={sec.label} className={secIdx > 0 ? 'mt-4 md:mt-6' : ''}>
              {/* Section Label */}
              {!collapsed && (
                <div className="px-2 md:px-3 mb-1.5 md:mb-2 text-xs md:text-sm uppercase tracking-wide text-[--text-secondary] font-semibold">
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
                    ${collapsed ? 'md:justify-center md:px-2' : 'px-3 sm:px-3'} 
                    py-3 sm:py-2.5 md:py-2.5 rounded-xl
                    min-h-[44px]
                    transition-all duration-200
                    group
                    ${isActive
                        ? 'bg-gradient-to-r from-[--brand]/15 to-[--brand]/5 text-[--brand] shadow-sm'
                        : 'text-[--text-secondary] hover:bg-[--surface-border] hover:text-[--text] active:scale-[0.98]'
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
                          <Icon size={20} className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5" />
                        </div>
                        {/* Chú thích: Trên mobile luôn hiện label, trên desktop ẩn khi collapsed */}
                        <span className={`truncate text-base sm:text-sm md:text-base font-medium ${isActive ? 'font-semibold text-[--brand]' : 'text-[--text]'} ${collapsed ? 'md:hidden' : ''}`}>
                          {label}
                        </span>
                        {/* Badge for new items */}
                        {badge && (
                          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full bg-[--accent] text-white font-semibold ${collapsed ? 'md:hidden' : ''}`}>
                            {badge}
                          </span>
                        )}
                        {/* Active indicator */}
                        {isActive && !badge && (
                          <div className={`ml-auto w-1.5 h-1.5 rounded-full bg-[--brand] animate-pulse ${collapsed ? 'md:hidden' : ''}`} />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>

            </div>
          ))}
        </div>

        {/* Footer - SOS + Settings */}
        <div className="p-3 sm:p-3 border-t border-[--surface-border] space-y-2">
          {/* Chú thích: Nút Hỗ trợ khẩn cấp - Màu đỏ nổi bật */}
          <button
            onClick={() => setSosOpen(true)}
            title={collapsed ? 'Hỗ trợ khẩn cấp' : undefined}
            className={`
              w-full flex items-center gap-3 
              ${collapsed ? 'md:justify-center' : ''} 
              px-3 py-3 sm:py-2.5 rounded-xl
              min-h-[48px]
              bg-gradient-to-r from-red-500 to-rose-500
              text-white font-semibold
              hover:from-red-600 hover:to-rose-600
              transition-all duration-200
              shadow-lg shadow-red-500/20
              hover:shadow-red-500/30
              active:scale-[0.98]
            `}
          >
            <AlertTriangle size={22} className="sm:w-5 sm:h-5 shrink-0" />
            <span className={`text-base sm:text-base ${collapsed ? 'md:hidden' : ''}`}>Hỗ trợ khẩn cấp</span>
          </button>

          <NavLink
            to="/settings"
            title={collapsed ? 'Cài đặt' : undefined}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `
            flex items-center gap-3 
            ${collapsed ? 'md:justify-center' : ''} 
            px-3 py-3 sm:py-2.5 rounded-xl
            min-h-[44px]
            transition-all duration-200
            active:scale-[0.98]
            ${isActive
                ? 'bg-[--brand]/10 text-[--brand]'
                : 'text-[--text-secondary] hover:bg-[--surface-border] hover:text-[--text]'
              }
          `}
          >
            <Settings size={22} className="sm:w-5 sm:h-5 shrink-0" />
            <span className={`text-base sm:text-base font-medium text-[--text] ${collapsed ? 'md:hidden' : ''}`}>Cài đặt</span>
          </NavLink>
        </div>
      </aside>

      {/* SOS Overlay */}
      <SOSOverlay isOpen={sosOpen} onClose={() => setSosOpen(false)} riskLevel="high" />
    </>
  );
}
