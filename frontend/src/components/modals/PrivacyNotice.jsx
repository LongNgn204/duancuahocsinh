// src/components/modals/PrivacyNotice.jsx
// Chú thích: Modal thông báo quyền riêng tư - Modern với animation
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { Shield, Lock, Check } from 'lucide-react';

export default function PrivacyNotice({ open, onAccept }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm grid place-items-center z-[100] p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Thông báo quyền riêng tư"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="max-w-md w-full"
          >
            <Card
              variant="elevated"
              size="lg"
              className="relative overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(250,245,255,0.98) 100%)',
                boxShadow: '0 25px 80px -12px rgba(139, 92, 246, 0.35), 0 10px 30px -5px rgba(0,0,0,0.15)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Header decoration */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[--brand] via-[--secondary] to-[--accent]" />

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[--brand]/20 to-[--secondary]/20 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-[--brand]" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-center text-[--text] mb-4">
                Quyền riêng tư của bạn
              </h3>

              {/* Content */}
              <div className="space-y-3 text-[--text-secondary] text-sm leading-relaxed">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[--surface-border]/30">
                  <Lock className="w-5 h-5 text-[--brand] shrink-0 mt-0.5" />
                  <p>Ứng dụng lưu một số dữ liệu trên thiết bị của bạn (localStorage) để cải thiện trải nghiệm: lịch sử chat, cài đặt, v.v.</p>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[--surface-border]/30">
                  <Shield className="w-5 h-5 text-[--secondary] shrink-0 mt-0.5" />
                  <p>Chúng tôi không gửi dữ liệu cá nhân lên server nếu không có sự đồng ý. Khi bật AI, nội dung chat sẽ được gửi tới nhà cung cấp mô hình để xử lý.</p>
                </div>
              </div>

              {/* Agreement text */}
              <p className="text-xs text-[--muted] text-center mt-4">
                Bằng cách tiếp tục, bạn đồng ý với chính sách quyền riêng tư của chúng tôi.
              </p>

              {/* Actions */}
              <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
                <Button
                  variant="outline"
                  size="md"
                  onClick={(e) => e.preventDefault()}
                >
                  Xem chi tiết
                </Button>
                <Button
                  onClick={onAccept}
                  variant="primary"
                  size="md"
                  icon={<Check size={18} />}
                >
                  Tôi đồng ý
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
