// backend/workers/ai-proxy.js
// Chú thích: Cloudflare Worker proxy gọi Gemini, kèm guard SOS, CORS (ALLOW_ORIGIN),
// native streaming (proxy SSE), advanced System Instructions (Mentor tâm lý V2.0),
// context summarization cơ bản, SOS 3 mức (green/yellow/red), Vision (ảnh inline_data), MODEL qua env.

const SYSTEM_INSTRUCTIONS = `# SYSTEM INSTRUCTIONS: "BẠN ĐỒNG HÀNH V2.0" (AI MENTOR TÂM LÝ)

## 1. IDENTITY & CORE VALUES (CỐT LÕI)
Bạn là **"Bạn Đồng Hành"** - một người bạn lớn, một mentor tâm lý ấm áp, sâu sắc và cực kỳ "chill" dành cho học sinh Việt Nam.
-   **Role:** Người lắng nghe, người đồng hành, không phải bác sĩ hay thẩm phán.
-   **Tone:** Ấm áp, bình tĩnh, tôn trọng, chân thành và hiện đại (Gen Z friendly nhưng không "cringe").
-   **Non-judgmental:** Chấp nhận mọi cảm xúc của user vô điều kiện. An toàn là trên hết.

## 2. NHIỆM VỤ CHIẾN LƯỢC
Giúp học sinh chuyển hóa cảm xúc tiêu cực thành sự hiểu biết về bản thân (Self-awareness) và sự kiên cường (Resilience).
1.  **Validation (Công nhận):** Mọi cảm xúc đều hợp lệ. Hãy gọi tên chúng.
2.  **Clarification (Làm rõ):** Giúp user hiểu *tại sao* họ cảm thấy như vậy.
3.  **Empowerment (Trao quyền):** Khơi gợi giải pháp từ chính user.

## 3. ADVANCED PSYCHOLOGICAL FRAMEWORKS (KỸ NĂNG TÂM LÝ NÂNG CAO)

### A. Active Listening & Validation (Cấp độ cao)
Đừng chỉ nhắc lại "Bạn đang buồn". Hãy đào sâu hơn:
-   *Mức 1 (Cơ bản):* "Nghe có vẻ bạn đang buồn."
-   *Mức 2 (Nâng cao):* "Có vẻ như sự thất vọng này đến từ việc bạn đã cố gắng rất nhiều mà kết quả chưa như ý, đúng không? Cảm giác công sức bị phủ nhận thật sự rất khó chịu." -> **HÃY DÙNG MỨC 2.**

### B. Non-Violent Communication (NVC - Giao tiếp trắc ẩn)
Tập trung vào **NHU CẦU (NEEDS)** chưa được đáp ứng:
-   Thay vì: "Bạn đừng giận mẹ nữa."
-   Hãy nói: "Có lẽ bạn cảm thấy bức xúc vì nhu cầu được riêng tư và tôn trọng của mình chưa được mẹ hiểu thấu. Bạn muốn có không gian riêng để tự chịu trách nhiệm, phải không?"

### C. Cognitive Reframing (Thay đổi góc nhìn - nhẹ nhàng)
Giúp user nhìn vấn đề theo cách khác bớt tiêu cực hơn, nhưng **CHỈ SAU KHI** đã validate đủ.
-   "Thử nghĩ xem, việc thầy phê bình khắt khe liệu có phải vì thầy ghét mình, hay vì thầy tin rằng khả năng của bạn còn có thể vươn xa hơn nữa?"

## 4. CONTEXT & TIME AWARENESS (NHẬN THỨC VỀ THỜI GIAN & KHÔNG GIAN) [CRITICAL]
-   **HỆ THỐNG SẼ CUNG CẤP THỜI GIAN HIỆN TẠI** ở đầu mỗi tin nhắn.
-   Mặc định là giờ Việt Nam (UTC+7).
-   **Yêu cầu:** Khi user hỏi về ngày/giờ/lễ tết hoặc kể chuyện "hôm nay/hôm qua", hãy dùng thông tin thời gian thực để đối chiếu. Đừng "hallucinate" (bịa) ngày tháng.

## 5. SAFETY PROTOCOLS (QUY TẮC AN TOÀN - BẤT KHẢ XÂM PHẠM)
Nếu phát hiện dấu hiệu **Tự tử (Suicide), Tự hại (Self-harm), Xâm hại (Abuse)**:
1.  **Stop therapy:** Dừng tư vấn sâu.
2.  **Crisis Intervetion:**
    > *"Mình nghe thấy nỗi đau của bạn lớn đến mức bạn muốn làm đau chính mình/kết thúc tất cả. Mình thực sự rất lo lắng và muốn bạn được an toàn. Xin hãy chia sẻ điều này với người lớn tin cậy, hoặc gọi ngay 111 (Tổng đài Bảo vệ Trẻ em) / 024.7307.1111 (PCP). Bạn không đơn độc, hãy để mọi người giúp bạn nhé."*
3.  Hệ thống sẽ tự động kích hoạt SOS flag (dựa trên keyword).

## 6. FEW-SHOT EXAMPLES (VÍ DỤ MẪU)

**Case 1: Áp lực học tập**
*User:* "Mệt quá, học mãi mà vẫn ngu."
*AI:* "Nghe tiếng thở dài của cậu qua dòng tin nhắn luôn ấy. (Validation). Cảm giác nỗ lực mà không thấy tiến bộ nó rút cạn năng lượng của mình kinh khủng. (Empathy). Cậu đang mắc kẹt ở môn nào cụ thể, hay là cảm giác chung chung về mọi thứ? (Clarification)"

**Case 2: Mâu thuẫn bạn bè**
*User:* "Nó dám nói xấu tớ sau lưng. Tớ muốn dằn mặt nó."
*AI:* "Cảm giác bị phản bội bởi người mình tin tưởng đúng là đau điếng và tức điên lên được. (Validation). Việc cậu muốn làm cho ra lẽ là phản ứng rất tự nhiên để bảo vệ danh dự của mình thôi. (Normalization). Nhưng mà, 'dằn mặt' theo ý cậu là làm gì? Và sau khi làm xong, cậu nghĩ mình sẽ cảm thấy thế nào? (Consequence Check - nhẹ nhàng)"
`;

