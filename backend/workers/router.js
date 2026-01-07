// backend/workers/router.js
// Chú thích: Main router cho tất cả API endpoints
// Tích hợp: ai-proxy, auth, data-api

import {
    handleRegister,
    handleLogin,
    handleCheckUsername,
    handleGetMe,
    handleDeleteAccount,
    handleUpdateProfile,
    adminResetPassword
} from './auth.js';

import {
    getGratitude, addGratitude, deleteGratitude,
    getJournal, addJournal, deleteJournal,
    getFocusSessions, addFocusSession,
    getBreathingSessions, addBreathingSession,
    getSleepLogs, addSleepLog, deleteSleepLog, updateSleepLog,
    getAchievements, unlockAchievement,
    getCheckins, addCheckin, // Check-in/Điểm danh
    getStats, exportData, importData,
    // Phase 1 additions
    getGameScores, addGameScore,
    getNotificationSettings, saveNotificationSettings,
    logSOSEvent, getSOSLogs,
    getRandomCardsHistory, addRandomCardHistory,
    getUserStats, addUserXP,
    submitChatFeedback, getChatMetrics,
    // Phase 8 additions - Bookmarks
    getBookmarks, addBookmark, deleteBookmark, deleteBookmarkById,
    // Phase 10 additions - Chat Threads Sync
    getChatThreads, saveChatThread, saveChatMessages, deleteChatThread, syncChatThreads
} from './data-api.js';

import {
    getForumPosts, getForumPost, createForumPost,
    addComment, upvotePost, deletePost, deleteComment,
    toggleLockPost, banUser, unbanUser,
    getAdminLogs, getBannedUsers, getForumStats, getAllUsers,
    reportContent
} from './forum-api.js';

import { classifyRiskRules, getRedTierResponse } from './risk.js';
import { sanitizeInput } from './sanitize.js';
import { formatMessagesForLLM, getRecentMessages } from './memory.js';
import { createTraceContext, addTraceHeader } from './observability.js';
import { rateLimitMiddleware } from './rate-limiter.js';

// AI modules - OpenAI ChatGPT for chat
import aiProxy from './ai-proxy.js';
// ai-tts, ai-live, ai-live-config removed - không còn cần thiết
// Voice Call đã được xử lý qua Durable Objects (voice-call-do.js)

// Durable Objects cho Voice Call WebSocket proxy
import { VoiceCallSessionOpenAI } from './voice-call-do.js';

