// src/components/ui/Card.jsx
// Chú thích: Card component thống nhất: border + bg-white + shadow-sm
import clsx from 'clsx';

export default function Card({ className, children, ...props }) {
  return (
    <section
      className={clsx(
        'rounded-xl border border-[--surface-border] bg-[--surface] text-[--text] shadow-sm',
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}

