// src/components/ui/Card.jsx
// Chú thích: Card component v3.0 - Glassmorphism với hover effects và variants
import clsx from 'clsx';

const variants = {
  // Default glass card - solid background
  default: `
    bg-surface-elevated
    border-surface
    hover:shadow-lg hover:shadow-[--glass-shadow]
  `,
  // Elevated - Stronger presence with solid background
  elevated: `
    bg-surface-elevated
    border-surface
    shadow-lg shadow-[--glass-shadow]
    hover:shadow-xl
  `,
  // Outlined - Subtle
  outlined: `
    bg-transparent
    border-2 border-[--surface-border]
    hover:border-[--brand]/30
    hover:bg-[--surface]/50
  `,
  // Gradient border
  gradient: `
    gradient-border
    bg-[--surface]
    hover:shadow-lg
  `,
  // Interactive - More pronounced hover
  interactive: `
    glass-card
    cursor-pointer
    hover:scale-[1.02]
    hover:shadow-xl hover:shadow-[--brand]/10
    hover:border-[--brand]/30
    active:scale-[0.99]
  `,
  // Highlight - Attention grabbing
  highlight: `
    bg-gradient-to-br from-[--brand]/10 to-[--secondary]/10
    border border-[--brand]/20
    shadow-lg shadow-[--brand]/5
  `,
  // Solid - No transparency
  solid: `
    bg-[--surface]
    border border-[--surface-border]
    shadow-sm
    hover:shadow-md
  `,
};

const padding = {
  none: '',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-5 md:p-6',
  lg: 'p-5 sm:p-6 md:p-8',
};

import { useSound } from '../../contexts/SoundContext';

// ... (imports remain)

export default function Card({
  as: Comp = 'div',
  variant = 'default',
  size = 'md',
  className,
  children,
  hover = true,
  ...props
}) {
  const { playSound } = useSound();
  const isInteractive = variant === 'interactive' || props.onClick;

  return (
    <Comp
      onMouseEnter={() => isInteractive && hover && playSound('hover')}
      className={clsx(
        // ... (className content remains)
        'rounded-2xl',
        'transition-all duration-300 ease-out',
        variants[variant],
        padding[size],
        !hover && 'hover:scale-100 hover:shadow-none',
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

// Card Header subcomponent
Card.Header = function CardHeader({ className, children, ...props }) {
  return (
    <div className={clsx('mb-4', className)} {...props}>
      {children}
    </div>
  );
};

// Card Title subcomponent
Card.Title = function CardTitle({ className, children, as: Comp = 'h3', ...props }) {
  return (
    <Comp className={clsx('text-lg font-semibold text-[--text]', className)} {...props}>
      {children}
    </Comp>
  );
};

// Card Description subcomponent
Card.Description = function CardDescription({ className, children, ...props }) {
  return (
    <p className={clsx('text-sm text-[--muted] mt-1', className)} {...props}>
      {children}
    </p>
  );
};

// Card Content subcomponent
Card.Content = function CardContent({ className, children, ...props }) {
  return (
    <div className={clsx(className)} {...props}>
      {children}
    </div>
  );
};

// Card Footer subcomponent
Card.Footer = function CardFooter({ className, children, ...props }) {
  return (
    <div className={clsx('mt-4 pt-4 border-t border-[--surface-border]', className)} {...props}>
      {children}
    </div>
  );
};
