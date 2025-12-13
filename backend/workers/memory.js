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

    // Tạo summary đơn giản bằng cách lấy key points
    const userMessages = oldMessages
        .filter(m => m.role === 'user')
        .map(m => m.content)
        .join(' ');

    // Trích xuất facts cơ bản (không lưu sensitive info)
    const summary = extractKeyFacts(userMessages);

    return summary;
}

/**
 * Trích xuất facts quan trọng từ text (helper function)
 * @param {string} text 
 * @returns {string} Key facts
 */
function extractKeyFacts(text) {
    if (!text) return '';

    // Giới hạn độ dài
    const words = text.split(/\s+/).slice(0, 150);
    const shortened = words.join(' ');

    // Format thành summary
    if (shortened.length > 0) {
        return `Tóm tắt trước đó: ${shortened.slice(0, 400)}${shortened.length > 400 ? '...' : ''}`;
    }

    return '';
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