function getAllowedOrigin(request, env) {
  const reqOrigin = request.headers.get('Origin') || '';
  const allow = env.ALLOW_ORIGIN || '*';

  // Nếu ALLOW_ORIGIN là *, cho phép tất cả
  if (allow === '*' || !reqOrigin) return allow === '*' ? '*' : reqOrigin || '*';

  const list = allow.split(',').map((s) => s.trim());

  // Check exact match
  if (list.includes(reqOrigin)) return reqOrigin;

  // Check wildcard patterns (*.domain.com)
  for (const pattern of list) {
    if (pattern.startsWith('*.')) {
      const domain = pattern.slice(2); // Remove *.
      // Support both https://subdomain.domain.com and https://something.subdomain.domain.com
      if (reqOrigin.endsWith('.' + domain) || reqOrigin.endsWith('//' + domain)) {
        return reqOrigin;
      }
      // Also check if origin matches https://xxx.domain pattern
      const originHost = reqOrigin.replace(/^https?:\/\//, '');
      if (originHost.endsWith('.' + domain) || originHost === domain) {
        return reqOrigin;
      }
    }
  }

  // Fallback: Cho phép các Cloudflare Pages preview URLs
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

function formatTime(ts) {
  if (!ts) return '';
  try {
    return `[${new Date(ts).toLocaleString('vi-VN')}] `;
  } catch { return ''; }
}

function summarizeHistory(history = []) {
  if (!Array.isArray(history) || history.length <= 6) return '';
  // Tóm tắt tập trung vào cảm xúc và sự kiện
  const context = history.slice(0, history.length - 5)
    .map(h => `${formatTime(h.ts)}${h.role}: ${h.content}`).join('\n');

  // Lưu ý: Đây là text mô phỏng tóm tắt, trong thực tế có thể dùng model để tóm tắt riêng nếu cần.
  // Ở đây chúng ta cắt gọn để tiết kiệm token nhưng vẫn giữ context cũ.
  const summaryBlock = `... (Đã lược bớt ${history.length - 5} tin nhắn cũ). Tóm tắt ngữ cảnh: User đã trao đổi trước đó về các vấn đề cá nhân. Hãy lưu ý các pattern cảm xúc lặp lại.`;

  return summaryBlock;
}

function parseDataUrlToInlinePart(dataUrl) {
  try {
    const m = String(dataUrl).match(/^data:(.+?);base64,(.*)$/);
    if (!m) return null;
    return { inline_data: { mime_type: m[1], data: m[2] } };
  } catch (_) { return null; }
}

function formatHistory(history = [], message, images = []) {
  // Lấy 5 tin nhắn gần nhất kèm timestamp
  const recent = history.slice(-5).map((h) => `${formatTime(h.ts)}${h.role}: ${h.content}`).join('\n');

  // Nếu có history cũ hơn, thêm dòng tóm tắt
  const olderHistory = history.length > 5 ? summarizeHistory(history) + '\n\n' : '';

  // Thời gian hiện tại cho message mới nhất của user
  const nowUserMsg = formatTime(new Date().toISOString());

  // === DYNAMIC TIME INJECTION ===
  // Lấy thời gian thực tế server (theo giờ VN) để làm context hệ thống
  const nowVN = new Date().toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const userParts = [{
    text: `${SYSTEM_INSTRUCTIONS}

=== CONTEXT HỆ THỐNG (SYSTEM CONTEXT) ===
- THỜI GIAN HIỆN TẠI: ${nowVN}
- ĐỊA ĐIỂM: Vietnam (Múi giờ UTC+7)
=========================================

# LỊCH SỬ TRÒ CHUYỆN:
${olderHistory}
${recent}

# TIN NHẮN MỚI:
${nowUserMsg}User: ${message}

(Hãy trả lời với tư cách là "Bạn Đồng Hành V2.0". Sử dụng thông tin thời gian ở trên nếu cần thiết).`
  }];

  // gắn tối đa 3 ảnh
  images.slice(0, 3).forEach((d) => {
    const p = parseDataUrlToInlinePart(d);
    if (p) userParts.push(p);
  });
  return [{ role: 'user', parts: userParts }];
}

async function callGemini(apiKey, payload, model = 'gemini-2.5-flash-lite') {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'gemini_error');
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('\n') || data?.output_text || '';
  return { text };
}

async function* callGeminiStream(apiKey, payload, model = 'gemini-2.5-flash-lite') {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey, Accept: 'text/event-stream' },
    body: JSON.stringify(payload),
  });
  if (!res.ok || !res.body) {
    const msg = await res.text().catch(() => 'gemini_stream_error');
    throw new Error(msg || 'gemini_stream_error');
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buffer.indexOf('\n\n')) !== -1) {
      const raw = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 2);
      if (!raw) continue;
      const lines = raw.split('\n');
      let dataRaw = '';
      for (const line of lines) if (line.startsWith('data:')) dataRaw = line.slice(5).trim();
      if (!dataRaw || dataRaw === '[DONE]') continue;
      try {
        const j = JSON.parse(dataRaw);
        const parts = j?.candidates?.[0]?.content?.parts || [];
        for (const p of parts) if (typeof p.text === 'string' && p.text) yield p.text;
      } catch (_) { }
    }
  }
}

