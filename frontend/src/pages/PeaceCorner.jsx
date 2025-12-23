// src/pages/PeaceCorner.jsx
// Chú thích: Góc An Yên - Bài tập thở và Bộ thẻ an yên
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '../contexts/SoundContext';
import { speak as geminiSpeak, stopSpeaking as geminiStop } from '../services/geminiTTS';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Wind, Play, Pause, RotateCcw, Volume2, VolumeX, ArrowLeft, Sparkles, Music, Music4 } from 'lucide-react';
import EncouragementMessages from '../components/breathing/EncouragementMessages';
import PeaceCardDeck from '../components/breathing/PeaceCardDeck';

// Breathing Modes Configuration
const BREATHING_MODES = {
    blueBubble: {
        id: 'blueBubble',
        label: 'Bong bóng xanh (30s)',
        color: 'from-blue-400 to-cyan-300',
        duration: 30,
        inhaleTime: 4000,
        holdTime: 2000,
        exhaleTime: 4000,
        instruction: {
            inhale: 'Hít vào... thầm đếm 1-2-3-4',
            hold: 'Giữ lại... 1-2',
            exhale: 'Thở ra... nhẹ nhàng 1-2-3-4',
        }
    },
    relax: {
        id: 'relax',
        label: 'Thư giãn sâu (4-7-8)',
        color: 'from-purple-400 to-indigo-300',
        duration: 60,
        inhaleTime: 4000,
        holdTime: 7000,
        exhaleTime: 8000,
        instruction: {
            inhale: 'Hít vào bằng mũi...',
            hold: 'Giữ hơi...',
            exhale: 'Thở ra bằng miệng...',
        }
    },
    balance: {
        id: 'balance',
        label: 'Cân bằng (4-4-4-4)',
        color: 'from-green-400 to-emerald-300',
        duration: 60,
        inhaleTime: 4000,
        holdTime: 4000,
        exhaleTime: 4000,
        holdEmptyTime: 4000,
        instruction: {
            inhale: 'Hít vào...',
            hold: 'Giữ...',
            exhale: 'Thở ra...',
            holdEmpty: 'Giữ...'
        }
    }
};

// Animation variants for bubble
const bubbleVariants = {
    idle: { scale: 1, opacity: 0.8 },
    inhale: { scale: 1.5, opacity: 1 },
    hold: { scale: 1.5, opacity: 1 },
    exhale: { scale: 1, opacity: 0.8 },
    holdEmpty: { scale: 1, opacity: 0.8 },
    finished: { scale: 0, opacity: 0 }
};

