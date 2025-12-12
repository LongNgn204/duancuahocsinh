// src/components/ui/Button.jsx
// Chú thích: Button theo variants/sizes thống nhất, dùng CSS variables Design System v2
import clsx from 'clsx';

const variants = {
  primary: 'bg-[--brand] text-[--brand-foreground] hover:opacity-90 focus:ring-[--ring]',
  secondary: 'bg-[--accent] text-gray-900 hover:opacity-90 focus:ring-[--ring]',
  outline: 'bg-[--surface] text-[--text] border border-[--surface-border] hover:bg-[--surface]/80',
  ghost: 'bg-transparent text-[--text] hover:bg-[--surface]'
};

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-base',
  lg: 'h-12 px-5 text-base',
};

export default function Button({
  as: Comp = 'button',
  variant = 'primary',
  size = 'md',
  className,
  ...props
}) {
  return (
    <Comp
      className={clsx(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
