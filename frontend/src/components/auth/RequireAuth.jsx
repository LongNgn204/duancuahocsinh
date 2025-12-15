// src/components/auth/RequireAuth.jsx
// Chú thích: Wrapper component để bảo vệ routes - yêu cầu đăng nhập
import { useAuth } from '../../hooks/useAuth';
import LoginPrompt from './LoginPrompt';

/**
 * RequireAuth - Wrapper component bảo vệ routes
 * Nếu user chưa đăng nhập, hiển thị LoginPrompt thay vì content
 * 
 * @param {React.ReactNode} children - Nội dung cần bảo vệ
 * @param {string} featureName - Tên tính năng (optional, để customize message)
 */
export default function RequireAuth({ children, featureName = null }) {
    const { isLoggedIn, loading } = useAuth();

    // Đang load - hiển thị skeleton
    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-[--brand] border-t-transparent animate-spin" />
                    <p className="text-[--muted] text-sm">Đang kiểm tra...</p>
                </div>
            </div>
        );
    }

    // Chưa đăng nhập - hiển thị hướng dẫn
    if (!isLoggedIn) {
        return (
            <LoginPrompt
                title={featureName ? `Đăng nhập để sử dụng ${featureName}` : "Đăng nhập để tiếp tục"}
                subtitle="Xin chào! Để sử dụng tính năng này, bạn cần đăng nhập."
            />
        );
    }

    // Đã đăng nhập - render content
    return children;
}
