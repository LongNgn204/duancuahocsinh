// backend/workers/voice-call-do.js
// Chú thích: Durable Object để proxy WebSocket cho Voice Call
// Durable Objects hỗ trợ outbound WebSocket, cho phép proxy từ client → DO → Vertex AI

import { getVertexAccessToken } from './vertex-auth.js';

// Vertex AI Live model
const LIVE_MODEL = 'gemini-2.0-flash-live-001';

// System instruction cho voice assistant
const SYSTEM_INSTRUCTION = `Bạn là "Bạn Đồng Hành", một người bạn AI thông minh dành cho học sinh Việt Nam.

CÁCH NÓI CHUYỆN:
- Nói tự nhiên, thoải mái như bạn bè
- KHÔNG đọc emoji, icon
- Nói rõ ràng, dễ hiểu
- Thể hiện sự quan tâm và đồng cảm

BẠN CÓ THỂ GIÚP:
- Học tập: hỏi bài, giải thích kiến thức
- Tâm lý: lắng nghe, động viên
- Cuộc sống: bạn bè, gia đình

LƯU Ý:
- Nếu người dùng im lặng, đợi họ nói
- Nếu phát hiện khủng hoảng, khuyên tìm người lớn đáng tin`;

/**
 * VoiceCallSession - Durable Object cho mỗi voice call session
 */
export class VoiceCallSession {
    constructor(state, env) {
        this.state = state;
        this.env = env;
        this.clientWs = null;
        this.vertexWs = null;
        this.isConnected = false;
    }

    async fetch(request) {
        console.log('[VoiceCallDO] fetch() called');

        const url = new URL(request.url);

        // Handle WebSocket upgrade
        const upgradeHeader = request.headers.get('Upgrade');
        console.log('[VoiceCallDO] Upgrade header:', upgradeHeader);

        if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
            console.log('[VoiceCallDO] Not a WebSocket request');
            return new Response('Expected WebSocket', { status: 426 });
        }

        // Create WebSocket pair for client connection
        const webSocketPair = new WebSocketPair();
        const [client, server] = Object.values(webSocketPair);

        // ⚠️ CRITICAL: Accept TRƯỚC, trả 101 NGAY LẬP TỨC
        // Không để exception block việc trả 101
        this.state.acceptWebSocket(server);
        this.clientWs = server;
        console.log('[VoiceCallDO] WebSocket accepted');

        // ⚠️ TRẢ 101 NGAY - không đợi Vertex connect
        const response = new Response(null, {
            status: 101,
            webSocket: client,
        });

        // Connect Vertex AI ASYNC (sau khi đã trả 101)
        // Dùng waitUntil để worker không terminate sớm
        this.state.waitUntil(this.initVertexConnection());

