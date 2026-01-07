import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Hook to manage Microphone recording and streaming
 * Converts audio to Int16 PCM for OpenAI Realtime API
 * Optimized for all devices - không yêu cầu sample rate cụ thể
 */
export function useAudioRecorder(onAudioData) {
    const [isRecording, setIsRecording] = useState(false);
    const isRecordingRef = useRef(false); // Chú thích: Dùng ref để tránh stale closure
    const streamRef = useRef(null);
    const audioContextRef = useRef(null);
    const processorRef = useRef(null);
    const sourceRef = useRef(null);
    const onAudioDataRef = useRef(onAudioData);

    // Chú thích: Cập nhật callback ref khi prop thay đổi
    useEffect(() => {
        onAudioDataRef.current = onAudioData;
    }, [onAudioData]);

    const startRecording = useCallback(async () => {
        if (isRecordingRef.current) return; // Đã đang recording

        try {
            // Chú thích: Không yêu cầu sample rate cụ thể - để browser tự chọn
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true // Thêm auto gain cho âm lượng đều
                }
            });

            streamRef.current = stream;

            // Chú thích: Dùng sample rate mặc định của device (thường 44100 hoặc 48000)
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioContext();
            audioContextRef.current = ctx;

            // Chú thích: Resume context nếu bị suspend (iOS requirement)
            if (ctx.state === 'suspended') {
                await ctx.resume();
            }

            const source = ctx.createMediaStreamSource(stream);
            sourceRef.current = source;

            // Chú thích: Buffer size nhỏ hơn = latency thấp hơn
            const bufferSize = 2048;
            const processor = ctx.createScriptProcessor(bufferSize, 1, 1);
            processorRef.current = processor;

            // Chú thích: Tính downsample ratio nếu cần (OpenAI expects 24kHz)
            const inputSampleRate = ctx.sampleRate;
            const outputSampleRate = 24000;
            const downsampleRatio = inputSampleRate / outputSampleRate;

            processor.onaudioprocess = (e) => {
                if (!isRecordingRef.current) return;

                const inputData = e.inputBuffer.getChannelData(0);

                // Chú thích: Downsample nếu cần
                let outputData;
                if (downsampleRatio > 1) {
                    const outputLength = Math.floor(inputData.length / downsampleRatio);
                    outputData = new Float32Array(outputLength);
                    for (let i = 0; i < outputLength; i++) {
                        outputData[i] = inputData[Math.floor(i * downsampleRatio)];
                    }
                } else {
                    outputData = inputData;
                }

                // Convert Float32 to Int16 PCM
                const pcm16 = new Int16Array(outputData.length);
                for (let i = 0; i < outputData.length; i++) {
                    const s = Math.max(-1, Math.min(1, outputData[i]));
                    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }

                // Convert to Base64
                const bytes = new Uint8Array(pcm16.buffer);
                let binary = '';
                for (let i = 0; i < bytes.byteLength; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                const base64 = btoa(binary);

                if (onAudioDataRef.current) {
                    onAudioDataRef.current(base64);
                }
            };

            source.connect(processor);
            processor.connect(ctx.destination);

            isRecordingRef.current = true;
            setIsRecording(true);
            console.log('[AudioRecorder] Started, sample rate:', inputSampleRate, '-> 24kHz');
        } catch (err) {
            console.error("[AudioRecorder] Error:", err);
            isRecordingRef.current = false;
            setIsRecording(false);
        }
    }, []);

    const stopRecording = useCallback(() => {
        isRecordingRef.current = false;
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

        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(() => { });
            audioContextRef.current = null;
        }

        console.log('[AudioRecorder] Stopped');
    }, []);

    // Cleanup
    useEffect(() => {
        return () => {
            stopRecording();
        };
    }, [stopRecording]);

    return {
        isRecording,
        startRecording,
        stopRecording
    };
}
