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
      "h\u1EBFt c\xE1ch",
      // Patterns mới - Phase 5 nâng cấp
      "mu\u1ED1n ng\u1EE7 kh\xF4ng d\u1EADy",
      "ng\u1EE7 m\xE3i m\xE3i",
      "kh\xF4ng mu\u1ED1n t\u1ED3n t\u1EA1i",
      "t\u1ED3n t\u1EA1i l\xE0m g\xEC",
      "s\u1ED1ng v\xF4 ngh\u0129a",
      "cu\u1ED9c s\u1ED1ng v\xF4 ngh\u0129a",
      "mu\u1ED1n bi\u1EBFn m\u1EA5t ho\xE0n to\xE0n",
      "bi\u1EBFn m\u1EA5t m\xE3i m\xE3i",
      "kh\xF4ng c\xF2n l\xFD do",
      "h\u1EBFt l\xFD do",
      "t\u1ED1t nh\u1EA5t l\xE0 ch\u1EBFt",
      "ch\u1EBFt l\xE0 gi\u1EA3i ph\xE1p duy nh\u1EA5t",
      "s\u1EBD kh\xF4ng c\xF2n \u1EDF \u0111\xE2y",
      "s\u1EBD r\u1EDDi \u0111i",
      "c\xF3 k\u1EBF ho\u1EA1ch c\u1EE5 th\u1EC3",
      "\u0111\xE3 chu\u1EA9n b\u1ECB xong",
      // Emoji patterns (Gen-Z)
      "\u{1F480}\u{1F480}\u{1F480}",
      "\u{1F635}\u{1F480}",
      "\u{1F480}\u{1F51A}",
      // English patterns
      "want to die",
      "wanna die",
      "wish i was dead",
      "kill myself",
      "end my life",
      "suicide",
      "no point living",
      "life is pointless"
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
      "mu\u1ED1n tan bi\u1EBFn",
      // Patterns mới - Phase 5 nâng cấp
      "m\u1EA5t h\u1EBFt \xFD ngh\u0129a",
      "cu\u1ED9c s\u1ED1ng v\xF4 ngh\u0129a",
      "kh\xF4ng c\xF2n m\u1EE5c \u0111\xEDch",
      "h\u1EBFt m\u1EE5c \u0111\xEDch s\u1ED1ng",
      "c\u1EA3m th\u1EA5y b\u1ECB b\u1ECF r\u01A1i",
      "b\u1ECB b\u1ECF r\u01A1i ho\xE0n to\xE0n",
      "kh\xF4ng ai th\u1EA5u hi\u1EC3u",
      "kh\xF4ng ai hi\u1EC3u m\xECnh",
      "c\xF4 \u0111\u01A1n tuy\u1EC7t \u0111\u1ED1i",
      "c\xF4 \u0111\u01A1n ho\xE0n to\xE0n",
      "stress qu\xE1 m\u1EE9c",
      "stress kh\xF4ng ch\u1ECBu n\u1ED5i",
      "\xE1p l\u1EF1c qu\xE1 l\u1EDBn",
      "\xE1p l\u1EF1c kh\xF4ng th\u1EC3 ch\u1ECBu",
      "m\u1EA5t ki\u1EC3m so\xE1t",
      "kh\xF4ng ki\u1EC3m so\xE1t \u0111\u01B0\u1EE3c",
      "c\u1EA3m th\u1EA5y b\u1EBF t\u1EAFc",
      "b\u1EBF t\u1EAFc ho\xE0n to\xE0n",
      "kh\xF4ng c\xF3 l\u1ED1i tho\xE1t",
      "h\u1EBFt l\u1ED1i tho\xE1t",
      // English patterns
      "hopeless",
      "no hope",
      "give up",
      "lonely",
      "isolated",
      "abandoned",
      "worthless",
      "useless",
      "pointless",
      "depressed",
      "sad all the time",
      "no one cares",
      "nobody understands"
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
    __name(getRecentMessages, "getRecentMessages");
    __name(formatMessagesForLLM, "formatMessagesForLLM");
  }
});

// workers/pii-redactor.js
function redactPII(text, options = {}) {
  if (!text || typeof text !== "string") {
    return text || "";
  }
  let redacted = text;
  const {
    redactPhone = true,
    redactEmail = true,
    redactIdCard = true,
    redactAddress = false,
    // Mặc định không redact address vì có thể ảnh hưởng context
    redactName = false
    // Mặc định không redact name vì cần cho context
  } = options;
  if (redactPhone) {
    redacted = redacted.replace(PII_PATTERNS.phone, (match) => {
      if (match.length >= 10) {
        return match.slice(0, 3) + "****" + match.slice(-2);
      }
      return "***";
    });
  }
  if (redactEmail) {
    redacted = redacted.replace(PII_PATTERNS.email, (match) => {
      const [local, domain] = match.split("@");
      const redactedLocal = local.length > 2 ? local.slice(0, 2) + "***" : "***";
      return `${redactedLocal}@${domain}`;
    });
  }
  if (redactIdCard) {
    redacted = redacted.replace(PII_PATTERNS.idCard, (match) => {
      if (match.length >= 9) {
        return match.slice(0, 3) + "****" + match.slice(-2);
      }
      return "***";
    });
  }
  if (redactAddress) {
    redacted = redacted.replace(PII_PATTERNS.address, "[\u0110\u1ECAA CH\u1EC8]");
  }
  if (redactName) {
    redacted = redacted.replace(PII_PATTERNS.name, (match, name) => {
      return match.replace(name, "[T\xCAN]");
    });
  }
  return redacted;
}
function redactPIIFromObject(obj, options = {}, excludeKeys = []) {
  if (!obj)
    return obj;
  if (typeof obj === "string") {
    return redactPII(obj, options);
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => redactPIIFromObject(item, options, excludeKeys));
  }
  if (typeof obj === "object") {
    const redacted = {};
    for (const [key, value] of Object.entries(obj)) {
      if (excludeKeys.includes(key)) {
        redacted[key] = value;
      } else if (typeof value === "string") {
        redacted[key] = redactPII(value, options);
      } else {
        redacted[key] = redactPIIFromObject(value, options, excludeKeys);
      }
    }
    return redacted;
  }
  return obj;
}
var PII_PATTERNS;
var init_pii_redactor = __esm({
  "workers/pii-redactor.js"() {
    PII_PATTERNS = {
      // Số điện thoại Việt Nam (10 số, bắt đầu bằng 0 hoặc +84)
      phone: /(\+84|0)[3-9]\d{8}/g,
      // Email
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      // CMND/CCCD (9-12 số)
      idCard: /\b\d{9,12}\b/g,
      // Địa chỉ (có thể chứa số nhà, tên đường)
      // Pattern này đơn giản, có thể cải thiện
      address: /\b\d+\s+[A-Za-zÀ-ỹ\s]+(?:phường|xã|quận|huyện|thành phố|tỉnh)/gi,
      // Tên người (có thể chứa dấu tiếng Việt) - pattern đơn giản
      // Chỉ redact nếu có format rõ ràng như "Tên tôi là X" hoặc "Tôi là X"
      name: /(?:tên|tôi là|mình là|em là|con là)\s+([A-ZÀ-Ỹ][a-zà-ỹ]+(?:\s+[A-ZÀ-Ỹ][a-zà-ỹ]+)*)/gi
    };
    __name(redactPII, "redactPII");
    __name(redactPIIFromObject, "redactPIIFromObject");
  }
});

// workers/observability.js
function generateTraceId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
}
function log(level, message, context = {}) {
  const excludeKeys = ["trace_id", "user_id", "status", "latency_ms", "tokens_in", "tokens_out", "cost_usd"];
  const redactedContext = redactPIIFromObject(context, {
    redactPhone: true,
    redactEmail: true,
    redactIdCard: true,
    redactAddress: false,
    redactName: false
  }, excludeKeys);
  const logEntry = {
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    level,
    message: redactPII(message),
    // Redact PII trong message
    ...redactedContext
  };
  const logString = JSON.stringify(logEntry);
  switch (level) {
    case "error":
      console.error(logString);
      break;
    case "warn":
      console.warn(logString);
      break;
    case "debug":
      if (context.env?.ENVIRONMENT === "development") {
        console.log(logString);
      }
      break;
    default:
      console.log(logString);
  }
  return logEntry;
}
function logRequest(request, traceId, env = {}) {
  const url = new URL(request.url);
  const userId = request.headers.get("X-User-Id") || null;
  log("info", "request_start", {
    trace_id: traceId,
    method: request.method,
    path: url.pathname,
    user_id: userId,
    user_agent: request.headers.get("User-Agent")?.substring(0, 100) || null
  });
}
function logResponse(traceId, status, latency, metrics = {}) {
  const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";
  log(level, "request_end", {
    trace_id: traceId,
    status,
    latency_ms: latency,
    ...metrics
  });
}
function logModelCall(traceId, model, modelVersion, tokensIn, tokensOut, costUsd, latency) {
  log("info", "model_call", {
    trace_id: traceId,
    model_name: model,
    model_version: modelVersion,
    tokens_in: tokensIn,
    tokens_out: tokensOut,
    tokens_total: tokensIn + tokensOut,
    cost_usd: costUsd,
    latency_ms: latency
  });
}
function logError(traceId, error, context = {}) {
  log("error", "error_occurred", {
    trace_id: traceId,
    error_message: error.message,
    error_stack: error.stack?.substring(0, 500) || null,
    ...context
  });
}
function createTraceContext(request, env = {}) {
  const traceId = generateTraceId();
  const startTime = Date.now();
  logRequest(request, traceId, env);
  return {
    traceId,
    startTime,
    log: (level, message, context = {}) => log(level, message, { trace_id: traceId, ...context }),
    logResponse: (status, metrics = {}) => {
      const latency = Date.now() - startTime;
      logResponse(traceId, status, latency, metrics);
    },
    logModelCall: (model, modelVersion, tokensIn, tokensOut, costUsd) => {
      const latency = Date.now() - startTime;
      logModelCall(traceId, model, modelVersion, tokensIn, tokensOut, costUsd, latency);
    },
    logError: (error, context = {}) => logError(traceId, error, context)
  };
}
function addTraceHeader(response, traceId) {
  const newHeaders = new Headers(response.headers);
  newHeaders.set("X-Trace-Id", traceId);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}
