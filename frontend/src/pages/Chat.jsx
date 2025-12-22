// src/pages/Chat.jsx
// Chú thích: Chat Unified - Gộp Text & Voice, Giao diện Theme Rainbow/Học tập
import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAI } from '../hooks/useAI';
import { useVoiceAgentCF } from '../hooks/useVoiceAgentCF';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Button from '../components/ui/Button';
import ChatList from '../components/chat/ChatList';
import {
  Send, Mic, MicOff, Volume2, VolumeX,
  Sparkles, Plus, Image as ImageIcon, X,
  Menu, Cloud, Check, Loader2, StopCircle
} from 'lucide-react';

function formatTime(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch (_) { return ''; }
}

// Bong bóng chat
function Bubble({ role, children, ts, isUser, onRead }) {
  return (
    <motion.div
      className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''} mb-6`}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
    >
      {/* Avatar */}
      <div className={`
        w-10 h-10 rounded-full grid place-items-center text-lg shrink-0 shadow-lg
        ${isUser
          ? 'bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-300 text-white'
          : 'bg-white text-indigo-500' // AI Avatar white
        }
      `}>
        {isUser ? '🧑' : '🤖'}
      </div>

      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[75%]`}>
        <div className={`
          px-5 py-3.5 rounded-2xl relative shadow-sm backdrop-blur-md group
          ${isUser
            ? 'bg-gradient-to-br from-indigo-500/80 to-purple-600/80 text-white rounded-tr-sm border border-indigo-200/20'
            : 'bg-white/80 text-slate-800 rounded-tl-sm border border-white/50'
          }
        `}>
          <div className={`text-[15px] leading-relaxed prose prose-sm max-w-none ${isUser ? 'prose-invert' : 'text-slate-800'}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {String(children).replace(/\n/g, '  \n')}
            </ReactMarkdown>
          </div>

          {/* TTS Button for Assistant */}
          {!isUser && (
            <button
              onClick={() => onRead && onRead(children)}
              className="absolute -right-8 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all bg-white/50 hover:bg-white rounded-full backdrop-blur-sm"
              title="Đọc tin nhắn"
            >
              <Volume2 size={14} />
            </button>
          )}
        </div>
        <span className="text-[10px] text-slate-500 font-medium mt-1 px-1 opacity-70">
          {formatTime(ts)}
        </span>
      </div>
    </motion.div>
  );
}

// Visualizer cho Voice Mode Overlay
function VoiceVisualizer({ listening }) {
  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="w-2 bg-white rounded-full"
          animate={listening ? {
            height: [10, 30, 10],
            opacity: [0.5, 1, 0.5]
          } : { height: 8, opacity: 0.3 }}
          transition={{
            duration: 0.8,
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
  const [autoRead, setAutoRead] = useState(false); // Tự động đọc tin nhắn mới (Default: FALSE - user phải bật)

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
    syncing // New prop
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
    stopSpeaking,
    isSupported: voiceSupported
  } = useVoiceAgentCF({
    autoSubmit: false, // Tắt tự động gửi của hook cũ
    onResult: handleVoiceResult // Xử lý thủ công để dùng sendMessage
  });

  const isListening = voiceStatus === 'listening';
  const isSpeaking = voiceStatus === 'speaking';

  // --- Auto Scroll ---
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, voiceStatus]);

  // --- Auto Read New AI Messages (Fixed: Wait for generation to finish) ---
  const lastReadMsgRef = useRef(null);

  useEffect(() => {
    // Chỉ đọc khi loading kết thúc (text đã đầy đủ) và có messages
    if (!aiLoading && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];

      // Nếu là tin nhắn của AI, chưa đọc, và đang bật autoRead
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

  return (
    <div className="relative h-screen w-full overflow-hidden flex bg-slate-50">
      {/* BACKGROUND FULLSCREEN */}
      <img
        src="/chat-bg-rainbow.png"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Glass Overlay for readability (light tint) */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px] z-0"></div>

      {/* --- SIDEBAR (History) --- */}
      {/* Desktop: Always visible / Mobile: Slide over */}
      <div className={`
            fixed md:relative z-30 h-full w-72 shrink-0
            transform transition-transform duration-300 ease-in-out
            ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            bg-white/60 backdrop-blur-xl border-r border-white/50 shadow-xl md:shadow-none
        `}>
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-700 flex items-center gap-2">
              <Sparkles className="text-purple-500 w-5 h-5" />
              Lịch sử
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setShowSidebar(false)} className="md:hidden">
              <X size={20} />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
            <ChatList
              threads={threads}
              currentId={currentId}
              onSelect={(id) => { setCurrentThread(id); if (window.innerWidth < 768) setShowSidebar(false); }}
              onDelete={deleteChat}
              onRename={renameChat}
              minimal={true}
            />
          </div>

          <Button
            onClick={() => { newChat(); if (window.innerWidth < 768) setShowSidebar(false); }}
            className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-xl w-full"
          >
            <Plus size={18} className="mr-2" /> Cuộc trò chuyện mới
          </Button>
        </div>
      </div>

      {/* Sidebar Backdrop Mobile */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/20 z-20 md:hidden"
          onClick={() => setShowSidebar(false)}
        ></div>
      )}


      {/* --- MAIN CHAT AREA --- */}
      <div className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">

        {/* Header */}
        <div className="h-16 shrink-0 flex items-center justify-between px-4 md:px-6 bg-white/50 backdrop-blur-xl border-b border-white/50 shadow-sm">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setShowSidebar(true)} className="md:hidden text-slate-700 hover:bg-white/50">
              <Menu size={24} />
            </Button>
            <div>
              <h1 className="font-bold text-slate-800 text-lg md:text-xl flex items-center gap-2">
                <span className="hidden md:inline">Bạn Đồng Hành AI</span>
                <span className="md:hidden">Chat AI</span>
                {/* Sync Status Badge */}
                {syncing ? (
                  <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-amber-200">
                    <Loader2 size={11} className="animate-spin" /> Đang lưu
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-emerald-200">
                    <Check size={11} /> Đã lưu
                  </span>
                )}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRead(!autoRead)}
              className={`p-2 rounded-full transition-all ${autoRead ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:bg-white/50'}`}
              title={autoRead ? "Tắt tự động đọc" : "Bật tự động đọc"}
            >
              {autoRead ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 scroll-smooth custom-scrollbar"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-600 max-w-2xl mx-auto">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-28 h-28 bg-gradient-to-br from-indigo-100 to-purple-100 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-6 shadow-xl border border-white/50"
              >
                <span className="text-5xl">🤖</span>
              </motion.div>
              <motion.h3
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold mb-3 text-slate-800"
              >
                Xin chào bạn! 👋
              </motion.h3>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="max-w-md text-slate-600 bg-white/60 p-5 rounded-3xl backdrop-blur-md shadow-sm border border-white/50 leading-relaxed"
              >
                Mình là <span className="font-semibold text-indigo-600">Bạn Đồng Hành</span> - trợ lý tâm lý ảo của bạn. 💙<br />
                Hôm nay bạn cảm thấy thế nào? Hãy thoải mái chia sẻ với mình nhé!
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
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-white grid place-items-center shadow-sm">🤖</div>
              <div className="bg-white/80 px-4 py-3 rounded-2xl rounded-tl-sm border border-white/50">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                  <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- VOICE OVERLAY (Khi đang nghe) --- */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="absolute inset-x-0 bottom-24 mx-auto w-max z-20"
            >
              <div className="bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white px-8 py-4 rounded-3xl shadow-2xl backdrop-blur-md flex flex-col items-center gap-2">
                <span className="text-sm font-medium animate-pulse">Đang lắng nghe...</span>
                <VoiceVisualizer listening={true} />
                <button
                  onClick={stopListening}
                  className="mt-2 text-xs text-white/70 hover:text-white bg-white/10 px-3 py-1 rounded-full transition-colors"
                >
                  Dừng lại
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>


        {/* Input Area */}
        <div className="p-4 md:p-5 bg-white/60 backdrop-blur-xl border-t border-white/50">
          <div className="max-w-4xl mx-auto flex items-end gap-3">
            {/* Voice Button */}
            {voiceSupported && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleVoice}
                className={`
                            p-3 rounded-full shadow-lg transition-all duration-300
                            ${isListening
                    ? 'bg-red-500 text-white shadow-red-500/30 ring-4 ring-red-200'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-purple-500/30'
                  }
                        `}
                title={isListening ? "Dừng nói" : "Nói chuyện"}
              >
                {isListening ? <MicOff size={24} /> : <Mic size={24} />}
              </motion.button>
            )}

            {/* Text Input */}
            <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-3xl shadow-inner border border-white/60 focus-within:ring-2 focus-within:ring-indigo-300 transition-all flex items-end px-4 py-3">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "Đang nghe giọng nói của bạn..." : "Nhập tin nhắn..."}
                className="w-full bg-transparent border-none outline-none resize-none max-h-32 text-slate-800 placeholder:text-slate-400 py-1 text-base md:text-lg"
                rows={1}
                style={{ minHeight: '28px' }}
              />
            </div>

            {/* Send Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
              disabled={!inputText.trim() || aiLoading}
              className="p-3 bg-white text-indigo-600 rounded-full shadow-md hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-indigo-100"
            >
              <Send size={28} className={inputText.trim() ? "translate-x-0.5 ml-0.5" : ""} />
            </motion.button>
          </div>
          <p className="text-center text-xs text-slate-500 mt-2 font-medium opacity-80">
            AI có thể mắc lỗi. Hãy kiểm chứng thông tin quan trọng.
          </p>
        </div>

      </div>
    </div>
  );
}
