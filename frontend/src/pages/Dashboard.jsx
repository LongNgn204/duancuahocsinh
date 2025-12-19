// src/pages/Dashboard.jsx
// Chú thích: Trang chủ dashboard cho user đã đăng nhập
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    MessageCircle, Heart, Star, Gamepad2, BookOpen,
    Clock, Settings, TrendingUp, Award, Sparkles
} from 'lucide-react';
import Card from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';

// Quick access cards data
const quickActions = [
    {
        icon: MessageCircle,
        title: 'Chat với AI',
        description: 'Chia sẻ tâm sự của bạn',
        path: '/chat',
        color: 'from-teal-500 to-cyan-500',
    },
    {
        icon: Heart,
        title: 'Góc An Yên',
        description: 'Bài tập thở & thẻ wellness',
        path: '/breathing',
        color: 'from-pink-500 to-rose-500',
    },
    {
        icon: Star,
        title: 'Lọ Biết Ơn',
        description: 'Ghi điều biết ơn hôm nay',
        path: '/gratitude',
        color: 'from-amber-500 to-orange-500',
    },
    {
        icon: Gamepad2,
        title: 'Mini Games',
        description: 'Thư giãn với game vui',
        path: '/games',
        color: 'from-green-500 to-emerald-500',
    },
    {
        icon: BookOpen,
        title: 'Kể Chuyện',
        description: 'Nghe câu chuyện hay',
        path: '/stories',
        color: 'from-indigo-500 to-purple-500',
    },
    {
        icon: Clock,
        title: 'Góc Nhỏ',
        description: 'Nhắc nhở & lịch trình',
        path: '/corner',
        color: 'from-blue-500 to-cyan-500',
    },
];

// Greeting based on time of day
function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
}

export default function Dashboard() {
    const { user } = useAuth();
    const greeting = getGreeting();

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
            >
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    <span className="gradient-text">{greeting}</span>
                    {user?.username && (
                        <span className="text-[--text]">, {user.username}! 👋</span>
                    )}
                </h1>
                <p className="text-lg text-[--muted]">
                    Hôm nay bạn cảm thấy thế nào?
                </p>
            </motion.div>

            {/* Mood Selector */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex justify-center gap-4"
            >
                {['😊', '😌', '😐', '😢', '😤'].map((emoji, idx) => (
                    <motion.button
                        key={emoji}
                        className="text-4xl hover:scale-125 transition-transform p-2"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + idx * 0.05 }}
                    >
                        {emoji}
                    </motion.button>
                ))}
            </motion.div>

            {/* Quick Actions Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h2 className="text-xl font-semibold text-[--text] mb-4 flex items-center gap-2">
                    <Sparkles size={20} className="text-[--brand]" />
                    Khám phá ngay
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {quickActions.map((action, idx) => (
                        <motion.div
                            key={action.path}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + idx * 0.05 }}
                        >
                            <Link to={action.path}>
                                <Card className="p-4 h-full hover:shadow-lg transition-all group cursor-pointer">
                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                                        <action.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-[--text] mb-1">{action.title}</h3>
                                    <p className="text-sm text-[--muted]">{action.description}</p>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Daily Tip Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Card variant="gradient" className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white mb-1">💡 Mẹo hôm nay</h3>
                            <p className="text-white/90 text-sm">
                                Hãy dành 5 phút mỗi ngày để viết ra 3 điều bạn biết ơn. Thói quen nhỏ này có thể thay đổi cả cách bạn nhìn cuộc sống!
                            </p>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
