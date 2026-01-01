// backend/workers/ai-tts.js
// Chú thích: Endpoint Text-to-Speech qua Vertex AI Gemini
// POST /api/ai/tts - Nhận text, trả về base64 PCM audio

import { getVertexAccessToken } from './vertex-auth.js';

// TTS Model - Gemini 2.5 có hỗ trợ TTS tốt cho tiếng Việt
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';

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

// Strip emoji từ text trước khi TTS
function stripEmoji(text) {
    if (!text) return '';
    return text
        .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
        .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
        .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
        .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
        .replace(/[\u{2600}-\u{26FF}]/gu, '')
        .replace(/[\u{2700}-\u{27BF}]/gu, '')
        .replace(/\s+/g, ' ')
        .trim();
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

        let body;
        try {
            body = await request.json();
        } catch (_) {
            return json({ error: 'invalid_json' }, 400, origin);
        }

        const { text, voice = 'Aoede' } = body || {};
        if (!text || typeof text !== 'string') {
            return json({ error: 'missing_text' }, 400, origin);
        }

        // Clean text
        const cleanText = stripEmoji(text);
        if (!cleanText) {
            return json({ error: 'empty_text_after_cleanup' }, 400, origin);
        }

        // Kiểm tra credentials
        if (!env.VERTEX_PROJECT_ID || !env.VERTEX_LOCATION) {
            return json({ error: 'vertex_not_configured', note: 'Missing VERTEX_PROJECT_ID or VERTEX_LOCATION' }, 500, origin);
        }

        try {
            // Lấy access token từ Service Account
            const accessToken = await getVertexAccessToken(env);

            // Gọi Vertex AI TTS
            const VERTEX_URL = `https://${env.VERTEX_LOCATION}-aiplatform.googleapis.com/v1/projects/${env.VERTEX_PROJECT_ID}/locations/${env.VERTEX_LOCATION}/publishers/google/models/${TTS_MODEL}:generateContent`;

            console.log('[AI TTS] Calling Vertex AI TTS...');
            const response = await fetch(VERTEX_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: 'user',
                            parts: [{ text: cleanText }]
                        }
                    ],
                    generationConfig: {
                        responseModalities: ['AUDIO'],
                        speechConfig: {
                            voiceConfig: {
                                prebuiltVoiceConfig: {
                                    voiceName: voice
                                }
                            }
                        }
                    }
                })
            });

            if (!response.ok) {
                const error = await response.text();
                console.error('[AI TTS] Vertex API error:', error);
                return json({ error: 'tts_error', note: `Vertex API: ${response.status}` }, 502, origin);
            }

            const result = await response.json();

            // Extract audio data
            const audioData = result?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!audioData) {
                console.error('[AI TTS] No audio data in response:', JSON.stringify(result).slice(0, 500));
                return json({ error: 'no_audio_data' }, 502, origin);
            }

            console.log('[AI TTS] Success, audio size:', audioData.length);
            return json({
                audio: audioData,
                mimeType: result?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType || 'audio/pcm',
                voice: voice
            }, 200, origin);

        } catch (err) {
            console.error('[AI TTS] Error:', err);
            return json({ error: 'tts_error', note: String(err?.message || err) }, 500, origin);
        }
    }
};
