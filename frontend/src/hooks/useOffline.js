// frontend/src/hooks/useOffline.js
// Chú thích: Hook quản lý offline state và sync queue
import { useState, useEffect, useCallback } from 'react';

/**
 * Hook để detect offline/online state và quản lý sync queue
 */
export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncQueue, setSyncQueue] = useState([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load sync queue from IndexedDB
  useEffect(() => {
    loadSyncQueue().then(queue => {
      if (queue.length > 0) {
        setSyncQueue(queue);
      }
    });
  }, []);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && syncQueue.length > 0) {
      processSyncQueue();
    }
  }, [isOnline, syncQueue.length]);

  return {
    isOnline,
    syncQueue,
    addToSyncQueue: useCallback(addToSyncQueue, []),
    processSyncQueue: useCallback(processSyncQueue, []),
  };
}

/**
 * Add request to sync queue (IndexedDB)
 */
async function addToSyncQueue(method, url, body) {
  try {
    const db = await openDB();
    const tx = db.transaction('sync_queue', 'readwrite');
    await tx.store.add({
      method,
      url,
      body,
      timestamp: Date.now(),
    });
    await tx.done;
  } catch (error) {
    console.error('[Offline] Failed to add to sync queue:', error);
  }
}

/**
 * Process sync queue when online
 */
async function processSyncQueue() {
  try {
    const db = await openDB();
    const tx = db.transaction('sync_queue', 'readonly');
    const queue = await tx.store.getAll();
    await tx.done;

    for (const item of queue) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.body),
        });

        if (response.ok) {
          // Remove from queue
          const deleteTx = db.transaction('sync_queue', 'readwrite');
          await deleteTx.store.delete(item.timestamp);
          await deleteTx.done;
        }
      } catch (error) {
        console.error('[Offline] Sync failed for item:', error);
        // Keep in queue for retry
      }
    }
  } catch (error) {
    console.error('[Offline] Failed to process sync queue:', error);
  }
}

/**
 * Load sync queue from IndexedDB
 */
async function loadSyncQueue() {
  try {
    const db = await openDB();
    const tx = db.transaction('sync_queue', 'readonly');
    const queue = await tx.store.getAll();
    await tx.done;
    return queue;
  } catch (error) {
    console.error('[Offline] Failed to load sync queue:', error);
    return [];
  }
}

/**
 * Open IndexedDB
 */
async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ban-dong-hanh-db', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'timestamp' });
      }
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache', { keyPath: 'key' });
      }
    };
  });
}

