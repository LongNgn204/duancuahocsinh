// backend/workers/ai-proxy.js
// Chú thích: Cloudflare Worker proxy - Workers AI @cf/openai/gpt-oss-120b
// Hỗ trợ: SSE streaming, structured JSON output, 2-pass accuracy check,
// SOS 3 tầng (rules-first), memory compression, observability light tier

import { classifyRiskRules, getRedTierResponse } from './risk.js';
import { sanitizeInput } from './sanitize.js';
import { formatMessagesForLLM, getRecentMessages, createMemorySummary } from './memory.js';

// ============================================================================
// SYSTEM INSTRUCTIONS - Mentor tâm lý học đường
// ============================================================================
const SYSTEM_INSTRUCTIONS = `Bạn là "Bạn Đồng Hành" - một mentor tâm lý ấm áp, tôn trọng, không phán xét cho học sinh Việt Nam.

PHONG CÁCH
- Giọng văn thấu cảm, nói ngắn gọn (50-90 từ), dùng từ gần gũi học sinh
- Tránh khuôn mẫu "Tôi là AI", không robot
- Luôn xác thực cảm xúc trước khi gợi ý
- Kết thúc bằng câu hỏi mở phù hợp

QUY TRÌNH SUY LUẬN (NỘI BỘ - KHÔNG TIẾT LỘ)
1. Nghe và nhận diện cảm xúc người dùng
2. Phân tích nguyên nhân gốc rễ
3. Tham chiếu kiến thức tâm lý học phù hợp
4. Đưa ra gợi ý an toàn + câu hỏi mở

AN TOÀN
- Tránh bịa đặt. Nếu thiếu thông tin, nói rõ và hướng học sinh tới người lớn/nguồn tin cậy
- Không chẩn đoán bệnh, không kê thuốc
- Red flags: tự hại, bạo lực/lạm dụng, trầm cảm kéo dài → hướng tới hotline

OUTPUT FORMAT (BẮT BUỘC JSON)
{
  "riskLevel": "green|yellow|red",
  "emotion": "cảm xúc nhận diện được",
  "reply": "câu trả lời thấu cảm 50-90 từ",
  "nextQuestion": "câu hỏi mở tiếp theo",
  "actions": ["gợi ý 1", "gợi ý 2"],
  "confidence": 0.0-1.0,
  "disclaimer": "disclaimer nếu cần hoặc null"
}`;

// ============================================================================
// CORS HELPERS
// ============================================================================
function getAllowedOrigin(request, env) {
  const reqOrigin = request.headers.get('Origin') || '';
  const allow = env.ALLOW_ORIGIN || '*';

  if (allow === '*' || !reqOrigin) return allow === '*' ? '*' : reqOrigin || '*';

  const list = allow.split(',').map((s) => s.trim());

  // Check exact match
  if (list.includes(reqOrigin)) return reqOrigin;

  // Check wildcard patterns (*.domain.com)
  for (const pattern of list) {
    if (pattern.startsWith('*.')) {
      const domain = pattern.slice(2);
      if (reqOrigin.endsWith('.' + domain) || reqOrigin.endsWith('//' + domain)) {
        return reqOrigin;
      }
      const originHost = reqOrigin.replace(/^https?:\/\//, '');
      if (originHost.endsWith('.' + domain) || originHost === domain) {
        return reqOrigin;
      }
    }
  }

  // Fallback: Cloudflare Pages preview URLs
  if (reqOrigin.includes('.pages.dev')) {
    return reqOrigin;
  }

  return 'null';
}

function corsHeaders(origin = '*') {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-requested-with',
    'Access-Control-Expose-Headers': 'X-Trace-Id',
  };
}

function json(data, status = 200, origin = '*', traceId) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin), ...(traceId ? { 'X-Trace-Id': traceId } : {}) },
  });
}

function handleOptions(request, env) {
  const origin = getAllowedOrigin(request, env);
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

function sseHeaders(origin = '*', traceId) {
  return {
    ...corsHeaders(origin),
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache',
    'X-Trace-Id': traceId
  };
}

// ============================================================================
// WORKERS AI CALLS
// ============================================================================

/**
 * Gọi Workers AI (non-stream)
 * @param {Object} env - Cloudflare env với AI binding
 * @param {Array} messages - Messages array
 * @param {Object} options - Options
 * @returns {Promise<Object>} AI response
 */
async function callWorkersAI(env, messages, options = {}) {
  const model = options.model || env.MODEL || '@cf/meta/llama-3.1-8b-instruct';

  try {
    const result = await env.AI.run(model, {
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 512,
    });

    return result;
  } catch (error) {
    console.error('[WorkersAI] Error:', error.message);
    throw error;
  }
}

/**
 * Gọi Workers AI với streaming
 * @param {Object} env - Cloudflare env với AI binding
 * @param {Array} messages - Messages array
 * @param {Object} options - Options
 * @returns {ReadableStream} SSE stream
 */
async function callWorkersAIStream(env, messages, options = {}) {
  const model = options.model || env.MODEL || '@cf/meta/llama-3.1-8b-instruct';

  const result = await env.AI.run(model, {
    messages,
    temperature: options.temperature || 0.7,
    max_tokens: options.max_tokens || 512,
    stream: true,
  });

  return result;
}

/**
 * Parse JSON từ LLM response (có fallback)
 * @param {string} text - Raw response text
 * @returns {Object} Parsed JSON hoặc fallback object
 */
function parseAIResponse(text) {
  if (!text) {
    return createFallbackResponse('Không có phản hồi');
  }

  // Tìm JSON trong response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      // Validate required fields
      if (parsed.reply && typeof parsed.reply === 'string') {
        return {
          riskLevel: parsed.riskLevel || 'green',
          emotion: parsed.emotion || '',
          reply: parsed.reply,
          nextQuestion: parsed.nextQuestion || '',
          actions: Array.isArray(parsed.actions) ? parsed.actions.slice(0, 4) : [],
          confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.7,
          disclaimer: parsed.disclaimer || null,
        };
      }
    } catch (e) {
      console.error('[ParseAI] JSON parse error:', e.message);
    }
  }

  // Fallback: treat entire text as reply
  return createFallbackResponse(text);
}

