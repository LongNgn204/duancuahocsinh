// src/pages/Dashboard.jsx
// Chú thích: Trang chủ dashboard - Clean Minimal Design v3.0
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    MessageCircle, Heart, Star, Gamepad2, BookOpen,
    Clock, Brain, Zap
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSound } from '../contexts/SoundContext';

// Quick access cards data
const quickActions = [
    {
        icon: MessageCircle,
        title: 'Chat với AI',
        description: 'Tâm sự & Lời khuyên',
        path: '/chat',
    },
    {
        icon: Heart,
        title: 'Góc An Yên',
        description: 'Thở & Bình tâm',
        path: '/breathing',
    },
    {
        icon: Star,
        title: 'Lọ Biết Ơn',
        description: 'Lưu giữ niềm vui',
        path: '/gratitude',
    },
    {
        icon: BookOpen,
        title: 'Kể Chuyện',
        description: 'Bài học cuộc sống',
        path: '/stories',
    },
    {
        icon: Gamepad2,
        title: 'Giải Trí',
        description: 'Mini Games vui',
        path: '/games',
    },
    {
        icon: Clock,
        title: 'Góc Nhỏ',
        description: 'Lịch trình & Nhắc nhở',
        path: '/corner',
    },
    {
        icon: Brain,
        title: 'Góc Kiến Thức',
        description: 'Hiểu để thương mình',
        path: '/knowledge-hub',
    },
];

// Greeting based on time
function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng,';
    if (hour < 18) return 'Chào buổi chiều,';
    if (hour < 22) return 'Chào buổi tối,';
    return 'Đêm đã muộn,';
}

export default function Dashboard() {
    const { user } = useAuth();
    const { playSound } = useSound();
    const greeting = getGreeting();

    // Get display name - prioritize display_name (tên riêng) over username
    const displayName = user?.display_name || user?.username || 'Bạn';

    useEffect(() => {
        const timer = setTimeout(() => {
            playSound('notification');
        }, 500);
        return () => clearTimeout(timer);
    }, [playSound]);

    return (
        <div className="min-h-screen bg-white pb-10">
            {/* --- HERO SECTION --- */}
            <div className="bg-white border-b border-slate-100 p-8 md:p-12">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-3">
                            {greeting} <span className="text-slate-700">{displayName}!</span> 👋
                        </h1>
                        <p className="text-slate-500 text-lg">
                            Hôm nay là một ngày tuyệt vời để bắt đầu những điều nhỏ bé.
                        </p>
                    </motion.div>

                    {/* Mood Tracker - Simple */}
                    <div className="mt-8 flex items-center gap-2">
                        <span className="text-sm text-slate-500 mr-2">Tâm trạng:</span>
                        <div className="flex gap-3">
                            {['😄', '🙂', '😐', '😞', '😡'].map((emoji, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => playSound('pop')}
                                    className="text-2xl hover:scale-125 transition-transform cursor-pointer"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- QUICK ACTIONS GRID --- */}
            <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
                <div className="flex items-center gap-3 mb-6">
                    <Zap size={20} className="text-slate-700" />
                    <h2 className="text-xl font-bold text-slate-900">Khám Phá</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quickActions.map((act, index) => (
                        <motion.div
                            key={act.path}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link to={act.path} onClick={() => playSound('click')}>
                                <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 hover:shadow-md transition-all duration-200 group">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-slate-200 transition-colors">
                                            <act.icon size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-900 group-hover:text-slate-700">
                                                {act.title}
                                            </h3>
                                            <p className="text-sm text-slate-500 mt-1">
                                                {act.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* --- DAILY TIP --- */}
            <div className="max-w-4xl mx-auto px-4 md:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                        <div className="flex items-start gap-4">
                            <div className="text-2xl">💡</div>
                            <div>
                                <h3 className="font-bold text-slate-900 mb-2">Mẹo nhỏ hôm nay</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    "Biết ơn không làm biến mất khó khăn, nhưng nó giúp bạn có thêm sức mạnh để vượt qua chúng. Hãy thử tìm 1 điều tích cực ngay bây giờ nhé!"
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
