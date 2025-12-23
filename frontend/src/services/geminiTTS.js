// src/services/geminiTTS.js
// Gemini TTS API service for Text-to-Speech
// Model: gemini-2.5-pro-preview-tts
// Fallback: Browser SpeechSynthesis

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const TTS_MODEL = 'gemini-2.5-pro-preview-tts';
const TTS_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent`;

// Voice options - Aoede works well for Vietnamese
const DEFAULT_VOICE = 'Aoede';

/**
 * Check if Gemini TTS is available
 */
export function isGeminiTTSAvailable() {
    return Boolean(GEMINI_API_KEY);
}

/**
 * Remove emoji from text before TTS
 */
function stripEmoji(text) {
    if (!text) return '';
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
        .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols Extended-A
        .replace(/[\u{231A}-\u{2B55}]/gu, '')   // Misc symbols
        .replace(/[\u{23E9}-\u{23FA}]/gu, '')   // Symbols
        .replace(/[\u{25AA}-\u{25FE}]/gu, '')   // Shapes
        .replace(/🆘|📞|🌙|💪|🎮|🧘|📖|✨|🌟|⭐|💬|🤖|🎯|💡|❤️|💚|💙|🔵|🔴|🟢|🟡|⚠️|✅|❌|🔥|👋|👍|👎|🙏|💕|🌈|☀️|🌙|⏰|📝|📊|🏆|🎉|😊|😢|😤|😐|🌸/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

/**
 * Audio Player for Gemini TTS output (24kHz PCM)
 */
class TTSAudioPlayer {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.currentSource = null;
        this.onEnd = null;
        this.onError = null;
    }

    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 24000 // Gemini TTS outputs 24kHz audio
            });
        }
        return this.audioContext;
    }

    /**
     * Play base64 PCM audio from Gemini TTS
     */
    async play(base64Data) {
        try {
            this.init();

            // Resume audio context if suspended (needed after user interaction)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            // Decode base64 to binary
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Convert Int16 PCM to Float32 for Web Audio
            const int16Array = new Int16Array(bytes.buffer);
            const float32Array = new Float32Array(int16Array.length);
            for (let i = 0; i < int16Array.length; i++) {
                float32Array[i] = int16Array[i] / 32768.0;
            }

            // Create audio buffer
            const audioBuffer = this.audioContext.createBuffer(1, float32Array.length, 24000);
            audioBuffer.getChannelData(0).set(float32Array);

            // Stop any current playback
            this.stop();

            // Create and play source
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.audioContext.destination);

            source.onended = () => {
                this.isPlaying = false;
                this.currentSource = null;
                if (this.onEnd) this.onEnd();
            };

            this.currentSource = source;
            this.isPlaying = true;
            source.start(0);

            console.log('[GeminiTTS] Playing audio, duration:', audioBuffer.duration.toFixed(2), 's');

        } catch (error) {
            console.error('[GeminiTTS] Play error:', error);
            this.isPlaying = false;
            if (this.onError) this.onError(error);
            throw error;
        }
    }

    stop() {
        if (this.currentSource) {
            try {
                this.currentSource.stop();
            } catch (e) {
                // Ignore if already stopped
            }
            this.currentSource = null;
        }
        this.isPlaying = false;
    }

    destroy() {
        this.stop();
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}

// Global audio player instance
let audioPlayer = null;

function getAudioPlayer() {
    if (!audioPlayer) {
        audioPlayer = new TTSAudioPlayer();
    }
    return audioPlayer;
}

/**
 * Generate speech from text using Gemini TTS API
 * @param {string} text - Text to convert to speech
 * @param {Object} options - TTS options
 * @returns {Promise<string>} - Base64 encoded PCM audio
 */
export async function generateSpeech(text, options = {}) {
    const { voice = DEFAULT_VOICE, style = '' } = options;

    if (!isGeminiTTSAvailable()) {
        throw new Error('Gemini API key not configured');
    }

    // Clean text - remove emoji
    const cleanText = stripEmoji(text);
    if (!cleanText) {
        throw new Error('No text to speak after cleaning');
    }

    // Prepare prompt - can include style instructions
    let prompt = cleanText;
    if (style) {
        prompt = `${style}: ${cleanText}`;
    }

    console.log('[GeminiTTS] Generating speech for:', cleanText.substring(0, 50) + '...');

    try {
        const response = await fetch(`${TTS_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    responseModalities: ['AUDIO'],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: {
                                voiceName: voice
                            }
                        }
                    }
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[GeminiTTS] API Error:', errorText);
            throw new Error(`Gemini TTS API error: ${response.status}`);
        }

        const data = await response.json();
        const audioData = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (!audioData) {
            throw new Error('No audio data in response');
        }

        console.log('[GeminiTTS] Speech generated successfully');
        return audioData;

    } catch (error) {
        console.error('[GeminiTTS] Generate error:', error);
        throw error;
    }
}

