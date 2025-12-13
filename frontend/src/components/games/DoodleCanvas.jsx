// src/components/games/DoodleCanvas.jsx
// Chú thích: Doodle Canvas v1.0 - Vẽ tự do để thư giãn
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import GlowOrbs from '../ui/GlowOrbs';
import {
    Paintbrush, Eraser, Download, Trash2, Undo, Palette
} from 'lucide-react';

// Color palette
const COLORS = [
    '#000000', // Black
    '#ef4444', // Red
    '#f97316', // Orange
    '#eab308', // Yellow
    '#22c55e', // Green
    '#14b8a6', // Teal
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#ffffff', // White (eraser-like on colored bg)
];

// Brush sizes
const SIZES = [2, 5, 10, 20, 40];

export default function DoodleCanvas() {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(5);
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [canvasSize, setCanvasSize] = useState({ width: 600, height: 400 });

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Set canvas size based on container
        const container = canvas.parentElement;
        const width = Math.min(container.offsetWidth - 32, 800);
        const height = Math.min(window.innerHeight - 300, 500);

        setCanvasSize({ width, height });
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.strokeStyle = color;
        context.lineWidth = brushSize;
        contextRef.current = context;

        // White background
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, width, height);

        // Save initial state
        saveToHistory();
    }, []);

    // Update brush
    useEffect(() => {
        if (contextRef.current) {
            contextRef.current.strokeStyle = color;
            contextRef.current.lineWidth = brushSize;
        }
    }, [color, brushSize]);

    // Save to history
    const saveToHistory = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const imageData = canvas.toDataURL();
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(imageData);

        // Limit history to 20 states
        if (newHistory.length > 20) newHistory.shift();

        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex]);

    // Get position
    const getPosition = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        if (e.touches) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top,
            };
        }
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    // Start drawing
    const startDrawing = (e) => {
        const { x, y } = getPosition(e);
        contextRef.current.beginPath();
        contextRef.current.moveTo(x, y);
        setIsDrawing(true);
    };

    // Draw
    const draw = (e) => {
        if (!isDrawing) return;
        e.preventDefault();

        const { x, y } = getPosition(e);
        contextRef.current.lineTo(x, y);
        contextRef.current.stroke();
    };

    // Stop drawing
    const stopDrawing = () => {
        if (isDrawing) {
            contextRef.current.closePath();
            setIsDrawing(false);
            saveToHistory();
        }
    };

    // Undo
    const undo = () => {
        if (historyIndex <= 0) return;

        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);

        const img = new Image();
        img.src = history[newIndex];
        img.onload = () => {
            const context = contextRef.current;
            context.clearRect(0, 0, canvasSize.width, canvasSize.height);
            context.drawImage(img, 0, 0);
        };
    };

    // Clear
    const clear = () => {
        const context = contextRef.current;
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvasSize.width, canvasSize.height);
        saveToHistory();
    };

    // Download
    const download = () => {
        const canvas = canvasRef.current;
        const link = document.createElement('a');
        link.download = `doodle-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    };

    return (
        <div className="min-h-[70vh] relative pb-20 md:pb-0">
            <GlowOrbs className="opacity-30" />

            <div className="relative z-10 max-w-4xl mx-auto space-y-4">
                {/* Header */}
                <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                            <Paintbrush className="w-8 h-8 text-[--brand]" />
                            <span className="gradient-text">Vẽ Tự Do</span>
                        </h1>
                        <p className="text-[--muted] text-sm mt-1">Vẽ tự do để thư giãn</p>
                    </div>
                </motion.div>

                {/* Toolbar */}
                <Card size="sm">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Colors */}
                        <div className="flex items-center gap-1">
                            <Palette size={18} className="text-[--muted] mr-1" />
                            {COLORS.map(c => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={`
                    w-7 h-7 rounded-full transition-transform
                    ${color === c ? 'ring-2 ring-[--brand] ring-offset-2 scale-110' : ''}
                  `}
                                    style={{
                                        backgroundColor: c,
                                        border: c === '#ffffff' ? '1px solid #ccc' : 'none'
                                    }}
                                />
                            ))}
                        </div>

                        {/* Brush size */}
                        <div className="flex items-center gap-1">
                            <Paintbrush size={18} className="text-[--muted] mr-1" />
                            {SIZES.map(s => (
                                <button
                                    key={s}
                                    onClick={() => setBrushSize(s)}
                                    className={`
                    w-8 h-8 rounded-lg flex items-center justify-center glass
                    ${brushSize === s ? 'ring-2 ring-[--brand]' : ''}
                  `}
                                >
                                    <div
                                        className="rounded-full bg-current"
                                        style={{
                                            width: Math.min(s, 16),
                                            height: Math.min(s, 16),
                                            backgroundColor: color
                                        }}
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon-sm" onClick={undo} disabled={historyIndex <= 0}>
                                <Undo size={18} />
                            </Button>
                            <Button variant="ghost" size="icon-sm" onClick={clear}>
                                <Trash2 size={18} />
                            </Button>
                            <Button variant="outline" size="sm" onClick={download} icon={<Download size={16} />}>
                                Tải xuống
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Canvas */}
                <Card className="overflow-hidden p-4">
                    <canvas
                        ref={canvasRef}
                        width={canvasSize.width}
                        height={canvasSize.height}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="rounded-xl cursor-crosshair touch-none w-full"
                        style={{
                            backgroundColor: '#fff',
                            maxWidth: '100%',
                            height: 'auto',
                            aspectRatio: `${canvasSize.width} / ${canvasSize.height}`
                        }}
                    />
                </Card>

                {/* Tips */}
                <Card size="sm">
                    <div className="flex items-start gap-3">
                        <Paintbrush size={18} className="text-[--accent] shrink-0 mt-0.5" />
                        <div className="text-sm text-[--text-secondary]">
                            <strong className="text-[--text]">Mẹo:</strong> Vẽ tự do giúp giảm căng thẳng và
                            thể hiện cảm xúc. Không cần vẽ đẹp, hãy cứ thoải mái sáng tạo!
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
