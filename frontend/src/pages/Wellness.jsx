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

// ===== NHÓM CẢM XÚC MỞ RỘNG (10 nhóm) =====
const EMOTION_GROUPS = [
    {
        id: 'motivation',
        name: 'Động lực học tập',
        icon: Flame,
        gradient: 'from-orange-400 to-red-500',
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        quotes: [
            'Mỗi bước nhỏ đều đưa bạn đến gần hơn với mục tiêu!',
            'Học tập không phải là cuộc đua, hãy đi theo nhịp của riêng bạn.',
            'Thất bại không phải kết thúc, mà là bài học quý giá.',
            'Bạn đã vượt qua được nhiều khó khăn, lần này cũng vậy!',
            'Nghỉ ngơi không phải là lười biếng, đó là tái tạo năng lượng.',
            'Không ai hoàn hảo ngay từ đầu, điều quan trọng là bạn đang cố gắng.',
            'Hôm nay khó khăn, nhưng ngày mai sẽ dễ dàng hơn.',
            'Mỗi giờ học là một viên gạch xây nên tương lai.',
            'Đừng so sánh chương 1 của bạn với chương 20 của người khác.',
            'Kiên trì là chìa khóa. Từng bước nhỏ cũng là tiến bộ.',
        ],
    },
    {
        id: 'selflove',
        name: 'Yêu bản thân',
        icon: Heart,
        gradient: 'from-pink-400 to-rose-500',
        bg: 'bg-pink-50',
        text: 'text-pink-600',
        quotes: [
            'Bạn xứng đáng được yêu thương, bắt đầu từ chính mình.',
            'Không cần hoàn hảo để được yêu thương.',
            'Hãy tha thứ cho bản thân như cách bạn tha thứ cho người khác.',
            'Bạn độc đáo và đó là sức mạnh của bạn!',
            'Chăm sóc bản thân không phải ích kỷ, đó là cần thiết.',
            'Bạn đáng được nghỉ ngơi, không cần giải thích lý do.',
            'Yêu bản thân là món quà tốt nhất bạn có thể trao cho mình.',
            'Bạn đủ tốt như hiện tại.',
            'Hãy đối xử với bản thân như cách bạn đối xử với người bạn thân nhất.',
            'Bạn không cần chứng minh giá trị của mình với ai cả.',
        ],
    },
    {
        id: 'calm',
        name: 'Bình yên',
        icon: Wind,
        gradient: 'from-blue-400 to-cyan-500',
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        quotes: [
            'Hít thở sâu, mọi thứ rồi sẽ ổn.',
            'Đừng lo lắng về ngày mai, hãy sống trọn vẹn hôm nay.',
            'Bạn không cần kiểm soát mọi thứ.',
            'Cho phép bản thân nghỉ ngơi, bạn không phải robot.',
            'Cảm xúc sẽ đến và đi, bạn vẫn ở đây.',
            'Một phút bình yên có thể thay đổi cả ngày.',
            'Bão tố rồi sẽ qua, mặt trời sẽ lại lên.',
            'Chậm lại một chút, cuộc sống không chạy đua.',
            'Không sao cả, bạn được phép không ổn.',
            'Hãy buông bỏ những gì không thuộc về bạn.',
        ],
    },
    {
        id: 'confidence',
        name: 'Tự tin',
        icon: Star,
        gradient: 'from-yellow-400 to-amber-500',
        bg: 'bg-yellow-50',
        text: 'text-yellow-600',
        quotes: [
            'Bạn có thể làm được nhiều hơn bạn nghĩ!',
            'Đừng so sánh mình với người khác.',
            'Mỗi người có con đường riêng, hãy tin vào hành trình của bạn.',
            'Sai lầm là cách bạn học, không phải thất bại.',
            'Bạn đã rất dũng cảm khi cố gắng mỗi ngày!',
            'Tin vào bản thân, bạn có năng lực riêng.',
            'Bạn xứng đáng có mặt ở đây, đừng nghi ngờ điều đó.',
            'Giọng nói của bạn quan trọng, hãy dám lên tiếng.',
            'Bạn không cần ai cho phép để tỏa sáng.',
        ],
    },
    {
        id: 'stress',
        name: 'Giảm áp lực',
        icon: Shield,
        gradient: 'from-purple-400 to-indigo-500',
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        quotes: [
            'Áp lực là tạm thời, sức mạnh của bạn là vĩnh viễn.',
            'Không phải lúc nào cũng phải hoàn hảo.',
            'Hãy chia nhỏ vấn đề, từng bước một.',
            'Điểm số không phải tất cả, sức khỏe tinh thần quan trọng hơn.',
            'Bạn được phép nói "tôi cần giúp đỡ".',
            'Căng thẳng không có nghĩa là bạn yếu đuối.',
            'Bạn không cô đơn trong chuyện này.',
            'Hãy tập trung vào những gì bạn có thể kiểm soát.',
            'Một giấc ngủ ngon có thể thay đổi góc nhìn.',
        ],
    },
];

