import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Coffee, Star, X, Repeat } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const CARDS = [
    // Thẻ Bình Yên (Calm)
    { type: 'peace', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300', icon: Coffee, title: 'Thẻ Bình Yên', content: 'Hít một hơi thật sâu... và thở ra mọi lo lắng.', action: 'Thực hiện 3 lần ngay bây giờ nhé.' },
    { type: 'peace', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300', icon: Coffee, title: 'Thẻ Bình Yên', content: 'Bình yên không ở đâu xa, nó ở ngay trong hơi thở của bạn.', action: 'Nhắm mắt lại trong 10 giây.' },
    { type: 'peace', color: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-300', icon: Coffee, title: 'Thẻ Bình Yên', content: 'Hãy nhìn ra cửa sổ và tìm một màu xanh lá cây.', action: 'Thả lỏng đôi vai của bạn.' },

    // Thẻ Việc Làm Nhỏ (Action)
    { type: 'action', color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300', icon: Sparkles, title: 'Việc Làm Nhỏ', content: 'Hôm nay chúng ta cùng thử bài tập quan sát nha.', action: 'Tìm 5 vật màu đỏ xung quanh bạn.' },
    { type: 'action', color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-300', icon: Sparkles, title: 'Việc Làm Nhỏ', content: 'Uống một cốc nước ấm.', action: 'Cảm nhận dòng nước đi vào cơ thể.' },
    { type: 'action', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300', icon: Sparkles, title: 'Việc Làm Nhỏ', content: 'Sắp xếp lại góc học tập.', action: 'Chỉ cần gọn gàng một chút thôi.' },

    // Thẻ Nhắn Nhủ (Affirmation)
    { type: 'message', color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300', icon: Heart, title: 'Nhắn Nhủ', content: 'Hôm nay bạn đã làm tốt lắm, yêu bản thân hơn nha.', action: 'Tự ôm lấy mình một cái nào!' },
    { type: 'message', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300', icon: Heart, title: 'Nhắn Nhủ', content: 'Bạn là phiên bản độc nhất vô nhị.', action: 'Hãy mỉm cười với chính mình trong gương.' },
    { type: 'message', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300', icon: Heart, title: 'Nhắn Nhủ', content: 'Không sao cả nếu hôm nay bạn thấy mệt.', action: 'Nghỉ ngơi là một phần của cố gắng.' },
];

export default function PeaceCardDeck() {
    const [drawnCard, setDrawnCard] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const drawRandomCard = () => {
        setIsDrawing(true);
        setTimeout(() => {
            const random = CARDS[Math.floor(Math.random() * CARDS.length)];
            setDrawnCard(random);
            setIsDrawing(false);
        }, 1500); // Fake shuffle animation time
    };

    const reset = () => setDrawnCard(null);

    return (
        <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center p-4">
            <AnimatePresence mode="wait">
                {!drawnCard ? (
                    <motion.div
                        key="deck"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="text-center"
                    >
                        <h2 className="text-xl font-bold text-[--text] mb-6">Bộ Thẻ An Yên</h2>

                        {/* Deck Visual */}
                        <motion.button
                            onClick={drawRandomCard}
                            disabled={isDrawing}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative w-48 h-72 mx-auto perspective-1000 group cursor-pointer"
                        >
                            <div className={`
                                w-full h-full rounded-2xl bg-gradient-to-br from-[--brand] to-[--brand-light] 
                                shadow-xl flex items-center justify-center border-4 border-white
                                ${isDrawing ? 'animate-pulse' : ''}
                            `}>
                                <div className="text-white text-6xl opacity-80">🍃</div>
                                {isDrawing && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-xl">
                                        <div className="text-sm text-white font-medium bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                                            Đang rút...
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Stack effect */}
                            <div className="absolute top-2 left-2 w-full h-full rounded-2xl bg-[--brand] opacity-20 -z-10 group-hover:top-4 group-hover:left-4 transition-all" />
                            <div className="absolute top-4 left-4 w-full h-full rounded-2xl bg-[--brand] opacity-10 -z-20 group-hover:top-8 group-hover:left-8 transition-all" />
                        </motion.button>

                        <p className="mt-8 text-[--muted]">Chạm vào bộ bài để nhận thông điệp ngẫu nhiên</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="card"
                        initial={{ opacity: 0, rotateY: 90 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        exit={{ opacity: 0, rotateY: -90 }}
                        transition={{ duration: 0.5, type: 'spring' }}
                        className="relative w-full max-w-sm"
                    >
                        <Card className="p-8 text-center bg-white border-4 border-white shadow-2xl relative overflow-hidden">
                            {/* Card Decoration */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[--brand] to-transparent opacity-50" />

                            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${drawnCard.color}`}>
                                <drawnCard.icon size={32} />
                            </div>

                            <h3 className="text-xl font-bold text-[--text] mb-4 uppercase tracking-wider">{drawnCard.title}</h3>

                            <div className="py-6 px-4 bg-[--surface] rounded-xl mb-6">
                                <p className="text-lg font-medium text-[--text] leading-relaxed">
                                    "{drawnCard.content}"
                                </p>
                            </div>

                            <p className="text-[--text-secondary] italic mb-8">
                                👉 {drawnCard.action}
                            </p>

                            <div className="flex justify-center gap-3">
                                <Button onClick={reset} variant="ghost" icon={<X size={20} />}>
                                    Đóng
                                </Button>
                                <Button onClick={drawRandomCard} variant="primary" icon={<Repeat size={20} />}>
                                    Rút thẻ khác
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
