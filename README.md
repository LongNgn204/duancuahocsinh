# Bạn Đồng Hành – Ứng dụng hỗ trợ tâm lý học đường

[![Cloudflare Pages](https://img.shields.io/badge/Frontend-Cloudflare%20Pages-F38020?logo=cloudflare)](https://ban-dong-hanh.pages.dev)
[![Cloudflare Workers](https://img.shields.io/badge/Backend-Cloudflare%20Workers-F38020?logo=cloudflare)](https://ban-dong-hanh-worker.stu725114073.workers.dev)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite)](https://vitejs.dev)

Nền tảng web giúp học sinh Việt Nam (12–18 tuổi) chăm sóc sức khỏe tinh thần, xây dựng thói quen tích cực và kết nối cộng đồng an toàn.

## Demo

- 🌐 Ứng dụng: [https://ban-dong-hanh.pages.dev](https://ban-dong-hanh.pages.dev)
- ⚙️ API: `https://ban-dong-hanh-worker.stu725114073.workers.dev`

## Giới thiệu nhanh

- 🤖 AI mentor: trò chuyện an toàn, có bộ lọc prompt injection và giới hạn token.
- 🧘 Sức khỏe tinh thần: bài tập thở, góc an yên, thẻ wellness, sleep log.
- 🎯 Thói quen & gamification: journal, gratitude jar, focus timer, achievements, XP/level.
- 💬 Cộng đồng ẩn danh: diễn đàn có upvote/báo cáo, moderator/admin dashboard.
- 🆘 An toàn: SOS detector, hotline khẩn cấp, logging ẩn danh.

## Kiến trúc & Tech stack

- **Frontend**: React 19, Vite 6, Tailwind CSS 4, Framer Motion, React Router 7, Zustand, Playwright, Vitest.
- **Backend**: Cloudflare Workers (router, auth, forum, data API), D1 (SQLite), Workers AI (Llama 3.1 8B), JWT admin, rate limiting + CORS, AI prompt safety.
- **Triển khai**: Cloudflare Pages (web) + Workers (API), Wrangler CLI, D1 migration từ `schema.sql`.

## Cấu trúc thư mục

```
duancuahocsinh/
├── frontend/            # Ứng dụng React + Vite
│   ├── src/
│   │   ├── components/  # UI, chat, breathing, games, gratitude, SOS, layout...
│   │   ├── pages/       # Dashboard, Chat, Forum, Focus, Journal, Sleep, Admin...
│   │   ├── hooks/       # AI, voice, offline, theme...
│   │   ├── utils/       # API client, detector, notifications, caching...
│   │   └── services/    # Local storage/cache helpers
│   ├── tests/           # Playwright E2E
│   └── package.json
├── backend/             # Cloudflare Workers
│   ├── workers/         # router, ai-proxy, auth, data-api, forum-api, risk...
│   ├── scripts/         # cleanup, tooling
│   ├── schema.sql       # D1 schema
│   └── wrangler.toml    # Binding & env config
├── docs/                # PROMPTS.md, DEPLOY.md, deploy-info.json
├── plan.md, PLAN_TINH_CHINH.md, QUICK_TEST.md, SYNC_PLAN.md
└── README.md
```

## Yêu cầu

- Node.js 18+ và npm.
- Tài khoản Cloudflare, Wrangler CLI (`npm i -g wrangler`).
- Quyền tạo D1 database (hoặc dùng DB sẵn có).

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

# Khởi tạo D1 (chỉ chạy lần đầu)
wrangler d1 create ban-dong-hanh-db
# Cập nhật database_id tương ứng trong wrangler.toml

# Migration
wrangler d1 execute ban-dong-hanh-db --file=./schema.sql

# Chạy local
wrangler dev    # mặc định cổng 8787
```

## Cấu hình môi trường

### Frontend (`frontend/.env`)

- `VITE_API_URL` (bắt buộc): URL Workers API, ví dụ `http://localhost:8787` hoặc endpoint production.
- `VITE_AI_PROXY_URL` (tùy chọn): fallback endpoint cho AI proxy.
- `VITE_VAPID_PUBLIC_KEY` (tùy chọn): bật web push notifications.
- `VITE_APP_VERSION` (tùy chọn): hiển thị phiên bản build.

### Backend (`backend/wrangler.toml`)

- `ALLOW_ORIGIN`: danh sách origin cho CORS (ví dụ `http://localhost:5173,https://ban-dong-hanh.pages.dev`).
- `MODEL`: model Workers AI, mặc định `@cf/meta/llama-3.1-8b-instruct`.
- `MONTHLY_TOKEN_LIMIT`, `MAX_TOKEN_BUDGET`: giới hạn chi phí AI.
- `ADMIN_PASSWORD`, `JWT_SECRET`: thông tin đăng nhập & ký JWT cho dashboard/admin API.
- `[[d1_databases]]`: binding `ban_dong_hanh_db` trỏ tới database ID đã tạo.

## Lệnh quan trọng

### Frontend

- `npm run dev` — chạy dev server.
- `npm run build` — build sản phẩm.
- `npm run lint` — kiểm tra ESLint.
- `npm run test` — chạy Vitest.
- `npm run e2e` — chạy Playwright (cần `npm run e2e:install` lần đầu).
- `npm run deploy` — build + deploy Pages.

### Backend

- `npm run dev` — chạy worker local (wrangler dev).
- `npm run deploy` — deploy worker.
- `npm test` — Vitest cho worker.
- `npm run tail` — xem log realtime.

## Testing

- **Unit/Integration**: `cd backend && npm test`, `cd frontend && npm test`.
- **E2E**: `cd frontend && npm run e2e:install && npm run e2e`.
- **Kiểm thử nhanh login**: `node test-login-api.js` (sử dụng `API_BASE=...` để trỏ tới môi trường mong muốn) hoặc xem hướng dẫn trong `QUICK_TEST.md`.

## Triển khai

- **Frontend (Pages)**: `cd frontend && npm run deploy` (deploy từ thư mục `dist`).
- **Backend (Workers)**: `cd backend && npm run deploy`.
- **Migration DB**: `wrangler d1 execute ban-dong-hanh-db --file=./schema.sql --remote`.

## Quyền riêng tư & an toàn

- Không lưu PII; dữ liệu cá nhân (gratitude, journal, achievements) được giới hạn và có thể export/xóa.
- SOS detector & bộ lọc nội dung để bảo vệ người dùng trẻ; AI không chẩn đoán hay kê thuốc.
- Admin dashboard hỗ trợ báo cáo, khóa bài, ban user, xem log SOS.

## Liên hệ

- Email: `stu725114073@hnue.edu.vn`
- Hotline: `0896636181` (24/7)
- Website: [https://duancuahocsinh.pages.dev](https://duancuahocsinh.pages.dev)

---

Made with ❤️ for Vietnamese students — Last updated: December 15, 2025
