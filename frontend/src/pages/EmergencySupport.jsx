// src/pages/EmergencySupport.jsx
// Chú thích: Trang Hỗ trợ khẩn cấp - Hiển thị đường dây nóng và hỗ trợ tâm lý
import { motion } from 'framer-motion';
import { Phone, Shield, Heart, MapPin, MessageCircle, ExternalLink, AlertTriangle, Headphones } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Link } from 'react-router-dom';

// Chú thích: Danh sách đường dây nóng hỗ trợ tâm lý tại Việt Nam
const HOTLINES = [
    {
        name: 'Tổng đài Quốc gia Bảo vệ Trẻ em',
        phone: '111',
        description: 'Miễn phí 24/7 - Dành cho trẻ em và thanh thiếu niên',
        color: 'from-red-500 to-rose-500',
        icon: Phone,
    },
    {
        name: 'Đường dây nóng Ngày Mai',
        phone: '096 306 1414',
        description: 'Hỗ trợ tâm lý thanh thiếu niên miễn phí',
        color: 'from-blue-500 to-indigo-500',
        icon: Headphones,
    },
    {
        name: 'Tổng đài Sức khỏe Tâm thần',
        phone: '1800 599 920',
        description: 'Miễn phí - Tư vấn sức khỏe tâm thần',
        color: 'from-purple-500 to-violet-500',
        icon: Heart,
    },
    {
        name: 'Trung tâm Hỗ trợ Phát triển Phụ nữ',
        phone: '1800 1567',
        description: 'Miễn phí - Hỗ trợ bạo lực gia đình',
        color: 'from-pink-500 to-rose-500',
        icon: Shield,
    },
];

// Chú thích: Các bước hít thở bình tĩnh
const CALM_STEPS = [
    { step: 1, title: 'Hít vào', duration: '4 giây', description: 'Hít thở sâu bằng mũi' },
    { step: 2, title: 'Giữ hơi', duration: '4 giây', description: 'Giữ hơi thở trong phổi' },
    { step: 3, title: 'Thở ra', duration: '6 giây', description: 'Thở ra từ từ bằng miệng' },
    { step: 4, title: 'Lặp lại', duration: '3-5 lần', description: 'Tiếp tục cho đến khi bình tĩnh' },
];

export default function EmergencySupport() {
    const handleCall = (phone) => {
        window.location.href = `tel:${phone.replace(/\s/g, '')}`;
    };

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-block p-4 bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl text-white shadow-lg mb-4"
                >
                    <Shield size={40} />
                </motion.div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
                    Hỗ Trợ <span className="text-red-500">Khẩn Cấp</span>
                </h1>
                <p className="text-slate-500 mt-2 max-w-lg mx-auto">
                    Bạn không đơn độc. Luôn có người sẵn sàng lắng nghe và giúp đỡ bạn.
                </p>
            </div>

            {/* Alert Banner */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-4 flex items-start gap-4"
            >
                <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                    <AlertTriangle size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-amber-800 mb-1">Nếu bạn đang gặp nguy hiểm</h3>
                    <p className="text-amber-700 text-sm">
                        Hãy gọi ngay <strong>111</strong> hoặc đến phòng cấp cứu gần nhất.
                        Đừng ngại yêu cầu giúp đỡ - đó là điều dũng cảm nhất bạn có thể làm.
                    </p>
                </div>
            </motion.div>

            {/* Đường dây nóng */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Phone className="text-red-500" />
                    Đường dây nóng hỗ trợ
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                    {HOTLINES.map((hotline, idx) => (
                        <motion.div
                            key={hotline.phone}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="h-full hover:shadow-lg transition-shadow">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${hotline.color} text-white shadow-md`}>
                                        <hotline.icon size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-800">{hotline.name}</h3>
                                        <p className="text-2xl font-bold text-slate-900 my-1">{hotline.phone}</p>
                                        <p className="text-sm text-slate-500">{hotline.description}</p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => handleCall(hotline.phone)}
                                    className="w-full mt-4"
                                    icon={<Phone size={18} />}
                                >
                                    Gọi ngay
                                </Button>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Bài tập bình tĩnh */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 border border-blue-100">
                <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Heart className="text-blue-500" />
                    Bài tập bình tĩnh nhanh
                </h2>
                <p className="text-slate-600 mb-6">
                    Khi cảm thấy lo lắng hoặc hoảng loạn, hãy thử kỹ thuật thở này:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {CALM_STEPS.map((item) => (
                        <motion.div
                            key={item.step}
                            whileHover={{ scale: 1.05 }}
                            className="bg-white rounded-2xl p-4 text-center shadow-sm"
                        >
                            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center">
                                {item.step}
                            </div>
                            <h4 className="font-bold text-slate-800">{item.title}</h4>
                            <p className="text-blue-600 font-medium">{item.duration}</p>
                            <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                        </motion.div>
                    ))}
                </div>
                <div className="mt-6 text-center">
                    <Link to="/breathing">
                        <Button variant="ghost" className="bg-blue-100 hover:bg-blue-200 text-blue-700">
                            Xem thêm bài tập thở tại Góc An Yên →
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Tìm bệnh viện */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100">
                <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <MapPin className="text-green-500" />
                    Tìm cơ sở y tế gần bạn
                </h2>
                <p className="text-slate-600 mb-4">
                    Tìm bệnh viện, phòng khám hoặc trung tâm tư vấn tâm lý gần vị trí của bạn.
                </p>
                <a
                    href="https://www.google.com/maps/search/bệnh+viện+gần+đây"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Button icon={<ExternalLink size={18} />} className="w-full md:w-auto">
                        Mở Google Maps
                    </Button>
                </a>
            </div>

            {/* Trò chuyện với AI */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 border border-purple-100">
                <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <MessageCircle className="text-purple-500" />
                    Cần ai đó lắng nghe?
                </h2>
                <p className="text-slate-600 mb-4">
                    Bạn có thể trò chuyện với Bạn Đồng Hành bất cứ lúc nào.
                    Mình luôn ở đây để lắng nghe và đồng hành cùng bạn.
                </p>
                <div className="flex gap-3 flex-wrap">
                    <Link to="/chat">
                        <Button icon={<MessageCircle size={18} />}>
                            Trò chuyện ngay
                        </Button>
                    </Link>
                    <Link to="/voice-call">
                        <Button variant="ghost" icon={<Phone size={18} />}>
                            Gọi điện AI
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Lời nhắn */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center py-8"
            >
                <p className="text-xl md:text-2xl font-medium text-slate-600 italic max-w-2xl mx-auto">
                    "Bạn quan trọng. Cảm xúc của bạn quan trọng.
                    Và việc bạn tìm kiếm sự giúp đỡ là điều <strong className="text-red-500">rất dũng cảm</strong>."
                </p>
                <p className="text-slate-400 mt-4">— Bạn Đồng Hành</p>
            </motion.div>
        </div>
    );
}
