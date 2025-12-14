// src/components/analytics/AnalyticsDashboard.jsx
// Chú thích: Analytics Dashboard v2.0 - Thống kê từ server API (ưu tiên) + localStorage fallback
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import GlowOrbs from '../ui/GlowOrbs';
import {
    BarChart3, TrendingUp, Clock, Heart, Brain,
    Target, Flame, Moon, Gamepad2, Bot,
    Activity, Sparkles, Wind, Loader2, RefreshCw
} from 'lucide-react';
import { getStats, isLoggedIn } from '../../utils/api';

// =============================================================================
// HELPERS
// =============================================================================

// Collect local data as fallback when not logged in
function collectLocalStats() {
    const stats = {
        focus: { totalMinutes: 0, sessions: 0 },
        mood: { entries: 0 },
        sleep: { avgMinutes: 0, avgQuality: 0, logs: 0 },
        games: { bubbleScore: 0, memoryBest: 0 },
        gratitude: { entries: 0, streak: 0 },
        breathing: { sessions: 0, totalSeconds: 0 },
        chat: { messages: 0, threads: 0 },
    };

    try {
        // Focus
        const focus = JSON.parse(localStorage.getItem('focus_stats_v1') || '{}');
        stats.focus = { totalMinutes: focus.totalMinutes || 0, sessions: focus.sessions || 0 };

        // Journal
        const journal = JSON.parse(localStorage.getItem('mood_journal_v1') || '[]');
        stats.mood.entries = journal.length;

        // Sleep
        const sleep = JSON.parse(localStorage.getItem('sleep_stats_v1') || '{}');
        const logs = sleep.logs || [];
        stats.sleep = {
            logs: logs.length,
            avgMinutes: logs.length > 0 ? Math.round(logs.reduce((s, l) => s + (l.duration || 0), 0) / logs.length) : 0,
            avgQuality: logs.length > 0 ? parseFloat((logs.reduce((s, l) => s + (l.quality || 0), 0) / logs.length).toFixed(1)) : 0,
        };

        // Games
        const bubble = JSON.parse(localStorage.getItem('bubble_pop_stats_v1') || '{}');
        const memory = JSON.parse(localStorage.getItem('color_match_stats_v1') || '{}');
        stats.games = { bubbleScore: bubble.highScore || 0, memoryBest: memory.bestTime || 0 };

        // Gratitude
        const gratitude = JSON.parse(localStorage.getItem('gratitude_entries_v1') || localStorage.getItem('gratitude') || '[]');
        stats.gratitude.entries = gratitude.length;

        // Chat
        const threads = JSON.parse(localStorage.getItem('chat_threads_v1') || '[]');
        stats.chat = { threads: threads.length, messages: threads.reduce((s, t) => s + (t.messages?.length || 0), 0) };

        // Breathing
        const breathing = JSON.parse(localStorage.getItem('breathing_sessions_v1') || '[]');
        stats.breathing = { sessions: breathing.length, totalSeconds: breathing.reduce((s, b) => s + (b.duration || 0), 0) };

    } catch (e) { console.warn('collectLocalStats error:', e); }

    return stats;
}

// Mini bar chart component
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

