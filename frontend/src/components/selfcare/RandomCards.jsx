// src/components/selfcare/RandomCards.jsx
// Chú thích: Component Random Wellness Cards - Thẻ gợi ý chăm sóc bản thân
// Phase 2: Góc An Yên enhancement

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, Check, X, Heart, History, Sparkles } from 'lucide-react';
import { isLoggedIn, saveRandomCardView, getRandomCardsHistory, rewardXP } from '../../utils/api';

// =============================================================================
// WELLNESS CARDS DATA - 25+ thẻ gợi ý
// =============================================================================
const WELLNESS_CARDS = [
    // Vận động nhẹ
    { id: 'stretch_1', emoji: '🧘', text: 'Đứng lên vươn vai 10 giây', category: 'movement' },
    { id: 'walk_1', emoji: '🚶', text: 'Đi bộ xung quanh phòng 1 phút', category: 'movement' },
    { id: 'neck_1', emoji: '💆', text: 'Xoay cổ nhẹ nhàng 5 vòng', category: 'movement' },
    { id: 'hands_1', emoji: '🙌', text: 'Vươn tay lên trời và hít thở sâu', category: 'movement' },

    // Uống nước / Dinh dưỡng
    { id: 'water_1', emoji: '💧', text: 'Uống một ly nước', category: 'nutrition' },
    { id: 'snack_1', emoji: '🍎', text: 'Ăn một miếng trái cây', category: 'nutrition' },
    { id: 'tea_1', emoji: '🍵', text: 'Pha một tách trà ấm', category: 'nutrition' },

    // Mindfulness / Thở
    { id: 'breath_1', emoji: '🌬️', text: 'Hít thở sâu 3 lần', category: 'mindfulness' },
    { id: 'breath_2', emoji: '🌸', text: 'Thử bài thở 4-7-8: hít 4s, giữ 7s, thở 8s', category: 'mindfulness' },
    { id: 'close_1', emoji: '👁️', text: 'Nhắm mắt và thư giãn 30 giây', category: 'mindfulness' },
    { id: 'present_1', emoji: '🎯', text: 'Nhìn xung quanh và tìm 5 vật màu xanh', category: 'mindfulness' },

    // Biết ơn
    { id: 'gratitude_1', emoji: '📝', text: 'Viết 3 điều biết ơn hôm nay', category: 'gratitude' },
    { id: 'gratitude_2', emoji: '💝', text: 'Nghĩ về 1 người bạn yêu thương', category: 'gratitude' },
    { id: 'smile_1', emoji: '😊', text: 'Cười thật tươi trong gương', category: 'gratitude' },

    // Âm nhạc / Giải trí
    { id: 'music_1', emoji: '🎵', text: 'Nghe một bài hát yêu thích', category: 'entertainment' },
    { id: 'dance_1', emoji: '💃', text: 'Nhảy theo nhạc 1 phút', category: 'entertainment' },
    { id: 'hum_1', emoji: '🎤', text: 'Hát hoặc ngân nga một bài hát', category: 'entertainment' },

    // Kết nối
    { id: 'text_1', emoji: '💬', text: 'Gửi tin nhắn cho bạn bè', category: 'connection' },
    { id: 'hug_1', emoji: '🤗', text: 'Ôm ai đó hoặc ôm gối', category: 'connection' },
    { id: 'call_1', emoji: '📞', text: 'Gọi điện cho người thân 5 phút', category: 'connection' },

    // Tự chăm sóc
    { id: 'face_1', emoji: '🧴', text: 'Rửa mặt bằng nước mát', category: 'selfcare' },
    { id: 'posture_1', emoji: '🪑', text: 'Ngồi thẳng lưng và điều chỉnh tư thế', category: 'selfcare' },
    { id: 'window_1', emoji: '🪟', text: 'Mở cửa sổ hít thở không khí trong lành', category: 'selfcare' },
    { id: 'eyes_1', emoji: '👀', text: 'Nhìn ra xa 20 giây để nghỉ mắt', category: 'selfcare' },

    // Sáng tạo
    { id: 'doodle_1', emoji: '✏️', text: 'Vẽ nguệch ngoạc trên giấy', category: 'creative' },
    { id: 'journal_1', emoji: '📖', text: 'Viết 1 câu về cảm xúc hiện tại', category: 'creative' },
];

