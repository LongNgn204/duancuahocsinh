// src/pages/Forum.jsx
// Chú thích: Diễn đàn ẩn danh - Nơi chia sẻ tâm sự an toàn
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle, Heart, Clock, Tag, Plus, Send, ArrowLeft,
    Lock, AlertTriangle, Users, X, ChevronUp, Loader2, Flag, Search, Filter, TrendingUp
} from 'lucide-react';
import GlowOrbs from '../components/ui/GlowOrbs';
import {
    getForumPosts, getForumPost, createForumPost,
    addForumComment, upvoteForumPost, isLoggedIn,
    reportForumContent
} from '../utils/api';

// Tags phổ biến cho forum
const POPULAR_TAGS = [
    { id: 'tam_su', label: 'Tâm sự', emoji: '💭' },
    { id: 'hoc_tap', label: 'Học tập', emoji: '📚' },
    { id: 'gia_dinh', label: 'Gia đình', emoji: '🏠' },
    { id: 'tinh_cam', label: 'Tình cảm', emoji: '💕' },
    { id: 'ban_be', label: 'Bạn bè', emoji: '👫' },
    { id: 'cong_viec', label: 'Công việc', emoji: '💼' },
];

