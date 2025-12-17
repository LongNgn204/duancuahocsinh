// src/pages/LoginPage.jsx
// Chú thích: Trang đăng nhập đơn giản cho học sinh
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import Button from '../components/ui/Button';
import GlowOrbs from '../components/ui/GlowOrbs';

export default function LoginPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        // Kiểm tra đầu vào
        if (!username.trim()) {
            setError('Vui lòng nhập tên đăng nhập');
            return;
        }
        if (!password) {
            setError('Vui lòng nhập mật khẩu');
            return;
        }

        setLoading(true);

        // Giả lập đăng nhập (lưu vào localStorage)
        try {
            await new Promise(resolve => setTimeout(resolve, 800)); // Giả lập delay

            // Lưu thông tin đăng nhập
            localStorage.setItem('user_logged_in', '1');
            localStorage.setItem('user_name', username);

            // Chuyển đến trang chủ
            navigate('/app');
        } catch (err) {
            setError('Đã xảy ra lỗi. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <GlowOrbs />
            </div>

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="w-full max-w-md relative z-10"
            >
                <div className="glass-strong rounded-3xl p-8 shadow-2xl">
                    {/* Logo & Title */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[--brand] to-[--brand-light] shadow-xl mb-4"
                        >
                            <img
                                src="/logo.png"
                                alt="Bạn Đồng Hành"
                                className="w-14 h-14 object-cover rounded-xl"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        </motion.div>

                        <h1 className="text-3xl font-bold gradient-text mb-2">
                            Bạn Đồng Hành
                        </h1>
                        <p className="text-[--muted] text-lg">
                            Hỗ trợ Tâm lý Học đường
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Username */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-[--text] mb-2">
                                Tên đăng nhập
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[--muted]">
                                    <User size={20} />
                                </div>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Nhập tên đăng nhập"
                                    className="
                    w-full pl-12 pr-4 py-4 
                    rounded-xl 
                    bg-[--surface] 
                    border border-[--surface-border]
                    text-[--text] text-lg
                    placeholder:text-[--muted]
                    focus:outline-none focus:ring-2 focus:ring-[--brand] focus:border-transparent
                    transition-all duration-200
                  "
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-[--text] mb-2">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[--muted]">
                                    <Lock size={20} />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu"
                                    className="
                    w-full pl-12 pr-12 py-4 
                    rounded-xl 
                    bg-[--surface] 
                    border border-[--surface-border]
                    text-[--text] text-lg
                    placeholder:text-[--muted]
                    focus:outline-none focus:ring-2 focus:ring-[--brand] focus:border-transparent
                    transition-all duration-200
                  "
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[--muted] hover:text-[--text] transition-colors"
                                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm text-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full text-lg py-4"
                            icon={<LogIn size={22} />}
                            disabled={loading}
                        >
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </Button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-[--muted] text-sm">
                            Chưa có tài khoản?{' '}
                            <button
                                onClick={() => navigate('/app')}
                                className="text-[--brand] hover:underline font-medium"
                            >
                                Dùng thử ngay
                            </button>
                        </p>
                    </div>
                </div>

                {/* Bottom decoration */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-6 text-sm text-[--muted]"
                >
                    🌟 Nơi bạn có thể tâm sự an toàn
                </motion.p>
            </motion.div>
        </div>
    );
}
