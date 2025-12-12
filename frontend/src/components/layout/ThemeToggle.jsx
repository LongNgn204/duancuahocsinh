// src/components/layout/ThemeToggle.jsx
// Chú thích: Nút bật/tắt dark mode dựa trên data-theme, dùng useTheme hook
import { useTheme } from '../../hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      onClick={toggle}
      className="fixed top-4 right-36 md:right-36 z-50 px-3 py-2 rounded-full bg-white/80 border text-gray-800 shadow hover:bg-gray-50"
      aria-pressed={isDark}
      aria-label="Bật/tắt dark mode"
    >
      {isDark ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}

