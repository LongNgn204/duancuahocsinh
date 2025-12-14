// Service Worker cho Push Notifications
// Chú thích: Xử lý push notifications và background sync

const CACHE_NAME = 'ban-dong-hanh-v1';
const API_BASE = 'https://ban-dong-hanh-worker.stu725114073.workers.dev';

// Install event - Cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');
    self.skipWaiting();
});

// Activate event - Clean old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Push event - Xử lý push notifications từ server
self.addEventListener('push', (event) => {
    console.log('[SW] Push received:', event);

    let notificationData = {
        title: 'Bạn Đồng Hành',
        body: 'Bạn có thông báo mới',
        icon: '/logo.png',
        badge: '/logo.png',
        tag: 'default',
        requireInteraction: false,
        data: {}
    };

    // Parse push data nếu có
    if (event.data) {
        try {
            const data = event.data.json();
            notificationData = {
                ...notificationData,
                ...data,
                data: data.data || {}
            };
        } catch (e) {
            // Nếu không phải JSON, dùng text
            notificationData.body = event.data.text();
        }
    }

    event.waitUntil(
        self.registration.showNotification(notificationData.title, {
            body: notificationData.body,
            icon: notificationData.icon,
            badge: notificationData.badge,
            tag: notificationData.tag,
            requireInteraction: notificationData.requireInteraction,
            data: notificationData.data,
            actions: notificationData.actions || [],
            vibrate: [200, 100, 200],
            timestamp: Date.now()
        })
    );
});

// Notification click event - Xử lý khi user click vào notification
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event);

    event.notification.close();

    const data = event.notification.data || {};
    const action = event.action || 'default';

    // Xử lý các action khác nhau
    if (action === 'open') {
        // Mở app
        event.waitUntil(
            clients.openWindow(data.url || '/')
        );
    } else if (action === 'breathing') {
        // Mở trang thở
        event.waitUntil(
            clients.openWindow('/breathing')
        );
    } else if (action === 'gratitude') {
        // Mở lọ biết ơn
        event.waitUntil(
            clients.openWindow('/gratitude')
        );
    } else {
        // Default: mở app
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
                // Nếu đã có window mở, focus vào đó
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Nếu chưa có, mở window mới
                if (clients.openWindow) {
                    return clients.openWindow(data.url || '/');
                }
            })
        );
    }
});

// Background sync - Đồng bộ dữ liệu khi online
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);

    if (event.tag === 'sync-data') {
        event.waitUntil(
            syncLocalData()
        );
    }
});

// Helper: Sync local data to server
async function syncLocalData() {
    try {
        // Lấy user từ IndexedDB hoặc cache
        const cache = await caches.open(CACHE_NAME);
        const response = await cache.match('/user');
        
        if (!response) return;

        const user = await response.json();
        if (!user || !user.id) return;

        // Gọi API sync (giả sử có endpoint này)
        const syncResponse = await fetch(`${API_BASE}/api/data/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': String(user.id)
            },
            body: JSON.stringify({
                // Data to sync
            })
        });

        if (syncResponse.ok) {
            console.log('[SW] Sync successful');
        }
    } catch (error) {
        console.error('[SW] Sync error:', error);
    }
}

// Message event - Xử lý messages từ main thread
self.addEventListener('message', (event) => {
    console.log('[SW] Message received:', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

