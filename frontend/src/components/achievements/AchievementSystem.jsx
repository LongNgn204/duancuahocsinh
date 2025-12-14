// src/components/achievements/AchievementSystem.jsx
// Chú thích: Achievement System v1.0 - Badges và thành tích
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import GlowOrbs from '../ui/GlowOrbs';
import {
    Trophy, Star, Flame, Target, Heart, Moon, Brain,
    Bot, Sparkles, Lock, CheckCircle
} from 'lucide-react';

// Achievement definitions
const ACHIEVEMENTS = [
    // Focus achievements
    {
        id: 'focus_first',
        name: 'Bước đầu',
        description: 'Hoàn thành phiên tập trung đầu tiên',
        icon: Target,
        category: 'focus',
        condition: (stats) => stats.focus?.sessions >= 1,
        rarity: 'common',
    },
    {
        id: 'focus_10',
        name: 'Tập trung cao',
        description: 'Hoàn thành 10 phiên tập trung',
        icon: Target,
        category: 'focus',
        condition: (stats) => stats.focus?.sessions >= 10,
        rarity: 'uncommon',
    },
    {
        id: 'focus_hour',
        name: 'Giờ vàng',
        description: 'Tích lũy 60 phút tập trung',
        icon: Target,
        category: 'focus',
        condition: (stats) => stats.focus?.totalMinutes >= 60,
        rarity: 'rare',
    },
    {
        id: 'focus_streak',
        name: 'Không bỏ cuộc',
        description: 'Streak 7 ngày liên tiếp',
        icon: Flame,
        category: 'focus',
        condition: (stats) => stats.focus?.streak >= 7,
        rarity: 'epic',
    },

    // Mood achievements
    {
        id: 'mood_first',
        name: 'Nhật ký đầu tiên',
        description: 'Viết nhật ký cảm xúc đầu tiên',
        icon: Heart,
        category: 'mood',
        condition: (stats) => stats.mood?.entries >= 1,
        rarity: 'common',
    },
    {
        id: 'mood_10',
        name: 'Thói quen tốt',
        description: 'Viết 10 nhật ký cảm xúc',
        icon: Heart,
        category: 'mood',
        condition: (stats) => stats.mood?.entries >= 10,
        rarity: 'uncommon',
    },
    {
        id: 'mood_30',
        name: 'Nhà tâm lý',
        description: 'Viết 30 nhật ký cảm xúc',
        icon: Heart,
        category: 'mood',
        condition: (stats) => stats.mood?.entries >= 30,
        rarity: 'epic',
    },

    // Sleep achievements
    {
        id: 'sleep_first',
        name: 'Theo dõi giấc ngủ',
        description: 'Ghi nhận đêm ngủ đầu tiên',
        icon: Moon,
        category: 'sleep',
        condition: (stats) => stats.sleep?.logs >= 1,
        rarity: 'common',
    },
    {
        id: 'sleep_quality',
        name: 'Ngủ ngon',
        description: 'Đạt chất lượng ngủ trung bình 4+',
        icon: Moon,
        category: 'sleep',
        condition: (stats) => parseFloat(stats.sleep?.avgQuality || 0) >= 4,
        rarity: 'rare',
    },

    // Game achievements
    {
        id: 'bubble_100',
        name: 'Bấm bong bóng',
        description: 'Đạt 100 điểm Bấm Bong Bóng',
        icon: Sparkles,
        category: 'games',
        condition: (stats) => stats.games?.bubbleScore >= 100,
        rarity: 'uncommon',
    },
    {
        id: 'memory_fast',
        name: 'Trí nhớ siêu phàm',
        description: 'Hoàn thành Ghép Màu dưới 60 giây',
        icon: Brain,
        category: 'games',
        condition: (stats) => stats.games?.memoryBest > 0 && stats.games?.memoryBest < 60,
        rarity: 'rare',
    },

    // Chat achievements
    {
        id: 'chat_first',
        name: 'Bắt đầu trò chuyện',
        description: 'Gửi tin nhắn đầu tiên cho AI',
        icon: Bot,
        category: 'chat',
        condition: (stats) => stats.chat?.messages >= 1,
        rarity: 'common',
    },
    {
        id: 'chat_100',
        name: 'Bạn thân AI',
        description: 'Gửi 100 tin nhắn',
        icon: Bot,
        category: 'chat',
        condition: (stats) => stats.chat?.messages >= 100,
        rarity: 'epic',
    },

    // Gratitude achievements
    {
        id: 'gratitude_first',
        name: 'Biết ơn',
        description: 'Thêm entry đầu tiên vào Lọ Biết Ơn',
        icon: Sparkles,
        category: 'gratitude',
        condition: (stats) => stats.gratitude?.entries >= 1,
        rarity: 'common',
    },
];

