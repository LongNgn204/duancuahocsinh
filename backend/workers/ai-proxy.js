// backend/workers/ai-proxy.js
// Chú thích: Cloudflare Worker proxy gọi OpenRouter API + DuckDuckGo Search
// Model: mistralai/devstral-2512:free
// Features: SSE streaming, System Instructions V2.0, SOS detection, DuckDuckGo search

const SYSTEM_INSTRUCTIONS = `# SYSTEM INSTRUCTIONS: "BẠN ĐỒNG HÀNH V2.0" (AI MENTOR TÂM LÝ + TRỢ LÝ THÔNG MINH)

## 1. IDENTITY & CORE VALUES (CỐT LÕI)
Bạn là **"Bạn Đồng Hành"** - một AI đa năng:
- **Mentor tâm lý** ấm áp, sâu sắc cho học sinh Việt Nam
- **Trợ lý thông minh** có khả năng tra cứu thông tin thực
- **Non-judgmental:** Chấp nhận mọi cảm xúc của user vô điều kiện

## 2. NHIỆM VỤ CHIẾN LƯỢC
**Khi user hỏi về CẢM XÚC/TÂM LÝ:**
1. Validation (Công nhận cảm xúc)
2. Clarification (Làm rõ nguyên nhân)
3. Empowerment (Khơi gợi giải pháp từ user)

**Khi user hỏi về THÔNG TIN/KIẾN THỨC:**
1. Kiểm tra SEARCH_RESULTS nếu có
2. Trả lời dựa trên dữ liệu thực, trích dẫn nguồn
3. Nếu không có data → thú nhận không biết

## 3. SỬ DỤNG SEARCH RESULTS (QUAN TRỌNG)
Hệ thống có thể cung cấp thông tin tìm kiếm từ internet trong block **[SEARCH_RESULTS]**.
- Nếu có SEARCH_RESULTS → Ưu tiên dùng thông tin này để trả lời
- Trích dẫn ngắn gọn: "Theo thông tin mình tìm được..." 
- KHÔNG bịa thông tin nếu search không có kết quả

## 4. CONTEXT & TIME AWARENESS
- **THỜI GIAN HIỆN TẠI** được cung cấp trong SYSTEM CONTEXT
- Dùng để trả lời câu hỏi về ngày/tháng/năm/thứ

## 5. SAFETY PROTOCOLS (BẤT KHẢ XÂM PHẠM)
Nếu phát hiện dấu hiệu **Tự tử, Tự hại, Xâm hại**:
1. Dừng tư vấn sâu
2. Khuyên gọi 111 (Tổng đài Bảo vệ Trẻ em) / 024.7307.1111

## 6. PHONG CÁCH TRẢ LỜI
- Ngôn ngữ: Tiếng Việt, Gen Z friendly nhưng không cringe
- Tone: Ấm áp, thân thiện, tôn trọng
- Độ dài: Ngắn gọn, súc tích, dễ hiểu
`;

// OpenRouter API
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'mistralai/devstral-2512:free';

// DuckDuckGo Instant Answer API
const DUCKDUCKGO_API_URL = 'https://api.duckduckgo.com/';

