// backend/workers/token-tracker.js
// Chú thích: Module theo dõi và kiểm soát chi phí token AI
// Giới hạn: 500,000 tokens/tháng, cảnh báo khi gần ngưỡng

const MONTHLY_TOKEN_LIMIT = 500000; // 500k tokens/tháng
const WARNING_THRESHOLD = 0.8; // Cảnh báo khi đạt 80%

/**
 * Lấy token usage cho tháng hiện tại
 * @param {Object} env - Cloudflare env với D1 binding
 * @returns {Promise<{tokens: number, month: string}>}
 */
export async function getTokenUsage(env) {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    try {
        const result = await env.ban_dong_hanh_db.prepare(
            'SELECT tokens FROM token_usage WHERE month = ?'
        ).bind(month).first();

        return {
            tokens: result?.tokens || 0,
            month,
        };
    } catch (error) {
        console.error('[TokenTracker] getTokenUsage error:', error.message);
        return { tokens: 0, month };
    }
}

/**
 * Cập nhật token usage
 * @param {Object} env - Cloudflare env
 * @param {number} tokensToAdd - Số tokens cần thêm
 * @returns {Promise<{tokens: number, limit: number, warning: boolean}>}
 */
export async function addTokenUsage(env, tokensToAdd = 0) {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    try {
        // Get current usage
        const current = await getTokenUsage(env);

        const newTotal = current.tokens + tokensToAdd;

        // Update or insert
        await env.ban_dong_hanh_db.prepare(
            `INSERT INTO token_usage (month, tokens, updated_at)
             VALUES (?, ?, datetime('now'))
             ON CONFLICT(month) DO UPDATE SET
                 tokens = tokens + ?,
                 updated_at = datetime('now')`
        ).bind(month, tokensToAdd, tokensToAdd).run();

        const warning = newTotal >= MONTHLY_TOKEN_LIMIT * WARNING_THRESHOLD;
        const exceeded = newTotal >= MONTHLY_TOKEN_LIMIT;

        if (exceeded) {
            console.warn(`[TokenTracker] Monthly limit exceeded: ${newTotal}/${MONTHLY_TOKEN_LIMIT}`);
        } else if (warning) {
            console.warn(`[TokenTracker] Approaching limit: ${newTotal}/${MONTHLY_TOKEN_LIMIT} (${Math.round((newTotal / MONTHLY_TOKEN_LIMIT) * 100)}%)`);
        }

        return {
            tokens: newTotal,
            limit: MONTHLY_TOKEN_LIMIT,
            warning,
            exceeded,
        };
    } catch (error) {
        console.error('[TokenTracker] addTokenUsage error:', error.message);
        return {
            tokens: 0,
            limit: MONTHLY_TOKEN_LIMIT,
            warning: false,
            exceeded: false,
        };
    }
}

/**
 * Kiểm tra xem có vượt quá giới hạn không
 * @param {Object} env - Cloudflare env
 * @returns {Promise<{allowed: boolean, tokens: number, limit: number}>}
 */
export async function checkTokenLimit(env) {
    const usage = await getTokenUsage(env);
    const allowed = usage.tokens < MONTHLY_TOKEN_LIMIT;

    return {
        allowed,
        tokens: usage.tokens,
        limit: MONTHLY_TOKEN_LIMIT,
        percentage: Math.round((usage.tokens / MONTHLY_TOKEN_LIMIT) * 100),
    };
}

/**
 * Estimate tokens từ text (rough estimate: ~4 chars = 1 token)
 * @param {string} text 
 * @returns {number}
 */
export function estimateTokens(text) {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
}

