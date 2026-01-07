// src/utils/api.js
// Chú thích: API client cho giao tiếp với backend
// Quản lý: auth state, request headers, error handling, offline support, caching

import { getCache, setCache } from '../services/cache.js';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ban-dong-hanh-worker.stu725114073.workers.dev';

// =============================================================================
// AUTH STATE
// =============================================================================
const AUTH_KEY = 'bdh_user';

/**
 * Lấy user hiện tại từ localStorage
 */
export function getCurrentUser() {
    try {
        const data = localStorage.getItem(AUTH_KEY);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

/**
 * Lưu user vào localStorage
 */
export function setCurrentUser(user) {
    if (user) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(AUTH_KEY);
    }
}

/**
 * Xóa auth state
 */
export function logout() {
    localStorage.removeItem(AUTH_KEY);
}

/**
 * Kiểm tra đã đăng nhập chưa
 */
export function isLoggedIn() {
    return !!getCurrentUser();
}

// =============================================================================
// API HELPERS
// =============================================================================

/**
 * Tạo headers cho request
 */
function getHeaders() {
    const headers = {
        'Content-Type': 'application/json',
    };

    const user = getCurrentUser();
    if (user?.id) {
        headers['X-User-Id'] = String(user.id);
    }

    return headers;
}

/**
 * Wrapper cho fetch với error handling, caching, và offline support
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const cacheKey = `${options.method || 'GET'}:${endpoint}`;

    // GET requests: Check cache first
    if ((!options.method || options.method === 'GET') && !options.skipCache) {
        const cached = await getCache(cacheKey);
        if (cached) {
            return cached;
        }
    }

    // Check if offline
    if (!navigator.onLine && options.method && options.method !== 'GET') {
        // Queue for sync when online
        // Note: Would need to import useOffline hook, but avoiding circular deps
        console.warn('[API] Offline, request will be queued');
        throw new Error('offline');
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...getHeaders(),
                ...options.headers,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || data.error || 'Lỗi không xác định');
            error.status = response.status;
            error.data = data;
            throw error;
        }

        // Cache successful GET responses
        if ((!options.method || options.method === 'GET') && !options.skipCache) {
            await setCache(cacheKey, data);
        }

        return data;
    } catch (error) {
        // If offline and GET, try cache as fallback
        if (!navigator.onLine && (!options.method || options.method === 'GET')) {
            const cached = await getCache(cacheKey);
            if (cached) {
                return cached;
            }
        }
        throw error;
    }
}

// =============================================================================
// ENHANCED SYNC QUEUE - Offline Support & Retry Logic
// =============================================================================

const SYNC_QUEUE_KEY = 'bdh_sync_queue';
const MAX_RETRIES = 3;

/**
 * Get sync queue from localStorage
 */
function getSyncQueue() {
    try {
        return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
    } catch {
        return [];
    }
}

/**
 * Save sync queue to localStorage
 */
function saveSyncQueue(queue) {
    try {
        localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
        console.error('[SyncQueue] Failed to save:', e);
    }
}

/**
 * Queue an action for later sync when offline
 * @param {string} type - Action type identifier (e.g., 'gratitude_add', 'game_score')
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {object} body - Request body data
 */
export function queueAction(type, endpoint, method, body) {
    const queue = getSyncQueue();
    queue.push({
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        type,
        endpoint,
        method,
        body,
        retries: 0,
        createdAt: new Date().toISOString()
    });
    saveSyncQueue(queue);
    console.log(`[SyncQueue] Queued ${type} action for offline sync`);
}

/**
 * Get pending sync queue count
 */
export function getPendingSyncCount() {
    return getSyncQueue().length;
}

/**
 * Process all pending sync queue items
 */
export async function processSyncQueue() {
    if (!isLoggedIn() || !navigator.onLine) {
        console.log('[SyncQueue] Cannot process: offline or not logged in');
        return { processed: 0, remaining: getSyncQueue().length };
    }

    const queue = getSyncQueue();
    if (queue.length === 0) {
        return { processed: 0, remaining: 0 };
    }

    console.log(`[SyncQueue] Processing ${queue.length} pending actions...`);
    const remaining = [];
    let processed = 0;

    for (const item of queue) {
        try {
            await apiRequest(item.endpoint, {
                method: item.method,
                body: JSON.stringify(item.body),
                skipCache: true
            });
            processed++;
            console.log(`[SyncQueue] Synced: ${item.type}`);
        } catch (err) {
            item.retries++;
            if (item.retries < MAX_RETRIES) {
                remaining.push(item);
                console.warn(`[SyncQueue] Retry ${item.retries}/${MAX_RETRIES}: ${item.type}`, err.message);
            } else {
                console.error(`[SyncQueue] Failed after ${MAX_RETRIES} retries: ${item.type}`, err.message);
            }
        }
    }

    saveSyncQueue(remaining);

    if (remaining.length === 0 && processed > 0) {
        console.log(`[SyncQueue] All ${processed} actions synced successfully!`);
    } else if (remaining.length > 0) {
        console.log(`[SyncQueue] Processed ${processed}, ${remaining.length} remaining for retry`);
    }

    return { processed, remaining: remaining.length };
}

/**
 * Clear entire sync queue (use with caution)
 */
export function clearSyncQueue() {
    localStorage.removeItem(SYNC_QUEUE_KEY);
    console.log('[SyncQueue] Queue cleared');
}

// Auto-process sync queue when coming back online or tab becomes visible
if (typeof window !== 'undefined') {
    // Process queue when network comes back online
    window.addEventListener('online', () => {
        console.log('[SyncQueue] Back online, processing queue...');
        setTimeout(() => processSyncQueue(), 1000); // Small delay to ensure connection is stable
    });

    // Process queue when user returns to the tab
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && navigator.onLine && isLoggedIn()) {
            console.log('[SyncQueue] Tab visible, checking queue...');
            processSyncQueue();
        }
    });

    // Process queue on page load if online and logged in
    if (navigator.onLine) {
        // Delay to allow login state to be established
        setTimeout(() => {
            if (isLoggedIn()) {
                processSyncQueue();
            }
        }, 2000);
    }
}


