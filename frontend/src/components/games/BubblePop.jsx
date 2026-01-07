// src/components/games/BubblePop.jsx
// Chú thích: Game bấm bong bóng để thư giãn
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Card from '../ui/Card';

const COLORS = [
    'from-pink-400 to-rose-500',
    'from-purple-400 to-indigo-500',
    'from-blue-400 to-cyan-500',
    'from-green-400 to-emerald-500',
    'from-amber-400 to-orange-500',
];

function Bubble({ id, x, y, size, color, onClick }) {
    return (
        <motion.button
            className={`absolute rounded-full bg-gradient-to-br ${color} shadow-lg cursor-pointer`}
            style={{
                left: x,
                top: y,
                width: size,
                height: size,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => onClick(id)}
            transition={{ type: 'spring', stiffness: 300 }}
        />
    );
}

export default function BubblePop() {
    const [bubbles, setBubbles] = useState([]);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [gameState, setGameState] = useState('idle'); // 'idle' | 'playing' | 'ended'

    // Generate random bubble
    const createBubble = useCallback(() => {
        const size = 40 + Math.random() * 40;
        return {
            id: Date.now() + Math.random(),
            x: Math.random() * (window.innerWidth - 200) + 50,
            y: Math.random() * 300 + 50,
            size,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
        };
    }, []);

    // Start game
    const startGame = () => {
        setScore(0);
        setTimeLeft(30);
        setGameState('playing');
        setBubbles(Array.from({ length: 5 }, createBubble));
    };

    // Pop bubble
    const popBubble = (id) => {
        if (gameState !== 'playing') return;

        setBubbles((prev) => prev.filter((b) => b.id !== id));
        setScore((prev) => prev + 10);

        // Add new bubble
        setTimeout(() => {
            setBubbles((prev) => [...prev, createBubble()]);
        }, 200);
    };

    // Timer
    useEffect(() => {
        if (gameState !== 'playing') return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setGameState('ended');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState]);

    // Add bubbles periodically
    useEffect(() => {
        if (gameState !== 'playing') return;

        const interval = setInterval(() => {
            if (bubbles.length < 8) {
                setBubbles((prev) => [...prev, createBubble()]);
            }
        }, 1500);

        return () => clearInterval(interval);
    }, [gameState, bubbles.length, createBubble]);

    return (
        <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
            {/* Header with back button */}
            <div className="flex items-center gap-3">
                <Link to="/games" className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors shadow-sm">
                    <ArrowLeft size={20} className="text-slate-600" />
                </Link>
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold gradient-text">🫧 Bấm Bong Bóng</h1>
                    <p className="text-[--muted] text-sm hidden sm:block">Bấm vào các bong bóng để thư giãn!</p>
                </div>
            </div>

            {/* Game Stats */}
            <div className="flex justify-center gap-8">
                <Card className="px-6 py-3 text-center">
                    <div className="text-sm text-[--muted]">Điểm</div>
                    <div className="text-2xl font-bold text-[--brand]">{score}</div>
                </Card>
                <Card className="px-6 py-3 text-center">
                    <div className="text-sm text-[--muted]">Thời gian</div>
                    <div className="text-2xl font-bold text-[--brand]">{timeLeft}s</div>
                </Card>
            </div>

            {/* Game Area */}
            <Card className="relative h-[400px] overflow-hidden">
                {gameState === 'idle' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.button
                            onClick={startGame}
                            className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-xl"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Bắt đầu chơi
                        </motion.button>
                    </div>
                )}

                {gameState === 'playing' && (
                    <AnimatePresence>
                        {bubbles.map((bubble) => (
                            <Bubble
                                key={bubble.id}
                                {...bubble}
                                onClick={popBubble}
                            />
                        ))}
                    </AnimatePresence>
                )}

                {gameState === 'ended' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                        <h2 className="text-3xl font-bold gradient-text">Hoàn thành! 🎉</h2>
                        <p className="text-xl text-[--text]">Điểm của bạn: <span className="font-bold text-[--brand]">{score}</span></p>
                        <motion.button
                            onClick={startGame}
                            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Chơi lại
                        </motion.button>
                    </div>
                )}
            </Card>
        </div>
    );
}
