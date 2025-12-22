import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Coffee, Star, X, Repeat } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

import { PEACE_CARDS as CARDS } from '../../data/peaceCards.jsx';

export default function PeaceCardDeck() {
    const [drawnCard, setDrawnCard] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const drawRandomCard = () => {
        setIsDrawing(true);
        setTimeout(() => {
            const random = CARDS[Math.floor(Math.random() * CARDS.length)];
            setDrawnCard(random);
            setIsDrawing(false);
        }, 1500); // Fake shuffle animation time
    };

    const reset = () => setDrawnCard(null);

    return (
        <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center p-4">
            <AnimatePresence mode="wait">
                {!drawnCard ? (
                    <motion.div
                        key="deck"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="text-center"
                    >
                        <h2 className="text-xl font-bold text-[--text] mb-6">Bộ Thẻ An Yên</h2>

                        {/* Deck Visual */}
                        <motion.button
                            onClick={drawRandomCard}
                            disabled={isDrawing}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative w-48 h-72 mx-auto perspective-1000 group cursor-pointer"
                        >
                            <div className={`
                                w-full h-full rounded-2xl bg-gradient-to-br from-[--brand] to-[--brand-light] 
                                shadow-xl flex items-center justify-center border-4 border-white
                                ${isDrawing ? 'animate-pulse' : ''}
                            `}>
                                <div className="text-white text-6xl opacity-80">🍃</div>
                                {isDrawing && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-xl">
                                        <div className="text-sm text-white font-medium bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                                            Đang rút...
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Stack effect */}
                            <div className="absolute top-2 left-2 w-full h-full rounded-2xl bg-[--brand] opacity-20 -z-10 group-hover:top-4 group-hover:left-4 transition-all" />
                            <div className="absolute top-4 left-4 w-full h-full rounded-2xl bg-[--brand] opacity-10 -z-20 group-hover:top-8 group-hover:left-8 transition-all" />
                        </motion.button>

                        <p className="mt-8 text-[--muted]">Chạm vào bộ bài để nhận thông điệp ngẫu nhiên</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="card"
                        initial={{ opacity: 0, rotateY: 90 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        exit={{ opacity: 0, rotateY: -90 }}
                        transition={{ duration: 0.5, type: 'spring' }}
                        className="relative w-full max-w-sm"
                    >
                        <Card className="p-8 text-center bg-white border-4 border-white shadow-2xl relative overflow-hidden">
                            {/* Card Decoration */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[--brand] to-transparent opacity-50" />

                            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${drawnCard.color}`}>
                                <drawnCard.icon size={32} />
                            </div>

                            <h3 className="text-xl font-bold text-[--text] mb-4 uppercase tracking-wider">{drawnCard.title}</h3>

                            <div className="py-6 px-4 bg-[--surface] rounded-xl mb-6">
                                <p className="text-lg font-medium text-[--text] leading-relaxed">
                                    "{drawnCard.content}"
                                </p>
                            </div>

                            <p className="text-[--text-secondary] italic mb-8">
                                👉 {drawnCard.action}
                            </p>

                            <div className="flex justify-center gap-3">
                                <Button onClick={reset} variant="ghost" icon={<X size={20} />}>
                                    Đóng
                                </Button>
                                <Button onClick={drawRandomCard} variant="primary" icon={<Repeat size={20} />}>
                                    Rút thẻ khác
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
