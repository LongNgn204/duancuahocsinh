// src/components/voice/VoiceCallBot.jsx
// Voice Call Bot component - REALTIME Audio Version
// Uses OpenAI Realtime API (WebSocket) instead of Text Chat API

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Mic, MicOff, Volume2, AlertCircle } from 'lucide-react';
import { formatDuration } from '../../hooks/useVoiceCall'; // Helper only
import { OpenAIRealtimeService, AudioPlayer } from '../../services/openaiRealtime';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
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
 * VoiceCallBot - Main voice call component (Realtime Audio)
 */
export default function VoiceCallBot({ onClose }) {
    const [status, setStatus] = useState('idle'); // idle | connecting | active | error
    const [isMuted, setIsMuted] = useState(false);
    const [duration, setDuration] = useState(0);
    const [aiSpeaking, setAiSpeaking] = useState(false);
    const [error, setError] = useState(null);
    const [transcript, setTranscript] = useState(''); // Used for subtitles if available

    const durationTimerRef = useRef(null);
    const realtimeServiceRef = useRef(null);
    const audioPlayerRef = useRef(null);
    const isConnectingRef = useRef(false);

    // Audio Recorder
    const { isRecording, startRecording, stopRecording } = useAudioRecorder((base64Audio) => {
        if (realtimeServiceRef.current && !isMuted && status === 'active') {
            realtimeServiceRef.current.sendAudio(base64Audio);
        }
    });

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            endCall();
        };
    }, []);

    // Duration timer
    useEffect(() => {
        if (status === 'active') {
            durationTimerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(durationTimerRef.current);
        }
        return () => clearInterval(durationTimerRef.current);
    }, [status]);


    // Initialize Service
    const initRealtimeService = useCallback(() => {
        if (realtimeServiceRef.current) return;

        // Init Audio Player
        audioPlayerRef.current = new AudioPlayer();
        audioPlayerRef.current.onPlaybackStart = () => setAiSpeaking(true);
        audioPlayerRef.current.onPlaybackEnd = () => setAiSpeaking(false);

        // Init OpenAI Service
        realtimeServiceRef.current = OpenAIRealtimeService({
            onOpen: () => {
                setStatus('active');
                isConnectingRef.current = false;
                startRecording(); // Start mic immediately
            },
            onClose: () => {
                if (status !== 'idle') setStatus('idle');
                stopRecording();
            },
            onError: (err) => {
                console.error("Realtime Error:", err);
                setError("Mất kết nối với AI");
                setStatus('error');
                isConnectingRef.current = false;
                stopRecording();
            },
            onAudioDelta: (delta) => {
                if (audioPlayerRef.current) {
                    audioPlayerRef.current.enqueue(delta);
                }
            },
            onTranscriptDelta: (delta) => {
                // Optional: Show live transcript
                // setTranscript(prev => prev + delta);
            }
        });
    }, [startRecording, stopRecording, status]);

    const startCall = async () => {
        if (isConnectingRef.current) return;

        try {
            setError(null);
            setStatus('connecting');
            isConnectingRef.current = true;
            setDuration(0);

            initRealtimeService();
            await realtimeServiceRef.current.connect();

        } catch (err) {
            console.error("Failed to start call:", err);
            setError("Không thể khởi động cuộc gọi");
            setStatus('error');
            isConnectingRef.current = false;
        }
    };

    const endCall = () => {
        if (realtimeServiceRef.current) {
            realtimeServiceRef.current.disconnect();
            realtimeServiceRef.current = null;
        }
        if (audioPlayerRef.current) {
            audioPlayerRef.current.stop();
            audioPlayerRef.current = null;
        }
        stopRecording();
        setStatus('idle');
        isConnectingRef.current = false;
    };

    const toggleMute = () => {
        setIsMuted(prev => !prev);
    };

    // Status messages
    const statusMessage = {
        idle: 'Sẵn sàng gọi điện',
        connecting: 'Đang kết nối Server...',
        active: isMuted ? 'Đã tắt mic' : (aiSpeaking ? 'AI đang nói...' : 'Đang lắng nghe...'),
        error: error || 'Lỗi kết nối'
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
            {/* Avatar / Wave visualization */}
            <div className="mb-8 relative">
                <motion.div
                    className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl z-10 relative"
                    animate={status === 'active' ? {
                        boxShadow: [
                            '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
                            '0 25px 50px -12px rgba(99, 102, 241, 0.5)',
                            '0 25px 50px -12px rgba(99, 102, 241, 0.25)'
                        ]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    {aiSpeaking ? (
                        <Volume2 size={48} className="text-white animate-pulse" />
                    ) : isMuted ? (
                        <MicOff size={48} className="text-white/50" />
                    ) : (
                        <Mic size={48} className={`text-white ${status === 'active' && !aiSpeaking ? 'animate-pulse' : ''}`} />
                    )}
                </motion.div>

                {/* Ping animation when active */}
                {status === 'active' && !isMuted && (
                    <div className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-20 z-0"></div>
                )}
            </div>

            {/* Voice wave */}
            <div className="mb-6 h-16">
                {/* Show wave if AI is speaking OR if User is speaking (mic active) */}
                <VoiceWave isActive={status === 'active' && (aiSpeaking || (!isMuted && isRecording))} />
            </div>

            {/* Status */}
            <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                    Bạn Đồng Hành (Realtime)
                </h3>
                <p className={`text-sm ${status === 'error' ? 'text-red-500' : 'text-slate-500'}`}>
                    {statusMessage[status]}
                </p>

                {/* Duration */}
                {status === 'active' && (
                    <p className="text-2xl font-mono text-slate-700 mt-4">
                        {formatDuration(duration)}
                    </p>
                )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6">
                {status === 'idle' || status === 'error' ? (
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
                        <CallButton onClick={endCall} variant="end" disabled={status === 'connecting'}>
                            <PhoneOff size={28} />
                        </CallButton>
                    </>
                )}
            </div>

            {status === 'error' && (
                <div className="mt-6 flex items-center gap-2 text-red-500 bg-red-50 px-4 py-2 rounded-lg text-sm">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {/* Hint */}
            {status === 'idle' && (
                <p className="text-sm text-slate-400 mt-8 text-center max-w-xs">
                    Chế độ hội thoại thời gian thực (Realtime Audio).<br />Sẵn sàng lắng nghe và trò chuyện ngay lập tức.
                </p>
            )}
        </div>
    );
}
