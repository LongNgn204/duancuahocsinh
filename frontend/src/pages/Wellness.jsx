// src/pages/Wellness.jsx
// Chú thích: Liều thuốc tinh thần v3.0 - Layout tối ưu, ít rối mắt
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, Sparkles, Zap, BookOpen, CheckCircle2, Share2, ChevronDown, ChevronUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { EMOTION_GROUPS } from '../data/quotes';
import { ACTIVITIES, MORE_ACTIVITIES } from '../data/activities';

export default function Wellness() {
    const [selectedGroup, setSelectedGroup] = useState(EMOTION_GROUPS[0]);
    const [activeQuoteIndex, setActiveQuoteIndex] = useState(0);
    const [showMoreActivities, setShowMoreActivities] = useState(false);

    const handleCopyQuote = (quote) => {
        navigator.clipboard.writeText(quote);
    };

    return (
        <div className="space-y-6 pb-8 px-4 sm:px-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center space-y-1 px-4">
                <h1 className="text-xl md:text-3xl font-bold text-slate-800">
                    Liều Thuốc <span className="text-violet-600">Tinh Thần</span> 💊
                </h1>
                <p className="text-slate-500 text-sm">
                    Hoạt động nhỏ giúp bạn cân bằng cảm xúc mỗi ngày
                </p>
            </div>

            {/* --- MAIN CONTENT: Sidebar nhỏ + Grid hoạt động to --- */}
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">

                {/* Chú thích: Sidebar trái - Thu nhỏ trên desktop */}
                <div className="lg:w-72 shrink-0 space-y-4">
                    {/* Emotion Selector - Horizontal scroll nhỏ gọn */}
                    <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
                        {EMOTION_GROUPS.map((group) => (
                            <button
                                key={group.id}
                                onClick={() => { setSelectedGroup(group); setActiveQuoteIndex(0); }}
                                className={`
                                    shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                                    ${selectedGroup.id === group.id
                                        ? 'bg-violet-100 text-violet-700 shadow-sm'
                                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}
                                `}
                            >
                                <group.icon size={14} />
                                <span>{group.name}</span>
                            </button>
                        ))}
                    </div>

                    {/* Quote Card - Nhỏ gọn */}
                    <motion.div
                        key={selectedGroup.id + activeQuoteIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`
                            relative rounded-2xl overflow-hidden shadow-lg
                            bg-gradient-to-br ${selectedGroup.gradient} p-4 text-center
                        `}
                    >
                        <div className="absolute top-2 right-2 opacity-20"><Sparkles size={32} color="white" /></div>

                        <div className="relative z-10">
                            <div className="mb-2 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto text-white">
                                <selectedGroup.icon size={18} />
                            </div>
                            <p className="text-sm md:text-base font-medium text-white leading-relaxed italic">
                                "{selectedGroup.quotes[activeQuoteIndex]}"
                            </p>
                        </div>

                        <button
                            onClick={() => handleCopyQuote(selectedGroup.quotes[activeQuoteIndex])}
                            className="absolute bottom-2 right-2 p-1.5 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
                            title="Sao chép"
                        >
                            <Share2 size={12} />
                        </button>
                    </motion.div>

                    {/* Quote List - Compact */}
                    <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
                        <h3 className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                            <BookOpen size={14} className="text-violet-500" />
                            Lời hay ý đẹp
                        </h3>
                        <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                            {selectedGroup.quotes.map((q, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveQuoteIndex(idx)}
                                    className={`w-full text-left p-2 rounded-lg text-xs leading-relaxed transition-all truncate
                                        ${idx === activeQuoteIndex
                                            ? 'bg-violet-50 text-violet-700 font-medium'
                                            : 'hover:bg-slate-50 text-slate-500'}
                                    `}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Chat CTA - Nhỏ gọn */}
                    <Link to="/chat" className="block">
                        <div className="bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl p-3 text-white shadow-md hover:shadow-lg transition-shadow">
                            <div className="flex items-center gap-2">
                                <Zap size={16} />
                                <div>
                                    <p className="font-semibold text-sm">Cần thêm lời khuyên?</p>
                                    <p className="text-white/80 text-xs">AI sẵn sàng lắng nghe →</p>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Chú thích: Phần chính - Grid hoạt động FULL WIDTH */}
                <div className="flex-1">
                    <h2 className="text-base md:text-lg font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-green-500" />
                        Hoạt động chăm sóc bản thân
                    </h2>

                    {/* Grid hoạt động chính - Full width */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3">
                        {ACTIVITIES.map((act) => (
                            <motion.div
                                key={act.id}
                                whileHover={{ scale: 1.02 }}
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

                    {/* Chú thích: Góc nhỏ "Thêm hoạt động" cho các hoạt động phụ */}
                    {MORE_ACTIVITIES.length > 0 && (
                        <div className="mt-4">
                            <button
                                onClick={() => setShowMoreActivities(!showMoreActivities)}
                                className="flex items-center gap-2 text-sm text-slate-500 hover:text-violet-600 transition-colors"
                            >
                                {showMoreActivities ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                <span>Thêm hoạt động ({MORE_ACTIVITIES.length})</span>
                            </button>

                            <AnimatePresence>
                                {showMoreActivities && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3 p-3 bg-slate-50 rounded-xl">
                                            {MORE_ACTIVITIES.map((act) => (
                                                <ActivityCard key={act.id} act={act} compact />
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Chú thích: Card hoạt động - Gọn hơn, ít màu hơn
function ActivityCard({ act, compact = false }) {
    return (
        <div className={`
            h-full p-2 md:p-3 rounded-xl border border-slate-100 hover:border-violet-200 
            shadow-sm hover:shadow-md transition-all cursor-pointer bg-white 
            flex flex-col items-center text-center gap-1.5 md:gap-2
            ${compact ? 'opacity-80' : ''}
        `}>
            <div className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-full ${act.color} flex items-center justify-center`}>
                <act.icon size={compact ? 14 : 16} />
            </div>
            <span className={`font-medium text-slate-600 ${compact ? 'text-[10px]' : 'text-xs'} leading-tight`}>
                {act.text}
            </span>
        </div>
    );
}

