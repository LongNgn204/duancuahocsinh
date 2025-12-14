// backend/workers/forum-api.js
// Chú thích: REST API cho diễn đàn ẩn danh với content moderation
// Tích hợp risk.js và sanitize.js để lọc nội dung không phù hợp

import { classifyRiskRules } from './risk.js';
import { sanitizeInput, hasInjection } from './sanitize.js';

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Extract userId từ request headers
 */
function getUserId(request) {
    const userId = request.headers.get('X-User-Id');
    if (!userId) return null;
    const parsed = parseInt(userId);
    return isNaN(parsed) ? null : parsed;
}

/**
 * Tạo JSON response
 */
function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
}

/**
 * Tạo hashed user ID cho hiển thị (ẩn danh nhưng nhất quán)
 */
function hashUserId(userId) {
    if (!userId) return null;
    // Simple hash cho display - chỉ dùng 6 ký tự đầu
    const hash = userId.toString(36) + Date.now().toString(36).slice(-4);
    return hash.slice(0, 8).toUpperCase();
}

/**
 * Kiểm tra và validate nội dung
 * @throws Error nếu nội dung không hợp lệ
 */
function validateContent(content, maxLength = 2000) {
    if (!content || typeof content !== 'string') {
        throw new Error('empty_content');
    }

    const trimmed = content.trim();
    if (trimmed.length === 0) {
        throw new Error('empty_content');
    }

    if (trimmed.length > maxLength) {
        throw new Error('content_too_long');
    }

    // Kiểm tra injection
    if (hasInjection(trimmed)) {
        throw new Error('content_blocked');
    }

    // Kiểm tra risk level
    const risk = classifyRiskRules(trimmed);
    if (risk === 'red') {
        throw new Error('content_sensitive');
    }

    return trimmed;
}

/**
 * Kiểm tra user có bị ban không
 */
async function isUserBanned(userId, env) {
    if (!userId) return false;

    const banned = await env.ban_dong_hanh_db.prepare(
        'SELECT id, banned_until FROM banned_users WHERE user_id = ?'
    ).bind(userId).first();

    if (!banned) return false;

    // Kiểm tra thời hạn ban
    if (banned.banned_until) {
        const banEnd = new Date(banned.banned_until);
        if (banEnd < new Date()) {
            // Đã hết hạn ban, xóa record
            await env.ban_dong_hanh_db.prepare(
                'DELETE FROM banned_users WHERE user_id = ?'
            ).bind(userId).run();
            return false;
        }
    }

    return true;
}

/**
 * Kiểm tra user có phải admin không
 */
async function isAdmin(userId, env) {
    if (!userId) return false;
    const user = await env.ban_dong_hanh_db.prepare(
        'SELECT is_admin FROM users WHERE id = ?'
    ).bind(userId).first();
    return user?.is_admin === 1;
}

// =============================================================================
// FORUM POSTS ENDPOINTS
// =============================================================================

/**
 * GET /api/forum/posts - Lấy danh sách bài viết
 * Query params: ?page=1&limit=20&tag=học_tập
 */
