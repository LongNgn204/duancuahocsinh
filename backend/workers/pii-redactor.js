// backend/workers/pii-redactor.js
// Chú thích: Module redact PII (Personally Identifiable Information) trước khi log hoặc gửi LLM
// Tuân thủ GDPR/FERPA - không lưu thông tin nhạy cảm

/**
 * Patterns để phát hiện PII
 */
const PII_PATTERNS = {
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
  name: /(?:tên|tôi là|mình là|em là|con là)\s+([A-ZÀ-Ỹ][a-zà-ỹ]+(?:\s+[A-ZÀ-Ỹ][a-zà-ỹ]+)*)/gi,
};

/**
 * Redact PII từ text
 * @param {string} text - Text cần redact
 * @param {Object} options - Options
 * @param {boolean} options.redactPhone - Redact số điện thoại
 * @param {boolean} options.redactEmail - Redact email
 * @param {boolean} options.redactIdCard - Redact CMND/CCCD
 * @param {boolean} options.redactAddress - Redact địa chỉ
 * @param {boolean} options.redactName - Redact tên
 * @returns {string} Text đã redact
 */
export function redactPII(text, options = {}) {
  if (!text || typeof text !== 'string') {
    return text || '';
  }

  let redacted = text;
  const {
    redactPhone = true,
    redactEmail = true,
    redactIdCard = true,
    redactAddress = false, // Mặc định không redact address vì có thể ảnh hưởng context
    redactName = false, // Mặc định không redact name vì cần cho context
  } = options;

  // Redact số điện thoại
  if (redactPhone) {
    redacted = redacted.replace(PII_PATTERNS.phone, (match) => {
      // Giữ 3 số đầu và 2 số cuối, thay phần giữa bằng *
      if (match.length >= 10) {
        return match.slice(0, 3) + '****' + match.slice(-2);
      }
      return '***';
    });
  }

  // Redact email
  if (redactEmail) {
    redacted = redacted.replace(PII_PATTERNS.email, (match) => {
      const [local, domain] = match.split('@');
      const redactedLocal = local.length > 2 
        ? local.slice(0, 2) + '***' 
        : '***';
      return `${redactedLocal}@${domain}`;
    });
  }

  // Redact CMND/CCCD
  if (redactIdCard) {
    redacted = redacted.replace(PII_PATTERNS.idCard, (match) => {
      if (match.length >= 9) {
        return match.slice(0, 3) + '****' + match.slice(-2);
      }
      return '***';
    });
  }

  // Redact địa chỉ
  if (redactAddress) {
    redacted = redacted.replace(PII_PATTERNS.address, '[ĐỊA CHỈ]');
  }

  // Redact tên (chỉ khi có format rõ ràng)
  if (redactName) {
    redacted = redacted.replace(PII_PATTERNS.name, (match, name) => {
      return match.replace(name, '[TÊN]');
    });
  }

  return redacted;
}

/**
 * Redact PII từ object (recursive)
 * @param {any} obj - Object cần redact
 * @param {Object} options - Redaction options
 * @param {string[]} excludeKeys - Keys không cần redact (ví dụ: 'username' cho auth)
 * @returns {any} Object đã redact
 */
export function redactPIIFromObject(obj, options = {}, excludeKeys = []) {
  if (!obj) return obj;

  if (typeof obj === 'string') {
    return redactPII(obj, options);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => redactPIIFromObject(item, options, excludeKeys));
  }

  if (typeof obj === 'object') {
    const redacted = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip redaction cho excludeKeys
      if (excludeKeys.includes(key)) {
        redacted[key] = value;
      } else if (typeof value === 'string') {
        redacted[key] = redactPII(value, options);
      } else {
        redacted[key] = redactPIIFromObject(value, options, excludeKeys);
      }
    }
    return redacted;
  }

  return obj;
}

/**
 * Check if text contains PII
 * @param {string} text 
 * @returns {boolean}
 */
export function containsPII(text) {
  if (!text || typeof text !== 'string') return false;

  for (const pattern of Object.values(PII_PATTERNS)) {
    if (pattern.test(text)) {
      return true;
    }
  }

  return false;
}

