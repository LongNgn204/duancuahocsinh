// src/hooks/useTextToSpeech.js
// Chú thích: Hook sử dụng Web Speech API cho Text-to-Speech
// Không cần API key, chạy native trong browser
// KHÔNG ĐỌC EMOJI - Lọc bỏ icon trước khi đọc

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Loại bỏ emoji và icon khỏi text trước khi TTS đọc
 * @param {string} text - Text có thể chứa emoji
 * @returns {string} Text đã lọc bỏ emoji
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
        .replace(/\s{2,}/g, ' ') // Multiple spaces to single
        .trim();
}

export function useTextToSpeech() {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const utteranceRef = useRef(null);

    // Check if browser supports speech synthesis
    const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

    // Load available voices
    const loadVoices = useCallback(() => {
        if (!isSupported) return;

        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);

        // Try to find Vietnamese voice
        const vietnameseVoice = availableVoices.find(
            voice => voice.lang.includes('vi') || voice.lang.includes('VI')
        );

        if (vietnameseVoice) {
            setSelectedVoice(vietnameseVoice);
        } else if (availableVoices.length > 0) {
            setSelectedVoice(availableVoices[0]);
        }
    }, [isSupported]);

    // Initialize voices
    useEffect(() => {
        if (!isSupported) return;

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, [isSupported, loadVoices]);

    // Speak text
    const speak = useCallback((text, options = {}) => {
        if (!isSupported || !text) return;

        // FILTER EMOJI TRƯỚC KHI ĐỌC
        const cleanText = stripEmoji(text);
        if (!cleanText) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utteranceRef.current = utterance;

        // Set voice
        if (options.voice) {
            utterance.voice = options.voice;
        } else if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        // Set language (default Vietnamese)
        utterance.lang = options.lang || 'vi-VN';

        // Set other options
        utterance.rate = options.rate || 1; // 0.1 - 10
        utterance.pitch = options.pitch || 1; // 0 - 2
        utterance.volume = options.volume || 1; // 0 - 1

        // Event handlers
        utterance.onstart = () => {
            setIsSpeaking(true);
            setIsPaused(false);
            options.onStart?.();
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
            options.onEnd?.();
        };

        utterance.onerror = (event) => {
            console.error('[useTextToSpeech] Error:', event.error);
            setIsSpeaking(false);
            setIsPaused(false);
            options.onError?.(event.error);
        };

        utterance.onpause = () => setIsPaused(true);
        utterance.onresume = () => setIsPaused(false);

        window.speechSynthesis.speak(utterance);
    }, [isSupported, selectedVoice]);

    // Pause speech
    const pause = useCallback(() => {
        if (isSupported && isSpeaking) {
            window.speechSynthesis.pause();
        }
    }, [isSupported, isSpeaking]);

    // Resume speech
    const resume = useCallback(() => {
        if (isSupported && isPaused) {
            window.speechSynthesis.resume();
        }
    }, [isSupported, isPaused]);

    // Stop/Cancel speech
    const stop = useCallback(() => {
        if (isSupported) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            setIsPaused(false);
        }
    }, [isSupported]);

    // Get Vietnamese voices only
    const vietnameseVoices = voices.filter(
        voice => voice.lang.includes('vi') || voice.lang.includes('VI')
    );

    return {
        isSupported,
        isSpeaking,
        isPaused,
        voices,
        vietnameseVoices,
        selectedVoice,
        speak,
        pause,
        resume,
        stop,
        setSelectedVoice,
    };
}

// Simple speak function for one-off usage
export function speakText(text, options = {}) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        console.warn('[speakText] Speech synthesis not supported');
        return;
    }

    // FILTER EMOJI TRƯỚC KHI ĐỌC
    const cleanText = stripEmoji(text);
    if (!cleanText) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = options.lang || 'vi-VN';
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;

    // Try to use Vietnamese voice
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(v => v.lang.includes('vi'));
    if (viVoice) {
        utterance.voice = viVoice;
    }

    window.speechSynthesis.speak(utterance);
}

export default useTextToSpeech;
