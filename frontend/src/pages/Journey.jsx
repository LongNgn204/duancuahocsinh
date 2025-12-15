// src/pages/Journey.jsx
// Chú thích: Trang Hành Trình - Hiển thị XP, Level, Achievements
// Phase 3: Gamification System

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Star, Trophy, Zap, Target, Calendar, Flame,
    Heart, Book, Wind, Focus, Gamepad2, Award, TrendingUp
} from 'lucide-react';
import { isLoggedIn, getUserStats } from '../utils/api';
import Card from '../components/ui/Card';

// =============================================================================
// ACHIEVEMENTS DATA
// =============================================================================
const ACHIEVEMENTS_CONFIG = [
    // Breathing
    { id: 'breath_first', name: 'Hơi thở đầu tiên', description: 'Hoàn thành 1 bài thở', icon: Wind, xpRequired: 0, category: 'breathing' },
    { id: 'breath_10', name: 'Thiền định', description: 'Hoàn thành 10 bài thở', icon: Wind, xpRequired: 100, category: 'breathing' },
    { id: 'breath_50', name: 'Bậc thầy hít thở', description: 'Hoàn thành 50 bài thở', icon: Wind, xpRequired: 500, category: 'breathing' },

    // Gratitude
    { id: 'gratitude_first', name: 'Lòng biết ơn', description: 'Viết điều biết ơn đầu tiên', icon: Heart, xpRequired: 0, category: 'gratitude' },
    { id: 'gratitude_streak_7', name: 'Kiên trì 7 ngày', description: 'Streak 7 ngày liên tiếp', icon: Flame, xpRequired: 350, category: 'gratitude' },
    { id: 'gratitude_streak_30', name: 'Tháng trọn vẹn', description: 'Streak 30 ngày liên tiếp', icon: Flame, xpRequired: 1500, category: 'gratitude' },

    // Journal
    { id: 'journal_first', name: 'Nhà văn tập sự', description: 'Viết nhật ký đầu tiên', icon: Book, xpRequired: 0, category: 'journal' },
    { id: 'journal_10', name: 'Người kể chuyện', description: 'Viết 10 bài nhật ký', icon: Book, xpRequired: 150, category: 'journal' },

    // Focus
    { id: 'focus_first', name: 'Tập trung!', description: 'Hoàn thành 1 Pomodoro', icon: Focus, xpRequired: 0, category: 'focus' },
    { id: 'focus_100', name: 'Siêu tập trung', description: '100 phút focus', icon: Focus, xpRequired: 500, category: 'focus' },

    // Games
    { id: 'game_first', name: 'Game thủ', description: 'Chơi game đầu tiên', icon: Gamepad2, xpRequired: 0, category: 'game' },
    { id: 'game_record', name: 'Kỷ lục gia', description: 'Lập 3 kỷ lục game', icon: Trophy, xpRequired: 75, category: 'game' },

    // Level milestones
    { id: 'level_5', name: 'Chiến binh', description: 'Đạt level 5', icon: Award, xpRequired: 400, category: 'milestone' },
    { id: 'level_10', name: 'Anh hùng', description: 'Đạt level 10', icon: Star, xpRequired: 900, category: 'milestone' },
    { id: 'level_25', name: 'Huyền thoại', description: 'Đạt level 25', icon: Trophy, xpRequired: 2400, category: 'milestone' },
];

