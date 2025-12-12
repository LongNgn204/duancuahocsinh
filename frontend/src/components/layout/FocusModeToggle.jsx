// src/components/layout/FocusModeToggle.jsx
// Chú thích: Focus Mode FAB với glow effect
import { useFocusMode } from '../../hooks/useFocusMode';
import { Focus, Minimize2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FocusModeToggle() {
  const { focusMode, toggle } = useFocusMode();

  return (
    <motion.button
      onClick={toggle}
      className={`
        fixed bottom-24 md:bottom-6 right-20 md:right-20 z-40
        w-12 h-12 rounded-full
        flex items-center justify-center
        transition-all duration-300
        ${focusMode
          ? 'bg-gradient-to-r from-[--brand] to-[--brand-light] text-white shadow-lg shadow-[--brand]/30'
          : 'glass-strong shadow-lg hover:shadow-xl'
        }
      `}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-pressed={focusMode}
      aria-label={focusMode ? 'Tắt Focus Mode' : 'Bật Focus Mode'}
    >
      {/* Pulse ring when focus mode is on */}
      {focusMode && (
        <motion.div
          className="absolute inset-0 rounded-full bg-[--brand]"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      <motion.div
        initial={false}
        animate={{ rotate: focusMode ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {focusMode ? (
          <Minimize2 size={22} />
        ) : (
          <Focus size={22} className="text-[--brand]" />
        )}
      </motion.div>
    </motion.button>
  );
}
