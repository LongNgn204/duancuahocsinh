// src/services/gemini.js
// Gemini API service for Chat AI
// v1.0: Direct Gemini API integration

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent`;

// System prompt cho AI assistant
const SYSTEM_PROMPT = `Bạn là "Bạn Đồng Hành", một người bạn AI thân thiện, ấm áp và thấu hiểu dành cho học sinh Việt Nam.

Nguyên tắc:
- Lắng nghe và đồng cảm trước, đưa lời khuyên sau
- Dùng ngôn ngữ gần gũi, dễ hiểu với học sinh
- Không phán xét, luôn tích cực và khuyến khích
- Nếu phát hiện dấu hiệu khủng hoảng tinh thần nghiêm trọng, nhẹ nhàng khuyên tìm người lớn đáng tin hoặc gọi đường dây hỗ trợ
- Trả lời ngắn gọn, súc tích, không quá 3-4 câu trừ khi cần giải thích chi tiết
- Thỉnh thoảng dùng emoji để thân thiện hơn 😊

Bạn có thể:
- Lắng nghe tâm sự về học tập, bạn bè, gia đình
- Đưa lời khuyên về quản lý stress, cảm xúc
- Gợi ý các hoạt động thư giãn
- Trò chuyện vui vẻ khi người dùng cần

Bạn KHÔNG:
- Đưa lời khuyên y tế chuyên môn
- Khuyến khích hành vi nguy hiểm
- Chia sẻ thông tin cá nhân`;

/**
 * Kiểm tra Gemini đã được cấu hình chưa
 */
export function isGeminiConfigured() {
    return Boolean(GEMINI_API_KEY);
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
 * Stream chat với Gemini API
 * @param {string} message - Tin nhắn từ user
 * @param {Array} history - Lịch sử chat [{role, content}]
 * @param {Function} onChunk - Callback nhận từng chunk text
 * @param {Object} options - Tùy chọn bổ sung
 */
export async function streamChat(message, history = [], onChunk, options = {}) {
    if (!isGeminiConfigured()) {
        throw new Error('Gemini API key not configured');
    }

    const { userName = 'Bạn', memorySummary = '' } = options;

    // Build conversation history for Gemini
    const contents = [];

    // Add system context as first user message
    let contextMessage = SYSTEM_PROMPT;
    if (userName && userName !== 'Bạn') {
        contextMessage += `\n\nNgười dùng tên là: ${userName}`;
    }
    if (memorySummary) {
        contextMessage += `\n\n${memorySummary}`;
    }

    contents.push({
        role: 'user',
        parts: [{ text: contextMessage }]
    });
    contents.push({
        role: 'model',
        parts: [{ text: 'Mình hiểu rồi! Mình là Bạn Đồng Hành, sẵn sàng lắng nghe và trò chuyện với bạn. 😊' }]
    });

    // Add chat history
    history.forEach(msg => {
        contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content || '' }]
        });
    });

    // Add current message
    contents.push({
        role: 'user',
        parts: [{ text: message }]
    });

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}&alt=sse`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents,
                generationConfig: {
                    temperature: 0.8,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                },
                safetySettings: [
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                ]
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('[Gemini] API Error:', error);
            throw new Error(`Gemini API error: ${response.status}`);
        }

        // Read SSE stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // Parse SSE events
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (text) {
                            onChunk(text);
                        }
                    } catch (e) {
                        // Skip invalid JSON
                    }
                }
            }
        }
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
