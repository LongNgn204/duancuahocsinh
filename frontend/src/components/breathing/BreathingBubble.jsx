// src/components/breathing/BreathingBubble.jsx
// Chú thích: Breathing v3.0 - Zen mode với glassmorphism, particle effects, enhanced animations
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import GlowOrbs from '../ui/GlowOrbs';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { toDayStr } from '../../utils/gratitude';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Settings, Flame, Wind, Sparkles } from 'lucide-react';
import RandomWellnessCard from './RandomWellnessCard';

const STORAGE_KEY = 'breathing_sessions_v1';

// Breathing patterns
const PATTERNS = {
  easy: {
    label: 'Nhẹ nhàng',
    code: '4-4-4',
    phases: ['inhale', 'hold', 'exhale'],
    durations: { inhale: 4, hold: 4, exhale: 4 },
    icon: Wind,
    description: 'Phù hợp cho người mới bắt đầu',
  },
  four_seven_eight: {
    label: 'Thư giãn sâu',
    code: '4-7-8',
    phases: ['inhale', 'hold', 'exhale'],
    durations: { inhale: 4, hold: 7, exhale: 8 },
    icon: Sparkles,
    description: 'Giảm lo âu, hỗ trợ giấc ngủ',
  },
  box: {
    label: 'Box Breathing',
    code: '4-4-4-4',
    phases: ['inhale', 'hold', 'exhale', 'hold2'],
    durations: { inhale: 4, hold: 4, exhale: 4, hold2: 4 },
    icon: Flame,
    description: 'Tập trung và tỉnh táo',
  },
};

function useBeep(enabled) {
  const ctxRef = useRef(null);
  useEffect(() => {
    if (!enabled) return;
    ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      try { ctxRef.current?.close(); } catch (_) { }
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
      gain.gain.exponentialRampToValueAtTime(0.15, now + 0.02);
      osc.start();
      osc.stop(now + ms / 1000);
    } catch (_) { }
  };
  return beep;
}

// Phase labels and colors
const phaseConfig = {
  inhale: { label: 'Hít vào', emoji: '🌬️', color: 'from-teal-400 to-cyan-400' },
  hold: { label: 'Giữ', emoji: '⏸️', color: 'from-purple-400 to-pink-400' },
  hold2: { label: 'Giữ', emoji: '⏸️', color: 'from-purple-400 to-pink-400' },
  exhale: { label: 'Thở ra', emoji: '😮‍💨', color: 'from-amber-400 to-orange-400' },
};

