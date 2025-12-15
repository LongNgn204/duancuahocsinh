// src/components/games/ReflexGame.jsx
// Chú thích: Game luyện phản xạ nhanh - Space bar để tránh chướng ngại vật hoặc phản xạ theo âm thanh/ánh sáng
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Play, Pause, Square, RotateCcw, Volume2, VolumeX, Zap, Target, Trophy, TrendingUp } from 'lucide-react';
import { isLoggedIn, saveGameScore } from '../../utils/api';

const GAME_MODES = {
    visual: {
        label: 'Phản xạ thị giác',
        description: 'Nhấn Space khi thấy chướng ngại vật',
        icon: '👁️',
    },
    audio: {
        label: 'Phản xạ thính giác',
        description: 'Nhấn Space khi nghe thấy tiếng bíp',
        icon: '🔊',
    },
    combo: {
        label: 'Kết hợp',
        description: 'Phản xạ với cả hình ảnh và âm thanh',
        icon: '⚡',
    },
};

// Obstacle types
const OBSTACLE_TYPES = {
    red: { color: '#EF4444', emoji: '🔴', points: 10 },
    yellow: { color: '#F59E0B', emoji: '🟡', points: 20 },
    blue: { color: '#3B82F6', emoji: '🔵', points: 30 },
};

