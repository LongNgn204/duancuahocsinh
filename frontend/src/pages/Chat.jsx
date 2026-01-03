// src/pages/Chat.jsx
// Chú thích: Chat Unified - Gộp Text & Voice, Giao diện tối giản pastel
import { useEffect, useState, useRef, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAI } from '../hooks/useAI';
import { useVoiceAgentCF } from '../hooks/useVoiceAgentCF';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; // CSS cho LaTeX rendering
import Button from '../components/ui/Button';
import ChatList from '../components/chat/ChatList';
import SOSOverlay from '../components/sos/SOSOverlay';
import {
  Send, Mic, MicOff, Volume2, VolumeX,
  Sparkles, Plus, X, Menu, Check, Loader2,
  PanelLeftClose, PanelLeft
} from 'lucide-react';

function formatTime(ts) {
  try {
    if (!ts) return ''; // Không có timestamp
    const d = new Date(ts);
    // Check if date is valid
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch (_) { return ''; }
}

// Bong bóng chat - Màu sắc pastel nhẹ hơn, bubble to hơn
function Bubble({ role, children, ts, isUser, onRead }) {
  return (
    <motion.div
      className={`flex items-start gap-2 md:gap-3 ${isUser ? 'flex-row-reverse' : ''} mb-4`}
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Avatar nhỏ gọn hơn */}
      <div className={`
        w-8 h-8 md:w-9 md:h-9 rounded-full grid place-items-center text-sm md:text-base shrink-0 shadow-sm
        ${isUser
          ? 'bg-gradient-to-br from-violet-200 to-purple-200 text-violet-600'
          : 'bg-white text-indigo-500 border border-indigo-100'
        }
      `}>
        {isUser ? '🧑' : '🤖'}
      </div>

      {/* Bubble to hơn - max-width tăng */}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[92%] md:max-w-[88%]`}>
        <div className={`
          px-4 py-3 md:px-5 md:py-3.5 rounded-2xl relative group
          ${isUser
            ? 'bg-gradient-to-br from-violet-100 to-purple-100 text-slate-800 rounded-tr-md border border-violet-200/50'
            : 'bg-white text-slate-700 rounded-tl-md border border-slate-100 shadow-sm'
          }
        `}>
          <div className={`text-[15px] md:text-base leading-relaxed prose prose-sm max-w-none prose-slate`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {String(children).replace(/\n/g, '  \n')}
            </ReactMarkdown>
          </div>

          {/* TTS Button for Assistant - 🔧 ĐANG TẮT
          {!isUser && (
            <button
              onClick={() => onRead && onRead(children)}
              className="absolute -right-7 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all rounded-full"
              title="Đọc tin nhắn"
            >
              <Volume2 size={14} />
            </button>
          )}
          */}
        </div>
        <span className="text-[10px] text-slate-400 mt-1 px-1">
          {formatTime(ts)}
        </span>
      </div>
    </motion.div>
  );
}

// Visualizer cho Voice Mode Overlay
function VoiceVisualizer({ listening }) {
  return (
    <div className="flex items-center justify-center gap-1 h-10">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1.5 bg-white rounded-full"
          animate={listening ? {
            height: [8, 24, 8],
            opacity: [0.5, 1, 0.5]
          } : { height: 6, opacity: 0.3 }}
          transition={{
            duration: 0.7,
            repeat: Infinity,
            delay: i * 0.1
          }}
        />
      ))}
    </div>
  );
}


export default function Chat() {
  const scrollRef = useRef(null);
  const [inputText, setInputText] = useState('');
  const [showSidebar, setShowSidebar] = useState(false); // Mobile sidebar
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Desktop sidebar collapse
  const [autoRead, setAutoRead] = useState(false);
  const [isPending, startTransition] = useTransition(); // Cho newChat không block UI

  // --- UseAI Hook (Text & Sync) ---
  const {
    messages,
    loading: aiLoading,
    sendMessage,
    threads,
    currentId,
    setCurrentThread,
    newChat,
    deleteChat,
    renameChat,
    syncing,
    sos,
    clearSOS
  } = useAI();

  // --- Voice Hook (STT & TTS) ---
  const handleVoiceResult = (text) => {
    if (text && text.trim()) {
      sendMessage(text);
    }
  };

  const {
    status: voiceStatus,
    startListening,
    stopListening,
    speak,
    isSupported: voiceSupported
  } = useVoiceAgentCF({
    autoSubmit: false,
    onResult: handleVoiceResult
  });

  const isListening = voiceStatus === 'listening';

  // --- Auto Scroll ---
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, voiceStatus]);

  // --- Auto Read New AI Messages ---
  const lastReadMsgRef = useRef(null);

  useEffect(() => {
    if (!aiLoading && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'assistant' && autoRead && lastMsg.ts !== lastReadMsgRef.current) {
        speak(lastMsg.content);
        lastReadMsgRef.current = lastMsg.ts;
      }
    }
  }, [aiLoading, messages, autoRead, speak]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Tạo cuộc trò chuyện mới với transition để không block UI
  const handleNewChat = () => {
    startTransition(() => {
      newChat();
    });
    if (window.innerWidth < 768) setShowSidebar(false);
  };

  // Chọn thread và đóng sidebar
  const handleSelectThread = (id) => {
    setCurrentThread(id);
    if (window.innerWidth < 768) setShowSidebar(false);
    // Desktop: tự động đóng sidebar sau khi chọn (tuỳ chọn)
    // setSidebarCollapsed(true);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden flex">
      {/* NỀN PASTEL TỐI GIẢN - Gradient CSS thay vì hình ảnh */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-violet-50 to-indigo-50 z-0" />

      {/* Pattern nhẹ (tuỳ chọn) */}
      <div className="absolute inset-0 opacity-30 z-0" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(139, 92, 246, 0.15) 1px, transparent 0)`,
        backgroundSize: '24px 24px'
      }} />

      {/* --- SIDEBAR (History) - Collapsible trên Desktop --- */}
      <div className={`
        fixed md:relative z-30 h-full shrink-0
        transform transition-all duration-300 ease-in-out
        ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${sidebarCollapsed ? 'md:w-0 md:overflow-hidden' : 'w-64 md:w-56'}
        bg-white/70 backdrop-blur-xl border-r border-white/60 shadow-lg md:shadow-sm
      `}>
        <div className="h-full flex flex-col p-3 w-64 md:w-56">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-600 flex items-center gap-2 text-sm">
              <Sparkles className="text-violet-400 w-4 h-4" />
              Lịch sử
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setShowSidebar(false)} className="md:hidden h-7 w-7">
              <X size={16} />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5">
            <ChatList
              threads={threads}
              currentId={currentId}
              onSelect={handleSelectThread}
              onDelete={deleteChat}
              onRename={renameChat}
              minimal={true}
            />
          </div>

          <Button
            onClick={handleNewChat}
            disabled={isPending}
            className="mt-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md hover:shadow-lg w-full text-sm py-2"
          >
            {isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Plus size={16} className="mr-2" />}
            Trò chuyện mới
          </Button>
        </div>
      </div>

      {/* Sidebar Backdrop Mobile */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/10 z-20 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* --- MAIN CHAT AREA - Full width --- */}
      <div className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">

        {/* Header gọn hơn */}
        <div className="h-14 shrink-0 flex items-center justify-between px-3 md:px-4 bg-white/60 backdrop-blur-lg border-b border-white/50">
          <div className="flex items-center gap-2">
            {/* Toggle sidebar button - Desktop */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:flex h-8 w-8 text-slate-500 hover:text-violet-600 hover:bg-violet-50"
              title={sidebarCollapsed ? "Hiện lịch sử" : "Ẩn lịch sử"}
            >
              {sidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
            </Button>

            {/* Menu button - Mobile */}
            <Button variant="ghost" size="icon" onClick={() => setShowSidebar(true)} className="md:hidden h-10 w-10 min-h-[44px] min-w-[44px] text-slate-600">
              <Menu size={20} />
            </Button>

            <div>
              <h1 className="font-semibold text-slate-700 text-base md:text-lg flex items-center gap-2">
                <span className="hidden md:inline">Bạn Đồng Hành</span>
                <span className="md:hidden">Trò chuyện</span>
                {/* Sync Status Badge nhỏ gọn */}
                {syncing ? (
                  <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-100">
                    <Loader2 size={10} className="animate-spin" /> Lưu...
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-100">
                    <Check size={10} /> Đã lưu
                  </span>
                )}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setAutoRead(!autoRead)}
              className={`p-2 rounded-full transition-all ${autoRead ? 'bg-violet-100 text-violet-600' : 'text-slate-400 hover:bg-slate-100'}`}
              title={autoRead ? "Tắt tự động đọc" : "Bật tự động đọc"}
            >
              {autoRead ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>
        </div>

        {/* Messages List - Full width, padding giảm */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-3 py-4 md:px-6 md:py-5 scroll-smooth custom-scrollbar"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 px-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
              >
                <span className="text-4xl md:text-5xl">🤖</span>
              </motion.div>
              <motion.h3
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="text-xl md:text-2xl font-bold mb-2 text-slate-700"
              >
                Xin chào bạn! 👋
              </motion.h3>
              <motion.p
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="max-w-sm text-slate-500 text-sm md:text-base leading-relaxed"
              >
                Mình là <span className="font-medium text-violet-600">Bạn Đồng Hành</span> - trợ lý tâm lý ảo của bạn. 💜<br />
                Hôm nay bạn cảm thấy thế nào?
              </motion.p>
            </div>
          ) : (
            messages.map((m, idx) => (
              <Bubble
                key={idx}
                role={m.role}
                ts={m.ts}
                isUser={m.role === 'user'}
                onRead={speak}
              >
                {m.content}
              </Bubble>
            ))
          )}

          {/* Thinking Indicator */}
          {aiLoading && (
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-white grid place-items-center shadow-sm border border-slate-100 text-sm">🤖</div>
              <div className="bg-white px-3 py-2.5 rounded-2xl rounded-tl-md border border-slate-100 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- VOICE OVERLAY --- */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="absolute inset-x-0 bottom-20 mx-auto w-max z-20"
            >
              <div className="bg-gradient-to-r from-violet-500/90 to-purple-500/90 text-white px-6 py-3 rounded-2xl shadow-xl backdrop-blur-md flex flex-col items-center gap-1.5">
                <span className="text-xs font-medium animate-pulse">Đang lắng nghe...</span>
                <VoiceVisualizer listening={true} />
                <button
                  onClick={stopListening}
                  className="text-[10px] text-white/70 hover:text-white bg-white/10 px-2.5 py-0.5 rounded-full transition-colors"
                >
                  Dừng lại
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area - Full width, gọn hơn */}
        <div className="p-3 md:p-4 bg-white/50 backdrop-blur-lg border-t border-white/40">
          <div className="flex items-end gap-2 max-w-none">
            {/* Voice Button */}
            {voiceSupported && (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={toggleVoice}
                className={`
                  p-3 rounded-full shadow-md transition-all duration-200 min-h-[48px] min-w-[48px]
                  ${isListening
                    ? 'bg-red-500 text-white ring-2 ring-red-200'
                    : 'bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:shadow-lg'
                  }
                `}
                title={isListening ? "Dừng nói" : "Nói chuyện"}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </motion.button>
            )}

            {/* Text Input - Full width */}
            <div className="flex-1 bg-white/80 rounded-2xl shadow-sm border border-slate-100 focus-within:ring-2 focus-within:ring-violet-200 transition-all flex items-end px-3 md:px-4 py-2.5">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "Đang nghe..." : "Nhập tin nhắn..."}
                className="w-full bg-transparent border-none outline-none resize-none max-h-28 text-slate-700 placeholder:text-slate-400 py-0.5 text-base"
                rows={1}
                style={{ minHeight: '24px' }}
              />
            </div>

            {/* Send Button */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleSend}
              disabled={!inputText.trim() || aiLoading}
              className="p-3 bg-white text-violet-600 rounded-full shadow-md hover:bg-violet-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed border border-violet-100 min-h-[48px] min-w-[48px]"
            >
              <Send size={20} className={inputText.trim() ? "translate-x-0.5" : ""} />
            </motion.button>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-2">
            AI có thể mắc lỗi. Hãy kiểm chứng thông tin quan trọng.
          </p>
        </div>

      </div>

      {/* SOS Overlay */}
      <SOSOverlay
        isOpen={!!sos}
        onClose={clearSOS}
        riskLevel={sos?.level || 'high'}
        triggerText={sos?.message}
      />
    </div>
  );
}
