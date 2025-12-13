// src/pages/TalkToAI.jsx
// Chú thích: Trang tâm sự với AI - Voice Chat với Gemini Live API
import VoiceChat from '../components/chat/VoiceChat';
import GlowOrbs from '../components/ui/GlowOrbs';
import { motion } from 'framer-motion';
import { Headphones } from 'lucide-react';

export default function TalkToAI() {
    return (
        <div className="min-h-[70vh] relative pb-20 md:pb-0">
            <GlowOrbs className="opacity-30" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                        <Headphones className="w-8 h-8 text-[--brand]" />
                        <span className="gradient-text">Tâm Sự Với AI</span>
                    </h1>
                    <p className="text-[--muted] text-sm mt-1">
                        Nói chuyện trực tiếp với AI qua giọng nói - Hoàn toàn bảo mật
                    </p>
                </motion.div>

                {/* Voice Chat Component */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <VoiceChat />
                </motion.div>
            </div>
        </div>
    );
}
