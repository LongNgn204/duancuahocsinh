// src/utils/sosDetector.js
// Chú thích: SOS Detector v2.0 - Mở rộng 50+ patterns, multi-level severity
// Phát hiện nguy cơ tâm lý với nhiều cấp độ và tiếng lóng học sinh

/**
 * Cấp độ nghiêm trọng:
 * - critical: Ý định tự hại rõ ràng → Hiện overlay + hotline ngay
 * - high: Dấu hiệu nguy cơ cao → Hỏi thêm + gợi ý hỗ trợ
 * - medium: Cảm xúc tiêu cực kéo dài → AI đáp nhẹ nhàng + theo dõi
 * - low: Căng thẳng nhẹ → AI đáp bình thường
 * - safe: Không có dấu hiệu
 */

// Từ khóa CRITICAL - Cần can thiệp ngay lập tức
const CRITICAL_PATTERNS = [
  // Ý định tự tử rõ ràng
  'tự tử', 'tự vẫn', 'tự sát',
  'muốn chết', 'mún chết', 'muon chet',
  'kết thúc cuộc đời', 'kết thúc tất cả',
  'chết đi cho rồi', 'chết đi', 'chết đc rồi',
  'không muốn sống', 'k muốn sống', 'ko muon song',
  'sống làm gì', 'sống để làm gì', 'sống chi',
  'muốn biến mất', 'biến mất khỏi đời',

  // Tự làm hại bản thân
  'tự làm hại', 'tự cắt', 'rạch tay',
  'tự đánh mình', 'tự hurt',
  'uống thuốc ngủ', 'overdose',

  // ===== GEN Z VOCABULARY =====
  // Tiếng lóng "muốn chết"
  'mún đi luôn', 'muốn đi luôn', 'đi luôn cho rồi',
  'ngủ luôn', 'ngủ mãi', 'sleep forever',
  'đi khỏi thế giới', 'rời khỏi thế giới', 'rời khỏi thế giới này',
  'end game', 'game over đời', 'gg đi',
  'bái bai thế giới', 'bye bye cuộc đời',
  // Mạng xã hội style
  'ko thể tiếp tục nữa', 'hết năng lượng sống',
  'cạn pin rồi', 'bat low quá', 'energy = 0',
  // Viết tắt phổ biến
  'kts', 'muốn c', 'muốn die',
];

// Từ khóa HIGH - Nguy cơ cao, cần theo dõi sát
const HIGH_PATTERNS = [
  // Cảm giác vô vọng
  'không ai quan tâm', 'k ai quan tâm',
  'không ai hiểu', 'k ai hiểu mình',
  'một mình mãi', 'cô đơn quá',
  'vô dụng', 'vô ích', 'thừa thãi',
  'gánh nặng cho mọi người', 'là gánh nặng',
  'không xứng đáng', 'k xứng đáng',

  // Tuyệt vọng
  'tuyệt vọng', 'hết hy vọng',
  'không còn gì', 'mất hết rồi',
  'không có lối thoát', 'bế tắc hoàn toàn',
  'không thể tiếp tục', 'k thể tiếp tục',

  // Bị bắt nạt/bạo lực
  'bị đánh', 'bị bắt nạt', 'bị bully',
  'bị xâm hại', 'bị sờ soạng', 'bị lạm dụng',
  'bị ép buộc', 'bị đe dọa',

  // Tự cô lập
  'không muốn đi học', 'sợ đến trường',
  'muốn trốn mãi', 'không muốn ra ngoài',
];

// Từ khóa MEDIUM - Cần quan tâm, AI nên hỏi thêm
const MEDIUM_PATTERNS = [
  // Trầm cảm
  'buồn quá', 'buồn lắm', 'buồn muốn khóc',
  'khóc hoài', 'khóc mỗi ngày', 'khóc suốt',
  'không vui được', 'không còn vui',
  'chán nản', 'chán lắm rồi',
  'mệt mỏi lắm', 'kiệt sức rồi',
  'không ngủ được', 'mất ngủ',

  // ===== GEN Z VOCABULARY =====
  // Tiếng lóng chán/buồn (MEDIUM level)
  'chán đời', 'chán vl', 'chán real', 'chán thật sự',
  'toang', 'toang rồi', 'toang real', 'toang thật sự',
  'emo quá', 'đang emo', 'emo nặng',
  'xuống tinh thần', 'mood đi xuống',
  // Mạng xã hội style
  'không ai care', 'no one cares', 'ai mà hiểu',
  'cô đơn vl', 'lonely af', 'một mình hoài',
  'áp lực quá trời', 'stress vl', 'burn out rồi',
  // Tự ti
  'fail đủ thứ', 'mình dở quá', 'mình tệ quá',
  'không làm được gì cả', 'useless real',

  // Lo âu
  'lo lắng quá', 'lo nhiều lắm',
  'sợ hãi', 'hoảng loạn', 'panic',
  'stress quá', 'áp lực quá', 'căng thẳng quá',

  // Gia đình
  'bố mẹ ly dị', 'bố mẹ cãi nhau',
  'bị bố đánh', 'bị mẹ đánh', 'bị cha mẹ đánh',
  'ghét bố', 'ghét mẹ', 'ghét gia đình',
  'muốn bỏ nhà', 'muốn chạy trốn',
  'bố mẹ không hiểu', 'bị la hoài', 'bị so sánh',
  'ghét về nhà', 'không muốn về nhà',

  // Học tập
  'thi trượt', 'học dốt', 'bị phạt',
  'bị thầy cô mắng', 'bị la mắng',
  'điểm thấp quá', 'rớt đại học',
];

