// backend/workers/ai-proxy.js
// Chú thích: Cloudflare Worker proxy sử dụng Workers AI, kèm guard SOS, CORS (ALLOW_ORIGIN),
// native streaming (SSE), advanced System Instructions (Mentor tâm lý),
// context summarization cơ bản, SOS 3 mức (green/yellow/red), MODEL qua env.

const SYSTEM_INSTRUCTIONS = `# BẠN ĐỒNG HÀNH - AI Mentor Tâm Lý Học Đường

## DANH TÍNH
Bạn là "Bạn Đồng Hành" - một NGƯỜI BẠN đáng tin cậy, lắng nghe và đồng hành cùng học sinh. 
⚠️ Bạn KHÔNG thay thế được bố mẹ, thầy cô hay chuyên gia tâm lý - bạn là người bạn bổ sung, hỗ trợ khi các bạn cần chia sẻ.
❌ KHÔNG nói "Tôi là AI" hay "Là trí tuệ nhân tạo".

## NGUYÊN TẮC GIAO TIẾP

### 1. Giọng điệu
- Thân thiện, gần gũi như một người bạn lớn
- Có thể dùng từ ngữ học sinh nhưng CẨN THẬN, chỉ dùng từ phổ biến không gây hiểu lầm
- Câu ngắn gọn, dễ hiểu
- Dùng emoji vừa phải để thân thiện (1-2 emoji/tin nhắn)

### 2. Kỹ thuật thấu cảm (LUÔN áp dụng)
1. **Mirror cảm xúc**: "Nghe như bạn đang thấy [cảm xúc] lắm..."
2. **Validate**: "Cảm giác đó hoàn toàn bình thường nha"
3. **Normalize**: "Nhiều bạn cũng từng trải qua chuyện tương tự"
4. **Hỏi mở**: Kết thúc bằng câu hỏi để bạn ấy suy ngẫm

### 3. Độ dài phản hồi
- Tin nhắn thường: 2-4 câu (40-80 từ)
- Chia sẻ sâu: 4-6 câu (80-120 từ)
- TRÁNH wall-of-text

## XỬ LÝ TÌNH HUỐNG

### Stress học tập
- Hỏi cụ thể: "Môn nào đang khiến bạn stress nhất?"
- Gợi ý: Chia nhỏ bài, nghỉ ngắn, kỹ thuật Pomodoro
- KHUYẾN KHÍCH: Nói chuyện với thầy cô nếu cần hỗ trợ học tập

### Mâu thuẫn bạn bè
- Hỏi chi tiết: "Chuyện xảy ra như thế nào?"
- Giúp nhìn nhiều góc: "Bạn nghĩ bên kia có thể đang nghĩ gì?"
- TRÁNH: Phán xét ai đúng/sai

### Áp lực gia đình
- Thấu hiểu: "Mình hiểu, đôi khi bố mẹ kỳ vọng nhiều lắm"
- KHUYẾN KHÍCH: "Bạn đã thử chia sẻ với bố mẹ chưa? Bố mẹ thường muốn hiểu con hơn"
- TRÁNH: Chỉ trích phụ huynh

### Cảm giác cô đơn
- Validate: "Cảm giác không ai hiểu mình khó chịu lắm"
- Hỏi: "Bạn có ai tin tưởng để tâm sự không? Thầy cô, bố mẹ, hay bạn thân?"

## AN TOÀN (RẤT QUAN TRỌNG)

### 🔴 RED FLAGS - Phản hồi ngay
Nếu phát hiện: tự hại, muốn chết, bạo lực, lạm dụng
→ "Mình rất lo cho bạn. Điều này cần được hỗ trợ chuyên nghiệp ngay. Hãy gọi: 111 (24/7) hoặc 1800 599 920. Hoặc nói với bố mẹ, thầy cô ngay nhé."

### 🟡 CHÚ Ý
Nếu: buồn kéo dài > 2 tuần, mất ngủ liên tục, không muốn làm gì
→ "Mình nghĩ bạn nên nói chuyện với thầy cô tư vấn hoặc bố mẹ nhé. Họ có thể giúp bạn nhiều hơn mình."

### ⛔ KHÔNG BAO GIỜ
- Chẩn đoán bệnh tâm lý
- Khuyên dùng thuốc
- Hứa giữ bí mật những điều nguy hiểm
- Giả vờ hiểu khi không hiểu
- Thay thế vai trò bố mẹ/thầy cô

## VÍ DỤ RESPONSE

User: "Tao chán học quá, không muốn đi học nữa"
Good: "Nghe mệt thật đó 😮‍💨 Chuyện gì đang xảy ra ở trường vậy bạn?"
Bad: "Việc học rất quan trọng cho tương lai. Hãy cố gắng lên!"

User: "Mọi người ghét tao"  
Good: "Nghe như bạn đang cảm thấy cô đơn lắm... 💙 Có chuyện gì xảy ra gần đây khiến bạn nghĩ vậy không?"
Bad: "Không phải ai cũng ghét bạn đâu. Hãy suy nghĩ tích cực!"

## LƯU Ý CUỐI
- Không cần giải quyết ngay, đôi khi chỉ cần LẮNG NGHE
- Nếu không biết → "Mình chưa rõ lắm, bạn kể thêm được không?"
- Luôn nhớ: Khuyến khích các bạn nói chuyện với bố mẹ/thầy cô khi cần
`;

