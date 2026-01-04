// backend/workers/voice-call-do.js
// Chú thích: Durable Object cho Voice Call WebSocket proxy đến Vertex AI Gemini Live API
// Yêu cầu Cloudflare Workers Paid Plan ($5/month) để sử dụng Durable Objects

import { getVertexAccessToken } from './vertex-auth.js';

// Vertex AI Live model - sử dụng Gemini 2.0 Flash Live
const LIVE_MODEL = 'gemini-2.0-flash-live-001';

// System instruction cho voice assistant - tối ưu cho voice
const SYSTEM_INSTRUCTION = `Bạn là "Bạn Đồng Hành", một người bạn AI thông minh dành cho học sinh Việt Nam.

CÁCH NÓI CHUYỆN:
- Nói tự nhiên, thoải mái như bạn bè
- KHÔNG đọc emoji, icon hay ký hiệu đặc biệt  
- KHÔNG liệt kê kiểu 1, 2, 3 hay gạch đầu dòng
- Nói rõ ràng, dễ hiểu
- Nhớ những gì người dùng đã chia sẻ

BẠN CÓ THỂ GIÚP:
- Học tập: hỏi bài, giải thích kiến thức, ôn thi
- Tâm lý: lắng nghe tâm sự, chia sẻ, động viên
- Cuộc sống: bạn bè, gia đình, định hướng
- Giải trí: trò chuyện vui, kể chuyện

LƯU Ý:
- Nếu người dùng im lặng, đợi họ nói
- Nếu phát hiện dấu hiệu khủng hoảng, khuyên tìm người lớn đáng tin`;

/**
 * VoiceCallSession Durable Object
 * Chú thích: Duy trì WebSocket session stateful giữa client và Vertex AI
 */
export class VoiceCallSession {
    constructor(state, env) {
        this.state = state;
        this.env = env;
        this.clientWs = null;
        this.vertexWs = null;
        this.isConnected = false;
        this.setupComplete = false;
    }

