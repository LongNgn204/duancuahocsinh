import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Hook to manage Microphone recording and streaming
 * Converts audio to Int16 PCM (24kHz typically required by OpenAI Realtime)
 * But OpenAI Realtime also accepts Base64 PCM16
 */
export function useAudioRecorder(onAudioData) {
    const [isRecording, setIsRecording] = useState(false);
    const streamRef = useRef(null);
    const audioContextRef = useRef(null);
    const processorRef = useRef(null);
    const sourceRef = useRef(null);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    sampleRate: 24000, // OpenAI Realtime prefers 24kHz
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });

            streamRef.current = stream;

            // Init Audio Context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioContext({ sampleRate: 24000 });
            audioContextRef.current = ctx;

            const source = ctx.createMediaStreamSource(stream);
            sourceRef.current = source;

            // Use ScriptProcessor for legacy wide support or AudioWorklet for modern
            // Using ScriptProcessor for simplicity in this MVP without extra worklet files
            const processor = ctx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
                if (!isRecording) return;

                const inputData = e.inputBuffer.getChannelData(0);

                // Convert Float32 to Int16 PCM
                const pcm16 = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    // Clamp to [-1, 1]
                    const s = Math.max(-1, Math.min(1, inputData[i]));
                    // Scale to 16-bit integer range
                    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }

                // Convert to Base64
                // Uint8 array from Int16 buffer
                const bytes = new Uint8Array(pcm16.buffer);
                let binary = '';
                for (let i = 0; i < bytes.byteLength; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                const base64 = btoa(binary);

                if (onAudioData) {
                    onAudioData(base64);
                }
            };

            source.connect(processor);
            processor.connect(ctx.destination); // Needed for script processor to run

            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setIsRecording(false);
        }
    }, [onAudioData, isRecording]);

    const stopRecording = useCallback(() => {
        setIsRecording(false);

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }

        if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }

        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
    }, []);

    // Cleanup
    useEffect(() => {
        return () => {
            stopRecording();
        };
    }, []);

    return {
        isRecording,
        startRecording,
        stopRecording
    };
}
