// src/components/games/DoodleCanvas.jsx
// Chú thích: Canvas vẽ tự do để thư giãn
import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eraser, Palette, Download, RotateCcw } from 'lucide-react';
import Card from '../ui/Card';

const COLORS = [
    '#ec4899', // Pink
    '#a855f7', // Purple
    '#3b82f6', // Blue
    '#22c55e', // Green
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#1a1a1a', // Black
];

const BRUSH_SIZES = [4, 8, 12, 20];

export default function DoodleCanvas() {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState(COLORS[0]);
    const [brushSize, setBrushSize] = useState(8);
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

        // Handle both mouse and touch events
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY,
        };
    };

    const startDrawing = (e) => {
        e.preventDefault();
        setIsDrawing(true);
        setLastPos(getPos(e));
    };

    const draw = (e) => {
        if (!isDrawing) return;
        e.preventDefault();

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
        link.download = 'doodle.png';
        link.href = canvas.toDataURL();
        link.click();
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold gradient-text mb-2">🎨 Vẽ Tự Do</h1>
                <p className="text-[--muted]">Thả lỏng tâm trí và vẽ bất cứ thứ gì bạn muốn!</p>
            </div>

            {/* Toolbar */}
            <Card className="p-4">
                <div className="flex flex-wrap items-center justify-center gap-4">
                    {/* Colors */}
                    <div className="flex items-center gap-2">
                        <Palette size={18} className="text-[--muted]" />
                        {COLORS.map((c) => (
                            <button
                                key={c}
                                onClick={() => setColor(c)}
                                className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-[--brand]' : ''
                                    }`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>

                    {/* Brush sizes */}
                    <div className="flex items-center gap-2">
                        {BRUSH_SIZES.map((size) => (
                            <button
                                key={size}
                                onClick={() => setBrushSize(size)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${brushSize === size ? 'bg-[--brand] text-white' : 'bg-[--surface-border]'
                                    }`}
                            >
                                <span className="rounded-full bg-current" style={{ width: size, height: size }} />
                            </button>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <motion.button
                            onClick={clearCanvas}
                            className="p-2 rounded-lg bg-[--surface-border] hover:bg-red-100 text-[--muted] hover:text-red-500 transition-colors"
                            whileTap={{ scale: 0.9 }}
                            title="Xóa tất cả"
                        >
                            <RotateCcw size={20} />
                        </motion.button>
                        <motion.button
                            onClick={downloadImage}
                            className="p-2 rounded-lg bg-[--surface-border] hover:bg-green-100 text-[--muted] hover:text-green-500 transition-colors"
                            whileTap={{ scale: 0.9 }}
                            title="Tải xuống"
                        >
                            <Download size={20} />
                        </motion.button>
                    </div>
                </div>
            </Card>

            {/* Canvas */}
            <Card className="p-2 overflow-hidden">
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={500}
                    className="w-full rounded-xl cursor-crosshair touch-none"
                    style={{ maxHeight: '60vh' }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
            </Card>
        </div>
    );
}
