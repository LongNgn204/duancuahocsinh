// src/pages/Wellness.jsx
// Chú thích: Liều thuốc tinh thần v3.2 - MOBILE-FIRST FIXED
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
        // Container chính - FULL WIDTH + overflow hidden
        <div className="w-full min-h-screen pb-24" style={{ overflowX: 'hidden' }}>
            <div className="w-full px-3 py-4" style={{ maxWidth: '100%' }}>

                {/* Header */}
                <div className="text-center mb-4">
                    <h1 className="font-bold text-slate-800" style={{ fontSize: 'clamp(1.1rem, 5vw, 1.5rem)' }}>
                        Liều Thuốc <span className="text-violet-600">Tinh Thần</span> 💊
                    </h1>
                    <p className="text-slate-500 mt-1" style={{ fontSize: '0.75rem' }}>
                        Hoạt động nhỏ giúp bạn cân bằng cảm xúc mỗi ngày
                    </p>
                </div>

                {/* Emotion Selector - Horizontal scroll */}
                <div
                    className="flex gap-2 pb-2 mb-4 no-scrollbar"
                    style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}
                >
                    {EMOTION_GROUPS.map((group) => {
                        const Icon = group.icon;
                        return (
                            <button
                                key={group.id}
                                onClick={() => { setSelectedGroup(group); setActiveQuoteIndex(0); }}
                                className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full font-medium transition-all ${selectedGroup.id === group.id
                                    ? 'bg-violet-100 text-violet-700 shadow-sm'
                                    : 'bg-slate-50 text-slate-500'
                                    }`}
                                style={{ fontSize: '0.7rem', whiteSpace: 'nowrap' }}
                            >
                                <Icon size={12} />
                                <span>{group.name}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Quote Card */}
                <motion.div
                    key={selectedGroup.id + activeQuoteIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`relative rounded-xl overflow-hidden shadow-lg bg-gradient-to-br ${selectedGroup.gradient} p-4 text-center mb-4`}
                >
                    <div className="absolute top-2 right-2 opacity-20">
                        <Sparkles size={24} color="white" />
                    </div>
                    <div className="relative z-10">
                        {(() => {
                            const Icon = selectedGroup.icon;
                            return (
                                <div className="mb-2 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto text-white">
                                    <Icon size={16} />
                                </div>
                            );
                        })()}
                        <p
                            className="font-medium text-white leading-relaxed italic"
                            style={{ fontSize: '0.8rem', wordBreak: 'break-word' }}
                        >
                            "{selectedGroup.quotes[activeQuoteIndex]}"
                        </p>
                    </div>
                    <button
                        onClick={() => handleCopyQuote(selectedGroup.quotes[activeQuoteIndex])}
                        className="absolute bottom-2 right-2 p-1.5 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
                    >
                        <Share2 size={12} />
                    </button>
                </motion.div>

                {/* Quote List */}
                <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm mb-4">
                    <h3 className="font-semibold text-slate-600 mb-2 flex items-center gap-1.5" style={{ fontSize: '0.75rem' }}>
                        <BookOpen size={14} className="text-violet-500" />
                        Lời hay ý đẹp
                    </h3>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                        {selectedGroup.quotes.map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveQuoteIndex(idx)}
                                className={`w-full text-left p-2 rounded-lg leading-relaxed transition-all ${idx === activeQuoteIndex
                                    ? 'bg-violet-50 text-violet-700 font-medium'
                                    : 'hover:bg-slate-50 text-slate-500'
                                    }`}
                                style={{ fontSize: '0.7rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat CTA - Pastel */}
                <Link to="/chat" className="block mb-4">
                    <div className="bg-gradient-to-r from-violet-200 to-purple-200 rounded-xl p-3 shadow-md border border-violet-300">
                        <div className="flex items-center gap-2">
                            <Zap size={18} className="shrink-0 text-violet-600" />
                            <div className="min-w-0">
                                <p className="font-semibold text-violet-800" style={{ fontSize: '0.85rem' }}>Cần thêm lời khuyên?</p>
                                <p className="text-violet-600" style={{ fontSize: '0.7rem' }}>AI sẵn sàng lắng nghe →</p>
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Activities Section */}
                <div>
                    <h2 className="font-bold text-slate-700 mb-3 flex items-center gap-2" style={{ fontSize: '0.9rem' }}>
                        <CheckCircle2 size={16} className="text-green-500" />
                        Hoạt động chăm sóc bản thân
                    </h2>

                    {/* Grid - 2 COLUMNS on mobile */}
                    <div
                        className="gap-2"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                        }}
                    >
                        {ACTIVITIES.map((act) => {
                            const card = <ActivityCard key={act.id} act={act} />;
                            return act.link ? (
                                <Link key={act.id} to={act.link}>{card}</Link>
                            ) : (
                                <div key={act.id}>{card}</div>
                            );
                        })}
                    </div>

                    {/* More Activities */}
                    {MORE_ACTIVITIES.length > 0 && (
                        <div className="mt-4">
                            <button
                                onClick={() => setShowMoreActivities(!showMoreActivities)}
                                className="flex items-center gap-2 text-slate-500 hover:text-violet-600 transition-colors"
                                style={{ fontSize: '0.75rem' }}
                            >
                                {showMoreActivities ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
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
                                        <div
                                            className="gap-2 mt-3 p-3 bg-slate-50 rounded-xl"
                                            style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}
                                        >
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

// Activity Card
function ActivityCard({ act, compact = false }) {
    const Icon = act.icon;
    return (
        <div
            className={`h-full rounded-lg border border-slate-100 hover:border-violet-200 shadow-sm hover:shadow-md transition-all cursor-pointer bg-white flex flex-col items-center text-center ${compact ? 'opacity-80' : ''}`}
            style={{ padding: compact ? '8px' : '12px' }}
        >
            <div
                className={`rounded-full ${act.color} flex items-center justify-center`}
                style={{ width: compact ? '28px' : '36px', height: compact ? '28px' : '36px' }}
            >
                <Icon size={compact ? 12 : 14} />
            </div>
            <span
                className="font-medium text-slate-600 mt-1.5 leading-tight"
                style={{
                    fontSize: compact ? '0.6rem' : '0.7rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}
            >
                {act.text}
            </span>
        </div>
    );
}
