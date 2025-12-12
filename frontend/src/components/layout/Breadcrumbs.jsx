// src/components/layout/Breadcrumbs.jsx
// Chú thích: Breadcrumbs đơn giản dựa trên react-router location
import { Link, useLocation } from 'react-router-dom';

const LABELS = {
  '': 'Trang chủ',
  chat: 'Chat',
  breathing: 'Thở',
  gratitude: 'Biết ơn',
  games: 'Trò chơi',
  settings: 'Cài đặt',
};

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const parts = pathname.split('/').filter(Boolean);
  const crumbs = [{ to: '/', label: LABELS[''] }];
  if (parts.length) {
    for (let i = 0; i < parts.length; i++) {
      const seg = parts[i];
      const to = '/' + parts.slice(0, i + 1).join('/');
      crumbs.push({ to, label: LABELS[seg] || seg });
    }
  }

  return (
    <nav className="bg-[--surface] border-b border-[--surface-border]" aria-label="Breadcrumb">
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-10 flex items-center gap-2 text-sm">
        {crumbs.map((c, idx) => (
          <span key={c.to} className="flex items-center gap-2">
            {idx > 0 && <span className="text-[--muted]">/</span>}
            {idx === crumbs.length - 1 ? (
              <span className="text-[--text]">{c.label}</span>
            ) : (
              <Link to={c.to} className="text-brand hover:underline">{c.label}</Link>
            )}
          </span>
        ))}
      </div>
    </nav>
  );
}

