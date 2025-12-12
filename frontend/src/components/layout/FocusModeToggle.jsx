// src/components/layout/FocusModeToggle.jsx
// Chú thích: Nút bật/tắt chế độ tập trung; khi bật sẽ ẩn Sidebar và center nội dung
import { useFocusMode } from '../../hooks/useFocusMode';

export default function FocusModeToggle() {
  const { focusMode, toggle } = useFocusMode();
  return (
    <button
      onClick={toggle}
      className="fixed top-4 right-4 z-50 px-4 py-2 rounded-full bg-accent text-gray-900 shadow hover:opacity-90 transition"
      aria-pressed={focusMode}
    >
      {focusMode ? '🎯 Focus ON' : '🌈 Focus OFF'}
    </button>
  );
}

