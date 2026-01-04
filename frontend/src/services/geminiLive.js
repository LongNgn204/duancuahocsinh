// src/services/geminiLive.js
// Chú thích: Voice Call với Gemini Live API qua Cloudflare Durable Objects proxy

// API Base URL - detect from environment
const API_BASE_URL = import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost'
        ? 'http://localhost:8787'
        : 'https://ban-dong-hanh-worker.hoanglong17.workers.dev');

// WebSocket URL - chuyển từ https:// sang wss://
const CLOUD_RUN_WS_URL = API_BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://') + '/api/ai/live';

/**
 * Check if Voice Call is available
 * Chú thích: Đã bật với Cloudflare Durable Objects proxy
 */
export function isLiveAPIAvailable() {
    return true; // ✓ Đã bật với Durable Objects proxy
}

export function getVoiceCallDisabledMessage() {
    return '🔧 Tính năng Gọi điện AI đang được bảo trì nâng cấp. Vui lòng sử dụng Trò chuyện văn bản trong thời gian này!';
}

/**
 * Create Gemini Live session for voice chat
 * @param {Object} callbacks - Event callbacks
 * @param {Function} callbacks.onAudioData - Called when audio data received (base64)
 * @param {Function} callbacks.onTranscript - Called when transcript received
 * @param {Function} callbacks.onError - Called on error
 * @param {Function} callbacks.onClose - Called when connection closes
 * @param {Function} callbacks.onOpen - Called when connection opens
 * @returns {Object} Session controller
 */
