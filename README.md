# 🌟 Bạn Đồng Hành - Ứng dụng Hỗ trợ Tâm lý Học đường

[![Cloudflare Pages](https://img.shields.io/badge/Deployed%20on-Cloudflare%20Pages-F38020?logo=cloudflare)](https://ban-dong-hanh.pages.dev)
[![Cloudflare Workers](https://img.shields.io/badge/Backend-Cloudflare%20Workers-F38020?logo=cloudflare)](https://ban-dong-hanh-worker.stu725114073.workers.dev)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)](https://vitejs.dev)

> Một nền tảng web hiện đại, an toàn và thân thiện giúp học sinh Việt Nam (12-18 tuổi) chăm sóc sức khỏe tâm thần, phát triển thói quen tích cực và kết nối với cộng đồng.

## � Demo

- **🌐 Production**: [https://ban-dong-hanh.pages.dev](https://ban-dong-hanh.pages.dev)
- **⚙️ API Endpoint**: `https://ban-dong-hanh-worker.stu725114073.workers.dev`

## �📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng](#-tính-năng)
- [Tech Stack](#️-tech-stack)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Hướng dẫn Setup](#-hướng-dẫn-setup)
- [Deployment](#-deployment)
- [Quy định Đạo đức & Quyền riêng tư](#️-quy-định-đạo-đức--quyền-riêng-tư)
- [Testing](#-testing)
- [Performance](#-performance)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Giới thiệu

**Bạn Đồng Hành** là một ứng dụng web được thiết kế đặc biệt cho học sinh Việt Nam, cung cấp:

| Tính năng | Mô tả |
|-----------|-------|
| 🤖 **AI Mentor tâm lý** | Chatbot thấu cảm, không phán xét, hỗ trợ 24/7 |
| 🧘 **Góc An Yên** | Bài tập thở, thư giãn, thẻ wellness ngẫu nhiên |
| 🏺 **Lọ Biết Ơn** | Ghi lại những điều biết ơn mỗi ngày |
| 📝 **Nhật ký** | Viết nhật ký cảm xúc, theo dõi tâm trạng |
| 🎮 **Mini Games** | Trò chơi thư giãn, luyện phản xạ |
| 📚 **Tài nguyên** | Truyện dân gian, AI Storyteller, hướng dẫn |
| 💬 **Diễn đàn** | Kết nối với cộng đồng, chia sẻ ẩn danh an toàn |
| 🆘 **Hỗ trợ khẩn cấp** | SOS detector, hotline, bản đồ bệnh viện |

## ✨ Tính năng

### Core Features

| Tính năng | Trạng thái | Mô tả |
|-----------|------------|-------|
| **AI Chat với TTS** | ✅ | Chat với AI mentor, hỗ trợ Text-to-Speech |
| **Voice Chat** | ✅ | Trò chuyện bằng giọng nói, real-time audio visualization |
| **Breathing Exercises** | ✅ | Bài tập thở với animation, âm thanh hướng dẫn |
| **Gratitude Jar** | ✅ | Hệ thống tag, gợi ý nội dung, streak tracking |
| **Journal** | ✅ | Nhật ký cảm xúc với mood tracking |
| **Focus Timer** | ✅ | Pomodoro timer với notifications |
| **Sleep Log** | ✅ | Theo dõi giấc ngủ, chất lượng giấc ngủ |
| **Achievements** | ✅ | Hệ thống thành tích, XP, levels |
| **Analytics** | ✅ | Dashboard thống kê cá nhân |
| **Forum** | ✅ | Diễn đàn ẩn danh với moderation |
| **Admin Dashboard** | ✅ | Quản lý users, forum, SOS logs |
| **Language Coach** | ✅ | Luyện ngoại ngữ với AI |

### Advanced Features

| Tính năng | Trạng thái | Mô tả |
|-----------|------------|-------|
| **SOS Detection** | ✅ | Phát hiện nguy cơ tâm lý với 50+ patterns, Gen-Z vocabulary |
| **Context-Aware AI** | ✅ | Memory summarization, lưu ngữ cảnh dài hạn |
| **Real-time Sync** | ✅ | Đồng bộ dữ liệu với Cloudflare D1 |
| **Token Cost Control** | ✅ | Giới hạn 500k tokens/tháng, cảnh báo khi gần ngưỡng |
| **Prompt Injection Guard** | ✅ | Bảo vệ chống prompt injection |
| **AI Safety Net** | ✅ | Không chẩn đoán bệnh, không kê thuốc |
| **Dark/Light Theme** | ✅ | Hỗ trợ giao diện sáng/tối |
| **Responsive Design** | ✅ | Tối ưu cho mobile, tablet, desktop |
| **Tour Guide** | ✅ | Hướng dẫn người dùng mới sử dụng app |

## 🛠️ Tech Stack

### Frontend
| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| **React** | 18.x | UI framework |
| **Vite** | 5.x | Build tool |
| **Tailwind CSS** | 3.x | Styling |
| **Framer Motion** | 11.x | Animations |
| **React Router DOM** | 6.x | Routing |
| **Zustand** | 4.x | State management |
| **Lucide React** | - | Icons |
| **React Markdown** | - | Markdown rendering |

### Backend
| Công nghệ | Mục đích |
|-----------|----------|
| **Cloudflare Workers** | Serverless functions |
| **Cloudflare D1** | SQLite database |
| **Workers AI** | LLM integration (@cf/meta/llama-3.1-8b-instruct) |
| **JWT** | Admin authentication |

### DevOps
| Công nghệ | Mục đích |
|-----------|----------|
| **Cloudflare Pages** | Frontend hosting |
| **Wrangler** | Cloudflare CLI |
| **Git** | Version control |

## 📁 Cấu trúc dự án

```
duancuahocsinh/
├── 📂 frontend/                     # React + Vite app
│   ├── 📂 src/
│   │   ├── 📂 components/           # 42 React components
│   │   │   ├── achievements/        # Thành tích
│   │   │   ├── analytics/           # Thống kê
│   │   │   ├── auth/                # Đăng nhập/Đăng ký
│   │   │   ├── breathing/           # Bài tập thở
│   │   │   ├── chat/                # AI Chat, Voice Chat
│   │   │   ├── dashboard/           # Dashboard
│   │   │   ├── focus/               # Focus Timer
│   │   │   ├── games/               # Mini games (5 games)
│   │   │   ├── gratitude/           # Lọ Biết Ơn
│   │   │   ├── journal/             # Nhật ký
│   │   │   ├── layout/              # Sidebar, Header, Navigation
│   │   │   ├── modals/              # Modals
│   │   │   ├── resources/           # Tài nguyên
│   │   │   ├── selfcare/            # Self-care tips
│   │   │   ├── settings/            # Cài đặt
│   │   │   ├── sleep/               # Sleep Log
│   │   │   ├── sos/                 # SOS Modal
│   │   │   ├── tour/                # Tour Guide
│   │   │   └── ui/                  # UI components (9 components)
│   │   │
│   │   ├── 📂 pages/                # 16 Page components
│   │   │   ├── AdminDashboard.jsx   # Quản trị viên
│   │   │   ├── Analytics.jsx        # Thống kê
│   │   │   ├── Chat.jsx             # AI Chat
│   │   │   ├── Dashboard.jsx        # Trang chủ
│   │   │   ├── Focus.jsx            # Focus Timer
│   │   │   ├── FocusTimer.jsx       # Pomodoro
│   │   │   ├── Forum.jsx            # Diễn đàn
│   │   │   ├── Games.jsx            # Mini Games
│   │   │   ├── Journey.jsx          # Hành trình
│   │   │   ├── LandingPage.jsx      # Trang đích
│   │   │   ├── LanguageCoach.jsx    # Luyện ngoại ngữ
│   │   │   └── Settings.jsx         # Cài đặt
│   │   │
│   │   ├── 📂 hooks/                # 10 Custom hooks
│   │   ├── 📂 utils/                # 6 Utilities (API, SOS detector, etc.)
│   │   ├── 📂 test/                 # Unit tests
│   │   ├── App.jsx                  # Root component
│   │   ├── App.css                  # App styles
│   │   ├── index.css                # Global styles
│   │   └── main.jsx                 # Entry point
│   │
│   └── package.json
│
├── 📂 backend/                       # Cloudflare Workers
│   ├── 📂 workers/                   # 10 Worker modules
│   │   ├── router.js                # Main router (30KB)
│   │   ├── ai-proxy.js              # AI proxy với safety guards (22KB)
│   │   ├── auth.js                  # Authentication (7KB)
│   │   ├── data-api.js              # CRUD APIs (48KB)
│   │   ├── forum-api.js             # Forum APIs (26KB)
│   │   ├── memory.js                # Context summarization (5KB)
│   │   ├── risk.js                  # SOS risk classification (6KB)
│   │   ├── sanitize.js              # Input sanitization (2KB)
│   │   └── token-tracker.js         # Token cost control (3KB)
│   │
│   ├── 📂 scripts/                   # Utility scripts
│   ├── schema.sql                    # Database schema (13KB)
│   ├── wrangler.toml                 # Cloudflare config
│   └── package.json
│
├── 📂 docs/                          # Documentation
│   ├── PROMPTS.md                    # AI system instructions
│   ├── DEPLOY.md                     # Deployment guide
│   └── deploy-info.json              # Deployment metadata
│
├── 📂 .agent/                        # Agent workflows
├── plan.md                           # Development plan
└── README.md                         # This file
```

## 🚀 Hướng dẫn Setup

### Prerequisites

- Node.js 18+ và npm/yarn
- Cloudflare account (miễn phí)
- Git

### 1. Clone repository

```bash
git clone https://github.com/LongNgn204/duancuahocsinh.git
cd duancuahocsinh
```

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy tại `http://localhost:5173`

### 3. Setup Backend

```bash
cd backend
npm install

# Tạo D1 database
npx wrangler d1 create ban-dong-hanh-db

# Cập nhật database_id trong wrangler.toml

# Chạy migrations
npx wrangler d1 execute ban-dong-hanh-db --file=./schema.sql

# Deploy worker (hoặc chạy local)
npx wrangler dev
```

### 4. Cấu hình Environment Variables

Tạo file `.env` trong `frontend/`:

```env
VITE_API_URL=https://your-worker.workers.dev
```

Cập nhật `wrangler.toml` trong `backend/`:

```toml
[vars]
ALLOW_ORIGIN = "http://localhost:5173,https://your-domain.pages.dev"
MODEL = "@cf/meta/llama-3.1-8b-instruct"
MONTHLY_TOKEN_LIMIT = "500000"
ADMIN_PASSWORD = "your-secure-password"
JWT_SECRET = "your-jwt-secret"
```

### 5. Chạy Development

```bash
# Terminal 1: Frontend
cd frontend && npm run dev

# Terminal 2: Backend
cd backend && npx wrangler dev
```

## 📦 Deployment

### Frontend (Cloudflare Pages)

```bash
cd frontend
npm run build
npx wrangler pages deploy dist --project-name=ban-dong-hanh
```

### Backend (Cloudflare Workers)

```bash
cd backend
npx wrangler deploy
```

### Database Migration

```bash
npx wrangler d1 execute ban-dong-hanh-db --file=./schema.sql --remote
```

## 🛡️ Quy định Đạo đức & Quyền riêng tư

### Nguyên tắc Đạo đức

| # | Nguyên tắc | Mô tả |
|---|------------|-------|
| 1 | **An toàn trước tiên** | AI không bao giờ chẩn đoán bệnh hoặc kê thuốc |
| 2 | **Không thay thế chuyên gia** | Luôn khuyến khích người dùng tìm sự giúp đỡ chuyên nghiệp |
| 3 | **Bảo mật dữ liệu** | Không lưu thông tin cá nhân nhạy cảm (PII) |
| 4 | **Quyền riêng tư** | Diễn đàn ẩn danh, không tiết lộ danh tính |
| 5 | **Kiểm duyệt nội dung** | Tự động và thủ công để đảm bảo môi trường an toàn |

### Quyền riêng tư

- **Dữ liệu lưu trữ**: Chỉ lưu dữ liệu cần thiết (gratitude, journal, achievements)
- **Không lưu PII**: Không lưu tên thật, địa chỉ, số điện thoại
- **Mã hóa**: Dữ liệu nhạy cảm được mã hóa trong Cloudflare KV/D1
- **Xóa dữ liệu**: Người dùng có thể export và xóa dữ liệu bất cứ lúc nào
- **Cookie**: Chỉ sử dụng cookie cần thiết cho authentication

### SOS & An toàn

- 🚨 **SOS Detection**: Tự động phát hiện nguy cơ tâm lý với 50+ patterns
- 📞 **Hotline**: Liên kết với hotline tư vấn tâm lý miễn phí (1800 599 920)
- 🗺️ **Bản đồ**: Hiển thị bệnh viện/phòng khám gần nhất
- 📝 **Logging**: Ghi log SOS events để admin theo dõi (ẩn danh)

## 🧪 Testing

Xem [docs/TESTING.md](docs/TESTING.md) để biết chi tiết về testing.

### Chạy Tests

```bash
# Backend tests (Vitest)
cd backend && npm test

# Frontend tests (Vitest)
cd frontend && npm test

# E2E tests (Playwright)
cd frontend && npm run e2e:install && npm run e2e
```

### Test Coverage

- ✅ **Unit Tests**: sosDetector, sanitizeInput, XP/Level calculation, Streak calculation
- ✅ **Integration Tests**: API endpoints (Auth, Data, Forum, SOS, Admin)
- ✅ **E2E Tests**: User flows (Onboarding, Chat, Gratitude, Journal, Games, Settings, Forum)

### Unit Tests

```bash
cd backend
npm test
```

### Integration Tests

```bash
cd backend
npm run test:integration
```

### Manual Testing Checklist

- [x] Chat AI hoạt động, streaming OK
- [x] SOS detector phát hiện keywords
- [x] Voice Chat hoạt động trên Chrome/Edge
- [x] Responsive trên mobile (320px, 375px, 768px, 1024px)
- [x] Touch targets đủ lớn (48x48px)
- [x] Keyboard navigation hoạt động
- [x] Dark mode toggle OK
- [x] Export/Import data OK

## 📊 Performance

### Lighthouse Targets

| Metric | Target | Status |
|--------|--------|--------|
| Performance | >85 | ✅ |
| Accessibility | >90 | ✅ |
| Best Practices | >90 | ✅ |
| SEO | >80 | ✅ |

### Optimization

- ✅ Lazy loading components
- ✅ Code splitting với React.lazy
- ✅ Image optimization
- ✅ CSS minification
- ✅ Tree shaking
- ✅ Edge caching (Cloudflare)

## 🤝 Contributing

Chúng tôi hoan nghênh mọi đóng góp! Vui lòng:

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Mở Pull Request

### Code Style

- Sử dụng ESLint + Prettier
- Comment code bằng tiếng Việt
- Follow React best practices
- Test trước khi commit

## 📝 License

Dự án này được phát hành dưới giấy phép MIT. Xem file `LICENSE` để biết thêm chi tiết.

## 🙏 Acknowledgments

- **Cloudflare** - Infrastructure và Workers AI
- **React Team** - Framework tuyệt vời
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Animation library
- **Lucide** - Icon library

## 📞 Liên hệ

| Kênh | Thông tin |
|------|-----------|
| 📧 Email | stu725114073@hnue.edu.vn |
| ☎️ Hotline | 0896636181 (miễn phí 24/7) |
| 🌐 Website | https://duancuahocsinh.pages.dev/ |

---

<div align="center">

**Made with ❤️ for Vietnamese students**

*Last updated: December 14, 2025*

</div>
