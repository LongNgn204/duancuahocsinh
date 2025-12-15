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
    if (!db) {
      return null;
    }
    
    const tx = db.transaction('cache', 'readonly');
    if (!tx || !tx.store) {
      return null;
    }
    
    const cached = await tx.store.get(key);
    await tx.done;

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    // Expired, remove it
    if (cached) {
      try {
        const deleteTx = db.transaction('cache', 'readwrite');
        if (deleteTx && deleteTx.store) {
          await deleteTx.store.delete(key);
          await deleteTx.done;
        }
      } catch (deleteError) {
        // Ignore delete errors
        console.warn('[Cache] Delete expired cache failed:', deleteError);
      }
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
    if (!db) {
      return;
    }
    
    const tx = db.transaction('cache', 'readwrite');
    if (!tx || !tx.store) {
      return;
    }
    
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
  // Check if IndexedDB is available
  if (typeof indexedDB === 'undefined') {
    console.warn('[Cache] IndexedDB not available');
    return null;
  }

  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open('ban-dong-hanh-cache', 1);

      request.onerror = () => {
        console.warn('[Cache] IndexedDB open error:', request.error);
        resolve(null); // Return null instead of rejecting
      };
      
      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        try {
          const db = event.target.result;
          if (!db.objectStoreNames.contains('cache')) {
            const store = db.createObjectStore('cache', { keyPath: 'key' });
            store.createIndex('timestamp', 'timestamp');
          }
        } catch (upgradeError) {
          console.warn('[Cache] Upgrade error:', upgradeError);
        }
      };
    } catch (error) {
      console.warn('[Cache] IndexedDB initialization error:', error);
      resolve(null); // Return null instead of rejecting
    }
  });
}

