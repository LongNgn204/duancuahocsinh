// backend/workers/rate-limiter.js
// Chú thích: Rate limiting cho Cloudflare Workers
// Sử dụng D1 database để lưu rate limit state (hoặc có thể dùng KV nếu cần)

/**
 * Rate limit configuration
 */
const RATE_LIMITS = {
  // Per-user rate limits
  user: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  },
  
  // Per-IP rate limits (fallback khi không có user_id)
  ip: {
    windowMs: 60 * 1000,
    maxRequests: 200, // 200 requests per minute per IP
  },
  
  // AI chat endpoint có limit riêng (tốn token)
  aiChat: {
    windowMs: 60 * 1000,
    maxRequests: 30, // 30 requests per minute
  },
};

/**
 * Get rate limit key từ request
 * @param {Request} request 
 * @returns {string} Rate limit key
 */
function getRateLimitKey(request, endpoint = '') {
  const userId = request.headers.get('X-User-Id');
  const ip = request.headers.get('CF-Connecting-IP') || 
             request.headers.get('X-Forwarded-For')?.split(',')[0] || 
             'unknown';
  
  // Nếu có user_id, dùng user_id làm key
  if (userId) {
    return `user:${userId}:${endpoint}`;
  }
  
  // Fallback về IP
  return `ip:${ip}:${endpoint}`;
}

/**
 * Get rate limit config cho endpoint
 * @param {string} endpoint - Endpoint path
 * @returns {Object} Rate limit config
 */
function getRateLimitConfig(endpoint) {
  // AI chat có limit riêng
  if (endpoint.includes('/api/chat') || endpoint === '/') {
    return RATE_LIMITS.aiChat;
  }
  
  // Default: user limit
  return RATE_LIMITS.user;
}

/**
 * Check rate limit
 * @param {Request} request 
 * @param {Object} env - Cloudflare env với D1 binding
 * @param {string} endpoint - Endpoint path
 * @returns {Promise<{allowed: boolean, remaining: number, resetAt: number}>}
 */
export async function checkRateLimit(request, env, endpoint = '') {
  const key = getRateLimitKey(request, endpoint);
  const config = getRateLimitConfig(endpoint);
  const now = Date.now();
  const windowStart = now - config.windowMs;

  try {
    // Lấy current count từ D1
    // Table: rate_limits (key TEXT PRIMARY KEY, count INTEGER, reset_at INTEGER)
    const result = await env.ban_dong_hanh_db.prepare(
      'SELECT count, reset_at FROM rate_limits WHERE key = ?'
    ).bind(key).first();

    if (!result) {
      // Chưa có record, tạo mới
      await env.ban_dong_hanh_db.prepare(
        'INSERT INTO rate_limits (key, count, reset_at) VALUES (?, 1, ?)'
      ).bind(key, now + config.windowMs).run();
      
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: now + config.windowMs,
      };
    }

    // Check nếu đã hết window, reset
    if (result.reset_at < now) {
      await env.ban_dong_hanh_db.prepare(
        'UPDATE rate_limits SET count = 1, reset_at = ? WHERE key = ?'
      ).bind(now + config.windowMs, key).run();
      
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: now + config.windowMs,
      };
    }

    // Check nếu vượt limit
    if (result.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: result.reset_at,
      };
    }

    // Increment count
    await env.ban_dong_hanh_db.prepare(
      'UPDATE rate_limits SET count = count + 1 WHERE key = ?'
    ).bind(key).run();

    return {
      allowed: true,
      remaining: config.maxRequests - result.count - 1,
      resetAt: result.reset_at,
    };

  } catch (error) {
    // Nếu có lỗi DB, cho phép request (fail open)
    console.error('[RateLimit] Error:', error.message);
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: now + config.windowMs,
    };
  }
}

/**
 * Middleware function để check rate limit và trả về response nếu vượt
 * @param {Request} request 
 * @param {Object} env 
 * @param {string} endpoint 
 * @returns {Promise<Response|null>} Response nếu vượt limit, null nếu OK
 */
export async function rateLimitMiddleware(request, env, endpoint = '') {
  const limit = await checkRateLimit(request, env, endpoint);
  
  if (!limit.allowed) {
    return new Response(JSON.stringify({
      error: 'rate_limit_exceeded',
      message: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.',
      resetAt: new Date(limit.resetAt).toISOString(),
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': String(getRateLimitConfig(endpoint).maxRequests),
        'X-RateLimit-Remaining': String(limit.remaining),
        'X-RateLimit-Reset': String(limit.resetAt),
        'Retry-After': String(Math.ceil((limit.resetAt - Date.now()) / 1000)),
      },
    });
  }
  
  return null;
}

