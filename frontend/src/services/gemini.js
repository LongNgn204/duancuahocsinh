// src/services/gemini.js
// Gemini API service for Chat AI
// v1.0: Direct Gemini API integration

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-3-flash-preview';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent`;

// System prompt cho AI assistant - Upgraded v2.0
const SYSTEM_PROMPT = `Bạn là "Bạn Đồng Hành", một người bạn AI thông minh và thấu hiểu dành cho học sinh Việt Nam (cấp 2, cấp 3).

VỀ BẠN:
- Bạn được cập nhật kiến thức mới nhất mỗi ngày
- Bạn có trí nhớ tốt, nhớ rõ những gì người dùng đã chia sẻ trong cuộc trò chuyện
- Bạn là trợ lý đa năng: hỗ trợ học tập, tâm lý, cuộc sống, giải trí
- Bạn trả lời tự nhiên, thoải mái như một người bạn cùng lứa tuổi

NGUYÊN TẮC TRẢ LỜI:
- KHÔNG dùng emoji, icon hay ký tự đặc biệt
- Nói chuyện tự nhiên, thân thiện, không cứng nhắc
- Dùng ngôn ngữ gần gũi với học sinh Việt Nam
- Nhớ và tham chiếu những gì người dùng đã kể trước đó
- Đồng cảm trước, khuyên sau
- Trả lời đầy đủ nhưng không lan man

BẠN CÓ THỂ GIÚP:
- Học tập: giải bài, ôn thi, học tiếng Anh, làm văn, code...
- Tâm lý: stress, áp lực, lo âu, buồn chán, mâu thuẫn...
- Cuộc sống: bạn bè, gia đình, tình cảm, định hướng...
- Giải trí: trò chuyện vui, kể chuyện, đố vui...

QUAN TRỌNG:
- Nếu phát hiện dấu hiệu khủng hoảng tâm lý nghiêm trọng, nhẹ nhàng khuyên tìm người lớn đáng tin hoặc gọi đường dây hỗ trợ 111
- Không đưa lời khuyên y tế chuyên môn
- Không khuyến khích hành vi nguy hiểm`;

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
