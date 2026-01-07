// src/components/tour/TourGuide.jsx
// Chú thích: Interactive tour guide cho học sinh mới - Phase 5 addition
// Hướng dẫn từng bước với highlight elements và navigation

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ChevronLeft, ChevronRight, X, Play,
    Bot, Wind, Heart, Gamepad2,
    Star, BookOpenCheck, HelpCircle, CheckCircle
} from 'lucide-react';

// =============================================================================
// TOUR STEPS CONFIGURATION
// =============================================================================
const TOUR_STEPS = [
    {
        id: 'welcome',
        title: 'Chào mừng bạn! 👋',
        description: 'Đây là "Bạn Đồng Hành" - nơi bạn có thể tâm sự an toàn và chăm sóc sức khỏe tinh thần.',
        icon: Star,
        route: '/app',
        position: 'center',
    },
    {
        id: 'chat',
        title: 'Tâm sự với AI',
        description: 'Bạn có thể chat hoặc nói chuyện với AI bất cứ lúc nào. AI sẽ lắng nghe và không phán xét bạn.',
        icon: Bot,
        route: '/chat',
        position: 'center',
        tip: 'Thử hỏi: "Hôm nay mình thấy hơi buồn..." 💬',
    },
    {
        id: 'breathing',
        title: 'Góc An Yên',
        description: 'Khi stress hoặc lo lắng, hãy thử bài tập thở 4-7-8 để thư giãn ngay lập tức.',
        icon: Wind,
        route: '/breathing',
        position: 'center',
        tip: 'Bài thở 4-7-8: Hít 4 giây - Giữ 7 giây - Thở 8 giây 🌬️',
    },
    {
        id: 'gratitude',
        title: 'Lọ Biết Ơn',
        description: 'Viết mỗi ngày 3 điều bạn biết ơn. Nghiên cứu cho thấy điều này giúp tăng hạnh phúc!',
        icon: Heart,
        route: '/gratitude',
        position: 'center',
        tip: 'Streak 7 ngày = +50 XP 🔥',
    },
    {
        id: 'journal',
        title: 'Nhật ký Cảm xúc',
        description: 'Ghi lại cảm xúc và suy nghĩ của bạn. AI sẽ phân tích mood để giúp bạn hiểu bản thân hơn.',
        icon: BookOpenCheck,
        route: '/journal',
        position: 'center',
        tip: 'Viết nhật ký mỗi ngày = +15 XP ✍️',
    },
    {
        id: 'games',
        title: 'Trò chơi Thư giãn',
        description: 'Chơi game nhẹ nhàng để giảm stress. Không quảng cáo, không mất phí!',
        icon: Gamepad2,
        route: '/games',
        position: 'center',
        tip: 'Thử game Bubble Pop khi cảm thấy căng thẳng 🎮',
    },
    {
        id: 'journey',
        title: 'Hành trình của Bạn',
        description: 'Xem XP, level và thành tích của bạn. Mỗi hoạt động đều được ghi nhận!',
        icon: Star,
        route: '/journey',
        position: 'center',
        tip: 'Mở khóa 15 thành tựu bằng cách sử dụng app thường xuyên ⭐',
    },
    {
        id: 'complete',
        title: 'Sẵn sàng rồi! 🎉',
        description: 'Bạn đã biết cách sử dụng app. Hãy bắt đầu hành trình chăm sóc bản thân nhé!',
        icon: CheckCircle,
        route: '/app',
        position: 'center',
        isLast: true,
    },
];

