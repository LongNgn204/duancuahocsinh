// src/services/chatApi.js
// Chú thích: Chat API Service - Gọi backend OpenAI ChatGPT (gpt-4o-mini)
// Backend: /api/ai/chat → ai-proxy.js → OpenAI API

// Backend API URL - Default to production URL
const BACKEND_API_URL = import.meta.env.VITE_API_URL || 'https://ban-dong-hanh-worker.stu725114073.workers.dev';
const CHAT_ENDPOINT = `${BACKEND_API_URL}/api/ai/chat`;

/**
 * Kiểm tra backend API đã sẵn sàng chưa
 */
export function isChatConfigured() {
    // Luôn trả về true vì AI chạy qua backend (backend có OPENAI_API_KEY)
    return true;
}

/**
 * Lọc từ ngữ không phù hợp
 * Chú thích: Chỉ lọc từ nguyên vẹn (word boundary) để tránh lọc nhầm
 */
export function filterProfanity(text) {
    if (!text) return '';

    // Danh sách từ cần lọc - CHỈ những từ tục thật sự nghiêm trọng
    // Tránh lọc từ thông dụng có thể gây nhầm lẫn
    const profanityList = [
        'đm', 'đéo', 'địt', 'lồn', 'cặc', 'buồi', 'đụ má', 'đcm',
        'vl', 'vcl', 'vkl', 'cc', 'clgt'
    ];

    let filtered = text;
    profanityList.forEach(word => {
        // Chú thích: Dùng word boundary (\\b) để chỉ match từ nguyên vẹn
        // Tránh lọc nhầm "giải" thành "***i" vì chứa "gia"
        const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Match từ đứng riêng biệt (đầu/cuối string, hoặc có space/punctuation xung quanh)
        const regex = new RegExp(`(?:^|\\s|[.,!?])${escapedWord}(?:\\s|[.,!?]|$)`, 'gi');
        filtered = filtered.replace(regex, (match) => {
            // Giữ lại space/punctuation xung quanh
            const prefix = match.match(/^[\s.,!?]/) ? match[0] : '';
            const suffix = match.match(/[\s.,!?]$/) ? match[match.length - 1] : '';
            return prefix + '*'.repeat(word.length) + suffix;
        });
    });
    return filtered;
}

/**
 * Stream chat qua Backend (OpenAI ChatGPT gpt-4o-mini)
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
            console.error('[ChatAPI] Backend Error:', error);
            throw new Error(`Backend API error: ${response.status}`);
        }

        // Read SSE stream từ backend (ai-proxy.js)
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
                        console.error('[ChatAPI] SSE error event received');
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
                            console.log('[ChatAPI] Trace:', data.trace_id, 'SOS:', data.sosLevel);
                            continue;
                        }

                        // Handle SOS response
                        if (data.sos) {
                            onChunk(data.message);
                            return { sos: true, sosLevel: data.sosLevel };
                        }

                        // Handle text chunks từ ai-proxy.js
                        // Format: {chunk: "..."}
                        if (data.chunk) {
                            onChunk(data.chunk);
                        }

                        // Handle done signal
                        // Format: {done: true, fullResponse: "...", riskLevel: "...", latencyMs: ...}
                        if (data.done) {
                            return sosData;
                        }

                        // Handle error
                        if (data.error) {
                            throw new Error(data.message || data.error);
                        }
                    } catch (e) {
                        // Skip invalid JSON
                        if (!line.includes('[DONE]')) {
                            console.warn('[ChatAPI] Parse error:', e.message);
                        }
                    }
                }
            }
        }

        return sosData;
    } catch (err) {
        console.error('[ChatAPI] Stream error:', err);
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

// Re-export với tên cũ cho backward compatibility
export const isGeminiConfigured = isChatConfigured;