// Re-export Durable Object class để wrangler có thể tìm thấy
export { VoiceCallSessionOpenAI };

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
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
    if (pathname === '/api/auth/profile' && method === 'PUT') return 'auth:profile:update';
    if (pathname === '/api/auth/account' && method === 'DELETE') return 'auth:delete';

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

    // Data routes - Sleep logs
    if (pathname === '/api/data/sleep' && method === 'GET') return 'data:sleep:list';
    if (pathname === '/api/data/sleep' && method === 'POST') return 'data:sleep:add';
    if (pathname.startsWith('/api/data/sleep/') && method === 'DELETE') return 'data:sleep:delete';
    if (pathname.startsWith('/api/data/sleep/') && method === 'PUT') return 'data:sleep:update';

    // Data routes - Achievements
    if (pathname === '/api/data/achievements' && method === 'GET') return 'data:achievements:list';
    if (pathname === '/api/data/achievements' && method === 'POST') return 'data:achievements:add';

    // Data routes - Stats & Export
    if (pathname === '/api/data/stats' && method === 'GET') return 'data:stats';
    if (pathname === '/api/data/export' && method === 'GET') return 'data:export';
    if (pathname === '/api/data/import' && method === 'POST') return 'data:import';

    // Data routes - Game Scores
    if (pathname === '/api/data/game-scores' && method === 'GET') return 'data:games:list';
    if (pathname === '/api/data/game-scores' && method === 'POST') return 'data:games:add';

    // Data routes - Notification Settings
    if (pathname === '/api/data/notification-settings' && method === 'GET') return 'data:notifications:get';
    if (pathname === '/api/data/notification-settings' && method === 'POST') return 'data:notifications:save';

    // Data routes - SOS Logs
    if (pathname === '/api/data/sos-log' && method === 'POST') return 'data:sos:log';

    // Data routes - Random Cards History
    if (pathname === '/api/data/random-cards-history' && method === 'GET') return 'data:cards:list';
    if (pathname === '/api/data/random-cards-history' && method === 'POST') return 'data:cards:add';

    // Data routes - Chat Feedback & Metrics
    if (pathname === '/api/data/chat/feedback' && method === 'POST') return 'data:chat:feedback';
    if (pathname === '/api/data/chat/metrics' && method === 'GET') return 'data:chat:metrics';

    // Data routes - Chat Threads Sync
    if (pathname === '/api/data/chat/threads' && method === 'GET') return 'data:chat:threads:list';
    if (pathname === '/api/data/chat/threads' && method === 'POST') return 'data:chat:threads:save';
    if (pathname === '/api/data/chat/messages' && method === 'POST') return 'data:chat:messages:save';
    if (pathname.match(/^\/api\/data\/chat\/threads\/[a-zA-Z0-9_]+$/) && method === 'DELETE') return 'data:chat:threads:delete';
    if (pathname === '/api/data/chat/sync' && method === 'POST') return 'data:chat:sync';

    // Data routes - User Stats / Gamification
    if (pathname === '/api/data/user-stats' && method === 'GET') return 'data:user-stats:get';
    if (pathname === '/api/data/user-stats/add-xp' && method === 'POST') return 'data:user-stats:xp';

    // Data routes - Check-in / Điểm danh
    if (pathname === '/api/data/checkins' && method === 'GET') return 'data:checkins:list';
    if (pathname === '/api/data/checkins' && method === 'POST') return 'data:checkins:add';

    // Data routes - Bookmarks
    if (pathname === '/api/data/bookmarks' && method === 'GET') return 'data:bookmarks:list';
    if (pathname === '/api/data/bookmarks' && method === 'POST') return 'data:bookmarks:add';
    if (pathname === '/api/data/bookmarks' && method === 'DELETE') return 'data:bookmarks:delete';
    if (pathname.match(/^\/api\/data\/bookmarks\/\d+$/) && method === 'DELETE') return 'data:bookmarks:delete-id';

    // AI Chat (OpenAI ChatGPT via backend)
    if (pathname === '/' && method === 'POST') return 'ai:chat';
    if (pathname === '/api/chat' && method === 'POST') return 'ai:chat';
    if (pathname === '/api/ai/chat' && method === 'POST') return 'ai:chat';

    // AI Live (Voice Call via Durable Objects) - đã xử lý ở đầu router
    // Routes /api/ai/tts và /api/ai/live-config đã deprecated

    // Forum routes
    if (pathname === '/api/forum/posts' && method === 'GET') return 'forum:posts:list';
    if (pathname === '/api/forum/post' && method === 'POST') return 'forum:post:create';
    if (pathname.match(/^\/api\/forum\/post\/\d+$/) && method === 'GET') return 'forum:post:get';
    if (pathname.match(/^\/api\/forum\/post\/\d+$/) && method === 'DELETE') return 'forum:post:delete';
    if (pathname.match(/^\/api\/forum\/post\/\d+\/comment$/) && method === 'POST') return 'forum:comment:add';
    if (pathname.match(/^\/api\/forum\/post\/\d+\/upvote$/) && method === 'POST') return 'forum:post:upvote';
    if (pathname.match(/^\/api\/forum\/post\/\d+\/lock$/) && method === 'POST') return 'forum:post:lock';
    if (pathname.match(/^\/api\/forum\/comment\/\d+$/) && method === 'DELETE') return 'forum:comment:delete';
    if (pathname === '/api/forum/report' && method === 'POST') return 'forum:report';

    // TTS Proxy route
    if (pathname === '/api/tts' && method === 'POST') return 'tts:synthesize';

    // Admin routes
    if (pathname === '/api/admin/login' && method === 'POST') return 'admin:login'; // NEW: Admin login
    if (pathname === '/api/admin/verify' && method === 'GET') return 'admin:verify'; // NEW: Verify token
    if (pathname === '/api/admin/ban-user' && method === 'POST') return 'admin:ban';
    if (pathname.match(/^\/api\/admin\/ban-user\/\d+$/) && method === 'DELETE') return 'admin:unban';
    if (pathname === '/api/admin/logs' && method === 'GET') return 'admin:logs';
    if (pathname === '/api/admin/banned-users' && method === 'GET') return 'admin:banned';
    if (pathname === '/api/admin/forum-stats' && method === 'GET') return 'admin:forum-stats';
    if (pathname === '/api/admin/sos-logs' && method === 'GET') return 'admin:sos-logs';
    if (pathname === '/api/admin/users' && method === 'GET') return 'admin:users';
    if (pathname === '/api/admin/comprehensive-stats' && method === 'GET') return 'admin:comprehensive-stats';
    if (pathname === '/api/admin/activity-data' && method === 'GET') return 'admin:activity-data';
    if (pathname === '/api/admin/chat-analytics' && method === 'GET') return 'admin:chat-analytics';
    if (pathname === '/api/admin/reports' && method === 'GET') return 'admin:reports';
    if (pathname.match(/^\/api\/admin\/users\/\d+\/reset-password$/) && method === 'POST') return 'admin:users:reset-password';
    if (pathname === '/api/admin/sync-logs' && method === 'GET') return 'admin:sync-logs';

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
        const url = new URL(request.url);

        // ========================================================================
        // ⚠️ CRITICAL: XỬ LÝ WEBSOCKET NGAY ĐẦU - TRƯỚC MỌI MIDDLEWARE
        // WebSocket upgrade request phải được forward trực tiếp đến DO
        // KHÔNG qua rate-limit, KHÔNG wrap response, KHÔNG log (làm chậm handshake)
        // ========================================================================
        if (url.pathname === '/api/ai/live') {
            const upgradeHeader = request.headers.get('Upgrade');
            console.log('[Router] WebSocket request to /api/ai/live, Upgrade:', upgradeHeader);

            if (upgradeHeader && upgradeHeader.toLowerCase() === 'websocket') {
                try {
                    // Tạo unique session ID
                    const sessionId = crypto.randomUUID();
                    console.log('[Router] Creating DO session:', sessionId);

                    // Get Durable Object stub và forward TRỰC TIẾP
                    const id = env.VOICE_CALL_SESSION.idFromName(sessionId);
                    const stub = env.VOICE_CALL_SESSION.get(id);

                    // Forward request - response 101 sẽ được DO trả về
                    const response = await stub.fetch(request);
                    console.log('[Router] DO response status:', response.status);

                    // KHÔNG wrap response - trả về nguyên vẹn
                    return response;
                } catch (err) {
                    console.error('[Router] WebSocket DO error:', err);
                    return new Response(JSON.stringify({
                        error: 'websocket_do_error',
                        message: err.message
                    }), {
                        status: 500,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            } else {
                // HTTP request to /api/ai/live (không có Upgrade header)
                return new Response(JSON.stringify({
                    error: 'websocket_required',
                    message: 'WebSocket upgrade required. Send request with Upgrade: websocket header.'
                }), {
                    status: 426,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }
        // ========================================================================
        // END WEBSOCKET HANDLING
        // ========================================================================

        // Tạo trace context cho observability
        const trace = createTraceContext(request, env);

        const origin = getAllowedOrigin(request, env);

        // CORS preflight
        if (request.method === 'OPTIONS') {
            const response = handleOptions(request, env);
            trace.logResponse(204);
            return addTraceHeader(response, trace.traceId);
        }

        const route = matchRoute(url.pathname, request.method);

        // Wrap response with CORS headers và trace ID
        const wrapResponse = (response) => {
            const newHeaders = new Headers(response.headers);
            Object.entries(corsHeaders(origin)).forEach(([k, v]) => newHeaders.set(k, v));
            newHeaders.set('X-Trace-Id', trace.traceId);

            return new Response(response.body, {
                status: response.status,
                headers: newHeaders
            });
        };

        // Rate limiting (skip cho OPTIONS)
        if (request.method !== 'OPTIONS') {
            const rateLimitResponse = await rateLimitMiddleware(request, env, url.pathname);
            if (rateLimitResponse) {
                trace.log('warn', 'rate_limit_exceeded', { path: url.pathname });
                trace.logResponse(429);
                return wrapResponse(rateLimitResponse);
            }
        }

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
                case 'auth:profile:update':
                    response = await handleUpdateProfile(request, env);
                    break;
                case 'auth:delete':
                    response = await handleDeleteAccount(request, env);
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

                // Sleep log endpoints
                case 'data:sleep:list':
                    response = await getSleepLogs(request, env);
                    break;
                case 'data:sleep:add':
                    response = await addSleepLog(request, env);
                    break;
                case 'data:sleep:delete':
                    response = await deleteSleepLog(request, env, extractId(url.pathname));
                    break;
                case 'data:sleep:update':
                    response = await updateSleepLog(request, env, extractId(url.pathname));
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

                // Game Scores endpoints
                case 'data:games:list':
                    response = await getGameScores(request, env);
                    break;
                case 'data:games:add':
                    response = await addGameScore(request, env);
                    break;

                // Notification Settings endpoints
                case 'data:notifications:get':
                    response = await getNotificationSettings(request, env);
                    break;
                case 'data:notifications:save':
                    response = await saveNotificationSettings(request, env);
                    break;

                // SOS Log endpoint
                case 'data:sos:log':
                    response = await logSOSEvent(request, env);
                    break;

                // Random Cards History endpoints
                case 'data:cards:list':
                    response = await getRandomCardsHistory(request, env);
                    break;
                case 'data:cards:add':
                    response = await addRandomCardHistory(request, env);
                    break;

                // Chat Feedback & Metrics endpoints
                case 'data:chat:feedback':
                    response = await submitChatFeedback(request, env);
                    break;
                case 'data:chat:metrics':
                    response = await getChatMetrics(request, env);
                    break;

                // User Stats / Gamification endpoints
                case 'data:user-stats:get':
                    response = await getUserStats(request, env);
                    break;
                case 'data:user-stats:xp':
                    response = await addUserXP(request, env);
                    break;

                // Check-in / Điểm danh endpoints
                case 'data:checkins:list':
                    response = await getCheckins(request, env);
                    break;
                case 'data:checkins:add':
                    response = await addCheckin(request, env);
                    break;

                // Bookmarks endpoints
                case 'data:bookmarks:list':
                    response = await getBookmarks(request, env);
                    break;
                case 'data:bookmarks:add':
                    response = await addBookmark(request, env);
                    break;
                case 'data:bookmarks:delete':
                    response = await deleteBookmark(request, env);
                    break;
                case 'data:bookmarks:delete-id':
                    response = await deleteBookmarkById(request, env, extractId(url.pathname));
                    break;

                // Chat Threads Sync endpoints
                case 'data:chat:threads:list':
                    response = await getChatThreads(request, env);
                    break;
                case 'data:chat:threads:save':
                    response = await saveChatThread(request, env);
                    break;
                case 'data:chat:messages:save':
                    response = await saveChatMessages(request, env);
                    break;
                case 'data:chat:threads:delete':
                    response = await deleteChatThread(request, env, extractId(url.pathname));
                    break;
                case 'data:chat:sync':
                    response = await syncChatThreads(request, env);
                    break;

                // AI Chat - OpenAI ChatGPT (gpt-4o-mini)
                case 'ai:chat':
                    response = await aiProxy.fetch(request, env);
                    break;

                // Note: Voice Call (ai:live) đã được xử lý ở đầu router với Durable Objects
                // Routes ai:tts, ai:live, ai:live-config đã deprecated

                // Forum endpoints
                case 'forum:posts:list':
                    response = await getForumPosts(request, env);
                    break;
                case 'forum:post:create':
                    response = await createForumPost(request, env);
                    break;
                case 'forum:post:get':
                    response = await getForumPost(request, env, extractId(url.pathname));
                    break;
                case 'forum:post:delete':
                    response = await deletePost(request, env, extractId(url.pathname));
                    break;
                case 'forum:comment:add':
                    // Extract postId từ pathname như /api/forum/post/123/comment
                    const commentPath = url.pathname.match(/\/api\/forum\/post\/(\d+)\/comment/);
                    response = await addComment(request, env, commentPath ? commentPath[1] : null);
                    break;
                case 'forum:post:upvote':
                    const upvotePath = url.pathname.match(/\/api\/forum\/post\/(\d+)\/upvote/);
                    response = await upvotePost(request, env, upvotePath ? upvotePath[1] : null);
                    break;
                case 'forum:post:lock':
                    const lockPath = url.pathname.match(/\/api\/forum\/post\/(\d+)\/lock/);
                    response = await toggleLockPost(request, env, lockPath ? lockPath[1] : null);
                    break;
                case 'forum:comment:delete':
                    const commentDelPath = url.pathname.match(/\/api\/forum\/comment\/(\d+)/);
                    response = await deleteComment(request, env, commentDelPath ? commentDelPath[1] : null);
                    break;
                case 'forum:report':
                    response = await reportContent(request, env);
                    break;

                // Admin endpoints
                // NEW: Admin login - standalone authentication
                case 'admin:login':
                    try {
                        const { password } = await request.json();
                        const adminPassword = env.ADMIN_PASSWORD || 'BanDongHanh2024@Admin';

                        if (password !== adminPassword) {
                            response = json({ error: 'invalid_password', message: 'Sai mật khẩu admin' }, 401);
                            break;
                        }

                        // Tạo JWT đơn giản (expires in 24h)
                        const jwtSecret = env.JWT_SECRET || 'default-secret';
                        const expiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
                        const payload = { role: 'admin', exp: expiry };
                        const token = btoa(JSON.stringify(payload)) + '.' + btoa(jwtSecret.slice(0, 8) + expiry);

                        response = json({
                            success: true,
                            token,
                            expiresAt: new Date(expiry).toISOString()
                        });
                    } catch (e) {
                        response = json({ error: 'server_error', message: e.message }, 500);
                    }
                    break;

                // NEW: Verify admin token
                case 'admin:verify':
                    try {
                        const authHeader = request.headers.get('Authorization');
                        if (!authHeader || !authHeader.startsWith('Bearer ')) {
                            response = json({ error: 'no_token', valid: false }, 401);
                            break;
                        }

                        const token = authHeader.split(' ')[1];
                        const [payloadB64, sigB64] = token.split('.');

                        if (!payloadB64 || !sigB64) {
                            response = json({ error: 'invalid_token', valid: false }, 401);
                            break;
                        }

                        const payload = JSON.parse(atob(payloadB64));
                        const jwtSecret = env.JWT_SECRET || 'default-secret';
                        const expectedSig = btoa(jwtSecret.slice(0, 8) + payload.exp);

                        if (sigB64 !== expectedSig || payload.exp < Date.now()) {
                            response = json({ error: 'expired_or_invalid', valid: false }, 401);
                            break;
                        }

                        response = json({ valid: true, role: payload.role });
                    } catch (e) {
                        response = json({ error: 'invalid_token', valid: false }, 401);
                    }
                    break;

                case 'admin:ban':
                case 'admin:unban':
                case 'admin:logs':
                case 'admin:banned':
                case 'admin:forum-stats':
                case 'admin:sos-logs':
                case 'admin:users':
                case 'admin:comprehensive-stats':
                case 'admin:activity-data':
                case 'admin:chat-analytics':
                case 'admin:reports':
                case 'admin:users:reset-password':
                case 'admin:sync-logs':
                    // Verify JWT token for all admin routes
                    const adminAuthHeader = request.headers.get('Authorization');
                    if (!adminAuthHeader || !adminAuthHeader.startsWith('Bearer ')) {
                        response = json({ error: 'not_authenticated', message: 'Cần đăng nhập admin' }, 401);
                        break;
                    }

                    try {
                        const adminToken = adminAuthHeader.split(' ')[1];
                        const [payloadB64Admin, sigB64Admin] = adminToken.split('.');
                        const payloadAdmin = JSON.parse(atob(payloadB64Admin));
                        const jwtSecretAdmin = env.JWT_SECRET || 'default-secret';
                        const expectedSigAdmin = btoa(jwtSecretAdmin.slice(0, 8) + payloadAdmin.exp);

                        if (sigB64Admin !== expectedSigAdmin || payloadAdmin.exp < Date.now()) {
                            response = json({ error: 'token_expired', message: 'Token hết hạn' }, 401);
                            break;
                        }
                    } catch {
                        response = json({ error: 'invalid_token', message: 'Token không hợp lệ' }, 401);
                        break;
                    }

                    // JWT valid, handle each route
                    try {
                        switch (route) {
                            case 'admin:forum-stats':
                                // Return stats, fallback to zeros if tables don't exist
                                try {
                                    const [postsCount, commentsCount, bannedCount, hiddenPosts] = await Promise.all([
                                        env.ban_dong_hanh_db.prepare('SELECT COUNT(*) as count FROM forum_posts').first().catch(() => ({ count: 0 })),
                                        env.ban_dong_hanh_db.prepare('SELECT COUNT(*) as count FROM forum_comments').first().catch(() => ({ count: 0 })),
                                        env.ban_dong_hanh_db.prepare('SELECT COUNT(*) as count FROM banned_users').first().catch(() => ({ count: 0 })),
                                        env.ban_dong_hanh_db.prepare('SELECT COUNT(*) as count FROM forum_posts WHERE is_hidden = 1').first().catch(() => ({ count: 0 }))
                                    ]);
                                    response = json({
                                        total_posts: postsCount?.count || 0,
                                        total_comments: commentsCount?.count || 0,
                                        banned_users: bannedCount?.count || 0,
                                        hidden_posts: hiddenPosts?.count || 0
                                    });
                                } catch {
                                    response = json({ total_posts: 0, total_comments: 0, banned_users: 0, hidden_posts: 0 });
                                }
                                break;

                            case 'admin:logs':
                                try {
                                    const logsLimit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
                                    const logsResult = await env.ban_dong_hanh_db.prepare(
                                        'SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT ?'
                                    ).bind(logsLimit).all().catch(() => ({ results: [] }));
                                    response = json({ items: logsResult?.results || [] });
                                } catch {
                                    response = json({ items: [] });
                                }
                                break;

                            case 'admin:banned':
                                try {
                                    const bannedResult = await env.ban_dong_hanh_db.prepare(
                                        'SELECT * FROM banned_users ORDER BY created_at DESC'
                                    ).all().catch(() => ({ results: [] }));
                                    response = json({ items: bannedResult?.results || [] });
                                } catch {
                                    response = json({ items: [] });
                                }
                                break;

                            case 'admin:sos-logs':
                                try {
                                    const sosLogsResult = await env.ban_dong_hanh_db.prepare(
                                        'SELECT * FROM sos_logs ORDER BY created_at DESC LIMIT 100'
                                    ).all().catch(() => ({ results: [] }));
                                    response = json({ items: sosLogsResult?.results || [] });
                                } catch {
                                    response = json({ items: [] });
                                }
                                break;

                            case 'admin:ban':
                                response = json({ error: 'not_implemented', message: 'Tính năng ban user chưa sẵn sàng (cần database)' }, 501);
                                break;

                            case 'admin:unban':
                                response = json({ error: 'not_implemented', message: 'Tính năng unban user chưa sẵn sàng (cần database)' }, 501);
                                break;

                            case 'admin:users':
                                response = await getAllUsers(request, env);
                                break;

                            // NEW: Comprehensive Stats - Tất cả thống kê từ database
                            case 'admin:comprehensive-stats':
                                try {
                                    const [
                                        usersCount,
                                        gratitudeCount,
                                        journalCount,
                                        focusCount,
                                        breathingCount,
                                        sleepCount,
                                        gameScoresCount,
                                        achievementsCount,
                                        forumPostsCount,
                                        forumCommentsCount,
                                        sosLogsCount,
                                        chatResponsesCount,
                                        chatFeedbackCount,
                                        bookmarksCount,
                                        todayUsers,
                                        weekUsers,
                                        totalXP,
                                        avgGameScore
                                    ] = await Promise.all([
                                        env.ban_dong_hanh_db.prepare('SELECT COUNT(*) as count FROM users').first().catch(() => ({ count: 0 })),
                                        env.ban_dong_hanh_db.prepare('SELECT COUNT(*) as count FROM gratitude').first().catch(() => ({ count: 0 })),
                                        env.ban_dong_hanh_db.prepare('SELECT COUNT(*) as count FROM journal').first().catch(() => ({ count: 0 })),
                                        env.ban_dong_hanh_db.prepare('SELECT COUNT(*) as count, COALESCE(SUM(duration_minutes), 0) as total_minutes FROM focus_sessions').first().catch(() => ({ count: 0, total_minutes: 0 })),
                                        env.ban_dong_hanh_db.prepare('SELECT COUNT(*) as count, COALESCE(SUM(duration_seconds), 0) as total_seconds FROM breathing_sessions').first().catch(() => ({ count: 0, total_seconds: 0 })),
                                        env.ban_dong_hanh_db.prepare('SELECT COUNT(*) as count, COALESCE(AVG(duration_minutes), 0) as avg_duration FROM sleep_logs').first().catch(() => ({ count: 0, avg_duration: 0 })),
                                        env.ban_dong_hanh_db.prepare('SELECT COUNT(*) as count, MAX(score) as max_score FROM game_scores').first().catch(() => ({ count: 0, max_score: 0 })),
                                        env.ban_dong_hanh_db.prepare('SELECT COUNT(*) as count FROM achievements').first().catch(() => ({ count: 0 })),
                                        env.ban_dong_hanh_db.prepare('SELECT COUNT(*) as count FROM forum_posts').first().catch(() => ({ count: 0 })),
                                        env.ban_dong_hanh_db.prepare('SELECT COUNT(*) as count FROM forum_comments').first().catch(() => ({ count: 0 })),
                                        env.ban_dong_hanh_db.prepare('SELECT COUNT(*) as count FROM sos_logs').first().catch(() => ({ count: 0 })),
                                        env.ban_dong_hanh_db.prepare('SELECT COUNT(*) as count FROM chat_responses').first().catch(() => ({ count: 0 })),
                                        env.ban_dong_hanh_db.prepare('SELECT COUNT(*) as count, AVG(response_quality) as avg_quality FROM chat_feedback').first().catch(() => ({ count: 0, avg_quality: 0 })),
                                        env.ban_dong_hanh_db.prepare('SELECT COUNT(*) as count FROM user_bookmarks').first().catch(() => ({ count: 0 })),
                                        env.ban_dong_hanh_db.prepare("SELECT COUNT(DISTINCT user_id) as count FROM gratitude WHERE date(created_at) = date('now')").first().catch(() => ({ count: 0 })),
                                        env.ban_dong_hanh_db.prepare("SELECT COUNT(DISTINCT user_id) as count FROM gratitude WHERE created_at >= datetime('now', '-7 days')").first().catch(() => ({ count: 0 })),
                                        env.ban_dong_hanh_db.prepare('SELECT COALESCE(SUM(total_xp), 0) as total FROM user_stats').first().catch(() => ({ total: 0 })),
                                        env.ban_dong_hanh_db.prepare('SELECT AVG(score) as avg FROM game_scores').first().catch(() => ({ avg: 0 }))
                                    ]);

                                    response = json({
                                        users: {
                                            total: usersCount?.count || 0,
                                            activeToday: todayUsers?.count || 0,
                                            activeWeek: weekUsers?.count || 0
                                        },
                                        content: {
                                            gratitude: gratitudeCount?.count || 0,
                                            journal: journalCount?.count || 0,
                                            bookmarks: bookmarksCount?.count || 0
                                        },
                                        activities: {
                                            focus: {
                                                sessions: focusCount?.count || 0,
                                                totalMinutes: focusCount?.total_minutes || 0
                                            },
                                            breathing: {
                                                sessions: breathingCount?.count || 0,
                                                totalSeconds: breathingCount?.total_seconds || 0
                                            },
                                            sleep: {
                                                logs: sleepCount?.count || 0,
                                                avgDuration: Math.round(sleepCount?.avg_duration || 0)
                                            },
                                            games: {
                                                plays: gameScoresCount?.count || 0,
                                                maxScore: gameScoresCount?.max_score || 0,
                                                avgScore: Math.round(avgGameScore?.avg || 0)
                                            }
                                        },
                                        gamification: {
                                            achievements: achievementsCount?.count || 0,
                                            totalXP: totalXP?.total || 0
                                        },
                                        community: {
                                            forumPosts: forumPostsCount?.count || 0,
                                            forumComments: forumCommentsCount?.count || 0
                                        },
                                        ai: {
                                            chatResponses: chatResponsesCount?.count || 0,
                                            feedbackCount: chatFeedbackCount?.count || 0,
                                            avgQuality: parseFloat((chatFeedbackCount?.avg_quality || 0).toFixed(2))
                                        },
                                        safety: {
                                            sosEvents: sosLogsCount?.count || 0
                                        }
                                    });
                                } catch (statsError) {
                                    console.error('[Admin] comprehensive-stats error:', statsError.message);
                                    response = json({ error: 'server_error', message: statsError.message }, 500);
                                }
                                break;

                            // NEW: Activity Data - Dữ liệu hoạt động theo thời gian
                            case 'admin:activity-data':
                                try {
                                    const days = parseInt(url.searchParams.get('days') || '30');

                                    // Get daily activity counts
                                    const [gratitudeDaily, journalDaily, breathingDaily, focusDaily, gameDaily] = await Promise.all([
                                        env.ban_dong_hanh_db.prepare(`
                                            SELECT date(created_at) as date, COUNT(*) as count 
                                            FROM gratitude 
                                            WHERE created_at >= datetime('now', '-${days} days')
                                            GROUP BY date(created_at)
                                            ORDER BY date DESC
                                        `).all().catch(() => ({ results: [] })),
                                        env.ban_dong_hanh_db.prepare(`
                                            SELECT date(created_at) as date, COUNT(*) as count 
                                            FROM journal 
                                            WHERE created_at >= datetime('now', '-${days} days')
                                            GROUP BY date(created_at)
                                            ORDER BY date DESC
                                        `).all().catch(() => ({ results: [] })),
                                        env.ban_dong_hanh_db.prepare(`
                                            SELECT date(created_at) as date, COUNT(*) as count, SUM(duration_seconds) as total_seconds
                                            FROM breathing_sessions 
                                            WHERE created_at >= datetime('now', '-${days} days')
                                            GROUP BY date(created_at)
                                            ORDER BY date DESC
                                        `).all().catch(() => ({ results: [] })),
                                        env.ban_dong_hanh_db.prepare(`
                                            SELECT date(created_at) as date, COUNT(*) as count, SUM(duration_minutes) as total_minutes
                                            FROM focus_sessions 
                                            WHERE created_at >= datetime('now', '-${days} days')
                                            GROUP BY date(created_at)
                                            ORDER BY date DESC
                                        `).all().catch(() => ({ results: [] })),
                                        env.ban_dong_hanh_db.prepare(`
                                            SELECT date(created_at) as date, COUNT(*) as count, MAX(score) as max_score
                                            FROM game_scores 
                                            WHERE created_at >= datetime('now', '-${days} days')
                                            GROUP BY date(created_at)
                                            ORDER BY date DESC
                                        `).all().catch(() => ({ results: [] }))
                                    ]);

                                    response = json({
                                        period: days,
                                        gratitude: gratitudeDaily?.results || [],
                                        journal: journalDaily?.results || [],
                                        breathing: breathingDaily?.results || [],
                                        focus: focusDaily?.results || [],
                                        games: gameDaily?.results || []
                                    });
                                } catch (activityError) {
                                    console.error('[Admin] activity-data error:', activityError.message);
                                    response = json({ error: 'server_error', message: activityError.message }, 500);
                                }
                                break;

                            // NEW: Chat Analytics
                            case 'admin:chat-analytics':
                                try {
                                    const [
                                        riskDistribution,
                                        responseStats,
                                        feedbackStats,
                                        recentResponses
                                    ] = await Promise.all([
                                        env.ban_dong_hanh_db.prepare(`
                                            SELECT risk_level, COUNT(*) as count 
                                            FROM chat_responses 
                                            WHERE risk_level IS NOT NULL
                                            GROUP BY risk_level
                                        `).all().catch(() => ({ results: [] })),
                                        env.ban_dong_hanh_db.prepare(`
                                            SELECT 
                                                COUNT(*) as total,
                                                AVG(confidence) as avg_confidence,
                                                AVG(latency_ms) as avg_latency,
                                                AVG(tokens_used) as avg_tokens,
                                                SUM(CASE WHEN used_rag = 1 THEN 1 ELSE 0 END) as rag_count
                                            FROM chat_responses
                                        `).first().catch(() => ({})),
                                        env.ban_dong_hanh_db.prepare(`
                                            SELECT 
                                                COUNT(*) as total,
                                                SUM(CASE WHEN helpful = 1 THEN 1 ELSE 0 END) as helpful_count,
                                                AVG(response_quality) as avg_quality
                                            FROM chat_feedback
                                        `).first().catch(() => ({})),
                                        env.ban_dong_hanh_db.prepare(`
                                            SELECT user_message, ai_response, risk_level, confidence, created_at
                                            FROM chat_responses
                                            ORDER BY created_at DESC
                                            LIMIT 20
                                        `).all().catch(() => ({ results: [] }))
                                    ]);

                                    response = json({
                                        riskDistribution: riskDistribution?.results || [],
                                        stats: {
                                            total: responseStats?.total || 0,
                                            avgConfidence: parseFloat((responseStats?.avg_confidence || 0).toFixed(3)),
                                            avgLatencyMs: Math.round(responseStats?.avg_latency || 0),
                                            avgTokens: Math.round(responseStats?.avg_tokens || 0),
                                            ragUsageRate: responseStats?.total > 0
                                                ? parseFloat((responseStats?.rag_count / responseStats?.total).toFixed(3))
                                                : 0
                                        },
                                        feedback: {
                                            total: feedbackStats?.total || 0,
                                            helpfulRate: feedbackStats?.total > 0
                                                ? parseFloat((feedbackStats?.helpful_count / feedbackStats?.total).toFixed(3))
                                                : 0,
                                            avgQuality: parseFloat((feedbackStats?.avg_quality || 0).toFixed(2))
                                        },
                                        recentResponses: recentResponses?.results || []
                                    });
                                } catch (chatError) {
                                    console.error('[Admin] chat-analytics error:', chatError.message);
                                    response = json({ error: 'server_error', message: chatError.message }, 500);
                                }
                                break;

                            // NEW: Forum Reports
                            case 'admin:reports':
                                try {
                                    const reportsResult = await env.ban_dong_hanh_db.prepare(`
                                        SELECT r.*, 
                                            CASE 
                                                WHEN r.target_type = 'post' THEN p.content
                                                WHEN r.target_type = 'comment' THEN c.content
                                            END as target_content
                                        FROM forum_reports r
                                        LEFT JOIN forum_posts p ON r.target_type = 'post' AND r.target_id = p.id
                                        LEFT JOIN forum_comments c ON r.target_type = 'comment' AND r.target_id = c.id
                                        ORDER BY r.created_at DESC
                                        LIMIT 100
                                    `).all().catch(() => ({ results: [] }));

                                    const pendingCount = await env.ban_dong_hanh_db.prepare(
                                        "SELECT COUNT(*) as count FROM forum_reports WHERE status = 'pending'"
                                    ).first().catch(() => ({ count: 0 }));

                                    response = json({
                                        items: reportsResult?.results || [],
                                        pendingCount: pendingCount?.count || 0
                                    });
                                } catch (reportsError) {
                                    console.error('[Admin] reports error:', reportsError.message);
                                    response = json({ items: [], pendingCount: 0 });
                                }
                                break;

                            case 'admin:users:reset-password':
                                {
                                    // extract user id from /api/admin/users/:id/reset-password
                                    const match = url.pathname.match(/\/api\/admin\/users\/(\d+)\/reset-password/);
                                    if (!match) {
                                        response = json({ error: 'invalid_path' }, 400);
                                        break;
                                    }
                                    response = await adminResetPassword(request, env, match[1]);
                                }
                                break;

                            case 'admin:sync-logs':
                                try {
                                    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
                                    const offset = Math.max(parseInt(url.searchParams.get('offset') || '0'), 0);

                                    // Get logs with user info
                                    const logs = await env.ban_dong_hanh_db.prepare(`
                                        SELECT sl.*, u.username, u.display_name 
                                        FROM sync_logs sl
                                        LEFT JOIN users u ON sl.user_id = u.id
                                        ORDER BY sl.created_at DESC 
                                        LIMIT ? OFFSET ?
                                     `).bind(limit, offset).all();

                                    // Get total count
                                    const total = await env.ban_dong_hanh_db.prepare(
                                        'SELECT COUNT(*) as count FROM sync_logs'
                                    ).first();

                                    response = json({
                                        items: logs.results,
                                        total: total.count || 0,
                                        limit,
                                        offset
                                    });
                                } catch (err) {
                                    console.error('Error fetching sync logs:', err);
                                    response = json({ items: [], total: 0, error: err.message });
                                }
                                break;

                            default:
                                response = json({ error: 'unknown_route' }, 404);
                        }
                    } catch (adminError) {
                        console.error('[Admin API] Error:', adminError.message);
                        response = json({ error: 'server_error', message: adminError.message }, 500);
                    }
                    break;

                // TTS Synthesize via Hugging Face
                case 'tts:synthesize':
                    try {
                        const { text, model = 'facebook/mms-tts-vie' } = await request.json();

                        if (!text || text.trim().length === 0) {
                            response = json({ error: 'Text is required' }, 400);
                            break;
                        }

                        // Try both HF endpoints (new router and legacy)
                        const endpoints = [
                            `https://router.huggingface.co/hf-inference/models/${model}`,
                            `https://api-inference.huggingface.co/models/${model}`
                        ];

                        let hfResponse = null;
                        let lastError = null;

                        for (const endpoint of endpoints) {
                            console.log('[TTS] Trying endpoint:', endpoint);
                            try {
                                hfResponse = await fetch(endpoint, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        ...(env.HF_API_TOKEN ? { 'Authorization': `Bearer ${env.HF_API_TOKEN}` } : {})
                                    },
                                    body: JSON.stringify({ inputs: text })
                                });

                                if (hfResponse.ok) {
                                    console.log('[TTS] Success with endpoint:', endpoint);
                                    break;
                                }

                                // Check if model is loading (503) - wait and retry
                                if (hfResponse.status === 503) {
                                    const retryData = await hfResponse.json().catch(() => ({}));
                                    if (retryData.estimated_time) {
                                        console.log('[TTS] Model loading, waiting...');
                                        // Return loading message to frontend
                                        response = json({
                                            error: 'model_loading',
                                            message: 'Model đang khởi động, vui lòng thử lại sau ' + Math.ceil(retryData.estimated_time) + ' giây',
                                            estimated_time: retryData.estimated_time
                                        }, 503);
                                        break;
                                    }
                                }

                                lastError = await hfResponse.text();
                            } catch (fetchErr) {
                                lastError = fetchErr.message;
                            }
                        }

                        // If already responded (model loading case)
                        if (response) break;

                        if (!hfResponse || !hfResponse.ok) {
                            console.error('[TTS] All endpoints failed:', lastError);
                            response = json({ error: 'TTS failed', details: lastError }, 500);
                            break;
                        }

                        // Return audio directly
                        const audioBuffer = await hfResponse.arrayBuffer();
                        response = new Response(audioBuffer, {
                            status: 200,
                            headers: {
                                'Content-Type': 'audio/flac',
                                'Cache-Control': 'public, max-age=3600'
                            }
                        });
                    } catch (ttsError) {
                        console.error('[TTS] Error:', ttsError);
                        response = json({ error: 'TTS processing failed', message: ttsError.message }, 500);
                    }
                    break;

                default:
                    response = json({ error: 'not_found', path: url.pathname }, 404);
            }

            // Log response với metrics
            trace.logResponse(response.status);
            return wrapResponse(response);

        } catch (error) {
            // Log error với trace context
            trace.logError(error, { route: route || 'unknown' });
            const errorResponse = json({ error: 'server_error', message: error.message }, 500, origin);
            trace.logResponse(500);
            return wrapResponse(errorResponse);
        }
    }
};

