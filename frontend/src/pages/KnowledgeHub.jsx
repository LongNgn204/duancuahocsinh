// src/pages/KnowledgeHub.jsx
// Góc Kiến Thức - Nơi chia sẻ kiến thức sức khỏe tinh thần: Chuẩn vị thành niên, Responsive Mobile-first

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, ChevronRight, BookOpen, X, Sparkles, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ARTICLES } from '../data/articles';

export default function KnowledgeHub() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [readingArticle, setReadingArticle] = useState(null);

    // Get unique categories
    const categories = ['All', ...new Set(ARTICLES.map(a => a.category))];

    // Filter articles
    const filteredArticles = ARTICLES.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.summary.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6 md:space-y-8 pb-20 md:pb-10 px-1 md:px-0">
            {/* Header */}
            <div className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-2 text-slate-500 text-sm md:text-base">
                    <Link to="/app" className="hover:text-indigo-600 transition-colors">Trang chủ</Link>
                    <ChevronRight size={16} />
                    <span className="text-slate-800 font-medium">Góc kiến thức</span>
                </div>
                <div>
                    <h1 className="text-2xl md:text-4xl font-bold text-slate-800 flex items-center gap-2">
                        Góc <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Kiến Thức</span> <Sparkles className="text-yellow-400 fill-yellow-400" />
                    </h1>
                    <p className="text-slate-600 mt-2 text-sm md:text-base max-w-2xl leading-relaxed">
                        Thư viện tâm lý dành riêng cho Gen Z. Hiểu cảm xúc, chữa lành tâm hồn và trưởng thành rực rỡ. ✨
                    </p>
                </div>
            </div>

            {/* Sticky Search & Filter Mobile Friendly */}
            <div className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-md py-4 -mx-4 px-4 border-b border-slate-200/50 md:static md:bg-transparent md:p-0 md:border-0">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search Bar */}
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm vấn đề của bạn..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-2xl border-none bg-white shadow-sm focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400 text-slate-700 font-medium transition-all"
                        />
                    </div>

                    {/* Category Filter - Horizontal Scroll Snap */}
                    <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar snap-x snap-mandatory">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`
                                    snap-start shrink-0 px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all select-none
                                    ${selectedCategory === cat
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105'
                                        : 'bg-white text-slate-600 hover:bg-indigo-50 border border-transparent shadow-sm'}
                                `}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Articles Grid Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {filteredArticles.map((article) => (
                    <motion.div
                        key={article.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                        <Card
                            className="h-full flex flex-col cursor-pointer overflow-hidden hover:shadow-xl transition-all border-none bg-white/80 backdrop-blur-sm group"
                            onClick={() => setReadingArticle(article)}
                        >
                            {/* Card Decor Gradient Header */}
                            <div className={`h-24 bg-gradient-to-br ${article.gradient} relative overflow-hidden p-6 flex flex-col justify-between`}>
                                <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4">
                                    <article.icon size={100} className="text-white" />
                                </div>
                                <span className="relative z-10 inline-flex items-center px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider w-fit">
                                    {article.category}
                                </span>
                            </div>

                            <div className="p-6 flex flex-col flex-1">
                                <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                    {article.title}
                                </h3>
                                <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed mb-4 flex-1">
                                    {article.summary}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                                        <Clock size={14} /> {article.readTime} đọc
                                    </span>
                                    <div className="flex items-center text-indigo-600 font-bold text-sm gap-1 group-hover:gap-2 transition-all">
                                        Đọc ngay <ChevronRight size={16} />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {filteredArticles.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                    <div className="bg-slate-100 p-6 rounded-full mb-4">
                        <Search size={48} className="text-slate-300" />
                    </div>
                    <p className="text-lg font-medium">Không tìm thấy bài viết nào phù hợp.</p>
                    <p className="text-sm">Thử tìm từ khóa khác xem sao nhé!</p>
                </div>
            )}

            {/* Reading Modal (Overlay) */}
            <AnimatePresence>
                {readingArticle && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setReadingArticle(null)}
                    >
                        <motion.div
                            initial={{ y: '100%', opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '100%', opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="w-full max-w-3xl bg-white h-full sm:h-auto sm:max-h-[85vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className={`relative shrink-0 h-48 sm:h-64 bg-gradient-to-br ${readingArticle.gradient} flex items-end p-6 sm:p-8 overflow-hidden`}>
                                <button
                                    onClick={() => setReadingArticle(null)}
                                    className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 text-white rounded-full backdrop-blur-md transition-all z-20"
                                >
                                    <X size={24} />
                                </button>

                                {/* Decor */}
                                <readingArticle.icon className="absolute right-[-20px] bottom-[-20px] opacity-20 rotate-12 text-white" size={240} />

                                <div className="relative z-10 w-full text-white">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider border border-white/10">
                                            {readingArticle.category}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-xs font-medium opacity-90">
                                            <Clock size={12} /> {readingArticle.readTime}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl sm:text-4xl font-bold leading-tight shadow-sm">
                                        {readingArticle.title}
                                    </h2>
                                </div>
                            </div>

                            {/* Modal Content - Scrollable */}
                            <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
                                <div className="p-6 sm:p-10 max-w-none prose prose-lg prose-slate prose-headings:text-slate-800 prose-p:text-slate-600 prose-li:text-slate-600">
                                    <p className="lead text-xl text-slate-500 font-medium italic mb-8 border-l-4 border-indigo-500 pl-4 py-1">
                                        {readingArticle.summary}
                                    </p>

                                    <div className="space-y-6">
                                        {readingArticle.content.map((block, idx) => {
                                            if (block.type === 'h3') return (
                                                <h3 key={idx} className="flex items-center gap-3 text-xl sm:text-2xl font-bold text-slate-800 mt-8 mb-4">
                                                    <span className="w-8 h-1 rounded-full bg-indigo-500 inline-block"></span>
                                                    {block.text}
                                                </h3>
                                            );
                                            if (block.type === 'p') return <p key={idx} className="leading-relaxed">{block.text}</p>;
                                            if (block.type === 'ul') return (
                                                <ul key={idx} className="bg-indigo-50/50 rounded-2xl p-6 space-y-3 list-none">
                                                    {block.items.map((item, i) => (
                                                        <li key={i} className="flex gap-3 items-start">
                                                            <div className="mt-1.5 min-w-[6px] h-[6px] rounded-full bg-indigo-500" />
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            );
                                            return null;
                                        })}
                                    </div>
                                </div>

                                {/* Footer CTA */}
                                <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                                    <Button
                                        variant="primary"
                                        className="w-full py-4 text-base shadow-lg shadow-indigo-200"
                                        onClick={() => setReadingArticle(null)}
                                    >
                                        Đã hiểu & Đóng bài viết
                                    </Button>
                                    <p className="text-center text-xs text-slate-400 mt-4">
                                        Kiến thức này chỉ mang tính tham khảo. Nếu bạn gặp vấn đề nghiêm trọng, hãy tìm sự trợ giúp từ chuyên gia.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
