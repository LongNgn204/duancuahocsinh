# 📋 KẾ HOẠCH TINH CHỈNH - BẠN ĐỒNG HÀNH

## 🎯 MỤC TIÊU
- Tinh chỉnh UI/UX theo yêu cầu khách hàng
- Điều chỉnh sidebar cho mobile (dọc bên trái)
- Xóa bớt chức năng không cần thiết
- Cải tiến các tính năng theo yêu cầu

---

## 📱 1. ĐIỀU CHỈNH SIDEBAR CHO MOBILE

### Yêu cầu:
- **Mobile**: Sidebar dọc bên trái (thay vì bottom nav)
- **Desktop**: Giữ nguyên sidebar dọc bên trái

### Công việc:
1. **Sửa `Sidebar.jsx`**:
   - Thêm responsive: hiển thị sidebar dọc trên mobile
   - Thêm toggle button để ẩn/hiện sidebar trên mobile
   - Điều chỉnh width: mobile (w-64), desktop (w-56 lg:w-64)

2. **Sửa `MobileNav.jsx`**:
   - Ẩn hoàn toàn hoặc chỉ hiển thị khi sidebar đóng
   - Hoặc chuyển thành floating button để mở sidebar

3. **Sửa `App.jsx`**:
   - Điều chỉnh layout để sidebar luôn ở bên trái trên mobile
   - Đảm bảo main content không bị che khuất

---

## 🧘 2. LIỀU THUỐC TINH THẦN (BreathingBubble)

### Yêu cầu hiện tại:
- ✅ Đã có "Tìm bình yên" với các pattern thở

### Cần thêm:

#### 2.1. Bài tập thở theo nhịp bong bóng (30s)
- **Mô tả**: Trong 30 giây, hiển thị 1 bong bóng màu xanh, người dùng hít thở theo
- **Công việc**:
  - Thêm mode mới: "Bong bóng xanh" (30s)
  - Animation bong bóng phình to (hít vào) → thu nhỏ (thở ra)
  - Timer 30 giây
  - Hướng dẫn: "Hít vào khi bong bóng lớn, thở ra khi bong bóng nhỏ"

#### 2.2. Nhóm cảm xúc và câu động viên
- **Thêm các nhóm**:
  - 💪 **Động lực học tập**: "Bạn đang làm rất tốt! Tiếp tục cố gắng nhé!"
  - 💝 **Yêu bản thân**: "Bạn xứng đáng được yêu thương và trân trọng"
  - 😊 **Vui vẻ**: "Hãy mỉm cười, mọi thứ sẽ tốt đẹp hơn"
  - 💪 **Kiên cường**: "Bạn mạnh mẽ hơn bạn nghĩ"
  - 🌟 **Tự tin**: "Bạn có khả năng làm được điều đó"
  
- **Công việc**:
  - Tạo component `EncouragementMessages.jsx`
  - Thêm selector nhóm cảm xúc
  - Hiển thị câu động viên ngẫu nhiên sau mỗi session thở
  - Lưu lịch sử câu động viên đã xem

---

## 🧘 3. GÓC AN YÊN (RandomWellnessCard + BreathingBubble)

### Yêu cầu:

#### 3.1. Tích hợp giọng nói hướng dẫn
- **Hiện tại**: ✅ Đã có TTS trong BreathingBubble
- **Cần cải thiện**:
  - Thêm toggle bật/tắt giọng nói rõ ràng hơn
  - Cải thiện chất lượng giọng nói (đã có trong BreathingBubble)

#### 3.2. Bộ thẻ An Yên
- **Hiện tại**: ✅ Đã có RandomWellnessCard
- **Cần thêm 3 loại thẻ**:

##### a) Thẻ Bình Yên
- **Trigger**: Click vào "Bình Yên"
- **Nội dung**: "Hít một hơi để thấy mình bình yên hơn nhé."
- **Gợi ý hoạt động**:
  - Thở sâu 5 lần
  - Nghe nhạc nhẹ
  - Uống nước
  - Ngắm cảnh

