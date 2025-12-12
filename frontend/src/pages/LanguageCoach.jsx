// src/pages/LanguageCoach.jsx
// Chú thích: Language Coach cho HS Việt Nam – luyện nói (STT/TTS), từ vựng, sửa ngữ pháp, dịch/giải thích
import { useState } from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import { useSpeech } from '../hooks/useSpeech';
import { useTTS } from '../hooks/useTTS';
import { useAI } from '../hooks/useAI';

const TARGETS = [
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語 (Japanese)' },
  { code: 'ko', label: '한국어 (Korean)' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
];

function Tabs({ tab, setTab }) {
  const items = [
    { k: 'speak', label: 'Nói' },
    { k: 'vocab', label: 'Từ vựng' },
    { k: 'grammar', label: 'Sửa ngữ pháp' },
    { k: 'translate', label: 'Dịch/Giải thích' },
  ];
  return (
    <div className="inline-flex rounded-lg border border-[--surface-border] bg-[--surface]">
      {items.map((i) => (
        <button key={i.k} onClick={() => setTab(i.k)} className={`px-4 py-2 text-sm rounded-lg ${tab === i.k ? 'bg-brand text-[--brand-foreground]' : 'text-[--text]'}`}>{i.label}</button>
      ))}
    </div>
  );
}

export default function LanguageCoach() {
  const [target, setTarget] = useState('en');
  const [tab, setTab] = useState('speak');

  const speech = useSpeech({ lang: 'vi-VN' });
  const { play, stop, speaking } = useTTS('vi-VN');
  const { sendMessage, messages } = useAI();

  const [input, setInput] = useState('');
  const [text, setText] = useState('');

  const coachPrefix = (mode, t) => `Bạn là Language Coach. Ngôn ngữ đích: ${t}. Chế độ: ${mode}. Hãy phản hồi ngắn gọn, thân thiện với học sinh, kèm 1-2 gợi ý cải thiện.`;

  const onSpeakSend = async () => {
    const msg = input.trim();
    if (!msg) return;
    await sendMessage(`${coachPrefix('nói', target)}\nCâu của mình: ${msg}`);
    setInput('');
  };

  const onVocabGen = async () => {
    const topic = text.trim() || 'school life';
    await sendMessage(`${coachPrefix('từ vựng', target)}\nHãy tạo 5 flashcards về chủ đề: ${topic}. Định dạng: Từ | Nghĩa | Câu ví dụ.`);
  };

  const onGrammarFix = async () => {
    const src = text.trim();
    if (!src) return;
    await sendMessage(`${coachPrefix('sửa ngữ pháp', target)}\nSửa câu sau và giải thích ngắn: ${src}`);
  };

  const onTranslate = async () => {
    const src = text.trim();
    if (!src) return;
    await sendMessage(`${coachPrefix('dịch', target)}\nDịch và giải thích ngắn (từ vựng/ngữ pháp): ${src}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-semibold">🗣️ Language Coach</h2>
        <Select size="sm" value={target} onChange={(e) => setTarget(e.target.value)}>
          {TARGETS.map((t) => (<option key={t.code} value={t.code}>{t.label}</option>))}
        </Select>
      </div>

      <Tabs tab={tab} setTab={setTab} />

      {tab === 'speak' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Input placeholder="Nói/nhập câu của bạn (VI hoặc ngôn ngữ đích)" value={input} onChange={(e) => setInput(e.target.value)} />
            <Button onClick={onSpeakSend} variant="primary">Gửi</Button>
            {speech.supported && (
              <Button variant="ghost" onClick={speech.listening ? speech.stop : speech.start}>{speech.listening ? '⏹️ Dừng' : '🎤 Mic'}</Button>
            )}
            <Button variant="ghost" onClick={speaking ? stop : () => play('Bạn có thể luyện nói với coach nhé!')}>
              {speaking ? '⏹️ Dừng đọc' : '🔊 Nghe hướng dẫn'}
            </Button>
          </div>
          <p className="text-sm text-[--muted]">Mẹo: thử giới thiệu bản thân, hỏi đường, nói về sở thích…</p>
        </div>
      )}

      {tab === 'vocab' && (
        <div className="space-y-3">
          <Textarea placeholder="Chủ đề (vd: school life, food, travel)" value={text} onChange={(e) => setText(e.target.value)} />
          <Button onClick={onVocabGen} variant="secondary">Tạo flashcards</Button>
        </div>
      )}

      {tab === 'grammar' && (
        <div className="space-y-3">
          <Textarea placeholder="Nhập câu cần sửa (ngôn ngữ đích)" value={text} onChange={(e) => setText(e.target.value)} />
          <Button onClick={onGrammarFix} variant="secondary">Sửa ngữ pháp</Button>
        </div>
      )}

      {tab === 'translate' && (
        <div className="space-y-3">
          <Textarea placeholder="Nhập câu/đoạn cần dịch" value={text} onChange={(e) => setText(e.target.value)} />
          <Button onClick={onTranslate} variant="secondary">Dịch & Giải thích</Button>
        </div>
      )}
    </div>
  );
}

