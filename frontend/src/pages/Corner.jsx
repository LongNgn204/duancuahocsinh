// src/pages/Corner.jsx
// Chú thích: Góc Nhỏ - Thông báo và nhắc việc cho các hoạt động
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import GlowOrbs from '../components/ui/GlowOrbs';
import { Bell, Clock, Plus, X, CheckCircle2, Settings, Calendar, Heart, BookOpen, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'corner_activities_v1';
const REMINDERS_KEY = 'corner_reminders_v1';

// Các hoạt động mặc định - Theo yêu cầu KH
const DEFAULT_ACTIVITIES = [
  { id: 'gratitude', label: 'Viết Lọ Biết Ơn', icon: Heart, color: 'from-pink-400 to-rose-400', path: '/gratitude' },
  { id: 'breathing', label: 'Bài tập thở', icon: Sparkles, color: 'from-blue-400 to-cyan-400', path: '/breathing' },
  { id: 'wellness', label: 'Liều thuốc tinh thần', icon: Heart, color: 'from-purple-400 to-indigo-400', path: '/wellness' },
  { id: 'stories', label: 'Kể chuyện', icon: BookOpen, color: 'from-amber-400 to-orange-400', path: '/stories' },
];

// Templates nhắc nhở phổ biến cho học sinh
const REMINDER_TEMPLATES = [
  { activity: '💧 Uống nước', time: '09:00', description: 'Mỗi 2 giờ uống 1 cốc' },
  { activity: '👀 Nghỉ mắt 20-20-20', time: '10:00', description: 'Nhìn xa 20m trong 20 giây' },
  { activity: '🧘 Thở sâu 5 lần', time: '11:00', description: 'Giảm stress giữa giờ' },
  { activity: '🍎 Ăn trưa đúng giờ', time: '12:00', description: 'Không bỏ bữa nhé' },
  { activity: '📚 Ôn bài 15 phút', time: '18:00', description: 'Ôn lại bài học trong ngày' },
  { activity: '🙏 Viết Lọ Biết Ơn', time: '20:00', description: 'Przed khi đi ngủ' },
  { activity: '😴 Chuẩn bị đi ngủ', time: '21:30', description: 'Ngủ đủ 8 tiếng' },
  { activity: '📵 Bỏ điện thoại', time: '22:00', description: 'Đọc sách thay vì lướt' },
];

export default function Corner() {
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [reminders, setReminders] = useState([]);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newReminder, setNewReminder] = useState({ time: '', activity: '', enabled: true });

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setActivities(parsed.length > 0 ? parsed : DEFAULT_ACTIVITIES);
      }
    } catch (_) { }

    try {
      const saved = localStorage.getItem(REMINDERS_KEY);
      if (saved) {
        setReminders(JSON.parse(saved));
      }
    } catch (_) { }
  }, []);

  // Save to localStorage
  const saveActivities = (newActivities) => {
    setActivities(newActivities);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newActivities));
    } catch (_) { }
  };

  const saveReminders = (newReminders) => {
    setReminders(newReminders);
    try {
      localStorage.setItem(REMINDERS_KEY, JSON.stringify(newReminders));
    } catch (_) { }
  };

  // Get pending activities (chưa làm hôm nay)
  const pendingActivities = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const completed = JSON.parse(localStorage.getItem('corner_completed_' + today) || '[]');

    return activities.filter(act => !completed.includes(act.id));
  }, [activities]);

  // Mark activity as completed
  const markCompleted = (activityId) => {
    const today = new Date().toISOString().split('T')[0];
    const completed = JSON.parse(localStorage.getItem('corner_completed_' + today) || '[]');
    if (!completed.includes(activityId)) {
      completed.push(activityId);
      localStorage.setItem('corner_completed_' + today, JSON.stringify(completed));
    }
  };

  // Add reminder
  const handleAddReminder = () => {
    if (!newReminder.time || !newReminder.activity) return;

    const reminder = {
      id: Date.now(),
      time: newReminder.time,
      activity: newReminder.activity,
      enabled: newReminder.enabled,
      createdAt: new Date().toISOString(),
    };

    const updated = [...reminders, reminder];
    saveReminders(updated);
    setNewReminder({ time: '', activity: '', enabled: true });
    setShowAddReminder(false);

    // Schedule notification (if browser supports)
    scheduleNotification(reminder);
  };

  // Toggle reminder
  const toggleReminder = (id) => {
    const updated = reminders.map(r =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    saveReminders(updated);
  };

  // Delete reminder
  const deleteReminder = (id) => {
    const updated = reminders.filter(r => r.id !== id);
    saveReminders(updated);
  };

  // Schedule notification (using Web Notifications API)
  const scheduleNotification = (reminder) => {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      scheduleNotificationForTime(reminder);
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          scheduleNotificationForTime(reminder);
        }
      });
    }
  };

  const scheduleNotificationForTime = (reminder) => {
    const [hours, minutes] = reminder.time.split(':').map(Number);
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (reminderTime < now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const delay = reminderTime.getTime() - now.getTime();

    setTimeout(() => {
      if (reminder.enabled) {
        new Notification('Góc Nhỏ - Nhắc nhở', {
          body: `Đã đến giờ ${reminder.activity}!`,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        });
      }
    }, delay);
  };

  // Check and show notifications for enabled reminders
  useEffect(() => {
    if (!('Notification' in window)) return;

    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      reminders.forEach(reminder => {
        if (reminder.enabled && reminder.time === currentTime) {
          // Show notification
          if (Notification.permission === 'granted') {
            new Notification('Góc Nhỏ - Nhắc nhở', {
              body: `Đã đến giờ ${reminder.activity}!`,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
            });
          }
        }
      });
    };

    // Check every minute
    const interval = setInterval(checkReminders, 60000);
    checkReminders(); // Check immediately

    return () => clearInterval(interval);
  }, [reminders]);

  return (
    <div className="min-h-[70vh] relative">
      <GlowOrbs className="opacity-30" />

      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Bell className="w-8 h-8 text-[--brand]" />
            <span className="gradient-text">Góc Nhỏ</span>
          </h1>
          <p className="text-[--muted] text-sm mt-1">
            Thông báo và nhắc nhở các hoạt động cần làm
          </p>
        </motion.div>

        {/* Pending Activities */}
        {pendingActivities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="highlight">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-[--brand]" />
                  <h3 className="font-semibold text-[--text]">Hoạt động cần làm hôm nay</h3>
                </div>
                <Badge variant="accent">{pendingActivities.length}</Badge>
              </div>
              <div className="space-y-2">
                {pendingActivities.map(activity => {
                  const Icon = activity.icon;
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 rounded-xl glass hover:bg-white/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${activity.color} flex items-center justify-center`}>
                          <Icon size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-[--text]">{activity.label}</p>
                          <p className="text-xs text-[--muted]">Chưa hoàn thành</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            markCompleted(activity.id);
                            window.location.href = activity.path;
                          }}
                        >
                          Làm ngay
                        </Button>
                        <button
                          onClick={() => markCompleted(activity.id)}
                          className="p-2 rounded-lg hover:bg-[--surface-border] transition-colors"
                          title="Đánh dấu đã hoàn thành"
                        >
                          <CheckCircle2 size={18} className="text-green-500" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Reminders */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-[--accent]" />
                <h3 className="font-semibold text-[--text]">Nhắc nhở</h3>
              </div>
              <Button
                size="sm"
                onClick={() => setShowAddReminder(true)}
                icon={<Plus size={16} />}
              >
                Thêm nhắc nhở
              </Button>
            </div>

            {reminders.length === 0 ? (
              <div className="text-center py-8 text-[--muted]">
                <Bell size={48} className="mx-auto mb-2 opacity-50" />
                <p>Chưa có nhắc nhở nào</p>
                <p className="text-xs mt-1">Thêm nhắc nhở để không quên các hoạt động quan trọng</p>
              </div>
            ) : (
              <div className="space-y-2">
                {reminders.map(reminder => (
                  <motion.div
                    key={reminder.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 rounded-xl glass hover:bg-white/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${reminder.enabled ? 'bg-green-500/20 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                        <Clock size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-[--text]">{reminder.activity}</p>
                        <p className="text-xs text-[--muted]">{reminder.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleReminder(reminder.id)}
                        className={`p-2 rounded-lg transition-colors ${reminder.enabled ? 'bg-green-500/20 text-green-600' : 'bg-gray-200 text-gray-400'}`}
                        title={reminder.enabled ? 'Tắt nhắc nhở' : 'Bật nhắc nhở'}
                      >
                        <Bell size={18} className={reminder.enabled ? 'fill-current' : ''} />
                      </button>
                      <button
                        onClick={() => deleteReminder(reminder.id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-red-500 transition-colors"
                        title="Xóa nhắc nhở"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Add Reminder Modal */}
        <AnimatePresence>
          {showAddReminder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowAddReminder(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg text-[--text]">Thêm nhắc nhở</h3>
                  <button
                    onClick={() => setShowAddReminder(false)}
                    className="p-2 rounded-lg hover:bg-[--surface-border] transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Quick Templates */}
                  <div>
                    <label className="block text-sm font-medium text-[--text] mb-2">
                      Chọn nhanh
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {REMINDER_TEMPLATES.slice(0, 4).map((template, idx) => (
                        <button
                          key={idx}
                          onClick={() => setNewReminder({
                            ...newReminder,
                            activity: template.activity,
                            time: template.time
                          })}
                          className="px-3 py-1.5 text-xs rounded-lg bg-[--surface-border] hover:bg-[--brand]/20 hover:text-[--brand] transition-colors"
                        >
                          {template.activity}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[--text] mb-2">
                      Hoạt động
                    </label>
                    <input
                      type="text"
                      value={newReminder.activity}
                      onChange={(e) => setNewReminder({ ...newReminder, activity: e.target.value })}
                      placeholder="Ví dụ: Viết Lọ Biết Ơn"
                      className="w-full p-3 rounded-xl glass border-0 focus:ring-2 focus:ring-[--ring] text-[--text]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[--text] mb-2">
                      Thời gian
                    </label>
                    <input
                      type="time"
                      value={newReminder.time}
                      onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                      className="w-full p-3 rounded-xl glass border-0 focus:ring-2 focus:ring-[--ring] text-[--text]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="enabled"
                      checked={newReminder.enabled}
                      onChange={(e) => setNewReminder({ ...newReminder, enabled: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    <label htmlFor="enabled" className="text-sm text-[--text]">
                      Bật nhắc nhở
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddReminder}
                      className="flex-1"
                      disabled={!newReminder.time || !newReminder.activity}
                    >
                      Thêm
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddReminder(false)}
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