// =============================================================================
// AUTH API
// =============================================================================

/**
 * Đăng ký tài khoản mới
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<{success: boolean, user: Object}>}
 */
export async function register(username, password, displayName = '') {
    const data = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password, display_name: displayName }),
    });

    if (data.success && data.user) {
        setCurrentUser(data.user);
    }

    return data;
}

/**
 * Đăng nhập
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<{success: boolean, user: Object}>}
 */
export async function login(username, password) {
    const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });

    if (data.success && data.user) {
        setCurrentUser(data.user);

        // Tự động sync dữ liệu local sau khi đăng nhập
        // Chạy async để không block login flow
        setTimeout(async () => {
            try {
                // Import trực tiếp để tránh circular import
                const syncResult = await syncLocalDataToServer();
                if (syncResult.synced) {
                    console.log('[Login] Auto-synced local data:', syncResult.imported);
                } else {
                    console.log('[Login] No local data to sync:', syncResult.reason);
                }
            } catch (e) {
                console.warn('[Login] Auto-sync failed:', e.message);
            }
        }, 500);
    }

    return data;
}

/**
 * Kiểm tra username có sẵn không
 * @param {string} username 
 * @returns {Promise<{available: boolean}>}
 */
export async function checkUsername(username) {
    return apiRequest(`/api/auth/check?username=${encodeURIComponent(username)}`);
}

/**
 * Lấy thông tin user hiện tại từ server
 */
export async function getMe() {
    return apiRequest('/api/auth/me');
}

/**
 * Cập nhật thông tin profile (display_name)
 * @param {string} displayName - Tên hiển thị mới
 */
export async function updateProfile(displayName) {
    return apiRequest('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ display_name: displayName }),
    });
}

// =============================================================================
// DATA API - GRATITUDE
// =============================================================================

export async function getGratitudeList(limit = 50, offset = 0) {
    return apiRequest(`/api/data/gratitude?limit=${limit}&offset=${offset}`);
}

export async function addGratitude(content, tag = null) {
    return apiRequest('/api/data/gratitude', {
        method: 'POST',
        body: JSON.stringify({ content, tag }),
    });
}

export async function deleteGratitude(id) {
    return apiRequest(`/api/data/gratitude/${id}`, { method: 'DELETE' });
}

// =============================================================================
// DATA API - JOURNAL
// =============================================================================

export async function getJournalList(limit = 30, offset = 0) {
    return apiRequest(`/api/data/journal?limit=${limit}&offset=${offset}`);
}

