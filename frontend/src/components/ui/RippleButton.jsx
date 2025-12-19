// src/components/ui/RippleButton.jsx
// Chú thích: Button với ripple effect khi click - Material Design style
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RippleButton({
    children,
    onClick,
    className = '',
    disabled = false,
    variant = 'primary', // 'primary' | 'secondary' | 'ghost'
    size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
    ...props
}) {
    const [ripples, setRipples] = useState([]);
    const buttonRef = useRef(null);

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
        xl: 'px-8 py-4 text-xl',
    };

    const variantClasses = {
        primary: 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/30',
        secondary: 'bg-white/80 text-pink-600 border border-pink-200 hover:bg-pink-50',
        ghost: 'bg-transparent text-pink-600 hover:bg-pink-50',
    };

    const handleClick = (e) => {
        if (disabled) return;

        const button = buttonRef.current;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const size = Math.max(rect.width, rect.height) * 2;

        const newRipple = {
            id: Date.now(),
            x,
            y,
            size,
        };

        setRipples((prev) => [...prev, newRipple]);

        // Remove ripple after animation
        setTimeout(() => {
            setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
        }, 600);

        onClick?.(e);
    };

    return (
        <motion.button
            ref={buttonRef}
            onClick={handleClick}
            disabled={disabled}
            className={`
        relative overflow-hidden rounded-xl font-semibold
        transition-all duration-200
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
            whileTap={{ scale: disabled ? 1 : 0.97 }}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            {...props}
        >
            {/* Ripple effects */}
            <AnimatePresence>
                {ripples.map((ripple) => (
                    <motion.span
                        key={ripple.id}
                        className="absolute bg-white/30 rounded-full pointer-events-none"
                        style={{
                            left: ripple.x - ripple.size / 2,
                            top: ripple.y - ripple.size / 2,
                            width: ripple.size,
                            height: ripple.size,
                        }}
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 1, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                ))}
            </AnimatePresence>

            {/* Button content */}
            <span className="relative z-10 flex items-center justify-center gap-2">
                {children}
            </span>
        </motion.button>
    );
}
