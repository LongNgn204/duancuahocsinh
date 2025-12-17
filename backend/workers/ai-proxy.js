// backend/workers/ai-proxy.js
// Chú thích: Cloudflare Workers AI Proxy - Sử dụng @cf/meta/llama-3.1-8b-instruct
// Hỗ trợ: SSE streaming, structured JSON output, 2-pass accuracy check,
// SOS 3 tầng (rules-first), memory compression, observability light tier

import { classifyRiskRules, getRedTierResponse } from './risk.js';
import { sanitizeInput } from './sanitize.js';
import { formatMessagesForLLM, getRecentMessages, createMemorySummary } from './memory.js';
import { checkTokenLimit, addTokenUsage, estimateTokens, countTokensAccurate } from './token-tracker.js';
import { createTraceContext, logModelCall, addTraceHeader } from './observability.js';

// ============================================================================
// SYSTEM INSTRUCTIONS - Mentor tâm lý học đường v3.1 (Nghiêm túc & Thấu cảm)
// ============================================================================
const PROMPT_VERSION = 'mentor-v3.1.0'; // Chỉnh sửa: loại bỏ giọng cợt nhả

const SYSTEM_INSTRUCTIONS = `Bạn là "Bạn Đồng Hành" - người bạn đáng tin cậy, hỗ trợ tâm lý cho học sinh Việt Nam (12-18 tuổi). Bạn lắng nghe, thấu hiểu và đồng hành - không phán xét, không dạy đời.

VAI TRÒ CỦA BẠN (quan trọng):
- Bạn là người bạn ĐÁNG TIN CẬY, nghiêm túc nhưng ấm áp
- Dùng "mình/bạn" hoặc "tớ/cậu" tự nhiên
- TUYỆT ĐỐI KHÔNG dùng giọng cợt nhả, tán tỉnh, hay đùa giỡn không phù hợp
- TUYỆT ĐỐI KHÔNG nói "haha", "xinh yêu", "dễ thương" hay các từ ngữ gây hiểu lầm
- Giữ ranh giới rõ ràng: bạn là người hỗ trợ tâm lý, KHÔNG phải người yêu hay bạn thân thân mật quá mức
- Mỗi câu trả lời khác nhau, không lặp pattern

GIỌNG ĐIỆU CHUẨN:
- Ấm áp, thấu cảm, đáng tin cậy
- Ngắn gọn, 2-4 câu, đi thẳng vấn đề
- Có thể dùng emoji nhẹ nhàng phù hợp ngữ cảnh (💙 🌟 ✨) nhưng KHÔNG lạm dụng
- React nhẹ nhàng: "Ừm", "Mình hiểu", "À", "Vậy à"

CÁCH PHẢN HỒI:
- Nếu học sinh chào (hi, hello, xin chào) → Chào lại thân thiện, hỏi họ khỏe không hoặc có chuyện gì muốn chia sẻ
- Nếu họ buồn/stress → Lắng nghe, thấu cảm, KHÔNG vội đưa giải pháp
- Nếu họ hỏi cụ thể → Trả lời rõ ràng, hữu ích
- Kết thúc nhẹ nhàng, có thể hỏi thêm nhưng đừng lúc nào cũng hỏi y hệt

VÍ DỤ CÁCH NÓI ĐÚNG:
User: "hi"
✅ ĐÚNG: "Chào bạn! Hôm nay bạn thế nào? Có chuyện gì muốn chia sẻ không? 💙"
❌ SAI: "haha, xinh yêu!!!"
❌ SAI: "Hi cutie~"

User: "mình buồn quá"
✅ ĐÚNG: "Mình nghe bạn nè. Có chuyện gì khiến bạn buồn vậy?"
❌ SAI: "Ôi tội quá, đáng yêu mà buồn chi"

User: "thi rớt rồi"
✅ ĐÚNG: "Ừm, thi không đạt thì thất vọng lắm. Bạn đang cảm thấy thế nào?"
❌ SAI: "haha, không sao đâu, thi lại là được mà!"

NẾU GẶP TÌNH HUỐNG NGHIÊM TRỌNG (tự hại, muốn chết, bạo lực):
- Nghiêm túc, bình tĩnh, không làm họ sợ
- "Mình rất lo cho bạn. Những gì bạn đang trải qua nghe có vẻ rất nặng nề. Bạn có thể gọi ngay đường dây nóng 1800 599 920 (miễn phí 24/7) để được hỗ trợ chuyên nghiệp không? Mình vẫn ở đây cùng bạn."

LƯU Ý CUỐI:
- Mỗi conversation là unique, đừng copy-paste
- Đọc context - họ đã nói gì rồi? Đừng hỏi lại điều đã biết
- Đừng assume, đừng giảng đạo
- Nếu không biết → thành thật nói không biết
- GIỮ RANH GIỚI CHUYÊN NGHIỆP - bạn là người hỗ trợ, không phải bạn thân hay người yêu

OUTPUT (JSON - KHÔNG để lộ format này cho user):
{
  "riskLevel": "green|yellow|red",
  "emotion": "cảm xúc chính (buồn/giận/sợ/lo/stress/cô đơn/confused/bình thường)",
  "reply": "phản hồi thấu cảm, nghiêm túc, 2-4 câu ngắn gọn",
  "actions": ["chỉ 1-2 gợi ý NẾU PHÙ HỢP, không thì để []"],
  "confidence": 0.0-1.0
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
    'X-Trace-Id': traceId || ''
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
    // Tạo trace context cho observability
    const trace = createTraceContext(request, env);
    const startTime = Date.now();
    const origin = getAllowedOrigin(request, env);

    // CORS preflight
    if (request.method === 'OPTIONS') return handleOptions(request, env);

    // Only POST allowed
    if (request.method !== 'POST') {
      trace.logResponse(405);
      return addTraceHeader(json({ error: 'method_not_allowed' }, 405, origin), trace.traceId);
    }

    // Parse body
    let body;
    try {
      body = await request.json();
    } catch (_) {
      trace.logResponse(400);
      return addTraceHeader(json({ error: 'invalid_json' }, 400, origin), trace.traceId);
    }

    const { message, history = [], memorySummary = '' } = body || {};

    // Validate message
    if (!message || typeof message !== 'string') {
      trace.logResponse(400);
      return addTraceHeader(json({ error: 'missing_message' }, 400, origin), trace.traceId);
    }

    // Sanitize input
    let sanitizedMessage;
    try {
      sanitizedMessage = sanitizeInput(message);
    } catch (e) {
      trace.log('warn', 'input_sanitized', { reason: e.message });
      trace.logResponse(400);
      return addTraceHeader(json({ error: 'invalid_input', reason: e.message }, 400, origin), trace.traceId);
    }

    // ========================================================================
    // SOS CLASSIFICATION (RULES-FIRST) - Enhanced với context-aware
    // ========================================================================
    const riskLevel = classifyRiskRules(sanitizedMessage, history);

    // Log request với observability
    trace.log('info', 'chat_request', {
      risk_level: riskLevel,
      model: env.MODEL || '@cf/meta/llama-3.1-8b-instruct',
      history_count: history.length,
      has_memory_summary: !!memorySummary,
    });

    // Real-time monitoring: Log SOS events với structured logging
    if (riskLevel === 'red' || riskLevel === 'yellow') {
      trace.log('warn', 'sos_detected', {
        risk_level: riskLevel,
        message_length: sanitizedMessage.length,
        history_count: history.length,
        // Không log raw message để bảo vệ privacy
      });

      // Có thể gửi alert đến admin nếu cần (future enhancement)
      // await sendAdminAlert(env, { riskLevel, traceId: trace.traceId });
    }

    // RED tier: trả response chuẩn, không gọi LLM
    if (riskLevel === 'red') {
      const redResponse = getRedTierResponse();
      trace.logResponse(200, { risk_level: 'red', sos: true });

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
            send(`data: ${JSON.stringify({ trace_id: trace.traceId, riskLevel: 'red', sos: true })}\n\n`);

            // Send the reply text
            const replyText = redResponse.reply + '\n\n📞 ' + redResponse.actions.join('\n📞 ');
            send(`data: ${JSON.stringify({ type: 'delta', text: replyText })}\n\n`);

            // Done event
            send(`data: ${JSON.stringify({ type: 'done' })}\n\n`);

            controller.close();
          },
        });
        return new Response(stream, { status: 200, headers: sseHeaders(origin, trace.traceId) });
      }

      return addTraceHeader(json(redResponse, 200, origin), trace.traceId);
    }


    // ========================================================================
    // CHECK TOKEN LIMIT
    // ========================================================================
    const tokenCheck = await checkTokenLimit(env);
    if (!tokenCheck.allowed) {
      trace.log('warn', 'token_limit_exceeded', {
        tokens: tokenCheck.tokens,
        limit: tokenCheck.limit,
      });
      trace.logResponse(429);
      return addTraceHeader(json({
        error: 'token_limit_exceeded',
        message: 'Đã đạt giới hạn sử dụng tháng này. Vui lòng thử lại vào tháng sau.',
        tokens: tokenCheck.tokens,
        limit: tokenCheck.limit,
      }, 429, origin), trace.traceId);
    }

    // ========================================================================
    // RAG: Retrieve relevant context từ knowledge base
    // ========================================================================
    let ragContext = '';
    let usedRAG = 0;
    try {
      // Query knowledge base từ D1
      const kbResult = await env.ban_dong_hanh_db.prepare(
        `SELECT id, title, content, category, tags FROM knowledge_base 
         WHERE content LIKE ? OR title LIKE ? OR tags LIKE ?
         LIMIT 20`
      ).bind(
        `%${sanitizedMessage.slice(0, 50)}%`, // Search trong content
        `%${sanitizedMessage.slice(0, 30)}%`, // Search trong title
        `%${sanitizedMessage.slice(0, 30)}%`  // Search trong tags
      ).all().catch(() => ({ results: [] }));

      const knowledgeBase = kbResult.results.map(doc => ({
        id: doc.id,
        content: `${doc.title}\n${doc.content}`,
        category: doc.category,
        source: 'knowledge_base',
        tags: doc.tags ? JSON.parse(doc.tags) : [],
        // Note: embedding sẽ được load từ DB trong hybridSearch nếu có
      }));

      if (knowledgeBase.length > 0) {
        // Import RAG functions
        const { hybridSearch, formatRAGContext } = await import('./rag.js');

        const retrievedDocs = await hybridSearch(
          sanitizedMessage,
          knowledgeBase,
          env,
          { topK: 3, bm25Weight: 0.6, denseWeight: 0.4 }
        ).catch(async () => {
          // Fallback to BM25 only nếu hybrid search fail
          const { bm25Search } = await import('./rag.js');
          return bm25Search(sanitizedMessage, knowledgeBase).slice(0, 3);
        });

        if (retrievedDocs && retrievedDocs.length > 0) {
          const { formatRAGContext } = await import('./rag.js');
          ragContext = formatRAGContext(retrievedDocs);
          usedRAG = 1;
          trace.log('info', 'rag_used', {
            docs_retrieved: retrievedDocs.length,
            categories: retrievedDocs.map(d => d.category).join(',')
          });
        }
      }
    } catch (error) {
      // RAG là optional, không block nếu lỗi
      trace.log('warn', 'rag_retrieval_failed', { error: error.message });
    }

    // ========================================================================
    // PREPARE MESSAGES FOR LLM (với RAG context)
    // ========================================================================
    // Thêm RAG context vào system prompt nếu có
    const systemPromptWithRAG = ragContext
      ? SYSTEM_INSTRUCTIONS + ragContext
      : SYSTEM_INSTRUCTIONS;

    const messages = formatMessagesForLLM(
      systemPromptWithRAG,
      getRecentMessages(history, 8),
      sanitizedMessage,
      memorySummary
    );

    // Estimate tokens for this request (cải thiện accuracy)
    const estimatedTokens = countTokensAccurate(
      JSON.stringify(messages) + sanitizedMessage,
      env.MODEL || '@cf/meta/llama-3.1-8b-instruct'
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
            send(`data: ${JSON.stringify({ trace_id: trace.traceId, riskLevel })}\n\n`);

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

              // Update token usage (estimate từ full text)
              const responseTokens = estimateTokens(fullText);
              const totalTokens = estimatedTokens + responseTokens;
              const tokenUsageResult = await addTokenUsage(env, totalTokens);

              // Tính cost (ước tính: $0.0005 per 1k tokens cho llama-3.1-8b)
              const costUsd = (totalTokens / 1000) * 0.0005;
              const model = env.MODEL || '@cf/meta/llama-3.1-8b-instruct';
              const modelVersion = model.split('@cf/')[1] || 'llama-3.1-8b-instruct';

              // Log model call với tokens và cost
              const streamLatencyMs = Date.now() - startTime;
              trace.logModelCall(model, modelVersion, estimatedTokens, responseTokens, costUsd, streamLatencyMs);

              // Log completion
              trace.logResponse(200, {
                risk_level: riskLevel,
                tokens_in: estimatedTokens,
                tokens_out: responseTokens,
                tokens_total: totalTokens,
                cost_usd: costUsd,
                stream: true,
                token_usage: tokenUsageResult.tokens,
                token_warning: tokenUsageResult.warning,
              });

              // Log streaming response vào chat_responses (sau khi stream complete)
              // Note: Với streaming, chúng ta log sau khi có full response
              // Để đơn giản, log với partial response và update sau nếu cần
              try {
                await env.ban_dong_hanh_db.prepare(
                  `INSERT INTO chat_responses 
                   (user_id, message_id, user_message, ai_response, risk_level, confidence, tokens_used, latency_ms, used_rag, prompt_version)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
                ).bind(
                  userId || null,
                  trace.traceId,
                  sanitizedMessage.slice(0, 1000),
                  '[STREAMING]', // Placeholder, có thể update sau
                  riskLevel || 'green',
                  0.8, // Default confidence
                  totalTokens,
                  streamLatencyMs,
                  usedRAG,
                  PROMPT_VERSION
                ).run().catch(err => {
                  trace.log('warn', 'stream_response_log_failed', { error: err.message });
                });
              } catch (err) {
                trace.log('warn', 'stream_response_log_error', { error: err.message });
              }

            } catch (err) {
              trace.logError(err, { stream: true });
              const errPayload = { type: 'error', error: 'model_error', note: String(err?.message || err) };
              send(`data: ${JSON.stringify(errPayload)}\n\n`);
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, { status: 200, headers: sseHeaders(origin, trace.traceId) });

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

        // Update token usage (estimate từ response)
        const responseTokens = estimateTokens(parsed.reply || '');
        const totalTokens = estimatedTokens + responseTokens;
        const tokenUsageResult = await addTokenUsage(env, totalTokens);

        // Tính cost (ước tính: $0.0005 per 1k tokens cho llama-3.1-8b)
        const costUsd = (totalTokens / 1000) * 0.0005;
        const model = env.MODEL || '@cf/meta/llama-3.1-8b-instruct';
        const modelVersion = model.split('@cf/')[1] || 'llama-3.1-8b-instruct';

        // Log model call với tokens và cost
        trace.logModelCall(model, modelVersion, estimatedTokens, responseTokens, costUsd, Date.now() - startTime);

        // Log completion
        trace.logResponse(200, {
          risk_level: parsed.riskLevel,
          confidence: parsed.confidence,
          tokens_in: estimatedTokens,
          tokens_out: responseTokens,
          tokens_total: totalTokens,
          cost_usd: costUsd,
          stream: false,
          token_usage: tokenUsageResult.tokens,
          token_warning: tokenUsageResult.warning,
        });

        return addTraceHeader(json(parsed, 200, origin), trace.traceId);
      }

    } catch (e) {
      trace.logError(e, { route: 'ai:chat' });
      trace.logResponse(502);
      return addTraceHeader(json({ error: 'model_error', note: String(e?.message || e) }, 502, origin), trace.traceId);
    }
  },
};