// Stat card component
function StatCard({ icon: Icon, value, label, color = 'text-[--brand]', suffix = '' }) {
    return (
        <Card size="sm" className="text-center">
            <Icon className={`w-6 h-6 mx-auto mb-2 ${color}`} />
            <div className={`text-2xl font-bold ${color}`}>{value}{suffix}</div>
            <div className="text-xs text-[--muted]">{label}</div>
        </Card>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function AnalyticsDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [source, setSource] = useState('loading'); // 'server' | 'local'
    const [error, setError] = useState(null);

    // Load stats - prefer API, fallback to localStorage
    const loadStats = async () => {
        setLoading(true);
        setError(null);

        if (isLoggedIn()) {
            try {
                const serverStats = await getStats();
                // Merge with local game stats (games không có trên server)
                const localStats = collectLocalStats();
                setStats({
                    ...serverStats,
                    games: localStats.games,
                    chat: localStats.chat, // Chat cũng local-only cho giờ
                });
                setSource('server');
            } catch (e) {
                console.warn('[Analytics] API failed, using local:', e.message);
                setStats(collectLocalStats());
                setSource('local');
            }
        } else {
            setStats(collectLocalStats());
            setSource('local');
        }

        setLoading(false);
    };

    useEffect(() => {
        loadStats();
    }, []);

    // Calculate wellbeing score (0-100)
    const wellbeingScore = useMemo(() => {
        if (!stats) return 50;
        let score = 50;

        // Focus contribution (max +15)
        const focusMins = stats.focus?.totalMinutes || 0;
        if (focusMins > 0) score += Math.min(focusMins / 10, 15);

        // Journal/Mood contribution (max +10)
        const journalCount = stats.journal?.count || stats.mood?.entries || 0;
        if (journalCount > 0) score += Math.min(journalCount * 2, 10);

        // Sleep contribution (max +10)
        const sleepMins = stats.sleep?.avgMinutes || 0;
        const sleepHours = sleepMins / 60;
        if (sleepHours >= 7 && sleepHours <= 9) score += 10;
        else if (sleepHours >= 6) score += 5;

        // Breathing contribution (max +5)
        const breathingSessions = stats.breathing?.sessions || 0;
        if (breathingSessions > 0) score += Math.min(breathingSessions, 5);

        // Gratitude contribution (max +5)
        const gratitudeCount = stats.gratitude?.count || stats.gratitude?.entries || 0;
        if (gratitudeCount > 0) score += Math.min(gratitudeCount / 2, 5);

        // Chat/Activity (max +5)
        const chatMessages = stats.chat?.messages || 0;
        if (chatMessages > 0) score += Math.min(chatMessages / 10, 5);

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

    if (loading) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[--brand] mb-4" />
                <p className="text-[--muted]">Đang tải thống kê...</p>
            </div>
        );
    }

    return (
        <div className="min-h-[70vh] relative pb-20 md:pb-0">
            <GlowOrbs className="opacity-30" />

            <div className="relative z-10 max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                            <BarChart3 className="w-8 h-8 text-[--brand]" />
                            <span className="gradient-text">Thống kê</span>
                        </h1>
                        <p className="text-[--muted] text-sm mt-1 flex items-center gap-2">
                            {source === 'server' ? (
                                <><Activity className="w-3 h-3" /> Dữ liệu từ tài khoản</>
                            ) : (
                                <><Clock className="w-3 h-3" /> Dữ liệu cục bộ</>
                            )}
                        </p>
                    </div>
                    <button
                        onClick={loadStats}
                        className="p-2 rounded-xl bg-[--surface] hover:bg-[--surface-border] transition-colors"
                        title="Làm mới"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
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
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--surface-border)" strokeWidth="8" />
                                    <circle
                                        cx="50" cy="50" r="40" fill="none" stroke="var(--brand)" strokeWidth="8"
                                        strokeLinecap="round" strokeDasharray={`${wellbeingScore * 2.51} 251`}
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
                    <StatCard icon={Target} value={stats?.focus?.totalMinutes || 0} label="Phút tập trung" color="text-[--brand]" />
                    <StatCard icon={Heart} value={stats?.journal?.count || stats?.mood?.entries || 0} label="Nhật ký cảm xúc" color="text-[--secondary]" />
                    <StatCard icon={Moon} value={Math.round((stats?.sleep?.avgMinutes || 0) / 60 * 10) / 10} label="Tb giờ ngủ" color="text-[--accent]" suffix="h" />
                    <StatCard icon={Sparkles} value={stats?.gratitude?.count || stats?.gratitude?.entries || 0} label="Lời biết ơn" color="text-amber-500" />
                </motion.div>

                {/* Detailed Stats Grid */}
                <motion.div
                    className="grid md:grid-cols-2 gap-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
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
                                <span className="font-medium">{stats?.focus?.totalMinutes || 0} phút</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[--muted]">Phiên hoàn thành</span>
                                <span className="font-medium">{stats?.focus?.sessions || 0}</span>
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
                                <span className="font-medium">{Math.round((stats?.sleep?.avgMinutes || 0) / 60 * 10) / 10}h</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[--muted]">Tb chất lượng</span>
                                <span className="font-medium">{stats?.sleep?.avgQuality || 0}/5 ⭐</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[--muted]">Đêm ghi nhận</span>
                                <span className="font-medium">{stats?.sleep?.logs || 0}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Breathing Stats */}
                    <Card>
                        <h3 className="font-semibold flex items-center gap-2 mb-4">
                            <Wind size={18} className="text-teal-500" />
                            Bài tập thở
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-[--muted]">Phiên hoàn thành</span>
                                <span className="font-medium">{stats?.breathing?.sessions || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[--muted]">Tổng thời gian</span>
                                <span className="font-medium">{Math.round((stats?.breathing?.totalSeconds || 0) / 60)} phút</span>
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
                                <span className="font-medium">{stats?.games?.bubbleScore || 0} điểm</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[--muted]">Ghép Màu</span>
                                <span className="font-medium">
                                    {(stats?.games?.memoryBest || 0) > 0
                                        ? `${Math.floor(stats.games.memoryBest / 60)}:${String(stats.games.memoryBest % 60).padStart(2, '0')}`
                                        : '--'}
                                </span>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Gratitude & Chat */}
                <motion.div
                    className="grid md:grid-cols-2 gap-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card>
                        <h3 className="font-semibold flex items-center gap-2 mb-4">
                            <Sparkles size={18} className="text-amber-500" />
                            Lọ Biết Ơn
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-[--muted]">Tổng lời biết ơn</span>
                                <span className="font-medium">{stats?.gratitude?.count || stats?.gratitude?.entries || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[--muted]">Ngày liên tiếp</span>
                                <span className="font-medium flex items-center gap-1">
                                    {stats?.gratitude?.streak || 0} <Flame size={14} className="text-[--accent]" />
                                </span>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="font-semibold flex items-center gap-2 mb-4">
                            <Bot size={18} className="text-emerald-500" />
                            Trò chuyện AI
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-[--muted]">Cuộc trò chuyện</span>
                                <span className="font-medium">{stats?.chat?.threads || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[--muted]">Tổng tin nhắn</span>
                                <span className="font-medium">{stats?.chat?.messages || 0}</span>
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
