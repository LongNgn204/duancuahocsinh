// src/components/breathing/EncouragementMessages.jsx
// Chú thích: Component hiển thị câu động viên theo nhóm cảm xúc
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Heart, Sparkles, Smile, Zap, Star, X, ChevronRight } from 'lucide-react';

// Nhóm cảm xúc và câu động viên
const ENCOURAGEMENT_GROUPS = {
  motivation: {
    id: 'motivation',
    label: 'Động lực học tập',
    emoji: '💪',
    icon: Zap,
    color: 'from-amber-400 to-orange-400',
    messages: [
      'Bạn đang làm rất tốt! Tiếp tục cố gắng nhé!',
      'Mỗi bước nhỏ đều quan trọng. Bạn đang tiến bộ đấy!',
      'Hãy tin vào khả năng của mình. Bạn có thể làm được!',
      'Thành công đến từ sự kiên trì. Bạn đang đi đúng hướng!',
      'Hôm nay bạn đã học được điều gì mới? Hãy tự hào về điều đó!',
      'Không có gì là không thể nếu bạn quyết tâm. Cố lên!',
    ],
  },
  selfLove: {
    id: 'selfLove',
    label: 'Yêu bản thân',
    emoji: '💝',
    icon: Heart,
    color: 'from-pink-400 to-rose-400',
    messages: [
      'Bạn xứng đáng được yêu thương và trân trọng',
      'Bạn là người đặc biệt và có giá trị riêng của mình',
      'Hãy yêu thương bản thân như cách bạn yêu thương người khác',
      'Bạn đang làm tốt lắm. Hãy tự khen mình một chút nhé!',
      'Mỗi người đều có điểm mạnh riêng. Bạn cũng vậy!',
      'Hãy nhớ rằng bạn quan trọng và đáng được hạnh phúc',
    ],
  },
  happiness: {
    id: 'happiness',
    label: 'Vui vẻ',
    emoji: '😊',
    icon: Smile,
    color: 'from-yellow-400 to-amber-400',
    messages: [
      'Hãy mỉm cười, mọi thứ sẽ tốt đẹp hơn',
      'Niềm vui nhỏ bé cũng đáng được trân trọng',
      'Hôm nay bạn đã có khoảnh khắc vui vẻ nào chưa?',
      'Hãy tìm niềm vui trong những điều đơn giản',
      'Bạn xứng đáng được hạnh phúc mỗi ngày',
      'Hãy lan tỏa năng lượng tích cực đến mọi người xung quanh',
    ],
  },
  resilience: {
    id: 'resilience',
    label: 'Kiên cường',
    emoji: '💪',
    icon: Zap,
    color: 'from-blue-400 to-indigo-400',
    messages: [
      'Bạn mạnh mẽ hơn bạn nghĩ',
      'Khó khăn chỉ là bước đệm để bạn trưởng thành hơn',
      'Bạn đã vượt qua nhiều thử thách rồi. Lần này cũng vậy!',
      'Sự kiên cường của bạn đáng được ngưỡng mộ',
      'Mỗi lần vấp ngã là một lần học hỏi. Bạn đang làm tốt!',
      'Hãy nhớ rằng sau cơn mưa trời lại sáng',
    ],
  },
  confidence: {
    id: 'confidence',
    label: 'Tự tin',
    emoji: '🌟',
    icon: Star,
    color: 'from-purple-400 to-pink-400',
    messages: [
      'Bạn có khả năng làm được điều đó',
      'Hãy tin vào bản thân. Bạn đủ giỏi!',
      'Tự tin là chìa khóa của thành công. Bạn đang có nó!',
      'Bạn có những điểm mạnh riêng. Hãy phát huy chúng!',
      'Đừng sợ thử thách. Bạn có thể vượt qua!',
      'Hãy tự hào về những gì bạn đã đạt được',
    ],
  },
};

// Storage key để lưu lịch sử đã xem
const VIEWED_MESSAGES_KEY = 'encouragement_viewed_v1';

function loadViewedMessages() {
  try {
    const raw = localStorage.getItem(VIEWED_MESSAGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

function saveViewedMessage(groupId, message) {
  try {
    const viewed = loadViewedMessages();
    const key = `${groupId}:${message}`;
    if (!viewed.includes(key)) {
      viewed.push(key);
      // Giữ tối đa 100 messages
      if (viewed.length > 100) {
        viewed.shift();
      }
      localStorage.setItem(VIEWED_MESSAGES_KEY, JSON.stringify(viewed));
    }
  } catch (_) {}
}

export default function EncouragementMessages({ onMessageShown }) {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [showCard, setShowCard] = useState(false);

  // Lấy message ngẫu nhiên từ nhóm đã chọn
  const getRandomMessage = (groupId) => {
    const group = ENCOURAGEMENT_GROUPS[groupId];
    if (!group) return null;

    const viewed = loadViewedMessages();
    const availableMessages = group.messages.filter(
      (msg) => !viewed.includes(`${groupId}:${msg}`)
    );

    // Nếu tất cả đã xem, chọn ngẫu nhiên từ tất cả
    const pool = availableMessages.length > 0 ? availableMessages : group.messages;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const handleSelectGroup = (groupId) => {
    const message = getRandomMessage(groupId);
    if (message) {
      setSelectedGroup(groupId);
      setCurrentMessage(message);
      setShowCard(true);
      saveViewedMessage(groupId, message);
      if (onMessageShown) {
        onMessageShown({ groupId, message });
      }
    }
  };

  const handleClose = () => {
    setShowCard(false);
    setTimeout(() => {
      setSelectedGroup(null);
      setCurrentMessage(null);
    }, 300);
  };

  const handleNextMessage = () => {
    if (selectedGroup) {
      const message = getRandomMessage(selectedGroup);
      if (message) {
        setCurrentMessage(message);
        saveViewedMessage(selectedGroup, message);
      }
    }
  };

  const selectedGroupData = selectedGroup ? ENCOURAGEMENT_GROUPS[selectedGroup] : null;

  return (
    <>
      {/* Group Selector */}
      <Card size="sm" className="mb-4">
        <h3 className="font-semibold text-[--text] mb-3 flex items-center gap-2">
          <Sparkles size={18} className="text-[--brand]" />
          Câu động viên
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {Object.values(ENCOURAGEMENT_GROUPS).map((group) => {
            const Icon = group.icon;
            return (
              <motion.button
                key={group.id}
                onClick={() => handleSelectGroup(group.id)}
                className={`
                  p-3 rounded-xl text-center transition-all
                  glass hover:bg-white/50
                  ${selectedGroup === group.id ? 'ring-2 ring-[--brand]' : ''}
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-2xl mb-1">{group.emoji}</div>
                <div className="text-xs font-medium text-[--text]">{group.label}</div>
              </motion.button>
            );
          })}
        </div>
      </Card>

      {/* Message Card */}
      <AnimatePresence>
        {showCard && currentMessage && selectedGroupData && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              variant="gradient"
              className={`relative overflow-hidden bg-gradient-to-br ${selectedGroupData.color}`}
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors z-10"
                aria-label="Đóng"
              >
                <X size={18} className="text-white" />
              </button>

              <div className="relative z-10 pr-12">
                {/* Group label */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-2xl">{selectedGroupData.emoji}</div>
                  <span className="text-sm font-semibold text-white/90">
                    {selectedGroupData.label}
                  </span>
                </div>

                {/* Message */}
                <p className="text-white text-lg font-medium leading-relaxed mb-4">
                  {currentMessage}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextMessage}
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  >
                    <ChevronRight size={16} className="mr-1" />
                    Câu khác
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

