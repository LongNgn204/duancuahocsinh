// src/components/sleep/SleepHelper.jsx
// Chú thích: Sleep Helper v2.1 - Âm thanh thư giãn, theo dõi giấc ngủ với server sync, và Kể chuyện
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import GlowOrbs from '../ui/GlowOrbs';
import StoryTeller from '../resources/StoryTeller';
import {
    Moon, Sun, Play, Pause, Volume2, VolumeX, Clock,
    CloudRain, Wind, Waves, Flame, Music, Bird, Timer, BookOpen, Cloud, TrendingUp, BarChart3
} from 'lucide-react';
import { isLoggedIn, getSleepLogs, saveSleepLog, scheduleSync, rewardXP } from '../../utils/api';


// Sleep sounds (would need actual audio files in production)
const SOUNDS = [
    { id: 'rain', label: 'Mưa', icon: CloudRain, color: 'from-blue-500 to-cyan-500' },
    { id: 'wind', label: 'Gió', icon: Wind, color: 'from-teal-500 to-emerald-500' },
    { id: 'waves', label: 'Sóng biển', icon: Waves, color: 'from-cyan-500 to-blue-500' },
    { id: 'fire', label: 'Lửa', icon: Flame, color: 'from-orange-500 to-red-500' },
    { id: 'forest', label: 'Rừng', icon: Bird, color: 'from-green-500 to-emerald-500' },
    { id: 'piano', label: 'Piano', icon: Music, color: 'from-purple-500 to-pink-500' },
];

// Sleep timer options (minutes)
const TIMERS = [15, 30, 45, 60, 90, 120];

// Storage
const SLEEP_STATS_KEY = 'sleep_stats_v1';

function loadLocalStats() {
    try {
        const raw = localStorage.getItem(SLEEP_STATS_KEY);
        return raw ? JSON.parse(raw) : { logs: [], avgQuality: 0 };
    } catch (_) {
        return { logs: [], avgQuality: 0 };
    }
}

function saveLocalStats(stats) {
    try {
        localStorage.setItem(SLEEP_STATS_KEY, JSON.stringify(stats));
    } catch (_) { }
}

