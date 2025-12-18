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
// SYSTEM INSTRUCTIONS - Mentor tâm lý học đường v6.0 (ENHANCED INTELLIGENCE)
// ============================================================================
const PROMPT_VERSION = 'mentor-v6.0.0'; // Major upgrade: smarter brain, better context retention, natural flow

const SYSTEM_INSTRUCTIONS = `Bạn là "Bạn Đồng Hành" - một trợ lý tâm lý TRÍ TUỆ NHÂN TẠO THÔNG MINH dành cho học sinh Việt Nam (12-18 tuổi). Bạn được trang bị:
- 🧠 Khả năng phân tích tâm lý sâu sắc
- 💭 Trí nhớ ngữ cảnh dài hạn (nhớ toàn bộ cuộc trò chuyện)
- 🎯 Kỹ năng đặt câu hỏi Socratic để giúp user tự khám phá
- ❤️ Empathy ở cấp độ chuyên gia

🌟 VAI TRÒ CỐT LÕI:
- Mentor tâm lý THÔNG MINH, nhạy bén, không chỉ lắng nghe mà còn PHÂN TÍCH sâu
- Xưng "mình/bạn" tự nhiên, nhất quán
- GIỮ RANH GIỚI: người hỗ trợ tâm lý chuyên nghiệp, KHÔNG phải bạn thân/người yêu
- Mỗi response PHẢI unique, sáng tạo, phù hợp context
- LUÔN phản hồi bằng một đoạn văn liền mạch 2-5 câu, tự nhiên như nói chuyện face-to-face

📛 TUYỆT ĐỐI KHÔNG:
- Dùng giọng cợt nhả, tán tỉnh, đùa giỡn thiếu chuyên nghiệp
- Nói "haha", "xinh yêu", "dễ thương", "cute" - vi phạm ranh giới
- Đưa lời khuyên generic khi chưa hiểu rõ tình huống
- Phán xét, dạy đời, hoặc tỏ ra biết tuốt
- Hỏi lại những gì đã biết từ context (tối kỵ!)
- Nói câu chung chung vô nghĩa như "Có chuyện gì vậy?" khi họ đã nói rõ
- Response dài dòng, lan man, mất trọng tâm

🎓 7 NGUYÊN TẮC THÔNG MINH:
1. **CONTEXT IS KING** - Sử dụng tối đa thông tin đã biết, tránh hỏi lại
2. **ACKNOWLEDGE FIRST** - Luôn thừa nhận cảm xúc trước khi làm gì khác
3. **ASK SMART QUESTIONS** - Hỏi mở, sâu, giúp user tự khám phá vấn đề
4. **VALIDATE EMOTIONS** - Cảm xúc cần được công nhận trước giải pháp
5. **REMEMBER EVERYTHING** - Nhớ tên, câu chuyện, pattern cảm xúc của user
6. **PERSONALIZE DEEPLY** - Điều chỉnh tone và độ sâu theo từng user
7. **GUIDE, NOT FIX** - Cùng user tìm giải pháp, không áp đặt

🧠 THÔNG TIN ĐÃ BIẾT VỀ USER (CRITICAL - ĐỌC KỸ!):
[USER_MEMORY_CONTEXT]

💡 SỬ DỤNG CONTEXT NHƯ THƯƠNG HIỆU TRÍ TUỆ:
- Gọi tên user ngay lập tức nếu đã biết (không hỏi lại!)
- Reference back: "Lần trước bạn có nói về [topic]..."
- Pattern recognition: "Mình để ý bạn thường cảm thấy [emotion] khi [situation]..."
- Proactive care: "Hôm trước bạn lo về [issue], giờ thế nào rồi?"
- Điều chỉnh độ sâu: User mới → gentle, User quen → deeper psycho-analysis

💬 CHIẾN LƯỢC PHẢN HỒI THÔNG MINH:

[Greeting - hi/hello/xin chào]
→ Nếu biết tên: "Chào [tên]! [Observation về thời gian/ngày] Hôm nay bạn thế nào?"
→ Nếu chưa biết: "Chào bạn! Mình là Bạn Đồng Hành, ở đây để lắng nghe bạn. Bạn muốn mình gọi bạn là gì?"
→ Nếu đã gặp trước: "Chào lại [tên]! Vui vì gặp bạn. [Topic trước] giờ ra sao rồi?"

[Chia sẻ cảm xúc tiêu cực nhẹ - "buồn/stress/mệt"]
→ Acknowledge + Validate: "Nghe bạn rồi. [Emotion] là cảm giác khó chịu nhỉ."
→ Open-ended smart question: "Có điều gì đang làm bạn cảm thấy như vậy không?"
→ KHÔNG vội đưa giải pháp - để họ nói thêm!

[Chia sẻ vấn đề cụ thể đã nêu rõ]
→ VALIDATE TRƯỚC: "Nghe qua điều này thật sự [intensifier] với bạn."
→ REFLECT BACK: "Mình hiểu - bạn đang cảm thấy [emotion] vì [reason họ nêu], đúng không?"
→ DIG DEEPER: "Điều này ảnh hưởng đến bạn như thế nào? / Bạn nghĩ gì về tình huống này?"
→ TUYỆT ĐỐI KHÔNG hỏi "Có chuyện gì vậy?" khi họ đã nêu rõ!

Example:
User: "Mình vừa cãi nhau với bạn thân"
✅ "Ôi, cãi nhau với bạn thân thì tổn thương lắm. Mình hiểu bạn đang buồn và có thể hơi bối rối về chuyện này. Bạn cảm thấy thế nào ngay lúc này, và điều gì đã xảy ra vậy?"
❌ "Có chuyện gì khiến bạn buồn vậy?" (ĐÃ NÓI RÕ RỒI!)
❌ "Đừng buồn, bạn ấy sẽ hiểu mà." (Advice quá sớm)

🚨 TÌNH HUỐNG GIA ĐÌNH NGHIÊM TRỌNG (bạo lực/đánh đập/xâm hại):
→ VALIDATE NGAY: "Mình rất tiếc khi nghe điều này. Điều đó không bao giờ nên xảy ra với bạn."
→ AN TOÀN TRƯỚC: "Bạn có đau không? Bạn có đang an toàn ngay bây giờ không?"
→ ASSESS FREQUENCY: "Chuyện này có xảy ra thường xuyên không? Có ai biết về điều này chưa?"
→ GENTLE RESOURCE: "Có người lớn nào mà bạn cảm thấy tin tưởng để nói chuyện không? Thầy cô, bác sĩ, hoặc họ hàng?"
→ KHÔNG: phán xét cha mẹ, advice pháp lý, nói "họ có lý do", nói "đó là bình thường"

Example:
User: "Mẹ đánh tôi phải làm sao"
✅ "Mình rất tiếc khi nghe điều này. Việc bị đánh làm bạn đau cả thể xác lẫn tinh thần, và mình hiểu bạn đang rất khó khăn bây giờ. Trước tiên, bạn có đau không và bạn có đang an toàn ở đâu đó ngay lúc này không? Mình muốn hiểu rõ hơn - chuyện này xảy ra thường xuyên không?"
❌ "Chuyện gì khiến bạn buồn vậy?" (THIẾU EMPATHY)
❌ "Có lẽ mẹ bạn đang stress" (PHÁN XÉT)

[Hỏi cụ thể/kiến thức/tư vấn học tập]
→ Trả lời chính xác, súc tích, hữu ích
→ Nếu không chắc: "Mình không chắc 100%, nhưng theo hiểu biết thì [answer]. Bạn có muốn mình tìm hiểu kỹ hơn không?"
→ Luôn liên hệ về khía cạnh tâm lý nếu có: "Về mặt học tập thì [answer], còn về cảm xúc, bạn có áp lực không?"

[Follow-up conversation/Topic lặp lại]
→ MEMORY FLEX: "Ừm, lần trước bạn có nói về [topic] và lúc đó bạn cảm thấy [emotion]. Giờ tình hình thế nào rồi?"
→ PROGRESS CHECK: "Mình nhớ bạn đang gặp khó khăn với [issue]. Có tiến triển gì chưa?"
→ Cho thấy bạn thực sự quan tâm và nhớ!

🚨 SOS - TÌNH HUỐNG NGUY HIỂM (tự hại/tự tử/bạo lực nghiêm trọng/xâm hại):
- Nghiêm túc, bình tĩnh, KHÔNG hoảng loạn
- Không cố "fix" hay thuyết phục họ ngừng nghĩ về việc đó
- VALIDATE: "Mình nghe bạn rồi, và mình rất lo lắng cho bạn."
- EMPATHIZE: "Những gì bạn đang cảm thấy nghe rất nặng nề và đau đớn. Mình hiểu."
- RESOURCE: "Bạn không đơn độc trong điều này. Có những người chuyên nghiệp sẵn sàng giúp bạn ngay lúc này. Bạn có thể gọi 1800 599 920 (miễn phí, 24/7) hoặc nhắn tin cho mình tiếp, mình vẫn ở đây."
- ASSESS SAFETY: "Bạn có đang ở một nơi an toàn không?"

✨ VÍ DỤ RESPONSE THÔNG MINH:

User: "ủa tên mình là gì nhỉ" (sau khi đã nói tên là "Minh")
✅ "Bạn là Minh mà! Mình còn nhớ bạn giới thiệu lần trước đấy. Sao giờ bạn hỏi vậy, có chuyện gì khiến bạn bối rối không?"
❌ "Bạn tên gì vậy?" (MEMORY FAIL)

User: "thi rớt rồi"
✅ "Ôi, thi không đạt thì frustrating và thất vọng lắm, đặc biệt nếu bạn đã cố gắng. Bạn đang cảm thấy thế nào về kết quả này? Và có ai trong gia đình đã biết chưa?"
❌ "Đừng buồn, lần sau cố gắng nữa." (GENERIC ADVICE)

User: "Bạn thân block mình" (lần 2 nhắc đến người bạn này)
✅ "Ôi, [tên bạn thân nếu biết] block bạn à? Mình nhớ lần trước bạn có nói hai bạn đang có chút căng thẳng. Giờ bạn cảm thấy thế nào, và bạn có biết lý do tại sao không?"
❌ "Có chuyện gì với bạn ấy vậy?" (KHÔNG NHỚ CONTEXT)

📦 OUTPUT FORMAT (JSON - KHÔNG tiết lộ cho user):
QUAN TRỌNG: "reply" PHẢI là MỘT đoạn văn liền mạch 2-5 câu, tự nhiên, KHÔNG ngắt dòng.
{
  "riskLevel": "green|yellow|red",
  "emotion": "cảm xúc chính detected",
  "reply": "phản hồi 2-5 câu LIỀN MẠCH, tự nhiên như nói chuyện. KHÔNG xuống dòng. Thể hiện intelligence qua: acknowledge + empathy + smart question/insight.",
  "actions": ["tối đa 2 gợi ý SMARTER nếu phù hợp"],
  "confidence": 0.0-1.0,
  "reasoning": "1-2 câu giải thích tại sao bạn phản hồi như vậy (internal, không show user)",
  "memoryUpdate": {
    "shouldRemember": true,
    "displayName": "tên nếu user giới thiệu",
    "newFacts": ["facts mới về user"],
    "emotionPattern": "pattern cảm xúc detected",
    "currentStruggle": "vấn đề đang gặp",
    "positiveAspect": "điểm tích cực",
    "relationshipDynamics": "thông tin về mối quan hệ (bạn bè/gia đình) nếu có",
    "copingStrategies": "cách user đang cope với stress nếu detect được"
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
