// src/pages/LandingPage.jsx
// Chú thích: Landing Page hoàn chỉnh với hero, features, stats, testimonials, CTA
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Bot, Heart, Sparkles, Gamepad2, Brain, Shield,
    Users, Clock, Award, ArrowRight, CheckCircle, Star,
    BookOpen, Palette, Zap, MessageCircle, Globe, Code,
    TrendingUp, Lock, Smartphone, Mail, Phone, ExternalLink,
    Database, Cloud, Sparkles as SparklesIcon
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
        title: 'AI Mentor tâm lý',
        description: 'Chat với AI thấu cảm, không phán xét, hỗ trợ 24/7. Text-to-Speech và Voice Chat real-time.',
        color: 'from-teal-500 to-cyan-500',
        status: '✅',
    },
    {
        icon: Heart,
        title: 'Góc An Yên',
        description: 'Bài tập thở khoa học với animation, âm thanh hướng dẫn. Giảm stress, lo âu hiệu quả.',
        color: 'from-pink-500 to-rose-500',
        status: '✅',
    },
    {
        icon: Sparkles,
        title: 'Lọ Biết Ơn',
        description: 'Hệ thống tag, gợi ý nội dung, streak tracking. Xây dựng thói quen tích cực mỗi ngày.',
        color: 'from-amber-500 to-orange-500',
        status: '✅',
    },
    {
        icon: BookOpen,
        title: 'Nhật ký',
        description: 'Viết nhật ký cảm xúc, theo dõi tâm trạng. Phân tích xu hướng tâm lý theo thời gian.',
        color: 'from-blue-500 to-indigo-500',
        status: '✅',
    },
    {
        icon: Gamepad2,
        title: 'Mini Games',
        description: '5 trò chơi thư giãn, luyện phản xạ. Nghỉ ngơi hiệu quả giữa giờ học.',
        color: 'from-purple-500 to-indigo-500',
        status: '✅',
    },
    {
        icon: MessageCircle,
        title: 'Diễn đàn',
        description: 'Kết nối với cộng đồng, chia sẻ ẩn danh an toàn. Moderation tự động và thủ công.',
        color: 'from-green-500 to-emerald-500',
        status: '✅',
    },
    {
        icon: Shield,
        title: 'SOS Detection',
        description: 'Phát hiện nguy cơ tâm lý với 50+ patterns, Gen-Z vocabulary. Kết nối hotline 1800 599 920.',
        color: 'from-red-500 to-pink-500',
        status: '✅',
    },
    {
        icon: Brain,
        title: 'Context-Aware AI',
        description: 'Memory summarization, lưu ngữ cảnh dài hạn. AI hiểu bạn hơn qua từng cuộc trò chuyện.',
        color: 'from-violet-500 to-purple-500',
        status: '✅',
    },
    {
        icon: Award,
        title: 'Achievements',
        description: 'Hệ thống thành tích, XP, levels. Theo dõi hành trình phát triển bản thân.',
        color: 'from-yellow-500 to-orange-500',
        status: '✅',
    },
];

// Stats data
const stats = [
    { value: '10,000+', label: 'Học sinh đã sử dụng', icon: Users },
    { value: '50,000+', label: 'Cuộc trò chuyện', icon: Bot },
    { value: '95%', label: 'Phản hồi tích cực', icon: Star },
    { value: '24/7', label: 'Luôn sẵn sàng', icon: Clock },
];

// Tech stack data
const techStack = [
    { name: 'React 18.x', icon: Code, color: 'text-cyan-400' },
    { name: 'Vite 5.x', icon: Zap, color: 'text-yellow-400' },
    { name: 'Cloudflare', icon: Cloud, color: 'text-orange-400' },
    { name: 'Workers AI', icon: SparklesIcon, color: 'text-purple-400' },
    { name: 'D1 Database', icon: Database, color: 'text-blue-400' },
    { name: 'Tailwind CSS', icon: Palette, color: 'text-teal-400' },
];

