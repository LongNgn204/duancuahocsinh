// src/pages/Corner.jsx
// Chú thích: Góc Nhỏ v3.0 - Theo giao diện mới với ngân hàng hoạt động và checkbox
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import { Calendar, Plus, Trash2, CheckCircle2, Sparkles, PartyPopper } from 'lucide-react';
import Confetti from '../components/ui/Confetti';
import { useSound } from '../contexts/SoundContext';

const STORAGE_KEY = 'corner_activities_v2';

// Chú thích: Ngân hàng hoạt động gợi ý - người dùng chọn từ đây
const ACTIVITY_BANK = [
  { id: 'water', emoji: '💧', label: 'Uống một ly nước đầy', color: 'from-blue-100 to-cyan-100 border-blue-200' },
  { id: 'proud', emoji: '👍', label: 'Viết ra 1 điều bạn tự hào về bản thân', color: 'from-amber-100 to-yellow-100 border-amber-200' },
  { id: 'stretch', emoji: '🧘', label: 'Vươn vai và duỗi người trong 1 phút', color: 'from-purple-100 to-pink-100 border-purple-200' },
  { id: 'wash', emoji: '💦', label: 'Rửa mặt với nước mát', color: 'from-cyan-100 to-sky-100 border-cyan-200' },
  { id: 'cloud', emoji: '☁️', label: 'Nhìn ra ngoài cửa sổ và tìm một đám mây đẹp', color: 'from-sky-100 to-blue-100 border-sky-200' },
  { id: 'tidy', emoji: '📚', label: 'Sắp xếp lại góc học tập/làm việc', color: 'from-orange-100 to-amber-100 border-orange-200' },
  { id: 'music', emoji: '🎵', label: 'Nghe một bài hát bạn yêu thích', color: 'from-pink-100 to-rose-100 border-pink-200' },
  { id: 'smile', emoji: '😊', label: 'Mỉm cười với chính mình trong gương', color: 'from-yellow-100 to-lime-100 border-yellow-200' },
  { id: 'breathe', emoji: '🌬️', label: 'Hít thở sâu 5 lần', color: 'from-teal-100 to-emerald-100 border-teal-200' },
  { id: 'gratitude', emoji: '🙏', label: 'Viết 1 điều biết ơn hôm nay', color: 'from-rose-100 to-pink-100 border-rose-200' },
  { id: 'walk', emoji: '🚶', label: 'Đi bộ một vòng ngắn', color: 'from-green-100 to-emerald-100 border-green-200' },
  { id: 'call', emoji: '📞', label: 'Gọi điện hỏi thăm người thân', color: 'from-indigo-100 to-violet-100 border-indigo-200' },
];