        console.log('[VoiceCallDO] Returning 101');
        return response;
    }

    // Chú thích: Init Vertex connection ASYNC - không block 101 handshake
    async initVertexConnection() {
        try {
            console.log('[VoiceCallDO] Starting Vertex AI connection...');
            const accessToken = await getVertexAccessToken(this.env);
            await this.connectToVertexAI(accessToken);
            console.log('[VoiceCallDO] Vertex AI connected successfully');
        } catch (err) {
            console.error('[VoiceCallDO] Vertex connection failed:', err);
            // Gửi error message đến client (WebSocket đã mở)
            if (this.clientWs) {
                try {
                    this.clientWs.send(JSON.stringify({
                        type: 'error',
                        message: 'Failed to connect to Vertex AI: ' + err.message
                    }));
                    this.clientWs.close(1011, 'Vertex AI connection failed');
                } catch (e) {
                    console.error('[VoiceCallDO] Failed to send error to client:', e);
                }
            }
        }
    }

    async connectToVertexAI(accessToken) {
        const location = this.env.VERTEX_LOCATION || 'us-central1';
        const projectId = this.env.VERTEX_PROJECT_ID;

        // Vertex AI Live WebSocket endpoint
        const vertexUrl = `wss://${location}-aiplatform.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent`;

        console.log('[VoiceCallDO] Connecting to Vertex AI:', vertexUrl);

        // Durable Objects support outbound WebSocket via fetch()
        const vertexResponse = await fetch(vertexUrl, {
            headers: {
                'Upgrade': 'websocket',
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (vertexResponse.status !== 101) {
            throw new Error(`Vertex AI connection failed: ${vertexResponse.status}`);
        }

        this.vertexWs = vertexResponse.webSocket;
        this.vertexWs.accept();
        this.isConnected = true;

        console.log('[VoiceCallDO] Connected to Vertex AI');

        // Notify client
        if (this.clientWs) {
            this.clientWs.send(JSON.stringify({ type: 'connected' }));
        }

        // Send setup message to Vertex AI
        const setupMessage = {
            setup: {
                model: `models/${LIVE_MODEL}`,
                generationConfig: {
                    responseModalities: ["AUDIO"],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: {
                                voiceName: "Aoede"
                            }
                        }
                    }
                },
                systemInstruction: {
                    parts: [{ text: SYSTEM_INSTRUCTION }]
                },
                realtimeInputConfig: {
                    automaticActivityDetection: {
                        disabled: false,
                        startOfSpeechSensitivity: "START_OF_SPEECH_SENSITIVITY_HIGH",
                        endOfSpeechSensitivity: "END_OF_SPEECH_SENSITIVITY_HIGH",
                        prefixPaddingMs: 100,
                        silenceTimeoutMs: 1000
                    },
                    activityHandling: "START_OF_ACTIVITY_INTERRUPTS",
                    turnCoverage: "TURN_INCLUDES_ALL_INPUT"
                }
            }
        };

        this.vertexWs.send(JSON.stringify(setupMessage));
        console.log('[VoiceCallDO] Setup message sent');

        // Handle messages from Vertex AI
        this.vertexWs.addEventListener('message', (event) => {
            // Forward to client
            if (this.clientWs && this.clientWs.readyState === WebSocket.OPEN) {
                this.clientWs.send(event.data);
            }
        });

        this.vertexWs.addEventListener('close', (event) => {
            console.log('[VoiceCallDO] Vertex AI closed:', event.code, event.reason);
            this.isConnected = false;
            if (this.clientWs && this.clientWs.readyState === WebSocket.OPEN) {
                this.clientWs.close(event.code, event.reason);
            }
        });

        this.vertexWs.addEventListener('error', (event) => {
            console.error('[VoiceCallDO] Vertex AI error:', event);
        });
    }

    // Handle messages from client
    async webSocketMessage(ws, message) {
        if (this.vertexWs && this.isConnected) {
            // Forward client message to Vertex AI
            this.vertexWs.send(message);
        }
    }

    // Handle client disconnect
    async webSocketClose(ws, code, reason, wasClean) {
        console.log('[VoiceCallDO] Client disconnected:', code, reason);
        if (this.vertexWs) {
            this.vertexWs.close(code, reason);
        }
    }

    // Handle client error
    async webSocketError(ws, error) {
        console.error('[VoiceCallDO] Client error:', error);
    }
}

/**
 * Handler để route request đến Durable Object
 * Chú thích: Thêm logging chi tiết để debug WebSocket 1006
 */
export async function handleVoiceCall(request, env) {
    console.log('[handleVoiceCall] Request received');
    console.log('[handleVoiceCall] URL:', request.url);
    console.log('[handleVoiceCall] Method:', request.method);

    const origin = request.headers.get('Origin') || '*';

    // Handle CORS preflight for WebSocket
    if (request.method === 'OPTIONS') {
        console.log('[handleVoiceCall] CORS preflight');
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Upgrade, Connection, Sec-WebSocket-Key, Sec-WebSocket-Version, Sec-WebSocket-Protocol',
            },
        });
    }

    // Check WebSocket upgrade header
    const upgradeHeader = request.headers.get('Upgrade');
    console.log('[handleVoiceCall] Upgrade header:', upgradeHeader);

    if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
        console.log('[handleVoiceCall] Not a WebSocket upgrade request');
        return new Response(JSON.stringify({
            error: 'websocket_required',
            message: 'WebSocket upgrade required'
        }), {
            status: 426,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': origin,
            }
        });
    }

    try {
        // Tạo unique session ID
        const sessionId = crypto.randomUUID();
        console.log('[handleVoiceCall] Session ID:', sessionId);

        // Get Durable Object stub
        console.log('[handleVoiceCall] Getting DO stub...');
        const id = env.VOICE_CALL_SESSION.idFromName(sessionId);
        const stub = env.VOICE_CALL_SESSION.get(id);

        // Forward request to Durable Object
        console.log('[handleVoiceCall] Forwarding to DO...');
        const response = await stub.fetch(request);
        console.log('[handleVoiceCall] DO response status:', response.status);

        return response;
    } catch (err) {
        console.error('[handleVoiceCall] Error:', err);
        return new Response(JSON.stringify({
            error: 'internal_error',
            message: err.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': origin,
            }
        });
    }
}
