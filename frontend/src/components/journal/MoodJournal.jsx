// src/components/journal/MoodJournal.jsx
// Chú thích: Mood Journal v2.0 - Nhật ký cảm xúc với calendar view, mood tracking, backend sync
import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import GlowOrbs from '../ui/GlowOrbs';
import {
    Calendar, BookOpen, Heart, Sparkles, ChevronLeft, ChevronRight,
    Plus, Edit3, Trash2, Search, Filter, Download, TrendingUp, Cloud, CloudOff,
    Zap, Lightbulb, BarChart3, Clock
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getJournalList, addJournalEntry, deleteJournalEntry, rewardXP } from '../../utils/api';
import { analyzeSentiment, classifySentiment, getSentimentColor } from '../../utils/sentiment';

// Mood options
const MOODS = [
    { id: 'great', emoji: '😊', label: 'Tuyệt vời', color: 'bg-emerald-500' },
    { id: 'good', emoji: '🙂', label: 'Tốt', color: 'bg-teal-500' },
    { id: 'okay', emoji: '😐', label: 'Bình thường', color: 'bg-amber-500' },
    { id: 'sad', emoji: '😢', label: 'Buồn', color: 'bg-blue-500' },
    { id: 'stressed', emoji: '😫', label: 'Căng thẳng', color: 'bg-orange-500' },
    { id: 'angry', emoji: '😠', label: 'Tức giận', color: 'bg-red-500' },
];

// Map mood IDs between frontend and backend
const MOOD_MAP = {
    'great': 'happy',
    'good': 'calm',
    'okay': 'neutral',
    'sad': 'sad',
    'stressed': 'stressed',
    'angry': 'stressed', // Map angry to stressed for backend
};

const MOOD_REVERSE_MAP = {
    'happy': 'great',
    'calm': 'good',
    'neutral': 'okay',
    'sad': 'sad',
    'stressed': 'stressed',
};

// Prompt suggestions
const PROMPTS = [
    'Điều gì khiến bạn vui nhất hôm nay?',
    'Bạn đã học được gì mới?',
    'Ai đã giúp đỡ bạn hôm nay?',
    'Bạn tự hào về điều gì?',
    'Điều gì đang làm bạn lo lắng?',
    'Bạn muốn thay đổi điều gì?',
    'Mục tiêu của bạn cho ngày mai?',
    'Điều gì khiến bạn mỉm cười?',
];

// Storage
const JOURNAL_KEY = 'mood_journal_v1';

function loadLocalEntries() {
    try {
        const raw = localStorage.getItem(JOURNAL_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (_) {
        return [];
    }
}

function saveLocalEntries(entries) {
    try {
        localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries));
    } catch (_) { }
}

// Date helpers
function formatDate(date) {
    return new Date(date).toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function isSameDay(d1, d2) {
    return new Date(d1).toDateString() === new Date(d2).toDateString();
}

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
}

