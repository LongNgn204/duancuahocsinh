// src/components/analytics/AnalyticsDashboard.jsx
// Chú thích: Analytics Dashboard v1.0 - Thống kê tổng hợp sử dụng app
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import GlowOrbs from '../ui/GlowOrbs';
import {
    BarChart3, TrendingUp, Calendar, Clock, Heart, Brain,
    Target, Flame, Moon, BookOpen, Gamepad2, MessageCircle,
    ChevronLeft, ChevronRight, Activity
} from 'lucide-react';

// Collect data from various localStorage keys
function collectStats() {
    const stats = {
        focus: { totalMinutes: 0, sessions: 0, streak: 0 },
        mood: { entries: 0, avgMood: 0, streak: 0 },
        sleep: { avgHours: 0, avgQuality: 0, logs: 0 },
        games: { totalPlayed: 0, bubbleScore: 0, memoryBest: 0 },
        gratitude: { entries: 0, streak: 0 },
        breathing: { sessions: 0 },
        chat: { messages: 0, threads: 0 },
    };

    try {
        // Focus Timer stats
        const focus = JSON.parse(localStorage.getItem('focus_stats_v1') || '{}');
        stats.focus = {
            totalMinutes: focus.totalMinutes || 0,
            sessions: focus.sessions || 0,
            streak: focus.streak || 0,
        };

        // Mood Journal
        const journal = JSON.parse(localStorage.getItem('mood_journal_v1') || '[]');
        stats.mood.entries = journal.length;
        // Calculate streak and avg mood would require more complex logic

        // Sleep
        const sleep = JSON.parse(localStorage.getItem('sleep_stats_v1') || '{}');
        const sleepLogs = sleep.logs || [];
        stats.sleep = {
            logs: sleepLogs.length,
            avgHours: sleepLogs.length > 0
                ? (sleepLogs.reduce((s, l) => s + (l.duration || 0), 0) / sleepLogs.length).toFixed(1)
                : 0,
            avgQuality: sleep.avgQuality?.toFixed(1) || 0,
        };

        // Games
        const bubble = JSON.parse(localStorage.getItem('bubble_pop_stats_v1') || '{}');
        const memory = JSON.parse(localStorage.getItem('color_match_stats_v1') || '{}');
        stats.games = {
            totalPlayed: (bubble.totalPopped || 0) + (memory.gamesPlayed || 0),
            bubbleScore: bubble.highScore || 0,
            memoryBest: memory.bestTime || 0,
        };

        // Gratitude
        const gratitude = JSON.parse(localStorage.getItem('gratitude_entries_v1') || '[]');
        stats.gratitude.entries = gratitude.length;

        // Chat
        const threads = JSON.parse(localStorage.getItem('chat_threads_v1') || '[]');
        stats.chat.threads = threads.length;
        stats.chat.messages = threads.reduce((sum, t) => sum + (t.messages?.length || 0), 0);

    } catch (_) { }

    return stats;
}

// Weekly data mock (would be collected from actual usage in production)
function generateWeeklyData() {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return days.map((day, i) => ({
        day,
        focus: Math.floor(Math.random() * 60),
        mood: Math.floor(Math.random() * 5) + 1,
        active: Math.random() > 0.3,
    }));
}

function MiniBarChart({ data, color = 'var(--brand)', height = 60 }) {
    const max = Math.max(...data.map(d => d.value), 1);

    return (
        <div className="flex items-end gap-1" style={{ height }}>
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                        className="w-full rounded-t transition-all"
                        style={{
                            height: `${(d.value / max) * 100}%`,
                            backgroundColor: color,
                            minHeight: d.value > 0 ? 4 : 0,
                        }}
                    />
                    <span className="text-[10px] text-[--muted]">{d.label}</span>
                </div>
            ))}
        </div>
    );
}