export default function ReflexGame() {
    const [gameState, setGameState] = useState('idle'); // idle | playing | paused | gameOver
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [gameMode, setGameMode] = useState('visual');
    const [obstacles, setObstacles] = useState([]);
    const [playerY, setPlayerY] = useState(50); // 0-100 (percentage)
    const [speed, setSpeed] = useState(1);
    const [level, setLevel] = useState(1);
    const [reactionTime, setReactionTime] = useState(null);
    const [showFlash, setShowFlash] = useState(false);
    const [playSound, setPlaySound] = useState(true);

    const canvasRef = useRef(null);
    const gameLoopRef = useRef(null);
    const obstacleSpawnTimerRef = useRef(null);
    const audioContextRef = useRef(null);
    const beepSoundRef = useRef(null);
    const lastObstacleTimeRef = useRef(0);
    const reactionStartTimeRef = useRef(null);

    // Load high score
    useEffect(() => {
        const saved = localStorage.getItem('reflex_game_high_score');
        if (saved) {
            setHighScore(parseInt(saved, 10));
        }
    }, []);

    // Setup audio context
    useEffect(() => {
        if (typeof window !== 'undefined' && window.AudioContext) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    // Generate beep sound
    const playBeep = useCallback((frequency = 800, duration = 100) => {
        if (!audioContextRef.current || !playSound) return;

        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration / 1000);

        oscillator.start(audioContextRef.current.currentTime);
        oscillator.stop(audioContextRef.current.currentTime + duration / 1000);
    }, [playSound]);

    // Spawn obstacle
    const spawnObstacle = useCallback(() => {
        const types = Object.keys(OBSTACLE_TYPES);
        const type = types[Math.floor(Math.random() * types.length)];
        const obstacleType = OBSTACLE_TYPES[type];

        const newObstacle = {
            id: Date.now() + Math.random(),
            type,
            x: 100, // Start from right
            y: Math.random() * 80 + 10, // Random Y position
            speed: 0.5 + (level * 0.1),
            color: obstacleType.color,
            emoji: obstacleType.emoji,
            points: obstacleType.points,
            spawnedAt: Date.now(),
        };

        setObstacles(prev => [...prev, newObstacle]);

        // For audio mode, play beep when obstacle spawns
        if (gameMode === 'audio' || gameMode === 'combo') {
            playBeep(800, 100);
        }

        // For visual mode, show flash
        if (gameMode === 'visual' || gameMode === 'combo') {
            setShowFlash(true);
            setTimeout(() => setShowFlash(false), 150);
        }

        // Track reaction time start
        reactionStartTimeRef.current = Date.now();
    }, [gameMode, level, playBeep]);

    // Game loop
    useEffect(() => {
        if (gameState !== 'playing') return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        const loop = () => {
            // Clear canvas
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, width, height);

            // Draw player (circle at left side)
            const playerX = width * 0.1;
            const playerYPos = (height * playerY) / 100;

            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(playerX, playerYPos, 20, 0, Math.PI * 2);
            ctx.fill();

            // Draw obstacles
            obstacles.forEach(obstacle => {
                const x = (width * obstacle.x) / 100;
                const y = (height * obstacle.y) / 100;

                ctx.fillStyle = obstacle.color;
                ctx.beginPath();
                ctx.arc(x, y, 25, 0, Math.PI * 2);
                ctx.fill();

                // Draw emoji
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(obstacle.emoji, x, y + 7);
            });

            // Update obstacles
            setObstacles(prev => {
                const updated = prev.map(obs => ({
                    ...obs,
                    x: obs.x - obs.speed,
                })).filter(obs => obs.x > -5); // Remove off-screen

                // Check collisions
                updated.forEach(obs => {
                    const obsX = (width * obs.x) / 100;
                    const obsY = (height * obs.y) / 100;
                    const distance = Math.sqrt(
                        Math.pow(playerX - obsX, 2) + Math.pow(playerYPos - obsY, 2)
                    );

                    if (distance < 45) {
                        // Collision!
                        handleCollision(obs);
                    }
                });

                return updated;
            });

            gameLoopRef.current = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            if (gameLoopRef.current) {
                cancelAnimationFrame(gameLoopRef.current);
            }
        };
    }, [gameState, obstacles, playerY]);

    // Obstacle spawn timer
    useEffect(() => {
        if (gameState !== 'playing') {
            if (obstacleSpawnTimerRef.current) {
                clearInterval(obstacleSpawnTimerRef.current);
            }
            return;
        }

        const spawnInterval = Math.max(1000, 2000 - (level * 100)); // Faster as level increases
        obstacleSpawnTimerRef.current = setInterval(() => {
            spawnObstacle();
        }, spawnInterval);

        return () => {
            if (obstacleSpawnTimerRef.current) {
                clearInterval(obstacleSpawnTimerRef.current);
            }
        };
    }, [gameState, level, spawnObstacle]);

    // Handle collision
    const handleCollision = useCallback((obstacle) => {
        // Calculate reaction time
        if (reactionStartTimeRef.current) {
            const rt = Date.now() - reactionStartTimeRef.current;
            setReactionTime(rt);
        }

        // Remove obstacle
        setObstacles(prev => prev.filter(obs => obs.id !== obstacle.id));

        // Add score
        setScore(prev => {
            const newScore = prev + obstacle.points;
            if (newScore > highScore) {
                setHighScore(newScore);
                localStorage.setItem('reflex_game_high_score', String(newScore));
            }
            return newScore;
        });

        // Level up every 100 points
        setScore(prev => {
            const newLevel = Math.floor(prev / 100) + 1;
            if (newLevel > level) {
                setLevel(newLevel);
                setSpeed(prev => Math.min(prev + 0.1, 3));
            }
            return prev;
        });
    }, [highScore, level]);

    // Handle space bar
    useEffect(() => {
        if (gameState !== 'playing') return;

        const handleKeyDown = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                handleSpacePress();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState]);

    const handleSpacePress = useCallback(() => {
        if (gameState !== 'playing') return;

        // Move player up
        setPlayerY(prev => Math.max(10, prev - 15));

        // Check if near any obstacle (successful dodge)
        const now = Date.now();
        obstacles.forEach(obs => {
            if (obs.x < 30 && obs.x > 10) {
                // Near obstacle, successful dodge
                if (reactionStartTimeRef.current) {
                    const rt = now - reactionStartTimeRef.current;
                    setReactionTime(rt);
                }
                setScore(prev => {
                    const newScore = prev + obs.points;
                    if (newScore > highScore) {
                        setHighScore(newScore);
                        localStorage.setItem('reflex_game_high_score', String(newScore));
                    }
                    return newScore;
                });
                setObstacles(prev => prev.filter(o => o.id !== obs.id));
            }
        });

        // Reset player position after a moment
        setTimeout(() => {
            setPlayerY(prev => Math.min(90, prev + 15));
        }, 200);
    }, [gameState, obstacles, highScore]);

    // Start game
    const startGame = () => {
        setGameState('playing');
        setScore(0);
        setLives(3);
        setLevel(1);
        setSpeed(1);
        setObstacles([]);
        setPlayerY(50);
        setReactionTime(null);
    };

    // Pause/Resume
    const togglePause = () => {
        setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
    };

    // Reset game
    const resetGame = () => {
        setGameState('idle');
        setScore(0);
        setLives(3);
        setLevel(1);
        setSpeed(1);
        setObstacles([]);
        setPlayerY(50);
        setReactionTime(null);
    };

    // Save score to backend
    const saveScore = async () => {
        if (isLoggedIn() && score > 0) {
            try {
                await saveGameScore('reflex', score, level);
            } catch (e) {
                console.warn('[ReflexGame] Failed to save score:', e);
            }
        }
    };

    useEffect(() => {
        if (gameState === 'gameOver') {
            saveScore();
        }
    }, [gameState, score]);

    return (
        <div className="min-h-[70vh] relative">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                            <Zap className="w-8 h-8 text-[--brand]" />
                            <span className="gradient-text">Game Phản Xạ</span>
                        </h1>
                        <p className="text-[--muted] text-sm mt-1">
                            Luyện phản xạ nhanh với Space bar
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold gradient-text">{score}</div>
                            <div className="text-xs text-[--muted]">Điểm</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold gradient-text">{highScore}</div>
                            <div className="text-xs text-[--muted]">Kỷ lục</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold gradient-text">{level}</div>
                            <div className="text-xs text-[--muted]">Cấp độ</div>
                        </div>
                    </div>
                </div>

                {/* Game Mode Selector */}
                {gameState === 'idle' && (
                    <Card>
                        <h3 className="font-semibold mb-4">Chọn chế độ chơi:</h3>
                        <div className="grid sm:grid-cols-3 gap-3">
                            {Object.entries(GAME_MODES).map(([key, mode]) => (
                                <button
                                    key={key}
                                    onClick={() => setGameMode(key)}
                                    className={`p-4 rounded-xl border-2 transition-all ${gameMode === key
                                            ? 'border-[--brand] bg-[--brand]/10'
                                            : 'border-[--surface-border] hover:border-[--brand]/50'
                                        }`}
                                >
                                    <div className="text-3xl mb-2">{mode.icon}</div>
                                    <div className="font-medium text-[--text]">{mode.label}</div>
                                    <div className="text-xs text-[--muted] mt-1">{mode.description}</div>
                                </button>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Game Canvas */}
                <Card variant="elevated">
                    <div className="relative">
                        {/* Flash effect */}
                        <AnimatePresence>
                            {showFlash && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.5 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-white pointer-events-none z-10"
                                    transition={{ duration: 0.15 }}
                                />
                            )}
                        </AnimatePresence>

                        <canvas
                            ref={canvasRef}
                            width={800}
                            height={400}
                            className="w-full h-auto rounded-lg border-2 border-[--surface-border] bg-[#1a1a2e]"
                        />

                        {/* Paused overlay */}
                        {gameState === 'paused' && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                                <div className="text-center">
                                    <Pause className="w-16 h-16 text-white mx-auto mb-4" />
                                    <p className="text-white text-xl font-semibold">Tạm dừng</p>
                                </div>
                            </div>
                        )}

                        {/* Game Over overlay */}
                        {gameState === 'gameOver' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg"
                            >
                                <Card className="max-w-md w-full mx-4">
                                    <div className="text-center">
                                        <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                                        <h3 className="text-2xl font-bold mb-2">Game Over!</h3>
                                        <p className="text-lg mb-4">Điểm số: <span className="font-bold gradient-text">{score}</span></p>
                                        {reactionTime && (
                                            <p className="text-sm text-[--muted] mb-4">
                                                Phản xạ trung bình: {reactionTime}ms
                                            </p>
                                        )}
                                        <div className="flex gap-3 justify-center">
                                            <Button onClick={startGame} icon={<Play size={16} />}>
                                                Chơi lại
                                            </Button>
                                            <Button variant="outline" onClick={resetGame} icon={<RotateCcw size={16} />}>
                                                Reset
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </div>
                </Card>

                {/* Controls */}
                <Card>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            {gameState === 'idle' ? (
                                <Button onClick={startGame} icon={<Play size={18} />} size="lg">
                                    Bắt đầu
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        onClick={togglePause}
                                        variant="outline"
                                        icon={gameState === 'paused' ? <Play size={18} /> : <Pause size={18} />}
                                    >
                                        {gameState === 'paused' ? 'Tiếp tục' : 'Tạm dừng'}
                                    </Button>
                                    <Button onClick={resetGame} variant="ghost" icon={<Square size={18} />}>
                                        Dừng
                                    </Button>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setPlaySound(!playSound)}
                                className={`p-2 rounded-lg transition-colors ${playSound
                                        ? 'bg-[--brand]/10 text-[--brand]'
                                        : 'bg-[--surface-border] text-[--muted]'
                                    }`}
                                title={playSound ? 'Tắt âm thanh' : 'Bật âm thanh'}
                            >
                                {playSound ? <Volume2 size={18} /> : <VolumeX size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="mt-4 p-3 bg-[--surface-border]/50 rounded-lg">
                        <p className="text-sm text-[--muted]">
                            <strong className="text-[--text]">Hướng dẫn:</strong> Nhấn <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded border">Space</kbd> để di chuyển lên và tránh chướng ngại vật.
                            Mỗi chướng ngại vật có điểm khác nhau. Phản xạ càng nhanh, điểm càng cao!
                        </p>
                    </div>
                </Card>

                {/* Reaction Time Display */}
                {reactionTime && gameState === 'playing' && (
                    <Card size="sm">
                        <div className="flex items-center gap-2 text-center">
                            <Target className="w-5 h-5 text-[--brand]" />
                            <span className="text-sm">
                                Phản xạ: <strong>{reactionTime}ms</strong>
                                {reactionTime < 200 && ' ⚡ Cực nhanh!'}
                                {reactionTime >= 200 && reactionTime < 400 && ' 🚀 Tốt!'}
                                {reactionTime >= 400 && ' 👍 Ổn!'}
                            </span>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}

