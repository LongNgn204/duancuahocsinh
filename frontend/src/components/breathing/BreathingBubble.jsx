// src/components/breathing/BreathingBubble.jsx
// Chú thích: Breathing Pro – chọn pattern (4-4-4, 4-7-8, box), âm thanh nhịp, reduced-motion fallback,
// lịch sử session + streak. Dùng Card/Button cho UI thống nhất.
import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { toDayStr } from '../../utils/gratitude';

const STORAGE_KEY = 'breathing_sessions_v1';

// Định nghĩa pattern và các pha
const PATTERNS = {
  easy: {
    label: '4-4-4',
    phases: ['inhale', 'hold', 'exhale'],
    durations: { inhale: 4, hold: 4, exhale: 4 }, // giây
  },
  four_seven_eight: {
    label: '4-7-8',
    phases: ['inhale', 'hold', 'exhale'],
    durations: { inhale: 4, hold: 7, exhale: 8 },
  },
  box: {
    label: 'Box 4-4-4-4',
    phases: ['inhale', 'hold', 'exhale', 'hold2'],
    durations: { inhale: 4, hold: 4, exhale: 4, hold2: 4 },
  },
};

function useBeep(enabled) {
  const ctxRef = useRef(null);
  useEffect(() => {
    if (!enabled) return;
    // tạo AudioContext lazy
    ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      try { ctxRef.current?.close(); } catch (_) {}
    };
  }, [enabled]);

  const beep = (freq = 660, ms = 140) => {
    if (!enabled || !ctxRef.current) return;
    try {
      const ctx = ctxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0.0001;
      osc.connect(gain).connect(ctx.destination);
      const now = ctx.currentTime;
      gain.gain.exponentialRampToValueAtTime(0.2, now + 0.02);
      osc.start();
      osc.stop(now + ms / 1000);
    } catch (_) {}
  };
  return beep;
}

