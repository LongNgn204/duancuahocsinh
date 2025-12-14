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
import { Play, Pause, RotateCcw, Volume2, VolumeX, Settings, Flame, Wind, Sparkles, Mic, Droplet } from 'lucide-react';
import RandomWellnessCard from './RandomWellnessCard';
import EncouragementMessages from './EncouragementMessages';

const STORAGE_KEY = 'breathing_sessions_v1';
const VOICE_SETTINGS_KEY = 'breathing_voice_settings';

// TTS Hook - Sử dụng Web Speech API
function useTTS(enabled, voiceSettings) {
  const synthRef = useRef(null);
  const utteranceRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      // Dừng mọi phát âm khi unmount
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const speak = (text, options = {}) => {
    if (!enabled || !synthRef.current || !text) return;

    // Dừng phát âm hiện tại nếu có
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN'; // Tiếng Việt
    utterance.rate = voiceSettings?.rate || 0.9; // Tốc độ đọc (0.75-1.25)
    utterance.pitch = voiceSettings?.pitch || 1.0; // Cao độ (0-2)
    utterance.volume = voiceSettings?.volume || 0.8; // Âm lượng (0-1)

    // Chọn giọng nói nếu có
    if (voiceSettings?.voiceIndex !== undefined) {
      const voices = synthRef.current.getVoices();
      if (voices[voiceSettings.voiceIndex]) {
        utterance.voice = voices[voiceSettings.voiceIndex];
      }
    }

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const stop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };

  return { speak, stop };
}

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
  bubble: {
    label: 'Bong bóng xanh',
    code: '30s',
    phases: ['inhale', 'exhale'],
    durations: { inhale: 3, exhale: 3 },
    icon: Droplet,
    description: 'Thở theo nhịp bong bóng trong 30 giây',
    duration: 30, // Total duration in seconds
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
  const [voiceOn, setVoiceOn] = useState(false); // TTS hướng dẫn
  const [sessions, setSessions] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [voiceSettings, setVoiceSettings] = useState({
    voiceIndex: null,
    rate: 0.9,
    pitch: 1.0,
    volume: 0.8,
  });

  const sessionTimers = useRef({ phase: null, tick: null, second: null });
  const beep = useBeep(soundOn && !reduced);
  const { speak, stop: stopTTS } = useTTS(voiceOn && running, voiceSettings);

  // Load voice settings
  useEffect(() => {
    try {
      const saved = localStorage.getItem(VOICE_SETTINGS_KEY);
      if (saved) {
        setVoiceSettings(JSON.parse(saved));
      }
    } catch (_) {}
  }, []);

  // Load available voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      };
      loadVoices();
      // Chrome cần load voices async
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  // Save voice settings
  useEffect(() => {
    try {
      localStorage.setItem(VOICE_SETTINGS_KEY, JSON.stringify(voiceSettings));
    } catch (_) {}
  }, [voiceSettings]);

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
      const { phase, tick, second, duration } = sessionTimers.current;
      if (phase) clearInterval(phase);
      if (tick) clearInterval(tick);
      if (second) clearInterval(second);
      if (duration) clearInterval(duration);
      sessionTimers.current = { phase: null, tick: null, second: null, duration: null };
    };
    clearAll();

    if (!running) {
      stopTTS();
      return;
    }

    // Special handling for bubble pattern (30s fixed duration)
    if (patternKey === 'bubble' && pattern.duration) {
      speak('Hãy thở theo nhịp bong bóng. Hít vào khi bong bóng lớn, thở ra khi bong bóng nhỏ.');
      
      // Phase timer for bubble pattern
      sessionTimers.current.phase = setInterval(() => {
        const next = nextPhase(phase);
        setPhase(next);
        setTickMs(0);
        beep(600, 120);
      }, curPhaseMs);

      sessionTimers.current.tick = setInterval(() => setTickMs((v) => Math.min(v + 100, curPhaseMs)), 100);
      sessionTimers.current.second = setInterval(() => setElapsed((s) => s + 1), 1000);
      
      // Stop after 30 seconds
      sessionTimers.current.duration = setTimeout(() => {
        setRunning(false);
        beep(500, 200);
        speak('Hoàn thành! Bạn đã thở xong 30 giây.');
      }, pattern.duration * 1000);

      return clearAll;
    }

    // Phát hướng dẫn khi bắt đầu phase mới
    const phaseInstructions = {
      inhale: 'Hít vào từ từ và sâu',
      hold: 'Giữ hơi thở',
      exhale: 'Thở ra nhẹ nhàng',
      hold2: 'Giữ hơi thở',
    };
    speak(phaseInstructions[phase] || 'Thở');

    sessionTimers.current.phase = setInterval(() => {
      const next = nextPhase(phase);
      setPhase(next);
      setTickMs(0);
      beep(600, 120);
      // Phát hướng dẫn cho phase tiếp theo
      speak(phaseInstructions[next] || 'Thở');
    }, curPhaseMs);

    sessionTimers.current.tick = setInterval(() => setTickMs((v) => Math.min(v + 100, curPhaseMs)), 100);
    sessionTimers.current.second = setInterval(() => setElapsed((s) => s + 1), 1000);

    return clearAll;
  }, [running, patternKey, phase, curPhaseMs, speak, stopTTS, pattern]);

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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setVoiceOn(!voiceOn)}
                className={`p-2 rounded-xl transition-colors ${voiceOn ? 'bg-[--brand]/20 text-[--brand]' : 'text-[--muted] hover:bg-[--surface-border]'}`}
                aria-label={voiceOn ? 'Tắt hướng dẫn giọng nói' : 'Bật hướng dẫn giọng nói'}
                title={voiceOn ? 'Tắt hướng dẫn giọng nói' : 'Bật hướng dẫn giọng nói'}
              >
                <Mic size={18} />
              </button>
              <button
                onClick={() => setSoundOn(!soundOn)}
                className={`p-2 rounded-xl transition-colors ${soundOn ? 'bg-[--brand]/20 text-[--brand]' : 'text-[--muted] hover:bg-[--surface-border]'}`}
                aria-label={soundOn ? 'Tắt âm thanh' : 'Bật âm thanh'}
                title={soundOn ? 'Tắt âm thanh' : 'Bật âm thanh'}
              >
                {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-xl transition-colors ${showSettings ? 'bg-[--brand]/20 text-[--brand]' : 'text-[--muted] hover:bg-[--surface-border]'}`}
                aria-label="Cài đặt giọng nói"
                title="Cài đặt giọng nói"
              >
                <Settings size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

          {/* Voice Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-[--surface-border] space-y-3"
              >
                <h4 className="text-sm font-semibold text-[--text] mb-2">Cài đặt giọng nói</h4>
                
                {/* Voice Selection */}
                {availableVoices.length > 0 && (
                  <div>
                    <label className="block text-xs text-[--muted] mb-1">Chọn giọng</label>
                    <select
                      value={voiceSettings.voiceIndex ?? ''}
                      onChange={(e) => setVoiceSettings({ ...voiceSettings, voiceIndex: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full px-3 py-2 bg-[--bg] border border-[--border] rounded-lg text-sm"
                    >
                      <option value="">Mặc định (hệ thống)</option>
                      {availableVoices.map((voice, idx) => (
                        <option key={idx} value={idx}>
                          {voice.name} {voice.lang}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Rate (Tốc độ) */}
                <div>
                  <label className="block text-xs text-[--muted] mb-1">
                    Tốc độ: {voiceSettings.rate.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.75"
                    max="1.25"
                    step="0.05"
                    value={voiceSettings.rate}
                    onChange={(e) => setVoiceSettings({ ...voiceSettings, rate: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {/* Pitch (Cao độ) */}
                <div>
                  <label className="block text-xs text-[--muted] mb-1">
                    Cao độ: {voiceSettings.pitch.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={voiceSettings.pitch}
                    onChange={(e) => setVoiceSettings({ ...voiceSettings, pitch: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {/* Volume (Âm lượng) */}
                <div>
                  <label className="block text-xs text-[--muted] mb-1">
                    Âm lượng: {Math.round(voiceSettings.volume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={voiceSettings.volume}
                    onChange={(e) => setVoiceSettings({ ...voiceSettings, volume: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
                className={`rounded-full shadow-2xl ${
                  patternKey === 'bubble' 
                    ? 'bg-gradient-to-br from-cyan-400 to-blue-500' 
                    : 'bg-gradient-to-br from-[--brand] to-[--brand-light]'
                }`}
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
                  boxShadow: running 
                    ? patternKey === 'bubble'
                      ? '0 0 60px rgba(34, 211, 238, 0.4), 0 0 100px rgba(59, 130, 246, 0.2)'
                      : '0 0 60px rgba(13, 148, 136, 0.4), 0 0 100px rgba(13, 148, 136, 0.2)'
                    : '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}
              >
                {/* Inner glow */}
                <div className="absolute inset-4 rounded-full bg-white/20" />

                {/* Center content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    {patternKey === 'bubble' ? (
                      <>
                        <div className="text-3xl font-bold">
                          {pattern.duration ? Math.max(0, pattern.duration - elapsed) : Math.ceil(curPhaseSeconds - (tickMs / 1000))}
                        </div>
                        <div className="text-xs opacity-80 mt-1">
                          {pattern.duration ? 'giây còn lại' : 'giây'}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-4xl font-bold">
                          {Math.ceil(curPhaseSeconds - (tickMs / 1000))}
                        </div>
                        <div className="text-xs opacity-80 mt-1">giây</div>
                      </>
                    )}
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

        {/* Encouragement Messages */}
        <EncouragementMessages 
          onMessageShown={(data) => {
            console.log('[Breathing] Message shown:', data);
          }}
        />

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
