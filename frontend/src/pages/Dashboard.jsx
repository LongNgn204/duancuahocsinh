// src/pages/Dashboard.jsx
// Chú thích: Dashboard v4.0 - Emotional Weather, Smart Recommendations & Insights
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, Heart, Sparkles, Gamepad2,
  TrendingUp, Calendar, Award, ChevronRight,
  Sun, Cloud, CloudRain, Zap, Meh, Umbrella
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { GlowOrbsSmall } from '../components/ui/GlowOrbs';

// MOOD CONFIGURATION
const MOODS = [
  {
    id: 'great',
    label: 'Tuyệt vời',
    emoji: '☀️',
    icon: Sun,
    color: 'from-amber-400 to-orange-400',
    weather: 'sunny',
    recommendation: {
      text: 'Năng lượng tuyệt vời! Hãy lan toả nó.',
      action: { label: 'Ghi lại khoảnh khắc', link: '/gratitude', icon: Sparkles }
    }
  },
  {
    id: 'good',
    label: 'Tốt',
    emoji: '☁️',
    icon: Cloud,
    color: 'from-teal-400 to-cyan-400',
    weather: 'cloudy',
    recommendation: {
      text: 'Một ngày êm đềm. Duy trì sự cân bằng nhé.',
      action: { label: 'Tập thở Resonance', link: '/breathing', icon: Heart }
    }
  },
  {
    id: 'okay',
    label: 'Bình thường',
    emoji: '😐',
    icon: Meh,
    color: 'from-blue-400 to-indigo-400',
    weather: 'overcast',
    recommendation: {
      text: 'Mọi thứ vẫn ổn. Một chút sáng tạo sẽ thú vị hơn.',
      action: { label: 'Vẽ tự do', link: '/games', icon: Gamepad2 }
    }
  },
  {
    id: 'sad',
    label: 'Buồn',
    emoji: '🌧️',
    icon: CloudRain,
    color: 'from-purple-400 to-pink-400',
    weather: 'rainy',
    recommendation: {
      text: 'Không sao đâu. Hãy để nỗi buồn trôi đi.',
      action: { label: 'Tâm sự với AI', link: '/chat', icon: MessageCircle }
    }
  },
  {
    id: 'stressed',
    label: 'Căng thẳng',
    emoji: '⛈️',
    icon: Zap,
    color: 'from-red-400 to-rose-400',
    weather: 'stormy',
    recommendation: {
      text: 'Hít thở sâu nào. Bạn cần giải tỏa ngay.',
      action: { label: 'Xả Stress (Bubble Pop)', link: '/games', icon: Zap }
    }
  },
];

// INSIGHTS MOCK DATA
const INSIGHTS = [
  { text: "Bạn ngủ ngon hơn 20% vào những ngày tập Nghỉ Ngơi Sâu (4-7-8).", type: "positive" },
  { text: "Dữ liệu cho thấy viết Lọ Biết Ơn giúp cải thiện tâm trạng vào ngày hôm sau.", type: "positive" },
  { text: "Bạn thường cảm thấy căng thẳng vào Thứ 2. Hãy thử thiền 5 phút trước giờ học.", type: "neutral" }
];

// QUICK ACTIONS STATIC
const QUICK_ACTIONS = [
  { path: '/chat', label: 'Tâm sự AI', icon: MessageCircle, color: 'from-teal-500 to-cyan-500', desc: 'Người bạn lắng nghe' },
  { path: '/breathing', label: 'Tập thở', icon: Heart, color: 'from-pink-500 to-rose-500', desc: 'Thư giãn tức thì' },
  { path: '/gratitude', label: 'Biết ơn', icon: Sparkles, color: 'from-amber-500 to-orange-500', desc: 'Vườn tâm trí' },
  { path: '/games', label: 'Giải trí', icon: Gamepad2, color: 'from-purple-500 to-indigo-500', desc: 'Xả stress & Zen' },
];