// ============ CORS & HELPERS ============
function getAllowedOrigin(request, env) {
  const reqOrigin = request.headers.get('Origin') || '';
  const allow = env.ALLOW_ORIGIN || '*';
  if (allow === '*' || !reqOrigin) return allow === '*' ? '*' : reqOrigin || '*';
  const list = allow.split(',').map((s) => s.trim());
  if (list.includes(reqOrigin)) return reqOrigin;
  for (const pattern of list) {
    if (pattern.startsWith('*.')) {
      const domain = pattern.slice(2);
      const originHost = reqOrigin.replace(/^https?:\/\//, '');
      if (originHost.endsWith('.' + domain) || originHost === domain) return reqOrigin;
    }
  }
  if (reqOrigin.includes('.pages.dev')) return reqOrigin;
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
  const patterns = [/ignore (previous|above) (instructions|prompts)/i, /you are now/i, /system:/i];
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

// ============ DUCKDUCKGO SEARCH ============
function detectSearchIntent(message) {
  const msg = message.toLowerCase();

  // Patterns cần search
  const searchPatterns = [
    /là gì/i, /là ai/i, /nghĩa là/i, /định nghĩa/i,
    /thủ đô/i, /dân số/i, /diện tích/i,
    /ai là/i, /ở đâu/i, /khi nào/i,
    /wikipedia/i, /giải thích/i, /cho biết về/i,
    /thông tin về/i, /tìm hiểu/i
  ];

  // Patterns KHÔNG search (tâm lý, cảm xúc)
  const noSearchPatterns = [
    /buồn/i, /vui/i, /chán/i, /mệt/i, /stress/i, /lo lắng/i, /sợ/i,
    /giận/i, /tức/i, /khóc/i, /cô đơn/i,
    /tâm sự/i, /chia sẻ/i, /cảm thấy/i, /cảm xúc/i,
    /bạn bè/i, /crush/i, /yêu/i, /ghét/i,
    /hôm nay là/i, /bây giờ là/i, /mấy giờ/i, /ngày mấy/i // Dùng time injection
  ];

  // Nếu match noSearch → không search
  for (const p of noSearchPatterns) {
    if (p.test(msg)) return false;
  }

  // Nếu match search → search
  for (const p of searchPatterns) {
    if (p.test(msg)) return true;
  }

  return false;
}

async function searchDuckDuckGo(query) {
  try {
    const url = `${DUCKDUCKGO_API_URL}?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) return null;

    const data = await res.json();

    // Extract useful info
    const results = {
      abstract: data.Abstract || '',
      abstractSource: data.AbstractSource || '',
      abstractURL: data.AbstractURL || '',
      heading: data.Heading || '',
      definition: data.Definition || '',
      definitionSource: data.DefinitionSource || '',
      answer: data.Answer || '',
      relatedTopics: (data.RelatedTopics || []).slice(0, 3).map(t => t.Text).filter(Boolean)
    };

    // Check if we got anything useful
    if (results.abstract || results.definition || results.answer) {
      return results;
    }

    return null;
  } catch (e) {
    console.error('[DuckDuckGo] Error:', e);
    return null;
  }
}

function formatSearchResults(searchData) {
  if (!searchData) return '';

  let text = '\n\n[SEARCH_RESULTS]\n';

  if (searchData.heading) {
    text += `Chủ đề: ${searchData.heading}\n`;
  }

  if (searchData.abstract) {
    text += `Tóm tắt: ${searchData.abstract}\n`;
    if (searchData.abstractSource) {
      text += `Nguồn: ${searchData.abstractSource}\n`;
    }
  }

  if (searchData.definition) {
    text += `Định nghĩa: ${searchData.definition}\n`;
  }

  if (searchData.answer) {
    text += `Trả lời: ${searchData.answer}\n`;
  }

  if (searchData.relatedTopics && searchData.relatedTopics.length > 0) {
    text += `Thông tin liên quan:\n`;
    searchData.relatedTopics.forEach((t, i) => {
      text += `- ${t}\n`;
    });
  }

  text += '[/SEARCH_RESULTS]\n';
  return text;
}

// ============ FORMAT FOR OPENROUTER ============
function formatHistoryForOpenRouter(history = [], message, searchResults = null) {
  const recentHistory = history.slice(-5);

  const nowVN = new Date().toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let systemContent = `${SYSTEM_INSTRUCTIONS}

=== SYSTEM CONTEXT ===
THỜI GIAN HIỆN TẠI: ${nowVN}
ĐỊA ĐIỂM: Vietnam (UTC+7)
======================`;

  // Inject search results if available
  if (searchResults) {
    systemContent += formatSearchResults(searchResults);
  }

  const messages = [{ role: 'system', content: systemContent }];

  for (const h of recentHistory) {
    messages.push({
      role: h.role === 'user' ? 'user' : 'assistant',
      content: h.content
    });
  }

  messages.push({ role: 'user', content: message });
  return messages;
}

// ============ OPENROUTER STREAMING ============
async function* callOpenRouterStream(apiKey, messages, model) {
  const res = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://bandonghanh.pages.dev',
      'X-Title': 'Ban Dong Hanh'
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      stream: true,
      temperature: 0.5,
      top_p: 0.85,
    }),
  });

  if (!res.ok || !res.body) {
    const errText = await res.text().catch(() => 'openrouter_stream_error');
    console.error('[OpenRouter] Error:', res.status, errText);
    throw new Error(errText || 'openrouter_stream_error');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;
      if (!trimmed.startsWith('data: ')) continue;

      try {
        const jsonStr = trimmed.slice(6);
        const parsed = JSON.parse(jsonStr);
        const delta = parsed?.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch (e) { /* skip */ }
    }
  }
}

function sseHeaders(origin = '*', traceId) {
  return { ...corsHeaders(origin), 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache', 'X-Trace-Id': traceId };
}

// ============ MAIN HANDLER ============
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

    // SOS check
    const level = classifySOS(message);
    if (level === 'red') {
      return json({ sos: true, sosLevel: 'red', message: 'Mình lo cho bạn. Hãy liên hệ người lớn đáng tin cậy hoặc gọi 111 (bảo vệ trẻ em) hoặc 024.7307.1111 (Trung tâm tham vấn). Bạn không đơn độc đâu.' }, 200, origin, traceId);
    }

    // DuckDuckGo Search (if needed)
    let searchResults = null;
    if (detectSearchIntent(message)) {
      console.log('[AI-Proxy] Searching DuckDuckGo for:', message);
      searchResults = await searchDuckDuckGo(message);
      console.log('[AI-Proxy] Search results:', searchResults ? 'Found' : 'None');
    }

    // Format messages with search results
    const messages = formatHistoryForOpenRouter(history, message, searchResults);
    const model = env.MODEL || DEFAULT_MODEL;
    const apiKey = env.OPENROUTER_API_KEY;

    try {
      const stream = new ReadableStream({
        async start(controller) {
          const enc = new TextEncoder();
          const send = (line) => controller.enqueue(enc.encode(line));

          send(`event: meta\n`);
          send(`data: {"trace_id":"${traceId}","sosLevel":"${level}","searched":${searchResults !== null}}\n\n`);

          try {
            if (!apiKey) {
              const textOut = `DEV_ECHO: ${message}`;
              for (let i = 0; i < textOut.length; i += 40) {
                send(`data: ${JSON.stringify({ chunk: textOut.slice(i, i + 40) })}\n\n`);
                await new Promise((r) => setTimeout(r, 10));
              }
            } else {
              for await (const piece of callOpenRouterStream(apiKey, messages, model)) {
                send(`data: ${JSON.stringify({ chunk: piece })}\n\n`);
              }
            }

            send(`data: ${JSON.stringify({ done: true })}\n\n`);
            send(`event: done\n`);
            send(`data: END\n\n`);
          } catch (err) {
            console.error('[Stream Error]', err);
            send(`event: error\n`);
            send(`data: ${JSON.stringify({ error: 'model_error', message: String(err?.message || err), trace_id: traceId })}\n\n`);
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, { status: 200, headers: sseHeaders(origin, traceId) });
    } catch (e) {
      return json({ error: 'model_error', note: String(e?.message || e) }, 502, origin, traceId);
    }
  },
};