// =============================================================================
// TOUR GUIDE COMPONENT
// =============================================================================
export default function TourGuide({ onComplete }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const step = TOUR_STEPS[currentStep];
    const totalSteps = TOUR_STEPS.length;
    const progress = ((currentStep + 1) / totalSteps) * 100;

    // Navigate to step route
    useEffect(() => {
        if (step.route && location.pathname !== step.route) {
            navigate(step.route);
        }
    }, [currentStep, step.route, navigate, location.pathname]);

    // Next step
    const nextStep = useCallback(() => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            // Complete tour
            completeTour();
        }
    }, [currentStep, totalSteps]);

    // Previous step
    const prevStep = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    // Complete tour
    const completeTour = useCallback(() => {
        try {
            localStorage.setItem('tour_completed_v1', '1');
        } catch { }
        setIsVisible(false);
        if (onComplete) onComplete();
    }, [onComplete]);

    // Skip tour
    const skipTour = useCallback(() => {
        try {
            localStorage.setItem('tour_skipped_v1', '1');
        } catch { }
        setIsVisible(false);
        if (onComplete) onComplete();
    }, [onComplete]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight' || e.key === 'Enter') {
                nextStep();
            } else if (e.key === 'ArrowLeft') {
                prevStep();
            } else if (e.key === 'Escape') {
                skipTour();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [nextStep, prevStep, skipTour]);

    if (!isVisible) return null;

    const Icon = step.icon;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                {/* Tour Card */}
                <motion.div
                    key={step.id}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Progress Bar */}
                    <div className="h-1.5 bg-gray-200">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                            transition={{ duration: 0.3 }}
                        />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* Step Counter */}
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-medium text-gray-500">
                                Bước {currentStep + 1}/{totalSteps}
                            </span>
                            <button
                                onClick={skipTour}
                                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                            >
                                Bỏ qua <X className="w-3 h-3" />
                            </button>
                        </div>

                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.1, type: 'spring' }}
                                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
                            >
                                <Icon className="w-10 h-10 text-white" />
                            </motion.div>
                        </div>

                        {/* Title & Description */}
                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="text-xl font-bold text-center text-gray-800 mb-2"
                        >
                            {step.title}
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-center text-gray-600 text-sm mb-4"
                        >
                            {step.description}
                        </motion.p>

                        {/* Tip */}
                        {step.tip && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="bg-purple-50 border border-purple-200 rounded-xl p-3 mb-4"
                            >
                                <div className="flex items-start gap-2">
                                    <HelpCircle className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-purple-700">
                                        {step.tip}
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* Navigation */}
                        <div className="flex items-center gap-3">
                            {/* Previous Button */}
                            {currentStep > 0 && (
                                <button
                                    onClick={prevStep}
                                    className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    Quay lại
                                </button>
                            )}

                            {/* Next/Complete Button */}
                            <button
                                onClick={nextStep}
                                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium flex items-center justify-center gap-2 shadow-lg transition-all"
                            >
                                {step.isLast ? (
                                    <>
                                        Bắt đầu thôi!
                                        <Play className="w-5 h-5" />
                                    </>
                                ) : (
                                    <>
                                        Tiếp theo
                                        <ChevronRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Keyboard Hint */}
                        <p className="text-center text-xs text-gray-400 mt-4">
                            Dùng phím ← → để điều hướng, Esc để bỏ qua
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// =============================================================================
// TOUR TRIGGER BUTTON
// =============================================================================
export function TourTriggerButton() {
    const [showTour, setShowTour] = useState(false);

    return (
        <>
            <button
                onClick={() => setShowTour(true)}
                className="fixed bottom-24 right-4 z-50 p-3 rounded-full bg-purple-500 hover:bg-purple-600 text-white shadow-lg transition-all hover:scale-110"
                aria-label="Hướng dẫn sử dụng"
                title="Hướng dẫn sử dụng"
            >
                <HelpCircle className="w-6 h-6" />
            </button>

            {showTour && (
                <TourGuide onComplete={() => setShowTour(false)} />
            )}
        </>
    );
}

// =============================================================================
// HOOK TO CHECK TOUR STATUS
// =============================================================================
export function useTourStatus() {
    const [shouldShowTour, setShouldShowTour] = useState(false);

    useEffect(() => {
        try {
            const completed = localStorage.getItem('tour_completed_v1');
            const skipped = localStorage.getItem('tour_skipped_v1');
            const onboarding = localStorage.getItem('onboarding_seen_v1');

            // Show tour if onboarding done but tour not done
            if (onboarding && !completed && !skipped) {
                setShouldShowTour(true);
            }
        } catch { }
    }, []);

    const resetTour = () => {
        try {
            localStorage.removeItem('tour_completed_v1');
            localStorage.removeItem('tour_skipped_v1');
        } catch { }
        setShouldShowTour(true);
    };

    return { shouldShowTour, setShouldShowTour, resetTour };
}
