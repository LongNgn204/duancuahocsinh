// src/components/gratitude/GratitudeJar.jsx
// Chú thích: Gratitude v4.0 - Mind Garden Gamification & Deep Reflection
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import GlowOrbs from '../ui/GlowOrbs';
import { toDayStr, computeStreakFromEntries } from '../../utils/gratitude';
import {
  Plus, Download, Search, Filter, X, Sparkles,
  Heart, Calendar, Tag, Flame, ChevronDown, Sprout, Flower, Trees, RefreshCw
} from 'lucide-react';

const STORAGE_KEY = 'gratitude';

// Deep reflection prompts instead of simple tags
const REFLECTIVE_PROMPTS = [
  "Điều gì đã khiến bạn mỉm cười hôm nay?",
  "Một bài học nhỏ bạn nhận ra từ khó khăn?",
  "Ai đó đã giúp đỡ bạn thầm lặng?",
  "Một vẻ đẹp của thiên nhiên bạn đã để ý?",
  "Một món ăn ngon mà bạn đã thưởng thức?",
  "Một việc tốt bạn đã làm cho người khác?",
  "Một khoảnh khắc bình yên trong ngày?",
  "Một kỹ năng cá nhân bạn đang tiến bộ?",
];

// Garden Visual Assets (Simple Emoji/SVG representation for now)
const FLOWERS = ['🌻', '🌷', '🪷', '🌹', '🌺', '🌸', '🌼', '💐'];
const TREES = ['🌱', '🪴', '🌳', '🌲']; // Levels of growth

function getFlower(id) {
  // Deterministic flower based on ID
  return FLOWERS[id % FLOWERS.length];
}

function getTreeLevel(streak) {
  if (streak < 3) return 0; // Sprout
  if (streak < 10) return 1; // Pot
  if (streak < 30) return 2; // Tree
  return 3; // Old Tree
}

// Entry card component
function EntryCard({ entry, style }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: style?.rotate || 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.02, rotate: 0, y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="interactive" className="relative overflow-hidden group">
        <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-100 transition-opacity text-2xl">
          {getFlower(entry.id)}
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between text-xs text-[--muted] mb-3">
            <div className="flex items-center gap-2">
              <Calendar size={12} />
              {toDayStr(new Date(entry.date))}
            </div>
            {entry.tag && (
              <Badge variant="secondary" size="sm">
                #{entry.tag}
              </Badge>
            )}
          </div>
          <p className="text-[--text] leading-relaxed whitespace-pre-wrap">
            {entry.text}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}

// MIND GARDEN COMPONENT
function MindGardenView({ entries, streak }) {
  const treeLevel = getTreeLevel(streak);
  const TreeIcon = TREES[treeLevel];

  // Visualize last 20 entries as flowers
  const gardenEntries = entries.slice(-20);

  return (
    <Card variant="gradient" className="min-h-[300px] relative overflow-hidden flex flex-col items-center justify-end pb-8">
      {/* Sky & Sun */}
      <div className="absolute top-4 right-8">
        <motion.div
          className="text-6xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        >
          ☀️
        </motion.div>
      </div>

      {/* Main Tree (Streak) */}
      <motion.div
        className="relative z-10 text-[8rem] md:text-[10rem] drop-shadow-2xl mb-4 text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring' }}
      >
        {TreeIcon}
        <div className="text-base font-bold bg-white/80 backdrop-blur px-3 py-1 rounded-full absolute -bottom-4 left-1/2 -translate-x-1/2 shadow-sm whitespace-nowrap">
          Cấp độ {treeLevel + 1}
        </div>
      </motion.div>

      {/* Grass Field */}
      <div className="w-full flex flex-wrap justify-center items-end gap-2 px-4 z-20 mt-8">
        {gardenEntries.map((e, i) => (
          <motion.div
            key={e.id}
            className="text-3xl cursor-help relative group"
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.5, y: -10 }}
            title={e.text}
          >
            {getFlower(e.id)}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-black/80 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
              {e.text.slice(0, 60)}...
            </div>
          </motion.div>
        ))}
      </div>

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-green-500/20 to-transparent" />
    </Card>
  );
}

