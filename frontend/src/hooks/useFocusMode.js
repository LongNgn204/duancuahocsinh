// hooks/useFocusMode.js
// Chú thích: State đơn giản cho Focus Mode dùng zustand để bật/tắt nhanh
import { create } from 'zustand';

export const useFocusMode = create((set) => ({
  focusMode: false,
  toggle: () => set((s) => ({ focusMode: !s.focusMode })),
}));

