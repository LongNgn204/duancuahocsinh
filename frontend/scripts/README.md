# Scripts

## cleanup-old-assets.js

Script tự động xóa các file assets cũ sau khi build mới.

### Cách sử dụng:

1. **Chạy thủ công sau khi build:**
   ```bash
   npm run cleanup
   ```

2. **Build và cleanup tự động:**
   ```bash
   npm run build:clean
   ```

### Cách hoạt động:

- Script đọc file `dist/index.html` để tìm tất cả các file assets đang được reference
- So sánh với các file trong thư mục `dist/assets/`
- Xóa các file không còn được sử dụng
- Hiển thị thống kê về số file đã xóa và dung lượng tiết kiệm

### Lợi ích:

- Giảm dung lượng thư mục `dist/` trước khi deploy
- Cloudflare Pages sẽ chỉ upload các file mới
- Tự động cleanup các file cũ không còn cần thiết