##### b) Thẻ Việc làm nhỏ
- **Trigger**: Click vào "Việc làm nhỏ"
- **Nội dung**: "Hôm nay chúng ta cùng thử bài tập quan sát nha"
- **Gợi ý hoạt động**:
  - Quan sát 5 điều xung quanh
  - Liệt kê 3 âm thanh bạn nghe thấy
  - Chạm vào 3 vật thể khác nhau
  - Nếm một món ăn và mô tả

##### c) Thẻ Nhắn nhủ
- **Trigger**: Click vào "Nhắn nhủ"
- **Nội dung**: "Hôm nay bạn đã làm tốt lắm, yêu bản thân hơn nha"
- **Gợi ý hoạt động**:
  - Viết 3 điều bạn tự hào về bản thân
  - Nghĩ về 1 thành tựu nhỏ hôm nay
  - Tự khen mình

- **Công việc**:
  - Sửa `RandomWellnessCard.jsx`:
    - Thêm 3 loại thẻ mới
    - Thêm selector để chọn loại thẻ
    - Cải thiện UI hiển thị thẻ

---

## 🏺 4. LỌ BIẾT ƠN (GratitudeJar)

### Yêu cầu:

#### 4.1. Tính năng đếm streak
- **Hiện tại**: ✅ Đã có streak counter
- **Cần kiểm tra**: Đảm bảo streak hoạt động đúng

#### 4.2. Gợi ý nội dung
- **Yêu cầu**: "Hôm nay hãy viết về một người giúp bạn cảm thấy tốt hơn."
- **Hiện tại**: ✅ Đã có gợi ý dựa trên tag
- **Cần thêm**:
  - Gợi ý theo ngày (mỗi ngày một gợi ý khác nhau)
  - Gợi ý ngẫu nhiên khi user bí ý tưởng
  - Button "Gợi ý cho tôi" nổi bật hơn

- **Công việc**:
  - Thêm mảng gợi ý theo ngày
  - Cải thiện UI hiển thị gợi ý
  - Thêm animation khi hiển thị gợi ý

---

## 🎨 5. BẢNG MÀU CẢM XÚC (MoodJournal)

### Yêu cầu: "Bên mình có ý tưởng gì thì gợi ý ạ"

### Ý tưởng đề xuất:

#### 5.1. Cải thiện Mood Journal hiện tại
- **Thêm tính năng**:
  - **Mood tracking theo thời gian**: Biểu đồ cảm xúc trong ngày
  - **Phân tích xu hướng**: "Bạn thường vui vào buổi sáng"
  - **Gợi ý dựa trên mood**: 
    - Nếu buồn → gợi ý thở, nghe nhạc
    - Nếu căng thẳng → gợi ý game, thư giãn
  - **Mood calendar**: Xem cảm xúc theo tuần/tháng

#### 5.2. Thêm "Mood Check-in" nhanh
- Quick button trên Dashboard
- Chọn mood nhanh → lưu vào journal
- Notification nhắc nhở check-in

#### 5.3. Mood insights
- "Bạn đã vui 5/7 ngày tuần này"
- "Mood của bạn tốt hơn tuần trước"
- "Bạn thường buồn vào thứ 2"

- **Công việc**:
  - Cải thiện `MoodJournal.jsx`:
    - Thêm insights section
    - Thêm quick check-in
    - Cải thiện biểu đồ

---

## 🎮 6. NHANH TAY LẸ MẮT (Games)

### Yêu cầu:

#### 6.1. Chọn hình tương ứng (30s-60s)
- **Mô tả**: 
  - Hiển thị 5 hình/icon (ngôi sao ⭐, giọt nước 💧, mặt trời ☀️, cây 🌳, hoa 🌸)
  - Máy hiện random 1 hình
  - Trong 5s, học sinh phải chọn hình tương ứng
  - Lặp lại trong 30-60s

- **Công việc**:
  - Tạo component mới: `ShapeMatchGame.jsx`
  - Logic game:
    - Random hình mỗi 5s
    - Hiển thị 5 hình để chọn
    - Đếm điểm đúng/sai
    - Timer 30-60s
  - Thêm vào `Games.jsx`

