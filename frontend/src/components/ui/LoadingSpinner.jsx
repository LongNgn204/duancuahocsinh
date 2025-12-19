// src/components/ui/LoadingSpinner.jsx
// Chú thích: Beautiful loading spinner với brand gradient
import { motion } from 'framer-motion';

export default function LoadingSpinner({
    size = 'md',
    className = '',
    text = ''
}) {
    const sizes = {
        sm: { spinner: 20, stroke: 2 },
        md: { spinner: 32, stroke: 3 },
        lg: { spinner: 48, stroke: 4 },
        xl: { spinner: 64, stroke: 5 },
    };

    const { spinner, stroke } = sizes[size];
    const radius = (spinner - stroke) / 2;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className={`flex flex-col items-center gap-3 ${className}`}>
            <motion.svg
                width={spinner}
                height={spinner}
                viewBox={`0 0 ${spinner} ${spinner}`}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
                {/* Background circle */}
                <circle
                    cx={spinner / 2}
                    cy={spinner / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(236, 72, 153, 0.2)"
                    strokeWidth={stroke}
                />

                {/* Animated arc */}
                <motion.circle
                    cx={spinner / 2}
                    cy={spinner / 2}
                    r={radius}
                    fill="none"
                    stroke="url(#spinnerGradient)"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    animate={{
                        strokeDashoffset: [circumference, circumference * 0.25, circumference],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />

                <defs>
                    <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                </defs>
            </motion.svg>

            {text && (
                <motion.p
                    className="text-sm text-gray-500 font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    {text}
                </motion.p>
            )}
        </div>
    );
}
