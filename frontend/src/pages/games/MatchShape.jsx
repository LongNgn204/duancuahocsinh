// src/pages/games/MatchShape.jsx
// Chú thích: Game Chọn hình tương ứng v2.0 - Với độ khó, nút quay lại, responsive
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import {
  Star, Droplet, Sun, TreePine, Flower2, Play, RotateCcw,
  Trophy, Clock, Target, ArrowLeft, Settings2, Heart, Moon, Cloud
} from 'lucide-react';

// Danh sách hình - mở rộng để khó hơn
const SHAPES = [
  { id: 'star', icon: Star, label: 'Ngôi sao', emoji: '⭐', color: 'from-yellow-400 to-orange-400' },
  { id: 'droplet', icon: Droplet, label: 'Giọt nước', emoji: '💧', color: 'from-blue-400 to-cyan-400' },
  { id: 'sun', icon: Sun, label: 'Mặt trời', emoji: '☀️', color: 'from-amber-400 to-yellow-400' },
  { id: 'tree', icon: TreePine, label: 'Cây', emoji: '🌳', color: 'from-green-400 to-emerald-400' },
  { id: 'flower', icon: Flower2, label: 'Hoa', emoji: '🌸', color: 'from-pink-400 to-rose-400' },
  { id: 'heart', icon: Heart, label: 'Trái tim', emoji: '❤️', color: 'from-red-400 to-pink-400' },
  { id: 'moon', icon: Moon, label: 'Mặt trăng', emoji: '🌙', color: 'from-indigo-400 to-purple-400' },
  { id: 'cloud', icon: Cloud, label: 'Mây', emoji: '☁️', color: 'from-gray-300 to-blue-300' },
];

// Difficulty settings
const DIFFICULTY_SETTINGS = {
  easy: {
    label: 'Dễ',
    icon: '🌱',
    gameDuration: 60,
    reactionTime: 7,
    shapeCount: 4,
    description: 'Nhiều thời gian hơn',
  },
  medium: {
    label: 'Trung bình',
    icon: '🔥',
    gameDuration: 45,
    reactionTime: 5,
    shapeCount: 5,
    description: 'Thử thách vừa phải',
  },
  hard: {
    label: 'Khó',
    icon: '💀',
    gameDuration: 30,
    reactionTime: 3,
    shapeCount: 8,
    description: 'Nhiều hình, ít thời gian',
  },
};

