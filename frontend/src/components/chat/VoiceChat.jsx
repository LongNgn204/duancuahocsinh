// src/components/chat/VoiceChat.jsx
// Chú thích: VoiceChat v4.0 - Sử dụng Web Speech API (browser-native)
// STT: SpeechRecognition (vi-VN)
// TTS: DISABLED - sẽ thêm audio sau
// LLM: OpenAI ChatGPT qua backend
// SOS: Phát hiện từ khóa tiêu cực và hiện cảnh báo khẩn cấp
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceAgentCF } from '../../hooks/useVoiceAgentCF';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import SOSOverlay from '../sos/SOSOverlay';
import {
    Mic, MicOff, Volume2, VolumeX,
    MessageCircle, AlertCircle, Sparkles, Send, X,
    Waves, Heart, Loader2
} from 'lucide-react';

// Animated rings component cho voice visualization
function VoiceRings({ isActive, color = 'brand' }) {
    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[...Array(3)].map((_, i) => (
                <motion.div
                    key={i}
                    className={`absolute rounded-full border-2 ${color === 'brand' ? 'border-[--brand]/30' :
                        color === 'success' ? 'border-green-400/30' :
                            color === 'thinking' ? 'border-amber-400/30' :
                                'border-red-400/30'
                        }`}
                    initial={{ width: 128, height: 128, opacity: 0 }}
                    animate={isActive ? {
                        width: [128, 200 + i * 40],
                        height: [128, 200 + i * 40],
                        opacity: [0.6, 0],
                    } : { opacity: 0 }}
                    transition={{
                        duration: 2,
                        delay: i * 0.4,
                        repeat: isActive ? Infinity : 0,
                        ease: 'easeOut'
                    }}
                />
            ))}
        </div>
    );
}

// Real-time audio visualizer với Web Audio API
function AudioBars({ isActive, audioLevel = 0 }) {
    const bars = 12;
    const barHeights = Array.from({ length: bars }, (_, i) => {
        if (!isActive) return 8;
        // Tạo pattern sóng dựa trên audioLevel và index
        const baseHeight = 8 + (audioLevel * 40);
        const wave = Math.sin((Date.now() / 200) + (i * 0.5)) * 8;
        return Math.max(8, Math.min(48, baseHeight + wave));
    });

    return (
        <div className="flex items-center justify-center gap-0.5 h-12">
            {barHeights.map((height, i) => (
                <motion.div
                    key={i}
                    className="w-1.5 bg-white/90 rounded-full"
                    animate={isActive ? {
                        height: height,
                    } : { height: 8 }}
                    transition={{
                        duration: 0.1,
                        ease: 'easeOut'
                    }}
                />
            ))}
        </div>
    );
}

