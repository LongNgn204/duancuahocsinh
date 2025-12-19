// src/data/activities.js
// Danh sách hoạt động tự chăm sóc bản thân (Self-care)

import {
    Wind, Droplet, Cloud, Zap, Music, PenLine, BookOpen, Coffee,
    Phone, TreePine, Sparkles, Heart, Smile, Palette, Bike
} from 'lucide-react';

export const ACTIVITIES = [
    { id: 'breathing', icon: Wind, text: 'Tập thở 1 phút', link: '/peace-corner', color: 'bg-blue-100 text-blue-600' },
    { id: 'water', icon: Droplet, text: 'Uống ly nước ấm', color: 'bg-cyan-100 text-cyan-600' },
    { id: 'sky', icon: Cloud, text: 'Nhìn bầu trời xanh', link: '/peace-corner', color: 'bg-sky-100 text-sky-600' },
    { id: 'walk', icon: Zap, text: 'Đi dạo ngắn', color: 'bg-green-100 text-green-600' },
    { id: 'music', icon: Music, text: 'Nghe nhạc không lời', color: 'bg-purple-100 text-purple-600' },
    { id: 'write', icon: PenLine, text: 'Viết ra lo lắng', link: '/gratitude', color: 'bg-pink-100 text-pink-600' },
    { id: 'read', icon: BookOpen, text: 'Đọc 1 trang sách', link: '/stories', color: 'bg-amber-100 text-amber-600' },
    { id: 'nap', icon: Coffee, text: 'Chợp mắt 15 phút', color: 'bg-orange-100 text-orange-600' },
    { id: 'talk', icon: Phone, text: 'Gọi cho người thân', color: 'bg-rose-100 text-rose-600' },
    { id: 'nature', icon: TreePine, text: 'Chăm sóc cây cối', color: 'bg-emerald-100 text-emerald-600' },
    { id: 'clean', icon: Sparkles, text: 'Dọn bàn học', color: 'bg-teal-100 text-teal-600' },
    { id: 'grateful', icon: Heart, text: 'Viết nhật ký biết ơn', link: '/gratitude', color: 'bg-red-100 text-red-600' },
    // NEW ACTIVITIES
    { id: 'draw', icon: Palette, text: 'Vẽ tự do', link: '/games', color: 'bg-fuchsia-100 text-fuchsia-600' },
    { id: 'smile', icon: Smile, text: 'Cười trước gương', color: 'bg-yellow-100 text-yellow-600' },
    { id: 'exercise', icon: Bike, text: 'Vận động 5 phút', color: 'bg-indigo-100 text-indigo-600' },
];
