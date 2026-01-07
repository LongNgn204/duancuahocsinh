<p align="center">
  <img src="./Thiết kế chưa có tên.png" alt="Bạn Đồng Hành Logo" width="180"/>
</p>

<h1 align="center">Bạn Đồng Hành</h1>

<p align="center">
  <strong>Nền tảng hỗ trợ sức khỏe tinh thần dành cho học sinh Việt Nam</strong>
</p>

<p align="center">
  <a href="https://bandonghanh.pages.dev">🌐 Demo trực tuyến</a> |
  <a href="#tính-năng-chính">✨ Tính năng</a> |
  <a href="#công-nghệ-sử-dụng">🛠 Công nghệ</a> |
  <a href="#cài-đặt">📦 Cài đặt</a>
</p>

---

## 📌 Giới thiệu

**Bạn Đồng Hành** là ứng dụng web **miễn phí** giúp học sinh Việt Nam (12-18 tuổi) chăm sóc sức khỏe tinh thần, xây dựng thói quen tích cực và nhận được hỗ trợ khi cần thiết.

### Sứ mệnh

| Mục tiêu | Mô tả |
|----------|-------|
| 💭 **Chăm sóc tinh thần** | Bài tập thư giãn, thiền định và kỹ thuật thở |
| 🌟 **Tư duy tích cực** | Ghi nhận biết ơn, động viên hàng ngày |
| 🎮 **Giảm căng thẳng** | Trò chơi giáo dục vui nhộn |
| 🤖 **Hỗ trợ 24/7** | Chatbot AI với thông tin cập nhật |
| 🆘 **Bảo vệ an toàn** | Hệ thống SOS phát hiện dấu hiệu tiêu cực |

---

## ✨ Tính năng chính

### 1. 💬 Trợ lý AI (Chat Assistant)

- **Chat văn bản** với AI hỗ trợ tâm lý
- **Web Search tích hợp** - DuckDuckGo cho thông tin mới nhất
- **Speech-to-Text** nhận diện giọng nói tiếng Việt
- **Phát hiện SOS** tự động khi nhập từ khóa tiêu cực
- **Đồng bộ đám mây** lưu trữ lịch sử hội thoại

### 2. 🧘 Góc An Yên (Peace Corner)

- **Bài tập thở** đa chế độ: Bong bóng nhiệm màu, Chạm vào hiện tại, Ô cửa thần kỳ
- **Animation mượt mà** với hướng dẫn trực quan
- **Bộ thẻ An Yên** - thẻ động viên và bài tập nhỏ
- **Nhạc nền** thiên nhiên thư giãn

### 3. 📖 Kể Chuyện (Stories)

- **Thư viện truyện** với bài học cuộc sống
- **Chế độ đọc immersive** toàn màn hình
- **Theme** Light / Sepia

### 4. 🎮 Trò Chơi Giáo Dục

| Game | Mô tả |
|------|-------|
| **Ong Tập Bay** | Rèn luyện khả năng tập trung |
| **Phản Xạ** | Luyện phản xạ nhanh |
| **Ghép Màu** | Nhận diện màu sắc |
| **Vẽ Tự Do** | Canvas vẽ thư giãn |
| **Bắn Bong Bóng** | Pop bubbles giảm stress |

### 5. 💚 Lọ Biết Ơn (Gratitude Jar)

- **Viết biết ơn** mỗi ngày
- **Streak counter** theo dõi chuỗi ngày
- **Lịch sử 30 ngày** với sparkline chart

### 6. 🆘 Hỗ Trợ Khẩn Cấp (SOS)

- **Phát hiện tự động** từ khóa tiêu cực
- **Hotline 24/7** hiển thị ngay lập tức
- **Bản đồ bệnh viện** gần nhất

---

## 🏗 Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────┐
│                      USER BROWSER                            │
└──────────────────────────┬──────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│    Frontend     │ │  Backend API    │ │  DuckDuckGo     │
│  React + Vite   │ │  Cloudflare     │ │  Search API     │
│                 │ │  Workers        │ │  (Free)         │
│ - UI/UX         │ │                 │ │                 │
│ - State mgmt    │─▶│ - AI Chat      │─▶│ - Web Search   │
│ - STT (Web API) │ │ - Auth          │ │                 │
└─────────────────┘ │ - Data sync     │ └─────────────────┘
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐    ┌─────────────────┐
                    │  Cloudflare D1  │    │   OpenRouter    │
                    │   (SQLite)      │    │   (AI API)      │
                    │                 │    │                 │
                    │ - Users         │    │ - xiaomi/mimo   │
                    │ - Chat threads  │    │   -v2-flash     │
                    │ - Gratitude     │    │   (FREE)        │
                    └─────────────────┘    └─────────────────┘
