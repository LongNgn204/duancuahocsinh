// src/components/games/BeeFlying.jsx
// Chú thích: Ong Bay v3.0 - Gameplay Flappy Bird: nhấn để bay, né chướng ngại vật
import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Play, RotateCcw, ArrowLeft, Settings2, Trophy } from 'lucide-react';
import { isLoggedIn, saveGameScore, rewardXP } from '../../utils/api';

const WIDTH = 400;
const HEIGHT = 600;
const BEE_SIZE = 30;
const PIPE_WIDTH = 60;
const PIPE_GAP_BASE = 150;

// Chú thích: Cấu hình độ khó - ảnh hưởng tốc độ, gap và trọng lực
const DIFFICULTY_SETTINGS = {
  easy: {
    label: 'Dễ',
    icon: '🌱',
    pipeSpeed: 2,
    gap: 180,
    gravity: 0.3,
    flapStrength: -6,
  },
  medium: {
    label: 'Trung bình',
    icon: '🔥',
    pipeSpeed: 3,
    gap: 150,
    gravity: 0.4,
    flapStrength: -7,
  },
  hard: {
    label: 'Khó',
    icon: '💀',
    pipeSpeed: 4,
    gap: 120,
    gravity: 0.5,
    flapStrength: -8,
  },
};

export default function BeeFlying() {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);

  // Chú thích: Game state refs để tránh re-render liên tục
  const beeYRef = useRef(HEIGHT / 2);
  const beeVelocityRef = useRef(0);
  const pipesRef = useRef([]);
  const frameCountRef = useRef(0);
  const scoreRef = useRef(0);
  const gameActiveRef = useRef(false);

  const [difficulty, setDifficulty] = useState('medium');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  // Load high score và difficulty từ localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bee_flying_flappy_high_score');
      if (saved) setHighScore(parseInt(saved, 10));
      const savedDiff = localStorage.getItem('bee_flying_flappy_difficulty');
      if (savedDiff && DIFFICULTY_SETTINGS[savedDiff]) setDifficulty(savedDiff);
    } catch (_) { }
  }, []);

  // Save difficulty
  useEffect(() => {
    localStorage.setItem('bee_flying_flappy_difficulty', difficulty);
  }, [difficulty]);

  const getDiffSettings = useCallback(() => DIFFICULTY_SETTINGS[difficulty], [difficulty]);

  // Chú thích: Reset game về trạng thái ban đầu
  const reset = useCallback(() => {
    beeYRef.current = HEIGHT / 2;
    beeVelocityRef.current = 0;
    pipesRef.current = [];
    frameCountRef.current = 0;
    scoreRef.current = 0;
    gameActiveRef.current = true;
    setScore(0);
    setGameOver(false);
    setShowIntro(false);
    setRunning(true);
  }, []);

  const startGame = () => {
    setShowIntro(false);
    reset();
  };

  // Chú thích: Vẽ ong với animation cánh
  const drawBee = (ctx, x, y) => {
    ctx.save();
    const size = BEE_SIZE / 2;

    // Thân ong màu vàng
    ctx.fillStyle = '#FCD34D';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Vạch sọc đen
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - size * 0.8, y - 3, size * 1.6, 4);
    ctx.fillRect(x - size * 0.8, y + 4, size * 1.6, 4);

    // Mắt
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(x + size * 0.5, y - size * 0.3, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x + size * 0.6, y - size * 0.4, 2, 0, Math.PI * 2);
    ctx.fill();

    // Cánh (animation đập)
    const wingOffset = Math.sin(Date.now() / 50) * 4;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.ellipse(x - 5, y - size - 5 + wingOffset, 10, 15, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 5, y - size - 5 + wingOffset, 10, 15, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // Chú thích: Vẽ ống chướng ngại vật (giống Flappy Bird)
  const drawPipe = (ctx, pipe, gap) => {
    const { x, gapY } = pipe;

    // Ống trên
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(x, 0, PIPE_WIDTH, gapY - gap / 2);
    // Viền ống trên
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(x - 3, gapY - gap / 2 - 20, PIPE_WIDTH + 6, 20);

    // Ống dưới
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(x, gapY + gap / 2, PIPE_WIDTH, HEIGHT - (gapY + gap / 2));
    // Viền ống dưới
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(x - 3, gapY + gap / 2, PIPE_WIDTH + 6, 20);
  };

  // Chú thích: Xử lý nhấn để bay lên
  const handleFlap = useCallback(() => {
    if (!gameActiveRef.current) return;
    const settings = getDiffSettings();
    beeVelocityRef.current = settings.flapStrength;
  }, [getDiffSettings]);

  // Chú thích: Game loop chính
  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameActiveRef.current) return;
    const ctx = canvas.getContext('2d');
    const settings = getDiffSettings();

    // Background gradient bầu trời
    const bg = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    bg.addColorStop(0, '#7dd3fc');
    bg.addColorStop(1, '#bae6fd');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Vẽ mây tĩnh
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(80, 100, 25, 0, Math.PI * 2);
    ctx.arc(110, 90, 35, 0, Math.PI * 2);
    ctx.arc(145, 100, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(300, 150, 20, 0, Math.PI * 2);
    ctx.arc(325, 140, 30, 0, Math.PI * 2);
    ctx.arc(355, 150, 20, 0, Math.PI * 2);
    ctx.fill();

    // Vẽ mặt đất
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(0, HEIGHT - 50, WIDTH, 50);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(0, HEIGHT - 60, WIDTH, 15);

    frameCountRef.current++;

    // Chú thích: Áp dụng trọng lực
    beeVelocityRef.current += settings.gravity;
    beeYRef.current += beeVelocityRef.current;

    // Chú thích: Tạo ống mới mỗi 100 frames
    if (frameCountRef.current % 100 === 0) {
      const minGapY = settings.gap / 2 + 50;
      const maxGapY = HEIGHT - settings.gap / 2 - 100;
      const gapY = minGapY + Math.random() * (maxGapY - minGapY);
      pipesRef.current.push({
        x: WIDTH,
        gapY,
        passed: false,
      });
    }

    // Chú thích: Di chuyển và vẽ ống
    const beeX = 80;
    const beeRadius = BEE_SIZE / 2;
    let collision = false;

    pipesRef.current = pipesRef.current.filter(pipe => {
      pipe.x -= settings.pipeSpeed;
      drawPipe(ctx, pipe, settings.gap);

      // Kiểm tra va chạm với ống
      if (
        beeX + beeRadius > pipe.x &&
        beeX - beeRadius < pipe.x + PIPE_WIDTH
      ) {
        if (
          beeYRef.current - beeRadius < pipe.gapY - settings.gap / 2 ||
          beeYRef.current + beeRadius > pipe.gapY + settings.gap / 2
        ) {
          collision = true;
        }
      }

      // Chú thích: Tính điểm khi qua ống
      if (!pipe.passed && pipe.x + PIPE_WIDTH < beeX) {
        pipe.passed = true;
        scoreRef.current++;
        setScore(scoreRef.current);

        // Cập nhật high score
        if (scoreRef.current > highScore) {
          setHighScore(scoreRef.current);
          localStorage.setItem('bee_flying_flappy_high_score', String(scoreRef.current));
        }
      }

      return pipe.x > -PIPE_WIDTH;
    });

    // Vẽ ong
    drawBee(ctx, beeX, beeYRef.current);

    // Chú thích: Kiểm tra va chạm với đất hoặc trần
    if (beeYRef.current + beeRadius > HEIGHT - 60 || beeYRef.current - beeRadius < 0) {
      collision = true;
    }

    // Game Over
    if (collision) {
      gameActiveRef.current = false;
      setGameOver(true);
      setRunning(false);

      // Lưu điểm lên server nếu đã đăng nhập
      if (isLoggedIn() && scoreRef.current > 0) {
        (async () => {
          try {
            await saveGameScore('bee_flying_flappy', scoreRef.current, 1);
            await rewardXP('game_play');
          } catch (e) {
            console.warn('[BeeFlying] Sync failed:', e.message);
          }
        })();
      }
      return;
    }

    // Vẽ điểm trên canvas
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.strokeText(String(scoreRef.current), WIDTH / 2, 70);
    ctx.fillText(String(scoreRef.current), WIDTH / 2, 70);

    rafRef.current = requestAnimationFrame(loop);
  }, [getDiffSettings, highScore]);

  useEffect(() => {
    if (!running) return;
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, loop]);

  // Chú thích: Event listeners cho keyboard và touch
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (showIntro) {
          startGame();
        } else if (gameOver) {
          reset();
        } else if (running) {
          handleFlap();
        }
      }
    };

    const onPointer = () => {
      if (showIntro) {
        startGame();
      } else if (gameOver) {
        reset();
      } else if (running) {
        handleFlap();
      }
    };

    const canvas = canvasRef.current;
    window.addEventListener('keydown', onKey);
    canvas?.addEventListener('pointerdown', onPointer);

    return () => {
      window.removeEventListener('keydown', onKey);
      canvas?.removeEventListener('pointerdown', onPointer);
    };
  }, [showIntro, gameOver, running, handleFlap, reset]);

  const diffSettings = getDiffSettings();

  return (
    <div className="min-h-[70vh] relative px-2 sm:px-4">
      <div className="max-w-md mx-auto w-full space-y-4 sm:space-y-6">
        {/* Header */}
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
                  Ong Bay
                </h1>
                <p className="text-[--muted] text-xs hidden sm:block">
                  Chạm để bay, né ống chướng ngại vật!
                </p>
              </div>
            </div>
          </div>

          <Badge variant="accent" size="sm">
            <Trophy size={12} className="mr-1" />
            {highScore}
          </Badge>
        </div>

        {/* Difficulty selector */}
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
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Game Canvas */}
        <Card size="lg" className="!p-0 overflow-hidden relative">
          {showIntro && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/95 backdrop-blur-sm">
              <div className="text-center space-y-4 sm:space-y-6 p-4 sm:p-8">
                <div className="text-5xl sm:text-6xl mb-4">🐝</div>
                <h2 className="text-xl sm:text-2xl font-bold text-[--text] mb-2">
                  Ong Bay
                </h2>
                <p className="text-[--muted] text-xs sm:text-sm max-w-sm mx-auto">
                  Chạm hoặc nhấn <strong>Space</strong> để ong bay lên.<br />
                  Tránh các ống chướng ngại vật!
                </p>
                <Badge variant="default" size="sm">
                  {diffSettings.icon} {diffSettings.label}
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
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/95 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4 sm:space-y-6 p-4 sm:p-8"
              >
                <div className="text-5xl sm:text-6xl mb-4">
                  {score >= highScore && score > 0 ? '🏆' : '💥'}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[--text] mb-2">
                  Game Over!
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
            className="w-full h-auto touch-none max-w-full"
            style={{ maxHeight: '70vh', aspectRatio: `${WIDTH}/${HEIGHT}` }}
          />
        </Card>

        {/* Instructions */}
        <Card size="sm">
          <div className="text-xs sm:text-sm text-[--muted] space-y-2">
            <p><strong className="text-[--text]">Cách chơi:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Nhấn <strong>Space</strong> hoặc <strong>Chạm</strong> để ong bay lên</li>
              <li>Tránh va chạm vào các ống màu xanh</li>
              <li>Mỗi ống vượt qua = 1 điểm</li>
              <li>Đừng chạm đất hoặc bay quá cao!</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
