// src/pages/Chat.jsx
// Chú thích: Chat v4.0 - Hợp nhất Text Chat và Voice Chat với tab switching
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAI } from '../hooks/useAI';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useSpeech } from '../hooks/useSpeech';
import MicVisualizer from '../components/chat/MicVisualizer';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import ChatList from '../components/chat/ChatList';
import EmergencyOverlay from '../components/modals/EmergencyOverlay';
import VoiceChat from '../components/chat/VoiceChat';
import {
  Send, Mic, MicOff, Image, RotateCcw, Edit3,
  Copy, Volume2, VolumeX, ThumbsUp, ThumbsDown,
  Sparkles, Plus, Trash2, MessageCircle, Settings, Play, Pause,
  Bot, Headphones
} from 'lucide-react';


function formatTime(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch (_) {
    return '';
  }
}

function Avatar({ role }) {
  const isUser = role === 'user';
  return (
    <div className={`
      w-10 h-10 rounded-xl grid place-items-center text-lg
      transition-all duration-200 overflow-hidden
      ${isUser
        ? 'bg-gradient-to-br from-[--brand] to-[--brand-light] text-white shadow-md'
        : 'bg-white shadow-md border border-[--surface-border]'
      }
    `}>
      {isUser ? (
        '🧑'
      ) : (
        <img
          src="/ai-avatar.png"
          alt="AI"
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}

function Feedback({ value, onUp, onDown }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onUp}
        className={`p-1.5 rounded-lg transition-colors ${value === 'up' ? 'bg-[--brand]/20 text-[--brand]' : 'text-[--muted] hover:text-[--text] hover:bg-[--surface-border]'}`}
        aria-label="Hài lòng"
      >
        <ThumbsUp size={14} />
      </button>
      <button
        type="button"
        onClick={onDown}
        className={`p-1.5 rounded-lg transition-colors ${value === 'down' ? 'bg-red-500/20 text-red-500' : 'text-[--muted] hover:text-[--text] hover:bg-[--surface-border]'}`}
        aria-label="Chưa hài lòng"
      >
        <ThumbsDown size={14} />
      </button>
    </div>
  );
}

function Bubble({ role, children, onCopy, onPlayTTS, onPauseTTS, onResumeTTS, onStopTTS, speaking, paused, ts, feedbackUI, isLatest, onTtsSettings }) {
  const isUser = role === 'user';

  return (
    <motion.div
      className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Avatar role={role} />

      <div className={`flex-1 max-w-[85%] ${isUser ? 'flex flex-col items-end' : ''}`}>
        <div
          className={`
            rounded-2xl px-4 py-3 shadow-sm
            ${isUser
              ? 'bg-gradient-to-br from-[--brand] to-[--brand-light] text-white rounded-tr-md'
              : 'glass-card rounded-tl-md'
            }
          `}
        >
          <div className={`text-[15px] leading-relaxed prose prose-sm max-w-none ${isUser ? 'text-white prose-invert' : 'text-[--text]'}`}>
            {children}
          </div>
        </div>

        {/* Meta info */}
        <div className={`mt-2 flex items-center gap-3 text-xs text-[--muted] ${isUser ? 'flex-row-reverse' : ''}`}>
          <span>{formatTime(ts)}</span>

          {!isUser && (
            <>
              <button
                type="button"
                onClick={onCopy}
                className="flex items-center gap-1 hover:text-[--text] transition-colors"
              >
                <Copy size={12} /> Sao chép
              </button>
              <div className="flex items-center gap-1">
                {speaking ? (
                  <>
                    {paused ? (
                      <button
                        type="button"
                        onClick={onResumeTTS}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[--brand]/20 text-[--brand] hover:bg-[--brand]/30 transition-colors"
                        title="Tiếp tục đọc"
                      >
                        <Play size={14} /> <span className="text-xs">Tiếp tục</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={onPauseTTS}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[--brand]/20 text-[--brand] hover:bg-[--brand]/30 transition-colors animate-pulse"
                        title="Tạm dừng"
                      >
                        <Pause size={14} /> <span className="text-xs">Tạm dừng</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={onStopTTS}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[--surface-border] transition-colors"
                      title="Dừng đọc"
                    >
                      <VolumeX size={14} /> <span className="text-xs">Dừng</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={onPlayTTS}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[--brand]/10 text-[--brand] hover:bg-[--brand]/20 transition-colors font-medium"
                    title="Đọc tin nhắn"
                  >
                    <Volume2 size={16} className="animate-pulse" />
                    <span className="text-xs font-semibold">Đọc</span>
                  </button>
                )}
                {onTtsSettings && (
                  <button
                    type="button"
                    onClick={onTtsSettings}
                    className="p-1.5 rounded-lg hover:bg-[--surface-border] transition-colors"
                    title="Cài đặt TTS"
                  >
                    <Settings size={14} />
                  </button>
                )}
              </div>
              {feedbackUI}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Chat() {
  const {
    messages,
    loading,
    sendMessage,
    sos,
    clearSOS,
    threads,
    currentId,
    setCurrentThread,
    newChat,
    deleteChat,
    renameChat,
    clearChat,
    setFeedback,
  } = useAI();

  const [text, setText] = useState('');
  const [images, setImages] = useState([]);
  const [info, setInfo] = useState('');
  const endRef = useRef(null);
  const inputRef = useRef(null);

  // Mic
  const speech = useSpeech({ lang: 'vi-VN' });
  useEffect(() => {
    if (speech.text) setText((t) => (t ? `${t} ${speech.text}` : speech.text));
  }, [speech.text]);

  // TTS
  const {
    isSupported: ttsSupported,
    isSpeaking: speaking,
    isPaused: ttsPaused,
    speak,
    pause: pauseTTS,
    resume: resumeTTS,
    stop,
    vietnameseVoices,
    selectedVoice,
    setSelectedVoice,
  } = useTextToSpeech();

  // TTS settings state
  const [ttsRate, setTtsRate] = useState(1); // 0.5 - 2
  const [showTtsSettings, setShowTtsSettings] = useState(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, sos, currentId]);

  // aria-live
  const liveRegionRef = useRef(null);
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.role === 'assistant' && liveRegionRef.current) {
      liveRegionRef.current.textContent = last.content;
    }
  }, [messages]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && images.length === 0) return;
    await sendMessage(text, images);
    setText('');
    setImages([]);
  };

  const lastUserText = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') return messages[i].content;
    }
    return '';
  }, [messages]);

  const onCopyMsg = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      setInfo('Đã sao chép');
      setTimeout(() => setInfo(''), 1200);
    } catch (_) {
      setInfo('Không thể sao chép');
      setTimeout(() => setInfo(''), 1200);
    }
  };

  const onResendLast = () => {
    if (!lastUserText) return;
    sendMessage(lastUserText, []);
    setInfo('Đã gửi lại');
    setTimeout(() => setInfo(''), 1200);
  };

  const onPickImages = async (e) => {
    const files = Array.from(e.target.files || []);
    const accepted = files.filter((f) => f.type.startsWith('image/') && f.size <= 2 * 1024 * 1024);
    const readers = await Promise.all(
      accepted.map(
        (f) =>
          new Promise((res) => {
            const r = new FileReader();
            r.onload = () => res(r.result);
            r.readAsDataURL(f);
          }),
      ),
    );
    setImages((prev) => [...prev, ...readers]);
    e.target.value = '';
  };

  const currentThread = threads.find(t => t.id === currentId);
  const [chatMode, setChatMode] = useState('text'); // 'text' | 'voice'

  return (
    <div className="min-h-[70vh] space-y-4" role="main">
      {/* Mode Tabs */}
      <Card className="p-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex gap-1.5 p-1 bg-[--surface-border] rounded-xl">
            <button
              onClick={() => setChatMode('text')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition-all relative ${
                chatMode === 'text'
                  ? 'bg-[--surface] text-[--brand] shadow-sm font-medium'
                  : 'text-[--muted] hover:text-[--text]'
              }`}
            >
              <MessageCircle size={18} />
              <span className="text-sm hidden sm:inline">Chat văn bản</span>
              <span className="text-sm sm:hidden">Văn bản</span>
            </button>
            <button
              onClick={() => setChatMode('voice')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition-all relative ${
                chatMode === 'voice'
                  ? 'bg-[--surface] text-[--brand] shadow-sm font-medium'
                  : 'text-[--muted] hover:text-[--text]'
              }`}
            >
              <Headphones size={18} />
              <span className="text-sm hidden sm:inline">Nói chuyện</span>
              <span className="text-sm sm:hidden">Nói</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Voice Chat Mode */}
      {chatMode === 'voice' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          <VoiceChat />
        </motion.div>
      )}

      {/* Text Chat Mode */}
      {chatMode === 'text' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="h-[calc(100vh-20rem)] md:h-[calc(100vh-18rem)] flex flex-col lg:grid lg:grid-cols-[320px_1fr] gap-4"
        >
      {/* A11y live region */}
      <div aria-live="polite" aria-atomic="false" className="sr-only" ref={liveRegionRef} />

      {/* Left: Conversation List */}
      <div className="hidden lg:block">
        <Card className="h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-[--surface-border] bg-gradient-to-r from-[--brand]/5 to-transparent">
            <h3 className="font-semibold text-[--text] mb-3 flex items-center gap-2">
              <MessageCircle size={18} className="text-[--brand]" />
              Hội thoại
            </h3>
            <Button
              onClick={() => { newChat(); setText(''); setImages([]); }}
              variant="primary"
              className="w-full"
              icon={<Plus size={18} />}
            >
              Chat mới
            </Button>
          </div>
          
          {/* List */}
          <div className="flex-1 overflow-y-auto p-2">
            <ChatList
              threads={threads}
              currentId={currentId}
              onNew={() => { newChat(); setText(''); setImages([]); }}
              onSelect={(id) => setCurrentThread(id)}
              onRename={(id, name) => renameChat(id, name)}
              onDelete={(id) => deleteChat(id)}
              minimal
            />
          </div>
        </Card>
      </div>

      {/* Right: Chat Thread */}
      <Card className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[--surface-border] bg-gradient-to-r from-[--brand]/5 to-transparent">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[--brand] to-[--brand-light] flex items-center justify-center shadow-lg shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-[--text] truncate">{currentThread?.title || 'Cuộc trò chuyện mới'}</h2>
              <p className="text-xs text-[--muted]">{messages.length} tin nhắn</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="icon-sm" onClick={clearChat} aria-label="Xoá hội thoại" title="Xóa hội thoại">
              <Trash2 size={16} />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gradient-to-b from-transparent to-[--surface]/30" role="list" aria-label="Tin nhắn">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[--brand]/20 to-[--secondary]/20 flex items-center justify-center mb-6 shadow-lg"
              >
                <Bot className="w-10 h-10 text-[--brand]" />
              </motion.div>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-semibold text-xl text-[--text] mb-3"
              >
                Xin chào! 👋
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-[--text-secondary] max-w-md leading-relaxed"
              >
                Mình là <span className="font-semibold text-[--brand]">Bạn Đồng Hành</span>, luôn sẵn sàng lắng nghe bạn.
                <br />
                Hãy chia sẻ bất cứ điều gì bạn đang nghĩ nhé!
              </motion.p>
            </div>
          )}

          <AnimatePresence>
            {messages.map((m, i) => (
              <Bubble
                key={i}
                role={m.role}
                ts={m.ts}
                isLatest={i === messages.length - 1}
                onCopy={() => onCopyMsg(m.content)}
                onPlayTTS={() => {
                  if (m.role === 'assistant') {
                    const text = typeof m.content === 'string' 
                      ? m.content 
                      : (m.content?.reply || m.content?.text || JSON.stringify(m.content));
                    speak(text, {
                      rate: ttsRate,
                      voice: selectedVoice,
                    });
                  }
                }}
                onPauseTTS={pauseTTS}
                onResumeTTS={resumeTTS}
                onStopTTS={stop}
                speaking={speaking}
                paused={ttsPaused}
                onTtsSettings={() => setShowTtsSettings(true)}
                feedbackUI={
                  m.role === 'assistant' ? (
                    <Feedback
                      value={m.feedback}
                      onUp={() => { setFeedback(i, 'up'); setInfo('Cảm ơn!'); setTimeout(() => setInfo(''), 1200); }}
                      onDown={() => { setFeedback(i, 'down'); setInfo('Đã ghi nhận!'); setTimeout(() => setInfo(''), 1200); }}
                    />
                  ) : null
                }
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ href, children }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
                    )
                  }}
                >
                  {typeof m.content === 'string'
                    ? m.content
                    : (m.content?.reply || m.content?.text || JSON.stringify(m.content))}
                </ReactMarkdown>

              </Bubble>

            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Avatar role="assistant" />
              <div className="glass-card rounded-2xl rounded-tl-md px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[--brand] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[--brand] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[--brand] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={endRef} />
        </div>

        {/* Image previews */}
        {images.length > 0 && (
          <div className="px-4 pb-2 flex gap-2 flex-wrap">
            {images.map((src, idx) => (
              <div key={idx} className="relative">
                <img src={src} alt="preview" className="w-16 h-16 object-cover rounded-xl border-2 border-[--surface-border]" />
                <button
                  onClick={() => setImages(imgs => imgs.filter((_, i) => i !== idx))}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Info toast */}
        <AnimatePresence>
          {info && (
            <motion.div
              className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
            >
              <div className="px-4 py-2 rounded-xl bg-[--text] text-white shadow-lg backdrop-blur-sm flex items-center gap-2">
                <Sparkles size={14} />
                <span className="text-sm font-medium">{info}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <div className="p-4 border-t border-[--surface-border] bg-[--surface]/50 backdrop-blur-sm">
          <form onSubmit={onSubmit} className="flex items-end gap-2">
            <div className="flex-1 glass rounded-2xl p-3 flex items-end gap-2 border border-[--surface-border]">
              {/* Mic visualizer */}
              {speech.supported && speech.listening && (
                <div className="mb-1">
                  <MicVisualizer active={speech.listening} height={24} bars={16} />
                </div>
              )}

              <textarea
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSubmit(e);
                  }
                }}
                placeholder="Chia sẻ điều bạn đang nghĩ..."
                rows={1}
                className="flex-1 bg-transparent resize-none outline-none text-[--text] placeholder:text-[--muted] py-2 px-3 min-h-[44px] max-h-32 text-sm leading-relaxed"
                aria-label="Ô nhập tin nhắn"
              />

              {/* Action buttons */}
              <div className="flex items-center gap-1 mb-1">
                <label className="p-2 rounded-xl cursor-pointer text-[--muted] hover:text-[--text] hover:bg-[--surface-border] transition-colors touch-target" title="Thêm ảnh">
                  <Image size={18} />
                  <input type="file" accept="image/*" onChange={onPickImages} className="hidden" multiple />
                </label>

                {speech.supported && (
                  <button
                    type="button"
                    onClick={speech.listening ? speech.stop : speech.start}
                    className={`p-2 rounded-xl transition-colors touch-target ${speech.listening
                      ? 'bg-red-500 text-white shadow-lg'
                      : 'text-[--muted] hover:text-[--text] hover:bg-[--surface-border]'
                      }`}
                    aria-label={speech.listening ? 'Dừng ghi âm' : 'Ghi âm'}
                    title={speech.listening ? 'Dừng ghi âm' : 'Ghi âm'}
                  >
                    {speech.listening ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>
                )}
              </div>
            </div>

            {/* Send button */}
            <Button
              type="submit"
              size="icon"
              disabled={loading || (!text.trim() && images.length === 0)}
              aria-label="Gửi"
              className="w-12 h-12 shrink-0"
            >
              <Send size={18} />
            </Button>
          </form>

          {/* Quick actions */}
          {lastUserText && (
            <div className="mt-3 flex items-center gap-3 text-xs">
              <button
                type="button"
                onClick={onResendLast}
                className="flex items-center gap-1.5 text-[--muted] hover:text-[--text] transition-colors px-2 py-1 rounded-lg hover:bg-[--surface-border]"
              >
                <RotateCcw size={12} /> Gửi lại
              </button>
              <button
                type="button"
                onClick={() => { if (lastUserText) { setText(lastUserText); inputRef.current?.focus(); } }}
                className="flex items-center gap-1.5 text-[--muted] hover:text-[--text] transition-colors px-2 py-1 rounded-lg hover:bg-[--surface-border]"
              >
                <Edit3 size={12} /> Sửa
              </button>
            </div>
          )}
        </div>
      </Card>

        {/* Emergency Overlay - Multi-step calming flow */}
        <EmergencyOverlay
          isOpen={!!sos}
          level={sos?.level || 'high'}
          message={typeof sos === 'string' ? sos : sos?.message}
          onClose={clearSOS}
        />

        {/* TTS Settings Modal */}
        {showTtsSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <div className="p-4 border-b border-[--surface-border] flex items-center justify-between">
              <h3 className="font-semibold text-[--text]">Cài đặt Text-to-Speech</h3>
              <button
                onClick={() => setShowTtsSettings(false)}
                className="p-1 hover:bg-[--surface-border] rounded-lg transition-colors"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Tốc độ đọc */}
              <div>
                <label className="block text-sm font-medium text-[--text] mb-2">
                  Tốc độ đọc: {ttsRate.toFixed(2)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={ttsRate}
                  onChange={(e) => setTtsRate(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-[--muted] mt-1">
                  <span>0.5x</span>
                  <span>1x</span>
                  <span>1.5x</span>
                  <span>2x</span>
                </div>
              </div>

              {/* Chọn giọng */}
              {vietnameseVoices.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-[--text] mb-2">
                    Giọng đọc
                  </label>
                  <select
                    value={selectedVoice?.name || ''}
                    onChange={(e) => {
                      const voice = vietnameseVoices.find(v => v.name === e.target.value);
                      if (voice) setSelectedVoice(voice);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-[--surface-border] bg-[--surface] text-[--text]"
                  >
                    {vietnameseVoices.map((voice) => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name} {voice.default ? '(Mặc định)' : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-[--muted] mt-1">
                    {selectedVoice && (
                      selectedVoice.name.includes('Female') || selectedVoice.name.includes('Nữ')
                        ? 'Giọng nữ'
                        : selectedVoice.name.includes('Male') || selectedVoice.name.includes('Nam')
                        ? 'Giọng nam'
                        : 'Giọng mặc định'
                    )}
                  </p>
                </div>
              )}

              {vietnameseVoices.length === 0 && (
                <p className="text-sm text-[--muted]">
                  Không tìm thấy giọng tiếng Việt. Trình duyệt sẽ sử dụng giọng mặc định.
                </p>
              )}

              {/* Test button */}
              <Button
                onClick={() => {
                  speak('Đây là giọng đọc mẫu. Bạn có thể điều chỉnh tốc độ và giọng đọc theo ý thích.', {
                    rate: ttsRate,
                    voice: selectedVoice,
                  });
                }}
                variant="outline"
                className="w-full"
              >
                <Volume2 size={16} /> Nghe thử
              </Button>
            </div>
          </Card>
        </div>
        )}
        </motion.div>
      )}

      {/* Emergency Overlay - Global (cho cả voice mode) */}
      <EmergencyOverlay
        isOpen={!!sos}
        level={sos?.level || 'high'}
        message={typeof sos === 'string' ? sos : sos?.message}
        onClose={clearSOS}
      />
    </div>
  );
}