// =============================================================================
// JOURNEY PAGE COMPONENT
// =============================================================================
export default function Journey() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Load user stats
    useEffect(() => {
        const loadStats = async () => {
            if (!isLoggedIn()) {
                // Guest mode - hiển thị stats từ localStorage
                setStats({
                    total_xp: 0,
                    current_level: 1,
                    calculated_level: 1,
                    xp_progress_percent: 0,
                    xp_for_next_level: 100,
                    breathing_total: 0,
                    gratitude_streak: 0,
                    journal_count: 0,
                    focus_total_minutes: 0,
                    games_played: 0,
                });
                setLoading(false);
                return;
            }

            try {
                const data = await getUserStats();
                setStats(data);
            } catch (e) {
                console.error('[Journey] Failed to load stats:', e);
            }
            setLoading(false);
        };
        loadStats();
    }, []);

    // Calculate unlocked achievements based on stats
    const getUnlockedAchievements = () => {
        if (!stats) return [];

        const unlocked = [];
        const xp = stats.total_xp || 0;

        ACHIEVEMENTS_CONFIG.forEach(ach => {
            if (xp >= ach.xpRequired) {
                unlocked.push(ach.id);
            }
        });

        return unlocked;
    };

    const unlockedAchievements = getUnlockedAchievements();

    // Filter achievements by category
    const filteredAchievements = selectedCategory === 'all'
        ? ACHIEVEMENTS_CONFIG
        : ACHIEVEMENTS_CONFIG.filter(a => a.category === selectedCategory);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const level = stats?.calculated_level || 1;
    const xpPercent = stats?.xp_progress_percent || 0;
    const xpToNext = stats?.xp_for_next_level || 100;

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900/20 px-4 py-6 pb-24">
            <div className="max-w-lg mx-auto space-y-6">
                {/* Header with Level */}
                <header className="text-center">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                        Hành Trình Của Bạn
                    </h1>
                </header>

                {/* Level Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                                <Star className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Cấp độ</p>
                                <p className="text-3xl font-bold text-gray-800 dark:text-white">{level}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Tổng XP</p>
                            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                {stats?.total_xp || 0}
                            </p>
                        </div>
                    </div>

                    {/* XP Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>Tiến độ level tiếp theo</span>
                            <span>{xpToNext} XP còn thiếu</span>
                        </div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${xpPercent}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full relative"
                            >
                                <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                                    {xpPercent}%
                                </span>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <StatCard
                        icon={<Wind className="w-5 h-5" />}
                        value={stats?.breathing_total || 0}
                        label="Bài thở"
                        color="from-blue-400 to-cyan-500"
                    />
                    <StatCard
                        icon={<Flame className="w-5 h-5" />}
                        value={stats?.gratitude_streak || 0}
                        label="Streak"
                        color="from-orange-400 to-red-500"
                    />
                    <StatCard
                        icon={<Focus className="w-5 h-5" />}
                        value={stats?.focus_total_minutes || 0}
                        label="Phút focus"
                        color="from-green-400 to-emerald-500"
                    />
                </div>

                {/* XP Chart - 7 ngày gần nhất */}
                {stats && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-5 h-5 text-purple-500" />
                            <h3 className="font-bold text-gray-800 dark:text-white">Xu hướng XP</h3>
                        </div>
                        <div className="h-32 flex items-end gap-1">
                            {(() => {
                                // Tạo dữ liệu giả lập (trong thực tế nên lấy từ API)
                                const today = new Date();
                                const weekData = [];
                                for (let i = 6; i >= 0; i--) {
                                    const date = new Date(today);
                                    date.setDate(today.getDate() - i);
                                    // Giả lập XP tăng dần (trong thực tế nên lấy từ user_stats history)
                                    const baseXP = stats.total_xp || 0;
                                    const dailyXP = Math.floor(baseXP / 7) + Math.random() * 20;
                                    weekData.push({
                                        date: date.toISOString().split('T')[0],
                                        xp: Math.max(0, baseXP - (6 - i) * dailyXP),
                                    });
                                }
                                const maxXP = Math.max(...weekData.map(d => d.xp), 1);
                                return weekData.map((d, i) => {
                                    const height = (d.xp / maxXP) * 100;
                                    return (
                                        <div key={d.date} className="flex-1 flex flex-col items-center group relative">
                                            <motion.div
                                                className="w-full rounded-t bg-gradient-to-t from-purple-500 to-pink-500 transition-all"
                                                initial={{ height: 0 }}
                                                animate={{ height: `${height}%` }}
                                                transition={{ delay: i * 0.1 }}
                                                title={`${d.date}: ${Math.round(d.xp)} XP`}
                                            />
                                            <span className="text-xs text-gray-500 mt-1 hidden sm:block">
                                                {new Date(d.date).getDate()}/{new Date(d.date).getMonth() + 1}
                                            </span>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </motion.div>
                )}

                {/* Achievements Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <Trophy className="w-6 h-6 text-yellow-500" />
                            Thành tựu
                        </h2>
                        <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                            {unlockedAchievements.length}/{ACHIEVEMENTS_CONFIG.length}
                        </span>
                    </div>

                    {/* Category Filter */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {['all', 'breathing', 'gratitude', 'journal', 'focus', 'game', 'milestone'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                                    }`}
                            >
                                {cat === 'all' ? 'Tất cả' :
                                    cat === 'breathing' ? '🌬️ Thở' :
                                        cat === 'gratitude' ? '💝 Biết ơn' :
                                            cat === 'journal' ? '📖 Nhật ký' :
                                                cat === 'focus' ? '🎯 Tập trung' :
                                                    cat === 'game' ? '🎮 Game' : '⭐ Mốc'}
                            </button>
                        ))}
                    </div>

                    {/* Achievements Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {filteredAchievements.map((ach) => {
                            const isUnlocked = unlockedAchievements.includes(ach.id);
                            const Icon = ach.icon;

                            return (
                                <motion.div
                                    key={ach.id}
                                    whileHover={{ scale: 1.02 }}
                                    className={`
                    p-4 rounded-2xl border-2 transition-colors
                    ${isUnlocked
                                            ? 'bg-white dark:bg-gray-800 border-yellow-400'
                                            : 'bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-700 opacity-50'
                                        }
                  `}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${isUnlocked
                                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                                        }`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-medium text-gray-800 dark:text-white text-sm">
                                        {ach.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {ach.description}
                                    </p>
                                    {!isUnlocked && (
                                        <p className="text-xs text-purple-500 mt-2">
                                            Cần {ach.xpRequired} XP
                                        </p>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Login prompt for guests */}
                {!isLoggedIn() && (
                    <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl">
                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                            Đăng nhập để lưu tiến độ và nhận thành tựu!
                        </p>
                        <a
                            href="/login"
                            className="inline-block px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full font-medium"
                        >
                            Đăng nhập
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

// =============================================================================
// STAT CARD COMPONENT
// =============================================================================
function StatCard({ icon, value, label, color }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center shadow-sm">
            <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-2`}>
                {icon}
            </div>
            <p className="text-xl font-bold text-gray-800 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
        </div>
    );
}
