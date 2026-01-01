// src/components/voice/VoiceCallBot.jsx
// Voice Call Bot component - UI for real-time voice chat with Gemini AI
// Includes SOS detection for emergency support

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Mic, MicOff, Volume2 } from 'lucide-react';
import { useVoiceCall, formatDuration } from '../../hooks/useVoiceCall';
import { isLiveAPIAvailable, getVoiceCallDisabledMessage } from '../../services/geminiLive';
import SOSOverlay from '../sos/SOSOverlay';

/**
 * Voice wave animation component
 */
function VoiceWave({ isActive, color = '#6366f1' }) {
    return (
        <div className="flex items-center justify-center gap-1 h-16">
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    className="w-1.5 rounded-full"
                    style={{ backgroundColor: color }}
                    animate={isActive ? {
                        height: [16, 40, 16],
                        transition: {
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.1,
                            ease: 'easeInOut'
                        }
                    } : { height: 16 }}
                />
            ))}
        </div>
    );
}

/**
 * Call button component
 */
function CallButton({ onClick, isActive, disabled, children, variant = 'start' }) {
    const baseClass = "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg";
    const variants = {
        start: "bg-green-500 hover:bg-green-600 text-white",
        end: "bg-red-500 hover:bg-red-600 text-white",
        mute: isActive ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClass} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {children}
        </motion.button>
    );
}

/**
 * VoiceCallBot - Main voice call component
 */
export default function VoiceCallBot({ onClose }) {
    const [showSOSOverlay, setShowSOSOverlay] = useState(false);
    const [sosData, setSosData] = useState({ level: 'high', message: '' });

    const {
        status,
        error,
        duration,
        transcript,
        lastUserMessage,
        isMuted,
        isSupported,
        sosDetected,
        startCall,
        endCall,
        toggleMute,
        clearSOS
    } = useVoiceCall({
        onSOS: (level, message) => {
            console.log('[VoiceCallBot] SOS detected:', level);
            setSosData({ level, message });
            setShowSOSOverlay(true);
        }
    });

    // v2.0: Thêm status 'listening' cho Web Speech API STT
    const isCallActive = status === 'active' || status === 'speaking' || status === 'listening';
    const isConnecting = status === 'connecting';
    const isListening = (status === 'active' || status === 'listening') && !isMuted;

    // Status messages - cập nhật cho STT flow mới
    const statusMessage = {
        idle: 'Sẵn sàng gọi điện',
        connecting: 'Đang kết nối...',
        active: isMuted ? 'Đã tắt mic - Nhấn để bật lại' : 'Nói gì đó đi...',
        listening: 'Đang nghe bạn nói... 🎤',
        speaking: 'AI đang trả lời...',
        error: error || 'Có lỗi xảy ra'
    };

    // Chú thích: Check riêng Live API và browser support để hiển thị đúng thông báo
    const isAPIAvailable = isLiveAPIAvailable();

    // Nếu Voice Call bị disable (backend maintenance)
    if (!isAPIAvailable) {
        return (
            <div className="text-center p-8">
                <p className="text-amber-600 mb-4 font-medium">
                    🔧 {getVoiceCallDisabledMessage()}
                </p>
                <p className="text-slate-500 text-sm">
                    Bạn vẫn có thể sử dụng Chat text bình thường.
                </p>
            </div>
        );
    }

    // Nếu browser không hỗ trợ Web Speech API
    if (!isSupported) {
        return (
            <div className="text-center p-8">
                <p className="text-red-500 mb-4">
                    Trình duyệt của bạn không hỗ trợ tính năng gọi điện.
                </p>
                <p className="text-slate-500 text-sm">
                    Vui lòng sử dụng Chrome hoặc Edge trên máy tính.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
            {/* Avatar / Wave visualization */}
            <div className="mb-8">
                <motion.div
                    className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl"
                    animate={isCallActive ? {
                        boxShadow: [
                            '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
                            '0 25px 50px -12px rgba(99, 102, 241, 0.5)',
                            '0 25px 50px -12px rgba(99, 102, 241, 0.25)'
                        ]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    {status === 'speaking' ? (
                        <Volume2 size={48} className="text-white animate-pulse" />
                    ) : isMuted ? (
                        <MicOff size={48} className="text-white/50" />
                    ) : (
                        <Mic size={48} className={`text-white ${isListening ? 'animate-pulse' : ''}`} />
                    )}
                </motion.div>
            </div>

            {/* Voice wave */}
            <div className="mb-6 h-16">
                <VoiceWave isActive={status === 'speaking'} />
            </div>

            {/* Status */}
            <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                    Bạn Đồng Hành
                </h3>
                <p className={`text-sm ${status === 'error' ? 'text-red-500' : 'text-slate-500'}`}>
                    {statusMessage[status]}
                </p>

                {/* Duration */}
                {isCallActive && (
                    <p className="text-2xl font-mono text-slate-700 mt-4">
                        {formatDuration(duration)}
                    </p>
                )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6">
                {!isCallActive && !isConnecting ? (
                    // Start call button
                    <CallButton onClick={startCall} variant="start">
                        <Phone size={28} />
                    </CallButton>
                ) : (
                    <>
                        {/* Mute button */}
                        <CallButton
                            onClick={toggleMute}
                            variant="mute"
                            isActive={isMuted}
                        >
                            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                        </CallButton>

                        {/* End call button */}
                        <CallButton onClick={endCall} variant="end" disabled={isConnecting}>
                            <PhoneOff size={28} />
                        </CallButton>
                    </>
                )}
            </div>

            {/* Hint */}
            {status === 'idle' && (
                <p className="text-sm text-slate-400 mt-8 text-center max-w-xs">
                    Nhấn nút xanh để bắt đầu trò chuyện bằng giọng nói với AI
                </p>
            )}

            {/* Transcript preview - Hiển thị cả interim và tin nhắn cuối */}
            <AnimatePresence>
                {(transcript || lastUserMessage) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-8 p-4 bg-slate-50 rounded-xl max-w-sm"
                    >
                        {/* Tin nhắn cuối của user */}
                        {lastUserMessage && !transcript && (
                            <p className="text-sm text-indigo-600 font-medium line-clamp-2">
                                Bạn: {lastUserMessage}
                            </p>
                        )}
                        {/* Đang nói (interim) */}
                        {transcript && (
                            <p className="text-sm text-slate-500 italic line-clamp-2">
                                {transcript}...
                            </p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SOS Overlay */}
            <SOSOverlay
                isOpen={showSOSOverlay}
                onClose={() => {
                    setShowSOSOverlay(false);
                    clearSOS();
                }}
                riskLevel={sosData.level}
                triggerText={sosData.message}
            />
        </div>
    );
}
