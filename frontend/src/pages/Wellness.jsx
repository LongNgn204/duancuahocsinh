// src/pages/Wellness.jsx
// Chú thích: Liều thuốc tinh thần - Bong bóng thở 30s + Nhóm cảm xúc động viên
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import GlowOrbs from '../components/ui/GlowOrbs';
import { Heart, Sparkles, Flame, Wind, RefreshCw, Star, Shield, Users } from 'lucide-react';

// ===== NHÓM CẢM XÚC VỚI CÂU ĐỘNG VIÊN =====
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
            'Không ai hoàn hảo ngay từ đầu, điều quan trọng là bạn đang cố gắng.',
            'Hôm nay khó khăn, nhưng ngày mai sẽ dễ dàng hơn.',
            'Mỗi giờ học là một viên gạch xây nên tương lai.',
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
            'Bạn đáng được nghỉ ngơi, không cần giải thích lý do.',
            'Yêu bản thân là món quà tốt nhất bạn có thể trao cho mình.',
            'Bạn đủ tốt như hiện tại.',
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
            'Một phút bình yên có thể thay đổi cả ngày.',
            'Bão tố rồi sẽ qua, mặt trời sẽ lại lên.',
            'Chậm lại một chút, cuộc sống không chạy đua.',
        ],
    },
    {
        id: 'confidence',
        name: '⭐ Tự tin',
        icon: Star,
        color: 'from-yellow-500 to-amber-500',
        quotes: [
            'Bạn có thể làm được nhiều hơn bạn nghĩ!',
            'Đừng so sánh mình với người khác, hãy so với chính mình ngày hôm qua.',
            'Mỗi người có con đường riêng, hãy tin vào hành trình của bạn.',
            'Sai lầm là cách bạn học, không phải thất bại.',
            'Bạn đã rất dũng cảm khi cố gắng mỗi ngày!',
            'Tin vào bản thân, bạn có năng lực riêng.',
            'Bạn xứng đáng có mặt ở đây, đừng nghi ngờ điều đó.',
        ],
    },
    {
        id: 'stress',
        name: '😤 Giảm áp lực',
        icon: Shield,
        color: 'from-purple-500 to-indigo-500',
        quotes: [
            'Áp lực là tạm thời, sức mạnh của bạn là vĩnh viễn.',
            'Không phải lúc nào cũng phải hoàn hảo.',
            'Hãy chia nhỏ vấn đề, từng bước một.',
            'Điểm số không phải tất cả, sức khỏe tinh thần quan trọng hơn.',
            'Bạn được phép nói "tôi cần giúp đỡ".',
            'Căng thẳng không có nghĩa là bạn yếu đuối.',
            'Bạn không cô đơn trong chuyện này.',
        ],
    },
    {
        id: 'friendship',
        name: '👫 Tình bạn',
        icon: Users,
        color: 'from-teal-500 to-green-500',
        quotes: [
            'Bạn bè tốt không cần nhiều, chỉ cần thật lòng.',
            'Hãy là người bạn mà bạn muốn có.',
            'Một tin nhắn nhỏ có thể làm ai đó vui cả ngày.',
            'Không ai hoàn hảo, kể cả bạn của bạn.',
            'Bạn có thể là ánh sáng trong ngày tối của ai đó.',
            'Tình bạn cần được chăm sóc như cây cần tưới nước.',
        ],
    },
];