export async function addJournalEntry(content, mood = null, tags = []) {
    return apiRequest('/api/data/journal', {
        method: 'POST',
        body: JSON.stringify({ content, mood, tags }),
    });
}

export async function deleteJournalEntry(id) {
    return apiRequest(`/api/data/journal/${id}`, { method: 'DELETE' });
}

// =============================================================================
// DATA API - FOCUS SESSIONS
// =============================================================================

export async function getFocusSessions(limit = 50) {
    return apiRequest(`/api/data/focus?limit=${limit}`);
}

export async function saveFocusSession(duration_minutes, session_type = 'focus', completed = true) {
    return apiRequest('/api/data/focus', {
        method: 'POST',
        body: JSON.stringify({ duration_minutes, session_type, completed }),
    });
}

// =============================================================================
// DATA API - BREATHING SESSIONS
// =============================================================================

export async function getBreathingSessions(limit = 50) {
    return apiRequest(`/api/data/breathing?limit=${limit}`);
}

export async function saveBreathingSession(exercise_type, duration_seconds) {
    return apiRequest('/api/data/breathing', {
        method: 'POST',
        body: JSON.stringify({ exercise_type, duration_seconds }),
    });
}

// =============================================================================
// DATA API - ACHIEVEMENTS
// =============================================================================

export async function getAchievements() {
    return apiRequest('/api/data/achievements');
}

export async function unlockAchievement(achievement_id) {
    return apiRequest('/api/data/achievements', {
        method: 'POST',
        body: JSON.stringify({ achievement_id }),
    });
}

// =============================================================================
// DATA API - SLEEP LOGS
// =============================================================================

export async function getSleepLogs(limit = 50) {
    return apiRequest(`/api/data/sleep?limit=${limit}`);
}

export async function saveSleepLog(sleep_time, wake_time, quality = null, notes = '', duration_minutes = null) {
    return apiRequest('/api/data/sleep', {
        method: 'POST',
        body: JSON.stringify({ sleep_time, wake_time, quality, notes, duration_minutes }),
    });
}

export async function updateSleepLog(id, sleep_time, wake_time, quality = null, notes = '', duration_minutes = null) {
    return apiRequest(`/api/data/sleep/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ sleep_time, wake_time, quality, notes, duration_minutes }),
    });
}

export async function deleteSleepLog(id) {
    return apiRequest(`/api/data/sleep/${id}`, { method: 'DELETE' });
}

// =============================================================================
// DATA API - STATS & EXPORT
// =============================================================================

export async function getStats() {
    return apiRequest('/api/data/stats');
}

export async function exportAllData() {
    return apiRequest('/api/data/export');
}

export async function importData(data) {
    return apiRequest('/api/data/import', {
        method: 'POST',
        body: JSON.stringify({ data }),
    });
}

/**
 * Xóa tài khoản và tất cả dữ liệu
 * @returns {Promise<Object>}
 */
export async function deleteAccount() {
    return apiRequest('/api/auth/account', {
        method: 'DELETE',
    });
}

// =============================================================================
// FORUM API
// =============================================================================

export async function getForumPosts(page = 1, limit = 20, tag = null, sort = 'newest') {
    let url = `/api/forum/posts?page=${page}&limit=${limit}&sort=${sort}`;
    if (tag) url += `&tag=${encodeURIComponent(tag)}`;
    return apiRequest(url);
}

export async function getForumPost(id) {
    return apiRequest(`/api/forum/post/${id}`);
}

export async function createForumPost(content, title = null, tags = [], anonymous = false) {
    return apiRequest('/api/forum/post', {
        method: 'POST',
        body: JSON.stringify({ content, title, tags, anonymous }),
    });
}

export async function addForumComment(postId, content, anonymous = false) {
    return apiRequest(`/api/forum/post/${postId}/comment`, {
        method: 'POST',
        body: JSON.stringify({ content, anonymous }),
    });
}

export async function upvoteForumPost(postId) {
    return apiRequest(`/api/forum/post/${postId}/upvote`, { method: 'POST' });
}

/**
 * Báo cáo bài viết hoặc bình luận
 * @param {string} targetType - 'post' hoặc 'comment'
 * @param {number} targetId - ID của post hoặc comment
 * @param {string} reason - Lý do: 'spam', 'harassment', 'inappropriate', 'misinformation', 'other'
 * @param {string} details - Chi tiết bổ sung (optional)
 */
export async function reportForumContent(targetType, targetId, reason, details = null) {
    return apiRequest('/api/forum/report', {
        method: 'POST',
        body: JSON.stringify({ target_type: targetType, target_id: targetId, reason, details }),
    });
}

// =============================================================================
// ADMIN API - JWT Authentication
// =============================================================================

const ADMIN_TOKEN_KEY = 'admin_jwt_token';

/**
 * Admin login - standalone authentication (không cần user account)
 * @param {string} password - Admin password
 */
export async function adminLogin(password) {
    const result = await apiRequest('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
    });

    if (result.success && result.token) {
        localStorage.setItem(ADMIN_TOKEN_KEY, result.token);
        localStorage.setItem('admin_expires_at', result.expiresAt);
    }

    return result;
}

/**
 * Check if admin is logged in (có token hợp lệ)
 */
export function isAdminLoggedIn() {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    const expiresAt = localStorage.getItem('admin_expires_at');

    if (!token || !expiresAt) return false;

    // Check expiry
    if (new Date(expiresAt) < new Date()) {
        adminLogout();
        return false;
    }

    return true;
}

/**
 * Get admin JWT token for API calls
 */
export function getAdminToken() {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
}

/**
 * Admin logout
 */
export function adminLogout() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem('admin_expires_at');
}

/**
 * Verify admin token with server
 */
export async function verifyAdminToken() {
    const token = getAdminToken();
    if (!token) return { valid: false };

    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/verify`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        return await response.json();
    } catch {
        return { valid: false };
    }
}

