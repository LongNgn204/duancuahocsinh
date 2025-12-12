// src/components/gratitude/GratitudeJar.jsx
// Chú thích: Gratitude Pro – gợi ý nhanh, tags, search/filter, export JSON, sparkline streak
import { useEffect, useMemo, useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { toDayStr, computeStreakFromEntries } from '../../utils/gratitude';

const STORAGE_KEY = 'gratitude';
const SUGGESTIONS = ['Gia đình', 'Bạn bè', 'Trường lớp', 'Sức khỏe', 'Thành tựu'];

function Sparkline({ entries, days = 14 }) {
  // Vẽ sparkline đơn giản: 1 thanh/ngày (có entry: full, không: thấp)
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

  const w = days * 8;
  const h = 16;
  return (
    <svg width={w} height={h} aria-label="Streak sparkline">
      {data.map((d, i) => (
        <rect key={d.day} x={i * 8} y={d.v ? 0 : h - 4} width={6} height={d.v ? h : 4} rx={2} fill={d.v ? '#B0E0E6' : '#E5E7EB'} />
      ))}
    </svg>
  );
}

export default function GratitudeJar() {
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState('');
  const [tag, setTag] = useState('');
  const [filter, setFilter] = useState('');
  const [filterTag, setFilterTag] = useState('');

  // Đọc localStorage khi mount
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
    } catch (_) {
      // ignore
    }
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
    const tg = filterTag.trim().toLowerCase();
    return entries
      .filter((e) => (q ? e.text.toLowerCase().includes(q) : true))
      .filter((e) => (tg ? (e.tag || '').toLowerCase() === tg : true))
      .slice()
      .reverse();
  }, [entries, filter, filterTag]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">🏺 Lọ Biết Ơn của bạn</h2>
          <p className="text-sm text-gray-600 mt-1">Streak: {streak} ngày</p>
        </div>
        <Sparkline entries={entries} />
      </div>

      <Card className="p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] items-start">
          <div className="space-y-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Hôm nay bạn biết ơn điều gì?"
              rows={3}
              className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-accent/60"
            />
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <Button key={s} type="button" variant="ghost" size="sm" onClick={() => setText((t) => (t ? t + ' ' + s : s))}>{s}</Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="Thêm tag (tuỳ chọn)"
                className="px-3 py-2 border rounded-lg"
                aria-label="Tag"
              />
              <span className="text-xs text-gray-500">Ví dụ: Gia đình, Bạn bè…</span>
            </div>
          </div>
          <div className="flex sm:flex-col gap-2 justify-end">
            <Button onClick={addEntry} variant="primary">Thêm vào lọ</Button>
            <Button onClick={exportJSON} variant="outline">Export JSON</Button>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Tìm theo nội dung"
            className="px-3 py-2 border rounded-lg"
            aria-label="Tìm kiếm nội dung"
          />
          <div className="flex items-center gap-2">
            <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)} className="px-3 py-2 border rounded-lg">
              <option value="">Lọc theo tag</option>
              {Array.from(new Set(entries.map((e) => e.tag).filter(Boolean))).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {filterTag && (
              <Button variant="ghost" size="sm" onClick={() => setFilterTag('')}>Xoá lọc</Button>
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((e) => (
          <Card key={e.id} className="p-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <div>{toDayStr(new Date(e.date))}</div>
              {e.tag && <span className="px-2 py-0.5 rounded-full bg-secondary/60 text-gray-800">#{e.tag}</span>}
            </div>
            <div className="whitespace-pre-wrap text-gray-800">{e.text}</div>
          </Card>
        ))}
        {!filtered.length && (
          <Card className="p-6 text-gray-600">Chưa có mục nào — hãy bắt đầu bằng một điều nhỏ bé hôm nay ✨</Card>
        )}
      </div>
    </div>
  );
}
