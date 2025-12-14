// src/pages/AdminDashboard.jsx
// Chú thích: Admin Dashboard v3.0 - JWT Authentication độc lập
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
    Shield, AlertTriangle, Users, MessageSquare, Ban,
    Lock, Unlock, Eye, EyeOff, Trash2, Clock, ChevronDown,
    BarChart3, Activity, RefreshCw, Home, Settings, LogOut,
    FileText, Flag, Database, Menu, X, KeyRound
} from 'lucide-react';
import {
    getForumStats, getAdminLogs, getBannedUsers, getForumPosts,
    deleteForumPost, toggleLockPost, banUser, unbanUser,
    adminLogin, isAdminLoggedIn, adminLogout
} from '../utils/api';

// =============================================================================
// HELPERS
// =============================================================================

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

// =============================================================================
// ADMIN SIDEBAR
// =============================================================================

function AdminSidebar({ activeTab, setActiveTab, collapsed, setCollapsed }) {
    const navigate = useNavigate();

    const menuItems = [
        { id: 'overview', label: 'Tổng quan', icon: BarChart3 },
        { id: 'posts', label: 'Quản lý bài viết', icon: FileText },
        { id: 'users', label: 'Người dùng bị cấm', icon: Ban },
        { id: 'logs', label: 'Nhật ký hoạt động', icon: Activity },
    ];

    const handleLogout = () => {
        adminLogout();
        navigate('/');
    };

    return (
        <aside className={`
            ${collapsed ? 'w-16' : 'w-64'} 
            h-screen bg-gray-900 text-white flex flex-col transition-all duration-300
            fixed left-0 top-0 z-50 md:relative
        `}>
            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                {!collapsed && (
                    <div className="flex items-center gap-2">
                        <Shield className="w-6 h-6 text-blue-400" />
                        <span className="font-bold">Admin Panel</span>
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 hover:bg-gray-700 rounded-lg"
                >
                    {collapsed ? <Menu size={18} /> : <X size={18} />}
                </button>
            </div>

            {/* Admin Badge */}
            {!collapsed && (
                <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center gap-2 text-green-400">
                        <KeyRound size={16} />
                        <span className="text-sm font-medium">JWT Authenticated</span>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 py-4 overflow-y-auto">
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`
                            w-full flex items-center gap-3 px-4 py-3 transition-colors
                            ${activeTab === item.id
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'}
                        `}
                        title={collapsed ? item.label : undefined}
                    >
                        <item.icon size={20} />
                        {!collapsed && <span>{item.label}</span>}
                    </button>
                ))}
            </nav>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-700 space-y-2">
                <Link
                    to="/app"
                    className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
                    title={collapsed ? 'Về trang chính' : undefined}
                >
                    <Home size={18} />
                    {!collapsed && <span className="text-sm">Về trang chính</span>}
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                    title={collapsed ? 'Đăng xuất' : undefined}
                >
                    <LogOut size={18} />
                    {!collapsed && <span className="text-sm">Đăng xuất</span>}
                </button>
            </div>
        </aside>
    );
}

// =============================================================================
// STAT CARD
// =============================================================================

function StatCard({ icon: Icon, label, value, color, trend }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700"
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                    <p className="text-3xl font-bold text-gray-800 dark:text-white">{value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </motion.div>
    );
}

// =============================================================================
// OVERVIEW TAB
// =============================================================================