function createFallbackResponse(text) {
  return {
    riskLevel: 'green',
    emotion: '',
    reply: text.slice(0, 500) || 'Mình đang lắng nghe bạn. Bạn có thể chia sẻ thêm không?',
    nextQuestion: '',
    actions: [],
    confidence: 0.5,
    disclaimer: null,
  };
}

/**
 * 2-pass accuracy check khi confidence thấp
 * @param {Object} env 
 * @param {Object} firstResponse 
 * @param {string} userMessage 
 * @returns {Promise<Object>} Verified response
 */
async function twoPassCheck(env, firstResponse, userMessage) {
  // Nếu confidence đủ cao, không cần pass 2
  if (firstResponse.confidence >= 0.6) {
    return firstResponse;
  }

  console.log('[2-Pass] Confidence thấp, thực hiện self-check...');

  const checkPrompt = `Kiểm tra lại câu trả lời sau và sửa nếu cần:

CÂU HỎI GỐC: ${userMessage}

CÂU TRẢ LỜI DRAFT:
${JSON.stringify(firstResponse, null, 2)}

KIỂM TRA:
1. Có bịa đặt thông tin không?
2. Có rủi ro an toàn không?
3. Có phù hợp với SOS tier (${firstResponse.riskLevel}) không?
4. Giọng điệu có thấu cảm không?

Nếu cần sửa, trả về JSON hoàn chỉnh. Nếu không cần sửa, trả về JSON gốc với confidence cao hơn.`;

  try {
    const checkResult = await callWorkersAI(env, [
      { role: 'system', content: 'Bạn là chuyên gia kiểm tra chất lượng phản hồi tâm lý. Trả về JSON.' },
      { role: 'user', content: checkPrompt }
    ], { temperature: 0.3 });

    const verified = parseAIResponse(checkResult.response || '');
    // Ensure confidence is updated
    if (verified.confidence < 0.6) verified.confidence = 0.65;
    return verified;
  } catch (e) {
    console.error('[2-Pass] Error:', e.message);
    // Fallback to first response
    firstResponse.confidence = 0.55;
    return firstResponse;
  }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================
export default {
  async fetch(request, env) {
    const startTime = Date.now();
    const traceId = (crypto && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    const origin = getAllowedOrigin(request, env);

    // CORS preflight
    if (request.method === 'OPTIONS') return handleOptions(request, env);

    // Only POST allowed
    if (request.method !== 'POST') {
      return json({ error: 'method_not_allowed' }, 405, origin, traceId);
    }

    // Parse body
    let body;
    try {
      body = await request.json();
    } catch (_) {
      return json({ error: 'invalid_json' }, 400, origin, traceId);
    }

    const { message, history = [], memorySummary = '' } = body || {};

    // Validate message
    if (!message || typeof message !== 'string') {
      return json({ error: 'missing_message' }, 400, origin, traceId);
    }

    // Sanitize input
    let sanitizedMessage;
    try {
      sanitizedMessage = sanitizeInput(message);
    } catch (e) {
      console.log(`[Sanitize] Blocked: ${e.message}`, { traceId });
      return json({ error: 'invalid_input', reason: e.message }, 400, origin, traceId);
    }

    // ========================================================================
    // SOS CLASSIFICATION (RULES-FIRST)
    // ========================================================================
    const riskLevel = classifyRiskRules(sanitizedMessage, history);

    // Log observability (không log raw message)
    console.log(JSON.stringify({
      type: 'request',
      traceId,
      riskLevel,
      model: env.MODEL || '@cf/openai/gpt-oss-120b',
      historyCount: history.length,
    }));

    // RED tier: trả response chuẩn, không gọi LLM
    if (riskLevel === 'red') {
      const redResponse = getRedTierResponse();
      console.log(JSON.stringify({
        type: 'response',
        traceId,
        riskLevel: 'red',
        latencyMs: Date.now() - startTime,
        status: 200,
      }));

      // Check if streaming requested - emit SSE format
      const url = new URL(request.url);
      const wantsStream = url.searchParams.get('stream') === 'true' ||
        request.headers.get('Accept')?.includes('text/event-stream');

      if (wantsStream) {
        // Emit RED tier response as SSE stream
        const stream = new ReadableStream({
          start(controller) {
            const enc = new TextEncoder();
            const send = (line) => controller.enqueue(enc.encode(line));

            // Meta event
            send(`event: meta\n`);
            send(`data: ${JSON.stringify({ trace_id: traceId, riskLevel: 'red', sos: true })}\n\n`);

            // Send the reply text
            const replyText = redResponse.reply + '\n\n📞 ' + redResponse.actions.join('\n📞 ');
            send(`data: ${JSON.stringify({ type: 'delta', text: replyText })}\n\n`);

            // Done event
            send(`data: ${JSON.stringify({ type: 'done' })}\n\n`);

            controller.close();
          },
        });
        return new Response(stream, { status: 200, headers: sseHeaders(origin, traceId) });
      }

      return json(redResponse, 200, origin, traceId);
    }


    // ========================================================================
    // PREPARE MESSAGES FOR LLM
    // ========================================================================
    const messages = formatMessagesForLLM(
      SYSTEM_INSTRUCTIONS,
      getRecentMessages(history, 8),
      sanitizedMessage,
      memorySummary
    );

    // ========================================================================
    // CHECK IF STREAMING REQUESTED
    // ========================================================================
    const url = new URL(request.url);
    const wantsStream = url.searchParams.get('stream') === 'true' ||
      request.headers.get('Accept')?.includes('text/event-stream');

    try {
      if (wantsStream) {
        // ====================================================================
        // STREAMING RESPONSE
        // ====================================================================
        const aiStream = await callWorkersAIStream(env, messages);

        const stream = new ReadableStream({
          async start(controller) {
            const enc = new TextEncoder();
            const send = (line) => controller.enqueue(enc.encode(line));

            // Send meta event
            send(`event: meta\n`);
            send(`data: ${JSON.stringify({ trace_id: traceId, riskLevel })}\n\n`);

            try {
              let fullText = '';
              const reader = aiStream.getReader();
              let buffer = '';

              while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                // Workers AI stream returns chunks as SSE-like format
                const chunk = typeof value === 'string' ? value : new TextDecoder().decode(value);
                buffer += chunk;

                // Parse SSE lines from buffer
                let lineEnd;
                while ((lineEnd = buffer.indexOf('\n')) !== -1) {
                  const line = buffer.slice(0, lineEnd).trim();
                  buffer = buffer.slice(lineEnd + 1);

                  if (line.startsWith('data: ')) {
                    const dataStr = line.slice(6);
                    if (dataStr === '[DONE]') {
                      continue;
                    }
                    try {
                      const parsed = JSON.parse(dataStr);
                      // Workers AI trả về {"response":"text"} hoặc {"response":null} khi done
                      if (parsed.response && typeof parsed.response === 'string') {
                        fullText += parsed.response;
                        // Send delta event với format chuẩn cho frontend
                        send(`data: ${JSON.stringify({ type: 'delta', text: parsed.response })}\n\n`);
                      }
                    } catch (_) {
                      // Skip non-JSON lines
                    }
                  }
                }
              }

              // Send done event
              send(`data: ${JSON.stringify({ type: 'done' })}\n\n`);

              // Log completion
              console.log(JSON.stringify({
                type: 'response',
                traceId,
                riskLevel,
                latencyMs: Date.now() - startTime,
                status: 200,

                stream: true,
              }));

            } catch (err) {
              const errPayload = { type: 'error', error: 'model_error', note: String(err?.message || err) };
              send(`data: ${JSON.stringify(errPayload)}\n\n`);
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, { status: 200, headers: sseHeaders(origin, traceId) });

      } else {
        // ====================================================================
        // NON-STREAMING RESPONSE (với 2-pass check)
        // ====================================================================
        const result = await callWorkersAI(env, messages);
        const rawResponse = result.response || '';

        // Parse response
        let parsed = parseAIResponse(rawResponse);

        // Override riskLevel từ rules nếu khác
        if (riskLevel === 'yellow' && parsed.riskLevel === 'green') {
          parsed.riskLevel = 'yellow';
        }

        // 2-pass accuracy check
        parsed = await twoPassCheck(env, parsed, sanitizedMessage);

        // Log completion
        console.log(JSON.stringify({
          type: 'response',
          traceId,
          riskLevel: parsed.riskLevel,
          confidence: parsed.confidence,
          latencyMs: Date.now() - startTime,
          status: 200,
          stream: false,
        }));

        return json(parsed, 200, origin, traceId);
      }

    } catch (e) {
      console.error(JSON.stringify({
        type: 'error',
        traceId,
        error: e.message,
        latencyMs: Date.now() - startTime,
      }));
      return json({ error: 'model_error', note: String(e?.message || e) }, 502, origin, traceId);
    }
  },
};
