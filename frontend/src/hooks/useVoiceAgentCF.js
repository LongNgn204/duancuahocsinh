// src/hooks/useVoiceAgentCF.js
// Chú thích: Hook Voice Chat sử dụng Web Speech API (browser-native)
// STT: SpeechRecognition (vi-VN) - chạy trên browser
// TTS: SpeechSynthesis (vi-VN) - chạy trên browser, Play/Stop - KHÔNG ĐỌC EMOJI
// LLM: gọi backend Workers AI qua SSE streaming
// SOS: Phát hiện từ khóa tiêu cực và hiện cảnh báo

import { useState, useCallback, useRef, useEffect } from 'react';
import { detectSOSLevel, sosMessage, getSuggestedAction } from '../utils/sosDetector';

/**
 * Loại bỏ emoji và icon khỏi text trước khi TTS đọc
 * @param {string} text - Text có thể chứa emoji
 * @returns {string} Text đã lọc bỏ emoji
 */
function stripEmoji(text) {
    if (!text) return '';
    // Regex loại bỏ emoji, symbol, pictograph
    return text
        .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
        .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols and Pictographs
        .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map
        .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
        .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc Symbols
        .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
        .replace(/[\u{FE00}-\u{FE0F}]/gu, '')   // Variation Selectors
        .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols
        .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Chess symbols, etc.
        .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols and Pictographs Extended-A
        .replace(/[\u{231A}-\u{2B55}]/gu, '')   // Misc symbols
        .replace(/[\u{23E9}-\u{23F3}]/gu, '')   // Symbols
        .replace(/[\u{23F8}-\u{23FA}]/gu, '')   // Symbols
        .replace(/[\u{25AA}-\u{25FE}]/gu, '')   // Shapes
        .replace(/🆘|📞|🌙|💪|🎮|🧘|📖|✨|🌟|⭐|💬|🤖|🎯|💡|❤️|💚|💙|🔵|🔴|🟢|🟡|⚠️|✅|❌|🔥|👋|👍|👎|🙏|💕|🌈|☀️|🌙|⏰|📝|📊|🏆|🎉|😊|😢|😤|😐|🌸/g, '')
        .replace(/\s{2,}/g, ' ') // Multiple spaces to single
        .trim();
}

/**
 * Hook Voice Agent với Web Speech API
 * @returns {Object} Voice agent state và controls
 */
/**
 * Hook Voice Agent với Web Speech API
 * @param {Object} options - Configuration options
 * @param {Function} options.onSOS - Callback when SOS detected (level, message)
 * @returns {Object} Voice agent state và controls
 */
export function useVoiceAgentCF({ onSOS } = {}) {
    // ========================================================================
    // STATE
    // ========================================================================
    const [status, setStatus] = useState('idle'); // idle | listening | thinking | speaking
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [error, setError] = useState(null);
    const [isSupported, setIsSupported] = useState(true);
    const [sosDetected, setSosDetected] = useState(null); // { level, message }

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
            const currentText = finalTranscript || interimTranscript;
            setTranscript(currentText);

            // Nếu có final transcript
            if (finalTranscript) {
                console.log('[VoiceAgent] Final transcript:', finalTranscript);

                // Make autoSubmit optional
                if (options?.autoSubmit !== false) {
                    sendToLLM(finalTranscript);
                }

                // Allow external handling
                if (options?.onResult) {
                    options.onResult(finalTranscript);
                }
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

        // ====== SOS DETECTION - QUAN TRỌNG ======
        const sosLevel = detectSOSLevel(text);
        const sosAction = getSuggestedAction(sosLevel);

        if (sosAction.showOverlay) {
            const msg = sosMessage(sosLevel);
            setSosDetected({ level: sosLevel, message: msg });

            // Gọi callback để hiển thị overlay
            if (onSOS) {
                onSOS(sosLevel, msg);
            }

            // Nếu critical, block hoàn toàn
            if (sosAction.blockNormalResponse) {
                console.log('[VoiceAgent] SOS CRITICAL detected, blocking response');
                // Đọc thông điệp SOS thay vì gọi LLM
                speak(stripEmoji(msg));
                return;
            }
        }
        // ====== END SOS DETECTION ======

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

        // FILTER EMOJI TRƯỚC KHI ĐỌC - Không đọc icon/emoji
        const cleanText = stripEmoji(text);
        if (!cleanText) {
            console.log('[VoiceAgent] No text to speak after emoji filter');
            setStatus('idle');
            return;
        }

        const utterance = new SpeechSynthesisUtterance(cleanText);
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
    // Clear SOS state
    const clearSOS = useCallback(() => {
        setSosDetected(null);
    }, []);

    return {
        // State
        status,           // 'idle' | 'listening' | 'thinking' | 'speaking'
        transcript,       // Current STT transcript
        response,         // Current LLM response
        error,            // Error message if any
        isSupported,      // Browser support check
        sosDetected,      // { level, message } if SOS detected

        // Controls
        startListening,   // Start voice input
        stopListening,    // Stop voice input
        stopSpeaking,     // Stop TTS
        stop,             // Stop everything
        speak,            // Manually speak text
        clearSOS,         // Clear SOS state
    };
}