export default function SleepHelper() {
    // Tab state: 'sleep' hoặc 'story'
    const [activeTab, setActiveTab] = useState('sleep');
    const [activeSound, setActiveSound] = useState(null);
    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);
    const [timer, setTimer] = useState(null); // minutes
    const [timeLeft, setTimeLeft] = useState(0);
    const [showLog, setShowLog] = useState(false);
    const [stats, setStats] = useState({ logs: [], avgQuality: 0 });
    const [source, setSource] = useState('local'); // 'server' | 'local'
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Sleep log form
    const [sleepTime, setSleepTime] = useState('22:00');
    const [wakeTime, setWakeTime] = useState('06:00');
    const [quality, setQuality] = useState(3);

    const audioRef = useRef(null);

    // Load stats - prefer server if logged in
    useEffect(() => {
        const loadStats = async () => {
            setLoading(true);
            if (isLoggedIn()) {
                try {
                    const result = await getSleepLogs(50);
                    const serverLogs = (result.items || []).map(item => ({
                        id: item.id,
                        date: item.created_at,
                        sleepTime: item.sleep_time,
                        wakeTime: item.wake_time,
                        quality: item.quality || 3,
                        duration: (item.duration_minutes || 0) / 60,
                    }));
                    const avgQ = serverLogs.length > 0
                        ? serverLogs.reduce((s, l) => s + l.quality, 0) / serverLogs.length
                        : 0;
                    setStats({ logs: serverLogs, avgQuality: avgQ });
                    setSource('server');
                } catch (e) {
                    console.warn('[Sleep] API failed, using local:', e.message);
                    setStats(loadLocalStats());
                    setSource('local');
                }
            } else {
                setStats(loadLocalStats());
                setSource('local');
            }
            setLoading(false);
        };
        loadStats();
    }, []);

    // Timer countdown
    useEffect(() => {
        if (timer === null || timeLeft <= 0) return;

        const interval = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    stopSound();
                    return 0;
                }
                return t - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [timer, timeLeft]);

    // Play sound
    const playSound = (soundId) => {
        if (activeSound === soundId) {
            stopSound();
            return;
        }

        // In production, load actual audio files
        // audioRef.current = new Audio(`/sounds/sleep/${soundId}.mp3`);
        // audioRef.current.loop = true;
        // audioRef.current.volume = isMuted ? 0 : volume;
        // audioRef.current.play();

        setActiveSound(soundId);
    };

    // Stop sound
    const stopSound = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setActiveSound(null);
        setTimer(null);
        setTimeLeft(0);
    };

    // Set sleep timer
    const setSleepTimer = (minutes) => {
        if (timer === minutes) {
            setTimer(null);
            setTimeLeft(0);
        } else {
            setTimer(minutes);
            setTimeLeft(minutes * 60);
        }
    };

    // Toggle mute
    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? volume : 0;
        }
    };

    // Calculate sleep duration
    const calculateDuration = (sleep, wake) => {
        const [sh, sm] = sleep.split(':').map(Number);
        const [wh, wm] = wake.split(':').map(Number);
        let hours = wh - sh;
        if (hours < 0) hours += 24;
        const mins = wm - sm;
        return hours + mins / 60;
    };

    // Log sleep - save to both local and server
    const logSleep = async () => {
        const duration = calculateDuration(sleepTime, wakeTime);
        const log = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            sleepTime,
            wakeTime,
            quality,
            duration,
        };

        // Optimistic update
        const newLogs = [log, ...stats.logs].slice(0, 30);
        const avgQuality = newLogs.reduce((sum, l) => sum + l.quality, 0) / newLogs.length;
        const newStats = { logs: newLogs, avgQuality };
        setStats(newStats);
        saveLocalStats(newStats);
        setShowLog(false);

        // Save to server if logged in
        if (isLoggedIn()) {
            setSaving(true);
            try {
                await saveSleepLog(sleepTime, wakeTime, quality, '', Math.round(duration * 60));
                
                // Thưởng XP khi log sleep
                try {
                    await rewardXP('sleep_log');
                } catch (xpError) {
                    console.warn('[Sleep] XP reward failed:', xpError);
                }
                
                scheduleSync(3000);
            } catch (e) {
                console.warn('[Sleep] Server save failed:', e.message);
            } finally {
                setSaving(false);
            }
        }
    };

    // Format time
    const formatTimeLeft = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        return `${m}:${String(s).padStart(2, '0')}`;
    };

    return (
        <div className="min-h-[70vh] relative pb-20 md:pb-0">
            <GlowOrbs className="opacity-30" />

            <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                            <Moon className="w-8 h-8 text-[--brand]" />
                            <span className="gradient-text">Thư Giãn</span>
                        </h1>
                        <p className="text-[--muted] text-sm mt-1">Thư giãn và ngủ ngon hơn</p>
                    </div>

                    {activeTab === 'sleep' && (
                        <Button variant="outline" onClick={() => setShowLog(true)} icon={<Clock size={16} />}>
                            Ghi giấc ngủ
                        </Button>
                    )}
                </motion.div>

                {/* Tab Navigation */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                >
                    <div className="flex gap-2 p-1 glass rounded-2xl">
                        <button
                            onClick={() => setActiveTab('sleep')}
                            className={`
                                flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                                font-medium transition-all
                                ${activeTab === 'sleep'
                                    ? 'bg-[--brand] text-white shadow-lg'
                                    : 'text-[--muted] hover:text-[--text] hover:bg-white/50'
                                }
                            `}
                        >
                            <Moon size={18} />
                            Âm thanh & Giấc ngủ
                        </button>
                        <button
                            onClick={() => setActiveTab('story')}
                            className={`
                                flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                                font-medium transition-all
                                ${activeTab === 'story'
                                    ? 'bg-[--brand] text-white shadow-lg'
                                    : 'text-[--muted] hover:text-[--text] hover:bg-white/50'
                                }
                            `}
                        >
                            <BookOpen size={18} />
                            Kể chuyện
                        </button>
                    </div>
                </motion.div>

                {/* Content based on tab */}
                {activeTab === 'story' ? (
                    <StoryTeller />
                ) : (
                    <>


                        {/* Sound selector */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card>
                                <h3 className="font-semibold mb-4">Âm thanh thư giãn</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {SOUNDS.map(sound => (
                                        <button
                                            key={sound.id}
                                            onClick={() => playSound(sound.id)}
                                            className={`
                    p-4 rounded-xl transition-all flex flex-col items-center gap-2
                    ${activeSound === sound.id
                                                    ? `bg-gradient-to-br ${sound.color} text-white shadow-lg scale-105`
                                                    : 'glass hover:bg-white/50'
                                                }
                  `}
                                        >
                                            <sound.icon size={28} />
                                            <span className="text-sm font-medium">{sound.label}</span>
                                            {activeSound === sound.id && (
                                                <motion.div
                                                    className="flex gap-1"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                >
                                                    {[...Array(3)].map((_, i) => (
                                                        <motion.div
                                                            key={i}
                                                            className="w-1 bg-white/60 rounded"
                                                            animate={{ height: [8, 16, 8] }}
                                                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                                        />
                                                    ))}
                                                </motion.div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Volume & Controls */}
                                {activeSound && (
                                    <motion.div
                                        className="mt-4 pt-4 border-t border-[--surface-border] flex items-center gap-4"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <Button variant="ghost" size="icon" onClick={toggleMute}>
                                            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                        </Button>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={isMuted ? 0 : volume}
                                            onChange={(e) => {
                                                setVolume(parseFloat(e.target.value));
                                                if (audioRef.current) audioRef.current.volume = parseFloat(e.target.value);
                                                setIsMuted(false);
                                            }}
                                            className="flex-1 h-2 bg-[--surface-border] rounded-full accent-[--brand]"
                                        />
                                        <Button variant="ghost" size="sm" onClick={stopSound}>
                                            Dừng
                                        </Button>
                                    </motion.div>
                                )}
                            </Card>
                        </motion.div>

                        {/* Sleep Timer */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <Timer size={18} className="text-[--brand]" />
                                        Hẹn giờ tắt
                                    </h3>
                                    {timeLeft > 0 && (
                                        <Badge variant="accent">
                                            {formatTimeLeft(timeLeft)} còn lại
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {TIMERS.map(mins => (
                                        <button
                                            key={mins}
                                            onClick={() => setSleepTimer(mins)}
                                            className={`
                    px-4 py-2 rounded-xl text-sm transition-all
                    ${timer === mins
                                                    ? 'bg-[--brand] text-white'
                                                    : 'glass hover:bg-white/50'
                                                }
                  `}
                                        >
                                            {mins} phút
                                        </button>
                                    ))}
                                </div>
                            </Card>
                        </motion.div>

                        {/* Sleep Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card>
                                <h3 className="font-semibold mb-4">Thống kê giấc ngủ</h3>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <div className="text-2xl font-bold gradient-text">
                                            {stats.logs.length > 0
                                                ? (stats.logs.reduce((s, l) => s + l.duration, 0) / stats.logs.length).toFixed(1)
                                                : '0'
                                            }h
                                        </div>
                                        <div className="text-xs text-[--muted]">Tb giờ ngủ</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-[--secondary]">
                                            {stats.avgQuality ? stats.avgQuality.toFixed(1) : '0'}/5
                                        </div>
                                        <div className="text-xs text-[--muted]">Tb chất lượng</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-[--accent]">
                                            {stats.logs.length}
                                        </div>
                                        <div className="text-xs text-[--muted]">Đêm ghi nhận</div>
                                    </div>
                                </div>

                                {/* Sleep Chart - 7 ngày gần nhất */}
                                {stats.logs.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-[--surface-border]">
                                        <div className="flex items-center gap-2 mb-3">
                                            <BarChart3 size={16} className="text-[--muted]" />
                                            <p className="text-sm font-medium text-[--text]">Xu hướng 7 ngày gần nhất</p>
                                        </div>
                                        <div className="h-32 flex items-end gap-1">
                                            {(() => {
                                                const today = new Date();
                                                const weekData = [];
                                                for (let i = 6; i >= 0; i--) {
                                                    const date = new Date(today);
                                                    date.setDate(today.getDate() - i);
                                                    const dateStr = date.toISOString().split('T')[0];
                                                    const log = stats.logs.find(l => 
                                                        new Date(l.date).toISOString().split('T')[0] === dateStr
                                                    );
                                                    weekData.push({
                                                        date: dateStr,
                                                        duration: log?.duration || 0,
                                                        quality: log?.quality || 0,
                                                    });
                                                }
                                                const maxDuration = Math.max(...weekData.map(d => d.duration), 8);
                                                return weekData.map((d, i) => {
                                                    const height = d.duration > 0 ? (d.duration / maxDuration) * 100 : 5;
                                                    return (
                                                        <div key={d.date} className="flex-1 flex flex-col items-center group relative">
                                                            <motion.div
                                                                className={`w-full rounded-t transition-all ${
                                                                    d.duration > 0 
                                                                        ? d.quality >= 4 ? 'bg-emerald-500' 
                                                                          : d.quality >= 3 ? 'bg-amber-500' 
                                                                          : 'bg-red-500'
                                                                        : 'bg-[--surface-border]'
                                                                }`}
                                                                initial={{ height: 0 }}
                                                                animate={{ height: `${height}%` }}
                                                                transition={{ delay: i * 0.05 }}
                                                                title={d.duration > 0 
                                                                    ? `${d.date}: ${d.duration.toFixed(1)}h (${d.quality}/5)` 
                                                                    : d.date
                                                                }
                                                            />
                                                            <span className="text-xs text-[--muted] mt-1 hidden sm:block">
                                                                {new Date(d.date).getDate()}/{new Date(d.date).getMonth() + 1}
                                                            </span>
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                        <div className="mt-2 flex items-center justify-center gap-4 text-xs text-[--muted]">
                                            <div className="flex items-center gap-1">
                                                <div className="w-3 h-3 rounded bg-emerald-500" />
                                                <span>Tốt (≥4★)</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-3 h-3 rounded bg-amber-500" />
                                                <span>Trung bình (3★)</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-3 h-3 rounded bg-red-500" />
                                                <span>Kém ({'<3★'})</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Recent logs */}
                                {stats.logs.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-[--surface-border] space-y-2">
                                        <p className="text-sm text-[--muted]">Gần đây:</p>
                                        {stats.logs.slice(0, 3).map(log => (
                                            <div key={log.id} className="flex items-center justify-between text-sm">
                                                <span className="text-[--text-secondary]">
                                                    {new Date(log.date).toLocaleDateString('vi-VN')}
                                                </span>
                                                <span>{log.sleepTime} → {log.wakeTime}</span>
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className={i < log.quality ? 'text-amber-400' : 'text-gray-300'}>★</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        </motion.div>

                        {/* Sleep Log Modal */}
                        <AnimatePresence>
                            {showLog && (
                                <motion.div
                                    className="fixed inset-0 bg-black/60 backdrop-blur-sm grid place-items-center z-50 p-4"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <motion.div
                                        className="max-w-sm w-full"
                                        initial={{ scale: 0.9, y: 20 }}
                                        animate={{ scale: 1, y: 0 }}
                                        exit={{ scale: 0.9, y: 20 }}
                                    >
                                        <Card variant="elevated" size="lg">
                                            <h3 className="font-semibold text-lg mb-4">Ghi nhận giấc ngủ</h3>

                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-sm text-[--muted] block mb-1">Giờ đi ngủ</label>
                                                        <input
                                                            type="time"
                                                            value={sleepTime}
                                                            onChange={(e) => setSleepTime(e.target.value)}
                                                            className="w-full p-2 glass rounded-xl text-center"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm text-[--muted] block mb-1">Giờ dậy</label>
                                                        <input
                                                            type="time"
                                                            value={wakeTime}
                                                            onChange={(e) => setWakeTime(e.target.value)}
                                                            className="w-full p-2 glass rounded-xl text-center"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-sm text-[--muted] block mb-2">Chất lượng giấc ngủ</label>
                                                    <div className="flex justify-center gap-2">
                                                        {[1, 2, 3, 4, 5].map(q => (
                                                            <button
                                                                key={q}
                                                                onClick={() => setQuality(q)}
                                                                className={`text-3xl transition-transform ${q <= quality ? 'scale-110' : 'opacity-30'}`}
                                                            >
                                                                ★
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-6 flex justify-end gap-2">
                                                <Button variant="outline" onClick={() => setShowLog(false)}>Hủy</Button>
                                                <Button onClick={logSleep}>Lưu</Button>
                                            </div>
                                        </Card>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </div>
        </div >
    );
}
