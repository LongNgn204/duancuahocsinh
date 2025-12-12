// src/components/games/BubblePop.jsx
// Chú thích: Bubble Pop v1.0 - Relaxing stress relief game
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import GlowOrbs from '../ui/GlowOrbs';
import {
    Play, Pause, RotateCcw, Trophy, Sparkles,
    Volume2, VolumeX, Zap, Target
} from 'lucide-react';

// Bubble colors - pastel palette
const COLORS = [
    'from-pink-400 to-rose-400',
    'from-purple-400 to-violet-400',
    'from-blue-400 to-cyan-400',
    'from-teal-400 to-emerald-400',
    'from-amber-400 to-yellow-400',
    'from-orange-400 to-red-400',
];

// Generate random bubble
function createBubble(id, maxX, maxY) {
    const size = 40 + Math.random() * 50; // 40-90px
    return {
        id,
        x: Math.random() * (maxX - size),
        y: maxY + size, // Start below viewport
        size,
        speed: 1 + Math.random() * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        wobble: Math.random() * 20 - 10,
        popped: false,
    };
}

// Storage
const STATS_KEY = 'bubble_pop_stats_v1';

function loadStats() {
    try {
        const raw = localStorage.getItem(STATS_KEY);
        return raw ? JSON.parse(raw) : { totalPopped: 0, highScore: 0, bestStreak: 0 };
    } catch (_) {
        return { totalPopped: 0, highScore: 0, bestStreak: 0 };
    }
}

