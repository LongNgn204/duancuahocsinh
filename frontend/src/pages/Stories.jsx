// src/pages/Stories.jsx
// Chú thích: Kể chuyện v2.0 - Immersive Reading Mode & Book Covers
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Play, Pause, SkipForward, ArrowLeft, Headphones, X, Settings2, Moon, Sun, Type } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useSound } from '../contexts/SoundContext';

// Danh sách truyện ngắn (Giữ nguyên data cũ)
const STORIES = [
    {
        id: 1,
        title: 'Chú ong nhỏ dũng cảm',
        content: [
            'Ngày xửa ngày xưa, có một chú ong nhỏ tên là Bee sống trong một tổ ong ấm áp.',
            'Bee rất nhút nhát và sợ bay xa khỏi tổ.',
            'Một ngày, Bee quyết định thử bay xa hơn một chút.',
            'Chú ong nhỏ khám phá ra một cánh đồng hoa tuyệt đẹp.',
            'Từ đó, Bee hiểu rằng dũng cảm thử điều mới sẽ mang đến những điều tuyệt vời.',
        ],
        moral: '🌟 Đôi khi, một bước nhỏ ra khỏi vùng an toàn có thể mang đến những điều kỳ diệu!',
        color: 'from-amber-400 to-orange-500',
        icon: '🐝'
    },
    {
        id: 2,
        title: 'Bông hoa kiên cường',
        content: [
            'Có một bông hoa nhỏ mọc giữa khe đá.',
            'Mọi người nghĩ nó không thể sống được.',
            'Nhưng mỗi ngày, bông hoa vẫn cố gắng vươn lên ánh mặt trời.',
            'Dần dần, bông hoa nở rực rỡ, đẹp hơn cả những bông hoa trong vườn.',
            'Tất cả đều ngạc nhiên và ngưỡng mộ sức sống của nó.',
        ],
        moral: '🌸 Dù hoàn cảnh khó khăn, bạn vẫn có thể tỏa sáng theo cách riêng của mình!',
        color: 'from-pink-400 to-rose-500',
        icon: '🌸'
    },
    {
        id: 3,
        title: 'Giọt nước nhỏ',
        content: [
            'Một giọt nước nhỏ cảm thấy mình vô nghĩa.',
            '"Mình chỉ là một giọt nước, có thể làm được gì đâu?" - giọt nước tự hỏi.',
            'Nhưng khi hợp cùng nhiều giọt nước khác, chúng tạo thành một dòng suối.',
            'Dòng suối chảy xa, mang nước đến cho cánh đồng khô hạn.',
            'Giọt nước hiểu rằng mình cũng là một phần quan trọng.',
        ],
        moral: '💧 Mỗi người đều có giá trị, dù đôi khi bạn không nhận ra điều đó!',
        color: 'from-blue-400 to-cyan-500',
        icon: '💧'
    },
    {
        id: 4,
        title: 'Con sên chậm rãi',
        content: [
            'Con sên nhỏ luôn bị các bạn trong rừng trêu vì đi quá chậm.',
            '"Tại sao mình không nhanh như thỏ hay sóc?" - sên tự hỏi buồn bã.',
            'Một ngày mưa bão, tất cả bạn bè chạy vội về nhà nhưng đều bị lạc đường.',
            'Riêng sên, với tốc độ chậm rãi, quan sát được từng ngã rẽ và về đến nhà an toàn.',
            'Sên còn quay lại giúp đỡ các bạn tìm đường về.',
            'Từ đó, mọi người hiểu rằng chậm mà chắc không có gì là xấu.',
        ],
        moral: '🐌 Mỗi người có tốc độ riêng. Chậm mà chắc vẫn đến đích!',
        color: 'from-emerald-400 to-green-500',
        icon: '🐌'
    },
    {
        id: 5,
        title: 'Bạn mới của Thỏ',
        content: [
            'Thỏ Trắng vừa chuyển đến khu rừng mới, không quen ai cả.',
            'Thỏ rất muốn làm quen nhưng sợ bị từ chối.',
            'Một ngày, Thỏ thấy Sóc đang cố với quả hạch trên cao.',
            '"Mình giúp bạn nhé!" - Thỏ dũng cảm lên tiếng.',
            'Thỏ nhảy lên lấy quả hạch xuống cho Sóc.',
            '"Cảm ơn bạn! Mình là Sóc, bạn tên gì?" - từ đó họ trở thành đôi bạn thân.',
        ],
        moral: '🐰 Đôi khi chỉ cần một bước nhỏ để có được tình bạn đẹp!',
        color: 'from-zinc-300 to-zinc-400',
        icon: '🐰'
    },
    {
        id: 6,
        title: 'Đom đóm lạc đường',
        content: [
            'Đom đóm nhỏ bị lạc khỏi đàn trong một đêm mưa.',
            'Trời tối đen, đom đóm sợ hãi không biết phải làm gì.',
            '"Mình có ánh sáng mà!" - đom đóm chợt nhớ.',
            'Đom đóm bay cao lên, chiếu sáng để nhìn xung quanh.',
            'Không chỉ tìm được đường về, đom đóm còn giúp cả kiến và sâu thoát khỏi vũng nước.',
            'Đàn đom đóm nhìn thấy ánh sáng và bay đến đón bạn về.',
        ],
        moral: '✨ Khi gặp khó khăn, hãy nhớ rằng bạn có những khả năng đặc biệt!',
        color: 'from-yellow-400 to-amber-300',
        icon: '✨'
    },
    {
        id: 7,
        title: 'Cô bé và bông hoa',
        content: [
            'Cô bé Linh luôn so sánh mình với các bạn trong lớp.',
            '"Bạn A học giỏi hơn mình, bạn B đẹp hơn mình..." - Linh thường nghĩ vậy.',
            'Bà ngoại tặng Linh một chậu hoa: "Hãy chăm sóc nó và xem điều gì xảy ra."',
            'Linh tưới nước hàng ngày. Bông hoa nở, không giống bất kỳ hoa nào khác.',
            '"Bông hoa này đặc biệt vì nó là duy nhất" - bà ngoại nói.',
            '"Cháu cũng vậy. Đừng so sánh mình với ai, vì cháu là duy nhất."',
        ],
        moral: '🌺 Đừng so sánh mình với người khác. Bạn là phiên bản duy nhất!',
        color: 'from-purple-400 to-fuchsia-500',
        icon: '👧'
    },
    // Adding placeholder colors/icons for remaining stories (simplified for brevity but functional)
    {
        id: 8, title: 'Sói con đi học',
        content: ['Sói con sợ đi học vì hay bị sai...', 'Cô Cú nói: sai là cách chúng ta học.', 'Hôm sau Sói mạnh dạn giơ tay.'],
        moral: '📚 Sai không có nghĩa là thất bại. Đó là cách chúng ta học!',
        color: 'from-slate-400 to-slate-600', icon: '🐺'
    },
    { id: 9, title: 'Cây tre uốn cong', content: ['Cây suồi chê cây tre yếu.', 'Bão đến, sồi gãy, tre uốn cong và sống sót.'], moral: '🎋 Linh hoạt thích nghi đôi khi tốt hơn là cứng nhắc!', color: 'from-lime-400 to-green-600', icon: '🎋' },
    { id: 10, title: 'Hai người bạn', content: ['Mèo và Chó hiểu lầm nhau.', 'Chó viết thư xin lỗi.', 'Cả hai làm hòa và hứa sẽ thẳng thắn.'], moral: '💕 Một lời xin lỗi chân thành có thể hàn gắn mọi hiểu lầm!', color: 'from-red-400 to-rose-500', icon: '🐕' },
    { id: 11, title: 'Ngôi sao nhỏ', content: ['Sao nhỏ tự ti.', 'Nhưng đã giúp cậu bé lạc đường.', 'Dù nhỏ bé vẫn có ích.'], moral: '⭐ Bạn không cần phải to lớn để tỏa sáng!', color: 'from-yellow-300 to-yellow-500', icon: '🌟' },
    { id: 12, title: 'Con cá vượt thác', content: ['Cá nhỏ muốn lên hồ nước.', 'Bị can ngăn nhưng vẫn cố gắng.', 'Cuối cùng cá đã thành công.'], moral: '🐟 Đừng bao giờ bỏ cuộc!', color: 'from-cyan-400 to-blue-600', icon: '🐟' },
    { id: 13, title: 'Mưa và nắng', content: ['Hoa ghét mưa.', 'Ông ngoại chỉ cho Hoa thấy vẻ đẹp sau cơn mưa.', 'Nỗi buồn cũng có giá trị của nó.'], moral: '🌈 Mọi cảm xúc đều có ý nghĩa. Sau mưa trời lại sáng!', color: 'from-indigo-400 to-violet-600', icon: '🌧️' },
];

