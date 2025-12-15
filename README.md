# Bạn Đồng Hành – Ứng dụng hỗ trợ tâm lý học đường

[![Cloudflare Pages](https://img.shields.io/badge/Frontend-Cloudflare%20Pages-F38020?logo=cloudflare)](https://ban-dong-hanh.pages.dev)
[![Cloudflare Workers](https://img.shields.io/badge/Backend-Cloudflare%20Workers-F38020?logo=cloudflare)](https://ban-dong-hanh-worker.stu725114073.workers.dev)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite)](https://vitejs.dev)

Nền tảng web giúp học sinh Việt Nam (12–18 tuổi) chăm sóc sức khỏe tinh thần, xây dựng thói quen tích cực và hỗ trợ khẩn cấp khi cần.

## Demo

- 🌐 Ứng dụng: [https://ban-dong-hanh.pages.dev](https://ban-dong-hanh.pages.dev)
- ⚙️ API: `https://ban-dong-hanh-worker.stu725114073.workers.dev`

---

## Tính năng chính

| # | Tính năng | Mô tả |
|---|-----------|-------|
| 1 | **Trang chủ** | Lời chào theo thời gian, chế độ FOCUS cho học sinh ADHD, quick access cards |
| 2 | **Liều thuốc tinh thần** | Bài tập thở bong bóng 30s, câu động viên theo 4 nhóm cảm xúc |
| 3 | **Góc An Yên** | Bài tập thở khoa học, Bộ thẻ An Yên (Bình Yên, Việc làm nhỏ, Nhắn nhủ), TTS hướng dẫn |
| 4 | **Lọ Biết Ơn** | Streak đếm ngày viết, gợi ý nội dung hàng ngày, sparkline 30 ngày |
| 5 | **Nhanh tay lẹ mắt** | Chọn hình tương ứng (30-60s), Ong tập bay (theo dõi ong dừng 3s) |
| 6 | **Góc Nhỏ** | Thông báo nhắc nhở, cài đặt thời gian nhắc việc, Push Notification |
| 7 | **Hỗ trợ khẩn cấp** | Phát hiện từ khóa tiêu cực, hiển thị hotline + map bệnh viện gần nhất |
| 8 | **Trò chuyện AI** | Chat văn bản/giọng nói, TTS phát âm thanh, SOS detection |
| 9 | **Kể chuyện** | Truyện ngắn với bài học, chế độ kể nhanh/chậm, TTS đọc truyện |

---

## Kiến trúc & Tech stack

- **Frontend**: React 19, Vite 6, Tailwind CSS, Framer Motion, React Router 7
- **Backend**: Cloudflare Workers, D1 (SQLite), Workers AI (Llama 3.1 8B)
- **Triển khai**: Cloudflare Pages (web) + Workers (API)

## Cấu trúc thư mục

```
duancuahocsinh/
├── frontend/
│   ├── src/
│   │   ├── components/   # UI, chat, breathing, games, gratitude, sos...
│   │   ├── pages/        # Dashboard, Chat, Wellness, Stories, Games, Corner...
│   │   ├── hooks/        # AI, voice, offline, theme...
│   │   └── utils/        # API client, SOS detector, notifications...
│   └── package.json
├── backend/
│   ├── src/              # router, ai-proxy, auth, data-api...
│   ├── schema.sql        # D1 schema
│   └── wrangler.toml     # Config
└── README.md
```

## Thiết lập nhanh

```bash
git clone https://github.com/LongNgn204/duancuahocsinh.git
cd duancuahocsinh
```

### Frontend
```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

### Backend (Cloudflare Workers)
```bash
cd backend
npm install
wrangler d1 create ban-dong-hanh-db
wrangler d1 execute ban-dong-hanh-db --file=./schema.sql
wrangler dev  # http://localhost:8787
```

## Cấu hình môi trường

### Frontend (`frontend/.env`)
- `VITE_API_URL`: URL Workers API
- `VITE_VAPID_PUBLIC_KEY`: Web push notifications

### Backend (`backend/wrangler.toml`)
- `ALLOW_ORIGIN`: CORS origins
- `MODEL`: Workers AI model
- `JWT_SECRET`: Auth token signing

## Lệnh quan trọng

| Frontend | Backend |
|----------|---------|
| `npm run dev` | `npm run dev` |
| `npm run build` | `npm run deploy` |
| `npm run deploy` | `npm run tail` |

## Quyền riêng tư & An toàn

- Không lưu PII, dữ liệu có thể export/xóa
- SOS detector bảo vệ người dùng trẻ
- AI không chẩn đoán hay kê thuốc

## Liên hệ

- Email: `stu725114073@hnue.edu.vn`
- Hotline: `0896636181` (24/7)
- Website: [https://ban-dong-hanh.pages.dev](https://ban-dong-hanh.pages.dev)

---

Made with ❤️ for Vietnamese students — Last updated: December 15, 2025
