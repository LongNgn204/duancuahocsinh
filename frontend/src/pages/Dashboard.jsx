// src/pages/Dashboard.jsx
// Chú thích: Trang chủ dashboard - Modern Design v4.0
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle, Heart, Star, Gamepad2, BookOpen,
    Clock, Brain, Zap, Quote, Calendar, Flame, MessageSquare,
    Trophy, TrendingUp, CheckCircle2, Circle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSound } from '../contexts/SoundContext';
// Import streak service thay vì định nghĩa local
import { getStreak, getLoginHistory, generateWeeklyProgress, getTodayString, recordActivity } from '../utils/streakService';
import { addCheckin, isLoggedIn } from '../utils/api';

// Châm ngôn cuộc sống
const lifeQuotes = [
    { text: "Không có việc gì khó, chỉ sợ lòng không bền. Đào núi và lấp biển, quyết chí ắt làm nên.", author: "Chủ tịch Hồ Chí Minh" },
    { text: "Học, học nữa, học mãi.", author: "Chủ tịch Hồ Chí Minh" },
    { text: "Vì lợi ích mười năm thì phải trồng cây, vì lợi ích trăm năm thì phải trồng người.", author: "Chủ tịch Hồ Chí Minh" },
    { text: "Một năm khởi đầu từ mùa xuân. Một đời khởi đầu từ tuổi trẻ. Tuổi trẻ là mùa xuân của xã hội.", author: "Chủ tịch Hồ Chí Minh" },
    { text: "Lao động là vinh quang, không lao động là nhục.", author: "Chủ tịch Hồ Chí Minh" },
    { text: "Gian nan rèn luyện mới thành công.", author: "Chủ tịch Hồ Chí Minh" },
    { text: "Đoàn kết, đoàn kết, đại đoàn kết. Thành công, thành công, đại thành công.", author: "Chủ tịch Hồ Chí Minh" },
    { text: "Muốn đi nhanh thì đi một mình, muốn đi xa thì đi cùng nhau.", author: "Warren Buffett" },
    { text: "Thành công không phải đích đến, mà là hành trình.", author: "Zig Ziglar" },
    { text: "Hôm nay khó khăn, ngày mai sẽ tồi tệ hơn, nhưng ngày kia sẽ tuyệt vời.", author: "Jack Ma" },
];

// Mapping emoji to mood key
const moodMapping = [
    { emoji: '😄', key: 'happy', label: 'Vui vẻ' },
    { emoji: '🙂', key: 'content', label: 'Bình thường' },
    { emoji: '😐', key: 'neutral', label: 'Trung lập' },
    { emoji: '😞', key: 'sad', label: 'Buồn' },
    { emoji: '😡', key: 'angry', label: 'Tức giận' }
];

// Quick access cards data
const quickActions = [
    {
        icon: MessageCircle,
        title: 'Trò chuyện',
        description: 'Tâm sự & Lời khuyên',
        path: '/chat',
        color: 'from-pink-500 to-rose-500',
        bgColor: 'bg-pink-50'
    },
    {
        icon: Heart,
        title: 'Góc An Yên',
        description: 'Thở & Bình tâm',
        path: '/breathing',
        color: 'from-red-500 to-pink-500',
        bgColor: 'bg-red-50'
    },
    {
        icon: Star,
        title: 'Lọ Biết Ơn',
        description: 'Lưu giữ niềm vui',
        path: '/gratitude',
        color: 'from-yellow-500 to-orange-500',
        bgColor: 'bg-yellow-50'
    },
    {
        icon: BookOpen,
        title: 'Kể Chuyện',
        description: 'Bài học cuộc sống',
        path: '/stories',
        color: 'from-blue-500 to-indigo-500',
        bgColor: 'bg-blue-50'
    },
    {
        icon: Gamepad2,
        title: 'Giải Trí',
        description: 'Mini Games vui',
        path: '/games',
        color: 'from-purple-500 to-violet-500',
        bgColor: 'bg-purple-50'
    },
    {
        icon: Clock,
        title: 'Góc Nhỏ',
        description: 'Lịch trình & Nhắc nhở',
        path: '/corner',
        color: 'from-teal-500 to-cyan-500',
        bgColor: 'bg-teal-50'
    },
    {
        icon: Brain,
        title: 'Góc Kiến Thức',
        description: 'Hiểu để thương mình',
        path: '/knowledge-hub',
        color: 'from-emerald-500 to-green-500',
        bgColor: 'bg-emerald-50'
    },
];

