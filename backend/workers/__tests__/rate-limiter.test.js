// backend/workers/__tests__/rate-limiter.test.js
// Unit tests cho rate limiter
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkRateLimit, rateLimitMiddleware } from '../rate-limiter.js';

describe('rate-limiter', () => {
  const createMockEnv = () => ({
    ban_dong_hanh_db: {
      prepare: vi.fn((query) => ({
        bind: vi.fn((...args) => ({
          first: vi.fn(async () => null),
          run: vi.fn(async () => ({ success: true })),
        })),
      })),
    },
  });

  const createMockRequest = (userId = null, ip = '1.2.3.4') => {
    const headers = new Headers();
    if (userId) headers.set('X-User-Id', userId);
    headers.set('CF-Connecting-IP', ip);
    
    return new Request('https://example.com/api/test', {
      method: 'POST',
      headers,
    });
  };

  describe('checkRateLimit', () => {
    it('should allow request when no previous record', async () => {
      const env = createMockEnv();
      const request = createMockRequest('123');
      
      const result = await checkRateLimit(request, env, '/api/test');
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(0);
    });

    it('should use user ID as key when available', async () => {
      const env = createMockEnv();
      const request = createMockRequest('123');
      
      await checkRateLimit(request, env, '/api/test');
      
      // Check that prepare was called with user key
      const prepareCall = env.ban_dong_hanh_db.prepare.mock.calls[0][0];
      expect(prepareCall).toContain('user:123');
    });

    it('should fallback to IP when no user ID', async () => {
      const env = createMockEnv();
      const request = createMockRequest(null, '1.2.3.4');
      
      await checkRateLimit(request, env, '/api/test');
      
      const prepareCall = env.ban_dong_hanh_db.prepare.mock.calls[0][0];
      expect(prepareCall).toContain('ip:1.2.3.4');
    });

    it('should return different limits for AI chat endpoint', async () => {
      const env = createMockEnv();
      const request = createMockRequest('123');
      
      // Mock existing record with count at limit
      env.ban_dong_hanh_db.prepare = vi.fn((query) => ({
        bind: vi.fn((...args) => ({
          first: vi.fn(async () => ({
            count: 30, // AI chat limit
            reset_at: Date.now() + 60000,
          })),
          run: vi.fn(async () => ({ success: true })),
        })),
      }));
      
      const result = await checkRateLimit(request, env, '/api/chat');
      
      // Should be at limit for AI chat
      expect(result.allowed).toBe(false);
    });
  });

  describe('rateLimitMiddleware', () => {
    it('should return null when limit not exceeded', async () => {
      const env = createMockEnv();
      const request = createMockRequest('123');
      
      const result = await rateLimitMiddleware(request, env, '/api/test');
      
      expect(result).toBe(null);
    });

    it('should return 429 response when limit exceeded', async () => {
      const env = createMockEnv();
      
      // Mock record at limit
      env.ban_dong_hanh_db.prepare = vi.fn((query) => ({
        bind: vi.fn((...args) => ({
          first: vi.fn(async () => ({
            count: 100, // At limit
            reset_at: Date.now() + 60000,
          })),
          run: vi.fn(async () => ({ success: true })),
        })),
      }));
      
      const request = createMockRequest('123');
      const result = await rateLimitMiddleware(request, env, '/api/test');
      
      expect(result).toBeInstanceOf(Response);
      expect(result.status).toBe(429);
      
      const body = await result.json();
      expect(body.error).toBe('rate_limit_exceeded');
      expect(result.headers.get('X-RateLimit-Limit')).toBeTruthy();
      expect(result.headers.get('Retry-After')).toBeTruthy();
    });

    it('should fail open on database error', async () => {
      const env = createMockEnv();
      env.ban_dong_hanh_db.prepare = vi.fn(() => {
        throw new Error('DB error');
      });
      
      const request = createMockRequest('123');
      const result = await rateLimitMiddleware(request, env, '/api/test');
      
      // Should allow request (fail open)
      expect(result).toBe(null);
    });
  });
});

