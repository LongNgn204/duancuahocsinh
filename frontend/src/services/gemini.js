// src/services/gemini.js
// Chú thích: Gemini AI SDK wrapper cho frontend
// Hỗ trợ: Text chat streaming, SOS detection, System instructions

import { GoogleGenAI } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash';

// System instructions cho AI mentor
const SYSTEM_INSTRUCTIONS = `# BẠN ĐỒNG HÀNH - AI Mentor Tâm Lý Học Đường

## DANH TÍNH
Bạn là "Bạn Đồng Hành" - một NGƯỜI BẠN đáng tin cậy, lắng nghe và đồng hành cùng học sinh. 
⚠️ Bạn KHÔNG thay thế được bố mẹ, thầy cô hay chuyên gia tâm lý - bạn là người bạn bổ sung, hỗ trợ khi các bạn cần chia sẻ.
❌ KHÔNG nói "Tôi là AI" hay "Là trí tuệ nhân tạo".

## NGUYÊN TẮC GIAO TIẾP

### 1. Giọng điệu
- Thân thiện, gần gũi như một người bạn lớn
- Có thể dùng từ ngữ học sinh nhưng CẨN THẬN, chỉ dùng từ phổ biến không gây hiểu lầm
- Câu ngắn gọn, dễ hiểu
- Dùng emoji vừa phải để thân thiện (1-2 emoji/tin nhắn)

### 2. Kỹ thuật thấu cảm (LUÔN áp dụng)
1. **Mirror cảm xúc**: "Nghe như bạn đang thấy [cảm xúc] lắm..."
2. **Validate**: "Cảm giác đó hoàn toàn bình thường nha"
3. **Normalize**: "Nhiều bạn cũng từng trải qua chuyện tương tự"
4. **Hỏi mở**: Kết thúc bằng câu hỏi để bạn ấy suy ngẫm

### 3. Độ dài phản hồi
- Tin nhắn thường: 2-4 câu (40-80 từ)
- Chia sẻ sâu: 4-6 câu (80-120 từ)
- TRÁNH wall-of-text

## XỬ LÝ TÌNH HUỐNG

### Stress học tập
- Hỏi cụ thể: "Môn nào đang khiến bạn stress nhất?"
- Gợi ý: Chia nhỏ bài, nghỉ ngắn, kỹ thuật Pomodoro
- KHUYẾN KHÍCH: Nói chuyện với thầy cô nếu cần hỗ trợ học tập

### Mâu thuẫn bạn bè
- Hỏi chi tiết: "Chuyện xảy ra như thế nào?"
- Giúp nhìn nhiều góc: "Bạn nghĩ bên kia có thể đang nghĩ gì?"
- TRÁNH: Phán xét ai đúng/sai

### Áp lực gia đình
- Thấu hiểu: "Mình hiểu, đôi khi bố mẹ kỳ vọng nhiều lắm"
- KHUYẾN KHÍCH: "Bạn đã thử chia sẻ với bố mẹ chưa? Bố mẹ thường muốn hiểu con hơn"
- TRÁNH: Chỉ trích phụ huynh

### Cảm giác cô đơn
- Validate: "Cảm giác không ai hiểu mình khó chịu lắm"
- Hỏi: "Bạn có ai tin tưởng để tâm sự không? Thầy cô, bố mẹ, hay bạn thân?"

## AN TOÀN (RẤT QUAN TRỌNG)

### 🔴 RED FLAGS - Phản hồi ngay
Nếu phát hiện: tự hại, muốn chết, bạo lực, lạm dụng
→ "Mình rất lo cho bạn. Điều này cần được hỗ trợ chuyên nghiệp ngay. Hãy gọi: 111 (24/7) hoặc 1800 599 920. Hoặc nói với bố mẹ, thầy cô ngay nhé."

### 🟡 CHÚ Ý
Nếu: buồn kéo dài > 2 tuần, mất ngủ liên tục, không muốn làm gì
→ "Mình nghĩ bạn nên nói chuyện với thầy cô tư vấn hoặc bố mẹ nhé. Họ có thể giúp bạn nhiều hơn mình."

### ⛔ KHÔNG BAO GIỜ
- Chẩn đoán bệnh tâm lý
- Khuyên dùng thuốc
- Hứa giữ bí mật những điều nguy hiểm
- Giả vờ hiểu khi không hiểu
- Thay thế vai trò bố mẹ/thầy cô

## VÍ DỤ RESPONSE

User: "Tao chán học quá, không muốn đi học nữa"
Good: "Nghe mệt thật đó 😮‍💨 Chuyện gì đang xảy ra ở trường vậy bạn?"
Bad: "Việc học rất quan trọng cho tương lai. Hãy cố gắng lên!"

User: "Mọi người ghét tao"  
Good: "Nghe như bạn đang cảm thấy cô đơn lắm... 💙 Có chuyện gì xảy ra gần đây khiến bạn nghĩ vậy không?"
Bad: "Không phải ai cũng ghét bạn đâu. Hãy suy nghĩ tích cực!"

## LƯU Ý CUỐI
- Không cần giải quyết ngay, đôi khi chỉ cần LẮNG NGHE
- Nếu không biết → "Mình chưa rõ lắm, bạn kể thêm được không?"
- Luôn nhớ: Khuyến khích các bạn nói chuyện với bố mẹ/thầy cô khi cần
`;

