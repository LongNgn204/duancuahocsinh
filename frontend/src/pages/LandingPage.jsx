// src/pages/LandingPage.jsx
// Chú thích: Landing Page đơn giản, tập trung vào chức năng
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Bot, Heart, Sparkles, Gamepad2, Brain, Shield,
    Users, Clock, Award, ArrowRight, CheckCircle, Star,
    BookOpen, TrendingUp, Moon, Target, Mail, Phone
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
    'Hoàn toàn miễn phí cho cộng đồng giáo dục',
    'Bảo mật tuyệt đối, không lưu thông tin cá nhân',
    'Nội dung phù hợp văn hóa Việt Nam',
    'Được tư vấn bởi chuyên gia tâm lý',
    'Hỗ trợ đa nền tảng (Web, Mobile)',
    'Cập nhật tính năng liên tục',
];

// Testimonials
const testimonials = [
    {
        content: '"Mình hay lo lắng về điểm số nhưng không biết nói với ai. Bạn Đồng Hành giúp mình thấy thoải mái hơn khi chia sẻ."',
        author: 'Người dùng tại Hà Nội',
        avatar: '🧑‍🎓',
    },
    {
        content: '"Bài tập thở thực sự hiệu quả! Mỗi khi căng thẳng trước kỳ thi, mình dùng app này để bình tĩnh lại."',
        author: 'Người dùng tại TP.HCM',
        avatar: '👩‍🎓',
    },
    {
        content: '"Tính năng Lọ Biết Ơn giúp mình nhìn cuộc sống tích cực hơn. Đây là thói quen mình duy trì mỗi ngày."',
        author: 'Người dùng tại Đà Nẵng',
        avatar: '🎓',
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
                            <Link to="/login">
                                <Button size="xl" iconRight={<ArrowRight size={20} />}>
                                    Bắt đầu ngay
                                </Button>
                            </Link>
                            <Link to="#features">
                                <Button variant="outline" size="xl">
                                    Tìm hiểu thêm
                                </Button>
                            </Link>
                        </div>
                    </motion.div>

                </div>
            </section>

            {/* ===== STATS SECTION ===== */}
            <section className="py-20 px-4 bg-gradient-to-b from-transparent to-[--surface]/50">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={stat.label}
                                className="text-center"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[--brand]/10 text-[--brand] mb-3">
                                    <stat.icon size={24} />
                                </div>
                                <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-[--muted]">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== FEATURES SECTION ===== */}
            <section id="features" className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Tính năng <span className="gradient-text">Nổi bật</span>
                        </h2>
                        <p className="text-[--text-secondary] max-w-2xl mx-auto">
                            Được thiết kế đặc biệt cho cộng đồng giáo dục Việt Nam, kết hợp công nghệ AI
                            và kiến thức tâm lý học hiện đại.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <Link to={feature.route}>
                                    <Card variant="interactive" className="h-full hover:scale-105 transition-transform">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg shrink-0`}>
                                                <feature.icon className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-[--text] mb-2">
                                                    {feature.title}
                                                </h3>
                                            </div>
                                        </div>
                                        <p className="text-[--text-secondary] text-sm leading-relaxed">
                                            {feature.description}
                                        </p>
                                        <div className="mt-4 flex items-center gap-2 text-[--brand] text-sm font-medium">
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
            <section className="py-20 px-4 relative overflow-hidden">
                <GlowOrbs className="opacity-50" />

                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                Tại sao chọn <span className="gradient-text">Bạn Đồng Hành?</span>
                            </h2>
                            <p className="text-[--text-secondary] mb-8">
                                Chúng tôi tin rằng một môi trường giáo dục hạnh phúc là nền tảng
                                cho sự phát triển toàn diện. Bạn Đồng Hành được xây dựng với
                                tâm huyết và sự tận tâm.
                            </p>

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
                                        <div className="shrink-0 w-6 h-6 rounded-full bg-[--brand]/10 flex items-center justify-center mt-0.5">
                                            <CheckCircle className="w-4 h-4 text-[--brand]" />
                                        </div>
                                        <span className="text-[--text]">{benefit}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <Card variant="highlight" className="p-8">
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { icon: Brain, label: 'AI Thông minh', desc: 'Hiểu context & cảm xúc' },
                                        { icon: Shield, label: 'An toàn', desc: 'Bảo mật dữ liệu' },
                                        { icon: Bot, label: 'Hỗ trợ 24/7', desc: 'Luôn sẵn sàng' },
                                        { icon: Heart, label: 'Thân thiện', desc: 'Giao diện dễ dùng' },
                                    ].map((item) => (
                                        <div key={item.label} className="glass-card p-4 rounded-xl text-center">
                                            <item.icon className="w-8 h-8 mx-auto mb-2 text-[--brand]" />
                                            <div className="font-semibold text-sm text-[--text]">{item.label}</div>
                                            <div className="text-xs text-[--muted]">{item.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ===== TESTIMONIALS SECTION ===== */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Người dùng <span className="gradient-text">Nói gì?</span>
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
                                <Card className="h-full">
                                    <div className="flex items-center gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-[--accent] text-[--accent]" />
                                        ))}
                                    </div>
                                    <p className="text-[--text-secondary] italic mb-4">
                                        {item.content}
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[--surface-border] flex items-center justify-center text-xl">
                                            {item.avatar}
                                        </div>
                                        <div className="text-sm text-[--muted]">{item.author}</div>
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
                                <Link to="/login">
                                    <Button size="xl" iconRight={<ArrowRight size={20} />}>
                                        Trải nghiệm ngay
                                    </Button>
                                </Link>
                            </div>
                            <p className="text-xs text-[--muted] mt-6">
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
                                    <div className="text-xs text-[--muted]">Trường học Hạnh phúc</div>
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
