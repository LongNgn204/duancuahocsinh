// src/pages/games/MatchShape.jsx
// Chú thích: Game Chọn hình tương ứng - 30-60s, hiển thị 5 hình, chọn hình tương ứng trong 5s
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Star, Droplet, Sun, TreePine, Flower2, Play, RotateCcw, Trophy, Clock, Target } from 'lucide-react';

// Danh sách hình
const SHAPES = [
  { id: 'star', icon: Star, label: 'Ngôi sao', emoji: '⭐', color: 'from-yellow-400 to-orange-400' },
  { id: 'droplet', icon: Droplet, label: 'Giọt nước', emoji: '💧', color: 'from-blue-400 to-cyan-400' },
  { id: 'sun', icon: Sun, label: 'Mặt trời', emoji: '☀️', color: 'from-amber-400 to-yellow-400' },
  { id: 'tree', icon: TreePine, label: 'Cây', emoji: '🌳', color: 'from-green-400 to-emerald-400' },
  { id: 'flower', icon: Flower2, label: 'Hoa', emoji: '🌸', color: 'from-pink-400 to-rose-400' },
];

// Thời gian game (30-60s)
const GAME_DURATION = 45; // 45 giây
const REACTION_TIME = 5; // 5 giây để chọn

export default function MatchShape() {
  const [gameState, setGameState] = useState('idle'); // idle, playing, gameOver
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [currentTarget, setCurrentTarget] = useState(null);
  const [reactionTimeLeft, setReactionTimeLeft] = useState(REACTION_TIME);
  const [round, setRound] = useState(0);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);

  // Random target shape
  const getRandomTarget = useCallback(() => {
    return SHAPES[Math.floor(Math.random() * SHAPES.length)];
  }, []);

  // Start new round
  const startNewRound = useCallback(() => {
    const target = getRandomTarget();
    setCurrentTarget(target);
    setReactionTimeLeft(REACTION_TIME);
    setRound((r) => r + 1);
  }, [getRandomTarget]);

  // Handle shape selection
  const handleShapeSelect = (selectedShape) => {
    if (gameState !== 'playing' || !currentTarget) return;

    if (selectedShape.id === currentTarget.id) {
      // Correct!
      setScore((s) => s + 1);
      setCorrectStreak((s) => s + 1);
      startNewRound();
    } else {
      // Wrong
      setWrongAnswers((w) => w + 1);
      setCorrectStreak(0);
      // Still continue to next round
      startNewRound();
    }
  };

  // Start game
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setRound(0);
    setCorrectStreak(0);
    setWrongAnswers(0);
    startNewRound();
  };

  // Reset game
  const resetGame = () => {
    setGameState('idle');
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setCurrentTarget(null);
    setReactionTimeLeft(REACTION_TIME);
    setRound(0);
    setCorrectStreak(0);
    setWrongAnswers(0);
  };

  // Game timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setGameState('gameOver');
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Reaction timer
  useEffect(() => {
    if (gameState !== 'playing' || !currentTarget) return;

    const timer = setInterval(() => {
      setReactionTimeLeft((t) => {
        if (t <= 1) {
          // Time's up, move to next round
          setWrongAnswers((w) => w + 1);
          setCorrectStreak(0);
          startNewRound();
          return REACTION_TIME;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, currentTarget, startNewRound]);

  // Calculate accuracy
  const accuracy = round > 0 ? Math.round((score / round) * 100) : 0;

  return (
    <div className="min-h-[70vh] relative">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center justify-center gap-3 mb-2">
            <Target className="w-8 h-8 text-[--brand]" />
            <span className="gradient-text">Chọn hình tương ứng</span>
          </h1>
          <p className="text-[--muted] text-sm">
            Chọn hình giống với hình hiển thị trong {REACTION_TIME} giây
          </p>
        </div>

        {/* Game Stats */}
        {gameState === 'playing' && (
          <Card size="sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-[--brand]">{score}</div>
                <div className="text-xs text-[--muted]">Điểm</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-500 flex items-center justify-center gap-1">
                  <Clock size={18} />
                  {timeLeft}
                </div>
                <div className="text-xs text-[--muted]">Giây còn lại</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">{correctStreak}</div>
                <div className="text-xs text-[--muted]">Chuỗi đúng</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">{wrongAnswers}</div>
                <div className="text-xs text-[--muted]">Sai</div>
              </div>
            </div>
          </Card>
        )}

        {/* Game Area */}
        <Card size="lg" className="text-center">
          {gameState === 'idle' && (
            <div className="space-y-6 py-8">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-xl font-semibold text-[--text] mb-2">
                Sẵn sàng chơi?
              </h2>
              <p className="text-[--muted] text-sm mb-6">
                Bạn sẽ có {GAME_DURATION} giây để chọn đúng càng nhiều hình càng tốt!
                <br />
                Mỗi lần bạn có {REACTION_TIME} giây để chọn.
              </p>
              <Button onClick={startGame} icon={<Play size={18} />} size="lg">
                Bắt đầu
              </Button>
            </div>
          )}

          {gameState === 'playing' && currentTarget && (
            <div className="space-y-8">
              {/* Target Shape */}
              <div>
                <p className="text-sm text-[--muted] mb-4">Chọn hình này:</p>
                <motion.div
                  key={currentTarget.id}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="inline-block"
                >
                  <div
                    className={`
                      w-32 h-32 rounded-2xl bg-gradient-to-br ${currentTarget.color}
                      flex items-center justify-center text-6xl shadow-2xl
                      mx-auto
                    `}
                  >
                    {currentTarget.emoji}
                  </div>
                </motion.div>
                <p className="text-lg font-semibold text-[--text] mt-4">
                  {currentTarget.label}
                </p>

                {/* Reaction Timer */}
                <div className="mt-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock size={16} className="text-orange-500" />
                    <span className="text-sm font-medium text-[--text]">
                      Còn lại: {reactionTimeLeft} giây
                    </span>
                  </div>
                  <div className="w-full max-w-xs mx-auto h-2 bg-[--surface-border] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-orange-400 to-red-500"
                      initial={{ width: '100%' }}
                      animate={{ width: `${(reactionTimeLeft / REACTION_TIME) * 100}%` }}
                      transition={{ duration: 1, ease: 'linear' }}
                    />
                  </div>
                </div>
              </div>

              {/* Shape Options */}
              <div>
                <p className="text-sm text-[--muted] mb-4">Chọn hình tương ứng:</p>
                <div className="grid grid-cols-5 gap-3 max-w-md mx-auto">
                  {SHAPES.map((shape) => {
                    const Icon = shape.icon;
                    return (
                      <motion.button
                        key={shape.id}
                        onClick={() => handleShapeSelect(shape)}
                        className={`
                          w-16 h-16 rounded-xl bg-gradient-to-br ${shape.color}
                          flex items-center justify-center text-3xl shadow-lg
                          hover:scale-110 active:scale-95 transition-transform
                          ${shape.id === currentTarget.id ? 'ring-4 ring-yellow-400 ring-offset-2' : ''}
                        `}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title={shape.label}
                      >
                        {shape.emoji}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {gameState === 'gameOver' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 py-8"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-[--text] mb-2">
                Kết thúc!
              </h2>

              {/* Final Stats */}
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200">
                  <div className="text-3xl font-bold text-yellow-600">{score}</div>
                  <div className="text-xs text-yellow-700 mt-1">Điểm số</div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600">{accuracy}%</div>
                  <div className="text-xs text-blue-700 mt-1">Độ chính xác</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={startGame} icon={<Play size={18} />}>
                  Chơi lại
                </Button>
                <Button onClick={resetGame} variant="outline" icon={<RotateCcw size={18} />}>
                  Về menu
                </Button>
              </div>
            </motion.div>
          )}
        </Card>

        {/* Instructions */}
        <Card size="sm">
          <div className="text-sm text-[--muted] space-y-2">
            <p><strong className="text-[--text]">Cách chơi:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Máy sẽ hiển thị một hình ngẫu nhiên</li>
              <li>Bạn có {REACTION_TIME} giây để chọn hình tương ứng</li>
              <li>Chọn đúng được điểm, chọn sai hoặc hết giờ không được điểm</li>
              <li>Chơi trong {GAME_DURATION} giây và cố gắng đạt điểm cao nhất!</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}

