// frontend/src/services/cache.js
// Chú thích: Client-side caching service với IndexedDB
// Cache API responses để giảm network calls

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached response
 * @param {string} key - Cache key (URL)
 * @returns {Promise<any|null>} Cached data or null
 */
export async function getCache(key) {
  try {
    const db = await openDB();
    const tx = db.transaction('cache', 'readonly');
    const cached = await tx.store.get(key);
    await tx.done;

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    // Expired, remove it
    if (cached) {
      const deleteTx = db.transaction('cache', 'readwrite');
      await deleteTx.store.delete(key);
      await deleteTx.done;
    }

    return null;
  } catch (error) {
    console.warn('[Cache] Get cache failed:', error);
    return null;
  }
}

/**
 * Set cache
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 */
export async function setCache(key, data) {
  try {
    const db = await openDB();
    const tx = db.transaction('cache', 'readwrite');
    await tx.store.put({
      key,
      data,
      timestamp: Date.now(),
    });
    await tx.done;
  } catch (error) {
    console.warn('[Cache] Set cache failed:', error);
  }
}

/**
 * Clear cache
 */
export async function clearCache() {
  try {
    const db = await openDB();
    const tx = db.transaction('cache', 'readwrite');
    await tx.store.clear();
    await tx.done;
  } catch (error) {
    console.warn('[Cache] Clear cache failed:', error);
  }
}

/**
 * Open IndexedDB
 */
async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ban-dong-hanh-cache', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('cache')) {
        const store = db.createObjectStore('cache', { keyPath: 'key' });
        store.createIndex('timestamp', 'timestamp');
      }
    };
  });
}