export default function Wellness() {
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [currentQuote, setCurrentQuote] = useState('');

    // ===== BONG BÓNG THỞ 30S =====
    const [isBreathing, setIsBreathing] = useState(false);
    const [breathPhase, setBreathPhase] = useState('idle'); // idle | inhale | hold | exhale
    const [timeLeft, setTimeLeft] = useState(30);
    const timerRef = useRef(null);

    // Lấy câu động viên ngẫu nhiên
    const getRandomQuote = (group) => {
        const quotes = group.quotes;
        const randomIndex = Math.floor(Math.random() * quotes.length);
        setCurrentQuote(quotes[randomIndex]);
        setSelectedGroup(group);
    };

    // Bắt đầu bài tập thở 30s
    const startBreathing = () => {
        setIsBreathing(true);
        setTimeLeft(30);
        runBreathingCycle();
    };

    // Dừng bài tập thở
    const stopBreathing = () => {
        setIsBreathing(false);
        setBreathPhase('idle');
        setTimeLeft(30);
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
    };

    // Chạy chu kỳ thở: Hít 4s -> Giữ 4s -> Thở ra 6s (tổng 14s, lặp ~2 lần = ~28s)
    const runBreathingCycle = async () => {
        // Chu kỳ 1
        setBreathPhase('inhale');
        await sleep(4000);
        if (!isBreathing) return;

        setBreathPhase('hold');
        await sleep(4000);
        if (!isBreathing) return;

        setBreathPhase('exhale');
        await sleep(6000);
        if (!isBreathing) return;

        // Chu kỳ 2
        setBreathPhase('inhale');
        await sleep(4000);
        if (!isBreathing) return;

        setBreathPhase('hold');
        await sleep(4000);
        if (!isBreathing) return;

        setBreathPhase('exhale');
        await sleep(6000);

        // Hoàn thành
        setIsBreathing(false);
        setBreathPhase('idle');
    };

    const sleep = (ms) => new Promise(resolve => {
        timerRef.current = setTimeout(resolve, ms);
    });

    // Đếm ngược thời gian
    useEffect(() => {
        if (isBreathing && timeLeft > 0) {
            const interval = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isBreathing]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

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
                        Nạp năng lượng tích cực cho ngày mới 💫
                    </p>
                </motion.div>

                {/* ===== TÌM BÌNH YÊN - BONG BÓNG THỞ 30S ===== */}
                <Card variant="glass">
                    <div className="text-center py-6">
                        <h2 className="font-semibold text-lg mb-4 flex items-center justify-center gap-2">
                            <Wind className="w-5 h-5 text-blue-500" />
                            Tìm bình yên - Thở theo bong bóng
                        </h2>

                        {!isBreathing ? (
                            <div className="space-y-4">
                                <p className="text-[--muted] text-sm">
                                    Hít thở sâu theo nhịp bong bóng trong 30 giây để thư giãn
                                </p>
                                <Button onClick={startBreathing} variant="primary" size="lg">
                                    🫧 Bắt đầu thở (30 giây)
                                </Button>
                            </div>
                        ) : (
                            <div className="py-8 space-y-6">
                                {/* Bong bóng xanh */}
                                <motion.div
                                    className={`w-40 h-40 mx-auto rounded-full flex items-center justify-center text-white font-bold text-xl shadow-2xl
                                        ${breathPhase === 'inhale' ? 'bg-gradient-to-br from-blue-400 to-cyan-500' :
                                            breathPhase === 'hold' ? 'bg-gradient-to-br from-purple-400 to-indigo-500' :
                                                breathPhase === 'exhale' ? 'bg-gradient-to-br from-green-400 to-teal-500' :
                                                    'bg-gray-400'}`}
                                    animate={{
                                        scale: breathPhase === 'inhale' ? 1.5 :
                                            breathPhase === 'hold' ? 1.5 :
                                                breathPhase === 'exhale' ? 1 : 1
                                    }}
                                    transition={{
                                        duration: breathPhase === 'inhale' ? 4 :
                                            breathPhase === 'exhale' ? 6 : 0.3,
                                        ease: 'easeInOut'
                                    }}
                                >
                                    <div className="text-center">
                                        <div className="text-2xl mb-1">
                                            {breathPhase === 'inhale' && '😮‍💨 Hít vào'}
                                            {breathPhase === 'hold' && '😌 Giữ'}
                                            {breathPhase === 'exhale' && '😮 Thở ra'}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Thời gian còn lại */}
                                <div className="text-[--muted]">
                                    Còn <span className="font-bold text-[--brand]">{timeLeft}s</span>
                                </div>

                                {/* Nút dừng */}
                                <Button onClick={stopBreathing} variant="ghost" size="sm">
                                    Dừng lại
                                </Button>
                            </div>
                        )}
                    </div>
                </Card>

                {/* ===== NHÓM CẢM XÚC ===== */}
                <div>
                    <h2 className="font-semibold text-lg mb-3">Bạn đang cần gì?</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {EMOTION_GROUPS.map((group) => (
                            <motion.button
                                key={group.id}
                                onClick={() => getRandomQuote(group)}
                                className={`p-4 rounded-2xl bg-gradient-to-br ${group.color} text-white text-left
                                    hover:scale-105 active:scale-95 transition-transform shadow-lg`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <group.icon className="w-6 h-6 mb-2" />
                                <span className="font-semibold text-sm">{group.name}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* ===== CÂU ĐỘNG VIÊN ===== */}
                <AnimatePresence mode="wait">
                    {currentQuote && (
                        <motion.div
                            key={currentQuote}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <Card className="text-center py-8">
                                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${selectedGroup?.color} flex items-center justify-center shadow-lg`}>
                                    {selectedGroup && <selectedGroup.icon className="w-8 h-8 text-white" />}
                                </div>
                                <p className="text-xl font-medium text-[--text] mb-4 px-4 leading-relaxed">
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
