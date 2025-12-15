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
            'SELECT id, content, tag, created_at FROM gratitude WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
        ).bind(userId, limit, offset).all();

        return json({ items: result.results, count: result.results.length });
    } catch (error) {
        console.error('[Data] getGratitude error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

/**
 * POST /api/data/gratitude - Thêm gratitude mới
 * Body: { content: string, tag?: string }
 */
export async function addGratitude(request, env) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    try {
        const { content, tag } = await request.json();

        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            return json({ error: 'Nội dung không được để trống' }, 400);
        }

        if (content.length > 500) {
            return json({ error: 'Nội dung không quá 500 ký tự' }, 400);
        }

        const result = await env.ban_dong_hanh_db.prepare(
            'INSERT INTO gratitude (user_id, content, tag) VALUES (?, ?, ?) RETURNING id, content, tag, created_at'
        ).bind(userId, content.trim(), tag || null).first();

        return json({ success: true, item: result, id: result.id }, 201);
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
// SLEEP LOGS ENDPOINTS
// =============================================================================

/**
 * GET /api/data/sleep - Lấy lịch sử giấc ngủ
 * Query params: ?limit=50
 */
export async function getSleepLogs(request, env) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);

    try {
        const result = await env.ban_dong_hanh_db.prepare(
            'SELECT id, sleep_time, wake_time, duration_minutes, quality, notes, created_at FROM sleep_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?'
        ).bind(userId, limit).all();

        return json({ items: result.results, count: result.results.length });
    } catch (error) {
        console.error('[Data] getSleepLogs error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

/**
 * POST /api/data/sleep - Lưu sleep log
 * Body: { sleep_time: string, wake_time: string, quality?: number, notes?: string }
 */
export async function addSleepLog(request, env) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    try {
        const { sleep_time, wake_time, quality, notes, duration_minutes } = await request.json();

        if (!sleep_time || !wake_time) {
            return json({ error: 'sleep_time và wake_time bắt buộc' }, 400);
        }

        // Validate quality nếu có
        const qualityValue = quality ? Math.min(5, Math.max(1, parseInt(quality))) : null;

        // Tính duration nếu không được truyền
        let durationValue = duration_minutes;
        if (!durationValue) {
            // Thử parse thời gian để tính duration
            try {
                const sleepParts = sleep_time.split(':').map(Number);
                const wakeParts = wake_time.split(':').map(Number);
                const sleepMinutes = sleepParts[0] * 60 + sleepParts[1];
                let wakeMinutes = wakeParts[0] * 60 + wakeParts[1];

                // Nếu wake < sleep, nghĩa là qua ngày mới
                if (wakeMinutes < sleepMinutes) {
                    wakeMinutes += 24 * 60;
                }
                durationValue = wakeMinutes - sleepMinutes;
            } catch {
                durationValue = null;
            }
        }

        const result = await env.ban_dong_hanh_db.prepare(
            'INSERT INTO sleep_logs (user_id, sleep_time, wake_time, duration_minutes, quality, notes) VALUES (?, ?, ?, ?, ?, ?) RETURNING id, sleep_time, wake_time, duration_minutes, quality, notes, created_at'
        ).bind(userId, sleep_time, wake_time, durationValue, qualityValue, notes || null).first();

        return json({ success: true, item: result }, 201);
    } catch (error) {
        console.error('[Data] addSleepLog error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

/**
 * DELETE /api/data/sleep/:id - Xóa sleep log
 */
export async function deleteSleepLog(request, env, id) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    try {
        const result = await env.ban_dong_hanh_db.prepare(
            'DELETE FROM sleep_logs WHERE id = ? AND user_id = ?'
        ).bind(parseInt(id), userId).run();

        if (result.changes === 0) {
            return json({ error: 'not_found' }, 404);
        }

        return json({ success: true });
    } catch (error) {
        console.error('[Data] deleteSleepLog error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

/**
 * PUT /api/data/sleep/:id - Cập nhật sleep log
 */
export async function updateSleepLog(request, env, id) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    try {
        const { sleep_time, wake_time, quality, notes, duration_minutes } = await request.json();

        // Verify ownership
        const existing = await env.ban_dong_hanh_db.prepare(
            'SELECT id FROM sleep_logs WHERE id = ? AND user_id = ?'
        ).bind(parseInt(id), userId).first();

        if (!existing) {
            return json({ error: 'not_found' }, 404);
        }

        const qualityValue = quality ? Math.min(5, Math.max(1, parseInt(quality))) : null;

        const result = await env.ban_dong_hanh_db.prepare(
            'UPDATE sleep_logs SET sleep_time = ?, wake_time = ?, duration_minutes = ?, quality = ?, notes = ? WHERE id = ? AND user_id = ? RETURNING *'
        ).bind(sleep_time, wake_time, duration_minutes || null, qualityValue, notes || null, parseInt(id), userId).first();

        return json({ success: true, item: result });
    } catch (error) {
        console.error('[Data] updateSleepLog error:', error.message);
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

        // Journal count và mood distribution
        const journalCount = await env.ban_dong_hanh_db.prepare(
            'SELECT COUNT(*) as count FROM journal WHERE user_id = ?'
        ).bind(userId).first();

        const moodDist = await env.ban_dong_hanh_db.prepare(
            'SELECT mood, COUNT(*) as count FROM journal WHERE user_id = ? AND mood IS NOT NULL GROUP BY mood'
        ).bind(userId).all();

        // Focus sessions count và total minutes
        const focusStats = await env.ban_dong_hanh_db.prepare(
            'SELECT COUNT(*) as count, COALESCE(SUM(duration_minutes), 0) as total_minutes FROM focus_sessions WHERE user_id = ? AND completed = 1'
        ).bind(userId).first();

        // Breathing sessions count và total seconds
        const breathingStats = await env.ban_dong_hanh_db.prepare(
            'SELECT COUNT(*) as count, COALESCE(SUM(duration_seconds), 0) as total_seconds FROM breathing_sessions WHERE user_id = ?'
        ).bind(userId).first();

        // Sleep statistics
        const sleepStats = await env.ban_dong_hanh_db.prepare(
            'SELECT COUNT(*) as count, COALESCE(AVG(duration_minutes), 0) as avg_duration, COALESCE(AVG(quality), 0) as avg_quality FROM sleep_logs WHERE user_id = ?'
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

        // Build mood distribution object
        const moodDistribution = {};
        if (moodDist.results) {
            moodDist.results.forEach(m => { moodDistribution[m.mood] = m.count; });
        }

        return json({
            gratitude: { count: gratitudeCount.count, streak },
            journal: { count: journalCount.count, moodDistribution },
            focus: { sessions: focusStats.count, totalMinutes: focusStats.total_minutes },
            breathing: { sessions: breathingStats.count, totalSeconds: breathingStats.total_seconds },
            sleep: {
                logs: sleepStats.count,
                avgMinutes: Math.round(sleepStats.avg_duration || 0),
                avgQuality: parseFloat((sleepStats.avg_quality || 0).toFixed(1))
            },
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

        const sleepLogs = await env.ban_dong_hanh_db.prepare(
            'SELECT sleep_time, wake_time, duration_minutes, quality, notes, created_at FROM sleep_logs WHERE user_id = ? ORDER BY created_at'
        ).bind(userId).all();

        const achievements = await env.ban_dong_hanh_db.prepare(
            'SELECT achievement_id, unlocked_at FROM achievements WHERE user_id = ?'
        ).bind(userId).all();

        const settings = await env.ban_dong_hanh_db.prepare(
            'SELECT theme, notifications, sound, font_size FROM user_settings WHERE user_id = ?'
        ).bind(userId).first();

        return json({
            exportedAt: new Date().toISOString(),
            version: '1.1',
            user: { username: user.username, created_at: user.created_at },
            data: {
                gratitude: gratitude.results,
                journal: journal.results,
                focus_sessions: focus.results,
                breathing_sessions: breathing.results,
                sleep_logs: sleepLogs.results,
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
        console.log('[Import] User', userId, 'importing data:', {
            gratitude: data?.gratitude?.length || 0,
            journal: data?.journal?.length || 0,
            focus: data?.focus_sessions?.length || 0,
            breathing: data?.breathing_sessions?.length || 0,
            sleep: data?.sleep_logs?.length || 0,
        });

        if (!data || typeof data !== 'object') {
            return json({ error: 'invalid_data_format' }, 400);
        }

        let imported = { gratitude: 0, journal: 0, focus: 0, breathing: 0 };

        // Import gratitude
        if (Array.isArray(data.gratitude)) {
            for (const item of data.gratitude.slice(0, 1000)) {
                if (item.content) {
                    const createdAt = item.created_at || new Date().toISOString();
                    // Kiểm tra duplicate dựa trên content và created_at (trong cùng ngày)
                    const existing = await env.ban_dong_hanh_db.prepare(
                        `SELECT id FROM gratitude 
                         WHERE user_id = ? AND content = ? 
                         AND date(created_at) = date(?)`
                    ).bind(userId, item.content, createdAt).first();

                    if (!existing) {
                        await env.ban_dong_hanh_db.prepare(
                            'INSERT INTO gratitude (user_id, content, created_at) VALUES (?, ?, ?)'
                        ).bind(userId, item.content, createdAt).run();
                        imported.gratitude++;
                    }
                }
            }
        }

        // Import journal
        if (Array.isArray(data.journal)) {
            for (const item of data.journal.slice(0, 500)) {
                if (item.content) {
                    const createdAt = item.created_at || new Date().toISOString();
                    // Kiểm tra duplicate dựa trên content và created_at (trong cùng ngày)
                    const dateOnly = createdAt.split('T')[0];
                    const existing = await env.ban_dong_hanh_db.prepare(
                        `SELECT id FROM journal 
                         WHERE user_id = ? AND content = ? 
                         AND date(created_at) = date(?)`
                    ).bind(userId, item.content, createdAt).first();

                    if (!existing) {
                        await env.ban_dong_hanh_db.prepare(
                            'INSERT INTO journal (user_id, content, mood, tags, created_at) VALUES (?, ?, ?, ?, ?)'
                        ).bind(userId, item.content, item.mood || null, item.tags || null, createdAt).run();
                        imported.journal++;
                    }
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

        // Import sleep logs
        if (Array.isArray(data.sleep_logs)) {
            for (const item of data.sleep_logs.slice(0, 500)) {
                if (item.sleep_time && item.wake_time) {
                    await env.ban_dong_hanh_db.prepare(
                        'INSERT INTO sleep_logs (user_id, sleep_time, wake_time, duration_minutes, quality, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
                    ).bind(
                        userId,
                        item.sleep_time,
                        item.wake_time,
                        item.duration_minutes || null,
                        item.quality || null,
                        item.notes || null,
                        item.created_at || new Date().toISOString()
                    ).run();
                    imported.sleep = (imported.sleep || 0) + 1;
                }
            }
        }

        console.log('[Import] Successfully imported for user', userId, ':', imported);
        return json({ success: true, imported });
    } catch (error) {
        console.error('[Data] importData error:', error.message);
        return json({ error: 'server_error', message: error.message }, 500);
    }
}

// =============================================================================
// GAME SCORES ENDPOINTS
// =============================================================================

/**
 * GET /api/data/game-scores - Lấy điểm số game
 * Query params: ?game_type=space_control&limit=10&leaderboard=true
 */
export async function getGameScores(request, env) {
    const userId = getUserId(request);
    const url = new URL(request.url);
    const gameType = url.searchParams.get('game_type');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50);
    const leaderboard = url.searchParams.get('leaderboard') === 'true';

    try {
        if (leaderboard) {
            // Leaderboard toàn bộ users (ẩn danh)
            const result = await env.ban_dong_hanh_db.prepare(`
                SELECT gs.score, gs.level_reached, gs.created_at, 
                       'Player_' || SUBSTR(CAST(gs.user_id AS TEXT), 1, 3) as player_name
                FROM game_scores gs
                ${gameType ? 'WHERE gs.game_type = ?' : ''}
                ORDER BY gs.score DESC
                LIMIT ?
            `).bind(...(gameType ? [gameType, limit] : [limit])).all();

            return json({ leaderboard: result.results });
        }

        // Personal scores - cần đăng nhập
        if (!userId) return json({ error: 'not_authenticated' }, 401);

        const query = gameType
            ? 'SELECT id, game_type, score, level_reached, play_duration_seconds, created_at FROM game_scores WHERE user_id = ? AND game_type = ? ORDER BY score DESC LIMIT ?'
            : 'SELECT id, game_type, score, level_reached, play_duration_seconds, created_at FROM game_scores WHERE user_id = ? ORDER BY created_at DESC LIMIT ?';

        const result = await env.ban_dong_hanh_db.prepare(query)
            .bind(...(gameType ? [userId, gameType, limit] : [userId, limit])).all();

        // Lấy high score cho mỗi game
        const highScores = await env.ban_dong_hanh_db.prepare(`
            SELECT game_type, MAX(score) as high_score 
            FROM game_scores 
            WHERE user_id = ? 
            GROUP BY game_type
        `).bind(userId).all();

        return json({
            items: result.results,
            highScores: Object.fromEntries(highScores.results.map(h => [h.game_type, h.high_score]))
        });
    } catch (error) {
        console.error('[Data] getGameScores error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

/**
 * POST /api/data/game-scores - Lưu điểm game mới
 * Body: { game_type: string, score: number, level_reached?: number, play_duration_seconds?: number }
 */
export async function addGameScore(request, env) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    try {
        const { game_type, score, level_reached = 1, play_duration_seconds } = await request.json();

        if (!game_type || typeof game_type !== 'string') {
            return json({ error: 'game_type bắt buộc' }, 400);
        }

        if (typeof score !== 'number' || score < 0) {
            return json({ error: 'score phải là số không âm' }, 400);
        }

        const validGames = ['space_control', 'space_pilot', 'bee_game', 'bubble_pop', 'color_match', 'doodle', 'reflex'];
        if (!validGames.includes(game_type)) {
            return json({ error: 'game_type không hợp lệ' }, 400);
        }

        // Lấy high score hiện tại
        const currentHigh = await env.ban_dong_hanh_db.prepare(
            'SELECT MAX(score) as high FROM game_scores WHERE user_id = ? AND game_type = ?'
        ).bind(userId, game_type).first();

        const isNewRecord = score > (currentHigh?.high || 0);

        // Lưu score mới
        const result = await env.ban_dong_hanh_db.prepare(
            'INSERT INTO game_scores (user_id, game_type, score, level_reached, play_duration_seconds) VALUES (?, ?, ?, ?, ?) RETURNING *'
        ).bind(userId, game_type, score, level_reached, play_duration_seconds || null).first();

        // Cập nhật user_stats nếu là record mới
        if (isNewRecord) {
            await env.ban_dong_hanh_db.prepare(`
                INSERT INTO user_stats (user_id, games_played, highest_game_score)
                VALUES (?, 1, ?)
                ON CONFLICT(user_id) DO UPDATE SET
                    games_played = games_played + 1,
                    highest_game_score = MAX(highest_game_score, ?),
                    updated_at = datetime('now')
            `).bind(userId, score, score).run();
        }

        return json({
            success: true,
            item: result,
            isNewRecord,
            previousHigh: currentHigh?.high || 0
        }, 201);
    } catch (error) {
        console.error('[Data] addGameScore error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

// =============================================================================
// NOTIFICATION SETTINGS ENDPOINTS
// =============================================================================

/**
 * GET /api/data/notification-settings - Lấy cài đặt thông báo
 */
export async function getNotificationSettings(request, env) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    try {
        const settings = await env.ban_dong_hanh_db.prepare(
            'SELECT daily_reminder, pomodoro_alerts, sleep_reminder, reminder_time, push_subscription FROM notification_settings WHERE user_id = ?'
        ).bind(userId).first();

        // Trả về default settings nếu chưa có
        return json({
            settings: settings || {
                daily_reminder: false,
                pomodoro_alerts: true,
                sleep_reminder: false,
                reminder_time: null,
                push_subscription: null
            }
        });
    } catch (error) {
        console.error('[Data] getNotificationSettings error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

/**
 * POST /api/data/notification-settings - Lưu cài đặt thông báo
 * Body: { daily_reminder?: boolean, pomodoro_alerts?: boolean, sleep_reminder?: boolean, reminder_time?: string, push_subscription?: object }
 */
export async function saveNotificationSettings(request, env) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    try {
        const { daily_reminder, pomodoro_alerts, sleep_reminder, reminder_time, push_subscription } = await request.json();

        // Validate reminder_time format nếu có
        if (reminder_time && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(reminder_time)) {
            return json({ error: 'reminder_time phải có định dạng HH:MM' }, 400);
        }

        // Stringify push_subscription nếu là object
        const subscriptionValue = push_subscription ? JSON.stringify(push_subscription) : null;

        await env.ban_dong_hanh_db.prepare(`
            INSERT INTO notification_settings (user_id, daily_reminder, pomodoro_alerts, sleep_reminder, reminder_time, push_subscription)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                daily_reminder = COALESCE(?, daily_reminder),
                pomodoro_alerts = COALESCE(?, pomodoro_alerts),
                sleep_reminder = COALESCE(?, sleep_reminder),
                reminder_time = COALESCE(?, reminder_time),
                push_subscription = COALESCE(?, push_subscription),
                updated_at = datetime('now')
        `).bind(
            userId,
            daily_reminder ? 1 : 0,
            pomodoro_alerts !== false ? 1 : 0,
            sleep_reminder ? 1 : 0,
            reminder_time || null,
            subscriptionValue,
            daily_reminder !== undefined ? (daily_reminder ? 1 : 0) : null,
            pomodoro_alerts !== undefined ? (pomodoro_alerts ? 1 : 0) : null,
            sleep_reminder !== undefined ? (sleep_reminder ? 1 : 0) : null,
            reminder_time || null,
            subscriptionValue
        ).run();

        return json({ success: true });
    } catch (error) {
        console.error('[Data] saveNotificationSettings error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

// =============================================================================
// SOS LOGS ENDPOINTS
// =============================================================================

/**
 * POST /api/data/sos-log - Ghi log sự kiện SOS
 * Body: { event_type: string, risk_level?: string, trigger_text?: string, location?: {lat, lng}, metadata?: object }
 * Chú thích: endpoint này không yêu cầu đăng nhập để hỗ trợ cả khách
 */
export async function logSOSEvent(request, env) {
    const userId = getUserId(request); // có thể null

    try {
        const { event_type, risk_level, trigger_text, location, metadata } = await request.json();

        if (!event_type) {
            return json({ error: 'event_type bắt buộc' }, 400);
        }

        const validEventTypes = ['overlay_opened', 'hotline_clicked', 'map_viewed', 'message_flagged', 'false_positive'];
        if (!validEventTypes.includes(event_type)) {
            return json({ error: 'event_type không hợp lệ' }, 400);
        }

        // Tạo hashed_user_id ẩn danh nếu có userId
        let hashedUserId = null;
        if (userId) {
            // Simple hash: chỉ lấy 8 ký tự đầu của hash
            const encoder = new TextEncoder();
            const data = encoder.encode(userId.toString() + 'bdh_salt');
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            hashedUserId = hashArray.slice(0, 4).map(b => b.toString(16).padStart(2, '0')).join('');
        }

        await env.ban_dong_hanh_db.prepare(`
            INSERT INTO sos_logs (user_id, hashed_user_id, event_type, risk_level, trigger_text, location_lat, location_lng, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            userId || null,
            hashedUserId,
            event_type,
            risk_level || null,
            trigger_text ? trigger_text.slice(0, 50) : null, // Chỉ lưu 50 ký tự từ khóa
            location?.lat || null,
            location?.lng || null,
            metadata ? JSON.stringify(metadata) : null
        ).run();

        // Log với observability (structured logging)
        // Note: Import observability nếu cần, nhưng tránh circular dependency
        console.log(JSON.stringify({
            type: 'sos_event',
            event_type,
            risk_level,
            hashed_user_id: hashedUserId,
            timestamp: new Date().toISOString(),
        }));

        return json({ success: true });
    } catch (error) {
        console.error('[Data] logSOSEvent error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

/**
 * GET /api/admin/sos-logs - Lấy danh sách SOS logs (admin only)
 * Query params: ?limit=50&risk_level=red
 */
export async function getSOSLogs(request, env) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    // Kiểm tra quyền admin
    const user = await env.ban_dong_hanh_db.prepare(
        'SELECT is_admin FROM users WHERE id = ?'
    ).bind(userId).first();

    if (!user?.is_admin) {
        return json({ error: 'forbidden' }, 403);
    }

    try {
        const url = new URL(request.url);
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);
        const riskLevel = url.searchParams.get('risk_level');

        const query = riskLevel
            ? 'SELECT * FROM sos_logs WHERE risk_level = ? ORDER BY created_at DESC LIMIT ?'
            : 'SELECT * FROM sos_logs ORDER BY created_at DESC LIMIT ?';

        const result = await env.ban_dong_hanh_db.prepare(query)
            .bind(...(riskLevel ? [riskLevel, limit] : [limit])).all();

        // Thống kê nhanh
        const stats = await env.ban_dong_hanh_db.prepare(`
            SELECT 
                risk_level,
                COUNT(*) as count,
                COUNT(DISTINCT hashed_user_id) as unique_users
            FROM sos_logs
            WHERE created_at > datetime('now', '-7 days')
            GROUP BY risk_level
        `).all();

        return json({
            logs: result.results,
            stats: Object.fromEntries(stats.results.map(s => [s.risk_level || 'unknown', { count: s.count, unique_users: s.unique_users }]))
        });
    } catch (error) {
        console.error('[Admin] getSOSLogs error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

// =============================================================================
// RANDOM CARDS HISTORY ENDPOINTS
// =============================================================================

/**
 * GET /api/data/random-cards-history - Lấy lịch sử thẻ đã xem
 * Query params: ?limit=50
 */
export async function getRandomCardsHistory(request, env) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    try {
        const url = new URL(request.url);
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);

        const result = await env.ban_dong_hanh_db.prepare(
            'SELECT card_id, viewed_at, action_taken FROM random_cards_history WHERE user_id = ? ORDER BY viewed_at DESC LIMIT ?'
        ).bind(userId, limit).all();

        return json({ items: result.results });
    } catch (error) {
        console.error('[Data] getRandomCardsHistory error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

/**
 * POST /api/data/random-cards-history - Ghi lại thẻ đã xem
 * Body: { card_id: string, action_taken?: boolean }
 */
export async function addRandomCardHistory(request, env) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    try {
        const { card_id, action_taken = false } = await request.json();

        if (!card_id) {
            return json({ error: 'card_id bắt buộc' }, 400);
        }

        await env.ban_dong_hanh_db.prepare(
            'INSERT INTO random_cards_history (user_id, card_id, action_taken) VALUES (?, ?, ?)'
        ).bind(userId, card_id, action_taken ? 1 : 0).run();

        return json({ success: true }, 201);
    } catch (error) {
        console.error('[Data] addRandomCardHistory error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

// =============================================================================
// USER STATS ENDPOINTS
// =============================================================================

/**
 * GET /api/data/user-stats - Lấy thống kê gamification của user
 */
export async function getUserStats(request, env) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    try {
        let stats = await env.ban_dong_hanh_db.prepare(
            'SELECT * FROM user_stats WHERE user_id = ?'
        ).bind(userId).first();

        if (!stats) {
            // Tạo stats mới nếu chưa có
            await env.ban_dong_hanh_db.prepare(
                'INSERT INTO user_stats (user_id) VALUES (?)'
            ).bind(userId).run();
            stats = {
                total_xp: 0,
                current_level: 1,
                breathing_total: 0,
                gratitude_streak: 0,
                max_gratitude_streak: 0,
                journal_count: 0,
                focus_total_minutes: 0,
                games_played: 0,
                highest_game_score: 0
            };
        }

        // Tính level từ XP
        const xpPerLevel = 100;
        const level = Math.floor(stats.total_xp / xpPerLevel) + 1;
        const xpForNextLevel = xpPerLevel - (stats.total_xp % xpPerLevel);

        return json({
            ...stats,
            calculated_level: level,
            xp_for_next_level: xpForNextLevel,
            xp_progress_percent: Math.round(((stats.total_xp % xpPerLevel) / xpPerLevel) * 100)
        });
    } catch (error) {
        console.error('[Data] getUserStats error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

/**
 * POST /api/data/user-stats/add-xp - Thêm XP cho user
 * Body: { xp: number, source: string }
 */
export async function addUserXP(request, env) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    try {
        const { xp, source } = await request.json();

        if (typeof xp !== 'number' || xp <= 0) {
            return json({ error: 'xp phải là số dương' }, 400);
        }

        // Giới hạn XP cộng mỗi lần để tránh abuse
        const cappedXP = Math.min(xp, 100);

        // Lấy stats hiện tại
        const currentStats = await env.ban_dong_hanh_db.prepare(
            'SELECT total_xp, current_level FROM user_stats WHERE user_id = ?'
        ).bind(userId).first();

        const oldLevel = currentStats?.current_level || 1;
        const oldXP = currentStats?.total_xp || 0;
        const newXP = oldXP + cappedXP;
        const xpPerLevel = 100;
        const newLevel = Math.floor(newXP / xpPerLevel) + 1;

        // Cập nhật stats
        await env.ban_dong_hanh_db.prepare(`
            INSERT INTO user_stats (user_id, total_xp, current_level)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                total_xp = total_xp + ?,
                current_level = ?,
                updated_at = datetime('now')
        `).bind(userId, newXP, newLevel, cappedXP, newLevel).run();

        const leveledUp = newLevel > oldLevel;

        console.log('[XP] Added:', { userId, xp: cappedXP, source, newLevel, leveledUp });

        return json({
            success: true,
            xp_added: cappedXP,
            total_xp: newXP,
            level: newLevel,
            leveled_up: leveledUp,
            old_level: oldLevel
        });
    } catch (error) {
        console.error('[Data] addUserXP error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

// =============================================================================
// CHAT FEEDBACK & METRICS ENDPOINTS
// =============================================================================

/**
 * POST /api/data/chat/feedback - Submit feedback về AI response
 * Body: { message_id: string, helpful: 0|1, reason?: string, response_quality?: 1-5 }
 */
export async function submitChatFeedback(request, env) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    try {
        const { message_id, helpful, reason, response_quality } = await request.json();

        if (!message_id || typeof message_id !== 'string') {
            return json({ error: 'message_id is required' }, 400);
        }

        if (helpful !== 0 && helpful !== 1) {
            return json({ error: 'helpful must be 0 or 1' }, 400);
        }

        if (response_quality && (response_quality < 1 || response_quality > 5)) {
            return json({ error: 'response_quality must be 1-5' }, 400);
        }

        const result = await env.ban_dong_hanh_db.prepare(
            `INSERT INTO chat_feedback 
             (user_id, message_id, helpful, reason, response_quality)
             VALUES (?, ?, ?, ?, ?)
             RETURNING id, message_id, helpful, reason, response_quality, created_at`
        ).bind(
            userId,
            message_id,
            helpful,
            reason || null,
            response_quality || null
        ).first();

        return json({ success: true, feedback: result }, 201);
    } catch (error) {
        console.error('[Data] submitChatFeedback error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

/**
 * GET /api/data/chat/metrics - Lấy metrics về chat quality (admin only hoặc user's own)
 * Query params: ?days=7&user_id=123 (optional, admin only)
 */
export async function getChatMetrics(request, env) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '7');
    const targetUserId = url.searchParams.get('user_id'); // Admin only

    // TODO: Check admin permission if targetUserId is provided
    const queryUserId = targetUserId ? parseInt(targetUserId) : userId;

    try {
        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - days);
        const sinceDateStr = sinceDate.toISOString();

        // Get feedback stats
        const feedbackStats = await env.ban_dong_hanh_db.prepare(
            `SELECT 
                COUNT(*) as total_feedback,
                SUM(CASE WHEN helpful = 1 THEN 1 ELSE 0 END) as helpful_count,
                AVG(response_quality) as avg_quality
             FROM chat_feedback
             WHERE user_id = ? AND created_at >= ?`
        ).bind(queryUserId, sinceDateStr).first();

        // Get response stats
        const responseStats = await env.ban_dong_hanh_db.prepare(
            `SELECT 
                COUNT(*) as total_responses,
                AVG(confidence) as avg_confidence,
                AVG(latency_ms) as avg_latency,
                SUM(CASE WHEN used_rag = 1 THEN 1 ELSE 0 END) as rag_used_count,
                SUM(CASE WHEN risk_level = 'red' THEN 1 ELSE 0 END) as sos_count,
                SUM(CASE WHEN risk_level = 'yellow' THEN 1 ELSE 0 END) as yellow_count,
                AVG(tokens_used) as avg_tokens
             FROM chat_responses
             WHERE user_id = ? AND created_at >= ?`
        ).bind(queryUserId, sinceDateStr).first();

        // Calculate helpful rate
        const totalFeedback = feedbackStats?.total_feedback || 0;
        const helpfulCount = feedbackStats?.helpful_count || 0;
        const helpfulRate = totalFeedback > 0 ? (helpfulCount / totalFeedback) : null;

        // Calculate RAG usage rate
        const totalResponses = responseStats?.total_responses || 0;
        const ragUsedCount = responseStats?.rag_used_count || 0;
        const ragUsageRate = totalResponses > 0 ? (ragUsedCount / totalResponses) : null;

        return json({
            period_days: days,
            user_id: queryUserId,
            feedback: {
                total: totalFeedback,
                helpful_count: helpfulCount,
                helpful_rate: helpfulRate,
                avg_quality: feedbackStats?.avg_quality || null,
            },
            responses: {
                total: totalResponses,
                avg_confidence: responseStats?.avg_confidence || null,
                avg_latency_ms: responseStats?.avg_latency || null,
                avg_tokens: responseStats?.avg_tokens || null,
                rag_usage_rate: ragUsageRate,
                sos_count: responseStats?.sos_count || 0,
                yellow_count: responseStats?.yellow_count || 0,
            },
        });
    } catch (error) {
        console.error('[Data] getChatMetrics error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

// =============================================================================
// BOOKMARKS ENDPOINTS
// =============================================================================

/**
 * GET /api/data/bookmarks - Lấy danh sách bookmarks
 * Query params: ?type=story (optional filter)
 */
export async function getBookmarks(request, env) {
    const userId = getUserId(request);
    if (!userId) return json({ items: [] }); // Guest: return empty

    const url = new URL(request.url);
    const bookmarkType = url.searchParams.get('type');

    try {
        let query = 'SELECT id, bookmark_type, item_id, metadata, created_at FROM user_bookmarks WHERE user_id = ?';
        const params = [userId];

        if (bookmarkType) {
            query += ' AND bookmark_type = ?';
            params.push(bookmarkType);
        }

        query += ' ORDER BY created_at DESC';

        const result = await env.ban_dong_hanh_db.prepare(query).bind(...params).all();
        return json({ items: result.results || [], count: result.results?.length || 0 });
    } catch (error) {
        console.error('[Data] getBookmarks error:', error.message);
        return json({ items: [], error: 'server_error' });
    }
}

/**
 * POST /api/data/bookmarks - Thêm bookmark
 * Body: { bookmark_type: 'story'|'resource', item_id: string, metadata?: object }
 */
export async function addBookmark(request, env) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    try {
        const { bookmark_type, item_id, metadata } = await request.json();

        if (!bookmark_type || !item_id) {
            return json({ error: 'bookmark_type và item_id bắt buộc' }, 400);
        }

        const validTypes = ['story', 'resource'];
        if (!validTypes.includes(bookmark_type)) {
            return json({ error: 'bookmark_type không hợp lệ' }, 400);
        }

        // Upsert - nếu đã tồn tại thì cập nhật metadata
        const existing = await env.ban_dong_hanh_db.prepare(
            'SELECT id FROM user_bookmarks WHERE user_id = ? AND bookmark_type = ? AND item_id = ?'
        ).bind(userId, bookmark_type, item_id).first();

        if (existing) {
            // Update metadata nếu đã có
            if (metadata) {
                await env.ban_dong_hanh_db.prepare(
                    'UPDATE user_bookmarks SET metadata = ? WHERE id = ?'
                ).bind(JSON.stringify(metadata), existing.id).run();
            }
            return json({ success: true, alreadyExists: true, id: existing.id });
        }

        const result = await env.ban_dong_hanh_db.prepare(
            'INSERT INTO user_bookmarks (user_id, bookmark_type, item_id, metadata) VALUES (?, ?, ?, ?) RETURNING id, bookmark_type, item_id, created_at'
        ).bind(userId, bookmark_type, item_id, metadata ? JSON.stringify(metadata) : null).first();

        return json({ success: true, item: result }, 201);
    } catch (error) {
        console.error('[Data] addBookmark error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

/**
 * DELETE /api/data/bookmarks/:id - Xóa bookmark bằng ID
 */
export async function deleteBookmarkById(request, env, id) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    try {
        const result = await env.ban_dong_hanh_db.prepare(
            'DELETE FROM user_bookmarks WHERE id = ? AND user_id = ?'
        ).bind(parseInt(id), userId).run();

        if (result.changes === 0) {
            return json({ error: 'not_found' }, 404);
        }

        return json({ success: true });
    } catch (error) {
        console.error('[Data] deleteBookmarkById error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

/**
 * DELETE /api/data/bookmarks - Xóa bookmark theo type và item_id
 * Query params: ?type=story&item_id=abc123
 */
export async function deleteBookmark(request, env) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    const url = new URL(request.url);
    const bookmarkType = url.searchParams.get('type');
    const itemId = url.searchParams.get('item_id');

    if (!bookmarkType || !itemId) {
        return json({ error: 'type và item_id bắt buộc' }, 400);
    }

    try {
        const result = await env.ban_dong_hanh_db.prepare(
            'DELETE FROM user_bookmarks WHERE user_id = ? AND bookmark_type = ? AND item_id = ?'
        ).bind(userId, bookmarkType, itemId).run();

        if (result.changes === 0) {
            return json({ error: 'not_found' }, 404);
        }

        return json({ success: true });
    } catch (error) {
        console.error('[Data] deleteBookmark error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}
