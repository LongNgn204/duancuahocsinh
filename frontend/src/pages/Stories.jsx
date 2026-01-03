// src/pages/Stories.jsx
// Chú thích: Thư Viện Truyện v4.0 - Đọc thủ công (TTS đã tắt)
// UX: Hiển thị toàn bộ truyện, highlight đoạn đang đọc, progress bar
import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight, ArrowLeft, Moon, Sun, Type, Clock, User } from 'lucide-react';
import Button from '../components/ui/Button';
import { useSound } from '../contexts/SoundContext';

import { STORIES } from '../data/stories';

export default function Stories() {
    const [selectedStory, setSelectedStory] = useState(null);
    const { playSound } = useSound();

    // Reader State
    const [currentParagraph, setCurrentParagraph] = useState(0);
    const [theme, setTheme] = useState('light'); // 'light', 'sepia', 'dark'
    const [isAudioPlaying, setIsAudioPlaying] = useState(false); // Track audio state
    const paragraphRefs = useRef([]);
    const contentRef = useRef(null);
    const audioRef = useRef(null);

    // Chú thích: Lấy danh sách paragraphs của truyện hiện tại
    const paragraphs = useMemo(() => {
        return selectedStory?.paragraphs || [];
    }, [selectedStory]);

    // Progress percentage
    const progress = paragraphs.length > 0 ? ((currentParagraph + 1) / paragraphs.length) * 100 : 0;

    // Chú thích: Auto-scroll đến đoạn đang đọc
    useEffect(() => {
        if (paragraphRefs.current[currentParagraph]) {
            paragraphRefs.current[currentParagraph].scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, [currentParagraph]);

    // Chú thích: Auto-scroll mỗi 6s khi audio đang phát
    useEffect(() => {
        if (!isAudioPlaying) return;

        const timer = setInterval(() => {
            setCurrentParagraph(prev => {
                if (prev < paragraphs.length - 1) {
                    return prev + 1;
                }
                return prev;
            });
        }, 10000); // 10 giây mỗi đoạn

        return () => clearInterval(timer);
    }, [isAudioPlaying, paragraphs.length]);

    const handleCardClick = (story) => {
        setSelectedStory(story);
        setCurrentParagraph(0);
        playSound('click');
    };

    const closeReader = () => {
        setSelectedStory(null);
    };

    const goToParagraph = (index) => {
        setCurrentParagraph(index);
        playSound('pageFlip');
    };

    const nextParagraph = () => {
        if (currentParagraph < paragraphs.length - 1) {
            setCurrentParagraph(prev => prev + 1);
            playSound('pageFlip');
        }
    };

    const prevParagraph = () => {
        if (currentParagraph > 0) {
            setCurrentParagraph(prev => prev - 1);
            playSound('pageFlip');
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

            {/* Library Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {STORIES.map((story) => (
                    <motion.div
                        key={story.id}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="cursor-pointer group"
                        onClick={() => handleCardClick(story)}
                    >
                        {/* Book Cover */}
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

                            {/* Story Title + Audio Button */}
                            <div className="text-center py-6 px-4 shrink-0">
                                <div className="text-4xl mb-2">{selectedStory.icon}</div>
                                <h2 className="text-2xl md:text-3xl font-bold">{selectedStory.title}</h2>
                                <p className="text-sm opacity-60 mt-2">
                                    {selectedStory.author} • {selectedStory.readingTime}
                                </p>

                                {/* Audio Player Button - Phát audio file MP3 */}
                                {selectedStory.audioUrl && (
                                    <div className="mt-4 flex justify-center">
                                        <button
                                            onClick={() => {
                                                // Tạo hoặc lấy audio element
                                                if (!audioRef.current) {
                                                    audioRef.current = new Audio();
                                                    audioRef.current.onplay = () => setIsAudioPlaying(true);
                                                    audioRef.current.onpause = () => setIsAudioPlaying(false);
                                                    audioRef.current.onended = () => setIsAudioPlaying(false);
                                                }

                                                const audio = audioRef.current;

                                                if (audio.src !== window.location.origin + selectedStory.audioUrl) {
                                                    audio.src = selectedStory.audioUrl;
                                                }

                                                if (audio.paused) {
                                                    audio.play().catch(e => {
                                                        alert('Chưa có file audio cho truyện này. Vui lòng đọc thủ công!');
                                                        console.log('Audio error:', e);
                                                    });
                                                } else {
                                                    audio.pause();
                                                }

                                                playSound('click');
                                            }}
                                            className={`flex items-center gap-2 px-5 py-2.5 font-medium rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all ${isAudioPlaying
                                                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                                                : 'bg-gradient-to-r from-[--brand] to-purple-500 text-white'
                                                }`}
                                        >
                                            {isAudioPlaying ? (
                                                /* Pause Icon */
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                    <rect x="6" y="4" width="4" height="16" rx="1"></rect>
                                                    <rect x="14" y="4" width="4" height="16" rx="1"></rect>
                                                </svg>
                                            ) : (
                                                /* Play Icon */
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                                </svg>
                                            )}
                                            <span>{isAudioPlaying ? 'Tạm dừng' : 'Nghe đọc truyện'}</span>
                                        </button>
                                    </div>
                                )}
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

                            {/* Controls Footer - Chỉ nút Next/Previous */}
                            <div className="p-4 border-t border-black/10 bg-black/5 backdrop-blur-sm shrink-0">
                                <div className="flex items-center justify-center gap-6">
                                    {/* Previous */}
                                    <button
                                        onClick={prevParagraph}
                                        className="p-4 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 transition-all"
                                        disabled={currentParagraph === 0}
                                    >
                                        <ChevronLeft size={28} />
                                    </button>

                                    {/* Progress text */}
                                    <div className="text-center min-w-[100px]">
                                        <p className="text-lg font-bold">{currentParagraph + 1} / {paragraphs.length}</p>
                                        <p className="text-xs opacity-60">đoạn văn</p>
                                    </div>

                                    {/* Next */}
                                    <button
                                        onClick={nextParagraph}
                                        className="p-4 rounded-full bg-[--brand] text-white hover:opacity-90 disabled:opacity-30 transition-all"
                                        disabled={currentParagraph === paragraphs.length - 1}
                                    >
                                        <ChevronRight size={28} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
