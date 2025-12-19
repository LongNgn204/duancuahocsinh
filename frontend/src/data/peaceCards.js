// src/data/peaceCards.js
// Bộ thẻ An Yên (Peace Cards) - 30+ thẻ

import { Sparkles, Heart, Coffee, Leaf, Eye, Feather, Sun, Moon, Music } from 'lucide-react';

export const PEACE_CARDS = [
    // --- 1. Thẻ Bình Yên (PEACE) - Màu Xanh Dương/Tím ---
    {
        id: 'p1',
        type: 'peace',
        color: 'bg-blue-100 text-blue-600',
        icon: Coffee,
        title: 'Thẻ Bình Yên',
        content: 'Hít một hơi thật sâu... giữ lại... và thở ra mọi lo lắng.',
        action: 'Thực hiện 3 lần ngay bây giờ.'
    },
    {
        id: 'p2',
        type: 'peace',
        color: 'bg-indigo-100 text-indigo-600',
        icon: Moon,
        title: 'Thẻ Bình Yên',
        content: 'Hãy nhắm mắt lại và tưởng tượng bạn đang ở một bãi biển vắng.',
        action: 'Nghe tiếng sóng vỗ trong 15 giây.'
    },
    {
        id: 'p3',
        type: 'peace',
        color: 'bg-sky-100 text-sky-600',
        icon: Cloud,
        title: 'Thẻ Bình Yên',
        content: 'Nhìn lên bầu trời (hoặc trần nhà) và tìm một hình dáng thú vị.',
        action: 'Thả lỏng đôi vai đang căng cứng.'
    },
    {
        id: 'p4',
        type: 'peace',
        color: 'bg-violet-100 text-violet-600',
        icon: Feather,
        title: 'Thẻ Bình Yên',
        content: 'Mọi chuyện rồi sẽ ổn thôi. Bạn đang an toàn ở đây.',
        action: 'Đặt tay lên ngực trái và cảm nhận nhịp tim.'
    },
    {
        id: 'p5',
        type: 'peace',
        color: 'bg-cyan-100 text-cyan-600',
        icon: Leaf,
        title: 'Quy tắc 3-3-3',
        content: 'Nhìn xung quanh và tìm: 3 thứ bạn thấy, 3 âm thanh bạn nghe, 3 bộ phận cơ thể bạn cử động được.',
        action: 'Giúp bạn quay về thực tại ngay lập tức.'
    },
    {
        id: 'p6',
        type: 'peace',
        color: 'bg-slate-100 text-slate-600',
        icon: Eye,
        title: 'Nghỉ ngơi đôi mắt',
        content: 'Bạn đã nhìn màn hình quá lâu rồi.',
        action: 'Nhắm mắt lại và đếm ngược từ 20 về 0.'
    },

    // --- 2. Thẻ Hành Động (ACTION) - Màu Xanh Lá/Cam ---
    {
        id: 'a1',
        type: 'action',
        color: 'bg-green-100 text-green-600',
        icon: Sparkles,
        title: 'Việc Làm Nhỏ',
        content: 'Tìm 5 vật màu xanh lá cây xung quanh bạn ngay bây giờ.',
        action: 'Kích hoạt sự chú ý của bạn vào hiện tại.'
    },
    {
        id: 'a2',
        type: 'action',
        color: 'bg-teal-100 text-teal-600',
        icon: Coffee,
        title: 'Cấp nước',
        content: 'Cơ thể bạn đang khát đấy. Hãy uống một ngụm nước ấm.',
        action: 'Cảm nhận dòng nước đi vào cơ thể.'
    },
    {
        id: 'a3',
        type: 'action',
        color: 'bg-emerald-100 text-emerald-600',
        icon: Sparkles,
        title: 'Gọn gàng',
        content: 'Sắp xếp lại 3 món đồ trên bàn học cho ngay ngắn.',
        action: 'Không gian gọn gàng giúp tâm trí gọn gàng.'
    },
    {
        id: 'a4',
        type: 'action',
        color: 'bg-orange-100 text-orange-600',
        icon: Sun,
        title: 'Vận động',
        content: 'Đứng dậy và vươn vai thật cao lên trần nhà.',
        action: 'Giữ trong 5 giây rồi thả lỏng.'
    },
    {
        id: 'a5',
        type: 'action',
        color: 'bg-lime-100 text-lime-600',
        icon: Music,
        title: 'Âm nhạc',
        content: 'Bật một bài hát bạn yêu thích nhất lúc này.',
        action: 'Nhún nhảy theo điệu nhạc nếu bạn muốn.'
    },
    {
        id: 'a6',
        type: 'action',
        color: 'bg-amber-100 text-amber-600',
        icon: Feather,
        title: 'Viết ra',
        content: 'Lấy một tờ giấy, viết ra 3 từ mô tả cảm xúc của bạn lúc này.',
        action: 'Sau đó vo tròn tờ giấy và ném vào thùng rác nếu đó là cảm xúc tiêu cực.'
    },

    // --- 3. Thẻ Nhắn Nhủ (MESSAGE) - Màu Hồng/Đỏ ---
    {
        id: 'm1',
        type: 'message',
        color: 'bg-rose-100 text-rose-600',
        icon: Heart,
        title: 'Nhắn Nhủ',
        content: 'Hôm nay bạn đã làm rất tốt rồi. Tôi tự hào về bạn!',
        action: 'Tự ôm lấy bản thân một cái thật chặt.'
    },
    {
        id: 'm2',
        type: 'message',
        color: 'bg-pink-100 text-pink-600',
        icon: Heart,
        title: 'Nhắn Nhủ',
        content: 'Bạn là phiên bản độc nhất vô nhị trên thế giới này.',
        action: 'Hãy mỉm cười với người trong gương.'
    },
    {
        id: 'm3',
        type: 'message',
        color: 'bg-purple-100 text-purple-600',
        icon: Heart,
        title: 'Nhắn Nhủ',
        content: 'Không sao cả nếu hôm nay bạn thấy mệt. Nghỉ ngơi là một phần của cố gắng.',
        action: 'Cho phép mình lười biếng 5 phút.'
    },
    {
        id: 'm4',
        type: 'message',
        color: 'bg-fuchsia-100 text-fuchsia-600',
        icon: Star,
        title: 'Lời khuyên',
        content: 'Đừng so sánh chương 1 của mình với chương 20 của người khác.',
        action: 'Tập trung vào trang sách của riêng bạn.'
    },
    {
        id: 'm5',
        type: 'message',
        color: 'bg-red-100 text-red-600',
        icon: Heart,
        title: 'Yêu thương',
        content: 'Hãy tha thứ cho bản thân vì những lỗi lầm cũ. Bạn đã trưởng thành rồi.',
        action: 'Hít sâu và nói: "Tôi tha thứ cho mình".'
    },
    {
        id: 'm6',
        type: 'message',
        color: 'bg-yellow-100 text-yellow-600',
        icon: Sun,
        title: 'Tích cực',
        content: 'Tìm 1 điều bé nhỏ làm bạn vui hôm nay.',
        action: 'Một bông hoa, một cốc trà ngon, hay một tin nhắn?'
    },
];

// Helper components for missing icons used above
function Cloud(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M17.5 19c0-1.7-1.3-3-3-3h-11a3 3 0 0 0-3 3h17z" />
            <path d="M17.5 19a3 3 0 0 0 0-6h-1.7c-.5-3.3-3.4-5.8-6.8-5.8-3.3 0-6.1 2.3-6.8 5.6H5a3 3 0 0 0 0 6h12.5z" />
        </svg>
    )
}