/**
 * Speak text using Gemini TTS (with browser TTS fallback)
 * @param {string} text - Text to speak
 * @param {Object} options - Options
 * @returns {Promise<void>}
 */
export async function speak(text, options = {}) {
    const { voice = DEFAULT_VOICE, fallbackToBrowser = true, onEnd, onError } = options;

    const player = getAudioPlayer();

    // Try Gemini TTS first
    if (isGeminiTTSAvailable()) {
        try {
            const audioData = await generateSpeech(text, { voice });

            player.onEnd = onEnd;
            player.onError = onError;

            await player.play(audioData);
            return;
        } catch (error) {
            console.warn('[GeminiTTS] Failed, falling back to browser TTS:', error.message);
            if (!fallbackToBrowser) {
                if (onError) onError(error);
                throw error;
            }
        }
    }

    // Fallback to browser SpeechSynthesis
    if (fallbackToBrowser) {
        console.log('[GeminiTTS] Using browser TTS fallback');
        speakWithBrowser(text, { onEnd, onError });
    }
}

/**
 * Browser SpeechSynthesis fallback
 */
function speakWithBrowser(text, options = {}) {
    const { onEnd, onError } = options;

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        console.warn('[GeminiTTS] Browser TTS not supported');
        if (onError) onError(new Error('SpeechSynthesis not supported'));
        return;
    }

    const synth = window.speechSynthesis;
    const cleanText = stripEmoji(text);

    if (!cleanText) {
        if (onEnd) onEnd();
        return;
    }

    // Cancel any ongoing speech
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Try to find Vietnamese voice
    const voices = synth.getVoices();
    const vnVoice = voices.find(v => v.lang.includes('vi'));
    if (vnVoice) {
        utterance.voice = vnVoice;
    }

    utterance.onend = () => {
        if (onEnd) onEnd();
    };

    utterance.onerror = (event) => {
        console.error('[GeminiTTS] Browser TTS error:', event);
        if (onError) onError(event);
    };

    synth.speak(utterance);
}

/**
 * Stop any ongoing TTS playback
 */
export function stopSpeaking() {
    // Stop Gemini TTS player
    const player = getAudioPlayer();
    player.stop();

    // Also stop browser TTS if active
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

/**
 * Check if currently speaking
 */
export function isSpeaking() {
    const player = getAudioPlayer();
    const browserSpeaking = typeof window !== 'undefined' &&
        'speechSynthesis' in window &&
        window.speechSynthesis.speaking;

    return player.isPlaying || browserSpeaking;
}

/**
 * Cleanup TTS resources
 */
export function destroyTTS() {
    if (audioPlayer) {
        audioPlayer.destroy();
        audioPlayer = null;
    }
    stopSpeaking();
}

export default {
    isGeminiTTSAvailable,
    generateSpeech,
    speak,
    stopSpeaking,
    isSpeaking,
    destroyTTS
};
