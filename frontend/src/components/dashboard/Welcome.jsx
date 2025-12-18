// src/components/dashboard/Welcome.jsx
// Chú thích: Welcome component v3.0 - Animated greeting, mood selector integrated
import { motion } from 'framer-motion';

export default function Welcome({ userName, greeting = 'Chào' }) {
  return (
    <motion.div
      className="text-center py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="inline-block text-5xl mb-4"
      >
        👋
      </motion.div>

      <h1 className="text-3xl md:text-4xl font-bold">
        {greeting}, <span className="gradient-text">{userName || 'bạn'}</span>!
      </h1>

      <p className="text-[--text-secondary] mt-3 max-w-md mx-auto">
        Hôm nay bạn cảm thấy thế nào? Hãy chọn tâm trạng hoặc
        bắt đầu trò chuyện với mình nhé. Quý bạn
      </p>
    </motion.div>
  );
}
