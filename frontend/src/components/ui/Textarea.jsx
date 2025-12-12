// src/components/ui/Textarea.jsx
// Chú thích: Textarea cơ bản theo Design System v2.5 (tokens, sizes)
import clsx from 'clsx';

export default function Textarea({ className, rows = 4, ...props }) {
  return (
    <textarea
      rows={rows}
      className={clsx(
        'w-full rounded-lg border border-[--surface-border] bg-[--surface] text-[--text] placeholder-[--muted] focus:outline-none focus:ring-2 focus:ring-[--ring] p-4',
        className,
      )}
      {...props}
    />
  );
}

