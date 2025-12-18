// src/components/breathing/BreathingBubble.jsx
// Chú thích: Breathing Bubble v2.0 - Bong bóng xanh 30s + Động viên
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Wind, Play, Pause, X, RotateCcw, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import EncouragementMessages from './EncouragementMessages';

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
        holdEmptyTime: 4000, // Box breathing
        instruction: {
            inhale: 'Hít vào...',
            hold: 'Giữ...',
            exhale: 'Thở ra...',
            holdEmpty: 'Giữ...'
        }
    }
};

export default function BreathingBubble() {
    const navigate = useNavigate();
    const [mode, setMode] = useState('blueBubble'); // Default mode
    const [phase, setPhase] = useState('idle'); // idle, inhale, hold, exhale, holdEmpty, finished
    const [timeLeft, setTimeLeft] = useState(BREATHING_MODES.blueBubble.duration);
    const [isRunning, setIsRunning] = useState(false);
    const [showEncouragement, setShowEncouragement] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    const timerRef = useRef(null);
    const phaseTimeoutRef = useRef(null);

    const currentMode = BREATHING_MODES[mode];

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearInterval(timerRef.current);
            clearTimeout(phaseTimeoutRef.current);
        };
    }, []);

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
    }, [isRunning, timeLeft]); // removed dependency on phases to simplify timer

    // Breathing Cycle Logic
    useEffect(() => {
        if (!isRunning || phase === 'finished') return;

        const runCycle = () => {
            // Inhale
            setPhase('inhale');
            playAudio('inhale');

            phaseTimeoutRef.current = setTimeout(() => {
                if (!isRunning) return;

                // Hold
                setPhase('hold');
                playAudio('hold');

                phaseTimeoutRef.current = setTimeout(() => {
                    if (!isRunning) return;

                    // Exhale
                    setPhase('exhale');
                    playAudio('exhale');

                    phaseTimeoutRef.current = setTimeout(() => {
                        if (!isRunning) return;

                        // Box breathing extra hold (optional)
                        if (currentMode.holdEmptyTime) {
                            setPhase('holdEmpty');
                            phaseTimeoutRef.current = setTimeout(() => {
                                if (isRunning) runCycle();
                            }, currentMode.holdEmptyTime);
                        } else {
                            // Loop back to inhale
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
    }, [isRunning, currentMode]); // Needs refinement to not stack loops, but simplified for now

    // TTS helper (mock)
    const playAudio = (p) => {
        if (isMuted) return;
        // In real app, play soft sounds or TTS
        // console.log(`Playing audio for phase: ${p}`);
    };

    const startSession = () => {
        setIsRunning(true);
        setPhase('idle'); // Will trigger effect
    };

    const pauseSession = () => {
        setIsRunning(false);
        clearTimeout(phaseTimeoutRef.current);
        setPhase('idle'); // Reset phase visual to neutral
    };

    const resetSession = () => {
        setIsRunning(false);
        clearTimeout(phaseTimeoutRef.current);
        setPhase('idle');
        setTimeLeft(currentMode.duration);
        setShowEncouragement(false);
    };

    const finishSession = () => {
        setIsRunning(false);
        setPhase('finished');
        clearTimeout(phaseTimeoutRef.current);
        setTimeout(() => setShowEncouragement(true), 1000);
    };

    const handleModeChange = (newMode) => {
        setMode(newMode);
        setIsRunning(false);
        setPhase('idle');
        setTimeLeft(BREATHING_MODES[newMode].duration);
        setShowEncouragement(false);
    };

    // Animation variants
    const bubbleVariants = {
        idle: { scale: 1, opacity: 0.8 },
        inhale: { scale: 1.5, opacity: 1 },
        hold: { scale: 1.5, opacity: 1 }, // Keep expanded
        exhale: { scale: 1, opacity: 0.8 },
        holdEmpty: { scale: 1, opacity: 0.8 },
        finished: { scale: 0, opacity: 0 }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className={`absolute inset-0 bg-gradient-to-br ${currentMode.color} opacity-10 transition-colors duration-1000`} />

            {/* Header controls */}
            <div className="absolute top-4 left-4 z-10">
                <Button variant="ghost" onClick={() => navigate(-1)} icon={<ArrowLeft size={20} />}>
                    Quay lại
                </Button>
            </div>

            <div className="absolute top-4 right-4 z-10 flex gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMuted(!isMuted)}
                    icon={isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                />
            </div>

            <AnimatePresence mode="wait">
                {!showEncouragement ? (
                    <motion.div
                        key="breathing-ui"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full max-w-md mx-auto relative z-10 flex flex-col items-center"
                    >
                        {/* Mode Selector */}
                        <div className="flex gap-2 mb-8 bg-white/50 p-1 rounded-xl backdrop-blur-sm">
                            {Object.values(BREATHING_MODES).map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => handleModeChange(m.id)}
                                    disabled={isRunning}
                                    className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${mode === m.id
                                            ? 'bg-white text-[--brand] shadow-sm'
                                            : 'text-[--muted] hover:text-[--text] disabled:opacity-50'}
                  `}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>

                        {/* Bubble Container */}
                        <div className="relative w-64 h-64 flex items-center justify-center mb-12">
                            {/* Outer Glow */}
                            <motion.div
                                animate={{
                                    scale: phase === 'inhale' || phase === 'hold' ? 1.2 : 1,
                                    opacity: phase === 'inhale' ? 0.3 : 0.1
                                }}
                                transition={{ duration: currentMode.inhaleTime / 1000 }}
                                className={`absolute w-full h-full rounded-full bg-gradient-to-br ${currentMode.color} blur-xl`}
                            />

                            {/* Main Bubble */}
                            <motion.div
                                variants={bubbleVariants}
                                animate={phase}
                                transition={{
                                    duration: phase === 'inhale' ? currentMode.inhaleTime / 1000 :
                                        phase === 'exhale' ? currentMode.exhaleTime / 1000 : 0.5,
                                    ease: "easeInOut"
                                }}
                                className={`w-32 h-32 rounded-full bg-gradient-to-br ${currentMode.color} shadow-lg flex items-center justify-center relative z-10`}
                            >
                                <div className="text-white text-center">
                                    <div className="text-3xl font-bold mb-1">
                                        {timeLeft}s
                                    </div>
                                    <div className="text-xs opacity-80 uppercase tracking-widest">
                                        {phase === 'idle' ? 'Ready' : phase}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Instruction Text */}
                            <div className="absolute -bottom-16 text-center w-full">
                                <motion.p
                                    key={phase}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-xl font-medium text-[--text]"
                                >
                                    {phase === 'idle' ? 'Sẵn sàng...' :
                                        phase === 'finished' ? 'Hoàn thành!' :
                                            currentMode.instruction[phase] || ''}
                                </motion.p>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex gap-4">
                            {!isRunning && !(phase === 'finished') && (
                                <Button
                                    onClick={startSession}
                                    variant="primary"
                                    size="lg"
                                    icon={<Play size={24} fill="currentColor" />}
                                    className="px-8"
                                >
                                    Bắt đầu
                                </Button>
                            )}

                            {isRunning && (
                                <Button
                                    onClick={pauseSession}
                                    variant="secondary"
                                    size="lg"
                                    icon={<Pause size={24} />}
                                >
                                    Tạm dừng
                                </Button>
                            )}

                            {(!isRunning && phase !== 'idle') && (
                                <Button
                                    onClick={resetSession}
                                    variant="ghost"
                                    icon={<RotateCcw size={20} />}
                                >
                                    Làm lại
                                </Button>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="encouragement"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-lg relative z-10"
                    >
                        <Card variant="glass" className="text-center py-8">
                            <h2 className="text-2xl font-bold text-[--text] mb-2">Thật tuyệt vời!</h2>
                            <p className="text-[--muted] mb-8">Bạn đã dành thời gian chăm sóc bản thân.</p>

                            <EncouragementMessages />

                            <div className="mt-8 flex justify-center gap-3">
                                <Button onClick={resetSession} variant="outline" icon={<RotateCcw size={16} />}>
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
        </div>
    );
}
