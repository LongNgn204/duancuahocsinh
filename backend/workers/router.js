// backend/workers/router.js
// Chú thích: Main router cho tất cả API endpoints
// Tích hợp: ai-proxy, auth, data-api

import {
    handleRegister,
    handleLogin,
    handleCheckUsername,
    handleGetMe
} from './auth.js';

import {
    getGratitude, addGratitude, deleteGratitude,
    getJournal, addJournal, deleteJournal,
    getFocusSessions, addFocusSession,
    getBreathingSessions, addBreathingSession,
    getAchievements, unlockAchievement,
    getStats, exportData, importData
} from './data-api.js';

import { classifyRiskRules, getRedTierResponse } from './risk.js';
import { sanitizeInput } from './sanitize.js';
import { formatMessagesForLLM, getRecentMessages } from './memory.js';

// =============================================================================
// CORS HELPERS
// =============================================================================
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
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Id, X-Requested-With',
        'Access-Control-Expose-Headers': 'X-Trace-Id',
    };
}

function json(data, status = 200, origin = '*') {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
    });
}

function handleOptions(request, env) {
    const origin = getAllowedOrigin(request, env);
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

// =============================================================================
// ROUTE MATCHING
// =============================================================================
function matchRoute(pathname, method) {
    // Auth routes
    if (pathname === '/api/auth/register' && method === 'POST') return 'auth:register';
    if (pathname === '/api/auth/login' && method === 'POST') return 'auth:login';
    if (pathname === '/api/auth/check' && method === 'GET') return 'auth:check';
    if (pathname === '/api/auth/me' && method === 'GET') return 'auth:me';

    // Data routes - Gratitude
    if (pathname === '/api/data/gratitude' && method === 'GET') return 'data:gratitude:list';
    if (pathname === '/api/data/gratitude' && method === 'POST') return 'data:gratitude:add';
    if (pathname.startsWith('/api/data/gratitude/') && method === 'DELETE') return 'data:gratitude:delete';

    // Data routes - Journal
    if (pathname === '/api/data/journal' && method === 'GET') return 'data:journal:list';
    if (pathname === '/api/data/journal' && method === 'POST') return 'data:journal:add';
    if (pathname.startsWith('/api/data/journal/') && method === 'DELETE') return 'data:journal:delete';

    // Data routes - Focus
    if (pathname === '/api/data/focus' && method === 'GET') return 'data:focus:list';
    if (pathname === '/api/data/focus' && method === 'POST') return 'data:focus:add';

    // Data routes - Breathing
    if (pathname === '/api/data/breathing' && method === 'GET') return 'data:breathing:list';
    if (pathname === '/api/data/breathing' && method === 'POST') return 'data:breathing:add';

    // Data routes - Achievements
    if (pathname === '/api/data/achievements' && method === 'GET') return 'data:achievements:list';
    if (pathname === '/api/data/achievements' && method === 'POST') return 'data:achievements:add';

    // Data routes - Stats & Export
    if (pathname === '/api/data/stats' && method === 'GET') return 'data:stats';
    if (pathname === '/api/data/export' && method === 'GET') return 'data:export';
    if (pathname === '/api/data/import' && method === 'POST') return 'data:import';

    // AI Chat (legacy path)
    if (pathname === '/' && method === 'POST') return 'ai:chat';
    if (pathname === '/api/chat' && method === 'POST') return 'ai:chat';

    return null;
}

function extractId(pathname) {
    const parts = pathname.split('/');
    return parts[parts.length - 1];
}

// =============================================================================
// MAIN HANDLER
// =============================================================================
export default {
    async fetch(request, env, ctx) {
        const origin = getAllowedOrigin(request, env);

        // CORS preflight
        if (request.method === 'OPTIONS') {
            return handleOptions(request, env);
        }

        const url = new URL(request.url);
        const route = matchRoute(url.pathname, request.method);

        // Wrap response with CORS headers
        const wrapResponse = (response) => {
            const newHeaders = new Headers(response.headers);
            Object.entries(corsHeaders(origin)).forEach(([k, v]) => newHeaders.set(k, v));
            return new Response(response.body, {
                status: response.status,
                headers: newHeaders
            });
        };

        try {
            let response;

            switch (route) {
                // Auth endpoints
                case 'auth:register':
                    response = await handleRegister(request, env);
                    break;
                case 'auth:login':
                    response = await handleLogin(request, env);
                    break;
                case 'auth:check':
                    response = await handleCheckUsername(request, env);
                    break;
                case 'auth:me':
                    response = await handleGetMe(request, env);
                    break;

                // Gratitude endpoints
                case 'data:gratitude:list':
                    response = await getGratitude(request, env);
                    break;
                case 'data:gratitude:add':
                    response = await addGratitude(request, env);
                    break;
                case 'data:gratitude:delete':
                    response = await deleteGratitude(request, env, extractId(url.pathname));
                    break;

                // Journal endpoints
                case 'data:journal:list':
                    response = await getJournal(request, env);
                    break;
                case 'data:journal:add':
                    response = await addJournal(request, env);
                    break;
                case 'data:journal:delete':
                    response = await deleteJournal(request, env, extractId(url.pathname));
                    break;

                // Focus endpoints
                case 'data:focus:list':
                    response = await getFocusSessions(request, env);
                    break;
                case 'data:focus:add':
                    response = await addFocusSession(request, env);
                    break;

                // Breathing endpoints
                case 'data:breathing:list':
                    response = await getBreathingSessions(request, env);
                    break;
                case 'data:breathing:add':
                    response = await addBreathingSession(request, env);
                    break;

                // Achievements endpoints
                case 'data:achievements:list':
                    response = await getAchievements(request, env);
                    break;
                case 'data:achievements:add':
                    response = await unlockAchievement(request, env);
                    break;

                // Stats & Export
                case 'data:stats':
                    response = await getStats(request, env);
                    break;
                case 'data:export':
                    response = await exportData(request, env);
                    break;
                case 'data:import':
                    response = await importData(request, env);
                    break;

                // AI Chat - delegate to existing ai-proxy logic
                case 'ai:chat':
                    // Import dynamically to avoid circular dependency issues
                    const aiProxy = await import('./ai-proxy.js');
                    return aiProxy.default.fetch(request, env, ctx);

                default:
                    response = json({ error: 'not_found', path: url.pathname }, 404);
            }

            return wrapResponse(response);

        } catch (error) {
            console.error('[Router] Error:', error.message);
            return json({ error: 'server_error', message: error.message }, 500, origin);
        }
    }
};
