// src/components/gratitude/GratitudeJar.jsx
// Chú thích: Lọ Biết Ơn v2.0 - Premium Visuals & Animations
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import { Heart, Sparkles, Plus, Trash2, Calendar, Lightbulb, X, Edit3, Save, Volume2, VolumeX, RefreshCw } from 'lucide-react';
import { isLoggedIn, rewardXP } from '../../utils/api';
import Confetti from '../ui/Confetti';
import { useSound } from '../../contexts/SoundContext';
import { recordActivity } from '../../utils/streakService';

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

// Chú thích: 80 câu động viên để hiển thị trong card "Lời động viên"
const ENCOURAGEMENT_MESSAGES = [
    // Về niềm vui và hạnh phúc
    "Hãy nhớ rằng, những điều nhỏ bé nhất cũng có thể mang lại niềm vui lớn. Bạn đã làm rất tốt rồi!",
    "Mỗi ngày là một cơ hội mới để bạn tỏa sáng. Hãy tin vào bản thân mình nhé!",
    "Bạn xứng đáng được yêu thương và trân trọng. Đừng bao giờ quên điều đó.",
    "Nụ cười của bạn có sức mạnh lan tỏa niềm vui đến mọi người xung quanh.",
    "Hạnh phúc không ở đâu xa, nó ở ngay trong trái tim biết yêu thương của bạn.",

    // Về sự kiên trì và cố gắng
    "Mỗi bước nhỏ đều đưa bạn đến gần hơn với ước mơ. Tiếp tục cố gắng nhé!",
    "Thất bại không phải là dấu chấm hết, mà là bài học quý giá cho thành công.",
    "Bạn mạnh mẽ hơn bạn nghĩ, dũng cảm hơn bạn tin, và thông minh hơn bạn tưởng.",
    "Đừng so sánh hành trình của mình với người khác. Mỗi người có một con đường riêng.",
    "Những khó khăn hôm nay sẽ trở thành sức mạnh của bạn ngày mai.",

    // Về lòng biết ơn
    "Biết ơn là chìa khóa mở cánh cửa hạnh phúc. Cảm ơn bạn đã thực hành điều này!",
    "Khi tập trung vào những điều tốt đẹp, cuộc sống sẽ trở nên tươi sáng hơn.",
    "Một trái tim biết ơn sẽ luôn tìm thấy điều kỳ diệu trong mỗi ngày.",
    "Cảm ơn bạn đã dành thời gian để nhìn nhận những điều đáng trân trọng.",
    "Lòng biết ơn biến những gì ta có thành đủ đầy. Bạn thật giàu có!",

    // Về tình yêu thương
    "Bạn được yêu thương nhiều hơn bạn biết và quan trọng hơn bạn nghĩ.",
    "Hãy yêu thương bản thân như cách bạn yêu thương người thân yêu nhất.",
    "Tình yêu thương bạn trao đi sẽ quay về gấp bội. Tiếp tục lan tỏa yêu thương nhé!",
    "Mỗi hành động tử tế của bạn đều tạo nên sự khác biệt trong cuộc sống ai đó.",
    "Bạn là món quà quý giá cho thế giới này. Đừng bao giờ quên điều đó.",

    // Về sự bình yên
    "Hít thở thật sâu và nhớ rằng mọi thứ sẽ ổn thôi. Bạn đang làm tốt lắm!",
    "Bình yên không phải là không có sóng gió, mà là biết cách giữ tâm an.",
    "Hãy cho phép bản thân được nghỉ ngơi. Bạn xứng đáng được chăm sóc.",
    "Mỗi khoảnh khắc yên tĩnh là cơ hội để bạn kết nối với chính mình.",
    "An yên bắt đầu từ việc chấp nhận chính mình. Bạn đã rất dũng cảm!",

    // Về thành công và tiến bộ
    "Thành công không phải đích đến, mà là hành trình. Tận hưởng từng bước nhé!",
    "Mỗi ngày bạn đang trưởng thành hơn, dù bạn có nhận ra hay không.",
    "Bạn đã vượt qua 100% những ngày khó khăn. Tỷ lệ thành công tuyệt vời!",
    "Tiến bộ nhỏ mỗi ngày tạo nên kết quả lớn. Kiên nhẫn với bản thân nhé!",
    "Bạn không cần hoàn hảo, chỉ cần cố gắng. Và bạn đang làm rất tốt!",

    // Về can đảm và dám làm
    "Dũng cảm không phải là không sợ hãi, mà là tiến về phía trước dù sợ.",
    "Bạn có sức mạnh để vượt qua mọi thử thách. Tin vào bản thân mình!",
    "Mỗi lần bạn thử điều mới là một lần bạn lớn hơn. Tiếp tục khám phá nhé!",
    "Sai lầm là bằng chứng bạn đang cố gắng. Đừng sợ mắc lỗi!",
    "Ước mơ của bạn xứng đáng được theo đuổi. Hãy dũng cảm bước tới!",

    // Về hy vọng và tương lai
    "Ngày mai luôn mang đến những cơ hội mới. Hãy chờ đón với niềm tin!",
    "Sau cơn mưa trời lại sáng. Những điều tốt đẹp đang đến với bạn.",
    "Bạn có quyền hy vọng và mơ ước những điều tuyệt vời nhất.",
    "Tương lai của bạn rạng rỡ như chính nụ cười của bạn vậy!",
    "Mỗi ngày mới là một trang giấy trắng. Hãy viết nên câu chuyện đẹp!",

    // Về việc học hỏi
    "Học hỏi là hành trình không có điểm dừng. Bạn đang tiến bộ mỗi ngày!",
    "Mỗi câu hỏi đều đưa bạn đến gần hơn với tri thức. Tiếp tục tò mò nhé!",
    "Sai lầm là người thầy tốt nhất. Cảm ơn bạn đã dũng cảm học hỏi!",
    "Kiến thức bạn tích lũy hôm nay sẽ là sức mạnh của ngày mai.",
    "Bạn thông minh hơn bạn nghĩ và có khả năng học bất cứ điều gì!",

    // Về bạn bè và gia đình
    "Những người yêu thương bạn luôn ở bên, dù bạn có nhận ra hay không.",
    "Tình bạn chân thành là báu vật. Hãy trân trọng những người bên cạnh!",
    "Gia đình là nơi bạn luôn được yêu thương vô điều kiện.",
    "Mỗi cuộc gọi, tin nhắn đều kết nối những trái tim. Hãy lan tỏa yêu thương!",
    "Bạn không đơn độc. Luôn có người sẵn sàng lắng nghe và đồng hành cùng bạn.",

    // Về sức khỏe
    "Chăm sóc bản thân là hành động yêu thương quan trọng nhất.",
    "Sức khỏe là tài sản quý giá. Cảm ơn cơ thể đã đồng hành cùng bạn!",
    "Một giấc ngủ ngon, một ly nước mát - những điều nhỏ bé nhưng đáng trân trọng.",
    "Hãy lắng nghe cơ thể và cho phép mình nghỉ ngơi khi cần.",
    "Mỗi hơi thở là một phép màu. Hãy biết ơn sự sống tuyệt vời này!",

    // Về thiên nhiên
    "Thiên nhiên luôn sẵn sàng chữa lành. Hãy dành thời gian ngắm bầu trời!",
    "Ánh nắng, làn gió, tiếng chim hót - những món quà miễn phí tuyệt vời!",
    "Mỗi bông hoa, mỗi chiếc lá đều mang vẻ đẹp riêng. Giống như bạn vậy!",
    "Kết nối với thiên nhiên giúp tâm hồn bạn được thư thái và bình yên.",
    "Hãy dành một phút ngắm hoàng hôn. Vũ trụ đang tặng bạn một bức tranh đẹp!",

    // Về sáng tạo
    "Sự sáng tạo của bạn là duy nhất. Đừng ngại thể hiện bản thân!",
    "Mỗi ý tưởng đều có giá trị. Hãy tin vào trí tưởng tượng của mình!",
    "Nghệ thuật không cần hoàn hảo, chỉ cần chân thành. Hãy tự do sáng tạo!",
    "Bạn có khả năng tạo nên những điều tuyệt vời. Tin vào năng lực của mình!",
    "Viết, vẽ, hát, nhảy - mọi hình thức biểu đạt đều đáng trân trọng!",

    // Về thời gian
    "Mỗi khoảnh khắc đều quý giá. Hãy sống trọn vẹn với hiện tại!",
    "Quá khứ đã qua, tương lai chưa đến. Hãy tận hưởng ngày hôm nay!",
    "Thời gian bạn dành cho bản thân là đầu tư xứng đáng nhất.",
    "Không có ai trễ trên hành trình của chính mình. Bạn đang đúng lúc!",
    "Hôm nay là ngày tốt nhất để bắt đầu điều gì đó mới. Bạn sẵn sàng chưa?",

    // Về giấc mơ
    "Giấc mơ của bạn đáng được theo đuổi. Đừng bao giờ từ bỏ!",
    "Mỗi người thành công đều từng là người dám mơ. Bạn cũng vậy!",
    "Ước mơ lớn bắt đầu từ những bước nhỏ. Hãy bắt đầu ngay hôm nay!",
    "Bạn có quyền mơ ước những điều tuyệt vời nhất cho cuộc sống của mình.",
    "Ngay cả khi ước mơ xa vời, hành trình theo đuổi cũng đáng giá!",

    // Lời động viên chung
    "Bạn là phiên bản duy nhất và tuyệt vời nhất của chính mình!",
    "Cảm ơn bạn đã tồn tại và làm cho thế giới này tốt đẹp hơn.",
    "Bạn đang làm tốt hơn bạn nghĩ. Hãy tự hào về bản thân!",
    "Mỗi ngày bạn thức dậy là một phép màu. Hãy trân trọng!",
    "Bạn xứng đáng có được hạnh phúc. Đừng ngừng theo đuổi nó!",
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
    const [encouragement, setEncouragement] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
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
            // Random encouragement
            setEncouragement(ENCOURAGEMENT_MESSAGES[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)]);
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

            // Ghi nhận hoạt động cho streak toàn app
            recordActivity('gratitude');

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

                    {/* Chú thích: Card động viên thay thế phần hình ảnh */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-violet-100 to-purple-100 rounded-3xl p-6 border-2 border-violet-200/50 shadow-lg"
                    >
                        {/* Icon sao vàng */}
                        <div className="flex justify-center mb-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-amber-300 to-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                                <span className="text-2xl">⭐</span>
                            </div>
                        </div>

                        {/* Nội dung động viên */}
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={encouragement}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-center text-lg md:text-xl font-medium text-violet-900 leading-relaxed"
                            >
                                {encouragement}
                            </motion.p>
                        </AnimatePresence>

                        {/* Các nút điều khiển */}
                        <div className="flex justify-center gap-3 mt-6">
                            {/* Nút đọc - 🔧 ĐANG TẮT
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    playSound('click');
                                    if (isSpeaking) {
                                        speechSynthesis.cancel();
                                        setIsSpeaking(false);
                                    } else {
                                        const utterance = new SpeechSynthesisUtterance(encouragement);
                                        utterance.lang = 'vi-VN';
                                        utterance.rate = 0.9;
                                        utterance.onend = () => setIsSpeaking(false);
                                        speechSynthesis.speak(utterance);
                                        setIsSpeaking(true);
                                    }
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${isSpeaking
                                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                    : 'bg-violet-200 text-violet-700 hover:bg-violet-300'
                                    }`}
                            >
                                {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
                                <span>{isSpeaking ? 'Dừng đọc' : 'Đọc cho tôi'}</span>
                            </motion.button>
                            */}

                            {/* Nút đổi câu */}
                            <motion.button
                                whileHover={{ scale: 1.05, rotate: 180 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    playSound('click');
                                    const newMsg = ENCOURAGEMENT_MESSAGES[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)];
                                    setEncouragement(newMsg);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-200 text-amber-700 rounded-full hover:bg-amber-300 transition-all font-medium"
                                title="Câu khác"
                            >
                                <RefreshCw size={18} />
                                <span>Câu khác</span>
                            </motion.button>
                        </div>
                    </motion.div>
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