// =============================================================================
// RANDOM CARDS COMPONENT
// =============================================================================
export default function RandomCards() {
    const [currentCard, setCurrentCard] = useState(null);
    const [isFlipping, setIsFlipping] = useState(false);
    const [viewedCards, setViewedCards] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [actionTaken, setActionTaken] = useState(false);

    // Load history từ server nếu đã đăng nhập
    useEffect(() => {
        const loadHistory = async () => {
            if (isLoggedIn()) {
                try {
                    const data = await getRandomCardsHistory(20);
                    if (data.items) {
                        setViewedCards(data.items.map(i => i.card_id));
                    }
                } catch (e) {
                    console.warn('[RandomCards] Failed to load history:', e);
                }
            } else {
                // Load từ localStorage cho guest
                const saved = localStorage.getItem('random_cards_history');
                if (saved) {
                    try {
                        setViewedCards(JSON.parse(saved).slice(0, 20));
                    } catch { }
                }
            }
        };
        loadHistory();
    }, []);

    // Lấy thẻ ngẫu nhiên, ưu tiên thẻ chưa xem
    const getRandomCard = useCallback(() => {
        // Lọc những thẻ chưa xem gần đây
        const unseenCards = WELLNESS_CARDS.filter(card => !viewedCards.includes(card.id));

        // Nếu đã xem hết, reset lại
        const pool = unseenCards.length > 0 ? unseenCards : WELLNESS_CARDS;

        // Random từ pool
        const randomIndex = Math.floor(Math.random() * pool.length);
        return pool[randomIndex];
    }, [viewedCards]);

    // Flip card animation và lưu history
    const drawCard = useCallback(async () => {
        setIsFlipping(true);
        setActionTaken(false);

        setTimeout(async () => {
            const newCard = getRandomCard();
            setCurrentCard(newCard);
            setIsFlipping(false);

            // Thêm vào history
            const newViewed = [newCard.id, ...viewedCards].slice(0, 20);
            setViewedCards(newViewed);

            // Lưu vào server hoặc localStorage
            if (isLoggedIn()) {
                try {
                    await saveRandomCardView(newCard.id, false);
                } catch (e) {
                    console.warn('[RandomCards] Failed to save view:', e);
                }
            } else {
                localStorage.setItem('random_cards_history', JSON.stringify(newViewed));
            }
        }, 300);
    }, [getRandomCard, viewedCards]);

    // Đánh dấu đã thực hiện action
    const markActionTaken = useCallback(async () => {
        if (!currentCard || actionTaken) return;

        setActionTaken(true);

        // Cộng XP nếu đăng nhập
        if (isLoggedIn()) {
            try {
                await rewardXP('random_card_action');
                await saveRandomCardView(currentCard.id, true);
            } catch (e) {
                console.warn('[RandomCards] Failed to reward XP:', e);
            }
        }
    }, [currentCard, actionTaken]);

    // Auto draw first card
    useEffect(() => {
        if (!currentCard) {
            drawCard();
        }
    }, []);

    // Lấy tên category
    const getCategoryLabel = (category) => {
        const labels = {
            movement: '🏃 Vận động',
            nutrition: '🥗 Dinh dưỡng',
            mindfulness: '🧘 Tĩnh tâm',
            gratitude: '💝 Biết ơn',
            entertainment: '🎵 Giải trí',
            connection: '🤝 Kết nối',
            selfcare: '💆 Chăm sóc',
            creative: '🎨 Sáng tạo',
        };
        return labels[category] || category;
    };

    return (
        <div className="flex flex-col items-center gap-6 p-4">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent flex items-center justify-center gap-2">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                    Thẻ Wellness
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Rút một thẻ để nhận gợi ý chăm sóc bản thân
                </p>
            </div>

            {/* Card Display */}
            <AnimatePresence mode="wait">
                {currentCard && !isFlipping && (
                    <motion.div
                        key={currentCard.id}
                        initial={{ rotateY: 90, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: -90, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`
              relative w-72 h-96 rounded-3xl p-6
              bg-gradient-to-br from-white to-gray-50 
              dark:from-gray-800 dark:to-gray-900
              border-2 ${actionTaken ? 'border-green-400' : 'border-purple-200 dark:border-purple-800'}
              shadow-xl hover:shadow-2xl transition-shadow
              flex flex-col items-center justify-center text-center
            `}
                    >
                        {/* Category Badge */}
                        <span className="absolute top-4 left-4 text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
                            {getCategoryLabel(currentCard.category)}
                        </span>

                        {/* Emoji */}
                        <span className="text-7xl mb-4">{currentCard.emoji}</span>

                        {/* Text */}
                        <p className="text-xl font-medium text-gray-800 dark:text-gray-100 leading-relaxed">
                            {currentCard.text}
                        </p>

                        {/* Action Taken Indicator */}
                        {actionTaken && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center"
                            >
                                <Check className="w-6 h-6 text-white" />
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* Flipping State */}
                {isFlipping && (
                    <motion.div
                        initial={{ rotateY: 0 }}
                        animate={{ rotateY: 90 }}
                        className="w-72 h-96 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-xl flex items-center justify-center"
                    >
                        <Shuffle className="w-16 h-16 text-white animate-pulse" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex gap-3">
                {/* Mark as Done */}
                {currentCard && !actionTaken && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={markActionTaken}
                        className="flex items-center gap-2 px-6 py-3 rounded-full bg-green-500 hover:bg-green-600 text-white font-medium shadow-lg"
                    >
                        <Check className="w-5 h-5" />
                        Đã làm!
                    </motion.button>
                )}

                {/* Draw New Card */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={drawCard}
                    disabled={isFlipping}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium shadow-lg disabled:opacity-50"
                >
                    <Shuffle className="w-5 h-5" />
                    Lấy thẻ mới
                </motion.button>

                {/* History Toggle */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowHistory(!showHistory)}
                    className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    <History className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </motion.button>
            </div>

            {/* History Panel */}
            <AnimatePresence>
                {showHistory && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="w-full max-w-md bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 overflow-hidden"
                    >
                        <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <History className="w-4 h-4" />
                            Thẻ đã rút gần đây
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {viewedCards.slice(0, 10).map((cardId, idx) => {
                                const card = WELLNESS_CARDS.find(c => c.id === cardId);
                                if (!card) return null;
                                return (
                                    <span
                                        key={idx}
                                        className="text-2xl p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm"
                                        title={card.text}
                                    >
                                        {card.emoji}
                                    </span>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* XP Hint */}
            {isLoggedIn() && (
                <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    Nhấn "Đã làm!" để nhận +10 XP
                </p>
            )}
        </div>
    );
}

// Export danh sách thẻ để dùng ở nơi khác nếu cần
export { WELLNESS_CARDS };
