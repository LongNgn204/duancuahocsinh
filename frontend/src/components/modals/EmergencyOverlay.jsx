// src/components/modals/EmergencyOverlay.jsx
// Chú thích: Emergency Overlay v2.0 - Multi-step calming flow
// Bước 1: Bình tĩnh + hướng dẫn thở | Bước 2: Thông tin hotline
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Heart, Phone, Wind, ArrowRight, X } from 'lucide-react';

/**
 * EmergencyOverlay - Hiển thị khi phát hiện từ khóa tiêu cực
 * @param {boolean} isOpen - Trạng thái hiển thị
 * @param {'critical'|'high'|'medium'} level - Mức độ nghiêm trọng
 * @param {string} message - Thông điệp SOS
 * @param {Function} onClose - Callback khi đóng overlay
 */
export default function EmergencyOverlay({ isOpen, level = 'high', message, onClose }) {
    // Step 1: Calming, Step 2: Hotline
    const [step, setStep] = useState(1);
    const [breathPhase, setBreathPhase] = useState('inhale'); // inhale, hold, exhale
    const [breathCount, setBreathCount] = useState(0);
    const [autoProgress, setAutoProgress] = useState(true);

    // Reset khi mở
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setBreathCount(0);
            setAutoProgress(true);
        }
    }, [isOpen]);

    // Hướng dẫn thở 4-7-8
    useEffect(() => {
        if (!isOpen || step !== 1) return;

        const breathSequence = async () => {
            // Inhale 4s
            setBreathPhase('inhale');
            await new Promise(r => setTimeout(r, 4000));

            // Hold 7s
            setBreathPhase('hold');
            await new Promise(r => setTimeout(r, 7000));

            // Exhale 8s
            setBreathPhase('exhale');
            await new Promise(r => setTimeout(r, 8000));

            setBreathCount(c => c + 1);
        };

        breathSequence();
        const interval = setInterval(breathSequence, 19000); // 4+7+8 = 19s

        return () => clearInterval(interval);
    }, [isOpen, step]);

    // Tự động chuyển sang step 2 sau 3 nhịp thở hoặc 60 giây
    useEffect(() => {
        if (!isOpen || step !== 1 || !autoProgress) return;

        if (breathCount >= 3) {
            setStep(2);
        }

        const timeout = setTimeout(() => {
            setStep(2);
        }, 60000); // 60 giây

        return () => clearTimeout(timeout);
    }, [isOpen, step, breathCount, autoProgress]);

    const handleProceedToHotline = useCallback(() => {
        setStep(2);
    }, []);

    const handleClose = useCallback(() => {
        setStep(1);
        setBreathCount(0);
        onClose?.();
    }, [onClose]);

    // Animation cho bong bóng thở
    const breathAnimation = {
        inhale: { scale: 1.4, transition: { duration: 4, ease: 'easeInOut' } },
        hold: { scale: 1.4, transition: { duration: 7 } },
        exhale: { scale: 1, transition: { duration: 8, ease: 'easeInOut' } }
    };

    const breathText = {
        inhale: 'Hít vào...',
        hold: 'Giữ hơi...',
        exhale: 'Thở ra...'
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[100] grid place-items-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                role="dialog"
                aria-modal="true"
                aria-label="Hỗ trợ khẩn cấp"
            >
                {/* Backdrop với animation sóng nhẹ */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-indigo-900/90 to-purple-900/90 backdrop-blur-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {/* Sóng nhẹ nhàng */}
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-500/20 to-transparent"
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <motion.div
                            className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cyan-500/15 to-transparent"
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                        />
                    </div>
                </motion.div>

                {/* Content */}
                <motion.div
                    className="relative z-10 max-w-md w-full"
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                >
                    {/* Step 1: Calming */}
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <Card variant="elevated" size="lg" className="text-center bg-white/95 backdrop-blur-xl">
                                    {/* Heart icon */}
                                    <motion.div
                                        className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center mb-4 shadow-lg"
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <Heart className="w-10 h-10 text-white" fill="white" />
                                    </motion.div>

                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                        Mong bạn hãy bình tĩnh...
                                    </h2>
                                    <p className="text-gray-600 mb-2 leading-relaxed">
                                        Mình ở đây với bạn. Bạn không đơn độc.
                                    </p>
                                    <p className="text-gray-500 text-sm mb-6">
                                        Hãy thử thở sâu cùng mình nhé. Mọi thứ sẽ ổn thôi.
                                    </p>

                                    {/* Breathing bubble */}
                                    <div className="relative h-48 flex items-center justify-center mb-6">
                                        <motion.div
                                            className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-2xl"
                                            variants={breathAnimation}
                                            animate={breathPhase}
                                        >
                                            <Wind className="w-12 h-12 text-white" />
                                        </motion.div>

                                        {/* Breathing instruction */}
                                        <motion.div
                                            className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white/80 px-4 py-2 rounded-full shadow-md"
                                            key={breathPhase}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <span className="text-lg font-medium text-blue-600">
                                                {breathText[breathPhase]}
                                            </span>
                                        </motion.div>
                                    </div>

                                    {/* Breath counter */}
                                    <div className="flex justify-center gap-2 mb-6">
                                        {[1, 2, 3].map(i => (
                                            <div
                                                key={i}
                                                className={`w-3 h-3 rounded-full transition-colors ${i <= breathCount ? 'bg-green-500' : 'bg-gray-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    <p className="text-sm text-gray-500 mb-4">
                                        Thở 3 nhịp để tiếp tục, hoặc bấm nút bên dưới
                                    </p>

                                    <div className="flex flex-col sm:flex-row justify-center gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={handleClose}
                                            className="text-gray-600"
                                        >
                                            Tôi đã bình tĩnh hơn
                                        </Button>
                                        <Button
                                            onClick={handleProceedToHotline}
                                            icon={<ArrowRight size={16} />}
                                            className="bg-blue-500 hover:bg-blue-600"
                                        >
                                            Tôi cần hỗ trợ ngay
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {/* Step 2: Hotline */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <Card variant="elevated" size="lg" className="bg-white/95 backdrop-blur-xl">
                                    {/* Close button */}
                                    <button
                                        onClick={handleClose}
                                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                                        aria-label="Đóng"
                                    >
                                        <X size={20} className="text-gray-500" />
                                    </button>

                                    {/* Header based on level */}
                                    <div className="text-center mb-6">
                                        <motion.div
                                            className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 shadow-lg ${level === 'critical'
                                                    ? 'bg-gradient-to-br from-red-400 to-rose-600'
                                                    : 'bg-gradient-to-br from-orange-400 to-amber-500'
                                                }`}
                                            animate={level === 'critical' ? { scale: [1, 1.1, 1] } : {}}
                                            transition={{ duration: 1, repeat: Infinity }}
                                        >
                                            <span className="text-4xl">
                                                {level === 'critical' ? '🆘' : '💙'}
                                            </span>
                                        </motion.div>

                                        <h2 className={`text-xl font-bold ${level === 'critical' ? 'text-red-600' : 'text-blue-600'
                                            }`}>
                                            {level === 'critical' ? 'Bạn không đơn độc' : 'Mình lo lắng cho bạn'}
                                        </h2>
                                    </div>

                                    {/* Message */}
                                    {message && (
                                        <p className="text-gray-600 text-center whitespace-pre-wrap text-sm mb-6 leading-relaxed">
                                            {message}
                                        </p>
                                    )}

                                    {/* Hotlines */}
                                    <div className="space-y-3 mb-6">
                                        <a
                                            href="tel:111"
                                            className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 hover:shadow-md transition-all"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                                                <Phone className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-red-600 text-lg">111</div>
                                                <div className="text-sm text-gray-600">Đường dây nóng bảo vệ trẻ em (24/7)</div>
                                            </div>
                                        </a>

                                        <a
                                            href="tel:18005999920"
                                            className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 hover:shadow-md transition-all"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                                                <Phone className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-blue-600 text-lg">1800 599 920</div>
                                                <div className="text-sm text-gray-600">Tổng đài sức khỏe tâm thần (miễn phí)</div>
                                            </div>
                                        </a>

                                        <a
                                            href="tel:02473071111"
                                            className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 hover:shadow-md transition-all"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                                                <Phone className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-purple-600 text-lg">024.7307.1111</div>
                                                <div className="text-sm text-gray-600">Trung tâm tham vấn tâm lý</div>
                                            </div>
                                        </a>
                                    </div>

                                    {/* Encouraging message */}
                                    <div className="text-center p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                                        <p className="text-green-700 text-sm">
                                            💚 Bạn rất dũng cảm khi đã tìm kiếm sự giúp đỡ.
                                            Có rất nhiều người sẵn sàng lắng nghe và hỗ trợ bạn.
                                        </p>
                                    </div>

                                    {/* Close button */}
                                    <div className="mt-6 text-center">
                                        <Button variant="outline" onClick={handleClose}>
                                            Tiếp tục trò chuyện
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
