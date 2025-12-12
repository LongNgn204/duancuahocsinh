// src/components/layout/AppHeader.jsx
// Chú thích: Modern Header với glassmorphism, animated logo, quick actions
import { Link, useLocation } from 'react-router-dom';
import { Settings, Bell, Menu, X, Sparkles } from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { path: '/', label: 'Trang chủ' },
  { path: '/chat', label: 'Tâm sự' },
  { path: '/breathing', label: 'An yên' },
  { path: '/gratitude', label: 'Biết ơn' },
];

export default function AppHeader() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ path, label }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`
                    px-4 py-2 rounded-xl text-sm font-medium
                    transition-all duration-200
                    ${isActive
                      ? 'bg-[--brand]/10 text-[--brand]'
                      : 'text-[--text-secondary] hover:text-[--text] hover:bg-[--surface-border]'
                    }
                  `}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
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

            {/* Theme Toggle - inline */}
            <ThemeToggle variant="inline" />

            {/* Settings */}
            <Link
              to="/settings"
              className="p-2 rounded-xl text-[--muted] hover:text-[--text] hover:bg-[--surface-border] transition-colors"
              aria-label="Cài đặt"
            >
              <Settings size={20} />
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-xl text-[--muted] hover:text-[--text] hover:bg-[--surface-border] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-[--surface-border] animate-slide-up">
            <div className="flex flex-col gap-1">
              {navItems.map(({ path, label }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      px-4 py-3 rounded-xl text-sm font-medium
                      transition-all duration-200
                      ${isActive
                        ? 'bg-[--brand]/10 text-[--brand]'
                        : 'text-[--text-secondary] hover:text-[--text] hover:bg-[--surface-border]'
                      }
                    `}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
