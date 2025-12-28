// src/components/layout/MobileBottomNav.jsx
// Chú thích: Bottom navigation bar cho mobile devices - UX tốt hơn hamburger menu
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    MessageCircle,
    Gamepad2,
    Heart,
    Settings,
    Sparkles
} from 'lucide-react';

const navItems = [
    { path: '/app', icon: Home, label: 'Trang chủ' },
    { path: '/chat', icon: MessageCircle, label: 'Trò chuyện' },
    { path: '/wellness', icon: Sparkles, label: 'Wellness' },
    { path: '/games', icon: Gamepad2, label: 'Games' },
    { path: '/settings', icon: Settings, label: 'Cài đặt' },
];

function NavItem({ item, isActive }) {
    return (
        <NavLink
            to={item.path}
            className="flex flex-col items-center justify-center py-2 px-3 relative touch-target"
            aria-label={item.label}
        >
            <motion.div
                className={`p-2 rounded-2xl transition-colors ${isActive
                    ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-500 dark:text-gray-400'
                    }`}
                whileTap={{ scale: 0.9 }}
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.2 }}
            >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </motion.div>

            <motion.span
                className={`text-[10px] mt-1 font-medium transition-colors ${isActive
                    ? 'text-pink-600 dark:text-pink-400'
                    : 'text-gray-500 dark:text-gray-400'
                    }`}
                initial={false}
                animate={{
                    opacity: isActive ? 1 : 0.7,
                    y: isActive ? 0 : 2
                }}
            >
                {item.label}
            </motion.span>

            {/* Active indicator dot */}
            <AnimatePresence>
                {isActive && (
                    <motion.div
                        className="absolute -bottom-1 w-1 h-1 rounded-full bg-pink-500"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />
                )}
            </AnimatePresence>
        </NavLink>
    );
}

export default function MobileBottomNav() {
    const location = useLocation();

    // Không hiển thị trên Landing Page
    if (location.pathname === '/' || location.pathname === '/landing') {
        return null;
    }

    return (
        <>
            {/* Spacer để tránh content bị che bởi nav */}
            <div className="h-20 md:hidden" />

            {/* Bottom Navigation */}
            <motion.nav
                className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                {/* Gradient blur background */}
                <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border-t border-pink-100 dark:border-slate-800" />

                {/* Nav items */}
                <div className="relative flex items-center justify-around px-2 py-1 max-w-lg mx-auto">
                    {navItems.map((item) => (
                        <NavItem
                            key={item.path}
                            item={item}
                            isActive={location.pathname === item.path ||
                                (item.path === '/app' && location.pathname.startsWith('/app'))}
                        />
                    ))}
                </div>

                {/* Safe area padding for iOS */}
                <div className="h-[env(safe-area-inset-bottom)]" />
            </motion.nav>
        </>
    );
}
