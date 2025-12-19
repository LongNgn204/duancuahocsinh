// src/pages/Dashboard.jsx
// Chú thích: Trang chủ dashboard với Premium Visual Upgrade (Glassmorphism + 3D)
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    MessageCircle, Heart, Star, Gamepad2, BookOpen,
    Clock, Settings, TrendingUp, Award, Sparkles, Zap, Feather
} from 'lucide-react';
import Card from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import { useSound } from '../contexts/SoundContext';

// Quick access cards data with enhanced visuals
const quickActions = [
    {
        icon: MessageCircle,
        title: 'Chat với AI',
        description: 'Tâm sự & Lời khuyên',
        path: '/chat',
        gradient: 'from-violet-500 to-fuchsia-500',
        bg: 'bg-violet-50 text-violet-600',
        delay: 0
    },
    {
        icon: Heart,
        title: 'Góc An Yên',
        description: 'Thở & Bình tâm',
        path: '/breathing',
        gradient: 'from-emerald-400 to-teal-500',
        bg: 'bg-emerald-50 text-emerald-600',
        delay: 0.1
    },
    {
        icon: Star,
        title: 'Lọ Biết Ơn',
        description: 'Lưu giữ niềm vui',
        path: '/gratitude',
        gradient: 'from-amber-400 to-orange-500',
        bg: 'bg-amber-50 text-amber-600',
        delay: 0.2
    },
    {
        icon: BookOpen,
        title: 'Kể Chuyện',
        description: 'Bài học cuộc sống',
        path: '/stories',
        gradient: 'from-blue-400 to-indigo-500',
        bg: 'bg-blue-50 text-blue-600',
        delay: 0.3
    },
    {
        icon: Gamepad2,
        title: 'Giải Trí',
        description: 'Mini Games vui',
        path: '/games',
        gradient: 'from-rose-400 to-pink-500',
        bg: 'bg-rose-50 text-rose-600',
        delay: 0.4
    },
    {
        icon: Clock,
        title: 'Góc Nhỏ',
        description: 'Lịch trình & Nhắc nhở',
        path: '/corner',
        gradient: 'from-cyan-400 to-sky-500',
        bg: 'bg-cyan-50 text-cyan-600',
        delay: 0.5
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

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function Dashboard() {
    const { user } = useAuth();
    const { playSound } = useSound();
    const greeting = getGreeting();

    // Parallax
    const { scrollY } = useScroll();
    const yHero = useTransform(scrollY, [0, 300], [0, 100]);
    const opacityHero = useTransform(scrollY, [0, 300], [1, 0.5]);

    useEffect(() => {
        // Startup Chime
        const timer = setTimeout(() => {
            playSound('notification');
        }, 500);
        return () => clearTimeout(timer);
    }, [playSound]);

    return (
        <div className="space-y-8 pb-10">
            {/* --- HERO SECTION --- */}
            <motion.div
                style={{ y: yHero, opacity: opacityHero }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8 md:p-12 shadow-2xl shadow-indigo-500/20 text-white min-h-[300px] flex items-center"
            >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-12 opacity-10 animate-pulse">
                    <Sparkles size={150} />
                </div>
                <div className="absolute bottom-0 left-0 p-8 opacity-10">
                    <Feather size={120} />
                </div>

                <div className="relative z-10 w-full flex flex-col items-center md:items-start md:flex-row justify-between gap-10 text-center md:text-left">
                    <div>
                        <motion.h1
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-4xl md:text-6xl font-bold mb-4 tracking-tight leading-tight"
                        >
                            {greeting} <br />
                            <span className="opacity-90">{user?.username || 'Bạn thân mến'}! 👋</span>
                        </motion.h1>
                        <p className="text-white/80 text-lg md:text-xl max-w-lg font-medium">
                            Hôm nay là một ngày tuyệt vời để bắt đầu những điều nhỏ bé.
                        </p>
                    </div>

                    {/* MOOD TRACKER (Glass Pill) */}
                    <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl p-6 flex flex-wrap justify-center gap-4 md:gap-6 shadow-lg w-full md:w-auto">
                        {['😄', '🙂', '😐', '😞', '😡'].map((emoji, idx) => (
                            <motion.button
                                key={idx}
                                onMouseEnter={() => playSound('hover')}
                                onClick={() => playSound('pop')}
                                whileHover={{ scale: 1.4, rotate: 15, y: -5 }}
                                whileTap={{ scale: 0.9 }}
                                className="text-4xl md:text-5xl transition-transform filter drop-shadow-lg cursor-pointer select-none"
                                title="Cảm xúc hôm nay"
                            >
                                {emoji}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* --- QUICK ACTIONS GRID --- */}
            <div className='relative z-10 bg-slate-50/80 backdrop-blur-xl rounded-t-3xl pt-2'>
                <div className="flex items-center gap-3 mb-6 px-2">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                        <Zap size={24} fill="currentColor" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Khám Phá</h2>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
                >
                    {quickActions.map((act) => (
                        <motion.div key={act.path} variants={item}>
                            <Link to={act.path} onClick={() => playSound('click')}>
                                <div className="group relative h-full bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-2 overflow-hidden">
                                    {/* Gradient Hover Effect */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${act.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                                    <div className="flex flex-col h-full justify-between gap-6 relative z-10">
                                        <div className={`w-16 h-16 rounded-2xl ${act.bg} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                            <act.icon size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                                                {act.title}
                                            </h3>
                                            <p className="text-sm text-slate-400 font-medium mt-2">
                                                {act.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Decoration Circle */}
                                    <div className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br ${act.gradient} opacity-0 group-hover:opacity-10 transition-all duration-500 blur-2xl`} />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* --- DAILY TIP --- */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-400 to-emerald-500 p-8 text-white shadow-lg shadow-teal-500/20">
                    <div className="flex items-start gap-6 relative z-10">
                        <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                            <TrendingUp size={32} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl mb-2">💡 Mẹo nhỏ hôm nay</h3>
                            <p className="text-white/90 leading-relaxed font-medium text-lg">
                                "Biết ơn không làm biến mất khó khăn, nhưng nó giúp bạn có thêm sức mạnh để vượt qua chúng. Hãy thử tìm 1 điều tích cực ngay bây giờ nhé!"
                            </p>
                        </div>
                    </div>
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                </div>
            </motion.div>
        </div>
    );
}
