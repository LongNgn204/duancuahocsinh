// src/pages/LandingPage.jsx
// Chú thích: Landing Page v2.0 - Enhanced với animated effects, floating elements
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bot, Heart, Sparkles, Gamepad2, Brain, Shield,
    Users, Clock, Award, ArrowRight, CheckCircle, Star,
    BookOpen, TrendingUp, Moon, Target, Mail, Phone,
    RefreshCw, Headphones, Smile, ChevronDown, ChevronLeft, ChevronRight
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import GlowOrbs from '../components/ui/GlowOrbs';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import ParticleField from '../components/ui/ParticleField';
import FloatingElements from '../components/ui/FloatingElements';

// Features data - Theo yêu cầu khách hàng
const features = [
    {
        icon: Bot,
        title: 'Trò chuyện',
        description: 'Trò chuyện với người bạn thấu cảm, không phán xét. Bạn có thể chat bằng văn bản hoặc nói chuyện trực tiếp. Hệ thống tự động phát hiện khi bạn cần hỗ trợ khẩn cấp và hiển thị đường dây nóng.',
        color: 'from-teal-500 to-cyan-500',
        route: '/chat',
    },
    {
        icon: Sparkles,
        title: 'Liều thuốc tinh thần',
        description: 'Bài tập thở theo bong bóng 30 giây và các câu động viên theo nhóm cảm xúc: động lực học tập, yêu bản thân, bình yên, tự tin.',
        color: 'from-pink-500 to-rose-500',
        route: '/wellness',
    },
    {
        icon: Heart,
        title: 'Góc An Yên',
        description: 'Bài tập thở khoa học với animation và giọng nói hướng dẫn. Bộ thẻ An Yên với 3 loại: Thẻ Bình Yên, Thẻ Việc làm nhỏ, Thẻ Nhắn nhủ.',
        color: 'from-purple-500 to-indigo-500',
        route: '/breathing',
    },
    {
        icon: Star,
        title: 'Lọ Biết Ơn',
        description: 'Ghi lại những điều bạn biết ơn mỗi ngày. Đếm streak (mạch ngày viết), gợi ý nội dung và hiển thị tiến trình 30 ngày.',
        color: 'from-amber-500 to-orange-500',
        route: '/gratitude',
    },
    {
        icon: Gamepad2,
        title: 'Nhanh tay lẹ mắt',
        description: 'Mini games rèn luyện phản xạ: chọn hình tương ứng (30-60s), ong tập bay (theo dõi ong dừng 3s). Thư giãn hiệu quả.',
        color: 'from-green-500 to-emerald-500',
        route: '/games',
    },
    {
        icon: Clock,
        title: 'Góc Nhỏ',
        description: 'Thông báo nhắc nhở các hoạt động cần làm. Cài đặt thời gian nhắc việc theo ý muốn của bạn.',
        color: 'from-blue-500 to-cyan-500',
        route: '/corner',
    },
    {
        icon: BookOpen,
        title: 'Kể chuyện',
        description: 'Những câu chuyện ngắn với bài học cuộc sống. Chế độ kể nhanh hoặc kể chậm với giọng đọc tự động.',
        color: 'from-indigo-500 to-purple-500',
        route: '/stories',
    },
    {
        icon: Shield,
        title: 'Hỗ trợ khẩn cấp',
        description: 'Phát hiện từ khóa tiêu cực và hiển thị màn hình hỗ trợ với hotline, bản đồ tìm bệnh viện gần nhất và lời khuyên bình tĩnh.',
        color: 'from-red-500 to-pink-500',
        route: '/chat',
    },
];