function OverviewTab({ stats, logs }) {
    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={FileText} label="Tổng bài viết" value={stats?.total_posts || 0} color="bg-blue-500" />
                <StatCard icon={MessageSquare} label="Tổng bình luận" value={stats?.total_comments || 0} color="bg-green-500" />
                <StatCard icon={EyeOff} label="Bài viết đã ẩn" value={stats?.hidden_posts || 0} color="bg-orange-500" />
                <StatCard icon={Ban} label="Người dùng bị cấm" value={stats?.banned_users || 0} color="bg-red-500" />
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    Hoạt động gần đây
                </h3>
                {logs.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Chưa có hoạt động nào</p>
                ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {logs.slice(0, 10).map(log => (
                            <LogItem key={log.id} log={log} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// =============================================================================
// POSTS MANAGEMENT TAB
// =============================================================================

function PostsTab({ onRefresh }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        loadPosts();
    }, [page]);

    const loadPosts = async () => {
        setLoading(true);
        try {
            const result = await getForumPosts(page, 20);
            setPosts(result.items || []);
        } catch (e) {
            console.error('Load posts error:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (postId) => {
        if (!confirm('Bạn có chắc muốn ẩn/xóa bài viết này?')) return;
        try {
            await deleteForumPost(postId, 'Vi phạm quy định');
            loadPosts();
            onRefresh();
        } catch (e) {
            alert(`Lỗi: ${e.message}`);
        }
    };

    const handleToggleLock = async (postId) => {
        try {
            await toggleLockPost(postId);
            loadPosts();
            onRefresh();
        } catch (e) {
            alert(`Lỗi: ${e.message}`);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    Quản lý bài viết ({posts.length})
                </h3>
                <button
                    onClick={loadPosts}
                    disabled={loading}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiêu đề</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tác giả</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {posts.map(post => (
                            <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-6 py-4 text-sm text-gray-500">#{post.id}</td>
                                <td className="px-6 py-4">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                                        {post.title}
                                    </p>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {post.is_anonymous ? 'Ẩn danh' : `User #${post.user_id}`}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {formatDate(post.created_at)}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-1">
                                        {post.is_hidden && (
                                            <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded">Ẩn</span>
                                        )}
                                        {post.is_locked && (
                                            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-600 rounded">Khóa</span>
                                        )}
                                        {!post.is_hidden && !post.is_locked && (
                                            <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded">Bình thường</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button
                                        onClick={() => handleToggleLock(post.id)}
                                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                                        title={post.is_locked ? 'Mở khóa' : 'Khóa'}
                                    >
                                        {post.is_locked ? <Unlock size={16} /> : <Lock size={16} />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(post.id)}
                                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                                        title="Ẩn bài viết"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {posts.length === 0 && !loading && (
                <p className="text-center text-gray-500 py-8">Không có bài viết nào</p>
            )}
        </div>
    );
}

// =============================================================================
// BANNED USERS TAB
// =============================================================================

function BannedUsersTab({ bannedUsers, onUnban, onRefresh }) {
    const [banUserId, setBanUserId] = useState('');
    const [banReason, setBanReason] = useState('');
    const [banDays, setBanDays] = useState('7');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleBanUser = async () => {
        if (!banUserId) return;
        setLoading(true);
        try {
            await banUser(parseInt(banUserId), banReason, parseInt(banDays) || null);
            setMessage('✓ Đã cấm người dùng thành công');
            setBanUserId('');
            setBanReason('');
            onRefresh();
        } catch (e) {
            setMessage(`✗ Lỗi: ${e.message}`);
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    return (
        <div className="grid lg:grid-cols-3 gap-6">
            {/* Ban Form */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Ban className="w-5 h-5 text-red-500" />
                    Cấm người dùng
                </h3>
                <div className="space-y-3">
                    <input
                        type="number"
                        value={banUserId}
                        onChange={e => setBanUserId(e.target.value)}
                        placeholder="User ID"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <input
                        type="text"
                        value={banReason}
                        onChange={e => setBanReason(e.target.value)}
                        placeholder="Lý do (tùy chọn)"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <select
                        value={banDays}
                        onChange={e => setBanDays(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="1">1 ngày</option>
                        <option value="7">7 ngày</option>
                        <option value="30">30 ngày</option>
                        <option value="90">90 ngày</option>
                        <option value="">Vĩnh viễn</option>
                    </select>
                    <button
                        onClick={handleBanUser}
                        disabled={loading || !banUserId}
                        className="w-full py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 font-medium transition-colors"
                    >
                        {loading ? 'Đang xử lý...' : 'Cấm người dùng'}
                    </button>
                    {message && (
                        <p className={`text-sm text-center ${message.includes('✗') ? 'text-red-500' : 'text-green-500'}`}>
                            {message}
                        </p>
                    )}
                </div>
            </div>

            {/* Banned Users List */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-orange-500" />
                    Danh sách cấm ({bannedUsers.length})
                </h3>
                {bannedUsers.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Không có người dùng nào bị cấm</p>
                ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {bannedUsers.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                <div>
                                    <p className="font-medium">{user.username || `User #${user.user_id}`}</p>
                                    <p className="text-sm text-gray-500">{user.reason || 'Không có lý do'}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {user.banned_until ? `Hết hạn: ${formatDate(user.banned_until)}` : 'Vĩnh viễn'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => onUnban(user.user_id)}
                                    className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                                >
                                    Bỏ cấm
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// =============================================================================
// LOGS TAB
// =============================================================================

function LogsTab({ logs }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-500" />
                Nhật ký hoạt động ({logs.length})
            </h3>
            {logs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Chưa có nhật ký nào</p>
            ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {logs.map(log => (
                        <LogItem key={log.id} log={log} />
                    ))}
                </div>
            )}
        </div>
    );
}

// =============================================================================
// LOG ITEM
// =============================================================================

function LogItem({ log }) {
    const actionColors = {
        'delete_post': 'bg-red-100 text-red-600',
        'hide_post': 'bg-orange-100 text-orange-600',
        'hide_comment': 'bg-yellow-100 text-yellow-600',
        'lock_post': 'bg-blue-100 text-blue-600',
        'unlock_post': 'bg-green-100 text-green-600',
        'ban_user': 'bg-red-100 text-red-600',
        'unban_user': 'bg-green-100 text-green-600',
    };

    const actionLabels = {
        'delete_post': 'Xóa bài viết',
        'hide_post': 'Ẩn bài viết',
        'hide_comment': 'Ẩn bình luận',
        'lock_post': 'Khóa bài viết',
        'unlock_post': 'Mở khóa',
        'ban_user': 'Cấm user',
        'unban_user': 'Bỏ cấm',
    };

    return (
        <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                <Activity className="w-4 h-4 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm">
                    <span className="font-medium">{log.admin_username || 'Admin'}</span>
                    {' '}
                    <span className={`px-2 py-0.5 rounded text-xs ${actionColors[log.action_type] || 'bg-gray-100 text-gray-600'}`}>
                        {actionLabels[log.action_type] || log.action_type}
                    </span>
                    {log.target_id && <span className="text-gray-400"> #{log.target_id}</span>}
                </p>
                {log.reason && <p className="text-xs text-gray-400 mt-0.5">Lý do: {log.reason}</p>}
            </div>
            <p className="text-xs text-gray-400 flex-shrink-0">
                {formatDate(log.created_at)}
            </p>
        </div>
    );
}

// =============================================================================
// MAIN ADMIN DASHBOARD
// =============================================================================

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [logs, setLogs] = useState([]);
    const [bannedUsers, setBannedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const navigate = useNavigate();

    // Check JWT auth on mount
    useEffect(() => {
        if (isAdminLoggedIn()) {
            setIsAuthenticated(true);
            loadData();
        } else {
            setLoading(false);
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginLoading(true);
        setLoginError('');

        try {
            const result = await adminLogin(password);
            if (result.success) {
                setIsAuthenticated(true);
                loadData();
            } else {
                setLoginError(result.message || 'Sai mật khẩu');
            }
        } catch (error) {
            setLoginError(error.message || 'Lỗi đăng nhập');
        } finally {
            setLoginLoading(false);
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const [statsData, logsData, bannedData] = await Promise.all([
                getForumStats().catch(() => null),
                getAdminLogs(50).catch(() => ({ items: [] })),
                getBannedUsers().catch(() => ({ items: [] }))
            ]);
            if (statsData) setStats(statsData);
            setLogs(logsData.items || []);
            setBannedUsers(bannedData.items || []);
        } catch (e) {
            console.error('Load admin data error:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleUnban = async (userId) => {
        try {
            await unbanUser(userId);
            loadData();
        } catch (e) {
            alert(`Lỗi: ${e.message}`);
        }
    };

    // Show login form if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                                <Shield className="w-10 h-10 text-blue-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">Admin Panel</h1>
                            <p className="text-gray-400">Nhập mật khẩu để truy cập</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Mật khẩu Admin
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu..."
                                    className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    autoFocus
                                />
                            </div>

                            {loginError && (
                                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm text-center">
                                    {loginError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loginLoading || !password}
                                className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                {loginLoading ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        Đang xác thực...
                                    </>
                                ) : (
                                    <>
                                        <KeyRound className="w-5 h-5" />
                                        Đăng nhập
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-gray-700 text-center">
                            <Link
                                to="/"
                                className="text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                ← Quay về trang chủ
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
            {/* Sidebar */}
            <AdminSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
            />

            {/* Main Content */}
            <main className={`flex-1 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-0'} transition-all duration-300`}>
                {/* Header */}
                <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {activeTab === 'overview' && 'Tổng quan'}
                                {activeTab === 'posts' && 'Quản lý bài viết'}
                                {activeTab === 'users' && 'Người dùng bị cấm'}
                                {activeTab === 'logs' && 'Nhật ký hoạt động'}
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Quản trị forum Bạn Đồng Hành
                            </p>
                        </div>
                        <button
                            onClick={loadData}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Làm mới
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div className="p-6">
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <OverviewTab stats={stats} logs={logs} />
                            </motion.div>
                        )}
                        {activeTab === 'posts' && (
                            <motion.div
                                key="posts"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <PostsTab onRefresh={loadData} />
                            </motion.div>
                        )}
                        {activeTab === 'users' && (
                            <motion.div
                                key="users"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <BannedUsersTab bannedUsers={bannedUsers} onUnban={handleUnban} onRefresh={loadData} />
                            </motion.div>
                        )}
                        {activeTab === 'logs' && (
                            <motion.div
                                key="logs"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <LogsTab logs={logs} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Warning Footer */}
                <div className="p-6 pt-0">
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border border-yellow-200 dark:border-yellow-800">
                        <div className="flex gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                <strong>Lưu ý:</strong> Mọi hành động admin đều được ghi nhật ký. Cân nhắc kỹ trước khi thực hiện.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
