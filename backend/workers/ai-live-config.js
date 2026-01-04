// backend/workers/ai-live-config.js
// Chú thích: HTTP endpoint để lấy Vertex AI Live config (access token + endpoint)
// Frontend sẽ dùng config này để connect trực tiếp đến Vertex AI

import { getVertexAccessToken } from './vertex-auth.js';

// Vertex AI Live model
const LIVE_MODEL = 'gemini-2.0-flash-exp';

// System instruction cho voice assistant
const SYSTEM_INSTRUCTION = `LUÔN TRẢ LỜI BẰNG TIẾNG VIỆT. Bạn là "Bạn Đồng Hành", một người bạn AI thông minh dành cho học sinh Việt Nam.

CÁCH NÓI CHUYỆN:
- Nói tiếng Việt tự nhiên, thoải mái như bạn bè
- Trả lời ngắn gọn, mỗi lượt chỉ 1-2 câu
- KHÔNG đọc emoji, icon hay ký hiệu đặc biệt
- Thể hiện sự quan tâm và đồng cảm

BẠN CÓ THỂ GIÚP:
- Học tập: hỏi bài, giải thích kiến thức
- Tâm lý: lắng nghe tâm sự, động viên
- Cuộc sống: bạn bè, gia đình

LƯU Ý:
- Nếu người dùng im lặng, đợi họ nói
- Nếu phát hiện dấu hiệu khủng hoảng, khuyên tìm người lớn đáng tin`;

// CORS helpers
function getAllowedOrigin(request, env) {
    const reqOrigin = request.headers.get('Origin') || '';
    const allow = env.ALLOW_ORIGIN || '*';

    if (allow === '*' || !reqOrigin) return allow === '*' ? '*' : reqOrigin || '*';

    const list = allow.split(',').map((s) => s.trim());
    if (list.includes(reqOrigin)) return reqOrigin;

    for (const pattern of list) {
        if (pattern.startsWith('*.')) {
            const domain = pattern.slice(2);
            const originHost = reqOrigin.replace(/^https?:\/\//, '');
            if (originHost.endsWith('.' + domain) || originHost === domain) {
                return reqOrigin;
            }
        }
    }

    if (reqOrigin.includes('.pages.dev')) return reqOrigin;
    return 'null';
}

function corsHeaders(origin = '*') {
    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}

function json(data, status = 200, origin = '*') {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
    });
}

export default {
    async fetch(request, env) {
        const origin = getAllowedOrigin(request, env);

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders(origin) });
        }

        if (request.method !== 'POST') {
            return json({ error: 'method_not_allowed' }, 405, origin);
        }

        // Kiểm tra Vertex AI credentials
        if (!env.VERTEX_PROJECT_ID || !env.VERTEX_LOCATION) {
            return json({
                error: 'vertex_not_configured',
                message: 'Missing Vertex AI configuration'
            }, 500, origin);
        }

        try {
            // Chú thích: Gemini Live API dùng API key, không dùng OAuth token
            // API key được lấy từ env.GEMINI_API_KEY (Cloudflare secret)
            const apiKey = env.GEMINI_API_KEY;
            if (!apiKey) {
                return json({
                    error: 'missing_api_key',
                    message: 'Missing GEMINI_API_KEY. Run: wrangler secret put GEMINI_API_KEY'
                }, 500, origin);
            }

            // Gemini Live API WebSocket endpoint (không phải Vertex AI)
            const geminiWsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent`;

            console.log('[AI Live Config] Generated config with Gemini API');

            return json({
                geminiEndpoint: geminiWsUrl,
                apiKey: apiKey,
                model: `models/${LIVE_MODEL}`,
                systemInstruction: SYSTEM_INSTRUCTION,
                expiresIn: 3600
            }, 200, origin);

        } catch (err) {
            console.error('[AI Live Config] Error:', err);
            return json({
                error: 'live_config_error',
                message: String(err?.message || err)
            }, 500, origin);
        }
    }
};
