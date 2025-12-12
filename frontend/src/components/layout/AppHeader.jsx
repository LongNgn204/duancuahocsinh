// src/components/layout/AppHeader.jsx
// Chú thích: Thanh Header ứng dụng: brand + ThemeToggle + placeholder Settings
import ThemeToggle from './ThemeToggle';
import { Link } from 'react-router-dom';

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-40 bg-[--surface]/90 backdrop-blur border-b border-[--surface-border]">
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand" />
          <div className="font-semibold tracking-[-0.01em] text-brand">Bạn Đồng Hành</div>
        </Link>
        <nav className="flex items-center gap-3">
          <Link to="/settings" className="text-sm text-gray-700 hover:text-brand">Cài đặt</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

