// src/utils/notificationService.js
// Chú thích: Service quản lý thông báo trình duyệt - Scheduled reminders cho wellness habits
// Sử dụng Notification API và setTimeout/setInterval để lên lịch

/**
 * Kiểm tra trình duyệt có hỗ trợ Notification API không
 */
export function isNotificationSupported() {
    return 'Notification' in window;
}

/**
 * Kiểm tra permission hiện tại
 */
export function getNotificationPermission() {
    if (!isNotificationSupported()) return 'unsupported';
    return Notification.permission; // 'default' | 'granted' | 'denied'
}

/**
 * Yêu cầu quyền thông báo
 */
export async function requestNotificationPermission() {
    if (!isNotificationSupported()) {
        throw new Error('Trình duyệt không hỗ trợ thông báo');
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission === 'denied') {
        throw new Error('Bạn đã từ chối thông báo. Vui lòng bật lại trong cài đặt trình duyệt.');
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
}

/**
 * Gửi thông báo ngay lập tức
 */
export function sendNotification(title, options = {}) {
    if (!isNotificationSupported() || Notification.permission !== 'granted') {
        console.warn('[Notification] Permission not granted');
        return null;
    }

    const defaultOptions = {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'ban-dong-hanh',
        requireInteraction: false,
        ...options,
    };

    try {
        return new Notification(title, defaultOptions);
    } catch (error) {
        console.error('[Notification] Error:', error);
        return null;
    }
}

/**
 * Lên lịch thông báo hàng ngày vào giờ cụ thể
 * @param {string} time - Format HH:MM (ví dụ: '09:00')
 * @param {string} title - Tiêu đề thông báo
 * @param {string} body - Nội dung thông báo
 * @param {Function} callback - Callback khi thông báo được gửi
 * @returns {number} Interval ID để clear sau
 */
export function scheduleDailyNotification(time, title, body, callback = null) {
    const [hours, minutes] = time.split(':').map(Number);
    
    const scheduleNext = () => {
        const now = new Date();
        const scheduled = new Date();
        scheduled.setHours(hours, minutes, 0, 0);

        // Nếu giờ đã qua hôm nay, lên lịch cho ngày mai
        if (scheduled <= now) {
            scheduled.setDate(scheduled.getDate() + 1);
        }

        const delay = scheduled.getTime() - now.getTime();

        const timeoutId = setTimeout(() => {
            const notification = sendNotification(title, { body });
            if (callback) callback(notification);
            
            // Lên lịch lại cho ngày mai
            scheduleNext();
        }, delay);

        return timeoutId;
    };

    return scheduleNext();
}

/**
 * Lên lịch thông báo Pomodoro (sau X phút)
 * @param {number} minutes - Số phút
 * @param {string} message - Thông điệp
 */
export function schedulePomodoroNotification(minutes, message) {
    const delay = minutes * 60 * 1000;
    
    return setTimeout(() => {
        sendNotification('⏰ Pomodoro', {
            body: message,
            requireInteraction: false,
        });
    }, delay);
}

/**
 * Lên lịch thông báo nhắc ngủ
 * @param {string} time - Format HH:MM (ví dụ: '22:00')
 */
export function scheduleSleepReminder(time) {
    return scheduleDailyNotification(
        time,
        '🌙 Đã đến giờ ngủ',
        'Hãy nghỉ ngơi để có một ngày mai tràn đầy năng lượng!',
    );
}

/**
 * Lên lịch thông báo nhắc viết biết ơn
 * @param {string} time - Format HH:MM (ví dụ: '20:00')
 * @returns {number} Timeout ID
 */
export function scheduleGratitudeReminder(time) {
    const messages = [
        'Hôm nay bạn biết ơn điều gì? 💝',
        'Đừng quên ghi lại điều tốt đẹp hôm nay nhé! ✨',
        'Một điều biết ơn nhỏ có thể làm thay đổi cả ngày của bạn 🌟',
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    return scheduleDailyNotification(
        time,
        '💝 Nhắc nhở: Lọ Biết Ơn',
        randomMessage,
    );
}

/**
 * Lên lịch thông báo nhắc thở
 * @param {number} intervalMinutes - Khoảng cách giữa các lần nhắc (mặc định 2 giờ)
 * @returns {number} Timeout ID
 */
export function scheduleBreathingReminder(intervalMinutes = 120) {
    const messages = [
        'Hãy dành 2 phút để thở sâu nhé 🌬️',
        'Thở có ý thức giúp bạn bình tĩnh hơn 🧘',
        'Đã đến lúc nghỉ ngơi và thư giãn một chút 💙',
    ];

    let timeoutId = null;

    const scheduleNext = () => {
        timeoutId = setTimeout(() => {
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            sendNotification('🧘 Nhắc nhở: Thở & Thư giãn', {
                body: randomMessage,
            });
            scheduleNext();
        }, intervalMinutes * 60 * 1000);

        return timeoutId;
    };

    scheduleNext();
    return timeoutId;
}

/**
 * Clear tất cả scheduled notifications
 */
export function clearAllScheduledNotifications() {
    // Lưu danh sách timeout IDs để clear sau
    // Trong thực tế, nên dùng service worker hoặc lưu vào state
    console.log('[Notification] Cleared all scheduled notifications');
}

/**
 * Kiểm tra và khởi tạo lại scheduled notifications từ settings
 */
export async function initializeNotificationsFromSettings(settings) {
    if (!settings || Notification.permission !== 'granted') {
        return;
    }

    // Clear existing
    clearAllScheduledNotifications();

    // Schedule daily reminder
    if (settings.daily_reminder && settings.reminder_time) {
        scheduleGratitudeReminder(settings.reminder_time);
    }

    // Schedule sleep reminder (mặc định 22:00)
    if (settings.sleep_reminder) {
        scheduleSleepReminder(settings.sleep_reminder_time || '22:00');
    }

    // Breathing reminder sẽ được bật riêng nếu cần
    // scheduleBreathingReminder(120); // Mỗi 2 giờ
}

