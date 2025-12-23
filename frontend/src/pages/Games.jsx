// src/pages/Games.jsx
// Chú thích: Games Hub v2.0 - Arcade Style Visuals
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card from '../components/ui/Card';
import GlowOrbs from '../components/ui/GlowOrbs';
import Badge from '../components/ui/Badge';
import { Gamepad2, Sparkles, Trophy, Zap, MousePointer2, Brain, Coffee, Rocket, Palette } from 'lucide-react';
import { useSound } from '../contexts/SoundContext';

const games = [
    {
        id: 'bee-flying',
        name: 'Ong Tập Bay',
        description: 'Luyện sự tập trung cao độ, đừng để ong lạc!',
        icon: MousePointer2,
        color: 'from-amber-400 to-yellow-500',
        path: '/games/bee-flying',
        badge: 'Phản xạ',
        difficulty: 'Trung bình',
    },
    {
        id: 'match-shape',
        name: 'Chọn Hình',
        description: 'Nhanh mắt chọn hình đúng trước khi hết giờ.',
        icon: Trophy,
        color: 'from-purple-400 to-pink-500',
        path: '/games/match-shape',
        badge: 'Trí nhớ',
        difficulty: 'Dễ',
    },
    {
        id: 'bubble',
        name: 'Bấm Bong Bóng',
        description: 'Pop pop! Thư giãn tuyệt đối với tiếng nổ vui tai.',
        icon: Coffee,
        color: 'from-pink-400 to-rose-500',
        path: '/games/bubble',
        badge: 'Thư giãn',
        difficulty: 'Dễ',
    },
    {
        id: 'memory',
        name: 'Ghép Màu',
        description: 'Lật thẻ tìm cặp, bài tập tốt cho trí nhớ.',
        icon: Brain,
        color: 'from-violet-400 to-indigo-500',
        path: '/games/memory',
        badge: 'Trí nhớ',
        difficulty: 'Trung bình',
    },
    {
        id: 'space-pilot',
        name: 'Space Pilot',
        description: 'Lái tàu tránh thiên thạch trong không gian!',
        icon: Rocket,
        color: 'from-indigo-400 to-purple-600',
        path: '/games/space-pilot',
        badge: 'Arcade',
        difficulty: 'Khó',
    },
    {
        id: 'doodle',
        name: 'Vẽ Tự Do',
        description: 'Thoả sức sáng tạo, vẽ mọi thứ bạn thích.',
        icon: Palette,
        color: 'from-teal-400 to-cyan-500',
        path: '/games/doodle',
        badge: 'Sáng tạo',
        difficulty: 'Dễ',
    },

];

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

export default function Games() {
    const { playSound } = useSound();
    return (
        <div className="min-h-screen relative pb-10">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto space-y-10 px-4">
                {/* Header */}
                <div className="text-center space-y-4 pt-4">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-block p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl mb-2"
                    >
                        <Gamepad2 size={48} className="text-indigo-600 drop-shadow-lg" />
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight">
                        Khu Vui Chơi
                    </h1>
                    <p className="text-lg text-slate-500 max-w-xl mx-auto">
                        Giải trí, luyện não và thư giãn sau giờ học căng thẳng.
                    </p>
                </div>

                {/* Grid */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                    {games.map((game) => (
                        <motion.div key={game.id} variants={item}>
                            <Link to={game.path} className="block h-full group" onClick={() => playSound('notification')}>
                                <div className="h-full bg-white rounded-3xl p-5 border border-slate-100 shadow-lg hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden" onMouseEnter={() => playSound('hover')}>
                                    {/* Hover Gradient */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                                    <div className="relative z-10 flex flex-col h-full">
                                        {/* Icon */}
                                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center text-white shadow-md mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                            <game.icon size={32} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="tex-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                                    {game.name}
                                                </h3>
                                            </div>
                                            <p className="text-sm text-slate-500 leading-relaxed mb-4">
                                                {game.description}
                                            </p>
                                        </div>

                                        {/* Footer Info */}
                                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
                                            <span className="text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                                                {game.difficulty}
                                            </span>
                                            {game.badge && (
                                                <span className={`px-2 py-1 rounded-md ${game.badge === 'Mới' ? 'bg-red-100 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                                    {game.badge}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Tip Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/30"
                >
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                            <Sparkles size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Chơi vui nhưng đừng quên giờ giấc nhé!</h3>
                            <p className="text-indigo-100 text-lg">
                                Nên chơi khoảng 15 phút để thư giãn mắt và tinh thần.
                            </p>
                        </div>
                    </div>

                    {/* Decor */}
                    <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-pink-500/20 rounded-full blur-2xl" />
                </motion.div>
            </div>
        </div>
    );
}
