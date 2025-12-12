// src/utils/storage.js
// Chú thích: Helpers lưu/đọc thông tin phiên làm việc (vd: tên user) từ localStorage
const KEY = 'user';

export const saveSession = (user) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(user ?? {}));
  } catch (_e) {
    // no-op: tránh crash nếu storage bị chặn
  }
};

export const getSession = () => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_e) {
    return {};
  }
};

