// backend/workers/debug-vertex.js
// Chú thích: Debug endpoint để kiểm tra Vertex AI authentication

import { getVertexAccessToken } from './vertex-auth.js';

function json(data, status = 200) {
    return new Response(JSON.stringify(data, null, 2), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
}

export default {
    async fetch(request, env) {
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                status: 204,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }
            });
        }

        const results = {
            timestamp: new Date().toISOString(),
            steps: []
        };

        // Step 1: Check environment variables
        results.steps.push({
            step: 1,
            name: 'Check Environment Variables',
            VERTEX_PROJECT_ID: env.VERTEX_PROJECT_ID || 'NOT SET',
            VERTEX_LOCATION: env.VERTEX_LOCATION || 'NOT SET',
            VERTEX_CLIENT_EMAIL: env.VERTEX_CLIENT_EMAIL ?
                `${env.VERTEX_CLIENT_EMAIL.slice(0, 20)}...` : 'NOT SET',
            VERTEX_PRIVATE_KEY: env.VERTEX_PRIVATE_KEY ?
                `${env.VERTEX_PRIVATE_KEY.slice(0, 50)}...` : 'NOT SET',
            status: (env.VERTEX_PROJECT_ID && env.VERTEX_LOCATION &&
                env.VERTEX_CLIENT_EMAIL && env.VERTEX_PRIVATE_KEY) ? 'OK' : 'MISSING'
        });

        // Step 2: Try to get access token
        let accessToken = null;
        try {
            accessToken = await getVertexAccessToken(env);
            results.steps.push({
                step: 2,
                name: 'Get Access Token',
                status: 'OK',
                tokenPreview: accessToken ? `${accessToken.slice(0, 30)}...` : null
            });
        } catch (err) {
            results.steps.push({
                step: 2,
                name: 'Get Access Token',
                status: 'ERROR',
                error: err.message
            });
            return json(results, 500);
        }

        // Step 3: Test Vertex AI API call
        const VERTEX_MODEL = 'gemini-2.0-flash';
        const VERTEX_URL = `https://${env.VERTEX_LOCATION}-aiplatform.googleapis.com/v1/projects/${env.VERTEX_PROJECT_ID}/locations/${env.VERTEX_LOCATION}/publishers/google/models/${VERTEX_MODEL}:generateContent`;

        const testPayload = {
            contents: [
                { role: 'user', parts: [{ text: 'Say "Hello" in Vietnamese' }] }
            ],
            generationConfig: {
                maxOutputTokens: 50
            }
        };

        try {
            const response = await fetch(VERTEX_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testPayload)
            });

            const responseBody = await response.text();

            results.steps.push({
                step: 3,
                name: 'Vertex AI API Call',
                url: VERTEX_URL,
                status: response.ok ? 'OK' : 'ERROR',
                httpStatus: response.status,
                responsePreview: responseBody.slice(0, 1000)
            });

            if (response.ok) {
                try {
                    const data = JSON.parse(responseBody);
                    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                    results.steps.push({
                        step: 4,
                        name: 'Parse Response',
                        status: 'OK',
                        generatedText: text
                    });
                    results.success = true;
                } catch (e) {
                    results.steps.push({
                        step: 4,
                        name: 'Parse Response',
                        status: 'ERROR',
                        error: e.message
                    });
                }
            } else {
                results.success = false;
            }

        } catch (err) {
            results.steps.push({
                step: 3,
                name: 'Vertex AI API Call',
                status: 'ERROR',
                error: err.message
            });
        }

        return json(results, results.success ? 200 : 500);
    }
};
