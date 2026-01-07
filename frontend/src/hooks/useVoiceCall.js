// src/hooks/useVoiceCall.js
// Chú thích: Voice Call Hook - Sử dụng Web Speech API cho STT và OpenAI ChatGPT qua backend
// TTS: DISABLED - sẽ thêm audio sau

import { useState, useCallback, useRef, useEffect } from 'react';
import { detectSOSLevel, sosMessage, getSuggestedAction } from '../utils/sosDetector';
import { streamChat } from '../services/chatApi';

/**
 * Format duration từ seconds sang mm:ss
 */
export function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Hook Voice Call với Web Speech API (STT) + OpenAI ChatGPT
 */
export function useVoiceCall(options = {}) {
    const { onSOS } = options;

    // State
    const [status, setStatus] = useState('idle'); // idle | connecting | active | listening | speaking | error
    const [error, setError] = useState(null);
    const [duration, setDuration] = useState(0);
    const [transcript, setTranscript] = useState('');
    const [lastUserMessage, setLastUserMessage] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const [sosDetected, setSosDetected] = useState(null);

    // Refs
    const recognitionRef = useRef(null);
    const durationTimerRef = useRef(null);

    // Check browser support
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setIsSupported(false);
            console.error('[VoiceCall] SpeechRecognition not supported');
        }
    }, []);

    // Duration timer
    useEffect(() => {
        if (status === 'active' || status === 'listening' || status === 'speaking') {
            durationTimerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(durationTimerRef.current);
        }

        return () => clearInterval(durationTimerRef.current);
    }, [status]);

    // Process message with AI
    const processMessage = useCallback(async (text) => {
        // SOS Detection
        const sosLevel = detectSOSLevel(text);
        const sosAction = getSuggestedAction(sosLevel);

        if (sosAction.showOverlay) {
            const msg = sosMessage(sosLevel);
            setSosDetected({ level: sosLevel, message: msg });

            if (onSOS) {
                onSOS(sosLevel, msg);
            }

            if (sosAction.blockNormalResponse) {
                console.log('[VoiceCall] SOS CRITICAL detected, blocking');
                return;
            }
        }

        // Call AI
        setStatus('speaking');

        try {
            let fullResponse = '';
            await streamChat(
                text,
                [],
                (chunk) => {
                    fullResponse += chunk;
                }
            );

            console.log('[VoiceCall] AI Response:', fullResponse?.substring(0, 100));
            // TTS disabled - chỉ log response
            console.log('[VoiceCall] TTS disabled, would speak:', fullResponse?.substring(0, 50));

        } catch (err) {
            console.error('[VoiceCall] AI error:', err);
            setError('Không thể kết nối với AI');
        }

        setStatus('active');
    }, [onSOS]);

    // Start listening with STT
    const startListening = useCallback(() => {
        if (!isSupported || isMuted) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'vi-VN';
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setStatus('listening');
            setTranscript('');
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

            setTranscript(finalTranscript || interimTranscript);

            if (finalTranscript) {
                setLastUserMessage(finalTranscript);
                processMessage(finalTranscript);
            }
        };

        recognition.onerror = (event) => {
            console.error('[VoiceCall] STT error:', event.error);
            if (event.error === 'no-speech') {
                // Restart nếu không nghe thấy gì
                setTimeout(startListening, 500);
            } else if (event.error !== 'aborted') {
                setError(`Lỗi mic: ${event.error}`);
                setStatus('error');
            }
        };

        recognition.onend = () => {
            recognitionRef.current = null;
            // Auto restart nếu vẫn đang active
            if (status === 'listening' || status === 'active') {
                setTimeout(startListening, 500);
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [isSupported, isMuted, processMessage, status]);

    // Start call
    const startCall = useCallback(() => {
        setError(null);
        setDuration(0);
        setTranscript('');
        setLastUserMessage('');
        setStatus('connecting');

        // Simulate connection delay
        setTimeout(() => {
            setStatus('active');
            startListening();
        }, 500);
    }, [startListening]);

    // End call
    const endCall = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }

        setStatus('idle');
        setTranscript('');
        clearInterval(durationTimerRef.current);
    }, []);

    // Toggle mute
    const toggleMute = useCallback(() => {
        setIsMuted(prev => {
            const newMuted = !prev;

            if (newMuted) {
                // Stop listening
                if (recognitionRef.current) {
                    recognitionRef.current.stop();
                }
            } else {
                // Start listening
                startListening();
            }

            return newMuted;
        });
    }, [startListening]);

    // Clear SOS
    const clearSOS = useCallback(() => {
        setSosDetected(null);
    }, []);

    // Cleanup
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            clearInterval(durationTimerRef.current);
        };
    }, []);

    return {
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
        clearSOS,
    };
}
