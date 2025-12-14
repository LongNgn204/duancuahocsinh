// src/pages/Dashboard.jsx
// Chú thích: Dashboard v4.0 - Real data sync từ backend
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bot, Heart, Sparkles, Gamepad2,
  TrendingUp, Calendar, Award, ChevronRight,
  Sun, Cloud, CloudRain, Zap, Meh, Star, Loader2
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import GlowOrbs, { GlowOrbsSmall } from '../components/ui/GlowOrbs';
import { isLoggedIn, getCurrentUser, getUserStats } from '../utils/api';

// Mood options với icons và colors
const moods = [
  { id: 'great', label: 'Tuyệt vời', emoji: '😊', icon: Sun, color: 'from-amber-400 to-orange-400' },
  { id: 'good', label: 'Tốt', emoji: '🙂', icon: Cloud, color: 'from-teal-400 to-cyan-400' },
  { id: 'okay', label: 'Bình thường', emoji: '😐', icon: Meh, color: 'from-blue-400 to-indigo-400' },
  { id: 'sad', label: 'Buồn', emoji: '😢', icon: CloudRain, color: 'from-purple-400 to-pink-400' },
  { id: 'stressed', label: 'Căng thẳng', emoji: '😤', icon: Zap, color: 'from-red-400 to-rose-400' },
];

// Quick actions
const quickActions = [
  {
    path: '/chat',
    label: 'Tâm sự với AI',
    icon: Bot,
    description: 'Chat văn bản hoặc nói chuyện với AI',
    color: 'from-teal-500 to-cyan-500',
    badge: 'HOT'
  },
  {
    path: '/breathing',
    label: 'Thở & Thư giãn',
    icon: Heart,
    description: 'Giảm stress trong 5 phút',
    color: 'from-pink-500 to-rose-500',
  },
  {
    path: '/gratitude',
    label: 'Lọ Biết Ơn',
    icon: Sparkles,
    description: 'Ghi lại điều tốt đẹp hôm nay',
    color: 'from-amber-500 to-orange-500',
  },
  {
    path: '/games',
    label: 'Giải trí',
    icon: Gamepad2,
    description: 'Thư giãn với mini games',
    color: 'from-purple-500 to-indigo-500',
  },
];

// Tips of the day
const tips = [
  'Hít thở sâu 3 lần khi cảm thấy căng thẳng.',
  'Viết ít nhất 1 điều biết ơn mỗi ngày.',
  'Nghỉ ngơi 5 phút sau mỗi 25 phút học.',
  'Chia sẻ với ai đó khi bạn cảm thấy buồn.',
];