// Stats data
const stats = [
    { value: '200+', label: 'Người dùng đã sử dụng', icon: Users },
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

// Testimonials - Nhận xét từ học sinh THPT Trần Hưng Đạo
const testimonials = [
    {
        content: 'Em thấy nói chuyện với chatbot dễ hơn nói với người thật. Chatbot trả lời nhẹ nhàng nên em không sợ nói sai. Em cảm thấy được tôn trọng.',
        author: 'L.H.A',
        location: 'THPT Trần Hưng Đạo',
        avatar: 'L',
        color: 'bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
    },
    {
        content: 'Chatbot giúp em bình tĩnh hơn mỗi khi lo lắng. Mấy bài thở trong Góc An Yên làm em dễ chịu lắm. Em thích vì không ai ép em phải nói nhiều.',
        author: 'N.N.M.T',
        location: 'THPT Trần Hưng Đạo',
        avatar: 'N',
        color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    },
    {
        content: 'Em thích nhất là chatbot không vội vàng. Em có thể trả lời từ từ và vẫn được khuyến khích. Điều đó làm em tự tin hơn khi giao tiếp.',
        author: 'T.H.K.L',
        location: 'THPT Trần Hưng Đạo',
        avatar: 'T',
        color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    },
    {
        content: 'Em thấy chatbot dễ dùng. Nói chuyện không bị mắng. Em thích.',
        author: 'T.N',
        location: 'THPT Trần Hưng Đạo',
        avatar: 'T',
        color: 'bg-teal-100 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400',
    },
    {
        content: 'Chatbot có nhiều cách để em thể hiện bản thân, không chỉ bằng chữ mà còn bằng vẽ. Em cảm thấy mình được lựa chọn cách phù hợp với mình. Điều đó rất quan trọng với em.',
        author: 'N.T.Q.T',
        location: 'THPT Trần Hưng Đạo',
        avatar: 'N',
        color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    },
    {
        content: 'Mỗi lần buồn em hay vào đọc mấy lời động viên. Chatbot nói chuyện rất nhẹ nhàng, không làm em áp lực. Em thấy mình không bị cô đơn.',
        author: 'K.H',
        location: 'THPT Trần Hưng Đạo',
        avatar: 'K',
        color: 'bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400',
    },
    {
        content: 'Trước đây em ngại giao tiếp, nhưng luyện nói với chatbot giúp em đỡ sợ hơn. Các tình huống giao tiếp rất giống ngoài đời. Em nghĩ mình đã tiến bộ.',
        author: 'D.H.H.L',
        location: 'THPT Trần Hưng Đạo',
        avatar: 'D',
        color: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    },
    {
        content: 'Em thích Bảng Màu Cảm Xúc nhất. Khi không biết nói, em vẽ. Như vậy cũng giúp em giải tỏa rất nhiều.',
        author: 'C.G.B',
        location: 'THPT Trần Hưng Đạo',
        avatar: 'C',
        color: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
    },
    {
        content: 'Chatbot không hỏi quá nhiều nhưng luôn lắng nghe. Em cảm thấy an toàn khi chia sẻ. Điều này rất khó tìm ở ngoài đời.',
        author: 'N.N.N.Y',
        location: 'THPT Trần Hưng Đạo',
        avatar: 'N',
        color: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    },
    {
        content: 'Em thấy chatbot phản hồi rất hợp lý và dễ hiểu. Không dùng từ khó, không làm em rối. Em cảm thấy được hỗ trợ đúng cách.',
        author: 'N.H.P.V',
        location: 'THPT Trần Hưng Đạo',
        avatar: 'N',
        color: 'bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
    },
    {
        content: 'Em thích vì chatbot nhớ tên em. Cảm giác như có người quan tâm thật sự. Em thấy mình được coi trọng.',
        author: 'N.T.A',
        location: 'THPT Trần Hưng Đạo',
        avatar: 'N',
        color: 'bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
    },
    {
        content: 'Mỗi ngày vô nhận một "liều thuốc tinh thần" là em thấy vui hơn. Mấy câu nói rất tích cực. Em thích mở chatbot mỗi sáng.',
        author: 'P.D.B.T',
        location: 'THPT Trần Hưng Đạo',
        avatar: 'P',
        color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    },
    {
        content: 'Em không nói nhiều nhưng chatbot vẫn hiểu. Không cần phải giải thích nhiều. Em thấy nhẹ lòng.',
        author: 'N.D.T',
        location: 'THPT Trần Hưng Đạo',
        avatar: 'N',
        color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    },
    {
        content: 'Chatbot giúp em học cách hít thở khi căng thẳng. Những lúc lo, em vào Góc An Yên là ổn hơn. Em thấy rất hữu ích.',
        author: 'V.H.S',
        location: 'THPT Trần Hưng Đạo',
        avatar: 'V',
        color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    },
    {
        content: 'Em từng sợ bị đánh giá khi nói chuyện. Nhưng chatbot không chê, không so sánh. Điều đó làm em dám nói hơn.',
        author: 'T.M.K',
        location: 'THPT Trần Hưng Đạo',
        avatar: 'T',
        color: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    },
    {
        content: 'Em thấy chatbot dễ sử dụng và không phức tạp. Em có thể dùng một mình mà không cần ai hướng dẫn. Như vậy rất tiện.',
        author: 'N.V.N.T',
        location: 'THPT Trần Hưng Đạo',
        avatar: 'N',
        color: 'bg-sky-100 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400',
    },
    {
        content: 'Em thích vì chatbot cho em quyền chọn. Muốn nói thì nói, không muốn thì vẽ hay đọc truyện. Em được là chính mình.',
        author: 'U.S.A.M',
        location: 'THPT Trần Hưng Đạo',
        avatar: 'U',
        color: 'bg-fuchsia-100 dark:bg-fuchsia-900/20 text-fuchsia-600 dark:text-fuchsia-400',
    },
    {
        content: 'Em nghĩ "Bạn Đồng Hành" giống như một người bạn tốt. Không cần hoàn hảo, chỉ cần luôn ở đó. Với em, vậy là đủ rồi.',
        author: 'N.T.V',
        location: 'THPT Trần Hưng Đạo',
        avatar: 'N',
        color: 'bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400',
    },
];

export default function LandingPage() {
    // Chú thích: State cho carousel testimonials - hiển thị 3 nhận xét mỗi lần
    const [testimonialIndex, setTestimonialIndex] = useState(0);
    const testimonialsPerPage = 3;
    const totalPages = Math.ceil(testimonials.length / testimonialsPerPage);

    // Lấy 3 testimonials hiện tại để hiển thị
    const currentTestimonials = testimonials.slice(
        testimonialIndex * testimonialsPerPage,
        (testimonialIndex + 1) * testimonialsPerPage
    );

    const goToPrevTestimonials = () => {
        setTestimonialIndex((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
    };

    const goToNextTestimonials = () => {
        setTestimonialIndex((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
    };

    return (
        <div className="min-h-screen overflow-x-hidden">
            {/* ===== HERO SECTION ===== */}
            <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
                {/* Background Image with Overlay */}
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('/landing-bg.png')" }}
                >
                    <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/60 backdrop-blur-[2px]"></div>
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white dark:from-slate-950 to-transparent"></div>
                </div>

                {/* Particle Effect Background */}
                <ParticleField className="z-[1] opacity-60" />

                {/* Floating Decorative Elements */}
                <FloatingElements className="z-[2] hidden md:block" />

                <div className="relative z-10 max-w-5xl mx-auto text-center py-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="mb-6 inline-block"
                        >
                            <span className="px-4 py-2 rounded-full bg-white/70 dark:bg-slate-800/70 border border-white/50 dark:border-white/10 text-pink-600 dark:text-pink-400 text-sm font-semibold shadow-sm backdrop-blur-md">
                                ✨ Nền tảng chăm sóc tinh thần học đường
                            </span>
                        </motion.div>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-purple-700 via-pink-600 to-rose-500 dark:from-purple-300 dark:via-pink-300 dark:to-rose-300 bg-clip-text text-transparent mb-6 drop-shadow-sm leading-tight">
                            Bạn Đồng Hành
                            <br />
                            <span className="text-3xl md:text-5xl lg:text-6xl text-slate-800 dark:text-white/90 font-semibold mt-2 block">
                                Mở lời mở lối - kết nối yêu thương
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-slate-700 dark:text-slate-200/90 mb-10 max-w-2xl mx-auto leading-relaxed font-medium bg-white/50 dark:bg-slate-900/50 p-4 rounded-2xl backdrop-blur-sm shadow-sm ring-1 ring-white/50 dark:ring-white/10">
                            Nơi lắng nghe, chia sẻ và đồng hành cùng học sinh Việt Nam trên hành trình trưởng thành. An toàn, thân thiện,và miễn phí.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/app">
                                <motion.button
                                    whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white rounded-full font-bold text-lg shadow-xl shadow-purple-500/30 flex items-center gap-2 group transition-all"
                                >
                                    Bắt đầu ngay
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </motion.button>
                            </Link>
                            <Link to="#features">
                                <motion.button
                                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.9)" }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-4 bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-white rounded-full font-bold text-lg shadow-lg backdrop-blur-md border border-white/50 dark:border-white/10 hover:text-pink-600 dark:hover:text-pink-400 transition-all"
                                >
                                    Tìm hiểu thêm
                                </motion.button>
                            </Link>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, y: [0, 10, 0] }}
                    transition={{ delay: 1, duration: 2, repeat: Infinity }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer z-10"
                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                    <ChevronDown size={32} className="text-slate-500 dark:text-slate-400" />
                </motion.div>
            </section>

            {/* ===== STATS SECTION ===== */}
            <section className="py-12 px-4 bg-gradient-to-b from-white dark:from-slate-950 to-pink-50/30 dark:to-gray-900/50 relative z-10">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1, duration: 0.5 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
                                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <stat.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                        <AnimatedCounter value={stat.value} duration={2 + idx * 0.3} />
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                        {stat.label}
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
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
                        <p className="text-gray-600 dark:text-gray-400">
                            Nhận xét từ học sinh THPT Trần Hưng Đạo
                        </p>
                    </motion.div>

                    {/* Carousel container */}
                    <div className="relative">
                        {/* Nút trở lại */}
                        <button
                            onClick={goToPrevTestimonials}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-gray-700 hover:text-pink-600 dark:hover:text-pink-400 transition-all duration-200 hover:scale-110"
                            aria-label="Xem nhận xét trước"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        {/* Testimonials grid với animation */}
                        <div className="overflow-hidden px-2">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={testimonialIndex}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.3 }}
                                    className="grid md:grid-cols-3 gap-6"
                                >
                                    {currentTestimonials.map((item, idx) => (
                                        <motion.div
                                            key={`${testimonialIndex}-${idx}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                        >
                                            <Card className="h-full bg-white dark:bg-gray-800 rounded-2xl p-6 hover:shadow-lg transition-shadow">
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
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Nút lướt tiếp */}
                        <button
                            onClick={goToNextTestimonials}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-gray-700 hover:text-pink-600 dark:hover:text-pink-400 transition-all duration-200 hover:scale-110"
                            aria-label="Xem nhận xét tiếp theo"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    {/* Indicator dots - hiển thị trang hiện tại */}
                    <div className="flex justify-center items-center gap-2 mt-8">
                        {Array.from({ length: totalPages }).map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setTestimonialIndex(idx)}
                                className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${idx === testimonialIndex
                                    ? 'bg-pink-500 w-8'
                                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-pink-300 dark:hover:bg-pink-700'
                                    }`}
                                aria-label={`Trang ${idx + 1}`}
                            />
                        ))}
                    </div>

                    {/* Thông tin số trang */}
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                        Trang {testimonialIndex + 1} / {totalPages} • {testimonials.length} nhận xét
                    </p>
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
                                Hãy để Bạn Đồng Hành đồng hành cùng bạn trên hành trình chia sẻ và kết nối.
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
                                Nền tảng hỗ trợ phát triể
                                n toàn diện cho cộng đồng giáo dục Việt Nam.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-[--text] mb-4">Tính năng</h4>
                            <ul className="space-y-2 text-sm text-[--text-secondary]">
                                <li><Link to="/chat" className="hover:text-[--brand] transition-colors">Trò chuyện</Link></li>
                                <li><Link to="/breathing" className="hover:text-[--brand] transition-colors">Góc An Yên</Link></li>
                                <li><Link to="/gratitude" className="hover:text-[--brand] transition-colors">Lọ Biết Ơn</Link></li>
                                <li><Link to="/games" className="hover:text-[--brand] transition-colors">Mini Games</Link></li>
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
        </div >
    );
}