#### 6.2. Ong tập bay (Cải thiện BeeGame hiện tại)
- **Yêu cầu**: 
  - Ong di chuyển
  - Người dùng theo dõi
  - Khi ong dừng → nhấn space/click
  - Phản ứng trong 3s
  - 3 tim (3 mạng) → mất hết thì thua

- **Hiện tại**: ✅ Đã có BeeGame nhưng khác gameplay
- **Công việc**:
  - Tạo game mới: `BeeFollowGame.jsx` hoặc sửa `BeeGame.jsx`
  - Logic:
    - Ong di chuyển ngẫu nhiên
    - Ong dừng lại (random 2-5s)
    - User phải click/space trong 3s
    - Nếu không kịp → mất 1 tim
    - 3 tim hết → game over
    - Đếm số lần phản ứng đúng

---

## 📍 7. GÓC NHỎ (Dashboard hoặc component mới)

### Yêu cầu:

#### 7.1. Thông báo hoạt động cần làm
- **Hiển thị**:
  - "Hôm nay bạn chưa thở"
  - "Đã 2 ngày bạn chưa viết lọ biết ơn"
  - "Nhớ check-in mood hôm nay"

#### 7.2. Cài đặt thời gian nhắc việc
- **Tính năng**:
  - Chọn thời gian nhắc (VD: 8h sáng, 8h tối)
  - Chọn loại nhắc (thở, biết ơn, mood check-in)
  - Notification browser

- **Công việc**:
  - Tạo component `ReminderSettings.jsx`
  - Tích hợp vào `Settings.jsx`
  - Sử dụng `notificationService.js` (đã có)
  - Thêm logic kiểm tra hoạt động chưa làm
  - Hiển thị trên Dashboard

---

## 🆘 8. HỖ TRỢ KHẨN CẤP (SOS)

### Yêu cầu:

#### 8.1. Phát hiện từ khóa tiêu cực
- **Hiện tại**: ✅ Đã có `sosDetector.js` với nhiều patterns
- **Cần cải thiện**:
  - Thêm patterns: "muốn chết", "giải thoát", ...
  - Kiểm tra lại các patterns critical
  - Đảm bảo phát hiện đúng

#### 8.2. Chuyển về màn hình khẩn cấp
- **Hiện tại**: ✅ Đã có `EmergencyOverlay.jsx`
- **Cần cải thiện**:
  - Hiển thị "Mong bạn hãy bình tĩnh..."
  - Khuyên bình tĩnh
  - Hiển thị hotline rõ ràng
  - Cải thiện UI/UX

#### 8.3. Cải tiến map (nếu có)
- **Kiểm tra**: Xem có tính năng map không
- **Nếu có**: Cải thiện hiển thị địa điểm hỗ trợ

- **Công việc**:
  - Review `sosDetector.js`: Thêm patterns mới
  - Cải thiện `EmergencyOverlay.jsx`:
    - Thêm animation bình tĩnh
    - Cải thiện message
    - Thêm breathing guide trong overlay
  - Kiểm tra và cải thiện map (nếu có)

---

## 💬 9. TRÒ CHUYỆN (Chat)

### Yêu cầu:

#### 9.1. Chatbot phản hồi kèm nút phát âm thanh
- **Hiện tại**: ✅ Đã có TTS trong Chat.jsx
- **Cần cải thiện**:
  - Đảm bảo nút "Đọc" hiển thị rõ ràng
  - Cải thiện UI nút TTS
  - Thêm animation khi đang đọc
  - Auto-play option (tùy chọn)

- **Công việc**:
  - Review `Chat.jsx`:
    - Kiểm tra nút TTS đã hiển thị đúng chưa
    - Cải thiện UI nút
    - Thêm visual feedback khi đang đọc

---

## 📖 10. KỂ CHUYỆN (StoryTeller)

### Yêu cầu:

