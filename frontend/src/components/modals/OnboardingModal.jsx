// src/components/modals/OnboardingModal.jsx
// Chú thích: Modal onboarding - Modern UI với animation
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import { Rocket, MessageCircle, Wind, Heart, CheckCircle } from 'lucide-react';

const FEATURES = [
  { icon: MessageCircle, text: 'Chat với AI - trò chuyện, gửi hình, dùng mic', color: 'from-pink-500 to-rose-500' },
  { icon: Wind, text: 'Thở thư giãn - nhiều pattern (4-7-8, box...)', color: 'from-blue-500 to-cyan-500' },
  { icon: Heart, text: 'Lọ biết ơn - ghi nhận điều tích cực mỗi ngày', color: 'from-purple-500 to-violet-500' },
];

export default function OnboardingModal({ open, onClose }) {
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
          aria-label="Bắt đầu sử dụng"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="max-w-lg w-full"
          >
            <div
              className="rounded-2xl overflow-hidden shadow-2xl"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(250,245,255,0.98) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
              }}
            >
              {/* Header decoration */}
              <div className="h-2 bg-gradient-to-r from-[--brand] via-[--secondary] to-[--accent]" />

              <div className="p-6">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[--brand] to-[--secondary] flex items-center justify-center shadow-lg">
                    <Rocket className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-center text-[--text] mb-2">
                  Chào mừng bạn! 👋
                </h3>
                <p className="text-center text-[--muted] text-sm mb-6">
                  Đây là "Bạn Đồng Hành" – nơi bạn có thể tâm sự an toàn
                </p>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {FEATURES.map((f, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[--surface-border]/30"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.1 }}
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-md`}>
                        <f.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm text-[--text] flex-1">{f.text}</span>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </motion.div>
                  ))}
                </div>

                {/* Actions */}
                <Button
                  onClick={onClose}
                  variant="primary"
                  size="lg"
                  className="w-full"
                  icon={<Rocket size={18} />}
                >
                  Bắt đầu khám phá
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
