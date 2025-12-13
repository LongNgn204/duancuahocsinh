// src/hooks/useGeminiVoice.js
// Chú thích: Hook Voice Chat sử dụng Backend API + Browser Speech APIs
// Speech Recognition (nhận giọng nói) + Backend AI + TTS (phát giọng nói)
// Không cần API key ở frontend - backend đã có sẵn

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTTS } from './useTTS';

export function useGeminiVoice() {
    const [isConnected, setIsConnected] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [error, setError] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');

    const recognitionRef = useRef(null);
    const { play: ttsPlay, stop: ttsStop, speaking: ttsSpeaking } = useTTS();

    // Get backend API URL từ env
    const apiUrl = import.meta.env.VITE_API_URL || null;

    // Update isSpeaking based on TTS
    useEffect(() => {
        setIsSpeaking(ttsSpeaking);
    }, [ttsSpeaking]);

    // Check if Speech Recognition is supported
    const isSpeechSupported = typeof window !== 'undefined' &&
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

    // Call backend API
    const callBackendAI = useCallback(async (message) => {
        if (!apiUrl) {
            throw new Error('Backend chưa được cấu hình');
        }

        const res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, history: [] })
        });

        if (!res.ok) {
            throw new Error('Không thể kết nối tới AI');
        }

        const data = await res.json();
        return data.text || data.message || 'Xin lỗi, mình không hiểu.';
    }, [apiUrl]);

    // Connect (init speech recognition)
    const connect = useCallback(async () => {
        if (!isSpeechSupported) {
            setError('Trình duyệt không hỗ trợ nhận diện giọng nói. Vui lòng dùng Chrome.');
            return false;
        }

        if (!apiUrl) {
            setError('Backend API chưa được cấu hình.');
            return false;
        }

        try {
            setConnectionStatus('connecting');
            setError(null);

            // Init SpeechRecognition
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.lang = 'vi-VN';
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.maxAlternatives = 1;

            recognition.onresult = async (event) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i];
                    if (result.isFinal) {
                        finalTranscript += result[0].transcript;
                    } else {
                        interimTranscript += result[0].transcript;
                    }
                }

                // Hiển thị interim transcript
                if (interimTranscript) {
                    setTranscript(interimTranscript);
                }

                // Khi có final transcript, gọi AI
                if (finalTranscript) {
                    setTranscript(finalTranscript);
                    setIsListening(false);

                    try {
                        setAiResponse('Đang suy nghĩ...');
                        const response = await callBackendAI(finalTranscript);
                        setAiResponse(response);

                        // Đọc response bằng TTS
                        ttsPlay(response, { rate: 1, pitch: 1 });
                    } catch (e) {
                        setError('Không thể kết nối AI: ' + e.message);
                        setAiResponse('');
                    }
                }
            };

            recognition.onerror = (event) => {
                console.error('[VoiceChat] Recognition error:', event.error);
                if (event.error === 'not-allowed') {
                    setError('Vui lòng cấp quyền microphone trong cài đặt trình duyệt.');
                } else if (event.error === 'no-speech') {
                    setError('Không nghe thấy giọng nói. Hãy nói rõ hơn.');
                } else {
                    setError('Lỗi nhận diện giọng nói: ' + event.error);
                }
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
            setIsConnected(true);
            setConnectionStatus('ready');

            console.log('[VoiceChat] Connected - Speech Recognition ready');
            return true;

        } catch (e) {
            console.error('[VoiceChat] Connect error:', e);
            setError('Không thể khởi tạo nhận diện giọng nói');
            setConnectionStatus('error');
            return false;
        }
    }, [apiUrl, isSpeechSupported, callBackendAI, ttsPlay]);

    // Start listening
    const startListening = useCallback(async () => {
        if (!recognitionRef.current) {
            const connected = await connect();
            if (!connected) return;
        }

        try {
            setError(null);
            setTranscript('');
            setAiResponse('');
            ttsStop(); // Stop any playing TTS

            recognitionRef.current.start();
            setIsListening(true);
            console.log('[VoiceChat] Started listening');

        } catch (e) {
            console.error('[VoiceChat] Start error:', e);
            if (e.message?.includes('already started')) {
                // Already running, ignore
            } else {
                setError('Không thể bắt đầu ghi âm');
            }
        }
    }, [connect, ttsStop]);

    // Stop listening
    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (_) { }
        }
        setIsListening(false);
    }, []);

    // Disconnect
    const disconnect = useCallback(() => {
        stopListening();
        ttsStop();
        recognitionRef.current = null;
        setIsConnected(false);
        setConnectionStatus('disconnected');
    }, [stopListening, ttsStop]);

    // Send text (fallback)
    const sendText = useCallback(async (text) => {
        if (!apiUrl) {
            setError('Backend chưa được cấu hình');
            return;
        }

        setTranscript(text);
        setAiResponse('Đang suy nghĩ...');

        try {
            const response = await callBackendAI(text);
            setAiResponse(response);
            ttsPlay(response, { rate: 1, pitch: 1 });
        } catch (e) {
            setError('Không thể kết nối AI: ' + e.message);
            setAiResponse('');
        }
    }, [apiUrl, callBackendAI, ttsPlay]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    return {
        // State
        isConnected,
        isListening,
        isSpeaking,
        transcript,
        aiResponse,
        error,
        connectionStatus,
        hasApiKey: !!apiUrl, // Renamed: giờ check backend URL thay vì frontend API key

        // Actions
        connect,
        disconnect,
        startListening,
        stopListening,
        sendText,
        clearError: () => setError(null),
        clearResponse: () => { setAiResponse(''); setTranscript(''); }
    };
}
