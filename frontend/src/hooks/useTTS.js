// src/hooks/useTTS.js
// Chú thích: Hook Text-to-Speech (SpeechSynthesis) cho tiếng Việt, play/stop theo nội dung
import { useCallback, useEffect, useRef, useState } from 'react';

export function useTTS(defaultLang = 'vi-VN') {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  const utterRef = useRef(null);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      try { synth?.cancel(); } catch (_) {}
      utterRef.current = null;
    };
  }, [synth]);

  const play = useCallback((text, { rate = 1, pitch = 1, lang = defaultLang } = {}) => {
    if (!synth || !text) return;
    try { synth.cancel(); } catch (_) {}
    const u = new SpeechSynthesisUtterance(text);
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
    try { synth?.cancel(); } catch (_) {}
    setSpeaking(false);
  }, [synth]);

  return { play, stop, speaking };
}

