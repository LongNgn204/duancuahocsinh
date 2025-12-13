// backend/workers/auth.js
// Chú thích: Simple username-based authentication cho học sinh
// Không cần password - chỉ username để dễ sử dụng

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

    if (trimmed.length < 3) {
        return { valid: false, error: 'Tên tài khoản phải có ít nhất 3 ký tự' };
    }

    if (trimmed.length > 30) {
        return { valid: false, error: 'Tên tài khoản không quá 30 ký tự' };
    }

    // Chỉ cho phép chữ cái, số, underscore, dấu gạch ngang
    if (!/^[a-zA-Z0-9_\-\u00C0-\u024F\u1E00-\u1EFF]+$/u.test(trimmed)) {
        return { valid: false, error: 'Tên tài khoản chỉ được chứa chữ cái, số, _ và -' };
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
 */
export async function handleRegister(request, env) {
    try {
        const body = await request.json();
        const { username } = body;

        // Validate username
        const validation = validateUsername(username);
        if (!validation.valid) {
            return createJsonResponse({ error: validation.error }, 400);
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

        // Create new user
        const result = await env.ban_dong_hanh_db.prepare(
            'INSERT INTO users (username) VALUES (?) RETURNING id, username, created_at'
        ).bind(trimmedUsername).first();

        // Create default settings
        await env.ban_dong_hanh_db.prepare(
            'INSERT INTO user_settings (user_id) VALUES (?)'
        ).bind(result.id).run();

        return createJsonResponse({
            success: true,
            user: {
                id: result.id,
                username: result.username,
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
 */
export async function handleLogin(request, env) {
    try {
        const body = await request.json();
        const { username } = body;

        // Validate username
        const validation = validateUsername(username);
        if (!validation.valid) {
            return createJsonResponse({ error: validation.error }, 400);
        }

        const trimmedUsername = username.trim();

        // Find user
        const user = await env.ban_dong_hanh_db.prepare(
            'SELECT id, username, created_at FROM users WHERE username = ?'
        ).bind(trimmedUsername).first();

        if (!user) {
            return createJsonResponse({
                error: 'user_not_found',
                message: `Không tìm thấy tài khoản "${trimmedUsername}"`,
                canRegister: true
            }, 404);
        }

        // Update last login
        await env.ban_dong_hanh_db.prepare(
            'UPDATE users SET last_login = datetime("now") WHERE id = ?'
        ).bind(user.id).run();

        return createJsonResponse({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                created_at: user.created_at
            }
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
            'SELECT id, username, created_at, last_login FROM users WHERE id = ?'
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
 */
function createJsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
}

// Export cho testing
export { validateUsername, generateUsernameSuggestions };
