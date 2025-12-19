// src/pages/Stories.jsx
// Chú thích: Kể chuyện - Đọc truyện với chế độ nhanh/chậm
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import GlowOrbs from '../components/ui/GlowOrbs';
import { BookOpen, Play, Pause, SkipForward, Volume2, VolumeX, Clock } from 'lucide-react';

// Danh sách truyện ngắn
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
    },
    // ===== TRUYỆN MỚI =====
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
    },
    {
        id: 8,
        title: 'Sói con đi học',
        content: [
            'Sói con rất sợ đi học vì hay bị sai khi trả lời câu hỏi.',
            '"Các bạn sẽ cười mình mất" - Sói lo lắng.',
            'Cô giáo Cú nhận ra và nói riêng với Sói sau giờ học.',
            '"Con biết không, cô cũng từng sai rất nhiều khi còn nhỏ."',
            '"Sai là cách chúng ta học. Mỗi lần sai là một lần tiến bộ."',
            'Hôm sau, Sói mạnh dạn giơ tay phát biểu dù chưa chắc chắn.',
        ],
        moral: '📚 Sai không có nghĩa là thất bại. Đó là cách chúng ta học!',
    },
    {
        id: 9,
        title: 'Cây tre uốn cong',
        content: [
            'Trong rừng có cây sồi to khỏe và cây tre mảnh mai.',
            'Cây sồi thường chê: "Nhìn mày yếu ớt thế, gió nhẹ cũng đổ."',
            'Một trận bão lớn ập đến. Cây sồi đứng thẳng chống lại gió.',
            'Cây tre thì uốn cong theo chiều gió, nghiêng qua nghiêng lại.',
            'Bão tan, cây sồi bị gãy cành, còn cây tre vẫn nguyên vẹn.',
            'Cây tre hiểu: mềm dẻo đôi khi mạnh hơn cứng rắn.',
        ],
        moral: '🎋 Linh hoạt thích nghi đôi khi tốt hơn là cứng nhắc!',
    },
    {
        id: 10,
        title: 'Hai người bạn',
        content: [
            'Mèo và Chó là đôi bạn thân từ nhỏ.',
            'Một ngày, Chó vô tình giẫm phải đuôi Mèo. Mèo giận và không nói chuyện.',
            'Mấy ngày sau, cả hai đều buồn nhưng không ai chịu nói trước.',
            'Chó quyết định viết một tấm thiệp: "Mình xin lỗi. Mình nhớ bạn."',
            'Mèo đọc xong, chạy ngay sang nhà Chó: "Mình cũng nhớ bạn!"',
            'Họ ôm nhau và hứa sẽ nói chuyện thẳng thắn mỗi khi có hiểu lầm.',
        ],
        moral: '💕 Một lời xin lỗi chân thành có thể hàn gắn mọi hiểu lầm!',
    },
    {
        id: 11,
        title: 'Ngôi sao nhỏ',
        content: [
            'Trên bầu trời, có một ngôi sao nhỏ luôn tự ti vì không sáng bằng các sao khác.',
            '"Mình nhỏ quá, không ai nhìn thấy mình đâu" - sao nhỏ buồn bã.',
            'Một đêm, một cậu bé lạc trong sa mạc nhìn lên trời.',
            'Cậu bé không thấy những ngôi sao lớn vì mây che, nhưng thấy sao nhỏ.',
            'Cậu đi theo hướng sao nhỏ và tìm được đường về nhà.',
            'Sao nhỏ hiểu: dù nhỏ bé, mình vẫn có thể giúp đỡ người khác.',
        ],
        moral: '⭐ Bạn không cần phải to lớn để tỏa sáng và giúp đỡ người khác!',
    },
    {
        id: 12,
        title: 'Con cá vượt thác',
        content: [
            'Có một con cá nhỏ sống ở dưới chân thác nước.',
            'Cá nghe kể rằng phía trên thác có một hồ nước tuyệt đẹp.',
            'Nhiều lần cá cố nhảy lên nhưng đều rơi xuống.',
            'Bạn bè bảo: "Thôi đừng cố, không thể được đâu."',
            'Nhưng cá vẫn kiên trì. Mỗi lần nhảy, cá học được cách nhảy cao hơn.',
            'Cuối cùng, sau hàng trăm lần thử, cá vượt qua và ngắm nhìn hồ nước xinh đẹp.',
        ],
        moral: '🐟 Đừng bao giờ bỏ cuộc. Mỗi lần thử là một bước gần hơn đến thành công!',
    },
    {
        id: 13,
        title: 'Mưa và nắng',
        content: [
            'Cô bé Hoa không thích những ngày mưa vì không được ra ngoài chơi.',
            '"Sao trời cứ mưa hoài vậy?" - Hoa than thở.',
            'Ông ngoại dắt Hoa ra vườn sau cơn mưa.',
            'Hoa thấy cây cối xanh tươi, hoa nở rực rỡ, cầu vồng xuất hiện.',
            '"Con thấy không, mưa giúp vạn vật tươi đẹp hơn" - ông nói.',
            '"Cảm xúc buồn cũng vậy. Đôi khi cần buồn để sau đó vui hơn."',
        ],
        moral: '🌈 Mọi cảm xúc đều có ý nghĩa. Sau mưa trời lại sáng!',
    },
];

