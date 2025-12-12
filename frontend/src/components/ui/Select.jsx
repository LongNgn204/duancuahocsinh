// src/components/ui/Select.jsx
// Chú thích: Select cơ bản theo Design System v2.5 (tokens, sizes)
import clsx from 'clsx';

export default function Select({ className, size = 'md', children, ...props }) {
  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-4 text-base',
    lg: 'h-12 px-5 text-base',
  };
  return (
    <select
      className={clsx(
        'w-full rounded-lg border border-[--surface-border] bg-[--surface] text-[--text] focus:outline-none focus:ring-2 focus:ring-[--ring]',
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