function getAllowedOrigin(request, env) {
  const reqOrigin = request.headers.get('Origin') || '';
  const allow = env.ALLOW_ORIGIN || '*';

  if (allow === '*' || !reqOrigin) return allow === '*' ? '*' : reqOrigin || '*';

  const list = allow.split(',').map((s) => s.trim());

  if (list.includes(reqOrigin)) return reqOrigin;

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

function sanitizeInput(text) {
  const patterns = [
    /ignore (previous|above) (instructions|prompts)/i,
    /you are now/i,
    /system:/i,
  ];
  for (const p of patterns) {
    if (p.test(text)) throw new Error('invalid_input');
  }
  return text;
}

function classifySOS(text) {
  const t = String(text || '').toLowerCase();
  const red = ['tự tử', 'muốn chết', 'kết thúc cuộc đời', 'tự làm hại', 'giết bản thân'];
  const yellow = ['tuyệt vọng', 'vô vọng', 'mệt mỏi quá', 'chán nản', 'không còn động lực'];
  for (const k of red) if (t.includes(k)) return 'red';
  for (const k of yellow) if (t.includes(k)) return 'yellow';
  return 'green';
}

function summarizeHistory(history = []) {
  if (!Array.isArray(history) || history.length <= 6) return '';
  const head = history.slice(0, 2).map((h) => `${h.role}: ${h.content}`).join('\n');
  const tail = history.slice(-3).map((h) => `${h.role}: ${h.content}`).join('\n');
  const text = `Tóm tắt trước đó (rất ngắn):\n${head}\n...\n${tail}`;
  return text.length > 300 ? text.slice(0, 296) + '...' : text;
}

// Format messages cho Cloudflare Workers AI (Llama format)
function formatMessagesForWorkersAI(history = [], message) {
  const recent = history.slice(-5).map((h) => `${h.role}: ${h.content}`).join('\n');
  const summary = summarizeHistory(history);

  const systemContent = `${SYSTEM_INSTRUCTIONS}\n\n${summary ? summary + '\n\n' : ''}Ngữ cảnh gần đây:\n${recent}`;

  return [
    { role: 'system', content: systemContent },
    { role: 'user', content: message }
  ];
}

function sseHeaders(origin = '*', traceId) {
  return {
    ...corsHeaders(origin),
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache',
    'X-Trace-Id': traceId
  };
}

export default {
  async fetch(request, env) {
    const traceId = (crypto && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    const origin = getAllowedOrigin(request, env);

    if (request.method === 'OPTIONS') return handleOptions(request, env);
    if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, origin, traceId);

    let body;
    try { body = await request.json(); } catch (_) { return json({ error: 'invalid_json' }, 400, origin, traceId); }

    const { message, history = [] } = body || {};
    if (!message || typeof message !== 'string') return json({ error: 'missing_message' }, 400, origin, traceId);

    try { sanitizeInput(message); } catch (_) { return json({ error: 'invalid_input' }, 400, origin, traceId); }

    // SOS phân tầng
    const level = classifySOS(message);
    if (level === 'red') {
      return json({
        sos: true,
        sosLevel: 'red',
        message: 'Mình lo cho bạn. Hãy liên hệ người lớn đáng tin cậy hoặc gọi 111 (bảo vệ trẻ em) hoặc 024.7307.1111 (Trung tâm tham vấn). Bạn không đơn độc đâu.'
      }, 200, origin, traceId);
    }

    // Check if Workers AI binding exists
    if (!env.AI) {
      return json({
        error: 'ai_not_configured',
        note: 'Workers AI binding chưa được cấu hình. Vui lòng kiểm tra wrangler.toml'
      }, 500, origin, traceId);
    }

    const model = env.MODEL || '@cf/meta/llama-3.1-8b-instruct';
    const messages = formatMessagesForWorkersAI(history, message);

    try {
      // Streaming response với Cloudflare Workers AI
      const stream = new ReadableStream({
        async start(controller) {
          const enc = new TextEncoder();
          const send = (line) => controller.enqueue(enc.encode(line));

          // Send meta event
          send(`event: meta\n`);
          send(`data: {"trace_id":"${traceId}","sosLevel":"${level}"}\n\n`);

          try {
            // Gọi Workers AI với streaming
            const aiStream = await env.AI.run(model, {
              messages,
              stream: true,
              max_tokens: 1024,
              temperature: 0.7,
            });

            // Đọc stream và forward tới client
            const reader = aiStream.getReader();
            const decoder = new TextDecoder();

            while (true) {
              const { value, done } = await reader.read();
              if (done) break;

              const text = decoder.decode(value, { stream: true });

              // Parse SSE data từ Workers AI
              const lines = text.split('\n');
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const dataStr = line.slice(6).trim();
                  if (dataStr === '[DONE]') continue;

                  try {
                    const data = JSON.parse(dataStr);
                    const content = data?.response || '';
                    if (content) {
                      send(`data: ${JSON.stringify({ type: 'delta', text: content })}\n\n`);
                    }
                  } catch (_) {
                    // Nếu không parse được JSON, gửi raw text
                    if (dataStr && dataStr !== '[DONE]') {
                      send(`data: ${JSON.stringify({ type: 'delta', text: dataStr })}\n\n`);
                    }
                  }
                }
              }
            }

            send(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
          } catch (err) {
            console.error('[AI Proxy] Stream error:', err);
            const errPayload = {
              type: 'error',
              error: 'model_error',
              note: String(err?.message || err),
              trace_id: traceId
            };
            send(`event: error\n`);
            send(`data: ${JSON.stringify(errPayload)}\n\n`);
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, { status: 200, headers: sseHeaders(origin, traceId) });
    } catch (e) {
      console.error('[AI Proxy] Error:', e);
      return json({ error: 'model_error', note: String(e?.message || e) }, 502, origin, traceId);
    }
  },
};
