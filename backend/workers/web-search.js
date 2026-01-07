// backend/workers/web-search.js
// Chú thích: DuckDuckGo Instant Answer API cho grounding search
// API miễn phí, không cần API key

const DDG_API_URL = 'https://api.duckduckgo.com/';

/**
 * Kiểm tra xem câu hỏi có cần tìm kiếm web không
 * @param {string} message - Tin nhắn từ user
 * @returns {boolean} True nếu cần search
 */
export function shouldSearch(message) {
    if (!message) return false;

    const lowerMessage = message.toLowerCase();

    // Các pattern cần search thông tin mới
    const searchPatterns = [
        // Thời sự, tin tức
        /tin (tức|mới|nóng)/i,
        /thời sự/i,
        /mới nhất/i,
        /gần đây/i,
        /hôm nay/i,
        /tuần này/i,
        /tháng này/i,
        /năm nay/i,
        /hiện (tại|nay)/i,

        // Câu hỏi về người, sự kiện
        /ai (là|đã|sẽ)/i,
        /là ai/i,
        /là gì/i,
        /ở đâu/i,
        /khi nào/i,
        /bao nhiêu/i,

        // Câu hỏi về tech, khoa học
        /công nghệ/i,
        /phần mềm/i,
        /ứng dụng/i,
        /website/i,
        /game/i,

        // Thời tiết
        /thời tiết/i,
        /nhiệt độ/i,
        /mưa/i,
        /nắng/i,

        // Giá cả
        /giá (bao nhiêu|là)/i,
        /tỷ giá/i,
        /bitcoin/i,
        /crypto/i,

        // Định nghĩa
        /định nghĩa/i,
        /nghĩa là gì/i,
        /giải thích/i,
    ];

    for (const pattern of searchPatterns) {
        if (pattern.test(lowerMessage)) {
            return true;
        }
    }

    // Câu hỏi dạng "... là gì", "... là ai"
    if (/\S+\s+(là\s+)?(gì|ai)\s*\??$/i.test(message)) {
        return true;
    }

    return false;
}

/**
 * Tìm kiếm DuckDuckGo Instant Answer
 * @param {string} query - Từ khóa tìm kiếm
 * @returns {Promise<Object|null>} Kết quả search hoặc null
 */
export async function searchDuckDuckGo(query) {
    if (!query || query.trim().length < 2) return null;

    try {
        const params = new URLSearchParams({
            q: query,
            format: 'json',
            no_html: '1',
            skip_disambig: '1',
            no_redirect: '1',
        });

        const url = `${DDG_API_URL}?${params.toString()}`;
        console.log('[WebSearch] Calling DuckDuckGo:', query);

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'BanDongHanh/1.0 (Education Bot)',
            },
        });

        if (!response.ok) {
            console.warn('[WebSearch] DuckDuckGo error:', response.status);
            return null;
        }

        const data = await response.json();
        return parseSearchResult(data);

    } catch (error) {
        console.error('[WebSearch] Error:', error.message);
        return null;
    }
}

/**
 * Parse kết quả từ DuckDuckGo
 * @param {Object} data - Response từ DDG API
 * @returns {Object|null} Parsed result
 */
function parseSearchResult(data) {
    if (!data) return null;

    const result = {
        abstract: null,
        definition: null,
        answer: null,
        relatedTopics: [],
        source: 'DuckDuckGo',
    };

    // Abstract (thông tin chính)
    if (data.AbstractText) {
        result.abstract = {
            text: data.AbstractText,
            source: data.AbstractSource || 'Wikipedia',
            url: data.AbstractURL,
        };
    }

    // Definition
    if (data.Definition) {
        result.definition = {
            text: data.Definition,
            source: data.DefinitionSource,
        };
    }

    // Instant Answer
    if (data.Answer) {
        result.answer = data.Answer;
    }

    // Related Topics (lấy tối đa 3)
    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
        result.relatedTopics = data.RelatedTopics
            .filter(t => t.Text && !t.Topics) // Bỏ qua sub-topics
            .slice(0, 3)
            .map(t => ({
                text: t.Text,
                url: t.FirstURL,
            }));
    }

    // Kiểm tra có kết quả không
    if (!result.abstract && !result.definition && !result.answer && result.relatedTopics.length === 0) {
        return null;
    }

    return result;
}

/**
 * Format kết quả search thành context cho LLM
 * @param {Object} searchResult - Kết quả từ searchDuckDuckGo
 * @returns {string} Formatted context
 */
export function formatSearchContext(searchResult) {
    if (!searchResult) return '';

    const parts = [];

    parts.push('📡 **Thông tin tham khảo từ Internet:**\n');

    // Answer (câu trả lời trực tiếp)
    if (searchResult.answer) {
        parts.push(`**Trả lời:** ${searchResult.answer}\n`);
    }

    // Definition
    if (searchResult.definition) {
        parts.push(`**Định nghĩa (${searchResult.definition.source || 'Dictionary'}):** ${searchResult.definition.text}\n`);
    }

    // Abstract
    if (searchResult.abstract) {
        parts.push(`**Từ ${searchResult.abstract.source}:** ${searchResult.abstract.text}`);
        if (searchResult.abstract.url) {
            parts.push(`\n🔗 Nguồn: ${searchResult.abstract.url}`);
        }
        parts.push('\n');
    }

    // Related topics
    if (searchResult.relatedTopics.length > 0) {
        parts.push('\n**Thông tin liên quan:**');
        searchResult.relatedTopics.forEach((topic, i) => {
            parts.push(`\n${i + 1}. ${topic.text}`);
        });
    }

    return parts.join('');
}

// Export cho testing
export default {
    shouldSearch,
    searchDuckDuckGo,
    formatSearchContext,
};
