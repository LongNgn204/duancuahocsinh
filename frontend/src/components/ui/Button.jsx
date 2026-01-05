// src/components/ui/Button.jsx
// Chú thích: Button component v3.0 - Modern với gradient, glow effects, micro-animations
import clsx from 'clsx';
import { useSound } from '../../contexts/SoundContext';

const variants = {
  // Primary: Gradient với glow effect
  primary: `
    bg-gradient-to-r from-[--brand] to-[--brand-light]
    text-[--brand-foreground] 
    hover:shadow-lg hover:shadow-[--brand]/30
    hover:scale-[1.02]
    active:scale-[0.98]
  `,
  // Secondary: Glass effect
  secondary: `
    bg-[--secondary]/20 
    text-[--text]
    border border-[--secondary]/40
    hover:bg-[--secondary]/30
    hover:border-[--secondary]/60
    hover:scale-[1.02]
    active:scale-[0.98]
  `,
  // Accent: Warm gradient
  accent: `
    bg-gradient-to-r from-[--accent] to-orange-400
    text-[--accent-foreground]
    hover:shadow-lg hover:shadow-[--accent]/30
    hover:scale-[1.02]
    active:scale-[0.98]
  `,
  // Outline: Bordered với hover fill
  outline: `
    bg-transparent
    text-[--brand]
    border-2 border-[--brand]/40
    hover:bg-[--brand]/10
    hover:border-[--brand]
    active:scale-[0.98]
  `,
  // Ghost: Minimal
  ghost: `
    bg-transparent 
    text-[--text-secondary]
    hover:bg-[--surface-border]
    hover:text-[--text]
    active:scale-[0.98]
  `,
  // Danger: For destructive actions
  danger: `
    bg-gradient-to-r from-red-500 to-rose-500
    text-white
    hover:shadow-lg hover:shadow-red-500/30
    hover:scale-[1.02]
    active:scale-[0.98]
  `,
  // Glass: Glassmorphism style
  glass: `
    glass
    text-[--text]
    hover:bg-[--glass-bg-strong]
    hover:scale-[1.02]
    active:scale-[0.98]
  `,
};

const sizes = {
  // Chú thích: Tất cả sizes đảm bảo minimum 44px touch target trên mobile
  xs: 'min-h-[44px] h-9 px-3 text-xs gap-1.5 sm:min-h-0', // 44px mobile, 36px desktop
  sm: 'min-h-[44px] h-10 px-4 text-sm gap-2',     // 44px minimum
  md: 'min-h-[44px] h-12 px-5 sm:px-6 text-base gap-2.5', // 48px, responsive padding
  lg: 'min-h-[48px] h-14 px-6 sm:px-8 text-lg gap-3',     // 56px, responsive padding
  xl: 'min-h-[48px] h-16 px-8 sm:px-10 text-xl gap-4',    // 64px, responsive padding
  icon: 'min-h-[44px] h-12 w-12 p-0',           // Square icon button
  'icon-sm': 'min-h-[44px] h-10 w-10 p-0',      // Ensure 44px
  'icon-lg': 'min-h-[48px] h-14 w-14 p-0',      // Larger icon
};


export default function Button({
  as: Comp = 'button',
  variant = 'primary',
  size = 'md',
  className,
  children,
  icon,
  iconRight,
  loading,
  disabled,
  ...props
}) {
  const isDisabled = disabled || loading;
  const { playSound } = useSound();

  return (
    <Comp
      onMouseEnter={() => !isDisabled && playSound('hover')}
      onClick={(e) => {
        if (!isDisabled) {
          playSound('click');
          props.onClick && props.onClick(e);
        }
      }}
      className={clsx(
        // ... (className content remains the same - ensuring we don't break existing styles)
        'inline-flex items-center justify-center',
        'rounded-xl font-semibold',
        'transition-all duration-200 ease-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[--ring] focus-visible:ring-offset-2 focus-visible:ring-offset-[--bg]',
        variants[variant],
        sizes[size],
        isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className,
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {icon && !loading && <span className="shrink-0">{icon}</span>}
      {children}
      {iconRight && <span className="shrink-0">{iconRight}</span>}
    </Comp>
  );
}
