// src/components/breathing/RandomWellnessCard.jsx
// Chú thích: Thẻ An Yên ngẫu nhiên - Gợi ý hoạt động wellness mỗi khi mở trang
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sparkles, Coffee, Music, BookOpen, Heart, 
    Sun, Moon, Wind, Flower2, Waves, X, CheckCircle2
} from 'lucide-react';
import { saveRandomCardView, getRandomCardsHistory } from '../../utils/api';
import { isLoggedIn } from '../../utils/api';

// Danh sách thẻ wellness với các hoạt động gợi ý
const WELLNESS_CARDS = [
    {
        id: 'walk',
        title: 'Đi bộ 10 phút',
        description: 'Đi bộ ngoài trời giúp cải thiện tâm trạng và năng lượng',
        icon: Sun,
        color: 'from-amber-400 to-orange-400',
        action: 'Đi bộ ngay',
    },
    {
        id: 'water',
        title: 'Uống một ly nước',
        description: 'Giữ nước cho cơ thể giúp bạn tỉnh táo và tập trung hơn',
        icon: Waves,
        color: 'from-blue-400 to-cyan-400',
        action: 'Uống nước',
    },
    {
        id: 'music',
        title: 'Nghe nhạc yêu thích',
        description: 'Âm nhạc có thể làm dịu tâm trí và nâng cao tinh thần',
        icon: Music,
        color: 'from-purple-400 to-pink-400',
        action: 'Bật nhạc',
    },
    {
        id: 'stretch',
        title: 'Vươn vai và kéo giãn',
        description: 'Giải phóng căng thẳng cơ bắp, tăng lưu thông máu',
        icon: Wind,
        color: 'from-teal-400 to-green-400',
        action: 'Kéo giãn',
    },
    {
        id: 'gratitude',
        title: 'Nghĩ về 1 điều biết ơn',
        description: 'Tập trung vào điều tích cực giúp cải thiện tâm trạng',
        icon: Heart,
        color: 'from-pink-400 to-rose-400',
        action: 'Ghi lại',
    },
    {
        id: 'read',
        title: 'Đọc 5 trang sách',
        description: 'Đọc sách giúp thư giãn và mở rộng kiến thức',
        icon: BookOpen,
        color: 'from-indigo-400 to-purple-400',
        action: 'Đọc sách',
    },
    {
        id: 'coffee',
        title: 'Nghỉ giải lao với đồ uống nóng',
        description: 'Một chút thời gian cho bản thân để nạp lại năng lượng',
        icon: Coffee,
        color: 'from-amber-500 to-orange-500',
        action: 'Nghỉ giải lao',
    },
    {
        id: 'nature',
        title: 'Ngắm nhìn thiên nhiên',
        description: 'Quan sát cây cối, bầu trời giúp giảm stress',
        icon: Flower2,
        color: 'from-green-400 to-emerald-400',
        action: 'Ngắm cảnh',
    },
    {
        id: 'meditate',
        title: 'Thiền 3 phút',
        description: 'Thiền ngắn giúp tâm trí bình yên và tập trung',
        icon: Sparkles,
        color: 'from-violet-400 to-purple-400',
        action: 'Thiền',
    },
    {
        id: 'sleep',
        title: 'Ngủ đủ giấc tối nay',
        description: 'Giấc ngủ chất lượng là nền tảng cho sức khỏe tinh thần',
        icon: Moon,
        color: 'from-slate-400 to-gray-400',
        action: 'Nhắc nhở',
    },
];

/**
 * Lấy thẻ ngẫu nhiên chưa xem gần đây
 */
function getRandomCard(viewedIds = []) {
    // Lọc các thẻ chưa xem hoặc đã xem lâu (hơn 3 ngày)
    const availableCards = WELLNESS_CARDS.filter(card => {
        const viewed = viewedIds.find(v => v.card_id === card.id);
        if (!viewed) return true;
        // Nếu đã xem, chỉ hiển thị lại sau 3 ngày
        const viewedDate = new Date(viewed.viewed_at);
        const daysSince = (Date.now() - viewedDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince > 3;
    });

    // Nếu tất cả đã xem gần đây, chọn ngẫu nhiên từ tất cả
    const pool = availableCards.length > 0 ? availableCards : WELLNESS_CARDS;
    return pool[Math.floor(Math.random() * pool.length)];
}

export default function RandomWellnessCard({ onActionTaken }) {
    const [card, setCard] = useState(null);
    const [viewed, setViewed] = useState(false);
    const [actionTaken, setActionTaken] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCard();
    }, []);

    const loadCard = async () => {
        setLoading(true);
        try {
            // Lấy lịch sử thẻ đã xem nếu đã đăng nhập
            let viewedIds = [];
            if (isLoggedIn()) {
                try {
                    const history = await getRandomCardsHistory(50);
                    viewedIds = history.items || [];
                } catch (e) {
                    console.warn('[WellnessCard] Failed to load history:', e);
                }
            }

            const randomCard = getRandomCard(viewedIds);
            setCard(randomCard);
            setViewed(false);
            setActionTaken(false);
        } catch (e) {
            console.error('[WellnessCard] Error:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleView = async () => {
        if (viewed || !card) return;
        setViewed(true);

        // Lưu lịch sử xem nếu đã đăng nhập
        if (isLoggedIn()) {
            try {
                await saveRandomCardView(card.id, false);
            } catch (e) {
                console.warn('[WellnessCard] Failed to save view:', e);
            }
        }
    };

    const handleAction = async () => {
        if (actionTaken || !card) return;
        setActionTaken(true);

        // Lưu lịch sử với action_taken = true
        if (isLoggedIn()) {
            try {
                await saveRandomCardView(card.id, true);
            } catch (e) {
                console.warn('[WellnessCard] Failed to save action:', e);
            }
        }

        // Gọi callback nếu có
        if (onActionTaken) {
            onActionTaken(card);
        }
    };

    const handleDismiss = () => {
        setCard(null);
    };

    if (loading || !card) {
        return null;
    }

    const Icon = card.icon;

    return (
        <AnimatePresence>
            {card && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative"
                >
                    <motion.div
                        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 relative overflow-hidden"
                        onViewportEnter={handleView}
                    >
                        {/* Background gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-10`} />

                        {/* Close button */}
                        <button
                            onClick={handleDismiss}
                            className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors z-10"
                            aria-label="Đóng thẻ"
                        >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>

                        <div className="relative z-10">
                            {/* Icon và Title */}
                            <div className="flex items-start gap-4 mb-4">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center flex-shrink-0`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-1">
                                        {card.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {card.description}
                                    </p>
                                </div>
                            </div>

                            {/* Action button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleAction}
                                disabled={actionTaken}
                                className={`
                                    w-full py-3 rounded-xl font-medium transition-all
                                    ${actionTaken
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                        : `bg-gradient-to-r ${card.color} text-white hover:shadow-lg`
                                    }
                                `}
                            >
                                {actionTaken ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <CheckCircle2 className="w-5 h-5" />
                                        Đã thực hiện!
                                    </span>
                                ) : (
                                    card.action
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

