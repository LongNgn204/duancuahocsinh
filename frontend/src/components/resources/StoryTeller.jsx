// src/components/resources/StoryTeller.jsx
// Chú thích: StoryTeller v1.0 - Kể chuyện dân gian Việt Nam với chế độ Nhanh/Chậm
// Hỗ trợ AI viết truyện mới và đọc chính xác tiếng Việt
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import GlowOrbs from '../ui/GlowOrbs';
import { useTTS } from '../../hooks/useTTS';
import {
    BookOpen, Play, Pause, Square, Volume2, VolumeX,
    RefreshCw, Sparkles, ChevronRight, Clock, Gauge,
    Rabbit, Turtle, Wand2, Loader2
} from 'lucide-react';

// Kho truyện dân gian Việt Nam (chính xác theo nguyên bản)
const FOLK_TALES = [
    {
        id: 'tam-cam',
        title: 'Tấm Cám',
        category: 'Cổ tích',
        duration: '8 phút',
        thumbnail: '👸',
        content: `Ngày xưa có hai chị em cùng cha khác mẹ. Người chị tên là Tấm, hiền lành chăm chỉ. Người em tên là Cám, lười biếng và ác độc.

Mẹ Tấm mất sớm, bố lấy mẹ kế. Mẹ kế và Cám luôn bắt Tấm làm việc nặng nhọc. Một hôm, mẹ kế sai hai chị em đi bắt tép, hứa ai bắt được nhiều sẽ thưởng yếm đỏ.

Tấm chăm chỉ bắt được đầy giỏ tép. Cám lười biếng không bắt được gì, bèn lừa Tấm: "Chị Tấm ơi, đầu chị lấm, chị hụp cho sâu kẻo về mẹ mắng." Tấm nghe lời, Cám trút hết tép sang giỏ mình rồi bỏ chạy về.

Tấm khóc, Bụt hiện lên hỏi: "Làm sao con khóc?" Tấm kể lại sự tình. Bụt bảo: "Con nhìn trong giỏ còn con gì không?" Tấm thấy một con cá bống nhỏ. Bụt dặn: "Con về nuôi cá, mỗi bữa bớt cơm cho nó ăn."

Từ đó, mỗi ngày Tấm đều mang cơm ra ao, gọi: "Bống bống bang bang, lên ăn cơm vàng cơm bạc nhà ta, chớ ăn cơm hẩm cháo hoa nhà người."

Mẹ kế biết chuyện, sai Cám theo dõi rồi lừa Tấm đi xa, bắt cá bống làm thịt. Tấm về không thấy cá, khóc thương. Bụt lại hiện lên, bảo Tấm tìm xương cá chôn dưới bốn chân giường.

Vua mở hội, ai cũng được đi. Mẹ kế trộn thóc với gạo, bắt Tấm nhặt cho xong mới được đi. Tấm khóc, Bụt sai đàn chim sẻ xuống nhặt giúp. Bụt còn cho Tấm quần áo đẹp, giày thêu và ngựa để đi hội.

Đi qua cầu, Tấm đánh rơi một chiếc giày xuống nước. Vua nhặt được giày, truyền lệnh ai mang vừa sẽ lấy làm hoàng hậu. Tấm mang vừa in, được làm hoàng hậu.

Từ đó, Tấm sống hạnh phúc trong cung vua. Còn mẹ kế và Cám ghen tức, lập mưu hại Tấm. Nhưng mỗi lần Tấm chết, nàng lại hóa thành chim vàng anh, cây xoan đào, khung cửi, rồi cuối cùng hóa thành quả thị.

Một bà lão nhặt được quả thị, mang về. Mỗi khi bà đi vắng, Tấm chui ra từ quả thị, dọn nhà nấu cơm. Vua đi ngang qua, ngửi thấy mùi trầu thơm giống Tấm, bèn ghé vào. Vua nhận ra Tấm, đón nàng về cung.

Tấm và Vua sống hạnh phúc mãi mãi.`
    },
    {
        id: 'su-tich-banh-chung',
        title: 'Sự tích Bánh Chưng Bánh Giầy',
        category: 'Sự tích',
        duration: '6 phút',
        thumbnail: '🍚',
        content: `Đời vua Hùng Vương thứ sáu, đất nước thái bình. Vua đã già, muốn truyền ngôi cho con.

Vua có hai mươi hai người con trai. Vua truyền lệnh: "Nhân ngày lễ Tiên Vương, ai dâng lễ vật vừa ý ta nhất sẽ được nối ngôi."

Các hoàng tử đua nhau tìm sơn hào hải vị. Riêng Lang Liêu, con trai thứ mười tám, mẹ mất sớm, sống nghèo khó, không biết dâng gì.

Một đêm, Lang Liêu nằm mơ thấy thần báo: "Trong trời đất, không gì quý bằng hạt gạo. Hạt gạo nuôi sống con người, có thể làm ra mọi thứ."

Lang Liêu tỉnh dậy, suy nghĩ mãi. Chàng lấy gạo nếp thơm, đỗ xanh, thịt lợn, gói thành hình vuông, luộc chín, gọi là Bánh Chưng, tượng trưng cho Đất. Chàng lại giã gạo nếp, nặn thành hình tròn, gọi là Bánh Giầy, tượng trưng cho Trời.

Ngày lễ, các hoàng tử dâng đủ món ngon vật lạ. Đến lượt Lang Liêu, chàng chỉ dâng hai thứ bánh giản dị.

Vua nếm thử, khen ngon. Vua hỏi ý nghĩa, Lang Liêu thưa: "Bánh Chưng vuông tượng trưng cho Đất, có thịt mỡ, đỗ xanh là cây cỏ muông thú. Bánh Giầy tròn tượng trưng cho Trời. Đây là lòng hiếu thảo của con với Tiên Vương và tổ tiên."

Vua cảm động nói: "Chỉ có Lang Liêu hiểu lòng ta. Ta muốn tìm người nối ngôi biết quý trọng hạt gạo, biết ơn tổ tiên, biết lo cho dân."

Lang Liêu được truyền ngôi. Từ đó, cứ đến Tết Nguyên Đán, người Việt lại gói bánh chưng, bánh giầy để dâng cúng tổ tiên.`
    },
    {
        id: 'thanh-giong',
        title: 'Thánh Gióng',
        category: 'Truyền thuyết',
        duration: '7 phút',
        thumbnail: '🐎',
        content: `Đời vua Hùng Vương thứ sáu, ở làng Gióng có hai vợ chồng già hiền lành, chưa có con.

Một hôm, bà vợ ra đồng thấy vết chân lạ to lớn, bà ướm thử. Về nhà, bà có thai, mười hai tháng sau sinh được một cậu bé khôi ngô.

Kỳ lạ thay, cậu bé lên ba tuổi vẫn không biết nói cười, cũng chẳng biết đi. Hai vợ chồng rất buồn.

Bấy giờ giặc Ân sang xâm lược. Chúng tàn phá xóm làng, giết hại dân lành. Vua Hùng lo lắng, sai sứ giả đi khắp nơi tìm người tài đánh giặc.

Sứ giả đến làng Gióng, rao: "Ai có tài đánh giặc, vua sẽ phong thưởng."

Bỗng nhiên, cậu bé cất tiếng nói: "Mẹ ơi, mời sứ giả vào đây!"

Mẹ kinh ngạc mừng rỡ, mời sứ giả vào nhà. Cậu bé nói: "Ông về tâu với vua, đúc cho ta một con ngựa sắt, một cây roi sắt, một áo giáp sắt. Ta sẽ phá tan giặc."

Sứ giả về tâu, vua liền sai thợ giỏi đúc ngay. Từ hôm đó, cậu bé lớn nhanh như thổi. Cơm ăn bao nhiêu cũng không đủ, áo mặc bao nhiêu cũng chật. Dân làng rủ nhau góp gạo, góp vải nuôi cậu bé.

Giặc đến chân núi Trâu. Vừa lúc ngựa sắt, roi sắt, áo giáp sắt được mang đến. Cậu bé vươn vai thành một tráng sĩ cao lớn. Tráng sĩ mặc áo giáp, cầm roi sắt, nhảy lên ngựa. Ngựa phun lửa, phi thẳng ra trận.

Tráng sĩ đánh giặc, roi sắt vung đến đâu giặc tan đến đó. Roi sắt gãy, Tráng sĩ nhổ tre bên đường quật tiếp. Giặc chết như rạ.

Đuổi giặc đến chân núi Sóc, Tráng sĩ cởi áo giáp, cưỡi ngựa bay lên trời.

Vua nhớ công ơn, phong là Phù Đổng Thiên Vương, lập đền thờ tại làng Gióng. Đến nay, vùng đầm ao lau sậy là dấu ngựa sắt in xuống. Tre đằng ngà vàng óng là do lửa ngựa sắt thiêu.

Hàng năm đến mồng chín tháng tư âm lịch, dân làng mở hội Gióng để tưởng nhớ vị anh hùng đã cứu nước.`
    },
    {
        id: 'son-tinh-thuy-tinh',
        title: 'Sơn Tinh Thủy Tinh',
        category: 'Truyền thuyết',
        duration: '5 phút',
        thumbnail: '🌊',
        content: `Vua Hùng Vương thứ mười tám có một người con gái tên là Mỵ Nương, xinh đẹp tuyệt trần.

Hai chàng trai đến cầu hôn. Một người là Sơn Tinh, chúa miền non cao, có tài khiến núi mọc, đất dời. Một người là Thủy Tinh, chúa miền nước thẳm, có phép gọi gió hô mưa.

Vua Hùng không biết chọn ai, bèn phán: "Ngày mai, ai mang sính lễ đến trước sẽ được cưới Mỵ Nương. Sính lễ gồm: một trăm ván cơm nếp, hai trăm nệp bánh chưng, voi chín ngà, gà chín cựa, ngựa chín hồng mao."

Sơn Tinh đến trước, mang đủ lễ vật, rước Mỵ Nương về núi.

Thủy Tinh đến sau, không lấy được vợ, nổi giận đùng đùng. Thủy Tinh hô mưa gọi gió, dâng nước lên cao, đuổi theo đánh Sơn Tinh.

Nước dâng đến đâu, Sơn Tinh bốc núi lên cao đến đó. Đánh mãi không thắng, Thủy Tinh rút quân về.

Từ đó, năm nào Thủy Tinh cũng dâng nước đánh Sơn Tinh để cướp Mỵ Nương. Nhưng lần nào Sơn Tinh cũng thắng.

Vì thế, hàng năm cứ đến mùa mưa bão, nước sông lại dâng cao, gây ra lũ lụt. Đó là Thủy Tinh đang đánh Sơn Tinh.`
    },
    {
        id: 'cay-khe',
        title: 'Cây Khế',
        category: 'Cổ tích',
        duration: '5 phút',
        thumbnail: '🌳',
        content: `Ngày xưa, có hai anh em mồ côi. Khi cha mẹ mất, người anh chiếm hết gia tài, chỉ để lại cho em một cây khế.

Người em chăm sóc cây khế. Đến mùa, khế ra quả rất sai. Một hôm, có con chim lạ bay đến ăn khế. Người em than: "Chim ơi, chim ăn hết khế của tôi, tôi lấy gì mà sống?"

Chim đáp: "Ăn một quả trả một cục vàng, may túi ba gang mang đi mà đựng."

Người em may túi ba gang. Chim chở đến một hòn đảo đầy vàng bạc châu báu. Người em chỉ lấy vừa đầy túi ba gang rồi về.

Từ đó, người em giàu có sung sướng. Người anh biết chuyện, đòi đổi cả gia tài lấy cây khế. Người em đồng ý.

Mùa khế chín, chim lại đến. Người anh cũng than, chim cũng nói: "May túi ba gang mang đi mà đựng."

Nhưng người anh tham lam, may túi mười hai gang. Đến đảo, người anh nhét đầy túi vàng bạc, còn giắt thêm quanh người.

Trên đường về, vì quá nặng, chim bay không nổi, nghiêng cánh. Người anh cùng túi vàng rơi xuống biển.

Người em thương anh, lập bàn thờ cúng.

Chuyện này răn dạy: Tham thì thâm, đừng nên tham lam quá mức.`
    },
    {
        id: 'chu-cuoi',
        title: 'Sự tích Chú Cuội cung trăng',
        category: 'Sự tích',
        duration: '6 phút',
        thumbnail: '🌙',
        content: `Ngày xưa có một chàng tiều phu tên là Cuội, sống bằng nghề đốn củi.

Một hôm vào rừng, Cuội thấy hang cọp, bốn con cọp con đang nằm. Cuội đánh chết cả bốn. Cọp mẹ về, thấy con chết, liền chạy đến gốc cây gần đó, nhai lá rồi mớm cho con. Lạ thay, bốn con cọp con sống lại.

Cuội đợi cọp đi, bèn đào lấy cây thuốc quý đó mang về. Từ đó, Cuội dùng lá cây chữa bệnh cứu người. Cuội cứu được một cô gái chết đuối, hai người nên vợ nên chồng.

Vợ Cuội hay quên. Cuội dặn: "Cây thuốc này linh lắm, đừng tưới bằng nước bẩn kẻo nó bay lên trời." Nhưng vợ Cuội hay quên, cứ tiện tay là tưới.

Một hôm, vợ Cuội lại tưới nước bẩn vào gốc cây. Cây thuốc từ từ bay lên. Cuội đi làm về, thấy cây bay, vội chạy ra níu lại. Nhưng cây cứ bay lên, bay lên. Cuội ôm theo cây bay lên tận cung trăng.

Từ đó, cứ đêm rằm, người ta nhìn lên mặt trăng thấy bóng chú Cuội ngồi dưới gốc cây đa.

Trẻ em có bài hát: "Thằng Cuội ngồi gốc cây đa, để trâu ăn lúa gọi cha ời ời."`
    }
];

