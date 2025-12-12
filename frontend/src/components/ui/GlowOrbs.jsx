// src/components/ui/GlowOrbs.jsx
// Chú thích: Animated background orbs để tạo không gian sống động
export default function GlowOrbs({ className = '' }) {
    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            {/* Orb 1 - Top left, teal */}
            <div
                className="orb orb-1 animate-float-slow"
                style={{
                    top: '-100px',
                    left: '-100px',
                }}
            />

            {/* Orb 2 - Top right, amber */}
            <div
                className="orb orb-2 animate-float"
                style={{
                    top: '10%',
                    right: '-50px',
                    animationDelay: '-2s',
                }}
            />

            {/* Orb 3 - Bottom center, pink */}
            <div
                className="orb orb-3 animate-float-slow"
                style={{
                    bottom: '-100px',
                    left: '30%',
                    animationDelay: '-4s',
                }}
            />

            {/* Orb 4 - Middle left */}
            <div
                className="orb orb-2 animate-float"
                style={{
                    top: '40%',
                    left: '-80px',
                    animationDelay: '-3s',
                }}
            />

            {/* Orb 5 - Bottom right */}
            <div
                className="orb orb-1 animate-float-slow"
                style={{
                    bottom: '10%',
                    right: '-120px',
                    animationDelay: '-5s',
                }}
            />
        </div>
    );
}

// Smaller version for cards/sections
export function GlowOrbsSmall({ className = '' }) {
    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            <div
                className="orb animate-float"
                style={{
                    background: 'var(--orb-1)',
                    width: '150px',
                    height: '150px',
                    top: '-30px',
                    right: '-30px',
                    filter: 'blur(40px)',
                }}
            />
            <div
                className="orb animate-float-slow"
                style={{
                    background: 'var(--orb-2)',
                    width: '100px',
                    height: '100px',
                    bottom: '-20px',
                    left: '-20px',
                    filter: 'blur(30px)',
                    animationDelay: '-2s',
                }}
            />
        </div>
    );
}
