// src/pages/LandingPage.jsx
// Chú thích: Landing Page hoàn chỉnh với hero, features, stats, testimonials, CTA
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Bot, Heart, Sparkles, Gamepad2, Brain, Shield,
    Users, Clock, Award, ArrowRight, CheckCircle, Star,
    BookOpen, Palette, Zap, MessageCircle
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import GlowOrbs from '../components/ui/GlowOrbs';

// Animation variants
const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
};

const stagger = {
    animate: { transition: { staggerChildren: 0.1 } }
};

// Features data
const features = [
    {
        icon: Bot,
        title: 'Tâm sự An toàn',
        description: 'Chat với AI thấu hiểu, không phán xét. Chia sẻ mọi lo âu trong không gian riêng tư.',
        color: 'from-teal-500 to-cyan-500',
    },
    {
        icon: Heart,
        title: 'Góc An Yên',
        description: 'Bài tập thở khoa học giúp giảm stress, lo âu. Lấy lại bình tĩnh chỉ trong vài phút.',
        color: 'from-pink-500 to-rose-500',
    },
    {
        icon: Sparkles,
        title: 'Lọ Biết Ơn',
        description: 'Ghi lại những điều tốt đẹp mỗi ngày. Xây dựng thói quen tích cực, cải thiện tâm trạng.',
        color: 'from-amber-500 to-orange-500',
    },
    {
        icon: Gamepad2,
        title: 'Giải trí Thư giãn',
        description: 'Mini games vui nhộn giúp thư giãn đầu óc. Nghỉ ngơi hiệu quả giữa giờ học.',
        color: 'from-purple-500 to-indigo-500',
    },
    {
        icon: BookOpen,
        title: 'Tài nguyên Học tập',
        description: 'Kho tài liệu về sức khỏe tâm thần, kỹ năng sống được biên soạn riêng cho học sinh.',
        color: 'from-emerald-500 to-green-500',
    },
    {
        icon: Shield,
        title: 'Hỗ trợ Khẩn cấp',
        description: 'Hệ thống phát hiện SOS tự động. Kết nối ngay với chuyên gia khi cần.',
        color: 'from-red-500 to-pink-500',
    },
];

// Stats data
const stats = [
    { value: '10,000+', label: 'Học sinh đã sử dụng', icon: Users },
    { value: '50,000+', label: 'Cuộc trò chuyện', icon: Bot },
    { value: '95%', label: 'Phản hồi tích cực', icon: Star },
    { value: '24/7', label: 'Luôn sẵn sàng', icon: Clock },
];

// Benefits data
const benefits = [
    'Hoàn toàn miễn phí cho học sinh',
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
        author: 'Học sinh lớp 10, Hà Nội',
        avatar: '🧑‍🎓',
    },
    {
        content: '"Bài tập thở thực sự hiệu quả! Mỗi khi căng thẳng trước kỳ thi, mình dùng app này để bình tĩnh lại."',
        author: 'Học sinh lớp 12, TP.HCM',
        avatar: '👩‍🎓',
    },
    {
        content: '"Tính năng Lọ Biết Ơn giúp mình nhìn cuộc sống tích cực hơn. Đây là thói quen mình duy trì mỗi ngày."',
        author: 'Học sinh lớp 11, Đà Nẵng',
        avatar: '🎓',
    },
];

