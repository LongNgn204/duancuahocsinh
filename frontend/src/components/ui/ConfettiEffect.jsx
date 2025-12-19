// src/components/ui/ConfettiEffect.jsx
// Chú thích: Confetti celebration effect - dùng khi đạt achievements, hoàn thành streak
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = [
    '#ec4899', // Pink
    '#f472b6', // Light pink
    '#a855f7', // Purple
    '#fbbf24', // Yellow
    '#22c55e', // Green
    '#3b82f6', // Blue
];

const CONFETTI_COUNT = 50;

function Confetto({ color, delay, startX }) {
    const endX = startX + (Math.random() - 0.5) * 200;
    const rotation = Math.random() * 360;
    const size = 8 + Math.random() * 8;

    return (
        <motion.div
            className="absolute pointer-events-none"
            style={{
                width: size,
                height: size * 0.6,
                backgroundColor: color,
                borderRadius: 2,
                left: startX,
                top: -20,
            }}
            initial={{
                y: -20,
                x: 0,
                rotate: 0,
                opacity: 1,
                scale: 0
            }}
            animate={{
                y: window.innerHeight + 100,
                x: endX - startX,
                rotate: rotation + Math.random() * 720,
                opacity: [1, 1, 0],
                scale: [0, 1, 1],
            }}
            transition={{
                duration: 2.5 + Math.random() * 1.5,
                delay: delay,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
        />
    );
}

export default function ConfettiEffect({
    trigger = false,
    duration = 3000,
    onComplete
}) {
    const [confetti, setConfetti] = useState([]);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if (trigger && !isActive) {
            setIsActive(true);

            // Generate confetti particles
            const particles = Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
                id: i,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                delay: Math.random() * 0.5,
                startX: Math.random() * window.innerWidth,
            }));

            setConfetti(particles);

            // Cleanup after duration
            const timer = setTimeout(() => {
                setConfetti([]);
                setIsActive(false);
                onComplete?.();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [trigger, duration, onComplete, isActive]);

    return (
        <AnimatePresence>
            {confetti.length > 0 && (
                <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
                    {confetti.map((c) => (
                        <Confetto
                            key={c.id}
                            color={c.color}
                            delay={c.delay}
                            startX={c.startX}
                        />
                    ))}
                </div>
            )}
        </AnimatePresence>
    );
}

// Hook for easy usage
export function useConfetti() {
    const [trigger, setTrigger] = useState(false);

    const fire = () => {
        setTrigger(true);
        setTimeout(() => setTrigger(false), 100);
    };

    return { trigger, fire };
}
