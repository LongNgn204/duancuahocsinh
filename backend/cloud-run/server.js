// backend/cloud-run/server.js
// Chú thích: WebSocket proxy server cho Voice Call
// Proxy WebSocket từ client đến Vertex AI Live API

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { GoogleAuth } = require('google-auth-library');

// Config
const PORT = process.env.PORT || 8080;
const VERTEX_PROJECT_ID = process.env.VERTEX_PROJECT_ID || 'ban-dong-hanh-483002';
const VERTEX_LOCATION = process.env.VERTEX_LOCATION || 'us-central1';
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

// CORS origins
const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://duancuahocsinh.pages.dev',
    /\.bandonghanh\.pages\.dev$/
];

// Chú thích: Kiểm tra origin có được phép không
function isOriginAllowed(origin) {
    if (!origin) return true; // Allow non-browser requests
    return ALLOWED_ORIGINS.some(allowed => {
        if (allowed instanceof RegExp) return allowed.test(origin);
        return allowed === origin;
    });
}

// Express app for health checks
const app = express();

app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'voice-call-proxy' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

// Create HTTP server
const server = http.createServer(app);

// WebSocket server
const wss = new WebSocket.Server({
    server,
    path: '/ws'
});

// Get access token for Vertex AI
async function getAccessToken() {
    const auth = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    return token.token;
}

// Handle WebSocket connections
wss.on('connection', async (clientWs, req) => {
    const origin = req.headers.origin;
    console.log('[Proxy] New connection from:', origin);

    // Check CORS
    if (!isOriginAllowed(origin)) {
        console.log('[Proxy] Origin not allowed:', origin);
        clientWs.close(4003, 'Origin not allowed');
        return;
    }

    let vertexWs = null;
    let isConnected = false;

    try {
        // Get access token
        const accessToken = await getAccessToken();
        console.log('[Proxy] Got access token');

        // Connect to Vertex AI Live API
        // Chú thích: Dùng Generative Language API endpoint cho Gemini Live
        const vertexUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.BidiGenerateContent?key=`;

        // Thử dùng endpoint khác - aiplatform
        const aiPlatformUrl = `wss://${VERTEX_LOCATION}-aiplatform.googleapis.com/ws/google.cloud.aiplatform.v1beta1.LlmBidiService/BidiGenerateContent`;

        console.log('[Proxy] Connecting to Vertex AI:', aiPlatformUrl);

        vertexWs = new WebSocket(aiPlatformUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        vertexWs.on('open', () => {
            console.log('[Proxy] Connected to Vertex AI');
            isConnected = true;

            // Notify client
            clientWs.send(JSON.stringify({ type: 'connected' }));

            // Send setup message to Vertex AI
            // Chú thích: Thử format models/ thay vì projects/
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
                    }
                }
            };

            vertexWs.send(JSON.stringify(setupMessage));
            console.log('[Proxy] Setup message sent');
        });

        // Forward messages from Vertex AI to client
        vertexWs.on('message', (data) => {
            if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(data);
            }
        });

        vertexWs.on('close', (code, reason) => {
            const reasonStr = reason ? reason.toString() : '';
            console.log('[Proxy] Vertex AI closed:', code, reasonStr);
            isConnected = false;
            if (clientWs.readyState === WebSocket.OPEN) {
                // Đảm bảo code là số hợp lệ (1000-4999)
                const safeCode = (typeof code === 'number' && code >= 1000 && code <= 4999) ? code : 1000;
                clientWs.close(safeCode, reasonStr.substring(0, 123));
            }
        });

        vertexWs.on('error', (err) => {
            console.error('[Proxy] Vertex AI error:', err.message);
            clientWs.send(JSON.stringify({
                type: 'error',
                message: 'Vertex AI connection error'
            }));
        });

    } catch (err) {
        console.error('[Proxy] Connection error:', err.message);
        clientWs.send(JSON.stringify({
            type: 'error',
            message: 'Failed to connect to Vertex AI: ' + err.message
        }));
        clientWs.close(1011, 'Connection failed');
        return;
    }

    // Forward messages from client to Vertex AI
    clientWs.on('message', (data) => {
        if (vertexWs && isConnected) {
            vertexWs.send(data);
        }
    });

    // Handle client disconnect
    clientWs.on('close', (code, reason) => {
        console.log('[Proxy] Client disconnected:', code, reason);
        if (vertexWs) {
            vertexWs.close();
        }
    });

    clientWs.on('error', (err) => {
        console.error('[Proxy] Client error:', err.message);
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`[Proxy] Server running on port ${PORT}`);
    console.log(`[Proxy] WebSocket endpoint: ws://localhost:${PORT}/ws`);
});
