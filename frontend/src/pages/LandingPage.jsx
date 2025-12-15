// src/pages/LandingPage.jsx
// Chú thích: Landing Page - Design mới với hero, features, benefits, testimonials
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Bot, Heart, Sparkles, Gamepad2, Brain, Shield,
    Users, Clock, Award, ArrowRight, CheckCircle, Star,
    BookOpen, TrendingUp, Moon, Target, Mail, Phone,
    RefreshCw, Headphones, Smile
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import GlowOrbs from '../components/ui/GlowOrbs';

// Features data với route và mô tả chi tiết
const features = [
    {
        icon: Bot,
        title: 'AI Mentor tâm lý',
        description: 'Chat với AI thấu cảm, không phán xét. Bạn có thể chat bằng văn bản hoặc nói chuyện trực tiếp. AI sẽ lắng nghe và đưa ra lời khuyên phù hợp. Hệ thống tự động phát hiện khi bạn cần hỗ trợ khẩn cấp.',
        color: 'from-teal-500 to-cyan-500',
        route: '/app/chat',
    },
    {
        icon: Heart,
        title: 'Góc An Yên',
        description: 'Bài tập thở khoa học với animation và âm thanh hướng dẫn. Giúp bạn thư giãn, giảm lo âu và căng thẳng hiệu quả chỉ trong vài phút.',
        color: 'from-pink-500 to-rose-500',
        route: '/app/breathing',
    },
    {
        icon: Sparkles,
        title: 'Lọ Biết Ơn',
        description: 'Ghi lại những điều bạn biết ơn mỗi ngày. Hệ thống theo dõi streak, gợi ý nội dung và giúp bạn nhìn cuộc sống tích cực hơn.',
        color: 'from-amber-500 to-orange-500',
        route: '/app/gratitude',
    },
    {
        icon: BookOpen,
        title: 'Nhật ký cảm xúc',
        description: 'Ghi lại cảm xúc, suy nghĩ của bạn mỗi ngày. Phân tích xu hướng tâm lý theo thời gian, giúp bạn hiểu rõ bản thân hơn.',
        color: 'from-blue-500 to-indigo-500',
        route: '/app/journal',
    },
    {
        icon: Target,
        title: 'Hẹn giờ tập trung',
        description: 'Sử dụng kỹ thuật Pomodoro để tăng năng suất học tập. Đặt thời gian tập trung, nghỉ ngơi hợp lý và theo dõi tiến độ.',
        color: 'from-purple-500 to-indigo-500',
        route: '/app/focus',
    },
    {
        icon: Moon,
        title: 'Theo dõi giấc ngủ',
        description: 'Ghi lại thời gian ngủ, chất lượng giấc ngủ và cảm nhận của bạn. Phân tích mối liên hệ giữa giấc ngủ và tâm trạng.',
        color: 'from-indigo-500 to-purple-500',
        route: '/app/sleep',
    },
    {
        icon: Gamepad2,
        title: 'Mini Games',
        description: 'Các trò chơi nhỏ giúp bạn thư giãn, luyện phản xạ và giải tỏa căng thẳng. Nghỉ ngơi hiệu quả giữa giờ học.',
        color: 'from-green-500 to-emerald-500',
        route: '/app/games',
    },
    {
        icon: TrendingUp,
        title: 'Thống kê & Phân tích',
        description: 'Xem tổng quan về hành trình chăm sóc sức khỏe tâm thần của bạn. Phân tích xu hướng và nhận insights cá nhân hóa từ AI.',
        color: 'from-cyan-500 to-blue-500',
        route: '/app/analytics',
    },
    {
        icon: Award,
        title: 'Thành tích & Hành trình',
        description: 'Hệ thống thành tích, XP và levels giúp bạn theo dõi hành trình phát triển. Mở khóa các achievement khi đạt mục tiêu.',
        color: 'from-yellow-500 to-orange-500',
        route: '/app/achievements',
    },
];

// Stats data
const stats = [
    { value: '10,000+', label: 'Người dùng đã sử dụng', icon: Users },
    { value: '50,000+', label: 'Cuộc trò chuyện', icon: Bot },
    { value: '95%', label: 'Phản hồi tích cực', icon: Star },
    { value: '24/7', label: 'Luôn sẵn sàng', icon: Clock },
];