export default function MatchShape() {
  const [gameState, setGameState] = useState('idle'); // idle, playing, gameOver
  const [difficulty, setDifficulty] = useState('medium');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [currentTarget, setCurrentTarget] = useState(null);
  const [reactionTimeLeft, setReactionTimeLeft] = useState(5);
  const [round, setRound] = useState(0);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [availableShapes, setAvailableShapes] = useState(SHAPES.slice(0, 5));

  // Load high score and difficulty
  useEffect(() => {
    try {
      const saved = localStorage.getItem('match_shape_high_score');
      if (saved) setHighScore(parseInt(saved, 10));
      const savedDiff = localStorage.getItem('match_shape_difficulty');
      if (savedDiff) setDifficulty(savedDiff);
    } catch (_) { }
  }, []);

  // Save difficulty
  useEffect(() => {
    localStorage.setItem('match_shape_difficulty', difficulty);
  }, [difficulty]);

  // Get difficulty settings
  const getDiffSettings = useCallback(() => DIFFICULTY_SETTINGS[difficulty], [difficulty]);

  // Random target shape
  const getRandomTarget = useCallback(() => {
    return availableShapes[Math.floor(Math.random() * availableShapes.length)];
  }, [availableShapes]);

  // Start new round
  const startNewRound = useCallback(() => {
    const target = getRandomTarget();
    setCurrentTarget(target);
    setReactionTimeLeft(getDiffSettings().reactionTime);
    setRound((r) => r + 1);
  }, [getRandomTarget, getDiffSettings]);

  // Handle shape selection
  const handleShapeSelect = (selectedShape) => {
    if (gameState !== 'playing' || !currentTarget) return;

    if (selectedShape.id === currentTarget.id) {
      // Correct!
      const newScore = score + 1;
      setScore(newScore);
      setCorrectStreak((s) => s + 1);

      // Update high score
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('match_shape_high_score', String(newScore));
      }

      startNewRound();
    } else {
      // Wrong
      setWrongAnswers((w) => w + 1);
      setCorrectStreak(0);
      startNewRound();
    }
  };

  // Start game
  const startGame = () => {
    const settings = getDiffSettings();
    setAvailableShapes(SHAPES.slice(0, settings.shapeCount));
    setGameState('playing');
    setScore(0);
    setTimeLeft(settings.gameDuration);
    setRound(0);
    setCorrectStreak(0);
    setWrongAnswers(0);

    // Start first round after setting available shapes
    setTimeout(() => {
      const target = SHAPES.slice(0, settings.shapeCount)[Math.floor(Math.random() * settings.shapeCount)];
      setCurrentTarget(target);
      setReactionTimeLeft(settings.reactionTime);
      setRound(1);
    }, 100);
  };

  // Reset game
  const resetGame = () => {
    setGameState('idle');
    setScore(0);
    setCurrentTarget(null);
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
          return getDiffSettings().reactionTime;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, currentTarget, startNewRound, getDiffSettings]);

  // Calculate accuracy
  const accuracy = round > 0 ? Math.round((score / round) * 100) : 0;
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
              <span className="text-2xl sm:text-3xl">🎯</span>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold gradient-text">
                  Chọn Hình
                </h1>
                <p className="text-[--muted] text-xs hidden sm:block">
                  Chọn hình tương ứng trong {diffSettings.reactionTime} giây
                </p>
              </div>
            </div>
          </div>

          {/* Score badges */}
          <div className="flex items-center gap-2">
            <Badge variant="accent" size="sm">
              <Trophy size={12} className="mr-1" />
              {highScore}
            </Badge>
            {gameState === 'playing' && (
              <Badge variant="primary" size="sm">
                Điểm: {score}
              </Badge>
            )}
          </div>
        </div>

        {/* Difficulty selector - only when idle */}
        {gameState === 'idle' && (
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
                    <div className="text-[10px] text-[--muted] hidden sm:block">
                      {level.description}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Game Stats */}
        {gameState === 'playing' && (
          <Card size="sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-[--brand]">{score}</div>
                <div className="text-[10px] sm:text-xs text-[--muted]">Điểm</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-orange-500 flex items-center justify-center gap-1">
                  <Clock size={14} />
                  {timeLeft}
                </div>
                <div className="text-[10px] sm:text-xs text-[--muted]">Giây còn lại</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-green-500">{correctStreak}</div>
                <div className="text-[10px] sm:text-xs text-[--muted]">Chuỗi đúng</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-red-500">{wrongAnswers}</div>
                <div className="text-[10px] sm:text-xs text-[--muted]">Sai</div>
              </div>
            </div>
          </Card>
        )}

        {/* Game Area */}
        <Card size="lg" className="text-center">
          {gameState === 'idle' && (
            <div className="space-y-4 sm:space-y-6 py-4 sm:py-8">
              <div className="text-5xl sm:text-6xl mb-4">🎯</div>
              <h2 className="text-lg sm:text-xl font-semibold text-[--text] mb-2">
                Sẵn sàng chơi?
              </h2>
              <p className="text-[--muted] text-xs sm:text-sm mb-4 sm:mb-6">
                Bạn sẽ có {diffSettings.gameDuration} giây để chọn đúng càng nhiều hình càng tốt!
                <br />
                Mỗi lần bạn có {diffSettings.reactionTime} giây để chọn từ {diffSettings.shapeCount} hình.
              </p>

              <Badge variant="default" size="sm" className="mb-4">
                {diffSettings.icon} {diffSettings.label}
              </Badge>

              <div>
                <Button onClick={startGame} icon={<Play size={18} />} size="lg">
                  Bắt đầu
                </Button>
              </div>
            </div>
          )}

          {gameState === 'playing' && currentTarget && (
            <div className="space-y-6 sm:space-y-8">
              {/* Target Shape */}
              <div>
                <p className="text-xs sm:text-sm text-[--muted] mb-3 sm:mb-4">Chọn hình này:</p>
                <motion.div
                  key={currentTarget.id + round}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="inline-block"
                >
                  <div
                    className={`
                      w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br ${currentTarget.color}
                      flex items-center justify-center text-4xl sm:text-5xl md:text-6xl shadow-2xl
                      mx-auto
                    `}
                  >
                    {currentTarget.emoji}
                  </div>
                </motion.div>
                <p className="text-base sm:text-lg font-semibold text-[--text] mt-3 sm:mt-4">
                  {currentTarget.label}
                </p>

                {/* Reaction Timer */}
                <div className="mt-3 sm:mt-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock size={14} className="text-orange-500" />
                    <span className="text-xs sm:text-sm font-medium text-[--text]">
                      Còn lại: {reactionTimeLeft} giây
                    </span>
                  </div>
                  <div className="w-full max-w-xs mx-auto h-2 bg-[--surface-border] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-orange-400 to-red-500"
                      initial={{ width: '100%' }}
                      animate={{ width: `${(reactionTimeLeft / diffSettings.reactionTime) * 100}%` }}
                      transition={{ duration: 1, ease: 'linear' }}
                    />
                  </div>
                </div>
              </div>

              {/* Shape Options */}
              <div>
                <p className="text-xs sm:text-sm text-[--muted] mb-3 sm:mb-4">Chọn hình tương ứng:</p>
                <div className={`
                  grid gap-2 sm:gap-3 max-w-md mx-auto
                  ${availableShapes.length <= 4 ? 'grid-cols-4' :
                    availableShapes.length <= 5 ? 'grid-cols-5' :
                      'grid-cols-4 sm:grid-cols-4'}
                `}>
                  {availableShapes.map((shape) => (
                    <motion.button
                      key={shape.id}
                      onClick={() => handleShapeSelect(shape)}
                      className={`
                        w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br ${shape.color}
                        flex items-center justify-center text-xl sm:text-2xl md:text-3xl shadow-lg
                        hover:scale-110 active:scale-95 transition-transform
                      `}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title={shape.label}
                    >
                      {shape.emoji}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {gameState === 'gameOver' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4 sm:space-y-6 py-4 sm:py-8"
            >
              <div className="text-5xl sm:text-6xl mb-4">🎉</div>
              <h2 className="text-xl sm:text-2xl font-bold text-[--text] mb-2">
                Kết thúc!
              </h2>

              {/* Final Stats */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto">
                <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800">
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400">{score}</div>
                  <div className="text-[10px] sm:text-xs text-yellow-700 dark:text-yellow-500 mt-1">Điểm số</div>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">{accuracy}%</div>
                  <div className="text-[10px] sm:text-xs text-blue-700 dark:text-blue-500 mt-1">Độ chính xác</div>
                </div>
              </div>

              {score >= highScore && score > 0 && (
                <Badge variant="accent" className="!text-sm">
                  🎉 Kỷ lục mới!
                </Badge>
              )}

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                <Button onClick={startGame} icon={<Play size={16} />} size="sm">
                  Chơi lại
                </Button>
                <Button onClick={resetGame} variant="outline" icon={<RotateCcw size={16} />} size="sm">
                  Về menu
                </Button>
              </div>
            </motion.div>
          )}
        </Card>

        {/* Instructions */}
        <Card size="sm">
          <div className="text-xs sm:text-sm text-[--muted] space-y-2">
            <p><strong className="text-[--text]">Cách chơi:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Máy sẽ hiển thị một hình ngẫu nhiên</li>
              <li>Bạn có {diffSettings.reactionTime} giây để chọn hình tương ứng</li>
              <li>Chọn đúng được điểm, chọn sai hoặc hết giờ không được điểm</li>
              <li>Chơi trong {diffSettings.gameDuration} giây và cố gắng đạt điểm cao nhất!</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
