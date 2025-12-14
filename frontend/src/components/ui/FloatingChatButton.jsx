// src/components/ui/FloatingChatButton.jsx
// Chú thích: Floating AI Chat Button - hiển thị trên tất cả các trang (trừ Chat page)
// để người dùng có thể nhanh chóng truy cập AI chat từ bất kỳ đâu
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function FloatingChatButton() {
    const location = useLocation();
    const [isExpanded, setIsExpanded] = useState(false);

    // Ẩn button trên trang Chat
    if (location.pathname === '/chat') return null;

    return (
        <>
            {/* Backdrop when expanded */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsExpanded(false)}
                    />
                )}
            </AnimatePresence>

            {/* Floating button container */}
            <div className="fixed bottom-28 right-4 z-50 md:bottom-24 md:right-6">
                <AnimatePresence mode="wait">
                    {isExpanded ? (
                        // Expanded menu
                        <motion.div
                            key="expanded"
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            className="flex flex-col gap-3 items-end"
                        >
                            {/* Quick chat option */}
                            <Link
                                to="/chat"
                                onClick={() => setIsExpanded(false)}
                                className="flex items-center gap-3 group"
                            >
                                <motion.span
                                    className="px-3 py-2 rounded-xl glass-strong text-sm font-medium text-[--text] shadow-lg"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    Tâm sự với AI
                                </motion.span>
                                <motion.div
                                    className="w-12 h-12 rounded-full bg-gradient-to-br from-[--brand] to-[--brand-light] flex items-center justify-center shadow-lg shadow-[--brand]/20 group-hover:shadow-xl group-hover:scale-105 transition-all"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.05, type: 'spring' }}
                                >
                                    <Bot size={22} className="text-white" />
                                </motion.div>
                            </Link>

                            {/* Ask anything option */}
                            <Link
                                to="/chat"
                                onClick={() => setIsExpanded(false)}
                                className="flex items-center gap-3 group"
                            >
                                <motion.span
                                    className="px-3 py-2 rounded-xl glass-strong text-sm font-medium text-[--text] shadow-lg"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15 }}
                                >
                                    Hỏi bất cứ điều gì
                                </motion.span>
                                <motion.div
                                    className="w-12 h-12 rounded-full bg-gradient-to-br from-[--secondary] to-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-xl group-hover:scale-105 transition-all"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.1, type: 'spring' }}
                                >
                                    <Sparkles size={22} className="text-white" />
                                </motion.div>
                            </Link>

                            {/* Close button */}
                            <motion.button
                                onClick={() => setIsExpanded(false)}
                                className="w-14 h-14 rounded-full bg-[--surface] border border-[--surface-border] flex items-center justify-center shadow-lg hover:bg-[--surface-elevated] transition-colors"
                                initial={{ scale: 0, rotate: -90 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.2, type: 'spring' }}
                            >
                                <X size={24} className="text-[--muted]" />
                            </motion.button>
                        </motion.div>
                    ) : (
                        // Collapsed button
                        <motion.button
                            key="collapsed"
                            onClick={() => setIsExpanded(true)}
                            className="relative group"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {/* Pulse effect */}
                            <motion.div
                                className="absolute inset-0 rounded-full bg-[--brand]"
                                animate={{
                                    scale: [1, 1.3, 1],
                                    opacity: [0.4, 0, 0.4]
                                }}
                                transition={{
                                    duration: 2.5,
                                    repeat: Infinity,
                                    ease: 'easeInOut'
                                }}
                            />

                            {/* Button */}
                            <div className="relative w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-xl shadow-[--brand]/20 group-hover:shadow-2xl transition-shadow overflow-hidden border-2 border-[--brand]/20">
                                {/* AI Avatar */}
                                <img
                                    src="/ai-avatar.png"
                                    alt="Chat với AI"
                                    className="w-full h-full object-cover"
                                />

                                {/* Notification dot */}
                                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[--brand] border-2 border-white flex items-center justify-center">
                                    <span className="text-[8px] font-bold text-white">AI</span>
                                </div>
                            </div>
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
