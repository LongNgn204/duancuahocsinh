// src/components/layout/Sidebar.jsx
// Chú thích: Sidebar v2.5 – chia section rõ ràng cho HS Việt Nam
import { NavLink } from 'react-router-dom';
import { Home, Heart, MessageCircle, Gamepad2, Sparkles, BookOpenCheck, Timer, ListChecks, Library } from 'lucide-react';

const sections = [
  {
    label: 'Học tập',
    items: [
      { icon: MessageCircle, label: 'Tâm sự (Chat)', path: '/chat' },
      { icon: BookOpenCheck, label: 'Language Coach', path: '/language' },
      { icon: Library, label: 'Tài nguyên', path: '/resources' },
    ],
  },
  {
    label: 'Wellbeing',
    items: [
      { icon: Heart, label: 'Góc An Yên (Thở)', path: '/breathing' },
      { icon: Sparkles, label: 'Biết ơn', path: '/gratitude' },
      { icon: Timer, label: 'Focus Timer', path: '/focus' },
    ],
  },
  {
    label: 'Tiện ích',
    items: [
      { icon: ListChecks, label: 'Study Planner', path: '/planner' },
      { icon: Gamepad2, label: 'Giải trí', path: '/games' },
      { icon: Home, label: 'Cài đặt', path: '/settings' },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:block w-64 shrink-0 bg-[--surface] text-[--text] border-r border-[--surface-border] p-4 md:h-screen md:sticky md:top-0">
      <div className="font-semibold text-brand tracking-[-0.01em] text-xl mb-4">Bạn Đồng Hành</div>

      {sections.map((sec) => (
        <div key={sec.label} className="mb-4">
          <div className="px-2 text-xs uppercase tracking-wide text-[--muted] mb-2">{sec.label}</div>
          <nav className="space-y-1">
            {sec.items.map(({ icon: Icon, label, path }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                    isActive ? 'bg-brand/10 text-brand font-medium shadow-sm' : 'hover:bg-[--surface]/80 text-[--text]'
                  }`
                }
                end={path === '/'}
              >
                <Icon size={18} />
                <span className="truncate">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      ))}
    </aside>
  );
}
