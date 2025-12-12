// src/components/layout/MobileNav.jsx
// Chú thích: Thanh điều hướng đơn giản cho mobile (ẩn trên md trở lên)
import { NavLink } from 'react-router-dom';
import { Home, Heart, MessageCircle, Gamepad2, Sparkles } from 'lucide-react';

const items = [
  { to: '/', label: 'Trang chủ', icon: Home },
  { to: '/breathing', label: 'An yên', icon: Heart },
  { to: '/chat', label: 'Tâm sự', icon: MessageCircle },
  { to: '/gratitude', label: 'Biết ơn', icon: Sparkles },
  { to: '/games', label: 'Giải trí', icon: Gamepad2 },
];

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur border-t border-gray-200">
      <ul className="flex justify-around py-2">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center px-2 py-1 text-xs transition-colors duration-200 ${
                  isActive ? 'text-gray-900 font-medium' : 'text-gray-700 hover:text-gray-900'
                }`
              }
              end={to === '/'}
              aria-label={label}
            >
              <Icon size={20} />
              <span className="mt-1">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

