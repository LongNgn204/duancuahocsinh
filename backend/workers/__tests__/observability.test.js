// backend/workers/__tests__/observability.test.js
// Unit tests cho observability module
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateTraceId,
  log,
  logRequest,
  logResponse,
  logModelCall,
  logError,
  createTraceContext,
  addTraceHeader,
} from '../observability.js';

describe('observability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateTraceId', () => {
    it('should generate unique trace IDs', () => {
      const id1 = generateTraceId();
      const id2 = generateTraceId();
      
      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^\d+-[a-z0-9]+$/);
    });
  });

  describe('log', () => {
    it('should create structured log entry', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const result = log('info', 'test message', { key: 'value' });
      
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('level', 'info');
      expect(result).toHaveProperty('message', 'test message');
      expect(result).toHaveProperty('key', 'value');
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should log errors with error level', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      log('error', 'error message', { error: 'test' });
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    it('should redact PII in logs', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      log('info', 'My phone is 0912345678', { email: 'test@example.com' });
      
      const callArgs = consoleSpy.mock.calls[0][0];
      const logEntry = JSON.parse(callArgs);
      
      // PII should be redacted
      expect(logEntry.message).not.toContain('0912345678');
      expect(logEntry.email).not.toContain('test@example.com');
      
      consoleSpy.mockRestore();
    });
  });

  describe('logRequest', () => {
    it('should log request with trace context', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const request = new Request('https://example.com/api/test', {
        method: 'POST',
        headers: {
          'X-User-Id': '123',
          'User-Agent': 'test-agent',
        },
      });
      
      logRequest(request, 'trace-123');
      
      expect(consoleSpy).toHaveBeenCalled();
      const callArgs = consoleSpy.mock.calls[0][0];
      const logEntry = JSON.parse(callArgs);
      
      expect(logEntry).toHaveProperty('trace_id', 'trace-123');
      expect(logEntry).toHaveProperty('method', 'POST');
      expect(logEntry).toHaveProperty('path', '/api/test');
      expect(logEntry).toHaveProperty('user_id', '123');
      
      consoleSpy.mockRestore();
    });
  });

  describe('logResponse', () => {
    it('should log response with metrics', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      logResponse('trace-123', 200, 150, { tokens: 100 });
      
      expect(consoleSpy).toHaveBeenCalled();
      const callArgs = consoleSpy.mock.calls[0][0];
      const logEntry = JSON.parse(callArgs);
      
      expect(logEntry).toHaveProperty('trace_id', 'trace-123');
      expect(logEntry).toHaveProperty('status', 200);
      expect(logEntry).toHaveProperty('latency_ms', 150);
      expect(logEntry).toHaveProperty('tokens', 100);
      
      consoleSpy.mockRestore();
    });

    it('should use error level for 5xx status', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      logResponse('trace-123', 500, 200);
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('logModelCall', () => {
    it('should log model call with tokens and cost', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      logModelCall('trace-123', 'llama-3.1-8b', '3.1', 100, 50, 0.000075, 200);
      
      expect(consoleSpy).toHaveBeenCalled();
      const callArgs = consoleSpy.mock.calls[0][0];
      const logEntry = JSON.parse(callArgs);
      
      expect(logEntry).toHaveProperty('trace_id', 'trace-123');
      expect(logEntry).toHaveProperty('model_name', 'llama-3.1-8b');
      expect(logEntry).toHaveProperty('model_version', '3.1');
      expect(logEntry).toHaveProperty('tokens_in', 100);
      expect(logEntry).toHaveProperty('tokens_out', 50);
      expect(logEntry).toHaveProperty('tokens_total', 150);
      expect(logEntry).toHaveProperty('cost_usd', 0.000075);
      expect(logEntry).toHaveProperty('latency_ms', 200);
      
      consoleSpy.mockRestore();
    });
  });

  describe('logError', () => {
    it('should log error with context', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('test error');
      error.stack = 'Error: test error\n    at test.js:1:1';
      
      logError('trace-123', error, { route: 'test' });
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      const callArgs = consoleErrorSpy.mock.calls[0][0];
      const logEntry = JSON.parse(callArgs);
      
      expect(logEntry).toHaveProperty('trace_id', 'trace-123');
      expect(logEntry).toHaveProperty('error_message', 'test error');
      expect(logEntry).toHaveProperty('error_stack');
      expect(logEntry).toHaveProperty('route', 'test');
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('createTraceContext', () => {
    it('should create trace context with helper methods', () => {
      const request = new Request('https://example.com/api/test', {
        method: 'POST',
        headers: { 'X-User-Id': '123' },
      });
      
      const trace = createTraceContext(request, {});
      
      expect(trace).toHaveProperty('traceId');
      expect(trace).toHaveProperty('startTime');
      expect(trace).toHaveProperty('log');
      expect(trace).toHaveProperty('logResponse');
      expect(trace).toHaveProperty('logModelCall');
      expect(trace).toHaveProperty('logError');
      
      expect(typeof trace.log).toBe('function');
      expect(typeof trace.logResponse).toBe('function');
      expect(typeof trace.logModelCall).toBe('function');
      expect(typeof trace.logError).toBe('function');
    });
  });

  describe('addTraceHeader', () => {
    it('should add trace ID to response headers', () => {
      const response = new Response('test', { status: 200 });
      const traced = addTraceHeader(response, 'trace-123');
      
      expect(traced.headers.get('X-Trace-Id')).toBe('trace-123');
      expect(traced.status).toBe(200);
    });
  });
});

