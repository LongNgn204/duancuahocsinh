// src/pages/Forum.jsx
// Chú thích: Diễn đàn ẩn danh - Nơi chia sẻ tâm sự an toàn
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle, Heart, Clock, Tag, Plus, Send, ArrowLeft,
    Lock, AlertTriangle, Users, X, ChevronUp, Loader2, Flag
} from 'lucide-react';
import GlowOrbs from '../components/ui/GlowOrbs';
import {
    getForumPosts, getForumPost, createForumPost,
    addForumComment, upvoteForumPost, isLoggedIn,
    reportForumContent
} from '../utils/api';

// Tags phổ biến cho forum
const POPULAR_TAGS = [
    { id: 'tam_su', label: 'Tâm sự', emoji: '💭' },
    { id: 'hoc_tap', label: 'Học tập', emoji: '📚' },
    { id: 'gia_dinh', label: 'Gia đình', emoji: '🏠' },
    { id: 'tinh_cam', label: 'Tình cảm', emoji: '💕' },
    { id: 'ban_be', label: 'Bạn bè', emoji: '👫' },
    { id: 'cong_viec', label: 'Công việc', emoji: '💼' },
];

// Format thời gian tương đối
function formatRelativeTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
}

// Report Modal Component
function ReportModal({ isOpen, onClose, targetType, targetId, onReported }) {
    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const reasons = [
        { id: 'spam', label: 'Spam hoặc quảng cáo', icon: '📢' },
        { id: 'harassment', label: 'Quấy rối hoặc bắt nạt', icon: '⚠️' },
        { id: 'inappropriate', label: 'Nội dung không phù hợp', icon: '🚫' },
        { id: 'misinformation', label: 'Thông tin sai lệch', icon: '❌' },
        { id: 'other', label: 'Lý do khác', icon: '📝' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason) {
            setError('Vui lòng chọn lý do báo cáo');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await reportForumContent(targetType, targetId, reason, details || null);
            if (onReported) onReported();
            onClose();
        } catch (e) {
            setError(e.data?.message || e.message || 'Không thể gửi báo cáo');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-md"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Flag className="w-5 h-5 text-red-500" />
                        Báo cáo vi phạm
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                            Lý do báo cáo *
                        </label>
                        <div className="space-y-2">
                            {reasons.map(r => (
                                <label
                                    key={r.id}
                                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                        reason === r.id
                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="reason"
                                        value={r.id}
                                        checked={reason === r.id}
                                        onChange={e => setReason(e.target.value)}
                                        className="w-4 h-4 text-red-500"
                                    />
                                    <span className="text-lg">{r.icon}</span>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{r.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                            Chi tiết (tùy chọn)
                        </label>
                        <textarea
                            value={details}
                            onChange={e => setDetails(e.target.value)}
                            placeholder="Mô tả thêm về vấn đề..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-red-500 outline-none resize-none"
                            maxLength={500}
                        />
                        <span className="text-xs text-gray-400">{details.length}/500</span>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2 text-sm">
                            <AlertTriangle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !reason}
                            className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Flag className="w-5 h-5" />}
                            Gửi báo cáo
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}

// Post Card Component
function PostCard({ post, onClick, onReport }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all"
        >
            <div className="flex items-start justify-between mb-3">
                <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => onClick(post.id)}
                >
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>{post.hashed_user_id || 'Ẩn danh'}</span>
                        <span className="mx-1">•</span>
                        <Clock className="w-3 h-3" />
                        <span>{formatRelativeTime(post.created_at)}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {post.is_locked && <Lock className="w-4 h-4 text-gray-400" />}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onReport(post.id);
                        }}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Báo cáo vi phạm"
                    >
                        <Flag className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </button>
                </div>
            </div>

            {post.title && (
                <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-100">
                    {post.title}
                </h3>
            )}

            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                {post.content}
            </p>

            <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => onClick(post.id)}
            >
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-pink-500">
                        <Heart className="w-4 h-4" />
                        {post.upvotes || 0}
                    </span>
                    <span className="flex items-center gap-1 text-blue-500">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments_count || 0}
                    </span>
                </div>

                {post.tags && post.tags.length > 0 && (
                    <div className="flex gap-2">
                        {post.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// New Post Modal
function NewPostModal({ isOpen, onClose, onSubmit }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [anonymous, setAnonymous] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const toggleTag = (tagId) => {
        if (selectedTags.includes(tagId)) {
            setSelectedTags(selectedTags.filter(t => t !== tagId));
        } else if (selectedTags.length < 3) {
            setSelectedTags([...selectedTags, tagId]);
        }
    };

    const handleSubmit = async () => {
        if (!content.trim()) {
            setError('Vui lòng nhập nội dung');
            return;
        }
        if (content.length < 10) {
            setError('Nội dung quá ngắn');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await onSubmit({ title: title.trim() || null, content: content.trim(), tags: selectedTags, anonymous });
            setTitle('');
            setContent('');
            setSelectedTags([]);
            onClose();
        } catch (e) {
            setError(e.data?.message || e.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Tạo bài viết mới</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                            Tiêu đề (không bắt buộc)
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Tiêu đề bài viết..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            maxLength={200}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                            Nội dung
                        </label>
                        <textarea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="Chia sẻ điều bạn đang nghĩ..."
                            rows={6}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            maxLength={5000}
                        />
                        <span className="text-xs text-gray-400">{content.length}/5000</span>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                            Chủ đề (tùy chọn)
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {POPULAR_TAGS.map(tag => (
                                <button
                                    key={tag.id}
                                    onClick={() => toggleTag(tag.id)}
                                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${selectedTags.includes(tag.id)
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    {tag.emoji} {tag.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={anonymous}
                            onChange={e => setAnonymous(e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                            Đăng ẩn danh (không hiển thị ID của bạn)
                        </span>
                    </label>

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={loading || !content.trim()}
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50 transition-all"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        Đăng bài
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// Post Detail View
function PostDetail({ postId, onBack }) {
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [commentAnon, setCommentAnon] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [upvoted, setUpvoted] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportingCommentId, setReportingCommentId] = useState(null);

    useEffect(() => {
        loadPost();
    }, [postId]);

    const loadPost = async () => {
        setLoading(true);
        try {
            const data = await getForumPost(postId);
            setPost(data.post);
            setComments(data.comments || []);
        } catch (e) {
            console.error('Load post error:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleUpvote = async () => {
        if (!isLoggedIn()) return;
        try {
            const result = await upvoteForumPost(postId);
            setUpvoted(result.action === 'added');
            loadPost();
        } catch (e) {
            console.error('Upvote error:', e);
        }
    };

    const handleComment = async () => {
        if (!newComment.trim()) return;
        setSubmitting(true);
        try {
            await addForumComment(postId, newComment.trim(), commentAnon);
            setNewComment('');
            loadPost();
        } catch (e) {
            alert(e.data?.message || 'Không thể gửi bình luận');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Không tìm thấy bài viết</p>
                <button onClick={onBack} className="mt-4 text-blue-500 hover:underline">
                    ← Quay lại
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                Quay lại danh sách
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6"
            >
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <Users className="w-4 h-4" />
                    <span>{post.hashed_user_id || 'Ẩn danh'}</span>
                    <span className="mx-1">•</span>
                    <Clock className="w-4 h-4" />
                    <span>{formatRelativeTime(post.created_at)}</span>
                    {post.is_locked && (
                        <>
                            <span className="mx-1">•</span>
                            <Lock className="w-4 h-4" />
                            <span className="text-orange-500">Đã khóa</span>
                        </>
                    )}
                </div>

                {post.title && (
                    <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                        {post.title}
                    </h1>
                )}

                <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {post.content}
                </p>

                {post.tags && post.tags.length > 0 && (
                    <div className="flex gap-2 mt-4">
                        {post.tags.map(tag => (
                            <span key={tag} className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full flex items-center gap-1">
                                <Tag className="w-3 h-3" /> {tag}
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleUpvote}
                            disabled={!isLoggedIn()}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${upvoted
                                    ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            <ChevronUp className="w-5 h-5" />
                            {post.upvotes || 0}
                        </button>
                        <span className="flex items-center gap-2 text-gray-500">
                            <MessageCircle className="w-5 h-5" />
                            {comments.length} bình luận
                        </span>
                    </div>
                    <button
                        onClick={() => setShowReportModal(true)}
                        className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-sm"
                    >
                        <Flag className="w-4 h-4" />
                        Báo cáo
                    </button>
                </div>
            </motion.div>

            {/* Comments Section */}
            <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                    Bình luận
                </h3>

                {!post.is_locked && (
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4">
                        <textarea
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            placeholder="Viết bình luận của bạn..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            maxLength={1000}
                        />
                        <div className="flex items-center justify-between mt-3">
                            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 dark:text-gray-300">
                                <input
                                    type="checkbox"
                                    checked={commentAnon}
                                    onChange={e => setCommentAnon(e.target.checked)}
                                    className="w-4 h-4 rounded"
                                />
                                Ẩn danh
                            </label>
                            <button
                                onClick={handleComment}
                                disabled={submitting || !newComment.trim()}
                                className="px-4 py-2 bg-blue-500 text-white rounded-xl flex items-center gap-2 hover:bg-blue-600 disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                Gửi
                            </button>
                        </div>
                    </div>
                )}

                {post.is_locked && (
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-xl flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Bài viết này đã bị khóa bình luận
                    </div>
                )}

                <div className="space-y-3">
                    {comments.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">Chưa có bình luận nào</p>
                    ) : (
                        comments.map((comment, idx) => (
                            <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span>{comment.hashed_user_id || 'Ẩn danh'}</span>
                                        <span>•</span>
                                        <span>{formatRelativeTime(comment.created_at)}</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setReportingCommentId(comment.id);
                                            setShowReportModal(true);
                                        }}
                                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Báo cáo bình luận"
                                    >
                                        <Flag className="w-3 h-3 text-gray-400 hover:text-red-500" />
                                    </button>
                                </div>
                                <p className="text-gray-700 dark:text-gray-200">
                                    {comment.content}
                                </p>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Report Modal */}
            <AnimatePresence>
                {showReportModal && (
                    <ReportModal
                        isOpen={showReportModal}
                        onClose={() => {
                            setShowReportModal(false);
                            setReportingCommentId(null);
                        }}
                        targetType={reportingCommentId ? 'comment' : 'post'}
                        targetId={reportingCommentId || postId}
                        onReported={() => {
                            // Có thể hiển thị thông báo thành công
                            console.log('Report submitted');
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// Main Forum Page
export default function Forum() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedTag, setSelectedTag] = useState(null);
    const [showNewPost, setShowNewPost] = useState(false);
    const [viewingPostId, setViewingPostId] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportingPostId, setReportingPostId] = useState(null);

    useEffect(() => {
        loadPosts();
    }, [page, selectedTag]);

    const loadPosts = async () => {
        setLoading(true);
        try {
            const data = await getForumPosts(page, 20, selectedTag);
            setPosts(data.items || []);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch (e) {
            console.error('Load posts error:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (postData) => {
        await createForumPost(postData.content, postData.title, postData.tags, postData.anonymous);
        loadPosts();
    };

    if (viewingPostId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative">
                <GlowOrbs />
                <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
                    <PostDetail postId={viewingPostId} onBack={() => setViewingPostId(null)} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative">
            <GlowOrbs />

            <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                    >
                        💬 Diễn đàn chia sẻ
                    </motion.h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Nơi an toàn để chia sẻ và lắng nghe
                    </p>
                </div>

                {/* Tags Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
                    <button
                        onClick={() => { setSelectedTag(null); setPage(1); }}
                        className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${!selectedTag
                                ? 'bg-blue-500 text-white'
                                : 'bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300'
                            }`}
                    >
                        Tất cả
                    </button>
                    {POPULAR_TAGS.map(tag => (
                        <button
                            key={tag.id}
                            onClick={() => { setSelectedTag(tag.id); setPage(1); }}
                            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${selectedTag === tag.id
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
                                }`}
                        >
                            {tag.emoji} {tag.label}
                        </button>
                    ))}
                </div>

                {/* New Post Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowNewPost(true)}
                    className="w-full mb-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Tạo bài viết mới
                </motion.button>

                {/* Posts List */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-12 bg-white/60 dark:bg-gray-800/60 rounded-2xl">
                        <MessageCircle className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">Chưa có bài viết nào</p>
                        <button
                            onClick={() => setShowNewPost(true)}
                            className="mt-4 text-blue-500 hover:underline"
                        >
                            Hãy là người đầu tiên chia sẻ!
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {posts.map(post => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    onClick={setViewingPostId}
                                    onReport={(postId) => {
                                        setReportingPostId(postId);
                                        setShowReportModal(true);
                                    }}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                            Math.max(0, page - 3),
                            Math.min(totalPages, page + 2)
                        ).map(p => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`w-10 h-10 rounded-full ${p === page
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                )}

                {/* Warning Notice */}
                <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border border-yellow-200 dark:border-yellow-800">
                    <div className="flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-800 dark:text-yellow-200">
                            <p className="font-medium mb-1">Lưu ý quan trọng</p>
                            <p className="text-yellow-700 dark:text-yellow-300">
                                Diễn đàn này dành cho việc chia sẻ và hỗ trợ lẫn nhau. Nếu bạn đang gặp khó khăn nghiêm trọng, hãy liên hệ đường dây nóng: <strong>1800 599 920</strong> (miễn phí, 24/7).
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* New Post Modal */}
            <AnimatePresence>
                {showNewPost && (
                    <NewPostModal
                        isOpen={showNewPost}
                        onClose={() => setShowNewPost(false)}
                        onSubmit={handleCreatePost}
                    />
                )}
            </AnimatePresence>

            {/* Report Modal */}
            <AnimatePresence>
                {showReportModal && reportingPostId && (
                    <ReportModal
                        isOpen={showReportModal}
                        onClose={() => {
                            setShowReportModal(false);
                            setReportingPostId(null);
                        }}
                        targetType="post"
                        targetId={reportingPostId}
                        onReported={() => {
                            setReportingPostId(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