const RARITY_COLORS = {
    common: 'from-gray-400 to-gray-500',
    uncommon: 'from-green-400 to-emerald-500',
    rare: 'from-blue-400 to-indigo-500',
    epic: 'from-purple-400 to-pink-500',
    legendary: 'from-amber-400 to-orange-500',
};

const RARITY_LABELS = {
    common: 'Thường',
    uncommon: 'Không thường',
    rare: 'Hiếm',
    epic: 'Sử thi',
    legendary: 'Huyền thoại',
};

// Collect stats (same as Analytics)
function collectStats() {
    const stats = {
        focus: { totalMinutes: 0, sessions: 0, streak: 0 },
        mood: { entries: 0 },
        sleep: { avgQuality: 0, logs: 0 },
        games: { bubbleScore: 0, memoryBest: 0 },
        gratitude: { entries: 0 },
        chat: { messages: 0 },
    };

    try {
        const focus = JSON.parse(localStorage.getItem('focus_stats_v1') || '{}');
        stats.focus = { totalMinutes: focus.totalMinutes || 0, sessions: focus.sessions || 0, streak: focus.streak || 0 };

        const journal = JSON.parse(localStorage.getItem('mood_journal_v1') || '[]');
        stats.mood.entries = journal.length;

        const sleep = JSON.parse(localStorage.getItem('sleep_stats_v1') || '{}');
        stats.sleep = { logs: sleep.logs?.length || 0, avgQuality: sleep.avgQuality || 0 };

        const bubble = JSON.parse(localStorage.getItem('bubble_pop_stats_v1') || '{}');
        const memory = JSON.parse(localStorage.getItem('color_match_stats_v1') || '{}');
        stats.games = { bubbleScore: bubble.highScore || 0, memoryBest: memory.bestTime || 0 };

        const gratitude = JSON.parse(localStorage.getItem('gratitude_entries_v1') || '[]');
        stats.gratitude.entries = gratitude.length;

        const threads = JSON.parse(localStorage.getItem('chat_threads_v1') || '[]');
        stats.chat.messages = threads.reduce((sum, t) => sum + (t.messages?.length || 0), 0);
    } catch (_) { }

    return stats;
}

