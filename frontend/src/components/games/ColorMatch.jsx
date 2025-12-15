// src/components/games/ColorMatch.jsx
// Chú thích: Color Match v1.0 - Memory game với các cặp màu sắc
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import GlowOrbs from '../ui/GlowOrbs';
import {
    Play, RotateCcw, Trophy, Brain, Timer, Sparkles, Star
} from 'lucide-react';

// Card colors - pastel pairs
const COLORS = [
    { id: 'pink', gradient: 'from-pink-400 to-rose-400', label: 'Hồng' },
    { id: 'purple', gradient: 'from-purple-400 to-violet-400', label: 'Tím' },
    { id: 'blue', gradient: 'from-blue-400 to-cyan-400', label: 'Xanh dương' },
    { id: 'teal', gradient: 'from-teal-400 to-emerald-400', label: 'Xanh lá' },
    { id: 'amber', gradient: 'from-amber-400 to-yellow-400', label: 'Vàng' },
    { id: 'orange', gradient: 'from-orange-400 to-red-400', label: 'Cam' },
];

// Storage
const STATS_KEY = 'color_match_stats_v1';

function loadStats() {
    try {
        const raw = localStorage.getItem(STATS_KEY);
        return raw ? JSON.parse(raw) : { bestTime: null, gamesPlayed: 0, totalMoves: 0 };
    } catch (_) {
        return { bestTime: null, gamesPlayed: 0, totalMoves: 0 };
    }
}

