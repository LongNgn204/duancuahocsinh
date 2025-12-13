// backend/workers/risk.js
// Chú thích: Module phân loại rủi ro SOS theo 3 tầng (rules-first)
// RED: tự hại/bạo lực/có kế hoạch → hướng dẫn hotline, không tư vấn sâu
// YELLOW: tuyệt vọng kéo dài/bắt nạt/mơ hồ → check-in + kỹ thuật ổn định
// GREEN: stress thường ngày → mentor bình thường

// Từ khóa RED - cần can thiệp ngay
const RED_PATTERNS = [
    // Ý định tự hại rõ ràng
    'tự tử', 'tự vẫn', 'tự sát',
    'muốn chết', 'mún chết', 'muon chet',
    'kết thúc cuộc đời', 'kết thúc tất cả',
    'chết đi cho rồi', 'chết đi',
    'không muốn sống', 'k muốn sống',
    'sống làm gì', 'sống để làm gì',
    'muốn biến mất', 'biến mất khỏi đời',
    // Tự làm hại
    'tự làm hại', 'tự cắt', 'rạch tay',
    'uống thuốc ngủ', 'overdose',
    // Bạo lực/lạm dụng
    'bị xâm hại', 'bị lạm dụng',
    // Có kế hoạch cụ thể
    'đã chuẩn bị', 'có kế hoạch', 'ngay bây giờ',
];

// Từ khóa YELLOW - cần theo dõi
const YELLOW_PATTERNS = [
    // Tuyệt vọng kéo dài
    'tuyệt vọng', 'hết hy vọng', 'vô vọng',
    'không ai quan tâm', 'không ai hiểu',
    'vô dụng', 'vô ích', 'thừa thãi',
    'gánh nặng cho mọi người',
    'không xứng đáng',
    'bế tắc hoàn toàn', 'không có lối thoát',
    // Bắt nạt nặng
    'bị bắt nạt', 'bị bully', 'bị đánh',
    'bị đe dọa', 'bị ép buộc',
    // Mơ hồ "không muốn sống"
    'không muốn thức dậy', 'chán sống',
    'mệt mỏi với cuộc sống',
];

/**
 * Phân loại rủi ro SOS theo rules-first
 * @param {string} text - Nội dung tin nhắn hiện tại
 * @param {Array} history - Lịch sử hội thoại (optional)
 * @returns {'red'|'yellow'|'green'} Mức độ rủi ro
 */
export function classifyRiskRules(text, history = []) {
    if (!text) return 'green';

    // Normalize text: lowercase + remove diacritics for matching
    const t = String(text).toLowerCase();
    const tNorm = t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Check RED patterns first
    for (const pattern of RED_PATTERNS) {
        const p = pattern.toLowerCase();
        const pNorm = p.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (t.includes(p) || tNorm.includes(pNorm)) {
            return 'red';
        }
    }

    // Check YELLOW patterns
    for (const pattern of YELLOW_PATTERNS) {
        const p = pattern.toLowerCase();
        const pNorm = p.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (t.includes(p) || tNorm.includes(pNorm)) {
            return 'yellow';
        }
    }

    // Check history for escalating patterns (optional enhancement)
    if (Array.isArray(history) && history.length >= 3) {
        const recentTexts = history.slice(-3).map(h => String(h.content || '').toLowerCase()).join(' ');
        // Nếu có nhiều dấu hiệu tiêu cực trong history → YELLOW
        let yellowCount = 0;
        for (const pattern of YELLOW_PATTERNS) {
            if (recentTexts.includes(pattern.toLowerCase())) yellowCount++;
        }
        if (yellowCount >= 2) return 'yellow';
    }

    return 'green';
}

/**
 * Lấy response chuẩn cho RED tier
 * @returns {Object} Response object với hotline info
 */
export function getRedTierResponse() {
    return {
        sos: true,
        sosLevel: 'red',
        riskLevel: 'red',
        emotion: 'nguy cấp',
        reply: 'Mình rất lo cho bạn. Hãy liên hệ ngay với người lớn đáng tin cậy hoặc gọi đường dây hỗ trợ.',
        nextQuestion: '',
        actions: [
            'Gọi 111 - Đường dây bảo vệ trẻ em (24/7)',
            'Gọi 1800 599 920 - Hỗ trợ sức khỏe tâm thần (miễn phí)',
            'Nói với bố mẹ, thầy cô, hoặc người lớn tin cậy'
        ],
        confidence: 1,
        disclaimer: 'Đây là hỗ trợ ban đầu. Vui lòng liên hệ chuyên gia tâm lý để được tư vấn chuyên sâu.'
    };
}

// Export patterns for testing
export const RISK_PATTERNS = {
    red: RED_PATTERNS,
    yellow: YELLOW_PATTERNS,
};
