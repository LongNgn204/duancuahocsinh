// backend/workers/ai-proxy.js
// Chú thích: AI Chat module sử dụng OpenAI ChatGPT (gpt-4o-mini - model rẻ nhất)
// Thay thế Vertex AI để tiết kiệm chi phí

import { classifyRiskRules, getRedTierResponse } from './risk.js';
import { sanitizeInput } from './sanitize.js';
import { formatMessagesForLLM, getRecentMessages, createMemorySummary } from './memory.js';
import { hybridSearch, formatRAGContext } from './rag.js';
import { redactPII } from './pii-redactor.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

// Model rẻ nhất của OpenAI: gpt-4o-mini (~$0.15/1M input, $0.60/1M output)
const OPENAI_MODEL = 'gpt-4o-mini';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Fallback: OpenRouter nếu muốn dùng multi-provider
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = 'openai/gpt-4o-mini'; // Qua OpenRouter

// System prompt cho Bạn Đồng Hành - người bạn thấu hiểu cảm xúc học sinh
const SYSTEM_PROMPT = `Bạn là "Bạn Đồng Hành", một người bạn AI thân thiết và thấu hiểu cảm xúc dành cho học sinh Việt Nam.

## BẠN LÀ AI
- Người bạn luôn lắng nghe, thấu hiểu và đồng cảm
- Không phán xét, không chỉ trích
- Kiên nhẫn, ấm áp và đáng tin cậy
- Hiểu văn hóa và ngôn ngữ Gen-Z Việt Nam

## BẠN CÓ THỂ GIÚP
- 💭 Tâm sự: lắng nghe và chia sẻ khi buồn, stress, cô đơn
- 📚 Học tập: hỗ trợ giải đáp thắc mắc, động viên khi áp lực
- 👨‍👩‍👧 Gia đình: hiểu và đồng cảm với mâu thuẫn gia đình
- 💕 Bạn bè, tình cảm: lắng nghe và chia sẻ kinh nghiệm
- 🌟 Phát triển bản thân: gợi ý tích cực, xây dựng tự tin

## CÁCH NÓI CHUYỆN
1. Nói tự nhiên như bạn bè, xưng "mình" - gọi "bạn" hoặc "cậu"
2. Lắng nghe trước, sau đó mới đưa lời khuyên (nếu được hỏi)
3. Thể hiện sự đồng cảm: "Mình hiểu cảm giác đó...", "Điều đó chắc khó khăn lắm..."
4. Không giảng đạo, không bắt buộc phải làm gì
5. Dùng emoji nhẹ nhàng: 💙 🌸 ✨ 🤗 💪
6. Nếu không biết chắc, nói thật và gợi ý tìm thêm

## LƯU Ý QUAN TRỌNG
- Nếu bạn có dấu hiệu khủng hoảng (tự hại, muốn chết): NGAY LẬP TỨC khuyên gọi đường dây nóng 111 và tìm người lớn
- Không tư vấn y tế, tâm lý chuyên sâu - khuyên gặp chuyên gia nếu cần
- Bảo mật: không hỏi thông tin cá nhân như địa chỉ, trường, tên thật

## ĐỊNH DẠNG
- Markdown cho lists, bold khi cần nhấn mạnh
- Câu ngắn gọn, dễ đọc trên điện thoại
- LaTeX nếu có công thức: \\(...\\) inline, \\[...\\] block`;

// ============================================================================
// OPENAI API CALL
// ============================================================================

/**
 * Gọi OpenAI ChatGPT API
 * @param {Array} messages - Messages array [{role, content}]
 * @param {Object} env - Cloudflare env
 * @param {Object} options - {stream: boolean, maxTokens: number}
 * @returns {Promise<Response>} Response object
 */
async function callOpenAI(messages, env, options = {}) {
  const {
    stream = true,
    maxTokens = 1024,
    temperature = 0.7,
  } = options;

  // Ưu tiên OpenAI API key, fallback sang OpenRouter
  const apiKey = env.OPENAI_API_KEY || env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('Missing API key: Set OPENAI_API_KEY or OPENROUTER_API_KEY');
  }

  const useOpenRouter = !env.OPENAI_API_KEY && env.OPENROUTER_API_KEY;
  const apiUrl = useOpenRouter ? OPENROUTER_API_URL : OPENAI_API_URL;
  const model = useOpenRouter ? OPENROUTER_MODEL : OPENAI_MODEL;

  const body = {
    model,
    messages,
    max_tokens: maxTokens,
    temperature,
    stream,
  };

  // OpenRouter cần thêm headers
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };

  if (useOpenRouter) {
    headers['HTTP-Referer'] = 'https://duancuahocsinh.pages.dev';
    headers['X-Title'] = 'Ban Dong Hanh';
  }

  console.log(`[AI] Calling ${useOpenRouter ? 'OpenRouter' : 'OpenAI'} with model: ${model}`);

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[AI] API Error:', response.status, errorText);
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  return response;
}

