// src/hooks/useGeminiVoice.js
// Chú thích: Hook Voice Chat sử dụng Gemini Live API qua WebSocket
// Model: gemini-2.5-flash-native-audio-dialog
// Audio: Input 16kHz PCM, Output 24kHz PCM
// Ref: https://ai.google.dev/gemini-api/docs/live

import { useState, useRef, useCallback, useEffect } from 'react';

// Audio config
const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;
const BUFFER_SIZE = 4096;

// System instruction cho AI
const SYSTEM_INSTRUCTION = `Bạn là "Bạn Đồng Hành" - một mentor tâm lý ấm áp, tôn trọng, không phán xét.
Nói tiếng Việt tự nhiên, ngắn gọn, gần gũi với học sinh.
Luôn xác thực cảm xúc trước khi gợi ý.
Kết thúc bằng câu hỏi mở phù hợp để tiếp tục trò chuyện.
Red flags cần lưu ý: tự hại, bạo lực, trầm cảm kéo dài - hãy khuyên họ tìm người lớn đáng tin cậy.`;

export function useGeminiVoice() {
    const [isConnected, setIsConnected] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [error, setError] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');

    const wsRef = useRef(null);
    const audioContextRef = useRef(null);
    const streamRef = useRef(null);
    const processorRef = useRef(null);
    const audioQueueRef = useRef([]);
    const isPlayingRef = useRef(false);
    const setupCompleteRef = useRef(false);

    // Get API key from env
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    // Check if audio is supported
    const isAudioSupported = typeof window !== 'undefined' &&
        (window.AudioContext || window.webkitAudioContext);

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

    // Base64 encode ArrayBuffer
    const arrayBufferToBase64 = useCallback((buffer) => {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }, []);

    // Base64 decode to ArrayBuffer
    const base64ToArrayBuffer = useCallback((base64) => {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }, []);

    // Play audio from queue
    const playNextAudio = useCallback(async () => {
        if (isPlayingRef.current || audioQueueRef.current.length === 0) return;

        isPlayingRef.current = true;
        setIsSpeaking(true);

        try {
            while (audioQueueRef.current.length > 0) {
                const audioData = audioQueueRef.current.shift();

                // Create audio context if needed
                if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
                        sampleRate: OUTPUT_SAMPLE_RATE
                    });
                }

                const ctx = audioContextRef.current;

                // Resume if suspended
                if (ctx.state === 'suspended') {
                    await ctx.resume();
                }

                const float32 = int16ToFloat32(new Int16Array(audioData));
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
        } catch (e) {
            console.error('[GeminiVoice] Playback error:', e);
        } finally {
            isPlayingRef.current = false;
            setIsSpeaking(false);
        }
    }, [int16ToFloat32]);

    // Send setup message after WebSocket opens
    const sendSetup = useCallback(() => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        const setupMessage = {
            setup: {
                model: 'models/gemini-2.5-flash-preview-native-audio-dialog',
                generationConfig: {
                    responseModalities: ['AUDIO', 'TEXT'],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: {
                                voiceName: 'Aoede' // Giọng nữ dễ nghe
                            }
                        }
                    }
                },
                systemInstruction: {
                    parts: [{ text: SYSTEM_INSTRUCTION }]
                }
            }
        };

        console.log('[GeminiVoice] Sending setup');
        wsRef.current.send(JSON.stringify(setupMessage));
    }, []);

    // Handle incoming WebSocket messages
    const handleMessage = useCallback((event) => {
        try {
            const msg = JSON.parse(event.data);

            // Setup complete confirmation
            if (msg.setupComplete) {
                console.log('[GeminiVoice] Setup complete');
                setupCompleteRef.current = true;
                setConnectionStatus('ready');
                return;
            }

            // Handle server content
            if (msg.serverContent) {
                const content = msg.serverContent;

                // Model turn with parts
                if (content.modelTurn?.parts) {
                    for (const part of content.modelTurn.parts) {
                        // Text response
                        if (part.text) {
                            setAiResponse(prev => prev + part.text);
                        }
                        // Audio response (inline blob)
                        if (part.inlineData?.mimeType?.startsWith('audio/')) {
                            const audioBuffer = base64ToArrayBuffer(part.inlineData.data);
                            audioQueueRef.current.push(audioBuffer);
                            playNextAudio();
                        }
                    }
                }

                // Input transcription (what user said)
                if (content.inputTranscript) {
                    setTranscript(content.inputTranscript);
                }

                // Output transcription (what AI said)
                if (content.outputTranscript) {
                    setAiResponse(prev => prev + content.outputTranscript);
                }

                // Turn complete
                if (content.turnComplete) {
                    console.log('[GeminiVoice] Turn complete');
                }
            }

        } catch (e) {
            console.error('[GeminiVoice] Message parse error:', e);
        }
    }, [base64ToArrayBuffer, playNextAudio]);

    // Connect to Gemini Live API
    const connect = useCallback(async () => {
        if (!apiKey) {
            setError('Thiếu VITE_GEMINI_API_KEY. Vui lòng cấu hình trong .env');
            setConnectionStatus('error');
            return false;
        }

        if (!isAudioSupported) {
            setError('Trình duyệt không hỗ trợ Audio API');
            setConnectionStatus('error');
            return false;
        }

        try {
            setConnectionStatus('connecting');
            setError(null);

            // WebSocket URL cho Gemini Live API
            const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`;

            console.log('[GeminiVoice] Connecting to WebSocket...');
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log('[GeminiVoice] WebSocket connected');
                setIsConnected(true);
                sendSetup();
            };

            ws.onmessage = handleMessage;

            ws.onerror = (e) => {
                console.error('[GeminiVoice] WebSocket error:', e);
                setError('Lỗi kết nối WebSocket. Kiểm tra lại API key hoặc kết nối mạng.');
                setConnectionStatus('error');
                setIsConnected(false);
            };

            ws.onclose = (e) => {
                console.log('[GeminiVoice] WebSocket closed:', e.code, e.reason);
                setIsConnected(false);
                setIsListening(false);
                setConnectionStatus('disconnected');
                setupCompleteRef.current = false;
            };

            wsRef.current = ws;
            return true;

        } catch (e) {
            console.error('[GeminiVoice] Connect error:', e);
            setError('Không thể kết nối tới Gemini Live API');
            setConnectionStatus('error');
            return false;
        }
    }, [apiKey, isAudioSupported, sendSetup, handleMessage]);

    // Start listening (record and stream audio)
    const startListening = useCallback(async () => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            const connected = await connect();
            if (!connected) return;
            // Wait for setup complete
            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        if (!setupCompleteRef.current) {
            setError('Đang chờ kết nối hoàn tất...');
            return;
        }

        try {
            setError(null);

            // Request microphone permission
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: INPUT_SAMPLE_RATE,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            streamRef.current = stream;

            // Create audio context for processing
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: INPUT_SAMPLE_RATE
            });

            const source = audioCtx.createMediaStreamSource(stream);

            // Use ScriptProcessor for audio chunks
            const processor = audioCtx.createScriptProcessor(BUFFER_SIZE, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
                if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
                if (!setupCompleteRef.current) return;

                const inputData = e.inputBuffer.getChannelData(0);
                const pcm16 = floatTo16BitPCM(inputData);
                const base64Audio = arrayBufferToBase64(pcm16.buffer);

                // Send realtime input message
                const realtimeMessage = {
                    realtimeInput: {
                        mediaChunks: [{
                            mimeType: `audio/pcm;rate=${INPUT_SAMPLE_RATE}`,
                            data: base64Audio
                        }]
                    }
                };

                try {
                    wsRef.current.send(JSON.stringify(realtimeMessage));
                } catch (e) {
                    console.error('[GeminiVoice] Send error:', e);
                }
            };

            source.connect(processor);
            processor.connect(audioCtx.destination);

            setIsListening(true);
            setTranscript('');
            setAiResponse('');

            console.log('[GeminiVoice] Started listening');

        } catch (e) {
            console.error('[GeminiVoice] Microphone error:', e);
            if (e.name === 'NotAllowedError') {
                setError('Vui lòng cấp quyền microphone trong cài đặt trình duyệt.');
            } else if (e.name === 'NotFoundError') {
                setError('Không tìm thấy microphone. Hãy kiểm tra thiết bị.');
            } else {
                setError('Không thể truy cập microphone: ' + e.message);
            }
        }
    }, [connect, floatTo16BitPCM, arrayBufferToBase64]);

    // Stop listening
    const stopListening = useCallback(() => {
        console.log('[GeminiVoice] Stopping listening');

        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        setIsListening(false);

        // Send end of turn signal
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            try {
                const endMessage = {
                    clientContent: {
                        turnComplete: true
                    }
                };
                wsRef.current.send(JSON.stringify(endMessage));
            } catch (e) {
                console.error('[GeminiVoice] End signal error:', e);
            }
        }
    }, []);

    // Disconnect
    const disconnect = useCallback(() => {
        console.log('[GeminiVoice] Disconnecting');
        stopListening();

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(() => { });
            audioContextRef.current = null;
        }

        setupCompleteRef.current = false;
        audioQueueRef.current = [];
        setIsConnected(false);
        setConnectionStatus('disconnected');
    }, [stopListening]);

    // Send text message (fallback khi không dùng voice)
    const sendText = useCallback((text) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            setError('Chưa kết nối');
            return;
        }

        if (!setupCompleteRef.current) {
            setError('Đang chờ kết nối hoàn tất...');
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

        console.log('[GeminiVoice] Sending text:', text);
        wsRef.current.send(JSON.stringify(message));
        setTranscript(text);
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
        connectionStatus,
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
