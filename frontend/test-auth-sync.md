# Test Đăng Nhập và Sync

## Các thay đổi đã thực hiện:

1. **Backend Login** - Giờ trả về `last_login` trong response
2. **Sửa Circular Import** - Loại bỏ circular import trong login function
3. **Duplicate Prevention** - Thêm logic kiểm tra duplicate khi sync journal và gratitude
4. **Enhanced Logging** - Thêm logging để debug sync process

## Cách test:

### 1. Test Đăng Nhập

1. Mở DevTools Console (F12)
2. Đăng nhập với username mới hoặc đã có
3. Kiểm tra console logs:
   - `[Login] Auto-synced local data:` - Nếu có dữ liệu local
   - `[Login] No local data to sync:` - Nếu không có dữ liệu
4. Kiểm tra response từ API:
   - Response phải có `user.last_login` (không phải null nếu đã đăng nhập trước đó)
   - `last_login` phải là timestamp mới nhất

### 2. Test Sync

1. Tạo dữ liệu local (chưa đăng nhập):
   - Thêm nhật ký cảm xúc
   - Thêm lọ biết ơn
   - Thêm sleep log
2. Đăng nhập
3. Kiểm tra console:
   - `[Sync] Syncing local data to server for user: <id>`
   - `[Sync] Sync result: { synced: true, imported: {...} }`
4. Kiểm tra Admin Dashboard:
   - Vào tab "Tất cả người dùng"
   - Xem số journal entries, gratitude entries của user
5. Kiểm tra localStorage:
   - Các keys như `mood_journal_v1`, `gratitude_entries_v1` phải bị xóa sau khi sync

### 3. Test Duplicate Prevention

1. Sync dữ liệu lần 1
2. Tạo lại dữ liệu local giống hệt
3. Sync lần 2
4. Kiểm tra database - không được có duplicate entries

### 4. Test Last Login Update

1. Đăng nhập lần 1 - ghi nhận `last_login`
2. Đợi vài giây
3. Đăng nhập lần 2
4. Kiểm tra Admin Dashboard:
   - Tab "Tất cả người dùng"
   - "Lần đăng nhập cuối" phải cập nhật

## Kiểm tra Backend Logs

Nếu có quyền truy cập backend logs, kiểm tra:
- `[Auth] Login error:` - Nếu có lỗi
- `[Import] User <id> importing data:` - Khi sync
- `[Data] importData error:` - Nếu có lỗi import

## Troubleshooting

### Login không cập nhật last_login:
- Kiểm tra database connection
- Kiểm tra SQL query có chạy không
- Xem backend logs

### Sync không hoạt động:
- Kiểm tra `isLoggedIn()` trả về true
- Kiểm tra localStorage có dữ liệu không
- Kiểm tra network tab xem API call có thành công không
- Xem console logs để biết lỗi cụ thể

### Duplicate entries:
- Kiểm tra logic duplicate check trong importData
- Có thể cần thêm unique constraint trong database

