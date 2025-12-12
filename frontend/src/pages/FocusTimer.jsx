// src/pages/FocusTimer.jsx
// Chú thích: Focus Timer (Pomodoro) đơn giản cho HS – 25/5, start/pause/reset, ambient toggle
import { useEffect, useRef, useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const PRESETS = [
  { label: 'Pomodoro 25/5', focus: 25, breakM: 5 },
  { label: 'Short 20/5', focus: 20, breakM: 5 },
  { label: 'Deep 45/10', focus: 45, breakM: 10 },
];

export default function FocusTimer() {
  const [focusM, setFocusM] = useState(25);
  const [breakM, setBreakM] = useState(5);
  const [phase, setPhase] = useState('focus'); // focus | break
  const [seconds, setSeconds] = useState(focusM * 60);
  const [running, setRunning] = useState(false);
  const [ambient, setAmbient] = useState(false);
  const intRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    setSeconds((phase === 'focus' ? focusM : breakM) * 60);
  }, [focusM, breakM, phase]);

  useEffect(() => {
    if (!running) return;
    intRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          // chuông nhỏ
          try { audioRef.current?.play(); } catch (_) {}
          setPhase((p) => (p === 'focus' ? 'break' : 'focus'));
          return (phase === 'focus' ? breakM : focusM) * 60;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phase, focusM, breakM]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-semibold">⏱️ Focus Timer</h2>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((p) => (
            <Button key={p.label} variant="outline" size="sm" onClick={() => { setFocusM(p.focus); setBreakM(p.breakM); setPhase('focus'); setSeconds(p.focus*60); }}>
              {p.label}
            </Button>
          ))}
          <label className="ml-auto text-sm text-[--muted] flex items-center gap-2">
            <input type="checkbox" checked={ambient} onChange={(e) => setAmbient(e.target.checked)} />
            Âm thanh nền nhẹ
          </label>
        </div>
      </Card>

      <Card className="p-8 grid place-items-center">
        <div className="text-sm text-[--muted] mb-2">Pha hiện tại: {phase === 'focus' ? 'Tập trung' : 'Nghỉ ngắn'}</div>
        <div className="text-6xl font-bold tracking-wider">{mm}:{ss}</div>
        <div className="mt-6 flex gap-3">
          {!running ? (
            <Button variant="primary" onClick={() => setRunning(true)}>Bắt đầu</Button>
          ) : (
            <Button variant="secondary" onClick={() => setRunning(false)}>Tạm dừng</Button>
          )}
          <Button variant="outline" onClick={() => { setRunning(false); setPhase('focus'); setSeconds(focusM*60); }}>Reset</Button>
        </div>
      </Card>

      {/* Âm báo chu kỳ */}
      <audio ref={audioRef} src="data:audio/mp3;base64,//uQZAAAAAAAAAAAAAAAAAAAA..." preload="auto" />
      {/* Ghi chú: placeholder data URL rút gọn; có thể thay bằng file âm báo thực tế */}
    </div>
  );
}

