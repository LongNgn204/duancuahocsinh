// src/components/games/BeeFlying.jsx
// Chú thích: Ong tập bay - Theo dõi ong, khi ong dừng phải nhấn Space/Click trong 3s, có 3 mạng
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Play, RotateCcw, Heart, Clock, AlertCircle } from 'lucide-react';

const WIDTH = 800;
const HEIGHT = 500;
const BEE_SIZE = 40;
const REACTION_TIME = 3; // 3 giây để phản ứng
const MOVE_DURATION_MIN = 2000; // 2 giây di chuyển tối thiểu
const MOVE_DURATION_MAX = 5000; // 5 giây di chuyển tối đa
const STOP_DURATION = REACTION_TIME * 1000; // Thời gian ong dừng

export default function BeeFlying() {
  const canvasRef = useRef(null);
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
  const reactionTimeLeftRef = useRef(REACTION_TIME);

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [reactionTimeLeft, setReactionTimeLeft] = useState(REACTION_TIME);
  const [isStopped, setIsStopped] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const reset = () => {
    beeXRef.current = WIDTH / 2;
    beeYRef.current = HEIGHT / 2;
    targetXRef.current = WIDTH / 2;
    targetYRef.current = HEIGHT / 2;
    isMovingRef.current = true;
    isStoppedRef.current = false;
    moveStartTimeRef.current = Date.now();
    moveDurationRef.current = MOVE_DURATION_MIN + Math.random() * (MOVE_DURATION_MAX - MOVE_DURATION_MIN);
    reactionTimeLeftRef.current = REACTION_TIME;
    setScore(0);
    setLives(3);
    setGameOver(false);
    setShowIntro(false);
    setRunning(true);
    setIsStopped(false);
    setShowAlert(false);
  };

  const startGame = () => {
    setShowIntro(false);
    reset();
  };

  // Draw bee
  const drawBee = (ctx, x, y, isStopped) => {
    ctx.save();

    // Body
    ctx.fillStyle = '#FCD34D';
    ctx.beginPath();
    ctx.arc(x, y, BEE_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();

    // Stripes
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 12, y - 6, 24, 4);
    ctx.fillRect(x - 12, y + 2, 24, 4);

    // Eye
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(x + 10, y - 6, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x + 12, y - 7, 3, 0, Math.PI * 2);
    ctx.fill();

    // Wings - animate when moving
    const wingOffset = isStopped ? 0 : Math.sin(Date.now() / 100) * 3;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.ellipse(x - 8, y - 20 + wingOffset, 12, 18, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 8, y - 20 + wingOffset, 12, 18, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Glow when stopped
    if (isStopped) {
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#FCD34D';
      ctx.strokeStyle = '#FCD34D';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, BEE_SIZE / 2 + 5, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  };

  // Handle reaction (Space or Click)
  const handleReaction = () => {
    if (!running || !isStoppedRef.current) return;

    // Correct reaction!
    setScore((s) => s + 1);
    isStoppedRef.current = false;
    setIsStopped(false);
    setShowAlert(false);

    // Start moving again
    isMovingRef.current = true;
    moveStartTimeRef.current = Date.now();
    moveDurationRef.current = MOVE_DURATION_MIN + Math.random() * (MOVE_DURATION_MAX - MOVE_DURATION_MIN);

    // New random target
    targetXRef.current = BEE_SIZE + Math.random() * (WIDTH - BEE_SIZE * 2);
    targetYRef.current = BEE_SIZE + Math.random() * (HEIGHT - BEE_SIZE * 2);
  };

  const loop = () => {
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

    const now = Date.now();

    // Update bee movement
    if (isMovingRef.current) {
      const elapsed = now - moveStartTimeRef.current;

      if (elapsed >= moveDurationRef.current) {
        // Stop the bee
        isMovingRef.current = false;
        isStoppedRef.current = true;
        setIsStopped(true);
        stopStartTimeRef.current = now;
        reactionTimeLeftRef.current = REACTION_TIME;
        setReactionTimeLeft(REACTION_TIME);
        setShowAlert(true);
      } else {
        // Move towards target
        const progress = elapsed / moveDurationRef.current;
        const easeProgress = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        beeXRef.current = beeXRef.current + (targetXRef.current - beeXRef.current) * 0.05;
        beeYRef.current = beeYRef.current + (targetYRef.current - beeYRef.current) * 0.05;
      }
    } else if (isStoppedRef.current) {
      // Bee is stopped - countdown reaction time
      const elapsed = (now - stopStartTimeRef.current) / 1000;
      const remaining = Math.max(0, REACTION_TIME - elapsed);
      reactionTimeLeftRef.current = remaining;
      setReactionTimeLeft(remaining);

      if (remaining <= 0) {
        // Time's up - lose a life
        const newLives = lives - 1;
        setLives(newLives);

        if (newLives <= 0) {
          // Game over
          setGameOver(true);
          setRunning(false);
          return;
        }

        // Continue with new life
        isStoppedRef.current = false;
        setIsStopped(false);
        setShowAlert(false);
        isMovingRef.current = true;
        moveStartTimeRef.current = now;
        moveDurationRef.current = MOVE_DURATION_MIN + Math.random() * (MOVE_DURATION_MAX - MOVE_DURATION_MIN);
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

      // Warning text
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('NHẤN SPACE HOẶC CLICK!', WIDTH / 2, HEIGHT - 40);
    }

    if (running) {
      rafRef.current = requestAnimationFrame(loop);
    }
  };

  useEffect(() => {
    if (!running) return;
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, lives]);

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
  }, [showIntro, gameOver, running]);

  return (
    <div className="min-h-[70vh] relative">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center justify-center gap-3 mb-2">
            <span className="text-3xl">🐝</span>
            <span className="gradient-text">Ong tập bay</span>
          </h1>
          <p className="text-[--muted] text-sm">
            Theo dõi ong, khi ong dừng hãy nhấn Space hoặc Click trong {REACTION_TIME} giây!
          </p>
        </div>

        {/* Game Stats */}
        {running && !gameOver && (
          <Card size="sm">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-[--brand]">{score}</div>
                <div className="text-xs text-[--muted]">Điểm</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-red-500">
                  {[...Array(lives)].map((_, i) => (
                    <Heart key={i} size={24} className="fill-red-500 text-red-500" />
                  ))}
                </div>
                <div className="text-xs text-[--muted]">Mạng</div>
              </div>
              {isStopped && (
                <div>
                  <div className="text-2xl font-bold text-orange-500 flex items-center justify-center gap-1">
                    <Clock size={18} />
                    {Math.ceil(reactionTimeLeft)}
                  </div>
                  <div className="text-xs text-[--muted]">Giây còn lại</div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Game Canvas */}
        <Card size="lg" className="p-0 overflow-hidden">
          {showIntro && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/95 backdrop-blur-sm">
              <div className="text-center space-y-6 p-8">
                <div className="text-6xl mb-4">🐝</div>
                <h2 className="text-2xl font-bold text-[--text] mb-2">
                  Ong tập bay
                </h2>
                <p className="text-[--muted] max-w-md mx-auto">
                  Theo dõi con ong di chuyển. Khi ong dừng lại và phát sáng,
                  bạn có {REACTION_TIME} giây để nhấn <strong>Space</strong> hoặc <strong>Click</strong>!
                  <br />
                  <br />
                  Bạn có <strong>3 mạng</strong>. Mất hết mạng thì thua!
                </p>
                <Button onClick={startGame} icon={<Play size={18} />} size="lg">
                  Bắt đầu
                </Button>
              </div>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/95 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 p-8"
              >
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-[--text] mb-2">
                  Kết thúc!
                </h2>
                <div className="text-3xl font-bold text-[--brand] mb-4">
                  Điểm: {score}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={reset} icon={<Play size={18} />}>
                    Chơi lại
                  </Button>
                  <Button
                    onClick={() => {
                      setShowIntro(true);
                      setGameOver(false);
                      setRunning(false);
                    }}
                    variant="outline"
                    icon={<RotateCcw size={18} />}
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
            className="w-full h-auto"
            style={{ maxHeight: '500px' }}
          />
        </Card>

        {/* Instructions */}
        <Card size="sm">
          <div className="text-sm text-[--muted] space-y-2">
            <p><strong className="text-[--text]">Cách chơi:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Theo dõi con ong di chuyển trên màn hình</li>
              <li>Khi ong dừng lại và phát sáng, bạn có {REACTION_TIME} giây để phản ứng</li>
              <li>Nhấn <strong>Space</strong> hoặc <strong>Click</strong> để phản ứng</li>
              <li>Bạn có 3 mạng. Mất hết mạng thì thua!</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}

