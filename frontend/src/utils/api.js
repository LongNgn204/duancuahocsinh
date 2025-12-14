// src/utils/api.js
// Chú thích: API client cho giao tiếp với backend
// Quản lý: auth state, request headers, error handling

const API_BASE = import.meta.env.VITE_API_URL || 'https://ban-dong-hanh-worker.stu725114073.workers.dev';

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
 * Wrapper cho fetch với error handling
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;

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

    return data;
}

// =============================================================================
// AUTH API
// =============================================================================

/**
 * Đăng ký tài khoản mới
 * @param {string} username 
 * @returns {Promise<{success: boolean, user: Object}>}
 */
export async function register(username) {
    const data = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username }),
    });

    if (data.success && data.user) {
        setCurrentUser(data.user);
    }

    return data;
}

/**
 * Đăng nhập
 * @param {string} username 
 * @returns {Promise<{success: boolean, user: Object}>}
 */
export async function login(username) {
    const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username }),
    });

    if (data.success && data.user) {
        setCurrentUser(data.user);

        // Tự động sync dữ liệu local sau khi đăng nhập
        // Chạy async để không block login flow
        setTimeout(async () => {
            try {
                const { syncLocalDataToServer } = await import('./api.js');
                const result = await syncLocalDataToServer();
                if (result.synced) {
                    console.log('[Login] Auto-synced local data:', result.imported);
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

// =============================================================================
// DATA API - GRATITUDE
// =============================================================================

export async function getGratitudeList(limit = 50, offset = 0) {
    return apiRequest(`/api/data/gratitude?limit=${limit}&offset=${offset}`);
}

export async function addGratitude(content) {
    return apiRequest('/api/data/gratitude', {
        method: 'POST',
        body: JSON.stringify({ content }),
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

// =============================================================================
// FORUM API
// =============================================================================

export async function getForumPosts(page = 1, limit = 20, tag = null) {
    let url = `/api/forum/posts?page=${page}&limit=${limit}`;
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

// =============================================================================
// ADMIN API
// =============================================================================

export async function getAdminLogs(limit = 50) {
    return apiRequest(`/api/admin/logs?limit=${limit}`);
}

export async function getBannedUsers() {
    return apiRequest('/api/admin/banned-users');
}

export async function getForumStats() {
    return apiRequest('/api/admin/forum-stats');
}

export async function banUser(userId, reason = null, durationDays = null) {
    return apiRequest('/api/admin/ban-user', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, reason, duration_days: durationDays }),
    });
}

export async function unbanUser(userId) {
    return apiRequest(`/api/admin/ban-user/${userId}`, { method: 'DELETE' });
}

export async function deleteForumPost(postId, reason = null, permanent = false) {
    return apiRequest(`/api/forum/post/${postId}`, {
        method: 'DELETE',
        body: JSON.stringify({ reason, permanent }),
    });
}

export async function toggleLockPost(postId) {
    return apiRequest(`/api/forum/post/${postId}/lock`, { method: 'POST' });
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
        console.log('[Sync] Syncing local data to server:', {
            gratitude: dataToImport.gratitude.length,
            journal: dataToImport.journal.length,
            focus: dataToImport.focus_sessions.length,
            breathing: dataToImport.breathing_sessions.length,
            sleep: dataToImport.sleep_logs.length,
        });

        const result = await importData(dataToImport);

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
