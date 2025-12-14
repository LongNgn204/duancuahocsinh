var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// .wrangler/tmp/bundle-DOY1fv/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
var init_strip_cf_connecting_ip_header = __esm({
  ".wrangler/tmp/bundle-DOY1fv/strip-cf-connecting-ip-header.js"() {
    __name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        return Reflect.apply(target, thisArg, [
          stripCfConnectingIPHeader.apply(null, argArray)
        ]);
      }
    });
  }
});

// wrangler-modules-watch:wrangler:modules-watch
var init_wrangler_modules_watch = __esm({
  "wrangler-modules-watch:wrangler:modules-watch"() {
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// node_modules/wrangler/templates/modules-watch-stub.js
var init_modules_watch_stub = __esm({
  "node_modules/wrangler/templates/modules-watch-stub.js"() {
    init_wrangler_modules_watch();
  }
});

// workers/risk.js
function classifyRiskRules(text, history = []) {
  if (!text)
    return "green";
  const t = String(text).toLowerCase();
  const tNorm = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const pattern of RED_PATTERNS) {
    const p = pattern.toLowerCase();
    const pNorm = p.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (t.includes(p) || tNorm.includes(pNorm)) {
      return "red";
    }
  }
  for (const pattern of YELLOW_PATTERNS) {
    const p = pattern.toLowerCase();
    const pNorm = p.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (t.includes(p) || tNorm.includes(pNorm)) {
      return "yellow";
    }
  }
  if (Array.isArray(history) && history.length >= 3) {
    const recentTexts = history.slice(-3).map((h) => String(h.content || "").toLowerCase()).join(" ");
    let yellowCount = 0;
    for (const pattern of YELLOW_PATTERNS) {
      if (recentTexts.includes(pattern.toLowerCase()))
        yellowCount++;
    }
    if (yellowCount >= 2)
      return "yellow";
  }
  return "green";
}
function getRedTierResponse() {
  return {
    sos: true,
    sosLevel: "red",
    riskLevel: "red",
    emotion: "nguy c\u1EA5p",
    reply: "M\xECnh r\u1EA5t lo cho b\u1EA1n. H\xE3y li\xEAn h\u1EC7 ngay v\u1EDBi ng\u01B0\u1EDDi l\u1EDBn \u0111\xE1ng tin c\u1EADy ho\u1EB7c g\u1ECDi \u0111\u01B0\u1EDDng d\xE2y h\u1ED7 tr\u1EE3 b\xEAn d\u01B0\u1EDBi. B\u1EA1n kh\xF4ng \u0111\u01A1n \u0111\u1ED9c.",
    nextQuestion: "",
    actions: [
      "\u{1F4DE} \u0110\u01B0\u1EDDng d\xE2y n\xF3ng b\u1EA3o v\u1EC7 tr\u1EBB em: 111 (mi\u1EC5n ph\xED, 24/7)",
      "\u{1F4DE} T\u1ED5ng \u0111\xE0i t\u01B0 v\u1EA5n s\u1EE9c kh\u1ECFe t\xE2m th\u1EA7n: 1800 599 913 (mi\u1EC5n ph\xED)",
      "\u{1F4DE} \u0110\u01B0\u1EDDng d\xE2y h\u1ED7 tr\u1EE3 ph\u1EE5 n\u1EEF v\xE0 tr\u1EBB em: 1800 1567 (mi\u1EC5n ph\xED)",
      "\u{1F4AC} Nh\u1EAFn tin cho b\u1ED1 m\u1EB9, th\u1EA7y c\xF4, ho\u1EB7c ng\u01B0\u1EDDi l\u1EDBn b\u1EA1n tin t\u01B0\u1EDFng ngay b\xE2y gi\u1EDD"
    ],
    confidence: 1,
    disclaimer: "\u0110\xE2y l\xE0 h\u1ED7 tr\u1EE3 ban \u0111\u1EA7u. C\xE1c \u0111\u01B0\u1EDDng d\xE2y tr\xEAn c\xF3 chuy\xEAn gia s\u1EB5n s\xE0ng l\u1EAFng nghe b\u1EA1n 24/7."
  };
}
var RED_PATTERNS, YELLOW_PATTERNS;
var init_risk = __esm({
  "workers/risk.js"() {
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    RED_PATTERNS = [
      // Ý định tự hại rõ ràng
      "t\u1EF1 t\u1EED",
      "t\u1EF1 v\u1EABn",
      "t\u1EF1 s\xE1t",
      "mu\u1ED1n ch\u1EBFt",
      "m\xFAn ch\u1EBFt",
      "muon chet",
      "k\u1EBFt th\xFAc cu\u1ED9c \u0111\u1EDDi",
      "k\u1EBFt th\xFAc t\u1EA5t c\u1EA3",
      "ch\u1EBFt \u0111i cho r\u1ED3i",
      "ch\u1EBFt \u0111i",
      "ch\u1EBFt \u0111c r\u1ED3i",
      "kh\xF4ng mu\u1ED1n s\u1ED1ng",
      "k mu\u1ED1n s\u1ED1ng",
      "ko muon song",
      "s\u1ED1ng l\xE0m g\xEC",
      "s\u1ED1ng \u0111\u1EC3 l\xE0m g\xEC",
      "s\u1ED1ng chi",
      "mu\u1ED1n bi\u1EBFn m\u1EA5t",
      "bi\u1EBFn m\u1EA5t kh\u1ECFi \u0111\u1EDDi",
      // Tự làm hại
      "t\u1EF1 l\xE0m h\u1EA1i",
      "t\u1EF1 c\u1EAFt",
      "r\u1EA1ch tay",
      "u\u1ED1ng thu\u1ED1c ng\u1EE7",
      "overdose",
      "t\u1EF1 hurt",
      // Bạo lực/lạm dụng
      "b\u1ECB x\xE2m h\u1EA1i",
      "b\u1ECB l\u1EA1m d\u1EE5ng",
      "b\u1ECB s\u1EDD so\u1EA1ng",
      // Có kế hoạch cụ thể
      "\u0111\xE3 chu\u1EA9n b\u1ECB",
      "c\xF3 k\u1EBF ho\u1EA1ch",
      "ngay b\xE2y gi\u1EDD",
      // ===== GEN Z VOCABULARY - PHASE 1 ADDITION =====
      // Tiếng lóng "muốn chết"
      "m\xFAn \u0111i lu\xF4n",
      "mu\u1ED1n \u0111i lu\xF4n",
      "\u0111i lu\xF4n cho r\u1ED3i",
      "ng\u1EE7 lu\xF4n",
      "ng\u1EE7 m\xE3i",
      "sleep forever",
      "\u0111i kh\u1ECFi th\u1EBF gi\u1EDBi",
      "r\u1EDDi kh\u1ECFi th\u1EBF gi\u1EDBi n\xE0y",
      "end game",
      "game over \u0111\u1EDDi",
      "gg \u0111i",
      "b\xE1i bai th\u1EBF gi\u1EDBi",
      "bye bye cu\u1ED9c \u0111\u1EDDi",
      // Mạng xã hội style
      "ko th\u1EC3 ti\u1EBFp t\u1EE5c n\u1EEFa",
      "h\u1EBFt n\u0103ng l\u01B0\u1EE3ng s\u1ED1ng",
      "c\u1EA1n pin r\u1ED3i",
      "bat low qu\xE1",
      "energy = 0",
      // Viết tắt phổ biến
      "kts",
      "mu\u1ED1n c",
      "mu\u1ED1n die",
      // Patterns mới - Phase 4
      "kh\xF4ng c\xF2n l\xFD do s\u1ED1ng",
      "h\u1EBFt l\xFD do s\u1ED1ng",
      "t\u1ED1t nh\u1EA5t l\xE0 ch\u1EBFt",
      "ch\u1EBFt l\xE0 gi\u1EA3i ph\xE1p",
      "s\u1EBD t\u1EF1 t\u1EED",
      "s\u1EBD t\u1EF1 s\xE1t",
      "s\u1EBD t\u1EF1 v\u1EABn",
      "c\xF3 dao",
      "c\xF3 thu\u1ED1c",
      "c\xF3 d\xE2y",
      "l\u1EA7n cu\u1ED1i",
      "l\u1EDDi cu\u1ED1i",
      "t\u1EA1m bi\u1EC7t",
      "kh\xF4ng c\xF2n c\xE1ch n\xE0o",
      "h\u1EBFt c\xE1ch"
    ];
    YELLOW_PATTERNS = [
      // Tuyệt vọng kéo dài
      "tuy\u1EC7t v\u1ECDng",
      "h\u1EBFt hy v\u1ECDng",
      "v\xF4 v\u1ECDng",
      "kh\xF4ng ai quan t\xE2m",
      "kh\xF4ng ai hi\u1EC3u",
      "k ai quan t\xE2m",
      "v\xF4 d\u1EE5ng",
      "v\xF4 \xEDch",
      "th\u1EEBa th\xE3i",
      "g\xE1nh n\u1EB7ng cho m\u1ECDi ng\u01B0\u1EDDi",
      "l\xE0 g\xE1nh n\u1EB7ng",
      "kh\xF4ng x\u1EE9ng \u0111\xE1ng",
      "k x\u1EE9ng \u0111\xE1ng",
      "b\u1EBF t\u1EAFc ho\xE0n to\xE0n",
      "kh\xF4ng c\xF3 l\u1ED1i tho\xE1t",
      // Bắt nạt nặng
      "b\u1ECB b\u1EAFt n\u1EA1t",
      "b\u1ECB bully",
      "b\u1ECB \u0111\xE1nh",
      "b\u1ECB \u0111e d\u1ECDa",
      "b\u1ECB \xE9p bu\u1ED9c",
      // Mơ hồ "không muốn sống"
      "kh\xF4ng mu\u1ED1n th\u1EE9c d\u1EADy",
      "ch\xE1n s\u1ED1ng",
      "m\u1EC7t m\u1ECFi v\u1EDBi cu\u1ED9c s\u1ED1ng",
      // ===== GEN Z VOCABULARY - PHASE 1 ADDITION =====
      // Tiếng lóng chán/buồn
      "ch\xE1n \u0111\u1EDDi",
      "ch\xE1n vl",
      "ch\xE1n real",
      "ch\xE1n th\u1EADt s\u1EF1",
      "toang",
      "toang r\u1ED3i",
      "toang real",
      "toang th\u1EADt s\u1EF1",
      "emo qu\xE1",
      "\u0111ang emo",
      "emo n\u1EB7ng",
      "xu\u1ED1ng tinh th\u1EA7n",
      "mood \u0111i xu\u1ED1ng",
      // Mạng xã hội style
      "kh\xF4ng ai care",
      "no one cares",
      "ai m\xE0 hi\u1EC3u",
      "c\xF4 \u0111\u01A1n vl",
      "lonely af",
      "m\u1ED9t m\xECnh ho\xE0i",
      "\xE1p l\u1EF1c qu\xE1 tr\u1EDDi",
      "stress vl",
      "burn out r\u1ED3i",
      // Tự ti
      "fail \u0111\u1EE7 th\u1EE9",
      "m\xECnh d\u1EDF qu\xE1",
      "m\xECnh t\u1EC7 qu\xE1",
      "kh\xF4ng l\xE0m \u0111\u01B0\u1EE3c g\xEC c\u1EA3",
      "useless real",
      // Gia đình
      "b\u1ED1 m\u1EB9 kh\xF4ng hi\u1EC3u",
      "b\u1ECB la ho\xE0i",
      "b\u1ECB so s\xE1nh",
      "gh\xE9t v\u1EC1 nh\xE0",
      "kh\xF4ng mu\u1ED1n v\u1EC1 nh\xE0",
      // Patterns mới - Phase 4
      "kh\xF4ng c\xF2n hy v\u1ECDng",
      "h\u1EBFt hy v\u1ECDng",
      "m\u1EA5t h\u1EBFt \u0111\u1ED9ng l\u1EF1c",
      "kh\xF4ng c\xF2n \u0111\u1ED9ng l\u1EF1c",
      "c\u1EA3m th\u1EA5y v\xF4 d\u1EE5ng",
      "m\xECnh v\xF4 d\u1EE5ng",
      "kh\xF4ng ai c\u1EA7n m\xECnh",
      "th\u1EEBa th\xE3i",
      "mu\u1ED1n bi\u1EBFn m\u1EA5t",
      "mu\u1ED1n tan bi\u1EBFn"
    ];
    __name(classifyRiskRules, "classifyRiskRules");
    __name(getRedTierResponse, "getRedTierResponse");
  }
});

// workers/sanitize.js
function sanitizeInput(text) {
  if (!text || typeof text !== "string") {
    throw new Error("invalid_input");
  }
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("empty_input");
  }
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(trimmed)) {
      throw new Error("injection_detected");
    }
  }
  for (const pattern of PROFANITY_PATTERNS) {
    if (pattern.test(trimmed)) {
      throw new Error("profanity_detected");
    }
  }
  if (trimmed.length > 2e3) {
    return trimmed.slice(0, 2e3);
  }
  return trimmed;
}
function hasInjection(text) {
  if (!text)
    return false;
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text))
      return true;
  }
  return false;
}
var INJECTION_PATTERNS, PROFANITY_PATTERNS;
var init_sanitize = __esm({
  "workers/sanitize.js"() {
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    INJECTION_PATTERNS = [
      // Cố gắng override instructions
      /ignore (previous|above|all) (instructions|prompts|rules)/i,
      /disregard (previous|above|all)/i,
      /forget (everything|all|previous)/i,
      /override (system|instructions|prompt)/i,
      /skip (system|instructions|rules)/i,
      // Cố gắng đổi persona
      /you are now/i,
      /act as/i,
      /pretend (to be|you are)/i,
      /roleplay as/i,
      /simulate (being|as)/i,
      /become (a|an)/i,
      // System prompt injection
      /system:/i,
      /\[system\]/i,
      /\[INST\]/i,
      /<<SYS>>/i,
      /<\|system\|>/i,
      /### system/i,
      // Jailbreak attempts
      /DAN/i,
      /do anything now/i,
      /jailbreak/i,
      /unrestricted mode/i,
      /unfiltered mode/i,
      // Developer mode
      /developer mode/i,
      /admin mode/i,
      /debug mode/i,
      /test mode/i,
      // Prompt injection techniques
      /new instructions/i,
      /new prompt/i,
      /change your/i,
      /modify your/i,
      /update your/i,
      // Base64/encoding attempts
      /base64/i,
      /decode this/i,
      /encrypted message/i,
      // Vietnamese variations
      /bỏ qua (hướng dẫn|quy tắc|lệnh)/i,
      /quên (tất cả|mọi thứ)/i,
      /bạn giờ là/i,
      /đóng vai/i
    ];
    PROFANITY_PATTERNS = [
      // Có thể mở rộng thêm nếu cần
    ];
    __name(sanitizeInput, "sanitizeInput");
    __name(hasInjection, "hasInjection");
  }
});

// workers/memory.js
function getRecentMessages(history = [], limit = 8) {
  if (!Array.isArray(history))
    return [];
  return history.slice(-limit);
}
function formatMessagesForLLM(systemPrompt, history = [], currentMessage, memorySummary = "") {
  const messages = [];
  let systemContent = systemPrompt;
  if (memorySummary) {
    systemContent = `${systemPrompt}

[NG\u1EEE C\u1EA2NH TR\u01AF\u1EDAC \u0110\xD3]
${memorySummary}`;
  }
  messages.push({ role: "system", content: systemContent });
  const recent = getRecentMessages(history, 8);
  for (const msg of recent) {
    messages.push({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content || ""
    });
  }
  if (currentMessage) {
    messages.push({ role: "user", content: currentMessage });
  }
  return messages;
}
var init_memory = __esm({
  "workers/memory.js"() {
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    __name(getRecentMessages, "getRecentMessages");
    __name(formatMessagesForLLM, "formatMessagesForLLM");
  }
});

