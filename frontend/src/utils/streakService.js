// src/utils/streakService.js
// Chú thích: Service tập trung quản lý streak (điểm danh liên tục)
// Ghi nhận hoạt động từ nhiều nguồn: login, chat, breathing, gratitude...

const LOGIN_HISTORY_KEY = 'bdh_login_history';

/**
 * Lấy ngày hôm nay dạng YYYY-MM-DD
 */
export function getTodayString() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Load lịch sử login từ localStorage
 * @returns {string[]} Mảng các ngày đã hoạt động (format YYYY-MM-DD)
 */
export function getLoginHistory() {
    try {
        const data = localStorage.getItem(LOGIN_HISTORY_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

/**
 * Ghi nhận hoạt động hôm nay
 * Nếu hôm nay đã được ghi nhận rồi thì bỏ qua (tránh duplicate)
 * @param {string} [type] - Loại hoạt động (login, chat, breathing...) - chỉ để debug/log
 * @returns {string[]} Lịch sử sau khi cập nhật
 */
export function recordActivity(type = 'general') {
    const today = getTodayString();
    const history = getLoginHistory();

    // Đã ghi nhận hôm nay rồi → skip
    if (history.includes(today)) {
        return history;
    }

    // Thêm ngày hôm nay
    history.push(today);

    // Chỉ giữ 90 ngày gần nhất để tránh localStorage quá lớn
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    const filtered = history.filter(d => d >= cutoffStr);

    try {
        localStorage.setItem(LOGIN_HISTORY_KEY, JSON.stringify(filtered));
        // Log nhẹ để debug khi cần
        console.info('[Streak] Recorded activity:', type, today);
    } catch (e) {
        console.warn('[Streak] Failed to save:', e);
    }

    return filtered;
}

/**
 * Tính streak (số ngày hoạt động liên tiếp tính từ hôm nay/hôm qua)
 * @returns {number} Số ngày streak
 */
export function getStreak() {
    const history = getLoginHistory();
    if (!history || history.length === 0) return 0;

    // Sắp xếp giảm dần (mới nhất trước)
    const sorted = [...history].sort().reverse();
    const today = getTodayString();
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Nếu ngày mới nhất không phải hôm nay hoặc hôm qua → streak bị đứt
    if (sorted[0] !== today && sorted[0] !== yesterday) {
        return 0;
    }

    let streak = 1;
    for (let i = 1; i < sorted.length; i++) {
        const prevDate = new Date(sorted[i - 1]);
        const currDate = new Date(sorted[i]);
        const diffDays = Math.round((prevDate - currDate) / 86400000);

        if (diffDays === 1) {
            streak++;
        } else {
            break; // Gap > 1 ngày → dừng đếm
        }
    }

    return streak;
}

/**
 * Lấy start of week (Monday) - dùng cho weekly progress
 */
export function getWeekStart() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
}

/**
 * Generate dữ liệu tiến độ tuần này
 * @returns {Array} Mảng 7 ngày với thông tin completed, current, isPast
 */
export function generateWeeklyProgress() {
    const history = getLoginHistory();
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const weekStart = getWeekStart();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const progress = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        const dayOfWeek = date.getDay();

        const dayName = dayNames[dayOfWeek];
        const isToday = dateStr === today.toISOString().split('T')[0];
        const isCompleted = history.includes(dateStr);
        const isPast = date < today;

        progress.push({
            day: dayName,
            date: dateStr,
            completed: isCompleted,
            current: isToday,
            isPast: isPast && !isToday
        });
    }

    return progress;
}
