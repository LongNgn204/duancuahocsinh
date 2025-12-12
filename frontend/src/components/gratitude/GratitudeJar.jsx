// src/components/gratitude/GratitudeJar.jsx
// Chú thích: Gratitude v3.0 - Modern UI với 3D jar visual, floating cards, enhanced animations
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import GlowOrbs from '../ui/GlowOrbs';
import { toDayStr, computeStreakFromEntries } from '../../utils/gratitude';
import {
  Plus, Download, Search, Filter, X, Sparkles,
  Heart, Calendar, Tag, Flame, ChevronDown
} from 'lucide-react';

const STORAGE_KEY = 'gratitude';
const SUGGESTIONS = [
  { label: 'Gia đình', emoji: '👨‍👩‍👧' },
  { label: 'Bạn bè', emoji: '👫' },
  { label: 'Sức khỏe', emoji: '💪' },
  { label: 'Học tập', emoji: '📚' },
  { label: 'Tự nhiên', emoji: '🌿' },
  { label: 'Âm nhạc', emoji: '🎵' },
];

// Sparkline component
function Sparkline({ entries, days = 14 }) {
  const data = useMemo(() => {
    const today = new Date();
    const arr = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const key = toDayStr(d);
      const has = entries.some((e) => toDayStr(new Date(e.date)) === key);
      arr.push({ day: key, v: has ? 1 : 0 });
    }
    return arr;
  }, [entries, days]);

  return (
    <div className="flex items-end gap-1 h-8">
      {data.map((d, i) => (
        <motion.div
          key={d.day}
          className={`w-2 rounded-full transition-colors ${d.v ? 'bg-gradient-to-t from-[--brand] to-[--brand-light]' : 'bg-[--surface-border]'}`}
          initial={{ height: 4 }}
          animate={{ height: d.v ? 24 : 8 }}
          transition={{ delay: i * 0.03 }}
        />
      ))}
    </div>
  );
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
      <Card variant="interactive" className="relative overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[--brand] via-[--secondary] to-[--accent]" />

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

