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
    'chết đi cho rồi', 'chết đi', 'chết đc rồi',
    'không muốn sống', 'k muốn sống', 'ko muon song',
    'sống làm gì', 'sống để làm gì', 'sống chi',
    'muốn biến mất', 'biến mất khỏi đời',
    // Tự làm hại
    'tự làm hại', 'tự cắt', 'rạch tay',
    'uống thuốc ngủ', 'overdose', 'tự hurt',
    // Bạo lực/lạm dụng
    'bị xâm hại', 'bị lạm dụng', 'bị sờ soạng',
    // Có kế hoạch cụ thể
    'đã chuẩn bị', 'có kế hoạch', 'ngay bây giờ',

    // ===== GEN Z VOCABULARY - PHASE 1 ADDITION =====
    // Tiếng lóng "muốn chết"
    'mún đi luôn', 'muốn đi luôn', 'đi luôn cho rồi',
    'ngủ luôn', 'ngủ mãi', 'sleep forever',
    'đi khỏi thế giới', 'rời khỏi thế giới này',
    'end game', 'game over đời', 'gg đi',
    'bái bai thế giới', 'bye bye cuộc đời',
    // Mạng xã hội style
    'ko thể tiếp tục nữa', 'hết năng lượng sống',
    'cạn pin rồi', 'bat low quá', 'energy = 0',
    // Viết tắt phổ biến
    'kts', 'muốn c', 'muốn die',
    // Patterns mới - Phase 4
    'không còn lý do sống', 'hết lý do sống',
    'tốt nhất là chết', 'chết là giải pháp',
    'sẽ tự tử', 'sẽ tự sát', 'sẽ tự vẫn',
    'có dao', 'có thuốc', 'có dây',
    'lần cuối', 'lời cuối', 'tạm biệt',
    'không còn cách nào', 'hết cách',
];

// Từ khóa YELLOW - cần theo dõi
const YELLOW_PATTERNS = [
    // Tuyệt vọng kéo dài
    'tuyệt vọng', 'hết hy vọng', 'vô vọng',
    'không ai quan tâm', 'không ai hiểu', 'k ai quan tâm',
    'vô dụng', 'vô ích', 'thừa thãi',
    'gánh nặng cho mọi người', 'là gánh nặng',
    'không xứng đáng', 'k xứng đáng',
    'bế tắc hoàn toàn', 'không có lối thoát',
    // Bắt nạt nặng
    'bị bắt nạt', 'bị bully', 'bị đánh',
    'bị đe dọa', 'bị ép buộc',
    // Mơ hồ "không muốn sống"
    'không muốn thức dậy', 'chán sống',
    'mệt mỏi với cuộc sống',

    // ===== GEN Z VOCABULARY - PHASE 1 ADDITION =====
    // Tiếng lóng chán/buồn
    'chán đời', 'chán vl', 'chán real', 'chán thật sự',
    'toang', 'toang rồi', 'toang real', 'toang thật sự',
    'emo quá', 'đang emo', 'emo nặng',
    'xuống tinh thần', 'mood đi xuống',
    // Mạng xã hội style
    'không ai care', 'no one cares', 'ai mà hiểu',
    'cô đơn vl', 'lonely af', 'một mình hoài',
    'áp lực quá trời', 'stress vl', 'burn out rồi',
    // Tự ti
    'fail đủ thứ', 'mình dở quá', 'mình tệ quá',
    'không làm được gì cả', 'useless real',
    // Gia đình
    'bố mẹ không hiểu', 'bị la hoài', 'bị so sánh',
    'ghét về nhà', 'không muốn về nhà',
    // Patterns mới - Phase 4
    'không còn hy vọng', 'hết hy vọng',
    'mất hết động lực', 'không còn động lực',
    'cảm thấy vô dụng', 'mình vô dụng',
    'không ai cần mình', 'thừa thãi',
    'muốn biến mất', 'muốn tan biến',
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
 * Lấy response chuẩn cho RED tier - thông tin hotline Việt Nam
 * @returns {Object} Response object với hotline info
 */
export function getRedTierResponse() {
    return {
        sos: true,
        sosLevel: 'red',
        riskLevel: 'red',
        emotion: 'nguy cấp',
        reply: 'Mình rất lo cho bạn. Hãy liên hệ ngay với người lớn đáng tin cậy hoặc gọi đường dây hỗ trợ bên dưới. Bạn không đơn độc.',
        nextQuestion: '',
        actions: [
            '📞 Đường dây nóng bảo vệ trẻ em: 111 (miễn phí, 24/7)',
            '📞 Tổng đài tư vấn sức khỏe tâm thần: 1800 599 913 (miễn phí)',
            '📞 Đường dây hỗ trợ phụ nữ và trẻ em: 1800 1567 (miễn phí)',
            '💬 Nhắn tin cho bố mẹ, thầy cô, hoặc người lớn bạn tin tưởng ngay bây giờ'
        ],
        confidence: 1,
        disclaimer: 'Đây là hỗ trợ ban đầu. Các đường dây trên có chuyên gia sẵn sàng lắng nghe bạn 24/7.'
    };
}

// Export patterns for testing
export const RISK_PATTERNS = {
    red: RED_PATTERNS,
    yellow: YELLOW_PATTERNS,
};