function saveStats(stats) {
    try {
        localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (_) { }
}

export default function BubblePop() {
    const containerRef = useRef(null);
    const frameRef = useRef(null);
    const [gameOver, setGameOver] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [bubbles, setBubbles] = useState([]);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [combo, setCombo] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [soundOn, setSoundOn] = useState(true);
    const [stats, setStats] = useState(loadStats);
    const [effects, setEffects] = useState([]); // Pop effects

    const nextId = useRef(0);

    // Get container dimensions
    const getContainerSize = useCallback(() => {
        if (!containerRef.current) return { width: 400, height: 500 };
        const rect = containerRef.current.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
    }, []);

    // Spawn bubbles
    useEffect(() => {
        if (!isPlaying) return;

        const spawnInterval = setInterval(() => {
            const { width, height } = getContainerSize();
            const newBubble = createBubble(nextId.current++, width, height);
            setBubbles(prev => [...prev, newBubble]);
        }, 800);

        return () => clearInterval(spawnInterval);
    }, [isPlaying, getContainerSize]);

    // Game loop - move bubbles up
    useEffect(() => {
        if (!isPlaying) return;

        const animate = () => {
            setBubbles(prev => {
                const updated = prev.map(b => ({
                    ...b,
                    y: b.y - b.speed,
                    x: b.x + Math.sin(Date.now() / 500) * b.wobble * 0.1,
                }));
                // Remove bubbles that went off screen
                return updated.filter(b => b.y > -100 && !b.popped);
            });
            frameRef.current = requestAnimationFrame(animate);
        };

        frameRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameRef.current);
    }, [isPlaying]);

    // Timer
    useEffect(() => {
        if (!isPlaying || gameOver) return;

        const timer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    endGame();
                    return 0;
                }
                return t - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isPlaying, gameOver]);

    // Pop bubble
    const popBubble = (id) => {
        if (!isPlaying) return;

        setBubbles(prev => {
            const bubble = prev.find(b => b.id === id);
            if (!bubble || bubble.popped) return prev;

            // Add pop effect
            setEffects(e => [...e, { id: bubble.id, x: bubble.x + bubble.size / 2, y: bubble.y + bubble.size / 2 }]);
            setTimeout(() => {
                setEffects(e => e.filter(ef => ef.id !== bubble.id));
            }, 500);

            // Play sound
            if (soundOn) {
                try {
                    const audio = new Audio('/sounds/pop.mp3');
                    audio.volume = 0.3;
                    audio.play().catch(() => { });
                } catch (_) { }
            }

            return prev.filter(b => b.id !== id);
        });

        // Update score with combo
        setCombo(c => c + 1);
        setStreak(s => s + 1);
        const points = 10 + Math.min(combo, 10) * 2; // Max 30 points per bubble
        setScore(s => s + points);
    };

    // Reset combo
    useEffect(() => {
        const timeout = setTimeout(() => {
            setCombo(0);
        }, 2000);
        return () => clearTimeout(timeout);
    }, [combo]);

    // Start game
    const startGame = () => {
        setBubbles([]);
        setScore(0);
        setStreak(0);
        setCombo(0);
        setTimeLeft(60);
        setGameOver(false);
        setIsPlaying(true);
        nextId.current = 0;
    };

    // End game
    const endGame = () => {
        setIsPlaying(false);
        setGameOver(true);
        cancelAnimationFrame(frameRef.current);

        // Update stats
        const newStats = {
            totalPopped: stats.totalPopped + streak,
            highScore: Math.max(stats.highScore, score),
            bestStreak: Math.max(stats.bestStreak, streak),
        };
        setStats(newStats);
        saveStats(newStats);
    };

    return (
        <div className="min-h-[70vh] relative">
            <GlowOrbs className="opacity-30" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                {/* Header */}
                <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                            <Sparkles className="w-8 h-8 text-[--brand]" />
                            <span className="gradient-text">Bubble Pop</span>
                        </h1>
                        <p className="text-[--muted] text-sm mt-1">Thư giãn và giải tỏa stress</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="accent" icon={<Trophy size={14} />}>
                            Best: {stats.highScore}
                        </Badge>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSoundOn(!soundOn)}
                        >
                            {soundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
                        </Button>
                    </div>
                </motion.div>

                {/* Stats Bar */}
                <div className="flex items-center justify-between glass rounded-xl p-3">
                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold gradient-text">{score}</div>
                            <div className="text-xs text-[--muted]">Điểm</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-[--secondary]">{streak}</div>
                            <div className="text-xs text-[--muted]">Streak</div>
                        </div>
                        {combo > 1 && (
                            <Badge variant="warning" className="animate-pulse">
                                <Zap size={12} className="mr-1" />
                                x{combo} Combo!
                            </Badge>
                        )}
                    </div>
                    <div className="text-center">
                        <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-[--accent]'}`}>
                            {timeLeft}s
                        </div>
                        <div className="text-xs text-[--muted]">Còn lại</div>
                    </div>
                </div>

                {/* Game Area */}
                <Card className="relative overflow-hidden" style={{ height: '400px' }}>
                    <div
                        ref={containerRef}
                        className="absolute inset-0 cursor-pointer"
                        style={{ touchAction: 'none' }}
                    >
                        {/* Bubbles */}
                        <AnimatePresence>
                            {bubbles.map(bubble => (
                                <motion.div
                                    key={bubble.id}
                                    className={`
                    absolute rounded-full bg-gradient-to-br ${bubble.color}
                    shadow-lg cursor-pointer select-none
                    hover:scale-110 active:scale-90
                    flex items-center justify-center
                  `}
                                    style={{
                                        width: bubble.size,
                                        height: bubble.size,
                                        left: bubble.x,
                                        top: bubble.y,
                                    }}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 0.9 }}
                                    exit={{ scale: 1.5, opacity: 0 }}
                                    onClick={() => popBubble(bubble.id)}
                                    onTouchStart={(e) => { e.preventDefault(); popBubble(bubble.id); }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.8 }}
                                >
                                    {/* Shine effect */}
                                    <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-white/40" />
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Pop effects */}
                        {effects.map(ef => (
                            <motion.div
                                key={`ef-${ef.id}`}
                                className="absolute pointer-events-none"
                                style={{ left: ef.x - 25, top: ef.y - 25 }}
                                initial={{ scale: 0, opacity: 1 }}
                                animate={{ scale: 2, opacity: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                <Sparkles className="w-12 h-12 text-[--accent]" />
                            </motion.div>
                        ))}

                        {/* Start/Game Over overlay */}
                        {!isPlaying && (
                            <motion.div
                                className="absolute inset-0 bg-[--surface]/90 backdrop-blur-sm flex flex-col items-center justify-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                {gameOver ? (
                                    <>
                                        <Trophy className="w-16 h-16 text-[--accent] mb-4" />
                                        <h2 className="text-2xl font-bold mb-2">Kết thúc!</h2>
                                        <div className="text-4xl font-bold gradient-text mb-2">{score} điểm</div>
                                        <p className="text-[--muted] mb-6">Đã bấm {streak} bong bóng</p>
                                        {score >= stats.highScore && score > 0 && (
                                            <Badge variant="accent" className="mb-4">🎉 Kỷ lục mới!</Badge>
                                        )}
                                        <Button onClick={startGame} icon={<RotateCcw size={18} />}>
                                            Chơi lại
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-6xl mb-4">🫧</div>
                                        <h2 className="text-2xl font-bold mb-2">Bubble Pop</h2>
                                        <p className="text-[--muted] text-center max-w-xs mb-6">
                                            Bấm các bong bóng để ghi điểm. Càng nhanh combo càng cao!
                                        </p>
                                        <Button onClick={startGame} size="xl" icon={<Play size={20} />}>
                                            Bắt đầu
                                        </Button>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </div>
                </Card>

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-3">
                    <Card size="sm" className="text-center">
                        <Target className="w-5 h-5 mx-auto mb-1 text-[--brand]" />
                        <div className="text-lg font-bold">{stats.totalPopped}</div>
                        <div className="text-xs text-[--muted]">Tổng bấm</div>
                    </Card>
                    <Card size="sm" className="text-center">
                        <Trophy className="w-5 h-5 mx-auto mb-1 text-[--accent]" />
                        <div className="text-lg font-bold">{stats.highScore}</div>
                        <div className="text-xs text-[--muted]">Điểm cao</div>
                    </Card>
                    <Card size="sm" className="text-center">
                        <Zap className="w-5 h-5 mx-auto mb-1 text-[--secondary]" />
                        <div className="text-lg font-bold">{stats.bestStreak}</div>
                        <div className="text-xs text-[--muted]">Best streak</div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