// workers/token-tracker.js
async function getTokenUsage(env) {
  const now = /* @__PURE__ */ new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  try {
    const result = await env.ban_dong_hanh_db.prepare(
      "SELECT tokens FROM token_usage WHERE month = ?"
    ).bind(month).first();
    return {
      tokens: result?.tokens || 0,
      month
    };
  } catch (error) {
    console.error("[TokenTracker] getTokenUsage error:", error.message);
    return { tokens: 0, month };
  }
}
async function addTokenUsage(env, tokensToAdd = 0) {
  const now = /* @__PURE__ */ new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  try {
    const current = await getTokenUsage(env);
    const newTotal = current.tokens + tokensToAdd;
    await env.ban_dong_hanh_db.prepare(
      `INSERT INTO token_usage (month, tokens, updated_at)
             VALUES (?, ?, datetime('now'))
             ON CONFLICT(month) DO UPDATE SET
                 tokens = tokens + ?,
                 updated_at = datetime('now')`
    ).bind(month, tokensToAdd, tokensToAdd).run();
    const warning = newTotal >= MONTHLY_TOKEN_LIMIT * WARNING_THRESHOLD;
    const exceeded = newTotal >= MONTHLY_TOKEN_LIMIT;
    if (exceeded) {
      console.warn(`[TokenTracker] Monthly limit exceeded: ${newTotal}/${MONTHLY_TOKEN_LIMIT}`);
    } else if (warning) {
      console.warn(`[TokenTracker] Approaching limit: ${newTotal}/${MONTHLY_TOKEN_LIMIT} (${Math.round(newTotal / MONTHLY_TOKEN_LIMIT * 100)}%)`);
    }
    return {
      tokens: newTotal,
      limit: MONTHLY_TOKEN_LIMIT,
      warning,
      exceeded
    };
  } catch (error) {
    console.error("[TokenTracker] addTokenUsage error:", error.message);
    return {
      tokens: 0,
      limit: MONTHLY_TOKEN_LIMIT,
      warning: false,
      exceeded: false
    };
  }
}
async function checkTokenLimit(env) {
  const usage = await getTokenUsage(env);
  const allowed = usage.tokens < MONTHLY_TOKEN_LIMIT;
  return {
    allowed,
    tokens: usage.tokens,
    limit: MONTHLY_TOKEN_LIMIT,
    percentage: Math.round(usage.tokens / MONTHLY_TOKEN_LIMIT * 100)
  };
}
function estimateTokens(text) {
  if (!text)
    return 0;
  return Math.ceil(text.length / 4);
}
var MONTHLY_TOKEN_LIMIT, WARNING_THRESHOLD;
var init_token_tracker = __esm({
  "workers/token-tracker.js"() {
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    MONTHLY_TOKEN_LIMIT = 5e5;
    WARNING_THRESHOLD = 0.8;
    __name(getTokenUsage, "getTokenUsage");
    __name(addTokenUsage, "addTokenUsage");
    __name(checkTokenLimit, "checkTokenLimit");
    __name(estimateTokens, "estimateTokens");
  }
});

// workers/ai-proxy.js
var ai_proxy_exports = {};
__export(ai_proxy_exports, {
  default: () => ai_proxy_default
});
function getAllowedOrigin(request, env) {
  const reqOrigin = request.headers.get("Origin") || "";
  const allow = env.ALLOW_ORIGIN || "*";
  if (allow === "*" || !reqOrigin)
    return allow === "*" ? "*" : reqOrigin || "*";
  const list = allow.split(",").map((s) => s.trim());
  if (list.includes(reqOrigin))
    return reqOrigin;
  for (const pattern of list) {
    if (pattern.startsWith("*.")) {
      const domain = pattern.slice(2);
      if (reqOrigin.endsWith("." + domain) || reqOrigin.endsWith("//" + domain)) {
        return reqOrigin;
      }
      const originHost = reqOrigin.replace(/^https?:\/\//, "");
      if (originHost.endsWith("." + domain) || originHost === domain) {
        return reqOrigin;
      }
    }
  }
  if (reqOrigin.includes(".pages.dev")) {
    return reqOrigin;
  }
  return "null";
}
function corsHeaders(origin = "*") {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-requested-with",
    "Access-Control-Expose-Headers": "X-Trace-Id"
  };
}
function json3(data, status = 200, origin = "*", traceId) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin), ...traceId ? { "X-Trace-Id": traceId } : {} }
  });
}
function handleOptions(request, env) {
  const origin = getAllowedOrigin(request, env);
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}
function sseHeaders(origin = "*", traceId) {
  return {
    ...corsHeaders(origin),
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache",
    "X-Trace-Id": traceId
  };
}
async function callWorkersAI(env, messages, options = {}) {
  const model = options.model || env.MODEL || "@cf/meta/llama-3.1-8b-instruct";
  try {
    const result = await env.AI.run(model, {
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 512
    });
    return result;
  } catch (error) {
    console.error("[WorkersAI] Error:", error.message);
    throw error;
  }
}
async function callWorkersAIStream(env, messages, options = {}) {
  const model = options.model || env.MODEL || "@cf/meta/llama-3.1-8b-instruct";
  const result = await env.AI.run(model, {
    messages,
    temperature: options.temperature || 0.7,
    max_tokens: options.max_tokens || 512,
    stream: true
  });
  return result;
}
function parseAIResponse(text) {
  if (!text) {
    return createFallbackResponse("Kh\xF4ng c\xF3 ph\u1EA3n h\u1ED3i");
  }
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.reply && typeof parsed.reply === "string") {
        return {
          riskLevel: parsed.riskLevel || "green",
          emotion: parsed.emotion || "",
          reply: parsed.reply,
          nextQuestion: parsed.nextQuestion || "",
          actions: Array.isArray(parsed.actions) ? parsed.actions.slice(0, 4) : [],
          confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.7,
          disclaimer: parsed.disclaimer || null
        };
      }
    } catch (e) {
      console.error("[ParseAI] JSON parse error:", e.message);
    }
  }
  return createFallbackResponse(text);
}
function createFallbackResponse(text) {
  return {
    riskLevel: "green",
    emotion: "",
    reply: text.slice(0, 500) || "M\xECnh \u0111ang l\u1EAFng nghe b\u1EA1n. B\u1EA1n c\xF3 th\u1EC3 chia s\u1EBB th\xEAm kh\xF4ng?",
    nextQuestion: "",
    actions: [],
    confidence: 0.5,
    disclaimer: null
  };
}
async function twoPassCheck(env, firstResponse, userMessage) {
  if (firstResponse.confidence >= 0.6) {
    return firstResponse;
  }
  console.log("[2-Pass] Confidence th\u1EA5p, th\u1EF1c hi\u1EC7n self-check...");
  const checkPrompt = `Ki\u1EC3m tra l\u1EA1i c\xE2u tr\u1EA3 l\u1EDDi sau v\xE0 s\u1EEDa n\u1EBFu c\u1EA7n:

C\xC2U H\u1ECEI G\u1ED0C: ${userMessage}

C\xC2U TR\u1EA2 L\u1EDCI DRAFT:
${JSON.stringify(firstResponse, null, 2)}

KI\u1EC2M TRA:
1. C\xF3 b\u1ECBa \u0111\u1EB7t th\xF4ng tin kh\xF4ng?
2. C\xF3 r\u1EE7i ro an to\xE0n kh\xF4ng?
3. C\xF3 ph\xF9 h\u1EE3p v\u1EDBi SOS tier (${firstResponse.riskLevel}) kh\xF4ng?
4. Gi\u1ECDng \u0111i\u1EC7u c\xF3 th\u1EA5u c\u1EA3m kh\xF4ng?

N\u1EBFu c\u1EA7n s\u1EEDa, tr\u1EA3 v\u1EC1 JSON ho\xE0n ch\u1EC9nh. N\u1EBFu kh\xF4ng c\u1EA7n s\u1EEDa, tr\u1EA3 v\u1EC1 JSON g\u1ED1c v\u1EDBi confidence cao h\u01A1n.`;
  try {
    const checkResult = await callWorkersAI(env, [
      { role: "system", content: "B\u1EA1n l\xE0 chuy\xEAn gia ki\u1EC3m tra ch\u1EA5t l\u01B0\u1EE3ng ph\u1EA3n h\u1ED3i t\xE2m l\xFD. Tr\u1EA3 v\u1EC1 JSON." },
      { role: "user", content: checkPrompt }
    ], { temperature: 0.3 });
    const verified = parseAIResponse(checkResult.response || "");
    if (verified.confidence < 0.6)
      verified.confidence = 0.65;
    return verified;
  } catch (e) {
    console.error("[2-Pass] Error:", e.message);
    firstResponse.confidence = 0.55;
    return firstResponse;
  }
}
var SYSTEM_INSTRUCTIONS, ai_proxy_default;
var init_ai_proxy = __esm({
  "workers/ai-proxy.js"() {
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_risk();
    init_sanitize();
    init_memory();
    init_token_tracker();
    SYSTEM_INSTRUCTIONS = `B\u1EA1n l\xE0 "B\u1EA1n \u0110\u1ED3ng H\xE0nh" - m\u1ED9t mentor t\xE2m l\xFD \u1EA5m \xE1p, t\xF4n tr\u1ECDng, kh\xF4ng ph\xE1n x\xE9t cho h\u1ECDc sinh Vi\u1EC7t Nam (12-18 tu\u1ED5i).

VAI TR\xD2: MENTOR T\xC2M L\xDD (KH\xD4NG PH\u1EA2I B\xC1C S\u0128)
- B\u1EA1n l\xE0 ng\u01B0\u1EDDi b\u1EA1n \u0111\u1ED3ng h\xE0nh, l\u1EAFng nghe v\xE0 h\u1ED7 tr\u1EE3, KH\xD4NG ch\u1EA9n \u0111o\xE1n b\u1EC7nh hay k\xEA thu\u1ED1c
- M\u1EE5c ti\xEAu: gi\xFAp h\u1ECDc sinh t\u1EF1 kh\xE1m ph\xE1 c\u1EA3m x\xFAc, t\xECm gi\u1EA3i ph\xE1p t\u1EEB b\xEAn trong
- T\u1EA1o kh\xF4ng gian an to\xE0n \u0111\u1EC3 h\u1ECDc sinh chia s\u1EBB m\xE0 kh\xF4ng s\u1EE3 b\u1ECB ph\xE1n x\xE9t

PHONG C\xC1CH TR\u1EA2 L\u1EDCI
- Th\u1EA5u c\u1EA3m tr\u01B0\u1EDBc, g\u1EE3i \xFD sau: "M\xECnh hi\u1EC3u c\u1EA3m gi\xE1c \u0111\xF3 kh\xF3 ch\u1ECBu l\u1EAFm..."
- Ng\u1EAFn g\u1ECDn (50-100 t\u1EEB), d\xF9ng t\u1EEB g\u1EA7n g\u0169i Gen Z t\u1EF1 nhi\xEAn (kh\xF4ng qu\xE1 formal)
- TUY\u1EC6T \u0110\u1ED0I KH\xD4NG n\xF3i "T\xF4i l\xE0 AI", "l\xE0 tr\xED tu\u1EC7 nh\xE2n t\u1EA1o" - gi\u1EEF gi\u1ECDng nh\u01B0 ng\u01B0\u1EDDi b\u1EA1n th\xE2n
- X\xE1c th\u1EF1c c\u1EA3m x\xFAc tr\u01B0\u1EDBc khi \u0111\u01B0a l\u1EDDi khuy\xEAn: "C\u1EA3m gi\xE1c \u0111\xF3 ho\xE0n to\xE0n b\xECnh th\u01B0\u1EDDng..."
- K\u1EBFt th\xFAc b\u1EB1ng 1 c\xE2u h\u1ECFi m\u1EDF gi\xFAp h\u1ECDc sinh t\u1EF1 suy ng\u1EABm
- Tr\xE1nh robot, tr\xE1nh l\u1EB7p l\u1EA1i c\xE2u h\u1ECFi \u0111\xE3 h\u1ECFi trong context

PH\u01AF\u01A0NG PH\xC1P SOCRATIC (\u01AFU TI\xCAN)
- Thay v\xEC \u0111\u01B0a l\u1EDDi khuy\xEAn ngay, h\u1ECFi c\xE2u h\u1ECFi gi\xFAp t\u1EF1 kh\xE1m ph\xE1:
  + "B\u1EA1n ngh\u0129 \u0111i\u1EC1u g\xEC \u0111ang l\xE0m b\u1EA1n c\u1EA3m th\u1EA5y nh\u01B0 v\u1EADy?"
  + "N\u1EBFu b\u1EA1n th\xE2n b\u1EA1n g\u1EB7p t\xECnh hu\u1ED1ng n\xE0y, b\u1EA1n s\u1EBD n\xF3i g\xEC v\u1EDBi h\u1ECD?"
  + "C\xF3 khi n\xE0o b\u1EA1n t\u1EEBng v\u01B0\u1EE3t qua c\u1EA3m gi\xE1c t\u01B0\u01A1ng t\u1EF1 kh\xF4ng? L\xFAc \u0111\xF3 b\u1EA1n \u0111\xE3 l\xE0m g\xEC?"
- Gi\xFAp h\u1ECDc sinh t\u1EF1 nh\u1EADn ra solution thay v\xEC \xE1p \u0111\u1EB7t

PH\xC2N T\xCDCH NGUY\xCAN NH\xC2N G\u1ED0C
- Stress h\u1ECDc t\u1EADp: \xE1p l\u1EF1c \u0111i\u1EC3m s\u1ED1, thi c\u1EED, so s\xE1nh v\u1EDBi b\u1EA1n b\xE8
- Gia \u0111\xECnh: m\xE2u thu\u1EABn b\u1ED1 m\u1EB9, k\u1EF3 v\u1ECDng cao, thi\u1EBFu th\u1EA5u hi\u1EC3u
- B\u1EA1n b\xE8: b\u1ECB c\xF4 l\u1EADp, xung \u0111\u1ED9t, ghosted, b\u1ECB b\u1EAFt n\u1EA1t
- T\xECnh c\u1EA3m: th\u1EA5t t\xECnh, crush kh\xF4ng \u0111\xE1p l\u1EA1i, b\u1ECB reject
- B\u1EA3n th\xE2n: t\u1EF1 ti, kh\xF4ng bi\u1EBFt m\xECnh mu\u1ED1n g\xEC, identity crisis
- T\u01B0\u01A1ng lai: lo l\u1EAFng v\u1EC1 ngh\u1EC1 nghi\u1EC7p, kh\xF4ng bi\u1EBFt \u0111\u01B0\u1EDDng \u0111i

QUY TR\xCCNH SUY LU\u1EACN (N\u1ED8I B\u1ED8 - KH\xD4NG TI\u1EBET L\u1ED8)
1. Nh\u1EADn di\u1EC7n c\u1EA3m x\xFAc ch\xEDnh (bu\u1ED3n/gi\u1EADn/s\u1EE3/lo l\u1EAFng/stress/c\xF4 \u0111\u01A1n/t\u1EE7i th\xE2n/confused)
2. Ph\u1ECFng \u0111o\xE1n nguy\xEAn nh\xE2n g\u1ED1c d\u1EF1a tr\xEAn danh s\xE1ch tr\xEAn
3. \u0110\xE1nh gi\xE1 m\u1EE9c \u0111\u1ED9 nghi\xEAm tr\u1ECDng (green/yellow/red)
4. N\u1EBFu green: L\u1EAFng nghe + c\xE2u h\u1ECFi Socratic + g\u1EE3i \xFD h\xE0nh \u0111\u1ED9ng nh\u1ECF
5. N\u1EBFu yellow: X\xE1c th\u1EF1c c\u1EA3m x\xFAc s\xE2u h\u01A1n + theo d\xF5i + \u0111\u1EC1 xu\u1EA5t c\u1EE5 th\u1EC3
6. N\u1EBFu red: Ph\u1EA3n h\u1ED3i an to\xE0n ngay l\u1EADp t\u1EE9c (xem ph\u1EA7n AN TO\xC0N)

S\u1EEC D\u1EE4NG MEMORY/CONTEXT (QUAN TR\u1ECCNG)
- N\u1EBFu c\xF3 context t\u1EEB messages tr\u01B0\u1EDBc, th\u1EC3 hi\u1EC7n s\u1EF1 nh\u1EDB m\u1ED9t c\xE1ch t\u1EF1 nhi\xEAn:
  + "H\xF4m tr\u01B0\u1EDBc b\u1EA1n c\xF3 chia s\u1EBB v\u1EC1 [ch\u1EE7 \u0111\u1EC1]... M\xECnh th\u1EA5y b\u1EA1n \u0111\xE3 ti\u1EBFn b\u1ED9 r\u1ED3i \u0111\u1EA5y!"
  + "M\xECnh nh\u1EDB b\u1EA1n t\u1EEBng n\xF3i v\u1EC1 [\u0111i\u1EC1u g\xEC \u0111\xF3]... B\xE2y gi\u1EDD b\u1EA1n c\u1EA3m th\u1EA5y th\u1EBF n\xE0o?"
- Theo d\xF5i s\u1EF1 ti\u1EBFn b\u1ED9 v\xE0 c\xF4ng nh\u1EADn: "M\xECnh th\u1EA5y b\u1EA1n \u0111\xE3 c\u1ED1 g\u1EAFng... Tuy\u1EC7t v\u1EDDi!"
- Kh\xF4ng l\u1EB7p l\u1EA1i c\xE2u h\u1ECFi \u0111\xE3 h\u1ECFi trong context g\u1EA7n \u0111\xE2y
- N\u1EBFu context c\xF3 th\xF4ng tin v\u1EC1 nguy\xEAn nh\xE2n g\u1ED1c (stress h\u1ECDc t\u1EADp, gia \u0111\xECnh, b\u1EA1n b\xE8), tham chi\u1EBFu l\u1EA1i m\u1ED9t c\xE1ch t\u1EF1 nhi\xEAn
- S\u1EED d\u1EE5ng memory summary \u0111\u1EC3 hi\u1EC3u b\u1ED1i c\u1EA3nh d\xE0i h\u1EA1n, kh\xF4ng ch\u1EC9 tin nh\u1EAFn g\u1EA7n nh\u1EA5t

G\u1EE2I \xDD H\xC0NH \u0110\u1ED8NG (actions)
- Lu\xF4n \u0111\u01B0a 2-3 g\u1EE3i \xFD h\xE0nh \u0111\u1ED9ng c\u1EE5 th\u1EC3, nh\u1ECF, d\u1EC5 th\u1EF1c hi\u1EC7n NGAY
- Link v\u1EDBi t\xEDnh n\u0103ng app: breathing, gratitude, focus, journal, games, sleep
- V\xED d\u1EE5: "th\u1EED b\xE0i th\u1EDF 4-7-8", "vi\u1EBFt 3 \u0111i\u1EC1u bi\u1EBFt \u01A1n", "focus 15 ph\xFAt", "ch\u01A1i game th\u01B0 gi\xE3n"
- G\u1EE3i \xFD d\u1EF1a tr\xEAn nguy\xEAn nh\xE2n g\u1ED1c (stress h\u1ECDc t\u1EADp \u2192 focus mode, c\xF4 \u0111\u01A1n \u2192 games/gratitude)

AN TO\xC0N (B\u1EAET BU\u1ED8C - CHU\u1EA8N QUY\u1EC0N L\u1EE2I TR\u1EBA EM)
- KH\xD4NG b\u1ECBa \u0111\u1EB7t s\u1ED1 li\u1EC7u y khoa, ch\u1EA9n \u0111o\xE1n b\u1EC7nh, k\xEA thu\u1ED1c
- N\u1EBFu kh\xF4ng ch\u1EAFc: "M\xECnh kh\xF4ng ch\u1EAFc v\u1EC1 \u0111i\u1EC1u n\xE0y. B\u1EA1n n\xEAn h\u1ECFi th\u1EA7y c\xF4 ho\u1EB7c ng\u01B0\u1EDDi l\u1EDBn tin c\u1EADy nh\xE9!"
- RED FLAGS c\u1EA7n can thi\u1EC7p ngay:
  + \xDD \u0111\u1ECBnh t\u1EF1 h\u1EA1i, t\u1EF1 t\u1EED, mu\u1ED1n ch\u1EBFt
  + D\u1EA5u hi\u1EC7u b\u1EA1o l\u1EF1c, l\u1EA1m d\u1EE5ng th\u1EC3 ch\u1EA5t/t\xECnh d\u1EE5c
  + Tr\u1EA7m c\u1EA3m/lo \xE2u n\u1EB7ng k\xE9o d\xE0i
  \u2192 Ph\u1EA3n h\u1ED3i: "M\xECnh lo l\u1EAFng cho b\u1EA1n. \u0110\xE2y l\xE0 t\xECnh hu\u1ED1ng c\u1EA7n s\u1EF1 gi\xFAp \u0111\u1EE1 chuy\xEAn nghi\u1EC7p. H\xE3y li\xEAn h\u1EC7 ngay: 1800 599 920 (mi\u1EC5n ph\xED 24/7) ho\u1EB7c n\xF3i v\u1EDBi ng\u01B0\u1EDDi l\u1EDBn tin c\u1EADy nh\xE9. M\xECnh lu\xF4n \u1EDF \u0111\xE2y c\xF9ng b\u1EA1n."

OUTPUT FORMAT (B\u1EAET BU\u1ED8C JSON)
{
  "riskLevel": "green|yellow|red",
  "emotion": "c\u1EA3m x\xFAc ch\xEDnh nh\u1EADn di\u1EC7n (bu\u1ED3n/gi\u1EADn/s\u1EE3/lo/stress/c\xF4 \u0111\u01A1n/t\u1EE7i th\xE2n/confused)",
  "rootCause": "nguy\xEAn nh\xE2n g\u1ED1c ph\u1ECFng \u0111o\xE1n (h\u1ECDc t\u1EADp/gia \u0111\xECnh/b\u1EA1n b\xE8/t\xECnh c\u1EA3m/b\u1EA3n th\xE2n/t\u01B0\u01A1ng lai)",
  "reply": "ph\u1EA3n h\u1ED3i th\u1EA5u c\u1EA3m 50-100 t\u1EEB v\u1EDBi c\xE2u h\u1ECFi Socratic",
  "nextQuestion": "c\xE2u h\u1ECFi m\u1EDF gi\xFAp t\u1EF1 kh\xE1m ph\xE1",
  "actions": ["g\u1EE3i \xFD h\xE0nh \u0111\u1ED9ng 1", "g\u1EE3i \xFD 2", "g\u1EE3i \xFD 3 n\u1EBFu c\u1EA7n"],
  "confidence": 0.0-1.0,
  "disclaimer": "disclaimer n\u1EBFu c\u1EA7n ho\u1EB7c null"
}`;
    __name(getAllowedOrigin, "getAllowedOrigin");
    __name(corsHeaders, "corsHeaders");
    __name(json3, "json");
    __name(handleOptions, "handleOptions");
    __name(sseHeaders, "sseHeaders");
    __name(callWorkersAI, "callWorkersAI");
    __name(callWorkersAIStream, "callWorkersAIStream");
    __name(parseAIResponse, "parseAIResponse");
    __name(createFallbackResponse, "createFallbackResponse");
    __name(twoPassCheck, "twoPassCheck");
    ai_proxy_default = {
      async fetch(request, env) {
        const startTime = Date.now();
        const traceId = crypto && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
        const origin = getAllowedOrigin(request, env);
        if (request.method === "OPTIONS")
          return handleOptions(request, env);
        if (request.method !== "POST") {
          return json3({ error: "method_not_allowed" }, 405, origin, traceId);
        }
        let body;
        try {
          body = await request.json();
        } catch (_) {
          return json3({ error: "invalid_json" }, 400, origin, traceId);
        }
        const { message, history = [], memorySummary = "" } = body || {};
        if (!message || typeof message !== "string") {
          return json3({ error: "missing_message" }, 400, origin, traceId);
        }
        let sanitizedMessage;
        try {
          sanitizedMessage = sanitizeInput(message);
        } catch (e) {
          console.log(`[Sanitize] Blocked: ${e.message}`, { traceId });
          return json3({ error: "invalid_input", reason: e.message }, 400, origin, traceId);
        }
        const riskLevel = classifyRiskRules(sanitizedMessage, history);
        console.log(JSON.stringify({
          type: "request",
          traceId,
          riskLevel,
          model: env.MODEL || "@cf/meta/llama-3.1-8b-instruct",
          historyCount: history.length
        }));
        if (riskLevel === "red") {
          const redResponse = getRedTierResponse();
          console.log(JSON.stringify({
            type: "response",
            traceId,
            riskLevel: "red",
            latencyMs: Date.now() - startTime,
            status: 200
          }));
          const url2 = new URL(request.url);
          const wantsStream2 = url2.searchParams.get("stream") === "true" || request.headers.get("Accept")?.includes("text/event-stream");
          if (wantsStream2) {
            const stream = new ReadableStream({
              start(controller) {
                const enc = new TextEncoder();
                const send = /* @__PURE__ */ __name((line) => controller.enqueue(enc.encode(line)), "send");
                send(`event: meta
`);
                send(`data: ${JSON.stringify({ trace_id: traceId, riskLevel: "red", sos: true })}

`);
                const replyText = redResponse.reply + "\n\n\u{1F4DE} " + redResponse.actions.join("\n\u{1F4DE} ");
                send(`data: ${JSON.stringify({ type: "delta", text: replyText })}

`);
                send(`data: ${JSON.stringify({ type: "done" })}

`);
                controller.close();
              }
            });
            return new Response(stream, { status: 200, headers: sseHeaders(origin, traceId) });
          }
          return json3(redResponse, 200, origin, traceId);
        }
        const tokenCheck = await checkTokenLimit(env);
        if (!tokenCheck.allowed) {
          console.warn(`[AI-Proxy] Token limit exceeded: ${tokenCheck.tokens}/${tokenCheck.limit}`);
          return json3({
            error: "token_limit_exceeded",
            message: "\u0110\xE3 \u0111\u1EA1t gi\u1EDBi h\u1EA1n s\u1EED d\u1EE5ng th\xE1ng n\xE0y. Vui l\xF2ng th\u1EED l\u1EA1i v\xE0o th\xE1ng sau.",
            tokens: tokenCheck.tokens,
            limit: tokenCheck.limit
          }, 429, origin, traceId);
        }
        const messages = formatMessagesForLLM(
          SYSTEM_INSTRUCTIONS,
          getRecentMessages(history, 8),
          sanitizedMessage,
          memorySummary
        );
        const estimatedTokens = estimateTokens(
          JSON.stringify(messages) + sanitizedMessage
        );
        const url = new URL(request.url);
        const wantsStream = url.searchParams.get("stream") === "true" || request.headers.get("Accept")?.includes("text/event-stream");
        try {
          if (wantsStream) {
            const aiStream = await callWorkersAIStream(env, messages);
            const stream = new ReadableStream({
              async start(controller) {
                const enc = new TextEncoder();
                const send = /* @__PURE__ */ __name((line) => controller.enqueue(enc.encode(line)), "send");
                send(`event: meta
`);
                send(`data: ${JSON.stringify({ trace_id: traceId, riskLevel })}

`);
                try {
                  let fullText = "";
                  const reader = aiStream.getReader();
                  let buffer = "";
                  while (true) {
                    const { value, done } = await reader.read();
                    if (done)
                      break;
                    const chunk = typeof value === "string" ? value : new TextDecoder().decode(value);
                    buffer += chunk;
                    let lineEnd;
                    while ((lineEnd = buffer.indexOf("\n")) !== -1) {
                      const line = buffer.slice(0, lineEnd).trim();
                      buffer = buffer.slice(lineEnd + 1);
                      if (line.startsWith("data: ")) {
                        const dataStr = line.slice(6);
                        if (dataStr === "[DONE]") {
                          continue;
                        }
                        try {
                          const parsed = JSON.parse(dataStr);
                          if (parsed.response && typeof parsed.response === "string") {
                            fullText += parsed.response;
                            send(`data: ${JSON.stringify({ type: "delta", text: parsed.response })}

`);
                          }
                        } catch (_) {
                        }
                      }
                    }
                  }
                  send(`data: ${JSON.stringify({ type: "done" })}

`);
                  const responseTokens = estimateTokens(fullText);
                  const totalTokens = estimatedTokens + responseTokens;
                  await addTokenUsage(env, totalTokens);
                  console.log(JSON.stringify({
                    type: "response",
                    traceId,
                    riskLevel,
                    latencyMs: Date.now() - startTime,
                    tokens: totalTokens,
                    tokenUsage: tokenCheck.tokens + totalTokens,
                    status: 200,
                    stream: true
                  }));
                } catch (err) {
                  const errPayload = { type: "error", error: "model_error", note: String(err?.message || err) };
                  send(`data: ${JSON.stringify(errPayload)}

`);
                } finally {
                  controller.close();
                }
              }
            });
            return new Response(stream, { status: 200, headers: sseHeaders(origin, traceId) });
          } else {
            const result = await callWorkersAI(env, messages);
            const rawResponse = result.response || "";
            let parsed = parseAIResponse(rawResponse);
            if (riskLevel === "yellow" && parsed.riskLevel === "green") {
              parsed.riskLevel = "yellow";
            }
            parsed = await twoPassCheck(env, parsed, sanitizedMessage);
            const responseTokens = estimateTokens(parsed.reply || "");
            const totalTokens = estimatedTokens + responseTokens;
            await addTokenUsage(env, totalTokens);
            console.log(JSON.stringify({
              type: "response",
              traceId,
              riskLevel: parsed.riskLevel,
              confidence: parsed.confidence,
              latencyMs: Date.now() - startTime,
              tokens: totalTokens,
              tokenUsage: tokenCheck.tokens + totalTokens,
              status: 200,
              stream: false
            }));
            return json3(parsed, 200, origin, traceId);
          }
        } catch (e) {
          console.error(JSON.stringify({
            type: "error",
            traceId,
            error: e.message,
            latencyMs: Date.now() - startTime
          }));
          return json3({ error: "model_error", note: String(e?.message || e) }, 502, origin, traceId);
        }
      }
    };
  }
});