// Admin API calls with JWT auth
async function adminApiRequest(endpoint, options = {}) {
    const token = getAdminToken();
    if (!token) throw new Error('Admin not logged in');

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(options.headers || {}),
    };

    return apiRequest(endpoint, { ...options, headers });
}

export async function getAdminLogs(limit = 50) {
    return adminApiRequest(`/api/admin/logs?limit=${limit}`);
}

export async function getBannedUsers() {
    return adminApiRequest('/api/admin/banned-users');
}

export async function getForumStats() {
    return adminApiRequest('/api/admin/forum-stats');
}

export async function getSOSLogs(limit = 100, riskLevel = null) {
    let url = `/api/admin/sos-logs?limit=${limit}`;
    if (riskLevel) url += `&risk_level=${encodeURIComponent(riskLevel)}`;
    return adminApiRequest(url);
}

/**
 * Lấy danh sách tất cả users với thống kê
 * @param {number} limit - Số lượng tối đa
 * @param {number} offset - Offset
 * @param {string} sort - Sắp xếp: 'created_at' | 'last_login' | 'journal_count' | 'sos_count'
 */
export async function getAllUsers(limit = 50, offset = 0, sort = 'created_at') {
    return adminApiRequest(`/api/admin/users?limit=${limit}&offset=${offset}&sort=${sort}`);
}

export async function banUser(userId, reason = null, durationDays = null) {
    return adminApiRequest('/api/admin/ban-user', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, reason, duration_days: durationDays }),
    });
}

export async function unbanUser(userId) {
    return adminApiRequest(`/api/admin/ban-user/${userId}`, { method: 'DELETE' });
}

export async function deleteForumPost(postId, reason = null, permanent = false) {
    return adminApiRequest(`/api/forum/post/${postId}`, {
        method: 'DELETE',
        body: JSON.stringify({ reason, permanent }),
    });
}

export async function toggleLockPost(postId) {
    return adminApiRequest(`/api/forum/post/${postId}/lock`, { method: 'POST' });
}

export async function adminResetUserPassword(userId, newPassword) {
    return adminApiRequest(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ newPassword }),
    });
}

export async function getSyncLogs(limit = 50, offset = 0) {
    return adminApiRequest(`/api/admin/sync-logs?limit=${limit}&offset=${offset}`);
}

// =============================================================================
// SYNC HELPER - Enhanced Auto-Sync
// =============================================================================

