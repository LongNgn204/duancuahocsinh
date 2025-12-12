// src/hooks/useSpeech.js
// Chú thích: Hook mic (Web Speech API) để chuyển giọng nói -> chữ (vi) cho Chat
import { useEffect, useRef, useState } from 'react';

export function useSpeech({ lang = 'vi-VN', interim = true } = {}) {
  const recRef = useRef(null);
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    setSupported(true);
    const rec = new SR();
    rec.lang = lang;
    rec.interimResults = interim;
    rec.continuous = false;

    rec.onresult = (e) => {
      let finalText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
      }
      if (finalText) setText(finalText);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);

    recRef.current = rec;
    return () => {
      try { rec.stop(); } catch (_) {}
      recRef.current = null;
    };
  }, [lang, interim]);

  const start = () => {
    if (!recRef.current) return;
    setText('');
    setListening(true);
    try { recRef.current.start(); } catch (_) {}
  };
  const stop = () => {
    if (!recRef.current) return;
    try { recRef.current.stop(); } catch (_) {}
    setListening(false);
  };

  return { supported, listening, text, start, stop, setText };
}