export default function LandingPage() {
    return (
        <div className="min-h-screen overflow-hidden">
            {/* ===== HERO SECTION ===== */}
            <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
                {/* Background Elements */}
                <GlowOrbs />

                <div className="relative z-10 max-w-6xl mx-auto text-center">
                    <motion.div {...fadeInUp}>
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
                            <Zap className="w-4 h-4 text-[--accent]" />
                            <span className="text-sm font-medium">Giải pháp Hỗ trợ Tâm lý Học đường</span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                            <span className="gradient-text">Bạn Đồng Hành</span>
                            <br />
                            <span className="text-[--text]">Luôn Ở Bên Bạn</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-lg md:text-xl text-[--text-secondary] max-w-2xl mx-auto mb-8 leading-relaxed">
                            Ứng dụng hỗ trợ sức khỏe tâm thần dành riêng cho học sinh Việt Nam.
                            <span className="text-[--brand] font-medium"> An toàn, Thân thiện, Miễn phí.</span>
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/app">
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

                    {/* Hero Visual */}
                    <motion.div
                        className="mt-16 relative"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                    >
                        <div className="relative mx-auto max-w-4xl">
                            {/* Main app preview card */}
                            <Card variant="elevated" className="p-8 md:p-12">
                                <div className="grid md:grid-cols-3 gap-6">
                                    {/* Quick action cards */}
                                    {[
                                        { icon: Bot, label: 'Tâm sự với AI', color: 'from-teal-500 to-cyan-500' },
                                        { icon: Heart, label: 'Thở', color: 'from-pink-500 to-rose-500' },
                                        { icon: Sparkles, label: 'Biết ơn', color: 'from-amber-500 to-orange-500' },
                                    ].map((item, idx) => (
                                        <motion.div
                                            key={item.label}
                                            className="glass-card p-6 rounded-2xl text-center hover:scale-105 transition-transform cursor-pointer"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 + idx * 0.1 }}
                                        >
                                            <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-lg`}>
                                                <item.icon className="w-7 h-7 text-white" />
                                            </div>
                                            <div className="font-semibold text-[--text]">{item.label}</div>
                                        </motion.div>
                                    ))}
                                </div>
                            </Card>

                            {/* Floating decorative elements */}
                            <div className="absolute -top-6 -left-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-[--brand]/20 to-transparent backdrop-blur-sm border border-[--brand]/20 rotate-12 animate-float" />
                            <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-br from-[--accent]/20 to-transparent backdrop-blur-sm border border-[--accent]/20 animate-float-slow" />
                        </div>
                    </motion.div>
                </div>

                {/* Scroll indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    <div className="w-6 h-10 rounded-full border-2 border-[--muted] flex justify-center pt-2">
                        <div className="w-1.5 h-2.5 rounded-full bg-[--muted]" />
                    </div>
                </motion.div>
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
                    {/* Section Header */}
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
                            Được thiết kế đặc biệt cho học sinh Việt Nam, kết hợp công nghệ AI
                            và kiến thức tâm lý học hiện đại.
                        </p>
                    </motion.div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <Card variant="interactive" className="h-full">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                                        <feature.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-[--text] mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-[--text-secondary] text-sm leading-relaxed">
                                        {feature.description}
                                    </p>
                                </Card>
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
                        {/* Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                Tại sao chọn <span className="gradient-text">Bạn Đồng Hành?</span>
                            </h2>
                            <p className="text-[--text-secondary] mb-8">
                                Chúng tôi hiểu rằng sức khỏe tâm thần của học sinh là nền tảng
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

                        {/* Visual */}
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
                                        { icon: Bot, label: 'Hỗ trợ 24/7', desc: 'Chat văn bản hoặc nói chuyện với AI' },
                                        { icon: Palette, label: 'Thân thiện', desc: 'Giao diện dễ sử dụng' },
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
            <section className="py-20 px-4 bg-[--surface]/50">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Học sinh <span className="gradient-text">Nói gì?</span>
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
                                <Link to="/app">
                                    <Button size="xl" iconRight={<ArrowRight size={20} />}>
                                        Trải nghiệm ngay
                                    </Button>
                                </Link>
                            </div>
                            <p className="text-xs text-[--muted] mt-6">
                                Hoàn toàn miễn phí • Không cần đăng ký • Bảo mật tuyệt đối
                            </p>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="py-12 px-4 border-t border-[--surface-border]">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        {/* Brand */}
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <img
                                    src="/logo.png"
                                    alt="Bạn Đồng Hành"
                                    className="w-10 h-10 rounded-xl shadow-lg object-cover"
                                />
                                <div>
                                    <div className="font-bold text-lg gradient-text">Bạn Đồng Hành</div>
                                    <div className="text-xs text-[--muted]">Hỗ trợ Tâm lý Học đường</div>
                                </div>
                            </div>
                            <p className="text-sm text-[--text-secondary] max-w-sm">
                                Giải pháp hỗ trợ sức khỏe tâm thần và tối ưu hóa trải nghiệm
                                hòa nhập dành cho học sinh Việt Nam.
                            </p>
                        </div>

                        {/* Links */}
                        <div>
                            <h4 className="font-semibold text-[--text] mb-4">Tính năng</h4>
                            <ul className="space-y-2 text-sm text-[--text-secondary]">
                                <li><Link to="/chat" className="hover:text-[--brand]">Chat AI</Link></li>
                                <li><Link to="/breathing" className="hover:text-[--brand]">Góc An Yên</Link></li>
                                <li><Link to="/gratitude" className="hover:text-[--brand]">Lọ Biết Ơn</Link></li>
                                <li><Link to="/games" className="hover:text-[--brand]">Mini Games</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-[--text] mb-4">Hỗ trợ</h4>
                            <ul className="space-y-2 text-sm text-[--text-secondary]">
                                <li><a href="#" className="hover:text-[--brand]">Hướng dẫn sử dụng</a></li>
                                <li><a href="#" className="hover:text-[--brand]">Câu hỏi thường gặp</a></li>
                                <li><a href="#" className="hover:text-[--brand]">Liên hệ</a></li>
                                <li><a href="#" className="hover:text-[--brand]">Đường dây nóng</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="pt-8 border-t border-[--surface-border] flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[--muted]">
                        <div>© 2024 Bạn Đồng Hành. Được phát triển với ❤️ cho học sinh Việt Nam.</div>
                        <div className="flex items-center gap-4">
                            <a href="#" className="hover:text-[--brand]">Chính sách bảo mật</a>
                            <a href="#" className="hover:text-[--brand]">Điều khoản sử dụng</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