export function createLiveSession(callbacks = {}) {
    const { onAudioData, onTranscript, onError, onClose, onOpen } = callbacks;

    let ws = null;
    let isConnected = false;
    let setupComplete = false;
    let keepaliveInterval = null;

    // Start keepalive to prevent connection timeout
    const startKeepalive = () => {
        stopKeepalive();
        keepaliveInterval = setInterval(() => {
            if (ws && isConnected) {
                // Send empty message as keepalive
                try {
                    ws.send(JSON.stringify({ clientContent: { turnComplete: true } }));
                } catch (e) {
                    console.warn('[GeminiLive] Keepalive failed:', e);
                }
            }
        }, 15000); // Every 15 seconds
    };

    const stopKeepalive = () => {
        if (keepaliveInterval) {
            clearInterval(keepaliveInterval);
            keepaliveInterval = null;
        }
    };

    // Chú thích: Connect trực tiếp đến Vertex AI Gemini Live API
    // Backend cấp access token, frontend connect thẳng không qua proxy
    const connect = async () => {
        return new Promise(async (resolve, reject) => {
            try {
                // 1. Lấy config từ backend (access token + endpoint)
                console.log('[GeminiLive] Fetching config from backend...');
                const configRes = await fetch(API_BASE_URL + '/api/ai/live-config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!configRes.ok) {
                    const err = await configRes.json().catch(() => ({}));
                    throw new Error(err.message || `Config failed: ${configRes.status}`);
                }

                const config = await configRes.json();
                console.log('[GeminiLive] Got config, connecting to Gemini Live API...');

                // 2. Connect trực tiếp đến Gemini Live API với API key
                // Chú thích: Dùng key= query param cho Gemini AI Studio API
                const wsUrlWithAuth = `${config.geminiEndpoint}?key=${config.apiKey}`;
                ws = new WebSocket(wsUrlWithAuth);

                ws.onopen = () => {
                    console.log('[GeminiLive] WebSocket connected to Vertex AI');
                    isConnected = true;

                    // 3. Gửi setup message với authentication và system instruction
                    const setupMessage = {
                        setup: {
                            model: config.model,
                            generationConfig: {
                                responseModalities: ['AUDIO'],
                                speechConfig: {
                                    // Chú thích: Aoede là giọng nữ thân thiện
                                    voiceConfig: {
                                        prebuiltVoiceConfig: {
                                            voiceName: 'Aoede' // Giọng nữ
                                        }
                                    }
                                }
                            },
                            systemInstruction: {
                                parts: [{ text: config.systemInstruction }]
                            }
                        }
                    };

                    // Chú thích: Gửi Bearer token trong setup message vì WebSocket API không hỗ trợ headers
                    // Thêm auth header vào URL query param
                    ws.send(JSON.stringify(setupMessage));
                    console.log('[GeminiLive] Setup message sent');
                };

                ws.onmessage = async (event) => {
                    try {
                        let data;

                        // Handle Blob (binary) messages
                        if (event.data instanceof Blob) {
                            const text = await event.data.text();
                            data = JSON.parse(text);
                        } else {
                            // Handle text messages
                            data = JSON.parse(event.data);
                        }

                        // Handle setupComplete from Vertex AI
                        if (data.setupComplete) {
                            console.log('[GeminiLive] Setup complete');
                            setupComplete = true;
                            startKeepalive();
                            if (onOpen) onOpen();
                            resolve({ success: true });
                            return;
                        }

                        // Handle server content (audio response from Vertex AI)
                        if (data.serverContent) {
                            const content = data.serverContent;

                            // Check for interruption
                            if (content.interrupted) {
                                console.log('[GeminiLive] Interrupted by user');
                                return;
                            }

                            // Handle model turn with audio
                            if (content.modelTurn && content.modelTurn.parts) {
                                for (const part of content.modelTurn.parts) {
                                    // Audio data
                                    if (part.inlineData && part.inlineData.data) {
                                        if (onAudioData) {
                                            onAudioData(part.inlineData.data, part.inlineData.mimeType);
                                        }
                                    }
                                    // Text transcript
                                    if (part.text) {
                                        if (onTranscript) {
                                            onTranscript(part.text);
                                        }
                                    }
                                }
                            }

                            // Handle turn complete
                            if (content.turnComplete) {
                                console.log('[GeminiLive] Turn complete');
                            }
                        }
                    } catch (e) {
                        console.error('[GeminiLive] Parse error:', e);
                    }
                };

                ws.onerror = (error) => {
                    console.error('[GeminiLive] WebSocket error:', error);
                    if (onError) onError(error);
                    reject(error);
                };

                ws.onclose = (event) => {
                    console.log('[GeminiLive] WebSocket closed:', event.code, event.reason);
                    isConnected = false;
                    setupComplete = false;
                    stopKeepalive();
                    if (onClose) onClose(event);
                };

                // Timeout for setup
                setTimeout(() => {
                    if (!setupComplete) {
                        console.warn('[GeminiLive] Setup timeout');
                        reject(new Error('Setup timeout'));
                    }
                }, 15000);

            } catch (err) {
                console.error('[GeminiLive] Connection error:', err);
                reject(err);
            }
        });
    };

    // Send audio data to Vertex AI (via backend proxy)
    const sendAudio = (base64Data) => {
        if (!ws || !isConnected || !setupComplete) {
            console.warn('[GeminiLive] Not ready to send audio');
            return false;
        }

        try {
            const message = {
                realtimeInput: {
                    mediaChunks: [{
                        mimeType: "audio/pcm;rate=16000",
                        data: base64Data
                    }]
                }
            };
            ws.send(JSON.stringify(message));
            return true;
        } catch (e) {
            console.error('[GeminiLive] Send audio error:', e);
            return false;
        }
    };

    // Send text message
    const sendText = (text) => {
        if (!ws || !isConnected || !setupComplete) {
            console.warn('[GeminiLive] Not ready to send text');
            return false;
        }

        try {
            const message = {
                clientContent: {
                    turns: [{
                        role: "user",
                        parts: [{ text: text }]
                    }],
                    turnComplete: true
                }
            };
            ws.send(JSON.stringify(message));
            return true;
        } catch (e) {
            console.error('[GeminiLive] Send text error:', e);
            return false;
        }
    };

    // Disconnect
    const disconnect = () => {
        stopKeepalive();
        if (ws) {
            ws.close();
            ws = null;
        }
        isConnected = false;
        setupComplete = false;
    };

    return {
        connect,
        sendAudio,
        sendText,
        disconnect,
        isConnected: () => isConnected,
        isReady: () => isConnected && setupComplete
    };
}

