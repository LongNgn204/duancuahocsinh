// src/components/chat/VoiceChat.jsx
// Chú thích: VoiceChat v2.0 - Giao diện voice chat hiện đại với animations
// Sử dụng Gemini Live API qua WebSocket cho real-time voice
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGeminiVoice } from '../../hooks/useGeminiVoice';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import {
    Mic, MicOff, Phone, PhoneOff, Volume2,
    MessageCircle, AlertCircle, Sparkles, Send, X,
    Waves, Heart
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

// Audio visualizer bars
function AudioBars({ isActive }) {
    return (
        <div className="flex items-center justify-center gap-1 h-8">
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    className="w-1 bg-white/80 rounded-full"
                    animate={isActive ? {
                        height: [8, 24 + Math.random() * 16, 8],
                    } : { height: 8 }}
                    transition={{
                        duration: 0.5 + Math.random() * 0.3,
                        repeat: isActive ? Infinity : 0,
                        ease: 'easeInOut',
                        delay: i * 0.1
                    }}
                />
            ))}
        </div>
    );
}

export default function VoiceChat() {
    const {
        isConnected,
        isListening,
        isSpeaking,
        transcript,
        aiResponse,
        error,
        connectionStatus,
        hasApiKey,
        connect,
        disconnect,
        startListening,
        stopListening,
        sendText,
        clearError,
        clearResponse
    } = useGeminiVoice();

    const [textInput, setTextInput] = useState('');
    const [showTextInput, setShowTextInput] = useState(false);

    // Handle send text
    const handleSendText = (e) => {
        e.preventDefault();
        if (!textInput.trim()) return;
        sendText(textInput.trim());
        setTextInput('');
    };

    // Handle toggle listening
    const handleToggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    // Handle connect/disconnect
    const handleToggleConnection = () => {
        if (isConnected) {
            disconnect();
        } else {
            connect();
        }
    };

    // Get current state info
    const getStateInfo = () => {
        if (connectionStatus === 'connecting') return { text: 'Đang kết nối...', color: 'warning' };
        if (connectionStatus === 'error') return { text: 'Lỗi kết nối', color: 'error' };
        if (isSpeaking) return { text: 'AI đang trả lời...', color: 'secondary' };
        if (isListening) return { text: 'Đang lắng nghe bạn...', color: 'brand' };
        if (connectionStatus === 'ready') return { text: 'Sẵn sàng - Nhấn để nói', color: 'success' };
        if (isConnected) return { text: 'Đang khởi tạo...', color: 'warning' };
        return { text: 'Nhấn để kết nối', color: 'muted' };
    };

    const stateInfo = getStateInfo();

    // Check if ready to listen
    const isReady = connectionStatus === 'ready';


    if (!hasApiKey) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Card className="max-w-md text-center py-10 px-6">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center mb-6 shadow-xl"
                    >
                        <AlertCircle className="w-10 h-10 text-white" />
                    </motion.div>
                    <h3 className="font-bold text-xl mb-3 text-[--text]">Cần cấu hình API Key</h3>
                    <p className="text-[--muted] text-sm mb-6">
                        Để sử dụng Voice Chat, bạn cần thêm Gemini API Key vào file cấu hình.
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 text-left">
                        <code className="text-xs text-[--text] break-all">
                            VITE_GEMINI_API_KEY=your_api_key
                        </code>
                    </div>
                    <p className="text-xs text-[--muted] mt-4">
                        Lấy API key tại <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" className="text-[--brand] underline">Google AI Studio</a>
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-[60vh] flex flex-col">
            {/* Error alert */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-4"
                    >
                        <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                                    <AlertCircle size={20} />
                                    <span className="text-sm font-medium">{error}</span>
                                </div>
                                <button onClick={clearError} className="text-red-400 hover:text-red-600">
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
                        variant={isConnected ? (isListening ? 'primary' : 'success') : 'default'}
                        className="px-4 py-2 text-sm"
                    >
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                            }`} />
                        {isConnected ? 'Đã kết nối' : 'Chưa kết nối'}
                    </Badge>
                </motion.div>

                {/* Main Voice Button */}
                <div className="relative mb-8">
                    <VoiceRings
                        isActive={isListening || isSpeaking}
                        color={isListening ? 'brand' : isSpeaking ? 'success' : 'brand'}
                    />

                    <motion.button
                        onClick={isReady ? handleToggleListening : handleToggleConnection}
                        disabled={isSpeaking || connectionStatus === 'connecting'}
                        className={`
              relative z-10 w-36 h-36 rounded-full 
              flex flex-col items-center justify-center gap-2
              shadow-2xl transition-all duration-300
              disabled:opacity-70 disabled:cursor-not-allowed
              ${isListening
                                ? 'bg-gradient-to-br from-red-500 to-rose-600 scale-110'
                                : isSpeaking
                                    ? 'bg-gradient-to-br from-[--brand] to-[--secondary]'
                                    : connectionStatus === 'connecting'
                                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 animate-pulse'
                                        : isReady
                                            ? 'bg-gradient-to-br from-green-500 to-emerald-600 hover:scale-105'
                                            : 'bg-gradient-to-br from-gray-500 to-gray-600 hover:scale-105'
                            }
            `}
                        whileTap={{ scale: 0.95 }}
                    >
                        {connectionStatus === 'connecting' ? (
                            <>
                                <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                <span className="text-white/80 text-xs font-medium">Đang kết nối...</span>
                            </>
                        ) : isSpeaking ? (
                            <AudioBars isActive={true} />
                        ) : isListening ? (
                            <>
                                <MicOff className="w-10 h-10 text-white" />
                                <span className="text-white/80 text-xs font-medium">Dừng</span>
                            </>
                        ) : isReady ? (
                            <>
                                <Mic className="w-10 h-10 text-white" />
                                <span className="text-white/80 text-xs font-medium">Nói</span>
                            </>
                        ) : (
                            <>
                                <Phone className="w-10 h-10 text-white" />
                                <span className="text-white/80 text-xs font-medium">Kết nối</span>
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
                        {isSpeaking
                            ? 'AI đang phản hồi bạn'
                            : isListening
                                ? 'Hãy nói điều bạn đang nghĩ...'
                                : isConnected
                                    ? 'Nhấn nút microphone để bắt đầu nói'
                                    : 'Kết nối để bắt đầu trò chuyện với AI'
                        }
                    </p>
                </motion.div>

                {/* Disconnect button */}
                {isConnected && !isListening && !isSpeaking && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={disconnect}
                            icon={<PhoneOff size={16} />}
                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                            Ngắt kết nối
                        </Button>
                    </motion.div>
                )}
            </div>

            {/* Transcript & Response area */}
            <AnimatePresence>
                {(transcript || aiResponse) && (
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

                                {aiResponse && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[--secondary] to-[--accent] flex items-center justify-center shrink-0">
                                            <Sparkles className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-[--muted] mb-1">Bạn Đồng Hành</p>
                                            <p className="text-sm text-[--text] whitespace-pre-wrap leading-relaxed">{aiResponse}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-3 border-t border-[--surface-border] flex justify-end">
                                <Button variant="ghost" size="sm" onClick={clearResponse}>
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
                        <button
                            onClick={() => setShowTextInput(!showTextInput)}
                            className="text-sm text-[--brand] hover:underline font-medium"
                        >
                            {showTextInput ? 'Ẩn' : 'Mở chat'}
                        </button>
                    </div>

                    <AnimatePresence>
                        {showTextInput && (
                            <motion.form
                                onSubmit={handleSendText}
                                className="mt-4 flex gap-2"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <input
                                    type="text"
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    placeholder="Chia sẻ điều bạn đang nghĩ..."
                                    className="flex-1 px-4 py-3 rounded-xl bg-[--surface] border border-[--surface-border] text-[--text] placeholder:text-[--muted] outline-none focus:ring-2 focus:ring-[--brand]/50 transition-all"
                                    disabled={!isConnected}
                                />
                                <Button
                                    type="submit"
                                    disabled={!isConnected || !textInput.trim()}
                                    icon={<Send size={18} />}
                                    className="px-5"
                                >
                                    Gửi
                                </Button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </Card>
            </div>

            {/* Tips */}
            <div className="mt-6 max-w-2xl mx-auto w-full">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-[--brand]/5 to-[--secondary]/5 border border-[--brand]/10">
                    <Heart className="w-5 h-5 text-[--brand] shrink-0" />
                    <p className="text-sm text-[--text-secondary]">
                        <span className="font-medium text-[--text]">Mẹo:</span> Nói tự nhiên như đang tâm sự với bạn bè. AI sẽ lắng nghe và đáp lại bằng giọng nói.
                    </p>
                </div>
            </div>
        </div>
    );
}
