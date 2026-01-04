import { API_BASE_URL } from '../utils/api';

/**
 * Audio Player Helper
 * Manages audio queue and playback (PCM16 / 24kHz usually, but OpenAI delta is base64 PCM16)
 * OpenAI sends raw PCM16 24kHz mono. Browser needs Float32 for AudioContext.
 */
export class AudioPlayer {
    constructor(sampleRate = 24000) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate });
        this.audioQueue = [];
        this.isPlaying = false;
        this.startTime = 0;
        this.sampleRate = sampleRate;

        // Callback
        this.onPlaybackStart = null;
        this.onPlaybackEnd = null;
    }

    // Convert Base64 PCM16Int to Float32
    base64ToFloat32(base64) {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // PCM16 -> Int16Array
        const int16Array = new Int16Array(bytes.buffer);
        const float32Array = new Float32Array(int16Array.length);

        // Convert Int16 to Float32 range [-1, 1]
        for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / 32768;
        }

        return float32Array;
    }

    enqueue(base64Audio) {
        if (!base64Audio) return;

        try {
            const audioData = this.base64ToFloat32(base64Audio);
            this.audioQueue.push(audioData);

            if (!this.isPlaying) {
                this.playNext();
            }
        } catch (e) {
            console.error('[AudioPlayer] Decode error:', e);
        }
    }

    async playNext() {
        if (this.audioQueue.length === 0) {
            this.isPlaying = false;
            // Notify playback ended if queue is empty
            if (this.onPlaybackEnd) this.onPlaybackEnd();
            return;
        }

        if (!this.isPlaying) {
            this.isPlaying = true;
            // Notify playback started
            if (this.onPlaybackStart) this.onPlaybackStart();
        }

        const audioData = this.audioQueue.shift();
        const buffer = this.audioContext.createBuffer(1, audioData.length, this.sampleRate);
        buffer.getChannelData(0).set(audioData);

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);

        // Calculate start time to ensure gapless playback
        const currentTime = this.audioContext.currentTime;
        if (this.startTime < currentTime) {
            this.startTime = currentTime;
        }

        source.start(this.startTime);
        this.startTime += buffer.duration;

        source.onended = () => {
            if (this.audioQueue.length === 0) {
                // Check logic, wait for next chunks slightly?
                // Simple implementation: just proceed
            }
            this.playNext(); // Recursively play next
        };
    }

    stop() {
        this.isPlaying = false;
        this.audioQueue = [];
        this.startTime = 0;
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    resume() {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}

/**
 * OpenAI Realtime Service Factory
 */
export function OpenAIRealtimeService(config) {
    let ws = null;
    let keepAliveInterval = null;

    const {
        onOpen,
        onClose,
        onMessage,
        onError,
        onAudioDelta,
        onTranscriptDelta
    } = config;

    // Connect function
    async function connect() {
        let url = `${API_BASE_URL}/api/ai/live`;
        url = url.replace('http', 'ws'); // Ensure WS/WSS

        console.log('[OpenAIService] Connecting to Secure Worker Proxy:', url);

        try {
            ws = new WebSocket(url);

            ws.onopen = () => {
                console.log('[OpenAIService] Connected');
                if (onOpen) onOpen();

                // Keep alive logic if needed (handled by browser usually)
            };

            ws.onclose = (event) => {
                console.log('[OpenAIService] Closed:', event.code, event.reason);
                if (onClose) onClose(event);
            };

            ws.onerror = (error) => {
                console.error('[OpenAIService] Error:', error);
                if (onError) onError(error);
            };

            ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);

                    // Handle OpenAI Events
                    switch (msg.type) {
                        case 'error':
                            console.error('[OpenAI] Server Error:', msg.error || msg.message);
                            if (onError) onError(msg);
                            break;

                        case 'session.updated':
                            console.log('[OpenAI] Session Updated');
                            break;

                        case 'response.audio.delta':
                            // Audio output chunk (base64)
                            if (onAudioDelta && msg.delta) {
                                onAudioDelta(msg.delta);
                            }
                            break;

                        case 'response.audio_transcript.delta':
                            // Text output chunk
                            if (onTranscriptDelta && msg.delta) {
                                onTranscriptDelta(msg.delta);
                            }
                            break;

                        case 'input_audio_buffer.speech_started':
                            console.log('[OpenAI] User speech started (VAD)');
                            break;

                        case 'input_audio_buffer.speech_stopped':
                            console.log('[OpenAI] User speech stopped (VAD)');
                            break;

                        default:
                            if (onMessage) onMessage(msg);
                    }

                } catch (e) {
                    // Ignore non-JSON or parse error
                }
            };

        } catch (e) {
            console.error('[OpenAIService] Init Error:', e);
            if (onError) onError(e);
        }
    }

    // Send audio (base64 pcm16)
    function sendAudio(base64Audio) {
        if (ws && ws.readyState === WebSocket.OPEN) {
            // OpenAI Realtime Input Event
            const msg = {
                type: "input_audio_buffer.append",
                audio: base64Audio
            };
            ws.send(JSON.stringify(msg));
        }
    }

    // Commit audio buffer (force response generation) - Optional if VAD is on
    function commitAudio() {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "input_audio_buffer.commit" }));
            ws.send(JSON.stringify({ type: "response.create" })); // Trigger response
        }
    }

    // Send text message
    function sendText(text) {
        if (ws && ws.readyState === WebSocket.OPEN) {
            // Send text as a user message item
            const msg = {
                type: "conversation.item.create",
                item: {
                    type: "message",
                    role: "user",
                    content: [
                        {
                            type: "input_text",
                            text: text
                        }
                    ]
                }
            };
            ws.send(JSON.stringify(msg));

            // Trigger response
            ws.send(JSON.stringify({ type: "response.create" }));
        }
    }

    function disconnect() {
        if (ws) {
            ws.close();
            ws = null;
        }
    }

    function isReady() {
        return ws && ws.readyState === WebSocket.OPEN;
    }

    return {
        connect,
        sendAudio,
        commitAudio,
        sendText,
        disconnect,
        isReady
    };
}