// Các keys localStorage cần sync
const SYNC_KEYS = [
    { key: 'gratitude_entries_v1', field: 'gratitude', transform: g => ({ content: g.text || g.content, created_at: g.date || g.created_at }) },
    { key: 'gratitude', field: 'gratitude', transform: g => ({ content: g.text || g.content, created_at: g.date || g.created_at }) },
    { key: 'mood_journal_v1', field: 'journal', transform: j => ({ content: j.content, mood: j.mood, tags: j.tags, created_at: j.date || j.created_at }) },
    { key: 'journal_entries', field: 'journal', transform: j => ({ content: j.content, mood: j.mood, tags: j.tags, created_at: j.date || j.created_at }) },
    { key: 'focus_sessions', field: 'focus_sessions', transform: f => ({ duration_minutes: f.duration || f.duration_minutes, session_type: f.type || 'focus', created_at: f.date || f.created_at }) },
    { key: 'focus_stats_v1', field: 'focus_sessions', transform: f => ({ duration_minutes: f.duration || f.duration_minutes, session_type: f.type || 'focus', created_at: f.date || f.created_at }) },
    { key: 'breathing_sessions_v1', field: 'breathing_sessions', transform: b => ({ exercise_type: b.type || b.exercise_type, duration_seconds: b.duration || b.duration_seconds, created_at: b.date || b.created_at }) },
    { key: 'breathing_sessions', field: 'breathing_sessions', transform: b => ({ exercise_type: b.type || b.exercise_type, duration_seconds: b.duration || b.duration_seconds, created_at: b.date || b.created_at }) },
    { key: 'sleep_stats_v1', field: 'sleep_logs', transform: s => ({ sleep_time: s.sleepTime || s.sleep_time, wake_time: s.wakeTime || s.wake_time, quality: s.quality || s.rating, notes: s.notes, duration_minutes: s.duration, created_at: s.date || s.created_at }) },
    { key: 'sleep_logs_v1', field: 'sleep_logs', transform: s => ({ sleep_time: s.sleepTime || s.sleep_time, wake_time: s.wakeTime || s.wake_time, quality: s.quality || s.rating, notes: s.notes, duration_minutes: s.duration, created_at: s.date || s.created_at }) },
];

/**
 * Sync local data to server (for migration from localStorage)
 * Tự động gom dữ liệu từ tất cả các keys localStorage và đẩy lên server
 * Sau khi sync thành công, xóa dữ liệu local để tránh trùng lặp
 */
export async function syncLocalDataToServer() {
    if (!isLoggedIn()) return { synced: false, reason: 'not_logged_in' };

    const dataToImport = {
        gratitude: [],
        journal: [],
        focus_sessions: [],
        breathing_sessions: [],
        sleep_logs: [],
    };

    const keysToDelete = [];

    // Gom dữ liệu từ tất cả các keys
    for (const { key, field, transform } of SYNC_KEYS) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) continue;

            let items = JSON.parse(raw);

            // Handle cả array và object (cho sleep_stats_v1)
            if (!Array.isArray(items)) {
                // Nếu là object có field logs (như sleep_stats_v1)
                if (items.logs && Array.isArray(items.logs)) {
                    items = items.logs;
                } else {
                    continue;
                }
            }

            if (items.length > 0) {
                const transformed = items.map(transform).filter(x => x && (x.content || x.duration_minutes || x.duration_seconds || x.sleep_time));
                dataToImport[field].push(...transformed);
                keysToDelete.push(key);
            }
        } catch (e) {
            console.warn(`[Sync] Error parsing ${key}:`, e);
        }
    }

    // Kiểm tra có dữ liệu để sync không
    const totalItems = Object.values(dataToImport).reduce((sum, arr) => sum + arr.length, 0);
    if (totalItems === 0) {
        return { synced: false, reason: 'no_local_data' };
    }

    try {
        const user = getCurrentUser();
        console.log('[Sync] Syncing local data to server for user:', user?.id, {
            gratitude: dataToImport.gratitude.length,
            journal: dataToImport.journal.length,
            focus: dataToImport.focus_sessions.length,
            breathing: dataToImport.breathing_sessions.length,
            sleep: dataToImport.sleep_logs.length,
        });

        const result = await importData(dataToImport);
        console.log('[Sync] Sync result:', result);

        // Xóa dữ liệu local sau khi sync thành công
        for (const key of keysToDelete) {
            localStorage.removeItem(key);
            console.log(`[Sync] Cleared local key: ${key}`);
        }

        return { synced: true, imported: result.imported, cleared: keysToDelete };
    } catch (error) {
        console.error('[Sync] Error:', error);
        return { synced: false, reason: error.message };
    }
}

