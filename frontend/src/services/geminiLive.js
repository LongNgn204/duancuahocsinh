// src/services/geminiLive.js
// Gemini Live API service for real-time voice chat
// Uses WebSocket for bidirectional audio streaming
// Model: gemini-2.5-flash-native-audio-preview-12-2025

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash-native-audio-preview-12-2025';

// WebSocket URL for Gemini Live API
const LIVE_API_URL = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${GEMINI_API_KEY}`;

// System prompt for voice assistant - Upgraded v2.0
const SYSTEM_INSTRUCTION = `Bạn là "Bạn Đồng Hành", một người bạn AI thông minh dành cho học sinh Việt Nam. Bạn được cập nhật kiến thức mới nhất mỗi ngày.

CÁCH NÓI CHUYỆN:
- Nói tự nhiên, thoải mái như đang nói chuyện với bạn bè
- KHÔNG đọc emoji, icon hay ký hiệu đặc biệt
- KHÔNG liệt kê kiểu 1, 2, 3 hay gạch đầu dòng
- Nói rõ ràng, dễ hiểu, tránh từ ngữ phức tạp
- Nhớ những gì người dùng đã chia sẻ và tham chiếu lại
- Thể hiện sự quan tâm và đồng cảm

BẠN CÓ THỂ GIÚP:
- Học tập: hỏi bài, giải thích kiến thức, ôn thi
- Tâm lý: lắng nghe tâm sự, chia sẻ, động viên
- Cuộc sống: bạn bè, gia đình, định hướng tương lai
- Giải trí: trò chuyện vui, kể chuyện

