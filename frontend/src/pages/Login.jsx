// src/pages/Login.jsx
// Chú thích: Trang đăng nhập thân thiện với nút đăng ký và đăng nhập riêng biệt
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, LogIn, UserPlus } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import GlowOrbs from '../components/ui/GlowOrbs';
import { login, register } from '../utils/api';

export default function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [mode, setMode] = useState('login'); // 'login' hoặc 'register'

    const validateUsername = () => {
        if (!username.trim()) {
            setError('Vui lòng nhập tên của bạn');
            return false;
        }

        if (username.trim().length < 3) {
            setError('Tên phải có ít nhất 3 ký tự');
            return false;
        }

        if (username.trim().length > 30) {
            setError('Tên không được quá 30 ký tự');
            return false;
        }

        return true;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!validateUsername()) return;

        setIsLoading(true);
        setError('');

        try {
            const result = await login(username.trim());

            if (result.success) {
                navigate('/app');
            } else {
                setError(result.message || 'Tên đăng nhập không tồn tại. Bạn có muốn đăng ký không?');
            }
        } catch (err) {
            setError(err.message || 'Không thể kết nối. Vui lòng thử lại sau');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validateUsername()) return;

        setIsLoading(true);
        setError('');

        try {
            const result = await register(username.trim());

            if (result.success) {
                navigate('/app');
            } else {
                if (result.error === 'username_taken') {
                    setError(`Tên "${username.trim()}" đã được sử dụng. Vui lòng chọn tên khác hoặc đăng nhập.`);
                } else {
                    setError(result.message || 'Có lỗi xảy ra, vui lòng thử lại');
                }
            }
        } catch (err) {
            setError(err.message || 'Không thể kết nối. Vui lòng thử lại sau');
        } finally {
            setIsLoading(false);
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
                    <div className="text-center mb-10">
                        <Link to="/" className="inline-block mb-6">
                            <img
                                src="/logo.png"
                                alt="Bạn Đồng Hành"
                                className="w-20 h-20 rounded-2xl shadow-lg mx-auto"
                            />
                        </Link>
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight text-[--text]">
                            Nhập tên của bạn để bắt đầu
                        </h1>
                    </div>

                    {/* Login/Register form */}
                    <Card className="p-8 md:p-10">
                        {/* Mode toggle */}
                        <div className="flex gap-3 mb-8 p-1.5 bg-[--surface] rounded-xl">
                            <button
                                type="button"
                                onClick={() => {
                                    setMode('login');
                                    setError('');
                                }}
                                className={`flex-1 py-3.5 px-5 rounded-lg text-lg font-bold transition-all ${
                                    mode === 'login'
                                        ? 'bg-[--brand] text-white shadow-lg'
                                        : 'text-[--text] hover:text-[--brand] hover:bg-[--surface-border]'
                                }`}
                            >
                                Đăng nhập
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setMode('register');
                                    setError('');
                                }}
                                className={`flex-1 py-3.5 px-5 rounded-lg text-lg font-bold transition-all ${
                                    mode === 'register'
                                        ? 'bg-[--brand] text-white shadow-lg'
                                        : 'text-[--text] hover:text-[--brand] hover:bg-[--surface-border]'
                                }`}
                            >
                                Đăng ký
                            </button>
                        </div>

                        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-6">
                            <div>
                                <label htmlFor="username" className="block text-lg font-bold text-[--text] mb-4">
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
                                    className="w-full px-5 py-4 text-lg rounded-xl bg-[--surface] border-2 border-[--surface-border] text-[--text] placeholder-[--text-secondary]/60 focus:outline-none focus:ring-2 focus:ring-[--brand] focus:border-[--brand] transition-all"
                                    disabled={isLoading}
                                    autoFocus
                                />
                                <p className="mt-4 text-base text-[--text-secondary] leading-relaxed font-medium">
                                    Chỉ cần tên, không cần mật khẩu. Dữ liệu của bạn được bảo mật.
                                </p>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-5 rounded-xl bg-red-500/10 border-2 border-red-500/30 text-red-600 text-lg font-semibold leading-relaxed"
                                >
                                    {error}
                                </motion.div>
                            )}

                            {/* Action buttons */}
                            <div className="flex gap-3">
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="flex-1"
                                    disabled={isLoading || !username.trim()}
                                    iconRight={
                                        isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : mode === 'login' ? (
                                            <LogIn size={20} />
                                        ) : (
                                            <UserPlus size={20} />
                                        )
                                    }
                                >
                                    {isLoading 
                                        ? 'Đang xử lý...' 
                                        : mode === 'login' 
                                            ? 'Đăng nhập' 
                                            : 'Đăng ký'}
                                </Button>
                            </div>
                        </form>

                        <div className="mt-8 pt-6 border-t-2 border-[--surface-border]">
                            <p className="text-base text-[--text-secondary] text-center leading-relaxed">
                                Bằng cách tiếp tục, bạn đồng ý với{' '}
                                <Link to="#" className="text-[--brand] font-bold hover:underline">
                                    Điều khoản sử dụng
                                </Link>{' '}
                                và{' '}
                                <Link to="#" className="text-[--brand] font-bold hover:underline">
                                    Chính sách bảo mật
                                </Link>
                            </p>
                        </div>
                    </Card>


                    {/* Back to landing */}
                    <div className="mt-8 text-center">
                        <Link
                            to="/"
                            className="text-lg text-[--text-secondary] font-semibold hover:text-[--brand] transition-colors"
                        >
                            ← Quay lại trang chủ
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

