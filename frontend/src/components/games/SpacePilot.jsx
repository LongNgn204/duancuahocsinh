// src/components/games/SpacePilot.jsx
// Chú thích: Space Pilot v1.0 - Điều khiển tàu vũ trụ tránh thiên thạch
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import GlowOrbs from '../ui/GlowOrbs';
import {
    Play, Pause, RotateCcw, Trophy, Rocket, Zap,
    Volume2, VolumeX, Target, Star
} from 'lucide-react';
import { isLoggedIn, saveGameScore, rewardXP, getGameLeaderboard } from '../../utils/api';

// Game constants
const SHIP_SIZE = 40;
const ASTEROID_MIN_SIZE = 30;
const ASTEROID_MAX_SIZE = 60;
const SHIP_SPEED = 5;
const ASTEROID_SPEED = 2;
const SPAWN_RATE = 1000; // ms

// Storage
const STATS_KEY = 'space_pilot_stats_v1';

function loadStats() {
    try {
        const raw = localStorage.getItem(STATS_KEY);
        return raw ? JSON.parse(raw) : { highScore: 0, gamesPlayed: 0 };
    } catch (_) {
        return { highScore: 0, gamesPlayed: 0 };
    }
}

function saveStats(stats) {
    try {
        localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (_) { }
}

// Create asteroid
function createAsteroid(id, canvasWidth) {
    return {
        id,
        x: Math.random() * (canvasWidth - ASTEROID_MAX_SIZE),
        y: -ASTEROID_MAX_SIZE,
        size: ASTEROID_MIN_SIZE + Math.random() * (ASTEROID_MAX_SIZE - ASTEROID_MIN_SIZE),
        speed: ASTEROID_SPEED + Math.random() * 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 5,
    };
}

export default function SpacePilot() {
    const canvasRef = useRef(null);
    const animationFrameRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [shipX, setShipX] = useState(200);
    const [asteroids, setAsteroids] = useState([]);
    const [keys, setKeys] = useState({ left: false, right: false });
    const [soundOn, setSoundOn] = useState(true);
    const [stats, setStats] = useState(loadStats);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    const nextAsteroidId = useRef(0);
    const startTime = useRef(0);

    // Load leaderboard
    useEffect(() => {
        const loadLeaderboard = async () => {
            if (isLoggedIn()) {
                try {
                    const data = await getGameLeaderboard('space_pilot', 10);
                    setLeaderboard(data.items || []);
                } catch (e) {
                    console.warn('[SpacePilot] Failed to load leaderboard:', e);
                }
            }
        };
        loadLeaderboard();
    }, []);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                setKeys(prev => ({ ...prev, left: true }));
            }
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                setKeys(prev => ({ ...prev, right: true }));
            }
        };

        const handleKeyUp = (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                setKeys(prev => ({ ...prev, left: false }));
            }
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                setKeys(prev => ({ ...prev, right: false }));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Touch controls
    const handleTouchStart = (e) => {
        const touch = e.touches[0];
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const touchX = touch.clientX - rect.left;
        const centerX = rect.width / 2;
        if (touchX < centerX) {
            setKeys(prev => ({ ...prev, left: true }));
        } else {
            setKeys(prev => ({ ...prev, right: true }));
        }
    };

    const handleTouchEnd = () => {
        setKeys({ left: false, right: false });
    };

    // Spawn asteroids
    useEffect(() => {
        if (!isPlaying) return;

        const spawnInterval = setInterval(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const newAsteroid = createAsteroid(nextAsteroidId.current++, canvas.width);
            setAsteroids(prev => [...prev, newAsteroid]);
        }, SPAWN_RATE);

        return () => clearInterval(spawnInterval);
    }, [isPlaying]);

    // Game loop
    useEffect(() => {
        if (!isPlaying || gameOver) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const gameLoop = () => {
            // Clear canvas
            ctx.fillStyle = '#0a0a1a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw stars background
            ctx.fillStyle = '#ffffff';
            for (let i = 0; i < 50; i++) {
                const x = (i * 37) % canvas.width;
                const y = (i * 23 + Date.now() * 0.01) % canvas.height;
                ctx.fillRect(x, y, 1, 1);
            }

            // Update ship position
            setShipX(prev => {
                let newX = prev;
                if (keys.left) newX = Math.max(SHIP_SIZE / 2, prev - SHIP_SPEED);
                if (keys.right) newX = Math.min(canvas.width - SHIP_SIZE / 2, prev + SHIP_SPEED);
                return newX;
            });

            // Draw ship
            ctx.save();
            ctx.translate(shipX, canvas.height - 60);
            ctx.fillStyle = '#4ade80';
            ctx.beginPath();
            ctx.moveTo(0, -SHIP_SIZE / 2);
            ctx.lineTo(-SHIP_SIZE / 2, SHIP_SIZE / 2);
            ctx.lineTo(SHIP_SIZE / 2, SHIP_SIZE / 2);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            // Update and draw asteroids
            setAsteroids(prev => {
                const updated = prev.map(asteroid => ({
                    ...asteroid,
                    y: asteroid.y + asteroid.speed,
                    rotation: asteroid.rotation + asteroid.rotationSpeed,
                })).filter(asteroid => asteroid.y < canvas.height + asteroid.size);

                // Check collisions
                const shipY = canvas.height - 60;
                updated.forEach(asteroid => {
                    const dx = asteroid.x + asteroid.size / 2 - shipX;
                    const dy = asteroid.y + asteroid.size / 2 - shipY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < (SHIP_SIZE / 2 + asteroid.size / 2)) {
                        // Collision!
                        setGameOver(true);
                        setIsPlaying(false);
                    }
                });

                return updated;
            });

            // Update score (time-based)
            const elapsed = (Date.now() - startTime.current) / 1000;
            setScore(Math.floor(elapsed * 10));

            animationFrameRef.current = requestAnimationFrame(gameLoop);
        };

        startTime.current = Date.now();
        animationFrameRef.current = requestAnimationFrame(gameLoop);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isPlaying, gameOver, keys, shipX]);

    // Draw asteroids
    useEffect(() => {
        if (!isPlaying) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const drawAsteroids = () => {
            asteroids.forEach(asteroid => {
                ctx.save();
                ctx.translate(asteroid.x + asteroid.size / 2, asteroid.y + asteroid.size / 2);
                ctx.rotate((asteroid.rotation * Math.PI) / 180);
                ctx.fillStyle = '#fbbf24';
                ctx.beginPath();
                ctx.arc(0, 0, asteroid.size / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#92400e';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.restore();
            });
        };

        drawAsteroids();
    }, [asteroids, isPlaying]);

    // Start game
    const startGame = () => {
        setGameOver(false);
        setScore(0);
        setAsteroids([]);
        setShipX(200);
        setIsPlaying(true);
        nextAsteroidId.current = 0;
    };

    // End game
    const endGame = async () => {
        setIsPlaying(false);
        const isNewRecord = score > stats.highScore;
        
        if (isNewRecord) {
            const newStats = { ...stats, highScore: score, gamesPlayed: stats.gamesPlayed + 1 };
            setStats(newStats);
            saveStats(newStats);
        }

        // Save to server if logged in
        if (isLoggedIn()) {
            setLoading(true);
            try {
                const result = await saveGameScore('space_pilot', score, 1, Math.floor((Date.now() - startTime.current) / 1000));
                
                // Thưởng XP
                try {
                    await rewardXP('game_play');
                    if (result.isNewRecord) {
                        await rewardXP('game_record');
                    }
                } catch (xpError) {
                    console.warn('[SpacePilot] XP reward failed:', xpError);
                }

                // Reload leaderboard
                const data = await getGameLeaderboard('space_pilot', 10);
                setLeaderboard(data.items || []);
            } catch (e) {
                console.warn('[SpacePilot] Failed to save score:', e);
            } finally {
                setLoading(false);
            }
        }
    };

    // Reset game
    const resetGame = () => {
        setGameOver(false);
        setScore(0);
        setAsteroids([]);
        setShipX(200);
        setIsPlaying(false);
    };

    // Setup canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeCanvas = () => {
            canvas.width = Math.min(400, window.innerWidth - 32);
            canvas.height = 500;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    // Auto end game when game over
    useEffect(() => {
        if (gameOver && isPlaying) {
            endGame();
        }
    }, [gameOver, isPlaying]);

    return (
        <div className="min-h-[70vh] relative pb-20 md:pb-0">
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
                            <Rocket className="w-8 h-8 text-[--brand]" />
                            <span className="gradient-text">Space Pilot</span>
                        </h1>
                        <p className="text-[--muted] text-sm mt-1">
                            Điều khiển tàu vũ trụ tránh thiên thạch
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setShowLeaderboard(!showLeaderboard)}
                            title="Bảng xếp hạng"
                        >
                            <Trophy size={18} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setSoundOn(!soundOn)}
                        >
                            {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
                        </Button>
                    </div>
                </motion.div>

                {/* Game Canvas */}
                <Card variant="elevated" className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <Badge variant="primary" icon={<Target size={14} />}>
                                {score} điểm
                            </Badge>
                            {stats.highScore > 0 && (
                                <Badge variant="accent" icon={<Trophy size={14} />}>
                                    Kỷ lục: {stats.highScore}
                                </Badge>
                            )}
                        </div>
                        {!isPlaying && !gameOver && (
                            <Button onClick={startGame} icon={<Play size={18} />}>
                                Bắt đầu
                            </Button>
                        )}
                        {isPlaying && (
                            <Button onClick={() => setIsPlaying(false)} icon={<Pause size={18} />}>
                                Tạm dừng
                            </Button>
                        )}
                        {gameOver && (
                            <Button onClick={resetGame} icon={<RotateCcw size={18} />}>
                                Chơi lại
                            </Button>
                        )}
                    </div>

                    <canvas
                        ref={canvasRef}
                        className="w-full rounded-xl border-2 border-[--surface-border] bg-[#0a0a1a]"
                        style={{ touchAction: 'none' }}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    />

                    {/* Controls hint */}
                    <div className="mt-4 text-center text-sm text-[--muted]">
                        <p>← → hoặc A D để di chuyển</p>
                    </div>
                </Card>

                {/* Game Over Modal */}
                <AnimatePresence>
                    {gameOver && (
                        <motion.div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm grid place-items-center z-50 p-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="max-w-sm w-full"
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                            >
                                <Card variant="elevated" size="lg">
                                    <div className="text-center space-y-4">
                                        <div className="text-6xl">🚀</div>
                                        <h3 className="text-2xl font-bold">Game Over!</h3>
                                        <p className="text-lg">Điểm số: <span className="font-bold text-[--brand]">{score}</span></p>
                                        {score > stats.highScore && (
                                            <Badge variant="accent" icon={<Star size={16} />}>
                                                Kỷ lục mới!
                                            </Badge>
                                        )}
                                        <div className="flex gap-2 justify-center">
                                            <Button onClick={resetGame} icon={<RotateCcw size={18} />}>
                                                Chơi lại
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Leaderboard */}
                <AnimatePresence>
                    {showLeaderboard && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <Card>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <Trophy className="w-5 h-5 text-yellow-500" />
                                        Bảng xếp hạng
                                    </h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowLeaderboard(false)}
                                    >
                                        Đóng
                                    </Button>
                                </div>
                                {leaderboard.length === 0 ? (
                                    <p className="text-center text-[--muted] py-4">
                                        Chưa có điểm số nào
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {leaderboard.map((entry, idx) => (
                                            <div
                                                key={entry.id}
                                                className="flex items-center justify-between p-2 rounded-lg bg-[--surface-border]/30"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg font-bold text-[--muted] w-6">
                                                        #{idx + 1}
                                                    </span>
                                                    <span className="font-medium">{entry.username || 'Người chơi'}</span>
                                                </div>
                                                <span className="font-bold text-[--brand]">{entry.score}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

