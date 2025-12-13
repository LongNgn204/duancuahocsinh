// backend/workers/data-api.js
// Chú thích: REST API cho CRUD dữ liệu người dùng (gratitude, journal, focus, breathing, achievements)

/**
 * Extract và validate userId từ request headers
 */
function getUserId(request) {
    const userId = request.headers.get('X-User-Id');
    if (!userId) return null;
    const parsed = parseInt(userId);
    return isNaN(parsed) ? null : parsed;
}

/**
 * Helper tạo JSON response
 */
function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
}

// =============================================================================
// GRATITUDE ENDPOINTS
// =============================================================================

/**
 * GET /api/data/gratitude - Lấy danh sách gratitude
 * Query params: ?limit=50&offset=0
 */
export async function getGratitude(request, env) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    try {
        const result = await env.ban_dong_hanh_db.prepare(
            'SELECT id, content, created_at FROM gratitude WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
        ).bind(userId, limit, offset).all();

        return json({ items: result.results, count: result.results.length });
    } catch (error) {
        console.error('[Data] getGratitude error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

/**
 * POST /api/data/gratitude - Thêm gratitude mới
 * Body: { content: string }
 */
export async function addGratitude(request, env) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    try {
        const { content } = await request.json();

        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            return json({ error: 'Nội dung không được để trống' }, 400);
        }

        if (content.length > 500) {
            return json({ error: 'Nội dung không quá 500 ký tự' }, 400);
        }

        const result = await env.ban_dong_hanh_db.prepare(
            'INSERT INTO gratitude (user_id, content) VALUES (?, ?) RETURNING id, content, created_at'
        ).bind(userId, content.trim()).first();

        return json({ success: true, item: result }, 201);
    } catch (error) {
        console.error('[Data] addGratitude error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

/**
 * DELETE /api/data/gratitude/:id - Xóa gratitude
 */
export async function deleteGratitude(request, env, id) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    try {
        const result = await env.ban_dong_hanh_db.prepare(
            'DELETE FROM gratitude WHERE id = ? AND user_id = ?'
        ).bind(parseInt(id), userId).run();

        if (result.changes === 0) {
            return json({ error: 'not_found' }, 404);
        }

        return json({ success: true });
    } catch (error) {
        console.error('[Data] deleteGratitude error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

// =============================================================================
// JOURNAL ENDPOINTS
// =============================================================================

/**
 * GET /api/data/journal - Lấy danh sách nhật ký
 */
export async function getJournal(request, env) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '30'), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    try {
        const result = await env.ban_dong_hanh_db.prepare(
            'SELECT id, content, mood, tags, sentiment_score, created_at FROM journal WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
        ).bind(userId, limit, offset).all();

        return json({ items: result.results, count: result.results.length });
    } catch (error) {
        console.error('[Data] getJournal error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

/**
 * POST /api/data/journal - Thêm nhật ký mới
 * Body: { content: string, mood?: string, tags?: string[] }
 */
export async function addJournal(request, env) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    try {
        const { content, mood, tags } = await request.json();

        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            return json({ error: 'Nội dung không được để trống' }, 400);
        }

        if (content.length > 5000) {
            return json({ error: 'Nội dung không quá 5000 ký tự' }, 400);
        }

        const validMoods = ['happy', 'calm', 'neutral', 'sad', 'stressed'];
        const moodValue = validMoods.includes(mood) ? mood : null;
        const tagsValue = Array.isArray(tags) ? JSON.stringify(tags.slice(0, 5)) : null;

        const result = await env.ban_dong_hanh_db.prepare(
            'INSERT INTO journal (user_id, content, mood, tags) VALUES (?, ?, ?, ?) RETURNING id, content, mood, tags, created_at'
        ).bind(userId, content.trim(), moodValue, tagsValue).first();

        return json({ success: true, item: result }, 201);
    } catch (error) {
        console.error('[Data] addJournal error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

/**
 * DELETE /api/data/journal/:id - Xóa nhật ký
 */
export async function deleteJournal(request, env, id) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    try {
        const result = await env.ban_dong_hanh_db.prepare(
            'DELETE FROM journal WHERE id = ? AND user_id = ?'
        ).bind(parseInt(id), userId).run();

        if (result.changes === 0) {
            return json({ error: 'not_found' }, 404);
        }

        return json({ success: true });
    } catch (error) {
        console.error('[Data] deleteJournal error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

// =============================================================================
// FOCUS SESSIONS ENDPOINTS
// =============================================================================

/**
 * GET /api/data/focus - Lấy lịch sử focus sessions
 */
export async function getFocusSessions(request, env) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    try {
        const result = await env.ban_dong_hanh_db.prepare(
            'SELECT id, duration_minutes, session_type, completed, created_at FROM focus_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
        ).bind(userId, limit, offset).all();

        return json({ items: result.results, count: result.results.length });
    } catch (error) {
        console.error('[Data] getFocusSessions error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

/**
 * POST /api/data/focus - Lưu focus session
 * Body: { duration_minutes: number, session_type?: 'focus'|'break', completed?: boolean }
 */
export async function addFocusSession(request, env) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    try {
        const { duration_minutes, session_type = 'focus', completed = true } = await request.json();

        if (!duration_minutes || typeof duration_minutes !== 'number' || duration_minutes <= 0) {
            return json({ error: 'duration_minutes phải là số dương' }, 400);
        }

        const validTypes = ['focus', 'break'];
        const typeValue = validTypes.includes(session_type) ? session_type : 'focus';

        const result = await env.ban_dong_hanh_db.prepare(
            'INSERT INTO focus_sessions (user_id, duration_minutes, session_type, completed) VALUES (?, ?, ?, ?) RETURNING id, duration_minutes, session_type, completed, created_at'
        ).bind(userId, duration_minutes, typeValue, completed ? 1 : 0).first();

        return json({ success: true, item: result }, 201);
    } catch (error) {
        console.error('[Data] addFocusSession error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

// =============================================================================
// BREATHING SESSIONS ENDPOINTS
// =============================================================================

/**
 * GET /api/data/breathing - Lấy lịch sử breathing sessions
 */
export async function getBreathingSessions(request, env) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);

    try {
        const result = await env.ban_dong_hanh_db.prepare(
            'SELECT id, exercise_type, duration_seconds, created_at FROM breathing_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?'
        ).bind(userId, limit).all();

        return json({ items: result.results, count: result.results.length });
    } catch (error) {
        console.error('[Data] getBreathingSessions error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

/**
 * POST /api/data/breathing - Lưu breathing session
 * Body: { exercise_type: string, duration_seconds: number }
 */
export async function addBreathingSession(request, env) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    try {
        const { exercise_type, duration_seconds } = await request.json();

        if (!exercise_type || typeof exercise_type !== 'string') {
            return json({ error: 'exercise_type bắt buộc' }, 400);
        }

        if (!duration_seconds || typeof duration_seconds !== 'number' || duration_seconds <= 0) {
            return json({ error: 'duration_seconds phải là số dương' }, 400);
        }

        const result = await env.ban_dong_hanh_db.prepare(
            'INSERT INTO breathing_sessions (user_id, exercise_type, duration_seconds) VALUES (?, ?, ?) RETURNING id, exercise_type, duration_seconds, created_at'
        ).bind(userId, exercise_type, duration_seconds).first();

        return json({ success: true, item: result }, 201);
    } catch (error) {
        console.error('[Data] addBreathingSession error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

// =============================================================================
// ACHIEVEMENTS ENDPOINTS
// =============================================================================

/**
 * GET /api/data/achievements - Lấy danh sách achievements đã mở khóa
 */
export async function getAchievements(request, env) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    try {
        const result = await env.ban_dong_hanh_db.prepare(
            'SELECT id, achievement_id, unlocked_at FROM achievements WHERE user_id = ? ORDER BY unlocked_at DESC'
        ).bind(userId).all();

        return json({ items: result.results, count: result.results.length });
    } catch (error) {
        console.error('[Data] getAchievements error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

/**
 * POST /api/data/achievements - Mở khóa achievement
 * Body: { achievement_id: string }
 */
export async function unlockAchievement(request, env) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    try {
        const { achievement_id } = await request.json();

        if (!achievement_id || typeof achievement_id !== 'string') {
            return json({ error: 'achievement_id bắt buộc' }, 400);
        }

        // Check if already unlocked
        const existing = await env.ban_dong_hanh_db.prepare(
            'SELECT id FROM achievements WHERE user_id = ? AND achievement_id = ?'
        ).bind(userId, achievement_id).first();

        if (existing) {
            return json({ success: true, alreadyUnlocked: true });
        }

        const result = await env.ban_dong_hanh_db.prepare(
            'INSERT INTO achievements (user_id, achievement_id) VALUES (?, ?) RETURNING id, achievement_id, unlocked_at'
        ).bind(userId, achievement_id).first();

        return json({ success: true, item: result, newUnlock: true }, 201);
    } catch (error) {
        console.error('[Data] unlockAchievement error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

// =============================================================================
// STATS ENDPOINT
// =============================================================================

/**
 * GET /api/data/stats - Lấy thống kê tổng hợp
 */
export async function getStats(request, env) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    try {
        // Gratitude count
        const gratitudeCount = await env.ban_dong_hanh_db.prepare(
            'SELECT COUNT(*) as count FROM gratitude WHERE user_id = ?'
        ).bind(userId).first();

        // Journal count
        const journalCount = await env.ban_dong_hanh_db.prepare(
            'SELECT COUNT(*) as count FROM journal WHERE user_id = ?'
        ).bind(userId).first();

        // Focus sessions count và total minutes
        const focusStats = await env.ban_dong_hanh_db.prepare(
            'SELECT COUNT(*) as count, COALESCE(SUM(duration_minutes), 0) as total_minutes FROM focus_sessions WHERE user_id = ? AND completed = 1'
        ).bind(userId).first();

        // Breathing sessions count và total seconds
        const breathingStats = await env.ban_dong_hanh_db.prepare(
            'SELECT COUNT(*) as count, COALESCE(SUM(duration_seconds), 0) as total_seconds FROM breathing_sessions WHERE user_id = ?'
        ).bind(userId).first();

        // Achievements count
        const achievementsCount = await env.ban_dong_hanh_db.prepare(
            'SELECT COUNT(*) as count FROM achievements WHERE user_id = ?'
        ).bind(userId).first();

        // Gratitude streak (ngày liên tiếp có entry)
        const streakResult = await env.ban_dong_hanh_db.prepare(`
      SELECT DATE(created_at) as date FROM gratitude 
      WHERE user_id = ? 
      GROUP BY DATE(created_at) 
      ORDER BY date DESC
    `).bind(userId).all();

        let streak = 0;
        if (streakResult.results.length > 0) {
            const today = new Date().toISOString().split('T')[0];
            const dates = streakResult.results.map(r => r.date);

            // Check if today or yesterday has entry
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            if (dates[0] === today || dates[0] === yesterday) {
                streak = 1;
                for (let i = 1; i < dates.length; i++) {
                    const prevDate = new Date(dates[i - 1]);
                    const currDate = new Date(dates[i]);
                    const diffDays = (prevDate - currDate) / 86400000;
                    if (diffDays === 1) {
                        streak++;
                    } else {
                        break;
                    }
                }
            }
        }

        return json({
            gratitude: { count: gratitudeCount.count, streak },
            journal: { count: journalCount.count },
            focus: { sessions: focusStats.count, totalMinutes: focusStats.total_minutes },
            breathing: { sessions: breathingStats.count, totalSeconds: breathingStats.total_seconds },
            achievements: { count: achievementsCount.count }
        });
    } catch (error) {
        console.error('[Data] getStats error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

// =============================================================================
// EXPORT/IMPORT ENDPOINTS
// =============================================================================

/**
 * GET /api/data/export - Xuất toàn bộ dữ liệu user
 */
export async function exportData(request, env) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    try {
        const user = await env.ban_dong_hanh_db.prepare(
            'SELECT username, created_at FROM users WHERE id = ?'
        ).bind(userId).first();

        const gratitude = await env.ban_dong_hanh_db.prepare(
            'SELECT content, created_at FROM gratitude WHERE user_id = ? ORDER BY created_at'
        ).bind(userId).all();

        const journal = await env.ban_dong_hanh_db.prepare(
            'SELECT content, mood, tags, created_at FROM journal WHERE user_id = ? ORDER BY created_at'
        ).bind(userId).all();

        const focus = await env.ban_dong_hanh_db.prepare(
            'SELECT duration_minutes, session_type, completed, created_at FROM focus_sessions WHERE user_id = ? ORDER BY created_at'
        ).bind(userId).all();

        const breathing = await env.ban_dong_hanh_db.prepare(
            'SELECT exercise_type, duration_seconds, created_at FROM breathing_sessions WHERE user_id = ? ORDER BY created_at'
        ).bind(userId).all();

        const achievements = await env.ban_dong_hanh_db.prepare(
            'SELECT achievement_id, unlocked_at FROM achievements WHERE user_id = ?'
        ).bind(userId).all();

        const settings = await env.ban_dong_hanh_db.prepare(
            'SELECT theme, notifications, sound, font_size FROM user_settings WHERE user_id = ?'
        ).bind(userId).first();

        return json({
            exportedAt: new Date().toISOString(),
            version: '1.0',
            user: { username: user.username, created_at: user.created_at },
            data: {
                gratitude: gratitude.results,
                journal: journal.results,
                focus_sessions: focus.results,
                breathing_sessions: breathing.results,
                achievements: achievements.results,
                settings: settings || {}
            }
        });
    } catch (error) {
        console.error('[Data] exportData error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

/**
 * POST /api/data/import - Nhập dữ liệu từ JSON
 * Body: { data: { gratitude: [], journal: [], ... } }
 */
export async function importData(request, env) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    try {
        const { data } = await request.json();

        if (!data || typeof data !== 'object') {
            return json({ error: 'invalid_data_format' }, 400);
        }

        let imported = { gratitude: 0, journal: 0, focus: 0, breathing: 0 };

        // Import gratitude
        if (Array.isArray(data.gratitude)) {
            for (const item of data.gratitude.slice(0, 1000)) {
                if (item.content) {
                    await env.ban_dong_hanh_db.prepare(
                        'INSERT INTO gratitude (user_id, content, created_at) VALUES (?, ?, ?)'
                    ).bind(userId, item.content, item.created_at || new Date().toISOString()).run();
                    imported.gratitude++;
                }
            }
        }

        // Import journal
        if (Array.isArray(data.journal)) {
            for (const item of data.journal.slice(0, 500)) {
                if (item.content) {
                    await env.ban_dong_hanh_db.prepare(
                        'INSERT INTO journal (user_id, content, mood, tags, created_at) VALUES (?, ?, ?, ?, ?)'
                    ).bind(userId, item.content, item.mood || null, item.tags || null, item.created_at || new Date().toISOString()).run();
                    imported.journal++;
                }
            }
        }

        // Import focus sessions
        if (Array.isArray(data.focus_sessions)) {
            for (const item of data.focus_sessions.slice(0, 1000)) {
                if (item.duration_minutes) {
                    await env.ban_dong_hanh_db.prepare(
                        'INSERT INTO focus_sessions (user_id, duration_minutes, session_type, completed, created_at) VALUES (?, ?, ?, ?, ?)'
                    ).bind(userId, item.duration_minutes, item.session_type || 'focus', item.completed ?? 1, item.created_at || new Date().toISOString()).run();
                    imported.focus++;
                }
            }
        }

        // Import breathing sessions
        if (Array.isArray(data.breathing_sessions)) {
            for (const item of data.breathing_sessions.slice(0, 1000)) {
                if (item.exercise_type && item.duration_seconds) {
                    await env.ban_dong_hanh_db.prepare(
                        'INSERT INTO breathing_sessions (user_id, exercise_type, duration_seconds, created_at) VALUES (?, ?, ?, ?)'
                    ).bind(userId, item.exercise_type, item.duration_seconds, item.created_at || new Date().toISOString()).run();
                    imported.breathing++;
                }
            }
        }

        return json({ success: true, imported });
    } catch (error) {
        console.error('[Data] importData error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}
