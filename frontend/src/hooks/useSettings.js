// src/hooks/useSettings.js
// Chú thích: Quản lý cài đặt người dùng (font size scale, language), persist localStorage
import { useEffect, useState } from 'react';

const KEY = 'settings_v1';

const DEFAULTS = {
  fontScale: 1, // 0.95 | 1 | 1.1
  lang: 'vi', // 'vi' | 'en'
};

export function useSettings() {
  const [settings, setSettings] = useState(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const s = raw ? JSON.parse(raw) : DEFAULTS;
      setSettings({ ...DEFAULTS, ...(s || {}) });
    } catch (_) {}
  }, []);

  // Apply CSS var for font size scale
  useEffect(() => {
    try {
      document.documentElement.style.setProperty('--fs-scale', String(settings.fontScale ?? 1));
      localStorage.setItem(KEY, JSON.stringify(settings));
    } catch (_) {}
  }, [settings]);

  const setFontScale = (v) => setSettings((s) => ({ ...s, fontScale: v }));
  const setLang = (v) => setSettings((s) => ({ ...s, lang: v }));

  return { settings, setFontScale, setLang };
}

