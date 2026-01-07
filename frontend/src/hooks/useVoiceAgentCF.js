// src/hooks/useVoiceAgentCF.js
// Chú thích: Voice Agent Hook - Web Speech API STT + OpenAI ChatGPT
// TTS: DISABLED - sẽ thêm audio sau

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Hook Voice Agent - Chỉ STT (TTS disabled)
 * @param {Object} options
 * @param {boolean} options.autoSubmit - Tự động submit sau khi nói xong
 * @param {Function} options.onResult - Callback khi có kết quả STT
 * @param {Function} options.onSOS - Callback khi phát hiện SOS
 */
export function useVoiceAgentCF(options = {}) {
    const { autoSubmit = true, onResult, onSOS } = options;

    // State
    const [status, setStatus] = useState('idle'); // idle | listening | thinking | speaking
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [error, setError] = useState(null);
    const [isSupported, setIsSupported] = useState(true);
    const [sosDetected, setSosDetected] = useState(null);

    // Refs
    const recognitionRef = useRef(null);

    // Check browser support
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setIsSupported(false);
            console.error('[VoiceAgent] SpeechRecognition not supported');
        }
    }, []);

    // Start listening
    const startListening = useCallback(() => {
        if (!isSupported) return;

        setError(null);
        setTranscript('');

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'vi-VN';
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            console.log('[VoiceAgent] STT started');
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

            const currentText = finalTranscript || interimTranscript;
            setTranscript(currentText);

            if (finalTranscript) {
                console.log('[VoiceAgent] Final transcript:', finalTranscript);

                // Callback với kết quả
                if (onResult) {
                    onResult(finalTranscript);
                }
            }
        };

        recognition.onerror = (event) => {
            console.error('[VoiceAgent] STT error:', event.error);
            if (event.error === 'no-speech') {
                setError('Không nghe thấy gì. Bạn hãy nói to hơn nhé.');
            } else if (event.error === 'not-allowed') {
                setError('Vui lòng cho phép Micro để trò chuyện với mình nhé!');
            } else {
                setError(`Lỗi micrô: ${event.error}`);
            }
            setStatus('idle');
        };

        recognition.onend = () => {
            console.log('[VoiceAgent] STT ended');
            recognitionRef.current = null;
            setStatus('idle');
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [isSupported, onResult]);

    // Stop listening
    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setStatus('idle');
    }, []);

    // Speak - DISABLED (no-op)
    const speak = useCallback((text) => {
        console.log('[VoiceAgent] TTS disabled, text:', text?.substring(0, 50));
        // No-op - TTS disabled
    }, []);

    // Stop speaking - DISABLED (no-op)
    const stopSpeaking = useCallback(() => {
        // No-op
    }, []);

    // Stop all
    const stop = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setStatus('idle');
        setError(null);
    }, []);

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
        };
    }, []);

    return {
        // State
        status,
        transcript,
        response,
        error,
        isSupported,
        sosDetected,

        // Controls
        startListening,
        stopListening,
        stopSpeaking,
        stop,
        speak,
        clearSOS,
    };
}
