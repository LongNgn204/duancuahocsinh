// src/hooks/useTTS.js
// Chú thích: Hook Text-to-Speech (SpeechSynthesis) cho tiếng Việt, play/stop theo nội dung
// KHÔNG ĐỌC EMOJI - Lọc bỏ icon trước khi đọc
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Loại bỏ emoji và icon khỏi text trước khi TTS đọc
 * @param {string} text - Text có thể chứa emoji
 * @returns {string} Text đã lọc bỏ emoji
 */
function stripEmoji(text) {
  if (!text) return '';
  return text
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols and Pictographs
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
    .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc Symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')   // Variation Selectors
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols
    .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Chess symbols, etc.
    .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols Extended-A
    .replace(/[\u{231A}-\u{2B55}]/gu, '')   // Misc symbols
    .replace(/[\u{23E9}-\u{23FA}]/gu, '')   // Symbols
    .replace(/[\u{25AA}-\u{25FE}]/gu, '')   // Shapes
    .replace(/🆘|📞|🌙|💪|🎮|🧘|📖|✨|🌟|⭐|💬|🤖|🎯|💡|❤️|💚|💙|🔵|🔴|🟢|🟡|⚠️|✅|❌|🔥|👋|👍|👎|🙏|💕|🌈|☀️|🌙|⏰|📝|📊|🏆|🎉|😊|😢|😤|😐|🌸/g, '')
    .replace(/\s{2,}/g, ' ') // Multiple spaces to single
    .trim();
}

export function useTTS(defaultLang = 'vi-VN') {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  const utterRef = useRef(null);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      try { synth?.cancel(); } catch (_) { }
      utterRef.current = null;
    };
  }, [synth]);

  const play = useCallback((text, { rate = 1, pitch = 1, lang = defaultLang } = {}) => {
    if (!synth || !text) return;

    // FILTER EMOJI TRƯỚC KHI ĐỌC
    const cleanText = stripEmoji(text);
    if (!cleanText) return;

    try { synth.cancel(); } catch (_) { }
    const u = new SpeechSynthesisUtterance(cleanText);
    u.lang = lang;
    u.rate = rate;
    u.pitch = pitch;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    utterRef.current = u;
    setSpeaking(true);
    synth.speak(u);
  }, [synth, defaultLang]);

  const stop = useCallback(() => {
    try { synth?.cancel(); } catch (_) { }
    setSpeaking(false);
  }, [synth]);

  return { play, stop, speaking };
}

