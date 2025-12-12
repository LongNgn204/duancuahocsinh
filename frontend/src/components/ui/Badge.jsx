// src/components/ui/Badge.jsx
// Chú thích: Badge component cho tags, status indicators
import clsx from 'clsx';

const variants = {
    default: 'bg-[--surface-border] text-[--text-secondary]',
    primary: 'bg-[--brand]/15 text-[--brand] border border-[--brand]/20',
    secondary: 'bg-[--secondary]/20 text-[--secondary-foreground] border border-[--secondary]/30',
    accent: 'bg-[--accent]/15 text-[--accent-foreground] border border-[--accent]/20',
    success: 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/20',
    warning: 'bg-amber-500/15 text-amber-600 border border-amber-500/20',
    danger: 'bg-red-500/15 text-red-600 border border-red-500/20',
    info: 'bg-blue-500/15 text-blue-600 border border-blue-500/20',
    gradient: 'bg-gradient-to-r from-[--brand]/20 to-[--secondary]/20 text-[--brand]',
};

const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
};

export default function Badge({
    variant = 'default',
    size = 'md',
    className,
    children,
    dot,
    icon,
    ...props
}) {
    return (
        <span
            className={clsx(
                'inline-flex items-center gap-1.5',
                'rounded-full font-medium',
                'transition-colors duration-200',
                variants[variant],
                sizes[size],
                className,
            )}
            {...props}
        >
            {dot && (
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            )}
            {icon && <span className="shrink-0">{icon}</span>}
            {children}
        </span>
    );
}