export default function AnalyticsDashboard() {
    const [stats, setStats] = useState(collectStats);
    const [weekData, setWeekData] = useState(generateWeeklyData);
    const [period, setPeriod] = useState('week'); // 'week' | 'month'

    // Refresh stats
    useEffect(() => {
        setStats(collectStats());
    }, []);

    // Calculate wellbeing score (0-100)
    const wellbeingScore = useMemo(() => {
        let score = 50; // Base score

        // Focus contribution
        if (stats.focus.totalMinutes > 0) score += Math.min(stats.focus.totalMinutes / 10, 15);

        // Mood tracking contribution
        if (stats.mood.entries > 0) score += Math.min(stats.mood.entries * 2, 10);

        // Sleep contribution
        if (stats.sleep.logs > 0) {
            const hours = parseFloat(stats.sleep.avgHours);
            if (hours >= 7 && hours <= 9) score += 10;
            else if (hours >= 6) score += 5;
        }

        // Activity contribution
        if (stats.chat.messages > 0) score += Math.min(stats.chat.messages / 5, 10);
        if (stats.gratitude.entries > 0) score += Math.min(stats.gratitude.entries * 2, 5);

        return Math.min(Math.round(score), 100);
    }, [stats]);

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-500';
        if (score >= 60) return 'text-teal-500';
        if (score >= 40) return 'text-amber-500';
        return 'text-red-500';
    };

    const getScoreLabel = (score) => {
        if (score >= 80) return 'Tuyệt vời';
        if (score >= 60) return 'Tốt';
        if (score >= 40) return 'Khá';
        return 'Cần cải thiện';
    };

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
                        <BarChart3 className="w-8 h-8 text-[--brand]" />
                        <span className="gradient-text">Thống kê</span>
                    </h1>
                    <p className="text-[--muted] text-sm mt-1">Theo dõi tiến trình sử dụng app</p>
                </motion.div>

                {/* Wellbeing Score */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card variant="highlight">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[--muted] mb-1">Điểm Sức khỏe</p>
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-4xl font-bold ${getScoreColor(wellbeingScore)}`}>
                                        {wellbeingScore}
                                    </span>
                                    <span className="text-[--muted]">/100</span>
                                </div>
                                <Badge variant="primary" className="mt-2">{getScoreLabel(wellbeingScore)}</Badge>
                            </div>
                            <div className="w-24 h-24 relative">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                    <circle
                                        cx="50" cy="50" r="40"
                                        fill="none"
                                        stroke="var(--surface-border)"
                                        strokeWidth="8"
                                    />
                                    <circle
                                        cx="50" cy="50" r="40"
                                        fill="none"
                                        stroke="var(--brand)"
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={`${wellbeingScore * 2.51} 251`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Activity className="w-8 h-8 text-[--brand]" />
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Quick Stats Grid */}
                <motion.div
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card size="sm" className="text-center">
                        <Target className="w-6 h-6 mx-auto mb-2 text-[--brand]" />
                        <div className="text-2xl font-bold gradient-text">{stats.focus.totalMinutes}</div>
                        <div className="text-xs text-[--muted]">Phút tập trung</div>
                    </Card>

                    <Card size="sm" className="text-center">
                        <Heart className="w-6 h-6 mx-auto mb-2 text-[--secondary]" />
                        <div className="text-2xl font-bold text-[--secondary]">{stats.mood.entries}</div>
                        <div className="text-xs text-[--muted]">Nhật ký cảm xúc</div>
                    </Card>

                    <Card size="sm" className="text-center">
                        <Moon className="w-6 h-6 mx-auto mb-2 text-[--accent]" />
                        <div className="text-2xl font-bold text-[--accent]">{stats.sleep.avgHours}h</div>
                        <div className="text-xs text-[--muted]">Tb giờ ngủ</div>
                    </Card>

                    <Card size="sm" className="text-center">
                        <MessageCircle className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                        <div className="text-2xl font-bold text-emerald-500">{stats.chat.messages}</div>
                        <div className="text-xs text-[--muted]">Tin nhắn AI</div>
                    </Card>
                </motion.div>

                {/* Weekly Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <TrendingUp size={18} className="text-[--brand]" />
                                Hoạt động tuần này
                            </h3>
                        </div>

                        <MiniBarChart
                            data={weekData.map(d => ({ label: d.day, value: d.focus }))}
                            color="var(--brand)"
                            height={80}
                        />

                        <div className="mt-4 grid grid-cols-7 gap-1">
                            {weekData.map((d, i) => (
                                <div
                                    key={i}
                                    className={`h-2 rounded-full ${d.active ? 'bg-[--brand]' : 'bg-[--surface-border]'}`}
                                    title={d.active ? 'Có hoạt động' : 'Không hoạt động'}
                                />
                            ))}
                        </div>
                        <p className="text-xs text-[--muted] mt-2 text-center">
                            {weekData.filter(d => d.active).length}/7 ngày hoạt động
                        </p>
                    </Card>
                </motion.div>

                {/* Detailed Stats */}
                <motion.div
                    className="grid md:grid-cols-2 gap-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    {/* Focus Stats */}
                    <Card>
                        <h3 className="font-semibold flex items-center gap-2 mb-4">
                            <Target size={18} className="text-[--brand]" />
                            Hẹn giờ Tập trung
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-[--muted]">Tổng phút</span>
                                <span className="font-medium">{stats.focus.totalMinutes} phút</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[--muted]">Phiên hoàn thành</span>
                                <span className="font-medium">{stats.focus.sessions}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[--muted]">Ngày liên tiếp</span>
                                <span className="font-medium flex items-center gap-1">
                                    {stats.focus.streak} <Flame size={14} className="text-[--accent]" />
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Sleep Stats */}
                    <Card>
                        <h3 className="font-semibold flex items-center gap-2 mb-4">
                            <Moon size={18} className="text-[--accent]" />
                            Giấc ngủ
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-[--muted]">Tb giờ ngủ</span>
                                <span className="font-medium">{stats.sleep.avgHours}h</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[--muted]">Tb chất lượng</span>
                                <span className="font-medium">{stats.sleep.avgQuality}/5 ⭐</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[--muted]">Đêm ghi nhận</span>
                                <span className="font-medium">{stats.sleep.logs}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Games Stats */}
                    <Card>
                        <h3 className="font-semibold flex items-center gap-2 mb-4">
                            <Gamepad2 size={18} className="text-[--secondary]" />
                            Trò chơi
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-[--muted]">Bấm Bong Bóng</span>
                                <span className="font-medium">{stats.games.bubbleScore} điểm</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[--muted]">Ghép Màu</span>
                                <span className="font-medium">
                                    {stats.games.memoryBest > 0
                                        ? `${Math.floor(stats.games.memoryBest / 60)}:${String(stats.games.memoryBest % 60).padStart(2, '0')}`
                                        : '--'
                                    }
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* AI Chat Stats */}
                    <Card>
                        <h3 className="font-semibold flex items-center gap-2 mb-4">
                            <MessageCircle size={18} className="text-emerald-500" />
                            Trò chuyện AI
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-[--muted]">Cuộc trò chuyện</span>
                                <span className="font-medium">{stats.chat.threads}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[--muted]">Tổng tin nhắn</span>
                                <span className="font-medium">{stats.chat.messages}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[--muted]">Lọ Biết Ơn</span>
                                <span className="font-medium">{stats.gratitude.entries} lời</span>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Tips */}
                <Card size="sm">
                    <div className="flex items-start gap-3">
                        <Brain size={18} className="text-[--accent] shrink-0 mt-0.5" />
                        <div className="text-sm text-[--text-secondary]">
                            <strong className="text-[--text]">Mẹo:</strong> Sử dụng app đều đặn mỗi ngày
                            để xây dựng thói quen tốt. Mục tiêu: 25 phút focus, 1 mood log, và 7h ngủ mỗi ngày!
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