export default function Corner() {
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [completedIds, setCompletedIds] = useState([]);
  const [customTask, setCustomTask] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAllComplete, setShowAllComplete] = useState(false);
  const { playSound } = useSound();

  const todayKey = new Date().toISOString().split('T')[0];

  // Load Data khi component mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (saved.date === todayKey) {
        setSelectedTasks(saved.tasks || []);
        setCompletedIds(saved.completed || []);
      }
    } catch (_) { }
  }, [todayKey]);

  // Save Data khi thay đổi
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      date: todayKey,
      tasks: selectedTasks,
      completed: completedIds
    }));
  }, [selectedTasks, completedIds, todayKey]);

  // Thêm hoạt động từ ngân hàng vào danh sách
  const addFromBank = (activity) => {
    if (selectedTasks.find(t => t.id === activity.id)) return; // Đã có rồi
    playSound('click');
    setSelectedTasks([...selectedTasks, { ...activity, isCustom: false }]);
  };

  // Thêm hoạt động tùy chỉnh
  const addCustomTask = () => {
    if (!customTask.trim()) return;
    playSound('click');
    const newTask = {
      id: `custom_${Date.now()}`,
      emoji: '❤️',
      label: customTask.trim(),
      color: 'from-rose-100 to-pink-100 border-rose-200',
      isCustom: true
    };
    setSelectedTasks([...selectedTasks, newTask]);
    setCustomTask('');
  };

  // Xóa hoạt động khỏi danh sách
  const removeTask = (id) => {
    playSound('pop');
    setSelectedTasks(selectedTasks.filter(t => t.id !== id));
    setCompletedIds(completedIds.filter(cid => cid !== id));
  };

  // Đánh dấu hoàn thành / bỏ hoàn thành
  const toggleComplete = (id) => {
    const isCompleting = !completedIds.includes(id);

    if (isCompleting) {
      playSound('drop');
      setCompletedIds([...completedIds, id]);

      // Kiểm tra nếu hoàn thành tất cả
      const newCompleted = [...completedIds, id];
      if (newCompleted.length === selectedTasks.length && selectedTasks.length > 0) {
        // Hoàn thành TẤT CẢ!
        setTimeout(() => {
          setShowConfetti(true);
          setShowAllComplete(true);
          playSound('notification');
        }, 300);
      } else {
        // Chỉ hoàn thành 1 task - bong bóng nhỏ
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
    } else {
      playSound('click');
      setCompletedIds(completedIds.filter(cid => cid !== id));
      setShowAllComplete(false);
    }
  };

  const progress = selectedTasks.length > 0
    ? Math.round((completedIds.length / selectedTasks.length) * 100)
    : 0;

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6 md:py-8 space-y-6 max-w-3xl mx-auto relative">
      <Confetti active={showConfetti} />

      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-block p-3 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl text-white shadow-lg mb-4"
        >
          <Calendar size={32} />
        </motion.div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
          Góc Nhỏ Của Bạn
        </h1>
        <p className="text-slate-500 mt-2">Quản lý thói quen tốt mỗi ngày</p>
      </div>

      {/* Progress Bar */}
      {selectedTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-4 shadow-md border border-slate-100"
        >
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-slate-600">Tiến độ hôm nay</span>
            <span className="font-bold text-indigo-600">{completedIds.length}/{selectedTasks.length} hoàn thành</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full"
            />
          </div>
        </motion.div>
      )}

      {/* Ngân hàng hoạt động */}
      <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100">
        <h2 className="text-xl font-bold text-center mb-6 flex items-center justify-center gap-2">
          <span className="text-2xl">🌈</span>
          Chọn từ ngân hàng hoạt động:
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ACTIVITY_BANK.map((activity) => {
            const isAdded = selectedTasks.find(t => t.id === activity.id);
            return (
              <motion.button
                key={activity.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => addFromBank(activity)}
                disabled={isAdded}
                className={`
                                    p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3
                                    bg-gradient-to-r ${activity.color}
                                    ${isAdded
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-md cursor-pointer'
                  }
                                `}
              >
                <span className="text-2xl">{activity.emoji}</span>
                <span className="font-medium text-slate-700 text-sm">{activity.label}</span>
                {isAdded && <CheckCircle2 size={18} className="ml-auto text-green-500" />}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Danh sách việc đã chọn */}
      {selectedTasks.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            📋 Danh sách việc đã chọn hôm nay ({todayKey}):
          </h3>

          <div className="space-y-3">
            <AnimatePresence>
              {selectedTasks.map((task) => {
                const isCompleted = completedIds.includes(task.id);
                return (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`
                                            flex items-center gap-3 p-4 rounded-xl border-2 transition-all
                                            bg-gradient-to-r ${task.color}
                                            ${isCompleted ? 'opacity-60' : ''}
                                        `}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleComplete(task.id)}
                      className={`
                                                w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all
                                                ${isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-slate-300 hover:border-green-400'
                        }
                                            `}
                    >
                      {isCompleted && <CheckCircle2 size={16} />}
                    </button>

                    {/* Content */}
                    <span className="text-xl">{task.emoji}</span>
                    <span className={`flex-1 font-medium ${isCompleted ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                      {task.label}
                    </span>

                    {/* Delete button */}
                    <button
                      onClick={() => removeTask(task.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Thêm hoạt động tùy chỉnh */}
      <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100">
        <h3 className="font-bold text-lg mb-4">
          ✨ Thêm một hoạt động mới vào danh sách:
        </h3>
        <div className="flex gap-3">
          <input
            value={customTask}
            onChange={(e) => setCustomTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomTask()}
            placeholder="Nhập hoạt động bạn muốn làm..."
            className="flex-1 p-4 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 border border-slate-200"
          />
          <Button
            onClick={addCustomTask}
            icon={<Plus size={20} />}
            className="shadow-lg"
          >
            Thêm
          </Button>
        </div>
      </div>

      {/* Modal chúc mừng hoàn thành tất cả */}
      <AnimatePresence>
        {showAllComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowAllComplete(false);
              setShowConfetti(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 50 }}
              className="bg-white rounded-3xl p-8 max-w-md text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-7xl mb-4"
              >
                🎉
              </motion.div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">
                Tuyệt vời!
              </h2>
              <p className="text-xl text-indigo-600 font-medium mb-4">
                Bạn đã hoàn thành tất cả hoạt động hôm nay!
              </p>
              <p className="text-slate-500 mb-6">
                Tiếp tục phát huy tinh thần này nhé! Mỗi ngày một cố gắng nhỏ sẽ tạo nên thành công lớn. 💪
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => {
                    setShowAllComplete(false);
                    setShowConfetti(false);
                  }}
                  className="px-8"
                >
                  Đóng
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
