// src/pages/Wellness.jsx
// Chú thích: Liều thuốc tinh thần v2.0 - Visual Upgrade & Peace Cards Integration
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import {
    Heart, Sparkles, Flame, Wind, Star, Shield, Users,
    Droplet, Cloud, Frown, Angry, AlertCircle, Zap, BookOpen, HeartCrack,
    Coffee, Music, Phone, TreePine, PenLine, Volume2, CheckCircle2, Share2, Download
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { EMOTION_GROUPS } from '../data/quotes';
import { ACTIVITIES } from '../data/activities';

export default function Wellness() {
    const [selectedGroup, setSelectedGroup] = useState(EMOTION_GROUPS[0]);
    const [activeQuoteIndex, setActiveQuoteIndex] = useState(0);

    const handleCopyQuote = (quote) => {
        navigator.clipboard.writeText(quote);
        // Toast logic could go here
    };

    return (
        <div className="space-y-6 md:space-y-10 pb-10">
            {/* Header */}
            <div className="text-center space-y-2 px-4">
                <h1 className="text-2xl md:text-4xl font-bold text-slate-800">
                    Liều Thuốc <span className="text-[--brand]">Tinh Thần</span> 💊
                </h1>
                <p className="text-slate-500 max-w-xl mx-auto text-sm md:text-base">
                    Những lời khuyên và hoạt động nhỏ giúp bạn cân bằng cảm xúc mỗi ngày.
                </p>
            </div>

            {/* --- EMOTION SELECTOR --- */}
            <div className="-mx-4 px-4 flex overflow-x-auto pb-4 gap-3 no-scrollbar snap-x md:mx-0 md:px-0">
                {EMOTION_GROUPS.map((group) => (
                    <motion.button
                        key={group.id}
                        onClick={() => { setSelectedGroup(group); setActiveQuoteIndex(0); }}
                        whileTap={{ scale: 0.95 }}
                        className={`
                            shrink-0 snap-center flex items-center gap-2 px-4 py-2 md:px-5 md:py-3 rounded-2xl transition-all border
                            ${selectedGroup.id === group.id
                                ? `bg-gradient-to-r ${group.gradient} text-white shadow-lg shadow-${group.bg.split('-')[1]}-500/30 border-transparent`
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}
                        `}
                    >
                        <group.icon size={18} />
                        <span className="font-semibold whitespace-nowrap text-sm md:text-base">{group.name}</span>
                    </motion.button>
                ))}
            </div>

            {/* --- INSTAGRAM STYLE QUOTE CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
                {/* Visual Card */}
                <motion.div
                    key={selectedGroup.id + activeQuoteIndex}
                    initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ type: 'spring' }}
                    className={`
                        aspect-square md:aspect-square relative rounded-3xl overflow-hidden shadow-2xl
                        bg-gradient-to-br ${selectedGroup.gradient} p-6 md:p-8 flex flex-col justify-center items-center text-center
                    `}
                >
                    {/* Decor */}
                    <div className="absolute top-0 right-0 p-8 md:p-12 opacity-20"><Sparkles size={80} color="white" /></div>
                    <div className="absolute bottom-0 left-0 p-6 md:p-8 opacity-20"><Heart size={60} color="white" /></div>

                    <div className="relative z-10 w-full">
                        <div className="mb-4 md:mb-6 w-14 h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto text-white">
                            <selectedGroup.icon size={28} className="md:w-8 md:h-8" />
                        </div>
                        <h3 className="text-xl md:text-3xl font-bold text-white leading-relaxed font-serif italic px-2">
                            "{selectedGroup.quotes[activeQuoteIndex]}"
                        </h3>
                        <div className="mt-4 md:mt-6 w-12 h-1 bg-white/50 rounded-full mx-auto" />
                    </div>

                    {/* Actions */}
                    <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 flex gap-2">
                        <button
                            onClick={() => handleCopyQuote(selectedGroup.quotes[activeQuoteIndex])}
                            className="p-2 md:p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors"
                            title="Sao chép"
                        >
                            <Share2 size={18} className="md:w-5 md:h-5" />
                        </button>
                    </div>
                </motion.div>

                {/* List & Controls */}
                <div className="space-y-4 md:space-y-6">
                    <div className="bg-white rounded-3xl p-4 md:p-6 border border-slate-100 shadow-xl">
                        <h3 className="text-base md:text-lg font-bold text-slate-700 mb-3 md:mb-4 flex items-center gap-2">
                            <BookOpen size={20} className="text-[--brand]" />
                            Lời hay ý đẹp
                        </h3>
                        <div className="space-y-2 md:space-y-3 max-h-[250px] md:max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                            {selectedGroup.quotes.map((q, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveQuoteIndex(idx)}
                                    className={`w-full text-left p-3 md:p-4 rounded-xl transition-all text-sm leading-relaxed
                                        ${idx === activeQuoteIndex
                                            ? `bg-${selectedGroup.bg.split('-')[1]}-50 border border-${selectedGroup.bg.split('-')[1]}-200 text-slate-800 font-medium shadow-sm`
                                            : 'hover:bg-slate-50 text-slate-500'}
                                    `}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-4 md:p-6 text-white shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="p-2 md:p-3 bg-white/20 rounded-2xl">
                                <Zap size={20} className="md:w-6 md:h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base md:text-lg">Cần thêm lời khuyên?</h3>
                                <p className="text-white/80 text-xs md:text-sm mb-2 md:mb-3">AI luôn sẵn sàng lắng nghe bạn.</p>
                                <Link to="/chat">
                                    <button className="px-3 py-1.5 md:px-4 md:py-2 bg-white text-indigo-600 rounded-lg text-xs md:text-sm font-bold shadow-sm hover:bg-indigo-50 transition-colors">
                                        Trò chuyện ngay
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SELF-CARE ACTIVITIES --- */}
            <div>
                <h2 className="text-lg md:text-2xl font-bold text-slate-800 mb-4 md:mb-6 flex items-center gap-2">
                    <CheckCircle2 size={24} className="text-green-500" />
                    Hoạt động chăm sóc bản thân
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                    {ACTIVITIES.map((act) => (
                        <motion.div
                            key={act.id}
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {act.link ? (
                                <Link to={act.link}>
                                    <ActivityCard act={act} />
                                </Link>
                            ) : (
                                <ActivityCard act={act} />
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function ActivityCard({ act }) {
    return (
        <div className={`
            h-full p-4 rounded-2xl border border-transparent hover:border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer bg-white flex flex-col items-center text-center gap-3
        `}>
            <div className={`w-12 h-12 rounded-full ${act.color} flex items-center justify-center`}>
                <act.icon size={20} />
            </div>
            <span className="font-medium text-slate-700 text-sm">{act.text}</span>
        </div>
    );
}
