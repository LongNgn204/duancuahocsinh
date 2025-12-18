// src/pages/AdminDashboard.jsx
// Chú thích: Admin Dashboard v3.0 - JWT Authentication độc lập
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
    Shield, AlertTriangle, Users, MessageSquare, Ban,
    Lock, Unlock, Eye, EyeOff, Trash2, Clock, ChevronDown,
    BarChart3, Activity, RefreshCw, Home, Settings, LogOut,
    FileText, Flag, Database, Menu, X, KeyRound, Download
} from 'lucide-react';
import {
    getForumStats, getAdminLogs, getBannedUsers, getForumPosts,
    deleteForumPost, toggleLockPost, banUser, unbanUser,
    adminLogin, isAdminLoggedIn, adminLogout, getSOSLogs, getAllUsers,
    getChatMetrics
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
        { id: 'database-stats', label: 'Thống kê Database', icon: Database },
        { id: 'all-users', label: 'Tất cả người dùng', icon: Users },
        { id: 'posts', label: 'Quản lý bài viết', icon: FileText },
        { id: 'users', label: 'Người dùng bị cấm', icon: Ban },
        { id: 'sos', label: 'SOS Logs', icon: AlertTriangle },
        { id: 'chat-metrics', label: 'Chat Analytics', icon: MessageSquare },
        { id: 'logs', label: 'Nhật ký hoạt động', icon: Activity },
    ];

    const handleLogout = () => {
        adminLogout();
        navigate('/');
    };

    return (
        <aside className={`
            ${collapsed ? 'w-16' : 'w-64'} 
            h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col transition-all duration-300
            fixed left-0 top-0 z-50 md:relative
            shadow-2xl shadow-indigo-900/30
        `}>
            {/* Header */}
            <div className="p-4 border-b border-indigo-500/30 flex items-center justify-between bg-gradient-to-r from-indigo-600/20 to-transparent">
                {!collapsed && (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">Admin Panel</span>
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 hover:bg-indigo-500/20 rounded-xl transition-colors"
                >
                    {collapsed ? <Menu size={18} /> : <X size={18} />}
                </button>
            </div>

            {/* Admin Badge */}
            {!collapsed && (
                <div className="p-4 border-b border-indigo-500/20">
                    <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl">
                        <KeyRound size={16} className="animate-pulse" />
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
                            w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 relative group
                            ${activeTab === item.id
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                                : 'text-indigo-200 hover:bg-indigo-500/20 hover:text-white'}
                        `}
                        title={collapsed ? item.label : undefined}
                    >
                        {activeTab === item.id && (
                            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-cyan-400 to-indigo-400 rounded-r-full" />
                        )}
                        <item.icon size={20} className={`transition-transform group-hover:scale-110 ${activeTab === item.id ? 'drop-shadow-lg' : ''}`} />
                        {!collapsed && <span className="font-medium">{item.label}</span>}
                    </button>
                ))}
            </nav>

            {/* Footer Actions */}
            <div className="p-4 border-t border-indigo-500/20 space-y-2 bg-gradient-to-t from-slate-900/50 to-transparent">
                <Link
                    to="/app"
                    className="flex items-center gap-3 px-3 py-2.5 text-indigo-200 hover:bg-indigo-500/20 hover:text-white rounded-xl transition-all"
                    title={collapsed ? 'Về trang chính' : undefined}
                >
                    <Home size={18} />
                    {!collapsed && <span className="text-sm font-medium">Về trang chính</span>}
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-xl transition-all"
                    title={collapsed ? 'Đăng xuất' : undefined}
                >
                    <LogOut size={18} />
                    {!collapsed && <span className="text-sm font-medium">Đăng xuất</span>}
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
            whileHover={{ y: -2, scale: 1.01 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 relative overflow-hidden group"
        >
            {/* Background decoration */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${color} opacity-10 group-hover:opacity-20 transition-opacity blur-xl`} />

            <div className="flex items-center justify-between relative">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">{label}</p>
                    <p className="text-3xl font-bold text-gray-800 dark:text-white">{value}</p>
                    {trend && (
                        <p className={`text-xs mt-1 ${trend > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                        </p>
                    )}
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} shadow-lg ring-4 ring-white/20`}>
                    <Icon className="w-7 h-7 text-white" />
                </div>
            </div>
        </motion.div>
    );
}

// =============================================================================
// OVERVIEW TAB
// =============================================================================

function OverviewTab({ stats, logs, sosStats }) {
    // Export CSV function
    const exportToCSV = (data, filename) => {
        if (!data || data.length === 0) {
            alert('Không có dữ liệu để xuất');
            return;
        }

        // Convert to CSV
        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','),
            ...data.map(row =>
                headers.map(header => {
                    const value = row[header];
                    // Escape commas and quotes
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value ?? '';
                }).join(',')
            )
        ];

        const csvContent = csvRows.join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleExportLogs = () => {
        exportToCSV(logs, 'admin_logs');
    };

    const handleExportSOS = () => {
        if (!sosStats) {
            alert('Không có dữ liệu SOS để xuất');
            return;
        }
        // Create SOS summary data
        const sosData = [{
            'Tổng số sự kiện (7 ngày)': sosStats.total || 0,
            'Critical Risk': sosStats.critical || 0,
            'Unique Users': sosStats.unique_users || 0,
            'Ngày xuất': new Date().toLocaleDateString('vi-VN')
        }];
        exportToCSV(sosData, 'sos_summary');
    };

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={FileText} label="Tổng bài viết" value={stats?.total_posts || 0} color="bg-blue-500" />
                <StatCard icon={MessageSquare} label="Tổng bình luận" value={stats?.total_comments || 0} color="bg-green-500" />
                <StatCard icon={EyeOff} label="Bài viết đã ẩn" value={stats?.hidden_posts || 0} color="bg-orange-500" />
                <StatCard icon={Ban} label="Người dùng bị cấm" value={stats?.banned_users || 0} color="bg-red-500" />
            </div>

            {/* SOS Stats */}
            {sosStats && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            Thống kê SOS (7 ngày)
                        </h3>
                        <button
                            onClick={handleExportSOS}
                            className="flex items-center gap-2 px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                            title="Xuất CSV"
                        >
                            <Download size={16} />
                            Xuất CSV
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard
                            icon={AlertTriangle}
                            label="SOS Events (7 ngày)"
                            value={sosStats.total || 0}
                            color="bg-red-500"
                        />
                        <StatCard
                            icon={AlertTriangle}
                            label="Critical Risk"
                            value={sosStats.critical || 0}
                            color="bg-red-600"
                        />
                        <StatCard
                            icon={Users}
                            label="Unique Users"
                            value={sosStats.unique_users || 0}
                            color="bg-purple-500"
                        />
                    </div>
                </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-500" />
                        Hoạt động gần đây
                    </h3>
                    {logs.length > 0 && (
                        <button
                            onClick={handleExportLogs}
                            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                            title="Xuất CSV"
                        >
                            <Download size={16} />
                            Xuất CSV
                        </button>
                    )}
                </div>
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
// DATABASE STATS TAB - Comprehensive Statistics from All Tables
// =============================================================================

function DatabaseStatsTab() {
    const [stats, setStats] = useState(null);
    const [activityData, setActivityData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('admin_token');
            const API_BASE = import.meta.env.VITE_API_URL || 'https://ban-dong-hanh-worker.stu725114073.workers.dev';

            const [statsRes, activityRes] = await Promise.all([
                fetch(`${API_BASE}/api/admin/comprehensive-stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_BASE}/api/admin/activity-data?days=30`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (statsRes.ok) {
                setStats(await statsRes.json());
            }
            if (activityRes.ok) {
                setActivityData(await activityRes.json());
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl text-red-600 dark:text-red-400">
                Lỗi: {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Users Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    Người dùng
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard icon={Users} label="Tổng số users" value={stats?.users?.total || 0} color="bg-blue-500" />
                    <StatCard icon={Activity} label="Active hôm nay" value={stats?.users?.activeToday || 0} color="bg-green-500" />
                    <StatCard icon={Activity} label="Active 7 ngày" value={stats?.users?.activeWeek || 0} color="bg-indigo-500" />
                </div>
            </div>

            {/* Content Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-500" />
                    Nội dung người dùng tạo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard icon={FileText} label="Lọ biết ơn" value={stats?.content?.gratitude || 0} color="bg-pink-500" />
                    <StatCard icon={FileText} label="Nhật ký" value={stats?.content?.journal || 0} color="bg-purple-500" />
                    <StatCard icon={FileText} label="Bookmarks" value={stats?.content?.bookmarks || 0} color="bg-cyan-500" />
                </div>
            </div>

            {/* Activities Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-500" />
                    Hoạt động
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Focus Sessions</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.activities?.focus?.sessions || 0}</p>
                        <p className="text-xs text-gray-400">{stats?.activities?.focus?.totalMinutes || 0} phút tổng</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Breathing Sessions</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.activities?.breathing?.sessions || 0}</p>
                        <p className="text-xs text-gray-400">{Math.round((stats?.activities?.breathing?.totalSeconds || 0) / 60)} phút tổng</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Sleep Logs</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.activities?.sleep?.logs || 0}</p>
                        <p className="text-xs text-gray-400">TB: {stats?.activities?.sleep?.avgDuration || 0} phút</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Games played</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.activities?.games?.plays || 0}</p>
                        <p className="text-xs text-gray-400">High score: {stats?.activities?.games?.maxScore || 0}</p>
                    </div>
                </div>
            </div>

            {/* Gamification & Community */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        🏆 Gamification
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-xl p-4">
                            <p className="text-sm opacity-80">Achievements mở khóa</p>
                            <p className="text-3xl font-bold">{stats?.gamification?.achievements || 0}</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl p-4">
                            <p className="text-sm opacity-80">Tổng XP</p>
                            <p className="text-3xl font-bold">{(stats?.gamification?.totalXP || 0).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        👥 Cộng đồng Forum
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Bài viết</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.community?.forumPosts || 0}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Bình luận</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.community?.forumComments || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI & Safety */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        🤖 AI Chat
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-300">Tổng responses</span>
                            <span className="font-semibold">{stats?.ai?.chatResponses || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-300">Feedback count</span>
                            <span className="font-semibold">{stats?.ai?.feedbackCount || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-300">Avg quality</span>
                            <span className="font-semibold">{stats?.ai?.avgQuality || 0}/5</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        An toàn
                    </h3>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 text-center">
                        <p className="text-sm text-red-600 dark:text-red-400 mb-2">SOS Events</p>
                        <p className="text-4xl font-bold text-red-600 dark:text-red-400">{stats?.safety?.sosEvents || 0}</p>
                    </div>
                </div>
            </div>

            {/* Activity Chart Preview */}
            {activityData && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        📈 Hoạt động 30 ngày gần đây
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
                            <p className="text-2xl font-bold text-pink-600">{activityData.gratitude?.length || 0}</p>
                            <p className="text-xs text-gray-500">Ngày có gratitude</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                            <p className="text-2xl font-bold text-purple-600">{activityData.journal?.length || 0}</p>
                            <p className="text-xs text-gray-500">Ngày có journal</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                            <p className="text-2xl font-bold text-green-600">{activityData.breathing?.length || 0}</p>
                            <p className="text-xs text-gray-500">Ngày có breathing</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                            <p className="text-2xl font-bold text-blue-600">{activityData.focus?.length || 0}</p>
                            <p className="text-xs text-gray-500">Ngày có focus</p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                            <p className="text-2xl font-bold text-orange-600">{activityData.games?.length || 0}</p>
                            <p className="text-xs text-gray-500">Ngày có games</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Refresh Button */}
            <div className="text-center">
                <button
                    onClick={loadStats}
                    className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
                >
                    <RefreshCw className="w-4 h-4" />
                    Làm mới thống kê
                </button>
            </div>
        </div>
    );
}

// =============================================================================
// CHAT METRICS TAB - Enhanced with comprehensive analytics
// =============================================================================

function ChatMetricsTab({ onRefresh }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadChatAnalytics();
    }, []);

    const loadChatAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('admin_token');
            const API_BASE = import.meta.env.VITE_API_URL || 'https://ban-dong-hanh-worker.stu725114073.workers.dev';

            const response = await fetch(`${API_BASE}/api/admin/chat-analytics`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setData(await response.json());
            } else {
                setError('Không thể tải dữ liệu chat analytics');
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl text-red-600 dark:text-red-400">
                Lỗi: {error}
            </div>
        );
    }

    const riskColors = {
        'green': 'bg-green-500',
        'yellow': 'bg-yellow-500',
        'red': 'bg-red-500',
        'critical': 'bg-red-700'
    };

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    icon={MessageSquare}
                    label="Tổng AI Responses"
                    value={data?.stats?.total || 0}
                    color="bg-blue-500"
                />
                <StatCard
                    icon={Activity}
                    label="Avg Latency"
                    value={`${data?.stats?.avgLatencyMs || 0}ms`}
                    color="bg-green-500"
                />
                <StatCard
                    icon={BarChart3}
                    label="Avg Confidence"
                    value={`${((data?.stats?.avgConfidence || 0) * 100).toFixed(1)}%`}
                    color="bg-purple-500"
                />
                <StatCard
                    icon={FileText}
                    label="RAG Usage"
                    value={`${((data?.stats?.ragUsageRate || 0) * 100).toFixed(1)}%`}
                    color="bg-orange-500"
                />
            </div>

            {/* Feedback Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    👍 Phản hồi người dùng
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tổng feedback</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{data?.feedback?.total || 0}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                        <p className="text-sm text-green-600 dark:text-green-400">Tỷ lệ hữu ích</p>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                            {((data?.feedback?.helpfulRate || 0) * 100).toFixed(1)}%
                        </p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                        <p className="text-sm text-blue-600 dark:text-blue-400">Avg Quality</p>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {data?.feedback?.avgQuality || 0}/5
                        </p>
                    </div>
                </div>
            </div>

            {/* Risk Distribution */}
            {data?.riskDistribution && data.riskDistribution.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        Phân bố mức độ rủi ro
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {data.riskDistribution.map((item) => (
                            <div
                                key={item.risk_level}
                                className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700"
                            >
                                <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${riskColors[item.risk_level] || 'bg-gray-500'}`}></div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{item.risk_level}</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.count}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Responses */}
            {data?.recentResponses && data.recentResponses.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-500" />
                        Các responses gần đây
                    </h3>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {data.recentResponses.slice(0, 10).map((response, idx) => (
                            <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs text-gray-400">
                                        {formatDate(response.created_at)}
                                    </span>
                                    {response.risk_level && (
                                        <span className={`px-2 py-0.5 text-xs rounded-full text-white ${riskColors[response.risk_level] || 'bg-gray-500'}`}>
                                            {response.risk_level}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
                                    <strong>User:</strong> {response.user_message || '(empty)'}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                    <strong>AI:</strong> {response.ai_response?.substring(0, 150) || '(no response)'}...
                                </p>
                                {response.confidence !== null && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        Confidence: {(response.confidence * 100).toFixed(1)}%
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Refresh Button */}
            <div className="text-center">
                <button
                    onClick={loadChatAnalytics}
                    className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
                >
                    <RefreshCw className="w-4 h-4" />
                    Làm mới
                </button>
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
// ALL USERS TAB
// =============================================================================

function AllUsersTab({ users, loading, onRefresh, sortBy, setSortBy }) {
    const getSupportBadge = (user) => {
        if (user.needs_support) {
            return <span className="px-2 py-1 text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded">Cần hỗ trợ</span>;
        }
        if (user.recent_journal_count > 0) {
            return <span className="px-2 py-1 text-xs bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded">Đang tích cực</span>;
        }
        return null;
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sắp xếp theo:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="created_at">Ngày đăng ký</option>
                            <option value="last_login">Lần đăng nhập cuối</option>
                            <option value="journal_count">Số nhật ký</option>
                            <option value="sos_count">Số SOS logs</option>
                        </select>
                    </div>
                    <button
                        onClick={onRefresh}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Làm mới
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-500" />
                        Tất cả người dùng ({users.length})
                    </h3>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                        <p>Đang tải...</p>
                    </div>
                ) : users.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Chưa có người dùng nào</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày đăng ký</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lần đăng nhập cuối</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhật ký</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SOS (7 ngày)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 text-sm text-gray-500">#{user.id}</td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {user.username || `User #${user.id}`}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {formatDate(user.created_at)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {user.last_login ? formatDate(user.last_login) : 'Chưa đăng nhập'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {user.journal_count || 0}
                                                </span>
                                                {user.recent_journal_count > 0 && (
                                                    <span className="text-xs text-green-600 dark:text-green-400">
                                                        +{user.recent_journal_count} (7 ngày)
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className={`text-sm font-medium ${user.recent_sos_count > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                                                    {user.recent_sos_count || 0}
                                                </span>
                                                {user.sos_count > 0 && (
                                                    <span className="text-xs text-gray-500">
                                                        Tổng: {user.sos_count}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getSupportBadge(user)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Summary Stats */}
            {users.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tổng users</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Cần hỗ trợ</p>
                        <p className="text-2xl font-bold text-red-600">
                            {users.filter(u => u.needs_support).length}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Đang tích cực</p>
                        <p className="text-2xl font-bold text-green-600">
                            {users.filter(u => u.recent_journal_count > 0).length}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                        <p className="text-sm text-gray-500 dark:text-gray-400">SOS (7 ngày)</p>
                        <p className="text-2xl font-bold text-orange-600">
                            {users.reduce((sum, u) => sum + (u.recent_sos_count || 0), 0)}
                        </p>
                    </div>
                </div>
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
// SOS LOGS TAB
// =============================================================================

function SOSLogsTab({ sosLogs, onRefresh }) {
    const [filterRisk, setFilterRisk] = useState(null);
    const [filteredLogs, setFilteredLogs] = useState([]);

    useEffect(() => {
        if (filterRisk) {
            setFilteredLogs(sosLogs.filter(log => log.risk_level === filterRisk));
        } else {
            setFilteredLogs(sosLogs);
        }
    }, [sosLogs, filterRisk]);

    const riskColors = {
        'critical': 'bg-red-600 text-white',
        'red': 'bg-red-500 text-white',
        'yellow': 'bg-yellow-500 text-white',
        'green': 'bg-green-500 text-white',
        'safe': 'bg-gray-500 text-white',
    };

    const eventTypeLabels = {
        'overlay_opened': 'Mở overlay SOS',
        'hotline_clicked': 'Nhấn hotline',
        'map_viewed': 'Xem bản đồ',
        'message_flagged': 'Tin nhắn được đánh dấu',
        'false_positive': 'False positive',
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Lọc theo mức độ:</span>
                    <button
                        onClick={() => setFilterRisk(null)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${!filterRisk
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                    >
                        Tất cả
                    </button>
                    {['critical', 'red', 'yellow', 'green', 'safe'].map(risk => (
                        <button
                            key={risk}
                            onClick={() => setFilterRisk(risk)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filterRisk === risk
                                ? riskColors[risk] || 'bg-gray-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            {risk.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Logs List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        SOS Logs ({filteredLogs.length})
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại sự kiện</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mức độ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trigger text</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        Không có log nào
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {formatDate(log.created_at)}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {eventTypeLabels[log.event_type] || log.event_type}
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.risk_level && (
                                                <span className={`px-2 py-1 text-xs rounded ${riskColors[log.risk_level] || 'bg-gray-500 text-white'}`}>
                                                    {log.risk_level.toUpperCase()}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                                            {log.trigger_text || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {log.hashed_user_id ? `#${log.hashed_user_id}` : '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
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
    const [sosLogs, setSosLogs] = useState([]);
    const [sosStats, setSosStats] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersSortBy, setUsersSortBy] = useState('created_at');
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
            const [statsData, logsData, bannedData, sosData] = await Promise.all([
                getForumStats().catch(() => null),
                getAdminLogs(50).catch(() => ({ items: [] })),
                getBannedUsers().catch(() => ({ items: [] })),
                getSOSLogs(100).catch(() => ({ items: [] }))
            ]);
            if (statsData) setStats(statsData);
            setLogs(logsData.items || []);
            setBannedUsers(bannedData.items || []);
            setSosLogs(sosData.items || []);

            // Tính SOS stats
            if (sosData.items && sosData.items.length > 0) {
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                const recentLogs = sosData.items.filter(log => new Date(log.created_at) >= sevenDaysAgo);
                const criticalCount = recentLogs.filter(log => log.risk_level === 'critical' || log.risk_level === 'red').length;
                const uniqueUsers = new Set(recentLogs.map(log => log.hashed_user_id).filter(Boolean)).size;
                setSosStats({
                    total: recentLogs.length,
                    critical: criticalCount,
                    unique_users: uniqueUsers
                });
            }
        } catch (e) {
            console.error('Load admin data error:', e);
        } finally {
            setLoading(false);
        }
    };

    const loadAllUsers = async () => {
        setUsersLoading(true);
        try {
            const result = await getAllUsers(100, 0, usersSortBy);
            setAllUsers(result.items || []);
        } catch (e) {
            console.error('Load users error:', e);
            setAllUsers([]);
        } finally {
            setUsersLoading(false);
        }
    };

    // Load users when tab changes or sort changes
    useEffect(() => {
        if (activeTab === 'all-users') {
            loadAllUsers();
        }
    }, [activeTab, usersSortBy]);

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
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
                {/* Animated background decorations */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse" />
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />

                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="w-full max-w-md relative z-10"
                >
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-indigo-500/30 ring-1 ring-white/10">
                        <div className="text-center mb-8">
                            <motion.div
                                className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/40 ring-4 ring-indigo-500/20"
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <Shield className="w-12 h-12 text-white drop-shadow-lg" />
                            </motion.div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent mb-2">Admin Panel</h1>
                            <p className="text-indigo-300/80">Nhập mật khẩu để truy cập bảng điều khiển</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-indigo-200 mb-2">
                                    Mật khẩu Admin
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu..."
                                    className="w-full px-4 py-4 rounded-xl bg-slate-700/50 border border-indigo-500/30 text-white placeholder-indigo-300/50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 outline-none transition-all backdrop-blur-sm"
                                    autoFocus
                                />
                            </div>

                            {loginError && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-sm text-center backdrop-blur-sm"
                                >
                                    {loginError}
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                disabled={loginLoading || !password}
                                className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:via-purple-500 hover:to-indigo-500 disabled:from-slate-600 disabled:via-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98]"
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

                        <div className="mt-8 pt-6 border-t border-indigo-500/20 text-center">
                            <Link
                                to="/"
                                className="text-sm text-indigo-300 hover:text-white transition-colors inline-flex items-center gap-1"
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
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50/50 to-purple-50/30 dark:from-slate-900 dark:via-indigo-950/50 dark:to-slate-900 flex">
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
                <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-sm sticky top-0 z-40 border-b border-indigo-100 dark:border-indigo-900/50">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-indigo-700 dark:from-white dark:to-indigo-200 bg-clip-text text-transparent">
                                {activeTab === 'overview' && 'Tổng quan'}
                                {activeTab === 'database-stats' && 'Thống kê Database'}
                                {activeTab === 'all-users' && 'Tất cả người dùng'}
                                {activeTab === 'posts' && 'Quản lý bài viết'}
                                {activeTab === 'users' && 'Người dùng bị cấm'}
                                {activeTab === 'sos' && 'SOS Logs'}
                                {activeTab === 'chat-metrics' && 'Chat Analytics'}
                                {activeTab === 'logs' && 'Nhật ký hoạt động'}
                            </h1>
                            <p className="text-sm text-indigo-600/70 dark:text-indigo-300/70 font-medium">
                                Quản trị forum Bạn Đồng Hành
                            </p>
                        </div>
                        <button
                            onClick={loadData}
                            disabled={loading}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all hover:scale-105 active:scale-95"
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
                                <OverviewTab stats={stats} logs={logs} sosStats={sosStats} />
                            </motion.div>
                        )}
                        {activeTab === 'database-stats' && (
                            <motion.div
                                key="database-stats"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <DatabaseStatsTab />
                            </motion.div>
                        )}
                        {activeTab === 'all-users' && (
                            <motion.div
                                key="all-users"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <AllUsersTab
                                    users={allUsers}
                                    loading={usersLoading}
                                    onRefresh={loadAllUsers}
                                    sortBy={usersSortBy}
                                    setSortBy={setUsersSortBy}
                                />
                            </motion.div>
                        )}
                        {activeTab === 'sos' && (
                            <motion.div
                                key="sos"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <SOSLogsTab sosLogs={sosLogs} onRefresh={loadData} />
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
                        {activeTab === 'chat-metrics' && (
                            <motion.div
                                key="chat-metrics"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <ChatMetricsTab onRefresh={() => { }} />
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