// Benefits data
const benefits = [
    'Hoàn toàn miễn phí',
    'Phù hợp văn hóa Việt',
    'Hỗ trợ đa nền tảng',
    'Bảo mật tuyệt đối',
    'Tư vấn bởi chuyên gia',
    'AI Thông minh',
];

// Benefit cards
const benefitCards = [
    {
        icon: Shield,
        title: 'An toàn',
        description: 'Bảo mật dữ liệu tuyệt đối cho người dùng.',
        color: 'bg-pink-100 dark:bg-pink-900/20',
        iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
        icon: RefreshCw,
        title: 'Cập nhật',
        description: 'Tính năng mới được cập nhật liên tục.',
        color: 'bg-purple-100 dark:bg-purple-900/20',
        iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
        icon: Headphones,
        title: 'Hỗ trợ 24/7',
        description: 'Luôn sẵn sàng khi bạn cần giúp đỡ.',
        color: 'bg-blue-100 dark:bg-blue-900/20',
        iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
        icon: Smile,
        title: 'Thân thiện',
        description: 'Giao diện dễ dùng, ấm áp.',
        color: 'bg-orange-100 dark:bg-orange-900/20',
        iconColor: 'text-orange-600 dark:text-orange-400',
    },
];

// Testimonials
const testimonials = [
    {
        content: 'Mình hay lo lắng về điểm số nhưng không biết nói với ai. Bạn Đồng Hành giúp mình thấy thoải mái hơn khi chia sẻ.',
        author: 'Học sinh',
        location: 'Hà Nội',
        avatar: 'H',
        color: 'bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
    },
    {
        content: 'Bài tập thở thực sự hiệu quả! Mỗi khi căng thẳng trước kỳ thi, mình dùng app này để bình tĩnh lại.',
        author: 'Học sinh',
        location: 'TP.HCM',
        avatar: 'T',
        color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    },
    {
        content: 'Tính năng Lọ Biết Ơn giúp mình nhìn cuộc sống tích cực hơn. Đây là thói quen mình duy trì mỗi ngày.',
        author: 'Giáo viên',
        location: 'Đà Nẵng',
        avatar: 'D',
        color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    },
];

