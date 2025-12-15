// src/pages/Wellness.jsx
// Chú thích: Liều thuốc tinh thần - Tích hợp bài tập thở + câu động viên
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import GlowOrbs from '../components/ui/GlowOrbs';
import { Heart, Sparkles, Brain, Flame, Wind, RefreshCw } from 'lucide-react';

// Nhóm cảm xúc với câu động viên
const EMOTION_GROUPS = [
    {
        id: 'motivation',
        name: '💪 Động lực học tập',
        icon: Flame,
        color: 'from-orange-500 to-red-500',
        quotes: [
            'Mỗi bước nhỏ đều đưa bạn đến gần hơn với mục tiêu!',
            'Học tập không phải là cuộc đua, hãy đi theo nhịp của riêng bạn.',
            'Thất bại không phải kết thúc, mà là bài học quý giá.',
            'Bạn đã vượt qua được nhiều khó khăn, lần này cũng vậy!',
            'Nghỉ ngơi không phải là lười biếng, đó là tái tạo năng lượng.',
        ],
    },
    {
        id: 'selflove',
        name: '💝 Yêu bản thân',
        icon: Heart,
        color: 'from-pink-500 to-rose-500',
        quotes: [
            'Bạn xứng đáng được yêu thương, bắt đầu từ chính mình.',
            'Không cần hoàn hảo để được yêu thương.',
            'Hãy tha thứ cho bản thân như cách bạn tha thứ cho người khác.',
            'Bạn độc đáo và đó là sức mạnh của bạn!',
            'Chăm sóc bản thân không phải ích kỷ, đó là cần thiết.',
        ],
    },
    {
        id: 'calm',
        name: '🧘 Bình yên',
        icon: Wind,
        color: 'from-blue-500 to-cyan-500',
        quotes: [
            'Hít thở sâu, mọi thứ rồi sẽ ổn.',
            'Đừng lo lắng về ngày mai, hãy sống trọn vẹn hôm nay.',
            'Bạn không cần kiểm soát mọi thứ.',
            'Cho phép bản thân nghỉ ngơi, bạn không phải robot.',
            'Cảm xúc sẽ đến và đi, bạn vẫn ở đây.',
        ],
    },
    {
        id: 'confidence',
        name: '⭐ Tự tin',
        icon: Sparkles,
        color: 'from-yellow-500 to-amber-500',
        quotes: [
            'Bạn có thể làm được nhiều hơn bạn nghĩ!',
            'Đừng so sánh mình với người khác, hãy so với chính mình ngày hôm qua.',
            'Mỗi người có con đường riêng, hãy tin vào hành trình của bạn.',
            'Sai lầm là cách bạn học, không phải thất bại.',
            'Bạn đã rất dũng cảm khi cố gắng mỗi ngày!',
        ],
    },
];

export default function Wellness() {
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [currentQuote, setCurrentQuote] = useState('');
    const [showBreathing, setShowBreathing] = useState(false);
    const [breathPhase, setBreathPhase] = useState('idle'); // idle, inhale, hold, exhale

    // Lấy câu động viên ngẫu nhiên
    const getRandomQuote = (group) => {
        const quotes = group.quotes;
        const randomIndex = Math.floor(Math.random() * quotes.length);
        setCurrentQuote(quotes[randomIndex]);
        setSelectedGroup(group);
    };

    // Bài tập thở 30s
    const startBreathing = async () => {
        setShowBreathing(true);
        // Hít vào 4s
        setBreathPhase('inhale');
        await new Promise(r => setTimeout(r, 4000));
        // Giữ 4s
        setBreathPhase('hold');
        await new Promise(r => setTimeout(r, 4000));
        // Thở ra 6s
        setBreathPhase('exhale');
        await new Promise(r => setTimeout(r, 6000));
        // Lặp lại 2 lần nữa (tổng ~30s)
        setBreathPhase('inhale');
        await new Promise(r => setTimeout(r, 4000));
        setBreathPhase('hold');
        await new Promise(r => setTimeout(r, 4000));
        setBreathPhase('exhale');
        await new Promise(r => setTimeout(r, 6000));

        setBreathPhase('idle');
        setShowBreathing(false);
    };

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
                        <Sparkles className="w-8 h-8 text-[--brand]" />
                        <span className="gradient-text">Liều thuốc tinh thần</span>
                    </h1>
                    <p className="text-[--muted] text-sm mt-1">
                        Tìm bình yên và động lực cho ngày mới
                    </p>
                </motion.div>

                {/* Bài tập thở */}
                <Card variant="glass">
                    <div className="text-center py-4">
                        <h2 className="font-semibold text-lg mb-2 flex items-center justify-center gap-2">
                            <Wind className="w-5 h-5 text-blue-500" />
                            Tìm bình yên - Thở theo bong bóng
                        </h2>
                        {!showBreathing ? (
                            <Button onClick={startBreathing} variant="primary" size="lg">
                                Bắt đầu thở (30 giây)
                            </Button>
                        ) : (
                            <div className="py-8">
                                <motion.div
                                    className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center text-white font-bold text-xl
                    ${breathPhase === 'inhale' ? 'bg-blue-500' :
                                            breathPhase === 'hold' ? 'bg-purple-500' :
                                                breathPhase === 'exhale' ? 'bg-green-500' : 'bg-gray-400'}`}
                                    animate={{
                                        scale: breathPhase === 'inhale' ? 1.5 :
                                            breathPhase === 'hold' ? 1.5 :
                                                breathPhase === 'exhale' ? 1 : 1
                                    }}
                                    transition={{ duration: breathPhase === 'inhale' ? 4 : breathPhase === 'exhale' ? 6 : 0.3 }}
                                >
                                    {breathPhase === 'inhale' && 'Hít vào'}
                                    {breathPhase === 'hold' && 'Giữ'}
                                    {breathPhase === 'exhale' && 'Thở ra'}
                                </motion.div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Nhóm cảm xúc */}
                <div>
                    <h2 className="font-semibold text-lg mb-3">Chọn liều thuốc của bạn</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {EMOTION_GROUPS.map((group) => (
                            <motion.button
                                key={group.id}
                                onClick={() => getRandomQuote(group)}
                                className={`p-4 rounded-2xl bg-gradient-to-br ${group.color} text-white text-left
                  hover:scale-105 active:scale-95 transition-transform shadow-lg`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <group.icon className="w-8 h-8 mb-2" />
                                <span className="font-semibold">{group.name}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Câu động viên hiện tại */}
                <AnimatePresence mode="wait">
                    {currentQuote && (
                        <motion.div
                            key={currentQuote}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <Card className="text-center py-8">
                                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${selectedGroup?.color} flex items-center justify-center`}>
                                    {selectedGroup && <selectedGroup.icon className="w-8 h-8 text-white" />}
                                </div>
                                <p className="text-xl font-medium text-[--text] mb-4 px-4">
                                    "{currentQuote}"
                                </p>
                                <Button
                                    variant="ghost"
                                    onClick={() => getRandomQuote(selectedGroup)}
                                    icon={<RefreshCw size={16} />}
                                >
                                    Câu khác
                                </Button>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
