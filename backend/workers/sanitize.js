// backend/workers/sanitize.js
// Chú thích: Module sanitize input để chống prompt injection và nội dung không phù hợp

// Patterns phát hiện prompt injection - Phase 4 Enhanced
const INJECTION_PATTERNS = [
    // Cố gắng override instructions
    /ignore (previous|above|all) (instructions|prompts|rules)/i,
    /disregard (previous|above|all)/i,
    /forget (everything|all|previous)/i,
    /override (system|instructions|prompt)/i,
    /skip (system|instructions|rules)/i,
    // Cố gắng đổi persona
    /you are now/i,
    /act as/i,
    /pretend (to be|you are)/i,
    /roleplay as/i,
    /simulate (being|as)/i,
    /become (a|an)/i,
    // System prompt injection
    /system:/i,
    /\[system\]/i,
    /\[INST\]/i,
    /<<SYS>>/i,
    /<\|system\|>/i,
    /### system/i,
    // Jailbreak attempts
    /DAN/i,
    /do anything now/i,
    /jailbreak/i,
    /unrestricted mode/i,
    /unfiltered mode/i,
    // Developer mode
    /developer mode/i,
    /admin mode/i,
    /debug mode/i,
    /test mode/i,
    // Prompt injection techniques
    /new instructions/i,
    /new prompt/i,
    /change your/i,
    /modify your/i,
    /update your/i,
    // Base64/encoding attempts
    /base64/i,
    /decode this/i,
    /encrypted message/i,
    // Vietnamese variations
    /bỏ qua (hướng dẫn|quy tắc|lệnh)/i,
    /quên (tất cả|mọi thứ)/i,
    /bạn giờ là/i,
    /đóng vai/i,
];

// Từ khóa không phù hợp (profanity cơ bản)
const PROFANITY_PATTERNS = [
    // Có thể mở rộng thêm nếu cần
];

/**
 * Sanitize input text, throw error nếu phát hiện injection
 * @param {string} text - Input text cần kiểm tra
 * @returns {string} Sanitized text
 * @throws {Error} Nếu phát hiện prompt injection
 */
export function sanitizeInput(text) {
    if (!text || typeof text !== 'string') {
        throw new Error('invalid_input');
    }

    const trimmed = text.trim();

    // Check for empty after trim
    if (!trimmed) {
        throw new Error('empty_input');
    }

    // Check for prompt injection
    for (const pattern of INJECTION_PATTERNS) {
        if (pattern.test(trimmed)) {
            throw new Error('injection_detected');
        }
    }

    // Check for profanity (optional, có thể bỏ qua để AI tự xử lý)
    for (const pattern of PROFANITY_PATTERNS) {
        if (pattern.test(trimmed)) {
            throw new Error('profanity_detected');
        }
    }

    // Limit length (prevent abuse)
    if (trimmed.length > 2000) {
        return trimmed.slice(0, 2000);
    }

    return trimmed;
}

/**
 * Check if input contains injection attempt (không throw, chỉ return boolean)
 * @param {string} text 
 * @returns {boolean}
 */
export function hasInjection(text) {
    if (!text) return false;
    for (const pattern of INJECTION_PATTERNS) {
        if (pattern.test(text)) return true;
    }
    return false;
}

// Export patterns for testing
export const SANITIZE_PATTERNS = {
    injection: INJECTION_PATTERNS,
    profanity: PROFANITY_PATTERNS,
};
