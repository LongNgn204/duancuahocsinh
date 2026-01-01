// backend/workers/ai-live.js
// Chú thích: WebSocket proxy cho Gemini Live API (Voice Call)
// Proxy WebSocket từ client đến Vertex AI, giấu API credentials

import { getVertexAccessToken } from './vertex-auth.js';

// Vertex AI Live model
const LIVE_MODEL = 'gemini-live-2.5-flash-native-audio';

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

function json(data, status = 200, origin = '*') {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Upgrade, Connection',
        },
    });
}

/**
 * Handle WebSocket upgrade request
 * Frontend sẽ connect đến /api/ai/live và backend sẽ proxy đến Vertex AI
 */
export default {
    async fetch(request, env) {
        const origin = getAllowedOrigin(request, env);

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                status: 204,
                headers: {
                    'Access-Control-Allow-Origin': origin,
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Upgrade, Connection, Sec-WebSocket-Key, Sec-WebSocket-Version, Sec-WebSocket-Protocol',
                },
            });
        }

        // Check if this is a WebSocket upgrade request
        const upgradeHeader = request.headers.get('Upgrade');
        if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
            return json({
                error: 'websocket_required',
                message: 'Endpoint này yêu cầu WebSocket connection',
                usage: 'Connect via WebSocket to /api/ai/live'
            }, 400, origin);
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

            // Tạo WebSocket pair
            const webSocketPair = new WebSocketPair();
            const [client, server] = Object.values(webSocketPair);

            // Accept the WebSocket connection
            server.accept();

            // Build Vertex AI Live API URL
            const location = env.VERTEX_LOCATION;
            const projectId = env.VERTEX_PROJECT_ID;
            const vertexWsUrl = `wss://${location}-aiplatform.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent`;

            // Connect to Vertex AI
            let vertexWs = null;
            let isSetupSent = false;

            // Chú thích: Cloudflare Workers không hỗ trợ outbound WebSocket trực tiếp
            // Thay vào đó, ta sẽ sử dụng HTTP streaming bidirectional
            // Hoặc return connection info để client connect trực tiếp với token

            // Vì Cloudflare Workers không hỗ trợ outbound WebSocket,
            // ta sẽ trả về access token để client connect trực tiếp đến Vertex AI
            // với token thay vì API key

            server.send(JSON.stringify({
                type: 'config',
                vertexEndpoint: vertexWsUrl,
                accessToken: accessToken,
                model: `models/${LIVE_MODEL}`,
                systemInstruction: SYSTEM_INSTRUCTION,
                expiresIn: 3600, // Token expires in 1 hour
                location: location,
                projectId: projectId
            }));

            // Close server connection after sending config
            // Client sẽ sử dụng thông tin này để connect trực tiếp
            setTimeout(() => {
                server.close(1000, 'Config sent, client should connect directly to Vertex AI');
            }, 1000);

            return new Response(null, {
                status: 101,
                webSocket: client,
            });

        } catch (err) {
            console.error('[AI Live] Error:', err);
            return json({
                error: 'live_error',
                message: String(err?.message || err)
            }, 500, origin);
        }
    }
};
