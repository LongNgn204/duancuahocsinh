// src/pages/Chat.jsx
// Chú thích: Chat v3.1 - Modern UI với EmergencyOverlay multi-step calming flow
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
import { useTTS } from '../hooks/useTTS';
import ChatList from '../components/chat/ChatList';
import EmergencyOverlay from '../components/modals/EmergencyOverlay';
import {
  Send, Mic, MicOff, Image, RotateCcw, Edit3,
  Copy, Volume2, VolumeX, ThumbsUp, ThumbsDown,
  Sparkles, Plus, Trash2, MessageCircle
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

function Bubble({ role, children, onCopy, onPlayTTS, onStopTTS, speaking, ts, feedbackUI, isLatest }) {
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
              <button
                type="button"
                onClick={speaking ? onStopTTS : onPlayTTS}
                className="flex items-center gap-1 hover:text-[--text] transition-colors"
              >
                {speaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                {speaking ? 'Dừng' : 'Đọc'}
              </button>
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
  const { play, stop, speaking } = useTTS('vi-VN');

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

  return (
    <div className="h-[calc(100vh-10rem)] md:h-[calc(100vh-12rem)] flex flex-col md:grid md:grid-cols-[280px_1fr] gap-4" role="main">
      {/* A11y live region */}
      <div aria-live="polite" aria-atomic="false" className="sr-only" ref={liveRegionRef} />

      {/* Left: Conversation List */}
      <div className="hidden md:block">
        <Card className="h-full overflow-hidden">
          <div className="p-4 border-b border-[--surface-border]">
            <Button
              onClick={() => { newChat(); setText(''); setImages([]); }}
              variant="primary"
              className="w-full"
              icon={<Plus size={18} />}
            >
              Chat mới
            </Button>
          </div>
          <div className="p-2 overflow-y-auto max-h-[calc(100%-5rem)]">
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
        <div className="flex items-center justify-between p-4 border-b border-[--surface-border]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[--brand] to-[--brand-light] flex items-center justify-center shadow-lg">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-[--text]">{currentThread?.title || 'Cuộc trò chuyện'}</h2>
              <p className="text-xs text-[--muted]">{messages.length} tin nhắn</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" onClick={clearChat} aria-label="Xoá hội thoại">
              <Trash2 size={16} />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" role="list" aria-label="Tin nhắn">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[--brand]/20 to-[--secondary]/20 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-[--brand]" />
              </div>
              <h3 className="font-semibold text-lg text-[--text] mb-2">Xin chào! 👋</h3>
              <p className="text-[--muted] max-w-sm">
                Mình là Bạn Đồng Hành, luôn sẵn sàng lắng nghe bạn.
                Hãy chia sẻ bất cứ điều gì bạn đang nghĩ nhé!
              </p>
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
                onPlayTTS={() => m.role === 'assistant' && play(m.content)}
                onStopTTS={stop}
                speaking={speaking}
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
        <div className="p-4 border-t border-[--surface-border]">
          <form onSubmit={onSubmit} className="flex items-end gap-2">
            <div className="flex-1 glass rounded-2xl p-2 flex items-end gap-2">
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
                className="flex-1 bg-transparent resize-none outline-none text-[--text] placeholder:text-[--muted] py-2 px-3 min-h-[40px] max-h-24"
                aria-label="Ô nhập tin nhắn"
              />

              {/* Action buttons */}
              <div className="flex items-center gap-1 mb-1">
                <label className="p-2 rounded-xl cursor-pointer text-[--muted] hover:text-[--text] hover:bg-[--surface-border] transition-colors">
                  <Image size={18} />
                  <input type="file" accept="image/*" onChange={onPickImages} className="hidden" />
                </label>

                {speech.supported && (
                  <button
                    type="button"
                    onClick={speech.listening ? speech.stop : speech.start}
                    className={`p-2 rounded-xl transition-colors ${speech.listening
                      ? 'bg-red-500 text-white'
                      : 'text-[--muted] hover:text-[--text] hover:bg-[--surface-border]'
                      }`}
                    aria-label={speech.listening ? 'Dừng ghi âm' : 'Ghi âm'}
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
            >
              <Send size={18} />
            </Button>
          </form>

          {/* Quick actions */}
          <div className="mt-2 flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={onResendLast}
              disabled={!lastUserText}
              className="flex items-center gap-1 text-[--muted] hover:text-[--text] disabled:opacity-50"
            >
              <RotateCcw size={12} /> Gửi lại
            </button>
            <button
              type="button"
              onClick={() => { if (lastUserText) { setText(lastUserText); inputRef.current?.focus(); } }}
              disabled={!lastUserText}
              className="flex items-center gap-1 text-[--muted] hover:text-[--text] disabled:opacity-50"
            >
              <Edit3 size={12} /> Sửa
            </button>
          </div>
        </div>
      </Card>

      {/* Emergency Overlay - Multi-step calming flow */}
      <EmergencyOverlay
        isOpen={!!sos}
        level={sos?.level || 'high'}
        message={typeof sos === 'string' ? sos : sos?.message}
        onClose={clearSOS}
      />
    </div>
  );
}
