// src/pages/Wellness.jsx
// Chú thích: Liều thuốc tinh thần v2.0 - Nâng cấp với nhiều nội dung hay cho học sinh
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import GlowOrbs from '../components/ui/GlowOrbs';
import {
    Heart, Sparkles, Flame, Wind, RefreshCw, Star, Shield, Users,
    Droplet, Cloud, Frown, Angry, AlertCircle, Zap, BookOpen, HeartCrack,
    Coffee, Music, Phone, TreePine, PenLine, Volume2, CheckCircle2
} from 'lucide-react';

// ===== NHÓM CẢM XÚC MỞ RỘNG (10 nhóm) =====
const EMOTION_GROUPS = [
    {
        id: 'motivation',
        name: '💪 Động lực học tập',
        icon: Flame,
        color: 'from-orange-500 to-red-500',
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
        name: '💝 Yêu bản thân',
        icon: Heart,
        color: 'from-pink-500 to-rose-500',
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
        name: '🧘 Bình yên',
        icon: Wind,
        color: 'from-blue-500 to-cyan-500',
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
        name: '⭐ Tự tin',
        icon: Star,
        color: 'from-yellow-500 to-amber-500',
        quotes: [
            'Bạn có thể làm được nhiều hơn bạn nghĩ!',
            'Đừng so sánh mình với người khác, hãy so với chính mình ngày hôm qua.',
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
        name: '😤 Giảm áp lực',
        icon: Shield,
        color: 'from-purple-500 to-indigo-500',
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
    {
        id: 'friendship',
        name: '👫 Tình bạn',
        icon: Users,
        color: 'from-teal-500 to-green-500',
        quotes: [
            'Bạn bè tốt không cần nhiều, chỉ cần thật lòng.',
            'Hãy là người bạn mà bạn muốn có.',
            'Một tin nhắn nhỏ có thể làm ai đó vui cả ngày.',
            'Không ai hoàn hảo, kể cả bạn của bạn.',
            'Bạn có thể là ánh sáng trong ngày tối của ai đó.',
            'Tình bạn cần được chăm sóc như cây cần tưới nước.',
            'Mọi người đều có câu chuyện riêng, hãy lắng nghe.',
            'Dũng cảm làm quen với người mới, bạn có thể ngạc nhiên.',
        ],
    },
    // ===== NHÓM MỚI =====
    {
        id: 'sad',
        name: '😢 Khi buồn',
        icon: Frown,
        color: 'from-slate-500 to-gray-500',
        quotes: [
            'Khóc không phải là yếu đuối, đó là cách cơ thể giải tỏa.',
            'Nỗi buồn rồi sẽ qua, nhưng bạn sẽ mạnh mẽ hơn.',
            'Đừng cố tỏ ra ổn nếu bạn không ổn.',
            'Những ngày buồn là một phần của cuộc sống, không phải lỗi của bạn.',
            'Bạn được phép cảm thấy buồn mà không cần giải thích.',
            'Sau cơn mưa trời lại sáng.',
            'Nỗi đau sẽ dạy bạn trân trọng hạnh phúc hơn.',
            'Hãy để cảm xúc được chảy, đừng kìm nén.',
        ],
    },
    {
        id: 'angry',
        name: '😠 Khi tức giận',
        icon: Angry,
        color: 'from-red-600 to-orange-600',
        quotes: [
            'Tức giận là bình thường, quan trọng là cách bạn xử lý nó.',
            'Hít thở sâu trước khi phản ứng.',
            'Đừng để cơn giận làm bạn nói những điều mình không muốn.',
            'Thời gian là bạn. Hãy đợi cơn giận qua đi.',
            'Bạn có quyền tức giận, nhưng không phải lúc nào cũng phải hành động.',
            'Viết ra điều bạn muốn nói thay vì nói ngay.',
            'Tức giận giống như cầm than nóng - người bị bỏng là bạn.',
            'Đôi khi im lặng là câu trả lời mạnh mẽ nhất.',
        ],
    },
    {
        id: 'anxious',
        name: '😰 Khi lo lắng',
        icon: AlertCircle,
        color: 'from-amber-500 to-yellow-500',
        quotes: [
            '99% điều chúng ta lo sợ sẽ không xảy ra.',
            'Hãy tập trung vào hiện tại, không phải tương lai.',
            'Lo lắng không thay đổi được ngày mai, nhưng lấy đi hôm nay.',
            'Bạn đã từng vượt qua những ngày khó khăn trước đây.',
            'Một bước nhỏ cũng là tiến bộ.',
            'Hít vào 4 giây, giữ 4 giây, thở ra 4 giây.',
            'Bạn mạnh mẽ hơn nỗi lo của mình.',
            'Hãy tự hỏi: 5 năm sau điều này có còn quan trọng không?',
        ],
    },
    {
        id: 'exam',
        name: '📚 Trước kỳ thi',
        icon: BookOpen,
        color: 'from-indigo-500 to-blue-500',
        quotes: [
            'Bạn đã chuẩn bị. Giờ hãy tin vào bản thân.',
            'Điểm số không định nghĩa giá trị của bạn.',
            'Làm hết khả năng, kết quả sẽ đến.',
            'Nghỉ ngơi cũng quan trọng như học.',
            'Đừng hoảng loạn. Bình tĩnh làm từng câu.',
            'Một kỳ thi chỉ là một kỳ thi, không phải cả cuộc đời.',
            'Bạn đã từng vượt qua nhiều kỳ thi rồi.',
            'Tin vào những gì bạn đã học.',
            'Ngủ đủ giấc trước khi thi quan trọng hơn thức khuya ôn.',
        ],
    },
];

// ===== LỜI HAY Ý ĐẸP TỪ DANH NHÂN =====
const WISE_QUOTES = [
    { author: 'Thích Nhất Hạnh', quote: 'Hạnh phúc không nằm ở đích đến mà nằm trên hành trình.' },
    { author: 'Albert Einstein', quote: 'Trí tưởng tượng quan trọng hơn kiến thức.' },
    { author: 'Đức Đạt Lai Lạt Ma', quote: 'Hãy tử tế bất cứ khi nào có thể. Luôn luôn có thể.' },
    { author: 'Mahatma Gandhi', quote: 'Hãy là sự thay đổi mà bạn muốn thấy ở thế giới.' },
    { author: 'Hồ Chí Minh', quote: 'Không có việc gì khó, chỉ sợ lòng không bền.' },
    { author: 'Nelson Mandela', quote: 'Giáo dục là vũ khí mạnh nhất để thay đổi thế giới.' },
    { author: 'Khổng Tử', quote: 'Hành trình vạn dặm bắt đầu từ một bước chân.' },
    { author: 'Helen Keller', quote: 'Điều duy nhất tồi tệ hơn mù là có thị lực mà không có tầm nhìn.' },
    { author: 'Walt Disney', quote: 'Mọi giấc mơ đều có thể thành hiện thực nếu bạn có can đảm theo đuổi.' },
    { author: 'Steve Jobs', quote: 'Hãy đói khát. Hãy dại khờ.' },
];

// ===== HOẠT ĐỘNG TỰ CHĂM SÓC =====
const SELFCARE_ACTIVITIES = [
    { id: 'water', icon: Droplet, label: 'Uống nước', time: '30 giây', color: 'from-cyan-400 to-blue-400' },
    { id: 'stretch', icon: Zap, label: 'Vươn vai', time: '1 phút', color: 'from-yellow-400 to-orange-400' },
    { id: 'music', icon: Music, label: 'Nghe nhạc thư giãn', time: '5 phút', color: 'from-purple-400 to-pink-400' },
    { id: 'gratitude', icon: PenLine, label: 'Viết 3 điều biết ơn', time: '3 phút', color: 'from-green-400 to-teal-400' },
    { id: 'nature', icon: TreePine, label: 'Ra ngoài hít thở', time: '5 phút', color: 'from-emerald-400 to-green-400' },
    { id: 'call', icon: Phone, label: 'Gọi điện người thân', time: '10 phút', color: 'from-blue-400 to-indigo-400' },
];

export default function Wellness() {
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [currentQuote, setCurrentQuote] = useState('');
    const [activeTab, setActiveTab] = useState('breathing'); // breathing | quotes | wise | selfcare
    const [completedActivities, setCompletedActivities] = useState([]);
    const [dailyWiseQuote] = useState(() => WISE_QUOTES[Math.floor(Math.random() * WISE_QUOTES.length)]);

    // ===== BONG BÓNG THỞ 30S =====
    const [isBreathing, setIsBreathing] = useState(false);
    const [breathPhase, setBreathPhase] = useState('idle');
    const [timeLeft, setTimeLeft] = useState(30);
    const timerRef = useRef(null);
    const breathingRef = useRef(false);

    const getRandomQuote = (group) => {
        const quotes = group.quotes;
        const randomIndex = Math.floor(Math.random() * quotes.length);
        setCurrentQuote(quotes[randomIndex]);
        setSelectedGroup(group);
    };

    const startBreathing = () => {
        setIsBreathing(true);
        breathingRef.current = true;
        setTimeLeft(30);
        runBreathingCycle();
    };

    const stopBreathing = () => {
        setIsBreathing(false);
        breathingRef.current = false;
        setBreathPhase('idle');
        setTimeLeft(30);
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    const runBreathingCycle = async () => {
        for (let i = 0; i < 2 && breathingRef.current; i++) {
            setBreathPhase('inhale');
            await sleep(4000);
            if (!breathingRef.current) return;

            setBreathPhase('hold');
            await sleep(4000);
            if (!breathingRef.current) return;

            setBreathPhase('exhale');
            await sleep(6000);
            if (!breathingRef.current) return;
        }
        setIsBreathing(false);
        breathingRef.current = false;
        setBreathPhase('idle');
    };

    const sleep = (ms) => new Promise(resolve => {
        timerRef.current = setTimeout(resolve, ms);
    });

    const toggleActivity = (id) => {
        setCompletedActivities(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    useEffect(() => {
        if (isBreathing && timeLeft > 0) {
            const interval = setInterval(() => {
                setTimeLeft(prev => prev <= 1 ? 0 : prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isBreathing, timeLeft]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return (
        <div className="min-h-[70vh] relative">
            <GlowOrbs className="opacity-30" />

            <div className="relative z-10 max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-[--brand]" />
                        <span className="gradient-text">Liều thuốc tinh thần</span>
                    </h1>
                    <p className="text-[--muted] text-sm mt-1">
                        Nạp năng lượng tích cực cho ngày mới 💫
                    </p>
                </motion.div>

                {/* Câu của ngày */}
                <Card variant="glass" className="bg-gradient-to-r from-[--brand]/5 to-[--accent]/5">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[--brand] to-[--accent] flex items-center justify-center shrink-0">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-[--muted] text-xs mb-1">💡 Câu nói của ngày</p>
                            <p className="text-[--text] font-medium italic">"{dailyWiseQuote.quote}"</p>
                            <p className="text-[--muted] text-sm mt-1">— {dailyWiseQuote.author}</p>
                        </div>
                    </div>
                </Card>

                {/* Tab Navigation */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {[
                        { id: 'breathing', label: 'Thở thư giãn', icon: Wind },
                        { id: 'quotes', label: 'Động viên', icon: Heart },
                        { id: 'wise', label: 'Lời hay ý đẹp', icon: BookOpen },
                        { id: 'selfcare', label: 'Tự chăm sóc', icon: Coffee },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-[--brand] to-[--brand-light] text-white shadow-lg'
                                    : 'bg-[--surface] text-[--text-secondary] hover:bg-[--surface-border]'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'breathing' && (
                        <motion.div key="breathing" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                            <Card variant="glass">
                                <div className="text-center py-6">
                                    <h2 className="font-semibold text-lg mb-4 flex items-center justify-center gap-2">
                                        <Wind className="w-5 h-5 text-blue-500" />
                                        Tìm bình yên - Thở theo bong bóng
                                    </h2>

                                    {!isBreathing ? (
                                        <div className="space-y-4">
                                            <p className="text-[--muted] text-sm">
                                                Hít thở sâu theo nhịp bong bóng trong 30 giây để thư giãn
                                            </p>
                                            <Button onClick={startBreathing} variant="primary" size="lg">
                                                🫧 Bắt đầu thở (30 giây)
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="py-8 space-y-6">
                                            <motion.div
                                                className={`w-40 h-40 mx-auto rounded-full flex items-center justify-center text-white font-bold text-xl shadow-2xl
                                                    ${breathPhase === 'inhale' ? 'bg-gradient-to-br from-blue-400 to-cyan-500' :
                                                        breathPhase === 'hold' ? 'bg-gradient-to-br from-purple-400 to-indigo-500' :
                                                            breathPhase === 'exhale' ? 'bg-gradient-to-br from-green-400 to-teal-500' : 'bg-gray-400'}`}
                                                animate={{
                                                    scale: breathPhase === 'inhale' ? 1.5 : breathPhase === 'hold' ? 1.5 : 1
                                                }}
                                                transition={{
                                                    duration: breathPhase === 'inhale' ? 4 : breathPhase === 'exhale' ? 6 : 0.3,
                                                    ease: 'easeInOut'
                                                }}
                                            >
                                                <div className="text-center">
                                                    {breathPhase === 'inhale' && '😮‍💨 Hít vào'}
                                                    {breathPhase === 'hold' && '😌 Giữ'}
                                                    {breathPhase === 'exhale' && '😮 Thở ra'}
                                                </div>
                                            </motion.div>
                                            <div className="text-[--muted]">
                                                Còn <span className="font-bold text-[--brand]">{timeLeft}s</span>
                                            </div>
                                            <Button onClick={stopBreathing} variant="ghost" size="sm">Dừng lại</Button>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {activeTab === 'quotes' && (
                        <motion.div key="quotes" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                            <div>
                                <h2 className="font-semibold text-lg mb-3">Bạn đang cần gì?</h2>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {EMOTION_GROUPS.map((group) => (
                                        <motion.button
                                            key={group.id}
                                            onClick={() => getRandomQuote(group)}
                                            className={`p-3 rounded-2xl bg-gradient-to-br ${group.color} text-white text-center
                                                hover:scale-105 active:scale-95 transition-transform shadow-lg`}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <group.icon className="w-5 h-5 mx-auto mb-1" />
                                            <span className="font-medium text-xs block">{group.name}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {currentQuote && (
                                    <motion.div key={currentQuote} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                        <Card className="text-center py-8">
                                            <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${selectedGroup?.color} flex items-center justify-center shadow-lg`}>
                                                {selectedGroup && <selectedGroup.icon className="w-8 h-8 text-white" />}
                                            </div>
                                            <p className="text-xl font-medium text-[--text] mb-4 px-4 leading-relaxed">
                                                "{currentQuote}"
                                            </p>
                                            <div className="flex justify-center gap-2">
                                                <Button variant="ghost" onClick={() => getRandomQuote(selectedGroup)} icon={<RefreshCw size={16} />}>
                                                    Câu khác
                                                </Button>
                                            </div>
                                        </Card>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}

                    {activeTab === 'wise' && (
                        <motion.div key="wise" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                            <h2 className="font-semibold text-lg">Lời hay ý đẹp từ danh nhân 📖</h2>
                            <div className="grid gap-3">
                                {WISE_QUOTES.map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <Card className="p-4">
                                            <p className="text-[--text] font-medium italic mb-2">"{item.quote}"</p>
                                            <p className="text-[--muted] text-sm">— {item.author}</p>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'selfcare' && (
                        <motion.div key="selfcare" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                            <div>
                                <h2 className="font-semibold text-lg mb-2">Hoạt động tự chăm sóc 🌸</h2>
                                <p className="text-[--muted] text-sm">Chọn hoạt động bạn đã làm hôm nay</p>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {SELFCARE_ACTIVITIES.map((activity) => {
                                    const isCompleted = completedActivities.includes(activity.id);
                                    return (
                                        <motion.button
                                            key={activity.id}
                                            onClick={() => toggleActivity(activity.id)}
                                            className={`p-4 rounded-2xl transition-all shadow-lg text-left ${isCompleted
                                                    ? 'bg-green-500 text-white'
                                                    : `bg-gradient-to-br ${activity.color} text-white hover:scale-105`
                                                }`}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <activity.icon className="w-6 h-6" />
                                                {isCompleted && <CheckCircle2 className="w-5 h-5" />}
                                            </div>
                                            <span className="font-medium text-sm block">{activity.label}</span>
                                            <span className="text-xs opacity-80">{activity.time}</span>
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {completedActivities.length > 0 && (
                                <Card className="text-center py-4 bg-green-500/10 border-green-500/20">
                                    <p className="text-green-600 dark:text-green-400 font-semibold">
                                        🎉 Tuyệt vời! Bạn đã hoàn thành {completedActivities.length} hoạt động hôm nay!
                                    </p>
                                </Card>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
