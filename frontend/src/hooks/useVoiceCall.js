// src/hooks/useVoiceCall.js
// Hook for managing voice call with Gemini Live API
// v2.0: Dùng Web Speech API (vi-VN) cho STT thay vì native audio
// Giữ Gemini Live API cho TTS output (audio response từ AI)

import { useState, useCallback, useRef, useEffect } from 'react';
import { createLiveSession, AudioPlayer, isLiveAPIAvailable } from '../services/geminiLive';
import { detectSOSLevel, sosMessage, getSuggestedAction } from '../utils/sosDetector';

/**
 * Hook for voice call with Gemini Live API
 * STT: Web Speech API (vi-VN) - chính xác hơn cho tiếng Việt
 * TTS: Gemini Live API - audio response từ AI
 * @param {Object} options - Configuration options
 * @param {Function} options.onSOS - Callback when SOS detected (level, message)
 * @returns {Object} Voice call state and controls
 */
export function useVoiceCall(options = {}) {
    const { onSOS } = options;

    // State
    const [status, setStatus] = useState('idle'); // idle | connecting | active | listening | speaking | error
    const [error, setError] = useState(null);
    const [duration, setDuration] = useState(0);
    const [transcript, setTranscript] = useState(''); // User đang nói (interim)
    const [lastUserMessage, setLastUserMessage] = useState(''); // User nói xong (final)
    const [aiResponse, setAiResponse] = useState(''); // AI trả lời
    const [isMuted, setIsMuted] = useState(false);
    const [sosDetected, setSosDetected] = useState(null); // { level, message }

    // Silence timeout - auto end call after 30s of silence
    const SILENCE_TIMEOUT = 30000; // 30 seconds

    // Refs
    const sessionRef = useRef(null);
    const audioPlayerRef = useRef(null);
    const recognitionRef = useRef(null); // Web Speech API
    const durationTimerRef = useRef(null);
    const isMutedRef = useRef(false);
    const isListeningRef = useRef(false);
    const silenceTimeoutRef = useRef(null);
    const endCallRef = useRef(null); // Ref to avoid circular dependency

    // Reset silence timer - call this whenever user speaks
    const resetSilenceTimer = useCallback((endCallFn) => {
        if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
        }
        silenceTimeoutRef.current = setTimeout(() => {
            console.log('[VoiceCall] Silence timeout - auto ending call');
            if (endCallFn) endCallFn();
        }, SILENCE_TIMEOUT);
    }, []);

    // Clear silence timer
    const clearSilenceTimer = useCallback(() => {
        if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
        }
    }, []);

    // Cleanup function
    const cleanup = useCallback(() => {
        // Stop silence timer
        clearSilenceTimer();

        // Stop duration timer
        if (durationTimerRef.current) {
            clearInterval(durationTimerRef.current);
            durationTimerRef.current = null;
        }

        // Stop speech recognition
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                // Ignore errors when stopping
            }
            recognitionRef.current = null;
        }
        isListeningRef.current = false;

        // Stop audio player
        if (audioPlayerRef.current) {
            audioPlayerRef.current.destroy();
            audioPlayerRef.current = null;
        }

        // Close session
        if (sessionRef.current) {
            sessionRef.current.close();
            sessionRef.current = null;
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return cleanup;
    }, [cleanup, clearSilenceTimer]);

    // ========================================================================
    // SPEECH RECOGNITION (STT) - Web Speech API
    // ========================================================================
    const startListening = useCallback(() => {
        if (isMutedRef.current || isListeningRef.current) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error('[VoiceCall] SpeechRecognition not supported');
            return;
        }

        const recognition = new SpeechRecognition();

        // Cấu hình STT cho tiếng Việt - chính xác cao
        recognition.lang = 'vi-VN';
        recognition.continuous = true;        // Tiếp tục nghe
        recognition.interimResults = true;    // Hiển thị kết quả tạm
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            console.log('[VoiceCall] STT started (vi-VN)');
            isListeningRef.current = true;
            setStatus('listening');
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript;
                } else {
                    interimTranscript += result[0].transcript;
                }
            }

            // Hiển thị transcript tạm thời
            if (interimTranscript) {
                setTranscript(interimTranscript);
            }

            // Khi có final transcript, gửi đến AI
            if (finalTranscript && finalTranscript.trim()) {
                console.log('[VoiceCall] User said:', finalTranscript);
                setLastUserMessage(finalTranscript);
                setTranscript('');

                // Reset silence timer - user đang nói
                resetSilenceTimer(endCallRef.current);

                // SOS Detection
                const sosLevel = detectSOSLevel(finalTranscript);
                const sosAction = getSuggestedAction(sosLevel);

                if (sosAction.showOverlay) {
                    const msg = sosMessage(sosLevel);
                    console.log('[VoiceCall] SOS detected:', sosLevel);
                    setSosDetected({ level: sosLevel, message: msg });

                    if (onSOS) {
                        onSOS(sosLevel, msg);
                    }

                    // Nếu critical, không gửi đến AI
                    if (sosAction.blockNormalResponse) {
                        return;
                    }
                }

                // Gửi text đến Gemini Live API
                if (sessionRef.current?.isReady()) {
                    console.log('[VoiceCall] Sending to Gemini:', finalTranscript);
                    sessionRef.current.sendText(finalTranscript);
                    setStatus('speaking'); // AI sẽ trả lời
                }
            }
        };

        recognition.onerror = (event) => {
            console.error('[VoiceCall] STT error:', event.error);

            if (event.error === 'no-speech') {
                // Không có gì để làm, tiếp tục nghe
                console.log('[VoiceCall] No speech detected, continuing...');
            } else if (event.error === 'not-allowed') {
                setError('Vui lòng cho phép Microphone');
                setStatus('error');
            } else if (event.error === 'aborted') {
                // Bị abort, có thể restart
                console.log('[VoiceCall] STT aborted');
            } else {
                setError(`Lỗi STT: ${event.error}`);
            }
            isListeningRef.current = false;
        };

        recognition.onend = () => {
            console.log('[VoiceCall] STT ended');
            isListeningRef.current = false;

            // Auto-restart nếu vẫn đang trong cuộc gọi
            if (sessionRef.current?.isReady() && !isMutedRef.current && status !== 'error') {
                console.log('[VoiceCall] Restarting STT...');
                setTimeout(() => {
                    if (sessionRef.current?.isReady() && !isMutedRef.current) {
                        startListening();
                    }
                }, 100);
            }
        };

        recognitionRef.current = recognition;

        try {
            recognition.start();
        } catch (e) {
            console.error('[VoiceCall] Failed to start STT:', e);
        }
    }, [onSOS, status, resetSilenceTimer]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                // Ignore
            }
            recognitionRef.current = null;
        }
        isListeningRef.current = false;
    }, []);

    // ========================================================================
    // START VOICE CALL
    // ========================================================================
    const startCall = useCallback(async () => {
        if (!isLiveAPIAvailable()) {
            setError('Chưa cấu hình Gemini API Key');
            setStatus('error');
            return false;
        }

        // Check Web Speech API support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError('Trình duyệt không hỗ trợ nhận diện giọng nói. Vui lòng dùng Chrome hoặc Edge.');
            setStatus('error');
            return false;
        }

        try {
            setStatus('connecting');
            setError(null);
            setDuration(0);
            setTranscript('');
            setLastUserMessage('');
            setAiResponse('');

            // Initialize audio player cho TTS output
            audioPlayerRef.current = new AudioPlayer();
            audioPlayerRef.current.onPlaybackStart = () => {
                console.log('[VoiceCall] AI speaking...');
                setStatus('speaking');
                // Tạm dừng STT khi AI đang nói
                stopListening();
            };
            audioPlayerRef.current.onPlaybackEnd = () => {
                console.log('[VoiceCall] AI done speaking');
                setStatus('active');
                // Restart STT sau khi AI nói xong
                if (!isMutedRef.current) {
                    startListening();
                }
            };

            // Create Gemini Live session - chỉ dùng cho TTS output
            sessionRef.current = createLiveSession({
                onAudioData: (base64Data, mimeType) => {
                    // Nhận audio từ AI và phát
                    if (audioPlayerRef.current) {
                        audioPlayerRef.current.enqueue(base64Data);
                    }
                },
                onTranscript: (text) => {
                    // AI response transcript (nếu có)
                    console.log('[VoiceCall] AI transcript:', text);
                    setAiResponse(prev => prev + ' ' + text);
                },
                onError: (err) => {
                    console.error('[VoiceCall] Session error:', err);
                    setError('Lỗi kết nối với AI');
                    setStatus('error');
                },
                onClose: () => {
                    console.log('[VoiceCall] Session closed');
                    cleanup();
                    setStatus('idle');
                },
                onOpen: () => {
                    console.log('[VoiceCall] Session ready - Starting STT');
                    setStatus('active');

                    // Start duration timer
                    durationTimerRef.current = setInterval(() => {
                        setDuration(d => d + 1);
                    }, 1000);

                    // Start Web Speech API STT
                    startListening();

                    // Start silence timer
                    resetSilenceTimer(endCallRef.current);
                }
            });

            // Connect to Gemini Live
            await sessionRef.current.connect();

            // Resume audio player
            audioPlayerRef.current.resume();

            return true;

        } catch (err) {
            console.error('[VoiceCall] Start error:', err);
            setError('Không thể bắt đầu cuộc gọi: ' + err.message);
            setStatus('error');
            cleanup();
            return false;
        }
    }, [cleanup, startListening, stopListening]);

    // ========================================================================
    // END VOICE CALL
    // ========================================================================
    const endCall = useCallback(() => {
        cleanup();
        setStatus('idle');
        setTranscript('');
        setLastUserMessage('');
        setAiResponse('');
    }, [cleanup]);

    // Keep endCallRef updated
    useEffect(() => {
        endCallRef.current = endCall;
    }, [endCall]);

    // ========================================================================
    // TOGGLE MUTE
    // ========================================================================
    const toggleMute = useCallback(() => {
        setIsMuted(prev => {
            const newMuted = !prev;
            isMutedRef.current = newMuted;

            if (newMuted) {
                // Mute: dừng STT
                stopListening();
            } else {
                // Unmute: bắt đầu STT lại
                if (sessionRef.current?.isReady() && status !== 'speaking') {
                    startListening();
                }
            }

            return newMuted;
        });
    }, [startListening, stopListening, status]);

    // Send text message directly (for testing or manual input)
    const sendText = useCallback((text) => {
        if (sessionRef.current?.isReady()) {
            sessionRef.current.sendText(text);
            setLastUserMessage(text);
            return true;
        }
        return false;
    }, []);

    // Check if supported
    const isSupported = typeof navigator !== 'undefined' &&
        (window.SpeechRecognition || window.webkitSpeechRecognition) &&
        isLiveAPIAvailable();

    // Clear SOS state
    const clearSOS = useCallback(() => {
        setSosDetected(null);
    }, []);

    return {
        // State
        status,           // idle | connecting | active | listening | speaking | error
        error,
        duration,
        transcript,       // User đang nói (interim)
        lastUserMessage,  // User nói xong (final)
        aiResponse,       // AI response transcript
        isMuted,
        isSupported,
        sosDetected,

        // Controls
        startCall,
        endCall,
        toggleMute,
        sendText,
        clearSOS
    };
}

/**
 * Format duration in seconds to MM:SS
 */
export function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