export default function GratitudeJar() {
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState('');
  const [tag, setTag] = useState('');
  const [filter, setFilter] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [showForm, setShowForm] = useState(false);

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

  const allTags = useMemo(() =>
    Array.from(new Set(entries.map((e) => e.tag).filter(Boolean))),
    [entries]
  );

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const tg = filterTag.trim().toLowerCase();
    return entries
      .filter((e) => (q ? e.text.toLowerCase().includes(q) : true))
      .filter((e) => (tg ? (e.tag || '').toLowerCase() === tg : true))
      .slice()
      .reverse();
  }, [entries, filter, filterTag]);

  // Random rotation for cards
  const getCardStyle = (idx) => ({
    rotate: (idx % 2 === 0 ? 1 : -1) * (Math.random() * 1.5),
  });

  return (
    <div className="min-h-[70vh] relative">
      <GlowOrbs className="opacity-30" />

      <div className="relative z-10 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <span className="text-3xl">🏺</span>
              <span className="gradient-text">Lọ Biết Ơn</span>
            </h1>
            <p className="text-[--muted] text-sm mt-1">
              Ghi lại những điều tốt đẹp mỗi ngày
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Sparkline entries={entries} />
            <Badge variant="primary" icon={<Flame size={14} />} size="lg">
              {streak} ngày streak
            </Badge>
          </div>
        </motion.div>

        {/* Add New Entry */}
        <Card variant="highlight" size="lg">
          <AnimatePresence mode="wait">
            {!showForm ? (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[--accent] to-orange-500 flex items-center justify-center shadow-lg">
                    <Heart className="w-6 h-6 text-white" fill="white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[--text]">Hôm nay bạn biết ơn điều gì?</h3>
                    <p className="text-xs text-[--muted]">Mỗi niềm biết ơn nhỏ tạo nên hạnh phúc lớn</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowForm(true)}
                  icon={<Plus size={18} />}
                >
                  Viết ngay
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[--text]">Điều biết ơn hôm nay</h3>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-2 rounded-lg hover:bg-[--surface-border] text-[--muted]"
                  >
                    <X size={18} />
                  </button>
                </div>

                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Hôm nay mình biết ơn..."
                  rows={3}
                  className="w-full p-4 rounded-xl glass border-0 focus:ring-2 focus:ring-[--ring] resize-none text-[--text] placeholder:text-[--muted]"
                  autoFocus
                />

                {/* Quick suggestions */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <Button
                      key={s.label}
                      variant="ghost"
                      size="sm"
                      onClick={() => setText((t) => (t ? `${t} ${s.label}` : s.label))}
                    >
                      {s.emoji} {s.label}
                    </Button>
                  ))}
                </div>

                {/* Tag input */}
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-2 glass rounded-xl px-3 py-2">
                    <Tag size={16} className="text-[--muted]" />
                    <input
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      placeholder="Thêm tag (tuỳ chọn)"
                      className="flex-1 bg-transparent outline-none text-sm text-[--text] placeholder:text-[--muted]"
                    />
                  </div>
                  <Button onClick={addEntry} disabled={!text.trim()}>
                    Thêm vào lọ
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Filter & Search */}
        <Card size="sm">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="flex-1 flex items-center gap-2 glass rounded-xl px-3 py-2">
              <Search size={16} className="text-[--muted]" />
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Tìm kiếm..."
                className="flex-1 bg-transparent outline-none text-sm text-[--text] placeholder:text-[--muted]"
              />
            </div>

            {/* Tag filter */}
            <div className="relative">
              <div className="flex items-center gap-2 glass rounded-xl px-3 py-2 cursor-pointer">
                <Filter size={16} className="text-[--muted]" />
                <select
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                  className="bg-transparent outline-none text-sm text-[--text] cursor-pointer pr-6 appearance-none"
                >
                  <option value="">Tất cả tags</option>
                  {allTags.map((t) => (
                    <option key={t} value={t}>#{t}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 text-[--muted] pointer-events-none" />
              </div>
            </div>

            {filterTag && (
              <Button variant="ghost" size="sm" onClick={() => setFilterTag('')}>
                Xoá lọc
              </Button>
            )}

            {/* Export */}
            <Button variant="outline" size="sm" onClick={exportJSON} icon={<Download size={16} />}>
              Export
            </Button>
          </div>
        </Card>

        {/* Entries Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((e, idx) => (
              <EntryCard key={e.id} entry={e} style={getCardStyle(idx)} />
            ))}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="gradient" size="lg" className="text-center">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-xl font-semibold text-[--text] mb-2">
                {entries.length === 0 ? 'Lọ đang trống' : 'Không tìm thấy kết quả'}
              </h3>
              <p className="text-[--muted] max-w-md mx-auto">
                {entries.length === 0
                  ? 'Hãy bắt đầu bằng việc viết một điều nhỏ bé mà bạn biết ơn hôm nay. Mỗi ngày một chút, lọ sẽ đầy những điều tốt đẹp!'
                  : 'Thử tìm với từ khóa khác hoặc xoá bộ lọc.'}
              </p>
              {entries.length === 0 && (
                <Button
                  className="mt-6"
                  onClick={() => setShowForm(true)}
                  icon={<Plus size={18} />}
                >
                  Viết điều biết ơn đầu tiên
                </Button>
              )}
            </Card>
          </motion.div>
        )}

        {/* Stats */}
        {entries.length > 0 && (
          <Card size="md" className="text-center">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold gradient-text">{entries.length}</div>
                <div className="text-xs text-[--muted]">Điều biết ơn</div>
              </div>
              <div>
                <div className="text-2xl font-bold gradient-text">{streak}</div>
                <div className="text-xs text-[--muted]">Ngày streak</div>
              </div>
              <div>
                <div className="text-2xl font-bold gradient-text">{allTags.length}</div>
                <div className="text-xs text-[--muted]">Chủ đề</div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
