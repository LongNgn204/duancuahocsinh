---
description: Cleanup old files after deployment
---

# Post-Deploy Cleanup Workflow

Sau khi deploy code mới, chạy workflow này để xóa các file cũ không còn sử dụng.

## Bước 1: Kiểm tra file không được import

// turbo
```bash
cd frontend && npx depcheck --ignores="@vitejs/*,vite,eslint*" --skip-missing
```

## Bước 2: Tìm file Gemini/cũ còn sót

// turbo
```bash
grep -r "useGeminiVoice\|generativelanguage.googleapis\|GEMINI_API_KEY" frontend/src --include="*.js" --include="*.jsx" -l
```

## Bước 3: Build test để verify

// turbo
```bash
cd frontend && npm run build
```

## Bước 4: Deploy backend

```bash
cd backend && npm run deploy
```

## Bước 5: Xóa file cũ (nếu tìm thấy)

Các file thường cần xóa sau migration:
- `frontend/src/hooks/useGeminiVoice.js` - đã thay bằng `useVoiceAgentCF.js`
- Bất kỳ file nào chứa `GEMINI_API_KEY` trực tiếp

```bash
# Xóa file cũ (chạy thủ công sau khi verify)
Remove-Item "frontend/src/hooks/useGeminiVoice.js" -Force -ErrorAction SilentlyContinue
```

## Bước 6: Commit changes

```bash
git add -A && git commit -m "chore: cleanup old Gemini files after Workers AI migration"
```
