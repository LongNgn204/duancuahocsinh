// src/components/games/BeeGame.jsx
// Chú thích: BeeGame v3.1 - Enhanced game UI với nút quay lại, responsive
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import GlowOrbs from '../ui/GlowOrbs';
import { Play, RotateCcw, Trophy, Gamepad2, Star, Info, ArrowLeft } from 'lucide-react';
import { isLoggedIn, saveGameScore, rewardXP } from '../../utils/api';

const WIDTH = 800;
const HEIGHT = 500;
const BEE_X = 120;
const GRAVITY = 0.45;
const FLAP_VELOCITY = -7.5;
const PIPE_SPEED = 2.6;
const PIPE_GAP = 140;
const PIPE_SPAWN_MS = 1600;

export default function BeeGame() {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const obstaclesRef = useRef([]);
  const lastSpawnRef = useRef(0);
  const velocityRef = useRef(0);
  const beeYRef = useRef(HEIGHT / 2);
  const scoreRef = useRef(0);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  // Load high score
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bee_high_score');
      if (saved) setHighScore(parseInt(saved, 10));
    } catch (_) { }
  }, []);

  const reset = () => {
    obstaclesRef.current = [];
    lastSpawnRef.current = 0;
    velocityRef.current = 0;
    beeYRef.current = HEIGHT / 2;
    scoreRef.current = 0;
    setScore(0);
    setGameOver(false);
    setShowIntro(false);
    setRunning(true);
  };

  const startGame = () => {
    setShowIntro(false);
    reset();
  };

  // Draw bee
  const drawBee = (ctx, x, y) => {
    ctx.save();
    // Body
    ctx.fillStyle = '#FCD34D';
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fill();

    // Stripes
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 8, y - 4, 16, 3);
    ctx.fillRect(x - 8, y + 2, 16, 3);

    // Eye
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(x + 8, y - 4, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x + 9, y - 5, 2, 0, Math.PI * 2);
    ctx.fill();

    // Wings
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.ellipse(x - 5, y - 18, 8, 12, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 5, y - 18, 8, 12, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  const spawnPipe = () => {
    const margin = 60;
    const maxTop = HEIGHT - margin - PIPE_GAP - margin;
    const gapTop = margin + Math.random() * maxTop;
    obstaclesRef.current.push({ x: WIDTH + 40, gapTop, passed: false });
  };

  const drawPipes = (ctx) => {
    for (const ob of obstaclesRef.current) {
      // Gradient for pipes
      const gradient = ctx.createLinearGradient(ob.x, 0, ob.x + 60, 0);
      gradient.addColorStop(0, '#0d9488');
      gradient.addColorStop(1, '#14b8a6');
      ctx.fillStyle = gradient;

      // Top pipe
      ctx.beginPath();
      ctx.roundRect(ob.x, 0, 60, ob.gapTop, [0, 0, 10, 10]);
      ctx.fill();

      // Bottom pipe
      const bottomTop = ob.gapTop + PIPE_GAP;
      ctx.beginPath();
      ctx.roundRect(ob.x, bottomTop, 60, HEIGHT - bottomTop, [10, 10, 0, 0]);
      ctx.fill();

      // Pipe caps
      ctx.fillStyle = '#0f766e';
      ctx.fillRect(ob.x - 5, ob.gapTop - 20, 70, 20);
      ctx.fillRect(ob.x - 5, bottomTop, 70, 20);
    }
  };

  const checkCollision = () => {
    const y = beeYRef.current;
    if (y < 0 || y > HEIGHT) return true;
    for (const ob of obstaclesRef.current) {
      const withinX = BEE_X + 18 > ob.x && BEE_X - 18 < ob.x + 60;
      if (withinX) {
        const gapBottom = ob.gapTop + PIPE_GAP;
        const inGap = y - 18 > ob.gapTop && y + 18 < gapBottom;
        if (!inGap) return true;
      }
    }
    return false;
  };

  const loop = (t) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

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
    ctx.beginPath();
    ctx.arc(550, 120, 25, 0, Math.PI * 2);
    ctx.arc(580, 110, 35, 0, Math.PI * 2);
    ctx.arc(615, 120, 25, 0, Math.PI * 2);
    ctx.fill();

    // Spawn pipe
    if (!lastSpawnRef.current) lastSpawnRef.current = t;
    if (t - lastSpawnRef.current > PIPE_SPAWN_MS) {
      spawnPipe();
      lastSpawnRef.current = t;
    }

    // Update physics
    velocityRef.current += GRAVITY;
    beeYRef.current += velocityRef.current;

    // Move pipes
    for (const ob of obstaclesRef.current) {
      ob.x -= PIPE_SPEED;
      if (!ob.passed && ob.x + 60 < BEE_X) {
        ob.passed = true;
        scoreRef.current += 1;
        setScore(scoreRef.current);
      }
    }
    obstaclesRef.current = obstaclesRef.current.filter((ob) => ob.x > -80);

    // Draw pipes
    drawPipes(ctx);

    // Draw bee
    drawBee(ctx, BEE_X, beeYRef.current);

    // Check collision
    if (checkCollision()) {
      // Save high score
      const isNewRecord = scoreRef.current > highScore;
      if (isNewRecord) {
        setHighScore(scoreRef.current);
        try {
          localStorage.setItem('bee_high_score', String(scoreRef.current));
        } catch (_) { }
      }
      setGameOver(true);
      setRunning(false);

      // Sync to server if logged in
      if (isLoggedIn() && scoreRef.current > 0) {
        (async () => {
          try {
            await saveGameScore('bee_game', scoreRef.current, 1);
            await rewardXP('game_play');
            if (isNewRecord) {
              await rewardXP('game_new_record');
            }
            console.log('[BeeGame] Synced score to server:', scoreRef.current);
          } catch (e) {
            console.warn('[BeeGame] Sync failed:', e.message);
          }
        })();
      }
      return;
    }

    if (running) {
      rafRef.current = requestAnimationFrame(loop);
    }
  };

  useEffect(() => {
    if (!running) return;
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (showIntro) {
          startGame();
        } else if (gameOver) {
          reset();
        } else if (running) {
          velocityRef.current = FLAP_VELOCITY;
        }
      } else if (e.code === 'KeyR' && gameOver) {
        reset();
      }
    };

    const onPointer = () => {
      if (showIntro) {
        startGame();
      } else if (gameOver) {
        reset();
      } else if (running) {
        velocityRef.current = FLAP_VELOCITY;
      }
    };

    const canvas = canvasRef.current;
    window.addEventListener('keydown', onKey);
    canvas?.addEventListener('pointerdown', onPointer);

    return () => {
      window.removeEventListener('keydown', onKey);
      canvas?.removeEventListener('pointerdown', onPointer);
    };
  }, [gameOver, running, showIntro]);

  return (
    <div className="min-h-[70vh] relative px-2 sm:px-4">
      <GlowOrbs className="opacity-30" />

      <div className="relative z-10 max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header với nút quay lại */}
        <motion.div
          className="flex items-center justify-between flex-wrap gap-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
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
                  Ong Bay
                </h1>
                <p className="text-[--muted] text-xs hidden sm:block">
                  Thư giãn với mini game vui nhộn
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="accent" size="sm">
              <Star size={12} className="mr-1" />
              {highScore}
            </Badge>
            <Badge variant="primary" size="sm">
              <Trophy size={12} className="mr-1" />
              {score}
            </Badge>
          </div>
        </motion.div>

        {/* Game Container */}
        <Card variant="elevated" className="relative overflow-hidden p-0">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={WIDTH}
              height={HEIGHT}
              className="w-full h-auto block rounded-2xl"
            />

            {/* Intro Overlay */}
            <AnimatePresence>
              {showIntro && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-b from-[--bg]/90 to-[--surface]/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="text-7xl mb-6"
                  >
                    🐝
                  </motion.div>
                  <h2 className="text-3xl font-bold gradient-text mb-2">Ong Bay</h2>
                  <p className="text-[--text-secondary] mb-8 max-w-sm text-center">
                    Giúp chú ong bay qua các chướng ngại vật.
                    Nhấn Space hoặc chạm để bay!
                  </p>
                  <Button size="xl" onClick={startGame} icon={<Play size={22} />}>
                    Bắt đầu chơi
                  </Button>

                  <div className="mt-8 flex items-center gap-6 text-sm text-[--muted]">
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 rounded bg-[--surface-border] text-xs">Space</kbd>
                      <span>để bay</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 rounded bg-[--surface-border] text-xs">R</kbd>
                      <span>chơi lại</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Game Over Overlay */}
            <AnimatePresence>
              {gameOver && (
                <motion.div
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring' }}
                  >
                    <Card variant="elevated" className="text-center p-8">
                      <div className="text-5xl mb-4">💥</div>
                      <h2 className="text-2xl font-bold text-[--text] mb-2">Game Over!</h2>

                      <div className="flex items-center justify-center gap-6 my-6">
                        <div>
                          <div className="text-3xl font-bold gradient-text">{score}</div>
                          <div className="text-xs text-[--muted]">Điểm số</div>
                        </div>
                        <div className="w-px h-12 bg-[--surface-border]" />
                        <div>
                          <div className="text-3xl font-bold text-[--accent]">{highScore}</div>
                          <div className="text-xs text-[--muted]">Kỷ lục</div>
                        </div>
                      </div>

                      {score >= highScore && score > 0 && (
                        <Badge variant="accent" className="mb-4">
                          🎉 Kỷ lục mới!
                        </Badge>
                      )}

                      <Button onClick={reset} icon={<RotateCcw size={18} />}>
                        Chơi lại
                      </Button>
                    </Card>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>

        {/* Tips */}
        <Card size="sm">
          <div className="flex items-start gap-3">
            <Info size={18} className="text-[--brand] shrink-0 mt-0.5" />
            <div className="text-sm text-[--text-secondary]">
              <strong className="text-[--text]">Mẹo:</strong> Nhấn nhẹ và đều đặn để
              giữ ong bay ổn định. Đừng để ong bay quá cao hoặc quá thấp!
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
