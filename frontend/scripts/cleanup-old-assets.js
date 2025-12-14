// scripts/cleanup-old-assets.js
// Script để xóa các file assets cũ sau khi build mới
// Cloudflare sẽ tự động nhận diện và xóa các file không còn được reference

import { readFileSync, readdirSync, statSync, unlinkSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DIST_DIR = join(__dirname, '..', 'dist');
const ASSETS_DIR = join(DIST_DIR, 'assets');

// Đọc index.html để lấy danh sách file assets đang được sử dụng
function getReferencedAssets() {
  const indexPath = join(DIST_DIR, 'index.html');
  
  if (!existsSync(indexPath)) {
    console.log('⚠️  index.html không tồn tại, bỏ qua cleanup');
    return new Set();
  }

  const htmlContent = readFileSync(indexPath, 'utf-8');
  const referencedAssets = new Set();

  // Tìm tất cả các file được reference trong HTML (CSS, JS)
  const assetRegex = /assets\/([^"'\s)]+)/g;
  let match;
  while ((match = assetRegex.exec(htmlContent)) !== null) {
    referencedAssets.add(match[1]);
  }

  return referencedAssets;
}

// Xóa các file không còn được reference
function cleanupOldAssets() {
  if (!existsSync(ASSETS_DIR)) {
    console.log('⚠️  Thư mục assets không tồn tại');
    return;
  }

  const referencedAssets = getReferencedAssets();
  const allFiles = readdirSync(ASSETS_DIR);
  
  let deletedCount = 0;
  let keptCount = 0;
  let totalSize = 0;

  console.log(`\n🧹 Bắt đầu cleanup assets...`);
  console.log(`📦 Tìm thấy ${allFiles.length} file trong assets/`);
  console.log(`✅ ${referencedAssets.size} file đang được sử dụng\n`);

  for (const file of allFiles) {
    const filePath = join(ASSETS_DIR, file);
    
    try {
      const stats = statSync(filePath);
      
      // Kiểm tra xem file có được reference không
      const isReferenced = referencedAssets.has(file);
      
      if (!isReferenced) {
        // Xóa file không còn được sử dụng
        unlinkSync(filePath);
        deletedCount++;
        totalSize += stats.size;
        console.log(`  ❌ Đã xóa: ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
      } else {
        keptCount++;
      }
    } catch (error) {
      console.error(`  ⚠️  Lỗi khi xử lý ${file}:`, error.message);
    }
  }

  console.log(`\n✨ Hoàn thành cleanup:`);
  console.log(`   ✅ Giữ lại: ${keptCount} file`);
  console.log(`   ❌ Đã xóa: ${deletedCount} file`);
  console.log(`   💾 Tiết kiệm: ${(totalSize / 1024 / 1024).toFixed(2)} MB\n`);
}

// Chạy cleanup
try {
  cleanupOldAssets();
} catch (error) {
  console.error('❌ Lỗi khi cleanup:', error);
  process.exit(1);
}


