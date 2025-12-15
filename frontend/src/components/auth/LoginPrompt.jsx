// src/components/auth/LoginPrompt.jsx
// Chú thích: Component hiển thị hướng dẫn đăng nhập thân thiện cho học sinh
import { motion } from 'framer-motion';
import { LogIn, Sparkles, Save, Trophy, RefreshCw, HelpCircle, ChevronRight } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPrompt({
    title = "Đăng nhập để tiếp tục",
    subtitle = "Xin chào! Để sử dụng tính năng này, bạn cần đăng nhập."
}) {
    const { openAuthModal } = useAuth();

    const benefits = [
        { icon: Save, text: "Lưu lại tiến trình học tập", color: "text-blue-500" },
        { icon: Trophy, text: "Tích điểm XP và mở khóa thành tích", color: "text-amber-500" },
        { icon: RefreshCw, text: "Đồng bộ dữ liệu trên nhiều thiết bị", color: "text-green-500" },
    ];

    const steps = [
        { step: 1, text: 'Nhấn nút "Đăng nhập" bên dưới' },
        { step: 2, text: "Nhập tên người dùng (ví dụ: hocsinh2024)" },
        { step: 3, text: "Nếu chưa có tài khoản, hệ thống sẽ tự tạo cho bạn!" },
    ];

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card variant="elevated" className="p-6 md:p-8">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[--brand] to-[--brand-light] flex items-center justify-center"
                        >
                            <LogIn className="w-10 h-10 text-white" />
                        </motion.div>
                        <h2 className="text-2xl font-bold text-[--text] mb-2">
                            🔐 {title}
                        </h2>
                        <p className="text-[--text-secondary]">
                            {subtitle}
                        </p>
                    </div>

                    {/* Benefits */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-[--text] mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[--brand]" />
                            Đăng nhập giúp bạn:
                        </h3>
                        <div className="space-y-2">
                            {benefits.map((benefit, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                    className="flex items-center gap-3 p-2 rounded-lg bg-[--surface-border]/50"
                                >
                                    <benefit.icon className={`w-5 h-5 ${benefit.color}`} />
                                    <span className="text-sm text-[--text]">{benefit.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Steps Guide */}
                    <div className="mb-6 p-4 rounded-xl bg-[--bg] border border-[--surface-border]">
                        <h3 className="text-sm font-semibold text-[--text] mb-3 flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-[--accent]" />
                            Hướng dẫn đăng nhập:
                        </h3>
                        <div className="space-y-2">
                            {steps.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + index * 0.1 }}
                                    className="flex items-start gap-3"
                                >
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[--brand] text-white text-xs font-bold flex items-center justify-center">
                                        {item.step}
                                    </span>
                                    <span className="text-sm text-[--text-secondary] pt-0.5">
                                        {item.text}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                    >
                        <Button
                            onClick={openAuthModal}
                            size="xl"
                            className="w-full"
                            icon={<ChevronRight className="w-5 h-5" />}
                        >
                            🚀 Đăng nhập ngay
                        </Button>
                    </motion.div>

                    {/* Footer note */}
                    <p className="text-xs text-[--muted] text-center mt-4">
                        Chỉ mất vài giây để đăng nhập. Không cần mật khẩu!
                    </p>
                </Card>
            </motion.div>
        </div>
    );
}