// Storage keys
const MOOD_HISTORY_KEY = 'bdh_mood_history';

// Greeting based on time with emoji
function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Chào buổi sáng,', emoji: '🌅', wish: 'Chúc bạn buổi sáng tràn đầy năng lượng' };
    if (hour < 18) return { text: 'Chào buổi chiều,', emoji: '☀️', wish: 'Chúc bạn buổi chiều vui vẻ' };
    if (hour < 22) return { text: 'Chào buổi tối,', emoji: '🌙', wish: 'Chúc bạn buổi tối thư giãn' };
    return { text: 'Đêm đã muộn,', emoji: '🌟', wish: 'Chúc bạn ngủ ngon' };
}

// Format date Vietnamese
function getVietnameseDate() {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const now = new Date();
    return `${days[now.getDay()]}, ${now.getDate()} tháng ${now.getMonth() + 1}`;
}

export default function Dashboard() {
    const { user, refreshUser } = useAuth();
    const { playSound } = useSound();
    const greeting = getGreeting();
    const vietnameseDate = getVietnameseDate();

    // State for mood
    const [selectedMood, setSelectedMood] = useState(null);

    // State for login history and weekly progress
    const [loginHistory, setLoginHistory] = useState([]);
    const [weeklyProgress, setWeeklyProgress] = useState([]);
    const [streak, setStreak] = useState(0);

    // State for daily quote
    const [dailyQuote, setDailyQuote] = useState(() => {
        // Get consistent quote for the day based on date
        const today = new Date();
        const dayIndex = (today.getDate() + today.getMonth()) % lifeQuotes.length;
        return lifeQuotes[dayIndex];
    });

    // Get display name - prioritize display_name (tên riêng) over username
    const displayName = user?.display_name || user?.username || 'Bạn';

    // Calculate completed days this week
    const completedDays = weeklyProgress.filter(d => d.completed).length;

    // User stats with real streak from Backend preference
    const userStats = {
        // Ưu tiên lấy từ backend (user.stats) để có dữ liệu thực tế nhất
        streak: user?.stats?.streak ?? streak,
        chatCount: user?.stats?.chatCount ?? (user?.chat_count || 0),
        xp: user?.xp || 100,
        level: user?.level || 1
    };

    // Handle mood selection
    const handleMoodSelect = (mood) => {
        playSound('pop');
        setSelectedMood(mood.key);

        // Also save mood to localStorage
        try {
            const today = getTodayString();
            const moodHistory = JSON.parse(localStorage.getItem(MOOD_HISTORY_KEY) || '{}');
            moodHistory[today] = mood.key;
            localStorage.setItem(MOOD_HISTORY_KEY, JSON.stringify(moodHistory));
        } catch (e) {
            console.warn('Failed to save mood:', e);
        }
    };

    // Get new random quote
    const getNewQuote = () => {
        playSound('click');
        const randomIndex = Math.floor(Math.random() * lifeQuotes.length);
        setDailyQuote(lifeQuotes[randomIndex]);
    };

    // Record login and calculate progress on mount
    useEffect(() => {
        // Chú thích: GHI NHẬN HOẠT ĐỘNG TRƯỚC, sau đó mới lấy dữ liệu
        // recordActivity trả về lịch sử đã cập nhật, đảm bảo hôm nay được tính
        const updatedHistory = recordActivity('dashboard_visit');
        setLoginHistory(updatedHistory);

        // Refresh user data from server (stats)
        if (user) refreshUser();

        // Tính streak từ lịch sử đã cập nhật
        const currentStreak = getStreak();
        setStreak(currentStreak);

        // Generate weekly progress từ lịch sử đã cập nhật
        const progress = generateWeeklyProgress();
        setWeeklyProgress(progress);

        // Debug: Log để verify
        console.info('[Dashboard] Activity recorded, streak:', currentStreak,
            'progress:', progress.filter(d => d.completed).length + '/7');

        // Load today's mood if any
        try {
            const today = getTodayString();
            const moodHistory = JSON.parse(localStorage.getItem(MOOD_HISTORY_KEY) || '{}');
            if (moodHistory[today]) {
                setSelectedMood(moodHistory[today]);
            }
        } catch (e) {
            console.warn('Failed to load mood:', e);
        }

        const timer = setTimeout(() => {
            playSound('notification');
        }, 500);
        return () => clearTimeout(timer);
    }, [playSound]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-pink-50/50 to-white pb-10">
            {/* --- HERO SECTION --- */}
            {/* Chú thích: Mobile-first padding và responsive layout */}
            <div className="bg-gradient-to-r from-pink-100/80 via-rose-50 to-pink-100/80 border-b border-pink-100 p-4 sm:p-6 lg:p-10">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {/* Date Badge & Stats Row */}
                        {/* Chú thích: Stack trên mobile nhỏ, horizontal trên mobile lớn */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                            {/* Date Badge */}
                            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full border border-pink-200 shadow-sm w-fit">
                                <Calendar size={16} className="text-pink-500" />
                                <span className="text-xs sm:text-sm font-medium text-slate-700">{vietnameseDate}</span>
                            </div>

                            {/* Stats Cards - horizontal scroll trên mobile nhỏ */}
                            <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 overflow-x-auto pb-1 -mx-1 px-1">
                                <div className="text-center flex-shrink-0">
                                    <div className="flex items-center justify-center gap-1">
                                        <Flame size={16} className="text-orange-500 sm:w-[18px] sm:h-[18px]" />
                                        <span className="text-xl sm:text-2xl font-bold text-slate-800">{userStats.streak}</span>
                                    </div>
                                    <p className="text-[10px] sm:text-xs text-slate-500">Ngày streak</p>
                                </div>
                                <div className="w-px h-6 sm:h-8 bg-pink-200 flex-shrink-0" />
                                <div className="text-center flex-shrink-0">
                                    <div className="flex items-center justify-center gap-1">
                                        <MessageSquare size={16} className="text-blue-500 sm:w-[18px] sm:h-[18px]" />
                                        <span className="text-xl sm:text-2xl font-bold text-slate-800">{userStats.chatCount}</span>
                                    </div>
                                    <p className="text-[10px] sm:text-xs text-slate-500">Cuộc trò chuyện</p>
                                </div>
                                <div className="w-px h-6 sm:h-8 bg-pink-200 flex-shrink-0" />
                                <div className="text-center flex-shrink-0">
                                    <div className="flex items-center justify-center gap-1">
                                        <Star size={16} className="text-yellow-500 sm:w-[18px] sm:h-[18px]" />
                                        <span className="text-xl sm:text-2xl font-bold text-slate-800">{userStats.xp}</span>
                                    </div>
                                    <p className="text-[10px] sm:text-xs text-slate-500">XP (Lv.{userStats.level})</p>
                                </div>
                            </div>
                        </div>

                        {/* Greeting - Fluid typography */}
                        <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-pink-600 mb-2">
                            {greeting.text} <span className="text-slate-800">{displayName}!</span> 👋
                        </h1>
                        <p className="text-slate-600 text-base sm:text-lg mb-1">
                            {greeting.wish} {greeting.emoji}
                        </p>
                        <p className="text-sm sm:text-base text-slate-500">
                            Hôm nay bạn cảm thấy thế nào? Hãy chọn tâm trạng của bạn bên dưới.
                        </p>

                        {/* Mood Tracker - Touch-friendly với 44px min target */}
                        <div className="mt-4 sm:mt-6 flex items-center gap-2 sm:gap-3 flex-wrap">
                            {moodMapping.map((mood, idx) => (
                                <motion.button
                                    key={idx}
                                    onClick={() => handleMoodSelect(mood)}
                                    className={`text-2xl sm:text-3xl p-2.5 sm:p-2 min-w-[44px] min-h-[44px] rounded-full transition-all cursor-pointer ${selectedMood === mood.key
                                        ? 'bg-white shadow-lg scale-105 sm:scale-110 ring-2 ring-pink-300'
                                        : 'hover:bg-white/50 hover:scale-105 active:scale-95'
                                        }`}
                                    whileTap={{ scale: 0.95 }}
                                    title={mood.label}
                                    aria-label={mood.label}
                                >
                                    {mood.emoji}
                                </motion.button>
                            ))}
                            {selectedMood && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-xs sm:text-sm text-pink-600 font-medium ml-1 sm:ml-2"
                                >
                                    Bạn đang cảm thấy {moodMapping.find(m => m.key === selectedMood)?.label.toLowerCase()}
                                </motion.span>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* --- QUICK ACTIONS GRID --- */}
            {/* Chú thích: Mobile-first grid với 2 cột trên mobile, responsive gap */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <Zap size={18} className="text-pink-600 sm:w-5 sm:h-5" />
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">Khám Phá</h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {quickActions.map((act, index) => (
                        <motion.div
                            key={act.path}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                        >
                            <Link to={act.path} onClick={() => playSound('click')}>
                                <div className={`${act.bgColor} border border-slate-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group min-h-[100px]`}>
                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${act.color} flex items-center justify-center text-white shadow-md mb-2 sm:mb-3`}>
                                        <act.icon size={20} className="sm:w-6 sm:h-6" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 group-hover:text-slate-700 text-xs sm:text-sm">
                                        {act.title}
                                    </h3>
                                    <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 line-clamp-2">
                                        {act.description}
                                    </p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* --- WEEKLY PROGRESS --- */}
            <div className="max-w-5xl mx-auto px-4 md:px-8 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <TrendingUp size={20} className="text-emerald-600" />
                            <h2 className="text-xl font-bold text-slate-900">Tiến độ tuần này</h2>
                        </div>

                        {/* Nút điểm danh thủ công */}
                        {!weeklyProgress.find(d => d.current && d.completed) && (
                            <motion.button
                                onClick={async () => {
                                    playSound('pop');
                                    // 1. Lưu local trước để UI update ngay
                                    const updated = recordActivity('manual_checkin');
                                    setLoginHistory(updated);
                                    setStreak(getStreak());
                                    setWeeklyProgress(generateWeeklyProgress());

                                    // 2. Sync lên server (nếu đã đăng nhập)
                                    if (isLoggedIn()) {
                                        try {
                                            await addCheckin('manual');
                                            console.log('[Dashboard] Checkin synced to server');
                                        } catch (err) {
                                            console.warn('[Dashboard] Failed to sync checkin:', err.message);
                                        }
                                    }
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-400 to-green-500 text-white text-sm font-medium rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all"
                                whileTap={{ scale: 0.95 }}
                            >
                                <CheckCircle2 size={16} />
                                Điểm danh
                            </motion.button>
                        )}

                        {weeklyProgress.find(d => d.current && d.completed) && (
                            <span className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-xl">
                                <CheckCircle2 size={16} />
                                Đã điểm danh ✓
                            </span>
                        )}
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                            {weeklyProgress.map((day, idx) => (
                                <div key={idx} className="flex-1 text-center">
                                    <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${day.completed
                                        ? 'bg-emerald-500 text-white'
                                        : day.current
                                            ? 'bg-pink-500 text-white ring-4 ring-pink-200'
                                            : 'bg-slate-100 text-slate-400'
                                        }`}>
                                        {day.completed ? (
                                            <CheckCircle2 size={20} />
                                        ) : day.current ? (
                                            <span className="text-xl">✨</span>
                                        ) : day.isPast ? (
                                            <span className="text-sm">✗</span>
                                        ) : (
                                            <Circle size={20} />
                                        )}
                                    </div>
                                    <p className={`text-xs font-medium ${day.current ? 'text-pink-600' : day.completed ? 'text-emerald-600' : 'text-slate-500'
                                        }`}>
                                        {day.day}
                                    </p>
                                    {day.completed && (
                                        <p className="text-xs text-emerald-600">✓</p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-6">
                            <div className="flex justify-between text-sm text-slate-600 mb-2">
                                <span>Hoàn thành tuần này</span>
                                <span className="font-semibold text-emerald-600">{completedDays}/7 ngày</span>
                            </div>
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(completedDays / 7) * 100}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* --- LIFE QUOTE --- */}
            <div className="max-w-5xl mx-auto px-4 md:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Quote size={20} className="text-amber-600" />
                        <h2 className="text-xl font-bold text-slate-900">Châm ngôn cuộc sống</h2>
                    </div>

                    <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/30 to-orange-200/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-yellow-200/30 to-amber-200/30 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                        <div className="relative">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                                    <Quote size={28} />
                                </div>
                                <div className="flex-1">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={dailyQuote.text}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <p className="text-lg md:text-xl font-medium text-slate-800 leading-relaxed italic mb-3">
                                                "{dailyQuote.text}"
                                            </p>
                                            <p className="text-sm text-amber-700 font-semibold">
                                                — {dailyQuote.author}
                                            </p>
                                        </motion.div>
                                    </AnimatePresence>

                                    <button
                                        onClick={getNewQuote}
                                        className="mt-4 inline-flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-medium hover:shadow-md transition-all hover:scale-105"
                                    >
                                        ✨ Câu châm ngôn khác
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
