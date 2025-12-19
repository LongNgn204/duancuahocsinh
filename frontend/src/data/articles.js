// src/data/articles.js
// Góc Kiến Thức - Bài viết tâm lý học đường

import { Brain, Moon, Heart, Users, BookOpen, Shield } from 'lucide-react';

export const ARTICLES = [
    {
        id: 'anxiety-101',
        title: 'Hiểu về Rối loạn Lo âu',
        category: 'Sức khỏe tâm thần',
        icon: Brain,
        color: 'bg-purple-100 text-purple-600',
        readTime: '3 phút',
        summary: 'Lo âu không chỉ là cảm giác lo lắng. Nó là phản ứng tự nhiên của cơ thể...',
        content: [
            { type: 'h3', text: 'Lo âu là gì?' },
            { type: 'p', text: 'Lo âu là phản ứng tự nhiên của cơ thể trước căng thẳng. Đó là cảm giác sợ hãi hay lo lắng sắo xảy ra. Ngày đầu tiên đi học, đi phỏng vấn xin việc, hay phát biểu trước đám đông có thể khiến bạn cảm thấy sợ hãi và lo lắng.' },
            { type: 'p', text: 'Tuy nhiên, nếu cảm giác lo âu của bạn cực độ, kéo dài hơn sáu tháng và ảnh hưởng đến cuộc sống hàng ngày, bạn có thể bị rối loạn lo âu.' },
            { type: 'h3', text: 'Dấu hiệu nhận biết' },
            { type: 'ul', items: ['Cảm thấy bồn chồn hoặc căng thẳng', 'Cảm giác nguy hiểm sắp xảy ra', 'Nhịp tim tăng nhanh', 'Thở gấp (tăng thông khí)', 'Đổ mồ hôi', 'Run rẩy'] },
            { type: 'h3', text: 'Cách đối phó' },
            { type: 'p', text: 'Tập thể dục, thiền định, và ngủ đủ giấc là những cách tốt để giảm lo âu. Nếu lo âu ảnh hưởng nghiêm trọng đến bạn, hãy tìm kiếm sự giúp đỡ từ chuyên gia.' }
        ]
    },
    {
        id: 'sleep-hygiene',
        title: 'Vệ sinh giấc ngủ (Sleep Hygiene)',
        category: 'Lối sống',
        icon: Moon,
        color: 'bg-indigo-100 text-indigo-600',
        readTime: '4 phút',
        summary: 'Mẹo để có giấc ngủ ngon hơn mỗi đêm, giúp cải thiện trí nhớ và tâm trạng.',
        content: [
            { type: 'h3', text: 'Tại sao giấc ngủ quan trọng?' },
            { type: 'p', text: 'Giấc ngủ đóng vai trò quan trọng đối với sức khỏe thể chất và tinh thần. Ngủ đủ giấc giúp cải thiện trí nhớ, sự tập trung và tâm trạng.' },
            { type: 'h3', text: 'Mẹo ngủ ngon' },
            { type: 'ul', items: ['Đi ngủ và thức dậy vào cùng một giờ mỗi ngày', 'Tạo không gian ngủ thoải mái, tối và yên tĩnh', 'Tránh caffeine và thiết bị điện tử trước khi ngủ', 'Thư giãn trước khi ngủ bằng cách đọc sách hoặc nghe nhạc nhẹ'] }
        ]
    },
    {
        id: 'exam-stress',
        title: 'Vượt qua áp lực thi cử',
        category: 'Học tập',
        icon: BookOpen,
        color: 'bg-red-100 text-red-600',
        readTime: '5 phút',
        summary: 'Các chiến thuật ôn thi hiệu quả và cách giữ bình tĩnh trong phòng thi.',
        content: [
            { type: 'h3', text: 'Lập kế hoạch ôn tập' },
            { type: 'p', text: 'Chia nhỏ nội dung ôn tập thành các phần nhỏ và phân bố thời gian hợp lý. Đừng cố gắng nhồi nhét mọi thứ vào phút chót.' },
            { type: 'h3', text: 'Giữ sức khỏe' },
            { type: 'p', text: 'Ăn uống đầy đủ, uống nhiều nước và ngủ đủ giấc. Đừng lạm dụng caffeine hay thức khuya.' },
            { type: 'h3', text: 'Trong phòng thi' },
            { type: 'p', text: 'Hít thở sâu. Đọc kỹ đề bài. Làm câu dễ trước, câu khó sau. Đừng lo lắng nếu thấy các bạn khác làm xong sớm.' }
        ]
    },
    {
        id: 'helping-friends',
        title: 'Cách giúp bạn bè đang buồn',
        category: 'Tình bạn',
        icon: Heart,
        color: 'bg-pink-100 text-pink-600',
        readTime: '3 phút',
        summary: 'Làm thế nào để lắng nghe và hỗ trợ người bạn đang gặp khó khăn tâm lý?',
        content: [
            { type: 'h3', text: 'Lắng nghe tích cực' },
            { type: 'p', text: 'Hãy lắng nghe mà không phán xét. Đôi khi bạn của bạn chỉ cần một người để trút bầu tâm sự.' },
            { type: 'h3', text: 'Đừng cố giải quyết vấn đề' },
            { type: 'p', text: 'Thay vì đưa ra lời khuyên, hãy hỏi: "Tớ có thể làm gì để giúp cậu?" hoặc "Cậu có muốn tớ chỉ ngồi đây với cậu không?"' },
            { type: 'h3', text: 'Khuyến khích tìm kiếm sự giúp đỡ' },
            { type: 'p', text: 'Nếu vấn đề nghiêm trọng, hãy khuyến khích bạn bè nói chuyện với người lớn tin cậy hoặc chuyên gia tâm lý.' }
        ]
    },
    {
        id: 'social-media',
        title: 'Mạng xã hội và Cảm xúc',
        category: 'Đời sống số',
        icon: Users,
        color: 'bg-blue-100 text-blue-600',
        readTime: '4 phút',
        summary: 'Tại sao lướt Facebook/TikTok lại khiến bạn buồn và cách sử dụng nó lành mạnh.',
        content: [
            { type: 'h3', text: 'Bẫy so sánh' },
            { type: 'p', text: 'Mọi người thường chỉ đăng những khoảnh khắc đẹp nhất lên mạng xã hội. Đừng so sánh hậu trường của bạn với sân khấu của họ.' },
            { type: 'h3', text: 'FOMO (Sợ bị bỏ lỡ)' },
            { type: 'p', text: 'Giới hạn thời gian sử dụng mạng xã hội. Tập trung vào cuộc sống thực và những mối quan hệ xung quanh bạn.' }
        ]
    },
    {
        id: 'boundaries',
        title: 'Thiết lập ranh giới cá nhân',
        category: 'Kỹ năng sống',
        icon: Shield,
        color: 'bg-emerald-100 text-emerald-600',
        readTime: '3 phút',
        summary: 'Học cách nói "Không" mà không cảm thấy tội lỗi.',
        content: [
            { type: 'h3', text: 'Ranh giới là gì?' },
            { type: 'p', text: 'Ranh giới là những quy tắc bạn đặt ra để bảo vệ sức khỏe thể chất và tinh thần của mình.' },
            { type: 'h3', text: 'Tại sao cần ranh giới?' },
            { type: 'p', text: 'Ranh giới giúp bạn tránh bị kiệt sức, lợi dụng và duy trì các mối quan hệ lành mạnh.' },
            { type: 'h3', text: 'Cách nói "Không"' },
            { type: 'p', text: 'Hãy nói "Không" một cách lịch sự nhưng kiên quyết. Bạn không cần phải giải thích chi tiết lý do.' }
        ]
    }
];
