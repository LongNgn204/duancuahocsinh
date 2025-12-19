// src/pages/KnowledgeHub.jsx
// Góc Kiến Thức - Nơi chia sẻ kiến thức sức khỏe tinh thần

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, ChevronRight, BookOpen, ArrowLeft, X } from 'lucide-react';
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
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-[--muted]">
                    <Link to="/app" className="hover:text-[--brand] transition-colors">Trang chủ</Link>
                    <ChevronRight size={16} />
                    <span className="text-[--text]">Góc kiến thức</span>
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">
                        Góc <span className="text-[--brand]">Kiến Thức</span> 🧠
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Hiểu đúng để thương mình. Những bài viết ngắn giúp bạn chăm sóc sức khỏe tinh thần.
                    </p>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm bài viết..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[--brand] focus:ring-2 focus:ring-[--brand]/20 outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`
                                px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all
                                ${selectedCategory === cat
                                    ? 'bg-[--brand] text-white shadow-md'
                                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}
                            `}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article) => (
                    <motion.div
                        key={article.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -5 }}
                    >
                        <Card
                            className="h-full flex flex-col cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-[--brand]"
                            onClick={() => setReadingArticle(article)}
                        >
                            <div className="mb-4">
                                <div className={`w-12 h-12 rounded-xl ${article.color} flex items-center justify-center mb-4`}>
                                    <article.icon size={24} />
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-[--brand] bg-[--brand]/10 px-2 py-1 rounded-md">
                                        {article.category}
                                    </span>
                                    <span className="text-xs text-[--muted] flex items-center gap-1">
                                        <Clock size={12} /> {article.readTime}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2">
                                    {article.title}
                                </h3>
                                <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed">
                                    {article.summary}
                                </p>
                            </div>
                            <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-[--brand] font-medium text-sm">
                                <span>Đọc tiếp</span>
                                <ChevronRight size={16} />
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {filteredArticles.length === 0 && (
                <div className="text-center py-20 text-slate-400">
                    <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Không tìm thấy bài viết nào phù hợp.</p>
                </div>
            )}

            {/* Reading Modal */}
            <AnimatePresence>
                {readingArticle && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setReadingArticle(null)}
                    >
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className={`p-6 md:p-8 ${readingArticle.color.split(' ')[0]} bg-opacity-20 flex justify-between items-start relative overflow-hidden`}>
                                <div className="relative z-10 w-full">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold uppercase tracking-wider bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm">
                                                {readingArticle.category}
                                            </span>
                                            <span className="text-xs font-medium text-slate-600 flex items-center gap-1 bg-white/50 px-2 py-1 rounded-md">
                                                <Clock size={12} /> {readingArticle.readTime}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setReadingArticle(null)}
                                            className="p-2 bg-white/50 hover:bg-white rounded-full transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
                                        {readingArticle.title}
                                    </h2>
                                    <p className="text-slate-600 font-medium text-lg leading-relaxed">
                                        {readingArticle.summary}
                                    </p>
                                </div>
                                {/* Decor Icon */}
                                <readingArticle.icon className="absolute right-[-20px] bottom-[-20px] opacity-10 rotate-12" size={200} />
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                                <div className="space-y-6 text-slate-700 leading-relaxed text-lg">
                                    {readingArticle.content.map((block, idx) => {
                                        if (block.type === 'h3') return <h3 key={idx} className="text-xl font-bold text-slate-900 mt-6 first:mt-0">{block.text}</h3>;
                                        if (block.type === 'p') return <p key={idx}>{block.text}</p>;
                                        if (block.type === 'ul') return (
                                            <ul key={idx} className="list-disc pl-5 space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                {block.items.map((item, i) => <li key={i}>{item}</li>)}
                                            </ul>
                                        );
                                        return null;
                                    })}
                                </div>

                                <div className="mt-10 pt-6 border-t border-slate-100">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => setReadingArticle(null)}
                                    >
                                        Đóng bài viết
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
