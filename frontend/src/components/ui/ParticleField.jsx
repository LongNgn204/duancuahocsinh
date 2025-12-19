// src/components/ui/ParticleField.jsx
// Chú thích: Animated particles effect cho Hero section
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const PARTICLE_COUNT = 50;

function Particle({ delay, duration }) {
    const randomX = Math.random() * 100;
    const randomY = Math.random() * 100;
    const size = Math.random() * 6 + 2;

    return (
        <motion.div
            className="absolute rounded-full"
            style={{
                left: `${randomX}%`,
                top: `${randomY}%`,
                width: size,
                height: size,
                background: `radial-gradient(circle, rgba(236, 72, 153, ${0.3 + Math.random() * 0.4}) 0%, transparent 70%)`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0.5],
                y: [0, -30 - Math.random() * 50],
                x: [0, (Math.random() - 0.5) * 40],
            }}
            transition={{
                duration: duration,
                delay: delay,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        />
    );
}

export default function ParticleField({ className = '' }) {
    const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        delay: Math.random() * 5,
        duration: 4 + Math.random() * 4,
    }));

    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            {particles.map((particle) => (
                <Particle
                    key={particle.id}
                    delay={particle.delay}
                    duration={particle.duration}
                />
            ))}
        </div>
    );
}
