// src/components/layout/ThemeToggle.jsx
// Chú thích: Modern theme toggle với smooth sun/moon animation
import { useTheme } from '../../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemeToggle({ variant = 'floating' }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  // Inline variant (for header)
  if (variant === 'inline') {
    return (
      <button
        onClick={toggle}
        className="p-2 rounded-xl hover:bg-[--surface-border] transition-all duration-200"
        aria-pressed={isDark}
        aria-label={isDark ? 'Chuyển sang Light mode' : 'Chuyển sang Dark mode'}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isDark ? 'moon' : 'sun'}
            initial={{ y: -20, opacity: 0, rotate: -30 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: 30 }}
            transition={{ duration: 0.2 }}
          >
            {isDark ? (
              <Moon size={20} className="text-[--accent]" />
            ) : (
              <Sun size={20} className="text-[--accent]" />
            )}
          </motion.div>
        </AnimatePresence>
      </button>
    );
  }

  // Floating variant (fixed position)
  return (
    <motion.button
      onClick={toggle}
      className="
        fixed bottom-24 md:bottom-6 right-6 z-40
        w-12 h-12 rounded-full
        glass-strong shadow-lg
        flex items-center justify-center
        hover:scale-110 active:scale-95
        transition-transform duration-200
      "
      whileHover={{ boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}
      aria-pressed={isDark}
      aria-label={isDark ? 'Chuyển sang Light mode' : 'Chuyển sang Dark mode'}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? 'moon' : 'sun'}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ duration: 0.3 }}
        >
          {isDark ? (
            <Moon size={22} className="text-[--accent]" />
          ) : (
            <Sun size={22} className="text-[--accent]" />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}