export default function MoodJournal() {
    const { isLoggedIn } = useAuth();
    const [entries, setEntries] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMonth, setViewMonth] = useState(new Date());
    const [showEditor, setShowEditor] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [view, setView] = useState('calendar'); // 'calendar' | 'list' | 'chart'
    const [chartPeriod, setChartPeriod] = useState('week'); // 'week' | 'month'
    const [syncing, setSyncing] = useState(false);
    const [syncError, setSyncError] = useState(null);

    // Form state
    const [mood, setMood] = useState('');
    const [content, setContent] = useState('');
    const [prompt, setPrompt] = useState('');

    // Load entries from localStorage or API
    const loadEntries = useCallback(async () => {
        // Always load from localStorage first
        const localEntries = loadLocalEntries();
        setEntries(localEntries);

        // If logged in, try to sync with server
        if (isLoggedIn) {
            setSyncing(true);
            setSyncError(null);
            try {
                const response = await getJournalList(100, 0);
                if (response.items && response.items.length > 0) {
                    // Convert server entries to local format
                    const serverEntries = response.items.map(item => ({
                        id: item.id.toString(),
                        date: item.created_at,
                        mood: MOOD_REVERSE_MAP[item.mood] || item.mood || 'okay',
                        content: item.content,
                        createdAt: item.created_at,
                        updatedAt: item.created_at,
                        synced: true,
                    }));

                    // Merge: prefer server entries, add local entries not on server
                    const merged = [...serverEntries];
                    localEntries.forEach(local => {
                        if (!local.synced && !serverEntries.find(s => isSameDay(s.date, local.date))) {
                            merged.push(local);
                        }
                    });

                    setEntries(merged);
                    saveLocalEntries(merged);
                }
            } catch (err) {
                console.error('[Journal] Sync error:', err);
                setSyncError('Không thể đồng bộ');
            } finally {
                setSyncing(false);
            }
        }
    }, [isLoggedIn]);

    useEffect(() => {
        loadEntries();
    }, [loadEntries]);

    // Get current month's calendar
    const calendarDays = useMemo(() => {
        const year = viewMonth.getFullYear();
        const month = viewMonth.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days = [];
        // Padding for first week
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        // Days of month
        for (let d = 1; d <= daysInMonth; d++) {
            days.push(new Date(year, month, d));
        }
        return days;
    }, [viewMonth]);

    // Get entry for a date
    const getEntryForDate = (date) => {
        return entries.find(e => isSameDay(e.date, date));
    };

    // Get today's entry
    const todayEntry = useMemo(() => getEntryForDate(new Date()), [entries]);

    // Quick check-in - save mood without content
    const handleQuickCheckIn = async (moodId) => {
        if (!moodId) return;

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        // Check if already has entry
        const existing = entries.find(e => {
            const entryDate = e.date ? new Date(e.date).toISOString().split('T')[0] : null;
            return entryDate === todayStr;
        });

        if (existing) {
            // Update existing
            const updated = entries.map(e => {
                const entryDate = e.date ? new Date(e.date).toISOString().split('T')[0] : null;
                if (entryDate === todayStr) {
                    return { ...e, mood: moodId };
                }
                return e;
            });
            saveLocalEntries(updated);

            // Sync to server
            if (isLoggedIn) {
                try {
                    const backendMood = MOOD_MAP[moodId] || moodId;
                    // Pass a default content if empty
                    await addJournalEntry(existing.content || 'Quick check-in', backendMood, []);
                } catch (e) {
                    console.warn('[MoodJournal] Quick check-in sync failed:', e);
                }
            }
        } else {
            // Create new entry
            const newEntry = {
                id: Date.now().toString(),
                content: '',
                mood: moodId,
                date: today.toISOString(),
            };
            const updated = [...entries, newEntry];
            saveLocalEntries(updated);

            // Sync to server
            if (isLoggedIn) {
                try {
                    const backendMood = MOOD_MAP[moodId] || moodId;
                    // Pass a default content for quick check-in
                    await addJournalEntry('Quick check-in', backendMood, []);
                } catch (e) {
                    console.warn('[MoodJournal] Quick check-in sync failed:', e);
                }
            }
        }

        // Reload entries
        loadEntries();
    };

    // Insights
    const insights = useMemo(() => {
        const last7Days = entries.filter(e => {
            const entryDate = e.date ? new Date(e.date) : null;
            if (!entryDate) return false;
            const daysDiff = (new Date() - entryDate) / (1000 * 60 * 60 * 24);
            return daysDiff <= 7;
        });

        const last30Days = entries.filter(e => {
            const entryDate = e.date ? new Date(e.date) : null;
            if (!entryDate) return false;
            const daysDiff = (new Date() - entryDate) / (1000 * 60 * 60 * 24);
            return daysDiff <= 30;
        });

        // Most common mood
        const moodCounts = {};
        last7Days.forEach(e => {
            if (e.mood) moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
        });
        const mostCommonMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
        const mostCommonMoodData = mostCommonMood ? MOODS.find(m => m.id === mostCommonMood[0]) : null;

        // Trend (comparing last 7 days vs previous 7 days)
        const last14Days = entries.filter(e => {
            const entryDate = e.date ? new Date(e.date) : null;
            if (!entryDate) return false;
            const daysDiff = (new Date() - entryDate) / (1000 * 60 * 60 * 24);
            return daysDiff <= 14;
        });
        const recent7 = last14Days.slice(0, 7);
        const previous7 = last14Days.slice(7, 14);

        const recentAvg = recent7.length > 0
            ? recent7.reduce((sum, e) => {
                const idx = MOODS.findIndex(m => m.id === e.mood);
                return sum + (idx >= 0 ? idx : 2.5);
            }, 0) / recent7.length
            : null;

        const previousAvg = previous7.length > 0
            ? previous7.reduce((sum, e) => {
                const idx = MOODS.findIndex(m => m.id === e.mood);
                return sum + (idx >= 0 ? idx : 2.5);
            }, 0) / previous7.length
            : null;

        let trend = 'stable';
        let trendMessage = 'Cảm xúc của bạn ổn định';
        if (recentAvg !== null && previousAvg !== null) {
            if (recentAvg < previousAvg - 0.5) {
                trend = 'improving';
                trendMessage = 'Cảm xúc của bạn đang cải thiện! 🎉';
            } else if (recentAvg > previousAvg + 0.5) {
                trend = 'declining';
                trendMessage = 'Cảm xúc có vẻ đang đi xuống. Hãy chăm sóc bản thân nhé 💙';
            }
        }

        // Streak
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const entry = getEntryForDate(date);
            if (entry) {
                streak++;
            } else {
                break;
            }
        }

        return {
            mostCommonMood: mostCommonMoodData,
            trend,
            trendMessage,
            streak,
            last7DaysCount: last7Days.length,
            last30DaysCount: last30Days.length,
        };
    }, [entries, getEntryForDate]);

    const [showQuickCheckInSuccess, setShowQuickCheckInSuccess] = useState(false);

    // Filtered entries for list view
    const filteredEntries = useMemo(() => {
        let filtered = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(e =>
                e.content?.toLowerCase().includes(q) ||
                MOODS.find(m => m.id === e.mood)?.label.toLowerCase().includes(q)
            );
        }
        return filtered;
    }, [entries, searchQuery]);

    // Mood stats for current month
    const monthStats = useMemo(() => {
        const year = viewMonth.getFullYear();
        const month = viewMonth.getMonth();
        const monthEntries = entries.filter(e => {
            const d = new Date(e.date);
            return d.getFullYear() === year && d.getMonth() === month;
        });

        const stats = {};
        MOODS.forEach(m => { stats[m.id] = 0; });
        monthEntries.forEach(e => {
            if (stats[e.mood] !== undefined) stats[e.mood]++;
        });
        return { total: monthEntries.length, moods: stats };
    }, [entries, viewMonth]);

    // Weekly mood chart data (7 ngày gần nhất)
    const weeklyChartData = useMemo(() => {
        const today = new Date();
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const entry = getEntryForDate(date);
            const moodValue = entry ? MOODS.findIndex(m => m.id === entry.mood) : -1;
            data.push({
                date: date.toISOString().split('T')[0],
                mood: entry?.mood || null,
                moodValue: moodValue >= 0 ? moodValue : null,
                sentimentScore: entry?.sentimentScore || null,
            });
        }
        return data;
    }, [entries]);

    // Monthly mood chart data (30 ngày gần nhất)
    const monthlyChartData = useMemo(() => {
        const today = new Date();
        const data = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const entry = getEntryForDate(date);
            const moodValue = entry ? MOODS.findIndex(m => m.id === entry.mood) : -1;
            data.push({
                date: date.toISOString().split('T')[0],
                mood: entry?.mood || null,
                moodValue: moodValue >= 0 ? moodValue : null,
                sentimentScore: entry?.sentimentScore || null,
            });
        }
        return data;
    }, [entries]);

    // Save entry
    const saveEntry = async () => {
        if (!mood) return;

        // Phân tích sentiment
        const sentimentScore = analyzeSentiment(content);
        const sentimentLabel = classifySentiment(sentimentScore);

        const entry = {
            id: editingEntry?.id || Date.now().toString(),
            date: selectedDate.toISOString(),
            mood,
            content,
            sentimentScore,
            sentimentLabel,
            createdAt: editingEntry?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            synced: false,
        };

        // Save locally first
        let updated;
        if (editingEntry) {
            updated = entries.map(e => e.id === editingEntry.id ? entry : e);
        } else {
            // Remove existing entry for same day
            updated = entries.filter(e => !isSameDay(e.date, selectedDate));
            updated.push(entry);
        }

        setEntries(updated);
        saveLocalEntries(updated);
        closeEditor();

        // Sync to server if logged in
        if (isLoggedIn) {
            try {
                const backendMood = MOOD_MAP[mood] || mood;
                await addJournalEntry(content, backendMood, []);

                // Thưởng XP khi thêm entry
                try {
                    await rewardXP('journal_add');
                } catch (xpError) {
                    console.warn('[Journal] XP reward failed:', xpError);
                }

                // Mark as synced
                entry.synced = true;
                const syncedUpdated = updated.map(e => e.id === entry.id ? entry : e);
                setEntries(syncedUpdated);
                saveLocalEntries(syncedUpdated);
            } catch (err) {
                console.error('[Journal] Save to server error:', err);
                // Entry is saved locally, will sync later
            }
        }
    };

    // Delete entry
    const deleteEntry = async (id) => {
        const entryToDelete = entries.find(e => e.id === id);
        const updated = entries.filter(e => e.id !== id);
        setEntries(updated);
        saveLocalEntries(updated);

        // Delete from server if logged in and entry was synced
        if (isLoggedIn && entryToDelete?.synced) {
            try {
                await deleteJournalEntry(id);
            } catch (err) {
                console.error('[Journal] Delete from server error:', err);
            }
        }
    };

    // Open editor
    const openEditor = (date, entry = null) => {
        setSelectedDate(date || new Date());
        setEditingEntry(entry);
        setMood(entry?.mood || '');
        setContent(entry?.content || '');
        setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
        setShowEditor(true);
    };

    // Close editor
    const closeEditor = () => {
        setShowEditor(false);
        setEditingEntry(null);
        setMood('');
        setContent('');
    };

    // Navigate month
    const prevMonth = () => {
        setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1));
    };
    const nextMonth = () => {
        setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1));
    };

    // Export entries
    const exportEntries = () => {
        const data = JSON.stringify(entries, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mood-journal-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-[70vh] relative">
            <GlowOrbs className="opacity-30" />

            <div className="relative z-10 max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                            <BookOpen className="w-8 h-8 text-[--brand]" />
                            <span className="gradient-text">Nhật ký Cảm xúc</span>
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-[--muted] text-sm">Ghi lại cảm xúc mỗi ngày</p>
                            {isLoggedIn && (
                                <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${syncing ? 'bg-yellow-500/20 text-yellow-400' : syncError ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                    {syncing ? <Cloud size={12} className="animate-pulse" /> : syncError ? <CloudOff size={12} /> : <Cloud size={12} />}
                                    {syncing ? 'Đang đồng bộ...' : syncError ? 'Offline' : 'Đã đồng bộ'}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant={view === 'calendar' ? 'primary' : 'ghost'}
                            size="sm"
                            icon={<Calendar size={16} />}
                            onClick={() => setView('calendar')}
                        >
                            Lịch
                        </Button>
                        <Button
                            variant={view === 'list' ? 'primary' : 'ghost'}
                            size="sm"
                            icon={<BookOpen size={16} />}
                            onClick={() => setView('list')}
                        >
                            Danh sách
                        </Button>
                        <Button
                            variant={view === 'chart' ? 'primary' : 'ghost'}
                            size="sm"
                            icon={<TrendingUp size={16} />}
                            onClick={() => setView('chart')}
                        >
                            Biểu đồ
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={exportEntries}
                            title="Xuất dữ liệu"
                        >
                            <Download size={16} />
                        </Button>
                    </div>
                </motion.div>

                {/* Quick Check-in */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card variant="highlight" className="relative">
                        <div className="flex items-center gap-2 mb-4">
                            <Zap size={18} className="text-[--brand]" />
                            <h3 className="font-semibold text-[--text]">Quick Check-in</h3>
                        </div>
                        <p className="text-sm text-[--muted] mb-4">
                            Chọn nhanh cảm xúc hôm nay (không cần viết nhật ký)
                        </p>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                            {MOODS.map(m => {
                                const isSelected = todayEntry?.mood === m.id;
                                return (
                                    <motion.button
                                        key={m.id}
                                        onClick={() => handleQuickCheckIn(m.id)}
                                        className={`
                                            p-3 rounded-xl text-center transition-all
                                            ${isSelected
                                                ? `bg-gradient-to-br ${m.color.replace('bg-', 'from-').replace('-500', '-400')} to-${m.color.replace('bg-', '').replace('-500', '-600')} text-white shadow-lg`
                                                : 'glass hover:bg-white/50'
                                            }
                                        `}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        title={m.label}
                                    >
                                        <div className="text-2xl mb-1">{m.emoji}</div>
                                        <div className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-[--text]'}`}>
                                            {m.label}
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                        {showQuickCheckInSuccess && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg"
                            >
                                ✓ Đã lưu!
                            </motion.div>
                        )}
                    </Card>
                </motion.div>

                {/* Insights */}
                {insights.last7DaysCount > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card>
                            <div className="flex items-center gap-2 mb-4">
                                <Lightbulb size={18} className="text-[--accent]" />
                                <h3 className="font-semibold text-[--text]">Insights</h3>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Trend */}
                                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp size={16} className="text-blue-600" />
                                        <span className="text-sm font-medium text-blue-900">Xu hướng</span>
                                    </div>
                                    <p className={`text-sm ${insights.trend === 'improving' ? 'text-green-700' : insights.trend === 'declining' ? 'text-orange-700' : 'text-blue-700'}`}>
                                        {insights.trendMessage}
                                    </p>
                                </div>

                                {/* Most Common Mood */}
                                {insights.mostCommonMood && (
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <BarChart3 size={16} className="text-purple-600" />
                                            <span className="text-sm font-medium text-purple-900">Cảm xúc thường gặp</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{insights.mostCommonMood.emoji}</span>
                                            <span className="text-sm text-purple-700">{insights.mostCommonMood.label}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Streak */}
                                {insights.streak > 0 && (
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock size={16} className="text-amber-600" />
                                            <span className="text-sm font-medium text-amber-900">Chuỗi ngày</span>
                                        </div>
                                        <p className="text-2xl font-bold text-amber-700">{insights.streak} ngày</p>
                                        <p className="text-xs text-amber-600">liên tiếp ghi nhật ký</p>
                                    </div>
                                )}

                                {/* Stats */}
                                <div className="p-4 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Heart size={16} className="text-teal-600" />
                                        <span className="text-sm font-medium text-teal-900">Thống kê</span>
                                    </div>
                                    <p className="text-sm text-teal-700">
                                        {insights.last7DaysCount} ngày trong 7 ngày qua
                                        <br />
                                        {insights.last30DaysCount} ngày trong 30 ngày qua
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}


                {/* Today's mood quick add */}
                {!todayEntry && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card variant="highlight">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-[--text]">Hôm nay bạn cảm thấy thế nào?</p>
                                    <p className="text-sm text-[--muted]">Ghi lại để theo dõi xu hướng cảm xúc</p>
                                </div>
                                <Button onClick={() => openEditor(new Date())} icon={<Plus size={18} />}>
                                    Thêm
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* Calendar View */}
                {view === 'calendar' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <Card>
                            {/* Month navigation */}
                            <div className="flex items-center justify-between mb-4">
                                <Button variant="ghost" size="icon-sm" onClick={prevMonth}>
                                    <ChevronLeft size={20} />
                                </Button>
                                <h2 className="font-semibold text-lg">
                                    {viewMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                                </h2>
                                <Button variant="ghost" size="icon-sm" onClick={nextMonth}>
                                    <ChevronRight size={20} />
                                </Button>
                            </div>

                            {/* Week days header */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
                                    <div key={day} className="text-center text-xs text-[--muted] font-medium py-2">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {calendarDays.map((date, idx) => {
                                    if (!date) {
                                        return <div key={`empty-${idx}`} className="aspect-square" />;
                                    }

                                    const entry = getEntryForDate(date);
                                    const isToday = isSameDay(date, new Date());
                                    const moodData = entry ? MOODS.find(m => m.id === entry.mood) : null;

                                    return (
                                        <button
                                            key={date.toISOString()}
                                            onClick={() => entry ? openEditor(date, entry) : openEditor(date)}
                                            className={`
                        aspect-square rounded-xl p-1 flex flex-col items-center justify-center
                        transition-all hover:scale-105 hover:bg-[--surface-border]/50
                        ${isToday ? 'ring-2 ring-[--brand] ring-offset-2' : ''}
                        ${entry ? 'bg-[--surface-border]/30' : ''}
                      `}
                                        >
                                            <span className={`text-xs ${isToday ? 'font-bold text-[--brand]' : 'text-[--muted]'}`}>
                                                {date.getDate()}
                                            </span>
                                            {moodData && (
                                                <span className="text-lg mt-0.5">{moodData.emoji}</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Month stats */}
                            <div className="mt-4 pt-4 border-t border-[--surface-border]">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-[--muted]">Thống kê tháng này</span>
                                    <Badge variant="primary">{monthStats.total} ngày ghi</Badge>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {MOODS.map(m => {
                                        const count = monthStats.moods[m.id] || 0;
                                        if (count === 0) return null;
                                        return (
                                            <div key={m.id} className="flex items-center gap-1 text-sm">
                                                <span>{m.emoji}</span>
                                                <span className="text-[--muted]">{count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* List View */}
                {view === 'list' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--muted]" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm trong nhật ký..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 glass rounded-xl text-sm outline-none focus:ring-2 focus:ring-[--brand]"
                            />
                        </div>

                        {/* Entries list */}
                        {filteredEntries.length === 0 ? (
                            <Card className="text-center py-8">
                                <BookOpen className="w-12 h-12 mx-auto text-[--muted] mb-3" />
                                <p className="text-[--muted]">Chưa có nhật ký nào</p>
                                <Button onClick={() => openEditor(new Date())} className="mt-4" icon={<Plus size={16} />}>
                                    Viết bài đầu tiên
                                </Button>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {filteredEntries.map(entry => {
                                    const moodData = MOODS.find(m => m.id === entry.mood);
                                    return (
                                        <Card key={entry.id} variant="interactive" onClick={() => openEditor(new Date(entry.date), entry)}>
                                            <div className="flex items-start gap-4">
                                                <div className="text-3xl">{moodData?.emoji || '❓'}</div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge variant="primary" size="sm">{moodData?.label || 'Unknown'}</Badge>
                                                        <span className="text-xs text-[--muted]">
                                                            {formatDate(entry.date)}
                                                        </span>
                                                    </div>
                                                    {entry.content && (
                                                        <p className="text-sm text-[--text-secondary] line-clamp-2">
                                                            {entry.content}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Chart View */}
                {view === 'chart' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        {/* Period selector */}
                        <Card size="sm">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-[--muted]">Khoảng thời gian:</span>
                                <Button
                                    variant={chartPeriod === 'week' ? 'primary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setChartPeriod('week')}
                                >
                                    7 ngày
                                </Button>
                                <Button
                                    variant={chartPeriod === 'month' ? 'primary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setChartPeriod('month')}
                                >
                                    30 ngày
                                </Button>
                            </div>
                        </Card>

                        {/* Mood Chart */}
                        <Card>
                            <h3 className="font-semibold mb-4">Xu hướng cảm xúc</h3>
                            <div className="h-48 flex items-end gap-1">
                                {(chartPeriod === 'week' ? weeklyChartData : monthlyChartData).map((d, i) => {
                                    const hasEntry = d.moodValue !== null;
                                    const height = hasEntry ? ((d.moodValue + 1) / MOODS.length) * 100 : 10;
                                    const moodData = d.mood ? MOODS.find(m => m.id === d.mood) : null;

                                    return (
                                        <div key={d.date} className="flex-1 flex flex-col items-center group relative">
                                            <motion.div
                                                className={`w-full rounded-t transition-all ${hasEntry
                                                        ? moodData?.color || 'bg-gray-400'
                                                        : 'bg-[--surface-border]'
                                                    }`}
                                                initial={{ height: 0 }}
                                                animate={{ height: `${height}%` }}
                                                transition={{ delay: i * 0.05 }}
                                                title={hasEntry ? `${d.date}: ${moodData?.label || d.mood}` : d.date}
                                            />
                                            <span className="text-xs text-[--muted] mt-1 hidden sm:block">
                                                {new Date(d.date).getDate()}/{new Date(d.date).getMonth() + 1}
                                            </span>
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 px-2 py-1 text-xs bg-[--text] text-white rounded-lg whitespace-nowrap">
                                                {d.date}: {hasEntry ? (moodData?.label || d.mood) : 'Chưa có'}
                                                {d.sentimentScore !== null && (
                                                    <span className={`ml-2 ${getSentimentColor(d.sentimentScore)}`}>
                                                        ({Math.round(d.sentimentScore * 100)}%)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-[--muted]">
                                {MOODS.map((m, idx) => (
                                    <div key={m.id} className="flex items-center gap-1">
                                        <div className={`w-3 h-3 rounded ${m.color}`} />
                                        <span>{m.label}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Sentiment Chart */}
                        <Card>
                            <h3 className="font-semibold mb-4">Phân tích cảm xúc (Sentiment)</h3>
                            <div className="h-32 flex items-end gap-1">
                                {(chartPeriod === 'week' ? weeklyChartData : monthlyChartData).map((d, i) => {
                                    const score = d.sentimentScore;
                                    const height = score !== null ? score * 100 : 5;
                                    const color = score !== null
                                        ? (score >= 0.6 ? 'bg-emerald-500' : score <= 0.4 ? 'bg-red-500' : 'bg-amber-500')
                                        : 'bg-[--surface-border]';

                                    return (
                                        <div key={d.date} className="flex-1 flex flex-col items-center group relative">
                                            <motion.div
                                                className={`w-full rounded-t ${color} transition-all`}
                                                initial={{ height: 0 }}
                                                animate={{ height: `${height}%` }}
                                                transition={{ delay: i * 0.05 }}
                                                title={score !== null ? `${d.date}: ${Math.round(score * 100)}%` : d.date}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-4 flex items-center justify-center gap-4 text-xs">
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded bg-emerald-500" />
                                    <span className="text-[--muted]">Tích cực</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded bg-amber-500" />
                                    <span className="text-[--muted]">Trung tính</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded bg-red-500" />
                                    <span className="text-[--muted]">Tiêu cực</span>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </div>

            {/* Editor Modal */}
            <AnimatePresence>
                {showEditor && (
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm grid place-items-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="max-w-lg w-full max-h-[90vh] overflow-y-auto"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                        >
                            <Card variant="elevated" size="lg">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-lg">
                                        {editingEntry ? 'Sửa nhật ký' : 'Nhật ký mới'}
                                    </h3>
                                    <span className="text-sm text-[--muted]">
                                        {formatDate(selectedDate)}
                                    </span>
                                </div>

                                {/* Mood selector */}
                                <div className="mb-4">
                                    <label className="text-sm font-medium text-[--text] mb-2 block">
                                        Hôm nay bạn cảm thấy thế nào?
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {MOODS.map(m => (
                                            <button
                                                key={m.id}
                                                onClick={() => setMood(m.id)}
                                                className={`
                          px-4 py-2 rounded-xl flex items-center gap-2 transition-all
                          ${mood === m.id
                                                        ? 'bg-[--brand] text-white shadow-lg'
                                                        : 'glass hover:bg-white/50'
                                                    }
                        `}
                                            >
                                                <span className="text-xl">{m.emoji}</span>
                                                <span className="text-sm">{m.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="mb-4">
                                    <label className="text-sm font-medium text-[--text] mb-2 block">
                                        {prompt}
                                    </label>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Viết về ngày hôm nay của bạn..."
                                        rows={5}
                                        className="w-full p-3 glass rounded-xl resize-none outline-none focus:ring-2 focus:ring-[--brand] text-sm"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex justify-between">
                                    <div>
                                        {editingEntry && (
                                            <Button
                                                variant="ghost"
                                                onClick={() => { deleteEntry(editingEntry.id); closeEditor(); }}
                                                className="text-red-500"
                                            >
                                                <Trash2 size={16} className="mr-1" /> Xóa
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={closeEditor}>Hủy</Button>
                                        <Button onClick={saveEntry} disabled={!mood}>Lưu</Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