export default function Dashboard() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [userName, setUserName] = useState('bạn');
  const [stats, setStats] = useState({ streak: 0, chatCount: 0, xp: 0, level: 1 });
  const [loading, setLoading] = useState(true);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  // Fetch real data từ backend khi component mount
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);

      // Check login status
      const loggedIn = isLoggedIn();
      setIsUserLoggedIn(loggedIn);

      if (loggedIn) {
        const user = getCurrentUser();
        if (user?.username) {
          setUserName(user.username);
        }

        try {
          // Fetch user stats từ backend
          const userStats = await getUserStats().catch(() => null);

          if (userStats) {
            setStats({
              streak: userStats.current_streak || 0,
              chatCount: userStats.breathing_count || 0, // Số lần thở
              xp: userStats.total_xp || 0,
              level: userStats.level || 1
            });
          }
        } catch (e) {
          console.error('Error loading user stats:', e);
        }
      } else {
        // Guest mode - load từ localStorage
        try {
          const localGratitude = JSON.parse(localStorage.getItem('gratitude_jar') || '[]');
          const localChats = JSON.parse(localStorage.getItem('chat_history') || '[]');
          setStats({
            streak: calculateStreak(localGratitude),
            chatCount: localChats.length,
            xp: 0,
            level: 1
          });
        } catch { }
      }

      setLoading(false);
    };

    loadUserData();
  }, []);

  // Helper: Tính streak từ gratitude entries
  const calculateStreak = (entries) => {
    if (!entries.length) return 0;
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < entries.length; i++) {
      const entryDate = new Date(entries[i].date || entries[i].created_at);
      entryDate.setHours(0, 0, 0, 0);
      const diff = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));
      if (diff === i) streak++;
      else break;
    }
    return streak;
  };

  // Lấy giờ hiện tại để chào
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  // Random tip
  const todayTip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-8">
      {/* ===== HERO WELCOME ===== */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <Card variant="highlight" size="lg" className="relative">
          <GlowOrbsSmall />

          <div className="relative z-10">
            {/* Greeting */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <Badge variant="primary" size="sm" className="mb-3">
                  <Calendar size={12} className="mr-1" />
                  {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </Badge>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                  {greeting}, <span className="gradient-text">{userName}</span>! 👋
                </h1>
                <p className="text-[--text-secondary] mt-2 max-w-md">
                  Hôm nay bạn cảm thấy thế nào? Hãy chọn tâm trạng của bạn bên dưới.
                </p>
              </div>

              {/* Stats preview */}
              <div className="hidden sm:flex items-center gap-3 md:gap-4">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[--brand]" />
                ) : (
                  <>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[--brand]">{stats.streak}</div>
                      <div className="text-xs text-[--muted]">Ngày streak</div>
                    </div>
                    <div className="w-px h-10 bg-[--surface-border]" />
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[--accent]">{stats.chatCount}</div>
                      <div className="text-xs text-[--muted]">Cuộc chat</div>
                    </div>
                    {isUserLoggedIn && (
                      <>
                        <div className="w-px h-10 bg-[--surface-border]" />
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[--secondary] flex items-center gap-1">
                            <Star size={16} />
                            {stats.xp}
                          </div>
                          <div className="text-xs text-[--muted]">XP (Lv.{stats.level})</div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Mood Selector */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
              {moods.map((mood) => (
                <motion.button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  className={`
                    relative p-4 rounded-2xl text-center
                    transition-all duration-200
                    ${selectedMood === mood.id
                      ? 'glass-strong scale-105 shadow-lg'
                      : 'glass hover:scale-102'
                    }
                  `}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {selectedMood === mood.id && (
                    <motion.div
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${mood.color} opacity-20`}
                      layoutId="mood-bg"
                    />
                  )}
                  <div className="text-3xl mb-2">{mood.emoji}</div>
                  <div className={`text-xs font-medium ${selectedMood === mood.id ? 'text-[--text]' : 'text-[--muted]'}`}>
                    {mood.label}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Mood response */}
            {selectedMood && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 pt-6 border-t border-[--surface-border]"
              >
                <p className="text-[--text-secondary] text-center">
                  {selectedMood === 'great' && '🎉 Tuyệt vời! Hãy chia sẻ niềm vui vào Lọ Biết Ơn nhé!'}
                  {selectedMood === 'good' && '😊 Thật tốt! Tiếp tục giữ năng lượng tích cực nha!'}
                  {selectedMood === 'okay' && '💙 Cũng được thôi. Có điều gì muốn chia sẻ không?'}
                  {selectedMood === 'sad' && '💜 Không sao đâu. Nếu muốn tâm sự, mình luôn ở đây.'}
                  {selectedMood === 'stressed' && '🧘 Thử hít thở sâu nhé! Vào Góc An Yên để thư giãn.'}
                </p>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.section>

      {/* ===== QUICK ACTIONS ===== */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Hành động nhanh</h2>
          <Link to="/settings" className="text-sm text-[--brand] hover:underline flex items-center gap-1">
            Xem tất cả <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => (
            <motion.div
              key={action.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
            >
              <Link to={action.path}>
                <Card variant="interactive" className="h-full group">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    {action.badge && (
                      <Badge variant="accent" size="sm">{action.badge}</Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-[--text] mb-1 group-hover:text-[--brand] transition-colors">
                    {action.label}
                  </h3>
                  <p className="text-sm text-[--muted]">{action.description}</p>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ===== STATS & TIPS ===== */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Today's tip */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[--accent]/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-[--accent]" />
              </div>
              <div>
                <h3 className="font-semibold">Mẹo hôm nay</h3>
                <p className="text-xs text-[--muted]">Wellbeing tip</p>
              </div>
            </div>
            <p className="text-[--text-secondary] leading-relaxed">{todayTip}</p>
          </Card>
        </motion.section>

        {/* Progress overview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[--brand]/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[--brand]" />
              </div>
              <div>
                <h3 className="font-semibold">Tiến độ tuần này</h3>
                <p className="text-xs text-[--muted]">Bạn đang làm rất tốt!</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Thở có ý thức', value: 5, max: 7, color: 'bg-pink-500' },
                { label: 'Lọ biết ơn', value: 6, max: 7, color: 'bg-amber-500' },
                { label: 'Chat với AI', value: 3, max: 7, color: 'bg-teal-500' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-[--text-secondary]">{item.label}</span>
                    <span className="text-[--muted]">{item.value}/{item.max} ngày</span>
                  </div>
                  <div className="h-2 bg-[--surface-border] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${(item.value / item.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.section>
      </div>

      {/* ===== ENCOURAGEMENT ===== */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card variant="gradient" size="lg" className="text-center">
          <div className="text-4xl mb-4">🌟</div>
          <h3 className="text-xl font-semibold mb-2">Bạn đang làm rất tốt!</h3>
          <p className="text-[--text-secondary] max-w-md mx-auto">
            Mỗi ngày là một cơ hội mới. Dù có chuyện gì xảy ra,
            hãy nhớ rằng Bạn Đồng Hành luôn ở đây bên bạn.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/chat">
              <Button variant="primary" icon={<Bot size={18} />}>
                Bắt đầu trò chuyện
              </Button>
            </Link>
          </div>
        </Card>
      </motion.section>
    </div>
  );
}
