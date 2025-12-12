// src/hooks/useSettings.js
// Chú thích: Quản lý cài đặt người dùng (font size, language, notifications, sounds), persist localStorage
import { useEffect, useState } from 'react';

const KEY = 'settings_v1';

const DEFAULTS = {
  fontScale: 1,        // 0.9 | 0.95 | 1 | 1.1 | 1.2
  lang: 'vi',          // 'vi' | 'en'
  notifications: true, // Nhắc nhở hàng ngày
  soundEffects: true,  // Hiệu ứng âm thanh
};

export function useSettings() {
  const [settings, setSettings] = useState(DEFAULTS);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const s = raw ? JSON.parse(raw) : DEFAULTS;
      setSettings({ ...DEFAULTS, ...(s || {}) });
    } catch (_) { }
  }, []);

  // Apply CSS var và save to localStorage khi settings thay đổi
  useEffect(() => {
    try {
      document.documentElement.style.setProperty('--fs-scale', String(settings.fontScale ?? 1));
      localStorage.setItem(KEY, JSON.stringify(settings));
    } catch (_) { }
  }, [settings]);

  // Setters
  const setFontScale = (v) => setSettings((s) => ({ ...s, fontScale: v }));
  const setLang = (v) => setSettings((s) => ({ ...s, lang: v }));
  const setNotifications = (v) => setSettings((s) => ({ ...s, notifications: v }));
  const setSoundEffects = (v) => setSettings((s) => ({ ...s, soundEffects: v }));

  // Reset all
  const resetSettings = () => {
    setSettings(DEFAULTS);
    try {
      localStorage.setItem(KEY, JSON.stringify(DEFAULTS));
    } catch (_) { }
  };

  return {
    settings,
    setFontScale,
    setLang,
    setNotifications,
    setSoundEffects,
    resetSettings,
  };
}
