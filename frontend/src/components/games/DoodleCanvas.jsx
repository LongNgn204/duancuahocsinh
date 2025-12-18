// src/components/games/DoodleCanvas.jsx
// Chú thích: Doodle Canvas v2.0 - Zen Coloring & Free Draw
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import GlowOrbs from '../ui/GlowOrbs';
import {
    Paintbrush, Eraser, Download, Trash2, Undo, Palette, Image as ImageIcon, Circle
} from 'lucide-react';

// Emotion Color Palettes
const PALETTES = {
    standard: [
        '#000000', '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff'
    ],
    calm: [
        '#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e'
    ],
    nature: [
        '#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'
    ],
    warmth: [
        '#fff7ed', '#ffedd5', '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12'
    ]
};

const MANDALA_TEMPLATES = [
    {
        id: 'blank',
        name: 'Trang trắng',
        svg: null
    },
    {
        id: 'mandala1',
        name: 'Hoa Đời',
        svg: `
            <g opacity="0.1" stroke="#000" stroke-width="2" fill="none">
                <circle cx="300" cy="200" r="50" />
                <circle cx="300" cy="150" r="50" />
                <circle cx="300" cy="250" r="50" />
                <circle cx="250" cy="200" r="50" />
                <circle cx="350" cy="200" r="50" />
                <circle cx="265" cy="165" r="50" />
                <circle cx="335" cy="165" r="50" />
                <circle cx="265" cy="235" r="50" />
                <circle cx="335" cy="235" r="50" />
                <circle cx="300" cy="200" r="100" />
            </g>
        `
    },
    {
        id: 'mandala2',
        name: 'Sao Tĩnh Lặng',
        svg: `
           <g opacity="0.1" stroke="#000" stroke-width="2" fill="none">
                <circle cx="300" cy="200" r="20" />
                <circle cx="300" cy="200" r="80" />
                <path d="M300 120 L300 280 M220 200 L380 200" />
                <path d="M243 143 L357 257 M243 257 L357 143" />
                <rect x="250" y="150" width="100" height="100" transform="rotate(45 300 200)" />
           </g>
        `
    }
];

const SIZES = [2, 5, 10, 20, 40];

