// src/components/games/GameLayout.jsx
// Chú thích: Layout wrapper cho games - bao gồm nút quay lại, chọn độ khó, responsive
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { ArrowLeft, Settings2, Trophy, Star } from 'lucide-react';

// Difficulty presets
export const DIFFICULTY_LEVELS = {
    easy: {
        label: 'Dễ',
        description: 'Phù hợp người mới',
        icon: '🌱',
        color: 'from-green-400 to-emerald-500',
    },
    medium: {
        label: 'Trung bình',
        description: 'Thử thách vừa phải',
        icon: '🔥',
        color: 'from-yellow-400 to-orange-500',
    },
    hard: {
        label: 'Khó',
        description: 'Dành cho cao thủ',
        icon: '💀',
        color: 'from-red-400 to-pink-500',
    },
};

/**
 * GameLayout - Wrapper component cho tất cả games
 * @param {Object} props
 * @param {React.ReactNode} props.children - Nội dung game
 * @param {string} props.title - Tên game
 * @param {string} props.icon - Icon emoji
 * @param {string} props.description - Mô tả ngắn
 * @param {number} props.score - Điểm hiện tại
 * @param {number} props.highScore - Điểm cao nhất
 * @param {boolean} props.showDifficulty - Hiển thị selector độ khó
 * @param {string} props.difficulty - Độ khó hiện tại (easy/medium/hard)
 * @param {Function} props.onDifficultyChange - Callback khi đổi độ khó
 * @param {boolean} props.gameStarted - Game đã bắt đầu chưa
 */
export default function GameLayout({
    children,
    title,
    icon = '🎮',
    description,
    score = 0,
    highScore = 0,
    showDifficulty = false,
    difficulty = 'medium',
    onDifficultyChange,
    gameStarted = false,
}) {
    return (
        <div className="min-h-[70vh] relative px-2 sm:px-4">
            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
                {/* Header với nút quay lại */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    {/* Back button + Title */}
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
                            <span className="text-2xl sm:text-3xl">{icon}</span>
                            <div>
                                <h1 className="text-lg sm:text-xl md:text-2xl font-bold gradient-text">
                                    {title}
                                </h1>
                                {description && (
                                    <p className="text-xs text-[--muted] hidden sm:block">
                                        {description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Score badges */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {highScore > 0 && (
                            <Badge variant="accent" icon={<Trophy size={12} />} className="text-xs sm:text-sm">
                                <span className="hidden sm:inline">Kỷ lục: </span>{highScore}
                            </Badge>
                        )}
                        <Badge variant="primary" icon={<Star size={12} />} className="text-xs sm:text-sm">
                            <span className="hidden sm:inline">Điểm: </span>{score}
                        </Badge>
                    </div>
                </div>

                {/* Difficulty selector - chỉ hiện khi chưa bắt đầu game */}
                {showDifficulty && !gameStarted && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card size="sm">
                            <div className="flex items-center gap-2 mb-3">
                                <Settings2 size={16} className="text-[--brand]" />
                                <span className="font-medium text-sm">Chọn độ khó:</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                {Object.entries(DIFFICULTY_LEVELS).map(([key, level]) => (
                                    <button
                                        key={key}
                                        onClick={() => onDifficultyChange?.(key)}
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
                                        <div className="text-[10px] sm:text-xs text-[--muted] hidden sm:block">
                                            {level.description}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* Current difficulty indicator - hiện khi đang chơi */}
                {showDifficulty && gameStarted && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-[--muted]">
                        <span>Độ khó:</span>
                        <Badge variant="default" size="sm">
                            {DIFFICULTY_LEVELS[difficulty]?.icon} {DIFFICULTY_LEVELS[difficulty]?.label}
                        </Badge>
                    </div>
                )}

                {/* Game content */}
                <div className="relative">
                    {children}
                </div>
            </div>
        </div>
    );
}

/**
 * Hook để quản lý difficulty settings
 */
export function useDifficulty(defaultDifficulty = 'medium', storageKey = 'game_difficulty') {
    const [difficulty, setDifficulty] = React.useState(() => {
        try {
            return localStorage.getItem(storageKey) || defaultDifficulty;
        } catch {
            return defaultDifficulty;
        }
    });

    const changeDifficulty = (newDifficulty) => {
        setDifficulty(newDifficulty);
        try {
            localStorage.setItem(storageKey, newDifficulty);
        } catch { }
    };

    return [difficulty, changeDifficulty];
}

// Import React for hooks
import React from 'react';