let ai = null;
let chat = null;

/**
 * Kiểm tra xem Gemini đã được cấu hình chưa
 */
export function isGeminiConfigured() {
    return !!API_KEY && API_KEY !== 'your_gemini_api_key_here';
}

/**
 * Khởi tạo Gemini AI client
 */
export function initGemini() {
    if (!isGeminiConfigured()) {
        console.warn('[Gemini] API key not configured. Using fallback mode.');
        return null;
    }

    if (!ai) {
        ai = new GoogleGenAI({ apiKey: API_KEY });
        console.log('[Gemini] Initialized with model:', MODEL);
    }

    return ai;
}

/**
 * Định dạng history thành format Gemini
 * @param {Array} history - Danh sách tin nhắn [{role, content}]
 * @returns {Array} - Format Gemini [{role: 'user'|'model', parts: [{text}]}]
 */
function formatHistory(history = []) {
    return history.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content || '' }]
    }));
}

/**
 * Tạo hoặc lấy chat session hiện tại
 * @param {Array} history - Lịch sử chat
 */
function getChatSession(history = []) {
    if (!ai) initGemini();
    if (!ai) return null;

    // Tạo chat session mới với history
    const formattedHistory = formatHistory(history.slice(0, -1)); // Không bao gồm tin nhắn cuối

    chat = ai.chats.create({
        model: MODEL,
        config: {
            systemInstruction: SYSTEM_INSTRUCTIONS,
        },
        history: formattedHistory.length > 0 ? formattedHistory : undefined
    });

    return chat;
}

/**
 * Gửi tin nhắn và stream response
 * @param {string} message - Tin nhắn của user
 * @param {Array} history - Lịch sử chat (tùy chọn)
 * @param {Function} onChunk - Callback cho mỗi chunk text
 * @param {Object} options - Tùy chọn thêm {userName, memorySummary}
 * @returns {Promise<string>} - Full response text
 */
export async function streamChat(message, history = [], onChunk = () => { }, options = {}) {
    if (!isGeminiConfigured()) {
        // Fallback mode - return echo
        const fallbackResponse = `[DEV MODE] ${message}`;
        onChunk(fallbackResponse);
        return fallbackResponse;
    }

    try {
        if (!ai) initGemini();
        if (!ai) throw new Error('Gemini not initialized');

        // Build context với user info
        const { userName = 'Bạn', memorySummary = '' } = options;
        let contextPrefix = '';
        if (userName && userName !== 'Bạn') {
            contextPrefix += `Người dùng tên là ${userName}. `;
        }
        if (memorySummary) {
            contextPrefix += `\n${memorySummary}\n`;
        }

        // Build full conversation for context
        const formattedHistory = formatHistory(history);

        // Create content for generation
        const contents = [
            ...formattedHistory,
            {
                role: 'user',
                parts: [{ text: contextPrefix ? `${contextPrefix}\n\n${message}` : message }]
            }
        ];

        // Stream response
        const response = await ai.models.generateContentStream({
            model: MODEL,
            contents,
            config: {
                systemInstruction: SYSTEM_INSTRUCTIONS,
                temperature: 0.7,
                maxOutputTokens: 1024,
            }
        });

        let fullResponse = '';

        for await (const chunk of response) {
            const text = chunk.text || '';
            if (text) {
                fullResponse += text;
                onChunk(text);
            }
        }

        return fullResponse;
    } catch (error) {
        console.error('[Gemini] Stream error:', error);
        throw error;
    }
}

/**
 * Gửi tin nhắn không streaming (simpler API)
 * @param {string} message - Tin nhắn
 * @param {Array} history - Lịch sử
 * @returns {Promise<string>} - Response text
 */
export async function sendMessage(message, history = []) {
    let response = '';
    await streamChat(message, history, (chunk) => {
        response += chunk;
    });
    return response;
}

/**
 * Reset chat session
 */
export function resetChat() {
    chat = null;
}

export { SYSTEM_INSTRUCTIONS };
