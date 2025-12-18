// src/components/modals/OnboardingModal.jsx
// Chú thích: Modal onboarding - Modern UI với animation - Tối ưu cho desktop, to rõ ràng
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import { Rocket, Bot, Wind, Heart, CheckCircle, Gamepad2, Trophy } from 'lucide-react';

const FEATURES = [
  { icon: Bot, text: 'Tâm sự với AI - chat văn bản hoặc nói chuyện bằng giọng nói', color: 'from-pink-500 to-rose-500' },
  { icon: Wind, text: 'Thở thư giãn - nhiều kiểu thở (4-7-8, hộp vuông...)', color: 'from-blue-500 to-cyan-500' },
  { icon: Heart, text: 'Lọ biết ơn - ghi nhận điều tích cực mỗi ngày', color: 'from-purple-500 to-violet-500' },
  { icon: CheckCircle, text: 'Nhật ký cảm xúc - theo dõi tâm trạng và phân tích cảm xúc', color: 'from-green-500 to-emerald-500' },
  { icon: Gamepad2, text: 'Trò chơi thư giãn - giảm stress với trò chơi nhỏ', color: 'from-orange-500 to-amber-500' },
  { icon: Trophy, text: 'Hành trình & Thành tích - điểm XP, cấp độ, huy hiệu', color: 'from-indigo-500 to-purple-500' },
];

export default function OnboardingModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm grid place-items-center z-[100] p-4 md:p-8"
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
            className="max-w-lg md:max-w-2xl lg:max-w-3xl w-full"
          >
            <div
              className="rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(250,245,255,0.98) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
              }}
            >
              {/* Header decoration */}
              <div className="h-2 md:h-3 bg-gradient-to-r from-[--brand] via-[--secondary] to-[--accent] flex-shrink-0" />

              <div className="p-6 md:p-10 lg:p-12 overflow-y-auto flex-1">
                {/* Icon */}
                <div className="flex justify-center mb-5 md:mb-8">
                  <div className="w-16 h-16 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-2xl md:rounded-3xl bg-gradient-to-br from-[--brand] to-[--secondary] flex items-center justify-center shadow-lg md:shadow-xl">
                    <Rocket className="w-8 h-8 md:w-12 md:h-12 lg:w-14 lg:h-14 text-white" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl md:text-3xl lg:text-4xl font-bold text-center text-[--text] mb-2 md:mb-4">
                  Chào mừng bạn! 👋
                </h3>
                <p className="text-center text-[--muted] text-sm md:text-lg lg:text-xl mb-6 md:mb-10">
                  Đây là "Bạn Đồng Hành" – nơi bạn có thể tâm sự an toàn
                </p>

                {/* Features */}
                <div className="space-y-3 md:space-y-4 lg:space-y-5 mb-6 md:mb-10">
                  {FEATURES.map((f, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-3 md:gap-5 p-3 md:p-5 lg:p-6 rounded-xl md:rounded-2xl bg-[--surface-border]/30 hover:bg-[--surface-border]/50 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.1 }}
                    >
                      <div className={`w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-md md:shadow-lg flex-shrink-0`}>
                        <f.icon className="w-5 h-5 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white" />
                      </div>
                      <span className="text-sm md:text-base lg:text-lg text-[--text] flex-1 font-medium">{f.text}</span>
                      <CheckCircle className="w-5 h-5 md:w-7 md:h-7 lg:w-8 lg:h-8 text-green-500 flex-shrink-0" />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Actions - Fixed at bottom, outside scroll area */}
              <div className="p-6 md:p-10 lg:p-12 pt-4 md:pt-6 flex-shrink-0 border-t border-[--surface-border]">
                <Button
                  onClick={onClose}
                  variant="primary"
                  size="lg"
                  className="w-full text-base md:text-lg lg:text-xl py-4 md:py-5 lg:py-6"
                  icon={<Rocket size={20} className="md:w-6 md:h-6 lg:w-7 lg:h-7" />}
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