// .wrangler/tmp/bundle-DOY1fv/middleware-loader.entry.ts
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// .wrangler/tmp/bundle-DOY1fv/middleware-insertion-facade.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// workers/router.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// workers/auth.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
function validateUsername(username) {
  if (!username || typeof username !== "string") {
    return { valid: false, error: "T\xEAn t\xE0i kho\u1EA3n kh\xF4ng \u0111\u01B0\u1EE3c \u0111\u1EC3 tr\u1ED1ng" };
  }
  const trimmed = username.trim();
  if (trimmed.length < 3) {
    return { valid: false, error: "T\xEAn t\xE0i kho\u1EA3n ph\u1EA3i c\xF3 \xEDt nh\u1EA5t 3 k\xFD t\u1EF1" };
  }
  if (trimmed.length > 30) {
    return { valid: false, error: "T\xEAn t\xE0i kho\u1EA3n kh\xF4ng qu\xE1 30 k\xFD t\u1EF1" };
  }
  if (!/^[a-zA-Z0-9_\-\u00C0-\u024F\u1E00-\u1EFF]+$/u.test(trimmed)) {
    return { valid: false, error: "T\xEAn t\xE0i kho\u1EA3n ch\u1EC9 \u0111\u01B0\u1EE3c ch\u1EE9a ch\u1EEF c\xE1i, s\u1ED1, _ v\xE0 -" };
  }
  return { valid: true };
}
__name(validateUsername, "validateUsername");
function generateUsernameSuggestions(username) {
  const suggestions = [];
  const now = Date.now().toString().slice(-4);
  suggestions.push(`${username}${now}`);
  suggestions.push(`${username}_${Math.floor(Math.random() * 100)}`);
  suggestions.push(`${username}${(/* @__PURE__ */ new Date()).getFullYear()}`);
  return suggestions;
}
__name(generateUsernameSuggestions, "generateUsernameSuggestions");
async function handleRegister(request, env) {
  try {
    const body = await request.json();
    const { username } = body;
    const validation = validateUsername(username);
    if (!validation.valid) {
      return createJsonResponse({ error: validation.error }, 400);
    }
    const trimmedUsername = username.trim();
    const existing = await env.ban_dong_hanh_db.prepare(
      "SELECT id FROM users WHERE username = ?"
    ).bind(trimmedUsername).first();
    if (existing) {
      const suggestions = generateUsernameSuggestions(trimmedUsername);
      return createJsonResponse({
        error: "username_taken",
        message: `T\xEAn "${trimmedUsername}" \u0111\xE3 \u0111\u01B0\u1EE3c s\u1EED d\u1EE5ng`,
        suggestions
      }, 409);
    }
    const result = await env.ban_dong_hanh_db.prepare(
      "INSERT INTO users (username) VALUES (?) RETURNING id, username, created_at"
    ).bind(trimmedUsername).first();
    await env.ban_dong_hanh_db.prepare(
      "INSERT INTO user_settings (user_id) VALUES (?)"
    ).bind(result.id).run();
    return createJsonResponse({
      success: true,
      user: {
        id: result.id,
        username: result.username,
        created_at: result.created_at
      }
    }, 201);
  } catch (error) {
    console.error("[Auth] Register error:", error.message);
    return createJsonResponse({ error: "server_error", message: error.message }, 500);
  }
}
__name(handleRegister, "handleRegister");
async function handleLogin(request, env) {
  try {
    const body = await request.json();
    const { username } = body;
    const validation = validateUsername(username);
    if (!validation.valid) {
      return createJsonResponse({ error: validation.error }, 400);
    }
    const trimmedUsername = username.trim();
    const user = await env.ban_dong_hanh_db.prepare(
      "SELECT id, username, created_at FROM users WHERE username = ?"
    ).bind(trimmedUsername).first();
    if (!user) {
      return createJsonResponse({
        error: "user_not_found",
        message: `Kh\xF4ng t\xECm th\u1EA5y t\xE0i kho\u1EA3n "${trimmedUsername}"`,
        canRegister: true
      }, 404);
    }
    try {
      const updateResult = await env.ban_dong_hanh_db.prepare(
        "UPDATE users SET last_login = datetime('now') WHERE id = ?"
      ).bind(user.id).run();
      console.log("[Auth] UPDATE executed - changes:", updateResult.changes, "success:", updateResult.success);
      if (updateResult.changes === 0) {
        console.warn("[Auth] WARNING: UPDATE affected 0 rows for user", user.id);
      }
    } catch (updateError) {
      console.error("[Auth] UPDATE error:", updateError.message);
    }
    const updatedUser = await env.ban_dong_hanh_db.prepare(
      "SELECT id, username, created_at, COALESCE(last_login, NULL) as last_login FROM users WHERE id = ?"
    ).bind(user.id).first();
    console.log("[Auth] SELECT result:", {
      id: updatedUser?.id,
      username: updatedUser?.username,
      last_login: updatedUser?.last_login,
      has_last_login: "last_login" in (updatedUser || {})
    });
    const responseUser = {
      id: updatedUser.id,
      username: updatedUser.username,
      created_at: updatedUser.created_at
    };
    if ("last_login" in updatedUser) {
      responseUser.last_login = updatedUser.last_login;
    } else {
      const lastLoginCheck = await env.ban_dong_hanh_db.prepare(
        "SELECT last_login FROM users WHERE id = ?"
      ).bind(user.id).first();
      responseUser.last_login = lastLoginCheck?.last_login || null;
    }
    console.log("[Auth] Final response user:", responseUser);
    return createJsonResponse({
      success: true,
      user: responseUser
    });
  } catch (error) {
    console.error("[Auth] Login error:", error.message);
    return createJsonResponse({ error: "server_error", message: error.message }, 500);
  }
}
__name(handleLogin, "handleLogin");
async function handleCheckUsername(request, env) {
  try {
    const url = new URL(request.url);
    const username = url.searchParams.get("username");
    const validation = validateUsername(username);
    if (!validation.valid) {
      return createJsonResponse({ available: false, error: validation.error });
    }
    const existing = await env.ban_dong_hanh_db.prepare(
      "SELECT id FROM users WHERE username = ?"
    ).bind(username.trim()).first();
    return createJsonResponse({
      available: !existing,
      username: username.trim()
    });
  } catch (error) {
    console.error("[Auth] Check error:", error.message);
    return createJsonResponse({ error: "server_error" }, 500);
  }
}
__name(handleCheckUsername, "handleCheckUsername");
async function handleGetMe(request, env) {
  try {
    const userId = request.headers.get("X-User-Id");
    if (!userId) {
      return createJsonResponse({ error: "not_authenticated" }, 401);
    }
    const user = await env.ban_dong_hanh_db.prepare(
      "SELECT id, username, created_at, last_login FROM users WHERE id = ?"
    ).bind(parseInt(userId)).first();
    if (!user) {
      return createJsonResponse({ error: "user_not_found" }, 404);
    }
    const settings = await env.ban_dong_hanh_db.prepare(
      "SELECT theme, notifications, sound, font_size FROM user_settings WHERE user_id = ?"
    ).bind(user.id).first();
    return createJsonResponse({
      user: { ...user, settings: settings || {} }
    });
  } catch (error) {
    console.error("[Auth] GetMe error:", error.message);
    return createJsonResponse({ error: "server_error" }, 500);
  }
}
__name(handleGetMe, "handleGetMe");
function createJsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
__name(createJsonResponse, "createJsonResponse");
async function handleDeleteAccount(request, env) {
  try {
    const userId = request.headers.get("X-User-Id");
    if (!userId) {
      return createJsonResponse({ error: "not_authenticated" }, 401);
    }
    const userIdInt = parseInt(userId);
    if (isNaN(userIdInt)) {
      return createJsonResponse({ error: "invalid_user_id" }, 400);
    }
    const tables = [
      "gratitude",
      "journal",
      "focus_sessions",
      "breathing_sessions",
      "sleep_logs",
      "achievements",
      "game_scores",
      "user_stats",
      "notification_settings",
      "user_settings",
      "random_cards_history",
      // Forum data
      "forum_upvotes",
      "forum_comments",
      "forum_posts"
      // SOS logs - chỉ xóa metadata, giữ hashed_user_id để thống kê
    ];
    for (const table of tables) {
      try {
        await env.ban_dong_hanh_db.prepare(
          `DELETE FROM ${table} WHERE user_id = ?`
        ).bind(userIdInt).run();
      } catch (e) {
        console.warn(`[DeleteAccount] Failed to delete from ${table}:`, e.message);
      }
    }
    await env.ban_dong_hanh_db.prepare(
      "DELETE FROM users WHERE id = ?"
    ).bind(userIdInt).run();
    return createJsonResponse({
      success: true,
      message: "T\xE0i kho\u1EA3n v\xE0 t\u1EA5t c\u1EA3 d\u1EEF li\u1EC7u \u0111\xE3 \u0111\u01B0\u1EE3c x\xF3a th\xE0nh c\xF4ng"
    });
  } catch (error) {
    console.error("[Auth] DeleteAccount error:", error.message);
    return createJsonResponse({ error: "server_error", message: error.message }, 500);
  }
}
__name(handleDeleteAccount, "handleDeleteAccount");