LƯU Ý:
- Nếu người dùng im lặng, hãy đợi họ nói - không cần hỏi gì thêm
- Nếu phát hiện dấu hiệu khủng hoảng, khuyên tìm người lớn đáng tin`;

/**
 * Check if Gemini Live API is available
 */
export function isLiveAPIAvailable() {
    return Boolean(GEMINI_API_KEY);
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

    // Connect to Gemini Live API
    const connect = () => {
        return new Promise((resolve, reject) => {
            try {
                ws = new WebSocket(LIVE_API_URL);

                ws.onopen = () => {
                    console.log('[GeminiLive] WebSocket connected');
                    isConnected = true;

                    // Send setup message with optimized settings
                    const setupMessage = {
                        setup: {
                            model: `models/${MODEL}`,
                            generationConfig: {
                                responseModalities: ["AUDIO"],
                                speechConfig: {
                                    voiceConfig: {
                                        prebuiltVoiceConfig: {
                                            voiceName: "Aoede" // Female voice
                                        }
                                    }
                                }
                            },
                            systemInstruction: {
                                parts: [{ text: SYSTEM_INSTRUCTION }]
                            },
                            // Enable automatic turn detection for faster response
                            realtimeInputConfig: {
                                automaticActivityDetection: {
                                    disabled: false
                                }
                            }
                        }
                    };

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

                        if (data.setupComplete) {
                            console.log('[GeminiLive] Setup complete');
                            setupComplete = true;

                            // Start keepalive to prevent connection timeout
                            startKeepalive();

                            if (onOpen) onOpen();
                            resolve({ success: true });
                            return;
                        }

                        // Handle server content (audio response)
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

            } catch (err) {
                console.error('[GeminiLive] Connection error:', err);
                reject(err);
            }
        });
    };

    // Send audio data to Gemini
    const sendAudio = (base64Data) => {
        if (!ws || !isConnected || !setupComplete) {
            console.warn('[GeminiLive] Not ready to send audio');
            return false;
        }

        const message = {
            realtimeInput: {
                mediaChunks: [{
                    mimeType: "audio/pcm;rate=16000",
                    data: base64Data
                }]
            }
        };

        try {
            ws.send(JSON.stringify(message));
            return true;
        } catch (err) {
            console.error('[GeminiLive] Send error:', err);
            return false;
        }
    };

    // Send text message
    const sendText = (text) => {
        if (!ws || !isConnected || !setupComplete) {
            console.warn('[GeminiLive] Not ready to send text');
            return false;
        }

        const message = {
            clientContent: {
                turns: [{
                    role: "user",
                    parts: [{ text }]
                }],
                turnComplete: true
            }
        };

        try {
            ws.send(JSON.stringify(message));
            return true;
        } catch (err) {
            console.error('[GeminiLive] Send text error:', err);
            return false;
        }
    };

    // Close connection
    const close = () => {
        stopKeepalive();
        if (ws) {
            ws.close();
            ws = null;
        }
        isConnected = false;
        setupComplete = false;
    };

    // Start keepalive ping to prevent timeout
    const startKeepalive = () => {
        if (keepaliveInterval) return;

        keepaliveInterval = setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN && setupComplete) {
                // Send a minimal audio chunk to keep connection alive
                // This is silent audio (all zeros)
                const silentAudio = btoa(String.fromCharCode.apply(null, new Uint8Array(320))); // 10ms of silence at 16kHz
                const message = {
                    realtimeInput: {
                        mediaChunks: [{
                            mimeType: "audio/pcm;rate=16000",
                            data: silentAudio
                        }]
                    }
                };
                try {
                    ws.send(JSON.stringify(message));
                    console.log('[GeminiLive] Keepalive sent');
                } catch (err) {
                    console.error('[GeminiLive] Keepalive error:', err);
                }
            }
        }, 15000); // Every 15 seconds
    };

    // Stop keepalive
    const stopKeepalive = () => {
        if (keepaliveInterval) {
            clearInterval(keepaliveInterval);
            keepaliveInterval = null;
        }
    };

    // Check if connected
    const isReady = () => isConnected && setupComplete;

    return {
        connect,
        sendAudio,
        sendText,
        close,
        isReady
    };
}

/**
 * PCM Audio Player for 24kHz output from Gemini
 * Optimized with scheduled playback for gapless audio
 */
export class AudioPlayer {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.onPlaybackStart = null;
        this.onPlaybackEnd = null;
        this.scheduledTime = 0; // Track scheduled audio end time
        this.pendingBuffers = []; // Pending audio buffers
        this.playbackStarted = false;
        this.lastSourceNode = null;
        this.checkEndInterval = null;
    }

    init() {
        if (!this.audioContext) {
            // Use interactive latency hint for lowest latency
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 24000,
                latencyHint: 'interactive' // Lowest latency for real-time audio
            });
            this.scheduledTime = this.audioContext.currentTime;
        }
        return this.audioContext;
    }

    // Add audio chunk to queue (base64 PCM) - schedule immediately for gapless playback
    enqueue(base64Data) {
        try {
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Convert to Float32 for Web Audio
            const int16Array = new Int16Array(bytes.buffer);
            const float32Array = new Float32Array(int16Array.length);
            for (let i = 0; i < int16Array.length; i++) {
                float32Array[i] = int16Array[i] / 32768.0;
            }

            this.init();
            this.scheduleBuffer(float32Array);
        } catch (err) {
            console.error('[AudioPlayer] Enqueue error:', err);
        }
    }

    // Schedule buffer for playback immediately (gapless, low latency)
    scheduleBuffer(samples) {
        if (!this.audioContext) return;

        // Resume context if suspended (needed for autoplay policy)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        // Create audio buffer
        const audioBuffer = this.audioContext.createBuffer(1, samples.length, 24000);
        audioBuffer.getChannelData(0).set(samples);

        // Create source node
        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.audioContext.destination);

        // Calculate start time - minimize latency
        const currentTime = this.audioContext.currentTime;
        // If this is the first chunk or no audio scheduled, start immediately
        const startTime = this.playbackStarted
            ? Math.max(currentTime, this.scheduledTime)
            : currentTime + 0.01; // Start with tiny delay to ensure smooth

        // Update scheduled end time
        const duration = samples.length / 24000;
        this.scheduledTime = startTime + duration;

        // Start playback
        source.start(startTime);
        this.lastSourceNode = source;

        // Handle playback state
        if (!this.playbackStarted) {
            this.playbackStarted = true;
            this.isPlaying = true;
            console.log('[AudioPlayer] Playback started');
            if (this.onPlaybackStart) this.onPlaybackStart();

            // Start checking for playback end
            this.startEndCheck();
        }
    }

    // Check if all audio has finished playing
    startEndCheck() {
        if (this.checkEndInterval) return;

        this.checkEndInterval = setInterval(() => {
            if (!this.audioContext) {
                this.clearEndCheck();
                return;
            }

            // If current time has passed all scheduled audio
            if (this.audioContext.currentTime > this.scheduledTime + 0.1) {
                this.isPlaying = false;
                this.playbackStarted = false;
                if (this.onPlaybackEnd) this.onPlaybackEnd();
                this.clearEndCheck();
            }
        }, 100);
    }

    clearEndCheck() {
        if (this.checkEndInterval) {
            clearInterval(this.checkEndInterval);
            this.checkEndInterval = null;
        }
    }

    // Clear queue and stop playback
    stop() {
        this.clearEndCheck();
        this.pendingBuffers = [];
        this.isPlaying = false;
        this.playbackStarted = false;
        this.scheduledTime = 0;
        if (this.audioContext && this.audioContext.state === 'running') {
            this.audioContext.suspend();
        }
    }

    // Resume audio context (needed after user interaction)
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    destroy() {
        this.stop();
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}