export default function Stories() {
    const [selectedStory, setSelectedStory] = useState(null);
    const [currentPart, setCurrentPart] = useState(0);
    const [isReading, setIsReading] = useState(false);
    const [readingSpeed, setReadingSpeed] = useState('normal'); // 'fast' | 'normal' | 'slow'
    const [isSpeaking, setIsSpeaking] = useState(false);

    const speedSettings = {
        fast: { delay: 2000, label: 'Kể nhanh' },
        normal: { delay: 4000, label: 'Bình thường' },
        slow: { delay: 6000, label: 'Kể chậm' },
    };

    // Bắt đầu đọc truyện
    const startReading = async (story) => {
        setSelectedStory(story);
        setCurrentPart(0);
        setIsReading(true);

        for (let i = 0; i < story.content.length; i++) {
            setCurrentPart(i);
            // TTS đọc
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(story.content[i]);
                utterance.lang = 'vi-VN';
                utterance.rate = readingSpeed === 'fast' ? 1.3 : readingSpeed === 'slow' ? 0.8 : 1;
                speechSynthesis.speak(utterance);
                setIsSpeaking(true);
                await new Promise(resolve => {
                    utterance.onend = resolve;
                });
                setIsSpeaking(false);
            }
            await new Promise(r => setTimeout(r, speedSettings[readingSpeed].delay));
        }
        setIsReading(false);
    };

    // Dừng đọc
    const stopReading = () => {
        setIsReading(false);
        speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    // Đọc phần tiếp theo
    const nextPart = () => {
        if (selectedStory && currentPart < selectedStory.content.length - 1) {
            setCurrentPart(currentPart + 1);
        }
    };

    return (
        <div className="min-h-[70vh] relative">
            <GlowOrbs className="opacity-30" />

            <div className="relative z-10 max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-[--brand]" />
                        <span className="gradient-text">Kể chuyện</span>
                    </h1>
                    <p className="text-[--muted] text-sm mt-1">
                        Những câu chuyện nhỏ, bài học lớn
                    </p>
                </motion.div>

                {/* Chế độ đọc */}
                <Card size="sm">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Tốc độ kể:</span>
                        <div className="flex gap-2">
                            {Object.entries(speedSettings).map(([key, value]) => (
                                <button
                                    key={key}
                                    onClick={() => setReadingSpeed(key)}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${readingSpeed === key
                                        ? 'bg-[--brand] text-white'
                                        : 'bg-[--surface-border] text-[--text]'
                                        }`}
                                >
                                    {value.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Danh sách truyện */}
                {!selectedStory && (
                    <div className="grid gap-4">
                        {STORIES.map((story, idx) => (
                            <motion.div
                                key={story.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Card
                                    variant="interactive"
                                    onClick={() => startReading(story)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[--brand] to-[--brand-light] flex items-center justify-center">
                                            <BookOpen className="w-7 h-7 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-[--text]">{story.title}</h3>
                                            <p className="text-sm text-[--muted]">{story.content.length} phần</p>
                                        </div>
                                        <Play className="w-5 h-5 text-[--brand]" />
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Đang đọc truyện */}
                {selectedStory && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Card className="text-center py-8">
                            <h2 className="text-xl font-bold text-[--text] mb-6">{selectedStory.title}</h2>

                            {/* Nội dung hiện tại */}
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={currentPart}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="text-lg text-[--text] mb-8 px-4 min-h-[80px]"
                                >
                                    {selectedStory.content[currentPart]}
                                </motion.p>
                            </AnimatePresence>

                            {/* Progress */}
                            <div className="flex justify-center gap-2 mb-6">
                                {selectedStory.content.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`w-3 h-3 rounded-full transition-colors ${idx === currentPart ? 'bg-[--brand]' : idx < currentPart ? 'bg-[--brand]/50' : 'bg-[--surface-border]'
                                            }`}
                                    />
                                ))}
                            </div>

                            {/* Bài học */}
                            {currentPart === selectedStory.content.length - 1 && !isReading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-4 rounded-xl bg-[--brand]/10 mb-6"
                                >
                                    <p className="text-[--brand] font-medium">{selectedStory.moral}</p>
                                </motion.div>
                            )}

                            {/* Controls */}
                            <div className="flex justify-center gap-3">
                                {isReading ? (
                                    <Button variant="danger" onClick={stopReading} icon={<Pause size={18} />}>
                                        Dừng
                                    </Button>
                                ) : (
                                    <>
                                        <Button variant="ghost" onClick={() => setSelectedStory(null)}>
                                            Quay lại
                                        </Button>
                                        <Button variant="primary" onClick={() => startReading(selectedStory)} icon={<Play size={18} />}>
                                            Kể lại
                                        </Button>
                                    </>
                                )}
                            </div>

                            {/* Speaking indicator */}
                            {isSpeaking && (
                                <div className="mt-4 flex items-center justify-center gap-2 text-[--brand]">
                                    <Volume2 className="w-4 h-4 animate-pulse" />
                                    <span className="text-sm">Đang kể...</span>
                                </div>
                            )}
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