// ===== DANH SÁCH HOẠT ĐỘNG (12 hoạt động) =====
const ACTIVITIES = [
    { id: 'breathing', icon: Wind, text: 'Tập thở 1 phút', link: '/breathing', color: 'bg-blue-100 text-blue-600' },
    { id: 'water', icon: Droplet, text: 'Uống ly nước ấm', color: 'bg-cyan-100 text-cyan-600' },
    { id: 'sky', icon: Cloud, text: 'Nhìn bầu trời xanh', color: 'bg-sky-100 text-sky-600' },
    { id: 'walk', icon: Zap, text: 'Đi dạo ngắn', color: 'bg-green-100 text-green-600' },
    { id: 'music', icon: Music, text: 'Nghe nhạc không lời', color: 'bg-purple-100 text-purple-600' },
    { id: 'write', icon: PenLine, text: 'Viết ra lo lắng', color: 'bg-pink-100 text-pink-600' },
    { id: 'read', icon: BookOpen, text: 'Đọc 1 trang sách', link: '/stories', color: 'bg-amber-100 text-amber-600' },
    { id: 'nap', icon: Coffee, text: 'Chợp mắt 15 phút', color: 'bg-orange-100 text-orange-600' },
    { id: 'talk', icon: Phone, text: 'Gọi cho người thân', color: 'bg-rose-100 text-rose-600' },
    { id: 'nature', icon: TreePine, text: 'Chăm sóc cây cối', color: 'bg-emerald-100 text-emerald-600' },
    { id: 'clean', icon: Sparkles, text: 'Dọn bàn học', color: 'bg-teal-100 text-teal-600' },
    { id: 'grateful', icon: Heart, text: 'Viết nhật ký biết ơn', link: '/gratitude', color: 'bg-red-100 text-red-600' },
];

export default function Wellness() {
    const [selectedGroup, setSelectedGroup] = useState(EMOTION_GROUPS[0]);
    const [activeQuoteIndex, setActiveQuoteIndex] = useState(0);

    const handleCopyQuote = (quote) => {
        navigator.clipboard.writeText(quote);
        // Toast logic could go here
    };

    return (
        <div className="space-y-10 pb-10">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
                    Liều Thuốc <span className="text-[--brand]">Tinh Thần</span> 💊
                </h1>
                <p className="text-slate-500 max-w-xl mx-auto">
                    Những lời khuyên và hoạt động nhỏ giúp bạn cân bằng cảm xúc mỗi ngày.
                </p>
            </div>

            {/* --- EMOTION SELECTOR --- */}
            <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar snap-x px-4">
                {EMOTION_GROUPS.map((group) => (
                    <motion.button
                        key={group.id}
                        onClick={() => { setSelectedGroup(group); setActiveQuoteIndex(0); }}
                        whileTap={{ scale: 0.95 }}
                        className={`
                            shrink-0 snap-start flex items-center gap-2 px-5 py-3 rounded-2xl transition-all border
                            ${selectedGroup.id === group.id
                                ? `bg-gradient-to-r ${group.gradient} text-white shadow-lg shadow-${group.bg.split('-')[1]}-500/30 border-transparent`
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}
                        `}
                    >
                        <group.icon size={18} />
                        <span className="font-semibold whitespace-nowrap">{group.name}</span>
                    </motion.button>
                ))}
            </div>

            {/* --- INSTAGRAM STYLE QUOTE CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Visual Card */}
                <motion.div
                    key={selectedGroup.id + activeQuoteIndex}
                    initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ type: 'spring' }}
                    className={`
                        aspect-[4/5] md:aspect-square relative rounded-3xl overflow-hidden shadow-2xl
                        bg-gradient-to-br ${selectedGroup.gradient} p-8 flex flex-col justify-center items-center text-center
                    `}
                >
                    {/* Decor */}
                    <div className="absolute top-0 right-0 p-12 opacity-20"><Sparkles size={80} color="white" /></div>
                    <div className="absolute bottom-0 left-0 p-8 opacity-20"><Heart size={60} color="white" /></div>

                    <div className="relative z-10">
                        <div className="mb-6 w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto text-white">
                            <selectedGroup.icon size={32} />
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white leading-relaxed font-serif italic">
                            "{selectedGroup.quotes[activeQuoteIndex]}"
                        </h3>
                        <div className="mt-6 w-12 h-1 bg-white/50 rounded-full mx-auto" />
                    </div>

                    {/* Actions */}
                    <div className="absolute bottom-6 right-6 flex gap-2">
                        <button
                            onClick={() => handleCopyQuote(selectedGroup.quotes[activeQuoteIndex])}
                            className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors"
                            title="Sao chép"
                        >
                            <Share2 size={20} />
                        </button>
                    </div>
                </motion.div>

                {/* List & Controls */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl">
                        <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <BookOpen size={20} className="text-[--brand]" />
                            Lời hay ý đẹp
                        </h3>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                            {selectedGroup.quotes.map((q, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveQuoteIndex(idx)}
                                    className={`w-full text-left p-4 rounded-xl transition-all text-sm leading-relaxed
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

                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-2xl">
                                <Zap size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Cần thêm lời khuyên?</h3>
                                <p className="text-white/80 text-sm mb-3">AI luôn sẵn sàng lắng nghe bạn.</p>
                                <Link to="/chat">
                                    <button className="px-4 py-2 bg-white text-indigo-600 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-50 transition-colors">
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
                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <CheckCircle2 size={24} className="text-green-500" />
                    Hoạt động chăm sóc bản thân
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