/**
 * Sync liên tục khi có thay đổi
 * Gọi hàm này sau mỗi action tạo dữ liệu mới
 */
let syncTimer = null;
export function scheduleSync(delayMs = 5000) {
    if (!isLoggedIn()) return;

    // Debounce để tránh sync quá nhiều
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(async () => {
        const result = await syncLocalDataToServer();
        if (result.synced) {
            console.log('[AutoSync] Synced successfully:', result.imported);
        }
    }, delayMs);
}

/**
 * Sync ngay lập tức khi login
 */
export async function syncOnLogin() {
    if (!isLoggedIn()) return;

    console.log('[Sync] Starting sync on login...');
    const result = await syncLocalDataToServer();

    if (result.synced) {
        console.log('[Sync] Login sync complete:', result.imported);
    } else {
        console.log('[Sync] No data to sync:', result.reason);
    }

    return result;
}

// =============================================================================
// GAME SCORES API
// =============================================================================

/**
 * Lấy điểm game của user
 * @param {string} gameType - Loại game (optional)
 * @param {number} limit - Số lượng tối đa
 */
export async function getGameScores(gameType = null, limit = 10) {
    let url = `/api/data/game-scores?limit=${limit}`;
    if (gameType) url += `&game_type=${encodeURIComponent(gameType)}`;
    return apiRequest(url);
}

/**
 * Lấy bảng xếp hạng game (public)
 * @param {string} gameType - Loại game (optional)
 * @param {number} limit - Số lượng top players
 */
export async function getGameLeaderboard(gameType = null, limit = 10) {
    let url = `/api/data/game-scores?leaderboard=true&limit=${limit}`;
    if (gameType) url += `&game_type=${encodeURIComponent(gameType)}`;
    return apiRequest(url);
}

/**
 * Lưu điểm game mới
 * @param {string} gameType - Loại game
 * @param {number} score - Điểm số
 * @param {number} levelReached - Level đạt được (optional)
 * @param {number} playDuration - Thời gian chơi (giây, optional)
 */
export async function saveGameScore(gameType, score, levelReached = 1, playDuration = null) {
    return apiRequest('/api/data/game-scores', {
        method: 'POST',
        body: JSON.stringify({
            game_type: gameType,
            score,
            level_reached: levelReached,
            play_duration_seconds: playDuration
        }),
    });
}

// =============================================================================
// NOTIFICATION SETTINGS API
// =============================================================================

/**
 * Lấy cài đặt thông báo của user
 */
export async function getNotificationSettings() {
    return apiRequest('/api/data/notification-settings');
}

/**
 * Lưu cài đặt thông báo
 * @param {Object} settings - { daily_reminder, pomodoro_alerts, sleep_reminder, reminder_time, push_subscription }
 */
export async function saveNotificationSettings(settings) {
    return apiRequest('/api/data/notification-settings', {
        method: 'POST',
        body: JSON.stringify(settings),
    });
}

// =============================================================================
// SOS LOGS API
// =============================================================================

/**
 * Ghi log sự kiện SOS (không cần đăng nhập)
 * @param {string} eventType - Loại sự kiện: 'overlay_opened', 'hotline_clicked', 'map_viewed', 'message_flagged', 'false_positive'
 * @param {string} riskLevel - Mức độ rủi ro: 'red', 'yellow', 'critical' (optional)
 * @param {string} triggerText - Từ khóa đã trigger (optional, sẽ được cắt ngắn)
 * @param {Object} location - { lat, lng } nếu có quyền định vị (optional)
 * @param {Object} metadata - Thông tin bổ sung (optional)
 */
export async function logSOSEvent(eventType, riskLevel = null, triggerText = null, location = null, metadata = null) {
    try {
        return await apiRequest('/api/data/sos-log', {
            method: 'POST',
            body: JSON.stringify({
                event_type: eventType,
                risk_level: riskLevel,
                trigger_text: triggerText,
                location,
                metadata
            }),
        });
    } catch (error) {
        // Không throw error để không ảnh hưởng UX khi log SOS
        console.warn('[SOS] Failed to log event:', error.message);
        return { success: false };
    }
}

