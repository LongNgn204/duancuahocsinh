// src/components/games/BubblePop.jsx
// Chú thích: Bubble Pop v2.0 - Worry Release & Zen Mode
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import GlowOrbs from '../ui/GlowOrbs';
import {
    Play, Pause, RotateCcw, Trophy, Sparkles,
    Volume2, VolumeX, Zap, Target, Wind, Heart
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

// Generate random bubble with optional text
function createBubble(id, maxX, maxY, text = '') {
    const size = 60 + Math.random() * 60; // Bigger bubbles for text (60-120px)
    return {
        id,
        x: Math.random() * (maxX - size),
        y: maxY + size, // Start below viewport
        size,
        speed: 1 + Math.random() * 1.5, // Slower for relaxation
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        wobble: Math.random() * 20 - 10,
        popped: false,
        text: text, // Worry text attached
        rotation: Math.random() * 360,
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
    const audioCtxRef = useRef(null);

    // Game State
    const [mode, setMode] = useState('menu'); // 'menu', 'playing', 'worry_input', 'over'
    const [gameType, setGameType] = useState('zen'); // 'zen' | 'challenge' | 'worry'
    const [worryText, setWorryText] = useState('');

    const [bubbles, setBubbles] = useState([]);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [combo, setCombo] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);

    // Settings
    const [soundOn, setSoundOn] = useState(true);
    const [stats, setStats] = useState(loadStats);
    const [effects, setEffects] = useState([]);

    const nextId = useRef(0);

    // Audio Context Setup
    useEffect(() => {
        if (soundOn && !audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
    }, [soundOn]);

    const playPopSound = () => {
        if (!soundOn || !audioCtxRef.current) return;
        try {
            const ctx = audioCtxRef.current;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.frequency.setValueAtTime(400 + Math.random() * 400, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

            osc.connect(gain).connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } catch (_) { }
    };

    // Get container dimensions
    const getContainerSize = useCallback(() => {
        if (!containerRef.current) return { width: 400, height: 500 };
        const rect = containerRef.current.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
    }, []);

    // Loop
    useEffect(() => {
        if (mode !== 'playing') return;

        // Spawner
        const spawnInterval = setInterval(() => {
            const { width, height } = getContainerSize();
            // In worry mode, use the worry text. In others, no text or random emojis?
            let bText = '';
            if (gameType === 'worry') bText = worryText || 'Lo âu';

            const newBubble = createBubble(nextId.current++, width, height, bText);
            setBubbles(prev => [...prev, newBubble]);
        }, gameType === 'challenge' ? 800 : 1200); // Slower spawn in Zen/Worry

        // Mover
        const animate = () => {
            setBubbles(prev => {
                const updated = prev.map(b => ({
                    ...b,
                    y: b.y - b.speed,
                    x: b.x + Math.sin(Date.now() / 1000 + b.id) * 2, // Gentle sway
                    rotation: b.rotation + 0.5,
                }));
                return updated.filter(b => b.y > -150 && !b.popped);
            });
            frameRef.current = requestAnimationFrame(animate);
        };
        frameRef.current = requestAnimationFrame(animate);

        // Timer (Challenge only)
        let timerInterval;
        if (gameType === 'challenge') {
            timerInterval = setInterval(() => {
                setTimeLeft(t => {
                    if (t <= 1) {
                        endGame();
                        return 0;
                    }
                    return t - 1;
                });
            }, 1000);
        }

        return () => {
            clearInterval(spawnInterval);
            cancelAnimationFrame(frameRef.current);
            if (timerInterval) clearInterval(timerInterval);
        };
    }, [mode, gameType, worryText, getContainerSize]);

    const startGame = (type) => {
        if (type === 'worry' && !worryText) {
            setGameType('worry');
            setMode('worry_input');
            return;
        }

        setGameType(type);
        setBubbles([]);
        setScore(0);
        setStreak(0);
        setCombo(0);
        setTimeLeft(60);
        setMode('playing');
        nextId.current = 0;
    };

    const endGame = () => {
        setMode('over');
        // Update stats
        const newStats = {
            totalPopped: stats.totalPopped + streak,
            highScore: Math.max(stats.highScore, score),
            bestStreak: Math.max(stats.bestStreak, streak),
        };
        setStats(newStats);
        saveStats(newStats);
    };

    const playWorry = () => {
        if (!worryText.trim()) return;
        startGame('worry');
    };

    const popBubble = (id) => {
        if (mode !== 'playing') return;

        setBubbles(prev => {
            const bubble = prev.find(b => b.id === id);
            if (!bubble || bubble.popped) return prev;

            // FX
            setEffects(e => [...e, {
                id: Math.random(),
                x: bubble.x + bubble.size / 2,
                y: bubble.y + bubble.size / 2,
                color: bubble.color
            }]);

            playPopSound();
            return prev.filter(b => b.id !== id);
        });

        // Scoring
        setCombo(c => c + 1);
        setStreak(s => s + 1);
        const points = 10 + Math.min(combo, 10) * 2;
        setScore(s => s + points);
    };

    // Auto reset visuals
    useEffect(() => {
        if (effects.length > 5) {
            const t = setTimeout(() => setEffects(e => e.slice(1)), 500);
            return () => clearTimeout(t);
        }
    }, [effects]);

    return (
        <div className="min-h-[70vh] relative">
            <GlowOrbs className="opacity-30" />
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <span className="text-3xl">🫧</span>
                            <span className="gradient-text">Bấm Bong Bóng</span>
                        </h1>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSoundOn(!soundOn)}
                    >
                        {soundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </Button>
                </div>

                {/* Game Container */}
                <Card className="relative overflow-hidden h-[500px] border-2 border-white/20 shadow-2xl">
                    <div
                        ref={containerRef}
                        className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white/10"
                    >
                        {/* Bubbles Render */}
                        <AnimatePresence>
                            {bubbles.map(b => (
                                <motion.div
                                    key={b.id}
                                    className={`absolute rounded-full bg-gradient-to-br ${b.color} shadow-lg cursor-pointer flex items-center justify-center text-white font-medium text-center p-2 leading-tight break-words select-none`}
                                    style={{
                                        width: b.size,
                                        height: b.size,
                                        left: b.x,
                                        top: b.y,
                                        fontSize: Math.max(10, b.size / 5) + 'px',
                                        zIndex: 10
                                    }}
                                    onClick={() => popBubble(b.id)}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1, rotate: b.rotation }}
                                    exit={{ scale: 1.5, opacity: 0 }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {/* Glare */}
                                    <div className="absolute top-[15%] left-[15%] w-[25%] h-[25%] rounded-full bg-white/40 blur-[1px]" />
                                    <span className="relative z-10 drop-shadow-md">
                                        {gameType === 'worry' ? (b.text.slice(0, 8) + (b.text.length > 8 ? '...' : '')) : ''}
                                    </span>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Effects */}
                        {effects.map(ef => (
                            <motion.div
                                key={ef.id}
                                className="absolute pointer-events-none"
                                style={{ left: ef.x, top: ef.y }}
                                initial={{ scale: 0, opacity: 1 }}
                                animate={{ scale: 2, opacity: 0 }}
                                exit={{ opacity: 0 }}
                            >
                                <Sparkles className="text-white w-12 h-12" />
                            </motion.div>
                        ))}

                        {/* UI OVERLAYS */}
                        <AnimatePresence mode='wait'>
                            {/* MENU */}
                            {mode === 'menu' && (
                                <motion.div
                                    key="menu"
                                    className="absolute inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-50"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                >
                                    <h2 className="text-2xl font-bold mb-6 text-[--brand-dark]">Chọn chế độ</h2>
                                    <div className="grid gap-4 w-full max-w-xs">
                                        <Button size="lg" onClick={() => startGame('worry')} className="w-full justify-between group" variant="primary">
                                            <span>🗑️ Xả Stress</span>
                                            <span className="text-xs opacity-70 font-normal">Nổ nỗi lo âu</span>
                                        </Button>
                                        <Button size="lg" onClick={() => startGame('zen')} className="w-full justify-between" variant="secondary">
                                            <span>🧘 Zen Mode</span>
                                            <span className="text-xs opacity-70 font-normal">Thư giãn vô tận</span>
                                        </Button>
                                        <Button size="lg" onClick={() => startGame('challenge')} className="w-full justify-between" variant="outline">
                                            <span>🏆 Thử thách</span>
                                            <span className="text-xs opacity-70 font-normal">60s đua điểm</span>
                                        </Button>
                                    </div>
                                    <p className="mt-8 text-sm text-[--muted]">Kỷ lục của bạn: {stats.highScore}</p>
                                </motion.div>
                            )}

                            {/* WORRY INPUT */}
                            {mode === 'worry_input' && (
                                <motion.div
                                    key="input"
                                    className="absolute inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-6 z-50"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                >
                                    <Wind className="w-12 h-12 text-[--brand] mb-4" />
                                    <h3 className="text-xl font-bold mb-2">Điều gì đang làm bạn phiền lòng?</h3>
                                    <p className="text-sm text-[--muted] mb-6 text-center">Viết nó ra đây và chúng ta cùng thả nó bay đi.</p>

                                    <input
                                        type="text"
                                        value={worryText}
                                        onChange={e => setWorryText(e.target.value)}
                                        placeholder="Ví dụ: Bài kiểm tra ngày mai..."
                                        className="w-full max-w-sm p-4 rounded-xl border-2 border-[--brand]/20 focus:border-[--brand] outline-none bg-white mb-4 text-center"
                                        autoFocus
                                        onKeyDown={e => e.key === 'Enter' && playWorry()}
                                    />

                                    <div className="flex gap-3">
                                        <Button variant="ghost" onClick={() => setMode('menu')}>Quay lại</Button>
                                        <Button onClick={playWorry} disabled={!worryText.trim()}>Bắt đầu thả trôi</Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* IN-GAME HUD */}
                            {mode === 'playing' && (
                                <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-40 pointer-events-none">
                                    <div className="bg-white/80 backdrop-blur px-3 py-1 rounded-full shadow-sm">
                                        <span className="font-bold text-[--brand]">{score}</span> pts
                                    </div>
                                    {gameType === 'challenge' && (
                                        <div className={`bg-white/80 backdrop-blur px-3 py-1 rounded-full shadow-sm font-bold ${timeLeft < 10 ? 'text-red-500' : ''}`}>
                                            ⏱️ {timeLeft}s
                                        </div>
                                    )}
                                    <div className="pointer-events-auto">
                                        <Button size="icon-sm" variant="ghost" onClick={endGame} title="Dừng chơi">
                                            <Pause size={16} />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* GAME OVER */}
                            {mode === 'over' && (
                                <motion.div
                                    key="over"
                                    className="absolute inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-6 z-50"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                >
                                    <Trophy className="w-16 h-16 text-yellow-500 mb-4" />
                                    <h2 className="text-2xl font-bold mb-2">Hoàn thành!</h2>
                                    <div className="text-4xl font-black gradient-text mb-2">{score}</div>
                                    <p className="text-[--muted] mb-8">Bạn có cảm thấy nhẹ nhõm hơn chút nào không?</p>
                                    <div className="flex gap-3">
                                        <Button variant="outline" onClick={() => setMode('menu')}>Menu</Button>
                                        <Button onClick={() => startGame(gameType)}>Chơi lại</Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </Card>
            </div>
        </div>
    );
}
