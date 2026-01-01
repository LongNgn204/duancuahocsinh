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
        const url = new URL(request.url);

        // Handle WebSocket upgrade
        const upgradeHeader = request.headers.get('Upgrade');
        if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
            return new Response('Expected WebSocket', { status: 426 });
        }

        // Create WebSocket pair for client connection
        const webSocketPair = new WebSocketPair();
        const [client, server] = Object.values(webSocketPair);

        // Accept the connection
        this.state.acceptWebSocket(server);
        this.clientWs = server;

        // Get access token and connect to Vertex AI
        try {
            const accessToken = await getVertexAccessToken(this.env);
            await this.connectToVertexAI(accessToken);
        } catch (err) {
            console.error('[VoiceCallDO] Failed to connect to Vertex AI:', err);
            server.send(JSON.stringify({
                type: 'error',
                message: 'Failed to connect to Vertex AI: ' + err.message
            }));
            server.close(1011, 'Failed to connect to Vertex AI');
        }

        return new Response(null, {
            status: 101,
            webSocket: client,
        });
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
 */
export async function handleVoiceCall(request, env) {
    const origin = request.headers.get('Origin') || '*';

    // Handle CORS preflight for WebSocket
    if (request.method === 'OPTIONS') {
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
    if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
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

    // Tạo unique session ID
    const sessionId = crypto.randomUUID();

    // Get Durable Object stub
    const id = env.VOICE_CALL_SESSION.idFromName(sessionId);
    const stub = env.VOICE_CALL_SESSION.get(id);

    // Forward request to Durable Object
    return stub.fetch(request);
}
