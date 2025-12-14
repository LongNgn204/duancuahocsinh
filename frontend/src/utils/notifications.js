// src/utils/notifications.js
// Chú thích: Utility cho Push Notifications và Service Worker

const API_BASE = import.meta.env.VITE_API_URL || 'https://ban-dong-hanh-worker.stu725114073.workers.dev';

/**
 * Đăng ký Service Worker
 */
export async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
        console.warn('[Notifications] Service Worker not supported');
        return null;
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
        });
        console.log('[Notifications] SW registered:', registration);
        return registration;
    } catch (error) {
        console.error('[Notifications] SW registration failed:', error);
        return null;
    }
}

/**
 * Yêu cầu quyền notification
 */
export async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.warn('[Notifications] Notifications not supported');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission === 'denied') {
        console.warn('[Notifications] Permission denied');
        return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
}

/**
 * Đăng ký Push Subscription
 */
export async function subscribeToPush(registration) {
    if (!registration || !registration.pushManager) {
        console.warn('[Notifications] Push Manager not available');
        return null;
    }

    try {
        // Lấy subscription hiện tại
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
            // Tạo subscription mới
            const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
            if (!vapidPublicKey) {
                console.warn('[Notifications] VAPID key not configured');
                return null;
            }

            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
            });
        }

        return subscription;
    } catch (error) {
        console.error('[Notifications] Subscription failed:', error);
        return null;
    }
}

/**
 * Lưu push subscription lên server
 */
export async function savePushSubscription(subscription, userId) {
    if (!subscription || !userId) return false;

    try {
        const response = await fetch(`${API_BASE}/api/data/notification-settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': String(userId)
            },
            body: JSON.stringify({
                push_subscription: subscription.toJSON()
            })
        });

        return response.ok;
    } catch (error) {
        console.error('[Notifications] Save subscription failed:', error);
        return false;
    }
}

/**
 * Lấy notification settings
 */
export async function getNotificationSettings(userId) {
    if (!userId) return null;

    try {
        const response = await fetch(`${API_BASE}/api/data/notification-settings`, {
            headers: {
                'X-User-Id': String(userId)
            }
        });
        const data = await response.json();
        return data.settings;
    } catch (error) {
        console.error('[Notifications] Get settings failed:', error);
        return null;
    }
}

/**
 * Lưu notification settings
 */
export async function saveNotificationSettings(userId, settings) {
    if (!userId) return false;

    try {
        const response = await fetch(`${API_BASE}/api/data/notification-settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': String(userId)
            },
            body: JSON.stringify(settings)
        });

        return response.ok;
    } catch (error) {
        console.error('[Notifications] Save settings failed:', error);
        return false;
    }
}

/**
 * Helper: Convert VAPID key từ base64 sang Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

/**
 * Gửi test notification
 */
export async function sendTestNotification() {
    if (Notification.permission !== 'granted') {
        await requestNotificationPermission();
    }

    if (Notification.permission === 'granted') {
        new Notification('Bạn Đồng Hành', {
            body: 'Đây là thông báo thử nghiệm! 🎉',
            icon: '/logo.png',
            badge: '/logo.png',
            tag: 'test'
        });
    }
}

