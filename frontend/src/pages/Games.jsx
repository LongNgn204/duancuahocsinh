// src/pages/Games.jsx
// Chú thích: Games Hub v2.0 - Responsive, organized mini games với difficulty levels
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card from '../components/ui/Card';
import GlowOrbs from '../components/ui/GlowOrbs';
import Badge from '../components/ui/Badge';
import { Gamepad2, Sparkles, ArrowLeft } from 'lucide-react';

const games = [
    {
        id: 'reflex',
        name: 'Game Phản Xạ',
        description: 'Luyện phản xạ nhanh với Space bar, có 3 độ khó',
        icon: '⚡',
        color: 'from-yellow-500 to-orange-500',
        path: '/games/reflex',
        badge: 'Nâng cấp',
        hasDifficulty: true,
    },
    {
        id: 'bee-flying',
        name: 'Ong Tập Bay',
        description: 'Theo dõi ong bay, nhấn khi ong dừng lại trong 3 giây',
        icon: '🐝',
        color: 'from-amber-500 to-yellow-500',
        path: '/games/bee-flying',
        badge: 'Phản xạ',
        hasDifficulty: true,
    },
    {
        id: 'match-shape',
        name: 'Chọn Hình',
        description: 'Chọn hình giống với hình hiển thị trong thời gian giới hạn',
        icon: '🎯',
        color: 'from-purple-500 to-pink-500',
        path: '/games/match-shape',
        badge: 'Trí nhớ',
        hasDifficulty: true,
    },
    {
        id: 'bubble',
        name: 'Bấm Bong Bóng',
        description: 'Bấm bong bóng nổi lên để thư giãn và ghi điểm',
        icon: '🫧',
        color: 'from-pink-500 to-purple-500',
        path: '/games/bubble',
        badge: 'Thư giãn',
    },
    {
        id: 'memory',
        name: 'Ghép Màu',
        description: 'Tìm các cặp màu giống nhau, luyện trí nhớ',
        icon: '🧠',
        color: 'from-violet-500 to-indigo-500',
        path: '/games/memory',
        badge: 'Trí nhớ',
    },
    {
        id: 'space-pilot',
        name: 'Space Pilot',
        description: 'Điều khiển tàu vũ trụ tránh thiên thạch',
        icon: '🚀',
        color: 'from-indigo-500 to-purple-500',
        path: '/games/space-pilot',
        badge: 'Arcade',
        hasDifficulty: true,
    },
    {
        id: 'doodle',
        name: 'Vẽ Tự Do',
        description: 'Vẽ tự do, thể hiện cảm xúc qua màu sắc',
        icon: '🎨',
        color: 'from-teal-500 to-cyan-500',
        path: '/games/doodle',
        badge: 'Sáng tạo',
    },
    {
        id: 'bee',
        name: 'Ong Bay Cổ Điển',
        description: 'Điều khiển chú ong bay qua chướng ngại vật',
        icon: '🐝',
        color: 'from-green-500 to-emerald-500',
        path: '/games/bee',
        badge: 'Cổ điển',
    },
];

export default function Games() {
    return (
        <div className="min-h-[70vh] relative">
            <GlowOrbs className="opacity-30" />

            <div className="relative z-10 max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                        <Gamepad2 className="w-8 h-8 text-[--brand]" />
                        <span className="gradient-text">Mini Games</span>
                    </h1>
                    <p className="text-[--muted] text-sm mt-1">
                        Thư giãn và giải trí với các trò chơi nhẹ nhàng
                    </p>
                </motion.div>

                {/* Games Grid */}
                <div className="grid sm:grid-cols-2 gap-4">
                    {games.map((game, idx) => (
                        <motion.div
                            key={game.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            {game.disabled ? (
                                <Card
                                    className="opacity-60 cursor-not-allowed"
                                >
                                    <GameCardContent game={game} />
                                </Card>
                            ) : (
                                <Link to={game.path}>
                                    <Card
                                        variant="interactive"
                                        className="group"
                                    >
                                        <GameCardContent game={game} />
                                    </Card>
                                </Link>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Tips */}
                <Card size="sm">
                    <div className="flex items-start gap-3">
                        <Sparkles size={18} className="text-[--accent] shrink-0 mt-0.5" />
                        <div className="text-sm text-[--text-secondary]">
                            <strong className="text-[--text]">Mẹo:</strong> Chơi game thư giãn trong 5-10 phút
                            giữa các giờ học giúp não bộ nghỉ ngơi và tập trung tốt hơn!
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

function GameCardContent({ game }) {
    return (
        <div className="flex items-start gap-4">
            <div className={`
        w-16 h-16 rounded-xl bg-gradient-to-br ${game.color}
        flex items-center justify-center text-3xl
        shadow-lg group-hover:scale-105 transition-transform
      `}>
                {game.icon}
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[--text] group-hover:text-[--brand] transition-colors">
                        {game.name}
                    </h3>
                    {game.badge && (
                        <Badge
                            variant={game.disabled ? 'default' : game.badge === 'Mới' ? 'accent' : 'primary'}
                            size="sm"
                        >
                            {game.badge}
                        </Badge>
                    )}
                </div>
                <p className="text-sm text-[--muted]">{game.description}</p>
            </div>
        </div>
    );
}
