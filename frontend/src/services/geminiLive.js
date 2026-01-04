import { API_BASE_URL } from '../utils/api';

// WebSocket endpoint (Direct Worker Proxy)
// Tự động chuyển http -> ws, https -> wss
const CLOUD_RUN_WS_URL = API_BASE_URL.replace(/^http/, 'ws') + '/api/ai/live';

/**
 * GeminiLiveService - Secure Voice Call Service
 * Kết nối qua Cloudflare Worker Durable Object Proxy
 * Không lộ API Key ở frontend
 */
export const GeminiLiveService = ({ onOpen, onClose, onAudioData, onTranscript, onError, onSetupComplete, onDisconnect }) => {
    let ws = null;
    let isConnected = false;
    let setupComplete = false;
    let keepaliveInterval = null;

    // Keepalive to prevent timeout
    const startKeepalive = () => {
        if (keepaliveInterval) clearInterval(keepaliveInterval);
        keepaliveInterval = setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                // Send keepalive ping if needed
                // ws.send(JSON.stringify({ clientContent: { turnComplete: true } }));
            }
        }, 15000);
    };

    const stopKeepalive = () => {
        if (keepaliveInterval) {
            clearInterval(keepaliveInterval);
            keepaliveInterval = null;
        }
    };

    // Connect qua Worker Durable Object proxy
    const connect = async () => {
        return new Promise((resolve, reject) => {
            try {
                console.log('[GeminiLive] Connecting to Secure Worker Proxy:', CLOUD_RUN_WS_URL);

                ws = new WebSocket(CLOUD_RUN_WS_URL);

                ws.onopen = () => {
                    console.log('[GeminiLive] WebSocket connected to Worker Proxy');
                    isConnected = true;
                    // Worker sẽ tự động connect Gemini và gửi 'connected' signal
                };

                ws.onmessage = async (event) => {
                    try {
                        let data;
                        if (event.data instanceof Blob) {
                            const text = await event.data.text();
                            data = JSON.parse(text);
                        } else {
                            data = JSON.parse(event.data);
                        }

                        // DO gửi message này khi đã connect thành công tới Gemini
                        if (data.type === 'connected') {
                            console.log('[GeminiLive] Worker Proxy connected to Gemini AI');
                            return;
                        }

                        if (data.type === 'error') {
                            console.error('[GeminiLive] Proxy error:', data.message);
                            if (onError) onError(data.message);
                            return;
                        }

                        // Nhận serverContent từ Gemini (qua Proxy)
                        if (data.serverContent) {
                            // Audio Response
                            if (data.serverContent.modelTurn?.parts?.[0]?.inlineData) {
                                // Direct binary data in base64
                                const audioData = data.serverContent.modelTurn.parts[0].inlineData.data;
                                if (onAudioData) onAudioData(audioData, 'audio/pcm;rate=24000');

                                // Auto play if AudioPlayer ref provided via context (not passed here directly but managed by hook)
                                // Hook will handle onAudioData
                            }

                            // Text transcript (user or model)
                            if (data.serverContent.modelTurn?.parts?.[0]?.text) {
                                if (onTranscript) onTranscript(data.serverContent.modelTurn.parts[0].text);
                            }

                            // Setup Complete signal
                            if (data.serverContent.turnComplete) {
                                if (!setupComplete) {
                                    setupComplete = true;
                                    console.log('[GeminiLive] Setup complete (Proxy)');
                                    startKeepalive();
                                    if (onSetupComplete) onSetupComplete();
                                    if (onOpen) onOpen();
                                    resolve({ success: true });
                                }
                            }
                        }

                    } catch (e) {
                        console.error('[GeminiLive] Parse error:', e);
                    }
                };

                ws.onerror = (error) => {
                    console.error('[GeminiLive] WebSocket error:', error);
                    if (onError) onError('Connection failed');
                    reject(error);
                };

                ws.onclose = (event) => {
                    console.log('[GeminiLive] WebSocket closed:', event.code, event.reason);
                    isConnected = false;
                    setupComplete = false;
                    stopKeepalive();
                    if (onDisconnect) onDisconnect();
                    if (onClose) onClose(event);
                };

            } catch (err) {
                console.error('[GeminiLive] Connect failed:', err);
                reject(err);
            }
        });
    };

    // Send audio data to backend proxy
    const sendAudio = (base64Data) => {
        if (!ws || !isConnected) {
            // console.warn('[GeminiLive] Not connected');
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
        if (!ws || !isConnected) {
            console.warn('[GeminiLive] Not connected');
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
        this.gainNode = null;
    }

    async init() {
        if (!this.audioContext) {
            this.audioContext = new AudioContext({ sampleRate: 24000 });
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
        }
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        this.scheduledTime = this.audioContext.currentTime;
    }

    // Add audio data to queue
    enqueue(base64Data) {
        this.queue.push(base64Data);
        this.processQueue();
    }

    // Process queue
    async processQueue() {
        if (this.isPlaying || this.queue.length === 0) return;

        this.isPlaying = true;

        while (this.queue.length > 0) {
            const chunk = this.queue.shift();
            await this.play(chunk);
        }

        this.isPlaying = false;
    }

    // Play base64 PCM audio
    async play(base64Data) {
        if (!this.audioContext) {
            await this.init();
        }

        try {
            const binaryString = atob(base64Data);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Convert 16-bit PCM to Float32
            const float32Data = new Float32Array(bytes.length / 2);
            const dataView = new DataView(bytes.buffer);

            for (let i = 0; i < float32Data.length; i++) {
                // Little Endian
                const int16 = dataView.getInt16(i * 2, true);
                float32Data[i] = int16 / 32768.0;
            }

            // Create AudioBuffer
            const audioBuffer = this.audioContext.createBuffer(1, float32Data.length, 24000);
            audioBuffer.getChannelData(0).set(float32Data);

            // Create Source
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.gainNode);

            // Schedule playback
            // Ensure we don't schedule in the past
            const startTime = Math.max(this.audioContext.currentTime, this.scheduledTime);
            source.start(startTime);

            // Update scheduled time for next chunk
            this.scheduledTime = startTime + audioBuffer.duration;

            // Wait for playback to finish approx (optional, for flow control)
            return new Promise(resolve => {
                source.onended = resolve;
                // Fallback timeout in case onended doesn't fire
                setTimeout(resolve, audioBuffer.duration * 1000 + 100);
            });

        } catch (error) {
            console.error('Audio playback error:', error);
        }
    }

    // Resume audio context if suspended
    async resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    stop() {
        if (this.audioContext) {
            try {
                this.audioContext.close();
            } catch (e) { }
            this.audioContext = null;
        }
        this.scheduledTime = 0;
        this.isPlaying = false;
        this.queue = [];
    }
}
