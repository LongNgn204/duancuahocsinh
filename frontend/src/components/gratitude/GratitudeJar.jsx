// src/components/gratitude/GratitudeJar.jsx
// Chú thích: Lọ Biết Ơn v2.0 - Premium Visuals & Animations
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import { Heart, Sparkles, Plus, Trash2, Calendar, Lightbulb, X, Edit3, Save } from 'lucide-react';
import { isLoggedIn, rewardXP } from '../../utils/api';
import Confetti from '../ui/Confetti';
import { useSound } from '../../contexts/SoundContext';

const DAILY_SUGGESTIONS = [
    "Hôm nay bạn biết ơn ai nhất?",
    "Ai đã giúp đỡ bạn hôm nay?",
    "Một điều nhỏ bé nào đã làm bạn cười hôm nay?",
    "Bữa ăn ngon nhất hôm nay là gì?",
    "Một lời khen bạn nhận được?",
    "Bạn tự hào về điều gì ở bản thân hôm nay?",
    "Thời tiết hôm nay thế nào, có gì đẹp không?",
    "Một bài hát hay bạn đã nghe?",
    "Một khó khăn bạn đã vượt qua?",
    "Điều gì khiến bạn cảm thấy an toàn?",
    "Giấc ngủ tối qua của bạn thế nào?",
    "Hôm nay bạn đã học được điều gì mới?",
    "Một người bạn đã nhắn tin cho bạn?",
    "Cảm giác khi uống một ly nước mát?",
    "Một việc tử tế bạn đã làm?",
    "Màu sắc yêu thích bạn nhìn thấy hôm nay?",
    "Một cuốn sách hay video thú vị?",
    "Bạn mong chờ điều gì vào ngày mai?",
    "Cảm giác của bạn ngay lúc này?",
    "Một kỷ niệm đẹp chợt hiện về?",
];

const GRATITUDE_KEY = 'gratitude_entries_v1';
const STREAK_KEY = 'gratitude_streak_v1';

