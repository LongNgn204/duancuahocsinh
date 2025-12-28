// src/components/layout/MobileNav.jsx
// Chú thích: Modern mobile bottom navigation với floating AI button và nút SOS
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Heart, Sparkles, Gamepad2, Bot, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SOSOverlay from '../sos/SOSOverlay';

// Navigation items - Chat/AI được tách ra làm nút nổi bật ở giữa
const leftItems = [
  { to: '/app', label: 'Trang chủ', icon: Home },
  { to: '/breathing', label: 'An yên', icon: Heart },
];

const rightItems = [
  { to: '/gratitude', label: 'Biết ơn', icon: Sparkles },
  { to: '/games', label: 'Giải trí', icon: Gamepad2 },
];

function NavItem({ to, label, icon: Icon, isActive }) {
  return (
    <NavLink
      to={to}
      className={`
        flex flex-col items-center gap-1 
        px-3 py-2.5 rounded-xl relative
        transition-all duration-200
        min-w-[48px] min-h-[48px]
        ${isActive
          ? 'text-[--brand]'
          : 'text-[--muted] active:scale-95'
        }
      `}
      aria-label={label}
    >
      {/* Background pill for active state */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            layoutId="nav-pill"
            className="absolute inset-0 bg-[--brand]/10 rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Icon */}
      <div className={`
        relative z-10 transition-transform duration-200
        ${isActive ? 'scale-110' : ''}
      `}>
        <Icon
          size={24}
          strokeWidth={isActive ? 2.5 : 2}
          className={isActive ? 'drop-shadow-sm' : ''}
        />
      </div>

      {/* Label */}
      <span className={`
        relative z-10 text-[11px] font-medium
        ${isActive ? 'font-semibold' : ''}
      `}>
        {label}
      </span>
    </NavLink>
  );
}

export default function MobileNav() {
  const location = useLocation();
  const [sosOpen, setSosOpen] = useState(false);

  const isActive = (to) => {
    if (to === '/app') {
      return location.pathname === '/app' || location.pathname === '/';
    }
    return location.pathname === to || location.pathname.startsWith(to);
  };

  const isChatActive = isActive('/chat');

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-4 right-4 z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="relative">
          {/* Main nav bar */}
          <div className="glass-strong rounded-2xl shadow-xl shadow-black/10 px-2 py-2">
            <ul className="flex justify-around items-center">
              {/* Left items */}
              {leftItems.map(({ to, label, icon }) => (
                <li key={to}>
                  <NavItem to={to} label={label} icon={icon} isActive={isActive(to)} />
                </li>
              ))}

              {/* Center spacer for floating button */}
              <li className="w-16" />

              {/* Right items */}
              {rightItems.map(({ to, label, icon }) => (
                <li key={to}>
                  <NavItem to={to} label={label} icon={icon} isActive={isActive(to)} />
                </li>
              ))}
            </ul>
          </div>

          {/* Floating AI Chat Button - Center */}
          <NavLink
            to="/chat"
            className="absolute left-1/2 -translate-x-1/2 -top-6"
            aria-label="Trò chuyện"
          >
            <motion.div
              className={`
                relative w-16 h-16 rounded-full
                flex items-center justify-center
                shadow-xl
                transition-all duration-300
                ${isChatActive
                  ? 'bg-gradient-to-br from-[--brand] to-[--brand-light] shadow-[--brand]/30'
                  : 'bg-gradient-to-br from-[--brand] to-[--brand-light] shadow-[--brand]/20'
                }
              `}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Pulse ring effect */}
              <motion.div
                className="absolute inset-0 rounded-full bg-[--brand]"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />

              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />

              {/* Icon */}
              <div className="relative z-10 flex flex-col items-center">
                <Bot size={26} className="text-white" strokeWidth={2} />
                <span className="text-[8px] font-bold text-white/90 mt-0.5">AI</span>
              </div>

              {/* Active indicator ring */}
              {isChatActive && (
                <motion.div
                  className="absolute -inset-1 rounded-full border-2 border-[--brand]"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                />
              )}
            </motion.div>
          </NavLink>

          {/* Chú thích: Nút SOS nhỏ bên phải trên nav bar */}
          <button
            onClick={() => setSosOpen(true)}
            className="absolute right-3 -top-4 w-10 h-10 rounded-full
              bg-gradient-to-br from-red-500 to-rose-500
              flex items-center justify-center
              shadow-lg shadow-red-500/30
              active:scale-95 transition-transform"
            aria-label="Hỗ trợ khẩn cấp"
          >
            <AlertTriangle size={18} className="text-white" />
          </button>
        </div>
      </nav>

      {/* SOS Overlay */}
      <SOSOverlay isOpen={sosOpen} onClose={() => setSosOpen(false)} riskLevel="high" />
    </>
  );
}
