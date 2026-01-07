// src/pages/PeaceCorner.jsx
// Chú thích: Góc An Yên v3.0 - Bài tập thở + Bài tập giác quan + Thanh kéo thời gian
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '../contexts/SoundContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Wind, Play, Pause, RotateCcw, Volume2, VolumeX, ArrowLeft, Sparkles, Music, Music4, Eye, Hand, Ear, TreePine as Nose, Cherry } from 'lucide-react';
import EncouragementMessages from '../components/breathing/EncouragementMessages';
import PeaceCardDeck from '../components/breathing/PeaceCardDeck';

// Chú thích: Các mức thời gian có thể chọn (giây)
const DURATION_OPTIONS = [60, 120, 180];

// Chú thích: Bài tập "Chạm vào hiện tại" - 5-4-3-2-1 grounding exercise
const GROUNDING_STEPS = [
    { number: 5, sense: 'THẤY', emoji: '👀', icon: Eye, examples: 'cái bàn, cây bút, bức tranh, cửa sổ, chiếc lá', color: 'bg-yellow-100 border-yellow-300' },
    { number: 4, sense: 'CHẠM', emoji: '✋', icon: Hand, examples: 'mặt bàn láng mịn, vải quần jean, làn gió mát, ly nước lạnh', color: 'bg-orange-100 border-orange-300' },
    { number: 3, sense: 'NGHE', emoji: '👂', icon: Ear, examples: 'tiếng quạt quay, xe chạy ngoài đường, chim hót', color: 'bg-green-100 border-green-300' },
    { number: 2, sense: 'NGỬI', emoji: '👃', icon: Nose, examples: 'mùi cà phê, mùi sách cũ, mùi cỏ cây sau mưa', color: 'bg-blue-100 border-blue-300' },
    { number: 1, sense: 'NẾM', emoji: '👅', icon: Cherry, examples: 'vị ngọt của trà, vị thanh của nước lọc', color: 'bg-purple-100 border-purple-300' },
];

// Chú thích: Bài tập "Ô cửa thần kỳ" - observation exercise
const WINDOW_STEPS = [
    { step: 1, text: 'Hãy dành một phút nhìn ra ngoài cửa sổ hoặc xung quanh bạn' },
    { step: 2, text: 'Đừng cố gắng đặt tên cho những gì bạn thấy' },
    { step: 3, text: 'Chỉ cần chú ý đến màu sắc, hình dạng và sự chuyển động' },
    { step: 4, text: 'Hãy nhìn mọi thứ như thể bạn đang thấy chúng lần đầu tiên' },
    { step: 5, text: 'Cảm nhận sự kỳ diệu trong những điều đơn giản' },
];

// Chú thích: Cấu hình các bài tập - duration được tính động
const EXERCISE_MODES = {
    magicBubble: {
        id: 'magicBubble',
        label: 'Bong bóng nhiệm màu',
        emoji: '🫧',
        type: 'breathing',
        color: 'from-blue-400 to-cyan-300',
        // Thời gian cố định cho 1 chu kỳ thở
        inhaleTime: 4000,
        holdTime: 2000,
        exhaleTime: 4000,
        instruction: {
            inhale: 'Hít vào... thầm đếm 1-2-3-4',
            hold: 'Giữ lại... 1-2',
            exhale: 'Thở ra... nhẹ nhàng 1-2-3-4',
        }
    },
    grounding: {
        id: 'grounding',
        label: 'Chạm vào hiện tại',
        emoji: '👋',
        type: 'grounding', // 5 bước, thời gian mỗi bước = totalDuration / 5
        color: 'from-amber-400 to-orange-300',
        description: 'Bài tập 5-4-3-2-1 giúp bạn tập trung vào thời điểm hiện tại bằng cách sử dụng các giác quan.',
    },
    magicWindow: {
        id: 'magicWindow',
        label: 'Ô cửa thần kỳ',
        emoji: '🖼️',
        type: 'observation', // 5 bước, thời gian mỗi bước = totalDuration / 5
        color: 'from-green-400 to-emerald-300',
        description: 'Bài tập quan sát rất đơn giản và thú vị! Bạn sẽ dành một phút để nhìn ra ngoài và thực hành quan sát không phán xét.',
    }
};

