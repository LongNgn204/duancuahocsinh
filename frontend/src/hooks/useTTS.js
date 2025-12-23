// src/hooks/useTTS.js
// Chú thích: Hook Text-to-Speech sử dụng Gemini TTS với fallback browser SpeechSynthesis
// KHÔNG ĐỌC EMOJI - Lọc bỏ icon trước khi đọc
import { useCallback, useEffect, useRef, useState } from 'react';
import { speak as geminiSpeak, stopSpeaking as geminiStop, isGeminiTTSAvailable } from '../services/geminiTTS';

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
  const [speaking, setSpeaking] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      geminiStop();
    };
  }, []);

  const play = useCallback(async (text, { rate = 1, pitch = 1, lang = defaultLang } = {}) => {
    if (!text) return;

    // FILTER EMOJI TRƯỚC KHI ĐỌC
    const cleanText = stripEmoji(text);
    if (!cleanText) return;

    // Stop any ongoing speech
    geminiStop();

    setSpeaking(true);

    try {
      await geminiSpeak(cleanText, {
        fallbackToBrowser: true,
        onEnd: () => {
          if (isMountedRef.current) {
            setSpeaking(false);
          }
        },
        onError: (error) => {
          console.error('[useTTS] Error:', error);
          if (isMountedRef.current) {
            setSpeaking(false);
          }
        }
      });
    } catch (error) {
      console.error('[useTTS] Play error:', error);
      if (isMountedRef.current) {
        setSpeaking(false);
      }
    }
  }, [defaultLang]);

  const stop = useCallback(() => {
    geminiStop();
    setSpeaking(false);
  }, []);

  return { play, stop, speaking };
}
