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
// SYNC HELPER
// =============================================================================

/**
 * Sync local data to server (for migration from localStorage)
 */
export async function syncLocalDataToServer() {
    if (!isLoggedIn()) return { synced: false, reason: 'not_logged_in' };

    // Get local gratitude
    const localGratitude = JSON.parse(localStorage.getItem('gratitude') || '[]');

    // Get local journal (if any)
    const localJournal = JSON.parse(localStorage.getItem('journal_entries') || '[]');

    // Get local focus sessions
    const localFocus = JSON.parse(localStorage.getItem('focus_sessions') || '[]');

    // Get local breathing
    const localBreathing = JSON.parse(localStorage.getItem('breathing_sessions') || '[]');

    if (localGratitude.length === 0 && localJournal.length === 0 &&
        localFocus.length === 0 && localBreathing.length === 0) {
        return { synced: false, reason: 'no_local_data' };
    }

    try {
        const result = await importData({
            gratitude: localGratitude.map(g => ({ content: g.text || g.content, created_at: g.date || g.created_at })),
            journal: localJournal.map(j => ({ content: j.content, mood: j.mood, tags: j.tags, created_at: j.date || j.created_at })),
            focus_sessions: localFocus.map(f => ({ duration_minutes: f.duration || f.duration_minutes, session_type: f.type || 'focus', created_at: f.date || f.created_at })),
            breathing_sessions: localBreathing.map(b => ({ exercise_type: b.type || b.exercise_type, duration_seconds: b.duration || b.duration_seconds, created_at: b.date || b.created_at })),
        });

        return { synced: true, imported: result.imported };
    } catch (error) {
        console.error('[Sync] Error:', error);
        return { synced: false, reason: error.message };
    }
}
