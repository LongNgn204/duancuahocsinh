// src/hooks/useGeminiVoice.js
// Chú thích: Hook gọi Gemini Live API qua WebSocket cho streaming voice chat
// Model: gemini-2.5-flash-native-audio-dialog - Native Audio Dialog
// Input: 16-bit PCM 16kHz | Output: 16-bit PCM 24kHz

import { useState, useRef, useCallback, useEffect } from 'react';

// WebSocket URL cho Gemini Live API
const GEMINI_WS_BASE = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent';

// Audio config
const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;

export function useGeminiVoice() {
    const [isConnected, setIsConnected] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [error, setError] = useState(null);

    const wsRef = useRef(null);
    const audioContextRef = useRef(null);
    const streamRef = useRef(null);
    const processorRef = useRef(null);
    const audioQueueRef = useRef([]);
    const isPlayingRef = useRef(false);

    // Get API key from env
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    // Convert Float32 to Int16 PCM
    const floatTo16BitPCM = useCallback((float32Array) => {
        const int16Array = new Int16Array(float32Array.length);
        for (let i = 0; i < float32Array.length; i++) {
            const s = Math.max(-1, Math.min(1, float32Array[i]));
            int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        return int16Array;
    }, []);

    // Convert Int16 PCM to Float32
    const int16ToFloat32 = useCallback((int16Array) => {
        const float32Array = new Float32Array(int16Array.length);
        for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / (int16Array[i] < 0 ? 0x8000 : 0x7FFF);
        }
        return float32Array;
    }, []);

    // Play audio from queue
    const playNextAudio = useCallback(async () => {
        if (isPlayingRef.current || audioQueueRef.current.length === 0) return;

        isPlayingRef.current = true;
        setIsSpeaking(true);

        while (audioQueueRef.current.length > 0) {
            const audioData = audioQueueRef.current.shift();

            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
                    sampleRate: OUTPUT_SAMPLE_RATE
                });
            }

            const ctx = audioContextRef.current;
            const float32 = int16ToFloat32(audioData);
            const buffer = ctx.createBuffer(1, float32.length, OUTPUT_SAMPLE_RATE);
            buffer.copyToChannel(float32, 0);

            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);

            await new Promise((resolve) => {
                source.onended = resolve;
                source.start();
            });
        }

        isPlayingRef.current = false;
        setIsSpeaking(false);
    }, [int16ToFloat32]);

    // Connect to Gemini Live API
    const connect = useCallback(async () => {
        if (!apiKey) {
            setError('Thiếu VITE_GEMINI_API_KEY. Vui lòng cấu hình trong .env');
            return false;
        }

        try {
            const wsUrl = `${GEMINI_WS_BASE}?key=${apiKey}`;
            const ws = new WebSocket(wsUrl);

            ws.binaryType = 'arraybuffer';

            ws.onopen = () => {
                console.log('[GeminiVoice] WebSocket connected');

                // Gửi setup message
                const setupMessage = {
                    setup: {
                        model: 'models/gemini-2.5-flash-native-audio-dialog',
                        generationConfig: {
                            responseModalities: ['AUDIO'],
                            speechConfig: {
                                voiceConfig: {
                                    prebuiltVoiceConfig: {
                                        voiceName: 'Aoede' // Giọng nữ dịu dàng
                                    }
                                }
                            }
                        },
                        systemInstruction: {
                            parts: [{
                                text: `Bạn là "Bạn Đồng Hành" - một mentor tâm lý ấm áp, tôn trọng, không phán xét.
Nói tiếng Việt tự nhiên, ngắn gọn, gần gũi với học sinh.
Luôn xác thực cảm xúc trước khi gợi ý.
Kết thúc bằng câu hỏi mở phù hợp để tiếp tục trò chuyện.
Red flags cần lưu ý: tự hại, bạo lực, trầm cảm kéo dài.`
                            }]
                        }
                    }
                };

                ws.send(JSON.stringify(setupMessage));
                setIsConnected(true);
            };

            ws.onmessage = (event) => {
                try {
                    if (typeof event.data === 'string') {
                        const msg = JSON.parse(event.data);
                        console.log('[GeminiVoice] Received:', msg);

                        // Handle text transcript
                        if (msg.serverContent?.modelTurn?.parts) {
                            for (const part of msg.serverContent.modelTurn.parts) {
                                if (part.text) {
                                    setAiResponse(prev => prev + part.text);
                                }
                            }
                        }

                        // Handle input transcript
                        if (msg.serverContent?.inputTranscript) {
                            setTranscript(msg.serverContent.inputTranscript);
                        }

                        // Handle output transcript
                        if (msg.serverContent?.outputTranscript) {
                            setAiResponse(prev => prev + msg.serverContent.outputTranscript);
                        }

                    } else if (event.data instanceof ArrayBuffer) {
                        // Binary audio data
                        const int16Data = new Int16Array(event.data);
                        audioQueueRef.current.push(int16Data);
                        playNextAudio();
                    }
                } catch (e) {
                    console.error('[GeminiVoice] Parse error:', e);
                }
            };

            ws.onerror = (e) => {
                console.error('[GeminiVoice] WebSocket error:', e);
                setError('Lỗi kết nối WebSocket');
                setIsConnected(false);
            };

            ws.onclose = () => {
                console.log('[GeminiVoice] WebSocket closed');
                setIsConnected(false);
                setIsListening(false);
            };

            wsRef.current = ws;
            return true;

        } catch (e) {
            console.error('[GeminiVoice] Connect error:', e);
            setError('Không thể kết nối tới Gemini');
            return false;
        }
    }, [apiKey, playNextAudio]);

    // Start listening (record and stream audio)
    const startListening = useCallback(async () => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            const connected = await connect();
            if (!connected) return;
        }

        try {
            // Request microphone
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: INPUT_SAMPLE_RATE,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                }
            });

            streamRef.current = stream;

            // Create audio context for processing
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: INPUT_SAMPLE_RATE
            });

            const ctx = audioContextRef.current;
            const source = ctx.createMediaStreamSource(stream);

            // Use ScriptProcessor for audio data (deprecated but widely supported)
            const processor = ctx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
                if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

                const inputData = e.inputBuffer.getChannelData(0);
                const pcm16 = floatTo16BitPCM(inputData);

                // Gửi audio message
                const audioMessage = {
                    realtimeInput: {
                        mediaChunks: [{
                            mimeType: `audio/pcm;rate=${INPUT_SAMPLE_RATE}`,
                            data: btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)))
                        }]
                    }
                };

                wsRef.current.send(JSON.stringify(audioMessage));
            };

            source.connect(processor);
            processor.connect(ctx.destination);

            setIsListening(true);
            setTranscript('');
            setAiResponse('');
            setError(null);

        } catch (e) {
            console.error('[GeminiVoice] Microphone error:', e);
            setError('Không thể truy cập microphone. Vui lòng cấp quyền.');
        }
    }, [connect, floatTo16BitPCM]);

    // Stop listening
    const stopListening = useCallback(() => {
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        setIsListening(false);
    }, []);

    // Disconnect
    const disconnect = useCallback(() => {
        stopListening();

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        setIsConnected(false);
    }, [stopListening]);

    // Send text message (fallback)
    const sendText = useCallback((text) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            setError('Chưa kết nối');
            return;
        }

        const message = {
            clientContent: {
                turns: [{
                    role: 'user',
                    parts: [{ text }]
                }],
                turnComplete: true
            }
        };

        wsRef.current.send(JSON.stringify(message));
        setAiResponse('');
    }, []);

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
        hasApiKey: !!apiKey,

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
