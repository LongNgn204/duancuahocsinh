// src/components/games/ReflexGame.jsx
// Chú thích: Game luyện phản xạ v2.0 - Với GameLayout, độ khó, responsive
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import {
    Play, Pause, Square, RotateCcw, Volume2, VolumeX,
    Zap, Target, Trophy, ArrowLeft, Settings2
} from 'lucide-react';
import { isLoggedIn, saveGameScore } from '../../utils/api';

// Difficulty settings
const DIFFICULTY_SETTINGS = {
    easy: {
        label: 'Dễ',
        icon: '🌱',
        spawnInterval: 2500,
        obstacleSpeed: 0.3,
        lives: 5,
    },
    medium: {
        label: 'Trung bình',
        icon: '🔥',
        spawnInterval: 1800,
        obstacleSpeed: 0.5,
        lives: 3,
    },
    hard: {
        label: 'Khó',
        icon: '💀',
        spawnInterval: 1200,
        obstacleSpeed: 0.7,
        lives: 2,
    },
};

const GAME_MODES = {
    visual: {
        label: 'Thị giác',
        description: 'Nhấn khi thấy chướng ngại vật',
        icon: '👁️',
    },
    audio: {
        label: 'Thính giác',
        description: 'Nhấn khi nghe tiếng bíp',
        icon: '🔊',
    },
    combo: {
        label: 'Kết hợp',
        description: 'Cả hình ảnh và âm thanh',
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
    const [difficulty, setDifficulty] = useState('medium');
    const [obstacles, setObstacles] = useState([]);
    const [playerY, setPlayerY] = useState(50);
    const [level, setLevel] = useState(1);
    const [reactionTime, setReactionTime] = useState(null);
    const [showFlash, setShowFlash] = useState(false);
    const [playSound, setPlaySound] = useState(true);

    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const gameLoopRef = useRef(null);
    const obstacleSpawnTimerRef = useRef(null);
    const audioContextRef = useRef(null);
    const reactionStartTimeRef = useRef(null);

    // Load high score
    useEffect(() => {
        const saved = localStorage.getItem('reflex_game_high_score');
        if (saved) setHighScore(parseInt(saved, 10));

        const savedDiff = localStorage.getItem('reflex_game_difficulty');
        if (savedDiff) setDifficulty(savedDiff);
    }, []);

    // Save difficulty preference
    useEffect(() => {
        localStorage.setItem('reflex_game_difficulty', difficulty);
    }, [difficulty]);

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

    // Get difficulty settings
    const getDiffSettings = useCallback(() => DIFFICULTY_SETTINGS[difficulty], [difficulty]);

    // Spawn obstacle
    const spawnObstacle = useCallback(() => {
        const types = Object.keys(OBSTACLE_TYPES);
        const type = types[Math.floor(Math.random() * types.length)];
        const obstacleType = OBSTACLE_TYPES[type];
        const diffSettings = getDiffSettings();

        const newObstacle = {
            id: Date.now() + Math.random(),
            type,
            x: 100,
            y: Math.random() * 80 + 10,
            speed: diffSettings.obstacleSpeed + (level * 0.05),
            color: obstacleType.color,
            emoji: obstacleType.emoji,
            points: obstacleType.points,
            spawnedAt: Date.now(),
        };

        setObstacles(prev => [...prev, newObstacle]);

        if (gameMode === 'audio' || gameMode === 'combo') {
            playBeep(800, 100);
        }

        if (gameMode === 'visual' || gameMode === 'combo') {
            setShowFlash(true);
            setTimeout(() => setShowFlash(false), 150);
        }

        reactionStartTimeRef.current = Date.now();
    }, [gameMode, level, playBeep, getDiffSettings]);

    // Game loop with responsive canvas
    useEffect(() => {
        if (gameState !== 'playing') return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Responsive canvas size
        const container = containerRef.current;
        const updateCanvasSize = () => {
            if (container) {
                const rect = container.getBoundingClientRect();
                const dpr = window.devicePixelRatio || 1;
                canvas.width = rect.width * dpr;
                canvas.height = Math.min(rect.width * 0.5, 300) * dpr;
                canvas.style.width = `${rect.width}px`;
                canvas.style.height = `${Math.min(rect.width * 0.5, 300)}px`;
                ctx.scale(dpr, dpr);
            }
        };
        updateCanvasSize();

        const width = canvas.width / (window.devicePixelRatio || 1);
        const height = canvas.height / (window.devicePixelRatio || 1);

        const loop = () => {
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, width, height);

            // Draw player
            const playerX = width * 0.1;
            const playerYPos = (height * playerY) / 100;

            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(playerX, playerYPos, Math.min(20, width * 0.05), 0, Math.PI * 2);
            ctx.fill();

            // Draw obstacles
            obstacles.forEach(obstacle => {
                const x = (width * obstacle.x) / 100;
                const y = (height * obstacle.y) / 100;
                const radius = Math.min(25, width * 0.06);

                ctx.fillStyle = obstacle.color;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();

                ctx.font = `${Math.min(20, width * 0.05)}px Arial`;
                ctx.textAlign = 'center';
                ctx.fillText(obstacle.emoji, x, y + 7);
            });

            // Update obstacles
            setObstacles(prev => {
                const updated = prev.map(obs => ({
                    ...obs,
                    x: obs.x - obs.speed,
                })).filter(obs => obs.x > -5);

                // Check collisions
                updated.forEach(obs => {
                    const obsX = (width * obs.x) / 100;
                    const obsY = (height * obs.y) / 100;
                    const distance = Math.sqrt(
                        Math.pow(playerX - obsX, 2) + Math.pow(playerYPos - obsY, 2)
                    );

                    if (distance < 45) {
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

        const diffSettings = getDiffSettings();
        const spawnInterval = Math.max(800, diffSettings.spawnInterval - (level * 100));

        obstacleSpawnTimerRef.current = setInterval(() => {
            spawnObstacle();
        }, spawnInterval);

        return () => {
            if (obstacleSpawnTimerRef.current) {
                clearInterval(obstacleSpawnTimerRef.current);
            }
        };
    }, [gameState, level, spawnObstacle, getDiffSettings]);

    // Handle collision
    const handleCollision = useCallback((obstacle) => {
        if (reactionStartTimeRef.current) {
            const rt = Date.now() - reactionStartTimeRef.current;
            setReactionTime(rt);
        }

        setObstacles(prev => prev.filter(obs => obs.id !== obstacle.id));

        setScore(prev => {
            const newScore = prev + obstacle.points;
            if (newScore > highScore) {
                setHighScore(newScore);
                localStorage.setItem('reflex_game_high_score', String(newScore));
            }
            return newScore;
        });

        // Level up
        setScore(prev => {
            const newLevel = Math.floor(prev / 100) + 1;
            if (newLevel > level) {
                setLevel(newLevel);
            }
            return prev;
        });
    }, [highScore, level]);

    // Handle space bar and touch
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

        setPlayerY(prev => Math.max(10, prev - 15));

        const now = Date.now();
        obstacles.forEach(obs => {
            if (obs.x < 30 && obs.x > 10) {
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

        setTimeout(() => {
            setPlayerY(prev => Math.min(90, prev + 15));
        }, 200);
    }, [gameState, obstacles, highScore]);

    // Start game
    const startGame = () => {
        const diffSettings = getDiffSettings();
        setGameState('playing');
        setScore(0);
        setLives(diffSettings.lives);
        setLevel(1);
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
        setLevel(1);
        setObstacles([]);
        setPlayerY(50);
        setReactionTime(null);
    };

    // Save score
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

    const diffSettings = getDiffSettings();

    return (
        <div className="min-h-[70vh] relative px-2 sm:px-4">
            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
                {/* Header với nút quay lại */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link to="/games">
                            <Button
                                variant="ghost"
                                size="sm"
                                icon={<ArrowLeft size={16} />}
                                className="!p-2 sm:!px-3"
                            >
                                <span className="hidden sm:inline">Quay lại</span>
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-[--brand]" />
                            <div>
                                <h1 className="text-lg sm:text-xl md:text-2xl font-bold gradient-text">
                                    Game Phản Xạ
                                </h1>
                            </div>
                        </div>
                    </div>

                    {/* Score badges */}
                    <div className="flex items-center gap-2">
                        <Badge variant="accent" size="sm">
                            <Trophy size={12} className="mr-1" />
                            {highScore}
                        </Badge>
                        <Badge variant="primary" size="sm">
                            Điểm: {score}
                        </Badge>
                        <Badge variant="default" size="sm">
                            Lv.{level}
                        </Badge>
                    </div>
                </div>

                {/* Difficulty & Mode selector - chỉ khi idle */}
                {gameState === 'idle' && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        {/* Difficulty selector */}
                        <Card size="sm">
                            <div className="flex items-center gap-2 mb-3">
                                <Settings2 size={16} className="text-[--brand]" />
                                <span className="font-medium text-sm">Độ khó:</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                {Object.entries(DIFFICULTY_SETTINGS).map(([key, level]) => (
                                    <button
                                        key={key}
                                        onClick={() => setDifficulty(key)}
                                        className={`
                                            p-2 sm:p-3 rounded-xl border-2 transition-all text-center
                                            ${difficulty === key
                                                ? 'border-[--brand] bg-[--brand]/10 shadow-md'
                                                : 'border-[--surface-border] hover:border-[--brand]/50'
                                            }
                                        `}
                                    >
                                        <div className="text-xl sm:text-2xl mb-1">{level.icon}</div>
                                        <div className="font-medium text-xs sm:text-sm text-[--text]">
                                            {level.label}
                                        </div>
                                        <div className="text-[10px] text-[--muted]">
                                            {level.lives} mạng
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </Card>

                        {/* Game Mode selector */}
                        <Card size="sm">
                            <h3 className="font-semibold text-sm mb-3">Chế độ chơi:</h3>
                            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                {Object.entries(GAME_MODES).map(([key, mode]) => (
                                    <button
                                        key={key}
                                        onClick={() => setGameMode(key)}
                                        className={`
                                            p-2 sm:p-3 rounded-xl border-2 transition-all text-center
                                            ${gameMode === key
                                                ? 'border-[--brand] bg-[--brand]/10'
                                                : 'border-[--surface-border] hover:border-[--brand]/50'
                                            }
                                        `}
                                    >
                                        <div className="text-xl sm:text-2xl mb-1">{mode.icon}</div>
                                        <div className="font-medium text-xs sm:text-sm text-[--text]">
                                            {mode.label}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* Game Canvas */}
                <Card variant="elevated" className="!p-2 sm:!p-4">
                    <div className="relative" ref={containerRef}>
                        {/* Flash effect */}
                        <AnimatePresence>
                            {showFlash && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.5 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-white pointer-events-none z-10 rounded-lg"
                                    transition={{ duration: 0.15 }}
                                />
                            )}
                        </AnimatePresence>

                        <canvas
                            ref={canvasRef}
                            className="w-full rounded-lg border-2 border-[--surface-border] bg-[#1a1a2e] touch-none"
                            onClick={handleSpacePress}
                            onTouchStart={(e) => {
                                handleSpacePress();
                            }}
                        />

                        {/* Paused overlay */}
                        {gameState === 'paused' && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                                <div className="text-center">
                                    <Pause className="w-12 h-12 sm:w-16 sm:h-16 text-white mx-auto mb-2 sm:mb-4" />
                                    <p className="text-white text-lg sm:text-xl font-semibold">Tạm dừng</p>
                                </div>
                            </div>
                        )}

                        {/* Game Over overlay */}
                        {gameState === 'gameOver' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg p-4"
                            >
                                <Card className="max-w-sm w-full">
                                    <div className="text-center">
                                        <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-500 mx-auto mb-2 sm:mb-4" />
                                        <h3 className="text-xl sm:text-2xl font-bold mb-2">Game Over!</h3>
                                        <p className="text-base sm:text-lg mb-2">
                                            Điểm: <span className="font-bold gradient-text">{score}</span>
                                        </p>
                                        {reactionTime && (
                                            <p className="text-xs sm:text-sm text-[--muted] mb-4">
                                                Phản xạ: {reactionTime}ms
                                            </p>
                                        )}
                                        <div className="flex gap-2 sm:gap-3 justify-center flex-wrap">
                                            <Button onClick={startGame} icon={<Play size={16} />} size="sm">
                                                Chơi lại
                                            </Button>
                                            <Button variant="outline" onClick={resetGame} icon={<RotateCcw size={16} />} size="sm">
                                                Về menu
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {/* Idle overlay - Start screen */}
                        {gameState === 'idle' && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                                <div className="text-center px-4">
                                    <Zap className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-400 mx-auto mb-3 sm:mb-4" />
                                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                                        Sẵn sàng chưa?
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-300 mb-3 sm:mb-4">
                                        {GAME_MODES[gameMode].description}
                                    </p>
                                    <Button onClick={startGame} icon={<Play size={18} />}>
                                        Bắt đầu
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Controls */}
                <Card size="sm">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                            {gameState === 'playing' && (
                                <>
                                    <Button
                                        onClick={togglePause}
                                        variant="outline"
                                        size="sm"
                                        icon={<Pause size={16} />}
                                    >
                                        <span className="hidden sm:inline">Tạm dừng</span>
                                    </Button>
                                    <Button onClick={resetGame} variant="ghost" size="sm" icon={<Square size={16} />}>
                                        <span className="hidden sm:inline">Dừng</span>
                                    </Button>
                                </>
                            )}
                            {gameState === 'paused' && (
                                <Button
                                    onClick={togglePause}
                                    size="sm"
                                    icon={<Play size={16} />}
                                >
                                    Tiếp tục
                                </Button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {gameState !== 'idle' && (
                                <Badge variant="default" size="sm">
                                    {diffSettings.icon} {diffSettings.label}
                                </Badge>
                            )}
                            <button
                                onClick={() => setPlaySound(!playSound)}
                                className={`p-2 rounded-lg transition-colors ${playSound
                                    ? 'bg-[--brand]/10 text-[--brand]'
                                    : 'bg-[--surface-border] text-[--muted]'
                                    }`}
                                title={playSound ? 'Tắt âm thanh' : 'Bật âm thanh'}
                            >
                                {playSound ? <Volume2 size={16} /> : <VolumeX size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="mt-3 p-2 sm:p-3 bg-[--surface-border]/50 rounded-lg">
                        <p className="text-xs sm:text-sm text-[--muted]">
                            <strong className="text-[--text]">Hướng dẫn:</strong>{' '}
                            <span className="hidden sm:inline">
                                Nhấn <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded border text-xs">Space</kbd> hoặc chạm màn hình để né chướng ngại vật.
                            </span>
                            <span className="sm:hidden">
                                Chạm màn hình để né chướng ngại vật.
                            </span>
                        </p>
                    </div>
                </Card>

                {/* Reaction Time Display */}
                {reactionTime && gameState === 'playing' && (
                    <Card size="sm">
                        <div className="flex items-center justify-center gap-2 text-center">
                            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-[--brand]" />
                            <span className="text-xs sm:text-sm">
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