export default function BreathingBubble() {
  const reduced = useReducedMotion();
  const [patternKey, setPatternKey] = useState('easy');
  const [phase, setPhase] = useState('inhale');
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // giây đã trôi qua trong session
  const [tickMs, setTickMs] = useState(0); // ms trong pha hiện tại
  const [soundOn, setSoundOn] = useState(false);
  const [sessions, setSessions] = useState([]); // {ts, seconds, pattern}

  const sessionTimers = useRef({ phase: null, tick: null, second: null });
  const beep = useBeep(soundOn && !reduced);

  // Đọc lịch sử
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      if (Array.isArray(list)) setSessions(list);
    } catch (_) {}
  }, []);

  const pattern = PATTERNS[patternKey];
  const phases = pattern.phases;
  const durations = pattern.durations; // giây

  const curPhaseSeconds = durations[phase] || 4;
  const curPhaseMs = curPhaseSeconds * 1000;
  const phaseProgress = Math.min(tickMs / curPhaseMs, 1);

  // Label theo pha
  const label = phase === 'inhale'
    ? '🌬️ Hít vào...'
    : phase === 'exhale'
      ? '😮‍💨 Thở ra...'
      : '⏸️ Giữ...';

  // Kích thước bong bóng (điều chỉnh nhẹ theo pha để tạo cảm giác nhịp)
  const bubbleSize = useMemo(() => ({
    inhale: 240,
    hold: 220,
    exhale: 140,
    hold2: 220,
  }), []);

  const nextPhase = (p) => {
    const i = phases.indexOf(p);
    return phases[(i + 1) % phases.length];
  };

  const start = () => {
    if (running) return;
    setRunning(true);
    beep(700, 120);
  };
  const pause = () => setRunning(false);
  const reset = () => {
    setRunning(false);
    setElapsed(0);
    setTickMs(0);
    setPhase(phases[0]);
  };

  // Streak từ sessions theo ngày liên tiếp
  const streak = useMemo(() => {
    if (!sessions.length) return 0;
    const days = Array.from(new Set(sessions.map((s) => toDayStr(new Date(s.ts))))).sort((a, b) => (a < b ? 1 : -1));
    let count = 0;
    let cur = toDayStr(new Date());
    for (const d of days) {
      const a = new Date(cur);
      const b = new Date(d);
      const diff = Math.round((Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()) - Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())) / 86400000);
      if (diff === 0 || diff === 1) {
        count += 1;
      } else {
        break;
      }
      cur = d;
    }
    return count;
  }, [sessions]);

  // Điều khiển vòng lặp khi running thay đổi
  useEffect(() => {
    const clearAll = () => {
      const { phase, tick, second } = sessionTimers.current;
      if (phase) clearInterval(phase);
      if (tick) clearInterval(tick);
      if (second) clearInterval(second);
      sessionTimers.current = { phase: null, tick: null, second: null };
    };
    clearAll();

    if (!running) return; // pause

    // đổi pha sau curPhaseMs
    sessionTimers.current.phase = setInterval(() => {
      setPhase((prev) => nextPhase(prev));
      setTickMs(0);
      beep(600, 120);
    }, curPhaseMs);

    // tick hiển thị progress
    sessionTimers.current.tick = setInterval(() => setTickMs((v) => Math.min(v + 100, curPhaseMs)), 100);

    // đếm giây toàn phiên
    sessionTimers.current.second = setInterval(() => setElapsed((s) => s + 1), 1000);

    return clearAll;
  }, [running, patternKey, phase, curPhaseMs]);

  // Khi dừng (từ running=true -> false) và có thời lượng >0, lưu session
  const prevRunning = useRef(false);
  useEffect(() => {
    if (prevRunning.current && !running && elapsed > 0) {
      const rec = { ts: new Date().toISOString(), seconds: elapsed, pattern: patternKey };
      const next = [...sessions, rec];
      setSessions(next);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (_) {}
      beep(500, 140);
    }
    prevRunning.current = running;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  // Nếu reduced-motion: không animate; chỉ hiển thị nhãn và đồng hồ
  const bubble = reduced ? (
    <div className="w-52 h-52 rounded-full bg-gradient-to-br from-blue-400 to-purple-300 shadow-xl" aria-label={`Breathing bubble ${phase}`} />
  ) : (
    <motion.div
      aria-label={`Breathing bubble ${phase}`}
      className="rounded-full bg-gradient-to-br from-blue-400 to-purple-300 shadow-xl"
      animate={{ width: bubbleSize[phase], height: bubbleSize[phase] }}
      transition={{ duration: Math.max(0.6, curPhaseSeconds * 0.6), ease: 'easeInOut' }}
    />
  );

  return (
    <div className="min-h-[70vh] w-full">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">🧘 Thở có ý thức</h2>
          <div className="text-sm text-gray-600">Streak: {streak} ngày</div>
        </div>

        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-gray-700">Pattern:</label>
            <select
              value={patternKey}
              onChange={(e) => { setPatternKey(e.target.value); setPhase(PATTERNS[e.target.value].phases[0]); setTickMs(0); }}
              className="px-3 py-2 border rounded-lg"
              aria-label="Chọn pattern"
            >
              {Object.entries(PATTERNS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={soundOn} onChange={(e) => setSoundOn(e.target.checked)} />
              Âm thanh nhịp
            </label>
            <div className="ml-auto flex gap-2">
              {!running ? (
                <Button onClick={start} variant="primary">{elapsed === 0 ? 'Bắt đầu' : 'Tiếp tục'}</Button>
              ) : (
                <Button onClick={pause} variant="secondary">Tạm dừng</Button>
              )}
              <Button onClick={reset} variant="outline">Reset</Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 grid place-items-center">
          <div className="text-sm text-gray-600 mb-2">Pha: {phase} · {Math.round(phaseProgress * curPhaseSeconds)}s / {curPhaseSeconds}s</div>
          {bubble}
          <p className="mt-8 text-2xl font-light text-gray-800">{label}</p>
          <div className="mt-6 w-72 h-2 bg-secondary/40 rounded-full overflow-hidden">
            <div className="h-full bg-accent" style={{ width: `${phaseProgress * 100}%`, transition: 'width 100ms linear' }} />
          </div>
          <div className="mt-4 text-xs text-gray-500">Đã thở: {elapsed}s</div>
        </Card>
      </div>
    </div>
  );
}