export default function GratitudeJar() {
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState('');
  const [tag, setTag] = useState('');
  const [filter, setFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('garden'); // 'garden' || 'list'
  const [prompt, setPrompt] = useState(REFLECTIVE_PROMPTS[0]);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      setEntries(Array.isArray(list) ? list : []);
    } catch (_) {
      setEntries([]);
    }
  }, []);

  const save = (list) => {
    setEntries(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (_) { }
  };

  const addEntry = () => {
    const t = text.trim();
    if (!t) return;
    const newEntry = {
      id: Date.now(),
      text: t,
      tag: tag.trim() || undefined,
      date: new Date().toISOString(),
    };
    const next = [...entries, newEntry];
    save(next);
    setText('');
    setTag('');
    setShowForm(false);
    shufflePrompt();
  };

  const shufflePrompt = () => {
    const random = REFLECTIVE_PROMPTS[Math.floor(Math.random() * REFLECTIVE_PROMPTS.length)];
    setPrompt(random);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gratitude-${toDayStr(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const streak = useMemo(() => computeStreakFromEntries(entries), [entries]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return entries
      .filter((e) => (q ? e.text.toLowerCase().includes(q) : true))
      .slice()
      .reverse();
  }, [entries, filter]);

  return (
    <div className="min-h-[70vh] relative">
      <GlowOrbs className="opacity-30" />

      <div className="relative z-10 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <span className="text-3xl">🏺</span>
              <span className="gradient-text">Vườn Tâm Trí</span>
            </h1>
            <p className="text-[--muted] text-sm mt-1">
              Nuôi dưỡng khu vườn tâm hồn bằng lòng biết ơn mỗi ngày
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/50 backdrop-blur rounded-2xl p-1 border border-[--surface-border]">
            <button
              onClick={() => setViewMode('garden')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${viewMode === 'garden' ? 'bg-white shadow text-[--brand]' : 'text-[--muted] hover:text-[--text]'}`}
            >
              Khu vườn
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white shadow text-[--brand]' : 'text-[--muted] hover:text-[--text]'}`}
            >
              Nhật ký
            </button>
          </div>
        </div>

        {/* VIEW: GARDEN */}
        {viewMode === 'garden' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <MindGardenView entries={entries} streak={streak} />
            <div className="mt-4 flex justify-between items-center px-4">
              <div className="text-sm text-[--muted]">
                Streak hiện tại: <span className="font-bold text-[--brand]">{streak} ngày</span> 🔥
              </div>
              <Button
                size="lg"
                onClick={() => setShowForm(true)}
                className="shadow-xl"
                icon={<Plus size={18} />}
              >
                Gieo hạt giống mới
              </Button>
            </div>
          </motion.div>
        )}

        {/* INPUT FORM (Modal or Expandable) */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card variant="highlight" size="lg" className="border-2 border-[--brand]/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-[--brand]" size={20} />
                    <h3 className="font-semibold text-lg italic text-[--text-secondary]">"{prompt}"</h3>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={shufflePrompt} className="p-2 hover:bg-black/5 rounded-full" title="Đổi câu hỏi">
                      <RefreshCw size={16} />
                    </button>
                    <button onClick={() => setShowForm(false)} className="p-2 hover:bg-black/5 rounded-full">
                      <X size={16} />
                    </button>
                  </div>
                </div>

                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Chia sẻ suy nghĩ của bạn..."
                  rows={4}
                  className="w-full p-4 rounded-xl glass border-0 focus:ring-2 focus:ring-[--ring] resize-none text-[--text] placeholder:text-[--muted] text-lg"
                  autoFocus
                />

                <div className="mt-4 flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setShowForm(false)}>Huỷ</Button>
                  <Button onClick={addEntry} disabled={!text.trim()}>Lưu vào vườn</Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* VIEW: LIST */}
        {viewMode === 'list' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <Card size="sm">
              <div className="flex items-center gap-2 glass rounded-xl px-3 py-2">
                <Search size={16} className="text-[--muted]" />
                <input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Tìm kiếm ký ức..."
                  className="flex-1 bg-transparent outline-none text-sm text-[--text] placeholder:text-[--muted]"
                />
              </div>
            </Card>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((e, idx) => (
                <EntryCard key={e.id} entry={e} style={{}} />
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-[--muted] col-span-full py-12">Chưa có ký ức nào.</p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
