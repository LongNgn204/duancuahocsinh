// src/hooks/useTheme.js
// Chú thích: Hook quản lý dark/light theme qua data-theme trên <html>, persist localStorage
import { useEffect, useState } from 'react';

const KEY = 'theme_v1';

export function useTheme() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === 'dark' || saved === 'light') setTheme(saved);
    } catch (_) {}
  }, []);

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(KEY, theme);
    } catch (_) {}
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return { theme, toggle };
}