function saveStats(stats) {
    try {
        localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (_) { }
}

// Shuffle array
function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Create game cards
function createCards() {
    const cards = [];
    COLORS.forEach(color => {
        cards.push({ ...color, uid: `${color.id}-1` });
        cards.push({ ...color, uid: `${color.id}-2` });
    });
    return shuffle(cards);
}

export default function ColorMatch() {
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]); // uid of flipped cards
    const [matched, setMatched] = useState([]); // id of matched pairs
    const [moves, setMoves] = useState(0);
    const [gameState, setGameState] = useState('idle'); // 'idle' | 'playing' | 'won'
    const [time, setTime] = useState(0);
    const [stats, setStats] = useState(loadStats);
    const [isChecking, setIsChecking] = useState(false);

    // Start game
    const startGame = () => {
        setCards(createCards());
        setFlipped([]);
        setMatched([]);
        setMoves(0);
        setTime(0);
        setGameState('playing');
    };

    // Timer
    useEffect(() => {
        if (gameState !== 'playing') return;

        const timer = setInterval(() => {
            setTime(t => t + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState]);

    // Check for win
    useEffect(() => {
        if (matched.length === COLORS.length && gameState === 'playing') {
            setGameState('won');

            // Update stats
            const newStats = {
                bestTime: stats.bestTime ? Math.min(stats.bestTime, time) : time,
                gamesPlayed: stats.gamesPlayed + 1,
                totalMoves: stats.totalMoves + moves,
            };
            setStats(newStats);
            saveStats(newStats);
        }
    }, [matched, gameState, time, moves, stats.bestTime, stats.gamesPlayed, stats.totalMoves]);

    // Flip card
    const flipCard = useCallback((uid) => {
        if (isChecking) return;
        if (flipped.includes(uid)) return;
        if (flipped.length >= 2) return;

        const card = cards.find(c => c.uid === uid);
        if (matched.includes(card.id)) return;

        const newFlipped = [...flipped, uid];
        setFlipped(newFlipped);
        setMoves(m => m + 1);

        // Check for match
        if (newFlipped.length === 2) {
            setIsChecking(true);
            const [first, second] = newFlipped;
            const card1 = cards.find(c => c.uid === first);
            const card2 = cards.find(c => c.uid === second);

            if (card1.id === card2.id) {
                // Match!
                setTimeout(() => {
                    setMatched(m => [...m, card1.id]);
                    setFlipped([]);
                    setIsChecking(false);
                }, 500);
            } else {
                // No match
                setTimeout(() => {
                    setFlipped([]);
                    setIsChecking(false);
                }, 1000);
            }
        }
    }, [cards, flipped, matched, isChecking]);

    // Format time
    const formatTime = (s) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${String(secs).padStart(2, '0')}`;
    };

    return (
        <div className="min-h-[70vh] relative">
            <GlowOrbs className="opacity-30" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                            <Brain className="w-8 h-8 text-[--brand]" />
                            <span className="gradient-text">Ghép Màu</span>
                        </h1>
                        <p className="text-[--muted] text-sm mt-1">Tìm các cặp màu giống nhau</p>
                    </div>

                    {stats.bestTime && (
                        <Badge variant="accent" icon={<Trophy size={14} />}>
                            Kỷ lục: {formatTime(stats.bestTime)}
                        </Badge>
                    )}
                </motion.div>

                {/* Stats bar */}
                {gameState !== 'idle' && (
                    <div className="flex items-center justify-between glass rounded-xl p-3">
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <div className="text-xl font-bold gradient-text">{moves}</div>
                                <div className="text-xs text-[--muted]">Lượt</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl font-bold text-[--secondary]">{matched.length}/{COLORS.length}</div>
                                <div className="text-xs text-[--muted]">Cặp</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Timer size={18} className="text-[--accent]" />
                            <span className="text-xl font-bold text-[--accent]">{formatTime(time)}</span>
                        </div>
                    </div>
                )}

                {/* Game Board */}
                <Card className="relative overflow-hidden p-4">
                    {gameState === 'idle' ? (
                        <motion.div
                            className="text-center py-12"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="text-6xl mb-4">🧠</div>
                            <h2 className="text-xl font-bold mb-2">Ghép Màu</h2>
                            <p className="text-[--muted] max-w-xs mx-auto mb-6">
                                Lật thẻ và tìm các cặp màu giống nhau. Hoàn thành nhanh nhất có thể!
                            </p>
                            <Button onClick={startGame} size="xl" icon={<Play size={20} />}>
                                Bắt đầu
                            </Button>
                        </motion.div>
                    ) : gameState === 'won' ? (
                        <motion.div
                            className="text-center py-12"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="text-6xl mb-4">🎉</div>
                            <h2 className="text-xl font-bold mb-2">Tuyệt vời!</h2>
                            <div className="text-3xl font-bold gradient-text mb-2">{formatTime(time)}</div>
                            <p className="text-[--muted] mb-2">{moves} lượt</p>
                            {time === stats.bestTime && (
                                <Badge variant="accent" className="mb-4">
                                    <Star size={14} className="mr-1" /> Kỷ lục mới!
                                </Badge>
                            )}
                            <div className="flex justify-center gap-3 mt-6">
                                <Button onClick={startGame} icon={<RotateCcw size={18} />}>
                                    Chơi lại
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-4 gap-3">
                            {cards.map(card => {
                                const isFlipped = flipped.includes(card.uid);
                                const isMatched = matched.includes(card.id);

                                return (
                                    <motion.button
                                        key={card.uid}
                                        onClick={() => flipCard(card.uid)}
                                        className={`
                      aspect-square rounded-xl relative transition-all
                      ${isMatched ? 'opacity-50 cursor-default' : 'cursor-pointer'}
                    `}
                                        whileHover={!isMatched && !isFlipped ? { scale: 1.05 } : {}}
                                        whileTap={!isMatched ? { scale: 0.95 } : {}}
                                    >
                                        <AnimatePresence mode="wait">
                                            {(isFlipped || isMatched) ? (
                                                <motion.div
                                                    key="front"
                                                    className={`w-full h-full rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}
                                                    initial={{ rotateY: 90 }}
                                                    animate={{ rotateY: 0 }}
                                                    exit={{ rotateY: 90 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    {isMatched && <Sparkles className="w-6 h-6 text-white" />}
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="back"
                                                    className="w-full h-full rounded-xl bg-[--surface-border] flex items-center justify-center"
                                                    initial={{ rotateY: 90 }}
                                                    animate={{ rotateY: 0 }}
                                                    exit={{ rotateY: 90 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <span className="text-2xl">❓</span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.button>
                                );
                            })}
                        </div>
                    )}
                </Card>

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-3">
                    <Card size="sm" className="text-center">
                        <Trophy className="w-5 h-5 mx-auto mb-1 text-[--accent]" />
                        <div className="text-lg font-bold">{stats.bestTime ? formatTime(stats.bestTime) : '--'}</div>
                        <div className="text-xs text-[--muted]">Thời gian tốt nhất</div>
                    </Card>
                    <Card size="sm" className="text-center">
                        <Brain className="w-5 h-5 mx-auto mb-1 text-[--brand]" />
                        <div className="text-lg font-bold">{stats.gamesPlayed}</div>
                        <div className="text-xs text-[--muted]">Số ván chơi</div>
                    </Card>
                    <Card size="sm" className="text-center">
                        <Star className="w-5 h-5 mx-auto mb-1 text-[--secondary]" />
                        <div className="text-lg font-bold">
                            {stats.gamesPlayed > 0 ? Math.round(stats.totalMoves / stats.gamesPlayed) : 0}
                        </div>
                        <div className="text-xs text-[--muted]">Tb số lượt</div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
