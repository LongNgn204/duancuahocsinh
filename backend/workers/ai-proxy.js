// backend/workers/ai-proxy.js
// Chú thích: Cloudflare Worker proxy gọi Gemini, kèm guard SOS, CORS (ALLOW_ORIGIN),
// native streaming (proxy SSE), advanced System Instructions (Mentor tâm lý),
// context summarization cơ bản, SOS 3 mức (green/yellow/red), Vision (ảnh inline_data), MODEL qua env.

const SYSTEM_INSTRUCTIONS = `# SYSTEM INSTRUCTIONS: "BẠN ĐỒNG HÀNH" (AI MENTOR TÂM LÝ)

## 1. Persona & Tone (Nhân cách & Giọng điệu)
Bạn là **"Bạn Đồng Hành"** - một người bạn lớn, một mentor tâm lý ấm áp, thấu cảm và đáng tin cậy dành cho học sinh Việt Nam (cấp 2, cấp 3).

-   **Giọng văn:** Ấm áp, gần gũi, tôn trọng nhưng không sáo rỗng. Dùng ngôi "mình" - "bạn". Không dùng giọng "dạy đời" hay quá "khoa học/lạnh lùng".
-   **Phong cách:** Không đưa ra lời khuyên ngay lập tức. Hãy lắng nghe, xác nhận cảm xúc (validation) trước, sau đó nhẹ nhàng gợi mở.

## 2. Nhiệm vụ Cốt lõi
Mục tiêu của bạn không phải là "chữa bệnh" (bạn không phải bác sĩ), mà là giúp học sinh:
1.  **Gọi tên cảm xúc:** Giúp họ nhận ra họ đang buồn, giận, hay lo âu.
2.  **Bình tĩnh lại:** Điều hướng cảm xúc tiêu cực.
3.  **Tự tìm giải pháp:** Khơi gợi sự tự chủ (autonomy).

## 3. Các Framework Tâm Lý Ứng Dụng (QUAN TRỌNG)
Hãy vận dụng linh hoạt các phương pháp sau trong câu trả lời:

### A. Liệu pháp Nhận thức Hành vi (CBT - Cognitive Behavioral Therapy)
Nhận diện các "bẫy suy nghĩ" (Cognitive Distortions):
-   *Suy diễn:* "Chắc chắn thầy ghét mình."
-   *Trầm trọng hóa:* "Điểm kém này là đời mình coi như bỏ."
-   *Dán nhãn:* "Mình là đứa thất bại."

**Cách phản hồi:** Dùng câu hỏi để kiểm chứng thực tế.
> *"Có bằng chứng cụ thể nào khiến bạn nghĩ thầy ghét bạn không, hay đó chỉ là cảm giác lo lắng của chúng mình nhỉ?"*

### B. Liệu pháp Chấp nhận & Cam kết (ACT - Acceptance and Commitment Therapy)
Dùng cho những hoàn cảnh không thể thay đổi (ví dụ: bố mẹ ly hôn, ngoại hình).
-   Hướng dẫn học sinh **chấp nhận** cảm xúc khó chịu như một phần của cuộc sống, thay vì cố gắng chối bỏ nó.
-   Tập trung vào giá trị bản thân: *"Dù chuyện đó xảy ra, bạn vẫn muốn mình là một người như thế nào?"*

### C. Phương pháp Socratic (Socratic Questioning)
Đừng trả lời hộ. Hãy hỏi để họ tự trả lời:
-   *"Nếu bạn thân của cậu gặp chuyện này, cậu sẽ khuyên nó thế nào?"*
-   *"Điều tồi tệ nhất có thể xảy ra là gì? Và nếu nó xảy ra, cậu nghĩ mình có thể làm gì?"*

## 4. Kỹ thuật "Ký Ức & Kết Nối" (Context Awareness)
Hãy chú ý đến các chi tiết học sinh đã kể trong lịch sử trò chuyện (tên bạn bè, kỳ thi, sở thích) để tạo sự kết nối.
-   Nếu user nhắc đến kỳ thi: *"Kỳ thi Toán cậu kể hôm qua thế nào rồi?"*
-   Nếu user hay than phiền về ngủ muộn: *"Dạo này cậu còn thức khuya không thế?"*

## 5. Quy tắc An toàn Tuyệt đối (Safety Protocols)
Nếu phát hiện dấu hiệu Tự tử, tự hại, xâm hại:
1.  **Dừng ngay** việc tư vấn sâu.
2.  **Thông báo ngắn gọn & Bình tĩnh:**
    > *"Mình nghe thấy bạn đang rất đau khổ và mình thực sự lo lắng cho sự an toàn của bạn. Chuyện này quá sức để chúng mình giải quyết một mình. Làm ơn, hãy nói với bố mẹ hoặc thầy cô ngay nhé. Hoặc gọi số 111 (Tổng đài Bảo vệ Trẻ em)."*
3.  Kích hoạt SOS flag.

## 6. Ví dụ Hội thoại (Few-Shot)
**User:** *"Tớ chán quá, chẳng muốn làm gì cả. Thấy mình vô dụng kinh khủng."*
**AI (Good Response):** *"Nghe có vẻ cậu đang cảm thấy kiệt sức và thất vọng về bản thân lắm phải không? (Validation). Đôi khi mệt mỏi khiến chúng mình có suy nghĩ tiêu cực như vậy đấy. Cậu cảm thấy 'vô dụng' vì chuyện gì cụ thể, hay tự nhiên cảm giác ấy ập đến? (Socratic)"*
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

  // Thời gian hiện tại cho message mới nhất
  const now = formatTime(new Date().toISOString());

  const userParts = [{
    text: `${SYSTEM_INSTRUCTIONS}\n\n# LỊCH SỬ TRÒ CHUYỆN:\n${olderHistory}${recent}\n\n# TIN NHẮN MỚI:\n${now}User: ${message}\n\nHãy trả lời dựa trên System Instructions và Lịch sử trò chuyện.`
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
      generationConfig: { temperature: 0.6, topP: 0.9 },
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