// Animation variants for bubble
const bubbleVariants = {
    idle: { scale: 1, opacity: 0.8 },
    inhale: { scale: 1.5, opacity: 1 },
    hold: { scale: 1.5, opacity: 1 },
    exhale: { scale: 1, opacity: 0.8 },
    finished: { scale: 0, opacity: 0 }
};

export default function PeaceCorner() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('breathing'); // 'breathing' | 'cards'

    // Sound Context
    const { playBgm, stopBgm, bgmEnabled, setBgmEnabled } = useSound();

    // Exercise State
    const [mode, setMode] = useState('magicBubble');
    const [duration, setDuration] = useState(60); // Chú thích: Thời gian mặc định 60s
    const [phase, setPhase] = useState('idle');
    const [timeLeft, setTimeLeft] = useState(60);
    const [isRunning, setIsRunning] = useState(false);
    const [showEncouragement, setShowEncouragement] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [currentStep, setCurrentStep] = useState(0); // Chú thích: Bước hiện tại cho grounding/observation

    const timerRef = useRef(null);
    const phaseTimeoutRef = useRef(null);
    const stepTimeoutRef = useRef(null);

    const currentMode = EXERCISE_MODES[mode];
    // Chú thích: Thời gian mỗi bước = tổng thời gian / 5
    const stepDuration = duration / 5;

    // BGM Logic
    useEffect(() => {
        if (bgmEnabled) {
            playBgm('nature');
        }
        return () => {
            stopBgm();
        };
    }, [playBgm, stopBgm, bgmEnabled]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearInterval(timerRef.current);
            clearTimeout(phaseTimeoutRef.current);
            clearTimeout(stepTimeoutRef.current);
            stopBgm();
        };
    }, [stopBgm]);

    // Timer logic
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        finishSession();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [isRunning, timeLeft]);

    // Chú thích: Logic cho bài tập BREATHING (Bong bóng nhiệm màu)
    useEffect(() => {
        if (!isRunning || phase === 'finished' || currentMode.type !== 'breathing') return;

        const runCycle = () => {
            setPhase('inhale');
            speak(currentMode.instruction.inhale);

            phaseTimeoutRef.current = setTimeout(() => {
                if (!isRunning) return;

                setPhase('hold');
                speak(currentMode.instruction.hold);

                phaseTimeoutRef.current = setTimeout(() => {
                    if (!isRunning) return;

                    setPhase('exhale');
                    speak(currentMode.instruction.exhale);

                    phaseTimeoutRef.current = setTimeout(() => {
                        if (isRunning) runCycle();
                    }, currentMode.exhaleTime);
                }, currentMode.holdTime);
            }, currentMode.inhaleTime);
        };

        if (phase === 'idle') {
            runCycle();
        }

        return () => clearTimeout(phaseTimeoutRef.current);
    }, [isRunning, currentMode, phase]);

    // Chú thích: Logic cho bài tập GROUNDING và OBSERVATION (5 bước)
    useEffect(() => {
        if (!isRunning || currentMode.type === 'breathing') return;

        const runSteps = () => {
            // Chạy qua 5 bước
            let step = 0;
            const runNextStep = () => {
                if (step >= 5 || !isRunning) return;

                setCurrentStep(step);

                // Đọc to hướng dẫn bước này
                if (currentMode.type === 'grounding') {
                    speak(`${GROUNDING_STEPS[step].number} thứ bạn có thể ${GROUNDING_STEPS[step].sense}`);
                } else {
                    speak(WINDOW_STEPS[step].text);
                }

                step++;
                if (step < 5) {
                    stepTimeoutRef.current = setTimeout(runNextStep, stepDuration * 1000);
                }
            };

            runNextStep();
        };

        if (phase === 'idle') {
            setPhase('running');
            runSteps();
        }

        return () => clearTimeout(stepTimeoutRef.current);
    }, [isRunning, currentMode, phase, stepDuration]);

    // TTS Helper - DISABLED (sẽ thêm audio sau)
    const speak = (text) => {
        // TTS disabled - chỉ log
        if (!isMuted) {
            console.log('[PeaceCorner] TTS disabled, text:', text?.substring(0, 50));
        }
    };

    const startSession = () => {
        setTimeLeft(duration);
        setCurrentStep(0);
        setIsRunning(true);
        setPhase('idle');
    };

    const pauseSession = () => {
        setIsRunning(false);
        clearTimeout(phaseTimeoutRef.current);
        clearTimeout(stepTimeoutRef.current);
        setPhase('idle');
    };

    const resetSession = () => {
        setIsRunning(false);
        clearTimeout(phaseTimeoutRef.current);
        clearTimeout(stepTimeoutRef.current);
        setPhase('idle');
        setTimeLeft(duration);
        setCurrentStep(0);
        setShowEncouragement(false);
    };

    const finishSession = () => {
        setIsRunning(false);
        setPhase('finished');
        clearTimeout(phaseTimeoutRef.current);
        clearTimeout(stepTimeoutRef.current);
        setTimeout(() => setShowEncouragement(true), 1000);
    };

    const handleModeChange = (newMode) => {
        setMode(newMode);
        setIsRunning(false);
        setPhase('idle');
        setTimeLeft(duration);
        setCurrentStep(0);
        setShowEncouragement(false);
    };

    const handleDurationChange = (newDuration) => {
        setDuration(newDuration);
        if (!isRunning) {
            setTimeLeft(newDuration);
        }
    };

    // Chú thích: Render nội dung bài tập phụ thuộc vào type
    const renderExerciseContent = () => {
        if (currentMode.type === 'breathing') {
            // Bong bóng nhiệm màu - giống như cũ
            return (
                <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center mb-16">
                    {/* Pulse Ring */}
                    <motion.div
                        animate={{
                            scale: phase === 'inhale' || phase === 'hold' ? 1.3 : 1,
                            opacity: phase === 'inhale' ? 0.2 : 0
                        }}
                        transition={{ duration: currentMode.inhaleTime / 1000 }}
                        className={`absolute w-full h-full rounded-full bg-gradient-to-br ${currentMode.color} blur-2xl`}
                    />

                    {/* Core Bubble */}
                    <motion.div
                        variants={bubbleVariants}
                        animate={phase}
                        transition={{
                            duration: phase === 'inhale' ? currentMode.inhaleTime / 1000 :
                                phase === 'exhale' ? currentMode.exhaleTime / 1000 : 0.5,
                            ease: "easeInOut"
                        }}
                        className={`w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br ${currentMode.color} shadow-2xl flex items-center justify-center relative z-10 border-4 border-white/20 backdrop-blur-sm`}
                    >
                        <div className="text-white text-center">
                            <div className="text-3xl md:text-4xl font-bold mb-1 font-mono">
                                {timeLeft}
                            </div>
                            <div className="text-[10px] opacity-80 uppercase tracking-widest font-semibold">
                                Giây
                            </div>
                        </div>
                    </motion.div>

                    {/* Instructions */}
                    <div className="absolute -bottom-20 text-center w-full px-4">
                        <motion.p
                            key={phase}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xl md:text-2xl font-bold text-slate-600 leading-relaxed"
                        >
                            {phase === 'idle' ? 'Sẵn sàng...' :
                                phase === 'finished' ? 'Hoàn thành!' :
                                    currentMode.instruction[phase] || ''}
                        </motion.p>
                    </div>
                </div>
            );
        }

        if (currentMode.type === 'grounding') {
            // Chú thích: Bài tập "Chạm vào hiện tại" - 5-4-3-2-1
            const step = GROUNDING_STEPS[currentStep] || GROUNDING_STEPS[0];
            const StepIcon = step.icon;

            return (
                <div className="w-full max-w-lg space-y-4">
                    {/* Timer */}
                    <div className="text-center mb-4">
                        <span className="text-4xl font-bold font-mono text-slate-700">{timeLeft}</span>
                        <span className="text-slate-500 ml-2">giây</span>
                    </div>

                    {/* Description */}
                    {!isRunning && (
                        <div className="bg-blue-50 rounded-xl p-4 text-blue-800 text-sm mb-4">
                            {currentMode.description}
                        </div>
                    )}

                    {/* Steps */}
                    <div className="space-y-3">
                        {GROUNDING_STEPS.map((s, idx) => (
                            <motion.div
                                key={s.number}
                                animate={{
                                    scale: isRunning && currentStep === idx ? 1.02 : 1,
                                    opacity: isRunning && currentStep !== idx ? 0.5 : 1
                                }}
                                className={`p-4 rounded-xl border-2 ${s.color} transition-all ${isRunning && currentStep === idx ? 'ring-2 ring-offset-2 ring-amber-400' : ''
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{s.emoji}</span>
                                    <div>
                                        <p className="font-bold text-slate-800">
                                            {s.number} thứ bạn có thể {s.sense}
                                        </p>
                                        <p className="text-sm text-slate-600">Ví dụ: {s.examples}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Completion message */}
                    {phase === 'finished' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center p-6 bg-gradient-to-r from-green-100 to-cyan-100 rounded-2xl"
                        >
                            <p className="text-lg font-bold text-green-700">
                                🎉 Tuyệt vời! Bạn đã kết nối thành công với hiện tại. Cảm nhận sự bình yên trong thời khắc này!
                            </p>
                        </motion.div>
                    )}
                </div>
            );
        }

        if (currentMode.type === 'observation') {
            // Chú thích: Bài tập "Ô cửa thần kỳ"
            const step = WINDOW_STEPS[currentStep] || WINDOW_STEPS[0];

            return (
                <div className="w-full max-w-lg space-y-4">
                    {/* Timer */}
                    <div className="text-center mb-4">
                        <span className="text-4xl font-bold font-mono text-slate-700">{timeLeft}</span>
                        <span className="text-slate-500 ml-2">giây</span>
                    </div>

                    {/* Description */}
                    {!isRunning && (
                        <div className="bg-green-50 rounded-xl p-4 text-green-800 text-sm mb-4">
                            {currentMode.description}
                        </div>
                    )}

                    {/* Detailed instructions */}
                    <div className="bg-amber-50 rounded-xl p-4 text-amber-900 text-sm">
                        <p className="font-medium mb-2">Hướng dẫn chi tiết:</p>
                        <ol className="list-decimal list-inside space-y-1 text-xs">
                            {WINDOW_STEPS.map((s, idx) => (
                                <li key={idx} className={isRunning && currentStep === idx ? 'font-bold text-amber-700' : ''}>
                                    {s.text}
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Current step highlight */}
                    {isRunning && (
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl p-6 text-white text-center shadow-lg"
                        >
                            <p className="text-lg font-bold">{step.text}</p>
                        </motion.div>
                    )}

                    {/* Start button content */}
                    {!isRunning && phase === 'idle' && (
                        <div className="text-center">
                            <p className="text-slate-500 mb-4">Nhấn nút để bắt đầu quan sát</p>
                        </div>
                    )}

                    {/* Completion message */}
                    {phase === 'finished' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center p-6 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl"
                        >
                            <p className="text-lg font-bold text-green-700">
                                🌟 Tuyệt vời! Bạn đã dành thời gian để quan sát và kết nối với thế giới xung quanh.
                            </p>
                        </motion.div>
                    )}
                </div>
            );
        }

        return null;
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-50">
            {/* Ambient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${currentMode.color} opacity-10 transition-colors duration-1000`} />

            {/* Header Controls */}
            <div className="relative z-20 flex items-center justify-between p-4 md:p-6 flex-wrap gap-2">
                <Button variant="ghost" onClick={() => navigate('/app')} icon={<ArrowLeft size={20} />}>
                    <span className="hidden sm:inline">Quay lại</span>
                </Button>

                {/* Tab Switcher */}
                <div className="flex bg-white/50 p-1 rounded-xl backdrop-blur-sm shadow-sm">
                    <button
                        onClick={() => setActiveTab('breathing')}
                        className={`px-3 py-2 sm:px-4 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'breathing' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500'}`}
                    >
                        <Wind size={16} /> <span className="hidden sm:inline">Bài tập</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('cards')}
                        className={`px-3 py-2 sm:px-4 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'cards' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500'}`}
                    >
                        <Sparkles size={16} /> <span className="hidden sm:inline">Bộ thẻ an yên</span>
                    </button>
                </div>

                {/* Sound Controls */}
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            const newState = !bgmEnabled;
                            setBgmEnabled(newState);
                            if (newState) playBgm('nature'); else stopBgm();
                        }}
                        title={bgmEnabled ? "Tắt nhạc nền" : "Bật nhạc nền"}
                        icon={bgmEnabled ? <Music size={20} className="text-emerald-500" /> : <Music4 size={20} />}
                        className={bgmEnabled ? "bg-emerald-50" : ""}
                    />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsMuted(!isMuted)}
                        title={isMuted ? "Bật giọng dẫn" : "Tắt giọng dẫn"}
                        icon={isMuted ? <VolumeX size={20} /> : <Volume2 size={20} className="text-violet-600" />}
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className="relative z-10 container mx-auto px-4 py-4 min-h-[80vh] flex flex-col items-center justify-center">

                {activeTab === 'breathing' ? (
                    <AnimatePresence mode="wait">
                        {!showEncouragement ? (
                            <motion.div
                                key="exercise-ui"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-full max-w-lg flex flex-col items-center"
                            >
                                {/* Chú thích: Thanh kéo thời gian */}
                                <div className="w-full mb-6 bg-white rounded-xl p-4 shadow-sm">
                                    <p className="text-xs text-slate-500 mb-2 text-center">Thời gian tập</p>
                                    <div className="flex justify-center gap-2">
                                        {DURATION_OPTIONS.map((d) => (
                                            <button
                                                key={d}
                                                onClick={() => handleDurationChange(d)}
                                                disabled={isRunning}
                                                className={`
                                                    px-4 py-2 rounded-lg text-sm font-medium transition-all
                                                    ${duration === d
                                                        ? 'bg-violet-600 text-white shadow-md'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                                                    ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}
                                                `}
                                            >
                                                {d}s
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Mode Selection */}
                                <div className="flex flex-wrap justify-center gap-2 mb-8">
                                    {Object.values(EXERCISE_MODES).map((m) => (
                                        <button
                                            key={m.id}
                                            onClick={() => handleModeChange(m.id)}
                                            disabled={isRunning}
                                            className={`
                                                px-3 py-2 rounded-xl text-sm font-medium transition-all border flex items-center gap-2
                                                ${mode === m.id
                                                    ? 'bg-violet-100 border-violet-300 text-violet-700 shadow-sm'
                                                    : 'bg-white/50 border-transparent text-slate-500 hover:bg-white'}
                                                ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}
                                            `}
                                        >
                                            <span className="text-lg">{m.emoji}</span>
                                            {m.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Exercise Content */}
                                {renderExerciseContent()}

                                {/* Controls */}
                                <div className="flex gap-4 sm:gap-6 mt-8">
                                    {!isRunning ? (
                                        <Button
                                            onClick={startSession}
                                            variant="primary"
                                            size="lg"
                                            className="shadow-xl shadow-violet-500/20 px-6 sm:px-8 py-4 rounded-full text-base sm:text-lg"
                                            icon={<Play size={24} fill="currentColor" />}
                                        >
                                            Bắt đầu
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={pauseSession}
                                            variant="outline"
                                            size="lg"
                                            className="bg-white/80 backdrop-blur-sm rounded-full"
                                            icon={<Pause size={24} />}
                                        >
                                            Tạm dừng
                                        </Button>
                                    )}

                                    <Button
                                        onClick={resetSession}
                                        variant="ghost"
                                        size="lg"
                                        className="rounded-full hover:bg-white/50"
                                        icon={<RotateCcw size={20} />}
                                        title="Làm lại"
                                    />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="encouragement"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full max-w-lg"
                            >
                                <Card className="text-center py-8 sm:py-10 px-4 sm:px-6 !bg-white/80 !backdrop-blur-xl border-white shadow-2xl">
                                    <div className="mb-6 inline-block p-4 rounded-full bg-green-100 text-green-500">
                                        <Sparkles size={40} />
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">Thật tuyệt vời!</h2>
                                    <p className="text-slate-500 mb-8 text-base sm:text-lg">Bạn đã hoàn thành bài tập hôm nay.</p>
                                    <EncouragementMessages />
                                    <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                                        <Button onClick={resetSession} variant="outline" icon={<RotateCcw size={18} />}>
                                            Tập tiếp
                                        </Button>
                                        <Button onClick={() => navigate('/app')} variant="primary">
                                            Về trang chủ
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                ) : (
                    // Cards Tab
                    <motion.div
                        key="cards-ui"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full flex-1"
                    >
                        <PeaceCardDeck />
                    </motion.div>
                )}
            </div>
        </div>
    );
}