export default function AchievementSystem() {
    const [stats, setStats] = useState(collectStats);
    const [selectedAchievement, setSelectedAchievement] = useState(null);

    useEffect(() => {
        setStats(collectStats());
    }, []);

    // Calculate unlocked achievements
    const { unlocked, locked, progress } = useMemo(() => {
        const unlocked = [];
        const locked = [];

        ACHIEVEMENTS.forEach(a => {
            if (a.condition(stats)) {
                unlocked.push(a);
            } else {
                locked.push(a);
            }
        });

        return {
            unlocked,
            locked,
            progress: Math.round((unlocked.length / ACHIEVEMENTS.length) * 100),
        };
    }, [stats]);

    return (
        <div className="min-h-[70vh] relative pb-20 md:pb-0">
            <GlowOrbs className="opacity-30" />

            <div className="relative z-10 max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-[--accent]" />
                        <span className="gradient-text">Thành tích</span>
                    </h1>
                    <p className="text-[--muted] text-sm mt-1">Thu thập badges và hoàn thành thử thách</p>
                </motion.div>

                {/* Progress */}
                <Card variant="highlight">
                    <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">Tiến trình</span>
                        <span className="text-sm text-[--muted]">{unlocked.length}/{ACHIEVEMENTS.length} huy hiệu</span>
                    </div>
                    <div className="h-3 bg-[--surface-border] rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-[--brand] to-[--accent]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                        />
                    </div>
                    <p className="text-sm text-[--muted] mt-2 text-center">{progress}% hoàn thành</p>
                </Card>

                {/* Unlocked Achievements */}
                {unlocked.length > 0 && (
                    <div>
                        <h2 className="font-semibold flex items-center gap-2 mb-3">
                            <CheckCircle size={18} className="text-emerald-500" />
                            Đã đạt được ({unlocked.length})
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {unlocked.map(a => (
                                <motion.div
                                    key={a.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedAchievement(a)}
                                >
                                    <Card className="cursor-pointer text-center p-4">
                                        <div className={`
                      w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${RARITY_COLORS[a.rarity]}
                      flex items-center justify-center mb-2 shadow-lg
                    `}>
                                            <a.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <p className="text-sm font-medium text-[--text] truncate">{a.name}</p>
                                        <Badge variant="accent" size="sm" className="mt-1">
                                            {RARITY_LABELS[a.rarity]}
                                        </Badge>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Locked Achievements */}
                <div>
                    <h2 className="font-semibold flex items-center gap-2 mb-3">
                        <Lock size={18} className="text-[--muted]" />
                        Chưa mở khóa ({locked.length})
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {locked.map(a => (
                            <motion.div
                                key={a.id}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => setSelectedAchievement(a)}
                            >
                                <Card className="cursor-pointer text-center p-4 opacity-60">
                                    <div className="w-12 h-12 mx-auto rounded-xl bg-[--surface-border] flex items-center justify-center mb-2">
                                        <Lock className="w-5 h-5 text-[--muted]" />
                                    </div>
                                    <p className="text-sm font-medium text-[--muted] truncate">{a.name}</p>
                                    <Badge variant="default" size="sm" className="mt-1">
                                        {RARITY_LABELS[a.rarity]}
                                    </Badge>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Achievement Detail Modal */}
            <AnimatePresence>
                {selectedAchievement && (
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm grid place-items-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedAchievement(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <Card variant="elevated" size="lg" className="max-w-sm text-center">
                                <div className={`
                  w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br 
                  ${selectedAchievement.condition(stats) ? RARITY_COLORS[selectedAchievement.rarity] : 'from-gray-300 to-gray-400'}
                  flex items-center justify-center mb-4 shadow-lg
                `}>
                                    {selectedAchievement.condition(stats) ? (
                                        <selectedAchievement.icon className="w-10 h-10 text-white" />
                                    ) : (
                                        <Lock className="w-8 h-8 text-white/60" />
                                    )}
                                </div>

                                <h3 className="text-xl font-bold text-[--text] mb-1">
                                    {selectedAchievement.name}
                                </h3>

                                <Badge
                                    variant={selectedAchievement.condition(stats) ? 'accent' : 'default'}
                                    className="mb-3"
                                >
                                    {RARITY_LABELS[selectedAchievement.rarity]}
                                </Badge>

                                <p className="text-[--muted] mb-4">
                                    {selectedAchievement.description}
                                </p>

                                {selectedAchievement.condition(stats) ? (
                                    <div className="flex items-center justify-center gap-2 text-emerald-500">
                                        <CheckCircle size={18} />
                                        <span className="font-medium">Đã đạt được!</span>
                                    </div>
                                ) : (
                                    <div className="text-[--muted] text-sm">
                                        Tiếp tục cố gắng để mở khóa
                                    </div>
                                )}
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
