// src/components/breathing/MindfulnessExercise.jsx
// Chú thích: Bài tập Chánh niệm 5-4-3-2-1 (Grounding Technique)
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Eye, Hand, Ear, Wind as Nose, Coffee, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';

// 5-4-3-2-1 Grounding Steps
const GROUNDING_STEPS = [
    {
        id: 5,
        sense: 'Nhìn',
        icon: Eye,
        color: 'from-blue-500 to-cyan-500',
        instruction: 'Quan sát 5 thứ bạn NHÌN thấy xung quanh',
        examples: ['Bầu trời', 'Cây cối', 'Đồ vật trên bàn', 'Màu sắc', 'Ánh sáng'],
        emoji: '👀',
    },
    {
        id: 4,
        sense: 'Chạm',
        icon: Hand,
        color: 'from-green-500 to-teal-500',
        instruction: 'Chạm vào 4 thứ bạn CẢM NHẬN được',
        examples: ['Quần áo', 'Ghế ngồi', 'Bàn phím', 'Tóc'],
        emoji: '✋',
    },
    {
        id: 3,
        sense: 'Nghe',
        icon: Ear,
        color: 'from-purple-500 to-indigo-500',
        instruction: 'Lắng nghe 3 ÂM THANH xung quanh',
        examples: ['Tiếng gió', 'Tiếng xe', 'Nhạc', 'Tiếng nói'],
        emoji: '👂',
    },
    {
        id: 2,
        sense: 'Ngửi',
        icon: Nose,
        color: 'from-orange-500 to-amber-500',
        instruction: 'Ngửi 2 MÙI HƯƠNG',
        examples: ['Không khí', 'Nước hoa', 'Thức ăn', 'Cây cối'],
        emoji: '👃',
    },
    {
        id: 1,
        sense: 'Nếm',
        icon: Coffee,
        color: 'from-pink-500 to-rose-500',
        instruction: 'Nếm 1 VỊ (hoặc uống nước)',
        examples: ['Nước', 'Trà', 'Kẹo', 'Trái cây'],
        emoji: '👅',
    },
];

export default function MindfulnessExercise({ onComplete }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [checkedItems, setCheckedItems] = useState({});
    const [completed, setCompleted] = useState(false);

    const step = GROUNDING_STEPS[currentStep];
    const totalSteps = GROUNDING_STEPS.length;

    const startExercise = () => {
        setIsActive(true);
        setCurrentStep(0);
        setCheckedItems({});
        setCompleted(false);
    };

    const toggleCheck = (stepId, idx) => {
        const key = `${stepId}-${idx}`;
        setCheckedItems(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const getCheckedCount = (stepId) => {
        return Object.keys(checkedItems).filter(k => k.startsWith(`${stepId}-`) && checkedItems[k]).length;
    };

    const canProceed = () => {
        return getCheckedCount(step.id) >= step.id;
    };

    const nextStep = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            setCompleted(true);
            setIsActive(false);
            if (onComplete) onComplete();
        }
    };

    const reset = () => {
        setIsActive(false);
        setCurrentStep(0);
        setCheckedItems({});
        setCompleted(false);
    };

    if (!isActive && !completed) {
        return (
            <Card variant="glass" className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h3 className="font-bold text-lg text-[--text] mb-2">
                    Bài tập Chánh niệm 5-4-3-2-1
                </h3>
                <p className="text-[--muted] text-sm mb-4 max-w-md mx-auto">
                    Kỹ thuật "grounding" giúp bạn bình tĩnh khi lo lắng hoặc căng thẳng bằng cách tập trung vào 5 giác quan.
                </p>
                <Button onClick={startExercise} variant="primary" size="lg">
                    🧘 Bắt đầu bài tập
                </Button>
                <p className="text-[--muted] text-xs mt-3">
                    Thời gian: 3-5 phút
                </p>
            </Card>
        );
    }

    if (completed) {
        return (
            <Card variant="glass" className="text-center py-8">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-teal-400 flex items-center justify-center"
                >
                    <CheckCircle2 className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="font-bold text-lg text-[--text] mb-2">
                    Tuyệt vời! 🎉
                </h3>
                <p className="text-[--muted] text-sm mb-4">
                    Bạn đã hoàn thành bài tập chánh niệm. Giờ bạn cảm thấy thế nào?
                </p>
                <div className="flex justify-center gap-3">
                    <Button onClick={reset} variant="ghost" icon={<RotateCcw size={16} />}>
                        Làm lại
                    </Button>
                </div>
            </Card>
        );
    }

    const Icon = step.icon;

    return (
        <Card variant="glass" className="py-6">
            {/* Progress */}
            <div className="flex justify-center gap-2 mb-6">
                {GROUNDING_STEPS.map((s, idx) => (
                    <div
                        key={s.id}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${idx < currentStep
                                ? 'bg-green-500 text-white'
                                : idx === currentStep
                                    ? `bg-gradient-to-br ${step.color} text-white`
                                    : 'bg-[--surface-border] text-[--muted]'
                            }`}
                    >
                        {idx < currentStep ? '✓' : s.id}
                    </div>
                ))}
            </div>

            {/* Current Step */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="text-center"
                >
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center`}>
                        <Icon className="w-8 h-8 text-white" />
                    </div>

                    <div className="text-4xl mb-2">{step.emoji}</div>

                    <h3 className="font-bold text-lg text-[--text] mb-2">
                        {step.sense} {step.id} thứ
                    </h3>

                    <p className="text-[--muted] text-sm mb-4">
                        {step.instruction}
                    </p>

                    {/* Checkboxes */}
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                        {Array.from({ length: step.id }).map((_, idx) => {
                            const isChecked = checkedItems[`${step.id}-${idx}`];
                            return (
                                <motion.button
                                    key={idx}
                                    onClick={() => toggleCheck(step.id, idx)}
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold transition-all ${isChecked
                                            ? `bg-gradient-to-br ${step.color} text-white`
                                            : 'bg-[--surface-border] text-[--muted] hover:bg-[--surface]'
                                        }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {isChecked ? '✓' : idx + 1}
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Examples */}
                    <p className="text-[--muted] text-xs mb-4">
                        Ví dụ: {step.examples.slice(0, 3).join(', ')}...
                    </p>

                    {/* Progress info */}
                    <p className="text-sm text-[--muted] mb-4">
                        Đã chọn: {getCheckedCount(step.id)}/{step.id}
                    </p>

                    {/* Next button */}
                    <Button
                        onClick={nextStep}
                        variant="primary"
                        disabled={!canProceed()}
                    >
                        {currentStep < totalSteps - 1 ? 'Tiếp theo →' : 'Hoàn thành 🎉'}
                    </Button>
                </motion.div>
            </AnimatePresence>
        </Card>
    );
}