#### 10.1. Thêm chế độ: Kể nhanh - Kể chậm
- **Hiện tại**: ✅ Đã có speed modes (slow, normal, fast, veryFast)
- **Cần cải thiện**:
  - Đổi tên cho dễ hiểu: "Kể chậm" (0.75x), "Kể bình thường" (1.0x), "Kể nhanh" (1.25x), "Kể rất nhanh" (1.5x)
  - Cải thiện UI selector
  - Thêm mô tả rõ ràng hơn

- **Công việc**:
  - Sửa `StoryTeller.jsx`:
    - Đổi label speed modes
    - Cải thiện UI selector
    - Thêm tooltip mô tả

---

## 🗑️ 11. XÓA BỚT CHỨC NĂNG

### Cần xác định với khách hàng:
- Tính năng nào cần xóa?
- Có thể xóa:
  - Forum (nếu không dùng)

### Công việc:
- Liệt kê tính năng có thể xóa
- Xóa routes không cần thiết
- Xóa components không dùng
- Cleanup code

---

## 📝 CHECKLIST THỰC HIỆN

### Phase 1: UI/UX Cơ bản
- [ ] Điều chỉnh Sidebar cho mobile
- [ ] Xóa chức năng không cần thiết
- [ ] Cleanup code

### Phase 2: Tính năng mới
- [ ] Bài tập thở bong bóng (30s)
- [ ] Nhóm cảm xúc và câu động viên
- [ ] Bộ thẻ An Yên (3 loại)
- [ ] Gợi ý nội dung Lọ Biết Ơn
- [ ] Cải thiện Bảng Màu Cảm Xúc
- [ ] Game Chọn hình tương ứng
- [ ] Game Ong tập bay (cải thiện)
- [ ] Góc Nhỏ - Thông báo và nhắc việc
- [ ] Cải thiện Hỗ trợ Khẩn Cấp
- [ ] Cải thiện TTS trong Chat
- [ ] Cải thiện chế độ kể chuyện

### Phase 3: Testing & Polish
- [ ] Test tất cả tính năng
- [ ] Fix bugs
- [ ] Polish UI/UX
- [ ] Responsive check

---

## 🎨 DESIGN NOTES

### Mobile Sidebar:
- Width: 64 (w-64) trên mobile
- Toggle button ở góc trên trái
- Overlay khi mở sidebar
- Smooth animation

### Colors & Icons:
- Giữ nguyên theme hiện tại
- Thêm icons mới cho tính năng mới
- Đảm bảo contrast tốt

---

## 📅 TIMELINE DỰ KIẾN

- **Day 1-2**: Sidebar mobile + Xóa chức năng
- **Day 3-4**: Liều Thuốc Tinh Thần + Góc An Yên
- **Day 5-6**: Lọ Biết Ơn + Bảng Màu Cảm Xúc
- **Day 7-8**: Games mới
- **Day 9-10**: Góc Nhỏ + Hỗ trợ Khẩn Cấp
- **Day 11-12**: Chat + Kể Chuyện
- **Day 13**: Testing & Polish

---

## 🔧 TECHNICAL NOTES

### Files cần sửa:
1. `Sidebar.jsx` - Mobile layout
2. `MobileNav.jsx` - Ẩn hoặc điều chỉnh
3. `BreathingBubble.jsx` - Thêm bong bóng + động viên
4. `RandomWellnessCard.jsx` - Thêm 3 loại thẻ
5. `GratitudeJar.jsx` - Cải thiện gợi ý
6. `MoodJournal.jsx` - Thêm insights
7. `Games.jsx` - Thêm games mới
8. `BeeGame.jsx` hoặc tạo mới - Ong tập bay
9. `Dashboard.jsx` - Thêm Góc Nhỏ
10. `Settings.jsx` - Thêm reminder settings
11. `sosDetector.js` - Thêm patterns
12. `EmergencyOverlay.jsx` - Cải thiện UI
13. `Chat.jsx` - Cải thiện TTS UI
14. `StoryTeller.jsx` - Cải thiện speed modes

### Dependencies:
- Tất cả dependencies đã có sẵn
- Không cần thêm package mới

---

**Ghi chú**: Plan này sẽ được cập nhật khi có feedback từ khách hàng về tính năng cần xóa.

