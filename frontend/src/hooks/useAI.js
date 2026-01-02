// src/hooks/useAI.js
// Chú thích: Chat store + AI hook: hỗ trợ đa hội thoại (threads), timestamps,
// lưu/persist localStorage, tiền kiểm SOS multi-level, Gemini streaming, TTS gọi ở UI.
// v6.0: Chuyển sang Gemini API frontend - không qua backend proxy
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { detectSOSLevel, sosMessage, getSuggestedAction } from '../utils/sosDetector';
import { getCurrentUser, isLoggedIn, getChatThreads, syncChatThreadsToServer } from '../utils/api';
import { streamChat, isGeminiConfigured, filterProfanity } from '../services/gemini';
import { recordActivity } from '../utils/streakService';

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

  // Chú thích: Sync threads lên server - có 2 mode: debounced và force
  const syncToServer = useCallback(async (threadsToSync, force = false) => {
    if (!isLoggedIn() || !threadsToSync.length) return;

    // Force sync: bypass debounce (sau khi AI trả lời xong)
    // Normal sync: debounce 3s giữa các sync
    const now = Date.now();
    if (!force && now - lastSyncRef.current < 3000) return;

    try {
      setSyncing(true);
      lastSyncRef.current = now;
      await syncChatThreadsToServer(threadsToSync);
      console.log('[ChatSync] Synced', threadsToSync.length, 'threads to server', force ? '(forced)' : '');
    } catch (err) {
      console.warn('[ChatSync] Sync failed:', err.message);
    } finally {
      setSyncing(false);
    }
  }, []);

  // Force sync now - không debounce, dùng sau khi AI trả lời xong
  // Chú thích: Dùng setThreads callback để lấy threads mới nhất, tránh closure stale
  const forceSyncNow = useCallback(async () => {
    // Dùng ref pattern để lấy threads mới nhất
    const currentThreads = loadThreads(); // Load từ localStorage để đảm bảo có dữ liệu mới nhất
    if (currentThreads.length > 0) {
      await syncToServer(currentThreads, true);
    }
  }, [syncToServer]);

  // Schedule sync with debounce (cho các thay đổi nhỏ như typing)
  const scheduleSync = useCallback((threadsToSync) => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    syncTimeoutRef.current = setTimeout(() => {
      syncToServer(threadsToSync, false);
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

    // SOS multi-level pre-check - TRƯỚC KHI LƯU TIN NHẮN
    const sosLevel = detectSOSLevel(trimmed);
    const sosAction = getSuggestedAction(sosLevel);

    if (sosAction.showOverlay) {
      console.log('[useAI] SOS detected:', sosLevel, '- Showing overlay');
      setSos({ level: sosLevel, message: sosMessage(sosLevel) });

      // BLOCK HOÀN TOÀN tin nhắn nguy hiểm - không cho gửi
      // Cả critical và high đều bị chặn
      return; // Không lưu tin nhắn, không gọi AI
    }

    // Push user message - filter profanity trước khi lưu
    const filteredInput = filterProfanity(trimmed);
    const userMsg = { role: 'user', content: filteredInput, ts: nowISO() };
    setThreads((prev) => prev.map((t) => (t.id === currentId ? { ...t, messages: [...t.messages, userMsg], updatedAt: nowISO(), title: t.messages.length === 0 ? (trimmed.slice(0, 30) + (trimmed.length > 30 ? '…' : '')) : t.title } : t)));
    setLoading(true);

    // Ghi nhận hoạt động chat cho streak
    recordActivity('chat');

    try {
      // Tăng số lượng messages gửi lên 15 để AI nhớ context tốt hơn
      const historyCap = messages.slice(-15);

      // Tạo memory summary nếu có nhiều messages - giúp AI nhớ context xa hơn
      let memorySummary = '';
      if (messages.length > 15) {
        const oldMessages = messages.slice(0, -15);
        const userOldMessages = oldMessages
          .filter(m => m.role === 'user')
          .map(m => m.content || '')
          .filter(Boolean)
          .join(' | ');

        if (userOldMessages.length > 0) {
          // Tăng lên 150 từ để AI nhớ rõ hơn
          const words = userOldMessages.split(/\s+/).slice(0, 150);
          memorySummary = `Những điều người dùng đã chia sẻ trước đó: ${words.join(' ')}${userOldMessages.length > words.join(' ').length ? '...' : ''}`;
        }
      }

      // Lấy thông tin user
      const currentUser = getCurrentUser();
      const userName = currentUser?.display_name || currentUser?.username || 'Bạn';

      // Chú thích: Streaming response với Gemini - sử dụng object để tránh closure issues
      const streamState = {
        assistantIndex: -1,
        fullText: '',
        messageId: 'msg_' + Math.random().toString(36).slice(2),
        updatePending: false
      };

      // Flush buffer vào state - tạo hoặc cập nhật tin nhắn AI
      const flushToState = () => {
        if (!streamState.fullText) return;

        const filteredText = filterProfanity(streamState.fullText);

        setThreads((prev) => {
          return prev.map((t) => {
            if (t.id !== currentId) return t;

            const copy = [...t.messages];

            if (streamState.assistantIndex === -1) {
              // Tạo tin nhắn AI mới
              streamState.assistantIndex = copy.length;
              copy.push({
                role: 'assistant',
                content: filteredText,
                ts: nowISO(),
                messageId: streamState.messageId
              });
            } else {
              // Cập nhật tin nhắn AI đã có
              copy[streamState.assistantIndex] = {
                ...copy[streamState.assistantIndex],
                content: filteredText
              };
            }

            return { ...t, messages: copy, updatedAt: nowISO() };
          });
        });

        streamState.updatePending = false;
      };

      // Schedule update với debounce nhỏ để giảm render
      const scheduleFlush = () => {
        if (!streamState.updatePending) {
          streamState.updatePending = true;
          setTimeout(flushToState, 50);
        }
      };

      // Gọi Gemini streamChat trực tiếp
      await streamChat(
        trimmed,
        historyCap,
        (chunk) => {
          if (chunk) {
            streamState.fullText += chunk; // Gom vào fullText thay vì buffer riêng
            scheduleFlush();
          }
        },
        { userName, memorySummary }
      );

      // Final flush sau khi stream kết thúc - đảm bảo lưu tất cả
      flushToState();

      // Chú thích: LƯU NGAY vào localStorage và sync ngay lập tức
      // Không đợi useEffect - để tránh mất data khi F5
      setThreads((currentThreads) => {
        // Lưu trực tiếp vào localStorage
        saveThreads(currentThreads);
        console.log('[ChatSync] Saved threads to localStorage immediately');

        // Sync lên server ngay
        syncToServer(currentThreads, true);

        return currentThreads; // Không thay đổi state
      });
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
