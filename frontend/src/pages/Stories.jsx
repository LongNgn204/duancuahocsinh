// src/pages/Stories.jsx
// Chú thích: Kể chuyện - Đọc truyện với chế độ nhanh/chậm
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import GlowOrbs from '../components/ui/GlowOrbs';
import { BookOpen, Play, Pause, SkipForward, Volume2, VolumeX, Clock } from 'lucide-react';

// Danh sách truyện ngắn
const STORIES = [
    {
        id: 1,
        title: 'Chú ong nhỏ dũng cảm',
        content: [
            'Ngày xửa ngày xưa, có một chú ong nhỏ tên là Bee sống trong một tổ ong ấm áp.',
            'Bee rất nhút nhát và sợ bay xa khỏi tổ.',
            'Một ngày, Bee quyết định thử bay xa hơn một chút.',
            'Chú ong nhỏ khám phá ra một cánh đồng hoa tuyệt đẹp.',
            'Từ đó, Bee hiểu rằng dũng cảm thử điều mới sẽ mang đến những điều tuyệt vời.',
        ],
        moral: '🌟 Đôi khi, một bước nhỏ ra khỏi vùng an toàn có thể mang đến những điều kỳ diệu!',
    },
    {
        id: 2,
        title: 'Bông hoa kiên cường',
        content: [
            'Có một bông hoa nhỏ mọc giữa khe đá.',
            'Mọi người nghĩ nó không thể sống được.',
            'Nhưng mỗi ngày, bông hoa vẫn cố gắng vươn lên ánh mặt trời.',
            'Dần dần, bông hoa nở rực rỡ, đẹp hơn cả những bông hoa trong vườn.',
            'Tất cả đều ngạc nhiên và ngưỡng mộ sức sống của nó.',
        ],
        moral: '🌸 Dù hoàn cảnh khó khăn, bạn vẫn có thể tỏa sáng theo cách riêng của mình!',
    },
    {
        id: 3,
        title: 'Giọt nước nhỏ',
        content: [
            'Một giọt nước nhỏ cảm thấy mình vô nghĩa.',
            '"Mình chỉ là một giọt nước, có thể làm được gì đâu?" - giọt nước tự hỏi.',
            'Nhưng khi hợp cùng nhiều giọt nước khác, chúng tạo thành một dòng suối.',
            'Dòng suối chảy xa, mang nước đến cho cánh đồng khô hạn.',
            'Giọt nước hiểu rằng mình cũng là một phần quan trọng.',
        ],
        moral: '💧 Mỗi người đều có giá trị, dù đôi khi bạn không nhận ra điều đó!',
    },
];

export default function Stories() {
    const [selectedStory, setSelectedStory] = useState(null);
    const [currentPart, setCurrentPart] = useState(0);
    const [isReading, setIsReading] = useState(false);
    const [readingSpeed, setReadingSpeed] = useState('normal'); // 'fast' | 'normal' | 'slow'
    const [isSpeaking, setIsSpeaking] = useState(false);

    const speedSettings = {
        fast: { delay: 2000, label: 'Kể nhanh' },
        normal: { delay: 4000, label: 'Bình thường' },
        slow: { delay: 6000, label: 'Kể chậm' },
    };

    // Bắt đầu đọc truyện
    const startReading = async (story) => {
        setSelectedStory(story);
        setCurrentPart(0);
        setIsReading(true);

        for (let i = 0; i < story.content.length; i++) {
            setCurrentPart(i);
            // TTS đọc
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(story.content[i]);
                utterance.lang = 'vi-VN';
                utterance.rate = readingSpeed === 'fast' ? 1.3 : readingSpeed === 'slow' ? 0.8 : 1;
                speechSynthesis.speak(utterance);
                setIsSpeaking(true);
                await new Promise(resolve => {
                    utterance.onend = resolve;
                });
                setIsSpeaking(false);
            }
            await new Promise(r => setTimeout(r, speedSettings[readingSpeed].delay));
        }
        setIsReading(false);
    };

    // Dừng đọc
    const stopReading = () => {
        setIsReading(false);
        speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    // Đọc phần tiếp theo
    const nextPart = () => {
        if (selectedStory && currentPart < selectedStory.content.length - 1) {
            setCurrentPart(currentPart + 1);
        }
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
                        <BookOpen className="w-8 h-8 text-[--brand]" />
                        <span className="gradient-text">Kể chuyện</span>
                    </h1>
                    <p className="text-[--muted] text-sm mt-1">
                        Những câu chuyện nhỏ, bài học lớn
                    </p>
                </motion.div>

                {/* Chế độ đọc */}
                <Card size="sm">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Tốc độ kể:</span>
                        <div className="flex gap-2">
                            {Object.entries(speedSettings).map(([key, value]) => (
                                <button
                                    key={key}
                                    onClick={() => setReadingSpeed(key)}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${readingSpeed === key
                                            ? 'bg-[--brand] text-white'
                                            : 'bg-[--surface-border] text-[--text]'
                                        }`}
                                >
                                    {value.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Danh sách truyện */}
                {!selectedStory && (
                    <div className="grid gap-4">
                        {STORIES.map((story, idx) => (
                            <motion.div
                                key={story.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Card
                                    variant="interactive"
                                    onClick={() => startReading(story)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[--brand] to-[--brand-light] flex items-center justify-center">
                                            <BookOpen className="w-7 h-7 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-[--text]">{story.title}</h3>
                                            <p className="text-sm text-[--muted]">{story.content.length} phần</p>
                                        </div>
                                        <Play className="w-5 h-5 text-[--brand]" />
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Đang đọc truyện */}
                {selectedStory && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Card className="text-center py-8">
                            <h2 className="text-xl font-bold text-[--text] mb-6">{selectedStory.title}</h2>

                            {/* Nội dung hiện tại */}
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={currentPart}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="text-lg text-[--text] mb-8 px-4 min-h-[80px]"
                                >
                                    {selectedStory.content[currentPart]}
                                </motion.p>
                            </AnimatePresence>

                            {/* Progress */}
                            <div className="flex justify-center gap-2 mb-6">
                                {selectedStory.content.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`w-3 h-3 rounded-full transition-colors ${idx === currentPart ? 'bg-[--brand]' : idx < currentPart ? 'bg-[--brand]/50' : 'bg-[--surface-border]'
                                            }`}
                                    />
                                ))}
                            </div>

                            {/* Bài học */}
                            {currentPart === selectedStory.content.length - 1 && !isReading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-4 rounded-xl bg-[--brand]/10 mb-6"
                                >
                                    <p className="text-[--brand] font-medium">{selectedStory.moral}</p>
                                </motion.div>
                            )}

                            {/* Controls */}
                            <div className="flex justify-center gap-3">
                                {isReading ? (
                                    <Button variant="danger" onClick={stopReading} icon={<Pause size={18} />}>
                                        Dừng
                                    </Button>
                                ) : (
                                    <>
                                        <Button variant="ghost" onClick={() => setSelectedStory(null)}>
                                            Quay lại
                                        </Button>
                                        <Button variant="primary" onClick={() => startReading(selectedStory)} icon={<Play size={18} />}>
                                            Kể lại
                                        </Button>
                                    </>
                                )}
                            </div>

                            {/* Speaking indicator */}
                            {isSpeaking && (
                                <div className="mt-4 flex items-center justify-center gap-2 text-[--brand]">
                                    <Volume2 className="w-4 h-4 animate-pulse" />
                                    <span className="text-sm">Đang kể...</span>
                                </div>
                            )}
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
