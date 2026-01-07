import {
    Users, Heart, Brain, Smartphone,
    BookOpen, Sparkles, AlertCircle, Sun,
    Compass, Mic, ShieldCheck, DollarSign,
    Zap, Coffee, MessageCircle
} from 'lucide-react';

export const ARTICLES = [
    {
        id: 1,
        title: 'Áp lực đồng trang lứa (Peer Pressure): Bạn không cô đơn',
        summary: 'Tại sao chúng ta luôn cảm thấy thua kém bạn bè? Và làm thế nào để biến áp lực thành động lực tích cực?',
        readTime: '5 phút',
        category: 'Tâm lý',
        icon: Users,
        color: 'bg-orange-100 text-orange-600',
        gradient: 'from-orange-400 to-red-400',
        content: [
            { type: 'h3', text: 'Peer Pressure là gì?' },
            { type: 'p', text: 'Là cảm giác bạn phải làm những điều giống bạn bè để được chấp nhận hoặc không bị bỏ lại phía sau. Từ chuyện mua một đôi giày mới, đến việc phải đạt điểm cao hay có người yêu.' },
            { type: 'h3', text: 'Tại sao nó lại mạnh mẽ đến vậy?' },
            { type: 'p', text: 'Ở tuổi vị thành niên, não bộ chúng ta rất nhạy cảm với "phần thưởng xã hội" (sự công nhận). Bị loại khỏi nhóm bạn giống như một cơn đau thể xác thực sự đối với bộ não.' },
            { type: 'h3', text: 'Cách đối phó:' },
            {
                type: 'ul', items: [
                    'Hiểu giá trị bản thân: Bạn giỏi điều gì mà người khác không giỏi?',
                    'Học cách nói "Không": Một kỹ năng sinh tồn quan trọng. Từ chối điều bạn không thích không làm bạn mất đi những người bạn "thật sự".',
                    'Tìm bộ lạc của riêng mình: Kết nối với những người có cùng sở thích, thay vì cố hòa nhập vào nhóm hot teen.'
                ]
            }
        ]
    },
    {
        id: 2,
        title: 'Body Shaming & Hình ảnh bản thân',
        summary: 'Học cách yêu cơ thể mình trong kỷ nguyên của những bức ảnh "sống ảo" đã qua chỉnh sửa.',
        readTime: '4 phút',
        category: 'Yêu bản thân',
        icon: Heart,
        color: 'bg-pink-100 text-pink-600',
        gradient: 'from-pink-400 to-rose-400',
        content: [
            { type: 'h3', text: 'Thực tế ảo hay thật?' },
            { type: 'p', text: 'Hầu hết hình ảnh trên Instagram/TikTok đều đã qua app chỉnh sửa. Bạn đang so sánh bản thân với những thứ không có thật.' },
            { type: 'h3', text: 'Cơ thể bạn là một kỳ quan' },
            { type: 'p', text: 'Thay vì ghét cái bụng mỡ hay đôi chân ngắn, hãy cảm ơn cơ thể vì đã giúp bạn đi lại, chạy nhảy, hít thở và cảm nhận thế giới. Cơ thể là phương tiện để bạn trải nghiệm cuộc sống, không phải vật trang trí.' },
            {
                type: 'ul', items: [
                    'Unfollow những tài khoản khiến bạn cảm thấy tự ti.',
                    'Tập trung vào sức khỏe hơn là cân nặng.',
                    'Mỗi ngày tìm ra một điểm bạn thích ở bản thân.'
                ]
            }
        ]
    },
    {
        id: 3,
        title: 'Mạng xã hội đang "ăn mòn" cảm xúc của bạn?',
        summary: 'Tại sao lướt điện thoại khiến bạn buồn hơn? Detox kỹ thuật số như thế nào cho đúng?',
        readTime: '6 phút',
        category: 'Đời sống số',
        icon: Smartphone,
        color: 'bg-blue-100 text-blue-600',
        gradient: 'from-blue-400 to-cyan-400',
        content: [
            { type: 'h3', text: 'Hội chứng FOMO' },
            { type: 'p', text: 'Fear Of Missing Out - nỗi sợ bị bỏ lỡ. Nó khiến bạn check điện thoại 5 phút một lần chỉ để xem người khác đang làm gì.' },
            { type: 'h3', text: 'Dopamine rẻ tiền' },
            { type: 'p', text: 'Mỗi like, comment tạo ra dopamine tức thời nhưng ngắn hạn. Khi hết like, bạn cảm thấy trống rỗng.' },
            { type: 'h3', text: 'Giải pháp Detox' },
            {
                type: 'ul', items: [
                    'Quy tắc 30 phút: Không điện thoại 30 phút sau khi thức dậy và trước khi ngủ.',
                    'Tắt thông báo của những app không quan trọng.',
                    'Thử thách "Cuối tuần không Wifi".'
                ]
            }
        ]
    },
    {
        id: 4,
        title: 'Kỹ năng Pomodoro: Học ít hiểu nhiều',
        summary: 'Phương pháp quản lý thời gian giúp bạn cân "núi bài tập" mà không bị burnout.',
        readTime: '3 phút',
        category: 'Học tập',
        icon: Brain,
        color: 'bg-violet-100 text-violet-600',
        gradient: 'from-violet-400 to-purple-400',
        content: [
            { type: 'h3', text: 'Pomodoro là gì?' },
            { type: 'p', text: 'Là phương pháp chia thời gian: 25 phút học tập trung cao độ - 5 phút nghỉ ngơi hoàn toàn.' },
            { type: 'h3', text: 'Tại sao nó hiệu quả?' },
            { type: 'p', text: 'Não bộ người chỉ có thể tập trung tối đa khoảng 25-30 phút. Việc nghỉ ngắn giúp não "sạc pin" và lưu trữ thông tin vào bộ nhớ dài hạn.' },
            {
                type: 'ul', items: [
                    'Bước 1: Chọn bài cần học.',
                    'Bước 2: Đặt hẹn giờ 25 phút.',
                    'Bước 3: Học (không điện thoại, không Facebook).',
                    'Bước 4: Chuông reo -> Nghỉ 5 phút (đứng dậy đi lại).',
                    'Bước 5: Sau 4 hiệp thì nghỉ dài 15-30 phút.'
                ]
            }
        ]
    },
    {
        id: 5,
        title: 'Tại sao ba mẹ không hiểu mình?',
        summary: 'Khoảng cách thế hệ và cách để "đàm phán hòa bình" với phụ huynh.',
        readTime: '7 phút',
        category: 'Gia đình',
        icon: BookOpen,
        color: 'bg-emerald-100 text-emerald-600',
        gradient: 'from-emerald-400 to-green-400',
        content: [
            { type: 'h3', text: 'Họ đến từ "hành tinh" khác' },
            { type: 'p', text: 'Ba mẹ lớn lên trong thời đại thiếu thốn, còn bạn lớn lên trong thời đại công nghệ. Hệ giá trị hoàn toàn khác nhau.' },
            { type: 'h3', text: 'Họ lo lắng, không phải ghét bạn' },
            { type: 'p', text: 'Sự cấm đoán thường xuất phát từ nỗi sợ: sợ bạn khổ, sợ bạn sai lầm. Nhưng cách thể hiện đôi khi vụng về và gây tổn thương.' },
            { type: 'h3', text: 'Chiến thuật giao tiếp' },
            {
                type: 'ul', items: [
                    'Đừng nói chuyện khi đang nóng giận.',
                    'Dùng cấu trúc "Con cảm thấy..." thay vì "Ba mẹ lúc nào cũng...".',
                    'Chứng minh bằng hành động: Muốn tự do, hãy cho thấy bạn có trách nhiệm.'
                ]
            }
        ]
    },
    {
        id: 6,
        title: 'Crush một người: Nên tỏ tình hay giữ kín?',
        summary: 'Chuyện tình cảm tuổi học trò: Rung động đầu đời và những bối rối không tên.',
        readTime: '5 phút',
        category: 'Tình cảm',
        icon: Sparkles,
        color: 'bg-rose-100 text-rose-600',
        gradient: 'from-rose-400 to-pink-400',
        content: [
            { type: 'h3', text: 'Cảm giác này là gì?' },
            { type: 'p', text: 'Tim đập nhanh, hay cười một mình, lén nhìn người ta... Chúc mừng, hormone tình yêu đang hoạt động!' },
            { type: 'h3', text: 'Tỏ tình hay "âm thầm bên em"?' },
            { type: 'p', text: 'Không có câu trả lời đúng tuyệt đối. Nhưng hãy nhớ: Tỏ tình là để người ta biết cảm xúc của mình, không phải để đòi hỏi họ phải yêu lại mình.' },
            {
                type: 'ul', items: [
                    'Chuẩn bị tâm lý cho cả 2 trường hợp: Đồng ý (Tuyệt!) hoặc Từ chối (Không sao cả).',
                    'Tôn trọng quyết định của đối phương.',
                    'Đừng để chuyện tình cảm ảnh hưởng quá nhiều đến việc học.'
                ]
            }
        ]
    },
    {
        id: 7,
        title: 'Bắt nạt học đường (Bullying): Đừng im lặng',
        summary: 'Nhận diện các hình thức bắt nạt và cách bảo vệ bản thân.',
        readTime: '5 phút',
        category: 'Kỹ năng sống',
        icon: AlertCircle,
        color: 'bg-red-100 text-red-600',
        gradient: 'from-red-400 to-orange-400',
        content: [
            { type: 'h3', text: 'Không chỉ là đấm đá' },
            { type: 'p', text: 'Bắt nạt còn là cô lập, tung tin đồn, cyber-bullying (bắt nạt qua mạng).' },
            { type: 'h3', text: 'Bạn không có lỗi' },
            { type: 'p', text: 'Kẻ bắt nạt thường chọn mục tiêu ngẫu nhiên hoặc những người có vẻ "khác biệt". Lỗi không nằm ở bạn.' },
            { type: 'h3', text: 'Hành động ngay' },
            {
                type: 'ul', items: [
                    'Lưu lại bằng chứng (tin nhắn, hình ảnh).',
                    'Tìm người tin cậy: Thầy cô, ba mẹ, hoặc tổng đài 111.',
                    'Đừng phản ứng lại theo ý kẻ bắt nạt (khóc lóc, sợ hãi) vì đó là "thức ăn" của họ.'
                ]
            }
        ]
    },
    {
        id: 8,
        title: 'Giấc ngủ & Sức khỏe tâm thần',
        summary: 'Tại sao thức khuya lại khiến bạn dễ trầm cảm hơn?',
        readTime: '4 phút',
        category: 'Sức khỏe',
        icon: Sun,
        color: 'bg-yellow-100 text-yellow-600',
        gradient: 'from-yellow-400 to-amber-400',
        content: [
            { type: 'h3', text: 'Bộ não buổi đêm' },
            { type: 'p', text: 'Thiếu ngủ làm tăng mức độ cortisol (hormone căng thẳng) và giảm khả năng kiểm soát cảm xúc.' },
            { type: 'h3', text: 'Vệ sinh giấc ngủ' },
            {
                type: 'ul', items: [
                    'Phòng ngủ tối và mát mẻ.',
                    'Không caffeine sau 2 giờ chiều.',
                    'Ngủ đủ 7-9 tiếng mỗi đêm.'
                ]
            }
        ]
    },
    // --- BÀI VIẾT MỚI BỔ SUNG ---
    {
        id: 9,
        title: 'Ikigai: Tìm kiếm lẽ sống của bạn',
        summary: 'Bạn thích gì? Bạn giỏi gì? Thế giới cần gì? Hãy tìm điểm giao thoa để định hướng tương lai.',
        readTime: '6 phút',
        category: 'Hướng nghiệp',
        icon: Compass,
        color: 'bg-indigo-100 text-indigo-600',
        gradient: 'from-indigo-400 to-violet-400',
        content: [
            { type: 'h3', text: 'Vòng tròn Ikigai' },
            { type: 'p', text: 'Ikigai là triết lý sống của người Nhật, giúp bạn tìm ra "lý do để thức dậy mỗi sáng". Nó là sự kết hợp của 4 yếu tố: Điều bạn yêu thích, Điều bạn giỏi, Điều thế giới cần, và Điều bạn có thể được trả tiền.' },
            { type: 'h3', text: 'Đừng vội vã' },
            { type: 'p', text: 'Ở tuổi teen, bạn chưa cần phải tìm ra ngay lập tức. Hãy coi đây là giai đoạn thử nghiệm (trial & error). Thử tham gia CLB, làm dự án tình nguyện, học kỹ năng mới.' },
            {
                type: 'ul', items: [
                    'Viết nhật ký về những hoạt động khiến bạn quên thời gian (Flow state).',
                    'Hỏi bạn bè xem họ nghĩ điểm mạnh nhất của bạn là gì.',
                    'Đừng chọn nghề chỉ vì nó đang "hot" hay vì bố mẹ muốn.'
                ]
            }
        ]
    },
    {
        id: 10,
        title: 'Nghệ thuật nói trước đám đông: Tự tin tỏa sáng',
        summary: 'Làm sao để không run khi thuyết trình hay phát biểu trước lớp?',
        readTime: '5 phút',
        category: 'Kỹ năng mềm',
        icon: Mic,
        color: 'bg-cyan-100 text-cyan-600',
        gradient: 'from-cyan-400 to-blue-400',
        content: [
            { type: 'h3', text: 'Nỗi sợ số 1 thế giới' },
            { type: 'p', text: 'Bạn có biết: Nhiều người sợ nói trước đám đông hơn cả sợ chết? Đó là phản xạ sinh học bình thường.' },
            { type: 'h3', text: 'Bí kíp "hack" não' },
            { type: 'p', text: 'Đừng cố gắng bình tĩnh. Hãy chuyển hóa sự hồi hộp thành sự hào hứng. Cơ thể không phân biệt được hai trạng thái này.' },
            {
                type: 'ul', items: [
                    'Chuẩn bị kỹ: 90% sự tự tin đến từ việc thuộc bài.',
                    'Eye contact: Hãy nhìn vào trán hoặc mũi của khán giả nếu bạn ngại nhìn vào mắt.',
                    'Tập thở bụng để giọng nói vang và trầm hơn.'
                ]
            }
        ]
    },
    {
        id: 11,
        title: 'An toàn trên mạng: Sexting & Những cái bẫy',
        summary: 'Những điều bạn cần biết để bảo vệ bản thân khi yêu đương thời kỹ thuật số.',
        readTime: '7 phút',
        category: 'An toàn mạng',
        icon: ShieldCheck,
        color: 'bg-gray-100 text-gray-700',
        gradient: 'from-slate-400 to-zinc-400',
        content: [
            { type: 'h3', text: 'Một lần click, vĩnh viễn trên mạng' },
            { type: 'p', text: 'Bất cứ thứ gì bạn gửi đi (ảnh nhạy cảm, tin nhắn riêng tư) đều có thể bị chụp màn hình và phát tán. Không có app nào là an toàn tuyệt đối.' },
            { type: 'h3', text: 'Luật pháp nói gì?' },
            { type: 'p', text: 'Phát tán ảnh nhạy cảm của người khác là hành vi phạm pháp. Nếu bạn là nạn nhân, pháp luật bảo vệ bạn.' },
            {
                type: 'ul', items: [
                    'Nguyên tắc vàng: Đừng gửi gì mà bạn không muốn cả trường nhìn thấy.',
                    'Tôn trọng quyền riêng tư của người khác.',
                    'Nếu bị đe dọa phát tán ảnh, hãy báo ngay cho người lớn. Đừng tự giải quyết.'
                ]
            }
        ]
    },
    {
        id: 12,
        title: 'Tiền đâu? Quản lý tài chính cho Teen',
        summary: 'Học cách tiêu tiền thông minh để không bao giờ rơi vào cảnh "cháy túi" cuối tháng.',
        readTime: '4 phút',
        category: 'Kỹ năng sống',
        icon: DollarSign,
        color: 'bg-green-100 text-green-700',
        gradient: 'from-green-400 to-emerald-500',
        content: [
            { type: 'h3', text: 'Quy tắc 50/30/20 (Phiên bản Teen)' },
            { type: 'p', text: 'Hãy chia tiền tiêu vặt của bạn thành 3 hũ: 50% cho nhu cầu thiết yếu (ăn sáng, xăng xe), 30% cho mong muốn (trà sữa, xem phim), và 20% tiết kiệm.' },
            { type: 'h3', text: 'Sức mạnh của lãi kép' },
            { type: 'p', text: 'Những đồng tiền nhỏ bạn tiết kiệm hôm nay sẽ lớn lên theo thời gian. Hãy bắt đầu sớm.' },
            {
                type: 'ul', items: [
                    'Ghi chép chi tiêu: Dùng app hoặc sổ tay để biết tiền của mình đi đâu.',
                    'Phân biệt "Cần" và "Muốn": Bạn CẦN đi giày, nhưng bạn MUỐN đôi Jordan mới nhất.',
                    'Đặt mục tiêu tiết kiệm cụ thể (ví dụ: mua laptop mới).'
                ]
            }
        ]
    },
    {
        id: 13,
        title: 'Anger Management: Khi cơn giận bùng nổ',
        summary: 'Làm sao để không làm những điều ngu ngốc khi bạn đang "sôi máu"?',
        readTime: '5 phút',
        category: 'Cảm xúc',
        icon: Zap,
        color: 'bg-red-50 text-red-600',
        gradient: 'from-orange-500 to-red-500',
        content: [
            { type: 'h3', text: 'Quy tắc 6 giây' },
            { type: 'p', text: 'Khi giận, phần não cảm xúc (Amygdala) chiếm quyền kiểm soát. Hãy đếm đến 6 để phần não lý trí (Prefrontal Cortex) kịp khởi động lại.' },
            { type: 'h3', text: 'Giải tỏa lành mạnh' },
            { type: 'p', text: 'Đừng dồn nén, nhưng cũng đừng trút lên người khác.' },
            {
                type: 'ul', items: [
                    'Vận động mạnh: Chạy bộ, đấm bốc (vào bao cát).',
                    'Viết thư (nhưng đừng gửi): Hãy viết hết những gì bạn nghĩ ra giấy, rồi xé hoặc đốt nó đi.',
                    'Hít thở sâu 4-7-8: Hít 4s, nín 7s, thở ra 8s.'
                ]
            }
        ]
    },
    {
        id: 14,
        title: 'Ăn sao cho đẹp? Eat Clean tuổi dậy thì',
        summary: 'Ăn uống lành mạnh để có làn da đẹp và vóc dáng cân đối mà không cần ăn kiêng khắt khe.',
        readTime: '5 phút',
        category: 'Sức khỏe',
        icon: Coffee,
        color: 'bg-lime-100 text-lime-700',
        gradient: 'from-lime-400 to-green-500',
        content: [
            { type: 'h3', text: 'Đừng sợ tinh bột' },
            { type: 'p', text: 'Bộ não cần đường (glucose) để hoạt động. Cắt bỏ tinh bột hoàn toàn sẽ khiến bạn mệt mỏi, kém tập trung và hay cáu gắt.' },
            { type: 'h3', text: 'Đa dạng màu sắc' },
            { type: 'p', text: 'Hãy cố gắng ăn "cầu vồng": Càng nhiều rau củ quả màu sắc khác nhau càng tốt.' },
            {
                type: 'ul', items: [
                    'Uống đủ nước (2-2.5 lít/ngày).',
                    'Hạn chế đồ ăn chế biến sẵn (xúc xích, mì gói).',
                    'Ăn chậm nhai kỹ để no lâu hơn.'
                ]
            }
        ]
    },
    {
        id: 15,
        title: 'Red Flags trong tình bạn',
        summary: 'Làm sao để nhận biết một người bạn "độc hại" (toxic friend)?',
        readTime: '4 phút',
        category: 'Tình bạn',
        icon: MessageCircle,
        color: 'bg-purple-100 text-purple-700',
        gradient: 'from-purple-400 to-fuchsia-400',
        content: [
            { type: 'h3', text: 'Những dấu hiệu cảnh báo' },
            { type: 'p', text: 'Tình bạn nên mang lại niềm vui, không phải sự mệt mỏi triền miên.' },
            {
                type: 'ul', items: [
                    'Luôn nói xấu người khác với bạn (họ cũng sẽ nói xấu bạn với người khác).',
                    'Ghen tị khi bạn thành công hoặc có bạn mới.',
                    'Chỉ tìm đến bạn khi họ cần giúp đỡ.',
                    'Không tôn trọng ranh giới (boundaries) của bạn.'
                ]
            }
        ]
    }
];
