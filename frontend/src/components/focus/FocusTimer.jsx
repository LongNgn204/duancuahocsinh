// src/components/focus/FocusTimer.jsx
// Chú thích: Focus Timer v2.0 - Pomodoro timer với ambient sounds, stats, backend sync
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import GlowOrbs from '../ui/GlowOrbs';
import {
    Play, Pause, RotateCcw, Coffee, BookOpen,
    Volume2, VolumeX, Settings2, Trophy, Target,
    Clock, Flame, CheckCircle, Cloud
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { saveFocusSession, getFocusSessions } from '../../utils/api';

// Timer presets
const PRESETS = {
    pomodoro: { work: 25, break: 5, label: 'Pomodoro 25/5' },
    shortFocus: { work: 15, break: 3, label: 'Ngắn 15/3' },
    longFocus: { work: 45, break: 10, label: 'Dài 45/10' },
    custom: { work: 30, break: 5, label: 'Tuỳ chỉnh' },
};

// Ambient sounds
const SOUNDS = [
    { id: 'none', label: 'Tắt', emoji: '🔇' },
    { id: 'rain', label: 'Mưa', emoji: '🌧️' },
    { id: 'forest', label: 'Rừng', emoji: '🌲' },
    { id: 'coffee', label: 'Cafe', emoji: '☕' },
    { id: 'waves', label: 'Sóng biển', emoji: '🌊' },
    { id: 'fire', label: 'Lửa', emoji: '🔥' },
];

// Storage keys
const STATS_KEY = 'focus_stats_v1';

function loadStats() {
    try {
        const raw = localStorage.getItem(STATS_KEY);
        return raw ? JSON.parse(raw) : { totalMinutes: 0, sessions: 0, streak: 0, lastDate: null };
    } catch (_) {
        return { totalMinutes: 0, sessions: 0, streak: 0, lastDate: null };
    }
}

function saveStats(stats) {
    try {
        localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (_) { }
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function FocusTimer() {
    const { isLoggedIn } = useAuth();
    const [preset, setPreset] = useState('pomodoro');
    const [customWork, setCustomWork] = useState(30);
    const [customBreak, setCustomBreak] = useState(5);

    const [mode, setMode] = useState('work'); // 'work' | 'break'
    const [timeLeft, setTimeLeft] = useState(PRESETS.pomodoro.work * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [sessions, setSessions] = useState(0);

    const [sound, setSound] = useState('none');
    const [showSettings, setShowSettings] = useState(false);
    const [stats, setStats] = useState(loadStats);
    const [syncing, setSyncing] = useState(false);

    const audioRef = useRef(null);
    const intervalRef = useRef(null);

    // Tính thời gian dựa trên preset
    const getMinutes = useCallback(() => {
        if (preset === 'custom') {
            return mode === 'work' ? customWork : customBreak;
        }
        return mode === 'work' ? PRESETS[preset].work : PRESETS[preset].break;
    }, [preset, mode, customWork, customBreak]);

    // Reset timer khi đổi preset/mode
    useEffect(() => {
        setTimeLeft(getMinutes() * 60);
        setIsRunning(false);
    }, [preset, mode, getMinutes]);

    // Timer logic
    useEffect(() => {
        if (!isRunning) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }

        intervalRef.current = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) {
                    clearInterval(intervalRef.current);
                    onTimerComplete();
                    return 0;
                }
                return t - 1;
            });
        }, 1000);

        return () => clearInterval(intervalRef.current);
    }, [isRunning]);

    // Timer complete
    const onTimerComplete = async () => {
        setIsRunning(false);

        // Play notification sound
        try {
            const audio = new Audio('/sounds/complete.mp3');
            audio.play().catch(() => { });
        } catch (_) { }

        if (mode === 'work') {
            // Update stats
            const minutes = getMinutes();
            const today = new Date().toDateString();
            const newStats = {
                ...stats,
                totalMinutes: stats.totalMinutes + minutes,
                sessions: stats.sessions + 1,
                streak: stats.lastDate === today ? stats.streak : stats.streak + 1,
                lastDate: today,
            };
            setStats(newStats);
            saveStats(newStats);
            setSessions((s) => s + 1);

            // Sync to backend if logged in
            if (isLoggedIn) {
                try {
                    setSyncing(true);
                    await saveFocusSession(minutes, 'focus', true);
                } catch (err) {
                    console.error('[FocusTimer] Sync error:', err);
                } finally {
                    setSyncing(false);
                }
            }

            // Auto switch to break
            setMode('break');
            setTimeLeft(getMinutes() * 60);
        } else {
            // After break, ready for next work session
            setMode('work');
            setTimeLeft(getMinutes() * 60);
        }
    };

    const toggle = () => setIsRunning(!isRunning);

    const reset = () => {
        setIsRunning(false);
        setTimeLeft(getMinutes() * 60);
    };

    const skipToBreak = () => {
        if (mode === 'work') {
            setMode('break');
        } else {
            setMode('work');
        }
    };

    // Progress calculation
    const totalSeconds = getMinutes() * 60;
    const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

    // Play ambient sound
    useEffect(() => {
        if (sound === 'none' || !isRunning) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            return;
        }

        // Would need actual audio files in production
        // For now, this is a placeholder
        // audioRef.current = new Audio(`/sounds/${sound}.mp3`);
        // audioRef.current.loop = true;
        // audioRef.current.volume = 0.3;
        // audioRef.current.play().catch(() => {});

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, [sound, isRunning]);

    return (
        <div className="min-h-[70vh] relative">
            <GlowOrbs className="opacity-30" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                            <Target className="w-8 h-8 text-[--brand]" />
                            <span className="gradient-text">Hẹn giờ Tập trung</span>
                        </h1>
                        <p className="text-[--muted] text-sm mt-1">Tập trung hiệu quả với Pomodoro</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="accent" icon={<Flame size={14} />}>
                            {stats.streak} ngày
                        </Badge>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowSettings(!showSettings)}
                        >
                            <Settings2 size={20} />
                        </Button>
                    </div>
                </motion.div>

                {/* Presets */}
                <motion.div
                    className="flex flex-wrap gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    {Object.entries(PRESETS).map(([key, val]) => (
                        <button
                            key={key}
                            onClick={() => setPreset(key)}
                            className={`
                px-4 py-2 rounded-xl text-sm font-medium transition-all
                ${preset === key
                                    ? 'bg-[--brand] text-white shadow-lg shadow-[--brand]/20'
                                    : 'glass hover:bg-white/50'
                                }
              `}
                        >
                            {val.label}
                        </button>
                    ))}
                </motion.div>

                {/* Main Timer Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card variant="elevated" className="relative overflow-hidden">
                        {/* Progress bar */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[--surface-border]">
                            <motion.div
                                className={`h-full ${mode === 'work' ? 'bg-[--brand]' : 'bg-[--accent]'}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>

                        {/* Mode indicator */}
                        <div className="flex justify-center mb-6">
                            <Badge
                                variant={mode === 'work' ? 'primary' : 'accent'}
                                icon={mode === 'work' ? <BookOpen size={14} /> : <Coffee size={14} />}
                            >
                                {mode === 'work' ? 'Đang tập trung' : 'Nghỉ ngơi'}
                            </Badge>
                        </div>

                        {/* Timer display */}
                        <div className="text-center mb-8">
                            <motion.div
                                className="text-7xl md:text-8xl font-bold gradient-text tracking-tight"
                                key={timeLeft}
                                initial={{ scale: 0.95 }}
                                animate={{ scale: 1 }}
                            >
                                {formatTime(timeLeft)}
                            </motion.div>
                            <p className="text-[--muted] mt-2">
                                Phiên thứ {sessions + 1} hôm nay
                            </p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={reset}
                                disabled={timeLeft === totalSeconds && !isRunning}
                            >
                                <RotateCcw size={22} />
                            </Button>

                            <Button
                                variant={isRunning ? 'outline' : 'primary'}
                                size="xl"
                                onClick={toggle}
                                icon={isRunning ? <Pause size={24} /> : <Play size={24} />}
                                className="w-32"
                            >
                                {isRunning ? 'Tạm dừng' : 'Bắt đầu'}
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={skipToBreak}
                            >
                                {mode === 'work' ? <Coffee size={22} /> : <BookOpen size={22} />}
                            </Button>
                        </div>

                        {/* Ambient sound selector */}
                        <div className="mt-8 pt-6 border-t border-[--surface-border]">
                            <p className="text-sm text-[--muted] text-center mb-3">Âm thanh nền</p>
                            <div className="flex justify-center gap-2 flex-wrap">
                                {SOUNDS.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => setSound(s.id)}
                                        className={`
                      px-3 py-2 rounded-xl text-sm transition-all
                      ${sound === s.id
                                                ? 'bg-[--brand]/20 text-[--brand]'
                                                : 'glass hover:bg-white/50'
                                            }
                    `}
                                        title={s.label}
                                    >
                                        <span className="mr-1">{s.emoji}</span>
                                        <span className="hidden sm:inline">{s.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Stats */}
                <motion.div
                    className="grid grid-cols-3 gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card size="sm" className="text-center">
                        <Clock className="w-6 h-6 mx-auto mb-2 text-[--brand]" />
                        <div className="text-2xl font-bold gradient-text">{stats.totalMinutes}</div>
                        <div className="text-xs text-[--muted]">Phút tập trung</div>
                    </Card>

                    <Card size="sm" className="text-center">
                        <CheckCircle className="w-6 h-6 mx-auto mb-2 text-[--secondary]" />
                        <div className="text-2xl font-bold text-[--secondary]">{stats.sessions}</div>
                        <div className="text-xs text-[--muted]">Phiên hoàn thành</div>
                    </Card>

                    <Card size="sm" className="text-center">
                        <Flame className="w-6 h-6 mx-auto mb-2 text-[--accent]" />
                        <div className="text-2xl font-bold text-[--accent]">{stats.streak}</div>
                        <div className="text-xs text-[--muted]">Ngày liên tiếp</div>
                    </Card>
                </motion.div>

                {/* Tips */}
                <Card size="sm">
                    <div className="flex items-start gap-3">
                        <Trophy size={18} className="text-[--accent] shrink-0 mt-0.5" />
                        <div className="text-sm text-[--text-secondary]">
                            <strong className="text-[--text]">Mẹo:</strong> Tắt thông báo điện thoại,
                            đặt mục tiêu rõ ràng trước khi bắt đầu, và nhớ nghỉ ngơi đầy đủ giữa các phiên!
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
