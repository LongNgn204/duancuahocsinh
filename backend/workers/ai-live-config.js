// backend/workers/ai-live-config.js
// Chú thích: HTTP endpoint để lấy Vertex AI Live config (access token + endpoint)
// Frontend sẽ dùng config này để connect trực tiếp đến Vertex AI

import { getVertexAccessToken } from './vertex-auth.js';

// Vertex AI Live model
const LIVE_MODEL = 'gemini-2.0-flash-live-001';

// System instruction cho voice assistant
const SYSTEM_INSTRUCTION = `Bạn là "Bạn Đồng Hành", một người bạn AI thông minh dành cho học sinh Việt Nam. Bạn được cập nhật kiến thức mới nhất mỗi ngày.

CÁCH NÓI CHUYỆN:
- Nói tự nhiên, thoải mái như đang nói chuyện với bạn bè
- KHÔNG đọc emoji, icon hay ký hiệu đặc biệt
- KHÔNG liệt kê kiểu 1, 2, 3 hay gạch đầu dòng
- Nói rõ ràng, dễ hiểu, tránh từ ngữ phức tạp
- Nhớ những gì người dùng đã chia sẻ và tham chiếu lại
- Thể hiện sự quan tâm và đồng cảm

BẠN CÓ THỂ GIÚP:
- Học tập: hỏi bài, giải thích kiến thức, ôn thi
- Tâm lý: lắng nghe tâm sự, chia sẻ, động viên
- Cuộc sống: bạn bè, gia đình, định hướng tương lai
- Giải trí: trò chuyện vui, kể chuyện

LƯU Ý:
- Nếu người dùng im lặng, hãy đợi họ nói - không cần hỏi gì thêm
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
            // Lấy access token
            const accessToken = await getVertexAccessToken(env);

            // Build Vertex AI Live API URL
            const location = env.VERTEX_LOCATION;
            const projectId = env.VERTEX_PROJECT_ID;

            // Chú thích: Vertex AI Live WebSocket endpoint
            const vertexWsUrl = `wss://${location}-aiplatform.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent`;

            console.log('[AI Live Config] Generated config for project:', projectId);

            return json({
                vertexEndpoint: vertexWsUrl,
                accessToken: accessToken,
                model: `models/${LIVE_MODEL}`,
                systemInstruction: SYSTEM_INSTRUCTION,
                expiresIn: 3600, // Token expires in 1 hour
                location: location,
                projectId: projectId
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
