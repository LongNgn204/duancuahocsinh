// backend/workers/vertex-auth.js
// Chú thích: Helper để lấy OAuth2 access token từ Google Cloud Service Account
// Dùng cho Vertex AI Gemini API authentication

// Cache token trong memory (Workers có memory giữa requests trong cùng isolate)
let cachedToken = null;
let tokenExpiry = 0;

/**
 * Tạo JWT từ Service Account credentials
 * @param {Object} env - Environment variables chứa VERTEX_CLIENT_EMAIL và VERTEX_PRIVATE_KEY
 * @returns {Promise<string>} JWT token
 */
async function createJWT(env) {
    const header = {
        alg: 'RS256',
        typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
        iss: env.VERTEX_CLIENT_EMAIL,
        sub: env.VERTEX_CLIENT_EMAIL,
        aud: 'https://oauth2.googleapis.com/token',
        iat: now,
        exp: now + 3600, // 1 hour
        scope: 'https://www.googleapis.com/auth/cloud-platform'
    };

    // Base64url encode header và payload
    const encodedHeader = btoa(JSON.stringify(header))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const encodedPayload = btoa(JSON.stringify(payload))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const signatureInput = `${encodedHeader}.${encodedPayload}`;

    // Import private key và sign
    const privateKey = env.VERTEX_PRIVATE_KEY
        .replace(/\\n/g, '\n')
        .replace('-----BEGIN PRIVATE KEY-----', '')
        .replace('-----END PRIVATE KEY-----', '')
        .replace(/\s/g, '');

    const binaryKey = Uint8Array.from(atob(privateKey), c => c.charCodeAt(0));

    const cryptoKey = await crypto.subtle.importKey(
        'pkcs8',
        binaryKey,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign(
        'RSASSA-PKCS1-v1_5',
        cryptoKey,
        new TextEncoder().encode(signatureInput)
    );

    const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    return `${signatureInput}.${encodedSignature}`;
}

/**
 * Exchange JWT lấy access token từ Google OAuth2
 * @param {string} jwt - JWT token
 * @returns {Promise<{access_token: string, expires_in: number}>}
 */
async function exchangeJWTForAccessToken(jwt) {
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt
        })
    });

    if (!response.ok) {
        const error = await response.text();
        console.error('[Vertex Auth] Token exchange failed:', error);
        throw new Error(`Token exchange failed: ${response.status}`);
    }

    return response.json();
}

/**
 * Lấy Vertex AI access token (có cache)
 * @param {Object} env - Environment variables
 * @returns {Promise<string>} Access token
 */
export async function getVertexAccessToken(env) {
    // Kiểm tra credentials
    if (!env.VERTEX_CLIENT_EMAIL || !env.VERTEX_PRIVATE_KEY) {
        throw new Error('Missing Vertex AI credentials. Set VERTEX_CLIENT_EMAIL and VERTEX_PRIVATE_KEY secrets.');
    }

    // Debug logging
    console.log('[Vertex Auth] Client email:', env.VERTEX_CLIENT_EMAIL);
    console.log('[Vertex Auth] Private key starts with:', env.VERTEX_PRIVATE_KEY?.substring(0, 30));

    // Sử dụng cached token nếu còn hạn (còn ít nhất 5 phút)
    const now = Date.now();
    if (cachedToken && tokenExpiry > now + 5 * 60 * 1000) {
        return cachedToken;
    }

    // Tạo JWT và exchange lấy access token mới
    console.log('[Vertex Auth] Refreshing access token...');

    try {
        const jwt = await createJWT(env);
        console.log('[Vertex Auth] JWT created successfully');

        const tokenResponse = await exchangeJWTForAccessToken(jwt);
        console.log('[Vertex Auth] Token exchange successful');

        // Cache token
        cachedToken = tokenResponse.access_token;
        tokenExpiry = now + (tokenResponse.expires_in - 60) * 1000;

        console.log('[Vertex Auth] Token refreshed, expires in', tokenResponse.expires_in, 'seconds');
        return cachedToken;
    } catch (err) {
        console.error('[Vertex Auth] Error:', err.message);
        throw err;
    }
}

/**
 * Clear cached token (dùng khi cần force refresh)
 */
export function clearTokenCache() {
    cachedToken = null;
    tokenExpiry = 0;
}

export default {
    getVertexAccessToken,
    clearTokenCache
};
