// backend/workers/memory.js
// Chú thích: Module quản lý context và memory compression
// Chỉ gửi 5-10 messages gần nhất + memorySummary (100-200 từ)

/**
 * Lấy N messages gần nhất từ history
 * @param {Array} history - Full history
 * @param {number} limit - Số messages tối đa (default 8)
 * @returns {Array} Recent messages
 */
export function getRecentMessages(history = [], limit = 8) {
    if (!Array.isArray(history)) return [];
    return history.slice(-limit);
}

/**
 * Tạo summary từ history cũ (phần bị cắt bỏ)
 * @param {Array} history - Full history  
 * @param {number} recentLimit - Số messages gần nhất sẽ giữ nguyên
 * @returns {string} Summary text (100-200 từ)
 */
export function createMemorySummary(history = [], recentLimit = 8) {
    if (!Array.isArray(history) || history.length <= recentLimit) {
        return '';
    }

    // Lấy phần history cũ (sẽ được tóm tắt)
    const oldMessages = history.slice(0, -recentLimit);
    if (oldMessages.length === 0) return '';

    // Tạo summary có cấu trúc: chủ đề chính, cảm xúc, nguyên nhân gốc
    const userMessages = oldMessages
        .filter(m => m.role === 'user')
        .map(m => m.content || '')
        .filter(Boolean);

    const assistantMessages = oldMessages
        .filter(m => m.role === 'assistant')
        .map(m => m.content || '')
        .filter(Boolean);

    // Trích xuất key information
    const allText = [...userMessages, ...assistantMessages].join(' ');
    const summary = extractKeyFacts(allText, userMessages);

    return summary;
}

/**
 * Trích xuất facts quan trọng từ text (helper function)
 * @param {string} text - All text
 * @param {Array} userMessages - User messages only
 * @returns {string} Key facts summary
 */
function extractKeyFacts(text, userMessages = []) {
    if (!text) return '';

    // Tìm chủ đề chính (từ khóa lặp lại)
    const commonTopics = ['học tập', 'gia đình', 'bạn bè', 'tình cảm', 'stress', 'lo lắng', 'buồn', 'cô đơn'];
    const foundTopics = commonTopics.filter(topic => 
        text.toLowerCase().includes(topic)
    );

    // Tìm cảm xúc chính
    const emotions = ['buồn', 'vui', 'giận', 'sợ', 'lo lắng', 'stress', 'cô đơn', 'tủi thân', 'confused'];
    const foundEmotions = emotions.filter(emotion => 
        text.toLowerCase().includes(emotion)
    );

    // Lấy key sentences từ user messages (câu dài hơn 20 ký tự)
    const keySentences = userMessages
        .map(msg => {
            const sentences = msg.split(/[.!?]\s+/).filter(s => s.length > 20);
            return sentences.slice(0, 2); // Lấy 2 câu đầu tiên
        })
        .flat()
        .slice(0, 3); // Tối đa 3 câu

    // Tạo summary có cấu trúc
    const parts = [];
    
    if (foundTopics.length > 0) {
        parts.push(`Chủ đề chính: ${foundTopics.join(', ')}`);
    }
    
    if (foundEmotions.length > 0) {
        parts.push(`Cảm xúc: ${foundEmotions.join(', ')}`);
    }
    
    if (keySentences.length > 0) {
        parts.push(`Điểm quan trọng: ${keySentences.join(' | ')}`);
    }

    // Fallback: nếu không có gì, lấy 150 từ đầu
    if (parts.length === 0) {
        const words = text.split(/\s+/).slice(0, 100);
        return `Tóm tắt: ${words.join(' ')}${text.length > words.join(' ').length ? '...' : ''}`;
    }

    return parts.join('\n');
}

/**
 * Format history thành messages array cho LLM
 * @param {string} systemPrompt - System instruction
 * @param {Array} history - Conversation history
 * @param {string} currentMessage - Current user message
 * @param {string} memorySummary - Optional memory summary
 * @returns {Array} Messages array for LLM
 */
export function formatMessagesForLLM(systemPrompt, history = [], currentMessage, memorySummary = '') {
    const messages = [];

    // System message với summary nếu có
    let systemContent = systemPrompt;
    if (memorySummary) {
        systemContent = `${systemPrompt}\n\n[NGỮ CẢNH TRƯỚC ĐÓ]\n${memorySummary}`;
    }
    messages.push({ role: 'system', content: systemContent });

    // Recent history
    const recent = getRecentMessages(history, 8);
    for (const msg of recent) {
        messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content || ''
        });
    }

    // Current message
    if (currentMessage) {
        messages.push({ role: 'user', content: currentMessage });
    }

    return messages;
}

/**
 * Check if should generate new summary (khi đủ messages mới)
 * @param {number} totalMessages 
 * @param {number} lastSummaryAt - Số messages khi tạo summary lần cuối
 * @param {number} threshold - Ngưỡng để tạo summary mới (default 8)
 * @returns {boolean}
 */
export function shouldUpdateSummary(totalMessages, lastSummaryAt = 0, threshold = 8) {
    return totalMessages - lastSummaryAt >= threshold;
}
