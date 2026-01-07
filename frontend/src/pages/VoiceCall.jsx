// src/pages/VoiceCall.jsx
// Full-screen Voice Call page with OpenAI ChatGPT

import { motion } from 'framer-motion';
import { ArrowLeft, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import VoiceCallBot from '../components/voice/VoiceCallBot';

export default function VoiceCall() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-100">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link
                        to="/app"
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Quay lại</span>
                    </Link>

                    <div className="flex items-center gap-2 text-indigo-600">
                        <Phone size={20} />
                        <span className="font-bold">Gọi điện AI</span>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="pt-24 pb-8 px-4">
                <div className="max-w-md mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
                    >
                        <VoiceCallBot />
                    </motion.div>

                    {/* Info */}
                    <div className="mt-8 text-center text-sm text-slate-500 space-y-2">
                        <p>🎙️ Trò chuyện bằng giọng nói với AI</p>
                        <p className="text-xs text-slate-400">Sử dụng OpenAI ChatGPT (gpt-4o-mini)</p>
                        <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
                            <p className="text-amber-700 text-xs">
                                💡 <strong>Mẹo:</strong> Sử dụng ở nơi yên tĩnh để AI nghe rõ hơn
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
