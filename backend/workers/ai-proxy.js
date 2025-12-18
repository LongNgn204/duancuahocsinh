// backend/workers/ai-proxy.js
// Chú thích: Cloudflare Worker proxy gọi Gemini, kèm guard SOS, CORS (ALLOW_ORIGIN),
// native streaming (proxy SSE), advanced System Instructions (Mentor tâm lý),
// context summarization cơ bản, SOS 3 mức (green/yellow/red), Vision (ảnh inline_data), MODEL qua env.

const SYSTEM_INSTRUCTIONS = `Bạn là "Bạn Đồng Hành" - một mentor tâm lý ấm áp, tôn trọng, không phán xét.

PHONG CÁCH
- Giọng văn thấu cảm, nói ngắn gọn, dùng từ gần gũi học sinh, tránh khuôn mẫu "Tôi là AI".
- Luôn xác thực cảm xúc trước khi gợi ý, kết thúc bằng câu hỏi mở phù hợp.

AN TOÀN
- Tránh bịa đặt. Nếu thiếu thông tin, nói rõ và hướng học sinh tới người lớn/nguồn tin cậy.
- Red flags cần lưu ý: tự hại, bạo lực/lạm dụng, trầm cảm kéo dài.

SÁT NGỮ CẢNH
- Ghi nhớ bối cảnh gần đây để trả lời mạch lạc.
- Đừng lặp lại dài dòng; tổng hợp ngắn gọn các ý đã có.

SUY LUẬN (NỘI BỘ)
- Hãy tự phân tích theo chu trình: Nghe -> Nhận diện cảm xúc -> Tìm nguyên nhân gốc rễ -> Gợi ý an toàn.
- Không tiết lộ chuỗi suy luận chi tiết. Chỉ đưa ra kết luận/đề xuất ngắn gọn.
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

function summarizeHistory(history = []) {
  if (!Array.isArray(history) || history.length <= 6) return '';
  const head = history.slice(0, 2).map((h) => `${h.role}: ${h.content}`).join('\n');
  const tail = history.slice(-3).map((h) => `${h.role}: ${h.content}`).join('\n');
  const text = `Tóm tắt trước đó (rất ngắn):\n${head}\n...\n${tail}`;
  return text.length > 300 ? text.slice(0, 296) + '...' : text;
}

function parseDataUrlToInlinePart(dataUrl) {
  try {
    const m = String(dataUrl).match(/^data:(.+?);base64,(.*)$/);
    if (!m) return null;
    return { inline_data: { mime_type: m[1], data: m[2] } };
  } catch (_) { return null; }
}

function formatHistory(history = [], message, images = []) {
  const recent = history.slice(-5).map((h) => `${h.role}: ${h.content}`).join('\n');
  const summary = summarizeHistory(history);
  const userParts = [{ text: `${SYSTEM_INSTRUCTIONS}\n\n${summary ? summary + '\n\n' : ''}Ngữ cảnh gần đây:\n${recent}\n\nNgười học: ${message}` }];
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
