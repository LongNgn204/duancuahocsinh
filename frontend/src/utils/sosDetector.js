// src/utils/sosDetector.js
// Chú thích: Phát hiện nhanh các từ khóa nguy cơ cao ngay trên frontend để hiện SOS overlay sớm
export function detectSOSLocal(text) {
  if (!text) return 'safe';
  const t = String(text).toLowerCase();
  const keywords = ['tự tử', 'kết thúc cuộc đời', 'muốn chết', 'chết đi', 'tự làm hại'];
  for (const k of keywords) {
    if (t.includes(k)) return 'high';
  }
  return 'safe';
}

export function sosMessage() {
  return 'Mình lo cho bạn. Hãy liên hệ người lớn đáng tin cậy hoặc gọi 111 (bảo vệ trẻ em) hoặc 024.7307.1111 (Trung tâm tham vấn). Bạn không đơn độc đâu.';
}

