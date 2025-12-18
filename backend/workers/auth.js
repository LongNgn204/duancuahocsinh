// backend/workers/auth.js
// Chú thích: Authentication với username + password
// Password được hash với SHA-256 + salt

/**
 * Hash password với SHA-256 (Cloudflare Workers compatible)
 * @param {string} password - Raw password
 * @param {string} salt - Salt (optional, sẽ generate nếu không có)
 * @returns {Promise<{hash: string, salt: string}>}
 */
async function hashPassword(password, salt = null) {
    // Generate salt nếu không có
    if (!salt) {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        salt = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Hash password với salt
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return { hash, salt };
}

/**
 * Verify password
 * @param {string} password - Raw password từ user
 * @param {string} storedHash - Hash đã lưu
 * @param {string} salt - Salt đã lưu
 * @returns {Promise<boolean>}
 */
async function verifyPassword(password, storedHash, salt) {
    const { hash } = await hashPassword(password, salt);
    return hash === storedHash;
}

/**
 * Validate password
 * @param {string} password
 * @returns {Object} { valid: boolean, error?: string }
 */
function validatePassword(password) {
    if (!password || typeof password !== 'string') {
        return { valid: false, error: 'Mật khẩu không được để trống' };
    }

    if (password.length < 4) {
        return { valid: false, error: 'Mật khẩu phải có ít nhất 4 ký tự' };
    }

    if (password.length > 100) {
        return { valid: false, error: 'Mật khẩu không quá 100 ký tự' };
    }

    return { valid: true };
}

/**
 * Kiểm tra username hợp lệ
 * @param {string} username
 * @returns {Object} { valid: boolean, error?: string }
 */
function validateUsername(username) {
    if (!username || typeof username !== 'string') {
        return { valid: false, error: 'Tên tài khoản không được để trống' };
    }

    const trimmed = username.trim();

    if (trimmed.length < 2) {
        return { valid: false, error: 'Tên tài khoản phải có ít nhất 2 ký tự' };
    }

    if (trimmed.length > 50) {
        return { valid: false, error: 'Tên tài khoản không quá 50 ký tự' };
    }

    // Cho phép chữ cái (bao gồm tiếng Việt), số, dấu cách, underscore, dấu gạch ngang
    // Chấp nhận hầu hết ký tự Unicode phổ biến
    if (/[<>"';&|\\]/.test(trimmed)) {
        return { valid: false, error: 'Tên tài khoản không được chứa ký tự đặc biệt < > " \' ; & | \\' };
    }

    return { valid: true };
}

/**
 * Sinh gợi ý tên thay thế khi bị trùng
 * @param {string} username
 * @returns {string[]} Danh sách gợi ý
 */
function generateUsernameSuggestions(username) {
    const suggestions = [];
    const now = Date.now().toString().slice(-4);

    suggestions.push(`${username}${now}`);
    suggestions.push(`${username}_${Math.floor(Math.random() * 100)}`);
    suggestions.push(`${username}${new Date().getFullYear()}`);

    return suggestions;
}

/**
 * Handler đăng ký tài khoản mới
 * POST /api/auth/register
 * Body: { username, password }
 */
export async function handleRegister(request, env) {
    try {
        const body = await request.json();
        const { username, password, display_name } = body;

        // Validate username
        const usernameValidation = validateUsername(username);
        if (!usernameValidation.valid) {
            return createJsonResponse({ error: usernameValidation.error }, 400);
        }

        // Validate password
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return createJsonResponse({ error: passwordValidation.error }, 400);
        }

        const trimmedUsername = username.trim();

        // Check if username exists
        const existing = await env.ban_dong_hanh_db.prepare(
            'SELECT id FROM users WHERE username = ?'
        ).bind(trimmedUsername).first();

        if (existing) {
            const suggestions = generateUsernameSuggestions(trimmedUsername);
            return createJsonResponse({
                error: 'username_taken',
                message: `Tên "${trimmedUsername}" đã được sử dụng`,
                suggestions
            }, 409);
        }

        // Hash password
        const { hash, salt } = await hashPassword(password);

        // Create new user với password_hash, password_salt và display_name
        // Nếu không có display_name, dùng username làm mặc định
        const finalDisplayName = display_name && display_name.trim() ? display_name.trim() : trimmedUsername;

        const result = await env.ban_dong_hanh_db.prepare(
            'INSERT INTO users (username, password_hash, password_salt, display_name) VALUES (?, ?, ?, ?) RETURNING id, username, display_name, created_at'
        ).bind(trimmedUsername, hash, salt, finalDisplayName).first();

        // Create default settings
        await env.ban_dong_hanh_db.prepare(
            'INSERT INTO user_settings (user_id) VALUES (?)'
        ).bind(result.id).run();

        return createJsonResponse({
            success: true,
            user: {
                id: result.id,
                username: result.username,
                display_name: result.display_name,
                created_at: result.created_at
            }
        }, 201);

    } catch (error) {
        console.error('[Auth] Register error:', error.message);
        return createJsonResponse({ error: 'server_error', message: error.message }, 500);
    }
}

/**
 * Handler đăng nhập
 * POST /api/auth/login
 * Body: { username, password }
 */
export async function handleLogin(request, env) {
    try {
        const body = await request.json();
        const { username, password } = body;

        // Validate username
        const validation = validateUsername(username);
        if (!validation.valid) {
            return createJsonResponse({ error: validation.error }, 400);
        }

        const trimmedUsername = username.trim();

        // Find user với password_hash và password_salt
        const user = await env.ban_dong_hanh_db.prepare(
            'SELECT id, username, display_name, created_at, password_hash, password_salt FROM users WHERE username = ?'
        ).bind(trimmedUsername).first();

        if (!user) {
            return createJsonResponse({
                error: 'user_not_found',
                message: `Không tìm thấy tài khoản "${trimmedUsername}"`,
                canRegister: true
            }, 404);
        }

        // Chú thích: Hỗ trợ legacy users (chưa có password)
        // Nếu user chưa set password → yêu cầu set password
        if (!user.password_hash || !user.password_salt) {
            // Legacy user - yêu cầu set password
            if (!password) {
                return createJsonResponse({
                    error: 'password_required',
                    message: 'Tài khoản này cần đặt mật khẩu. Vui lòng nhập mật khẩu mới.',
                    requireSetPassword: true
                }, 400);
            }

            // Validate và set password mới cho legacy user
            const passwordValidation = validatePassword(password);
            if (!passwordValidation.valid) {
                return createJsonResponse({ error: passwordValidation.error }, 400);
            }

            const { hash, salt } = await hashPassword(password);
            await env.ban_dong_hanh_db.prepare(
                'UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?'
            ).bind(hash, salt, user.id).run();

            console.log('[Auth] Set password for legacy user:', user.id);
        } else {
            // Normal login - verify password
            if (!password) {
                return createJsonResponse({
                    error: 'password_required',
                    message: 'Vui lòng nhập mật khẩu'
                }, 400);
            }

            const isValid = await verifyPassword(password, user.password_hash, user.password_salt);
            if (!isValid) {
                return createJsonResponse({
                    error: 'invalid_password',
                    message: 'Mật khẩu không chính xác'
                }, 401);
            }
        }

        // Update last login
        try {
            const updateResult = await env.ban_dong_hanh_db.prepare(
                "UPDATE users SET last_login = datetime('now') WHERE id = ?"
            ).bind(user.id).run();

            console.log('[Auth] UPDATE executed - changes:', updateResult.changes, 'success:', updateResult.success);

            if (updateResult.changes === 0) {
                console.warn('[Auth] WARNING: UPDATE affected 0 rows for user', user.id);
            }
        } catch (updateError) {
            console.error('[Auth] UPDATE error:', updateError.message);
            // Continue anyway - không fail login nếu update lỗi
        }

        // Get updated user with last_login
        const updatedUser = await env.ban_dong_hanh_db.prepare(
            'SELECT id, username, display_name, created_at, COALESCE(last_login, NULL) as last_login FROM users WHERE id = ?'
        ).bind(user.id).first();

        console.log('[Auth] SELECT result:', {
            id: updatedUser?.id,
            username: updatedUser?.username,
            last_login: updatedUser?.last_login,
            has_last_login: 'last_login' in (updatedUser || {})
        });

        // Build response
        const responseUser = {
            id: updatedUser.id,
            username: updatedUser.username,
            display_name: updatedUser.display_name || updatedUser.username,
            created_at: updatedUser.created_at,
        };

        if ('last_login' in updatedUser) {
            responseUser.last_login = updatedUser.last_login;
        } else {
            const lastLoginCheck = await env.ban_dong_hanh_db.prepare(
                'SELECT last_login FROM users WHERE id = ?'
            ).bind(user.id).first();
            responseUser.last_login = lastLoginCheck?.last_login || null;
        }

        console.log('[Auth] Final response user:', responseUser);

        return createJsonResponse({
            success: true,
            user: responseUser
        });

    } catch (error) {
        console.error('[Auth] Login error:', error.message);
        return createJsonResponse({ error: 'server_error', message: error.message }, 500);
    }
}

/**
 * Handler kiểm tra username availability
 * GET /api/auth/check?username=xxx
 */
export async function handleCheckUsername(request, env) {
    try {
        const url = new URL(request.url);
        const username = url.searchParams.get('username');

        const validation = validateUsername(username);
        if (!validation.valid) {
            return createJsonResponse({ available: false, error: validation.error });
        }

        const existing = await env.ban_dong_hanh_db.prepare(
            'SELECT id FROM users WHERE username = ?'
        ).bind(username.trim()).first();

        return createJsonResponse({
            available: !existing,
            username: username.trim()
        });

    } catch (error) {
        console.error('[Auth] Check error:', error.message);
        return createJsonResponse({ error: 'server_error' }, 500);
    }
}

/**
 * Handler lấy thông tin user
 * GET /api/auth/me
 * Header: X-User-Id: <userId>
 */
export async function handleGetMe(request, env) {
    try {
        const userId = request.headers.get('X-User-Id');

        if (!userId) {
            return createJsonResponse({ error: 'not_authenticated' }, 401);
        }

        const user = await env.ban_dong_hanh_db.prepare(
            'SELECT id, username, display_name, created_at, last_login FROM users WHERE id = ?'
        ).bind(parseInt(userId)).first();

        if (!user) {
            return createJsonResponse({ error: 'user_not_found' }, 404);
        }

        // Get settings
        const settings = await env.ban_dong_hanh_db.prepare(
            'SELECT theme, notifications, sound, font_size FROM user_settings WHERE user_id = ?'
        ).bind(user.id).first();

        return createJsonResponse({
            user: { ...user, settings: settings || {} }
        });

    } catch (error) {
        console.error('[Auth] GetMe error:', error.message);
        return createJsonResponse({ error: 'server_error' }, 500);
    }
}

/**
 * Helper tạo JSON response
 * Note: CORS headers sẽ được thêm bởi router.js wrapResponse
 */
function createJsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
}

