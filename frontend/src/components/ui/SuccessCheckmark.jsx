// src/components/ui/SuccessCheckmark.jsx
// Chú thích: Animated checkmark appearing on success actions
import { motion } from 'framer-motion';

export default function SuccessCheckmark({
    size = 60,
    className = '',
    show = true
}) {
    if (!show) return null;

    const circleVariants = {
        hidden: { scale: 0, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: { duration: 0.3, ease: "easeOut" }
        }
    };

    const checkVariants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: { duration: 0.5, delay: 0.2, ease: "easeOut" }
        }
    };

    return (
        <motion.div
            className={`inline-flex items-center justify-center ${className}`}
            initial="hidden"
            animate="visible"
        >
            <motion.svg
                width={size}
                height={size}
                viewBox="0 0 60 60"
                variants={circleVariants}
            >
                {/* Background circle */}
                <motion.circle
                    cx="30"
                    cy="30"
                    r="28"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="3"
                    variants={circleVariants}
                />

                {/* Filled circle */}
                <motion.circle
                    cx="30"
                    cy="30"
                    r="25"
                    fill="url(#gradient)"
                    variants={circleVariants}
                />

                {/* Checkmark */}
                <motion.path
                    d="M18 30 L26 38 L42 22"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    variants={checkVariants}
                />

                {/* Gradient definition */}
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                </defs>
            </motion.svg>
        </motion.div>
    );
}