export default function VoiceChat() {
    // ==========================================================
    // SOS STATE - Quan trọng: Phát hiện và hiện cảnh báo khẩn cấp
    // ==========================================================
    const [showSOS, setShowSOS] = useState(false);
    const [sosLevel, setSosLevel] = useState(null);

    // Callback khi phát hiện SOS từ voice input
    const handleSOS = useCallback((level, message) => {
        console.log('[VoiceChat] SOS DETECTED:', level);
        setSosLevel(level);
        setShowSOS(true);
    }, []);

    const {
        status,           // 'idle' | 'listening' | 'thinking' | 'speaking'
        transcript,
        response,
        error,
        isSupported,
        startListening,
        stopListening,
        stopSpeaking,
        stop,
        speak,
        sosDetected,
        clearSOS,
    } = useVoiceAgentCF({ onSOS: handleSOS });

    const [textInput, setTextInput] = useState('');
    const [showTextInput, setShowTextInput] = useState(false);
    const [displayedResponse, setDisplayedResponse] = useState('');
    const [audioLevel, setAudioLevel] = useState(0);
    const [isHolding, setIsHolding] = useState(false);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const animationFrameRef = useRef(null);

    // Tự động hiện SOS overlay khi hook phát hiện
    useEffect(() => {
        if (sosDetected && sosDetected.level) {
            setSosLevel(sosDetected.level);
            setShowSOS(true);
        }
    }, [sosDetected]);

    // Sync response to displayed response
    useEffect(() => {
        setDisplayedResponse(response);
    }, [response]);

    // Setup audio visualization khi listening
    useEffect(() => {
        if (status === 'listening' && isSupported) {
            // Khởi tạo Web Audio API để visualize
            const setupAudioVisualization = async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const analyser = audioContext.createAnalyser();
                    const microphone = audioContext.createMediaStreamSource(stream);

                    analyser.fftSize = 256;
                    analyser.smoothingTimeConstant = 0.8;
                    microphone.connect(analyser);

                    audioContextRef.current = audioContext;
                    analyserRef.current = analyser;

                    // Update audio level
                    const dataArray = new Uint8Array(analyser.frequencyBinCount);
                    const updateLevel = () => {
                        if (analyserRef.current && status === 'listening') {
                            analyserRef.current.getByteFrequencyData(dataArray);
                            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                            setAudioLevel(average / 255);
                            animationFrameRef.current = requestAnimationFrame(updateLevel);
                        }
                    };
                    updateLevel();
                } catch (err) {
                    console.warn('[VoiceChat] Audio visualization setup failed:', err);
                }
            };

            setupAudioVisualization();
        } else {
            // Cleanup
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close().catch(() => { });
            }
            audioContextRef.current = null;
            setAudioLevel(0);
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close().catch(() => { });
            }
            audioContextRef.current = null;
        };
    }, [status, isSupported]);

    // Handle toggle listening
    const handleToggleListening = () => {
        if (status === 'listening') {
            stopListening();
        } else if (status === 'idle') {
            startListening();
        }
    };

    // Handle stop speaking
    const handleStopSpeaking = () => {
        stopSpeaking();
    };

    // Handle send text manually (nếu muốn gõ thay vì nói)
    const handleSendText = (e) => {
        e.preventDefault();
        if (!textInput.trim()) return;
        // For text input, we can call the speak function with the response
        // But for now, redirect to the main chat page for text input
        // Or implement text-to-LLM call here
        setTextInput('');
    };

    // Clear conversation
    const clearConversation = () => {
        stop();
        setDisplayedResponse('');
    };

    // Get current state info
    const getStateInfo = () => {
        switch (status) {
            case 'listening':
                return { text: 'Đang lắng nghe...', color: 'brand', description: 'Hãy nói điều bạn đang nghĩ' };
            case 'thinking':
                return { text: 'Đang suy nghĩ...', color: 'thinking', description: 'AI đang xử lý câu hỏi của bạn' };
            case 'speaking':
                return { text: 'Đang trả lời...', color: 'success', description: 'AI đang phản hồi bạn' };
            default:
                return { text: 'Nhấn để nói', color: 'muted', description: 'Nhấn nút microphone để bắt đầu' };
        }
    };

    const stateInfo = getStateInfo();
    const isActive = status !== 'idle';
    const isListening = status === 'listening';
    const isThinking = status === 'thinking';
    const isSpeaking = status === 'speaking';

    return (
        <div className="min-h-[60vh] flex flex-col">
            {/* =========================================================== */}
            {/* SOS OVERLAY - Hiển thị khi phát hiện từ khóa tiêu cực */}
            {/* =========================================================== */}
            <SOSOverlay
                isOpen={showSOS}
                onClose={() => {
                    setShowSOS(false);
                    setSosLevel(null);
                    clearSOS();
                }}
                riskLevel={sosLevel || 'high'}
                triggerText={transcript}
            />

            {/* Warning nếu browser không hỗ trợ */}
            {!isSupported && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4"
                >
                    <Card className="bg-amber-50 border border-amber-200">
                        <div className="flex items-center gap-3">
                            <AlertCircle size={20} className="text-amber-600 shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-amber-800">
                                    Trình duyệt không hỗ trợ Web Speech API
                                </p>
                                <p className="text-xs text-amber-600">
                                    Vui lòng sử dụng Chrome hoặc Edge để dùng tính năng Voice Chat.
                                </p>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Error alert */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-4"
                    >
                        <Card className="bg-red-50 border border-red-200">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 text-red-600">
                                    <AlertCircle size={20} />
                                    <span className="text-sm font-medium">{error}</span>
                                </div>
                                <button onClick={stop} className="text-red-400 hover:text-red-600">
                                    <X size={18} />
                                </button>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Voice Interface */}
            <div className="flex-1 flex flex-col items-center justify-center py-8">
                {/* Floating particles background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-full bg-[--brand]/20"
                            style={{
                                left: `${20 + i * 15}%`,
                                top: `${30 + (i % 3) * 20}%`,
                            }}
                            animate={{
                                y: [0, -30, 0],
                                opacity: [0.3, 0.6, 0.3],
                            }}
                            transition={{
                                duration: 3 + i * 0.5,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: i * 0.3
                            }}
                        />
                    ))}
                </div>

                {/* Status Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Badge
                        variant={isActive ? 'primary' : 'default'}
                        className="px-4 py-2 text-sm"
                    >
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                            }`} />
                        {isActive ? 'Đang hoạt động' : 'Sẵn sàng'}
                    </Badge>
                </motion.div>

                {/* Main Voice Button */}
                <div className="relative mb-8">
                    <VoiceRings
                        isActive={isActive}
                        color={isListening ? 'brand' : isThinking ? 'thinking' : isSpeaking ? 'success' : 'brand'}
                    />

                    <motion.button
                        onClick={isSpeaking ? handleStopSpeaking : handleToggleListening}
                        onTouchStart={(e) => {
                            if (!isSupported || isThinking) return;
                            setIsHolding(true);
                            if (status === 'idle') {
                                startListening();
                            }
                        }}
                        onTouchEnd={(e) => {
                            setIsHolding(false);
                            if (status === 'listening') {
                                stopListening();
                            }
                        }}
                        onMouseDown={(e) => {
                            if (!isSupported || isThinking) return;
                            if (status === 'idle' && e.button === 0) {
                                setIsHolding(true);
                                startListening();
                            }
                        }}
                        onMouseUp={(e) => {
                            setIsHolding(false);
                            if (status === 'listening') {
                                stopListening();
                            }
                        }}
                        onMouseLeave={() => {
                            setIsHolding(false);
                            if (status === 'listening') {
                                stopListening();
                            }
                        }}
                        disabled={!isSupported || isThinking}
                        className={`
                            relative z-10 w-36 h-36 rounded-full 
                            flex flex-col items-center justify-center gap-2
                            shadow-2xl transition-all duration-300
                            disabled:opacity-70 disabled:cursor-not-allowed
                            touch-target
                            ${isListening || isHolding
                                ? 'bg-gradient-to-br from-red-500 to-rose-600 scale-110'
                                : isThinking
                                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 animate-pulse'
                                    : isSpeaking
                                        ? 'bg-gradient-to-br from-[--brand] to-[--secondary]'
                                        : 'bg-gradient-to-br from-green-500 to-emerald-600 hover:scale-105'
                            }
                        `}
                        whileTap={{ scale: 0.95 }}
                    >
                        {isThinking ? (
                            <>
                                <Loader2 className="w-10 h-10 text-white animate-spin" />
                                <span className="text-white/80 text-xs font-medium">Đang xử lý</span>
                            </>
                        ) : isSpeaking ? (
                            <>
                                <AudioBars isActive={true} audioLevel={0.5} />
                                <span className="text-white/80 text-xs font-medium">Dừng</span>
                            </>
                        ) : isListening ? (
                            <>
                                <AudioBars isActive={true} audioLevel={audioLevel} />
                                <span className="text-white/80 text-xs font-medium">
                                    {isHolding ? 'Giữ để nói' : 'Đang nghe...'}
                                </span>
                            </>
                        ) : (
                            <>
                                <Mic className="w-10 h-10 text-white" />
                                <span className="text-white/80 text-xs font-medium">
                                    {isHolding ? 'Giữ để nói' : 'Nhấn hoặc giữ'}
                                </span>
                            </>
                        )}
                    </motion.button>
                </div>

                {/* State description */}
                <motion.div
                    className="text-center mb-6"
                    key={stateInfo.text}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <p className="text-lg font-medium text-[--text] mb-1">
                        {stateInfo.text}
                    </p>
                    <p className="text-sm text-[--muted]">
                        {stateInfo.description}
                    </p>
                </motion.div>

                {/* Stop button when active */}
                {isActive && !isListening && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={stop}
                            icon={<X size={16} />}
                            className="text-red-500 hover:bg-red-50"
                        >
                            Dừng tất cả
                        </Button>
                    </motion.div>
                )}
            </div>

            {/* Transcript & Response area */}
            <AnimatePresence>
                {(transcript || displayedResponse) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="max-w-2xl mx-auto w-full"
                    >
                        <Card variant="elevated" className="relative overflow-hidden">
                            {/* Gradient top border */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[--brand] via-[--secondary] to-[--accent]" />

                            <div className="space-y-4 pt-2">
                                {transcript && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[--brand] to-[--brand-light] flex items-center justify-center shrink-0">
                                            <span className="text-sm">🧑</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-[--muted] mb-1">Bạn nói</p>
                                            <p className="text-sm text-[--text]">{transcript}</p>
                                        </div>
                                    </div>
                                )}

                                {displayedResponse && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[--secondary] to-[--accent] flex items-center justify-center shrink-0">
                                            <Sparkles className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-[--muted] mb-1">Bạn Đồng Hành</p>
                                            <p className="text-sm text-[--text] whitespace-pre-wrap leading-relaxed">{displayedResponse}</p>
                                        </div>
                                        {/* TTS control */}
                                        {isSpeaking ? (
                                            <button
                                                onClick={handleStopSpeaking}
                                                className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                                                title="Dừng đọc"
                                            >
                                                <VolumeX size={16} />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => speak(displayedResponse)}
                                                className="p-2 rounded-full bg-[--brand]/10 text-[--brand] hover:bg-[--brand]/20"
                                                title="Đọc lại"
                                            >
                                                <Volume2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-3 border-t border-[--surface-border] flex justify-end">
                                <Button variant="ghost" size="sm" onClick={clearConversation}>
                                    Xóa hội thoại
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Text input toggle */}
            <div className="mt-6 max-w-2xl mx-auto w-full">
                <Card variant="default" size="sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[--muted]">
                            <MessageCircle size={16} />
                            <span className="text-sm">Muốn gõ thay vì nói?</span>
                        </div>
                        <a
                            href="/chat"
                            className="text-sm text-[--brand] hover:underline font-medium"
                        >
                            Mở chat văn bản
                        </a>
                    </div>
                </Card>
            </div>

            {/* Tips */}
            <div className="mt-6 max-w-2xl mx-auto w-full">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-[--brand]/5 to-[--secondary]/5 border border-[--brand]/10">
                    <Heart className="w-5 h-5 text-[--brand] shrink-0" />
                    <p className="text-sm text-[--text-secondary]">
                        <span className="font-medium text-[--text]">Mẹo:</span> Nói tự nhiên như đang tâm sự với bạn bè.
                        Trên mobile, bạn có thể giữ nút để nói, thả ra để gửi. AI sẽ lắng nghe và đáp lại.
                    </p>
                </div>
            </div>
        </div>
    );
}
