// src/hooks/useAI.js
// Chú thích: Chat store + AI hook: hỗ trợ đa hội thoại (threads), timestamps,
// lưu/persist localStorage, tiền kiểm SOS multi-level, streaming SSE, TTS gọi ở UI.
// v5.0: Thêm sync với server để user xem lại lịch sử chat trên các thiết bị
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { detectSOSLevel, sosMessage, getSuggestedAction } from '../utils/sosDetector';
import { getCurrentUser, isLoggedIn, getChatThreads, syncChatThreadsToServer } from '../utils/api';

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
  const endpoint = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_AI_PROXY_URL ?? null;

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

  const streamFromEndpoint = async (url, payload) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify(payload),
    });

    const traceId = res.headers.get('X-Trace-Id') || undefined;
    // Store traceId as message_id for feedback

    if (!res.body || typeof res.body.getReader !== 'function') {
      const data = await res.json();
      return { type: 'json', data, traceId };
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    return {
      type: 'stream',
      traceId,
      async read(onChunk) {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let idx;
          while ((idx = buffer.indexOf('\n\n')) !== -1) {
            const raw = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 2);
            const line = raw.trim();
            if (!line) continue;
            const parts = line.split('\n');
            let event = 'message';
            let dataRaw = '';
            for (const p of parts) {
              if (p.startsWith('event:')) event = p.slice(6).trim();
              if (p.startsWith('data:')) dataRaw = p.slice(5).trim();
            }
            // Parse standardized format: {"type":"delta","text":"..."} or {"type":"done"}
            let parsedData = dataRaw;
            try {
              const jsonData = JSON.parse(dataRaw);
              if (jsonData.type === 'delta' && jsonData.text) {
                parsedData = jsonData.text;
              } else if (jsonData.type === 'done') {
                event = 'done';
                parsedData = '';
              } else if (jsonData.type === 'error') {
                event = 'error';
                parsedData = JSON.stringify(jsonData);
              } else if (typeof jsonData === 'string') {
                parsedData = jsonData;
              }
            } catch (_) {
              // Keep original dataRaw if not valid JSON
            }
            onChunk({ event, data: parsedData });

          }
        }
      },
    };
  };

  const sendMessage = async (text, images = []) => {
    const trimmed = text?.trim();
    if (!trimmed) return;
    if (!currentThread) return;

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

    // Push user message
    const userMsg = { role: 'user', content: trimmed, ts: nowISO() };
    setThreads((prev) => prev.map((t) => (t.id === currentId ? { ...t, messages: [...t.messages, userMsg], updatedAt: nowISO(), title: t.messages.length === 0 ? (trimmed.slice(0, 30) + (trimmed.length > 30 ? '…' : '')) : t.title } : t)));
    setLoading(true);

    try {
      const url = endpoint || '/__dev_echo__';
      if (url === '/__dev_echo__') {
        const bot = { role: 'assistant', content: `DEV_ECHO: ${trimmed}`, ts: nowISO() };
        setThreads((prev) => prev.map((t) => (t.id === currentId ? { ...t, messages: [...t.messages, bot], updatedAt: nowISO() } : t)));
        return;
      }

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
          // Tạo summary đơn giản (client-side)
          const words = userOldMessages.split(/\s+/).slice(0, 100);
          memorySummary = `Tóm tắt trước đó: ${words.join(' ')}${userOldMessages.length > words.join(' ').length ? '...' : ''}`;
        }
      }

      // Lấy userId cho persistent memory
      const currentUser = getCurrentUser();
      const userId = currentUser?.id || null;

      const stream = await streamFromEndpoint(`${url}?stream=true`, {
        message: trimmed,
        history: historyCap,
        images,
        memorySummary,
        userId  // Gửi userId để backend có thể load/save memory
      });

      if (stream.type === 'json') {
        const data = stream.data;
        if (data?.sos) {
          setSos(data.message || 'Tín hiệu SOS');
        } else {
          const bot = {
            role: 'assistant',
            content: data?.text || data?.reply || '...',
            ts: nowISO(),
            messageId: stream.traceId || stream.messageId, // Store traceId as messageId for feedback
            traceId: stream.traceId
          };
          setThreads((prev) => prev.map((t) => (t.id === currentId ? { ...t, messages: [...t.messages, bot], updatedAt: nowISO() } : t)));
        }
        return;
      }

      // Streaming - với buffer để gom text, tránh spam render
      let assistantIndex = -1;
      let textBuffer = '';  // Buffer để gom text
      let updateScheduled = false;  // Flag để debounce

      // Function để flush buffer vào state
      const flushBuffer = () => {
        if (!textBuffer) return;
        const currentBuffer = textBuffer;
        textBuffer = '';  // Reset buffer

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
                messageId: stream.traceId,
                traceId: stream.traceId
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
              content: (copy[assistantIndex].content || '') + currentBuffer,
              messageId: copy[assistantIndex].messageId || stream.traceId,
              traceId: copy[assistantIndex].traceId || stream.traceId
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
          // Debounce 50ms để gom nhiều chunks lại
          setTimeout(flushBuffer, 50);
        }
      };

      await stream.read(({ event, data }) => {
        if (event === 'error') {
          // Flush buffer trước khi xử lý error
          flushBuffer();
          let msg = 'Lỗi không xác định';
          try { const j = JSON.parse(data); msg = j?.note || msg; } catch (_) { }
          const bot = { role: 'assistant', content: `Lỗi: ${msg}`, ts: nowISO() };
          setThreads((prev) => prev.map((t) => (t.id === currentId ? { ...t, messages: [...t.messages, bot], updatedAt: nowISO() } : t)));
          return;
        }
        if (event === 'done') {
          // Flush buffer khi done
          flushBuffer();
          return;
        }
        // Đảm bảo chunk luôn là string, không phải object
        let chunk = '';
        if (typeof data === 'string') {
          try {
            const parsed = JSON.parse(data);
            // Nếu parsed là object, lấy text/content/message
            if (typeof parsed === 'object' && parsed !== null) {
              chunk = parsed.text || parsed.content || parsed.message || parsed.response || '';
            } else {
              chunk = String(parsed);
            }
          } catch (_) {
            chunk = data;
          }
        } else if (typeof data === 'object' && data !== null) {
          chunk = data.text || data.content || data.message || data.response || '';
        } else {
          chunk = String(data || '');
        }

        // Thêm vào buffer thay vì update ngay
        if (chunk) {
          textBuffer += chunk;
          scheduleUpdate();
        }
      });

      // Final flush sau khi stream kết thúc
      flushBuffer();
    } catch (_e) {
      const bot = { role: 'assistant', content: 'Xin lỗi, hiện tại mình đang gặp sự cố kết nối. Bạn thử lại sau nhé.', ts: nowISO() };
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
  };
}