// Từ khóa LOW - Căng thẳng nhẹ, bình thường
const LOW_PATTERNS = [
  'hơi buồn', 'buồn chút',
  'áp lực', 'stress', 'mệt',
  'không vui', 'không ổn lắm',
  'lo về thi', 'lo bài vở',
];

/**
 * Phát hiện mức độ SOS từ text
 * @param {string} text - Nội dung cần kiểm tra
 * @returns {'critical'|'high'|'medium'|'low'|'safe'} Mức độ nguy cơ
 */
export function detectSOSLevel(text) {
  if (!text) return 'safe';
  const t = String(text).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const tOriginal = String(text).toLowerCase();

  // Check critical first
  for (const pattern of CRITICAL_PATTERNS) {
    const p = pattern.toLowerCase();
    if (tOriginal.includes(p) || t.includes(p.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))) {
      return 'critical';
    }
  }

  // Check high
  for (const pattern of HIGH_PATTERNS) {
    const p = pattern.toLowerCase();
    if (tOriginal.includes(p) || t.includes(p.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))) {
      return 'high';
    }
  }

  // Check medium
  for (const pattern of MEDIUM_PATTERNS) {
    const p = pattern.toLowerCase();
    if (tOriginal.includes(p) || t.includes(p.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))) {
      return 'medium';
    }
  }

  // Check low
  for (const pattern of LOW_PATTERNS) {
    const p = pattern.toLowerCase();
    if (tOriginal.includes(p) || t.includes(p.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))) {
      return 'low';
    }
  }

  return 'safe';
}

/**
 * Backwards compatible - trả về 'high' hoặc 'safe' cho code cũ
 */
export function detectSOSLocal(text) {
  const level = detectSOSLevel(text);
  return (level === 'critical' || level === 'high') ? 'high' : 'safe';
}

/**
 * Lấy message phù hợp theo level
 */
export function sosMessage(level = 'high') {
  const messages = {
    critical: `🆘 Mình rất lo lắng cho bạn. Bạn đang trải qua điều rất khó khăn. 
    
Hãy liên hệ ngay:
📞 111 - Đường dây nóng bảo vệ trẻ em (24/7)
📞 1800 599 920 - Tổng đài sức khỏe tâm thần (miễn phí)
📞 024.7307.1111 - Trung tâm tham vấn tâm lý

Bạn không đơn độc. Có người sẵn sàng giúp đỡ bạn ngay bây giờ.`,

    high: `Mình lo cho bạn. Những gì bạn đang cảm thấy rất quan trọng.

Nếu cần nói chuyện với ai đó:
📞 111 - Đường dây bảo vệ trẻ em
📞 1800 599 920 - Hỗ trợ sức khỏe tâm thần

Mình ở đây để lắng nghe. Bạn có muốn chia sẻ thêm không?`,

    medium: `Mình hiểu bạn đang có những cảm xúc khó khăn. Đó là bình thường và bạn không sai khi cảm thấy như vậy. 

Bạn có muốn kể thêm cho mình nghe không? Mình sẽ cố gắng hiểu và hỗ trợ bạn.`,

    low: `Mình nghe thấy bạn đang hơi căng thẳng. Điều đó hoàn toàn bình thường. 

Bạn có muốn thử bài tập thở để thư giãn, hay là mình trò chuyện tiếp?`,
  };

  return messages[level] || messages.high;
}

/**
 * Lấy hành động gợi ý theo level
 */
export function getSuggestedAction(level) {
  const actions = {
    critical: {
      showOverlay: true,
      showHotline: true,
      notifyBackend: true,
      blockNormalResponse: true,
    },
    high: {
      showOverlay: true,
      showHotline: true,
      notifyBackend: true,
      blockNormalResponse: false,
    },
    medium: {
      showOverlay: false,
      showHotline: false,
      notifyBackend: false,
      blockNormalResponse: false,
      suggestBreathing: true,
    },
    low: {
      showOverlay: false,
      showHotline: false,
      notifyBackend: false,
      blockNormalResponse: false,
    },
    safe: {
      showOverlay: false,
      showHotline: false,
      notifyBackend: false,
      blockNormalResponse: false,
    },
  };

  return actions[level] || actions.safe;
}

// Export patterns cho testing
export const SOS_PATTERNS = {
  critical: CRITICAL_PATTERNS,
  high: HIGH_PATTERNS,
  medium: MEDIUM_PATTERNS,
  low: LOW_PATTERNS,
};
