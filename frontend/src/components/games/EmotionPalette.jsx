// src/components/games/EmotionPalette.jsx
// Chú thích: Bảng Màu Cảm Xúc - Vẽ và thể hiện cảm xúc qua màu sắc
import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, RotateCcw, Heart, ArrowLeft, Smile, Frown, Angry, Meh, Sparkles } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

// Chú thích: Các cảm xúc với màu sắc tương ứng
const EMOTIONS = [
    { id: 'happy', label: 'Vui vẻ', emoji: '😊', icon: Smile, colors: ['#FCD34D', '#F59E0B', '#FBBF24'], bgGradient: 'from-yellow-100 to-amber-100' },
    { id: 'calm', label: 'Bình yên', emoji: '😌', icon: Sparkles, colors: ['#93C5FD', '#60A5FA', '#3B82F6'], bgGradient: 'from-blue-100 to-sky-100' },
    { id: 'love', label: 'Yêu thương', emoji: '🥰', icon: Heart, colors: ['#FDA4AF', '#FB7185', '#E11D48'], bgGradient: 'from-pink-100 to-rose-100' },
    { id: 'sad', label: 'Buồn bã', emoji: '😢', icon: Frown, colors: ['#A5B4FC', '#818CF8', '#6366F1'], bgGradient: 'from-indigo-100 to-violet-100' },
    { id: 'angry', label: 'Tức giận', emoji: '😠', icon: Angry, colors: ['#FCA5A5', '#F87171', '#DC2626'], bgGradient: 'from-red-100 to-orange-100' },
    { id: 'neutral', label: 'Bình thường', emoji: '😐', icon: Meh, colors: ['#D1D5DB', '#9CA3AF', '#6B7280'], bgGradient: 'from-gray-100 to-slate-100' },
];

const BRUSH_SIZES = [4, 8, 12, 20, 32];

export default function EmotionPalette() {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [selectedEmotion, setSelectedEmotion] = useState(EMOTIONS[0]);
    const [color, setColor] = useState(EMOTIONS[0].colors[0]);
    const [brushSize, setBrushSize] = useState(12);
    const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, []);

    const getPos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY,
        };
    };

    const startDrawing = (e) => {
        setIsDrawing(true);
        setLastPos(getPos(e));
    };

    const draw = (e) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const currentPos = getPos(e);

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(lastPos.x, lastPos.y);
        ctx.lineTo(currentPos.x, currentPos.y);
        ctx.stroke();

        setLastPos(currentPos);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const downloadImage = () => {
        const canvas = canvasRef.current;
        const link = document.createElement('a');
        link.download = `cam-xuc-${selectedEmotion.id}.png`;
        link.href = canvas.toDataURL();
        link.click();
    };

    const handleEmotionChange = (emotion) => {
        setSelectedEmotion(emotion);
        setColor(emotion.colors[0]);
    };

    return (
        <div className="min-h-[70vh] relative px-2 sm:px-4">
            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <Link to="/games">
                        <Button
                            variant="ghost"
                            size="sm"
                            icon={<ArrowLeft size={16} />}
                            className="!p-2 sm:!px-3"
                        >
                            <span className="hidden sm:inline">Quay lại</span>
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-rose-600">
                            ❤️ Bảng Màu Cảm Xúc
                        </h1>
                        <p className="text-slate-500 text-xs hidden sm:block">
                            Chọn cảm xúc và thể hiện bằng màu sắc
                        </p>
                    </div>
                </div>

                {/* Emotion Selector */}
                <Card size="sm">
                    <p className="text-sm font-medium text-slate-700 mb-3">Bạn đang cảm thấy thế nào?</p>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {EMOTIONS.map((emotion) => (
                            <motion.button
                                key={emotion.id}
                                onClick={() => handleEmotionChange(emotion)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`
                                    p-3 rounded-xl border-2 transition-all text-center
                                    ${selectedEmotion.id === emotion.id
                                        ? `border-rose-400 bg-gradient-to-br ${emotion.bgGradient} shadow-md`
                                        : 'border-slate-200 hover:border-rose-200 bg-white'
                                    }
                                `}
                            >
                                <div className="text-2xl mb-1">{emotion.emoji}</div>
                                <div className="text-[10px] sm:text-xs font-medium text-slate-600">
                                    {emotion.label}
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </Card>

                {/* Toolbar */}
                <Card size="sm">
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        {/* Emotion Colors */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">Màu:</span>
                            {selectedEmotion.colors.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full transition-transform shadow-sm ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-rose-400' : ''
                                        }`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                            {/* Thêm một vài màu cơ bản */}
                            <div className="w-px h-6 bg-slate-200 mx-1" />
                            {['#1a1a1a', '#ffffff'].map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full transition-transform shadow-sm border border-slate-300 ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-rose-400' : ''
                                        }`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>

                        {/* Brush sizes */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">Cọ:</span>
                            {BRUSH_SIZES.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setBrushSize(size)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${brushSize === size ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500'
                                        }`}
                                >
                                    <span
                                        className="rounded-full bg-current"
                                        style={{ width: Math.min(size, 16), height: Math.min(size, 16) }}
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <motion.button
                                onClick={clearCanvas}
                                className="p-2 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-500 transition-colors"
                                whileTap={{ scale: 0.9 }}
                                title="Xóa tất cả"
                            >
                                <RotateCcw size={20} />
                            </motion.button>
                            <motion.button
                                onClick={downloadImage}
                                className="p-2 rounded-lg bg-slate-100 hover:bg-green-100 text-slate-500 hover:text-green-500 transition-colors"
                                whileTap={{ scale: 0.9 }}
                                title="Tải xuống"
                            >
                                <Download size={20} />
                            </motion.button>
                        </div>
                    </div>
                </Card>

                {/* Canvas */}
                <Card className="!p-2 overflow-hidden">
                    <canvas
                        ref={canvasRef}
                        width={800}
                        height={500}
                        className="w-full rounded-xl cursor-crosshair touch-none bg-white"
                        style={{ maxHeight: '50vh' }}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                    />
                </Card>

                {/* Tip */}
                <Card size="sm" className={`!bg-gradient-to-r ${selectedEmotion.bgGradient}`}>
                    <div className="flex items-center gap-3">
                        <div className="text-3xl">{selectedEmotion.emoji}</div>
                        <div>
                            <p className="font-medium text-slate-700">
                                Bạn đang thể hiện cảm xúc: <strong>{selectedEmotion.label}</strong>
                            </p>
                            <p className="text-xs text-slate-500">
                                Hãy vẽ bất cứ thứ gì bạn muốn để thể hiện cảm xúc này. Không có đúng sai!
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