```

### Luồng xử lý AI Chat

```
User Message → Backend AI Proxy → Web Search (nếu cần) → OpenRouter LLM → Response
```

| Bước | Mô tả |
|------|-------|
| 1 | User nhập text hoặc nói (STT) |
| 2 | Frontend gửi tới Backend API |
| 3 | Backend kiểm tra SOS, PII redaction |
| 4 | Gọi DuckDuckGo Search (nếu cần thông tin mới) |
| 5 | Gọi OpenRouter với model miễn phí |
| 6 | Streaming response về frontend |

---

## 🛠 Công nghệ sử dụng

### Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| **Frontend** | React 19, Vite 6, Tailwind CSS 4, Framer Motion |
| **Routing** | React Router 7 |
| **AI Chat** | OpenRouter API (xiaomi/mimo-v2-flash:free) |
| **Web Search** | DuckDuckGo Instant Answer API (Free) |
| **STT** | Web Speech API (browser native) |
| **Backend** | Cloudflare Workers |
| **Database** | Cloudflare D1 (SQLite) |
| **Hosting** | Cloudflare Pages + Workers |

### API Flow

```
Frontend ──▶ Backend Worker ──▶ OpenRouter (AI)
                    │
                    └──▶ DuckDuckGo (Search)
```

---

## 📁 Cấu trúc dự án

```
duancuahocsinh/
├── frontend/                 # React Application
│   ├── src/
│   │   ├── components/       # UI Components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API Services
│   │   │   └── chatApi.js    # Chat API (OpenRouter via backend)
│   │   ├── hooks/            # Custom Hooks
│   │   └── utils/            # Utility functions
│   └── public/               # Static assets
│
├── backend/                  # Cloudflare Workers
│   └── workers/
│       ├── router.js         # Main entry point
│       ├── ai-proxy.js       # AI Chat handler (OpenRouter)
│       ├── web-search.js     # DuckDuckGo Search
│       ├── auth.js           # Authentication
│       ├── risk.js           # SOS Detection
│       └── data-api.js       # User data sync
│
└── README.md
```

---

## 📦 Cài đặt

### Yêu cầu

- **Node.js** 18+
- **npm** hoặc **pnpm**
- **Wrangler CLI** (cho backend)

### Frontend

```bash
cd frontend
npm install

# Tạo file .env
echo "VITE_API_URL=https://ban-dong-hanh-worker.stu725114073.workers.dev" > .env

# Chạy development
npm run dev
```

### Backend

```bash
cd backend
npm install

# Set OpenRouter API Key
npx wrangler secret put OPENROUTER_API_KEY

# Deploy
npm run deploy
```

### Environment Variables

| Biến | Mô tả |
|------|-------|
| `VITE_API_URL` | URL Backend Worker |
| `OPENROUTER_API_KEY` | OpenRouter API Key (backend secret) |

---

## 🔐 Bảo mật

| Tính năng | Mô tả |
|-----------|-------|
| **PII Redaction** | Tự động ẩn thông tin cá nhân |
| **SOS Detection** | Phát hiện và chặn nội dung tiêu cực |
| **HTTPS Only** | Mọi kết nối được mã hóa |
| **No API Key Exposed** | API keys được lưu ở backend |

---

## 🤝 Đóng góp

```bash
# 1. Fork repository
# 2. Tạo branch mới
git checkout -b feature/ten-tinh-nang

# 3. Commit thay đổi
git commit -m "feat: Thêm tính năng XYZ"

# 4. Push và tạo Pull Request
git push origin feature/ten-tinh-nang
```

### Guidelines

- **Comments tiếng Việt** - Giải thích code bằng tiếng Việt
- **Conventional Commits** - feat, fix, docs, refactor...
- **ESLint + Prettier** - Tuân thủ linting rules

---

## 📞 Liên hệ

| Kênh | Thông tin |
|------|-----------|
| **Email** | stu725114073@hnue.edu.vn |
| **Website** | https://bandonghanh.pages.dev |
| **Issues** | https://github.com/LongNgn204/duancuahocsinh/issues |

---

## 📄 License

Dự án được phát hành dưới giấy phép **MIT License**.

---

<p align="center">
  Made with ❤️ for Vietnamese students<br/>
  <strong>Bạn Đồng Hành</strong> - 2025
</p>
