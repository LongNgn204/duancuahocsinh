// src/hooks/useAI.js
// Chú thích: Chat store + AI hook: hỗ trợ đa hội thoại (threads), timestamps,
// lưu/persist localStorage, tiền kiểm SOS multi-level, Gemini streaming, TTS gọi ở UI.
// v6.0: Chuyển sang Gemini API frontend - không qua backend proxy
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { detectSOSLevel, sosMessage, getSuggestedAction } from '../utils/sosDetector';
import { getCurrentUser, isLoggedIn, getChatThreads, syncChatThreadsToServer } from '../utils/api';
import { streamChat, isGeminiConfigured, filterProfanity } from '../services/gemini';

const THREADS_KEY = 'chat_threads_v1';
const SYNC_DEBOUNCE_MS = 5000; // Sync sau 5 giây không có thay đổi

function nowISO() {
  return new Date().toISOString();
}

function makeThread(title = 'Cuộc trò chuyện mới') {
  const id = 't_' + Math.random().toString(36).slice(2);
  return { id, title, createdAt: nowISO(), updatedAt: nowISO(), messages: [] };
}

function loadThreads() {
  try {
    const raw = localStorage.getItem(THREADS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (_) {
    return [];
  }
}

function saveThreads(threads) {
  try {
    localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
  } catch (_) { }
}

// Merge local và server threads - server wins cho cùng ID
function mergeThreads(localThreads, serverThreads) {
  const merged = [...serverThreads];
  const serverIds = new Set(serverThreads.map(t => t.id));

  // Thêm local threads chưa có trên server
  for (const local of localThreads) {
    if (!serverIds.has(local.id)) {
      merged.push(local);
    }
  }

  // Sắp xếp theo updatedAt
  merged.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  return merged;
}

export function useAI() {
  // Gemini được gọi trực tiếp từ frontend, không cần endpoint

  const [threads, setThreads] = useState([]); // [{id,title,createdAt,updatedAt,messages:[{role,content,ts,feedback?}]}]
  const [currentId, setCurrentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sos, setSos] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const syncTimeoutRef = useRef(null);
  const lastSyncRef = useRef(0);

  // Sync threads lên server (debounced)
  const syncToServer = useCallback(async (threadsToSync) => {
    if (!isLoggedIn() || !threadsToSync.length) return;

    // Debounce: không sync quá thường xuyên
    const now = Date.now();
    if (now - lastSyncRef.current < 10000) return; // Min 10s giữa các sync

    try {
      setSyncing(true);
      lastSyncRef.current = now;
      await syncChatThreadsToServer(threadsToSync);
      console.log('[ChatSync] Synced', threadsToSync.length, 'threads to server');
    } catch (err) {
      console.warn('[ChatSync] Sync failed:', err.message);
    } finally {
      setSyncing(false);
    }
  }, []);

  // Schedule sync with debounce
  const scheduleSync = useCallback((threadsToSync) => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    syncTimeoutRef.current = setTimeout(() => {
      syncToServer(threadsToSync);
    }, SYNC_DEBOUNCE_MS);
  }, [syncToServer]);

  // Khởi tạo: Load từ localStorage và server
  useEffect(() => {
    const initThreads = async () => {
      // Load từ localStorage trước
      let localThreads = loadThreads();

      // Migrate từ bản cũ nếu có
      if (localThreads.length === 0) {
        try {
          const rawOld = localStorage.getItem('chat_messages_v1');
          const old = rawOld ? JSON.parse(rawOld) : [];
          if (Array.isArray(old) && old.length) {
            const t = makeThread('Hội thoại cũ');
            t.messages = old.map((m) => ({ ...m, ts: nowISO() }));
            localThreads = [t];
            localStorage.removeItem('chat_messages_v1');
          }
        } catch (_) { }
      }

      // Nếu user đã đăng nhập, load từ server và merge
      if (isLoggedIn()) {
        try {
          const serverData = await getChatThreads(50);
          if (serverData?.threads?.length) {
            console.log('[ChatSync] Loaded', serverData.threads.length, 'threads from server');
            localThreads = mergeThreads(localThreads, serverData.threads);
          }
        } catch (err) {
          console.warn('[ChatSync] Failed to load from server:', err.message);
        }
      }

      // Set initial threads
      if (localThreads.length === 0) {
        const t = makeThread();
        localThreads = [t];
      }

      setThreads(localThreads);
      setCurrentId(localThreads[0]?.id || null);
      saveThreads(localThreads);
    };

    initThreads();
  }, []);

  // Persist khi threads đổi và schedule sync
  useEffect(() => {
    if (threads.length) {
      saveThreads(threads);
      scheduleSync(threads);
    }
  }, [threads, scheduleSync]);

  const currentThread = useMemo(() => threads.find((t) => t.id === currentId) || null, [threads, currentId]);
  const messages = currentThread?.messages || [];

  const setCurrentThread = (id) => {
    setCurrentId(id);
  };

  const newChat = () => {
    const t = makeThread();
    setThreads((prev) => [t, ...prev]);
    setCurrentId(t.id);
    return t.id;
  };

  const renameChat = (id, title) => {
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, title: title || t.title } : t)));
  };

  const deleteChat = (id) => {
    setThreads((prev) => prev.filter((t) => t.id !== id));
    if (currentId === id) {
      const rest = threads.filter((t) => t.id !== id);
      setCurrentId(rest[0]?.id ?? null);
    }
  };

  const clearChat = () => {
    if (!currentThread) return;
    setThreads((prev) => prev.map((t) => (t.id === currentId ? { ...t, messages: [], updatedAt: nowISO() } : t)));
  };

  const setFeedback = (msgIndex, value /* 'up' | 'down' | null */) => {
    if (!currentThread) return;
    setThreads((prev) => prev.map((t) => {
      if (t.id !== currentId) return t;
      const copy = t.messages.slice();
      if (copy[msgIndex]) copy[msgIndex] = { ...copy[msgIndex], feedback: value };
      return { ...t, messages: copy, updatedAt: nowISO() };
    }));
  };

  // Gemini được gọi trực tiếp qua streamChat() từ services/gemini.js
  // Không cần streamFromEndpoint nữa

  const sendMessage = async (text, images = []) => {
    const trimmed = text?.trim();
    if (!trimmed) return;
    if (!currentThread) return;

    // Prevent sending while already loading (prevents freeze from concurrent requests)
    if (loading) {
      console.log('[useAI] Already loading, ignoring new message');
      return;
    }

    // SOS multi-level pre-check
    const sosLevel = detectSOSLevel(trimmed);
    const sosAction = getSuggestedAction(sosLevel);

    if (sosAction.showOverlay) {
      setSos({ level: sosLevel, message: sosMessage(sosLevel) });
      // Nếu level critical, block hoàn toàn
      if (sosAction.blockNormalResponse) {
        return;
      }
    }

    // Push user message - filter profanity trước khi lưu
    const filteredInput = filterProfanity(trimmed);
    const userMsg = { role: 'user', content: filteredInput, ts: nowISO() };
    setThreads((prev) => prev.map((t) => (t.id === currentId ? { ...t, messages: [...t.messages, userMsg], updatedAt: nowISO(), title: t.messages.length === 0 ? (trimmed.slice(0, 30) + (trimmed.length > 30 ? '…' : '')) : t.title } : t)));
    setLoading(true);

    try {
      // Tăng số lượng messages gửi lên (từ 5 lên 10)
      const historyCap = messages.slice(-10);

      // Tạo memory summary nếu có nhiều messages
      let memorySummary = '';
      if (messages.length > 10) {
        const oldMessages = messages.slice(0, -10);
        const userOldMessages = oldMessages
          .filter(m => m.role === 'user')
          .map(m => m.content || '')
          .filter(Boolean)
          .join(' ');

        if (userOldMessages.length > 0) {
          const words = userOldMessages.split(/\s+/).slice(0, 100);
          memorySummary = `Tóm tắt trước đó: ${words.join(' ')}${userOldMessages.length > words.join(' ').length ? '...' : ''}`;
        }
      }

      // Lấy thông tin user
      const currentUser = getCurrentUser();
      const userName = currentUser?.display_name || currentUser?.username || 'Bạn';

      // Streaming response với Gemini - buffer để gom text, tránh spam render
      let assistantIndex = -1;
      let textBuffer = '';
      let updateScheduled = false;
      const messageId = 'msg_' + Math.random().toString(36).slice(2);

      // Function để flush buffer vào state - filter profanity cho output
      const flushBuffer = () => {
        if (!textBuffer) return;
        // Filter profanity trước khi hiển thị
        const currentBuffer = filterProfanity(textBuffer);
        textBuffer = '';

        if (assistantIndex === -1) {
          setThreads((prev) => prev.map((t) => {
            if (t.id !== currentId) return t;
            assistantIndex = t.messages.length;
            return {
              ...t,
              messages: [...t.messages, {
                role: 'assistant',
                content: currentBuffer,
                ts: nowISO(),
                messageId
              }],
              updatedAt: nowISO()
            };
          }));
        } else {
          setThreads((prev) => prev.map((t) => {
            if (t.id !== currentId) return t;
            const copy = t.messages.slice();
            copy[assistantIndex] = {
              ...copy[assistantIndex],
              content: (copy[assistantIndex].content || '') + currentBuffer
            };
            return { ...t, messages: copy, updatedAt: nowISO() };
          }));
        }
        updateScheduled = false;
      };

      // Schedule update với debounce
      const scheduleUpdate = () => {
        if (!updateScheduled) {
          updateScheduled = true;
          setTimeout(flushBuffer, 50);
        }
      };

      // Gọi Gemini streamChat trực tiếp
      await streamChat(
        trimmed,
        historyCap,
        (chunk) => {
          if (chunk) {
            textBuffer += chunk;
            scheduleUpdate();
          }
        },
        { userName, memorySummary }
      );

      // Final flush sau khi stream kết thúc
      flushBuffer();
    } catch (err) {
      console.error('[useAI] Gemini error:', err);
      const errorMsg = isGeminiConfigured()
        ? 'Xin lỗi, hiện tại mình đang gặp sự cố kết nối. Bạn thử lại sau nhé.'
        : 'Chưa cấu hình Gemini API key. Vui lòng thêm VITE_GEMINI_API_KEY vào file .env';
      const bot = { role: 'assistant', content: errorMsg, ts: nowISO() };
      setThreads((prev) => prev.map((t) => (t.id === currentId ? { ...t, messages: [...t.messages, bot], updatedAt: nowISO() } : t)));
    } finally {
      setLoading(false);
    }
  };

  const clearSOS = () => setSos(null);

  return {
    // current thread
    messages,
    loading,
    sendMessage,
    sos,
    clearSOS,
    // threads management
    threads,
    currentId,
    setCurrentThread,
    newChat,
    deleteChat,
    renameChat,
    clearChat,
    setFeedback,
    syncing, // Export syncing state
  };
}
