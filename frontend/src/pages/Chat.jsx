// src/pages/Chat.jsx
// Chú thích: Chat Pro UI v2 – 2-pane (danh sách hội thoại + thread),
// mic + visualizer, TTS, markdown, đính kèm ảnh, timestamps, avatars, feedback 👍/👎
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAI } from '../hooks/useAI';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Button from '../components/ui/Button';
import { useSpeech } from '../hooks/useSpeech';
import MicVisualizer from '../components/chat/MicVisualizer';
import { useTTS } from '../hooks/useTTS';
import ChatList from '../components/chat/ChatList';

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
  const bg = isUser ? 'bg-brand/20 text-brand' : 'bg-[--surface] text-[--text] border border-[--surface-border]';
  const label = isUser ? '🧑' : '🤖';
  return (
    <div className={`w-8 h-8 rounded-full grid place-items-center text-base ${bg}`} aria-hidden>
      {label}
    </div>
  );
}

function Feedback({ value, onUp, onDown }) {
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={onUp} aria-label="Hài lòng" className={value === 'up' ? 'text-brand' : 'text-[--muted] hover:text-[--text]'}>👍</button>
      <button type="button" onClick={onDown} aria-label="Chưa hài lòng" className={value === 'down' ? 'text-brand' : 'text-[--muted] hover:text-[--text]'}>👎</button>
    </div>
  );
}

