// src/pages/Stories.jsx
// Chú thích: Thư Viện Truyện v3.0 - Nội dung dài, TTS cải tiến
// UX: Hiển thị toàn bộ truyện, highlight đoạn đang đọc, progress bar
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Play, Pause, SkipForward, ArrowLeft, Moon, Sun, Type, Clock, User, Volume2, VolumeX } from 'lucide-react';
import Button from '../components/ui/Button';
import { useSound } from '../contexts/SoundContext';
import { useTTS } from '../hooks/useTTS';

import { STORIES } from '../data/stories';

export default function Stories() {
    const [selectedStory, setSelectedStory] = useState(null);
    const { playSound } = useSound();
    const { play: ttsPlay, stop: ttsStop, speaking } = useTTS('vi-VN');

    // Reader State
    const [currentParagraph, setCurrentParagraph] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [theme, setTheme] = useState('light'); // 'light', 'sepia', 'dark'
    const [autoScroll, setAutoScroll] = useState(true);
    const paragraphRefs = useRef([]);
    const contentRef = useRef(null);

    // Chú thích: Lấy danh sách paragraphs của truyện hiện tại
    const paragraphs = useMemo(() => {
        return selectedStory?.paragraphs || [];
    }, [selectedStory]);

    // Current paragraph text (normalized cho TTS)
    const currentText = (paragraphs[currentParagraph] || '').normalize('NFC');

    // Progress percentage
    const progress = paragraphs.length > 0 ? ((currentParagraph + 1) / paragraphs.length) * 100 : 0;

    // Chú thích: Auto-scroll đến đoạn đang đọc
    useEffect(() => {
        if (autoScroll && paragraphRefs.current[currentParagraph]) {
            paragraphRefs.current[currentParagraph].scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, [currentParagraph, autoScroll]);

    // Chú thích: Chuyển đoạn tiếp theo
    const advanceToNext = useCallback(() => {
        if (currentParagraph < paragraphs.length - 1) {
            setCurrentParagraph(prev => prev + 1);
            playSound('pageFlip');
        } else {
            // Hết truyện
            setIsPlaying(false);
            ttsStop();
        }
    }, [currentParagraph, paragraphs.length, playSound, ttsStop]);

    // Chú thích: Play TTS cho đoạn hiện tại
    useEffect(() => {
        if (!isPlaying || !currentText) {
            if (!isPlaying) ttsStop();
            return;
        }
        ttsPlay(currentText, { rate: 0.95 }); // Đọc chậm hơn một chút
    }, [isPlaying, currentText, ttsPlay, ttsStop]);

    // Chú thích: Watch speech end để chuyển đoạn
    useEffect(() => {
        if (isPlaying && !speaking && currentText) {
            const timer = setTimeout(() => {
                advanceToNext();
            }, 500); // Pause ngắn giữa các đoạn
            return () => clearTimeout(timer);
        }
    }, [speaking, isPlaying, currentText, advanceToNext]);

    // Cleanup on unmount
    useEffect(() => {
        return () => ttsStop();
    }, [ttsStop]);

    const handleCardClick = (story) => {
        setSelectedStory(story);
        setCurrentParagraph(0);
        setIsPlaying(false);
        ttsStop();
        playSound('click');
    };

    const closeReader = () => {
        setIsPlaying(false);
        ttsStop();
        setSelectedStory(null);
    };

    const togglePlay = () => {
        if (isPlaying) {
            ttsStop();
        }
        setIsPlaying(!isPlaying);
        playSound('click');
    };

    const goToParagraph = (index) => {
        setCurrentParagraph(index);
        if (isPlaying) {
            ttsStop();
            setTimeout(() => {
                ttsPlay((paragraphs[index] || '').normalize('NFC'), { rate: 0.95 });
            }, 100);
        }
    };

    const getThemeClass = () => {
        switch (theme) {
            case 'sepia': return 'bg-[#f4ecd8] text-[#5b4636]';
            case 'dark': return 'bg-slate-900 text-slate-200';
            default: return 'bg-white text-slate-800';
        }
    };

    const getHighlightClass = () => {
        switch (theme) {
            case 'sepia': return 'bg-amber-200/60';
            case 'dark': return 'bg-indigo-900/60';
            default: return 'bg-indigo-100/80';
        }
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Thư Viện <span className="text-[--brand]">Truyện</span> 📚</h1>
                    <p className="text-slate-500">Nuôi dưỡng tâm hồn qua những trang sách hay.</p>
                </div>
            </div>

            {/* Library Grid - 6 truyện */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {STORIES.map((story) => (
                    <motion.div
                        key={story.id}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="cursor-pointer group"
                        onClick={() => handleCardClick(story)}
                    >
                        {/* Book Cover - to hơn */}
                        <div className={`
                            aspect-[3/4] rounded-2xl shadow-lg relative overflow-hidden
                            bg-gradient-to-br ${story.color}
                            group-hover:shadow-2xl transition-all duration-300
                        `}>
                            {/* Spine shadow */}
                            <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/30 to-transparent"></div>

                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
                                <div className="text-6xl mb-4 filter drop-shadow-lg">{story.icon}</div>
                                <h3 className="font-bold text-xl leading-tight drop-shadow-md mb-3">
                                    {story.title}
                                </h3>

                                {/* Metadata */}
                                <div className="flex items-center gap-3 text-white/80 text-sm">
                                    <span className="flex items-center gap-1">
                                        <Clock size={14} />
                                        {story.readingTime}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <User size={14} />
                                        {story.ageRange} tuổi
                                    </span>
                                </div>
                            </div>

                            {/* Decorative corner */}
                            <div className="absolute bottom-0 right-0 w-16 h-16 bg-white/10 rounded-tl-full"></div>
                        </div>

                        <button className="w-full mt-3 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
                            <BookOpen size={18} />
                            Đọc truyện
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* Immersive Reader Modal */}
            <AnimatePresence>
                {selectedStory && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className={`
                                w-full max-w-4xl h-[90vh] mx-4 rounded-3xl shadow-2xl flex flex-col relative overflow-hidden
                                transition-colors duration-500
                                ${getThemeClass()}
                            `}
                        >
                            {/* Reader Toolbar */}
                            <div className="flex items-center justify-between p-4 border-b border-black/10 bg-black/5 backdrop-blur-sm shrink-0">
                                <Button variant="ghost" icon={<ArrowLeft size={20} />} onClick={closeReader} className="rounded-full">
                                    Thoát
                                </Button>

                                <div className="flex items-center gap-4">
                                    {/* Theme switcher */}
                                    <div className="flex gap-1 bg-white/10 rounded-full p-1 border border-black/5">
                                        <button onClick={() => setTheme('light')} className={`p-2 rounded-full transition-all ${theme === 'light' ? 'bg-white shadow-sm' : ''}`}><Sun size={16} /></button>
                                        <button onClick={() => setTheme('sepia')} className={`p-2 rounded-full transition-all ${theme === 'sepia' ? 'bg-[#e3d0b0] shadow-sm' : ''}`}><Type size={16} /></button>
                                        <button onClick={() => setTheme('dark')} className={`p-2 rounded-full transition-all ${theme === 'dark' ? 'bg-slate-700 shadow-sm text-white' : ''}`}><Moon size={16} /></button>
                                    </div>

                                    {/* Auto scroll toggle */}
                                    <button
                                        onClick={() => setAutoScroll(!autoScroll)}
                                        className={`p-2 rounded-full transition-all ${autoScroll ? 'bg-[--brand] text-white' : 'bg-black/5'}`}
                                        title={autoScroll ? 'Tự động cuộn: BẬT' : 'Tự động cuộn: TẮT'}
                                    >
                                        {autoScroll ? <Volume2 size={16} /> : <VolumeX size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="h-1 bg-black/10 shrink-0">
                                <motion.div
                                    className="h-full bg-[--brand]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>

                            {/* Story Title */}
                            <div className="text-center py-6 px-4 shrink-0">
                                <div className="text-4xl mb-2">{selectedStory.icon}</div>
                                <h2 className="text-2xl md:text-3xl font-bold">{selectedStory.title}</h2>
                                <p className="text-sm opacity-60 mt-2">
                                    {selectedStory.author} • {selectedStory.readingTime}
                                </p>
                            </div>

                            {/* Content Area - Scrollable */}
                            <div
                                ref={contentRef}
                                className="flex-1 overflow-y-auto px-6 md:px-12 pb-6"
                            >
                                <div className="max-w-2xl mx-auto space-y-6">
                                    {paragraphs.map((para, idx) => (
                                        <motion.p
                                            key={idx}
                                            ref={el => paragraphRefs.current[idx] = el}
                                            onClick={() => goToParagraph(idx)}
                                            className={`
                                                text-lg md:text-xl leading-relaxed cursor-pointer
                                                p-4 rounded-xl transition-all duration-300
                                                ${idx === currentParagraph
                                                    ? `${getHighlightClass()} border-l-4 border-[--brand] font-medium`
                                                    : 'hover:bg-black/5'
                                                }
                                                ${idx < currentParagraph ? 'opacity-60' : ''}
                                            `}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                        >
                                            {para}
                                        </motion.p>
                                    ))}

                                    {/* Moral */}
                                    <div className="mt-8 p-6 rounded-2xl bg-[--brand]/10 border border-[--brand]/20">
                                        <span className="inline-block px-3 py-1 rounded-full bg-[--brand] text-white text-sm font-bold mb-3">
                                            ✨ Bài học
                                        </span>
                                        <p className="text-lg font-medium italic opacity-90">
                                            "{selectedStory.moral}"
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Controls Footer */}
                            <div className="p-4 border-t border-black/10 bg-black/5 backdrop-blur-sm shrink-0">
                                <div className="flex items-center justify-center gap-4">
                                    {/* Previous */}
                                    <button
                                        onClick={() => {
                                            if (currentParagraph > 0) {
                                                goToParagraph(currentParagraph - 1);
                                            }
                                        }}
                                        className="p-3 rounded-full hover:bg-black/10 disabled:opacity-30 transition-all"
                                        disabled={currentParagraph === 0}
                                    >
                                        <SkipForward className="rotate-180" size={24} />
                                    </button>

                                    {/* Play/Pause */}
                                    <button
                                        onClick={togglePlay}
                                        className="w-16 h-16 rounded-full bg-[--brand] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                                    >
                                        {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                                    </button>

                                    {/* Next */}
                                    <button
                                        onClick={() => {
                                            if (currentParagraph < paragraphs.length - 1) {
                                                goToParagraph(currentParagraph + 1);
                                            }
                                        }}
                                        className="p-3 rounded-full hover:bg-black/10 disabled:opacity-30 transition-all"
                                        disabled={currentParagraph === paragraphs.length - 1}
                                    >
                                        <SkipForward size={24} />
                                    </button>
                                </div>

                                {/* Progress text */}
                                <p className="text-center text-sm opacity-60 mt-3">
                                    Đoạn {currentParagraph + 1} / {paragraphs.length}
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