    /**
     * Handle incoming requests (WebSocket upgrade)
     */
    async fetch(request) {
        const upgradeHeader = request.headers.get('Upgrade');

        if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
            return new Response(JSON.stringify({
                error: 'websocket_required',
                message: 'WebSocket upgrade required'
            }), {
                status: 426,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Tạo WebSocket pair cho client
        const webSocketPair = new WebSocketPair();
        const [client, server] = Object.values(webSocketPair);

        // Accept connection từ client
        server.accept();
        this.clientWs = server;

        console.log('[VoiceCallDO] Client WebSocket accepted');

        // Setup event handlers cho client
        this.setupClientHandlers(server);

        // Connect đến Vertex AI
        try {
            await this.connectToVertexAI();
        } catch (err) {
            console.error('[VoiceCallDO] Failed to connect to Vertex AI:', err);
            server.send(JSON.stringify({
                type: 'error',
                message: `Không thể kết nối Vertex AI: ${err.message}`
            }));
            server.close(1011, 'Vertex AI connection failed');
            return new Response(null, { status: 101, webSocket: client });
        }

        return new Response(null, { status: 101, webSocket: client });
    }

    /**
     * Setup handlers cho client WebSocket
     */
    setupClientHandlers(ws) {
        ws.addEventListener('message', async (event) => {
            try {
                const data = typeof event.data === 'string'
                    ? event.data
                    : await event.data.text();

                console.log('[VoiceCallDO] Client message received');

                // Forward message to Vertex AI
                if (this.vertexWs && this.isConnected) {
                    this.vertexWs.send(data);
                } else {
                    console.warn('[VoiceCallDO] Vertex AI not connected, queuing message');
                }
            } catch (err) {
                console.error('[VoiceCallDO] Error handling client message:', err);
            }
        });

        ws.addEventListener('close', (event) => {
            console.log('[VoiceCallDO] Client disconnected:', event.code, event.reason);
            this.cleanup();
        });

        ws.addEventListener('error', (event) => {
            console.error('[VoiceCallDO] Client WebSocket error:', event);
            this.cleanup();
        });
    }

    /**
     * Connect đến Vertex AI Live API
     */
    async connectToVertexAI() {
        // Lấy access token
        const accessToken = await getVertexAccessToken(this.env);

        const location = this.env.VERTEX_LOCATION || 'us-central1';
        const projectId = this.env.VERTEX_PROJECT_ID;

        // Vertex AI Live WebSocket endpoint
        const vertexWsUrl = `wss://${location}-aiplatform.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent`;

        console.log('[VoiceCallDO] Connecting to Vertex AI:', vertexWsUrl);

        // Chú thích: Cloudflare Durable Objects hỗ trợ outbound WebSocket
        // thông qua global fetch() với WebSocket upgrade
        const vertexResponse = await fetch(vertexWsUrl, {
            headers: {
                'Upgrade': 'websocket',
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!vertexResponse.webSocket) {
            throw new Error('Vertex AI did not return WebSocket');
        }

        this.vertexWs = vertexResponse.webSocket;
        this.vertexWs.accept();
        this.isConnected = true;

        console.log('[VoiceCallDO] Vertex AI WebSocket connected');

        // Send setup message
        const setupMessage = {
            setup: {
                model: `projects/${projectId}/locations/${location}/publishers/google/models/${LIVE_MODEL}`,
                generationConfig: {
                    responseModalities: ['AUDIO'],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: {
                                voiceName: 'Aoede' // Female voice, Vietnamese-friendly
                            }
                        }
                    }
                },
                systemInstruction: {
                    parts: [{ text: SYSTEM_INSTRUCTION }]
                }
            }
        };

        this.vertexWs.send(JSON.stringify(setupMessage));

        // Setup handlers cho Vertex AI response
        this.setupVertexHandlers();
    }

    /**
     * Setup handlers cho Vertex AI WebSocket
     */
    setupVertexHandlers() {
        this.vertexWs.addEventListener('message', async (event) => {
            try {
                const data = typeof event.data === 'string'
                    ? event.data
                    : await event.data.text();

                const parsed = JSON.parse(data);

                // Handle setupComplete
                if (parsed.setupComplete) {
                    console.log('[VoiceCallDO] Vertex AI setup complete');
                    this.setupComplete = true;

                    // Notify client
                    if (this.clientWs) {
                        this.clientWs.send(JSON.stringify({
                            type: 'connected',
                            setupComplete: true
                        }));
                    }
                    return;
                }

                // Forward all other messages to client
                if (this.clientWs) {
                    this.clientWs.send(data);
                }
            } catch (err) {
                console.error('[VoiceCallDO] Error handling Vertex message:', err);
            }
        });

        this.vertexWs.addEventListener('close', (event) => {
            console.log('[VoiceCallDO] Vertex AI disconnected:', event.code, event.reason);
            this.isConnected = false;

            // Notify client
            if (this.clientWs) {
                this.clientWs.send(JSON.stringify({
                    type: 'error',
                    message: 'Kết nối AI bị ngắt'
                }));
                this.clientWs.close(1000, 'Vertex AI disconnected');
            }
        });

        this.vertexWs.addEventListener('error', (event) => {
            console.error('[VoiceCallDO] Vertex AI WebSocket error:', event);
            this.isConnected = false;
        });
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        if (this.vertexWs) {
            try {
                this.vertexWs.close();
            } catch (e) {
                // Ignore
            }
            this.vertexWs = null;
        }
        this.isConnected = false;
        this.setupComplete = false;
    }
}

/**
 * Handler function để backward compatibility với router.js
 * Chú thích: Router.js đã handle WebSocket trực tiếp qua DO,
 * nhưng giữ function này cho các trường hợp khác
 */
export async function handleVoiceCall(request, env) {
    // Tạo unique session ID
    const sessionId = crypto.randomUUID();

    // Get Durable Object stub
    const id = env.VOICE_CALL_SESSION.idFromName(sessionId);
    const stub = env.VOICE_CALL_SESSION.get(id);

    // Forward request to Durable Object
    return stub.fetch(request);
}

export default { VoiceCallSession, handleVoiceCall };
