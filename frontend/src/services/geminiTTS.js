// src/services/geminiTTS.js
// Chú thích: Gemini Text-to-Speech service
// Sử dụng Gemini 2.5 Flash với response modality AUDIO

import { GoogleGenAI } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Model hỗ trợ TTS output
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';

let ai = null;

/**
 * Khởi tạo Gemini AI client cho TTS
 */
function initGeminiTTS() {
    if (!API_KEY || API_KEY === 'your_gemini_api_key_here') {
        console.warn('[GeminiTTS] API key not configured');
        return null;
    }

    if (!ai) {
        ai = new GoogleGenAI({ apiKey: API_KEY });
        console.log('[GeminiTTS] Initialized');
    }

    return ai;
}

/**
 * Chuyển đổi PCM audio data sang WAV format
 * @param {Int16Array} pcmData - Raw PCM data
 * @param {number} sampleRate - Sample rate (default 24000Hz)
 * @returns {ArrayBuffer} - WAV file buffer
 */
function pcmToWav(pcmData, sampleRate = 24000) {
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
    const dataSize = pcmData.length * 2;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // WAV header
    const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    // PCM data
    const pcmOffset = 44;
    for (let i = 0; i < pcmData.length; i++) {
        view.setInt16(pcmOffset + i * 2, pcmData[i], true);
    }

    return buffer;
}

/**
 * Generate speech audio từ text sử dụng Gemini TTS
 * @param {string} text - Text cần đọc
 * @param {Object} options - Tùy chọn {voiceName, language}
 * @returns {Promise<{audioUrl: string, cleanup: Function}>} - Audio URL và cleanup function
 */
export async function generateSpeech(text, options = {}) {
    if (!text?.trim()) {
        throw new Error('No text provided');
    }

    if (!initGeminiTTS()) {
        throw new Error('Gemini TTS not configured');
    }

    const { voiceName = 'Kore', language = 'vi-VN' } = options;

    try {
        console.log('[GeminiTTS] Generating speech for:', text.slice(0, 50) + '...');

        const response = await ai.models.generateContent({
            model: TTS_MODEL,
            contents: [{
                role: 'user',
                parts: [{ text: `Hãy đọc đoạn văn sau bằng giọng ${language === 'vi-VN' ? 'tiếng Việt' : 'tiếng Anh'}, giọng tự nhiên, nhẹ nhàng:\n\n${text}` }]
            }],
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: {
                            voiceName: voiceName // Kore, Puck, Charon, etc.
                        }
                    }
                }
            }
        });

        // Extract audio từ response
        const candidate = response.candidates?.[0];
        if (!candidate?.content?.parts) {
            throw new Error('No audio in response');
        }

        // Tìm part có audio data
        const audioPart = candidate.content.parts.find(p => p.inlineData?.mimeType?.startsWith('audio/'));
        if (!audioPart) {
            throw new Error('No audio part found');
        }

        // Decode base64 audio
        const audioBase64 = audioPart.inlineData.data;
        const mimeType = audioPart.inlineData.mimeType;

        let audioBlob;

        if (mimeType === 'audio/L16' || mimeType.includes('pcm')) {
            // Raw PCM data - cần convert sang WAV
            const binaryString = atob(audioBase64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            // Convert to Int16Array (PCM 16-bit)
            const pcmData = new Int16Array(bytes.buffer);
            const wavBuffer = pcmToWav(pcmData, 24000);
            audioBlob = new Blob([wavBuffer], { type: 'audio/wav' });
        } else {
            // Already a playable format (mp3, wav, etc.)
            const binaryString = atob(audioBase64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            audioBlob = new Blob([bytes], { type: mimeType });
        }

        const audioUrl = URL.createObjectURL(audioBlob);

        console.log('[GeminiTTS] Audio generated successfully');

        return {
            audioUrl,
            cleanup: () => URL.revokeObjectURL(audioUrl)
        };

    } catch (error) {
        console.error('[GeminiTTS] Error:', error);
        throw error;
    }
}

/**
 * Speak text với Gemini TTS và play audio
 * @param {string} text - Text cần đọc
 * @param {Object} options - Tùy chọn
 * @returns {Promise<{audio: HTMLAudioElement, stop: Function}>}
 */
export async function speakWithGemini(text, options = {}) {
    const { audioUrl, cleanup } = await generateSpeech(text, options);

    const audio = new Audio(audioUrl);

    return new Promise((resolve, reject) => {
        audio.oncanplay = () => {
            audio.play().catch(reject);
        };

        audio.onended = () => {
            cleanup();
            resolve({ completed: true });
        };

        audio.onerror = (e) => {
            cleanup();
            reject(new Error('Audio playback error'));
        };

        // Return stop function
        resolve({
            audio,
            stop: () => {
                audio.pause();
                audio.currentTime = 0;
                cleanup();
            }
        });
    });
}

/**
 * Check if Gemini TTS is available
 */
export function isGeminiTTSAvailable() {
    return !!API_KEY && API_KEY !== 'your_gemini_api_key_here';
}
