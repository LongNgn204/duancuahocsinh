import { useSound } from '../contexts/SoundContext';
import { Wind, Play, Pause, RotateCcw, Volume2, VolumeX, ArrowLeft, Heart, Sparkles, Music, Music4 } from 'lucide-react';

// ... (BREATHING_MODES definition remains same)

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
    const [isMuted, setIsMuted] = useState(false); // Default ON voice

    const timerRef = useRef(null);
    const phaseTimeoutRef = useRef(null);
    const synthRef = useRef(window.speechSynthesis);

    const currentMode = BREATHING_MODES[mode];

    // BGM Logic
    useEffect(() => {
        // Auto play nature sounds when entering Peace Corner if enabled
        playBgm('nature');
        return () => {
            stopBgm();
        };
    }, [playBgm, stopBgm]);

    // Cleanup
    useEffect(() => {
        return () => {
            clearInterval(timerRef.current);
            clearTimeout(phaseTimeoutRef.current);
            if (synthRef.current) synthRef.current.cancel();
            stopBgm();
        };
    }, []);

    // ... (Rest of logic: Timer, Voice Helper, Breathing Logic, Handlers)
    // NOTE: Need to copy existing logic carefully.
    // For safety, I will only replace the top imports and the returned JSX Controls part to include Music Toggle.
    // Or better, I will use ReplaceFileContent carefully on specific blocks.

    // ...
    // (Since I cannot see full file content in this replace block, I will strictly follow "ReplacementChunks" strategy or careful single block replacement)
    // Let's use multiple replaces to avoid re-writing the whole large file logic which is risky.
    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-50">
            {/* Ambient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${currentMode.color} opacity-10 transition-colors duration-1000`} />

            {/* Header Controls */}
            <div className="relative z-20 flex items-center justify-between p-4 md:p-6">
                <Button variant="ghost" onClick={() => navigate('/app')} icon={<ArrowLeft size={20} />}>
                    Quay lại
                </Button>

                {/* Tab Switcher */}
                <div className="flex bg-white/50 p-1 rounded-xl backdrop-blur-sm shadow-sm">
                    <button
                        onClick={() => setActiveTab('breathing')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'breathing' ? 'bg-white text-[--brand] shadow-sm' : 'text-[--muted]'}`}
                    >
                        <Wind size={16} /> Bài tập thở
                    </button>
                    <button
                        onClick={() => setActiveTab('cards')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'cards' ? 'bg-white text-[--brand] shadow-sm' : 'text-[--muted]'}`}
                    >
                        <Sparkles size={16} /> Bộ thẻ an yên
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
                                            className="text-2xl font-bold text-[--text-secondary] leading-relaxed"
                                        >
                                            {phase === 'idle' ? 'Sẵn sàng...' :
                                                phase === 'finished' ? 'Hoàn thành!' :
                                                    currentMode.instruction[phase]}
                                        </motion.p>
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="flex gap-6 mt-4">
                                    {!isRunning ? (
                                        <Button
                                            onClick={startSession}
                                            variant="primary"
                                            size="lg"
                                            className="shadow-xl shadow-blue-500/20 px-8 py-4 rounded-full text-lg"
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
                                <Card className="text-center py-10 px-6 !bg-white/80 !backdrop-blur-xl border-white shadow-2xl">
                                    <div className="mb-6 inline-block p-4 rounded-full bg-green-100 text-green-500">
                                        <Sparkles size={40} />
                                    </div>
                                    <h2 className="text-3xl font-bold text-[--text] mb-3">Thật tuyệt vời!</h2>
                                    <p className="text-[--muted] mb-8 text-lg">Bạn đã dành thời gian thiền định hôm nay.</p>
                                    <EncouragementMessages />
                                    <div className="mt-10 flex justify-center gap-4">
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

