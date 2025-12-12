// src/components/ui/Input.jsx
// Chú thích: Input cơ bản theo Design System v2.5 (tokens, sizes)
import clsx from 'clsx';

export default function Input({ className, size = 'md', ...props }) {
  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-4 text-base',
    lg: 'h-12 px-5 text-base',
  };
  return (
    <input
      className={clsx(
        'w-full rounded-lg border border-[--surface-border] bg-[--surface] text-[--text] placeholder-[--muted] focus:outline-none focus:ring-2 focus:ring-[--ring]',
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}

