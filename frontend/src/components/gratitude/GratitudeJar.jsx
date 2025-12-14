// src/components/gratitude/GratitudeJar.jsx
// Chú thích: Gratitude v3.1 - Modern UI với server sync, 3D jar visual, floating cards, enhanced animations
import { useEffect, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import GlowOrbs from '../ui/GlowOrbs';
import { toDayStr, computeStreakFromEntries } from '../../utils/gratitude';
import {
  Plus, Download, Search, Filter, X, Sparkles,
  Heart, Calendar, Tag, Flame, ChevronDown, Loader2, Cloud
} from 'lucide-react';
import { isLoggedIn, getGratitudeList, addGratitude, scheduleSync } from '../../utils/api';

const STORAGE_KEY = 'gratitude';

// Predefined tags với emoji và gợi ý nội dung
const PREDEFINED_TAGS = [
  { id: 'family', label: 'Gia đình', emoji: '👨‍👩‍👧', suggestions: ['cảm ơn bố mẹ', 'cảm ơn anh chị em', 'bữa cơm gia đình', 'sự quan tâm của người thân'] },
  { id: 'friends', label: 'Bạn bè', emoji: '👫', suggestions: ['bạn đã lắng nghe', 'bạn đã giúp đỡ', 'khoảnh khắc vui vẻ', 'sự hỗ trợ của bạn bè'] },
  { id: 'health', label: 'Sức khỏe', emoji: '💪', suggestions: ['cơ thể khỏe mạnh', 'năng lượng tích cực', 'giấc ngủ ngon', 'sức khỏe tinh thần'] },
  { id: 'study', label: 'Học tập', emoji: '📚', suggestions: ['hiểu được bài học mới', 'điểm số tốt', 'thầy cô giảng dạy', 'kiến thức mới'] },
  { id: 'nature', label: 'Tự nhiên', emoji: '🌿', suggestions: ['ánh nắng mặt trời', 'cây xanh', 'không khí trong lành', 'cảnh đẹp thiên nhiên'] },
  { id: 'music', label: 'Âm nhạc', emoji: '🎵', suggestions: ['bài hát yêu thích', 'âm nhạc xoa dịu', 'cảm xúc qua âm nhạc'] },
  { id: 'food', label: 'Đồ ăn', emoji: '🍜', suggestions: ['món ăn ngon', 'bữa ăn ấm cúng', 'đồ uống yêu thích'] },
  { id: 'achievement', label: 'Thành tựu', emoji: '🏆', suggestions: ['hoàn thành mục tiêu', 'vượt qua thử thách', 'tiến bộ cá nhân'] },
  { id: 'kindness', label: 'Lòng tốt', emoji: '💝', suggestions: ['hành động tử tế', 'sự giúp đỡ từ người lạ', 'lòng tốt nhận được'] },
  { id: 'peace', label: 'Bình yên', emoji: '☮️', suggestions: ['khoảnh khắc yên tĩnh', 'sự bình yên nội tâm', 'thời gian nghỉ ngơi'] },
];

// Quick suggestions cho nội dung
const QUICK_SUGGESTIONS = [
  { label: 'Gia đình', emoji: '👨‍👩‍👧' },
  { label: 'Bạn bè', emoji: '👫' },
  { label: 'Sức khỏe', emoji: '💪' },
  { label: 'Học tập', emoji: '📚' },
  { label: 'Tự nhiên', emoji: '🌿' },
  { label: 'Âm nhạc', emoji: '🎵' },
];

// Enhanced Sparkline component với streak visualization
function Sparkline({ entries, days = 30, streak = 0 }) {
  const data = useMemo(() => {
    const today = new Date();
    const arr = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const key = toDayStr(d);
      const dayEntries = entries.filter((e) => toDayStr(new Date(e.date || e.created_at)) === key);
      const has = dayEntries.length > 0;
      arr.push({ 
        day: key, 
        v: has ? 1 : 0,
        count: dayEntries.length,
        isToday: i === 0,
        isInStreak: i < streak,
      });
    }
    return arr;
  }, [entries, days, streak]);

  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-0.5 h-12">
        {data.map((d, i) => (
          <motion.div
            key={d.day}
            className="relative flex flex-col items-center group"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.02 }}
          >
            <motion.div
              className={`w-3 rounded-t transition-all ${
                d.v 
                  ? d.isInStreak 
                    ? 'bg-gradient-to-t from-[--brand] via-[--brand-light] to-orange-400' 
                    : 'bg-gradient-to-t from-[--brand] to-[--brand-light]'
                  : 'bg-[--surface-border]'
              } ${d.isToday ? 'ring-2 ring-[--brand] ring-offset-1' : ''}`}
              initial={{ height: 4 }}
              animate={{ 
                height: d.v 
                  ? Math.max(16, (d.count / maxCount) * 40) 
                  : 8 
              }}
              transition={{ delay: i * 0.02 }}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 px-2 py-1 text-xs bg-[--text] text-white rounded-lg whitespace-nowrap">
              {d.day}: {d.v ? `${d.count} điều biết ơn` : 'Chưa có'}
            </div>
          </motion.div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-[--muted]">
        <span>{days} ngày qua</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-gradient-to-t from-[--brand] to-[--brand-light]" />
          Có entry
        </span>
      </div>
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
              {toDayStr(new Date(entry.date || entry.created_at))}
            </div>
            {entry.tag && (
              <Badge variant="secondary" size="sm">
                #{entry.tag}
              </Badge>
            )}
          </div>
          <p className="text-[--text] leading-relaxed whitespace-pre-wrap">
            {entry.text || entry.content}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}

export default function GratitudeJar() {
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [customTag, setCustomTag] = useState('');
  const [filter, setFilter] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [source, setSource] = useState('local'); // 'server' | 'local'
  const [showContentSuggestions, setShowContentSuggestions] = useState(false);

  // Load entries - prefer server if logged in
  useEffect(() => {
    const loadEntries = async () => {
      setLoading(true);
      if (isLoggedIn()) {
        try {
          const result = await getGratitudeList(200, 0);
          // Map server format to component format
          const serverEntries = (result.items || []).map(item => ({
            id: item.id,
            text: item.content,
            date: item.created_at,
            tag: item.tag || undefined
          }));
          setEntries(serverEntries);
          setSource('server');
        } catch (e) {
          console.warn('[Gratitude] API failed, using local:', e.message);
          loadFromLocal();
        }
      } else {
        loadFromLocal();
      }
      setLoading(false);
    };

    const loadFromLocal = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const list = raw ? JSON.parse(raw) : [];
        setEntries(Array.isArray(list) ? list : []);
        setSource('local');
      } catch (_) {
        setEntries([]);
      }
    };

    loadEntries();
  }, []);

  // Save to localStorage (always, for offline support)
  const saveLocal = (list) => {
    setEntries(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (_) { }
  };

  // Get content suggestions based on selected tag
  const getContentSuggestions = useMemo(() => {
    if (!selectedTag) {
      // Suggest based on most used tags
      const tagCounts = {};
      entries.forEach(e => {
        if (e.tag) tagCounts[e.tag] = (tagCounts[e.tag] || 0) + 1;
      });
      const topTag = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0];
      if (topTag) {
        const tagInfo = PREDEFINED_TAGS.find(t => t.id === topTag[0] || t.label.toLowerCase() === topTag[0].toLowerCase());
        return tagInfo?.suggestions || [];
      }
      return [];
    }
    const tagInfo = PREDEFINED_TAGS.find(t => t.id === selectedTag || t.label.toLowerCase() === selectedTag.toLowerCase());
    return tagInfo?.suggestions || [];
  }, [selectedTag, entries]);

  // Add entry - save to both local and server
  const addEntry = async () => {
    const t = text.trim();
    if (!t) return;

    const finalTag = selectedTag || customTag.trim() || undefined;

    const newEntry = {
      id: Date.now(),
      text: t,
      tag: finalTag,
      date: new Date().toISOString(),
    };

    // Optimistic update
    const next = [...entries, newEntry];
    saveLocal(next);
    setText('');
    setSelectedTag('');
    setCustomTag('');
    setShowForm(false);
    setShowContentSuggestions(false);

    // Save to server if logged in
    if (isLoggedIn()) {
      setSaving(true);
      try {
        const result = await addGratitude(t, finalTag);
        // Update with server ID
        if (result.id) {
          const updated = next.map(e => e.id === newEntry.id ? { ...e, serverId: result.id } : e);
          saveLocal(updated);
        }
        // Schedule sync to clear local data
        scheduleSync(3000);
      } catch (e) {
        console.warn('[Gratitude] Server save failed:', e.message);
      } finally {
        setSaving(false);
      }
    }
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

  const importJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (Array.isArray(imported)) {
            const merged = [...entries, ...imported].filter((e, i, arr) => 
              arr.findIndex(a => a.id === e.id) === i
            );
            saveLocal(merged);
            if (isLoggedIn()) {
              // Sync to server
              scheduleSync(1000);
            }
            alert(`Đã import ${imported.length} điều biết ơn!`);
          }
        } catch (err) {
          alert('Lỗi: File JSON không hợp lệ');
        }
      };
      reader.readAsText(file);
    };
    input.click();
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
            <Sparkline entries={entries} days={30} streak={streak} />
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

                {/* Tag selection */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-[--text] mb-2">
                    Chọn chủ đề (tuỳ chọn)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PREDEFINED_TAGS.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setSelectedTag(selectedTag === t.id ? '' : t.id);
                          setCustomTag('');
                          setShowContentSuggestions(true);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                          selectedTag === t.id
                            ? 'bg-[--brand] text-white shadow-md'
                            : 'bg-[--surface-border] text-[--text] hover:bg-[--surface-border]/80'
                        }`}
                      >
                        {t.emoji} {t.label}
                      </button>
                    ))}
                  </div>
                  
                  {/* Custom tag input */}
                  {!selectedTag && (
                    <div className="mt-2 flex items-center gap-2 glass rounded-xl px-3 py-2">
                      <Tag size={16} className="text-[--muted]" />
                      <input
                        value={customTag}
                        onChange={(e) => setCustomTag(e.target.value)}
                        placeholder="Hoặc nhập tag tùy chỉnh"
                        className="flex-1 bg-transparent outline-none text-sm text-[--text] placeholder:text-[--muted]"
                      />
                    </div>
                  )}
                </div>

                {/* Content suggestions based on tag */}
                {showContentSuggestions && getContentSuggestions.length > 0 && (
                  <div className="mt-3 p-3 bg-[--surface-border]/50 rounded-xl">
                    <p className="text-xs text-[--muted] mb-2">💡 Gợi ý nội dung:</p>
                    <div className="flex flex-wrap gap-2">
                      {getContentSuggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setText((t) => (t ? `${t}, ${suggestion}` : `Hôm nay mình biết ơn ${suggestion}`));
                          }}
                          className="px-2 py-1 text-xs bg-white dark:bg-gray-800 rounded-lg hover:bg-[--brand]/10 transition-colors text-[--text]"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="mt-4 flex items-center gap-3">
                  <Button onClick={addEntry} disabled={!text.trim()} className="flex-1">
                    Thêm vào lọ
                  </Button>
                  <Button variant="ghost" onClick={() => {
                    setShowForm(false);
                    setText('');
                    setSelectedTag('');
                    setCustomTag('');
                    setShowContentSuggestions(false);
                  }}>
                    Hủy
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
