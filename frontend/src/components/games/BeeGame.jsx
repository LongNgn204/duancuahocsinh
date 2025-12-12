// src/components/games/BeeGame.jsx
// Chú thích: Minigame ong bay đơn giản (Flappy-like) dùng Canvas API
// - Space/Click/Touch để vỗ cánh (jump)
// - Vật cản dạng cột với khe hở; tính điểm khi vượt qua
// - Có thể restart khi thua
import { useEffect, useRef, useState } from 'react';
import Card from '../ui/Card';

const WIDTH = 800;
const HEIGHT = 500;
const BEE_X = 120; // vị trí ngang cố định của ong
const GRAVITY = 0.45;
const FLAP_VELOCITY = -7.5;
const PIPE_SPEED = 2.6;
const PIPE_GAP = 140; // chiều cao khe
const PIPE_SPAWN_MS = 1600;

export default function BeeGame() {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const obstaclesRef = useRef([]); // mảng cột
  const lastSpawnRef = useRef(0);
  const velocityRef = useRef(0);
  const beeYRef = useRef(HEIGHT / 2);
  const scoreRef = useRef(0);

  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(true);
  const [gameOver, setGameOver] = useState(false);

  const reset = () => {
    obstaclesRef.current = [];
    lastSpawnRef.current = 0;
    velocityRef.current = 0;
    beeYRef.current = HEIGHT / 2;
    scoreRef.current = 0;
    setScore(0);
    setGameOver(false);
    setRunning(true);
  };

  // Vẽ ong đơn giản (hình tròn vàng + viền)
  const drawBee = (ctx, x, y) => {
    ctx.save();
    ctx.fillStyle = '#FFD54F';
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#333';
    ctx.stroke();
    // mắt
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(x + 6, y - 4, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const spawnPipe = () => {
    // Tạo cặp cột với khe ngẫu nhiên theo chiều dọc
    const margin = 40;
    const maxTop = HEIGHT - margin - PIPE_GAP - margin;
    const gapTop = margin + Math.random() * maxTop; // y của đầu khe
    obstaclesRef.current.push({ x: WIDTH + 40, gapTop, passed: false });
  };

  const drawPipes = (ctx) => {
    ctx.fillStyle = '#9CA3AF'; // gray-400
    for (const ob of obstaclesRef.current) {
      // cột trên
      ctx.fillRect(ob.x, 0, 60, ob.gapTop);
      // cột dưới
      const bottomTop = ob.gapTop + PIPE_GAP;
      ctx.fillRect(ob.x, bottomTop, 60, HEIGHT - bottomTop);
    }
  };

  const checkCollision = () => {
    const y = beeYRef.current;
    // chạm trần/sàn
    if (y < 0 || y > HEIGHT) return true;
    // chạm cột
    for (const ob of obstaclesRef.current) {
      const withinX = BEE_X + 16 > ob.x && BEE_X - 16 < ob.x + 60;
      if (withinX) {
        const gapBottom = ob.gapTop + PIPE_GAP;
        const inGap = y - 16 > ob.gapTop && y + 16 < gapBottom;
        if (!inGap) return true;
      }
    }
    return false;
  };

  const loop = (t) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Clear
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Spawn pipe
    if (!lastSpawnRef.current) lastSpawnRef.current = t;
    if (t - lastSpawnRef.current > PIPE_SPAWN_MS) {
      spawnPipe();
      lastSpawnRef.current = t;
    }

    // Update physics ong
    velocityRef.current += GRAVITY;
    beeYRef.current += velocityRef.current;

    // Move pipes và tính điểm
    for (const ob of obstaclesRef.current) {
      ob.x -= PIPE_SPEED;
      if (!ob.passed && ob.x + 60 < BEE_X) {
        ob.passed = true;
        scoreRef.current += 1;
        setScore(scoreRef.current);
      }
    }
    // Remove pipes off-screen
    obstaclesRef.current = obstaclesRef.current.filter((ob) => ob.x > -80);

    // Draw background nhạt (theo theme surface)
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--surface') || '#E6E6FA';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Draw pipes
    drawPipes(ctx);

    // Draw bee
    drawBee(ctx, BEE_X, beeYRef.current);

    // HUD điểm
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text') || '#111827';
    ctx.font = 'bold 20px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillText(`Điểm: ${scoreRef.current}`, 16, 28);

    // Kiểm tra va chạm
    if (checkCollision()) {
      setGameOver(true);
      setRunning(false);
    }

    if (running) {
      rafRef.current = requestAnimationFrame(loop);
    } else {
      // Overlay Game Over
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 28px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto';
      ctx.fillText('Game Over', WIDTH / 2 - 80, HEIGHT / 2 - 10);
      ctx.font = '16px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto';
      ctx.fillText('Nhấn R để chơi lại', WIDTH / 2 - 80, HEIGHT / 2 + 16);
    }
  };

  useEffect(() => {
    if (!running) return; // pause khi thua
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameOver) return;
        velocityRef.current = FLAP_VELOCITY; // flap
      } else if (e.code === 'KeyR') {
        reset();
      }
    };
    const onPointer = () => {
      if (gameOver) return;
      velocityRef.current = FLAP_VELOCITY;
    };

    const canvas = canvasRef.current;
    window.addEventListener('keydown', onKey);
    canvas?.addEventListener('pointerdown', onPointer);

    return () => {
      window.removeEventListener('keydown', onKey);
      canvas?.removeEventListener('pointerdown', onPointer);
    };
  }, [gameOver]);

  return (
    <Card className="p-4">
      <div className="text-gray-600 mb-3 text-sm">Nhấn Space hoặc chạm để bay. Tránh các cột và ghi điểm!</div>
      <div className="overflow-auto md:overflow-visible">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          className="border rounded-lg bg-white shadow"
        />
      </div>
    </Card>
  );
}