/**
 * Handler xóa tài khoản và tất cả dữ liệu
 * DELETE /api/auth/account
 * Header: X-User-Id: <userId>
 */
export async function handleDeleteAccount(request, env) {
    try {
        const userId = request.headers.get('X-User-Id');
        if (!userId) {
            return createJsonResponse({ error: 'not_authenticated' }, 401);
        }

        const userIdInt = parseInt(userId);
        if (isNaN(userIdInt)) {
            return createJsonResponse({ error: 'invalid_user_id' }, 400);
        }

        // Xóa tất cả dữ liệu liên quan (cascade delete)
        // Lưu ý: SQLite không hỗ trợ CASCADE DELETE, phải xóa thủ công
        const tables = [
            'gratitude',
            'journal',
            'focus_sessions',
            'breathing_sessions',
            'sleep_logs',
            'achievements',
            'game_scores',
            'user_stats',
            'notification_settings',
            'user_settings',
            'random_cards_history',
            // Forum data
            'forum_upvotes',
            'forum_comments',
            'forum_posts',
            // SOS logs - chỉ xóa metadata, giữ hashed_user_id để thống kê
        ];

        // Xóa dữ liệu từ các bảng
        for (const table of tables) {
            try {
                await env.ban_dong_hanh_db.prepare(
                    `DELETE FROM ${table} WHERE user_id = ?`
                ).bind(userIdInt).run();
            } catch (e) {
                console.warn(`[DeleteAccount] Failed to delete from ${table}:`, e.message);
            }
        }

        // Xóa user
        await env.ban_dong_hanh_db.prepare(
            'DELETE FROM users WHERE id = ?'
        ).bind(userIdInt).run();

        return createJsonResponse({
            success: true,
            message: 'Tài khoản và tất cả dữ liệu đã được xóa thành công'
        });

    } catch (error) {
        console.error('[Auth] DeleteAccount error:', error.message);
        return createJsonResponse({ error: 'server_error', message: error.message }, 500);
    }
}