// =============================================================================
// RANDOM CARDS HISTORY API
// =============================================================================

/**
 * Lấy lịch sử thẻ wellness đã xem
 * @param {number} limit - Số lượng tối đa
 */
export async function getRandomCardsHistory(limit = 50) {
    return apiRequest(`/api/data/random-cards-history?limit=${limit}`);
}

/**
 * Ghi lại thẻ đã xem
 * @param {string} cardId - ID thẻ đã xem
 * @param {boolean} actionTaken - User có thực hiện hành động không
 */
export async function saveRandomCardView(cardId, actionTaken = false) {
    return apiRequest('/api/data/random-cards-history', {
        method: 'POST',
        body: JSON.stringify({
            card_id: cardId,
            action_taken: actionTaken
        }),
    });
}

// =============================================================================
// USER STATS / GAMIFICATION API
// =============================================================================

/**
 * Lấy thống kê gamification của user (XP, level, streak, etc.)
 */
export async function getUserStats() {
    return apiRequest('/api/data/user-stats');
}

/**
 * Thêm XP cho user (khi hoàn thành hoạt động)
 * @param {number} xp - Số XP cộng thêm (max 100/lần)
 * @param {string} source - Nguồn XP: 'breathing', 'gratitude', 'journal', 'focus', 'game', etc.
 */
export async function addUserXP(xp, source) {
    return apiRequest('/api/data/user-stats/add-xp', {
        method: 'POST',
        body: JSON.stringify({ xp, source }),
    });
}

// =============================================================================
// DATA API - CHECK-INS / ĐIỂM DANH
// =============================================================================

/**
 * Lấy lịch sử điểm danh
 * @param {number} days - Số ngày gần nhất (max 365)
 * @returns {Promise<{items: Array, dates: string[], count: number}>}
 */
export async function getCheckins(days = 90) {
    return apiRequest(`/api/data/checkins?days=${days}`);
}

/**
 * Điểm danh hôm nay
 * @param {string} activityType - Loại hoạt động: 'manual', 'login', 'chat', 'breathing'...
 * @returns {Promise<{success: boolean, newCheckin?: boolean, alreadyCheckedIn?: boolean}>}
 */
export async function addCheckin(activityType = 'manual') {
    return apiRequest('/api/data/checkins', {
        method: 'POST',
        body: JSON.stringify({ activity_type: activityType }),
    });
}

// =============================================================================
// XP REWARDS CONFIG (frontend-side)
// =============================================================================
export const XP_REWARDS = {
    breathing_complete: 10,    // Hoàn thành 1 bài thở
    gratitude_add: 5,         // Thêm 1 điều biết ơn
    gratitude_streak_7: 50,   // 7 ngày liên tiếp
    gratitude_streak_30: 200, // 30 ngày liên tiếp
    journal_add: 15,          // Viết 1 bài nhật ký
    focus_complete: 20,       // Hoàn thành 1 Pomodoro
    game_play: 5,             // Chơi 1 game
    game_new_record: 25,      // Lập kỷ lục mới
    random_card_action: 10,   // Thực hiện hành động từ thẻ
};

/**
 * Helper để cộng XP với source tự động
 * @param {string} action - Tên action từ XP_REWARDS
 */
export async function rewardXP(action) {
    const xp = XP_REWARDS[action];
    if (!xp || !isLoggedIn()) return null;

    try {
        return await addUserXP(xp, action);
    } catch (error) {
        console.warn('[XP] Failed to reward:', error.message);
        return null;
    }
}

// =============================================================================
// CHAT FEEDBACK API
// =============================================================================

/**
 * Submit feedback về AI response
 * @param {string} messageId - Trace ID từ response
 * @param {0|1} helpful - 1 = helpful, 0 = not helpful
 * @param {string} reason - Optional text feedback
 * @param {number} responseQuality - Optional 1-5 rating
 */
export async function submitChatFeedback(messageId, helpful, reason = null, responseQuality = null) {
    return apiRequest('/api/data/chat/feedback', {
        method: 'POST',
        body: JSON.stringify({
            message_id: messageId,
            helpful,
            reason,
            response_quality: responseQuality,
        }),
    });
}

/**
 * Get chat metrics (admin only hoặc user's own)
 * @param {number} days - Number of days to look back
 * @param {number} userId - Optional user ID (admin only)
 */
