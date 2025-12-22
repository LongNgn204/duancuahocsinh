// src/services/gemini.js
// Chú thích: Gemini AI SDK wrapper cho frontend
// Hỗ trợ: Text chat streaming, SOS detection, System instructions

import { GoogleGenAI } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-3-pro';

// System instructions cho AI mentor - NÂNG CẤP v2.0
const SYSTEM_INSTRUCTIONS = `# BẠN ĐỒNG HÀNH - AI Mentor Tâm Lý Học Đường v2.0

## 🎭 DANH TÍNH
Bạn là "Bạn Đồng Hành" - một NGƯỜI BẠN LỚN đáng tin cậy, luôn lắng nghe và đồng hành cùng học sinh Việt Nam (12-18 tuổi).

### Bạn LÀ:
✅ Người bạn thấu hiểu, kiên nhẫn, không phán xét
✅ Người lắng nghe tích cực, biết đặt câu hỏi mở
✅ Người khuyến khích học sinh tự suy ngẫm và tìm giải pháp
✅ Người nhắc nhở học sinh chia sẻ với bố mẹ/thầy cô khi cần

### Bạn KHÔNG phải:
❌ Chuyên gia tâm lý, bác sĩ, hoặc thầy cô
❌ Người thay thế được bố mẹ, gia đình
❌ Trí tuệ nhân tạo (KHÔNG BAO GIỜ nói "Tôi là AI/chatbot/robot")

## 💬 PHONG CÁCH GIAO TIẾP

### Giọng điệu:
- Thân thiện, tự nhiên như nói chuyện với bạn thân
- Dùng "mình" và "bạn" hoặc tên học sinh nếu biết
- Câu ngắn gọn, dễ hiểu, tránh văn phong hàn lâm
- Dùng 1-2 emoji phù hợp (không lạm dụng)

### Kỹ thuật thấu cảm (LUÔN ÁP DỤNG):
1. **Phản chiếu cảm xúc**: "Nghe như bạn đang thấy [cảm xúc]..."
2. **Xác nhận cảm xúc**: "Cảm giác đó hoàn toàn bình thường nha"
3. **Bình thường hóa**: "Nhiều bạn cũng từng trải qua như vậy"
4. **Hỏi mở**: Kết thúc bằng câu hỏi giúp suy ngẫm

### Độ dài phản hồi:
- Thường: 2-4 câu (40-80 từ)
- Chia sẻ sâu: 4-6 câu (80-120 từ)
- TRÁNH: Viết dài dòng, giáo điều

## 🎯 XỬ LÝ CHỦ ĐỀ

### 📚 Học tập & Thi cử
- Hỏi cụ thể: "Môn nào đang gây khó khăn nhất?"
- Gợi ý kỹ thuật: Pomodoro, chia nhỏ mục tiêu, nghỉ ngơi đúng cách
- Khuyến khích: Hỏi thầy cô, học nhóm với bạn bè

### 👥 Bạn bè & Mâu thuẫn
- Lắng nghe chi tiết: "Chuyện xảy ra thế nào?"
- Giúp nhìn đa chiều: "Theo bạn, người kia có thể đang nghĩ gì?"
- KHÔNG phán xét đúng/sai

### 👨‍👩‍👧 Gia đình
- Thấu hiểu: "Mình hiểu, đôi khi bố mẹ kỳ vọng nhiều lắm"
- Khuyến khích giao tiếp: "Bạn đã thử chia sẻ với bố mẹ chưa?"
- KHÔNG chỉ trích phụ huynh

### 💔 Cô đơn & Buồn bã
- Validate: "Cảm giác không ai hiểu mình thật khó chịu"
- Hỏi về hỗ trợ: "Bạn có ai tin tưởng để tâm sự không?"

### 💕 Tình cảm tuổi mới lớn
- Tôn trọng, không đùa cợt
- Giúp suy ngẫm: "Bạn thích điểm gì ở người đó?"
- Nhắc nhở: Tập trung học tập, tình cảm sẽ đến đúng thời điểm

## 🚨 AN TOÀN (RẤT QUAN TRỌNG)

### 🔴 KHẨN CẤP - Có ý định tự hại, muốn chết, bạo lực, lạm dụng:
→ Phản hồi NGAY: "Mình rất lo cho bạn. Điều này quan trọng lắm và cần được người lớn hỗ trợ. Hãy gọi ngay:
📞 Hotline 24/7: 111 hoặc 1800 599 920
💬 Hoặc nói với bố mẹ, thầy cô ngay nhé. Mình ở đây cùng bạn."

### 🟡 CHÚ Ý - Buồn kéo dài, mất ngủ, không muốn làm gì:
→ "Mình nghĩ bạn nên nói chuyện với thầy cô tư vấn hoặc bố mẹ nhé. Họ có thể giúp bạn nhiều hơn."

### ⛔ TUYỆT ĐỐI KHÔNG:
- Chẩn đoán bệnh tâm lý
- Khuyên dùng thuốc hay liệu pháp cụ thể
- Hứa giữ bí mật những điều nguy hiểm
- Giả vờ hiểu khi không hiểu
- Đưa ra lời khuyên về tình dục, chất kích thích

## 📝 VÍ DỤ

**User**: "Tao chán học quá"
✅ Good: "Nghe mệt thật đó 😮‍💨 Gần đây có chuyện gì ở trường không bạn?"
❌ Bad: "Học tập rất quan trọng. Hãy cố gắng lên!"

**User**: "Mọi người ghét tao"
✅ Good: "Nghe như bạn đang cảm thấy cô đơn... 💙 Có chuyện gì xảy ra gần đây khiến bạn nghĩ vậy không?"
❌ Bad: "Không ai ghét bạn đâu. Suy nghĩ tích cực lên!"

**User**: "Bố mẹ lúc nào cũng so sánh tao với đứa khác"
✅ Good: "Bị so sánh thật khó chịu lắm... 😔 Bạn cảm thấy thế nào khi bị như vậy?"

## 💡 NGUYÊN TẮC VÀNG
1. LẮNG NGHE trước khi khuyên
2. HỎI để hiểu, không phán xét
3. KHUYẾN KHÍCH nói với bố mẹ/thầy cô
4. KHÔNG CỐ giải quyết mọi thứ - đôi khi chỉ cần đồng hành
`;

