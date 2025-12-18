// src/components/auth/AuthModal.jsx
// Chú thích: Modal đăng nhập/đăng ký với username và password
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Lock, LogIn, UserPlus, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import Button from '../ui/Button';
import { register, login, checkUsername } from '../../utils/api';

export default function AuthModal({ isOpen, onClose, onSuccess }) {
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [usernameAvailable, setUsernameAvailable] = useState(null);
    const [requireSetPassword, setRequireSetPassword] = useState(false);

    // Kiểm tra username availability khi nhập (debounced)
    const handleUsernameChange = async (value) => {
        setUsername(value);
        setError('');
        setSuggestions([]);
        setUsernameAvailable(null);

        if (mode === 'register' && value.trim().length >= 2) {
            try {
                const result = await checkUsername(value.trim());
                setUsernameAvailable(result.available);
            } catch {
                // Ignore check errors
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim() || loading) return;

        // Chú thích: Validate password phía client
        if (password.length < 4) {
            setError('Mật khẩu phải có ít nhất 4 ký tự');
            return;
        }

        setLoading(true);
        setError('');
        setSuggestions([]);

        try {
            if (mode === 'register') {
                const result = await register(username.trim(), password);
                if (result.success) {
                    onSuccess?.(result.user);
                    onClose();
                }
            } else {
                const result = await login(username.trim(), password);
                if (result.success) {
                    setRequireSetPassword(false);
                    onSuccess?.(result.user);
                    onClose();
                }
            }
        } catch (err) {
            setError(err.data?.message || err.message || 'Có lỗi xảy ra');

            // Show suggestions if username taken
            if (err.data?.suggestions) {
                setSuggestions(err.data.suggestions);
            }

            // If user not found during login, suggest register
            if (err.data?.canRegister) {
                setMode('register');
                setError(`Tài khoản "${username}" chưa tồn tại. Tạo mới?`);
            }

            // Chú thích: Xử lý legacy user cần set password
            if (err.data?.requireSetPassword) {
                setRequireSetPassword(true);
                setError('Vui lòng tạo mật khẩu mới cho tài khoản này.');
            }
        } finally {
            setLoading(false);
        }
    };

    const useSuggestion = (suggestion) => {
        setUsername(suggestion);
        setSuggestions([]);
        setUsernameAvailable(true);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-[--surface-border]"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            {mode === 'login' ? (
                                <><LogIn size={22} className="text-[--brand]" /> Đăng nhập</>
                            ) : (
                                <><UserPlus size={22} className="text-[--brand]" /> Tạo tài khoản</>
                            )}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-[--hover] rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Tên tài khoản
                            </label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--muted]" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => handleUsernameChange(e.target.value)}
                                    placeholder="Nhập tên của bạn..."
                                    className="w-full pl-10 pr-10 py-3 bg-[--bg] border border-[--border] rounded-xl focus:ring-2 focus:ring-[--brand] focus:border-transparent outline-none transition-all"
                                    autoFocus
                                    minLength={2}
                                    maxLength={30}
                                />
                                {mode === 'register' && usernameAvailable !== null && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {usernameAvailable ? (
                                            <CheckCircle size={18} className="text-green-500" />
                                        ) : (
                                            <AlertCircle size={18} className="text-red-500" />
                                        )}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-[--muted] mt-1">
                                Chỉ cần nhớ tên này để đăng nhập lại sau
                            </p>
                        </div>

                        {/* Chú thích: Password field với toggle show/hide */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                {requireSetPassword ? 'Tạo mật khẩu mới' : 'Mật khẩu'}
                            </label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--muted]" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={requireSetPassword ? 'Nhập mật khẩu mới (ít nhất 6 ký tự)...' : 'Nhập mật khẩu...'}
                                    className="w-full pl-10 pr-12 py-3 bg-[--bg] border border-[--border] rounded-xl focus:ring-2 focus:ring-[--brand] focus:border-transparent outline-none transition-all"
                                    minLength={4}
                                    maxLength={100}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[--muted] hover:text-[--text] transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <p className="text-xs text-[--muted] mt-1">
                                {mode === 'register' || requireSetPassword
                                    ? 'Mật khẩu phải có ít nhất 4 ký tự'
                                    : 'Nhập mật khẩu đã đăng ký'
                                }
                            </p>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 flex items-start gap-2">
                                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Username suggestions */}
                        {suggestions.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm text-[--muted]">Gợi ý tên khác:</p>
                                <div className="flex flex-wrap gap-2">
                                    {suggestions.map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => useSuggestion(s)}
                                            className="px-3 py-1 bg-[--brand]/20 text-[--brand] rounded-full text-sm hover:bg-[--brand]/30 transition-colors"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Submit button */}
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            disabled={loading || username.trim().length < 2}
                        >
                            {loading ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
                        </Button>

                        {/* Toggle mode */}
                        <p className="text-center text-sm text-[--muted]">
                            {mode === 'login' ? (
                                <>
                                    Chưa có tài khoản?{' '}
                                    <button
                                        type="button"
                                        onClick={() => { setMode('register'); setError(''); }}
                                        className="text-[--brand] hover:underline"
                                    >
                                        Tạo mới
                                    </button>
                                </>
                            ) : (
                                <>
                                    Đã có tài khoản?{' '}
                                    <button
                                        type="button"
                                        onClick={() => { setMode('login'); setError(''); }}
                                        className="text-[--brand] hover:underline"
                                    >
                                        Đăng nhập
                                    </button>
                                </>
                            )}
                        </p>
                    </form>

                    {/* Info */}
                    <div className="mt-6 p-3 bg-[--brand]/10 rounded-lg text-xs text-[--text-secondary]">
                        <p>💡 <strong>Lưu ý:</strong> Tài khoản chỉ cần tên để dễ sử dụng. Dữ liệu của bạn được mã hóa và bảo mật.</p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