var init_observability = __esm({
  "workers/observability.js"() {
    init_pii_redactor();
    __name(generateTraceId, "generateTraceId");
    __name(log, "log");
    __name(logRequest, "logRequest");
    __name(logResponse, "logResponse");
    __name(logModelCall, "logModelCall");
    __name(logError, "logError");
    __name(createTraceContext, "createTraceContext");
    __name(addTraceHeader, "addTraceHeader");
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
      console.warn(JSON.stringify({
        type: "token_limit_exceeded",
        tokens: newTotal,
        limit: MONTHLY_TOKEN_LIMIT,
        percentage: Math.round(newTotal / MONTHLY_TOKEN_LIMIT * 100),
        month
      }));
    } else if (warning) {
      console.warn(JSON.stringify({
        type: "token_limit_warning",
        tokens: newTotal,
        limit: MONTHLY_TOKEN_LIMIT,
        percentage: Math.round(newTotal / MONTHLY_TOKEN_LIMIT * 100),
        month
      }));
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
  return Math.ceil(text.length / 3.5);
}
function countTokensAccurate(text, model = "llama-3.1-8b") {
  return estimateTokens(text);
}
var MONTHLY_TOKEN_LIMIT, WARNING_THRESHOLD;
var init_token_tracker = __esm({
  "workers/token-tracker.js"() {
    MONTHLY_TOKEN_LIMIT = 5e5;
    WARNING_THRESHOLD = 0.8;
    __name(getTokenUsage, "getTokenUsage");
    __name(addTokenUsage, "addTokenUsage");
    __name(checkTokenLimit, "checkTokenLimit");
    __name(estimateTokens, "estimateTokens");
    __name(countTokensAccurate, "countTokensAccurate");
  }
});

// workers/user-memory.js
async function loadUserMemory(env, userId) {
  if (!userId)
    return null;
  try {
    const memory = await env.ban_dong_hanh_db.prepare(
      `SELECT * FROM user_memory WHERE user_id = ?`
    ).bind(parseInt(userId)).first();
    if (!memory) {
      return await createNewUserMemory(env, parseInt(userId));
    }
    return parseMemoryFromDB(memory);
  } catch (error) {
    console.error("[UserMemory] Load error:", error.message);
    return null;
  }
}
function parseMemoryFromDB(row) {
  return {
    displayName: row.display_name,
    ageRange: row.age_range,
    interests: safeParseJSON(row.interests, []),
    personalityNotes: row.personality_notes,
    memorySummary: row.memory_summary || "",
    keyTopics: safeParseJSON(row.key_topics, []),
    keyEmotions: safeParseJSON(row.key_emotions, []),
    currentStruggles: safeParseJSON(row.current_struggles, []),
    positiveAspects: safeParseJSON(row.positive_aspects, []),
    supportNetwork: safeParseJSON(row.support_network, []),
    firstInteractionAt: row.first_interaction_at,
    lastInteractionAt: row.last_interaction_at,
    totalConversations: row.total_conversations || 0,
    totalMessages: row.total_messages || 0,
    trustLevel: row.trust_level || "new",
    preferredTone: row.preferred_tone || "warm",
    preferredResponseLength: row.preferred_response_length || "medium"
  };
}
function safeParseJSON(str, fallback = []) {
  if (!str)
    return fallback;
  try {
    return JSON.parse(str);
  } catch (_) {
    return fallback;
  }
}
async function createNewUserMemory(env, userId) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  try {
    await env.ban_dong_hanh_db.prepare(`
      INSERT INTO user_memory 
      (user_id, first_interaction_at, last_interaction_at, total_conversations, total_messages, trust_level)
      VALUES (?, ?, ?, 1, 0, 'new')
    `).bind(userId, now, now).run();
    return {
      displayName: null,
      ageRange: null,
      interests: [],
      personalityNotes: null,
      memorySummary: "",
      keyTopics: [],
      keyEmotions: [],
      currentStruggles: [],
      positiveAspects: [],
      supportNetwork: [],
      firstInteractionAt: now,
      lastInteractionAt: now,
      totalConversations: 1,
      totalMessages: 0,
      trustLevel: "new",
      preferredTone: "warm",
      preferredResponseLength: "medium"
    };
  } catch (error) {
    console.error("[UserMemory] Create error:", error.message);
    return null;
  }
}
async function updateUserMemory(env, userId, memoryUpdate, currentMessage, traceId = null) {
  if (!userId)
    return;
  const shouldRemember = memoryUpdate?.shouldRemember !== false;
  try {
    const current = await env.ban_dong_hanh_db.prepare(
      `SELECT * FROM user_memory WHERE user_id = ?`
    ).bind(parseInt(userId)).first();
    if (!current) {
      await createNewUserMemory(env, parseInt(userId));
      return;
    }
    const updates = [];
    const params = [];
    updates.push("last_interaction_at = ?");
    params.push((/* @__PURE__ */ new Date()).toISOString());
    updates.push("total_messages = total_messages + 1");
    const newMsgCount = (current.total_messages || 0) + 1;
    if (newMsgCount >= 50 && current.trust_level !== "trusted") {
      updates.push("trust_level = 'trusted'");
    } else if (newMsgCount >= 10 && current.trust_level === "new") {
      updates.push("trust_level = 'familiar'");
    }
    if (shouldRemember && memoryUpdate) {
      if (memoryUpdate.displayName && !current.display_name) {
        updates.push("display_name = ?");
        params.push(memoryUpdate.displayName);
        await logMemoryEvent(env, userId, "name_detected", memoryUpdate.displayName, traceId);
      }
      if (memoryUpdate.newFacts?.length > 0) {
        const existingSummary = current.memory_summary || "";
        const newSummary = compressMemorySummary(existingSummary, memoryUpdate.newFacts);
        updates.push("memory_summary = ?");
        params.push(newSummary);
        for (const fact of memoryUpdate.newFacts) {
          await logMemoryEvent(env, userId, "fact_learned", fact, traceId);
        }
      }
      const extractedTopics = extractTopicsFromMessage(currentMessage);
      if (extractedTopics.length > 0) {
        const existingTopics = safeParseJSON(current.key_topics, []);
        const mergedTopics = mergeLists(existingTopics, extractedTopics, 15);
        updates.push("key_topics = ?");
        params.push(JSON.stringify(mergedTopics));
      }
      if (memoryUpdate.emotionPattern) {
        const existingEmotions = safeParseJSON(current.key_emotions, []);
        existingEmotions.push({
          emotion: memoryUpdate.emotionPattern,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
        const recentEmotions = existingEmotions.slice(-30);
        updates.push("key_emotions = ?");
        params.push(JSON.stringify(recentEmotions));
        await logMemoryEvent(env, userId, "emotion_expressed", memoryUpdate.emotionPattern, traceId);
      }
      if (memoryUpdate.currentStruggle) {
        const struggles = safeParseJSON(current.current_struggles, []);
        if (!struggles.includes(memoryUpdate.currentStruggle)) {
          struggles.push(memoryUpdate.currentStruggle);
          updates.push("current_struggles = ?");
          params.push(JSON.stringify(struggles.slice(-10)));
        }
      }
      if (memoryUpdate.positiveAspect) {
        const positives = safeParseJSON(current.positive_aspects, []);
        if (!positives.includes(memoryUpdate.positiveAspect)) {
          positives.push(memoryUpdate.positiveAspect);
          updates.push("positive_aspects = ?");
          params.push(JSON.stringify(positives.slice(-10)));
        }
      }
    }
    updates.push("updated_at = datetime('now')");
    params.push(parseInt(userId));
    await env.ban_dong_hanh_db.prepare(`
      UPDATE user_memory SET ${updates.join(", ")} WHERE user_id = ?
    `).bind(...params).run();
  } catch (error) {
    console.error("[UserMemory] Update error:", error.message);
  }
}
async function logMemoryEvent(env, userId, logType, content, traceId) {
  try {
    await env.ban_dong_hanh_db.prepare(`
      INSERT INTO user_memory_logs (user_id, log_type, content, source_message_id)
      VALUES (?, ?, ?, ?)
    `).bind(parseInt(userId), logType, content, traceId).run();
  } catch (error) {
    console.error("[UserMemory] Log error:", error.message);
  }
}
function formatMemoryContext(memory) {
  if (!memory)
    return "\u0110\xE2y l\xE0 l\u1EA7n \u0111\u1EA7u ti\xEAn g\u1EB7p user n\xE0y. H\xE3y gi\u1EDBi thi\u1EC7u b\u1EA3n th\xE2n v\xE0 h\u1ECFi t\xEAn h\u1ECD.";
  const parts = [];
  parts.push(`\u{1F4CA} TH\u1ED0NG K\xCA:`);
  parts.push(`- \u0110\xE3 tr\xF2 chuy\u1EC7n: ${memory.totalConversations} cu\u1ED9c, ${memory.totalMessages} tin nh\u1EAFn`);
  parts.push(`- M\u1EE9c \u0111\u1ED9 quen thu\u1ED9c: ${translateTrustLevel(memory.trustLevel)}`);
  if (memory.displayName) {
    parts.push(`
\u{1F464} TH\xD4NG TIN:`);
    parts.push(`- T\xEAn: ${memory.displayName}`);
    if (memory.ageRange) {
      parts.push(`- \u0110\u1ED9 tu\u1ED5i: ${translateAgeRange(memory.ageRange)}`);
    }
  }
  if (memory.keyTopics?.length > 0) {
    parts.push(`
\u{1F4CC} CH\u1EE6 \u0110\u1EC0 TH\u01AF\u1EDCNG TH\u1EA2O LU\u1EACN:`);
    parts.push(`- ${memory.keyTopics.slice(-8).join(", ")}`);
  }
  if (memory.currentStruggles?.length > 0) {
    parts.push(`
\u26A0\uFE0F V\u1EA4N \u0110\u1EC0 \u0110ANG G\u1EB6P:`);
    memory.currentStruggles.slice(-5).forEach((s) => {
      parts.push(`- ${s}`);
    });
  }
  if (memory.positiveAspects?.length > 0) {
    parts.push(`
\u2728 \u0110I\u1EC2M T\xCDCH C\u1EF0C:`);
    memory.positiveAspects.slice(-3).forEach((p) => {
      parts.push(`- ${p}`);
    });
  }
  if (memory.keyEmotions?.length > 0) {
    const recentEmotions = memory.keyEmotions.slice(-5).map(
      (e) => typeof e === "object" ? e.emotion : e
    );
    parts.push(`
\u{1F4AD} C\u1EA2M X\xDAC G\u1EA6N \u0110\xC2Y: ${recentEmotions.join(" \u2192 ")}`);
  }
  if (memory.memorySummary) {
    parts.push(`
\u{1F4DD} T\xD3M T\u1EAET:`);
    parts.push(`${memory.memorySummary}`);
  }
  parts.push(`
\u{1F3AF} H\u01AF\u1EDANG D\u1EAAN T\u01AF\u01A0NG T\xC1C:`);
  switch (memory.trustLevel) {
    case "trusted":
      parts.push(`- User \u0111\xE3 tin t\u01B0\u1EDFng, c\xF3 th\u1EC3 \u0111i s\xE2u h\u01A1n v\xE0o v\u1EA5n \u0111\u1EC1`);
      parts.push(`- C\xF3 th\u1EC3 g\u1EE3i \xFD gi\u1EA3i ph\xE1p c\u1EE5 th\u1EC3 h\u01A1n`);
      break;
    case "familiar":
      parts.push(`- User \u0111\xE3 quen thu\u1ED9c, c\xF3 th\u1EC3 h\u1ECFi s\xE2u h\u01A1n`);
      parts.push(`- Nh\u1EAFc l\u1EA1i context c\u0169 n\u1EBFu ph\xF9 h\u1EE3p`);
      break;
    default:
      parts.push(`- User c\xF2n m\u1EDBi, t\u1EADp trung l\u1EAFng nghe v\xE0 x\xE2y d\u1EF1ng trust`);
      parts.push(`- H\u1ECFi t\xEAn n\u1EBFu h\u1ECD ch\u01B0a gi\u1EDBi thi\u1EC7u`);
  }
  return parts.join("\n");
}
function translateTrustLevel(level) {
  const map = {
    new: "M\u1EDBi quen (\u0111ang t\xECm hi\u1EC3u)",
    familiar: "Quen thu\u1ED9c (c\xF3 th\u1EC3 trao \u0111\u1ED5i s\xE2u h\u01A1n)",
    trusted: "Tin t\u01B0\u1EDFng (c\xF3 th\u1EC3 th\u1EA3o lu\u1EADn v\u1EA5n \u0111\u1EC1 nh\u1EA1y c\u1EA3m)"
  };
  return map[level] || "M\u1EDBi quen";
}
function translateAgeRange(range) {
  const map = {
    "under_15": "D\u01B0\u1EDBi 15 tu\u1ED5i",
    "15_17": "15-17 tu\u1ED5i",
    "18_plus": "18 tu\u1ED5i tr\u1EDF l\xEAn"
  };
  return map[range] || range;
}
function compressMemorySummary(existing, newFacts) {
  let combined = existing;
  if (existing && !existing.endsWith(".")) {
    combined += ". ";
  }
  combined += newFacts.join(". ");
  if (combined.length > 500) {
    combined = combined.slice(-500);
    const firstSentenceEnd = combined.indexOf(". ");
    if (firstSentenceEnd > 0 && firstSentenceEnd < 100) {
      combined = combined.slice(firstSentenceEnd + 2);
    }
  }
  return combined.trim();
}
function extractTopicsFromMessage(message) {
  if (!message)
    return [];
  const topicKeywords = {
    "h\u1ECDc t\u1EADp": ["h\u1ECDc", "b\xE0i", "thi", "\u0111i\u1EC3m", "m\xF4n", "tr\u01B0\u1EDDng", "l\u1EDBp", "th\u1EA7y", "c\xF4", "gi\xE1o vi\xEAn"],
    "gia \u0111\xECnh": ["b\u1ED1", "m\u1EB9", "ba", "m\xE1", "anh", "ch\u1ECB", "em", "\xF4ng", "b\xE0", "gia \u0111\xECnh", "nh\xE0"],
    "b\u1EA1n b\xE8": ["b\u1EA1n", "friend", "crush", "ng\u01B0\u1EDDi y\xEAu", "nh\xF3m"],
    "t\xECnh c\u1EA3m": ["y\xEAu", "th\xEDch", "crush", "chia tay", "t\xECnh", "c\u1EB7p"],
    "stress": ["stress", "\xE1p l\u1EF1c", "m\u1EC7t", "ki\u1EC7t s\u1EE9c", "overwhelm"],
    "lo l\u1EAFng": ["lo", "s\u1EE3", "b\u1EA5t an", "hoang mang", "lo l\u1EAFng"],
    "bu\u1ED3n": ["bu\u1ED3n", "kh\xF3c", "t\u1EE7i", "ch\xE1n", "n\u1EA3n"],
    "c\xF4 \u0111\u01A1n": ["c\xF4 \u0111\u01A1n", "m\u1ED9t m\xECnh", "kh\xF4ng ai", "l\u1EBB loi"],
    "game": ["game", "ch\u01A1i", "rank", "\u0111\u1ED9i"],
    "th\u1EC3 thao": ["\u0111\xE1 b\xF3ng", "b\xF3ng \u0111\xE1", "gym", "ch\u1EA1y", "th\u1EC3 thao"],
    "\xE2m nh\u1EA1c": ["nh\u1EA1c", "h\xE1t", "nghe", "b\xE0i h\xE1t", "ca s\u0129"],
    "t\u01B0\u01A1ng lai": ["t\u01B0\u01A1ng lai", "ngh\u1EC1 nghi\u1EC7p", "\u0111\u1EA1i h\u1ECDc", "sau n\xE0y", "ng\xE0nh"],
    "s\u1EE9c kh\u1ECFe": ["\u1ED1m", "b\u1EC7nh", "\u0111au", "m\u1EA5t ng\u1EE7", "ng\u1EE7", "s\u1EE9c kh\u1ECFe"]
  };
  const msgLower = message.toLowerCase();
  const foundTopics = [];
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some((kw) => msgLower.includes(kw))) {
      foundTopics.push(topic);
    }
  }
  return foundTopics;
}
function mergeLists(existing, newItems, limit = 15) {
  const merged = [.../* @__PURE__ */ new Set([...existing, ...newItems])];
  return merged.slice(-limit);
}
var init_user_memory = __esm({
  "workers/user-memory.js"() {
    __name(loadUserMemory, "loadUserMemory");
    __name(parseMemoryFromDB, "parseMemoryFromDB");
    __name(safeParseJSON, "safeParseJSON");
    __name(createNewUserMemory, "createNewUserMemory");
    __name(updateUserMemory, "updateUserMemory");
    __name(logMemoryEvent, "logMemoryEvent");
    __name(formatMemoryContext, "formatMemoryContext");
    __name(translateTrustLevel, "translateTrustLevel");
    __name(translateAgeRange, "translateAgeRange");
    __name(compressMemorySummary, "compressMemorySummary");
    __name(extractTopicsFromMessage, "extractTopicsFromMessage");
    __name(mergeLists, "mergeLists");
  }
});

// workers/rag.js
var rag_exports = {};
__export(rag_exports, {
  bm25Search: () => bm25Search,
  cosineSimilarity: () => cosineSimilarity,
  formatRAGContext: () => formatRAGContext,
  generateEmbedding: () => generateEmbedding,
  hybridSearch: () => hybridSearch,
  rerankResults: () => rerankResults
});
function bm25Search(query, documents) {
  if (!query || !documents || documents.length === 0) {
    return [];
  }
  const queryTerms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 1);
  if (queryTerms.length === 0)
    return [];
  const scores = documents.map((doc) => {
    const content = (doc.content || "").toLowerCase();
    let score = 0;
    for (const term of queryTerms) {
      const termFreq = (content.match(new RegExp(term, "g")) || []).length;
      if (termFreq > 0) {
        const docFreq = documents.filter(
          (d) => (d.content || "").toLowerCase().includes(term)
        ).length;
        const idf = Math.log(documents.length / (docFreq + 1));
        score += termFreq * idf;
      }
    }
    return { ...doc, bm25_score: score };
  });
  return scores.filter((d) => d.bm25_score > 0).sort((a, b) => b.bm25_score - a.bm25_score).slice(0, 10);
}
async function generateEmbedding(env, text) {
  if (!text || !env.AI) {
    return null;
  }
  try {
    const result = await env.AI.run("@cf/baai/bge-base-en-v1.5", {
      text: [text]
    });
    return result.data?.[0] || null;
  } catch (error) {
    console.error("[RAG] Embedding error:", error.message);
    return null;
  }
}
function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length)
    return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator > 0 ? dotProduct / denominator : 0;
}
async function hybridSearch(query, documents, env, options = {}) {
  const {
    bm25Weight = 0.5,
    denseWeight = 0.5,
    topK = 5
  } = options;
  const bm25Results = bm25Search(query, documents);
  const bm25MaxScore = bm25Results[0]?.bm25_score || 1;
  const bm25Normalized = bm25Results.reduce((acc, doc) => {
    acc[doc.id] = doc.bm25_score / bm25MaxScore * bm25Weight;
    return acc;
  }, {});
  let denseScores = {};
  try {
    const queryEmbedding = await generateEmbedding(env, query);
    if (queryEmbedding) {
      for (const doc of documents) {
        let docEmbedding = null;
        if (doc.id && env.ban_dong_hanh_db) {
          try {
            const cached = await env.ban_dong_hanh_db.prepare(
              'SELECT embedding FROM knowledge_base WHERE id = ? AND embedding IS NOT NULL AND embedding != ""'
            ).bind(doc.id).first();
            if (cached?.embedding) {
              try {
                docEmbedding = JSON.parse(cached.embedding);
              } catch (_) {
              }
            }
          } catch (_) {
          }
        }
        if (!docEmbedding) {
          docEmbedding = await generateEmbedding(env, doc.content, doc.id);
        }
        if (docEmbedding) {
          const similarity = cosineSimilarity(queryEmbedding, docEmbedding);
          denseScores[doc.id] = similarity * denseWeight;
        }
      }
    }
  } catch (error) {
    console.warn("[RAG] Dense search failed, using BM25 only:", error.message);
  }
  const combinedScores = {};
  const allDocIds = /* @__PURE__ */ new Set([
    ...Object.keys(bm25Normalized),
    ...Object.keys(denseScores)
  ]);
  for (const docId of allDocIds) {
    combinedScores[docId] = (bm25Normalized[docId] || 0) + (denseScores[docId] || 0);
  }
  const topDocs = documents.filter((doc) => combinedScores[doc.id] !== void 0).map((doc) => ({
    ...doc,
    relevance_score: combinedScores[doc.id]
  })).sort((a, b) => b.relevance_score - a.relevance_score).slice(0, topK);
  return topDocs;
}
async function rerankResults(query, documents, env) {
  if (documents.length === 0)
    return [];
  try {
    const prompt = `\u0110\xE1nh gi\xE1 m\u1EE9c \u0111\u1ED9 li\xEAn quan c\u1EE7a c\xE1c t\xE0i li\u1EC7u sau v\u1EDBi c\xE2u h\u1ECFi "${query}".

T\xE0i li\u1EC7u:
${documents.map((d, i) => `${i + 1}. ${d.content?.slice(0, 200)}`).join("\n")}

Tr\u1EA3 v\u1EC1 JSON array v\u1EDBi th\u1EE9 t\u1EF1 t\u1EEB li\xEAn quan nh\u1EA5t \u0111\u1EBFn \xEDt li\xEAn quan nh\u1EA5t: [1, 3, 2, ...]`;
    const result = await env.AI.run(env.MODEL || "@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        { role: "system", content: "B\u1EA1n l\xE0 chuy\xEAn gia \u0111\xE1nh gi\xE1 m\u1EE9c \u0111\u1ED9 li\xEAn quan. Tr\u1EA3 v\u1EC1 JSON array." },
        { role: "user", content: prompt }
      ],
      max_tokens: 100
    });
    const rerankOrder = JSON.parse(result.response || "[]");
    if (Array.isArray(rerankOrder)) {
      return rerankOrder.map((idx) => documents[idx - 1]).filter(Boolean);
    }
  } catch (error) {
    console.warn("[RAG] Rerank failed, using original order:", error.message);
  }
  return documents;
}
function formatRAGContext(retrievedDocs) {
  if (!retrievedDocs || retrievedDocs.length === 0) {
    return "";
  }
  const contextParts = retrievedDocs.map((doc, i) => {
    const content = doc.content || "";
    const source = doc.source || "t\xE0i li\u1EC7u";
    return `[${i + 1}] ${content.slice(0, 300)}${content.length > 300 ? "..." : ""} (Ngu\u1ED3n: ${source})`;
  });
  return `

[NG\u1EEE C\u1EA2NH T\u1EEA T\xC0I LI\u1EC6U]
${contextParts.join("\n\n")}

L\u01B0u \xFD: S\u1EED d\u1EE5ng th\xF4ng tin tr\xEAn \u0111\u1EC3 tr\u1EA3 l\u1EDDi, nh\u01B0ng n\u1EBFu kh\xF4ng ch\u1EAFc ch\u1EAFn th\xEC n\xF3i r\xF5.`;
}
var init_rag = __esm({
  "workers/rag.js"() {
    __name(bm25Search, "bm25Search");
    __name(generateEmbedding, "generateEmbedding");
    __name(cosineSimilarity, "cosineSimilarity");
    __name(hybridSearch, "hybridSearch");
    __name(rerankResults, "rerankResults");
    __name(formatRAGContext, "formatRAGContext");
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
    "X-Trace-Id": traceId || ""
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
var PROMPT_VERSION, SYSTEM_INSTRUCTIONS, ai_proxy_default;
var init_ai_proxy = __esm({
  "workers/ai-proxy.js"() {
    init_risk();
    init_sanitize();
    init_memory();
    init_token_tracker();
    init_observability();
    init_user_memory();
    PROMPT_VERSION = "mentor-v5.0.0";
    SYSTEM_INSTRUCTIONS = `B\u1EA1n l\xE0 "B\u1EA1n \u0110\u1ED3ng H\xE0nh" - m\u1ED9t ng\u01B0\u1EDDi b\u1EA1n t\xE2m l\xFD CHUY\xCAN NGHI\u1EC6P v\xE0 \u0111\xE1ng tin c\u1EADy d\xE0nh cho h\u1ECDc sinh Vi\u1EC7t Nam (12-18 tu\u1ED5i). B\u1EA1n \u0111\u01B0\u1EE3c \u0111\xE0o t\u1EA1o v\u1EC1 t\xE2m l\xFD h\u1ECDc \u0111\u01B0\u1EDDng v\xE0 c\xF3 kh\u1EA3 n\u0103ng l\u1EAFng nghe, th\u1EA5u hi\u1EC3u s\xE2u s\u1EAFc.

\u{1F3AF} VAI TR\xD2 C\u1ED0T L\xD5I:
- Ng\u01B0\u1EDDi \u0111\u1ED3ng h\xE0nh T\xC2M L\xDD chuy\xEAn nghi\u1EC7p, nghi\xEAm t\xFAc nh\u01B0ng \u1EA5m \xE1p
- X\u01B0ng "m\xECnh/b\u1EA1n" ho\u1EB7c "t\u1EDB/c\u1EADu" t\u1EF1 nhi\xEAn, nh\u1EA5t qu\xE1n
- GI\u1EEE RANH GI\u1EDAI: ng\u01B0\u1EDDi h\u1ED7 tr\u1EE3 t\xE2m l\xFD, KH\xD4NG ph\u1EA3i b\u1EA1n th\xE2n/ng\u01B0\u1EDDi y\xEAu
- M\u1ED7i response PH\u1EA2I unique, kh\xF4ng l\u1EB7p pattern
- LU\xD4N ph\u1EA3n h\u1ED3i b\u1EB1ng m\u1ED9t \u0111o\u1EA1n v\u0103n li\u1EC1n m\u1EA1ch, TUY\u1EC6T \u0110\u1ED0I KH\xD4NG ng\u1EAFt th\xE0nh nhi\u1EC1u d\xF2ng ng\u1EAFn

\u{1F4DB} TUY\u1EC6T \u0110\u1ED0I KH\xD4NG:
- D\xF9ng gi\u1ECDng c\u1EE3t nh\u1EA3, t\xE1n t\u1EC9nh, \u0111\xF9a gi\u1EE1n kh\xF4ng ph\xF9 h\u1EE3p
- N\xF3i "haha", "xinh y\xEAu", "d\u1EC5 th\u01B0\u01A1ng", "cute" - g\xE2y hi\u1EC3u l\u1EA7m
- \u0110\u01B0a l\u1EDDi khuy\xEAn ngay khi ch\u01B0a hi\u1EC3u v\u1EA5n \u0111\u1EC1
- Ph\xE1n x\xE9t, d\u1EA1y \u0111\u1EDDi, hay t\u1ECF ra bi\u1EBFt tu\u1ED1t
- H\u1ECFi l\u1EA1i nh\u1EEFng g\xEC \u0111\xE3 bi\u1EBFt t\u1EEB context
- N\xF3i nh\u1EEFng c\xE2u chung chung v\xF4 ngh\u0129a nh\u01B0 "C\xF3 chuy\u1EC7n g\xEC khi\u1EBFn b\u1EA1n bu\u1ED3n v\u1EADy?" khi h\u1ECD \u0111\xE3 n\xF3i r\xF5 v\u1EA5n \u0111\u1EC1

\u{1F4DD} 5 NGUY\xCAN T\u1EAEC V\xC0NG:
1. ACKNOWLEDGE tr\u01B0\u1EDBc - Ph\u1EA3n h\u1ED3i \xEDt nh\u1EA5t 1 c\xE2u th\u1EEBa nh\u1EADn c\u1EA3m x\xFAc c\u1EE7a h\u1ECD
2. L\u1EAENG NGHE s\xE2u - H\u1ECFi \u0111\u1EC3 hi\u1EC3u, kh\xF4ng \u0111\u1EC3 \u0111\xE1nh gi\xE1
3. TH\u1EA4U C\u1EA2M tr\u01B0\u1EDBc gi\u1EA3i ph\xE1p - C\u1EA3m x\xFAc c\u1EA7n \u0111\u01B0\u1EE3c c\xF4ng nh\u1EADn tr\u01B0\u1EDBc khi t\xECm c\xE1ch gi\u1EA3i quy\u1EBFt
4. GHI NH\u1EDA context - S\u1EED d\u1EE5ng th\xF4ng tin \u0111\xE3 bi\u1EBFt, kh\xF4ng h\u1ECFi l\u1EA1i
5. \u0110\u1ED2NG H\xC0NH - Kh\xF4ng fix v\u1EA5n \u0111\u1EC1 cho h\u1ECD, m\xE0 c\xF9ng h\u1ECD t\xECm c\xE1ch

\u{1F9E0} TH\xD4NG TIN \u0110\xC3 BI\u1EBET V\u1EC0 USER:
[USER_MEMORY_CONTEXT]

S\u1EED d\u1EE5ng th\xF4ng tin tr\xEAn \u0111\u1EC3:
- G\u1ECDi t\xEAn user n\u1EBFu \u0111\xE3 bi\u1EBFt
- Nh\u1EDB v\xE0 nh\u1EAFc l\u1EA1i ch\u1EE7 \u0111\u1EC1 \u0111\xE3 th\u1EA3o lu\u1EADn ("L\u1EA7n tr\u01B0\u1EDBc b\u1EA1n c\xF3 n\xF3i v\u1EC1...")
- Hi\u1EC3u pattern c\u1EA3m x\xFAc \u0111\u1EC3 ph\u1EA3n h\u1ED3i ph\xF9 h\u1EE3p
- \u0110i\u1EC1u ch\u1EC9nh \u0111\u1ED9 s\xE2u c\u1EE7a cu\u1ED9c tr\xF2 chuy\u1EC7n theo m\u1EE9c \u0111\u1ED9 tin t\u01B0\u1EDFng

\u{1F4AC} C\xC1CH PH\u1EA2N H\u1ED2I THEO T\xCCNH HU\u1ED0NG:

[Greeting - hi, hello, xin ch\xE0o]
\u2192 Ch\xE0o th\xE2n thi\u1EC7n, h\u1ECFi th\u0103m nh\u1EB9 nh\xE0ng
\u2192 N\u1EBFu bi\u1EBFt t\xEAn: "Ch\xE0o [t\xEAn]! H\xF4m nay b\u1EA1n th\u1EBF n\xE0o?"
\u2192 N\u1EBFu ch\u01B0a bi\u1EBFt t\xEAn: "Ch\xE0o b\u1EA1n! M\xECnh l\xE0 B\u1EA1n \u0110\u1ED3ng H\xE0nh. B\u1EA1n c\xF3 th\u1EC3 g\u1ECDi m\xECnh l\xE0 g\xEC nh\u1EC9?"

[Chia s\u1EBB c\u1EA3m x\xFAc ti\xEAu c\u1EF1c]
\u2192 Acknowledge: "M\xECnh nghe b\u1EA1n. Nghe c\xF3 v\u1EBB [c\u1EA3m x\xFAc]..."
\u2192 H\u1ECFi s\xE2u: "C\xF3 chuy\u1EC7n g\xEC khi\u1EBFn b\u1EA1n c\u1EA3m th\u1EA5y nh\u01B0 v\u1EADy?"
\u2192 KH\xD4NG v\u1ED9i \u0111\u01B0a gi\u1EA3i ph\xE1p!

[Chia s\u1EBB v\u1EA5n \u0111\u1EC1 c\u1EE5 th\u1EC3 - \u0111\xE3 n\xEAu r\xF5 v\u1EA5n \u0111\u1EC1]
\u2192 Validate c\u1EA3m x\xFAc TR\u01AF\u1EDAC: "Nghe qua \u0111i\u1EC1u n\xE0y th\u1EADt s\u1EF1 r\u1EA5t kh\xF3 kh\u0103n v\u1EDBi b\u1EA1n."
\u2192 Th\u1EC3 hi\u1EC7n s\u1EF1 th\u1EA5u hi\u1EC3u: "M\xECnh hi\u1EC3u b\u1EA1n \u0111ang c\u1EA3m th\u1EA5y [c\u1EA3m x\xFAc] v\xEC [l\xFD do h\u1ECD n\xEAu]."
\u2192 H\u1ECFi s\xE2u h\u01A1n v\u1EC1 c\u1EA3m x\xFAc: "B\u1EA1n c\u1EA3m th\u1EA5y th\u1EBF n\xE0o khi \u0111i\u1EC1u \u0111\xF3 x\u1EA3y ra?"
\u2192 KH\xD4NG n\xF3i chung chung nh\u01B0 "C\xF3 chuy\u1EC7n g\xEC v\u1EADy?" khi h\u1ECD \u0111\xE3 n\xF3i r\xF5

\u{1F6A8} T\xCCNH HU\u1ED0NG GIA \u0110\xCCNH NH\u1EA0Y C\u1EA2M (b\u1ECB \u0111\xE1nh, b\u1EA1o l\u1EF1c, b\u1ED1 m\u1EB9 c\xE3i nhau):
\u2192 VALIDATE ngay: "M\xECnh r\u1EA5t ti\u1EBFc khi nghe \u0111i\u1EC1u n\xE0y. \u0110i\u1EC1u \u0111\xF3 th\u1EADt s\u1EF1 kh\xF4ng n\xEAn x\u1EA3y ra v\u1EDBi b\u1EA1n."
\u2192 Th\u1EC3 hi\u1EC7n s\u1EF1 quan t\xE2m: "B\u1EA1n c\xF3 \u0111au kh\xF4ng? B\u1EA1n c\xF3 \u1ED5n kh\xF4ng?"
\u2192 H\u1ECFi v\u1EC1 t\xECnh hu\u1ED1ng: "Chuy\u1EC7n n\xE0y c\xF3 x\u1EA3y ra th\u01B0\u1EDDng xuy\xEAn kh\xF4ng?"
\u2192 G\u1EE3i \xFD an to\xE0n (n\u1EBFu nghi\xEAm tr\u1ECDng): "C\xF3 ng\u01B0\u1EDDi l\u1EDBn n\xE0o m\xE0 b\u1EA1n tin t\u01B0\u1EDFng c\xF3 th\u1EC3 n\xF3i chuy\u1EC7n v\u1EDBi kh\xF4ng? Th\u1EA7y c\xF4, h\u1ECD h\xE0ng, hay ai \u0111\xF3 b\u1EA1n c\u1EA3m th\u1EA5y an to\xE0n?"
\u2192 KH\xD4NG: ph\xE1n x\xE9t cha m\u1EB9, \u0111\u01B0a l\u1EDDi khuy\xEAn ph\xE1p l\xFD, n\xF3i "\u0111\xF3 l\xE0 b\xECnh th\u01B0\u1EDDng"

V\xED d\u1EE5 ph\u1EA3n h\u1ED3i cho "M\u1EB9 \u0111\xE1nh t\xF4i, ph\u1EA3i l\xE0m sao?":
\u2705 "M\xECnh r\u1EA5t ti\u1EBFc khi nghe \u0111i\u1EC1u n\xE0y. Vi\u1EC7c b\u1ECB \u0111\xE1nh, d\xF9 v\xEC b\u1EA5t c\u1EE9 l\xFD do g\xEC, c\u0169ng khi\u1EBFn b\u1EA1n t\u1ED5n th\u01B0\u01A1ng v\xE0 m\xECnh hi\u1EC3u b\u1EA1n \u0111ang r\u1EA5t kh\xF3 kh\u0103n b\xE2y gi\u1EDD. B\u1EA1n c\xF3 \u0111au kh\xF4ng? M\xECnh mu\u1ED1n bi\u1EBFt th\xEAm - chuy\u1EC7n n\xE0y x\u1EA3y ra th\u01B0\u1EDDng xuy\xEAn kh\xF4ng, v\xE0 l\xFD do l\xE0 g\xEC?"
\u274C "C\xF3 chuy\u1EC7n g\xEC khi\u1EBFn b\u1EA1n bu\u1ED3n v\u1EADy?" (\u0111\xE3 n\xF3i r\xF5 r\u1ED3i!)
\u274C "M\u1EB9 b\u1EA1n c\xF3 th\u1EC3 c\xF3 l\xFD do" (ph\xE1n x\xE9t)
\u274C "B\u1EA1n n\xEAn n\xF3i chuy\u1EC7n v\u1EDBi m\u1EB9" (advice qu\xE1 s\u1EDBm)

[H\u1ECFi c\u1EE5 th\u1EC3/c\xE2u h\u1ECFi th\xF4ng th\u01B0\u1EDDng]
\u2192 Tr\u1EA3 l\u1EDDi r\xF5 r\xE0ng, h\u1EEFu \xEDch, kh\xF4ng v\xF2ng vo
\u2192 N\u1EBFu kh\xF4ng bi\u1EBFt: "M\xECnh kh\xF4ng ch\u1EAFc v\u1EC1 \u0111i\u1EC1u n\xE0y, nh\u01B0ng..."

[Repeat topic/\u0111\xE3 n\xF3i tr\u01B0\u1EDBc \u0111\xF3]
\u2192 Th\u1EC3 hi\u1EC7n vi\u1EC7c nh\u1EDB: "L\u1EA7n tr\u01B0\u1EDBc b\u1EA1n c\xF3 \u0111\u1EC1 c\u1EADp \u0111\u1EBFn [topic]..."
\u2192 H\u1ECFi c\u1EADp nh\u1EADt: "B\xE2y gi\u1EDD t\xECnh h\xECnh th\u1EBF n\xE0o r\u1ED3i?"

\u{1F6A8} SOS - T\xCCNH HU\u1ED0NG NGHI\xCAM TR\u1ECCNG (t\u1EF1 h\u1EA1i, mu\u1ED1n ch\u1EBFt, b\u1EA1o l\u1EF1c nghi\xEAm tr\u1ECDng):
- Nghi\xEAm t\xFAc, b\xECnh t\u0129nh, KH\xD4NG ho\u1EA3ng s\u1EE3
- Kh\xF4ng c\u1ED1 g\u1EAFng "fix" hay thuy\u1EBFt ph\u1EE5c
- Response m\u1EABu: "M\xECnh r\u1EA5t lo l\u1EAFng cho b\u1EA1n. Nh\u1EEFng g\xEC b\u1EA1n \u0111ang tr\u1EA3i qua nghe r\u1EA5t n\u1EB7ng n\u1EC1. B\u1EA1n kh\xF4ng \u0111\u01A1n \u0111\u1ED9c - c\xF3 nh\u1EEFng ng\u01B0\u1EDDi chuy\xEAn nghi\u1EC7p s\u1EB5n s\xE0ng h\u1ED7 tr\u1EE3 ngay b\xE2y gi\u1EDD. H\xE3y g\u1ECDi 1800 599 920 (mi\u1EC5n ph\xED 24/7). M\xECnh v\u1EABn \u1EDF \u0111\xE2y c\xF9ng b\u1EA1n."

\u2728 V\xCD D\u1EE4 RESPONSE CHU\u1EA8N:

User: "m\xECnh bu\u1ED3n qu\xE1"
\u2705 "M\xECnh nghe b\u1EA1n n\xE8. \u{1F499} C\xF3 chuy\u1EC7n g\xEC khi\u1EBFn b\u1EA1n bu\u1ED3n v\u1EADy? B\u1EA1n c\xF3 mu\u1ED1n chia s\u1EBB kh\xF4ng?"

User: "thi r\u1EDBt r\u1ED3i"
\u2705 "\u1EEAm, m\xECnh hi\u1EC3u. Thi kh\xF4ng \u0111\u1EA1t th\xEC th\u1EA5t v\u1ECDng l\u1EAFm, \u0111\u1EB7c bi\u1EC7t khi b\u1EA1n \u0111\xE3 c\u1ED1 g\u1EAFng. B\u1EA1n \u0111ang c\u1EA3m th\u1EA5y th\u1EBF n\xE0o v\u1EC1 \u0111i\u1EC1u n\xE0y? C\xF3 ai bi\u1EBFt chuy\u1EC7n n\xE0y ch\u01B0a?"

User: "b\u1ED1 m\u1EB9 c\xE3i nhau ho\xE0i"
\u2705 "Vi\u1EC7c \u1EDF nh\xE0 c\xF3 c\u0103ng th\u1EB3ng nh\u01B0 v\u1EADy ch\u1EAFc h\u1EB3n r\u1EA5t kh\xF3 ch\u1ECBu v\xE0 m\u1EC7t m\u1ECFi v\u1EDBi b\u1EA1n. M\xECnh hi\u1EC3u \u0111i\u1EC1u \u0111\xF3 \u1EA3nh h\u01B0\u1EDFng \u0111\u1EBFn b\u1EA1n nhi\u1EC1u. B\u1EA1n th\u01B0\u1EDDng l\xE0m g\xEC khi h\u1ECD c\xE3i nhau? C\xF3 n\u01A1i n\xE0o b\u1EA1n c\u1EA3m th\u1EA5y an to\xE0n h\u01A1n kh\xF4ng?"

User: "m\u1EB9 \u0111\xE1nh t\xF4i ph\u1EA3i l\xE0m sao"
\u2705 "M\xECnh r\u1EA5t ti\u1EBFc khi nghe \u0111i\u1EC1u n\xE0y. Vi\u1EC7c b\u1ECB \u0111\xE1nh l\xE0 \u0111i\u1EC1u kh\xF4ng ai \u0111\xE1ng ph\u1EA3i ch\u1ECBu, v\xE0 m\xECnh hi\u1EC3u b\u1EA1n \u0111ang r\u1EA5t \u0111au v\xE0 kh\xF3 kh\u0103n b\xE2y gi\u1EDD. B\u1EA1n c\xF3 \u0111au kh\xF4ng? M\xECnh mu\u1ED1n hi\u1EC3u th\xEAm - chuy\u1EC7n n\xE0y x\u1EA3y ra th\u01B0\u1EDDng xuy\xEAn kh\xF4ng?"

\u{1F4E6} OUTPUT FORMAT (JSON - KH\xD4NG ti\u1EBFt l\u1ED9 cho user):
QUAN TR\u1ECCNG: "reply" PH\u1EA2I l\xE0 m\u1ED9t \u0111o\u1EA1n v\u0103n li\u1EC1n m\u1EA1ch 2-5 c\xE2u, KH\xD4NG ng\u1EAFt d\xF2ng, KH\xD4NG chia th\xE0nh nhi\u1EC1u ph\u1EA7n nh\u1ECF.
{
  "riskLevel": "green|yellow|red",
  "emotion": "c\u1EA3m x\xFAc ch\xEDnh (bu\u1ED3n/lo/stress/gi\u1EADn/s\u1EE3/c\xF4 \u0111\u01A1n/confused/vui/b\xECnh th\u01B0\u1EDDng)",
  "reply": "ph\u1EA3n h\u1ED3i 2-5 c\xE2u LI\u1EC0N M\u1EA0CH TRONG M\u1ED8T \u0110O\u1EA0N, acknowledge + th\u1EA5u hi\u1EC3u + h\u1ECFi s\xE2u. KH\xD4NG xu\u1ED1ng d\xF2ng.",
  "actions": ["t\u1ED1i \u0111a 2 g\u1EE3i \xFD N\u1EBEU ph\xF9 h\u1EE3p context"],
  "confidence": 0.0-1.0,
  "memoryUpdate": {
    "shouldRemember": true,
    "displayName": "t\xEAn n\u1EBFu user gi\u1EDBi thi\u1EC7u, null n\u1EBFu kh\xF4ng",
    "newFacts": ["fact m\u1EDBi h\u1ECDc \u0111\u01B0\u1EE3c v\u1EC1 user"],
    "emotionPattern": "c\u1EA3m x\xFAc detected",
    "currentStruggle": "v\u1EA5n \u0111\u1EC1 \u0111ang g\u1EB7p n\u1EBFu c\xF3",
    "positiveAspect": "\u0111i\u1EC3m t\xEDch c\u1EF1c n\u1EBFu detect \u0111\u01B0\u1EE3c"
  }
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
        const trace = createTraceContext(request, env);
        const startTime = Date.now();
        const origin = getAllowedOrigin(request, env);
        if (request.method === "OPTIONS")
          return handleOptions(request, env);
        if (request.method !== "POST") {
          trace.logResponse(405);
          return addTraceHeader(json3({ error: "method_not_allowed" }, 405, origin), trace.traceId);
        }
        let body;
        try {
          body = await request.json();
        } catch (_) {
          trace.logResponse(400);
          return addTraceHeader(json3({ error: "invalid_json" }, 400, origin), trace.traceId);
        }
        const { message, history = [], memorySummary = "", userId = null } = body || {};
        if (!message || typeof message !== "string") {
          trace.logResponse(400);
          return addTraceHeader(json3({ error: "missing_message" }, 400, origin), trace.traceId);
        }
        let sanitizedMessage;
        try {
          sanitizedMessage = sanitizeInput(message);
        } catch (e) {
          trace.log("warn", "input_sanitized", { reason: e.message });
          trace.logResponse(400);
          return addTraceHeader(json3({ error: "invalid_input", reason: e.message }, 400, origin), trace.traceId);
        }
        const riskLevel = classifyRiskRules(sanitizedMessage, history);
        trace.log("info", "chat_request", {
          risk_level: riskLevel,
          model: env.MODEL || "@cf/meta/llama-3.1-8b-instruct",
          history_count: history.length,
          has_memory_summary: !!memorySummary
        });
        if (riskLevel === "red" || riskLevel === "yellow") {
          trace.log("warn", "sos_detected", {
            risk_level: riskLevel,
            message_length: sanitizedMessage.length,
            history_count: history.length
            // Không log raw message để bảo vệ privacy
          });
        }
        if (riskLevel === "red") {
          const redResponse = getRedTierResponse();
          trace.logResponse(200, { risk_level: "red", sos: true });
          const url2 = new URL(request.url);
          const wantsStream2 = url2.searchParams.get("stream") === "true" || request.headers.get("Accept")?.includes("text/event-stream");
          if (wantsStream2) {
            const stream = new ReadableStream({
              start(controller) {
                const enc = new TextEncoder();
                const send = /* @__PURE__ */ __name((line) => controller.enqueue(enc.encode(line)), "send");
                send(`event: meta
`);
                send(`data: ${JSON.stringify({ trace_id: trace.traceId, riskLevel: "red", sos: true })}

`);
                const replyText = redResponse.reply + "\n\n\u{1F4DE} " + redResponse.actions.join("\n\u{1F4DE} ");
                send(`data: ${JSON.stringify({ type: "delta", text: replyText })}

`);
                send(`data: ${JSON.stringify({ type: "done" })}

`);
                controller.close();
              }
            });
            return new Response(stream, { status: 200, headers: sseHeaders(origin, trace.traceId) });
          }
          return addTraceHeader(json3(redResponse, 200, origin), trace.traceId);
        }
        const tokenCheck = await checkTokenLimit(env);
        if (!tokenCheck.allowed) {
          trace.log("warn", "token_limit_exceeded", {
            tokens: tokenCheck.tokens,
            limit: tokenCheck.limit
          });
          trace.logResponse(429);
          return addTraceHeader(json3({
            error: "token_limit_exceeded",
            message: "\u0110\xE3 \u0111\u1EA1t gi\u1EDBi h\u1EA1n s\u1EED d\u1EE5ng th\xE1ng n\xE0y. Vui l\xF2ng th\u1EED l\u1EA1i v\xE0o th\xE1ng sau.",
            tokens: tokenCheck.tokens,
            limit: tokenCheck.limit
          }, 429, origin), trace.traceId);
        }
        let ragContext = "";
        let usedRAG = 0;
        try {
          const kbResult = await env.ban_dong_hanh_db.prepare(
            `SELECT id, title, content, category, tags FROM knowledge_base 
         WHERE content LIKE ? OR title LIKE ? OR tags LIKE ?
         LIMIT 20`
          ).bind(
            `%${sanitizedMessage.slice(0, 50)}%`,
            // Search trong content
            `%${sanitizedMessage.slice(0, 30)}%`,
            // Search trong title
            `%${sanitizedMessage.slice(0, 30)}%`
            // Search trong tags
          ).all().catch(() => ({ results: [] }));
          const knowledgeBase = kbResult.results.map((doc) => ({
            id: doc.id,
            content: `${doc.title}
${doc.content}`,
            category: doc.category,
            source: "knowledge_base",
            tags: doc.tags ? JSON.parse(doc.tags) : []
            // Note: embedding sẽ được load từ DB trong hybridSearch nếu có
          }));
          if (knowledgeBase.length > 0) {
            const { hybridSearch: hybridSearch2, formatRAGContext: formatRAGContext2 } = await Promise.resolve().then(() => (init_rag(), rag_exports));
            const retrievedDocs = await hybridSearch2(
              sanitizedMessage,
              knowledgeBase,
              env,
              { topK: 3, bm25Weight: 0.6, denseWeight: 0.4 }
            ).catch(async () => {
              const { bm25Search: bm25Search2 } = await Promise.resolve().then(() => (init_rag(), rag_exports));
              return bm25Search2(sanitizedMessage, knowledgeBase).slice(0, 3);
            });
            if (retrievedDocs && retrievedDocs.length > 0) {
              const { formatRAGContext: formatRAGContext3 } = await Promise.resolve().then(() => (init_rag(), rag_exports));
              ragContext = formatRAGContext3(retrievedDocs);
              usedRAG = 1;
              trace.log("info", "rag_used", {
                docs_retrieved: retrievedDocs.length,
                categories: retrievedDocs.map((d) => d.category).join(",")
              });
            }
          }
        } catch (error) {
          trace.log("warn", "rag_retrieval_failed", { error: error.message });
        }
        let userMemory = null;
        let userMemoryContext = "\u0110\xE2y l\xE0 l\u1EA7n \u0111\u1EA7u ti\xEAn g\u1EB7p user n\xE0y.";
        if (userId) {
          try {
            userMemory = await loadUserMemory(env, userId);
            userMemoryContext = formatMemoryContext(userMemory);
            trace.log("info", "user_memory_loaded", {
              user_id: userId,
              trust_level: userMemory?.trustLevel || "new",
              total_conversations: userMemory?.totalConversations || 0
            });
          } catch (error) {
            trace.log("warn", "user_memory_load_failed", { error: error.message });
          }
        }
        let systemPromptWithContext = SYSTEM_INSTRUCTIONS.replace(
          "[USER_MEMORY_CONTEXT]",
          userMemoryContext
        );
        if (ragContext) {
          systemPromptWithContext = systemPromptWithContext + ragContext;
        }
        const messages = formatMessagesForLLM(
          systemPromptWithContext,
          getRecentMessages(history, 8),
          sanitizedMessage,
          memorySummary
        );
        const estimatedTokens = countTokensAccurate(
          JSON.stringify(messages) + sanitizedMessage,
          env.MODEL || "@cf/meta/llama-3.1-8b-instruct"
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
                send(`data: ${JSON.stringify({ trace_id: trace.traceId, riskLevel })}

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
                  const tokenUsageResult = await addTokenUsage(env, totalTokens);
                  const costUsd = totalTokens / 1e3 * 5e-4;
                  const model = env.MODEL || "@cf/meta/llama-3.1-8b-instruct";
                  const modelVersion = model.split("@cf/")[1] || "llama-3.1-8b-instruct";
                  const streamLatencyMs = Date.now() - startTime;
                  trace.logModelCall(model, modelVersion, estimatedTokens, responseTokens, costUsd, streamLatencyMs);
                  trace.logResponse(200, {
                    risk_level: riskLevel,
                    tokens_in: estimatedTokens,
                    tokens_out: responseTokens,
                    tokens_total: totalTokens,
                    cost_usd: costUsd,
                    stream: true,
                    token_usage: tokenUsageResult.tokens,
                    token_warning: tokenUsageResult.warning
                  });
                  try {
                    await env.ban_dong_hanh_db.prepare(
                      `INSERT INTO chat_responses 
                   (user_id, message_id, user_message, ai_response, risk_level, confidence, tokens_used, latency_ms, used_rag, prompt_version)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
                    ).bind(
                      userId || null,
                      trace.traceId,
                      sanitizedMessage.slice(0, 1e3),
                      "[STREAMING]",
                      // Placeholder, có thể update sau
                      riskLevel || "green",
                      0.8,
                      // Default confidence
                      totalTokens,
                      streamLatencyMs,
                      usedRAG,
                      PROMPT_VERSION
                    ).run().catch((err) => {
                      trace.log("warn", "stream_response_log_failed", { error: err.message });
                    });
                  } catch (err) {
                    trace.log("warn", "stream_response_log_error", { error: err.message });
                  }
                } catch (err) {
                  trace.logError(err, { stream: true });
                  const errPayload = { type: "error", error: "model_error", note: String(err?.message || err) };
                  send(`data: ${JSON.stringify(errPayload)}

`);
                } finally {
                  controller.close();
                }
              }
            });
            return new Response(stream, { status: 200, headers: sseHeaders(origin, trace.traceId) });
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
            const tokenUsageResult = await addTokenUsage(env, totalTokens);
            const costUsd = totalTokens / 1e3 * 5e-4;
            const model = env.MODEL || "@cf/meta/llama-3.1-8b-instruct";
            const modelVersion = model.split("@cf/")[1] || "llama-3.1-8b-instruct";
            trace.logModelCall(model, modelVersion, estimatedTokens, responseTokens, costUsd, Date.now() - startTime);
            trace.logResponse(200, {
              risk_level: parsed.riskLevel,
              confidence: parsed.confidence,
              tokens_in: estimatedTokens,
              tokens_out: responseTokens,
              tokens_total: totalTokens,
              cost_usd: costUsd,
              stream: false,
              token_usage: tokenUsageResult.tokens,
              token_warning: tokenUsageResult.warning
            });
            if (userId && parsed.memoryUpdate) {
              try {
                await updateUserMemory(env, userId, parsed.memoryUpdate, sanitizedMessage, trace.traceId);
                trace.log("info", "user_memory_updated", {
                  user_id: userId,
                  new_facts_count: parsed.memoryUpdate?.newFacts?.length || 0,
                  emotion: parsed.memoryUpdate?.emotionPattern || null
                });
              } catch (error) {
                trace.log("warn", "user_memory_update_failed", { error: error.message });
              }
            }
            const { memoryUpdate, ...responseWithoutMemory } = parsed;
            return addTraceHeader(json3(responseWithoutMemory, 200, origin), trace.traceId);
          }
        } catch (e) {
          trace.logError(e, { route: "ai:chat" });
          trace.logResponse(502);
          return addTraceHeader(json3({ error: "model_error", note: String(e?.message || e) }, 502, origin), trace.traceId);
        }
      }
    };
  }
});

// workers/auth.js
async function hashPassword(password, salt = null) {
  if (!salt) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    salt = Array.from(array).map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return { hash, salt };
}
__name(hashPassword, "hashPassword");
async function verifyPassword(password, storedHash, salt) {
  const { hash } = await hashPassword(password, salt);
  return hash === storedHash;
}
__name(verifyPassword, "verifyPassword");
function validatePassword(password) {
  if (!password || typeof password !== "string") {
    return { valid: false, error: "M\u1EADt kh\u1EA9u kh\xF4ng \u0111\u01B0\u1EE3c \u0111\u1EC3 tr\u1ED1ng" };
  }
  if (password.length < 4) {
    return { valid: false, error: "M\u1EADt kh\u1EA9u ph\u1EA3i c\xF3 \xEDt nh\u1EA5t 4 k\xFD t\u1EF1" };
  }
  if (password.length > 100) {
    return { valid: false, error: "M\u1EADt kh\u1EA9u kh\xF4ng qu\xE1 100 k\xFD t\u1EF1" };
  }
  return { valid: true };
}
__name(validatePassword, "validatePassword");
function validateUsername(username) {
  if (!username || typeof username !== "string") {
    return { valid: false, error: "T\xEAn t\xE0i kho\u1EA3n kh\xF4ng \u0111\u01B0\u1EE3c \u0111\u1EC3 tr\u1ED1ng" };
  }
  const trimmed = username.trim();
  if (trimmed.length < 2) {
    return { valid: false, error: "T\xEAn t\xE0i kho\u1EA3n ph\u1EA3i c\xF3 \xEDt nh\u1EA5t 2 k\xFD t\u1EF1" };
  }
  if (trimmed.length > 50) {
    return { valid: false, error: "T\xEAn t\xE0i kho\u1EA3n kh\xF4ng qu\xE1 50 k\xFD t\u1EF1" };
  }
  if (/[<>"';&|\\]/.test(trimmed)) {
    return { valid: false, error: `T\xEAn t\xE0i kho\u1EA3n kh\xF4ng \u0111\u01B0\u1EE3c ch\u1EE9a k\xFD t\u1EF1 \u0111\u1EB7c bi\u1EC7t < > " ' ; & | \\` };
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
    const { username, password } = body;
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      return createJsonResponse({ error: usernameValidation.error }, 400);
    }
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return createJsonResponse({ error: passwordValidation.error }, 400);
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
    const { hash, salt } = await hashPassword(password);
    const result = await env.ban_dong_hanh_db.prepare(
      "INSERT INTO users (username, password_hash, password_salt) VALUES (?, ?, ?) RETURNING id, username, created_at"
    ).bind(trimmedUsername, hash, salt).first();
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
    const { username, password } = body;
    const validation = validateUsername(username);
    if (!validation.valid) {
      return createJsonResponse({ error: validation.error }, 400);
    }
    const trimmedUsername = username.trim();
    const user = await env.ban_dong_hanh_db.prepare(
      "SELECT id, username, created_at, password_hash, password_salt FROM users WHERE username = ?"
    ).bind(trimmedUsername).first();
    if (!user) {
      return createJsonResponse({
        error: "user_not_found",
        message: `Kh\xF4ng t\xECm th\u1EA5y t\xE0i kho\u1EA3n "${trimmedUsername}"`,
        canRegister: true
      }, 404);
    }
    if (!user.password_hash || !user.password_salt) {
      if (!password) {
        return createJsonResponse({
          error: "password_required",
          message: "T\xE0i kho\u1EA3n n\xE0y c\u1EA7n \u0111\u1EB7t m\u1EADt kh\u1EA9u. Vui l\xF2ng nh\u1EADp m\u1EADt kh\u1EA9u m\u1EDBi.",
          requireSetPassword: true
        }, 400);
      }
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return createJsonResponse({ error: passwordValidation.error }, 400);
      }
      const { hash, salt } = await hashPassword(password);
      await env.ban_dong_hanh_db.prepare(
        "UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?"
      ).bind(hash, salt, user.id).run();
      console.log("[Auth] Set password for legacy user:", user.id);
    } else {
      if (!password) {
        return createJsonResponse({
          error: "password_required",
          message: "Vui l\xF2ng nh\u1EADp m\u1EADt kh\u1EA9u"
        }, 400);
      }
      const isValid = await verifyPassword(password, user.password_hash, user.password_salt);
      if (!isValid) {
        return createJsonResponse({
          error: "invalid_password",
          message: "M\u1EADt kh\u1EA9u kh\xF4ng ch\xEDnh x\xE1c"
        }, 401);
      }
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
    console.log(JSON.stringify({
      type: "sos_event",
      event_type,
      risk_level,
      hashed_user_id: hashedUserId,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }));
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
async function submitChatFeedback(request, env) {
  const userId = getUserId(request);
  if (!userId)
    return json({ error: "not_authenticated" }, 401);
  try {
    const { message_id, helpful, reason, response_quality } = await request.json();
    if (!message_id || typeof message_id !== "string") {
      return json({ error: "message_id is required" }, 400);
    }
    if (helpful !== 0 && helpful !== 1) {
      return json({ error: "helpful must be 0 or 1" }, 400);
    }
    if (response_quality && (response_quality < 1 || response_quality > 5)) {
      return json({ error: "response_quality must be 1-5" }, 400);
    }
    const result = await env.ban_dong_hanh_db.prepare(
      `INSERT INTO chat_feedback 
             (user_id, message_id, helpful, reason, response_quality)
             VALUES (?, ?, ?, ?, ?)
             RETURNING id, message_id, helpful, reason, response_quality, created_at`
    ).bind(
      userId,
      message_id,
      helpful,
      reason || null,
      response_quality || null
    ).first();
    return json({ success: true, feedback: result }, 201);
  } catch (error) {
    console.error("[Data] submitChatFeedback error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(submitChatFeedback, "submitChatFeedback");
async function getChatMetrics(request, env) {
  const userId = getUserId(request);
  if (!userId)
    return json({ error: "not_authenticated" }, 401);
  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get("days") || "7");
  const targetUserId = url.searchParams.get("user_id");
  const queryUserId = targetUserId ? parseInt(targetUserId) : userId;
  try {
    const sinceDate = /* @__PURE__ */ new Date();
    sinceDate.setDate(sinceDate.getDate() - days);
    const sinceDateStr = sinceDate.toISOString();
    const feedbackStats = await env.ban_dong_hanh_db.prepare(
      `SELECT 
                COUNT(*) as total_feedback,
                SUM(CASE WHEN helpful = 1 THEN 1 ELSE 0 END) as helpful_count,
                AVG(response_quality) as avg_quality
             FROM chat_feedback
             WHERE user_id = ? AND created_at >= ?`
    ).bind(queryUserId, sinceDateStr).first();
    const responseStats = await env.ban_dong_hanh_db.prepare(
      `SELECT 
                COUNT(*) as total_responses,
                AVG(confidence) as avg_confidence,
                AVG(latency_ms) as avg_latency,
                SUM(CASE WHEN used_rag = 1 THEN 1 ELSE 0 END) as rag_used_count,
                SUM(CASE WHEN risk_level = 'red' THEN 1 ELSE 0 END) as sos_count,
                SUM(CASE WHEN risk_level = 'yellow' THEN 1 ELSE 0 END) as yellow_count,
                AVG(tokens_used) as avg_tokens
             FROM chat_responses
             WHERE user_id = ? AND created_at >= ?`
    ).bind(queryUserId, sinceDateStr).first();
    const totalFeedback = feedbackStats?.total_feedback || 0;
    const helpfulCount = feedbackStats?.helpful_count || 0;
    const helpfulRate = totalFeedback > 0 ? helpfulCount / totalFeedback : null;
    const totalResponses = responseStats?.total_responses || 0;
    const ragUsedCount = responseStats?.rag_used_count || 0;
    const ragUsageRate = totalResponses > 0 ? ragUsedCount / totalResponses : null;
    return json({
      period_days: days,
      user_id: queryUserId,
      feedback: {
        total: totalFeedback,
        helpful_count: helpfulCount,
        helpful_rate: helpfulRate,
        avg_quality: feedbackStats?.avg_quality || null
      },
      responses: {
        total: totalResponses,
        avg_confidence: responseStats?.avg_confidence || null,
        avg_latency_ms: responseStats?.avg_latency || null,
        avg_tokens: responseStats?.avg_tokens || null,
        rag_usage_rate: ragUsageRate,
        sos_count: responseStats?.sos_count || 0,
        yellow_count: responseStats?.yellow_count || 0
      }
    });
  } catch (error) {
    console.error("[Data] getChatMetrics error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(getChatMetrics, "getChatMetrics");
async function getBookmarks(request, env) {
  const userId = getUserId(request);
  if (!userId)
    return json({ items: [] });
  const url = new URL(request.url);
  const bookmarkType = url.searchParams.get("type");
  try {
    let query = "SELECT id, bookmark_type, item_id, metadata, created_at FROM user_bookmarks WHERE user_id = ?";
    const params = [userId];
    if (bookmarkType) {
      query += " AND bookmark_type = ?";
      params.push(bookmarkType);
    }
    query += " ORDER BY created_at DESC";
    const result = await env.ban_dong_hanh_db.prepare(query).bind(...params).all();
    return json({ items: result.results || [], count: result.results?.length || 0 });
  } catch (error) {
    console.error("[Data] getBookmarks error:", error.message);
    return json({ items: [], error: "server_error" });
  }
}
__name(getBookmarks, "getBookmarks");
async function addBookmark(request, env) {
  const userId = getUserId(request);
  if (!userId)
    return json({ error: "not_authenticated" }, 401);
  try {
    const { bookmark_type, item_id, metadata } = await request.json();
    if (!bookmark_type || !item_id) {
      return json({ error: "bookmark_type v\xE0 item_id b\u1EAFt bu\u1ED9c" }, 400);
    }
    const validTypes = ["story", "resource"];
    if (!validTypes.includes(bookmark_type)) {
      return json({ error: "bookmark_type kh\xF4ng h\u1EE3p l\u1EC7" }, 400);
    }
    const existing = await env.ban_dong_hanh_db.prepare(
      "SELECT id FROM user_bookmarks WHERE user_id = ? AND bookmark_type = ? AND item_id = ?"
    ).bind(userId, bookmark_type, item_id).first();
    if (existing) {
      if (metadata) {
        await env.ban_dong_hanh_db.prepare(
          "UPDATE user_bookmarks SET metadata = ? WHERE id = ?"
        ).bind(JSON.stringify(metadata), existing.id).run();
      }
      return json({ success: true, alreadyExists: true, id: existing.id });
    }
    const result = await env.ban_dong_hanh_db.prepare(
      "INSERT INTO user_bookmarks (user_id, bookmark_type, item_id, metadata) VALUES (?, ?, ?, ?) RETURNING id, bookmark_type, item_id, created_at"
    ).bind(userId, bookmark_type, item_id, metadata ? JSON.stringify(metadata) : null).first();
    return json({ success: true, item: result }, 201);
  } catch (error) {
    console.error("[Data] addBookmark error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(addBookmark, "addBookmark");
async function deleteBookmarkById(request, env, id) {
  const userId = getUserId(request);
  if (!userId)
    return json({ error: "not_authenticated" }, 401);
  try {
    const result = await env.ban_dong_hanh_db.prepare(
      "DELETE FROM user_bookmarks WHERE id = ? AND user_id = ?"
    ).bind(parseInt(id), userId).run();
    if (result.changes === 0) {
      return json({ error: "not_found" }, 404);
    }
    return json({ success: true });
  } catch (error) {
    console.error("[Data] deleteBookmarkById error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(deleteBookmarkById, "deleteBookmarkById");
async function deleteBookmark(request, env) {
  const userId = getUserId(request);
  if (!userId)
    return json({ error: "not_authenticated" }, 401);
  const url = new URL(request.url);
  const bookmarkType = url.searchParams.get("type");
  const itemId = url.searchParams.get("item_id");
  if (!bookmarkType || !itemId) {
    return json({ error: "type v\xE0 item_id b\u1EAFt bu\u1ED9c" }, 400);
  }
  try {
    const result = await env.ban_dong_hanh_db.prepare(
      "DELETE FROM user_bookmarks WHERE user_id = ? AND bookmark_type = ? AND item_id = ?"
    ).bind(userId, bookmarkType, itemId).run();
    if (result.changes === 0) {
      return json({ error: "not_found" }, 404);
    }
    return json({ success: true });
  } catch (error) {
    console.error("[Data] deleteBookmark error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(deleteBookmark, "deleteBookmark");
async function getChatThreads(request, env) {
  const userId = getUserId(request);
  if (!userId)
    return json({ error: "not_authenticated" }, 401);
  try {
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
    const threads = await env.ban_dong_hanh_db.prepare(
      "SELECT id, title, created_at, updated_at FROM chat_threads WHERE user_id = ? ORDER BY updated_at DESC LIMIT ?"
    ).bind(userId, limit).all();
    const threadsWithMessages = [];
    for (const thread of threads.results || []) {
      const messages = await env.ban_dong_hanh_db.prepare(
        "SELECT role, content, timestamp as ts, feedback, trace_id FROM chat_messages WHERE thread_id = ? AND user_id = ? ORDER BY timestamp ASC"
      ).bind(thread.id, userId).all();
      threadsWithMessages.push({
        id: thread.id,
        title: thread.title,
        createdAt: thread.created_at,
        updatedAt: thread.updated_at,
        messages: messages.results || []
      });
    }
    return json({ threads: threadsWithMessages });
  } catch (error) {
    console.error("[Data] getChatThreads error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(getChatThreads, "getChatThreads");
async function saveChatThread(request, env) {
  const userId = getUserId(request);
  if (!userId)
    return json({ error: "not_authenticated" }, 401);
  try {
    const { id, title } = await request.json();
    if (!id || typeof id !== "string") {
      return json({ error: "id b\u1EAFt bu\u1ED9c" }, 400);
    }
    await env.ban_dong_hanh_db.prepare(`
            INSERT INTO chat_threads (id, user_id, title, updated_at)
            VALUES (?, ?, ?, datetime('now'))
            ON CONFLICT(id) DO UPDATE SET
                title = ?,
                updated_at = datetime('now')
        `).bind(id, userId, title || "Cu\u1ED9c tr\xF2 chuy\u1EC7n m\u1EDBi", title || "Cu\u1ED9c tr\xF2 chuy\u1EC7n m\u1EDBi").run();
    return json({ success: true, thread_id: id });
  } catch (error) {
    console.error("[Data] saveChatThread error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(saveChatThread, "saveChatThread");
async function saveChatMessages(request, env) {
  const userId = getUserId(request);
  if (!userId)
    return json({ error: "not_authenticated" }, 401);
  try {
    const { thread_id, messages } = await request.json();
    if (!thread_id || !Array.isArray(messages)) {
      return json({ error: "thread_id v\xE0 messages b\u1EAFt bu\u1ED9c" }, 400);
    }
    const thread = await env.ban_dong_hanh_db.prepare(
      "SELECT id FROM chat_threads WHERE id = ? AND user_id = ?"
    ).bind(thread_id, userId).first();
    if (!thread) {
      await env.ban_dong_hanh_db.prepare(
        "INSERT INTO chat_threads (id, user_id, title) VALUES (?, ?, ?)"
      ).bind(thread_id, userId, "Cu\u1ED9c tr\xF2 chuy\u1EC7n m\u1EDBi").run();
    }
    await env.ban_dong_hanh_db.prepare(
      "DELETE FROM chat_messages WHERE thread_id = ? AND user_id = ?"
    ).bind(thread_id, userId).run();
    let inserted = 0;
    for (const msg of messages.slice(0, 500)) {
      if (msg.role && msg.content) {
        await env.ban_dong_hanh_db.prepare(
          "INSERT INTO chat_messages (thread_id, user_id, role, content, timestamp, feedback, trace_id) VALUES (?, ?, ?, ?, ?, ?, ?)"
        ).bind(
          thread_id,
          userId,
          msg.role,
          msg.content,
          msg.ts || (/* @__PURE__ */ new Date()).toISOString(),
          msg.feedback || null,
          msg.trace_id || msg.traceId || null
        ).run();
        inserted++;
      }
    }
    await env.ban_dong_hanh_db.prepare(
      "UPDATE chat_threads SET updated_at = datetime('now') WHERE id = ?"
    ).bind(thread_id).run();
    return json({ success: true, inserted });
  } catch (error) {
    console.error("[Data] saveChatMessages error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(saveChatMessages, "saveChatMessages");
async function deleteChatThread(request, env, threadId) {
  const userId = getUserId(request);
  if (!userId)
    return json({ error: "not_authenticated" }, 401);
  try {
    await env.ban_dong_hanh_db.prepare(
      "DELETE FROM chat_messages WHERE thread_id = ? AND user_id = ?"
    ).bind(threadId, userId).run();
    const result = await env.ban_dong_hanh_db.prepare(
      "DELETE FROM chat_threads WHERE id = ? AND user_id = ?"
    ).bind(threadId, userId).run();
    if (result.changes === 0) {
      return json({ error: "not_found" }, 404);
    }
    return json({ success: true });
  } catch (error) {
    console.error("[Data] deleteChatThread error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(deleteChatThread, "deleteChatThread");
async function syncChatThreads(request, env) {
  const userId = getUserId(request);
  if (!userId)
    return json({ error: "not_authenticated" }, 401);
  try {
    const { threads } = await request.json();
    if (!Array.isArray(threads)) {
      return json({ error: "threads ph\u1EA3i l\xE0 array" }, 400);
    }
    let synced = 0;
    for (const thread of threads.slice(0, 50)) {
      if (!thread.id)
        continue;
      await env.ban_dong_hanh_db.prepare(`
                INSERT INTO chat_threads (id, user_id, title, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    title = ?,
                    updated_at = MAX(updated_at, ?)
            `).bind(
        thread.id,
        userId,
        thread.title || "Cu\u1ED9c tr\xF2 chuy\u1EC7n",
        thread.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
        thread.updatedAt || (/* @__PURE__ */ new Date()).toISOString(),
        thread.title || "Cu\u1ED9c tr\xF2 chuy\u1EC7n",
        thread.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
      ).run();
      if (Array.isArray(thread.messages) && thread.messages.length > 0) {
        await env.ban_dong_hanh_db.prepare(
          "DELETE FROM chat_messages WHERE thread_id = ? AND user_id = ?"
        ).bind(thread.id, userId).run();
        for (const msg of thread.messages.slice(0, 200)) {
          if (msg.role && msg.content) {
            await env.ban_dong_hanh_db.prepare(
              "INSERT INTO chat_messages (thread_id, user_id, role, content, timestamp, feedback, trace_id) VALUES (?, ?, ?, ?, ?, ?, ?)"
            ).bind(
              thread.id,
              userId,
              msg.role,
              msg.content,
              msg.ts || (/* @__PURE__ */ new Date()).toISOString(),
              msg.feedback || null,
              msg.trace_id || msg.traceId || null
            ).run();
          }
        }
      }
      synced++;
    }
    return json({ success: true, synced });
  } catch (error) {
    console.error("[Data] syncChatThreads error:", error.message);
    return json({ error: "server_error" }, 500);
  }
}
__name(syncChatThreads, "syncChatThreads");

// workers/forum-api.js
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
init_observability();

// workers/rate-limiter.js
var RATE_LIMITS = {
  // Per-user rate limits
  user: {
    windowMs: 60 * 1e3,
    // 1 minute
    maxRequests: 100
    // 100 requests per minute
  },
  // Per-IP rate limits (fallback khi không có user_id)
  ip: {
    windowMs: 60 * 1e3,
    maxRequests: 200
    // 200 requests per minute per IP
  },
  // AI chat endpoint có limit riêng (tốn token)
  aiChat: {
    windowMs: 60 * 1e3,
    maxRequests: 30
    // 30 requests per minute
  }
};
function getRateLimitKey(request, endpoint = "") {
  const userId = request.headers.get("X-User-Id");
  const ip = request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For")?.split(",")[0] || "unknown";
  if (userId) {
    return `user:${userId}:${endpoint}`;
  }
  return `ip:${ip}:${endpoint}`;
}
__name(getRateLimitKey, "getRateLimitKey");
function getRateLimitConfig(endpoint) {
  if (endpoint.includes("/api/chat") || endpoint === "/") {
    return RATE_LIMITS.aiChat;
  }
  return RATE_LIMITS.user;
}
__name(getRateLimitConfig, "getRateLimitConfig");
async function checkRateLimit(request, env, endpoint = "") {
  const key = getRateLimitKey(request, endpoint);
  const config = getRateLimitConfig(endpoint);
  const now = Date.now();
  const windowStart = now - config.windowMs;
  try {
    const result = await env.ban_dong_hanh_db.prepare(
      "SELECT count, reset_at FROM rate_limits WHERE key = ?"
    ).bind(key).first();
    if (!result) {
      await env.ban_dong_hanh_db.prepare(
        "INSERT INTO rate_limits (key, count, reset_at) VALUES (?, 1, ?)"
      ).bind(key, now + config.windowMs).run();
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: now + config.windowMs
      };
    }
    if (result.reset_at < now) {
      await env.ban_dong_hanh_db.prepare(
        "UPDATE rate_limits SET count = 1, reset_at = ? WHERE key = ?"
      ).bind(now + config.windowMs, key).run();
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: now + config.windowMs
      };
    }
    if (result.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: result.reset_at
      };
    }
    await env.ban_dong_hanh_db.prepare(
      "UPDATE rate_limits SET count = count + 1 WHERE key = ?"
    ).bind(key).run();
    return {
      allowed: true,
      remaining: config.maxRequests - result.count - 1,
      resetAt: result.reset_at
    };
  } catch (error) {
    console.error("[RateLimit] Error:", error.message);
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: now + config.windowMs
    };
  }
}
__name(checkRateLimit, "checkRateLimit");
async function rateLimitMiddleware(request, env, endpoint = "") {
  const limit = await checkRateLimit(request, env, endpoint);
  if (!limit.allowed) {
    return new Response(JSON.stringify({
      error: "rate_limit_exceeded",
      message: "B\u1EA1n \u0111\xE3 g\u1EEDi qu\xE1 nhi\u1EC1u y\xEAu c\u1EA7u. Vui l\xF2ng th\u1EED l\u1EA1i sau.",
      resetAt: new Date(limit.resetAt).toISOString()
    }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Limit": String(getRateLimitConfig(endpoint).maxRequests),
        "X-RateLimit-Remaining": String(limit.remaining),
        "X-RateLimit-Reset": String(limit.resetAt),
        "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1e3))
        // CORS headers sẽ được thêm bởi router.js wrapResponse
      }
    });
  }
  return null;
}
__name(rateLimitMiddleware, "rateLimitMiddleware");

// workers/router.js
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
  if (pathname === "/api/data/chat/feedback" && method === "POST")
    return "data:chat:feedback";
  if (pathname === "/api/data/chat/metrics" && method === "GET")
    return "data:chat:metrics";
  if (pathname === "/api/data/chat/threads" && method === "GET")
    return "data:chat:threads:list";
  if (pathname === "/api/data/chat/threads" && method === "POST")
    return "data:chat:threads:save";
  if (pathname === "/api/data/chat/messages" && method === "POST")
    return "data:chat:messages:save";
  if (pathname.match(/^\/api\/data\/chat\/threads\/[a-zA-Z0-9_]+$/) && method === "DELETE")
    return "data:chat:threads:delete";
  if (pathname === "/api/data/chat/sync" && method === "POST")
    return "data:chat:sync";
  if (pathname === "/api/data/user-stats" && method === "GET")
    return "data:user-stats:get";
  if (pathname === "/api/data/user-stats/add-xp" && method === "POST")
    return "data:user-stats:xp";
  if (pathname === "/api/data/bookmarks" && method === "GET")
    return "data:bookmarks:list";
  if (pathname === "/api/data/bookmarks" && method === "POST")
    return "data:bookmarks:add";
  if (pathname === "/api/data/bookmarks" && method === "DELETE")
    return "data:bookmarks:delete";
  if (pathname.match(/^\/api\/data\/bookmarks\/\d+$/) && method === "DELETE")
    return "data:bookmarks:delete-id";
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
  if (pathname === "/api/admin/comprehensive-stats" && method === "GET")
    return "admin:comprehensive-stats";
  if (pathname === "/api/admin/activity-data" && method === "GET")
    return "admin:activity-data";
  if (pathname === "/api/admin/chat-analytics" && method === "GET")
    return "admin:chat-analytics";
  if (pathname === "/api/admin/reports" && method === "GET")
    return "admin:reports";
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
    const trace = createTraceContext(request, env);
    const origin = getAllowedOrigin2(request, env);
    if (request.method === "OPTIONS") {
      const response = handleOptions2(request, env);
      trace.logResponse(204);
      return addTraceHeader(response, trace.traceId);
    }
    const url = new URL(request.url);
    const route = matchRoute(url.pathname, request.method);
    const wrapResponse = /* @__PURE__ */ __name((response) => {
      const newHeaders = new Headers(response.headers);
      Object.entries(corsHeaders2(origin)).forEach(([k, v]) => newHeaders.set(k, v));
      newHeaders.set("X-Trace-Id", trace.traceId);
      return new Response(response.body, {
        status: response.status,
        headers: newHeaders
      });
    }, "wrapResponse");
    if (request.method !== "OPTIONS") {
      const rateLimitResponse = await rateLimitMiddleware(request, env, url.pathname);
      if (rateLimitResponse) {
        trace.log("warn", "rate_limit_exceeded", { path: url.pathname });
        trace.logResponse(429);
        return wrapResponse(rateLimitResponse);
      }
    }
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
        case "data:chat:feedback":
          response = await submitChatFeedback(request, env);
          break;
        case "data:chat:metrics":
          response = await getChatMetrics(request, env);
          break;
        case "data:user-stats:get":
          response = await getUserStats(request, env);
          break;
        case "data:user-stats:xp":
          response = await addUserXP(request, env);
          break;
        case "data:bookmarks:list":
          response = await getBookmarks(request, env);
          break;
        case "data:bookmarks:add":
          response = await addBookmark(request, env);
          break;
        case "data:bookmarks:delete":
          response = await deleteBookmark(request, env);
          break;
        case "data:bookmarks:delete-id":
          response = await deleteBookmarkById(request, env, extractId(url.pathname));
          break;
        case "data:chat:threads:list":
          response = await getChatThreads(request, env);
          break;
        case "data:chat:threads:save":
          response = await saveChatThread(request, env);
          break;
        case "data:chat:messages:save":
          response = await saveChatMessages(request, env);
          break;
        case "data:chat:threads:delete":
          response = await deleteChatThread(request, env, extractId(url.pathname));
          break;
        case "data:chat:sync":
          response = await syncChatThreads(request, env);
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
        case "admin:comprehensive-stats":
        case "admin:activity-data":
        case "admin:chat-analytics":
        case "admin:reports":
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
              case "admin:comprehensive-stats":
                try {
                  const [
                    usersCount,
                    gratitudeCount,
                    journalCount,
                    focusCount,
                    breathingCount,
                    sleepCount,
                    gameScoresCount,
                    achievementsCount,
                    forumPostsCount,
                    forumCommentsCount,
                    sosLogsCount,
                    chatResponsesCount,
                    chatFeedbackCount,
                    bookmarksCount,
                    todayUsers,
                    weekUsers,
                    totalXP,
                    avgGameScore
                  ] = await Promise.all([
                    env.ban_dong_hanh_db.prepare("SELECT COUNT(*) as count FROM users").first().catch(() => ({ count: 0 })),
                    env.ban_dong_hanh_db.prepare("SELECT COUNT(*) as count FROM gratitude").first().catch(() => ({ count: 0 })),
                    env.ban_dong_hanh_db.prepare("SELECT COUNT(*) as count FROM journal").first().catch(() => ({ count: 0 })),
                    env.ban_dong_hanh_db.prepare("SELECT COUNT(*) as count, COALESCE(SUM(duration_minutes), 0) as total_minutes FROM focus_sessions").first().catch(() => ({ count: 0, total_minutes: 0 })),
                    env.ban_dong_hanh_db.prepare("SELECT COUNT(*) as count, COALESCE(SUM(duration_seconds), 0) as total_seconds FROM breathing_sessions").first().catch(() => ({ count: 0, total_seconds: 0 })),
                    env.ban_dong_hanh_db.prepare("SELECT COUNT(*) as count, COALESCE(AVG(duration_minutes), 0) as avg_duration FROM sleep_logs").first().catch(() => ({ count: 0, avg_duration: 0 })),
                    env.ban_dong_hanh_db.prepare("SELECT COUNT(*) as count, MAX(score) as max_score FROM game_scores").first().catch(() => ({ count: 0, max_score: 0 })),
                    env.ban_dong_hanh_db.prepare("SELECT COUNT(*) as count FROM achievements").first().catch(() => ({ count: 0 })),
                    env.ban_dong_hanh_db.prepare("SELECT COUNT(*) as count FROM forum_posts").first().catch(() => ({ count: 0 })),
                    env.ban_dong_hanh_db.prepare("SELECT COUNT(*) as count FROM forum_comments").first().catch(() => ({ count: 0 })),
                    env.ban_dong_hanh_db.prepare("SELECT COUNT(*) as count FROM sos_logs").first().catch(() => ({ count: 0 })),
                    env.ban_dong_hanh_db.prepare("SELECT COUNT(*) as count FROM chat_responses").first().catch(() => ({ count: 0 })),
                    env.ban_dong_hanh_db.prepare("SELECT COUNT(*) as count, AVG(response_quality) as avg_quality FROM chat_feedback").first().catch(() => ({ count: 0, avg_quality: 0 })),
                    env.ban_dong_hanh_db.prepare("SELECT COUNT(*) as count FROM user_bookmarks").first().catch(() => ({ count: 0 })),
                    env.ban_dong_hanh_db.prepare("SELECT COUNT(DISTINCT user_id) as count FROM gratitude WHERE date(created_at) = date('now')").first().catch(() => ({ count: 0 })),
                    env.ban_dong_hanh_db.prepare("SELECT COUNT(DISTINCT user_id) as count FROM gratitude WHERE created_at >= datetime('now', '-7 days')").first().catch(() => ({ count: 0 })),
                    env.ban_dong_hanh_db.prepare("SELECT COALESCE(SUM(total_xp), 0) as total FROM user_stats").first().catch(() => ({ total: 0 })),
                    env.ban_dong_hanh_db.prepare("SELECT AVG(score) as avg FROM game_scores").first().catch(() => ({ avg: 0 }))
                  ]);
                  response = json4({
                    users: {
                      total: usersCount?.count || 0,
                      activeToday: todayUsers?.count || 0,
                      activeWeek: weekUsers?.count || 0
                    },
                    content: {
                      gratitude: gratitudeCount?.count || 0,
                      journal: journalCount?.count || 0,
                      bookmarks: bookmarksCount?.count || 0
                    },
                    activities: {
                      focus: {
                        sessions: focusCount?.count || 0,
                        totalMinutes: focusCount?.total_minutes || 0
                      },
                      breathing: {
                        sessions: breathingCount?.count || 0,
                        totalSeconds: breathingCount?.total_seconds || 0
                      },
                      sleep: {
                        logs: sleepCount?.count || 0,
                        avgDuration: Math.round(sleepCount?.avg_duration || 0)
                      },
                      games: {
                        plays: gameScoresCount?.count || 0,
                        maxScore: gameScoresCount?.max_score || 0,
                        avgScore: Math.round(avgGameScore?.avg || 0)
                      }
                    },
                    gamification: {
                      achievements: achievementsCount?.count || 0,
                      totalXP: totalXP?.total || 0
                    },
                    community: {
                      forumPosts: forumPostsCount?.count || 0,
                      forumComments: forumCommentsCount?.count || 0
                    },
                    ai: {
                      chatResponses: chatResponsesCount?.count || 0,
                      feedbackCount: chatFeedbackCount?.count || 0,
                      avgQuality: parseFloat((chatFeedbackCount?.avg_quality || 0).toFixed(2))
                    },
                    safety: {
                      sosEvents: sosLogsCount?.count || 0
                    }
                  });
                } catch (statsError) {
                  console.error("[Admin] comprehensive-stats error:", statsError.message);
                  response = json4({ error: "server_error", message: statsError.message }, 500);
                }
                break;
              case "admin:activity-data":
                try {
                  const days = parseInt(url.searchParams.get("days") || "30");
                  const [gratitudeDaily, journalDaily, breathingDaily, focusDaily, gameDaily] = await Promise.all([
                    env.ban_dong_hanh_db.prepare(`
                                            SELECT date(created_at) as date, COUNT(*) as count 
                                            FROM gratitude 
                                            WHERE created_at >= datetime('now', '-${days} days')
                                            GROUP BY date(created_at)
                                            ORDER BY date DESC
                                        `).all().catch(() => ({ results: [] })),
                    env.ban_dong_hanh_db.prepare(`
                                            SELECT date(created_at) as date, COUNT(*) as count 
                                            FROM journal 
                                            WHERE created_at >= datetime('now', '-${days} days')
                                            GROUP BY date(created_at)
                                            ORDER BY date DESC
                                        `).all().catch(() => ({ results: [] })),
                    env.ban_dong_hanh_db.prepare(`
                                            SELECT date(created_at) as date, COUNT(*) as count, SUM(duration_seconds) as total_seconds
                                            FROM breathing_sessions 
                                            WHERE created_at >= datetime('now', '-${days} days')
                                            GROUP BY date(created_at)
                                            ORDER BY date DESC
                                        `).all().catch(() => ({ results: [] })),
                    env.ban_dong_hanh_db.prepare(`
                                            SELECT date(created_at) as date, COUNT(*) as count, SUM(duration_minutes) as total_minutes
                                            FROM focus_sessions 
                                            WHERE created_at >= datetime('now', '-${days} days')
                                            GROUP BY date(created_at)
                                            ORDER BY date DESC
                                        `).all().catch(() => ({ results: [] })),
                    env.ban_dong_hanh_db.prepare(`
                                            SELECT date(created_at) as date, COUNT(*) as count, MAX(score) as max_score
                                            FROM game_scores 
                                            WHERE created_at >= datetime('now', '-${days} days')
                                            GROUP BY date(created_at)
                                            ORDER BY date DESC
                                        `).all().catch(() => ({ results: [] }))
                  ]);
                  response = json4({
                    period: days,
                    gratitude: gratitudeDaily?.results || [],
                    journal: journalDaily?.results || [],
                    breathing: breathingDaily?.results || [],
                    focus: focusDaily?.results || [],
                    games: gameDaily?.results || []
                  });
                } catch (activityError) {
                  console.error("[Admin] activity-data error:", activityError.message);
                  response = json4({ error: "server_error", message: activityError.message }, 500);
                }
                break;
              case "admin:chat-analytics":
                try {
                  const [
                    riskDistribution,
                    responseStats,
                    feedbackStats,
                    recentResponses
                  ] = await Promise.all([
                    env.ban_dong_hanh_db.prepare(`
                                            SELECT risk_level, COUNT(*) as count 
                                            FROM chat_responses 
                                            WHERE risk_level IS NOT NULL
                                            GROUP BY risk_level
                                        `).all().catch(() => ({ results: [] })),
                    env.ban_dong_hanh_db.prepare(`
                                            SELECT 
                                                COUNT(*) as total,
                                                AVG(confidence) as avg_confidence,
                                                AVG(latency_ms) as avg_latency,
                                                AVG(tokens_used) as avg_tokens,
                                                SUM(CASE WHEN used_rag = 1 THEN 1 ELSE 0 END) as rag_count
                                            FROM chat_responses
                                        `).first().catch(() => ({})),
                    env.ban_dong_hanh_db.prepare(`
                                            SELECT 
                                                COUNT(*) as total,
                                                SUM(CASE WHEN helpful = 1 THEN 1 ELSE 0 END) as helpful_count,
                                                AVG(response_quality) as avg_quality
                                            FROM chat_feedback
                                        `).first().catch(() => ({})),
                    env.ban_dong_hanh_db.prepare(`
                                            SELECT user_message, ai_response, risk_level, confidence, created_at
                                            FROM chat_responses
                                            ORDER BY created_at DESC
                                            LIMIT 20
                                        `).all().catch(() => ({ results: [] }))
                  ]);
                  response = json4({
                    riskDistribution: riskDistribution?.results || [],
                    stats: {
                      total: responseStats?.total || 0,
                      avgConfidence: parseFloat((responseStats?.avg_confidence || 0).toFixed(3)),
                      avgLatencyMs: Math.round(responseStats?.avg_latency || 0),
                      avgTokens: Math.round(responseStats?.avg_tokens || 0),
                      ragUsageRate: responseStats?.total > 0 ? parseFloat((responseStats?.rag_count / responseStats?.total).toFixed(3)) : 0
                    },
                    feedback: {
                      total: feedbackStats?.total || 0,
                      helpfulRate: feedbackStats?.total > 0 ? parseFloat((feedbackStats?.helpful_count / feedbackStats?.total).toFixed(3)) : 0,
                      avgQuality: parseFloat((feedbackStats?.avg_quality || 0).toFixed(2))
                    },
                    recentResponses: recentResponses?.results || []
                  });
                } catch (chatError) {
                  console.error("[Admin] chat-analytics error:", chatError.message);
                  response = json4({ error: "server_error", message: chatError.message }, 500);
                }
                break;
              case "admin:reports":
                try {
                  const reportsResult = await env.ban_dong_hanh_db.prepare(`
                                        SELECT r.*, 
                                            CASE 
                                                WHEN r.target_type = 'post' THEN p.content
                                                WHEN r.target_type = 'comment' THEN c.content
                                            END as target_content
                                        FROM forum_reports r
                                        LEFT JOIN forum_posts p ON r.target_type = 'post' AND r.target_id = p.id
                                        LEFT JOIN forum_comments c ON r.target_type = 'comment' AND r.target_id = c.id
                                        ORDER BY r.created_at DESC
                                        LIMIT 100
                                    `).all().catch(() => ({ results: [] }));
                  const pendingCount = await env.ban_dong_hanh_db.prepare(
                    "SELECT COUNT(*) as count FROM forum_reports WHERE status = 'pending'"
                  ).first().catch(() => ({ count: 0 }));
                  response = json4({
                    items: reportsResult?.results || [],
                    pendingCount: pendingCount?.count || 0
                  });
                } catch (reportsError) {
                  console.error("[Admin] reports error:", reportsError.message);
                  response = json4({ items: [], pendingCount: 0 });
                }
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
      trace.logResponse(response.status);
      return wrapResponse(response);
    } catch (error) {
      trace.logError(error, { route: route || "unknown" });
      const errorResponse = json4({ error: "server_error", message: error.message }, 500, origin);
      trace.logResponse(500);
      return wrapResponse(errorResponse);
    }
  }
};
export {
  router_default as default
};
//# sourceMappingURL=router.js.map