export async function getChatMetrics(days = 7, userId = null) {
    const params = new URLSearchParams({ days: String(days) });
    if (userId) params.set('user_id', String(userId));
    return apiRequest(`/api/data/chat/metrics?${params}`, {
        method: 'GET',
    });
}

// =============================================================================
// BOOKMARKS API
// =============================================================================

/**
 * Lấy danh sách bookmarks
 * @param {string} type - Optional filter: 'story' | 'resource'
 */
export async function getBookmarks(type = null) {
    const params = type ? `?type=${type}` : '';
    return apiRequest(`/api/data/bookmarks${params}`, { method: 'GET' });
}

/**
 * Thêm bookmark mới
 * @param {string} bookmarkType - 'story' | 'resource'
 * @param {string} itemId - ID của item được bookmark
 * @param {object} metadata - Optional metadata (title, etc.)
 */
export async function addBookmark(bookmarkType, itemId, metadata = null) {
    return apiRequest('/api/data/bookmarks', {
        method: 'POST',
        body: JSON.stringify({ bookmark_type: bookmarkType, item_id: itemId, metadata }),
    });
}

/**
 * Xóa bookmark theo type và item_id
 * @param {string} bookmarkType - 'story' | 'resource'
 * @param {string} itemId - ID của item
 */
export async function removeBookmark(bookmarkType, itemId) {
    return apiRequest(`/api/data/bookmarks?type=${bookmarkType}&item_id=${itemId}`, {
        method: 'DELETE',
    });
}

/**
 * Xóa bookmark theo ID
 * @param {number} id - Bookmark ID
 */
export async function removeBookmarkById(id) {
    return apiRequest(`/api/data/bookmarks/${id}`, { method: 'DELETE' });
}

/**
 * Toggle bookmark - thêm nếu chưa có, xóa nếu đã có
 * @param {string} bookmarkType - 'story' | 'resource'
 * @param {string} itemId - ID của item
 * @param {object} metadata - Optional metadata
 * @returns {Promise<{isBookmarked: boolean, id?: number}>}
 */
export async function toggleBookmark(bookmarkType, itemId, metadata = null) {
    try {
        // Thử thêm bookmark trước
        const result = await addBookmark(bookmarkType, itemId, metadata);

        if (result.alreadyExists) {
            // Nếu đã tồn tại, xóa nó
            await removeBookmark(bookmarkType, itemId);
            return { isBookmarked: false };
        }

        return { isBookmarked: true, id: result.item?.id };
    } catch (error) {
        console.error('[Bookmarks] Toggle failed:', error.message);
        throw error;
    }
}

// =============================================================================
// CHAT THREADS SYNC API
// Chú thích: Sync lịch sử chat AI để user xem lại trên các thiết bị
// =============================================================================

/**
 * Lấy danh sách chat threads từ server
 * @param {number} limit - Số lượng tối đa
 * @returns {Promise<{threads: Array}>}
 */
export async function getChatThreads(limit = 50) {
    return apiRequest(`/api/data/chat/threads?limit=${limit}`);
}

/**
 * Lưu/cập nhật thread
 * @param {string} id - Thread ID
 * @param {string} title - Tiêu đề thread
 */
export async function saveChatThread(id, title) {
    return apiRequest('/api/data/chat/threads', {
        method: 'POST',
        body: JSON.stringify({ id, title }),
    });
}

/**
 * Lưu messages vào thread
 * @param {string} threadId - Thread ID
 * @param {Array} messages - Danh sách messages [{role, content, ts, feedback?}]
 */
export async function saveChatMessages(threadId, messages) {
    return apiRequest('/api/data/chat/messages', {
        method: 'POST',
        body: JSON.stringify({ thread_id: threadId, messages }),
    });
}

/**
 * Xóa thread và messages
 * @param {string} threadId - Thread ID
 */
export async function deleteChatThreadFromServer(threadId) {
    return apiRequest(`/api/data/chat/threads/${threadId}`, { method: 'DELETE' });
}

/**
 * Sync toàn bộ threads từ client lên server
 * @param {Array} threads - Danh sách threads [{id, title, createdAt, updatedAt, messages}]
 */
export async function syncChatThreadsToServer(threads) {
    return apiRequest('/api/data/chat/sync', {
        method: 'POST',
        body: JSON.stringify({ threads }),
    });
}
