// scripts/cleanup.js
// Chú thích: Script tự động xóa file deprecated sau khi deploy
// Chạy: node scripts/cleanup.js
// Tích hợp vào: npm run deploy (postdeploy)

import fs from 'fs';
import path from 'path';

// ============================================================================
// DANH SÁCH FILE DEPRECATED - CẦN XÓA SAU KHI DEPLOY CODE MỚI
// ============================================================================
const DEPRECATED_FILES = [
    // Old Gemini hooks - đã thay bằng useVoiceAgentCF
    '../frontend/src/hooks/useGeminiVoice.js',

    // Có thể thêm file khác ở đây khi migration
    // '../frontend/src/old-file.js',
];

// ============================================================================
// DANH SÁCH PATTERN ĐỂ TÌM FILE KHÔNG DÙNG
// ============================================================================
const DEPRECATED_PATTERNS = [
    /useGeminiVoice/,
    /gemini-live/i,
    /deepgram.*voice/i,
];

// ============================================================================
// MAIN CLEANUP FUNCTION
// ============================================================================
function cleanup() {
    console.log('🧹 Bắt đầu cleanup files deprecated...\n');

    let deletedCount = 0;
    let notFoundCount = 0;

    for (const relativePath of DEPRECATED_FILES) {
        const fullPath = path.resolve(import.meta.dirname, relativePath);

        if (fs.existsSync(fullPath)) {
            try {
                fs.unlinkSync(fullPath);
                console.log(`✅ Đã xóa: ${relativePath}`);
                deletedCount++;
            } catch (err) {
                console.error(`❌ Lỗi xóa ${relativePath}:`, err.message);
            }
        } else {
            console.log(`⏭️  Không tồn tại (đã xóa trước đó): ${relativePath}`);
            notFoundCount++;
        }
    }

    console.log('\n📊 Kết quả:');
    console.log(`   - Đã xóa: ${deletedCount} file(s)`);
    console.log(`   - Không tồn tại: ${notFoundCount} file(s)`);
    console.log('\n✨ Cleanup hoàn tất!\n');
}

// ============================================================================
// RUN
// ============================================================================
cleanup();