export default function PeaceCorner() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('breathing'); // 'breathing' | 'cards'

    // Sound Context
    const { playBgm, stopBgm, bgmEnabled, setBgmEnabled } = useSound();

    // Breathing State
    const [mode, setMode] = useState('blueBubble');
    const [phase, setPhase] = useState('idle');
    const [timeLeft, setTimeLeft] = useState(BREATHING_MODES.blueBubble.duration);
    const [isRunning, setIsRunning] = useState(false);
    const [showEncouragement, setShowEncouragement] = useState(false);
    const [isMuted, setIsMuted] = useState(true); // TTS đã tắt mặc định

    const timerRef = useRef(null);
    const phaseTimeoutRef = useRef(null);

    const currentMode = BREATHING_MODES[mode];

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
            geminiStop();
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

    // Breathing Cycle Logic
    useEffect(() => {
        if (!isRunning || phase === 'finished') return;

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
                        if (!isRunning) return;

                        if (currentMode.holdEmptyTime) {
                            setPhase('holdEmpty');
                            phaseTimeoutRef.current = setTimeout(() => {
                                if (isRunning) runCycle();
                            }, currentMode.holdEmptyTime);
                        } else {
                            if (isRunning) runCycle();
                        }
                    }, currentMode.exhaleTime);
                }, currentMode.holdTime);
            }, currentMode.inhaleTime);
        };

        if (phase === 'idle') {
            runCycle();
        }

        return () => clearTimeout(phaseTimeoutRef.current);
    }, [isRunning, currentMode]);

    // TTS Helper - using Gemini TTS with fallback
    const speak = (text) => {
        if (isMuted) return;
        // Use Gemini TTS with browser fallback
        geminiSpeak(text, { fallbackToBrowser: true }).catch(err => {
            console.error('[PeaceCorner] TTS error:', err);
        });
    };

    const startSession = () => {
        setIsRunning(true);
        setPhase('idle');
    };

    const pauseSession = () => {
        setIsRunning(false);
        clearTimeout(phaseTimeoutRef.current);
        setPhase('idle');
        geminiStop();
    };

    const resetSession = () => {
        setIsRunning(false);
        clearTimeout(phaseTimeoutRef.current);
        setPhase('idle');
        setTimeLeft(currentMode.duration);
        setShowEncouragement(false);
        geminiStop();
    };

    const finishSession = () => {
        setIsRunning(false);
        setPhase('finished');
        clearTimeout(phaseTimeoutRef.current);
        geminiStop();
        setTimeout(() => setShowEncouragement(true), 1000);
    };

    const handleModeChange = (newMode) => {
        setMode(newMode);
        setIsRunning(false);
        setPhase('idle');
        setTimeLeft(BREATHING_MODES[newMode].duration);
        setShowEncouragement(false);
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
                        className={`px-3 py-2 sm:px-4 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'breathing' ? 'bg-white text-[--brand] shadow-sm' : 'text-[--muted]'}`}
                    >
                        <Wind size={16} /> <span className="hidden sm:inline">Bài tập thở</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('cards')}
                        className={`px-3 py-2 sm:px-4 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'cards' ? 'bg-white text-[--brand] shadow-sm' : 'text-[--muted]'}`}
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
                        icon={isMuted ? <VolumeX size={20} /> : <Volume2 size={20} className="text-[--brand]" />}
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className="relative z-10 container mx-auto px-4 py-4 min-h-[80vh] flex flex-col items-center justify-center">

                {activeTab === 'breathing' ? (
                    <AnimatePresence mode="wait">
                        {!showEncouragement ? (
                            <motion.div
                                key="breathing-ui"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-full max-w-md flex flex-col items-center"
                            >
                                {/* Mode Selection */}
                                <div className="flex flex-wrap justify-center gap-2 mb-12">
                                    {Object.values(BREATHING_MODES).map((m) => (
                                        <button
                                            key={m.id}
                                            onClick={() => handleModeChange(m.id)}
                                            disabled={isRunning}
                                            className={`
                                                px-3 py-1.5 rounded-full text-xs font-medium transition-all border
                                                ${mode === m.id
                                                    ? 'bg-[--brand]/10 border-[--brand] text-[--brand]'
                                                    : 'bg-white/50 border-transparent text-[--muted] hover:bg-white'}
                                            `}
                                        >
                                            {m.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Bubble */}
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
                                            className="text-xl md:text-2xl font-bold text-[--text-secondary] leading-relaxed"
                                        >
                                            {phase === 'idle' ? 'Sẵn sàng...' :
                                                phase === 'finished' ? 'Hoàn thành!' :
                                                    currentMode.instruction[phase] || ''}
                                        </motion.p>
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="flex gap-4 sm:gap-6 mt-4">
                                    {!isRunning ? (
                                        <Button
                                            onClick={startSession}
                                            variant="primary"
                                            size="lg"
                                            className="shadow-xl shadow-blue-500/20 px-6 sm:px-8 py-4 rounded-full text-base sm:text-lg"
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
                                    <h2 className="text-2xl sm:text-3xl font-bold text-[--text] mb-3">Thật tuyệt vời!</h2>
                                    <p className="text-[--muted] mb-8 text-base sm:text-lg">Bạn đã dành thời gian thiền định hôm nay.</p>
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
