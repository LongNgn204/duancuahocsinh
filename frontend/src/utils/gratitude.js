// src/utils/gratitude.js
// Chú thích: Utilities cho Lọ Biết Ơn – chuẩn hóa ngày và tính streak
export function toDayStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDayStr(s) {
  const [y, m, d] = String(s).split('-').map(Number);
  if (!y || !m || !d) return new Date('1970-01-01');
  return new Date(y, m - 1, d);
}

export function daysDiff(a, b) {
  // số ngày (UTC) giữa 2 ngày
  const ms = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()) -
             Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round(ms / 86400000);
}

export function computeStreakFromEntries(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return 0;
  // Lấy danh sách ngày duy nhất, sắp xếp giảm dần
  const days = Array.from(new Set(entries.map((e) => toDayStr(new Date(e.date)))))
    .sort((a, b) => (a < b ? 1 : -1));

  let count = 0;
  let cur = toDayStr(new Date());
  for (const day of days) {
    const diff = daysDiff(parseDayStr(cur), parseDayStr(day));
    if (diff === 0) {
      count += 1; // có entry hôm nay
    } else if (diff === 1) {
      count += 1; // có entry hôm qua
    } else {
      break; // gap >1 ngày → dừng streak
    }
    cur = day; // cập nhật mốc so sánh
  }
  return count;
}