/**
 * Parse SSE stream từ OpenAI
 * @param {ReadableStream} stream 
 * @returns {AsyncGenerator<string>} Text chunks
 */
async function* parseSSEStream(stream) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') return;

          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content;
            if (content) yield content;
          } catch {
            // Ignore parse errors
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ============================================================================
// RAG - Retrieve context từ knowledge base
// ============================================================================

async function getRAGContext(env, query) {
  if (!env.ban_dong_hanh_db) return null;

  try {
    // Lấy tất cả documents từ knowledge_base
    const result = await env.ban_dong_hanh_db.prepare(
      'SELECT id, content, source, category FROM knowledge_base WHERE is_active = 1 LIMIT 100'
    ).all();

    if (!result.results || result.results.length === 0) {
      return null;
    }

    // Hybrid search
    const topDocs = await hybridSearch(query, result.results, env, {
      topK: 3,
      bm25Weight: 0.6,
      denseWeight: 0.4,
    });

    if (topDocs.length === 0) return null;

    return formatRAGContext(topDocs);
  } catch (error) {
    console.warn('[AI] RAG error:', error.message);
    return null;
  }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export default {
  async fetch(request, env) {
    // Chỉ accept POST
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const t0 = Date.now();

    try {
      const body = await request.json();
      const { message, history = [], stream = true } = body;

      // Validate input
      let sanitizedMessage;
      try {
        sanitizedMessage = sanitizeInput(message);
      } catch (err) {
        return new Response(JSON.stringify({
          error: err.message,
          reply: 'Vui lòng nhập tin nhắn hợp lệ.',
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // PII Redaction
      const redactedMessage = redactPII(sanitizedMessage);

      // Risk classification
      const riskLevel = classifyRiskRules(redactedMessage, history);
      console.log('[AI] Risk level:', riskLevel);

      // RED tier - trả về ngay với hotline info
      if (riskLevel === 'red') {
        const redResponse = getRedTierResponse();
        return new Response(JSON.stringify(redResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Get RAG context (cho câu hỏi học thuật)
      const ragContext = await getRAGContext(env, redactedMessage);

      // Create memory summary nếu history dài
      const memorySummary = createMemorySummary(history, 8);

      // Build system prompt với RAG context
      let systemPrompt = SYSTEM_PROMPT;
      if (ragContext) {
        systemPrompt += `\n\n${ragContext}`;
      }

      // Format messages cho LLM
      const messages = formatMessagesForLLM(
        systemPrompt,
        history,
        redactedMessage,
        memorySummary
      );

      // Gọi OpenAI
      const response = await callOpenAI(messages, env, { stream, maxTokens: 1024 });

      // Streaming response
      if (stream) {
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        const encoder = new TextEncoder();

        // Process stream in background
        (async () => {
          let fullResponse = '';
          try {
            for await (const chunk of parseSSEStream(response.body)) {
              fullResponse += chunk;
              // Gửi chunk với format SSE
              await writer.write(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
            }

            // Gửi done signal
            await writer.write(encoder.encode(`data: ${JSON.stringify({
              done: true,
              fullResponse,
              riskLevel,
              hasRAG: !!ragContext,
              latencyMs: Date.now() - t0,
            })}\n\n`));
          } catch (err) {
            await writer.write(encoder.encode(`data: ${JSON.stringify({
              error: err.message,
            })}\n\n`));
          } finally {
            await writer.close();
          }
        })();

        return new Response(readable, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      }

      // Non-streaming response
      const result = await response.json();
      const reply = result.choices?.[0]?.message?.content || 'Xin lỗi, mình không hiểu.';

      const latencyMs = Date.now() - t0;
      console.log('[AI] Response done', { latencyMs, riskLevel, hasRAG: !!ragContext });

      return new Response(JSON.stringify({
        reply,
        riskLevel,
        hasRAG: !!ragContext,
        latencyMs,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

    } catch (error) {
      console.error('[AI] Error:', error.message);
      return new Response(JSON.stringify({
        error: 'server_error',
        message: error.message,
        reply: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
};