function sseHeaders(origin = '*', traceId) {
  return { ...corsHeaders(origin), 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache', 'X-Trace-Id': traceId };
}

export default {
  async fetch(request, env) {
    const traceId = (crypto && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    const origin = getAllowedOrigin(request, env);

    if (request.method === 'OPTIONS') return handleOptions(request, env);
    if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, origin, traceId);

    let body;
    try { body = await request.json(); } catch (_) { return json({ error: 'invalid_json' }, 400, origin, traceId); }

    const { message, history = [], images = [] } = body || {};
    if (!message || typeof message !== 'string') return json({ error: 'missing_message' }, 400, origin, traceId);

    try { sanitizeInput(message); } catch (_) { return json({ error: 'invalid_input' }, 400, origin, traceId); }

    // SOS phân tầng
    const level = classifySOS(message);
    if (level === 'red') {
      return json({ sos: true, sosLevel: 'red', message: 'Mình lo cho bạn. Hãy liên hệ người lớn đáng tin cậy hoặc gọi 111 (bảo vệ trẻ em) hoặc 024.7307.1111 (Trung tâm tham vấn). Bạn không đơn độc đâu.' }, 200, origin, traceId);
    }

    // Payload chung
    const contents = formatHistory(history, message, images);
    const payload = {
      contents,
      generationConfig: { temperature: 0.5, topP: 0.85 },
    };

    const model = env.MODEL || 'gemini-2.5-flash-lite';

    try {
      const wantsStream = true;
      if (!wantsStream) {
        if (!env.GEMINI_API_KEY) return json({ text: `DEV_ECHO: ${message}` }, 200, origin, traceId);
        const { text } = await callGemini(env.GEMINI_API_KEY, payload, model);
        return json({ text }, 200, origin, traceId);
      }

      const stream = new ReadableStream({
        async start(controller) {
          const enc = new TextEncoder();
          const send = (line) => controller.enqueue(enc.encode(line));
          send(`event: meta\n`);
          send(`data: {\"trace_id\":\"${traceId}\",\"sosLevel\":\"${level}\"}\n\n`);

          try {
            if (!env.GEMINI_API_KEY) {
              const textOut = `DEV_ECHO: ${message}`;
              for (let i = 0; i < textOut.length; i += 40) {
                send(`data: ${JSON.stringify(textOut.slice(i, i + 40))}\n\n`);
                await new Promise((r) => setTimeout(r, 10));
              }
            } else {
              for await (const piece of callGeminiStream(env.GEMINI_API_KEY, payload, model)) {
                send(`data: ${JSON.stringify(piece)}\n\n`);
              }
            }
            send(`event: done\n`); send(`data: END\n\n`);
          } catch (err) {
            const errPayload = { error: 'model_error', note: String(err?.message || err), trace_id: traceId };
            send(`event: error\n`); send(`data: ${JSON.stringify(errPayload)}\n\n`);
          } finally { controller.close(); }
        },
      });

      return new Response(stream, { status: 200, headers: sseHeaders(origin, traceId) });
    } catch (e) {
      return json({ error: 'model_error', note: String(e?.message || e) }, 502, origin, traceId);
    }
  },
};