export async function getForumPosts(request, env) {
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
    const offset = (page - 1) * limit;
    const tag = url.searchParams.get('tag');

    try {
        let query = 'SELECT id, hashed_user_id, title, content, tags, upvotes, comments_count, created_at FROM forum_posts WHERE is_hidden = 0';
        const params = [];

        if (tag) {
            query += " AND tags LIKE ?";
            params.push(`%"${tag}"%`);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const result = await env.ban_dong_hanh_db.prepare(query).bind(...params).all();

        // Count total for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM forum_posts WHERE is_hidden = 0';
        if (tag) {
            countQuery += " AND tags LIKE ?";
        }
        const countResult = await env.ban_dong_hanh_db.prepare(countQuery)
            .bind(...(tag ? [`%"${tag}"%`] : []))
            .first();

        return json({
            items: result.results.map(post => ({
                ...post,
                content: post.content.length > 200 ? post.content.slice(0, 200) + '...' : post.content,
                tags: post.tags ? JSON.parse(post.tags) : []
            })),
            pagination: {
                page,
                limit,
                total: countResult.total,
                totalPages: Math.ceil(countResult.total / limit)
            }
        });
    } catch (error) {
        console.error('[Forum] getForumPosts error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

/**
 * GET /api/forum/post/:id - Lấy chi tiết bài viết với comments
 */
export async function getForumPost(request, env, id) {
    try {
        const post = await env.ban_dong_hanh_db.prepare(
            'SELECT id, hashed_user_id, title, content, tags, upvotes, comments_count, is_locked, created_at FROM forum_posts WHERE id = ? AND is_hidden = 0'
        ).bind(parseInt(id)).first();

        if (!post) {
            return json({ error: 'post_not_found' }, 404);
        }

        // Lấy comments
        const comments = await env.ban_dong_hanh_db.prepare(
            'SELECT id, hashed_user_id, content, created_at FROM forum_comments WHERE post_id = ? AND is_hidden = 0 ORDER BY created_at ASC'
        ).bind(parseInt(id)).all();

        return json({
            post: {
                ...post,
                tags: post.tags ? JSON.parse(post.tags) : []
            },
            comments: comments.results
        });
    } catch (error) {
        console.error('[Forum] getForumPost error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

/**
 * POST /api/forum/post - Tạo bài viết mới
 * Body: { title?: string, content: string, tags?: string[], anonymous?: boolean }
 */
export async function createForumPost(request, env) {
    const userId = getUserId(request);

    try {
        // Kiểm tra ban status
        if (userId && await isUserBanned(userId, env)) {
            return json({ error: 'user_banned', message: 'Tài khoản của bạn đã bị hạn chế đăng bài' }, 403);
        }

        const { title, content, tags, anonymous } = await request.json();

        // Validate content
        let validatedContent;
        try {
            validatedContent = validateContent(content, 5000);
        } catch (e) {
            if (e.message === 'content_sensitive') {
                return json({
                    error: 'content_sensitive',
                    message: 'Nội dung có dấu hiệu nhạy cảm. Nếu bạn đang gặp khó khăn, hãy liên hệ đường dây nóng: 1800 599 920'
                }, 400);
            }
            if (e.message === 'content_blocked') {
                return json({ error: 'content_blocked', message: 'Nội dung không được phép' }, 400);
            }
            return json({ error: e.message }, 400);
        }

        // Validate title nếu có
        let validatedTitle = null;
        if (title) {
            try {
                validatedTitle = validateContent(title, 200);
            } catch {
                return json({ error: 'invalid_title' }, 400);
            }
        }

        // Process tags
        const validTags = Array.isArray(tags) ? tags.slice(0, 5).map(t => t.trim()).filter(t => t.length > 0 && t.length < 30) : [];

        // Tạo hashed user ID
        const hashedId = anonymous ? null : hashUserId(userId);

        const result = await env.ban_dong_hanh_db.prepare(
            'INSERT INTO forum_posts (user_id, hashed_user_id, title, content, tags) VALUES (?, ?, ?, ?, ?) RETURNING id, hashed_user_id, title, content, tags, upvotes, comments_count, created_at'
        ).bind(
            anonymous ? null : userId,
            hashedId,
            validatedTitle,
            validatedContent,
            validTags.length > 0 ? JSON.stringify(validTags) : null
        ).first();

        return json({
            success: true,
            post: {
                ...result,
                tags: validTags
            }
        }, 201);
    } catch (error) {
        console.error('[Forum] createForumPost error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

/**
 * POST /api/forum/post/:id/comment - Thêm comment
 * Body: { content: string, anonymous?: boolean }
 */
export async function addComment(request, env, postId) {
    const userId = getUserId(request);

    try {
        // Kiểm tra ban status
        if (userId && await isUserBanned(userId, env)) {
            return json({ error: 'user_banned' }, 403);
        }

        // Kiểm tra post tồn tại và không bị khóa
        const post = await env.ban_dong_hanh_db.prepare(
            'SELECT id, is_locked FROM forum_posts WHERE id = ? AND is_hidden = 0'
        ).bind(parseInt(postId)).first();

        if (!post) {
            return json({ error: 'post_not_found' }, 404);
        }

        if (post.is_locked) {
            return json({ error: 'post_locked', message: 'Bài viết này đã bị khóa bình luận' }, 403);
        }

        const { content, anonymous } = await request.json();

        // Validate content
        let validatedContent;
        try {
            validatedContent = validateContent(content, 1000);
        } catch (e) {
            if (e.message === 'content_sensitive') {
                return json({
                    error: 'content_sensitive',
                    message: 'Nội dung có dấu hiệu nhạy cảm. Nếu bạn đang gặp khó khăn, hãy liên hệ đường dây nóng: 1800 599 920'
                }, 400);
            }
            return json({ error: e.message }, 400);
        }

        const hashedId = anonymous ? null : hashUserId(userId);

        const result = await env.ban_dong_hanh_db.prepare(
            'INSERT INTO forum_comments (post_id, user_id, hashed_user_id, content) VALUES (?, ?, ?, ?) RETURNING id, hashed_user_id, content, created_at'
        ).bind(parseInt(postId), anonymous ? null : userId, hashedId, validatedContent).first();

        // Update comments_count
        await env.ban_dong_hanh_db.prepare(
            'UPDATE forum_posts SET comments_count = comments_count + 1 WHERE id = ?'
        ).bind(parseInt(postId)).run();

        return json({ success: true, comment: result }, 201);
    } catch (error) {
        console.error('[Forum] addComment error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

/**
 * POST /api/forum/post/:id/upvote - Upvote bài viết
 */
export async function upvotePost(request, env, postId) {
    const userId = getUserId(request);
    if (!userId) {
        return json({ error: 'login_required', message: 'Cần đăng nhập để upvote' }, 401);
    }

    try {
        // Kiểm tra đã upvote chưa
        const existing = await env.ban_dong_hanh_db.prepare(
            'SELECT id FROM forum_upvotes WHERE post_id = ? AND user_id = ?'
        ).bind(parseInt(postId), userId).first();

        if (existing) {
            // Đã upvote, bỏ upvote
            await env.ban_dong_hanh_db.prepare(
                'DELETE FROM forum_upvotes WHERE post_id = ? AND user_id = ?'
            ).bind(parseInt(postId), userId).run();

            await env.ban_dong_hanh_db.prepare(
                'UPDATE forum_posts SET upvotes = upvotes - 1 WHERE id = ?'
            ).bind(parseInt(postId)).run();

            return json({ success: true, action: 'removed' });
        } else {
            // Thêm upvote
            await env.ban_dong_hanh_db.prepare(
                'INSERT INTO forum_upvotes (post_id, user_id) VALUES (?, ?)'
            ).bind(parseInt(postId), userId).run();

            await env.ban_dong_hanh_db.prepare(
                'UPDATE forum_posts SET upvotes = upvotes + 1 WHERE id = ?'
            ).bind(parseInt(postId)).run();

            return json({ success: true, action: 'added' });
        }
    } catch (error) {
        console.error('[Forum] upvotePost error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

// =============================================================================
// ADMIN ENDPOINTS
// =============================================================================

/**
 * DELETE /api/forum/post/:id - Xóa/ẩn bài viết (Admin)
 */
export async function deletePost(request, env, postId) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    try {
        // Kiểm tra quyền admin
        if (!await isAdmin(userId, env)) {
            return json({ error: 'forbidden' }, 403);
        }

        const { reason, permanent } = await request.json().catch(() => ({}));

        if (permanent) {
            // Xóa vĩnh viễn
            await env.ban_dong_hanh_db.prepare(
                'DELETE FROM forum_posts WHERE id = ?'
            ).bind(parseInt(postId)).run();
        } else {
            // Ẩn bài viết
            await env.ban_dong_hanh_db.prepare(
                'UPDATE forum_posts SET is_hidden = 1 WHERE id = ?'
            ).bind(parseInt(postId)).run();
        }

        // Log hành động
        await env.ban_dong_hanh_db.prepare(
            'INSERT INTO admin_logs (admin_user_id, action_type, target_type, target_id, reason) VALUES (?, ?, ?, ?, ?)'
        ).bind(userId, permanent ? 'delete_post' : 'hide_post', 'post', parseInt(postId), reason || null).run();

        return json({ success: true });
    } catch (error) {
        console.error('[Forum] deletePost error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

/**
 * DELETE /api/forum/comment/:id - Xóa/ẩn comment (Admin)
 */
export async function deleteComment(request, env, commentId) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    try {
        if (!await isAdmin(userId, env)) {
            return json({ error: 'forbidden' }, 403);
        }

        const { reason } = await request.json().catch(() => ({}));

        // Lấy post_id trước khi ẩn
        const comment = await env.ban_dong_hanh_db.prepare(
            'SELECT post_id FROM forum_comments WHERE id = ?'
        ).bind(parseInt(commentId)).first();

        if (!comment) {
            return json({ error: 'not_found' }, 404);
        }

        // Ẩn comment
        await env.ban_dong_hanh_db.prepare(
            'UPDATE forum_comments SET is_hidden = 1 WHERE id = ?'
        ).bind(parseInt(commentId)).run();

        // Update comments_count
        await env.ban_dong_hanh_db.prepare(
            'UPDATE forum_posts SET comments_count = comments_count - 1 WHERE id = ? AND comments_count > 0'
        ).bind(comment.post_id).run();

        // Log hành động
        await env.ban_dong_hanh_db.prepare(
            'INSERT INTO admin_logs (admin_user_id, action_type, target_type, target_id, reason) VALUES (?, ?, ?, ?, ?)'
        ).bind(userId, 'hide_comment', 'comment', parseInt(commentId), reason || null).run();

        return json({ success: true });
    } catch (error) {
        console.error('[Forum] deleteComment error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

/**
 * POST /api/forum/post/:id/lock - Khóa/mở khóa bài viết (Admin)
 */
export async function toggleLockPost(request, env, postId) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    try {
        if (!await isAdmin(userId, env)) {
            return json({ error: 'forbidden' }, 403);
        }

        // Toggle lock status
        const post = await env.ban_dong_hanh_db.prepare(
            'SELECT is_locked FROM forum_posts WHERE id = ?'
        ).bind(parseInt(postId)).first();

        if (!post) {
            return json({ error: 'not_found' }, 404);
        }

        const newStatus = post.is_locked ? 0 : 1;
        await env.ban_dong_hanh_db.prepare(
            'UPDATE forum_posts SET is_locked = ? WHERE id = ?'
        ).bind(newStatus, parseInt(postId)).run();

        // Log hành động
        await env.ban_dong_hanh_db.prepare(
            'INSERT INTO admin_logs (admin_user_id, action_type, target_type, target_id) VALUES (?, ?, ?, ?)'
        ).bind(userId, newStatus ? 'lock_post' : 'unlock_post', 'post', parseInt(postId)).run();

        return json({ success: true, is_locked: newStatus === 1 });
    } catch (error) {
        console.error('[Forum] toggleLockPost error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

/**
 * POST /api/admin/ban-user - Ban user (Admin)
 * Body: { user_id: number, reason?: string, duration_days?: number }
 */
export async function banUser(request, env) {
    const adminId = getUserId(request);
    if (!adminId) return json({ error: 'not_authenticated' }, 401);

    try {
        if (!await isAdmin(adminId, env)) {
            return json({ error: 'forbidden' }, 403);
        }

        const { user_id, reason, duration_days } = await request.json();

        if (!user_id) {
            return json({ error: 'user_id bắt buộc' }, 400);
        }

        // Tính ngày hết hạn ban
        let bannedUntil = null;
        if (duration_days && duration_days > 0) {
            const date = new Date();
            date.setDate(date.getDate() + duration_days);
            bannedUntil = date.toISOString();
        }

        // Thêm hoặc update ban record
        await env.ban_dong_hanh_db.prepare(
            'INSERT OR REPLACE INTO banned_users (user_id, reason, banned_by, banned_until) VALUES (?, ?, ?, ?)'
        ).bind(parseInt(user_id), reason || null, adminId, bannedUntil).run();

        // Log hành động
        await env.ban_dong_hanh_db.prepare(
            'INSERT INTO admin_logs (admin_user_id, action_type, target_type, target_id, reason) VALUES (?, ?, ?, ?, ?)'
        ).bind(adminId, 'ban_user', 'user', parseInt(user_id), reason || null).run();

        return json({ success: true, banned_until: bannedUntil });
    } catch (error) {
        console.error('[Forum] banUser error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

/**
 * DELETE /api/admin/ban-user/:id - Unban user (Admin)
 */
export async function unbanUser(request, env, userId) {
    const adminId = getUserId(request);
    if (!adminId) return json({ error: 'not_authenticated' }, 401);

    try {
        if (!await isAdmin(adminId, env)) {
            return json({ error: 'forbidden' }, 403);
        }

        await env.ban_dong_hanh_db.prepare(
            'DELETE FROM banned_users WHERE user_id = ?'
        ).bind(parseInt(userId)).run();

        // Log hành động
        await env.ban_dong_hanh_db.prepare(
            'INSERT INTO admin_logs (admin_user_id, action_type, target_type, target_id) VALUES (?, ?, ?, ?)'
        ).bind(adminId, 'unban_user', 'user', parseInt(userId)).run();

        return json({ success: true });
    } catch (error) {
        console.error('[Forum] unbanUser error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

/**
 * GET /api/admin/logs - Lấy lịch sử admin actions
 */
export async function getAdminLogs(request, env) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    try {
        if (!await isAdmin(userId, env)) {
            return json({ error: 'forbidden' }, 403);
        }

        const url = new URL(request.url);
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);

        const result = await env.ban_dong_hanh_db.prepare(
            'SELECT al.*, u.username as admin_username FROM admin_logs al LEFT JOIN users u ON al.admin_user_id = u.id ORDER BY al.created_at DESC LIMIT ?'
        ).bind(limit).all();

        return json({ items: result.results });
    } catch (error) {
        console.error('[Forum] getAdminLogs error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

/**
 * GET /api/admin/banned-users - Lấy danh sách user bị ban
 */
export async function getBannedUsers(request, env) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    try {
        if (!await isAdmin(userId, env)) {
            return json({ error: 'forbidden' }, 403);
        }

        const result = await env.ban_dong_hanh_db.prepare(
            'SELECT bu.*, u.username FROM banned_users bu LEFT JOIN users u ON bu.user_id = u.id ORDER BY bu.created_at DESC'
        ).all();

        return json({ items: result.results });
    } catch (error) {
        console.error('[Forum] getBannedUsers error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

/**
 * GET /api/admin/forum-stats - Thống kê forum cho admin
 */
export async function getForumStats(request, env) {
    const userId = getUserId(request);
    if (!userId) return json({ error: 'not_authenticated' }, 401);

    try {
        if (!await isAdmin(userId, env)) {
            return json({ error: 'forbidden' }, 403);
        }

        const [postsCount, commentsCount, bannedCount, hiddenPosts] = await Promise.all([
            env.ban_dong_hanh_db.prepare('SELECT COUNT(*) as count FROM forum_posts').first(),
            env.ban_dong_hanh_db.prepare('SELECT COUNT(*) as count FROM forum_comments').first(),
            env.ban_dong_hanh_db.prepare('SELECT COUNT(*) as count FROM banned_users').first(),
            env.ban_dong_hanh_db.prepare('SELECT COUNT(*) as count FROM forum_posts WHERE is_hidden = 1').first()
        ]);

        return json({
            total_posts: postsCount.count,
            total_comments: commentsCount.count,
            banned_users: bannedCount.count,
            hidden_posts: hiddenPosts.count
        });
    } catch (error) {
        console.error('[Forum] getForumStats error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}

/**
 * POST /api/forum/report - Báo cáo bài viết hoặc bình luận
 * Body: { target_type: 'post'|'comment', target_id: number, reason: string, details?: string }
 */
export async function reportContent(request, env) {
    const userId = getUserId(request); // Có thể null nếu khách

    try {
        const { target_type, target_id, reason, details } = await request.json();

        // Validate
        if (!target_type || !['post', 'comment'].includes(target_type)) {
            return json({ error: 'invalid_target_type' }, 400);
        }

        if (!target_id || typeof target_id !== 'number') {
            return json({ error: 'invalid_target_id' }, 400);
        }

        const validReasons = ['spam', 'harassment', 'inappropriate', 'misinformation', 'other'];
        if (!reason || !validReasons.includes(reason)) {
            return json({ error: 'invalid_reason' }, 400);
        }

        // Kiểm tra target có tồn tại không
        const table = target_type === 'post' ? 'forum_posts' : 'forum_comments';
        const target = await env.ban_dong_hanh_db.prepare(
            `SELECT id FROM ${table} WHERE id = ?`
        ).bind(target_id).first();

        if (!target) {
            return json({ error: 'target_not_found' }, 404);
        }

        // Kiểm tra đã báo cáo chưa (tránh spam report)
        const existingReport = await env.ban_dong_hanh_db.prepare(
            'SELECT id FROM forum_reports WHERE target_type = ? AND target_id = ? AND reporter_user_id = ? AND status = ?'
        ).bind(target_type, target_id, userId || null, 'pending').first();

        if (existingReport) {
            return json({ 
                error: 'already_reported', 
                message: 'Bạn đã báo cáo nội dung này rồi. Admin sẽ xem xét sớm nhất.' 
            }, 400);
        }

        // Lưu báo cáo
        const result = await env.ban_dong_hanh_db.prepare(
            'INSERT INTO forum_reports (target_type, target_id, reporter_user_id, reason, details, status) VALUES (?, ?, ?, ?, ?, ?) RETURNING id, created_at'
        ).bind(
            target_type,
            target_id,
            userId || null,
            reason,
            details ? details.slice(0, 500) : null, // Giới hạn 500 ký tự
            'pending'
        ).first();

        console.log('[Forum] Content reported:', { target_type, target_id, reason, reporter: userId || 'guest' });

        return json({
            success: true,
            report_id: result.id,
            message: 'Cảm ơn bạn đã báo cáo. Admin sẽ xem xét nội dung này sớm nhất.'
        }, 201);
    } catch (error) {
        console.error('[Forum] reportContent error:', error.message);
        return json({ error: 'server_error' }, 500);
    }
}