// src/components/breathing/RandomWellnessCard.jsx
// Chú thích: Thẻ An Yên ngẫu nhiên - Gợi ý hoạt động wellness mỗi khi mở trang
import { useState, useEffect, useRef } from 'react';
import { 
    Sparkles, Coffee, Music, BookOpen, Heart, 
    Sun, Moon, Wind, Flower2, Waves, X, CheckCircle2, Star
} from 'lucide-react';
import { saveRandomCardView, getRandomCardsHistory, rewardXP, isLoggedIn } from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

// 3 loại thẻ An Yên đặc biệt
const SPECIAL_CARDS = {
  binhYen: {
    id: 'binh-yen',
    type: 'binh-yen',
    title: 'Bình Yên',
    message: 'Hít một hơi để thấy mình bình yên hơn nhé.',
    icon: Heart,
    color: 'from-blue-400 to-cyan-400',
    suggestions: [
      'Thở sâu 5 lần',
      'Nghe nhạc nhẹ',
      'Uống nước',
      'Ngắm cảnh',
    ],
  },
  viecLamNho: {
    id: 'viec-lam-nho',
    type: 'viec-lam-nho',
    title: 'Việc làm nhỏ',
    message: 'Hôm nay chúng ta cùng thử bài tập quan sát nha',
    icon: Sparkles,
    color: 'from-purple-400 to-pink-400',
    suggestions: [
      'Quan sát 5 điều xung quanh',
      'Liệt kê 3 âm thanh bạn nghe thấy',
      'Chạm vào 3 vật thể khác nhau',
      'Nếm một món ăn và mô tả',
    ],
  },
  nhanNhu: {
    id: 'nhan-nhu',
    type: 'nhan-nhu',
    title: 'Nhắn nhủ',
    message: 'Hôm nay bạn đã làm tốt lắm, yêu bản thân hơn nha',
    icon: Star,
    color: 'from-pink-400 to-rose-400',
    suggestions: [
      'Viết 3 điều bạn tự hào về bản thân',
      'Nghĩ về 1 thành tựu nhỏ hôm nay',
      'Tự khen mình',
    ],
  },
};

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

// Hook tạo âm thanh chúc mừng
function useCelebrationSound() {
    const audioContextRef = useRef(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        return () => {
            try {
                audioContextRef.current?.close();
            } catch (_) {}
        };
    }, []);

    const playSuccess = () => {
        if (!audioContextRef.current) return;

        try {
            const ctx = audioContextRef.current;
            const now = ctx.currentTime;

            // Tạo chuỗi nốt nhạc vui vẻ (C-E-G-C)
            const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5

            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc.type = 'sine';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0, now + i * 0.1);
                gain.gain.linearRampToValueAtTime(0.2, now + i * 0.1 + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.2);

                osc.connect(gain).connect(ctx.destination);
                osc.start(now + i * 0.1);
                osc.stop(now + i * 0.1 + 0.2);
            });
        } catch (e) {
            console.warn('[Celebration] Sound error:', e);
        }
    };

    return { playSuccess };
}

