// src/components/games/BeeFlying.jsx
// Chú thích: Ong tập bay v2.0 - Với độ khó, nút quay lại, responsive
import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Play, RotateCcw, Heart, Clock, ArrowLeft, Settings2, Trophy } from 'lucide-react';
import { isLoggedIn, saveGameScore, rewardXP } from '../../utils/api';

const WIDTH = 800;
const HEIGHT = 500;
const BEE_SIZE = 40;

// Difficulty settings
const DIFFICULTY_SETTINGS = {
  easy: {
    label: 'Dễ',
    icon: '🌱',
    reactionTime: 4,
    moveDurationMin: 3000,
    moveDurationMax: 6000,
    lives: 5,
  },
  medium: {
    label: 'Trung bình',
    icon: '🔥',
    reactionTime: 3,
    moveDurationMin: 2000,
    moveDurationMax: 5000,
    lives: 3,
  },
  hard: {
    label: 'Khó',
    icon: '💀',
    reactionTime: 2,
    moveDurationMin: 1500,
    moveDurationMax: 3500,
    lives: 2,
  },
};

export default function BeeFlying() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const rafRef = useRef(0);
  const beeXRef = useRef(WIDTH / 2);
  const beeYRef = useRef(HEIGHT / 2);
  const targetXRef = useRef(WIDTH / 2);
  const targetYRef = useRef(HEIGHT / 2);
  const isMovingRef = useRef(true);
  const isStoppedRef = useRef(false);
  const stopStartTimeRef = useRef(0);
  const moveStartTimeRef = useRef(0);
  const moveDurationRef = useRef(0);
  const reactionTimeLeftRef = useRef(3);

  const [difficulty, setDifficulty] = useState('medium');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [reactionTimeLeft, setReactionTimeLeft] = useState(3);
  const [isStopped, setIsStopped] = useState(false);

  // Load settings
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bee_flying_high_score');
      if (saved) setHighScore(parseInt(saved, 10));
      const savedDiff = localStorage.getItem('bee_flying_difficulty');
      if (savedDiff) setDifficulty(savedDiff);
    } catch (_) { }
  }, []);

  // Save difficulty
  useEffect(() => {
    localStorage.setItem('bee_flying_difficulty', difficulty);
  }, [difficulty]);

  const getDiffSettings = useCallback(() => DIFFICULTY_SETTINGS[difficulty], [difficulty]);

  const reset = () => {
    const settings = getDiffSettings();
    beeXRef.current = WIDTH / 2;
    beeYRef.current = HEIGHT / 2;
    targetXRef.current = WIDTH / 2;
    targetYRef.current = HEIGHT / 2;
    isMovingRef.current = true;
    isStoppedRef.current = false;
    moveStartTimeRef.current = Date.now();
    moveDurationRef.current = settings.moveDurationMin + Math.random() * (settings.moveDurationMax - settings.moveDurationMin);
    reactionTimeLeftRef.current = settings.reactionTime;
    setScore(0);
    setLives(settings.lives);
    setGameOver(false);
    setShowIntro(false);
    setRunning(true);
    setIsStopped(false);
  };

  const startGame = () => {
    setShowIntro(false);
    reset();
  };

  // Draw bee
  const drawBee = (ctx, x, y, isStopped, scale = 1) => {
    ctx.save();
    const size = (BEE_SIZE / 2) * scale;

    // Body
    ctx.fillStyle = '#FCD34D';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Stripes
    ctx.fillStyle = '#0f172a';
    const stripeWidth = 24 * scale;
    const stripeHeight = 4 * scale;
    ctx.fillRect(x - stripeWidth / 2, y - stripeHeight * 1.5, stripeWidth, stripeHeight);
    ctx.fillRect(x - stripeWidth / 2, y + stripeHeight * 0.5, stripeWidth, stripeHeight);

    // Eye
    const eyeSize = 6 * scale;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(x + 10 * scale, y - 6 * scale, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x + 12 * scale, y - 7 * scale, eyeSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Wings
    const wingOffset = isStopped ? 0 : Math.sin(Date.now() / 100) * 3;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.ellipse(x - 8 * scale, y - 20 * scale + wingOffset, 12 * scale, 18 * scale, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 8 * scale, y - 20 * scale + wingOffset, 12 * scale, 18 * scale, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Glow when stopped
    if (isStopped) {
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#FCD34D';
      ctx.strokeStyle = '#FCD34D';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, size + 5, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  };

  // Handle reaction
  const handleReaction = useCallback(() => {
    if (!running || !isStoppedRef.current) return;

    const settings = getDiffSettings();
    setScore((s) => {
      const newScore = s + 1;
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('bee_flying_high_score', String(newScore));
      }
      return newScore;
    });

    isStoppedRef.current = false;
    setIsStopped(false);

    isMovingRef.current = true;
    moveStartTimeRef.current = Date.now();
    moveDurationRef.current = settings.moveDurationMin + Math.random() * (settings.moveDurationMax - settings.moveDurationMin);

    targetXRef.current = BEE_SIZE + Math.random() * (WIDTH - BEE_SIZE * 2);
    targetYRef.current = BEE_SIZE + Math.random() * (HEIGHT - BEE_SIZE * 2);
  }, [running, getDiffSettings, highScore]);

  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const settings = getDiffSettings();

    // Clear with gradient background
    const bg = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    bg.addColorStop(0, '#e0f2fe');
    bg.addColorStop(1, '#f0fdf4');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(150, 80, 30, 0, Math.PI * 2);
    ctx.arc(180, 70, 40, 0, Math.PI * 2);
    ctx.arc(220, 80, 30, 0, Math.PI * 2);
    ctx.fill();

    const now = Date.now();

    // Update bee movement
    if (isMovingRef.current) {
      const elapsed = now - moveStartTimeRef.current;

      if (elapsed >= moveDurationRef.current) {
        isMovingRef.current = false;
        isStoppedRef.current = true;
        setIsStopped(true);
        stopStartTimeRef.current = now;
        reactionTimeLeftRef.current = settings.reactionTime;
        setReactionTimeLeft(settings.reactionTime);
      } else {
        beeXRef.current = beeXRef.current + (targetXRef.current - beeXRef.current) * 0.05;
        beeYRef.current = beeYRef.current + (targetYRef.current - beeYRef.current) * 0.05;
      }
    } else if (isStoppedRef.current) {
      const elapsed = (now - stopStartTimeRef.current) / 1000;
      const remaining = Math.max(0, settings.reactionTime - elapsed);
      reactionTimeLeftRef.current = remaining;
      setReactionTimeLeft(remaining);

      if (remaining <= 0) {
        const newLives = lives - 1;
        setLives(newLives);

        if (newLives <= 0) {
          setGameOver(true);
          setRunning(false);

          if (isLoggedIn() && score > 0) {
            (async () => {
              try {
                await saveGameScore('bee_flying', score, 1);
                await rewardXP('game_play');
              } catch (e) {
                console.warn('[BeeFlying] Sync failed:', e.message);
              }
            })();
          }
          return;
        }

        isStoppedRef.current = false;
        setIsStopped(false);
        isMovingRef.current = true;
        moveStartTimeRef.current = now;
        moveDurationRef.current = settings.moveDurationMin + Math.random() * (settings.moveDurationMax - settings.moveDurationMin);
        targetXRef.current = BEE_SIZE + Math.random() * (WIDTH - BEE_SIZE * 2);
        targetYRef.current = BEE_SIZE + Math.random() * (HEIGHT - BEE_SIZE * 2);
      }
    }

    // Draw bee
    drawBee(ctx, beeXRef.current, beeYRef.current, isStoppedRef.current);

    // Draw reaction timer when stopped
    if (isStoppedRef.current) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(Math.ceil(reactionTimeLeftRef.current), WIDTH / 2, 80);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.font = 'bold 20px Arial';
      ctx.fillText('NHẤN SPACE HOẶC CHẠM!', WIDTH / 2, HEIGHT - 40);
    }

    if (running) {
      rafRef.current = requestAnimationFrame(loop);
    }
  }, [running, lives, score, getDiffSettings]);

  useEffect(() => {
    if (!running) return;
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, loop]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (showIntro) {
          startGame();
        } else if (gameOver) {
          reset();
        } else if (running) {
          handleReaction();
        }
      }
    };

    const onPointer = () => {
      if (showIntro) {
        startGame();
      } else if (gameOver) {
        reset();
      } else if (running) {
        handleReaction();
      }
    };

    const canvas = canvasRef.current;
    window.addEventListener('keydown', onKey);
    canvas?.addEventListener('pointerdown', onPointer);

    return () => {
      window.removeEventListener('keydown', onKey);
      canvas?.removeEventListener('pointerdown', onPointer);
    };
  }, [showIntro, gameOver, running, handleReaction]);

  const diffSettings = getDiffSettings();

  return (
    <div className="min-h-[70vh] relative px-2 sm:px-4">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header với nút quay lại */}
        <div className="flex items-center justify-between flex-wrap gap-2">
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
              <span className="text-2xl sm:text-3xl">🐝</span>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold gradient-text">
                  Ong Tập Bay
                </h1>
                <p className="text-[--muted] text-xs hidden sm:block">
                  Nhấn khi ong dừng lại trong {diffSettings.reactionTime}s
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="accent" size="sm">
              <Trophy size={12} className="mr-1" />
              {highScore}
            </Badge>
            {running && (
              <Badge variant="primary" size="sm">
                Điểm: {score}
              </Badge>
            )}
          </div>
        </div>

        {/* Difficulty selector - only when showing intro */}
        {showIntro && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
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
                      {level.lives} mạng, {level.reactionTime}s
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Game Stats */}
        {running && !gameOver && (
          <Card size="sm">
            <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-[--brand]">{score}</div>
                <div className="text-[10px] sm:text-xs text-[--muted]">Điểm</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-lg sm:text-2xl font-bold text-red-500">
                  {[...Array(lives)].map((_, i) => (
                    <Heart key={i} size={16} className="fill-red-500 text-red-500 sm:w-5 sm:h-5" />
                  ))}
                </div>
                <div className="text-[10px] sm:text-xs text-[--muted]">Mạng</div>
              </div>
              {isStopped && (
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-orange-500 flex items-center justify-center gap-1">
                    <Clock size={14} />
                    {Math.ceil(reactionTimeLeft)}
                  </div>
                  <div className="text-[10px] sm:text-xs text-[--muted]">Giây còn lại</div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Game Canvas */}
        <Card size="lg" className="!p-0 overflow-hidden relative" ref={containerRef}>
          {showIntro && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
              <div className="text-center space-y-4 sm:space-y-6 p-4 sm:p-8">
                <div className="text-5xl sm:text-6xl mb-4">🐝</div>
                <h2 className="text-xl sm:text-2xl font-bold text-[--text] mb-2">
                  Ong Tập Bay
                </h2>
                <p className="text-[--muted] text-xs sm:text-sm max-w-md mx-auto">
                  Theo dõi con ong di chuyển. Khi ong dừng lại và phát sáng,
                  bạn có <strong>{diffSettings.reactionTime} giây</strong> để nhấn <strong>Space</strong> hoặc <strong>Chạm</strong>!
                </p>
                <Badge variant="default" size="sm">
                  {diffSettings.icon} {diffSettings.label} - {diffSettings.lives} mạng
                </Badge>
                <div>
                  <Button onClick={startGame} icon={<Play size={18} />} size="lg">
                    Bắt đầu
                  </Button>
                </div>
              </div>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4 sm:space-y-6 p-4 sm:p-8"
              >
                <div className="text-5xl sm:text-6xl mb-4">🎉</div>
                <h2 className="text-xl sm:text-2xl font-bold text-[--text] mb-2">
                  Kết thúc!
                </h2>
                <div className="text-2xl sm:text-3xl font-bold text-[--brand] mb-4">
                  Điểm: {score}
                </div>
                {score >= highScore && score > 0 && (
                  <Badge variant="accent">
                    🎉 Kỷ lục mới!
                  </Badge>
                )}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                  <Button onClick={reset} icon={<Play size={16} />} size="sm">
                    Chơi lại
                  </Button>
                  <Button
                    onClick={() => {
                      setShowIntro(true);
                      setGameOver(false);
                      setRunning(false);
                    }}
                    variant="outline"
                    icon={<RotateCcw size={16} />}
                    size="sm"
                  >
                    Về menu
                  </Button>
                </div>
              </motion.div>
            </div>
          )}

          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            className="w-full h-auto touch-none"
            style={{ maxHeight: '400px' }}
          />
        </Card>

        {/* Instructions */}
        <Card size="sm">
          <div className="text-xs sm:text-sm text-[--muted] space-y-2">
            <p><strong className="text-[--text]">Cách chơi:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Theo dõi con ong di chuyển trên màn hình</li>
              <li>Khi ong dừng lại và phát sáng, bạn có {diffSettings.reactionTime} giây để phản ứng</li>
              <li>Nhấn <strong>Space</strong> hoặc <strong>Chạm</strong> để phản ứng</li>
              <li>Bạn có {diffSettings.lives} mạng. Mất hết mạng thì thua!</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
