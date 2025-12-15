// backend/workers/observability.js
// Chú thích: Lightweight observability system cho Cloudflare Workers
// Tạo trace_id, structured logging, metrics tracking (latency, tokens, cost)
// Tương thích với Workers environment (không dùng OpenTelemetry full vì không hỗ trợ đầy đủ)

import { redactPII, redactPIIFromObject } from './pii-redactor.js';

/**
 * Generate unique trace ID cho mỗi request
 * Format: timestamp-random (ví dụ: 1703123456789-a1b2c3d4)
 */
export function generateTraceId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
}

/**
 * Structured log entry (tự động redact PII)
 * @param {string} level - 'info', 'warn', 'error', 'debug'
 * @param {string} message - Log message
 * @param {Object} context - Additional context (trace_id, user_id, latency, etc.)
 */
export function log(level, message, context = {}) {
  // Redact PII từ context trước khi log (trừ một số fields như trace_id, user_id)
  const excludeKeys = ['trace_id', 'user_id', 'status', 'latency_ms', 'tokens_in', 'tokens_out', 'cost_usd'];
  const redactedContext = redactPIIFromObject(context, {
    redactPhone: true,
    redactEmail: true,
    redactIdCard: true,
    redactAddress: false,
    redactName: false,
  }, excludeKeys);
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message: redactPII(message), // Redact PII trong message
    ...redactedContext,
  };

  // Format cho Cloudflare Workers logs (JSON string)
  const logString = JSON.stringify(logEntry);

  // Log theo level
  switch (level) {
    case 'error':
      console.error(logString);
      break;
    case 'warn':
      console.warn(logString);
      break;
    case 'debug':
      // Chỉ log debug trong dev mode
      if (context.env?.ENVIRONMENT === 'development') {
        console.log(logString);
      }
      break;
    default:
      console.log(logString);
  }

  return logEntry;
}

/**
 * Log request với trace context
 * @param {Request} request - Incoming request
 * @param {string} traceId - Trace ID
 * @param {Object} env - Environment variables
 */
export function logRequest(request, traceId, env = {}) {
  const url = new URL(request.url);
  const userId = request.headers.get('X-User-Id') || null;
  
  log('info', 'request_start', {
    trace_id: traceId,
    method: request.method,
    path: url.pathname,
    user_id: userId,
    user_agent: request.headers.get('User-Agent')?.substring(0, 100) || null,
  });
}

/**
 * Log response với metrics
 * @param {string} traceId - Trace ID
 * @param {number} status - HTTP status code
 * @param {number} latency - Latency in milliseconds
 * @param {Object} metrics - Additional metrics (tokens, cost, etc.)
 */
export function logResponse(traceId, status, latency, metrics = {}) {
  const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
  
  log(level, 'request_end', {
    trace_id: traceId,
    status,
    latency_ms: latency,
    ...metrics,
  });
}

/**
 * Log AI model call với tokens và cost
 * @param {string} traceId - Trace ID
 * @param {string} model - Model name
 * @param {string} modelVersion - Model version
 * @param {number} tokensIn - Input tokens
 * @param {number} tokensOut - Output tokens
 * @param {number} costUsd - Cost in USD
 * @param {number} latency - Latency in milliseconds
 */
export function logModelCall(traceId, model, modelVersion, tokensIn, tokensOut, costUsd, latency) {
  log('info', 'model_call', {
    trace_id: traceId,
    model_name: model,
    model_version: modelVersion,
    tokens_in: tokensIn,
    tokens_out: tokensOut,
    tokens_total: tokensIn + tokensOut,
    cost_usd: costUsd,
    latency_ms: latency,
  });
}

/**
 * Log error với context
 * @param {string} traceId - Trace ID
 * @param {Error} error - Error object
 * @param {Object} context - Additional context
 */
export function logError(traceId, error, context = {}) {
  log('error', 'error_occurred', {
    trace_id: traceId,
    error_message: error.message,
    error_stack: error.stack?.substring(0, 500) || null,
    ...context,
  });
}

/**
 * Create trace context cho request
 * @param {Request} request - Incoming request
 * @param {Object} env - Environment variables
 * @returns {Object} Trace context với trace_id và startTime
 */
export function createTraceContext(request, env = {}) {
  const traceId = generateTraceId();
  const startTime = Date.now();
  
  logRequest(request, traceId, env);
  
  return {
    traceId,
    startTime,
    log: (level, message, context = {}) => log(level, message, { trace_id: traceId, ...context }),
    logResponse: (status, metrics = {}) => {
      const latency = Date.now() - startTime;
      logResponse(traceId, status, latency, metrics);
    },
    logModelCall: (model, modelVersion, tokensIn, tokensOut, costUsd) => {
      const latency = Date.now() - startTime;
      logModelCall(traceId, model, modelVersion, tokensIn, tokensOut, costUsd, latency);
    },
    logError: (error, context = {}) => logError(traceId, error, context),
  };
}

/**
 * Add trace ID to response headers
 * @param {Response} response - Response object
 * @param {string} traceId - Trace ID
 * @returns {Response} Response với trace ID header
 */
export function addTraceHeader(response, traceId) {
  const newHeaders = new Headers(response.headers);
  newHeaders.set('X-Trace-Id', traceId);
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

