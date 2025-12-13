// src/hooks/useVoiceAgentCF.js
// Chú thích: Hook Voice Chat sử dụng Web Speech API (browser-native)
// STT: SpeechRecognition (vi-VN) - chạy trên browser
// TTS: SpeechSynthesis (vi-VN) - chạy trên browser, Play/Stop
// LLM: gọi backend Workers AI qua SSE streaming

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Hook Voice Agent với Web Speech API
 * @returns {Object} Voice agent state và controls
 */
export function useVoiceAgentCF() {
    // ========================================================================
    // STATE
    // ========================================================================
    const [status, setStatus] = useState('idle'); // idle | listening | thinking | speaking
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [error, setError] = useState(null);
    const [isSupported, setIsSupported] = useState(true);

    // Refs
    const recognitionRef = useRef(null);
    const synthRef = useRef(null);
    const utteranceRef = useRef(null);
    const abortControllerRef = useRef(null);

    // API endpoint
    const endpoint = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_AI_PROXY_URL ?? null;

    // ========================================================================
    // CHECK BROWSER SUPPORT
    // ========================================================================
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const speechSynthesis = window.speechSynthesis;

        if (!SpeechRecognition || !speechSynthesis) {
            setIsSupported(false);
            setError('Trình duyệt không hỗ trợ Web Speech API. Vui lòng dùng Chrome.');
        } else {
            synthRef.current = speechSynthesis;
        }
    }, []);

    // ========================================================================
    // SPEECH RECOGNITION (STT)
    // ========================================================================
    const startListening = useCallback(() => {
        if (!isSupported) return;

        setError(null);
        setTranscript('');

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        // Cấu hình STT cho tiếng Việt
        recognition.lang = 'vi-VN';
        recognition.continuous = false;      // Dừng sau khi nghe xong 1 câu
        recognition.interimResults = true;   // Hiển thị kết quả tạm
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

            // Hiển thị transcript (interim hoặc final)
            setTranscript(finalTranscript || interimTranscript);

            // Nếu có final transcript, gửi đến LLM
            if (finalTranscript) {
                console.log('[VoiceAgent] Final transcript:', finalTranscript);
                sendToLLM(finalTranscript);
            }
        };

        recognition.onerror = (event) => {
            console.error('[VoiceAgent] STT error:', event.error);
            if (event.error === 'no-speech') {
                setError('Không nghe thấy giọng nói. Hãy thử lại.');
            } else if (event.error === 'not-allowed') {
                setError('Vui lòng cho phép truy cập microphone.');
            } else {
                setError(`Lỗi nhận diện giọng nói: ${event.error}`);
            }
            setStatus('idle');
        };

        recognition.onend = () => {
            console.log('[VoiceAgent] STT ended');
            recognitionRef.current = null;
            // Không reset status ở đây vì có thể đang thinking/speaking
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [isSupported]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setStatus('idle');
    }, []);

    // ========================================================================
    // LLM CALL (SSE Streaming)
    // ========================================================================
    const sendToLLM = useCallback(async (text) => {
        if (!endpoint) {
            setError('Chưa cấu hình API endpoint');
            setStatus('idle');
            return;
        }

        setStatus('thinking');
        setResponse('');

        // Abort previous request if any
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        try {
            const res = await fetch(`${endpoint}?stream=true`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream',
                },
                body: JSON.stringify({
                    message: text,
                    history: [],  // Voice chat thường không cần history dài
                }),
                signal: abortControllerRef.current.signal,
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            // Parse SSE stream
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullResponse = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                // Parse SSE events
                let idx;
                while ((idx = buffer.indexOf('\n\n')) !== -1) {
                    const raw = buffer.slice(0, idx);
                    buffer = buffer.slice(idx + 2);

                    if (!raw.trim()) continue;

                    const lines = raw.split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data:')) {
                            const dataStr = line.slice(5).trim();
                            try {
                                const data = JSON.parse(dataStr);
                                if (data.type === 'delta' && data.text) {
                                    fullResponse += data.text;
                                    setResponse(fullResponse);
                                } else if (data.type === 'done') {
                                    // Stream complete
                                    console.log('[VoiceAgent] LLM stream done');
                                }
                            } catch (e) {
                                // Non-JSON data, try to use as text
                                if (dataStr && dataStr !== '[DONE]') {
                                    try {
                                        const text = JSON.parse(dataStr);
                                        if (typeof text === 'string') {
                                            fullResponse += text;
                                            setResponse(fullResponse);
                                        }
                                    } catch (_) { }
                                }
                            }
                        }
                    }
                }
            }

            // Extract reply from JSON if needed
            let replyText = fullResponse;
            try {
                const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    replyText = parsed.reply || fullResponse;
                }
            } catch (_) { }

            // Speak the response
            if (replyText) {
                speak(replyText);
            } else {
                setStatus('idle');
            }

        } catch (err) {
            if (err.name === 'AbortError') {
                console.log('[VoiceAgent] Request aborted');
            } else {
                console.error('[VoiceAgent] LLM error:', err);
                setError(`Lỗi kết nối: ${err.message}`);
            }
            setStatus('idle');
        }
    }, [endpoint]);

    // ========================================================================
    // SPEECH SYNTHESIS (TTS)
    // ========================================================================
    const speak = useCallback((text) => {
        if (!synthRef.current || !text) {
            setStatus('idle');
            return;
        }

        // Cancel any ongoing speech
        synthRef.current.cancel();

        setStatus('speaking');

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'vi-VN';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        // Tìm voice tiếng Việt nếu có
        const voices = synthRef.current.getVoices();
        const viVoice = voices.find(v => v.lang.startsWith('vi'));
        if (viVoice) {
            utterance.voice = viVoice;
        }

        utterance.onend = () => {
            console.log('[VoiceAgent] TTS ended');
            setStatus('idle');
            utteranceRef.current = null;
        };

        utterance.onerror = (event) => {
            console.error('[VoiceAgent] TTS error:', event);
            setStatus('idle');
            utteranceRef.current = null;
        };

        utteranceRef.current = utterance;
        synthRef.current.speak(utterance);
    }, []);

    const stopSpeaking = useCallback(() => {
        if (synthRef.current) {
            synthRef.current.cancel();
        }
        utteranceRef.current = null;
        setStatus('idle');
    }, []);

    // ========================================================================
    // STOP ALL
    // ========================================================================
    const stop = useCallback(() => {
        // Stop STT
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }

        // Abort LLM request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }

        // Stop TTS
        if (synthRef.current) {
            synthRef.current.cancel();
        }
        utteranceRef.current = null;

        setStatus('idle');
        setError(null);
    }, []);

    // ========================================================================
    // CLEANUP
    // ========================================================================
    useEffect(() => {
        return () => {
            stop();
        };
    }, [stop]);

    // ========================================================================
    // RETURN
    // ========================================================================
    return {
        // State
        status,           // 'idle' | 'listening' | 'thinking' | 'speaking'
        transcript,       // Current STT transcript
        response,         // Current LLM response
        error,            // Error message if any
        isSupported,      // Browser support check

        // Controls
        startListening,   // Start voice input
        stopListening,    // Stop voice input
        stopSpeaking,     // Stop TTS
        stop,             // Stop everything
        speak,            // Manually speak text
    };
}
