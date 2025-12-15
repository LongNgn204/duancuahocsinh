// src/pages/Login.jsx
// Chú thích: Trang đăng nhập thân thiện, không giống AI code
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, Heart, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import GlowOrbs from '../components/ui/GlowOrbs';
import { login, register, checkUsername } from '../utils/api';

export default function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isChecking, setIsChecking] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim()) {
            setError('Vui lòng nhập tên của bạn');
            return;
        }

        if (username.trim().length < 3) {
            setError('Tên phải có ít nhất 3 ký tự');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Kiểm tra username có tồn tại không
            setIsChecking(true);
            const checkResult = await checkUsername(username.trim());
            
            let result;
            if (checkResult.exists) {
                // Đăng nhập
                result = await login(username.trim());
            } else {
                // Đăng ký mới
                result = await register(username.trim());
            }

            if (result.success) {
                // Chuyển đến dashboard
                navigate('/app');
            } else {
                setError(result.message || 'Có lỗi xảy ra, vui lòng thử lại');
            }
        } catch (err) {
            setError(err.message || 'Không thể kết nối. Vui lòng thử lại sau');
        } finally {
            setIsLoading(false);
            setIsChecking(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
            <GlowOrbs className="opacity-40" />

            <div className="relative z-10 w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Logo và title */}
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-block mb-4">
                            <img
                                src="/logo.png"
                                alt="Bạn Đồng Hành"
                                className="w-16 h-16 rounded-2xl shadow-lg mx-auto"
                            />
                        </Link>
                        <h1 className="text-3xl font-bold mb-2">
                            <span className="gradient-text">Chào bạn!</span>
                        </h1>
                        <p className="text-[--text-secondary]">
                            Nhập tên của bạn để bắt đầu
                        </p>
                    </div>

                    {/* Login form */}
                    <Card className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-[--text] mb-2">
                                    Tên của bạn
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                        setError('');
                                    }}
                                    placeholder="Ví dụ: Minh, Lan, Hùng..."
                                    className="w-full px-4 py-3 rounded-xl bg-[--surface] border border-[--surface-border] text-[--text] placeholder-[--muted] focus:outline-none focus:ring-2 focus:ring-[--brand] focus:border-transparent transition-all"
                                    disabled={isLoading}
                                    autoFocus
                                />
                                <p className="mt-2 text-xs text-[--muted]">
                                    Chỉ cần tên, không cần mật khẩu. Dữ liệu của bạn được bảo mật.
                                </p>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full"
                                disabled={isLoading || !username.trim()}
                                iconRight={
                                    isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <ArrowRight size={20} />
                                    )
                                }
                            >
                                {isChecking ? 'Đang kiểm tra...' : isLoading ? 'Đang xử lý...' : 'Bắt đầu'}
                            </Button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-[--surface-border]">
                            <p className="text-xs text-[--muted] text-center">
                                Bằng cách tiếp tục, bạn đồng ý với{' '}
                                <Link to="#" className="text-[--brand] hover:underline">
                                    Điều khoản sử dụng
                                </Link>{' '}
                                và{' '}
                                <Link to="#" className="text-[--brand] hover:underline">
                                    Chính sách bảo mật
                                </Link>
                            </p>
                        </div>
                    </Card>


                    {/* Back to landing */}
                    <div className="mt-6 text-center">
                        <Link
                            to="/"
                            className="text-sm text-[--muted] hover:text-[--brand] transition-colors"
                        >
                            ← Quay lại trang chủ
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