/**
 * Admin reset password for user
 * POST /api/admin/users/:id/reset-password
 */
export async function adminResetPassword(request, env, userId) {
    // Note: Caller (router) must verify admin token BEFORE calling this
    try {
        const body = await request.json();
        const { newPassword } = body;

        if (!newPassword || newPassword.length < 4) {
            return createJsonResponse({ error: 'invalid_password', message: 'Mật khẩu phải từ 4 ký tự' }, 400);
        }

        // Check if user exists
        const user = await env.ban_dong_hanh_db.prepare(
            'SELECT id FROM users WHERE id = ?'
        ).bind(userId).first();

        if (!user) {
            return createJsonResponse({ error: 'user_not_found' }, 404);
        }

        // Hash new password
        const { hash, salt } = await hashPassword(newPassword);

        // Update DB
        await env.ban_dong_hanh_db.prepare(
            'UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?'
        ).bind(hash, salt, userId).run();

        return createJsonResponse({ success: true, message: 'Đã đặt lại mật khẩu thành công' });

    } catch (error) {
        console.error('[Auth] AdminResetPassword error:', error.message);
        return createJsonResponse({ error: 'server_error', message: error.message }, 500);
    }
}

// Export cho testing
export { validateUsername, generateUsernameSuggestions };
/**
 * Handler cập nhật thông tin profile (display_name)
 * PUT /api/auth/profile
 * Headers: X-User-Id
 * Body: { display_name }
 */
