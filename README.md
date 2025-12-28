<p align="center">
  <img src="./Thiết kế chưa có tên.png" alt="Bạn Đồng Hành Logo" width="180"/>
</p>

<h1 align="center">Bạn Đồng Hành</h1>

<p align="center">
  <strong>Nền tảng hỗ trợ sức khỏe tinh thần dành cho học sinh Việt Nam</strong>
</p>

<p align="center">
  <a href="https://bandonghanh.pages.dev">Demo trực tuyến</a> |
  <a href="#giới-thiệu">Giới thiệu</a> |
  <a href="#tính-năng-chính">Tính năng</a> |
  <a href="#hướng-dẫn-sử-dụng">Hướng dẫn sử dụng</a> |
  <a href="#cài-đặt-development">Cài đặt</a>
</p>

---

## Mục lục

- [Giới thiệu](#giới-thiệu)
- [Tính năng chính](#tính-năng-chính)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Flowchart hoạt động](#flowchart-hoạt-động)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Hướng dẫn sử dụng](#hướng-dẫn-sử-dụng)
  - [Dành cho người dùng](#dành-cho-người-dùng)
  - [Dành cho lập trình viên](#dành-cho-lập-trình-viên)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Cài đặt Development](#cài-đặt-development)
- [Bảo mật và Quyền riêng tư](#bảo-mật-và-quyền-riêng-tư)
- [Đóng góp](#đóng-góp)
- [Liên hệ](#liên-hệ)
- [License](#license)

---

## Giới thiệu

**Bạn Đồng Hành** là ứng dụng web **miễn phí** giúp học sinh Việt Nam (12-18 tuổi) chăm sóc sức khỏe tinh thần, xây dựng thói quen tích cực và nhận được hỗ trợ khi cần thiết.

Ứng dụng được thiết kế với giao diện **thân thiện**, **mượt mà**, hỗ trợ đầy đủ trên cả điện thoại và máy tính.

### Sứ mệnh

| Mục tiêu | Mô tả |
|----------|-------|
| **Chăm sóc sức khỏe tinh thần** | Bài tập thư giãn, thiền định và kỹ thuật thở |
| **Phát triển tư duy tích cực** | Ghi nhận biết ơn, động viên hàng ngày |
| **Giảm căng thẳng** | Trò chơi giáo dục vui nhộn, giúp thư giãn |
| **Hỗ trợ 24/7** | Chatbot AI đồng hành với giọng nói tự nhiên |
| **Bảo vệ an toàn** | Hệ thống SOS phát hiện dấu hiệu tiêu cực |

---

## Tính năng chính

### 1. Trang chủ (Dashboard)

- **Lời chào thông minh** theo thời gian trong ngày
- **Theo dõi cảm xúc** với emoji trực quan
- **Streak tracker** đếm ngày sử dụng liên tục
- **Quick Actions** truy cập nhanh các tính năng
- **Tiến độ tuần này** theo dõi hoạt động hàng ngày

### 2. Trợ lý AI (Chat Assistant)

- **Chat văn bản** với AI hỗ trợ tâm lý (Google Gemini)
- **Gọi điện thoại AI** với giọng nói tự nhiên thời gian thực
- **Speech-to-Text** nhận diện giọng nói tiếng Việt
- **Phát hiện SOS** tự động khi nhập từ khóa tiêu cực
- **Đồng bộ đám mây** lưu trữ lịch sử hội thoại

### 3. Góc An Yên (Peace Corner)

- **Bài tập thở** đa chế độ: Blue Bubble, Box Breathing, Calm Wave
- **Bong bóng thở** với animation mượt mà
- **Bộ thẻ An Yên** - thẻ động viên và bài tập nhỏ
- **Giọng nói hướng dẫn** tiếng Việt
- **Nhạc nền** thiên nhiên thư giãn

### 4. Kể Chuyện (Stories)

- **Thư viện truyện** với bài học cuộc sống
- **Chế độ đọc immersive** toàn màn hình
- **AI đọc truyện** với giọng đọc tự nhiên
- **Theme** Light / Sepia / Dark

### 5. Trò Chơi Giáo Dục (Games)

| Game | Mô tả |
|------|-------|
| **Ong Tập Bay** | Rèn luyện khả năng tập trung |
| **Phản Xạ** | Luyện phản xạ nhanh |
| **Ghép Màu** | Nhận diện màu sắc |
| **Vẽ Tự Do** | Canvas vẽ thư giãn |
| **Bắn Bong Bóng** | Pop bubbles giảm stress |
| **Phi Công Vũ Trụ** | Điều khiển tàu vũ trụ |

### 6. Liều Thuốc Tinh Thần (Wellness)

- **Câu động viên** theo 4 nhóm cảm xúc
- **Bài tập thở nhanh** 30 giây
- **Hoạt động tự chăm sóc** gợi ý hàng ngày

### 7. Lọ Biết Ơn (Gratitude Jar)

- **Viết biết ơn** mỗi ngày
- **Streak counter** theo dõi chuỗi ngày
- **Gợi ý nội dung** thông minh
- **Lịch sử 30 ngày** với sparkline chart

### 8. Kho Kiến Thức (Knowledge Hub)

- **Tài liệu tâm lý** được biên soạn bởi chuyên gia
- **Bài viết tự chăm sóc** theo chủ đề
- **Hướng dẫn kỹ năng** sống tích cực

### 9. Hỗ Trợ Khẩn Cấp (SOS)

- **Phát hiện tự động** từ khóa tiêu cực
- **Hotline 24/7** hiển thị ngay lập tức
- **Bản đồ bệnh viện** gần nhất
- **Tài liệu hướng dẫn** xử lý khủng hoảng

---

## Kiến trúc hệ thống

```
+-------------------------------------------------------------------------+
|                            USER BROWSER                                  |
+--------------------------------+----------------------------------------+
                                 |
          +----------------------+----------------------+
          |                      |                      |
          v                      v                      v
+-------------------+   +-------------------+   +-------------------+
|    Gemini API     |   |     Frontend      |   |    Backend API    |
|   (Chat + Voice)  |   |   React + Vite    |   |    Cloudflare     |
|                   |   |                   |   |     Workers       |
| - gemini-2.0      |   | - UI/UX           |   |                   |
|   -flash          |<--| - State mgmt      |-->| - Auth            |
| - gemini-2.5      |   | - STT (Web API)   |   | - Data sync       |
|   -flash-tts      |   |                   |   | - User storage    |
+-------------------+   +-------------------+   +---------+---------+
                                                          |
                                                          v
                                                +-------------------+
                                                |   Cloudflare D1   |
                                                |     (SQLite)      |
                                                |                   |
                                                | - Users           |
                                                | - Chat threads    |
                                                | - Gratitude       |
                                                | - Login history   |
                                                +-------------------+
```

### Luồng xử lý AI

| Bước | Mô tả |
|------|-------|
| 1 | User nhập text hoặc nói (STT) |
| 2 | Frontend gọi Gemini API trực tiếp |
| 3 | Nhận response streaming |
| 4 | TTS: Chuyển văn bản thành giọng nói |
| 5 | Phát audio cho người dùng |

**Lưu ý:** Backend chỉ lưu trữ lịch sử chat, không xử lý AI.

---

## Flowchart hoạt động

### Flowchart tổng quan hệ thống

```
                            +------------------+
                            |   Truy cập web   |
                            +--------+---------+
                                     |
                                     v
                            +------------------+
                            | Đã đăng nhập?    |
                            +--------+---------+
                                     |
                   +-----------------+------------------+
                   |                                    |
                   v                                    v
          +------------------+                 +------------------+
          |   Landing Page   |                 |    Dashboard     |
          +--------+---------+                 +--------+---------+
                   |                                    |
                   v                                    v
          +------------------+           +-----+--------+---------+-------+
          | Đăng nhập/       |           |     |        |         |       |
          | Đăng ký          |           v     v        v         v       v
          +--------+---------+         Chat  Games   Corner   Stories   SOS
                   |
                   v
          +------------------+
          |    Dashboard     |
          +------------------+
```

### Flowchart Chat AI

```
+------------------+
|  Mở trang Chat   |
+--------+---------+
         |
         v
+------------------+
| Nhập tin nhắn    |
+--------+---------+
         |
         v
+------------------+
| Phát hiện SOS?   |
+--------+---------+
         |
   +-----+-----+
   |           |
   v           v
  YES          NO
   |           |
   v           v
+----------+  +------------------+
| Hiện SOS |  | Gửi đến Gemini   |
| Overlay  |  +--------+---------+
+----------+           |
                       v
              +------------------+
              | Nhận phản hồi    |
              | (streaming)      |
              +--------+---------+
                       |
                       v
              +------------------+
              | Hiển thị tin nhắn|
              | AI               |
              +------------------+
```

### Flowchart Gọi điện AI

```
+------------------+
| Nhấn nút Gọi     |
+--------+---------+
         |
         v
+------------------+
| Yêu cầu quyền    |
| microphone       |
+--------+---------+
         |
   +-----+-----+
   |           |
   v           v
 Từ chối    Cho phép
   |           |
   v           v
+----------+  +------------------+
| Thông báo|  | Kết nối Gemini   |
| lỗi      |  | Live API         |
+----------+  +--------+---------+
                       |
                       v
              +------------------+
              | Cuộc gọi bắt đầu |
              +--------+---------+
                       |
           +-----------+-----------+
           |                       |
           v                       v
+------------------+     +------------------+
| User nói         |     | AI trả lời       |
| (ghi âm)         |<--->| (phát âm thanh)  |
+------------------+     +------------------+
           |
           v
+------------------+
| Nhấn Kết thúc    |
+--------+---------+
         |
         v
+------------------+
| Ngắt kết nối     |
| Lưu lịch sử      |
+------------------+
```

### Flowchart Bài tập thở

```
+------------------+
| Vào Góc An Yên   |
+--------+---------+
         |
         v
+------------------+
| Chọn chế độ thở  |
| (Blue Bubble,    |
|  Box Breathing,  |
|  Calm Wave)      |
+--------+---------+
         |
         v
+------------------+
| Nhấn Bắt đầu     |
+--------+---------+
         |
    +----+----+
    |         |
    v         v
+-------+  +-------+
| Hít   |  | Thở   |
| vào   |->| ra    |
+-------+  +-------+
    ^         |
    |         |
    +---------+
    (lặp lại)
         |
         v
+------------------+
| Hoàn thành/      |
| Nhấn Dừng        |
+------------------+
```

### Flowchart SOS Detection

```
+------------------+
| User nhập        |
| tin nhắn         |
+--------+---------+
         |
         v
+------------------+
| Kiểm tra từ khóa |
| SOS              |
+--------+---------+
         |
   +-----+-----+
   |           |
   v           v
Phát hiện   Không có
   |           |
   v           v
+----------+  +------------------+
| Block    |  | Gửi tin nhắn    |
| tin nhắn |  | bình thường     |
+----+-----+  +------------------+
     |
     v
+------------------+
| Hiển thị SOS     |
| Overlay          |
+--------+---------+
         |
         v
+------------------+
| Hiển thị:        |
| - Hotline 24/7   |
| - Bệnh viện gần  |
| - Tài liệu       |
+------------------+
```

---

## Công nghệ sử dụng

### Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| **Frontend** | React 19, Vite 6, Tailwind CSS 4, Framer Motion, Zustand |
| **Routing** | React Router 7 |
| **AI Chat** | Google Gemini 2.0 Flash (direct API call từ frontend) |
| **AI TTS** | Google Gemini 2.5 Flash Preview TTS |
| **AI Voice Call** | Google Gemini Live API (real-time voice) |
| **STT** | Web Speech API (browser native) |
| **Backend** | Cloudflare Workers |
| **Database** | Cloudflare D1 (SQLite) |
| **Hosting** | Cloudflare Pages + Workers |

---

## Hướng dẫn sử dụng

### Dành cho người dùng

#### 1. Đăng ký và Đăng nhập

1. Truy cập trang web: https://bandonghanh.pages.dev
2. Nhấn nút **"Đăng ký"** nếu chưa có tài khoản
3. Điền thông tin:
   - Họ và tên
   - Email
   - Mật khẩu (tối thiểu 6 ký tự)
4. Nhấn **"Đăng ký"** để hoàn tất
5. Đăng nhập bằng email và mật khẩu đã đăng ký

#### 2. Sử dụng Dashboard

Sau khi đăng nhập, bạn sẽ thấy Dashboard với các thành phần:

- **Lời chào**: Hiển thị lời chào theo thời gian (Chào buổi sáng/chiều/tối)
- **Tiến độ tuần này**: Xem các ngày bạn đã đăng nhập trong tuần
- **Quick Actions**: Các nút truy cập nhanh đến tính năng chính
- **Menu bên trái**: Điều hướng đến các trang khác

#### 3. Trò chuyện

1. Nhấn vào mục **"Chat"** trên menu
2. Nhập tin nhắn vào ô chat và nhấn Enter hoặc nút Gửi
3. Chờ AI phản hồi (phản hồi sẽ hiển thị dạng streaming)
4. Có thể sử dụng nút microphone để nói thay vì gõ

**Lưu ý về SOS**: Nếu bạn nhập nội dung có dấu hiệu tiêu cực, hệ thống sẽ tự động hiển thị popup SOS với thông tin hotline hỗ trợ.

#### 4. Gọi điện thoại với AI

1. Trên trang Chat, nhấn nút **"Gọi điện"**
2. Cho phép trình duyệt truy cập microphone khi được hỏi
3. Bắt đầu nói chuyện với AI
4. AI sẽ trả lời bạn bằng giọng nói tự nhiên
5. Nhấn nút **"Kết thúc"** khi muốn dừng cuộc gọi

#### 5. Bài tập thở (Góc An Yên)

1. Nhấn vào mục **"Góc An Yên"** trên menu
2. Chọn một trong các chế độ thở:
   - **Blue Bubble**: Thở theo bong bóng
   - **Box Breathing**: Thở 4-4-4-4 (hít 4s, giữ 4s, thở 4s, giữ 4s)
   - **Calm Wave**: Thở theo sóng biển
3. Nhấn **"Bắt đầu"** để bắt đầu bài tập
4. Làm theo hướng dẫn trên màn hình
5. Có thể bật/tắt nhạc nền và giọng hướng dẫn

#### 6. Đọc truyện

1. Nhấn vào mục **"Kể chuyện"** trên menu
2. Chọn một truyện từ danh sách
3. Đọc truyện trong chế độ toàn màn hình
4. Có thể:
   - Bật AI đọc truyện bằng giọng nói
   - Đổi theme (Light/Sepia/Dark)
   - Điều chỉnh kích thước chữ

#### 7. Chơi game

1. Nhấn vào mục **"Trò chơi"** trên menu
2. Chọn game muốn chơi
3. Làm theo hướng dẫn của từng game
4. Xem điểm số sau khi hoàn thành

#### 8. Lọ Biết Ơn

1. Nhấn vào biểu tượng Lọ Biết Ơn trên Dashboard
2. Viết điều bạn muốn biết ơn hôm nay
3. Nhấn **"Lưu"** để lưu ghi chú
4. Xem lại các ghi chú cũ trong lịch sử

#### 9. Cài đặt

1. Nhấn vào mục **"Cài đặt"** trên menu
2. Các tùy chọn có sẵn:
   - Đổi thông tin cá nhân
   - Đổi mật khẩu
   - Bật/tắt thông báo
   - Chế độ tối/sáng
   - Quản lý dữ liệu (xuất/xóa)

### Dành cho lập trình viên

#### API Endpoints

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/api/auth/register` | POST | Đăng ký tài khoản |
| `/api/auth/login` | POST | Đăng nhập |
| `/api/auth/refresh` | POST | Làm mới token |
| `/api/data/sync` | POST | Đồng bộ dữ liệu |
| `/api/data/gratitude` | GET/POST | Lọ biết ơn |
| `/api/data/chat-history` | GET/POST | Lịch sử chat |
| `/api/data/weekly-progress` | GET | Tiến độ tuần |

#### Cấu hình Gemini API

```javascript
// Trong file .env của frontend
VITE_GEMINI_API_KEY=your-api-key
VITE_GEMINI_MODEL=gemini-2.0-flash
```

#### Model Gemini có thể sử dụng

| Model | Mô tả | Sử dụng |
|-------|-------|---------|
| `gemini-3-pro` | Model mới nhất | Chat (Khuyên dùng) |
| `gemini-2.5-pro` | Chất lượng cao | Chat |
| `gemini-2.0-flash` | Nhanh, cân bằng | Chat |
| `gemini-2.5-flash-preview-tts` | Giọng đọc tự nhiên | TTS |
| `gemini-2.0-flash-live-001` | Real-time voice | Voice Call |

---

## Cấu trúc dự án

```
duancuahocsinh/
|
+-- frontend/                    # React Application
|   +-- src/
|   |   +-- components/          # UI Components
|   |   |   +-- ui/              # Button, Card, Modal, Badge...
|   |   |   +-- games/           # Game components
|   |   |   +-- chat/            # Chat components
|   |   |   +-- voice/           # Voice call components
|   |   |   +-- breathing/       # Breathing exercises
|   |   |   +-- sos/             # SOS Detection
|   |   |   +-- auth/            # Login, Register
|   |   |   +-- gratitude/       # Gratitude jar
|   |   |   +-- layout/          # Header, Sidebar, Footer
|   |   |
|   |   +-- pages/               # Page components
|   |   |   +-- Dashboard.jsx    # Trang chủ
|   |   |   +-- Chat.jsx         # Trang chat
|   |   |   +-- VoiceCall.jsx    # Gọi điện AI
|   |   |   +-- PeaceCorner.jsx  # Góc an yên
|   |   |   +-- Stories.jsx      # Kể chuyện
|   |   |   +-- Games.jsx        # Trò chơi
|   |   |   +-- Wellness.jsx     # Liều thuốc tinh thần
|   |   |   +-- KnowledgeHub.jsx # Kho kiến thức
|   |   |   +-- Settings.jsx     # Cài đặt
|   |   |
|   |   +-- services/            # API Services
|   |   |   +-- gemini.js        # Gemini Chat API
|   |   |   +-- geminiTTS.js     # Gemini TTS API
|   |   |   +-- geminiLive.js    # Gemini Live Voice API
|   |   |   +-- api.js           # Backend API
|   |   |
|   |   +-- hooks/               # Custom Hooks
|   |   |   +-- useAI.js         # Chat AI hook
|   |   |   +-- useVoiceAgent.js # Voice Agent hook
|   |   |   +-- useAuth.js       # Authentication hook
|   |   |
|   |   +-- contexts/            # React Contexts
|   |   +-- utils/               # Utility functions
|   |   +-- data/                # Static data (stories, tips...)
|   |
|   +-- public/                  # Static assets
|
+-- backend/                     # Cloudflare Workers
|   +-- workers/
|   |   +-- router.js            # Main entry point
|   |   +-- auth.js              # Authentication
|   |   +-- data-api.js          # User data sync
|   |
|   +-- schema.sql               # D1 database schema
|   +-- wrangler.toml            # Cloudflare config
|
+-- docs/                        # Documentation
+-- README.md                    # This file
```

---

## Cài đặt Development

### Yêu cầu hệ thống

- **Node.js** 18 trở lên
- **npm** hoặc **pnpm**
- **Wrangler CLI** (cho backend)
- **Google Gemini API Key**

### Bước 1: Clone dự án

```bash
git clone https://github.com/LongNgn204/duancuahocsinh.git
cd duancuahocsinh
```

### Bước 2: Cài đặt Frontend

```bash
cd frontend
npm install
```

### Bước 3: Cấu hình API Key

Tạo file `frontend/.env`:

```env
VITE_API_URL=https://your-worker.workers.dev
VITE_GEMINI_API_KEY=your-gemini-api-key
VITE_GEMINI_MODEL=gemini-2.0-flash
```

Lấy API Key tại: https://aistudio.google.com/apikey

### Bước 4: Chạy Development Server

```bash
npm run dev
```

Mở trình duyệt: http://localhost:5173

### Bước 5: Cài đặt Backend (Tùy chọn)

```bash
cd backend
npm install

# Tạo database D1 (lần đầu)
wrangler d1 create ban-dong-hanh-db

# Khởi tạo schema
wrangler d1 execute ban-dong-hanh-db --file=./schema.sql

# Chạy local
npm run dev
```

### Scripts có sẵn

#### Frontend

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Development server |
| `npm run build` | Build production |
| `npm run preview` | Preview build |
| `npm run deploy` | Deploy Cloudflare Pages |

#### Backend

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Local dev với Wrangler |
| `npm run deploy` | Deploy Workers |

---

## Bảo mật và Quyền riêng tư

| Tính năng | Mô tả |
|-----------|-------|
| **Mã hóa dữ liệu** | Không lưu thông tin cá nhân nhạy cảm |
| **GDPR Compliant** | Xuất/Xóa dữ liệu theo yêu cầu |
| **SOS Detection** | Bảo vệ người dùng khi cần thiết |
| **HTTPS Only** | Mọi kết nối được mã hóa |
| **AI không chẩn đoán** | Chỉ hỗ trợ, không thay thế chuyên gia |

---

## Đóng góp

Chúng tôi hoan nghênh mọi đóng góp!

```bash
# 1. Fork repository
# 2. Tạo branch mới
git checkout -b feature/ten-tinh-nang

# 3. Commit thay đổi
git commit -m "feat: Thêm tính năng XYZ"

# 4. Push lên branch
git push origin feature/ten-tinh-nang

# 5. Tạo Pull Request
```

### Coding Guidelines

- **ESLint va Prettier** - Tuân thủ linting rules
- **Comments tiếng Việt** - Giải thích code bằng tiếng Việt
- **PascalCase** cho components
- **Conventional Commits** - feat, fix, docs, style, refactor...

---

## Liên hệ

| Kênh | Thông tin |
|------|-----------|
| **Email** | stu725114073@hnue.edu.vn |
| **Hotline** | 0896636181 (24/7) |
| **Website** | https://bandonghanh.pages.dev |
| **Issues** | https://github.com/LongNgn204/duancuahocsinh/issues |

---

## License

Dự án được phát hành dưới giấy phép **MIT License**.

---

<p align="center">
  Made with love for Vietnamese students<br/>
  <strong>Ban Dong Hanh</strong> - 2025
</p>

<p align="center">
  <a href="#bạn-đồng-hành">Quay lại đầu trang</a>
</p>