export default function BreathingBubble() {
  const reduced = useReducedMotion();
  const [patternKey, setPatternKey] = useState('easy');
  const [phase, setPhase] = useState('inhale');
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [tickMs, setTickMs] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [showSettings, setShowSettings] = useState(false);

  const sessionTimers = useRef({ phase: null, tick: null, second: null });
  const beep = useBeep(soundOn && !reduced);

  // Load sessions
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      if (Array.isArray(list)) setSessions(list);
    } catch (_) { }
  }, []);

  const pattern = PATTERNS[patternKey];
  const phases = pattern.phases;
  const durations = pattern.durations;

  const curPhaseSeconds = durations[phase] || 4;
  const curPhaseMs = curPhaseSeconds * 1000;
  const phaseProgress = Math.min(tickMs / curPhaseMs, 1);

  const currentPhaseConfig = phaseConfig[phase];

  // Bubble sizes
  const bubbleSize = useMemo(() => ({
    inhale: { scale: 1.3, size: 220 },
    hold: { scale: 1.2, size: 200 },
    exhale: { scale: 0.8, size: 140 },
    hold2: { scale: 1.2, size: 200 },
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

  // Calculate streak
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

  // Control loop
  useEffect(() => {
    const clearAll = () => {
      const { phase, tick, second } = sessionTimers.current;
      if (phase) clearInterval(phase);
      if (tick) clearInterval(tick);
      if (second) clearInterval(second);
      sessionTimers.current = { phase: null, tick: null, second: null };
    };
    clearAll();

    if (!running) return;

    sessionTimers.current.phase = setInterval(() => {
      setPhase((prev) => nextPhase(prev));
      setTickMs(0);
      beep(600, 120);
    }, curPhaseMs);

    sessionTimers.current.tick = setInterval(() => setTickMs((v) => Math.min(v + 100, curPhaseMs)), 100);
    sessionTimers.current.second = setInterval(() => setElapsed((s) => s + 1), 1000);

    return clearAll;
  }, [running, patternKey, phase, curPhaseMs]);

  // Save session on stop
  const prevRunning = useRef(false);
  useEffect(() => {
    if (prevRunning.current && !running && elapsed > 0) {
      const rec = { ts: new Date().toISOString(), seconds: elapsed, pattern: patternKey };
      const next = [...sessions, rec];
      setSessions(next);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (_) { }
      beep(500, 140);
    }
    prevRunning.current = running;
  }, [running]);

  // Format time
  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-[70vh] relative">
      {/* Background effects */}
      <GlowOrbs className="opacity-30" />

      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              <span className="gradient-text">Góc An Yên</span> 🧘
            </h1>
            <p className="text-[--muted] text-sm mt-1">Thở có ý thức, sống trọn vẹn hơn</p>
          </div>
          <Badge variant="primary" icon={<Flame size={14} />}>
            Streak: {streak} ngày
          </Badge>
        </motion.div>

        {/* Pattern Selector */}
        <Card size="none" className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[--text]">Chọn Pattern</h3>
            <button
              onClick={() => setSoundOn(!soundOn)}
              className={`p-2 rounded-xl transition-colors ${soundOn ? 'bg-[--brand]/20 text-[--brand]' : 'text-[--muted] hover:bg-[--surface-border]'}`}
              aria-label={soundOn ? 'Tắt âm thanh' : 'Bật âm thanh'}
            >
              {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {Object.entries(PATTERNS).map(([key, p]) => {
              const Icon = p.icon;
              const isActive = patternKey === key;
              return (
                <motion.button
                  key={key}
                  onClick={() => {
                    setPatternKey(key);
                    setPhase(p.phases[0]);
                    setTickMs(0);
                  }}
                  className={`
                    relative p-4 rounded-2xl text-left transition-all
                    ${isActive ? 'glass-strong ring-2 ring-[--brand]' : 'glass hover:bg-[--glass-bg-strong]'}
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className={`w-6 h-6 mb-2 ${isActive ? 'text-[--brand]' : 'text-[--muted]'}`} />
                  <div className="font-semibold text-sm text-[--text]">{p.label}</div>
                  <div className="text-xs text-[--muted]">{p.code}</div>
                </motion.button>
              );
            })}
          </div>
          <p className="text-xs text-[--muted] mt-3 text-center">{pattern.description}</p>
        </Card>

        {/* Main Breathing Area */}
        <Card variant="gradient" size="lg" className="relative overflow-hidden">
          {/* Animated background rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border border-[--brand]/10"
                animate={{
                  width: running ? [200 + i * 80, 280 + i * 80, 200 + i * 80] : 200 + i * 80,
                  height: running ? [200 + i * 80, 280 + i * 80, 200 + i * 80] : 200 + i * 80,
                  opacity: running ? [0.3, 0.1, 0.3] : 0.1,
                }}
                transition={{
                  duration: curPhaseSeconds,
                  repeat: running ? Infinity : 0,
                  delay: i * 0.5,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 flex flex-col items-center py-8">
            {/* Phase indicator */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Badge
                variant="primary"
                size="lg"
                className={`bg-gradient-to-r ${currentPhaseConfig.color} text-white border-0`}
              >
                {currentPhaseConfig.emoji} {currentPhaseConfig.label}
              </Badge>
            </motion.div>

            {/* Breathing Bubble */}
            <div className="relative">
              <motion.div
                className="rounded-full bg-gradient-to-br from-[--brand] to-[--brand-light] shadow-2xl"
                animate={{
                  width: bubbleSize[phase].size,
                  height: bubbleSize[phase].size,
                  scale: running ? bubbleSize[phase].scale : 1,
                }}
                transition={{
                  duration: Math.max(0.6, curPhaseSeconds * 0.8),
                  ease: 'easeInOut'
                }}
                style={{
                  boxShadow: running ? '0 0 60px rgba(13, 148, 136, 0.4), 0 0 100px rgba(13, 148, 136, 0.2)' : '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}
              >
                {/* Inner glow */}
                <div className="absolute inset-4 rounded-full bg-white/20" />

                {/* Center content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-4xl font-bold">
                      {Math.ceil(curPhaseSeconds - (tickMs / 1000))}
                    </div>
                    <div className="text-xs opacity-80 mt-1">giây</div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Progress bar */}
            <div className="mt-8 w-full max-w-xs">
              <div className="h-2 bg-[--surface-border] rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${currentPhaseConfig.color}`}
                  style={{ width: `${phaseProgress * 100}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-[--muted]">
                <span>Đã thở: {formatTime(elapsed)}</span>
                <span>Phase {Math.round(phaseProgress * curPhaseSeconds)}s / {curPhaseSeconds}s</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={reset}
                disabled={elapsed === 0}
              >
                <RotateCcw size={20} />
              </Button>

              <Button
                variant={running ? 'secondary' : 'primary'}
                size="xl"
                onClick={running ? pause : start}
                icon={running ? <Pause size={22} /> : <Play size={22} />}
                className="px-8"
              >
                {running ? 'Tạm dừng' : elapsed === 0 ? 'Bắt đầu' : 'Tiếp tục'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Random Wellness Card */}
        <RandomWellnessCard 
          onActionTaken={(card) => {
            console.log('[Breathing] Action taken:', card.id);
            // Có thể thêm XP hoặc notification ở đây
          }}
        />

        {/* Tips */}
        <Card size="md">
          <div className="text-center">
            <p className="text-[--text-secondary] text-sm">
              💡 <strong>Mẹo:</strong> Thực hành đều đặn mỗi ngày sẽ giúp bạn kiểm soát căng thẳng tốt hơn.
              Chỉ cần 5 phút mỗi ngày!
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
