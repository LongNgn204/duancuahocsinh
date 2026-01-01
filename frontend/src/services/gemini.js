// src/services/gemini.js
// Chú thích: Gemini Chat API - v2.0 Gọi qua Backend Vertex AI
// Thay đổi: Không còn gọi trực tiếp Google AI, mà gọi qua backend /api/ai/chat

// Backend API URL - Default to production URL
const BACKEND_API_URL = import.meta.env.VITE_API_URL || 'https://ban-dong-hanh-worker.stu725114073.workers.dev';
const CHAT_ENDPOINT = `${BACKEND_API_URL}/api/ai/chat`;

/**
 * Kiểm tra backend API đã được cấu hình chưa
 */
export function isGeminiConfigured() {
    // Luôn trả về true vì AI chạy qua backend
    return true;
}

/**
 * Lọc từ ngữ không phù hợp
 */
export function filterProfanity(text) {
    if (!text) return '';
    // Danh sách từ cần lọc (có thể mở rộng)
    const profanityList = [
        'đm', 'đéo', 'địt', 'lồn', 'cặc', 'buồi', 'đụ', 'vãi',
        'chó', 'ngu', 'khốn', 'mẹ mày', 'con mẹ'
    ];

    let filtered = text;
    profanityList.forEach(word => {
        const regex = new RegExp(word, 'gi');
        filtered = filtered.replace(regex, '*'.repeat(word.length));
    });
    return filtered;
}

/**
 * Stream chat qua Backend Vertex AI
 * @param {string} message - Tin nhắn từ user
 * @param {Array} history - Lịch sử chat [{role, content}]
 * @param {Function} onChunk - Callback nhận từng chunk text
 * @param {Object} options - Tùy chọn bổ sung
 */
export async function streamChat(message, history = [], onChunk, options = {}) {
    const { userName = 'Bạn', memorySummary = '' } = options;

    try {
        const response = await fetch(CHAT_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message,
                history,
                userName,
                memorySummary
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('[Gemini] Backend API Error:', error);
            throw new Error(`Backend API error: ${response.status}`);
        }

        // Read SSE stream từ backend
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let sosData = null;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // Parse SSE events
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                // Parse event type
                if (line.startsWith('event: ')) {
                    const eventType = line.slice(7).trim();
                    if (eventType === 'error') {
                        console.error('[Gemini] SSE error event received');
                    }
                    continue;
                }

                // Parse data
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));

                        // Handle meta event (SOS level, trace ID)
                        if (data.trace_id) {
                            sosData = data;
                            console.log('[Gemini] Trace:', data.trace_id, 'SOS:', data.sosLevel);
                            continue;
                        }

                        // Handle SOS response
                        if (data.sos) {
                            onChunk(data.message);
                            return { sos: true, sosLevel: data.sosLevel };
                        }

                        // Handle text chunks
                        if (data.type === 'delta' && data.text) {
                            onChunk(data.text);
                        }

                        // Handle done
                        if (data.type === 'done') {
                            return sosData;
                        }

                        // Handle error
                        if (data.type === 'error') {
                            throw new Error(data.note || data.error);
                        }
                    } catch (e) {
                        // Skip invalid JSON
                        if (!line.includes('[DONE]')) {
                            console.warn('[Gemini] Parse error:', e.message);
                        }
                    }
                }
            }
        }

        return sosData;
    } catch (err) {
        console.error('[Gemini] Stream error:', err);
        throw err;
    }
}

/**
 * Non-streaming chat (for simple use cases)
 */
export async function chat(message, history = []) {
    let result = '';
    await streamChat(message, history, (chunk) => {
        result += chunk;
    });
    return result;
}
