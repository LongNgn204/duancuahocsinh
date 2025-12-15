// src/utils/version-manager.js
// Chú thích: Quản lý version và tự động clear cache/storage khi có version mới

const VERSION_KEY = 'app_version';
const CURRENT_VERSION = import.meta.env.VITE_APP_VERSION || Date.now().toString();

/**
 * Kiểm tra và xử lý khi có version mới
 */
export function checkVersionUpdate() {
  const storedVersion = localStorage.getItem(VERSION_KEY);

  if (storedVersion && storedVersion !== CURRENT_VERSION) {
    console.log('[Version] New version detected:', CURRENT_VERSION, 'Old:', storedVersion);
    
    // Clear tất cả storage
    clearAllStorage();
    
    // Reload page để load code mới
    window.location.reload();
    
    return true;
  }

  // Lưu version hiện tại
  if (!storedVersion || storedVersion !== CURRENT_VERSION) {
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
  }

  return false;
}

/**
 * Clear tất cả storage (localStorage, IndexedDB, Cache)
 */
export function clearAllStorage() {
  try {
    // Clear localStorage (trừ một số keys quan trọng nếu cần)
    const keysToKeep = []; // Có thể thêm keys cần giữ lại
    const allKeys = Object.keys(localStorage);
    allKeys.forEach((key) => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });

    // Clear IndexedDB
    if ('indexedDB' in window) {
      indexedDB.databases().then((databases) => {
        databases.forEach((db) => {
          indexedDB.deleteDatabase(db.name);
        });
      });
    }

    // Clear Service Worker cache (nếu có)
    if ('caches' in window) {
      caches.keys().then((cacheNames) => {
        cacheNames.forEach((cacheName) => {
          caches.delete(cacheName);
        });
      });
    }

    console.log('[Version] All storage cleared');
  } catch (error) {
    console.error('[Version] Error clearing storage:', error);
  }
}

/**
 * Lắng nghe message từ Service Worker
 */
export function setupVersionListener() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'CLEAR_STORAGE') {
        console.log('[Version] Service Worker requested storage clear:', event.data.version);
        clearAllStorage();
        // Reload sau khi clear
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    });
  }
}

/**
 * Khởi tạo version manager
 */
export function initVersionManager() {
  // Setup listener cho Service Worker messages
  setupVersionListener();
  
  // Check version khi app load
  checkVersionUpdate();
  
  // Check version định kỳ (mỗi 5 phút)
  setInterval(() => {
    checkVersionUpdate();
  }, 5 * 60 * 1000);
}