// ========================================================================
// Audio processing utilities
// ========================================================================

/**
 * AudioPlayer - Play PCM audio from base64 data
 */
export class AudioPlayer {
    constructor() {
        this.audioContext = null;
        this.scheduledTime = 0;
        this.isPlaying = false;
        this.queue = [];
    }

    async init() {
        if (!this.audioContext) {
            this.audioContext = new AudioContext({ sampleRate: 24000 });
        }
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        this.scheduledTime = this.audioContext.currentTime;
    }

    // Play base64 PCM audio
    async play(base64Data) {
        if (!this.audioContext) {
            await this.init();
        }

        try {
            // Decode base64 to ArrayBuffer
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Convert to Float32 (assuming 16-bit PCM)
            const int16Array = new Int16Array(bytes.buffer);
            const float32Array = new Float32Array(int16Array.length);
            for (let i = 0; i < int16Array.length; i++) {
                float32Array[i] = int16Array[i] / 32768.0;
            }

            // Create audio buffer
            const audioBuffer = this.audioContext.createBuffer(
                1, // mono
                float32Array.length,
                24000 // sample rate
            );
            audioBuffer.copyToChannel(float32Array, 0);

            // Schedule playback
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.audioContext.destination);

            const startTime = Math.max(this.scheduledTime, this.audioContext.currentTime);
            source.start(startTime);
            this.scheduledTime = startTime + audioBuffer.duration;
            this.isPlaying = true;

            source.onended = () => {
                if (this.scheduledTime <= this.audioContext.currentTime) {
                    this.isPlaying = false;
                }
            };

        } catch (e) {
            console.error('[AudioPlayer] Play error:', e);
        }
    }

    // Chú thích: Resume AudioContext (cần gọi sau user interaction)
    async resume() {
        if (!this.audioContext) {
            await this.init();
        } else if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    // Chú thích: Thêm audio vào queue để phát
    enqueue(base64Data) {
        this.play(base64Data);
    }

    stop() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.scheduledTime = 0;
        this.isPlaying = false;
    }
}

/**
 * AudioRecorder - Record audio and convert to base64 PCM
 */
export class AudioRecorder {
    constructor(onData) {
        this.onData = onData;
        this.stream = null;
        this.audioContext = null;
        this.processor = null;
        this.source = null;
        this.isRecording = false;
    }

    async start() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });

            this.audioContext = new AudioContext({ sampleRate: 16000 });
            this.source = this.audioContext.createMediaStreamSource(this.stream);

            // Use ScriptProcessor for audio processing
            this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

            this.processor.onaudioprocess = (e) => {
                if (!this.isRecording) return;

                const inputData = e.inputBuffer.getChannelData(0);

                // Convert to 16-bit PCM
                const int16Array = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    const s = Math.max(-1, Math.min(1, inputData[i]));
                    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }

                // Convert to base64
                const uint8Array = new Uint8Array(int16Array.buffer);
                let binary = '';
                for (let i = 0; i < uint8Array.length; i++) {
                    binary += String.fromCharCode(uint8Array[i]);
                }
                const base64 = btoa(binary);

                if (this.onData) {
                    this.onData(base64);
                }
            };

            this.source.connect(this.processor);
            this.processor.connect(this.audioContext.destination);
            this.isRecording = true;

            console.log('[AudioRecorder] Started recording');

        } catch (e) {
            console.error('[AudioRecorder] Start error:', e);
            throw e;
        }
    }

    stop() {
        this.isRecording = false;

        if (this.processor) {
            this.processor.disconnect();
            this.processor = null;
        }

        if (this.source) {
            this.source.disconnect();
            this.source = null;
        }

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        console.log('[AudioRecorder] Stopped recording');
    }
}