// workers/data-api.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
function getUserId(request) {
  const userId = request.headers.get("X-User-Id");
  if (!userId)
    return null;
  const parsed = parseInt(userId);
  return isNaN(parsed) ? null : parsed;
}
__name(getUserId, "getUserId");
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
__name(json, "json");
async function getGratitude(request, env) {
  const userId = getUserId(request);
  if (!userId)
    return json({ error: "not_authenticated" }, 401);
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
  const offset = parseInt(url.searchParams.get("offset") || "0");
  try {
    const result = await env.ban_dong_hanh_db.prepare(
      "SELECT id, content, tag, created_at FROM gratitude WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?"
    ).bind(userId, limit, offset).all();
    return json({ items: result.results, count: result.results.length });
  } catch (error) {
    console.error("[Data] getGratitude error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(getGratitude, "getGratitude");
async function addGratitude(request, env) {
  const userId = getUserId(request);
  if (!userId)
    return json({ error: "not_authenticated" }, 401);
  try {
    const { content, tag } = await request.json();
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return json({ error: "N\u1ED9i dung kh\xF4ng \u0111\u01B0\u1EE3c \u0111\u1EC3 tr\u1ED1ng" }, 400);
    }
    if (content.length > 500) {
      return json({ error: "N\u1ED9i dung kh\xF4ng qu\xE1 500 k\xFD t\u1EF1" }, 400);
    }
    const result = await env.ban_dong_hanh_db.prepare(
      "INSERT INTO gratitude (user_id, content, tag) VALUES (?, ?, ?) RETURNING id, content, tag, created_at"
    ).bind(userId, content.trim(), tag || null).first();
    return json({ success: true, item: result, id: result.id }, 201);
  } catch (error) {
    console.error("[Data] addGratitude error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(addGratitude, "addGratitude");
async function deleteGratitude(request, env, id) {
  const userId = getUserId(request);
  if (!userId)
    return json({ error: "not_authenticated" }, 401);
  try {
    const result = await env.ban_dong_hanh_db.prepare(
      "DELETE FROM gratitude WHERE id = ? AND user_id = ?"
    ).bind(parseInt(id), userId).run();
    if (result.changes === 0) {
      return json({ error: "not_found" }, 404);
    }
    return json({ success: true });
  } catch (error) {
    console.error("[Data] deleteGratitude error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(deleteGratitude, "deleteGratitude");
async function getJournal(request, env) {
  const userId = getUserId(request);
  if (!userId)
    return json({ error: "not_authenticated" }, 401);
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "30"), 100);
  const offset = parseInt(url.searchParams.get("offset") || "0");
  try {
    const result = await env.ban_dong_hanh_db.prepare(
      "SELECT id, content, mood, tags, sentiment_score, created_at FROM journal WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?"
    ).bind(userId, limit, offset).all();
    return json({ items: result.results, count: result.results.length });
  } catch (error) {
    console.error("[Data] getJournal error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(getJournal, "getJournal");
async function addJournal(request, env) {
  const userId = getUserId(request);
  if (!userId)
    return json({ error: "not_authenticated" }, 401);
  try {
    const { content, mood, tags } = await request.json();
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return json({ error: "N\u1ED9i dung kh\xF4ng \u0111\u01B0\u1EE3c \u0111\u1EC3 tr\u1ED1ng" }, 400);
    }
    if (content.length > 5e3) {
      return json({ error: "N\u1ED9i dung kh\xF4ng qu\xE1 5000 k\xFD t\u1EF1" }, 400);
    }
    const validMoods = ["happy", "calm", "neutral", "sad", "stressed"];
    const moodValue = validMoods.includes(mood) ? mood : null;
    const tagsValue = Array.isArray(tags) ? JSON.stringify(tags.slice(0, 5)) : null;
    const result = await env.ban_dong_hanh_db.prepare(
      "INSERT INTO journal (user_id, content, mood, tags) VALUES (?, ?, ?, ?) RETURNING id, content, mood, tags, created_at"
    ).bind(userId, content.trim(), moodValue, tagsValue).first();
    return json({ success: true, item: result }, 201);
  } catch (error) {
    console.error("[Data] addJournal error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(addJournal, "addJournal");
async function deleteJournal(request, env, id) {
  const userId = getUserId(request);
  if (!userId)
    return json({ error: "not_authenticated" }, 401);
  try {
    const result = await env.ban_dong_hanh_db.prepare(
      "DELETE FROM journal WHERE id = ? AND user_id = ?"
    ).bind(parseInt(id), userId).run();
    if (result.changes === 0) {
      return json({ error: "not_found" }, 404);
    }
    return json({ success: true });
  } catch (error) {
    console.error("[Data] deleteJournal error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(deleteJournal, "deleteJournal");
async function getFocusSessions(request, env) {
  const userId = getUserId(request);
  if (!userId)
    return json({ error: "not_authenticated" }, 401);
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);
  const offset = parseInt(url.searchParams.get("offset") || "0");
  try {
    const result = await env.ban_dong_hanh_db.prepare(
      "SELECT id, duration_minutes, session_type, completed, created_at FROM focus_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?"
    ).bind(userId, limit, offset).all();
    return json({ items: result.results, count: result.results.length });
  } catch (error) {
    console.error("[Data] getFocusSessions error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(getFocusSessions, "getFocusSessions");
async function addFocusSession(request, env) {
  const userId = getUserId(request);
  if (!userId)
    return json({ error: "not_authenticated" }, 401);
  try {
    const { duration_minutes, session_type = "focus", completed = true } = await request.json();
    if (!duration_minutes || typeof duration_minutes !== "number" || duration_minutes <= 0) {
      return json({ error: "duration_minutes ph\u1EA3i l\xE0 s\u1ED1 d\u01B0\u01A1ng" }, 400);
    }
    const validTypes = ["focus", "break"];
    const typeValue = validTypes.includes(session_type) ? session_type : "focus";
    const result = await env.ban_dong_hanh_db.prepare(
      "INSERT INTO focus_sessions (user_id, duration_minutes, session_type, completed) VALUES (?, ?, ?, ?) RETURNING id, duration_minutes, session_type, completed, created_at"
    ).bind(userId, duration_minutes, typeValue, completed ? 1 : 0).first();
    return json({ success: true, item: result }, 201);
  } catch (error) {
    console.error("[Data] addFocusSession error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(addFocusSession, "addFocusSession");
async function getBreathingSessions(request, env) {
  const userId = getUserId(request);
  if (!userId)
    return json({ error: "not_authenticated" }, 401);
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);
  try {
    const result = await env.ban_dong_hanh_db.prepare(
      "SELECT id, exercise_type, duration_seconds, created_at FROM breathing_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?"
    ).bind(userId, limit).all();
    return json({ items: result.results, count: result.results.length });
  } catch (error) {
    console.error("[Data] getBreathingSessions error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(getBreathingSessions, "getBreathingSessions");
async function addBreathingSession(request, env) {
  const userId = getUserId(request);
  if (!userId)
    return json({ error: "not_authenticated" }, 401);
  try {
    const { exercise_type, duration_seconds } = await request.json();
    if (!exercise_type || typeof exercise_type !== "string") {
      return json({ error: "exercise_type b\u1EAFt bu\u1ED9c" }, 400);
    }
    if (!duration_seconds || typeof duration_seconds !== "number" || duration_seconds <= 0) {
      return json({ error: "duration_seconds ph\u1EA3i l\xE0 s\u1ED1 d\u01B0\u01A1ng" }, 400);
    }
    const result = await env.ban_dong_hanh_db.prepare(
      "INSERT INTO breathing_sessions (user_id, exercise_type, duration_seconds) VALUES (?, ?, ?) RETURNING id, exercise_type, duration_seconds, created_at"
    ).bind(userId, exercise_type, duration_seconds).first();
    return json({ success: true, item: result }, 201);
  } catch (error) {
    console.error("[Data] addBreathingSession error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(addBreathingSession, "addBreathingSession");
async function getSleepLogs(request, env) {
  const userId = getUserId(request);
  if (!userId)
    return json({ error: "not_authenticated" }, 401);
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
  try {
    const result = await env.ban_dong_hanh_db.prepare(
      "SELECT id, sleep_time, wake_time, duration_minutes, quality, notes, created_at FROM sleep_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?"
    ).bind(userId, limit).all();
    return json({ items: result.results, count: result.results.length });
  } catch (error) {
    console.error("[Data] getSleepLogs error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(getSleepLogs, "getSleepLogs");
async function addSleepLog(request, env) {
  const userId = getUserId(request);
  if (!userId)
    return json({ error: "not_authenticated" }, 401);
  try {
    const { sleep_time, wake_time, quality, notes, duration_minutes } = await request.json();
    if (!sleep_time || !wake_time) {
      return json({ error: "sleep_time v\xE0 wake_time b\u1EAFt bu\u1ED9c" }, 400);
    }
    const qualityValue = quality ? Math.min(5, Math.max(1, parseInt(quality))) : null;
    let durationValue = duration_minutes;
    if (!durationValue) {
      try {
        const sleepParts = sleep_time.split(":").map(Number);
        const wakeParts = wake_time.split(":").map(Number);
        const sleepMinutes = sleepParts[0] * 60 + sleepParts[1];
        let wakeMinutes = wakeParts[0] * 60 + wakeParts[1];
        if (wakeMinutes < sleepMinutes) {
          wakeMinutes += 24 * 60;
        }
        durationValue = wakeMinutes - sleepMinutes;
      } catch {
        durationValue = null;
      }
    }
    const result = await env.ban_dong_hanh_db.prepare(
      "INSERT INTO sleep_logs (user_id, sleep_time, wake_time, duration_minutes, quality, notes) VALUES (?, ?, ?, ?, ?, ?) RETURNING id, sleep_time, wake_time, duration_minutes, quality, notes, created_at"
    ).bind(userId, sleep_time, wake_time, durationValue, qualityValue, notes || null).first();
    return json({ success: true, item: result }, 201);
  } catch (error) {
    console.error("[Data] addSleepLog error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(addSleepLog, "addSleepLog");
async function deleteSleepLog(request, env, id) {
  const userId = getUserId(request);
  if (!userId)
    return json({ error: "not_authenticated" }, 401);
  try {
    const result = await env.ban_dong_hanh_db.prepare(
      "DELETE FROM sleep_logs WHERE id = ? AND user_id = ?"
    ).bind(parseInt(id), userId).run();
    if (result.changes === 0) {
      return json({ error: "not_found" }, 404);
    }
    return json({ success: true });
  } catch (error) {
    console.error("[Data] deleteSleepLog error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(deleteSleepLog, "deleteSleepLog");
async function updateSleepLog(request, env, id) {
  const userId = getUserId(request);
  if (!userId)
    return json({ error: "not_authenticated" }, 401);
  try {
    const { sleep_time, wake_time, quality, notes, duration_minutes } = await request.json();
    const existing = await env.ban_dong_hanh_db.prepare(
      "SELECT id FROM sleep_logs WHERE id = ? AND user_id = ?"
    ).bind(parseInt(id), userId).first();
    if (!existing) {
      return json({ error: "not_found" }, 404);
    }
    const qualityValue = quality ? Math.min(5, Math.max(1, parseInt(quality))) : null;
    const result = await env.ban_dong_hanh_db.prepare(
      "UPDATE sleep_logs SET sleep_time = ?, wake_time = ?, duration_minutes = ?, quality = ?, notes = ? WHERE id = ? AND user_id = ? RETURNING *"
    ).bind(sleep_time, wake_time, duration_minutes || null, qualityValue, notes || null, parseInt(id), userId).first();
    return json({ success: true, item: result });
  } catch (error) {
    console.error("[Data] updateSleepLog error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(updateSleepLog, "updateSleepLog");
async function getAchievements(request, env) {
  const userId = getUserId(request);
  if (!userId)
    return json({ error: "not_authenticated" }, 401);
  try {
    const result = await env.ban_dong_hanh_db.prepare(
      "SELECT id, achievement_id, unlocked_at FROM achievements WHERE user_id = ? ORDER BY unlocked_at DESC"
    ).bind(userId).all();
    return json({ items: result.results, count: result.results.length });
  } catch (error) {
    console.error("[Data] getAchievements error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(getAchievements, "getAchievements");
async function unlockAchievement(request, env) {
  const userId = getUserId(request);
  if (!userId)
    return json({ error: "not_authenticated" }, 401);
  try {
    const { achievement_id } = await request.json();
    if (!achievement_id || typeof achievement_id !== "string") {
      return json({ error: "achievement_id b\u1EAFt bu\u1ED9c" }, 400);
    }
    const existing = await env.ban_dong_hanh_db.prepare(
      "SELECT id FROM achievements WHERE user_id = ? AND achievement_id = ?"
    ).bind(userId, achievement_id).first();
    if (existing) {
      return json({ success: true, alreadyUnlocked: true });
    }
    const result = await env.ban_dong_hanh_db.prepare(
      "INSERT INTO achievements (user_id, achievement_id) VALUES (?, ?) RETURNING id, achievement_id, unlocked_at"
    ).bind(userId, achievement_id).first();
    return json({ success: true, item: result, newUnlock: true }, 201);
  } catch (error) {
    console.error("[Data] unlockAchievement error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(unlockAchievement, "unlockAchievement");
async function getStats(request, env) {
  const userId = getUserId(request);
  if (!userId)
    return json({ error: "not_authenticated" }, 401);
  try {
    const gratitudeCount = await env.ban_dong_hanh_db.prepare(
      "SELECT COUNT(*) as count FROM gratitude WHERE user_id = ?"
    ).bind(userId).first();
    const journalCount = await env.ban_dong_hanh_db.prepare(
      "SELECT COUNT(*) as count FROM journal WHERE user_id = ?"
    ).bind(userId).first();
    const moodDist = await env.ban_dong_hanh_db.prepare(
      "SELECT mood, COUNT(*) as count FROM journal WHERE user_id = ? AND mood IS NOT NULL GROUP BY mood"
    ).bind(userId).all();
    const focusStats = await env.ban_dong_hanh_db.prepare(
      "SELECT COUNT(*) as count, COALESCE(SUM(duration_minutes), 0) as total_minutes FROM focus_sessions WHERE user_id = ? AND completed = 1"
    ).bind(userId).first();
    const breathingStats = await env.ban_dong_hanh_db.prepare(
      "SELECT COUNT(*) as count, COALESCE(SUM(duration_seconds), 0) as total_seconds FROM breathing_sessions WHERE user_id = ?"
    ).bind(userId).first();
    const sleepStats = await env.ban_dong_hanh_db.prepare(
      "SELECT COUNT(*) as count, COALESCE(AVG(duration_minutes), 0) as avg_duration, COALESCE(AVG(quality), 0) as avg_quality FROM sleep_logs WHERE user_id = ?"
    ).bind(userId).first();
    const achievementsCount = await env.ban_dong_hanh_db.prepare(
      "SELECT COUNT(*) as count FROM achievements WHERE user_id = ?"
    ).bind(userId).first();
    const streakResult = await env.ban_dong_hanh_db.prepare(`
      SELECT DATE(created_at) as date FROM gratitude 
      WHERE user_id = ? 
      GROUP BY DATE(created_at) 
      ORDER BY date DESC
    `).bind(userId).all();
    let streak = 0;
    if (streakResult.results.length > 0) {
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const dates = streakResult.results.map((r) => r.date);
      const yesterday = new Date(Date.now() - 864e5).toISOString().split("T")[0];
      if (dates[0] === today || dates[0] === yesterday) {
        streak = 1;
        for (let i = 1; i < dates.length; i++) {
          const prevDate = new Date(dates[i - 1]);
          const currDate = new Date(dates[i]);
          const diffDays = (prevDate - currDate) / 864e5;
          if (diffDays === 1) {
            streak++;
          } else {
            break;
          }
        }
      }
    }
    const moodDistribution = {};
    if (moodDist.results) {
      moodDist.results.forEach((m) => {
        moodDistribution[m.mood] = m.count;
      });
    }
    return json({
      gratitude: { count: gratitudeCount.count, streak },
      journal: { count: journalCount.count, moodDistribution },
      focus: { sessions: focusStats.count, totalMinutes: focusStats.total_minutes },
      breathing: { sessions: breathingStats.count, totalSeconds: breathingStats.total_seconds },
      sleep: {
        logs: sleepStats.count,
        avgMinutes: Math.round(sleepStats.avg_duration || 0),
        avgQuality: parseFloat((sleepStats.avg_quality || 0).toFixed(1))
      },
      achievements: { count: achievementsCount.count }
    });
  } catch (error) {
    console.error("[Data] getStats error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(getStats, "getStats");
async function exportData(request, env) {
  const userId = getUserId(request);
  if (!userId)
    return json({ error: "not_authenticated" }, 401);
  try {
    const user = await env.ban_dong_hanh_db.prepare(
      "SELECT username, created_at FROM users WHERE id = ?"
    ).bind(userId).first();
    const gratitude = await env.ban_dong_hanh_db.prepare(
      "SELECT content, created_at FROM gratitude WHERE user_id = ? ORDER BY created_at"
    ).bind(userId).all();
    const journal = await env.ban_dong_hanh_db.prepare(
      "SELECT content, mood, tags, created_at FROM journal WHERE user_id = ? ORDER BY created_at"
    ).bind(userId).all();
    const focus = await env.ban_dong_hanh_db.prepare(
      "SELECT duration_minutes, session_type, completed, created_at FROM focus_sessions WHERE user_id = ? ORDER BY created_at"
    ).bind(userId).all();
    const breathing = await env.ban_dong_hanh_db.prepare(
      "SELECT exercise_type, duration_seconds, created_at FROM breathing_sessions WHERE user_id = ? ORDER BY created_at"
    ).bind(userId).all();
    const sleepLogs = await env.ban_dong_hanh_db.prepare(
      "SELECT sleep_time, wake_time, duration_minutes, quality, notes, created_at FROM sleep_logs WHERE user_id = ? ORDER BY created_at"
    ).bind(userId).all();
    const achievements = await env.ban_dong_hanh_db.prepare(
      "SELECT achievement_id, unlocked_at FROM achievements WHERE user_id = ?"
    ).bind(userId).all();
    const settings = await env.ban_dong_hanh_db.prepare(
      "SELECT theme, notifications, sound, font_size FROM user_settings WHERE user_id = ?"
    ).bind(userId).first();
    return json({
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      version: "1.1",
      user: { username: user.username, created_at: user.created_at },
      data: {
        gratitude: gratitude.results,
        journal: journal.results,
        focus_sessions: focus.results,
        breathing_sessions: breathing.results,
        sleep_logs: sleepLogs.results,
        achievements: achievements.results,
        settings: settings || {}
      }
    });
  } catch (error) {
    console.error("[Data] exportData error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(exportData, "exportData");
async function importData(request, env) {
  const userId = getUserId(request);
  if (!userId)
    return json({ error: "not_authenticated" }, 401);
  try {
    const { data } = await request.json();
    console.log("[Import] User", userId, "importing data:", {
      gratitude: data?.gratitude?.length || 0,
      journal: data?.journal?.length || 0,
      focus: data?.focus_sessions?.length || 0,
      breathing: data?.breathing_sessions?.length || 0,
      sleep: data?.sleep_logs?.length || 0
    });
    if (!data || typeof data !== "object") {
      return json({ error: "invalid_data_format" }, 400);
    }
    let imported = { gratitude: 0, journal: 0, focus: 0, breathing: 0 };
    if (Array.isArray(data.gratitude)) {
      for (const item of data.gratitude.slice(0, 1e3)) {
        if (item.content) {
          const createdAt = item.created_at || (/* @__PURE__ */ new Date()).toISOString();
          const existing = await env.ban_dong_hanh_db.prepare(
            `SELECT id FROM gratitude 
                         WHERE user_id = ? AND content = ? 
                         AND date(created_at) = date(?)`
          ).bind(userId, item.content, createdAt).first();
          if (!existing) {
            await env.ban_dong_hanh_db.prepare(
              "INSERT INTO gratitude (user_id, content, created_at) VALUES (?, ?, ?)"
            ).bind(userId, item.content, createdAt).run();
            imported.gratitude++;
          }
        }
      }
    }
    if (Array.isArray(data.journal)) {
      for (const item of data.journal.slice(0, 500)) {
        if (item.content) {
          const createdAt = item.created_at || (/* @__PURE__ */ new Date()).toISOString();
          const dateOnly = createdAt.split("T")[0];
          const existing = await env.ban_dong_hanh_db.prepare(
            `SELECT id FROM journal 
                         WHERE user_id = ? AND content = ? 
                         AND date(created_at) = date(?)`
          ).bind(userId, item.content, createdAt).first();
          if (!existing) {
            await env.ban_dong_hanh_db.prepare(
              "INSERT INTO journal (user_id, content, mood, tags, created_at) VALUES (?, ?, ?, ?, ?)"
            ).bind(userId, item.content, item.mood || null, item.tags || null, createdAt).run();
            imported.journal++;
          }
        }
      }
    }
    if (Array.isArray(data.focus_sessions)) {
      for (const item of data.focus_sessions.slice(0, 1e3)) {
        if (item.duration_minutes) {
          await env.ban_dong_hanh_db.prepare(
            "INSERT INTO focus_sessions (user_id, duration_minutes, session_type, completed, created_at) VALUES (?, ?, ?, ?, ?)"
          ).bind(userId, item.duration_minutes, item.session_type || "focus", item.completed ?? 1, item.created_at || (/* @__PURE__ */ new Date()).toISOString()).run();
          imported.focus++;
        }
      }
    }
    if (Array.isArray(data.breathing_sessions)) {
      for (const item of data.breathing_sessions.slice(0, 1e3)) {
        if (item.exercise_type && item.duration_seconds) {
          await env.ban_dong_hanh_db.prepare(
            "INSERT INTO breathing_sessions (user_id, exercise_type, duration_seconds, created_at) VALUES (?, ?, ?, ?)"
          ).bind(userId, item.exercise_type, item.duration_seconds, item.created_at || (/* @__PURE__ */ new Date()).toISOString()).run();
          imported.breathing++;
        }
      }
    }
    if (Array.isArray(data.sleep_logs)) {
      for (const item of data.sleep_logs.slice(0, 500)) {
        if (item.sleep_time && item.wake_time) {
          await env.ban_dong_hanh_db.prepare(
            "INSERT INTO sleep_logs (user_id, sleep_time, wake_time, duration_minutes, quality, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
          ).bind(
            userId,
            item.sleep_time,
            item.wake_time,
            item.duration_minutes || null,
            item.quality || null,
            item.notes || null,
            item.created_at || (/* @__PURE__ */ new Date()).toISOString()
          ).run();
          imported.sleep = (imported.sleep || 0) + 1;
        }
      }
    }
    console.log("[Import] Successfully imported for user", userId, ":", imported);
    return json({ success: true, imported });
  } catch (error) {
    console.error("[Data] importData error:", error.message);
    return json({ error: "server_error", message: error.message }, 500);
  }
}
__name(importData, "importData");
async function getGameScores(request, env) {
  const userId = getUserId(request);
  const url = new URL(request.url);
  const gameType = url.searchParams.get("game_type");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "10"), 50);
  const leaderboard = url.searchParams.get("leaderboard") === "true";
  try {
    if (leaderboard) {
      const result2 = await env.ban_dong_hanh_db.prepare(`
                SELECT gs.score, gs.level_reached, gs.created_at, 
                       'Player_' || SUBSTR(CAST(gs.user_id AS TEXT), 1, 3) as player_name
                FROM game_scores gs
                ${gameType ? "WHERE gs.game_type = ?" : ""}
                ORDER BY gs.score DESC
                LIMIT ?
            `).bind(...gameType ? [gameType, limit] : [limit]).all();
      return json({ leaderboard: result2.results });
    }
    if (!userId)
      return json({ error: "not_authenticated" }, 401);
    const query = gameType ? "SELECT id, game_type, score, level_reached, play_duration_seconds, created_at FROM game_scores WHERE user_id = ? AND game_type = ? ORDER BY score DESC LIMIT ?" : "SELECT id, game_type, score, level_reached, play_duration_seconds, created_at FROM game_scores WHERE user_id = ? ORDER BY created_at DESC LIMIT ?";
    const result = await env.ban_dong_hanh_db.prepare(query).bind(...gameType ? [userId, gameType, limit] : [userId, limit]).all();
    const highScores = await env.ban_dong_hanh_db.prepare(`
            SELECT game_type, MAX(score) as high_score 
            FROM game_scores 
            WHERE user_id = ? 
            GROUP BY game_type
        `).bind(userId).all();
    return json({
      items: result.results,
      highScores: Object.fromEntries(highScores.results.map((h) => [h.game_type, h.high_score]))
    });
  } catch (error) {
    console.error("[Data] getGameScores error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(getGameScores, "getGameScores");
async function addGameScore(request, env) {
  const userId = getUserId(request);
  if (!userId)
    return json({ error: "not_authenticated" }, 401);
  try {
    const { game_type, score, level_reached = 1, play_duration_seconds } = await request.json();
    if (!game_type || typeof game_type !== "string") {
      return json({ error: "game_type b\u1EAFt bu\u1ED9c" }, 400);
    }
    if (typeof score !== "number" || score < 0) {
      return json({ error: "score ph\u1EA3i l\xE0 s\u1ED1 kh\xF4ng \xE2m" }, 400);
    }
    const validGames = ["space_control", "space_pilot", "bee_game", "bubble_pop", "color_match", "doodle", "reflex"];
    if (!validGames.includes(game_type)) {
      return json({ error: "game_type kh\xF4ng h\u1EE3p l\u1EC7" }, 400);
    }
    const currentHigh = await env.ban_dong_hanh_db.prepare(
      "SELECT MAX(score) as high FROM game_scores WHERE user_id = ? AND game_type = ?"
    ).bind(userId, game_type).first();
    const isNewRecord = score > (currentHigh?.high || 0);
    const result = await env.ban_dong_hanh_db.prepare(
      "INSERT INTO game_scores (user_id, game_type, score, level_reached, play_duration_seconds) VALUES (?, ?, ?, ?, ?) RETURNING *"
    ).bind(userId, game_type, score, level_reached, play_duration_seconds || null).first();
    if (isNewRecord) {
      await env.ban_dong_hanh_db.prepare(`
                INSERT INTO user_stats (user_id, games_played, highest_game_score)
                VALUES (?, 1, ?)
                ON CONFLICT(user_id) DO UPDATE SET
                    games_played = games_played + 1,
                    highest_game_score = MAX(highest_game_score, ?),
                    updated_at = datetime('now')
            `).bind(userId, score, score).run();
    }
    return json({
      success: true,
      item: result,
      isNewRecord,
      previousHigh: currentHigh?.high || 0
    }, 201);
  } catch (error) {
    console.error("[Data] addGameScore error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(addGameScore, "addGameScore");
async function getNotificationSettings(request, env) {
  const userId = getUserId(request);
  if (!userId)
    return json({ error: "not_authenticated" }, 401);
  try {
    const settings = await env.ban_dong_hanh_db.prepare(
      "SELECT daily_reminder, pomodoro_alerts, sleep_reminder, reminder_time, push_subscription FROM notification_settings WHERE user_id = ?"
    ).bind(userId).first();
    return json({
      settings: settings || {
        daily_reminder: false,
        pomodoro_alerts: true,
        sleep_reminder: false,
        reminder_time: null,
        push_subscription: null
      }
    });
  } catch (error) {
    console.error("[Data] getNotificationSettings error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(getNotificationSettings, "getNotificationSettings");
async function saveNotificationSettings(request, env) {
  const userId = getUserId(request);
  if (!userId)
    return json({ error: "not_authenticated" }, 401);
  try {
    const { daily_reminder, pomodoro_alerts, sleep_reminder, reminder_time, push_subscription } = await request.json();
    if (reminder_time && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(reminder_time)) {
      return json({ error: "reminder_time ph\u1EA3i c\xF3 \u0111\u1ECBnh d\u1EA1ng HH:MM" }, 400);
    }
    const subscriptionValue = push_subscription ? JSON.stringify(push_subscription) : null;
    await env.ban_dong_hanh_db.prepare(`
            INSERT INTO notification_settings (user_id, daily_reminder, pomodoro_alerts, sleep_reminder, reminder_time, push_subscription)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                daily_reminder = COALESCE(?, daily_reminder),
                pomodoro_alerts = COALESCE(?, pomodoro_alerts),
                sleep_reminder = COALESCE(?, sleep_reminder),
                reminder_time = COALESCE(?, reminder_time),
                push_subscription = COALESCE(?, push_subscription),
                updated_at = datetime('now')
        `).bind(
      userId,
      daily_reminder ? 1 : 0,
      pomodoro_alerts !== false ? 1 : 0,
      sleep_reminder ? 1 : 0,
      reminder_time || null,
      subscriptionValue,
      daily_reminder !== void 0 ? daily_reminder ? 1 : 0 : null,
      pomodoro_alerts !== void 0 ? pomodoro_alerts ? 1 : 0 : null,
      sleep_reminder !== void 0 ? sleep_reminder ? 1 : 0 : null,
      reminder_time || null,
      subscriptionValue
    ).run();
    return json({ success: true });
  } catch (error) {
    console.error("[Data] saveNotificationSettings error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(saveNotificationSettings, "saveNotificationSettings");
async function logSOSEvent(request, env) {
  const userId = getUserId(request);
  try {
    const { event_type, risk_level, trigger_text, location, metadata } = await request.json();
    if (!event_type) {
      return json({ error: "event_type b\u1EAFt bu\u1ED9c" }, 400);
    }
    const validEventTypes = ["overlay_opened", "hotline_clicked", "map_viewed", "message_flagged", "false_positive"];
    if (!validEventTypes.includes(event_type)) {
      return json({ error: "event_type kh\xF4ng h\u1EE3p l\u1EC7" }, 400);
    }
    let hashedUserId = null;
    if (userId) {
      const encoder = new TextEncoder();
      const data = encoder.encode(userId.toString() + "bdh_salt");
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      hashedUserId = hashArray.slice(0, 4).map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    await env.ban_dong_hanh_db.prepare(`
            INSERT INTO sos_logs (user_id, hashed_user_id, event_type, risk_level, trigger_text, location_lat, location_lng, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
      userId || null,
      hashedUserId,
      event_type,
      risk_level || null,
      trigger_text ? trigger_text.slice(0, 50) : null,
      // Chỉ lưu 50 ký tự từ khóa
      location?.lat || null,
      location?.lng || null,
      metadata ? JSON.stringify(metadata) : null
    ).run();
    console.log("[SOS] Event logged:", { event_type, risk_level, hashedUserId });
    return json({ success: true });
  } catch (error) {
    console.error("[Data] logSOSEvent error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(logSOSEvent, "logSOSEvent");
async function getRandomCardsHistory(request, env) {
  const userId = getUserId(request);
  if (!userId)
    return json({ error: "not_authenticated" }, 401);
  try {
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
    const result = await env.ban_dong_hanh_db.prepare(
      "SELECT card_id, viewed_at, action_taken FROM random_cards_history WHERE user_id = ? ORDER BY viewed_at DESC LIMIT ?"
    ).bind(userId, limit).all();
    return json({ items: result.results });
  } catch (error) {
    console.error("[Data] getRandomCardsHistory error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(getRandomCardsHistory, "getRandomCardsHistory");
async function addRandomCardHistory(request, env) {
  const userId = getUserId(request);
  if (!userId)
    return json({ error: "not_authenticated" }, 401);
  try {
    const { card_id, action_taken = false } = await request.json();
    if (!card_id) {
      return json({ error: "card_id b\u1EAFt bu\u1ED9c" }, 400);
    }
    await env.ban_dong_hanh_db.prepare(
      "INSERT INTO random_cards_history (user_id, card_id, action_taken) VALUES (?, ?, ?)"
    ).bind(userId, card_id, action_taken ? 1 : 0).run();
    return json({ success: true }, 201);
  } catch (error) {
    console.error("[Data] addRandomCardHistory error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(addRandomCardHistory, "addRandomCardHistory");
async function getUserStats(request, env) {
  const userId = getUserId(request);
  if (!userId)
    return json({ error: "not_authenticated" }, 401);
  try {
    let stats = await env.ban_dong_hanh_db.prepare(
      "SELECT * FROM user_stats WHERE user_id = ?"
    ).bind(userId).first();
    if (!stats) {
      await env.ban_dong_hanh_db.prepare(
        "INSERT INTO user_stats (user_id) VALUES (?)"
      ).bind(userId).run();
      stats = {
        total_xp: 0,
        current_level: 1,
        breathing_total: 0,
        gratitude_streak: 0,
        max_gratitude_streak: 0,
        journal_count: 0,
        focus_total_minutes: 0,
        games_played: 0,
        highest_game_score: 0
      };
    }
    const xpPerLevel = 100;
    const level = Math.floor(stats.total_xp / xpPerLevel) + 1;
    const xpForNextLevel = xpPerLevel - stats.total_xp % xpPerLevel;
    return json({
      ...stats,
      calculated_level: level,
      xp_for_next_level: xpForNextLevel,
      xp_progress_percent: Math.round(stats.total_xp % xpPerLevel / xpPerLevel * 100)
    });
  } catch (error) {
    console.error("[Data] getUserStats error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(getUserStats, "getUserStats");
async function addUserXP(request, env) {
  const userId = getUserId(request);
  if (!userId)
    return json({ error: "not_authenticated" }, 401);
  try {
    const { xp, source } = await request.json();
    if (typeof xp !== "number" || xp <= 0) {
      return json({ error: "xp ph\u1EA3i l\xE0 s\u1ED1 d\u01B0\u01A1ng" }, 400);
    }
    const cappedXP = Math.min(xp, 100);
    const currentStats = await env.ban_dong_hanh_db.prepare(
      "SELECT total_xp, current_level FROM user_stats WHERE user_id = ?"
    ).bind(userId).first();
    const oldLevel = currentStats?.current_level || 1;
    const oldXP = currentStats?.total_xp || 0;
    const newXP = oldXP + cappedXP;
    const xpPerLevel = 100;
    const newLevel = Math.floor(newXP / xpPerLevel) + 1;
    await env.ban_dong_hanh_db.prepare(`
            INSERT INTO user_stats (user_id, total_xp, current_level)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                total_xp = total_xp + ?,
                current_level = ?,
                updated_at = datetime('now')
        `).bind(userId, newXP, newLevel, cappedXP, newLevel).run();
    const leveledUp = newLevel > oldLevel;
    console.log("[XP] Added:", { userId, xp: cappedXP, source, newLevel, leveledUp });
    return json({
      success: true,
      xp_added: cappedXP,
      total_xp: newXP,
      level: newLevel,
      leveled_up: leveledUp,
      old_level: oldLevel
    });
  } catch (error) {
    console.error("[Data] addUserXP error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(addUserXP, "addUserXP");

// workers/forum-api.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
init_risk();
init_sanitize();
function getUserId2(request) {
  const userId = request.headers.get("X-User-Id");
  if (!userId)
    return null;
  const parsed = parseInt(userId);
  return isNaN(parsed) ? null : parsed;
}
__name(getUserId2, "getUserId");
function json2(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
__name(json2, "json");
function hashUserId(userId) {
  if (!userId)
    return null;
  const hash = userId.toString(36) + Date.now().toString(36).slice(-4);
  return hash.slice(0, 8).toUpperCase();
}
__name(hashUserId, "hashUserId");
function validateContent(content, maxLength = 2e3) {
  if (!content || typeof content !== "string") {
    throw new Error("empty_content");
  }
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    throw new Error("empty_content");
  }
  if (trimmed.length > maxLength) {
    throw new Error("content_too_long");
  }
  if (hasInjection(trimmed)) {
    throw new Error("content_blocked");
  }
  const risk = classifyRiskRules(trimmed);
  if (risk === "red") {
    throw new Error("content_sensitive");
  }
  return trimmed;
}
__name(validateContent, "validateContent");
async function isUserBanned(userId, env) {
  if (!userId)
    return false;
  const banned = await env.ban_dong_hanh_db.prepare(
    "SELECT id, banned_until FROM banned_users WHERE user_id = ?"
  ).bind(userId).first();
  if (!banned)
    return false;
  if (banned.banned_until) {
    const banEnd = new Date(banned.banned_until);
    if (banEnd < /* @__PURE__ */ new Date()) {
      await env.ban_dong_hanh_db.prepare(
        "DELETE FROM banned_users WHERE user_id = ?"
      ).bind(userId).run();
      return false;
    }
  }
  return true;
}
__name(isUserBanned, "isUserBanned");
async function isAdmin(userId, env) {
  if (!userId)
    return false;
  const user = await env.ban_dong_hanh_db.prepare(
    "SELECT is_admin FROM users WHERE id = ?"
  ).bind(userId).first();
  return user?.is_admin === 1;
}
__name(isAdmin, "isAdmin");
async function getForumPosts(request, env) {
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50);
  const offset = (page - 1) * limit;
  const tag = url.searchParams.get("tag");
  try {
    let query = "SELECT id, hashed_user_id, title, content, tags, upvotes, comments_count, created_at FROM forum_posts WHERE is_hidden = 0";
    const params = [];
    if (tag) {
      query += " AND tags LIKE ?";
      params.push(`%"${tag}"%`);
    }
    const sortBy = url.searchParams.get("sort") || "newest";
    if (sortBy === "popular") {
      query += " ORDER BY upvotes DESC, created_at DESC";
    } else if (sortBy === "oldest") {
      query += " ORDER BY created_at ASC";
    } else {
      query += " ORDER BY created_at DESC";
    }
    query += " LIMIT ? OFFSET ?";
    params.push(limit, offset);
    const result = await env.ban_dong_hanh_db.prepare(query).bind(...params).all();
    let countQuery = "SELECT COUNT(*) as total FROM forum_posts WHERE is_hidden = 0";
    if (tag) {
      countQuery += " AND tags LIKE ?";
    }
    const countResult = await env.ban_dong_hanh_db.prepare(countQuery).bind(...tag ? [`%"${tag}"%`] : []).first();
    return json2({
      items: result.results.map((post) => ({
        ...post,
        content: post.content.length > 200 ? post.content.slice(0, 200) + "..." : post.content,
        tags: post.tags ? JSON.parse(post.tags) : []
      })),
      pagination: {
        page,
        limit,
        total: countResult.total,
        totalPages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    console.error("[Forum] getForumPosts error:", error.message);
    return json2({ error: "server_error" }, 500);
  }
}
__name(getForumPosts, "getForumPosts");
async function getForumPost(request, env, id) {
  try {
    const post = await env.ban_dong_hanh_db.prepare(
      "SELECT id, hashed_user_id, title, content, tags, upvotes, comments_count, is_locked, created_at FROM forum_posts WHERE id = ? AND is_hidden = 0"
    ).bind(parseInt(id)).first();
    if (!post) {
      return json2({ error: "post_not_found" }, 404);
    }
    const comments = await env.ban_dong_hanh_db.prepare(
      "SELECT id, hashed_user_id, content, created_at FROM forum_comments WHERE post_id = ? AND is_hidden = 0 ORDER BY created_at ASC"
    ).bind(parseInt(id)).all();
    return json2({
      post: {
        ...post,
        tags: post.tags ? JSON.parse(post.tags) : []
      },
      comments: comments.results
    });
  } catch (error) {
    console.error("[Forum] getForumPost error:", error.message);
    return json2({ error: "server_error" }, 500);
  }
}
__name(getForumPost, "getForumPost");
async function createForumPost(request, env) {
  const userId = getUserId2(request);
  try {
    if (userId && await isUserBanned(userId, env)) {
      return json2({ error: "user_banned", message: "T\xE0i kho\u1EA3n c\u1EE7a b\u1EA1n \u0111\xE3 b\u1ECB h\u1EA1n ch\u1EBF \u0111\u0103ng b\xE0i" }, 403);
    }
    const { title, content, tags, anonymous } = await request.json();
    let validatedContent;
    try {
      validatedContent = validateContent(content, 5e3);
    } catch (e) {
      if (e.message === "content_sensitive") {
        return json2({
          error: "content_sensitive",
          message: "N\u1ED9i dung c\xF3 d\u1EA5u hi\u1EC7u nh\u1EA1y c\u1EA3m. N\u1EBFu b\u1EA1n \u0111ang g\u1EB7p kh\xF3 kh\u0103n, h\xE3y li\xEAn h\u1EC7 \u0111\u01B0\u1EDDng d\xE2y n\xF3ng: 1800 599 920"
        }, 400);
      }
      if (e.message === "content_blocked") {
        return json2({ error: "content_blocked", message: "N\u1ED9i dung kh\xF4ng \u0111\u01B0\u1EE3c ph\xE9p" }, 400);
      }
      return json2({ error: e.message }, 400);
    }
    let validatedTitle = null;
    if (title) {
      try {
        validatedTitle = validateContent(title, 200);
      } catch {
        return json2({ error: "invalid_title" }, 400);
      }
    }
    const validTags = Array.isArray(tags) ? tags.slice(0, 5).map((t) => t.trim()).filter((t) => t.length > 0 && t.length < 30) : [];
    const hashedId = anonymous ? null : hashUserId(userId);
    const result = await env.ban_dong_hanh_db.prepare(
      "INSERT INTO forum_posts (user_id, hashed_user_id, title, content, tags) VALUES (?, ?, ?, ?, ?) RETURNING id, hashed_user_id, title, content, tags, upvotes, comments_count, created_at"
    ).bind(
      anonymous ? null : userId,
      hashedId,
      validatedTitle,
      validatedContent,
      validTags.length > 0 ? JSON.stringify(validTags) : null
    ).first();
    return json2({
      success: true,
      post: {
        ...result,
        tags: validTags
      }
    }, 201);
  } catch (error) {
    console.error("[Forum] createForumPost error:", error.message);
    return json2({ error: "server_error" }, 500);
  }
}
__name(createForumPost, "createForumPost");
async function addComment(request, env, postId) {
  const userId = getUserId2(request);
  try {
    if (userId && await isUserBanned(userId, env)) {
      return json2({ error: "user_banned" }, 403);
    }
    const post = await env.ban_dong_hanh_db.prepare(
      "SELECT id, is_locked FROM forum_posts WHERE id = ? AND is_hidden = 0"
    ).bind(parseInt(postId)).first();
    if (!post) {
      return json2({ error: "post_not_found" }, 404);
    }
    if (post.is_locked) {
      return json2({ error: "post_locked", message: "B\xE0i vi\u1EBFt n\xE0y \u0111\xE3 b\u1ECB kh\xF3a b\xECnh lu\u1EADn" }, 403);
    }
    const { content, anonymous } = await request.json();
    let validatedContent;
    try {
      validatedContent = validateContent(content, 1e3);
    } catch (e) {
      if (e.message === "content_sensitive") {
        return json2({
          error: "content_sensitive",
          message: "N\u1ED9i dung c\xF3 d\u1EA5u hi\u1EC7u nh\u1EA1y c\u1EA3m. N\u1EBFu b\u1EA1n \u0111ang g\u1EB7p kh\xF3 kh\u0103n, h\xE3y li\xEAn h\u1EC7 \u0111\u01B0\u1EDDng d\xE2y n\xF3ng: 1800 599 920"
        }, 400);
      }
      return json2({ error: e.message }, 400);
    }
    const hashedId = anonymous ? null : hashUserId(userId);
    const result = await env.ban_dong_hanh_db.prepare(
      "INSERT INTO forum_comments (post_id, user_id, hashed_user_id, content) VALUES (?, ?, ?, ?) RETURNING id, hashed_user_id, content, created_at"
    ).bind(parseInt(postId), anonymous ? null : userId, hashedId, validatedContent).first();
    await env.ban_dong_hanh_db.prepare(
      "UPDATE forum_posts SET comments_count = comments_count + 1 WHERE id = ?"
    ).bind(parseInt(postId)).run();
    return json2({ success: true, comment: result }, 201);
  } catch (error) {
    console.error("[Forum] addComment error:", error.message);
    return json2({ error: "server_error" }, 500);
  }
}
__name(addComment, "addComment");
async function upvotePost(request, env, postId) {
  const userId = getUserId2(request);
  if (!userId) {
    return json2({ error: "login_required", message: "C\u1EA7n \u0111\u0103ng nh\u1EADp \u0111\u1EC3 upvote" }, 401);
  }
  try {
    const existing = await env.ban_dong_hanh_db.prepare(
      "SELECT id FROM forum_upvotes WHERE post_id = ? AND user_id = ?"
    ).bind(parseInt(postId), userId).first();
    if (existing) {
      await env.ban_dong_hanh_db.prepare(
        "DELETE FROM forum_upvotes WHERE post_id = ? AND user_id = ?"
      ).bind(parseInt(postId), userId).run();
      await env.ban_dong_hanh_db.prepare(
        "UPDATE forum_posts SET upvotes = upvotes - 1 WHERE id = ?"
      ).bind(parseInt(postId)).run();
      return json2({ success: true, action: "removed" });
    } else {
      await env.ban_dong_hanh_db.prepare(
        "INSERT INTO forum_upvotes (post_id, user_id) VALUES (?, ?)"
      ).bind(parseInt(postId), userId).run();
      await env.ban_dong_hanh_db.prepare(
        "UPDATE forum_posts SET upvotes = upvotes + 1 WHERE id = ?"
      ).bind(parseInt(postId)).run();
      return json2({ success: true, action: "added" });
    }
  } catch (error) {
    console.error("[Forum] upvotePost error:", error.message);
    return json2({ error: "server_error" }, 500);
  }
}
__name(upvotePost, "upvotePost");
async function deletePost(request, env, postId) {
  const userId = getUserId2(request);
  if (!userId)
    return json2({ error: "not_authenticated" }, 401);
  try {
    if (!await isAdmin(userId, env)) {
      return json2({ error: "forbidden" }, 403);
    }
    const { reason, permanent } = await request.json().catch(() => ({}));
    if (permanent) {
      await env.ban_dong_hanh_db.prepare(
        "DELETE FROM forum_posts WHERE id = ?"
      ).bind(parseInt(postId)).run();
    } else {
      await env.ban_dong_hanh_db.prepare(
        "UPDATE forum_posts SET is_hidden = 1 WHERE id = ?"
      ).bind(parseInt(postId)).run();
    }
    await env.ban_dong_hanh_db.prepare(
      "INSERT INTO admin_logs (admin_user_id, action_type, target_type, target_id, reason) VALUES (?, ?, ?, ?, ?)"
    ).bind(userId, permanent ? "delete_post" : "hide_post", "post", parseInt(postId), reason || null).run();
    return json2({ success: true });
  } catch (error) {
    console.error("[Forum] deletePost error:", error.message);
    return json2({ error: "server_error" }, 500);
  }
}
__name(deletePost, "deletePost");
async function deleteComment(request, env, commentId) {
  const userId = getUserId2(request);
  if (!userId)
    return json2({ error: "not_authenticated" }, 401);
  try {
    if (!await isAdmin(userId, env)) {
      return json2({ error: "forbidden" }, 403);
    }
    const { reason } = await request.json().catch(() => ({}));
    const comment = await env.ban_dong_hanh_db.prepare(
      "SELECT post_id FROM forum_comments WHERE id = ?"
    ).bind(parseInt(commentId)).first();
    if (!comment) {
      return json2({ error: "not_found" }, 404);
    }
    await env.ban_dong_hanh_db.prepare(
      "UPDATE forum_comments SET is_hidden = 1 WHERE id = ?"
    ).bind(parseInt(commentId)).run();
    await env.ban_dong_hanh_db.prepare(
      "UPDATE forum_posts SET comments_count = comments_count - 1 WHERE id = ? AND comments_count > 0"
    ).bind(comment.post_id).run();
    await env.ban_dong_hanh_db.prepare(
      "INSERT INTO admin_logs (admin_user_id, action_type, target_type, target_id, reason) VALUES (?, ?, ?, ?, ?)"
    ).bind(userId, "hide_comment", "comment", parseInt(commentId), reason || null).run();
    return json2({ success: true });
  } catch (error) {
    console.error("[Forum] deleteComment error:", error.message);
    return json2({ error: "server_error" }, 500);
  }
}
__name(deleteComment, "deleteComment");
async function toggleLockPost(request, env, postId) {
  const userId = getUserId2(request);
  if (!userId)
    return json2({ error: "not_authenticated" }, 401);
  try {
    if (!await isAdmin(userId, env)) {
      return json2({ error: "forbidden" }, 403);
    }
    const post = await env.ban_dong_hanh_db.prepare(
      "SELECT is_locked FROM forum_posts WHERE id = ?"
    ).bind(parseInt(postId)).first();
    if (!post) {
      return json2({ error: "not_found" }, 404);
    }
    const newStatus = post.is_locked ? 0 : 1;
    await env.ban_dong_hanh_db.prepare(
      "UPDATE forum_posts SET is_locked = ? WHERE id = ?"
    ).bind(newStatus, parseInt(postId)).run();
    await env.ban_dong_hanh_db.prepare(
      "INSERT INTO admin_logs (admin_user_id, action_type, target_type, target_id) VALUES (?, ?, ?, ?)"
    ).bind(userId, newStatus ? "lock_post" : "unlock_post", "post", parseInt(postId)).run();
    return json2({ success: true, is_locked: newStatus === 1 });
  } catch (error) {
    console.error("[Forum] toggleLockPost error:", error.message);
    return json2({ error: "server_error" }, 500);
  }
}
__name(toggleLockPost, "toggleLockPost");
async function getAllUsers(request, env) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return json2({ error: "not_authenticated", message: "C\u1EA7n \u0111\u0103ng nh\u1EADp admin" }, 401);
  }
  try {
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
    const offset = Math.max(parseInt(url.searchParams.get("offset") || "0"), 0);
    const sortBy = url.searchParams.get("sort") || "created_at";
    const users = await env.ban_dong_hanh_db.prepare(
      "SELECT id, username, created_at, last_login FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?"
    ).bind(limit, offset).all();
    const usersWithStats = await Promise.all(
      users.results.map(async (user) => {
        const [journalCount, sosCount] = await Promise.all([
          env.ban_dong_hanh_db.prepare(
            "SELECT COUNT(*) as count FROM journal WHERE user_id = ?"
          ).bind(user.id).first().catch(() => ({ count: 0 })),
          env.ban_dong_hanh_db.prepare(
            "SELECT COUNT(*) as count FROM sos_logs WHERE hashed_user_id LIKE ? OR user_id = ?"
          ).bind(`%${user.id}%`, user.id).first().catch(() => ({ count: 0 }))
        ]);
        const recentSOS = await env.ban_dong_hanh_db.prepare(
          `SELECT COUNT(*) as count FROM sos_logs 
                     WHERE (hashed_user_id LIKE ? OR user_id = ?) 
                     AND created_at >= datetime('now', '-7 days')`
        ).bind(`%${user.id}%`, user.id).first().catch(() => ({ count: 0 }));
        const recentJournal = await env.ban_dong_hanh_db.prepare(
          `SELECT COUNT(*) as count FROM journal 
                     WHERE user_id = ? AND created_at >= datetime('now', '-7 days')`
        ).bind(user.id).first().catch(() => ({ count: 0 }));
        return {
          ...user,
          journal_count: journalCount.count || 0,
          sos_count: sosCount.count || 0,
          recent_sos_count: recentSOS.count || 0,
          recent_journal_count: recentJournal.count || 0,
          needs_support: (recentSOS.count || 0) > 0
          // Có SOS trong 7 ngày qua
        };
      })
    );
    if (sortBy === "sos_count") {
      usersWithStats.sort((a, b) => b.sos_count - a.sos_count);
    } else if (sortBy === "journal_count") {
      usersWithStats.sort((a, b) => b.journal_count - a.journal_count);
    } else if (sortBy === "last_login") {
      usersWithStats.sort((a, b) => {
        if (!a.last_login)
          return 1;
        if (!b.last_login)
          return -1;
        return new Date(b.last_login) - new Date(a.last_login);
      });
    }
    const totalCount = await env.ban_dong_hanh_db.prepare(
      "SELECT COUNT(*) as count FROM users"
    ).first().catch(() => ({ count: 0 }));
    return json2({
      items: usersWithStats,
      total: totalCount.count || 0,
      limit,
      offset
    });
  } catch (error) {
    console.error("[Admin] getAllUsers error:", error.message);
    return json2({ error: "server_error", message: error.message }, 500);
  }
}
__name(getAllUsers, "getAllUsers");
async function reportContent(request, env) {
  const userId = getUserId2(request);
  try {
    const { target_type, target_id, reason, details } = await request.json();
    if (!target_type || !["post", "comment"].includes(target_type)) {
      return json2({ error: "invalid_target_type" }, 400);
    }
    if (!target_id || typeof target_id !== "number") {
      return json2({ error: "invalid_target_id" }, 400);
    }
    const validReasons = ["spam", "harassment", "inappropriate", "misinformation", "other"];
    if (!reason || !validReasons.includes(reason)) {
      return json2({ error: "invalid_reason" }, 400);
    }
    const table = target_type === "post" ? "forum_posts" : "forum_comments";
    const target = await env.ban_dong_hanh_db.prepare(
      `SELECT id FROM ${table} WHERE id = ?`
    ).bind(target_id).first();
    if (!target) {
      return json2({ error: "target_not_found" }, 404);
    }
    const existingReport = await env.ban_dong_hanh_db.prepare(
      "SELECT id FROM forum_reports WHERE target_type = ? AND target_id = ? AND reporter_user_id = ? AND status = ?"
    ).bind(target_type, target_id, userId || null, "pending").first();
    if (existingReport) {
      return json2({
        error: "already_reported",
        message: "B\u1EA1n \u0111\xE3 b\xE1o c\xE1o n\u1ED9i dung n\xE0y r\u1ED3i. Admin s\u1EBD xem x\xE9t s\u1EDBm nh\u1EA5t."
      }, 400);
    }
    const result = await env.ban_dong_hanh_db.prepare(
      "INSERT INTO forum_reports (target_type, target_id, reporter_user_id, reason, details, status) VALUES (?, ?, ?, ?, ?, ?) RETURNING id, created_at"
    ).bind(
      target_type,
      target_id,
      userId || null,
      reason,
      details ? details.slice(0, 500) : null,
      // Giới hạn 500 ký tự
      "pending"
    ).first();
    console.log("[Forum] Content reported:", { target_type, target_id, reason, reporter: userId || "guest" });
    return json2({
      success: true,
      report_id: result.id,
      message: "C\u1EA3m \u01A1n b\u1EA1n \u0111\xE3 b\xE1o c\xE1o. Admin s\u1EBD xem x\xE9t n\u1ED9i dung n\xE0y s\u1EDBm nh\u1EA5t."
    }, 201);
  } catch (error) {
    console.error("[Forum] reportContent error:", error.message);
    return json2({ error: "server_error" }, 500);
  }
}
__name(reportContent, "reportContent");

// workers/router.js
init_risk();
init_sanitize();
init_memory();
function getAllowedOrigin2(request, env) {
  const reqOrigin = request.headers.get("Origin") || "";
  const allow = env.ALLOW_ORIGIN || "*";
  if (allow === "*" || !reqOrigin)
    return allow === "*" ? "*" : reqOrigin || "*";
  const list = allow.split(",").map((s) => s.trim());
  if (list.includes(reqOrigin))
    return reqOrigin;
  for (const pattern of list) {
    if (pattern.startsWith("*.")) {
      const domain = pattern.slice(2);
      const originHost = reqOrigin.replace(/^https?:\/\//, "");
      if (originHost.endsWith("." + domain) || originHost === domain) {
        return reqOrigin;
      }
    }
  }
  if (reqOrigin.includes(".pages.dev"))
    return reqOrigin;
  return "null";
}
__name(getAllowedOrigin2, "getAllowedOrigin");
function corsHeaders2(origin = "*") {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-User-Id, X-Requested-With",
    "Access-Control-Expose-Headers": "X-Trace-Id"
  };
}
__name(corsHeaders2, "corsHeaders");
function json4(data, status = 200, origin = "*") {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders2(origin) }
  });
}
__name(json4, "json");
function handleOptions2(request, env) {
  const origin = getAllowedOrigin2(request, env);
  return new Response(null, { status: 204, headers: corsHeaders2(origin) });
}
__name(handleOptions2, "handleOptions");
function matchRoute(pathname, method) {
  if (pathname === "/api/auth/register" && method === "POST")
    return "auth:register";
  if (pathname === "/api/auth/login" && method === "POST")
    return "auth:login";
  if (pathname === "/api/auth/check" && method === "GET")
    return "auth:check";
  if (pathname === "/api/auth/me" && method === "GET")
    return "auth:me";
  if (pathname === "/api/auth/account" && method === "DELETE")
    return "auth:delete";
  if (pathname === "/api/data/gratitude" && method === "GET")
    return "data:gratitude:list";
  if (pathname === "/api/data/gratitude" && method === "POST")
    return "data:gratitude:add";
  if (pathname.startsWith("/api/data/gratitude/") && method === "DELETE")
    return "data:gratitude:delete";
  if (pathname === "/api/data/journal" && method === "GET")
    return "data:journal:list";
  if (pathname === "/api/data/journal" && method === "POST")
    return "data:journal:add";
  if (pathname.startsWith("/api/data/journal/") && method === "DELETE")
    return "data:journal:delete";
  if (pathname === "/api/data/focus" && method === "GET")
    return "data:focus:list";
  if (pathname === "/api/data/focus" && method === "POST")
    return "data:focus:add";
  if (pathname === "/api/data/breathing" && method === "GET")
    return "data:breathing:list";
  if (pathname === "/api/data/breathing" && method === "POST")
    return "data:breathing:add";
  if (pathname === "/api/data/sleep" && method === "GET")
    return "data:sleep:list";
  if (pathname === "/api/data/sleep" && method === "POST")
    return "data:sleep:add";
  if (pathname.startsWith("/api/data/sleep/") && method === "DELETE")
    return "data:sleep:delete";
  if (pathname.startsWith("/api/data/sleep/") && method === "PUT")
    return "data:sleep:update";
  if (pathname === "/api/data/achievements" && method === "GET")
    return "data:achievements:list";
  if (pathname === "/api/data/achievements" && method === "POST")
    return "data:achievements:add";
  if (pathname === "/api/data/stats" && method === "GET")
    return "data:stats";
  if (pathname === "/api/data/export" && method === "GET")
    return "data:export";
  if (pathname === "/api/data/import" && method === "POST")
    return "data:import";
  if (pathname === "/api/data/game-scores" && method === "GET")
    return "data:games:list";
  if (pathname === "/api/data/game-scores" && method === "POST")
    return "data:games:add";
  if (pathname === "/api/data/notification-settings" && method === "GET")
    return "data:notifications:get";
  if (pathname === "/api/data/notification-settings" && method === "POST")
    return "data:notifications:save";
  if (pathname === "/api/data/sos-log" && method === "POST")
    return "data:sos:log";
  if (pathname === "/api/data/random-cards-history" && method === "GET")
    return "data:cards:list";
  if (pathname === "/api/data/random-cards-history" && method === "POST")
    return "data:cards:add";
  if (pathname === "/api/data/user-stats" && method === "GET")
    return "data:user-stats:get";
  if (pathname === "/api/data/user-stats/add-xp" && method === "POST")
    return "data:user-stats:xp";
  if (pathname === "/" && method === "POST")
    return "ai:chat";
  if (pathname === "/api/chat" && method === "POST")
    return "ai:chat";
  if (pathname === "/api/forum/posts" && method === "GET")
    return "forum:posts:list";
  if (pathname === "/api/forum/post" && method === "POST")
    return "forum:post:create";
  if (pathname.match(/^\/api\/forum\/post\/\d+$/) && method === "GET")
    return "forum:post:get";
  if (pathname.match(/^\/api\/forum\/post\/\d+$/) && method === "DELETE")
    return "forum:post:delete";
  if (pathname.match(/^\/api\/forum\/post\/\d+\/comment$/) && method === "POST")
    return "forum:comment:add";
  if (pathname.match(/^\/api\/forum\/post\/\d+\/upvote$/) && method === "POST")
    return "forum:post:upvote";
  if (pathname.match(/^\/api\/forum\/post\/\d+\/lock$/) && method === "POST")
    return "forum:post:lock";
  if (pathname.match(/^\/api\/forum\/comment\/\d+$/) && method === "DELETE")
    return "forum:comment:delete";
  if (pathname === "/api/forum/report" && method === "POST")
    return "forum:report";
  if (pathname === "/api/tts" && method === "POST")
    return "tts:synthesize";
  if (pathname === "/api/admin/login" && method === "POST")
    return "admin:login";
  if (pathname === "/api/admin/verify" && method === "GET")
    return "admin:verify";
  if (pathname === "/api/admin/ban-user" && method === "POST")
    return "admin:ban";
  if (pathname.match(/^\/api\/admin\/ban-user\/\d+$/) && method === "DELETE")
    return "admin:unban";
  if (pathname === "/api/admin/logs" && method === "GET")
    return "admin:logs";
  if (pathname === "/api/admin/banned-users" && method === "GET")
    return "admin:banned";
  if (pathname === "/api/admin/forum-stats" && method === "GET")
    return "admin:forum-stats";
  if (pathname === "/api/admin/sos-logs" && method === "GET")
    return "admin:sos-logs";
  if (pathname === "/api/admin/users" && method === "GET")
    return "admin:users";
  return null;
}
__name(matchRoute, "matchRoute");
function extractId(pathname) {
  const parts = pathname.split("/");
  return parts[parts.length - 1];
}
__name(extractId, "extractId");
var router_default = {
  async fetch(request, env, ctx) {
    const origin = getAllowedOrigin2(request, env);
    if (request.method === "OPTIONS") {
      return handleOptions2(request, env);
    }
    const url = new URL(request.url);
    const route = matchRoute(url.pathname, request.method);
    const wrapResponse = /* @__PURE__ */ __name((response) => {
      const newHeaders = new Headers(response.headers);
      Object.entries(corsHeaders2(origin)).forEach(([k, v]) => newHeaders.set(k, v));
      return new Response(response.body, {
        status: response.status,
        headers: newHeaders
      });
    }, "wrapResponse");
    try {
      let response;
      switch (route) {
        case "auth:register":
          response = await handleRegister(request, env);
          break;
        case "auth:login":
          response = await handleLogin(request, env);
          break;
        case "auth:check":
          response = await handleCheckUsername(request, env);
          break;
        case "auth:me":
          response = await handleGetMe(request, env);
          break;
        case "auth:delete":
          response = await handleDeleteAccount(request, env);
          break;
        case "data:gratitude:list":
          response = await getGratitude(request, env);
          break;
        case "data:gratitude:add":
          response = await addGratitude(request, env);
          break;
        case "data:gratitude:delete":
          response = await deleteGratitude(request, env, extractId(url.pathname));
          break;
        case "data:journal:list":
          response = await getJournal(request, env);
          break;
        case "data:journal:add":
          response = await addJournal(request, env);
          break;
        case "data:journal:delete":
          response = await deleteJournal(request, env, extractId(url.pathname));
          break;
        case "data:focus:list":
          response = await getFocusSessions(request, env);
          break;
        case "data:focus:add":
          response = await addFocusSession(request, env);
          break;
        case "data:breathing:list":
          response = await getBreathingSessions(request, env);
          break;
        case "data:breathing:add":
          response = await addBreathingSession(request, env);
          break;
        case "data:sleep:list":
          response = await getSleepLogs(request, env);
          break;
        case "data:sleep:add":
          response = await addSleepLog(request, env);
          break;
        case "data:sleep:delete":
          response = await deleteSleepLog(request, env, extractId(url.pathname));
          break;
        case "data:sleep:update":
          response = await updateSleepLog(request, env, extractId(url.pathname));
          break;
        case "data:achievements:list":
          response = await getAchievements(request, env);
          break;
        case "data:achievements:add":
          response = await unlockAchievement(request, env);
          break;
        case "data:stats":
          response = await getStats(request, env);
          break;
        case "data:export":
          response = await exportData(request, env);
          break;
        case "data:import":
          response = await importData(request, env);
          break;
        case "data:games:list":
          response = await getGameScores(request, env);
          break;
        case "data:games:add":
          response = await addGameScore(request, env);
          break;
        case "data:notifications:get":
          response = await getNotificationSettings(request, env);
          break;
        case "data:notifications:save":
          response = await saveNotificationSettings(request, env);
          break;
        case "data:sos:log":
          response = await logSOSEvent(request, env);
          break;
        case "data:cards:list":
          response = await getRandomCardsHistory(request, env);
          break;
        case "data:cards:add":
          response = await addRandomCardHistory(request, env);
          break;
        case "data:user-stats:get":
          response = await getUserStats(request, env);
          break;
        case "data:user-stats:xp":
          response = await addUserXP(request, env);
          break;
        case "ai:chat":
          const aiProxy = await Promise.resolve().then(() => (init_ai_proxy(), ai_proxy_exports));
          return aiProxy.default.fetch(request, env, ctx);
        case "forum:posts:list":
          response = await getForumPosts(request, env);
          break;
        case "forum:post:create":
          response = await createForumPost(request, env);
          break;
        case "forum:post:get":
          response = await getForumPost(request, env, extractId(url.pathname));
          break;
        case "forum:post:delete":
          response = await deletePost(request, env, extractId(url.pathname));
          break;
        case "forum:comment:add":
          const commentPath = url.pathname.match(/\/api\/forum\/post\/(\d+)\/comment/);
          response = await addComment(request, env, commentPath ? commentPath[1] : null);
          break;
        case "forum:post:upvote":
          const upvotePath = url.pathname.match(/\/api\/forum\/post\/(\d+)\/upvote/);
          response = await upvotePost(request, env, upvotePath ? upvotePath[1] : null);
          break;
        case "forum:post:lock":
          const lockPath = url.pathname.match(/\/api\/forum\/post\/(\d+)\/lock/);
          response = await toggleLockPost(request, env, lockPath ? lockPath[1] : null);
          break;
        case "forum:comment:delete":
          const commentDelPath = url.pathname.match(/\/api\/forum\/comment\/(\d+)/);
          response = await deleteComment(request, env, commentDelPath ? commentDelPath[1] : null);
          break;
        case "forum:report":
          response = await reportContent(request, env);
          break;
        case "admin:login":
          try {
            const { password } = await request.json();
            const adminPassword = env.ADMIN_PASSWORD || "BanDongHanh2024@Admin";
            if (password !== adminPassword) {
              response = json4({ error: "invalid_password", message: "Sai m\u1EADt kh\u1EA9u admin" }, 401);
              break;
            }
            const jwtSecret = env.JWT_SECRET || "default-secret";
            const expiry = Date.now() + 24 * 60 * 60 * 1e3;
            const payload = { role: "admin", exp: expiry };
            const token = btoa(JSON.stringify(payload)) + "." + btoa(jwtSecret.slice(0, 8) + expiry);
            response = json4({
              success: true,
              token,
              expiresAt: new Date(expiry).toISOString()
            });
          } catch (e) {
            response = json4({ error: "server_error", message: e.message }, 500);
          }
          break;
        case "admin:verify":
          try {
            const authHeader = request.headers.get("Authorization");
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
              response = json4({ error: "no_token", valid: false }, 401);
              break;
            }
            const token = authHeader.split(" ")[1];
            const [payloadB64, sigB64] = token.split(".");
            if (!payloadB64 || !sigB64) {
              response = json4({ error: "invalid_token", valid: false }, 401);
              break;
            }
            const payload = JSON.parse(atob(payloadB64));
            const jwtSecret = env.JWT_SECRET || "default-secret";
            const expectedSig = btoa(jwtSecret.slice(0, 8) + payload.exp);
            if (sigB64 !== expectedSig || payload.exp < Date.now()) {
              response = json4({ error: "expired_or_invalid", valid: false }, 401);
              break;
            }
            response = json4({ valid: true, role: payload.role });
          } catch (e) {
            response = json4({ error: "invalid_token", valid: false }, 401);
          }
          break;
        case "admin:ban":
        case "admin:unban":
        case "admin:logs":
        case "admin:banned":
        case "admin:forum-stats":
        case "admin:sos-logs":
        case "admin:users":
          const adminAuthHeader = request.headers.get("Authorization");
          if (!adminAuthHeader || !adminAuthHeader.startsWith("Bearer ")) {
            response = json4({ error: "not_authenticated", message: "C\u1EA7n \u0111\u0103ng nh\u1EADp admin" }, 401);
            break;
          }
          try {
            const adminToken = adminAuthHeader.split(" ")[1];
            const [payloadB64Admin, sigB64Admin] = adminToken.split(".");
            const payloadAdmin = JSON.parse(atob(payloadB64Admin));
            const jwtSecretAdmin = env.JWT_SECRET || "default-secret";
            const expectedSigAdmin = btoa(jwtSecretAdmin.slice(0, 8) + payloadAdmin.exp);
            if (sigB64Admin !== expectedSigAdmin || payloadAdmin.exp < Date.now()) {
              response = json4({ error: "token_expired", message: "Token h\u1EBFt h\u1EA1n" }, 401);
              break;
            }
          } catch {
            response = json4({ error: "invalid_token", message: "Token kh\xF4ng h\u1EE3p l\u1EC7" }, 401);
            break;
          }
          try {
            switch (route) {
              case "admin:forum-stats":
                try {
                  const [postsCount, commentsCount, bannedCount, hiddenPosts] = await Promise.all([
                    env.ban_dong_hanh_db.prepare("SELECT COUNT(*) as count FROM forum_posts").first().catch(() => ({ count: 0 })),
                    env.ban_dong_hanh_db.prepare("SELECT COUNT(*) as count FROM forum_comments").first().catch(() => ({ count: 0 })),
                    env.ban_dong_hanh_db.prepare("SELECT COUNT(*) as count FROM banned_users").first().catch(() => ({ count: 0 })),
                    env.ban_dong_hanh_db.prepare("SELECT COUNT(*) as count FROM forum_posts WHERE is_hidden = 1").first().catch(() => ({ count: 0 }))
                  ]);
                  response = json4({
                    total_posts: postsCount?.count || 0,
                    total_comments: commentsCount?.count || 0,
                    banned_users: bannedCount?.count || 0,
                    hidden_posts: hiddenPosts?.count || 0
                  });
                } catch {
                  response = json4({ total_posts: 0, total_comments: 0, banned_users: 0, hidden_posts: 0 });
                }
                break;
              case "admin:logs":
                try {
                  const logsLimit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
                  const logsResult = await env.ban_dong_hanh_db.prepare(
                    "SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT ?"
                  ).bind(logsLimit).all().catch(() => ({ results: [] }));
                  response = json4({ items: logsResult?.results || [] });
                } catch {
                  response = json4({ items: [] });
                }
                break;
              case "admin:banned":
                try {
                  const bannedResult = await env.ban_dong_hanh_db.prepare(
                    "SELECT * FROM banned_users ORDER BY created_at DESC"
                  ).all().catch(() => ({ results: [] }));
                  response = json4({ items: bannedResult?.results || [] });
                } catch {
                  response = json4({ items: [] });
                }
                break;
              case "admin:sos-logs":
                try {
                  const sosLogsResult = await env.ban_dong_hanh_db.prepare(
                    "SELECT * FROM sos_logs ORDER BY created_at DESC LIMIT 100"
                  ).all().catch(() => ({ results: [] }));
                  response = json4({ items: sosLogsResult?.results || [] });
                } catch {
                  response = json4({ items: [] });
                }
                break;
              case "admin:ban":
                response = json4({ error: "not_implemented", message: "T\xEDnh n\u0103ng ban user ch\u01B0a s\u1EB5n s\xE0ng (c\u1EA7n database)" }, 501);
                break;
              case "admin:unban":
                response = json4({ error: "not_implemented", message: "T\xEDnh n\u0103ng unban user ch\u01B0a s\u1EB5n s\xE0ng (c\u1EA7n database)" }, 501);
                break;
              case "admin:users":
                response = await getAllUsers(request, env);
                break;
              default:
                response = json4({ error: "unknown_route" }, 404);
            }
          } catch (adminError) {
            console.error("[Admin API] Error:", adminError.message);
            response = json4({ error: "server_error", message: adminError.message }, 500);
          }
          break;
        case "tts:synthesize":
          try {
            const { text, model = "facebook/mms-tts-vie" } = await request.json();
            if (!text || text.trim().length === 0) {
              response = json4({ error: "Text is required" }, 400);
              break;
            }
            const endpoints = [
              `https://router.huggingface.co/hf-inference/models/${model}`,
              `https://api-inference.huggingface.co/models/${model}`
            ];
            let hfResponse = null;
            let lastError = null;
            for (const endpoint of endpoints) {
              console.log("[TTS] Trying endpoint:", endpoint);
              try {
                hfResponse = await fetch(endpoint, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    ...env.HF_API_TOKEN ? { "Authorization": `Bearer ${env.HF_API_TOKEN}` } : {}
                  },
                  body: JSON.stringify({ inputs: text })
                });
                if (hfResponse.ok) {
                  console.log("[TTS] Success with endpoint:", endpoint);
                  break;
                }
                if (hfResponse.status === 503) {
                  const retryData = await hfResponse.json().catch(() => ({}));
                  if (retryData.estimated_time) {
                    console.log("[TTS] Model loading, waiting...");
                    response = json4({
                      error: "model_loading",
                      message: "Model \u0111ang kh\u1EDFi \u0111\u1ED9ng, vui l\xF2ng th\u1EED l\u1EA1i sau " + Math.ceil(retryData.estimated_time) + " gi\xE2y",
                      estimated_time: retryData.estimated_time
                    }, 503);
                    break;
                  }
                }
                lastError = await hfResponse.text();
              } catch (fetchErr) {
                lastError = fetchErr.message;
              }
            }
            if (response)
              break;
            if (!hfResponse || !hfResponse.ok) {
              console.error("[TTS] All endpoints failed:", lastError);
              response = json4({ error: "TTS failed", details: lastError }, 500);
              break;
            }
            const audioBuffer = await hfResponse.arrayBuffer();
            response = new Response(audioBuffer, {
              status: 200,
              headers: {
                "Content-Type": "audio/flac",
                "Cache-Control": "public, max-age=3600"
              }
            });
          } catch (ttsError) {
            console.error("[TTS] Error:", ttsError);
            response = json4({ error: "TTS processing failed", message: ttsError.message }, 500);
          }
          break;
        default:
          response = json4({ error: "not_found", path: url.pathname }, 404);
      }
      return wrapResponse(response);
    } catch (error) {
      console.error("[Router] Error:", error.message);
      return json4({ error: "server_error", message: error.message }, 500, origin);
    }
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-DOY1fv/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = router_default;

// node_modules/wrangler/templates/middleware/common.ts
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-DOY1fv/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=router.js.map
