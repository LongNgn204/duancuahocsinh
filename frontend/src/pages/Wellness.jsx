// src/pages/Wellness.jsx
// Chú thích: Liều thuốc tinh thần - Tích hợp bài tập thở từ Góc An Yên + Bộ thẻ An Yên + Câu động viên
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import GlowOrbs from '../components/ui/GlowOrbs';
import BreathingBubble from '../components/breathing/BreathingBubble';
import RandomWellnessCard from '../components/breathing/RandomWellnessCard';
import { Heart, Sparkles, Brain, Flame, Wind, RefreshCw, Volume2, VolumeX } from 'lucide-react';

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
    const [activeTab, setActiveTab] = useState('breathing'); // breathing | cards | quotes

    // Lấy câu động viên ngẫu nhiên
    const getRandomQuote = (group) => {
        const quotes = group.quotes;
        const randomIndex = Math.floor(Math.random() * quotes.length);
        setCurrentQuote(quotes[randomIndex]);
        setSelectedGroup(group);
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

                {/* Tab Navigation */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    <button
                        onClick={() => setActiveTab('breathing')}
                        className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${activeTab === 'breathing'
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                                : 'bg-[--surface] text-[--text-secondary] hover:bg-[--surface-border]'
                            }`}
                    >
                        <Wind className="w-4 h-4 inline mr-2" />
                        Thở thư giãn
                    </button>
                    <button
                        onClick={() => setActiveTab('cards')}
                        className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${activeTab === 'cards'
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                : 'bg-[--surface] text-[--text-secondary] hover:bg-[--surface-border]'
                            }`}
                    >
                        <Sparkles className="w-4 h-4 inline mr-2" />
                        Bộ thẻ An Yên
                    </button>
                    <button
                        onClick={() => setActiveTab('quotes')}
                        className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${activeTab === 'quotes'
                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                                : 'bg-[--surface] text-[--text-secondary] hover:bg-[--surface-border]'
                            }`}
                    >
                        <Heart className="w-4 h-4 inline mr-2" />
                        Động viên
                    </button>
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'breathing' && (
                        <motion.div
                            key="breathing"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            {/* Chú thích: Sử dụng BreathingBubble từ Góc An Yên - có TTS hướng dẫn giọng nói */}
                            <BreathingBubble />
                        </motion.div>
                    )}

                    {activeTab === 'cards' && (
                        <motion.div
                            key="cards"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            {/* Chú thích: Bộ thẻ An Yên - 3 loại: Bình Yên, Việc làm nhỏ, Nhắn nhủ */}
                            <RandomWellnessCard />
                        </motion.div>
                    )}

                    {activeTab === 'quotes' && (
                        <motion.div
                            key="quotes"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
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
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
