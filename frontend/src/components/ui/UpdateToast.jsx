// src/components/ui/UpdateToast.jsx
// Chú thích: Toast thông báo cập nhật hiển thị ở góc trái, tự ẩn sau vài giây
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Check, X, Trash2 } from 'lucide-react';

const APP_VERSION = '1.1.0';
const VERSION_KEY = 'app_version_v1';
const CACHE_CLEARED_KEY = 'cache_cleared_date';

export default function UpdateToast() {
    const [show, setShow] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState('info'); // info, success, warning
    const [isNewVersion, setIsNewVersion] = useState(false);

    // Check for updates on mount
    useEffect(() => {
        try {
            const savedVersion = localStorage.getItem(VERSION_KEY);

            if (!savedVersion) {
                // First time user
                localStorage.setItem(VERSION_KEY, APP_VERSION);
                showToast('Chào mừng bạn! 🎉', 'success');
            } else if (savedVersion !== APP_VERSION) {
                // New version detected
                setIsNewVersion(true);
                showToast(`Phiên bản mới ${APP_VERSION}! Nhấn để cập nhật.`, 'warning');
            }
        } catch (_) { }
    }, []);

    const showToast = useCallback((msg, toastType = 'info') => {
        setMessage(msg);
        setType(toastType);
        setShow(true);

        // Auto hide after 5 seconds (unless it's new version prompt)
        if (toastType !== 'warning') {
            setTimeout(() => setShow(false), 5000);
        }
    }, []);

    // Clear cache and update
    const handleUpdate = useCallback(async () => {
        try {
            // Clear all caches
            if ('caches' in window) {
                const keys = await caches.keys();
                await Promise.all(keys.map(key => caches.delete(key)));
            }

            // Update version
            localStorage.setItem(VERSION_KEY, APP_VERSION);
            localStorage.setItem(CACHE_CLEARED_KEY, new Date().toISOString());

            // Show success message
            setIsNewVersion(false);
            showToast('Đã cập nhật thành công! ✅', 'success');

            // Reload after a short delay
            setTimeout(() => {
                window.location.reload();
            }, 1500);

        } catch (error) {
            console.error('[UpdateToast] Clear cache error:', error);
            showToast('Không thể cập nhật. Vui lòng thử lại.', 'info');
        }
    }, [showToast]);

    const handleDismiss = useCallback(() => {
        setShow(false);
        if (isNewVersion) {
            // Mark as seen but don't update version
            localStorage.setItem(VERSION_KEY, APP_VERSION);
            setIsNewVersion(false);
        }
    }, [isNewVersion]);

    // Get background color based on type
    const getBgColor = () => {
        switch (type) {
            case 'success': return 'from-green-500 to-emerald-600';
            case 'warning': return 'from-amber-500 to-orange-600';
            default: return 'from-[--brand] to-[--secondary]';
        }
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, x: -100, y: 0 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed bottom-20 md:bottom-6 left-4 z-[200] max-w-xs"
                >
                    <div
                        className={`
              flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg
              bg-gradient-to-r ${getBgColor()} text-white
              backdrop-blur-sm cursor-pointer
            `}
                        onClick={isNewVersion ? handleUpdate : handleDismiss}
                    >
                        {/* Icon */}
                        <div className="shrink-0">
                            {type === 'success' ? (
                                <Check size={20} />
                            ) : type === 'warning' ? (
                                <RefreshCw size={20} className={isNewVersion ? 'animate-spin-slow' : ''} />
                            ) : (
                                <Trash2 size={20} />
                            )}
                        </div>

                        {/* Message */}
                        <span className="text-sm font-medium flex-1">{message}</span>

                        {/* Close button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDismiss();
                            }}
                            className="shrink-0 p-1 rounded-lg hover:bg-white/20 transition-colors"
                            aria-label="Đóng"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Progress bar for auto-hide */}
                    {type !== 'warning' && (
                        <motion.div
                            className="absolute bottom-0 left-0 h-1 bg-white/50 rounded-b-xl"
                            initial={{ width: '100%' }}
                            animate={{ width: '0%' }}
                            transition={{ duration: 5, ease: 'linear' }}
                        />
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Add custom animation to index.css
// .animate-spin-slow { animation: spin 2s linear infinite; }