function Bubble({ role, children, onCopy, onPlayTTS, onStopTTS, speaking, ts, feedbackUI }) {
  const isUser = role === 'user';
  return (
    <div className={`flex items-start gap-2 ${isUser ? 'justify-end flex-row-reverse' : ''}`} role="listitem">
      <Avatar role={role} />
      <div className="min-w-0 max-w-[78%]">
        <div
          className={`rounded-2xl px-4 py-2 shadow-sm text-[15px] leading-relaxed relative ${
            isUser
              ? 'bg-[--brand] text-[--brand-foreground] rounded-br-sm'
              : 'bg-[--surface] text-[--text] rounded-bl-sm border border-[--surface-border]'
          }`}
        >
          {children}
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-[--muted]">
          <span>{formatTime(ts)}</span>
          {!isUser && (
            <>
              <button type="button" onClick={onCopy} className="hover:text-[--text]">Sao chép</button>
              <button type="button" onClick={speaking ? onStopTTS : onPlayTTS} className="hover:text-[--text]">
                {speaking ? '⏹️ Dừng' : '🔊 Đọc'}
              </button>
              {feedbackUI}
            </>
          )}
        </div>
      </div>
    </div>
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
  const [images, setImages] = useState([]); // dataURL[]
  const [info, setInfo] = useState('');
  const endRef = useRef(null);
  const inputRef = useRef(null);

  // Mic
  const speech = useSpeech({ lang: 'vi-VN' });
  useEffect(() => {
    if (speech.text) setText((t) => (t ? `${t} ${speech.text}` : speech.text));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speech.text]);

  // TTS
  const { play, stop, speaking } = useTTS('vi-VN');

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, sos, currentId]);

  // aria-live polite cho tin mới từ assistant
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

  return (
    <div className="min-h-[70vh] grid md:grid-cols-[18rem_1fr] gap-4" role="main" aria-label="Khu vực trò chuyện">
      {/* A11y live region */}
      <div aria-live="polite" aria-atomic="false" className="sr-only" ref={liveRegionRef} />

      {/* Left: conversation list (hidden on mobile) */}
      <div className="hidden md:block">
        <ChatList
          threads={threads}
          currentId={currentId}
          onNew={() => { newChat(); setText(''); setImages([]); }}
          onSelect={(id) => setCurrentThread(id)}
          onRename={(id, name) => renameChat(id, name)}
          onDelete={(id) => deleteChat(id)}
        />
      </div>

      {/* Right: thread */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-[--muted]">{threads.find(t => t.id === currentId)?.title || 'Chat'}</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={clearChat}>Xoá hội thoại</Button>
            <Button variant="primary" size="sm" onClick={() => { newChat(); setText(''); setImages([]); }}>+ Chat mới</Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1 border border-[--surface-border] bg-[--surface] rounded-xl p-3" role="list" aria-label="Tin nhắn">
          {messages.map((m, i) => (
            <Bubble
              key={i}
              role={m.role}
              ts={m.ts}
              onCopy={() => onCopyMsg(m.content)}
              onPlayTTS={() => m.role === 'assistant' && play(m.content)}
              onStopTTS={stop}
              speaking={speaking}
              feedbackUI={
                m.role === 'assistant' ? (
                  <Feedback
                    value={m.feedback}
                    onUp={() => { setFeedback(i, 'up'); setInfo('Cảm ơn phản hồi!'); setTimeout(()=>setInfo(''), 1200); }}
                    onDown={() => { setFeedback(i, 'down'); setInfo('Đã ghi nhận!'); setTimeout(()=>setInfo(''), 1200); }}
                  />
                ) : null
              }
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]} linkTarget="_blank">
                {m.content}
              </ReactMarkdown>
            </Bubble>
          ))}
          {loading && (
            <div className="text-sm text-[--muted]">Đang gõ…</div>
          )}
          <div ref={endRef} />
        </div>

        {/* Mic Visualizer & Attachments */}
        <div className="mt-2 flex items-center gap-3">
          {speech.supported && (
            <div className="flex items-center gap-2">
              <MicVisualizer active={speech.listening} height={36} bars={24} />
              <span className="text-xs text-[--muted]">{speech.listening ? 'Đang nghe…' : 'Mic tắt'}</span>
            </div>
          )}
          {!!images.length && (
            <div className="flex gap-2 flex-wrap">
              {images.map((src, idx) => (
                <img key={idx} src={src} alt="preview" loading="lazy" className="w-10 h-10 object-cover rounded-lg border" />)
              )}
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className="mt-1 min-h-5 text-xs text-[--muted]">{info}</div>
        <form onSubmit={onSubmit} className="mt-1 grid grid-cols-[1fr_auto] gap-2" aria-label="Gửi tin nhắn">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Chia sẻ điều bạn đang nghĩ… (Markdown, mic, ảnh)"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[--ring]"
              aria-label="Ô nhập tin nhắn"
            />
            <input type="file" accept="image/*" onChange={onPickImages} aria-label="Đính kèm ảnh" />
          </div>
          <div className="flex items-center gap-2">
            {speech.supported && (
              <Button type="button" variant="ghost" size="sm" onClick={speech.listening ? speech.stop : speech.start} aria-label="Ghi âm">
                {speech.listening ? '⏹️ Dừng' : '🎤 Mic'}
              </Button>
            )}
            <Button type="button" variant="outline" size="sm" onClick={onResendLast} aria-label="Gửi lại tin cuối">
              Gửi lại
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => { if (lastUserText) { setText(lastUserText); inputRef.current?.focus(); } }} aria-label="Sửa tin cuối">
              Sửa
            </Button>
            <Button type="submit" variant="secondary" size="md" disabled={loading} aria-label="Gửi">
              Gửi
            </Button>
          </div>
        </form>
      </div>

      {/* SOS Overlay */}
      {sos && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50 p-4" role="dialog" aria-modal="true" aria-label="Cảnh báo SOS">
          <div className="max-w-md w-full rounded-2xl bg-[--surface] text-[--text] border border-[--surface-border] p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-danger">Tín hiệu SOS</h3>
            <p className="mt-2 whitespace-pre-wrap">{sos}</p>
            <div className="mt-4 flex justify-end gap-2">
              <Button onClick={clearSOS} variant="outline" size="sm">Đóng</Button>
              <a className="px-3 py-1.5 rounded-lg bg-danger text-gray-900" href="tel:111">Gọi 111</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