export default function LandingPage() {
    return (
        <div className="min-h-screen overflow-hidden">
            {/* ===== HERO SECTION ===== */}
            <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
                <GlowOrbs />

                <div className="relative z-10 max-w-6xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                            <span className="gradient-text">Bạn Đồng Hành</span>
                            <br />
                            <span className="text-[--text]">Cùng nhau phát triển Trường học Hạnh phúc</span>
                        </h1>

                        <p className="text-lg md:text-xl text-[--text-secondary] max-w-2xl mx-auto mb-8 leading-relaxed">
                            Nền tảng hỗ trợ phát triển toàn diện cho cộng đồng giáo dục Việt Nam.
                            <span className="text-[--brand] font-medium"> An toàn, Thân thiện, Miễn phí.</span>
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/app">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                                >
                                    Bắt đầu ngay
                                    <ArrowRight size={20} />
                                </motion.button>
                            </Link>
                            <Link to="#features">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-4 bg-white dark:bg-gray-800 border-2 border-pink-300 dark:border-pink-700 text-pink-600 dark:text-pink-400 rounded-xl font-semibold text-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all"
                                >
                                    Tìm hiểu thêm
                                </motion.button>
                            </Link>
                        </div>
                    </motion.div>

                </div>
            </section>


            {/* ===== FEATURES SECTION ===== */}
            <section id="features" className="py-20 px-4 bg-gradient-to-b from-transparent to-pink-50/30 dark:to-gray-900/50">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <Link to={feature.route}>
                                    <Card className="h-full bg-white dark:bg-gray-800 rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg shrink-0`}>
                                            <feature.icon className="w-6 h-6 text-white" />
                                        </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        {feature.title}
                                    </h3>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                                        {feature.description}
                                    </p>
                                        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-sm font-medium">
                                            <span>Khám phá ngay</span>
                                            <ArrowRight size={16} />
                                        </div>
                                </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== BENEFITS SECTION ===== */}
            <section className="py-20 px-4 bg-white dark:bg-gray-900">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        className="text-center mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold uppercase tracking-wide mb-2">
                            LỢI ÍCH
                        </p>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">
                            Tại sao chọn Bạn Đồng Hành?
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
                            Chúng tôi tin rằng một môi trường giáo dục hạnh phúc là nền tảng
                            cho sự phát triển toàn diện. Bạn Đồng Hành được xây dựng với
                            tâm huyết và sự tận tâm.
                        </p>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-12 items-start">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <ul className="space-y-4">
                                {benefits.map((benefit, idx) => (
                                    <motion.li
                                        key={benefit}
                                        className="flex items-start gap-3"
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        viewport={{ once: true }}
                                    >
                                        <div className="shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5">
                                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        </div>
                                        <span className="text-gray-900 dark:text-white text-lg">{benefit}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="grid grid-cols-2 gap-4"
                        >
                            {benefitCards.map((card, idx) => (
                    <motion.div
                                    key={card.title}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                    className={`${card.color} rounded-2xl p-6 text-center`}
                    >
                                    <card.icon className={`w-8 h-8 mx-auto mb-3 ${card.iconColor}`} />
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{card.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{card.description}</p>
                            </motion.div>
                        ))}
                            </motion.div>
                    </div>
                </div>
            </section>

            {/* ===== TESTIMONIALS SECTION ===== */}
            <section className="py-20 px-4 bg-gradient-to-b from-pink-50/30 dark:from-gray-900/50 to-transparent">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Người dùng nói gì?
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <Card className="h-full bg-white dark:bg-gray-800 rounded-2xl p-6">
                                    <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                                        "{item.content}"
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center font-bold text-lg`}>
                                            {item.avatar}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900 dark:text-white">{item.author}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{item.location}</div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA SECTION ===== */}
            <section className="py-20 px-4 relative overflow-hidden">
                <GlowOrbs />

                <div className="max-w-4xl mx-auto relative z-10">
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <Card variant="gradient" className="p-12">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Sẵn sàng bắt đầu?
                            </h2>
                            <p className="text-[--text-secondary] mb-8 max-w-lg mx-auto">
                                Hãy để Bạn Đồng Hành đồng hành cùng bạn trên hành trình
                                chăm sóc sức khỏe tâm thần.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link to="/app">
                                    <Button size="xl" iconRight={<ArrowRight size={20} />}>
                                        Trải nghiệm ngay
                                    </Button>
                                </Link>
                            </div>
                            <p className="text-sm text-[--text-secondary] mt-6">
                                Hoàn toàn miễn phí • Không cần đăng ký phức tạp • Bảo mật tuyệt đối
                            </p>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="py-12 px-4 border-t border-[--surface-border]">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <img
                                    src="/logo.png"
                                    alt="Bạn Đồng Hành"
                                    className="w-10 h-10 rounded-xl shadow-lg object-cover"
                                />
                                <div>
                                    <div className="font-bold text-lg gradient-text">Bạn Đồng Hành</div>
                                    <div className="text-sm text-[--text-secondary] font-medium">Trường học Hạnh phúc</div>
                                </div>
                            </div>
                            <p className="text-sm text-[--text-secondary]">
                                Nền tảng hỗ trợ phát triển toàn diện cho cộng đồng giáo dục Việt Nam.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-[--text] mb-4">Tính năng</h4>
                            <ul className="space-y-2 text-sm text-[--text-secondary]">
                                <li><Link to="/app/chat" className="hover:text-[--brand] transition-colors">Chat AI</Link></li>
                                <li><Link to="/app/breathing" className="hover:text-[--brand] transition-colors">Góc An Yên</Link></li>
                                <li><Link to="/app/gratitude" className="hover:text-[--brand] transition-colors">Lọ Biết Ơn</Link></li>
                                <li><Link to="/app/games" className="hover:text-[--brand] transition-colors">Mini Games</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-[--text] mb-4">Liên hệ & Hỗ trợ</h4>
                            <ul className="space-y-2 text-sm text-[--text-secondary]">
                                <li className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    <a href="mailto:stu725114073@hnue.edu.vn" className="hover:text-[--brand] transition-colors">
                                        Email: stu725114073@hnue.edu.vn
                                    </a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    <a href="tel:0896636181" className="hover:text-[--brand] transition-colors">
                                        Long Nguyễn 0896636181
                                    </a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    <a href="tel:1800599920" className="hover:text-[--brand] transition-colors">
                                        Đường dây nóng Ngày Mai 096 306 1414
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-[--surface-border] text-center text-sm text-[--muted]">
                        © 2025 Bạn Đồng Hành. Được phát triển với tình yêu quý dành cho cộng đồng giáo dục Việt Nam.
                    </div>
                </div>
            </footer>
        </div>
    );
}
