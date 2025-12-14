# Plan Sync Tốt Nhất - Bạn Đồng Hành

## Mục tiêu
Đảm bảo TẤT CẢ dữ liệu khi học sinh sử dụng các chức năng đều được sync lên backend ngay lập tức, không có dữ liệu ảo.

## Các chức năng cần sync

### ✅ Đã có sync
1. **Gratitude (Lọ Biết Ơn)** - `addGratitude()` → sync ngay
2. **Journal (Nhật ký cảm xúc)** - `addJournalEntry()` → sync ngay
3. **Focus Timer** - `saveFocusSession()` → sync khi hoàn thành
4. **Sleep Helper** - `saveSleepLog()` → sync ngay

### ❌ Chưa có sync
1. **Breathing (Thở)** - Cần thêm sync khi hoàn thành session
2. **Chat** - Có thể cần sync (nếu cần lưu lịch sử)
3. **Games** - Có thể cần sync (nếu cần lưu điểm)

## Strategy Sync

### 1. Immediate Sync (Sync ngay)
- Khi user thực hiện action (thêm gratitude, journal, sleep log)
- Gọi API ngay lập tức
- Nếu fail → lưu vào queue để retry

### 2. Background Sync (Sync nền)
- Sync dữ liệu local khi login
- Retry failed syncs mỗi 5 phút
- Sync khi app focus (visibility change)

### 3. Optimistic Updates
- Update UI ngay lập tức
- Sync background
- Rollback nếu sync fail

## Implementation

### A. Breathing Session Sync
```javascript
// Khi hoàn thành breathing session
const onComplete = async () => {
  const duration = elapsed; // seconds
  const exerciseType = patternKey; // 'four_seven_eight', 'box', etc.
  
  // Save local
  const newSession = { ts: Date.now(), duration, type: exerciseType };
  const updated = [...sessions, newSession];
  setSessions(updated);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  
  // Sync to backend
  if (isLoggedIn()) {
    try {
      await saveBreathingSession(exerciseType, duration);
      console.log('[Breathing] Synced to server');
    } catch (err) {
      console.error('[Breathing] Sync failed:', err);
      // Queue for retry
      scheduleSync(5000);
    }
  }
};
```

### B. Dashboard - Real Data cho "Tiến độ tuần này"
```javascript
// Lấy dữ liệu thật từ backend cho 7 ngày qua
const getWeekProgress = async () => {
  if (!isLoggedIn()) return null;
  
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Lấy breathing sessions trong 7 ngày
  const breathing = await getBreathingSessions(100);
  const breathingThisWeek = breathing.items?.filter(s => 
    new Date(s.created_at) >= weekAgo
  ) || [];
  const breathingDays = new Set(
    breathingThisWeek.map(s => new Date(s.created_at).toDateString())
  ).size;
  
  // Lấy gratitude trong 7 ngày
  const gratitude = await getGratitudeList(100);
  const gratitudeThisWeek = gratitude.items?.filter(g => 
    new Date(g.created_at) >= weekAgo
  ) || [];
  const gratitudeDays = new Set(
    gratitudeThisWeek.map(g => new Date(g.created_at).toDateString())
  ).size;
  
  // Lấy journal trong 7 ngày
  const journal = await getJournalList(100);
  const journalThisWeek = journal.items?.filter(j => 
    new Date(j.created_at) >= weekAgo
  ) || [];
  const journalDays = new Set(
    journalThisWeek.map(j => new Date(j.created_at).toDateString())
  ).size;
  
  return {
    breathing: { days: breathingDays, max: 7 },
    gratitude: { days: gratitudeDays, max: 7 },
    journal: { days: journalDays, max: 7 },
  };
};
```

### C. Auto-Sync Queue
```javascript
// Queue failed syncs
const syncQueue = [];

function queueSync(action, data) {
  syncQueue.push({ action, data, retries: 0, timestamp: Date.now() });
  localStorage.setItem('sync_queue', JSON.stringify(syncQueue));
}

async function processSyncQueue() {
  if (!isLoggedIn() || syncQueue.length === 0) return;
  
  const queue = JSON.parse(localStorage.getItem('sync_queue') || '[]');
  const now = Date.now();
  
  for (const item of queue) {
    // Retry sau 5 phút
    if (now - item.timestamp < 5 * 60 * 1000) continue;
    if (item.retries >= 3) {
      // Remove sau 3 lần retry
      syncQueue.splice(syncQueue.indexOf(item), 1);
      continue;
    }
    
    try {
      await item.action(item.data);
      syncQueue.splice(syncQueue.indexOf(item), 1);
    } catch (err) {
      item.retries++;
      item.timestamp = now;
    }
  }
  
  localStorage.setItem('sync_queue', JSON.stringify(syncQueue));
}

// Chạy mỗi 5 phút
setInterval(processSyncQueue, 5 * 60 * 1000);
```

## Checklist

- [x] Gratitude sync
- [x] Journal sync
- [x] Focus Timer sync
- [x] Sleep Helper sync
- [ ] Breathing sync ← CẦN SỬA
- [ ] Dashboard real data ← CẦN SỬA
- [ ] Auto-sync queue
- [ ] Error handling & retry
- [ ] Offline support

## Testing

1. Test offline → data lưu local → sync khi online
2. Test sync fail → retry sau 5 phút
3. Test duplicate prevention
4. Test Dashboard hiển thị dữ liệu thật

