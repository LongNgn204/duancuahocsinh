// src/services/geminiLive.js
// Gemini Live API service for real-time voice chat
// Uses WebSocket for bidirectional audio streaming
// Model: gemini-2.5-flash-native-audio-preview-12-2025

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash-native-audio-preview-12-2025';

// WebSocket URL for Gemini Live API
const LIVE_API_URL = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${GEMINI_API_KEY}`;

// System prompt for voice assistant
const SYSTEM_INSTRUCTION = `Bạn là "Bạn Đồng Hành", một người bạn AI thân thiệt, ấm áp và thấu hiểu dành cho học sinh Việt Nam.

Nguyên tắc giao tiếp bằng giọng:
- Nói ngắn gọn, tự nhiên như trò chuyện thật
- Dùng ngôn ngữ gần gũi với học sinh
- Lắng nghe và đồng cảm
- Nếu phát hiện dấu hiệu khủng hoảng tinh thần, nhẹ nhàng khuyên tìm người lớn đáng tin

Bạn có thể:
- Lắng nghe tâm sự về học tập, bạn bè, gia đình
- Đưa lời khuyên về quản lý stress, cảm xúc
- Trò chuyện vui vẻ, động viên tinh thần`;

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

    // Connect to Gemini Live API
    const connect = () => {
        return new Promise((resolve, reject) => {
            try {
                ws = new WebSocket(LIVE_API_URL);

                ws.onopen = () => {
                    console.log('[GeminiLive] WebSocket connected');
                    isConnected = true;

                    // Send setup message
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

                        // Handle setup complete
                        if (data.setupComplete) {
                            console.log('[GeminiLive] Setup complete');
                            setupComplete = true;
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
        if (ws) {
            ws.close();
            ws = null;
        }
        isConnected = false;
        setupComplete = false;
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
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 24000
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

    // Schedule buffer for playback immediately (gapless)
    scheduleBuffer(samples) {
        if (!this.audioContext) return;

        // Create audio buffer
        const audioBuffer = this.audioContext.createBuffer(1, samples.length, 24000);
        audioBuffer.getChannelData(0).set(samples);

        // Create source node
        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.audioContext.destination);

        // Calculate start time - ensure gapless playback
        const currentTime = this.audioContext.currentTime;
        const startTime = Math.max(currentTime, this.scheduledTime);

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
