// src/utils/notificationService.js
// Chú thích: Service cho Browser Notifications (không phải Push, chỉ local)

/**
 * Lấy trạng thái permission
 */
export function getNotificationPermission() {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission;
}

/**
 * Yêu cầu quyền notification
 */
export async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        throw new Error('Notifications không được hỗ trợ');
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission === 'denied') {
        throw new Error('Quyền thông báo đã bị từ chối');
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
}

/**
 * Gửi notification
 */
export function sendNotification(title, options = {}) {
    if (Notification.permission !== 'granted') {
        console.warn('[Notifications] Permission not granted');
        return;
    }

    new Notification(title, {
        icon: '/logo.png',
        badge: '/logo.png',
        ...options
    });
}

/**
 * Lên lịch nhắc nhở gratitude hàng ngày
 */
export function scheduleGratitudeReminder(time) {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const scheduled = new Date();
    scheduled.setHours(hours, minutes, 0, 0);

    // Nếu thời gian đã qua hôm nay, lên lịch cho ngày mai
    if (scheduled <= now) {
        scheduled.setDate(scheduled.getDate() + 1);
    }

    const msUntil = scheduled.getTime() - now.getTime();

    return setTimeout(() => {
        sendNotification('🏺 Lọ Biết Ơn', {
            body: 'Đã đến lúc ghi lại điều bạn biết ơn hôm nay!',
            tag: 'gratitude-reminder',
            requireInteraction: false
        });

        // Lên lịch lại cho ngày mai
        scheduleGratitudeReminder(time);
    }, msUntil);
}

/**
 * Lên lịch nhắc nhở giờ ngủ
 */
export function scheduleSleepReminder(time) {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const scheduled = new Date();
    scheduled.setHours(hours, minutes, 0, 0);

    if (scheduled <= now) {
        scheduled.setDate(scheduled.getDate() + 1);
    }

    const msUntil = scheduled.getTime() - now.getTime();

    return setTimeout(() => {
        sendNotification('🌙 Giờ đi ngủ', {
            body: 'Đã đến giờ nghỉ ngơi. Chúc bạn ngủ ngon!',
            tag: 'sleep-reminder',
            requireInteraction: false
        });

        scheduleSleepReminder(time);
    }, msUntil);
}

/**
 * Lên lịch nhắc nhở thở (mỗi X phút)
 */
export function scheduleBreathingReminder(intervalMinutes) {
    const msUntil = intervalMinutes * 60 * 1000;

    return setTimeout(() => {
        sendNotification('🌬️ Thở & Thư giãn', {
            body: 'Hãy dành 2 phút để thở sâu và thư giãn',
            tag: 'breathing-reminder',
            requireInteraction: false
        });

        // Lên lịch lại
        scheduleBreathingReminder(intervalMinutes);
    }, msUntil);
}

/**
 * Khởi tạo notifications từ settings
 */
export function initializeNotificationsFromSettings(settings) {
    if (!settings || Notification.permission !== 'granted') return;

    // Clear existing
    // (Cần lưu timeout IDs để clear)

    if (settings.daily_reminder && settings.reminder_time) {
        scheduleGratitudeReminder(settings.reminder_time);
    }

    if (settings.sleep_reminder && settings.sleep_reminder_time) {
        scheduleSleepReminder(settings.sleep_reminder_time);
    }

    if (settings.breathing_reminder) {
        scheduleBreathingReminder(120); // 2 giờ
    }
}
