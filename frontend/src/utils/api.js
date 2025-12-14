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