export default function RandomWellnessCard({ onActionTaken }) {
    const [card, setCard] = useState(null);
    const [viewed, setViewed] = useState(false);
    const [actionTaken, setActionTaken] = useState(false);
    const [loading, setLoading] = useState(true);
    const [xpEarned, setXpEarned] = useState(null);
    const [showXpNotification, setShowXpNotification] = useState(false);
    const [selectedSpecialCard, setSelectedSpecialCard] = useState(null);
    const { playSuccess } = useCelebrationSound();

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

        // Phát âm thanh chúc mừng
        playSuccess();

        // Thưởng XP nếu đã đăng nhập
        if (isLoggedIn()) {
            try {
                // Lưu lịch sử với action_taken = true
                await saveRandomCardView(card.id, true);

                // Thưởng XP
                const result = await rewardXP('random_card_action');
                if (result && result.xp_added) {
                    setXpEarned(result.xp_added);
                    setShowXpNotification(true);
                    
                    // Ẩn notification sau 3 giây
                    setTimeout(() => {
                        setShowXpNotification(false);
                    }, 3000);
                }
            } catch (e) {
                console.warn('[WellnessCard] Failed to save action or reward XP:', e);
            }
        }

        // Gọi callback nếu có
        if (onActionTaken) {
            onActionTaken(card);
        }
    };

    const handleDismiss = () => {
        setCard(null);
        setSelectedSpecialCard(null);
    };

    const handleSelectSpecialCard = (cardType) => {
        const specialCard = SPECIAL_CARDS[cardType];
        if (specialCard) {
            setSelectedSpecialCard(specialCard);
            setCard(null); // Hide random card
        }
    };

    const handleSpecialCardAction = () => {
        playSuccess();
        setActionTaken(true);
        if (onActionTaken && selectedSpecialCard) {
            onActionTaken(selectedSpecialCard);
        }
    };

    // Show special card selector or special card
    if (selectedSpecialCard) {
        const Icon = selectedSpecialCard.icon;
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative"
                >
                    <motion.div
                        className={`bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 relative overflow-hidden bg-gradient-to-br ${selectedSpecialCard.color}`}
                    >
                        <button
                            onClick={handleDismiss}
                            className="absolute top-4 right-4 p-1.5 hover:bg-white/20 rounded-lg transition-colors z-10"
                            aria-label="Đóng thẻ"
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>

                        <div className="relative z-10">
                            <div className="flex items-start gap-4 mb-4">
                                <div className={`w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg text-white mb-2">
                                        {selectedSpecialCard.title}
                                    </h3>
                                    <p className="text-white/90 text-sm mb-4">
                                        {selectedSpecialCard.message}
                                    </p>
                                </div>
                            </div>

                            {/* Suggestions */}
                            <div className="mb-4">
                                <p className="text-white/80 text-xs mb-2">Gợi ý hoạt động:</p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedSpecialCard.suggestions.map((suggestion, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1.5 bg-white/20 rounded-lg text-white text-xs"
                                        >
                                            {suggestion}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSpecialCardAction}
                                disabled={actionTaken}
                                className={`
                                    w-full py-3 rounded-xl font-medium transition-all
                                    ${actionTaken
                                        ? 'bg-white/30 text-white'
                                        : 'bg-white text-gray-800 hover:shadow-lg'
                                    }
                                `}
                            >
                                {actionTaken ? 'Đã thực hiện!' : 'Bắt đầu'}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        );
    }

    // Show selector for special cards
    return (
        <div className="space-y-4">
            {/* Special Cards Selector */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200/50">
                <h3 className="font-semibold text-sm text-gray-800 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Bộ thẻ An Yên
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    {Object.values(SPECIAL_CARDS).map((specialCard) => {
                        const Icon = specialCard.icon;
                        return (
                            <motion.button
                                key={specialCard.id}
                                onClick={() => handleSelectSpecialCard(specialCard.type)}
                                className="p-3 rounded-xl text-center transition-all glass hover:bg-white/50"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${specialCard.color} flex items-center justify-center mx-auto mb-2`}>
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                                <div className="text-xs font-medium text-gray-800">
                                    {specialCard.title}
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Random Wellness Card */}
            {loading || !card ? null : (
                <AnimatePresence>
                    {card && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative"
                        >
                            <motion.div
                                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 relative overflow-hidden"
                                onViewportEnter={handleView}
                            >
                                {/* Background gradient */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-10`} />

                                {/* Close button */}
                                <button
                                    onClick={handleDismiss}
                                    className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-lg transition-colors z-10"
                                    aria-label="Đóng thẻ"
                                >
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>

                                <div className="relative z-10">
                                    {/* Icon và Title */}
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center flex-shrink-0`}>
                                            <card.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg text-gray-800 mb-1">
                                                {card.title}
                                            </h3>
                                            <p className="text-sm text-gray-600">
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
                                            w-full py-3 rounded-xl font-medium transition-all relative
                                            ${actionTaken
                                                ? 'bg-green-100 text-green-600'
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

                                    {/* XP Notification */}
                                    <AnimatePresence>
                                        {showXpNotification && xpEarned && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10, scale: 0.8 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -10, scale: 0.8 }}
                                                className="absolute -top-16 left-1/2 -translate-x-1/2 z-20"
                                            >
                                                <motion.div
                                                    className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-semibold"
                                                    animate={{
                                                        scale: [1, 1.1, 1],
                                                    }}
                                                    transition={{
                                                        duration: 0.5,
                                                        repeat: 2,
                                                    }}
                                                >
                                                    <Star className="w-5 h-5 fill-current" />
                                                    <span>+{xpEarned} XP</span>
                                                </motion.div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    );

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
                        className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 relative overflow-hidden"
                        onViewportEnter={handleView}
                    >
                        {/* Background gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-10`} />

                        {/* Close button */}
                        <button
                            onClick={handleDismiss}
                            className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-lg transition-colors z-10"
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
                                    <h3 className="font-semibold text-lg text-gray-800 mb-1">
                                        {card.title}
                                    </h3>
                                    <p className="text-sm text-gray-600">
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
                                    w-full py-3 rounded-xl font-medium transition-all relative
                                    ${actionTaken
                                        ? 'bg-green-100 text-green-600'
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

                            {/* XP Notification */}
                            <AnimatePresence>
                                {showXpNotification && xpEarned && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.8 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.8 }}
                                        className="absolute -top-16 left-1/2 -translate-x-1/2 z-20"
                                    >
                                        <motion.div
                                            className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-semibold"
                                            animate={{
                                                scale: [1, 1.1, 1],
                                            }}
                                            transition={{
                                                duration: 0.5,
                                                repeat: 2,
                                            }}
                                        >
                                            <Star className="w-5 h-5 fill-current" />
                                            <span>+{xpEarned} XP</span>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

