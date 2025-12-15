// backend/workers/router.js
// Chú thích: Main router cho tất cả API endpoints
// Tích hợp: ai-proxy, auth, data-api

import {
    handleRegister,
    handleLogin,
    handleCheckUsername,
    handleGetMe,
    handleDeleteAccount
} from './auth.js';

import {
    getGratitude, addGratitude, deleteGratitude,
    getJournal, addJournal, deleteJournal,
    getFocusSessions, addFocusSession,
    getBreathingSessions, addBreathingSession,
    getSleepLogs, addSleepLog, deleteSleepLog, updateSleepLog,
    getAchievements, unlockAchievement,
    getStats, exportData, importData,
    // Phase 1 additions
    getGameScores, addGameScore,
    getNotificationSettings, saveNotificationSettings,
    logSOSEvent, getSOSLogs,
    getRandomCardsHistory, addRandomCardHistory,
    getUserStats, addUserXP
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

    // Data routes - User Stats / Gamification
    if (pathname === '/api/data/user-stats' && method === 'GET') return 'data:user-stats:get';
    if (pathname === '/api/data/user-stats/add-xp' && method === 'POST') return 'data:user-stats:xp';

    // AI Chat (legacy path)
    if (pathname === '/' && method === 'POST') return 'ai:chat';
    if (pathname === '/api/chat' && method === 'POST') return 'ai:chat';

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
        // Tạo trace context cho observability
        const trace = createTraceContext(request, env);
        
        const origin = getAllowedOrigin(request, env);

        // CORS preflight
        if (request.method === 'OPTIONS') {
            const response = handleOptions(request, env);
            trace.logResponse(204);
            return addTraceHeader(response, trace.traceId);
        }

        const url = new URL(request.url);
        const route = matchRoute(url.pathname, request.method);

        // Rate limiting (skip cho OPTIONS)
        if (request.method !== 'OPTIONS') {
            const rateLimitResponse = await rateLimitMiddleware(request, env, url.pathname);
            if (rateLimitResponse) {
                trace.log('warn', 'rate_limit_exceeded', { path: url.pathname });
                trace.logResponse(429);
                const wrapped = wrapResponse(rateLimitResponse);
                return wrapped;
            }
        }

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

                // User Stats / Gamification endpoints
                case 'data:user-stats:get':
                    response = await getUserStats(request, env);
                    break;
                case 'data:user-stats:xp':
                    response = await addUserXP(request, env);
                    break;

                // AI Chat - delegate to existing ai-proxy logic
                case 'ai:chat':
                    // Import dynamically to avoid circular dependency issues
                    const aiProxy = await import('./ai-proxy.js');
                    return aiProxy.default.fetch(request, env, ctx);

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