export default function Dashboard() {
  const [selectedMoodId, setSelectedMoodId] = useState(null);
  const [showRecommendation, setShowRecommendation] = useState(false);

  const userName = 'Bạn Hiền';
  const currentMood = useMemo(() => MOODS.find(m => m.id === selectedMoodId), [selectedMoodId]);

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  const handleMoodSelect = (id) => {
    setSelectedMoodId(id);
    setShowRecommendation(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* ===== EMOTIONAL WEATHER HEADER ===== */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl"
      >
        <Card variant="highlight" size="lg" className="relative border-0 shadow-2xl overflow-hidden min-h-[300px] flex flex-col justify-center transition-all duration-700">
          {/* Dynamic Background based on Weather */}
          <div className={`absolute inset-0 transition-all duration-1000 bg-gradient-to-br ${currentMood ? currentMood.color : 'from-blue-500/10 to-purple-500/10'}`} />

          {/* Weather Effects Layer (CSS Animation placeholders) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {currentMood?.weather === 'sunny' && <div className="absolute top-[-50px] right-[-50px] text-[200px] opacity-20 animate-spin-slow">☀️</div>}
            {currentMood?.weather === 'rainy' && (
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-rain"></div>
            )}
            {currentMood?.weather === 'stormy' && <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />}
          </div>

          <div className="relative z-10 p-4 md:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Welcome Text */}
              <div className="text-center md:text-left flex-1">
                <Badge variant="primary" size="sm" className="mb-4 inline-flex">
                  <Calendar size={12} className="mr-1" />
                  {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </Badge>
                <h1 className="text-3xl md:text-5xl font-bold mb-4">
                  {greeting}, <span className="gradient-text bg-white/80 backdrop-blur-sm rounded px-2">{userName}</span>
                </h1>
                <p className="text-lg text-[--text-secondary] opacity-90 max-w-lg">
                  {selectedMoodId
                    ? (<span>Dự báo cảm xúc hôm nay: <span className="font-bold">{currentMood?.label}</span> {currentMood?.emoji}</span>)
                    : "Hôm nay 'thời tiết' trong lòng bạn thế nào?"
                  }
                </p>
              </div>

              {/* Mood Selector Grid */}
              <div className="bg-white/40 backdrop-blur-xl p-4 rounded-3xl border border-white/30 shadow-xl">
                <div className="flex gap-2 md:gap-4">
                  {MOODS.map((mood) => {
                    const isSelected = selectedMoodId === mood.id;
                    return (
                      <button
                        key={mood.id}
                        onClick={() => handleMoodSelect(mood.id)}
                        className={`
                                            flex flex-col items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl transition-all duration-300
                                            ${isSelected ? 'bg-white shadow-lg scale-110 ring-2 ring-[--brand]' : 'bg-white/30 hover:bg-white/60 hover:scale-105'}
                                        `}
                        title={mood.label}
                      >
                        <span className="text-2xl md:text-3xl filter drop-shadow-sm">{mood.emoji}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* SMART RECOMMENDATION */}
            <AnimatePresence>
              {showRecommendation && currentMood && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: 20 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-8 bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/50 max-w-2xl mx-auto md:mx-0"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${currentMood.color} text-white shadow-md`}>
                      <Umbrella size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-[--text]">Gợi ý dành cho bạn</h3>
                      <p className="text-[--text] mb-3">{currentMood.recommendation.text}</p>
                      <Link to={currentMood.recommendation.action.link}>
                        <Button size="sm" icon={<ChevronRight size={16} />}>
                          {currentMood.recommendation.action.label}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </motion.section>

      {/* ===== UP NEXT / INSIGHTS ===== */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Statistic Card (Mock) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-2">
          <Card className="h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-[--brand]" />
                <h3 className="font-bold text-lg">Thấu hiểu bản thân</h3>
              </div>
              <Badge variant="accent">Beta</Badge>
            </div>
            <div className="space-y-4">
              {INSIGHTS.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-[--surface-hover] border border-[--surface-border]">
                  <div className="mt-1">
                    {insight.type === 'positive' ? '💡' : '📈'}
                  </div>
                  <p className="text-sm text-[--text]">{insight.text}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Today's Streak */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card variant="gradient" className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-4 text-4xl shadow-inner">
              🔥
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">12</h3>
            <p className="text-white/80 text-sm mb-4">Ngày liên tiếp</p>
            <Badge className="bg-white/20 text-white border-0">Giữ vững phong độ!</Badge>
          </Card>
        </motion.div>
      </div>

      {/* ===== QUICK ACCESS ===== */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Zap className="text-[--accent]" size={20} /> Truy cập nhanh
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((action, idx) => (
            <Link key={action.path} to={action.path}>
              <Card variant="interactive" className="h-full hover:border-[--brand]/30 group transition-all">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                  <action.icon size={20} />
                </div>
                <h3 className="font-bold text-[--text] mb-1">{action.label}</h3>
                <p className="text-xs text-[--muted]">{action.desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
