// src/components/ui/Confetti.jsx
import React, { useEffect, useState } from 'react';

// Lightweight confetti implementation
export default function Confetti({ active, duration = 3000 }) {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        if (active) {
            // Generate particles
            const count = 50;
            const newParticles = Array.from({ length: count }).map((_, i) => ({
                id: i,
                x: Math.random() * 100, // % left
                y: -10, // start above
                color: ['#FF577F', '#FF884B', '#FFD384', '#FFF9B0', '#3498DB', '#9B59B6'][Math.floor(Math.random() * 6)],
                size: Math.random() * 10 + 5,
                rotation: Math.random() * 360,
                delay: Math.random() * 0.5,
                duration: Math.random() * 2 + 1, // 1-3s
            }));
            setParticles(newParticles);
        } else {
            setParticles([]);
        }
    }, [active]);

    if (!active) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute animate-fall"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`, // Start position relative
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        backgroundColor: p.color,
                        borderRadius: Math.random() > 0.5 ? '50%' : '0',
                        opacity: 1,
                        transform: `rotate(${p.rotation}deg)`,
                        animation: `confetti-fall ${p.duration}s linear forwards`,
                        animationDelay: `${p.delay}s`
                    }}
                />
            ))}
            <style>{`
        @keyframes confetti-fall {
            0% { top: -10%; transform: rotate(0deg) translateX(0); opacity: 1; }
            100% { top: 110%; transform: rotate(${360 * 2}deg) translateX(${Math.random() * 100 - 50}px); opacity: 0; }
        }
      `}</style>
        </div>
    );
}
