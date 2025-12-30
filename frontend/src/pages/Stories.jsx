// src/pages/Stories.jsx
// Chú thích: Kể chuyện v2.0 - Immersive Reading Mode & Book Covers
// v2.2: Content dạng string, đọc từng câu (tối ưu TTS)
// v2.3: Sử dụng useTTS hook (SpeechSynthesis)
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Play, Pause, SkipForward, ArrowLeft, Moon, Sun, Type } from 'lucide-react';
import Button from '../components/ui/Button';
import { useSound } from '../contexts/SoundContext';
import { useTTS } from '../hooks/useTTS';

import { STORIES } from '../data/stories';

export default function Stories() {
    const [selectedStory, setSelectedStory] = useState(null);
    const { playSound } = useSound();
    const { play: ttsPlay, stop: ttsStop, speaking } = useTTS('vi-VN');

    // Reader State
    const [currentLine, setCurrentLine] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [theme, setTheme] = useState('light'); // 'light', 'sepia', 'dark'

    // Chú thích: Split content thành từng câu cho TTS - Tương thích Unicode tiếng Việt
    const getSentences = (content) => {
        if (!content) return [];
        if (Array.isArray(content)) return content; // Backward compatibility

        // Cách tiếp cận an toàn hơn cho tiếng Việt:
        // Split theo dấu chấm câu + khoảng trắng, lưu giữ dấu chấm
        const result = [];
        let current = '';

        for (let i = 0; i < content.length; i++) {
            current += content[i];

            // Nếu gặp dấu chấm câu và ký tự tiếp theo là khoảng trắng hoặc hết chuỗi
            if ((content[i] === '.' || content[i] === '!' || content[i] === '?') &&
                (i === content.length - 1 || content[i + 1] === ' ')) {
                if (current.trim()) {
                    result.push(current.trim());
                }
                current = '';
                // Skip khoảng trắng sau dấu chấm
                if (i + 1 < content.length && content[i + 1] === ' ') {
                    i++;
                }
            }
        }

        // Thêm phần còn lại nếu có
        if (current.trim()) {
            result.push(current.trim());
        }

        return result;
    };

    // Memoized sentences for current story
    const sentences = useMemo(() => {
        return selectedStory ? getSentences(selectedStory.content) : [];
    }, [selectedStory]);

    // Get current sentence text - normalize để fix dấu tiếng Việt
    // Chú thích: NFC normalization đảm bảo dấu gắn liền với chữ cái (ví dụ: "rất" thay vì "râ´t")
    const currentSentence = (sentences[currentLine] || '').normalize('NFC');

    // Auto advance to next sentence
    const advanceToNext = useCallback(() => {
        if (currentLine < sentences.length - 1) {
            setCurrentLine(prev => prev + 1);
            playSound('pageFlip');
        } else {
            setIsPlaying(false);
        }
    }, [currentLine, sentences.length, playSound]);

    // Play current sentence
    useEffect(() => {
        if (!isPlaying || !currentSentence) {
            if (!isPlaying) ttsStop();
            return;
        }

        ttsPlay(currentSentence, { rate: 1.0 });
    }, [isPlaying, currentSentence, ttsPlay, ttsStop]);

    // Watch for speech end to advance
    useEffect(() => {
        if (isPlaying && !speaking && currentSentence) {
            // Small delay to ensure speech has ended
            const timer = setTimeout(() => {
                advanceToNext();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [speaking, isPlaying, currentSentence, advanceToNext]);

    // Cleanup on unmount
    useEffect(() => {
        return () => ttsStop();
    }, [ttsStop]);

    const handleCardClick = (story) => {
        setSelectedStory(story);
        setCurrentLine(0);
        setIsPlaying(false);
        ttsStop();
    };

    const closeReader = () => {
        setIsPlaying(false);
        ttsStop();
        setSelectedStory(null);
    };

    const getThemeClass = () => {
        switch (theme) {
            case 'sepia': return 'bg-[#f4ecd8] text-[#5b4636]';
            case 'dark': return 'bg-slate-900 text-slate-200';
            default: return 'bg-white text-slate-800';
        }
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Thư Viện <span className="text-[--brand]">Truyện</span> 📚</h1>
                    <p className="text-slate-500">Nuôi dưỡng tâm hồn qua những trang sách.</p>
                </div>
            </div>

            {/* Library Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
                {STORIES.map((story) => (
                    <motion.div
                        key={story.id}
                        whileHover={{ y: -5 }}
                        className="cursor-pointer group"
                        onClick={() => { handleCardClick(story); playSound('click'); }}
                    >
                        {/* Book Cover */}
                        <div className={`
                            aspect-[2/3] rounded-r-xl rounded-l-sm shadow-md mb-3 relative overflow-hidden
                            bg-gradient-to-br ${story.color}
                            group-hover:shadow-xl transition-all duration-300
                            border-l-4 border-white/20
                        `}>
                            {/* Spine shadow */}
                            <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-black/20 to-transparent"></div>

                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white">
                                <div className="text-4xl mb-2 filter drop-shadow-md">{story.icon}</div>
                                <h3 className="font-bold text-lg leading-tight drop-shadow-sm line-clamp-3">
                                    {story.title}
                                </h3>
                            </div>
                        </div>
                        <button className="w-full mt-2 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all">
                            📖 Bấm để đọc
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* Immersive Reader Modal */}
            <AnimatePresence>
                {selectedStory && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <div className={`
                            w-full max-w-3xl h-[85vh] rounded-3xl shadow-2xl flex flex-col relative overflow-hidden
                            transition-colors duration-500
                            ${getThemeClass()}
                        `}>
                            {/* Reader Toolbar */}
                            <div className="flex items-center justify-between p-4 border-b border-black/5 bg-black/5 backdrop-blur-sm">
                                <Button variant="ghost" icon={<ArrowLeft size={20} />} onClick={closeReader} className="rounded-full">
                                    Thoát
                                </Button>

                                <div className="flex gap-2 bg-white/10 rounded-full p-1 border border-black/5">
                                    <button onClick={() => setTheme('light')} className={`p-2 rounded-full ${theme === 'light' ? 'bg-white shadow-sm' : ''}`}><Sun size={18} /></button>
                                    <button onClick={() => setTheme('sepia')} className={`p-2 rounded-full ${theme === 'sepia' ? 'bg-[#e3d0b0] shadow-sm' : ''}`}><Type size={18} /></button>
                                    <button onClick={() => setTheme('dark')} className={`p-2 rounded-full ${theme === 'dark' ? 'bg-slate-700 shadow-sm text-white' : ''}`}><Moon size={18} /></button>
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 overflow-y-auto p-8 md:p-12 text-center flex flex-col items-center justify-center">
                                <div className="max-w-xl mx-auto space-y-8">
                                    <motion.h2
                                        key={selectedStory.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-3xl md:text-4xl font-bold mb-8"
                                    >
                                        {selectedStory.title}
                                    </motion.h2>

                                    <div className="space-y-6 text-lg md:text-2xl leading-relaxed min-h-[200px] flex items-center justify-center">
                                        <AnimatePresence mode="wait">
                                            <motion.p
                                                key={currentLine}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="font-medium"
                                            >
                                                {currentSentence}
                                            </motion.p>
                                        </AnimatePresence>
                                    </div>

                                    {/* Navigation Dots */}
                                    <div className="flex justify-center gap-2 mt-8">
                                        {sentences.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => { setCurrentLine(idx); setIsPlaying(false); if (geminiAudioRef.current?.stop) { geminiAudioRef.current.stop(); geminiAudioRef.current = null; } }}
                                                className={`w-2 h-2 rounded-full transition-all ${idx === currentLine ? 'w-6 bg-[--brand]' : 'bg-current opacity-30'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Moral & Controls Footer */}
                            <div className="p-6 border-t border-black/5 bg-black/5 backdrop-blur-sm">
                                <div className="mb-4 text-center">
                                    <span className="inline-block px-4 py-1 rounded-full bg-[--brand]/10 text-[--brand] text-sm font-bold mb-2">
                                        Bài học
                                    </span>
                                    <p className="font-medium italic opacity-80">{selectedStory.moral}</p>
                                </div>

                                <div className="flex justify-center items-center gap-6">
                                    {/* Speed Control */}
                                    {/* Simplified for UI cleanliness */}

                                    {/* Play Controls */}
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => {
                                                if (currentLine > 0) { setCurrentLine(p => p - 1); setIsPlaying(false); if (geminiAudioRef.current?.stop) { geminiAudioRef.current.stop(); geminiAudioRef.current = null; } }
                                            }}
                                            className="p-3 rounded-full hover:bg-black/5 disabled:opacity-30"
                                            disabled={currentLine === 0}
                                        >
                                            <SkipForward className="rotate-180" size={24} />
                                        </button>

                                        <button
                                            onClick={() => { setIsPlaying(!isPlaying); playSound('click'); }}
                                            className="w-16 h-16 rounded-full bg-[--brand] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                                        >
                                            {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                                        </button>

                                        <button
                                            onClick={() => {
                                                if (currentLine < sentences.length - 1) {
                                                    setCurrentLine(p => p + 1);
                                                    setIsPlaying(false);
                                                    if (geminiAudioRef.current?.stop) { geminiAudioRef.current.stop(); geminiAudioRef.current = null; }
                                                    playSound('pageFlip');
                                                }
                                            }}
                                            className="p-3 rounded-full hover:bg-black/5 disabled:opacity-30"
                                            disabled={currentLine === sentences.length - 1}
                                        >
                                            <SkipForward size={24} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
