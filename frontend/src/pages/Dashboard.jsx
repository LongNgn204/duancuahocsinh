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
    const { user } = useAuth();
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

    // User stats with real streak
    const userStats = {
        streak: streak,
        chatCount: user?.chat_count || 0,
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
        // Ghi nhận hoạt động hôm nay (từ streakService)
        recordActivity('dashboard_visit');

        // Lấy lịch sử và tính streak từ service
        const history = getLoginHistory();
        setLoginHistory(history);

        const currentStreak = getStreak();
        setStreak(currentStreak);

        // Generate weekly progress từ service
        const progress = generateWeeklyProgress();
        setWeeklyProgress(progress);

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
            <div className="bg-gradient-to-r from-pink-100/80 via-rose-50 to-pink-100/80 border-b border-pink-100 p-6 md:p-10">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {/* Date Badge & Stats Row */}
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                            {/* Date Badge */}
                            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-pink-200 shadow-sm w-fit">
                                <Calendar size={16} className="text-pink-500" />
                                <span className="text-sm font-medium text-slate-700">{vietnameseDate}</span>
                            </div>

                            {/* Stats Cards */}
                            <div className="flex items-center gap-4 md:gap-6">
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <Flame size={18} className="text-orange-500" />
                                        <span className="text-2xl font-bold text-slate-800">{userStats.streak}</span>
                                    </div>
                                    <p className="text-xs text-slate-500">Ngày streak</p>
                                </div>
                                <div className="w-px h-8 bg-pink-200" />
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <MessageSquare size={18} className="text-blue-500" />
                                        <span className="text-2xl font-bold text-slate-800">{userStats.chatCount}</span>
                                    </div>
                                    <p className="text-xs text-slate-500">Cuộc chat</p>
                                </div>
                                <div className="w-px h-8 bg-pink-200" />
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <Star size={18} className="text-yellow-500" />
                                        <span className="text-2xl font-bold text-slate-800">{userStats.xp}</span>
                                    </div>
                                    <p className="text-xs text-slate-500">XP (Lv.{userStats.level})</p>
                                </div>
                            </div>
                        </div>

                        {/* Greeting */}
                        <h1 className="text-3xl md:text-5xl font-bold text-pink-600 mb-2">
                            {greeting.text} <span className="text-slate-800">{displayName}!</span> 👋
                        </h1>
                        <p className="text-slate-600 text-lg mb-1">
                            {greeting.wish} {greeting.emoji}
                        </p>
                        <p className="text-slate-500">
                            Hôm nay bạn cảm thấy thế nào? Hãy chọn tâm trạng của bạn bên dưới.
                        </p>

                        {/* Mood Tracker */}
                        <div className="mt-6 flex items-center gap-3 flex-wrap">
                            {moodMapping.map((mood, idx) => (
                                <motion.button
                                    key={idx}
                                    onClick={() => handleMoodSelect(mood)}
                                    className={`text-3xl p-2 rounded-full transition-all cursor-pointer ${selectedMood === mood.key
                                        ? 'bg-white shadow-lg scale-110 ring-2 ring-pink-300'
                                        : 'hover:bg-white/50 hover:scale-110'
                                        }`}
                                    whileTap={{ scale: 0.95 }}
                                    title={mood.label}
                                >
                                    {mood.emoji}
                                </motion.button>
                            ))}
                            {selectedMood && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-sm text-pink-600 font-medium ml-2"
                                >
                                    Bạn đang cảm thấy {moodMapping.find(m => m.key === selectedMood)?.label.toLowerCase()}
                                </motion.span>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* --- QUICK ACTIONS GRID --- */}
            <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
                <div className="flex items-center gap-3 mb-6">
                    <Zap size={20} className="text-pink-600" />
                    <h2 className="text-xl font-bold text-slate-900">Khám Phá</h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {quickActions.map((act, index) => (
                        <motion.div
                            key={act.path}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link to={act.path} onClick={() => playSound('click')}>
                                <div className={`${act.bgColor} border border-slate-100 rounded-2xl p-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 group`}>
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${act.color} flex items-center justify-center text-white shadow-md mb-3`}>
                                        <act.icon size={24} />
                                    </div>
                                    <h3 className="font-bold text-slate-900 group-hover:text-slate-700 text-sm">
                                        {act.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1">
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
                    <div className="flex items-center gap-3 mb-4">
                        <TrendingUp size={20} className="text-emerald-600" />
                        <h2 className="text-xl font-bold text-slate-900">Tiến độ tuần này</h2>
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