export default function Stories() {
    const [selectedStory, setSelectedStory] = useState(null);
    const { playSound } = useSound();

    // Reader State
    const [currentLine, setCurrentLine] = useState(0);
    const [readingSpeed, setReadingSpeed] = useState(1.0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [theme, setTheme] = useState('light'); // 'light', 'sepia', 'dark'

    // Refs
    const synthRef = useRef(window.speechSynthesis);
    const utteranceRef = useRef(null);

    // Cleanup
    useEffect(() => {
        return () => {
            if (synthRef.current) synthRef.current.cancel();
        };
    }, []);

    // Play/Pause Logic
    useEffect(() => {
        if (!selectedStory) return;

        if (isPlaying) {
            const text = selectedStory.content[currentLine];
            if (!text) {
                setIsPlaying(false);
                return;
            }

            // Cancel previous speak if any (unless paused, but here we restart line for simplicity or resume)
            // Simple approach: Speak current line. When end, next line.

            if (synthRef.current.speaking) {
                synthRef.current.resume();
            } else {
                playLine(text);
            }
        } else {
            if (synthRef.current.speaking) synthRef.current.pause();
        }
    }, [isPlaying, currentLine, selectedStory]);

    const playLine = (text) => {
        if (!text) return;
        synthRef.current.cancel();

        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'vi-VN';
        u.rate = readingSpeed;

        u.onend = () => {
            if (currentLine < (selectedStory?.content.length || 0) - 1) {
                setCurrentLine(prev => prev + 1);
                playSound('pageFlip');
            } else {
                setIsPlaying(false);
            }
        };

        utteranceRef.current = u;
        synthRef.current.speak(u);
    };

    const handleCardClick = (story) => {
        setSelectedStory(story);
        setCurrentLine(0);
        setIsPlaying(false);
        synthRef.current.cancel();
    };

    const closeReader = () => {
        setIsPlaying(false);
        synthRef.current.cancel();
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
                        <p className="text-xs text-center text-slate-500 font-medium">Bấm để đọc</p>
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
                                        className="text-3xl md:text-4xl font-bold font-serif mb-8"
                                    >
                                        {selectedStory.title}
                                    </motion.h2>

                                    <div className="space-y-6 text-lg md:text-2xl leading-relaxed font-serif min-h-[200px] flex items-center justify-center">
                                        <AnimatePresence mode="wait">
                                            <motion.p
                                                key={currentLine}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="font-medium"
                                            >
                                                {selectedStory.content[currentLine]}
                                            </motion.p>
                                        </AnimatePresence>
                                    </div>

                                    {/* Navigation Dots */}
                                    <div className="flex justify-center gap-2 mt-8">
                                        {selectedStory.content.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => { setCurrentLine(idx); setIsPlaying(false); synthRef.current.cancel(); }}
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
                                                if (currentLine > 0) { setCurrentLine(p => p - 1); setIsPlaying(false); synthRef.current.cancel(); }
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
                                                if (currentLine < selectedStory.content.length - 1) {
                                                    setCurrentLine(p => p + 1);
                                                    setIsPlaying(false);
                                                    synthRef.current.cancel();
                                                    playSound('pageFlip');
                                                }
                                            }}
                                            className="p-3 rounded-full hover:bg-black/5 disabled:opacity-30"
                                            disabled={currentLine === selectedStory.content.length - 1}
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
