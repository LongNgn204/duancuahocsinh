// src/hooks/useVoiceCall.js
// Hook for managing voice call with Gemini Live API
// Handles microphone capture, audio playback, connection management, and SOS detection

import { useState, useCallback, useRef, useEffect } from 'react';
import { createLiveSession, AudioPlayer, isLiveAPIAvailable } from '../services/geminiLive';
import { detectSOSLevel, sosMessage, getSuggestedAction } from '../utils/sosDetector';

/**
 * Convert Float32Array to Int16Array for PCM encoding
 */
function float32ToInt16(float32Array) {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
        const s = Math.max(-1, Math.min(1, float32Array[i]));
        int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16Array;
}

/**
 * Convert Int16Array to base64 string
 */
function int16ToBase64(int16Array) {
    const uint8Array = new Uint8Array(int16Array.buffer);
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
        binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
}

/**
 * Hook for voice call with Gemini Live API
 * @param {Object} options - Configuration options
 * @param {Function} options.onSOS - Callback when SOS detected (level, message)
 * @returns {Object} Voice call state and controls
 */
export function useVoiceCall(options = {}) {
    const { onSOS } = options;

    // State
    const [status, setStatus] = useState('idle'); // idle | connecting | active | speaking | error
    const [error, setError] = useState(null);
    const [duration, setDuration] = useState(0);
    const [transcript, setTranscript] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [sosDetected, setSosDetected] = useState(null); // { level, message }

    // Refs
    const sessionRef = useRef(null);
    const audioPlayerRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const audioContextRef = useRef(null);
    const processorRef = useRef(null);
    const durationTimerRef = useRef(null);
    const isMutedRef = useRef(false); // For closure in processor
    const audioSentCountRef = useRef(0); // Debug counter

    // Cleanup function
    const cleanup = useCallback(() => {
        // Stop duration timer
        if (durationTimerRef.current) {
            clearInterval(durationTimerRef.current);
            durationTimerRef.current = null;
        }

        // Stop audio processor
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }

        // Close audio context
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        // Stop media stream
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }

        // Stop audio player
        if (audioPlayerRef.current) {
            audioPlayerRef.current.destroy();
            audioPlayerRef.current = null;
        }

        // Close session
        if (sessionRef.current) {
            sessionRef.current.close();
            sessionRef.current = null;
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return cleanup;
    }, [cleanup]);

    // Start voice call
    const startCall = useCallback(async () => {
        if (!isLiveAPIAvailable()) {
            setError('Chưa cấu hình Gemini API Key');
            setStatus('error');
            return false;
        }

        try {
            setStatus('connecting');
            setError(null);
            setDuration(0);
            setTranscript('');

            // Initialize audio player
            audioPlayerRef.current = new AudioPlayer();
            audioPlayerRef.current.onPlaybackStart = () => setStatus('speaking');
            audioPlayerRef.current.onPlaybackEnd = () => setStatus('active');

            // Create session
            sessionRef.current = createLiveSession({
                onAudioData: (base64Data, mimeType) => {
                    // Only log occasionally to reduce console spam
                    if (audioSentCountRef.current % 50 === 0) {
                        console.log('[VoiceCall] Received audio chunk #', audioSentCountRef.current);
                    }
                    if (audioPlayerRef.current) {
                        audioPlayerRef.current.enqueue(base64Data);
                    }
                },
                onTranscript: (text) => {
                    console.log('[VoiceCall] Transcript:', text);
                    setTranscript(prev => prev + ' ' + text);

                    // SOS Detection - check transcript for crisis keywords
                    const sosLevel = detectSOSLevel(text);
                    const sosAction = getSuggestedAction(sosLevel);

                    if (sosAction.showOverlay) {
                        const msg = sosMessage(sosLevel);
                        console.log('[VoiceCall] SOS detected:', sosLevel);
                        setSosDetected({ level: sosLevel, message: msg });

                        // Notify parent component
                        if (onSOS) {
                            onSOS(sosLevel, msg);
                        }
                    }
                },
                onError: (err) => {
                    console.error('[VoiceCall] Session error:', err);
                    setError('Lỗi kết nối');
                    setStatus('error');
                },
                onClose: () => {
                    console.log('[VoiceCall] Session closed');
                    if (status !== 'idle') {
                        setStatus('idle');
                    }
                },
                onOpen: () => {
                    console.log('[VoiceCall] Session ready');
                    setStatus('active');

                    // Start duration timer
                    durationTimerRef.current = setInterval(() => {
                        setDuration(d => d + 1);
                    }, 1000);
                }
            });

            // Connect to Gemini
            await sessionRef.current.connect();

            // Resume audio player (needs user interaction)
            audioPlayerRef.current.resume();

            // Start microphone capture - use native sample rate
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            mediaStreamRef.current = stream;

            // Create audio context with native sample rate (browser default)
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            const nativeSampleRate = audioContextRef.current.sampleRate;
            console.log('[VoiceCall] Native sample rate:', nativeSampleRate);

            const source = audioContextRef.current.createMediaStreamSource(stream);

            // Use smaller buffer for lower latency (2048 samples)
            // This provides ~42ms chunks at 48kHz, resampled to ~682 samples at 16kHz
            // Smaller buffer = faster speech detection but more CPU usage
            const actualBufferSize = 2048;

            console.log('[VoiceCall] Using buffer size:', actualBufferSize, '| Native rate:', nativeSampleRate);

            // Create script processor for audio capture
            const processor = audioContextRef.current.createScriptProcessor(actualBufferSize, 1, 1);
            processorRef.current = processor;

            // Downsample function
            const downsample = (inputBuffer, inputRate, outputRate) => {
                if (inputRate === outputRate) return inputBuffer;
                const ratio = inputRate / outputRate;
                const outputLength = Math.floor(inputBuffer.length / ratio);
                const output = new Float32Array(outputLength);
                for (let i = 0; i < outputLength; i++) {
                    output[i] = inputBuffer[Math.floor(i * ratio)];
                }
                return output;
            };

            processor.onaudioprocess = (e) => {
                // Skip if muted
                if (isMutedRef.current) return;

                // Check if session is ready
                if (!sessionRef.current) {
                    console.log('[VoiceCall] No session ref');
                    return;
                }
                if (!sessionRef.current.isReady()) {
                    // Log occasionally to avoid spam
                    if (audioSentCountRef.current === 0) {
                        console.log('[VoiceCall] Session not ready yet, waiting...');
                    }
                    return;
                }

                const inputData = e.inputBuffer.getChannelData(0);

                // Downsample to 16kHz for Gemini API
                const resampledData = downsample(inputData, nativeSampleRate, 16000);
                const int16Data = float32ToInt16(resampledData);
                const base64Data = int16ToBase64(int16Data);

                const sent = sessionRef.current.sendAudio(base64Data);
                if (sent) {
                    audioSentCountRef.current++;
                    // Log every 10 chunks (about 1 second)
                    if (audioSentCountRef.current % 10 === 1) {
                        console.log('[VoiceCall] Audio chunks sent:', audioSentCountRef.current,
                            '| samples:', resampledData.length);
                    }
                } else {
                    console.warn('[VoiceCall] Failed to send audio chunk');
                }
            };

            source.connect(processor);
            processor.connect(audioContextRef.current.destination);

            return true;

        } catch (err) {
            console.error('[VoiceCall] Start error:', err);

            if (err.name === 'NotAllowedError') {
                setError('Vui lòng cho phép sử dụng microphone');
            } else {
                setError('Không thể bắt đầu cuộc gọi: ' + err.message);
            }

            setStatus('error');
            cleanup();
            return false;
        }
    }, [cleanup, isMuted, status]);

    // End voice call
    const endCall = useCallback(() => {
        cleanup();
        setStatus('idle');
        setTranscript('');
    }, [cleanup]);

    // Toggle mute
    const toggleMute = useCallback(() => {
        setIsMuted(prev => {
            isMutedRef.current = !prev;
            return !prev;
        });
    }, []);

    // Send text message (for testing)
    const sendText = useCallback((text) => {
        if (sessionRef.current?.isReady()) {
            sessionRef.current.sendText(text);
            return true;
        }
        return false;
    }, []);

    // Check if supported
    const isSupported = typeof navigator !== 'undefined' &&
        navigator.mediaDevices &&
        typeof navigator.mediaDevices.getUserMedia === 'function' &&
        isLiveAPIAvailable();

    // Clear SOS state
    const clearSOS = useCallback(() => {
        setSosDetected(null);
    }, []);

    return {
        // State
        status,
        error,
        duration,
        transcript,
        isMuted,
        isSupported,
        sosDetected,

        // Controls
        startCall,
        endCall,
        toggleMute,
        sendText,
        clearSOS
    };
}

/**
 * Format duration in seconds to MM:SS
 */
export function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
