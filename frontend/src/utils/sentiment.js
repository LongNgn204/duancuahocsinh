// src/utils/sentiment.js
// Chú thích: Client-side sentiment analysis cho journal entries
// Sử dụng từ khóa tiếng Việt để phân tích cảm xúc

// Từ khóa tích cực
const POSITIVE_KEYWORDS = [
    'vui', 'hạnh phúc', 'tuyệt vời', 'tốt', 'hài lòng', 'thích', 'yêu', 'tự hào',
    'thành công', 'chiến thắng', 'may mắn', 'biết ơn', 'cảm ơn', 'tích cực',
    'hy vọng', 'lạc quan', 'phấn khởi', 'hứng thú', 'thú vị', 'tuyệt', 'awesome',
    'great', 'good', 'happy', 'excited', 'proud', 'grateful', 'thankful'
];

// Từ khóa tiêu cực
const NEGATIVE_KEYWORDS = [
    'buồn', 'chán', 'mệt', 'lo lắng', 'sợ', 'tức giận', 'thất vọng', 'tủi thân',
    'cô đơn', 'stress', 'căng thẳng', 'khó chịu', 'bực', 'ghét', 'không thích',
    'thất bại', 'tệ', 'xấu', 'khó khăn', 'vấn đề', 'rắc rối', 'phiền',
    'sad', 'angry', 'stressed', 'worried', 'scared', 'lonely', 'disappointed',
    'frustrated', 'bad', 'terrible', 'awful', 'hate', 'depressed'
];

// Từ khóa trung tính
const NEUTRAL_KEYWORDS = [
    'bình thường', 'ok', 'ổn', 'không sao', 'tạm được', 'cũng được',
    'normal', 'okay', 'fine', 'alright', 'so-so'
];

/**
 * Phân tích sentiment của text (0.0 = rất tiêu cực, 1.0 = rất tích cực)
 * @param {string} text - Nội dung cần phân tích
 * @returns {number} Sentiment score từ 0.0 đến 1.0
 */
export function analyzeSentiment(text) {
    if (!text || typeof text !== 'string') return 0.5; // Neutral

    const lowerText = text.toLowerCase();
    let positiveScore = 0;
    let negativeScore = 0;
    let neutralScore = 0;

    // Đếm từ khóa tích cực
    POSITIVE_KEYWORDS.forEach(keyword => {
        const regex = new RegExp(keyword, 'gi');
        const matches = lowerText.match(regex);
        if (matches) {
            positiveScore += matches.length;
        }
    });

    // Đếm từ khóa tiêu cực
    NEGATIVE_KEYWORDS.forEach(keyword => {
        const regex = new RegExp(keyword, 'gi');
        const matches = lowerText.match(regex);
        if (matches) {
            negativeScore += matches.length;
        }
    });

    // Đếm từ khóa trung tính
    NEUTRAL_KEYWORDS.forEach(keyword => {
        const regex = new RegExp(keyword, 'gi');
        const matches = lowerText.match(regex);
        if (matches) {
            neutralScore += matches.length;
        }
    });

    // Tính điểm (weighted)
    const total = positiveScore + negativeScore + neutralScore;
    if (total === 0) return 0.5; // Neutral nếu không có keyword

    // Positive = 1.0, Neutral = 0.5, Negative = 0.0
    const score = (positiveScore * 1.0 + neutralScore * 0.5 + negativeScore * 0.0) / total;
    
    // Normalize về 0.0-1.0
    return Math.max(0.0, Math.min(1.0, score));
}

/**
 * Phân loại sentiment thành label
 * @param {number} score - Sentiment score (0.0-1.0)
 * @returns {string} 'positive' | 'neutral' | 'negative'
 */
export function classifySentiment(score) {
    if (score >= 0.6) return 'positive';
    if (score <= 0.4) return 'negative';
    return 'neutral';
}

/**
 * Lấy màu cho sentiment
 * @param {number} score - Sentiment score
 * @returns {string} CSS color
 */
export function getSentimentColor(score) {
    if (score >= 0.6) return 'text-emerald-500';
    if (score <= 0.4) return 'text-red-500';
    return 'text-amber-500';
}