export async function handleUpdateProfile(request, env) {
    try {
        // Get user ID from header
        const userId = request.headers.get('X-User-Id');
        if (!userId) {
            return createJsonResponse({ error: 'unauthorized', message: 'Vui lòng đăng nhập' }, 401);
        }

        const body = await request.json();
        const { display_name } = body;

        // Validate display_name
        if (!display_name || typeof display_name !== 'string') {
            return createJsonResponse({ error: 'invalid_input', message: 'Tên hiển thị không hợp lệ' }, 400);
        }

        const trimmedName = display_name.trim();
        if (trimmedName.length < 1 || trimmedName.length > 50) {
            return createJsonResponse({ error: 'invalid_length', message: 'Tên hiển thị phải từ 1-50 ký tự' }, 400);
        }

        // Update display_name in database
        const result = await env.ban_dong_hanh_db.prepare(
            'UPDATE users SET display_name = ? WHERE id = ? RETURNING id, username, display_name, created_at'
        ).bind(trimmedName, userId).first();

        if (!result) {
            return createJsonResponse({ error: 'user_not_found', message: 'Không tìm thấy người dùng' }, 404);
        }

        return createJsonResponse({
            success: true,
            user: {
                id: result.id,
                username: result.username,
                display_name: result.display_name,
                created_at: result.created_at
            },
            message: 'Cập nhật tên hiển thị thành công'
        }, 200);

    } catch (error) {
        console.error('[Auth] Update profile error:', error.message);
        return createJsonResponse({ error: 'server_error', message: error.message }, 500);
    }
}