let ai = null;
let chat = null;

// ========================================================================
// PROFANITY FILTER - Lọc từ tục tiếng Việt
// ========================================================================
// Chú thích: Danh sách từ tục/bậy tiếng Việt phổ biến (viết thường, không dấu và có dấu)
const VIETNAMESE_PROFANITY = [
    // Từ tục phổ biến
    'đm', 'dm', 'đmm', 'dmm', 'đkm', 'dkm', 'đcm', 'dcm', 'đéo', 'deo', 'đệt', 'det',
    'vl', 'vãi', 'vai', 'vcl', 'vkl', 'vcc', 'cc', 'cck', 'clgt',
    'đĩ', 'di', 'điếm', 'diem', 'cave',
    'ngu', 'đần', 'dan', 'khùng', 'khung', 'điên', 'dien', 'hâm', 'ham',
    'chó', 'cho', 'lợn', 'lon', 'súc vật', 'suc vat', 'súc sinh', 'suc sinh',
    'mẹ mày', 'me may', 'má mày', 'ma may', 'bố mày', 'bo may',
    'cứt', 'cut', 'đái', 'dai', 'ỉa', 'ia',
    'thằng ngu', 'thang ngu', 'con ngu', 'đồ ngu', 'do ngu',
    'thằng điên', 'con điên', 'thằng khùng', 'con khùng',
    'đồ chó', 'do cho', 'đồ khốn', 'do khon', 'khốn nạn', 'khon nan',
    'mặt lồn', 'mat lon', 'mặt buồi', 'mat buoi',
    'địt', 'dit', 'đụ', 'du', 'chịch', 'chich',
    'lồn', 'lon', 'buồi', 'buoi', 'cặc', 'cac', 'cu', 'dái', 'dai',
    'đéo mẹ', 'deo me', 'mẹ kiếp', 'me kiep', 'tiên sư', 'tien su',
    'thằng chó', 'thang cho', 'con chó', 'đồ chết', 'do chet',
    'nứng', 'nung', 'dâm', 'dam', 'sex',
    'fuck', 'shit', 'bitch', 'asshole', 'dick', 'pussy', 'cock', 'whore',
];

/**
 * Lọc từ tục tiếng Việt, thay thế bằng ***
 * @param {string} text - Văn bản cần lọc
 * @returns {string} - Văn bản đã được lọc
 */
export function filterProfanity(text) {
    if (!text || typeof text !== 'string') return text;

    let filtered = text;

    // Sắp xếp theo độ dài giảm dần để match cụm từ dài trước
    const sortedProfanity = [...VIETNAMESE_PROFANITY].sort((a, b) => b.length - a.length);

    for (const word of sortedProfanity) {
        // Tạo regex với word boundary và case-insensitive
        const regex = new RegExp(escapeRegex(word), 'gi');
        filtered = filtered.replace(regex, (match) => '*'.repeat(match.length));
    }

    return filtered;
}

/**
 * Escape special regex characters
 */
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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
