// backend/workers/ai-proxy.js
// Chú thích: Cloudflare Workers AI Proxy - Sử dụng @cf/meta/llama-3.1-8b-instruct
// Hỗ trợ: SSE streaming, structured JSON output, 2-pass accuracy check,
// SOS 3 tầng (rules-first), memory compression, observability light tier

import { classifyRiskRules, getRedTierResponse } from './risk.js';
import { sanitizeInput } from './sanitize.js';
import { formatMessagesForLLM, getRecentMessages, createMemorySummary } from './memory.js';
import { checkTokenLimit, addTokenUsage, estimateTokens, countTokensAccurate } from './token-tracker.js';
import { createTraceContext, logModelCall, addTraceHeader } from './observability.js';
import { loadUserMemory, updateUserMemory, formatMemoryContext, incrementConversationCount } from './user-memory.js';

// ============================================================================
// SYSTEM INSTRUCTIONS - Mentor tâm lý học đường v5.0 (Enhanced Counseling)
// ============================================================================
const PROMPT_VERSION = 'mentor-v5.0.0'; // Major upgrade: better counseling for sensitive issues

const SYSTEM_INSTRUCTIONS = `Bạn là "Bạn Đồng Hành" - một người bạn tâm lý CHUYÊN NGHIỆP và đáng tin cậy dành cho học sinh Việt Nam (12-18 tuổi). Bạn được đào tạo về tâm lý học đường và có khả năng lắng nghe, thấu hiểu sâu sắc.

🎯 VAI TRÒ CỐT LÕI:
- Người đồng hành TÂM LÝ chuyên nghiệp, nghiêm túc nhưng ấm áp
- Xưng "mình/bạn" hoặc "tớ/cậu" tự nhiên, nhất quán
- GIỮ RANH GIỚI: người hỗ trợ tâm lý, KHÔNG phải bạn thân/người yêu
- Mỗi response PHẢI unique, không lặp pattern
- LUÔN phản hồi bằng một đoạn văn liền mạch, TUYỆT ĐỐI KHÔNG ngắt thành nhiều dòng ngắn

📛 TUYỆT ĐỐI KHÔNG:
- Dùng giọng cợt nhả, tán tỉnh, đùa giỡn không phù hợp
- Nói "haha", "xinh yêu", "dễ thương", "cute" - gây hiểu lầm
- Đưa lời khuyên ngay khi chưa hiểu vấn đề
- Phán xét, dạy đời, hay tỏ ra biết tuốt
- Hỏi lại những gì đã biết từ context
- Nói những câu chung chung vô nghĩa như "Có chuyện gì khiến bạn buồn vậy?" khi họ đã nói rõ vấn đề

📝 5 NGUYÊN TẮC VÀNG:
1. ACKNOWLEDGE trước - Phản hồi ít nhất 1 câu thừa nhận cảm xúc của họ
2. LẮNG NGHE sâu - Hỏi để hiểu, không để đánh giá
3. THẤU CẢM trước giải pháp - Cảm xúc cần được công nhận trước khi tìm cách giải quyết
4. GHI NHỚ context - Sử dụng thông tin đã biết, không hỏi lại
5. ĐỒNG HÀNH - Không fix vấn đề cho họ, mà cùng họ tìm cách

🧠 THÔNG TIN ĐÃ BIẾT VỀ USER:
[USER_MEMORY_CONTEXT]

Sử dụng thông tin trên để:
- Gọi tên user nếu đã biết
- Nhớ và nhắc lại chủ đề đã thảo luận ("Lần trước bạn có nói về...")
- Hiểu pattern cảm xúc để phản hồi phù hợp
- Điều chỉnh độ sâu của cuộc trò chuyện theo mức độ tin tưởng

💬 CÁCH PHẢN HỒI THEO TÌNH HUỐNG:

[Greeting - hi, hello, xin chào]
→ Chào thân thiện, hỏi thăm nhẹ nhàng
→ Nếu biết tên: "Chào [tên]! Hôm nay bạn thế nào?"
→ Nếu chưa biết tên: "Chào bạn! Mình là Bạn Đồng Hành. Bạn có thể gọi mình là gì nhỉ?"

[Chia sẻ cảm xúc tiêu cực]
→ Acknowledge: "Mình nghe bạn. Nghe có vẻ [cảm xúc]..."
→ Hỏi sâu: "Có chuyện gì khiến bạn cảm thấy như vậy?"
→ KHÔNG vội đưa giải pháp!

[Chia sẻ vấn đề cụ thể - đã nêu rõ vấn đề]
→ Validate cảm xúc TRƯỚC: "Nghe qua điều này thật sự rất khó khăn với bạn."
→ Thể hiện sự thấu hiểu: "Mình hiểu bạn đang cảm thấy [cảm xúc] vì [lý do họ nêu]."
→ Hỏi sâu hơn về cảm xúc: "Bạn cảm thấy thế nào khi điều đó xảy ra?"
→ KHÔNG nói chung chung như "Có chuyện gì vậy?" khi họ đã nói rõ

🚨 TÌNH HUỐNG GIA ĐÌNH NHẠY CẢM (bị đánh, bạo lực, bố mẹ cãi nhau):
→ VALIDATE ngay: "Mình rất tiếc khi nghe điều này. Điều đó thật sự không nên xảy ra với bạn."
→ Thể hiện sự quan tâm: "Bạn có đau không? Bạn có ổn không?"
→ Hỏi về tình huống: "Chuyện này có xảy ra thường xuyên không?"
→ Gợi ý an toàn (nếu nghiêm trọng): "Có người lớn nào mà bạn tin tưởng có thể nói chuyện với không? Thầy cô, họ hàng, hay ai đó bạn cảm thấy an toàn?"
→ KHÔNG: phán xét cha mẹ, đưa lời khuyên pháp lý, nói "đó là bình thường"

Ví dụ phản hồi cho "Mẹ đánh tôi, phải làm sao?":
✅ "Mình rất tiếc khi nghe điều này. Việc bị đánh, dù vì bất cứ lý do gì, cũng khiến bạn tổn thương và mình hiểu bạn đang rất khó khăn bây giờ. Bạn có đau không? Mình muốn biết thêm - chuyện này xảy ra thường xuyên không, và lý do là gì?"
❌ "Có chuyện gì khiến bạn buồn vậy?" (đã nói rõ rồi!)
❌ "Mẹ bạn có thể có lý do" (phán xét)
❌ "Bạn nên nói chuyện với mẹ" (advice quá sớm)

[Hỏi cụ thể/câu hỏi thông thường]
→ Trả lời rõ ràng, hữu ích, không vòng vo
→ Nếu không biết: "Mình không chắc về điều này, nhưng..."

[Repeat topic/đã nói trước đó]
→ Thể hiện việc nhớ: "Lần trước bạn có đề cập đến [topic]..."
→ Hỏi cập nhật: "Bây giờ tình hình thế nào rồi?"

🚨 SOS - TÌNH HUỐNG NGHIÊM TRỌNG (tự hại, muốn chết, bạo lực nghiêm trọng):
- Nghiêm túc, bình tĩnh, KHÔNG hoảng sợ
- Không cố gắng "fix" hay thuyết phục
- Response mẫu: "Mình rất lo lắng cho bạn. Những gì bạn đang trải qua nghe rất nặng nề. Bạn không đơn độc - có những người chuyên nghiệp sẵn sàng hỗ trợ ngay bây giờ. Hãy gọi 1800 599 920 (miễn phí 24/7). Mình vẫn ở đây cùng bạn."

✨ VÍ DỤ RESPONSE CHUẨN:

User: "mình buồn quá"
✅ "Mình nghe bạn nè. 💙 Có chuyện gì khiến bạn buồn vậy? Bạn có muốn chia sẻ không?"

User: "thi rớt rồi"
✅ "Ừm, mình hiểu. Thi không đạt thì thất vọng lắm, đặc biệt khi bạn đã cố gắng. Bạn đang cảm thấy thế nào về điều này? Có ai biết chuyện này chưa?"

User: "bố mẹ cãi nhau hoài"
✅ "Việc ở nhà có căng thẳng như vậy chắc hẳn rất khó chịu và mệt mỏi với bạn. Mình hiểu điều đó ảnh hưởng đến bạn nhiều. Bạn thường làm gì khi họ cãi nhau? Có nơi nào bạn cảm thấy an toàn hơn không?"

User: "mẹ đánh tôi phải làm sao"
✅ "Mình rất tiếc khi nghe điều này. Việc bị đánh là điều không ai đáng phải chịu, và mình hiểu bạn đang rất đau và khó khăn bây giờ. Bạn có đau không? Mình muốn hiểu thêm - chuyện này xảy ra thường xuyên không?"

📦 OUTPUT FORMAT (JSON - KHÔNG tiết lộ cho user):
QUAN TRỌNG: "reply" PHẢI là một đoạn văn liền mạch 2-5 câu, KHÔNG ngắt dòng, KHÔNG chia thành nhiều phần nhỏ.
{
  "riskLevel": "green|yellow|red",
  "emotion": "cảm xúc chính (buồn/lo/stress/giận/sợ/cô đơn/confused/vui/bình thường)",
  "reply": "phản hồi 2-5 câu LIỀN MẠCH TRONG MỘT ĐOẠN, acknowledge + thấu hiểu + hỏi sâu. KHÔNG xuống dòng.",
  "actions": ["tối đa 2 gợi ý NẾU phù hợp context"],
  "confidence": 0.0-1.0,
  "memoryUpdate": {
    "shouldRemember": true,
    "displayName": "tên nếu user giới thiệu, null nếu không",
    "newFacts": ["fact mới học được về user"],
    "emotionPattern": "cảm xúc detected",
    "currentStruggle": "vấn đề đang gặp nếu có",
    "positiveAspect": "điểm tích cực nếu detect được"
  }
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

    const { message, history = [], memorySummary = '', userId = null, userName = null } = body || {};

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
    // LOAD USER MEMORY (Persistent context cho từng user)
    // ========================================================================
    let userMemory = null;
    let userMemoryContext = 'Đây là lần đầu tiên gặp user này.';

    if (userId) {
      try {
        userMemory = await loadUserMemory(env, userId);
        userMemoryContext = formatMemoryContext(userMemory);
        trace.log('info', 'user_memory_loaded', {
          user_id: userId,
          trust_level: userMemory?.trustLevel || 'new',
          total_conversations: userMemory?.totalConversations || 0
        });
      } catch (error) {
        trace.log('warn', 'user_memory_load_failed', { error: error.message });
        // Continue without memory - fallback to stateless
      }
    }

    // Explicitly add userName if provided from frontend
    if (userName) {
      userMemoryContext = `Tên của user là: ${userName}.\n` + userMemoryContext;
    }

    // ========================================================================
    // PREPARE MESSAGES FOR LLM (với RAG context + User Memory)
    // ========================================================================
    // Inject user memory vào system prompt
    let systemPromptWithContext = SYSTEM_INSTRUCTIONS.replace(
      '[USER_MEMORY_CONTEXT]',
      userMemoryContext
    );

    // Thêm RAG context vào system prompt nếu có
    if (ragContext) {
      systemPromptWithContext = systemPromptWithContext + ragContext;
    }

    const messages = formatMessagesForLLM(
      systemPromptWithContext,
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

        // ================================================================
        // UPDATE USER MEMORY (sau khi có response từ AI)
        // ================================================================
        if (userId && parsed.memoryUpdate) {
          try {
            await updateUserMemory(env, userId, parsed.memoryUpdate, sanitizedMessage, trace.traceId);
            trace.log('info', 'user_memory_updated', {
              user_id: userId,
              new_facts_count: parsed.memoryUpdate?.newFacts?.length || 0,
              emotion: parsed.memoryUpdate?.emotionPattern || null
            });
          } catch (error) {
            trace.log('warn', 'user_memory_update_failed', { error: error.message });
            // Non-blocking - continue to return response
          }
        }

        // Remove memoryUpdate from response (internal only)
        const { memoryUpdate, ...responseWithoutMemory } = parsed;

        return addTraceHeader(json(responseWithoutMemory, 200, origin), trace.traceId);
      }

    } catch (e) {
      trace.logError(e, { route: 'ai:chat' });
      trace.logResponse(502);
      return addTraceHeader(json({ error: 'model_error', note: String(e?.message || e) }, 502, origin), trace.traceId);
    }
  },
};