export default function GratitudeJar() {
    const [entries, setEntries] = useState([]);
    const [text, setText] = useState('');
    const [streak, setStreak] = useState(0);
    const [suggestion, setSuggestion] = useState('');
    const [showSuggestion, setShowSuggestion] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const { playSound } = useSound();

    // Load Data
    useEffect(() => {
        try {
            const savedEntries = JSON.parse(localStorage.getItem(GRATITUDE_KEY) || '[]');
            setEntries(savedEntries);
            const savedStreak = JSON.parse(localStorage.getItem(STREAK_KEY) || '{ "count": 0, "lastDate": null }');
            setStreak(savedStreak.count);
            // Random suggestion
            setSuggestion(DAILY_SUGGESTIONS[Math.floor(Math.random() * DAILY_SUGGESTIONS.length)]);
        } catch (e) {
            console.error(e);
        }
    }, []);

    // Save Data
    useEffect(() => {
        localStorage.setItem(GRATITUDE_KEY, JSON.stringify(entries));
    }, [entries]);

    const updateStreak = () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const savedStreak = JSON.parse(localStorage.getItem(STREAK_KEY) || '{ "count": 0, "lastDate": null }');
            if (savedStreak.lastDate !== today) {
                const newCount = savedStreak.count + 1;
                const newStreak = { count: newCount, lastDate: today };
                localStorage.setItem(STREAK_KEY, JSON.stringify(newStreak));
                setStreak(newCount);
                if (isLoggedIn()) rewardXP('daily_gratitude');
            }
        } catch (_) { }
    };

    const addEntry = () => {
        if (!text.trim()) return;
        setIsAdding(true);
        playSound('click'); // Click sound start

        setTimeout(() => {
            const newEntry = {
                id: Date.now(),
                text: text.trim(),
                date: new Date().toISOString(),
                color: getRandomColor()
            };
            setEntries([newEntry, ...entries]);
            setText('');
            updateStreak();
            setShowSuggestion(false);
            setIsAdding(false);

            // Success Multimedia Effects
            playSound('drop');
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);

        }, 800); // Wait for animation
    };

    const deleteEntry = (id) => {
        if (window.confirm('Bạn muốn xóa điều biết ơn này?')) {
            playSound('pop');
            setEntries(entries.filter(e => e.id !== id));
        }
    };

    const getRandomSuggestion = () => {
        playSound('click');
        const random = DAILY_SUGGESTIONS[Math.floor(Math.random() * DAILY_SUGGESTIONS.length)];
        setSuggestion(random);
        setShowSuggestion(true);
    };

    const getRandomColor = () => {
        const colors = ['bg-yellow-100', 'bg-pink-100', 'bg-blue-100', 'bg-green-100', 'bg-purple-100', 'bg-orange-100'];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    return (
        <div className="min-h-screen py-6 px-4 md:px-8 max-w-6xl mx-auto space-y-12">
            <Confetti active={showConfetti} />

            {/* Header Section */}
            <div className="text-center space-y-4">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-block p-4 rounded-full bg-gradient-to-tr from-amber-300 to-orange-400 shadow-lg mb-2"
                >
                    <Heart size={40} className="text-white fill-white/20" />
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight">
                    Lọ <span className="text-amber-500">Biết Ơn</span>
                </h1>
                <p className="text-lg text-slate-500 max-w-lg mx-auto">
                    Mỗi ngày một niềm vui nhỏ, tích lũy thành hạnh phúc to.
                </p>

                {/* Streak Badge */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-amber-100 text-amber-600 font-bold"
                >
                    <span>🔥</span>
                    <span>{streak} ngày liên tiếp</span>
                </motion.div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-start">

                {/* Left Column: Input & Writing */}
                <div className="space-y-6">
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl border border-white/50 relative overflow-hidden">
                        {/* Suggestion */}
                        <AnimatePresence>
                            {showSuggestion && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-6 bg-indigo-50 rounded-xl p-4 border border-indigo-100 flex gap-3 relative"
                                >
                                    <Lightbulb className="text-indigo-500 shrink-0" size={20} />
                                    <div>
                                        <p className="text-indigo-900 font-medium text-sm mb-1">Gợi ý cho bạn:</p>
                                        <p className="text-indigo-700 italic">"{suggestion}"</p>
                                    </div>
                                    <button onClick={() => setShowSuggestion(false)} className="absolute top-2 right-2 text-indigo-300 hover:text-indigo-500">
                                        <X size={16} />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="relative">
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Hôm nay mình biết ơn vì..."
                                className="w-full bg-transparent text-xl font-handwriting leading-relaxed p-2 focus:outline-none min-h-[150px] resize-none placeholder:text-slate-300 text-slate-700"
                            />

                            {/* Toolbar */}
                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
                                <Button size="sm" variant="ghost" onClick={getRandomSuggestion} icon={<Sparkles size={16} />}>
                                    Gợi ý khác
                                </Button>
                                <Button
                                    onClick={addEntry}
                                    disabled={!text.trim() || isAdding}
                                    variant="primary"
                                    className="rounded-full px-6 shadow-lg shadow-amber-500/20 bg-gradient-to-r from-amber-400 to-orange-500 border-none"
                                    icon={isAdding ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Sparkles size={18} /></motion.div> : <Plus size={18} />}
                                >
                                    {isAdding ? 'Đang bỏ vào lọ...' : 'Thả vào lọ'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Image/Decoration */}
                    <div className="hidden md:block p-8 text-center opacity-60">
                        <img src="https://em-content.zobj.net/source/microsoft-teams/337/pot-of-food_1f372.png" alt="Jar" className="w-64 mx-auto drop-shadow-2xl filter contrast-125" />
                        <p className="mt-4 font-handwriting text-2xl text-slate-400 rotate-2">"Lọ của sự hạnh phúc"</p>
                    </div>
                </div>

                {/* Right Column: Entries Stream (Masonry style) */}
                <div className="relative min-h-[500px]">
                    <h3 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2">
                        <Calendar className="text-amber-500" size={20} />
                        Những điều đã lưu
                    </h3>

                    {entries.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                            <div className="text-6xl mb-4 grayscale opacity-30">🏺</div>
                            <p className="text-slate-400 font-medium">Lọ đang trống rỗng.<br />Hãy thêm điều biết ơn đầu tiên!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <AnimatePresence>
                                {entries.map((entry) => (
                                    <motion.div
                                        key={entry.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        whileHover={{ y: -5, rotate: 1 }}
                                        onMouseEnter={() => playSound('hover')}
                                        className={`p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative group ${entry.color || 'bg-white'}`}
                                    >
                                        <div className="flex justify-between items-start mb-3 opacity-60">
                                            <span className="text-[10px] uppercase tracking-wider font-bold">
                                                {new Date(entry.date).toLocaleDateString('vi-VN')}
                                            </span>
                                            <button
                                                onClick={() => deleteEntry(entry.id)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white/50 rounded-full hover:bg-red-50 hover:text-red-500"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                        <p className="text-slate-800 font-handwriting text-lg leading-snug">
                                            {entry.text}
                                        </p>
                                        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Heart size={14} className="text-red-400 fill-red-400" />
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