// Advanced features
const advancedFeatures = [
    {
        title: 'SOS Detection',
        description: 'Phát hiện nguy cơ tâm lý với 50+ patterns, Gen-Z vocabulary',
        icon: Shield,
    },
    {
        title: 'Context-Aware AI',
        description: 'Memory summarization, lưu ngữ cảnh dài hạn',
        icon: Brain,
    },
    {
        title: 'Real-time Sync',
        description: 'Đồng bộ dữ liệu với Cloudflare D1',
        icon: Cloud,
    },
    {
        title: 'Token Cost Control',
        description: 'Giới hạn 500k tokens/tháng, cảnh báo khi gần ngưỡng',
        icon: TrendingUp,
    },
    {
        title: 'Prompt Injection Guard',
        description: 'Bảo vệ chống prompt injection',
        icon: Lock,
    },
    {
        title: 'AI Safety Net',
        description: 'Không chẩn đoán bệnh, không kê thuốc',
        icon: Shield,
    },
];

// Performance metrics
const performanceMetrics = [
    { label: 'Performance', value: '>85', icon: TrendingUp },
    { label: 'Accessibility', value: '>90', icon: Star },
    { label: 'Best Practices', value: '>90', icon: CheckCircle },
    { label: 'SEO', value: '>80', icon: Globe },
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
                        {/* Badges */}
                        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass">
                                <Zap className="w-4 h-4 text-[--accent]" />
                                <span className="text-sm font-medium">Giải pháp Hỗ trợ Tâm lý Học đường</span>
                            </div>
                            <a 
                                href="https://ban-dong-hanh.pages.dev" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass hover:bg-[--brand]/10 transition-colors"
                            >
                                <Globe className="w-4 h-4 text-[--brand]" />
                                <span className="text-sm font-medium">Đã triển khai trên Cloudflare</span>
                                <ExternalLink className="w-3 h-3" />
                            </a>
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

            {/* ===== DEPLOYMENT LINKS SECTION ===== */}
            <section className="py-12 px-4 border-b border-[--surface-border]">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <a
                            href="https://ban-dong-hanh.pages.dev"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass hover:bg-[--brand]/10 transition-all group"
                        >
                            <Globe className="w-5 h-5 text-[--brand] group-hover:scale-110 transition-transform" />
                            <div className="text-left">
                                <div className="text-xs text-[--muted]">Production</div>
                                <div className="text-sm font-semibold text-[--text]">ban-dong-hanh.pages.dev</div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-[--muted] group-hover:text-[--brand] transition-colors" />
                        </a>
                        <a
                            href="https://ban-dong-hanh-worker.stu725114073.workers.dev"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass hover:bg-[--brand]/10 transition-all group"
                        >
                            <Cloud className="w-5 h-5 text-[--brand] group-hover:scale-110 transition-transform" />
                            <div className="text-left">
                                <div className="text-xs text-[--muted]">API Endpoint</div>
                                <div className="text-sm font-semibold text-[--text]">Cloudflare Workers</div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-[--muted] group-hover:text-[--brand] transition-colors" />
                        </a>
                    </div>
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
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                                            <feature.icon className="w-6 h-6 text-white" />
                                        </div>
                                        {feature.status && (
                                            <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                                                {feature.status}
                                            </span>
                                        )}
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

            {/* ===== TECH STACK SECTION ===== */}
            <section className="py-20 px-4 bg-gradient-to-b from-[--surface]/50 to-transparent">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Công nghệ <span className="gradient-text">Hiện đại</span>
                        </h2>
                        <p className="text-[--text-secondary] max-w-2xl mx-auto">
                            Được xây dựng với công nghệ tiên tiến, đảm bảo hiệu suất cao và trải nghiệm mượt mà
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {techStack.map((tech, idx) => (
                            <motion.div
                                key={tech.name}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <Card variant="interactive" className="p-6 text-center h-full">
                                    <tech.icon className={`w-8 h-8 mx-auto mb-3 ${tech.color}`} />
                                    <div className="text-sm font-semibold text-[--text]">{tech.name}</div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== ADVANCED FEATURES SECTION ===== */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Tính năng <span className="gradient-text">Nâng cao</span>
                        </h2>
                        <p className="text-[--text-secondary] max-w-2xl mx-auto">
                            Công nghệ AI tiên tiến và hệ thống bảo mật đa lớp
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {advancedFeatures.map((feature, idx) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <Card variant="interactive" className="h-full">
                                    <div className="flex items-start gap-4">
                                        <div className="shrink-0 w-12 h-12 rounded-xl bg-[--brand]/10 flex items-center justify-center">
                                            <feature.icon className="w-6 h-6 text-[--brand]" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-[--text] mb-2">
                                                {feature.title}
                                            </h3>
                                            <p className="text-sm text-[--text-secondary]">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== PERFORMANCE SECTION ===== */}
            <section className="py-20 px-4 bg-[--surface]/50">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Hiệu suất <span className="gradient-text">Tối ưu</span>
                        </h2>
                        <p className="text-[--text-secondary] max-w-2xl mx-auto">
                            Đạt chuẩn Lighthouse với tối ưu hóa toàn diện
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {performanceMetrics.map((metric, idx) => (
                            <motion.div
                                key={metric.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <Card className="text-center p-6">
                                    <metric.icon className="w-8 h-8 mx-auto mb-3 text-[--brand]" />
                                    <div className="text-3xl font-bold gradient-text mb-2">
                                        {metric.value}
                                    </div>
                                    <div className="text-sm text-[--muted]">{metric.label}</div>
                                </Card>
                            </motion.div>
                        ))}
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
                                <li><Link to="/app/chat" className="hover:text-[--brand] transition-colors">Chat AI</Link></li>
                                <li><Link to="/app/breathing" className="hover:text-[--brand] transition-colors">Góc An Yên</Link></li>
                                <li><Link to="/app/gratitude" className="hover:text-[--brand] transition-colors">Lọ Biết Ơn</Link></li>
                                <li><Link to="/app/games" className="hover:text-[--brand] transition-colors">Mini Games</Link></li>
                                <li><Link to="/app/journal" className="hover:text-[--brand] transition-colors">Nhật ký</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-[--text] mb-4">Liên hệ & Hỗ trợ</h4>
                            <ul className="space-y-2 text-sm text-[--text-secondary]">
                                <li className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    <a href="mailto:stu725114073@hnue.edu.vn" className="hover:text-[--brand] transition-colors">
                                        stu725114073@hnue.edu.vn
                                    </a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    <a href="tel:0896636181" className="hover:text-[--brand] transition-colors">
                                        Long Nguyễn
                                    </a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    <a href="tel:1800599920" className="hover:text-[--brand] transition-colors">
                                        Hotline: 1800 599 920
                                    </a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Globe className="w-4 h-4" />
                                    <a 
                                        href="https://ban-dong-hanh.pages.dev" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="hover:text-[--brand] transition-colors flex items-center gap-1"
                                    >
                                        Website
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="pt-8 border-t border-[--surface-border]">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[--muted] mb-4">
                            <div>© 2025 Bạn Đồng Hành. Được phát triển với tình yêu quý dành cho tất cả học sinh Việt Nam.</div>
                            <div className="flex items-center gap-4">
                                <a href="#" className="hover:text-[--brand] transition-colors">Chính sách bảo mật</a>
                                <a href="#" className="hover:text-[--brand] transition-colors">Điều khoản sử dụng</a>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[--muted]">
                            <div className="flex items-center gap-2">
                                <Cloud className="w-4 h-4" />
                                <span>Deployed on Cloudflare Pages</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Code className="w-4 h-4" />
                                <span>Powered by React 18.x + Vite 5.x</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Brain className="w-4 h-4" />
                                <span>AI: Workers AI (Llama 3.1)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
