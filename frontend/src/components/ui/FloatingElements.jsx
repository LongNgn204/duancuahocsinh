// src/components/ui/FloatingElements.jsx
// Chú thích: Floating 3D-style decorative elements cho Landing Page
import { motion } from 'framer-motion';
import { Heart, Star, Sparkles, BookOpen, Brain, Smile } from 'lucide-react';

const elements = [
    { Icon: Heart, color: 'from-pink-400 to-rose-500', size: 40, x: '10%', y: '20%', delay: 0 },
    { Icon: Star, color: 'from-amber-400 to-orange-500', size: 32, x: '85%', y: '15%', delay: 0.5 },
    { Icon: Sparkles, color: 'from-purple-400 to-indigo-500', size: 36, x: '75%', y: '70%', delay: 1 },
    { Icon: BookOpen, color: 'from-teal-400 to-cyan-500', size: 38, x: '15%', y: '75%', delay: 1.5 },
    { Icon: Brain, color: 'from-violet-400 to-purple-500', size: 34, x: '90%', y: '45%', delay: 2 },
    { Icon: Smile, color: 'from-green-400 to-emerald-500', size: 30, x: '5%', y: '50%', delay: 2.5 },
];

function FloatingIcon({ Icon, color, size, x, y, delay }) {
    return (
        <motion.div
            className={`absolute bg-gradient-to-br ${color} p-3 rounded-2xl shadow-lg`}
            style={{ left: x, top: y }}
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{
                opacity: 0.9,
                scale: 1,
                rotate: 0,
                y: [0, -15, 0],
            }}
            transition={{
                opacity: { delay, duration: 0.5 },
                scale: { delay, duration: 0.5, type: "spring" },
                rotate: { delay, duration: 0.8 },
                y: { delay: delay + 0.5, duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
            whileHover={{ scale: 1.2, rotate: 10 }}
        >
            <Icon size={size * 0.5} className="text-white" />
        </motion.div>
    );
}

export default function FloatingElements({ className = '' }) {
    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            {elements.map((el, idx) => (
                <FloatingIcon key={idx} {...el} />
            ))}
        </div>
    );
}