export default function DoodleCanvas() {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const containerRef = useRef(null);

    // State
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(5);
    const [currentPalette, setCurrentPalette] = useState('standard');
    const [template, setTemplate] = useState('blank');

    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [canvasSize, setCanvasSize] = useState({ width: 600, height: 400 });

    // Setup Canvas
    const initCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !containerRef.current) return;

        const container = containerRef.current;
        const width = container.offsetWidth;
        const height = 400; // Fixed height for consistency

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

        // Draw Template if any
        drawTemplate(context, template, width, height);

        // Reset history
        const initialData = canvas.toDataURL();
        setHistory([initialData]);
        setHistoryIndex(0);
    }, [template]);

    // Handle Template Drawing
    const drawTemplate = (ctx, templateId, w, h) => {
        if (templateId === 'blank') return;

        const tmpl = MANDALA_TEMPLATES.find(t => t.id === templateId);
        if (!tmpl) return;

        const img = new Image();
        const svgBlob = new Blob([`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">${tmpl.svg}</svg>`], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            // Draw centered
            ctx.drawImage(img, (w - 600) / 2, (h - 400) / 2);
            URL.revokeObjectURL(url);
            // Save state after template loaded
            const data = ctx.canvas.toDataURL();
            setHistory(prev => {
                const newH = prev.slice(0, 1);
                newH[0] = data;
                return newH;
            });
        };
        img.src = url;
    };

    // Init on mount & resize
    useEffect(() => {
        initCanvas();
        window.addEventListener('resize', initCanvas);
        return () => window.removeEventListener('resize', initCanvas);
    }, [initCanvas]);

    // Update settings
    useEffect(() => {
        if (contextRef.current) {
            contextRef.current.strokeStyle = color;
            contextRef.current.lineWidth = brushSize;
        }
    }, [color, brushSize]);

    // History Logic
    const saveToHistory = () => {
        if (!canvasRef.current) return;
        const data = canvasRef.current.toDataURL();
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(data);
        if (newHistory.length > 20) newHistory.shift();

        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const undo = () => {
        if (historyIndex <= 0) return;
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);

        const img = new Image();
        img.src = history[newIndex];
        img.onload = () => {
            contextRef.current.clearRect(0, 0, canvasSize.width, canvasSize.height);
            contextRef.current.drawImage(img, 0, 0);
        };
    };

    // Drawing Logic
    const getPos = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDraw = (e) => {
        const { x, y } = getPos(e);
        contextRef.current.beginPath();
        contextRef.current.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        if (e.cancelable) e.preventDefault(); // Prevent scroll on touch
        const { x, y } = getPos(e);
        contextRef.current.lineTo(x, y);
        contextRef.current.stroke();
    };

    const stopDraw = () => {
        if (isDrawing) {
            contextRef.current.closePath();
            setIsDrawing(false);
            saveToHistory();
        }
    };

    const clearCanvas = () => {
        const ctx = contextRef.current;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
        drawTemplate(ctx, template, canvasSize.width, canvasSize.height);
        saveToHistory();
    };

    const download = () => {
        const link = document.createElement('a');
        link.download = `zen-art-${Date.now()}.png`;
        link.href = canvasRef.current.toDataURL();
        link.click();
    };

    return (
        <div className="min-h-[70vh] relative pb-20 md:pb-0">
            <GlowOrbs className="opacity-30" />

            <div className="relative z-10 max-w-4xl mx-auto space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                        <Paintbrush className="w-8 h-8 text-[--brand]" />
                        <span className="gradient-text">Vẽ Thiền (Zen Art)</span>
                    </h1>
                    <div className="flex gap-2">
                        <div className="hidden md:flex gap-2">
                            {MANDALA_TEMPLATES.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setTemplate(t.id)}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${template === t.id ? 'bg-[--brand] text-white border-[--brand]' : 'border-[--surface-border] hover:bg-[--surface-hover]'}`}
                                >
                                    {t.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <Card size="sm" className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        {/* Palettes */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full md:w-auto">
                            <Palette size={18} className="text-[--muted] shrink-0" />
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                {Object.keys(PALETTES).map(k => (
                                    <button
                                        key={k}
                                        onClick={() => setCurrentPalette(k)}
                                        className={`px-2 py-1 rounded text-[10px] uppercase font-bold transition-all ${currentPalette === k ? 'bg-white shadow text-black' : 'text-gray-400'}`}
                                    >
                                        {k}
                                    </button>
                                ))}
                            </div>
                            <div className="w-px h-6 bg-gray-200 mx-2" />
                            {/* Current Colors */}
                            <div className="flex gap-1">
                                {PALETTES[currentPalette].map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setColor(c)}
                                        className={`w-6 h-6 rounded-full border border-black/5 transition-transform ${color === c ? 'scale-125 shadow-md ring-2 ring-primary ring-offset-1' : ''}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 ml-auto">
                            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 mr-2">
                                {SIZES.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setBrushSize(s)}
                                        className={`w-6 h-6 flex items-center justify-center rounded ${brushSize === s ? 'bg-white shadow' : ''}`}
                                    >
                                        <div className="rounded-full bg-black" style={{ width: Math.min(s, 14), height: Math.min(s, 14) }} />
                                    </button>
                                ))}
                            </div>
                            <Button variant="ghost" size="icon-sm" onClick={undo} disabled={historyIndex <= 0}>
                                <Undo size={18} />
                            </Button>
                            <Button variant="ghost" size="icon-sm" onClick={clearCanvas}>
                                <Trash2 size={18} />
                            </Button>
                            <Button variant="outline" size="sm" onClick={download} icon={<Download size={16} />}>
                                Lưu tranh
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Canvas Container */}
                <Card className="p-0 overflow-hidden bg-white/50 backdrop-blur-sm border-2 border-dashed border-[--surface-border]">
                    <div ref={containerRef} className="w-full">
                        <canvas
                            ref={canvasRef}
                            onMouseDown={startDraw}
                            onMouseMove={draw}
                            onMouseUp={stopDraw}
                            onMouseLeave={stopDraw}
                            onTouchStart={startDraw}
                            onTouchMove={draw}
                            onTouchEnd={stopDraw}
                            className="block touch-none cursor-crosshair mx-auto"
                            style={{ maxWidth: '100%' }}
                        />
                    </div>
                </Card>
            </div>
        </div>
    );
}
