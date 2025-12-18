// src/components/gratitude/GratitudeJar.jsx
// Chú thích: Lọ Biết Ơn v2.0 - Với gợi ý hàng ngày và Streak
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Heart, Sparkles, Plus, Trash2, Calendar, Lightbulb, X, Share2 } from 'lucide-react';
import { isLoggedIn, rewardXP } from '../../utils/api';

const DAILY_SUGGESTIONS = [
    "Hôm nay bạn biết ơn ai nhất?",
    "Một điều nhỏ bé nào đã làm bạn cười hôm nay?",
    "Món ăn ngon nhất bạn đã ăn hôm nay là gì?",
    "Bạn tự hào về điều gì ở bản thân?",
    "Một khoảnh khắc bình yên bạn có được là khi nào?",
    "Ai đã giúp đỡ bạn hôm nay?",
    "Bạn học được bài học gì thú vị?",
    "Một bài hát hay bạn đã nghe?",
    "Thời tiết hôm nay thế nào?",
    "Một lời khen bạn nhận được (hoặc tự khen mình)?",
    "Một khó khăn bạn đã vượt qua?",
    "Bạn mong chờ điều gì vào ngày mai?"
];

// Key storage
const GRATITUDE_KEY = 'gratitude_entries_v1';
const STREAK_KEY = 'gratitude_streak_v1';

export default function GratitudeJar() {
    const [entries, setEntries] = useState([]);
    const [text, setText] = useState('');
    const [streak, setStreak] = useState(0);
    const [suggestion, setSuggestion] = useState('');
    const [showSuggestion, setShowSuggestion] = useState(true);

    // Load initial data
    useEffect(() => {
        try {
            const savedEntries = JSON.parse(localStorage.getItem(GRATITUDE_KEY) || '[]');
            setEntries(savedEntries);

            const savedStreak = JSON.parse(localStorage.getItem(STREAK_KEY) || '{ "count": 0, "lastDate": null }');

            // Calculate streak logic here if needed (check lastDate vs today)
            // Simple version: rely on stored count
            setStreak(savedStreak.count);

            // Set initial suggestion based on day of month to rotate
            const day = new Date().getDate();
            setSuggestion(DAILY_SUGGESTIONS[day % DAILY_SUGGESTIONS.length]);

        } catch (e) {
            console.error('Failed to load gratitude data', e);
        }
    }, []);

    // Save entries
    useEffect(() => {
        localStorage.setItem(GRATITUDE_KEY, JSON.stringify(entries));
    }, [entries]);

    const updateStreak = () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const savedStreak = JSON.parse(localStorage.getItem(STREAK_KEY) || '{ "count": 0, "lastDate": null }');

            if (savedStreak.lastDate !== today) {
                // Check if yesterday was lastDate to increment, else reset to 1? 
                // For forgiveness, let's just increment if not today
                // Real logic: if (lastDate === yesterday) count++ else count = 1

                const newCount = savedStreak.count + 1;
                const newStreak = { count: newCount, lastDate: today };
                localStorage.setItem(STREAK_KEY, JSON.stringify(newStreak));
                setStreak(newCount);

                // Reward XP for daily logging
                if (isLoggedIn()) {
                    rewardXP('daily_gratitude');
                }
            }
        } catch (_) { }
    };

    const addEntry = () => {
        if (!text.trim()) return;

        const newEntry = {
            id: Date.now(),
            text: text.trim(),
            date: new Date().toISOString(),
            tags: [] // future use
        };

        setEntries([newEntry, ...entries]);
        setText('');
        updateStreak();
        setShowSuggestion(false); // Hide suggestion after writing
    };

    const deleteEntry = (id) => {
        setEntries(entries.filter(e => e.id !== id));
    };

    const getRandomSuggestion = () => {
        const random = DAILY_SUGGESTIONS[Math.floor(Math.random() * DAILY_SUGGESTIONS.length)];
        setSuggestion(random);
        setShowSuggestion(true);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header & Streak */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
                        <Heart className="fill-pink-400 text-pink-500" />
                        Lọ Biết Ơn
                    </h1>
                    <p className="text-[--muted] text-sm">Lưu giữ những điều tích cực nhỏ bé mỗi ngày.</p>
                </div>

                <Card size="sm" className="!py-2 !px-4 flex items-center gap-3 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200">
                    <div className="text-2xl">🔥</div>
                    <div>
                        <div className="text-xs text-[--muted] font-medium uppercase">Streak</div>
                        <div className="font-bold text-orange-600 dark:text-orange-400">{streak} ngày liên tiếp</div>
                    </div>
                </Card>
            </div>

            {/* Input Area */}
            <Card>
                {/* Suggestion Bubble */}
                <AnimatePresence>
                    {showSuggestion && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-4 overflow-hidden"
                        >
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl flex items-start gap-3 border border-blue-100 dark:border-blue-800">
                                <Lightbulb size={20} className="text-blue-500 mt-1 shrink-0" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Gợi ý hôm nay:</p>
                                    <p className="text-sm text-blue-600 dark:text-blue-300 italic">"{suggestion}"</p>
                                </div>
                                <button onClick={() => setShowSuggestion(false)} className="text-blue-400 hover:text-blue-600">
                                    <X size={16} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="relative">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Hôm nay bạn biết ơn điều gì?"
                        className="w-full p-4 rounded-xl bg-[--surface-2] border-transparent focus:border-[--brand] focus:ring-2 focus:ring-[--brand]/20 transition-all min-h-[120px] resize-none"
                    />
                    <div className="absolute bottom-3 right-3 flex gap-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={getRandomSuggestion}
                            title="Gợi ý khác"
                            icon={<Sparkles size={16} />}
                        />
                    </div>
                </div>

                <div className="mt-4 flex justify-end">
                    <Button
                        onClick={addEntry}
                        disabled={!text.trim()}
                        icon={<Plus size={18} />}
                        variant="primary"
                    >
                        Thêm vào lọ
                    </Button>
                </div>
            </Card>

            {/* Entries List */}
            <div className="space-y-4">
                <h3 className="font-bold text-[--text] flex items-center gap-2">
                    <Calendar size={18} />
                    Nhật ký của bạn
                </h3>

                {entries.length === 0 ? (
                    <div className="text-center py-12 opacity-50">
                        <div className="text-6xl mb-4">🏺</div>
                        <p>Lọ của bạn đang trống.<br />Hãy viết điều biết ơn đầu tiên nhé!</p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {entries.map((entry) => (
                            <motion.div
                                key={entry.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="group relative"
                            >
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-300 to-purple-300 rounded-2xl opacity-0 group-hover:opacity-50 transition blur-[2px]" />
                                <Card className="h-full relative !bg-[#fff9f0] dark:!bg-gray-800 border-yellow-100 dark:border-gray-700">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-semibold text-[--muted] bg-white/50 px-2 py-1 rounded-lg">
                                            {new Date(entry.date).toLocaleDateString('vi-VN')}
                                        </span>
                                        <button
                                            onClick={() => deleteEntry(entry.id)}
                                            className="text-red-300 hover:text-red-500 transition-colors p-1"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <p className="text-[--text] whitespace-pre-wrap font-handwriting text-lg leading-relaxed">
                                        {entry.text}
                                    </p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
