// src/services/geminiLive.js
// Chú thích: Gemini Live API - v3.0 Dùng Durable Objects proxy WebSocket
// Backend Durable Objects sẽ proxy WebSocket đến Vertex AI, xử lý authentication

// Backend API URL
const BACKEND_API_URL = import.meta.env.VITE_API_URL || 'https://ban-dong-hanh-worker.stu725114073.workers.dev';
const LIVE_ENDPOINT = `${BACKEND_API_URL}/api/ai/live`;

/**
 * Check if Voice Call is available
 * Hiện tại Voice Call chưa hoạt động do Durable Objects WebSocket có vấn đề
 */
export function isLiveAPIAvailable() {
    return false; // TẠM DISABLE - Durable Objects WebSocket đang debug
}

export function getVoiceCallDisabledMessage() {
    return 'Voice Call đang trong quá trình nâng cấp. Vui lòng sử dụng Chat text trong thời gian này.';
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

    // Connect qua Backend Durable Objects - proxy WebSocket đến Vertex AI
    const connect = async () => {
        return new Promise(async (resolve, reject) => {
            try {
                // Kết nối đến backend WebSocket endpoint (Durable Objects)
                // Backend sẽ proxy đến Vertex AI và xử lý authentication
                const wsUrl = LIVE_ENDPOINT.replace('https://', 'wss://').replace('http://', 'ws://');
                console.log('[GeminiLive] Connecting to backend Durable Objects:', wsUrl);

                ws = new WebSocket(wsUrl);

                ws.onopen = () => {
                    console.log('[GeminiLive] WebSocket connected to backend');
                    isConnected = true;
                    // Backend Durable Objects sẽ tự động setup và connect đến Vertex AI
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

                        // Handle connected message from backend
                        if (data.type === 'connected') {
                            console.log('[GeminiLive] Backend connected to Vertex AI');
                            return;
                        }

                        // Handle error from backend
                        if (data.type === 'error') {
                            console.error('[GeminiLive] Backend error:', data.message);
                            if (onError) onError(new Error(data.message));
                            return;
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