// Chế độ tốc độ đọc
const SPEED_MODES = {
    slow: {
        label: 'Kể chậm',
        icon: Turtle,
        rate: 0.75,
        description: 'Dễ theo dõi, thư giãn'
    },
    normal: {
        label: 'Bình thường',
        icon: Gauge,
        rate: 1.0,
        description: 'Tốc độ vừa phải'
    },
    fast: {
        label: 'Kể nhanh',
        icon: Rabbit,
        rate: 1.25,
        description: 'Tiết kiệm thời gian'
    }
};

// Storage key
const STORY_BOOKMARK_KEY = 'story_bookmarks_v1';

function loadBookmarks() {
    try {
        const raw = localStorage.getItem(STORY_BOOKMARK_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch (_) {
        return {};
    }
}

function saveBookmark(storyId, position) {
    try {
        const bookmarks = loadBookmarks();
        bookmarks[storyId] = { position, savedAt: new Date().toISOString() };
        localStorage.setItem(STORY_BOOKMARK_KEY, JSON.stringify(bookmarks));
    } catch (_) { }
}

export default function StoryTeller() {
    const [selectedStory, setSelectedStory] = useState(null);
    const [speedMode, setSpeedMode] = useState('normal');
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [aiStory, setAiStory] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [storyPrompt, setStoryPrompt] = useState('');
    const [showAiPanel, setShowAiPanel] = useState(false);

    const { play, stop, speaking } = useTTS('vi-VN');
    const progressIntervalRef = useRef(null);
    const startTimeRef = useRef(null);

    // Tính toán thời gian đọc ước tính (trung bình 150 từ/phút)
    const estimateDuration = useCallback((text, rate) => {
        const words = text.split(/\s+/).length;
        const minutes = words / (150 * rate);
        return minutes * 60 * 1000; // milliseconds
    }, []);

    // Bắt đầu đọc truyện
    const handlePlay = useCallback(() => {
        if (!selectedStory) return;

        const content = selectedStory.content;
        const rate = SPEED_MODES[speedMode].rate;

        play(content, { rate, pitch: 1 });
        setIsPlaying(true);
        startTimeRef.current = Date.now();

        // Tính progress
        const duration = estimateDuration(content, rate);
        progressIntervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            const newProgress = Math.min((elapsed / duration) * 100, 100);
            setProgress(newProgress);

            if (newProgress >= 100) {
                clearInterval(progressIntervalRef.current);
                setIsPlaying(false);
            }
        }, 500);
    }, [selectedStory, speedMode, play, estimateDuration]);

    // Dừng đọc
    const handleStop = useCallback(() => {
        stop();
        setIsPlaying(false);
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
        }
        // Lưu bookmark
        if (selectedStory) {
            saveBookmark(selectedStory.id, progress);
        }
    }, [stop, selectedStory, progress]);

    // Tạm dừng/tiếp tục
    const handlePause = useCallback(() => {
        if (isPlaying) {
            stop();
            setIsPlaying(false);
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
        } else {
            handlePlay();
        }
    }, [isPlaying, stop, handlePlay]);

    // Dọn dẹp khi unmount
    useEffect(() => {
        return () => {
            stop();
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
        };
    }, [stop]);

    // Dừng khi TTS speech kết thúc
    useEffect(() => {
        if (!speaking && isPlaying) {
            setIsPlaying(false);
            setProgress(100);
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
        }
    }, [speaking, isPlaying]);

    // AI viết truyện
    const generateAiStory = useCallback(async () => {
        if (!storyPrompt.trim()) return;

        setIsGenerating(true);
        try {
            // Gọi API AI qua backend để viết truyện
            const apiUrl = import.meta.env.VITE_API_URL || 'https://ban-dong-hanh-worker.stu725114073.workers.dev';
            const chatEndpoint = `${apiUrl}/api/chat`;

            const prompt = `Hãy viết một câu chuyện thú vị dành cho học sinh với chủ đề: "${storyPrompt}". 
      
Yêu cầu:
- Viết bằng tiếng Việt chuẩn, dễ đọc
- Độ dài khoảng 300-500 từ
- Có mở đầu, diễn biến, kết thúc rõ ràng
- Nội dung tích cực, phù hợp với học sinh
- Có bài học ý nghĩa

Chỉ trả về nội dung truyện, không cần tiêu đề hay giải thích thêm.`;

            const response = await fetch(chatEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: prompt, history: [] })
            });

            if (!response.ok) throw new Error('Không thể tạo truyện');

            const data = await response.json();
            // Backend trả về { reply: "...", sos: null }
            const storyContent = data.reply || data.text || data.message || data.response || data.content || '';


            if (storyContent) {
                setAiStory({
                    id: 'ai-generated',
                    title: `Truyện: ${storyPrompt.slice(0, 30)}...`,
                    category: 'AI Sáng tạo',
                    duration: '4 phút',
                    thumbnail: '🤖',
                    content: storyContent
                });
                setSelectedStory({
                    id: 'ai-generated',
                    title: `Truyện: ${storyPrompt.slice(0, 30)}...`,
                    category: 'AI Sáng tạo',
                    duration: '4 phút',
                    thumbnail: '🤖',
                    content: storyContent
                });
                setShowAiPanel(false);
            }
        } catch (error) {
            console.error('[StoryTeller] AI error:', error);
            // Fallback: tạo truyện đơn giản
            const fallbackStory = `Ngày xửa ngày xưa, ở một vùng đất xinh đẹp, có một câu chuyện về ${storyPrompt}.

Đó là một ngày đẹp trời, mọi thứ đều bình yên và tươi sáng. Các bạn nhỏ đang vui chơi, ca hát.

Bỗng nhiên, một điều kỳ diệu xảy ra, khiến mọi người đều ngạc nhiên và vui sướng.

Cuối cùng, ai cũng học được một bài học quý giá: Hãy luôn tử tế, chăm chỉ và yêu thương mọi người xung quanh.

Và họ sống hạnh phúc mãi mãi.`;

            setAiStory({
                id: 'ai-generated',
                title: `Truyện: ${storyPrompt.slice(0, 30)}...`,
                category: 'AI Sáng tạo',
                duration: '2 phút',
                thumbnail: '🤖',
                content: fallbackStory
            });
        } finally {
            setIsGenerating(false);
        }
    }, [storyPrompt]);

    // Danh sách truyện (bao gồm AI nếu có)
    const allStories = aiStory ? [aiStory, ...FOLK_TALES] : FOLK_TALES;

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                className="flex items-center justify-between"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3">
                        <BookOpen className="w-7 h-7 text-[--brand]" />
                        <span className="gradient-text">Kể Chuyện</span>
                    </h2>
                    <p className="text-[--muted] text-sm mt-1">
                        Truyện dân gian Việt Nam & AI sáng tạo
                    </p>
                </div>

                <Button
                    variant="outline"
                    onClick={() => setShowAiPanel(!showAiPanel)}
                    icon={<Wand2 size={16} />}
                >
                    AI viết truyện
                </Button>
            </motion.div>

            {/* AI Panel */}
            <AnimatePresence>
                {showAiPanel && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <Card className="border-2 border-[--brand]/30">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="w-5 h-5 text-[--brand]" />
                                <h3 className="font-semibold">AI Viết Truyện</h3>
                            </div>
                            <p className="text-sm text-[--muted] mb-3">
                                Nhập chủ đề và AI sẽ sáng tạo một câu chuyện cho bạn
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={storyPrompt}
                                    onChange={(e) => setStoryPrompt(e.target.value)}
                                    placeholder="VD: Chú mèo dũng cảm, Cô bé và cây thần..."
                                    className="flex-1 px-4 py-2 rounded-xl glass text-[--text] placeholder:text-[--muted] outline-none focus:ring-2 focus:ring-[--brand]/50"
                                    onKeyDown={(e) => e.key === 'Enter' && generateAiStory()}
                                />
                                <Button
                                    onClick={generateAiStory}
                                    disabled={isGenerating || !storyPrompt.trim()}
                                    icon={isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
                                >
                                    {isGenerating ? 'Đang viết...' : 'Tạo truyện'}
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Speed Mode Selector */}
            <Card size="sm">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <span className="text-sm font-medium text-[--text]">Tốc độ kể:</span>
                    <div className="flex gap-2">
                        {Object.entries(SPEED_MODES).map(([key, mode]) => (
                            <button
                                key={key}
                                onClick={() => setSpeedMode(key)}
                                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all
                  ${speedMode === key
                                        ? 'bg-[--brand] text-white shadow-lg'
                                        : 'glass hover:bg-white/50'
                                    }
                `}
                            >
                                <mode.icon size={16} />
                                {mode.label}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Story Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allStories.map((story, idx) => (
                    <motion.div
                        key={story.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                    >
                        <Card
                            variant={selectedStory?.id === story.id ? 'elevated' : 'default'}
                            className={`cursor-pointer group transition-all ${selectedStory?.id === story.id
                                ? 'ring-2 ring-[--brand] shadow-lg'
                                : 'hover:shadow-md'
                                }`}
                            onClick={() => {
                                setSelectedStory(story);
                                setProgress(0);
                                handleStop();
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[--brand]/20 to-[--secondary]/20 flex items-center justify-center text-3xl shrink-0">
                                    {story.thumbnail}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-[--text] truncate group-hover:text-[--brand] transition-colors">
                                        {story.title}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge size="sm" variant={story.category === 'AI Sáng tạo' ? 'accent' : 'default'}>
                                            {story.category}
                                        </Badge>
                                        <span className="text-xs text-[--muted] flex items-center gap-1">
                                            <Clock size={12} /> {story.duration}
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-[--muted] group-hover:text-[--brand] transition-colors" />
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Story Player */}
            <AnimatePresence>
                {selectedStory && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        <Card variant="elevated" size="lg">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[--brand] to-[--secondary] flex items-center justify-center text-2xl">
                                        {selectedStory.thumbnail}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-[--text]">{selectedStory.title}</h3>
                                        <p className="text-sm text-[--muted]">
                                            Tốc độ: {SPEED_MODES[speedMode].label} ({SPEED_MODES[speedMode].rate}x)
                                        </p>
                                    </div>
                                </div>
                                <Badge variant="primary">{selectedStory.category}</Badge>
                            </div>

                            {/* Progress bar */}
                            <div className="mb-4">
                                <div className="h-2 bg-[--surface-border] rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-[--brand] to-[--secondary]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-[--muted] mt-1">
                                    <span>{Math.round(progress)}%</span>
                                    <span>{selectedStory.duration}</span>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center justify-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleStop}
                                    disabled={!isPlaying && progress === 0}
                                    aria-label="Dừng"
                                >
                                    <Square size={20} />
                                </Button>

                                <Button
                                    size="lg"
                                    onClick={handlePause}
                                    className="w-16 h-16 rounded-full"
                                    aria-label={isPlaying ? 'Tạm dừng' : 'Phát'}
                                >
                                    {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setProgress(0);
                                        handleStop();
                                        handlePlay();
                                    }}
                                    aria-label="Đọc lại"
                                >
                                    <RefreshCw size={20} />
                                </Button>
                            </div>

                            {/* Story content preview */}
                            <div className="mt-6 pt-4 border-t border-[--surface-border]">
                                <h4 className="font-semibold text-sm text-[--muted] mb-2">Nội dung truyện:</h4>
                                <div className="max-h-60 overflow-y-auto text-sm text-[--text-secondary] leading-relaxed whitespace-pre-wrap glass rounded-xl p-4">
                                    {selectedStory.content}
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tips */}
            {!selectedStory && (
                <Card size="sm" className="border border-[--brand]/20">
                    <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-[--brand] shrink-0 mt-0.5" />
                        <div className="text-sm text-[--text-secondary]">
                            <strong className="text-[--text]">Mẹo:</strong> Chọn "Kể chậm" trước khi ngủ để thư giãn hơn.
                            Bạn cũng có thể dùng AI để tạo truyện với chủ đề yêu thích!
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
