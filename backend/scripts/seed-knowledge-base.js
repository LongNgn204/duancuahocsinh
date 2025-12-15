// backend/scripts/seed-knowledge-base.js
// Chú thích: Script để populate knowledge base với tài liệu tâm lý học đường cơ bản
// Chạy: node backend/scripts/seed-knowledge-base.js

const knowledgeBase = [
  {
    title: 'Kỹ thuật thở 4-7-8',
    content: `Kỹ thuật thở 4-7-8 là một phương pháp thư giãn hiệu quả, giúp giảm stress và lo âu.

Cách thực hiện:
1. Ngồi hoặc nằm thoải mái
2. Hít vào bằng mũi trong 4 giây
3. Giữ hơi trong 7 giây
4. Thở ra bằng miệng trong 8 giây
5. Lặp lại 4-8 lần

Lợi ích:
- Giảm căng thẳng ngay lập tức
- Cải thiện chất lượng giấc ngủ
- Tăng khả năng tập trung
- Giúp kiểm soát cảm xúc tốt hơn

Thời điểm sử dụng:
- Trước khi thi
- Khi cảm thấy lo lắng
- Trước khi ngủ
- Khi xung đột với bạn bè hoặc gia đình`,
    category: 'breathing',
    tags: JSON.stringify(['thư giãn', 'stress', 'lo âu', 'tập trung', 'giấc ngủ']),
    source: 'manual'
  },
  {
    title: 'Quản lý stress học tập',
    content: `Stress học tập là vấn đề phổ biến ở học sinh. Dưới đây là các cách quản lý hiệu quả:

1. Chia nhỏ công việc:
   - Chia bài tập lớn thành các phần nhỏ
   - Hoàn thành từng phần một
   - Tự thưởng sau mỗi phần hoàn thành

2. Kỹ thuật Pomodoro:
   - Học tập trung 25 phút
   - Nghỉ 5 phút
   - Sau 4 pomodoro, nghỉ dài 15-30 phút

3. Quản lý thời gian:
   - Lập lịch học cụ thể
   - Ưu tiên bài quan trọng
   - Tránh trì hoãn

4. Chăm sóc bản thân:
   - Ngủ đủ 7-9 giờ/ngày
   - Ăn uống đầy đủ
   - Tập thể dục nhẹ nhàng

5. Tìm sự hỗ trợ:
   - Chia sẻ với bạn bè, gia đình
   - Tìm thầy cô tư vấn
   - Sử dụng app hỗ trợ tâm lý`,
    category: 'stress',
    tags: JSON.stringify(['học tập', 'thi cử', 'quản lý thời gian', 'pomodoro']),
    source: 'manual'
  },
  {
    title: 'Xử lý xung đột bạn bè',
    content: `Xung đột với bạn bè là điều bình thường, nhưng cần xử lý đúng cách:

1. Lắng nghe trước:
   - Để bạn bè nói hết suy nghĩ
   - Không ngắt lời
   - Thể hiện sự tôn trọng

2. Bày tỏ cảm xúc:
   - Dùng "Tôi cảm thấy..." thay vì "Bạn làm..."
   - Tránh đổ lỗi
   - Tập trung vào vấn đề, không phải con người

3. Tìm giải pháp cùng nhau:
   - Đề xuất giải pháp cụ thể
   - Sẵn sàng thỏa hiệp
   - Tập trung vào tương lai, không đào bới quá khứ

4. Nếu không giải quyết được:
   - Tìm người trung gian (thầy cô, phụ huynh)
   - Chấp nhận sự khác biệt
   - Giữ khoảng cách nếu cần

5. Học từ xung đột:
   - Rút kinh nghiệm
   - Cải thiện kỹ năng giao tiếp
   - Xây dựng mối quan hệ tốt hơn`,
    category: 'friendship',
    tags: JSON.stringify(['bạn bè', 'xung đột', 'giao tiếp', 'mối quan hệ']),
    source: 'manual'
  },
  {
    title: 'Giao tiếp với gia đình',
    content: `Giao tiếp hiệu quả với gia đình giúp giảm căng thẳng và xây dựng mối quan hệ tốt:

1. Chọn thời điểm phù hợp:
   - Khi cả hai đều bình tĩnh
   - Không nói khi đang giận
   - Tìm không gian riêng tư

2. Cách nói chuyện:
   - Bắt đầu bằng điều tích cực
   - Nói rõ ràng, cụ thể
   - Lắng nghe phản hồi

3. Thể hiện cảm xúc:
   - "Con cảm thấy..." thay vì "Bố mẹ làm..."
   - Giải thích lý do
   - Đề xuất giải pháp

4. Khi bị hiểu lầm:
   - Giữ bình tĩnh
   - Giải thích lại một cách nhẹ nhàng
   - Sẵn sàng xin lỗi nếu sai

5. Xây dựng thói quen:
   - Dành thời gian trò chuyện mỗi ngày
   - Chia sẻ cả điều vui và buồn
   - Tạo không gian an toàn`,
    category: 'family',
    tags: JSON.stringify(['gia đình', 'giao tiếp', 'mối quan hệ', 'hiểu lầm']),
    source: 'manual'
  },
  {
    title: 'Tự chăm sóc bản thân',
    content: `Tự chăm sóc bản thân là nền tảng của sức khỏe tâm thần:

1. Giấc ngủ:
   - Ngủ đủ 7-9 giờ/ngày
   - Đi ngủ và thức dậy đúng giờ
   - Tắt điện thoại trước khi ngủ 1 giờ
   - Phòng ngủ tối, yên tĩnh

2. Dinh dưỡng:
   - Ăn đủ 3 bữa/ngày
   - Uống đủ nước (1.5-2 lít)
   - Hạn chế đồ ngọt, cà phê
   - Ăn nhiều rau xanh, trái cây

3. Vận động:
   - Tập thể dục 30 phút/ngày
   - Đi bộ, chạy bộ, yoga
   - Vận động giúp giảm stress

4. Thư giãn:
   - Dành thời gian cho sở thích
   - Nghe nhạc, đọc sách
   - Chơi game, xem phim
   - Gặp gỡ bạn bè

5. Tự yêu thương:
   - Chấp nhận bản thân
   - Không so sánh với người khác
   - Tự thưởng khi hoàn thành mục tiêu
   - Nghỉ ngơi khi mệt`,
    category: 'selfcare',
    tags: JSON.stringify(['sức khỏe', 'giấc ngủ', 'dinh dưỡng', 'vận động', 'thư giãn']),
    source: 'manual'
  },
  {
    title: 'Quản lý cảm xúc',
    content: `Quản lý cảm xúc là kỹ năng quan trọng giúp bạn sống hạnh phúc hơn:

1. Nhận diện cảm xúc:
   - Buồn, vui, giận, sợ, lo lắng
   - Chấp nhận cảm xúc là bình thường
   - Không phủ nhận cảm xúc

2. Hiểu nguyên nhân:
   - Điều gì khiến bạn cảm thấy như vậy?
   - Có phải do suy nghĩ tiêu cực?
   - Có phải do tình huống bên ngoài?

3. Xử lý cảm xúc:
   - Hít thở sâu khi giận hoặc lo
   - Viết nhật ký để giải tỏa
   - Chia sẻ với người tin cậy
   - Tập thể dục để giải phóng năng lượng

4. Thay đổi suy nghĩ:
   - Nhìn nhận vấn đề từ góc độ khác
   - Tìm điều tích cực trong tình huống
   - Tự nhủ những câu tích cực

5. Tìm sự hỗ trợ:
   - Nói với bạn bè, gia đình
   - Tìm thầy cô tư vấn
   - Sử dụng app hỗ trợ tâm lý
   - Gọi hotline nếu cần`,
    category: 'emotions',
    tags: JSON.stringify(['cảm xúc', 'quản lý', 'stress', 'lo âu', 'buồn']),
    source: 'manual'
  },
  {
    title: 'Kỹ thuật Box Breathing',
    content: `Box Breathing (Thở hộp) là kỹ thuật đơn giản giúp thư giãn nhanh:

Cách thực hiện:
1. Hít vào bằng mũi trong 4 giây
2. Giữ hơi trong 4 giây
3. Thở ra bằng miệng trong 4 giây
4. Giữ không khí ra ngoài trong 4 giây
5. Lặp lại 4-6 lần

Ưu điểm:
- Dễ nhớ và thực hiện
- Có thể làm bất cứ đâu
- Hiệu quả ngay lập tức
- Không cần dụng cụ

Khi nào dùng:
- Trước khi thi
- Khi lo lắng
- Khi mất bình tĩnh
- Khi cần tập trung`,
    category: 'breathing',
    tags: JSON.stringify(['thư giãn', 'tập trung', 'stress', 'lo âu']),
    source: 'manual'
  },
  {
    title: 'Xử lý áp lực điểm số',
    content: `Áp lực điểm số là vấn đề phổ biến. Dưới đây là cách xử lý:

1. Thay đổi quan điểm:
   - Điểm số không định nghĩa giá trị của bạn
   - Quan trọng là bạn đã cố gắng
   - Mỗi người có điểm mạnh riêng

2. Đặt mục tiêu thực tế:
   - Mục tiêu phù hợp với khả năng
   - Chia nhỏ mục tiêu lớn
   - Tự thưởng khi đạt mục tiêu

3. Cải thiện phương pháp học:
   - Tìm phương pháp phù hợp
   - Học nhóm với bạn bè
   - Nhờ thầy cô hướng dẫn

4. Quản lý thời gian:
   - Lập kế hoạch học tập
   - Ưu tiên môn quan trọng
   - Tránh học dồn

5. Tìm sự hỗ trợ:
   - Chia sẻ với gia đình
   - Tìm thầy cô tư vấn
   - Tham gia nhóm học tập`,
    category: 'stress',
    tags: JSON.stringify(['học tập', 'điểm số', 'áp lực', 'thi cử']),
    source: 'manual'
  },
  {
    title: 'Xử lý bị bắt nạt',
    content: `Bị bắt nạt là vấn đề nghiêm trọng cần xử lý đúng cách:

1. Bảo vệ bản thân:
   - Không đáp lại bằng bạo lực
   - Tìm cách rời khỏi tình huống
   - Giữ bình tĩnh

2. Tìm sự giúp đỡ:
   - Nói với thầy cô ngay lập tức
   - Báo với phụ huynh
   - Tìm bạn bè hỗ trợ

3. Ghi lại bằng chứng:
   - Chụp ảnh, lưu tin nhắn
   - Ghi lại thời gian, địa điểm
   - Nhờ người chứng kiến

4. Chăm sóc bản thân:
   - Không tự trách mình
   - Tìm người tin cậy để chia sẻ
   - Tham gia hoạt động tích cực

5. Nếu nghiêm trọng:
   - Gọi hotline 1800 599 920
   - Báo với cơ quan chức năng
   - Tìm sự hỗ trợ chuyên nghiệp`,
    category: 'friendship',
    tags: JSON.stringify(['bắt nạt', 'an toàn', 'hỗ trợ', 'bảo vệ']),
    source: 'manual'
  },
  {
    title: 'Xây dựng lòng tự trọng',
    content: `Lòng tự trọng là nền tảng của hạnh phúc:

1. Chấp nhận bản thân:
   - Mỗi người đều có điểm mạnh và yếu
   - Không so sánh với người khác
   - Tập trung vào bản thân

2. Tự nói chuyện tích cực:
   - Thay "Mình không thể" bằng "Mình sẽ thử"
   - Tự khen ngợi khi làm tốt
   - Tha thứ cho bản thân khi sai

3. Đặt mục tiêu nhỏ:
   - Hoàn thành mục tiêu nhỏ
   - Tự thưởng khi đạt được
   - Xây dựng sự tự tin dần dần

4. Chăm sóc bản thân:
   - Ăn uống đầy đủ
   - Ngủ đủ giấc
   - Tập thể dục
   - Mặc quần áo gọn gàng

5. Tìm sự hỗ trợ:
   - Kết nối với người tích cực
   - Tránh người tiêu cực
   - Tìm mentor hoặc counselor`,
    category: 'selfcare',
    tags: JSON.stringify(['tự trọng', 'tự tin', 'bản thân', 'tích cực']),
    source: 'manual'
  },
  {
    title: 'Quản lý thời gian hiệu quả',
    content: `Quản lý thời gian tốt giúp giảm stress và tăng năng suất:

1. Lập lịch:
   - Viết ra tất cả công việc
   - Ưu tiên theo mức độ quan trọng
   - Phân bổ thời gian hợp lý

2. Kỹ thuật Pomodoro:
   - Làm việc 25 phút
   - Nghỉ 5 phút
   - Sau 4 pomodoro nghỉ dài

3. Tránh trì hoãn:
   - Bắt đầu với việc dễ nhất
   - Chia nhỏ công việc lớn
   - Tự thưởng khi hoàn thành

4. Loại bỏ phiền nhiễu:
   - Tắt thông báo điện thoại
   - Tìm không gian yên tĩnh
   - Tập trung một việc một lúc

5. Nghỉ ngơi hợp lý:
   - Nghỉ giữa các buổi học
   - Ngủ đủ giấc
   - Dành thời gian giải trí`,
    category: 'study',
    tags: JSON.stringify(['thời gian', 'học tập', 'năng suất', 'pomodoro']),
    source: 'manual'
  },
  {
    title: 'Xử lý thất tình',
    content: `Thất tình là trải nghiệm khó khăn nhưng bạn có thể vượt qua:

1. Chấp nhận cảm xúc:
   - Buồn là bình thường
   - Không ép bản thân vui ngay
   - Cho phép bản thân khóc

2. Chia sẻ:
   - Nói với bạn bè tin cậy
   - Viết nhật ký
   - Tìm người lắng nghe

3. Chăm sóc bản thân:
   - Ăn uống đầy đủ
   - Ngủ đủ giấc
   - Tập thể dục
   - Làm điều mình thích

4. Tránh:
   - Stalk mạng xã hội
   - Liên lạc với người cũ
   - Tự trách mình
   - Vội vàng tìm người mới

5. Học hỏi:
   - Rút kinh nghiệm
   - Hiểu bản thân hơn
   - Xây dựng mối quan hệ tốt hơn`,
    category: 'emotions',
    tags: JSON.stringify(['tình cảm', 'thất tình', 'buồn', 'vượt qua']),
    source: 'manual'
  },
  {
    title: 'Cải thiện giấc ngủ',
    content: `Giấc ngủ tốt là nền tảng của sức khỏe tâm thần:

1. Lịch trình ngủ:
   - Đi ngủ và thức dậy đúng giờ
   - Ngủ đủ 7-9 giờ/ngày
   - Không ngủ nướng cuối tuần

2. Môi trường ngủ:
   - Phòng tối, yên tĩnh
   - Nhiệt độ mát mẻ
   - Giường, gối thoải mái

3. Thói quen trước ngủ:
   - Tắt điện thoại 1 giờ trước
   - Không xem màn hình
   - Đọc sách, nghe nhạc nhẹ
   - Tắm nước ấm

4. Tránh:
   - Cà phê sau 2 giờ chiều
   - Ăn no trước khi ngủ
   - Tập thể dục mạnh trước ngủ
   - Lo lắng về giấc ngủ

5. Nếu mất ngủ:
   - Thở sâu, thư giãn
   - Đứng dậy làm việc nhẹ
   - Quay lại giường khi buồn ngủ`,
    category: 'selfcare',
    tags: JSON.stringify(['giấc ngủ', 'sức khỏe', 'thư giãn', 'nghỉ ngơi']),
    source: 'manual'
  },
  {
    title: 'Xử lý lo âu trước thi',
    content: `Lo âu trước thi là bình thường, nhưng có thể quản lý:

1. Chuẩn bị tốt:
   - Học đều đặn, không học dồn
   - Làm bài tập đầy đủ
   - Ôn tập có hệ thống

2. Kỹ thuật thư giãn:
   - Thở sâu 4-7-8
   - Tưởng tượng thành công
   - Tự nhủ tích cực

3. Đêm trước thi:
   - Ôn nhẹ, không học khuya
   - Chuẩn bị đồ dùng đầy đủ
   - Ngủ đủ giấc

4. Ngày thi:
   - Ăn sáng đầy đủ
   - Đến sớm 15 phút
   - Thở sâu trước khi làm bài

5. Trong khi thi:
   - Đọc kỹ đề
   - Làm câu dễ trước
   - Quản lý thời gian
   - Không hoảng sợ`,
    category: 'stress',
    tags: JSON.stringify(['thi cử', 'lo âu', 'học tập', 'chuẩn bị']),
    source: 'manual'
  },
  {
    title: 'Xây dựng mối quan hệ tích cực',
    content: `Mối quan hệ tích cực giúp bạn hạnh phúc hơn:

1. Lắng nghe:
   - Chú ý khi người khác nói
   - Không ngắt lời
   - Thể hiện sự quan tâm

2. Chia sẻ:
   - Mở lòng với bạn bè
   - Chia sẻ cả vui và buồn
   - Tạo không gian an toàn

3. Tôn trọng:
   - Chấp nhận sự khác biệt
   - Không ép buộc
   - Tôn trọng ranh giới

4. Hỗ trợ:
   - Giúp đỡ khi cần
   - Động viên khi khó khăn
   - Cùng nhau phát triển

5. Tránh:
   - Nói xấu sau lưng
   - So sánh, cạnh tranh tiêu cực
   - Ghen tị, đố kỵ`,
    category: 'friendship',
    tags: JSON.stringify(['bạn bè', 'mối quan hệ', 'giao tiếp', 'tích cực']),
    source: 'manual'
  },
  {
    title: 'Xử lý cảm giác cô đơn',
    content: `Cảm giác cô đơn là bình thường, nhưng có thể vượt qua:

1. Hiểu cảm giác:
   - Cô đơn khác với ở một mình
   - Có thể cô đơn dù có nhiều người xung quanh
   - Cần kết nối thật sự

2. Kết nối:
   - Tham gia hoạt động nhóm
   - Tham gia câu lạc bộ
   - Tình nguyện, giúp đỡ người khác

3. Xây dựng mối quan hệ:
   - Chủ động làm quen
   - Duy trì liên lạc
   - Chia sẻ sở thích

4. Chăm sóc bản thân:
   - Làm điều mình thích
   - Phát triển sở thích
   - Tự yêu thương bản thân

5. Tìm sự hỗ trợ:
   - Nói với người tin cậy
   - Tìm counselor
   - Sử dụng app hỗ trợ`,
    category: 'emotions',
    tags: JSON.stringify(['cô đơn', 'kết nối', 'mối quan hệ', 'hỗ trợ']),
    source: 'manual'
  },
  {
    title: 'Quản lý cảm xúc tiêu cực',
    content: `Cảm xúc tiêu cực là bình thường, nhưng cần quản lý đúng cách:

1. Nhận diện:
   - Buồn, giận, sợ, lo lắng
   - Không phủ nhận
   - Chấp nhận là bình thường

2. Hiểu nguyên nhân:
   - Điều gì gây ra cảm xúc?
   - Có phải do suy nghĩ?
   - Có phải do tình huống?

3. Xử lý:
   - Hít thở sâu
   - Viết nhật ký
   - Chia sẻ với người tin cậy
   - Tập thể dục

4. Thay đổi suy nghĩ:
   - Nhìn từ góc độ khác
   - Tìm điều tích cực
   - Tự nhủ tích cực

5. Tìm sự hỗ trợ:
   - Nếu kéo dài >2 tuần
   - Ảnh hưởng cuộc sống
   - Có ý định tự hại
   → Tìm sự giúp đỡ chuyên nghiệp`,
    category: 'emotions',
    tags: JSON.stringify(['cảm xúc', 'tiêu cực', 'quản lý', 'hỗ trợ']),
    source: 'manual'
  },
  {
    title: 'Xây dựng thói quen tích cực',
    content: `Thói quen tích cực giúp bạn sống hạnh phúc hơn:

1. Bắt đầu nhỏ:
   - Chọn 1-2 thói quen
   - Dễ thực hiện
   - Gắn với thói quen cũ

2. Lặp lại:
   - Làm mỗi ngày
   - Đặt nhắc nhở
   - Tự thưởng khi hoàn thành

3. Thói quen tốt:
   - Viết 3 điều biết ơn mỗi ngày
   - Tập thể dục 30 phút
   - Đọc sách 15 phút
   - Thiền 5 phút

4. Theo dõi:
   - Ghi lại progress
   - Xem streak
   - Tự thưởng milestones

5. Kiên nhẫn:
   - Mất 21-66 ngày để hình thành
   - Không bỏ cuộc khi lỡ
   - Tiếp tục ngay hôm sau`,
    category: 'selfcare',
    tags: JSON.stringify(['thói quen', 'tích cực', 'phát triển', 'kiên nhẫn']),
    source: 'manual'
  },
  {
    title: 'Xử lý áp lực từ gia đình',
    content: `Áp lực từ gia đình có thể gây stress, cần xử lý đúng cách:

1. Hiểu kỳ vọng:
   - Gia đình muốn tốt cho bạn
   - Đôi khi kỳ vọng quá cao
   - Cần giao tiếp rõ ràng

2. Giao tiếp:
   - Nói về cảm xúc của bạn
   - Giải thích khả năng thực tế
   - Đề xuất mục tiêu hợp lý

3. Tìm điểm chung:
   - Cả hai đều muốn bạn thành công
   - Tìm cách đạt mục tiêu phù hợp
   - Thỏa hiệp khi cần

4. Chăm sóc bản thân:
   - Không tự trách
   - Tìm sự hỗ trợ
   - Duy trì sở thích

5. Nếu cần:
   - Tìm counselor
   - Tham gia nhóm hỗ trợ
   - Gọi hotline`,
    category: 'family',
    tags: JSON.stringify(['gia đình', 'áp lực', 'kỳ vọng', 'giao tiếp']),
    source: 'manual'
  },
  {
    title: 'Tăng cường sự tự tin',
    content: `Tự tin giúp bạn đối mặt với thử thách tốt hơn:

1. Nhận diện điểm mạnh:
   - Liệt kê điều bạn giỏi
   - Nhớ lại thành công
   - Tập trung vào điểm mạnh

2. Đặt mục tiêu nhỏ:
   - Hoàn thành mục tiêu nhỏ
   - Tự thưởng
   - Xây dựng sự tự tin

3. Thực hành:
   - Làm điều sợ làm
   - Bắt đầu từ việc nhỏ
   - Tăng độ khó dần

4. Tự nói chuyện tích cực:
   - "Mình có thể làm được"
   - "Mình đã từng làm tốt"
   - "Mình sẽ cố gắng"

5. Học từ thất bại:
   - Thất bại là cơ hội học
   - Rút kinh nghiệm
   - Thử lại với cách khác`,
    category: 'selfcare',
    tags: JSON.stringify(['tự tin', 'bản thân', 'thành công', 'phát triển']),
    source: 'manual'
  },
  {
    title: 'Quản lý mạng xã hội',
    content: `Sử dụng mạng xã hội đúng cách giúp bảo vệ sức khỏe tâm thần:

1. Giới hạn thời gian:
   - Đặt giới hạn mỗi ngày
   - Tắt thông báo
   - Không dùng trước khi ngủ

2. Chọn nội dung:
   - Follow người tích cực
   - Unfollow người tiêu cực
   - Xem nội dung có ích

3. Tránh so sánh:
   - Mạng xã hội không phản ánh thực tế
   - Mỗi người có cuộc sống riêng
   - Tập trung vào bản thân

4. Tương tác tích cực:
   - Like, comment tích cực
   - Chia sẻ điều có ích
   - Tránh tranh cãi

5. Nghỉ ngơi:
   - Nghỉ mạng xã hội vài ngày
   - Dành thời gian thực tế
   - Kết nối với người thật`,
    category: 'selfcare',
    tags: JSON.stringify(['mạng xã hội', 'sức khỏe', 'thời gian', 'tích cực']),
    source: 'manual'
  },
  {
    title: 'Xử lý cảm giác thất bại',
    content: `Thất bại là phần của cuộc sống, cần xử lý đúng cách:

1. Chấp nhận:
   - Thất bại là bình thường
   - Không ai hoàn hảo
   - Đây là cơ hội học hỏi

2. Phân tích:
   - Điều gì đã xảy ra?
   - Nguyên nhân là gì?
   - Có thể làm khác không?

3. Học hỏi:
   - Rút kinh nghiệm
   - Tránh lặp lại sai lầm
   - Áp dụng bài học

4. Tiếp tục:
   - Không bỏ cuộc
   - Thử lại với cách khác
   - Kiên nhẫn

5. Tự yêu thương:
   - Không tự trách
   - Tự động viên
   - Nhớ lại thành công`,
    category: 'emotions',
    tags: JSON.stringify(['thất bại', 'học hỏi', 'tiếp tục', 'tự yêu thương']),
    source: 'manual'
  },
  {
    title: 'Xây dựng kỹ năng giao tiếp',
    content: `Giao tiếp tốt giúp xây dựng mối quan hệ tốt:

1. Lắng nghe:
   - Chú ý khi người khác nói
   - Không ngắt lời
   - Đặt câu hỏi để hiểu

2. Nói rõ ràng:
   - Dùng từ dễ hiểu
   - Nói chậm, rõ
   - Kiểm tra người nghe hiểu

3. Ngôn ngữ cơ thể:
   - Giao tiếp bằng mắt
   - Tư thế mở
   - Gật đầu, mỉm cười

4. Thể hiện cảm xúc:
   - Dùng "Tôi cảm thấy..."
   - Tránh đổ lỗi
   - Tập trung vào vấn đề

5. Thực hành:
   - Luyện với bạn bè
   - Tham gia hoạt động nhóm
   - Học từ người giỏi`,
    category: 'friendship',
    tags: JSON.stringify(['giao tiếp', 'kỹ năng', 'mối quan hệ', 'lắng nghe']),
    source: 'manual'
  },
  {
    title: 'Tìm động lực học tập',
    content: `Động lực học tập giúp bạn đạt mục tiêu:

1. Tìm mục đích:
   - Học để làm gì?
   - Mục tiêu dài hạn?
   - Điều gì quan trọng?

2. Đặt mục tiêu:
   - Mục tiêu cụ thể, đo lường được
   - Chia nhỏ mục tiêu lớn
   - Tự thưởng khi đạt

3. Tìm phương pháp:
   - Phương pháp phù hợp
   - Học nhóm
   - Sử dụng công nghệ

4. Tạo môi trường:
   - Không gian yên tĩnh
   - Loại bỏ phiền nhiễu
   - Đồ dùng đầy đủ

5. Duy trì:
   - Nhắc nhở mục tiêu
   - Theo dõi progress
   - Tìm người hỗ trợ`,
    category: 'study',
    tags: JSON.stringify(['học tập', 'động lực', 'mục tiêu', 'phương pháp']),
    source: 'manual'
  },
  {
    title: 'Xử lý cảm giác bị từ chối',
    content: `Bị từ chối là trải nghiệm khó khăn nhưng có thể vượt qua:

1. Chấp nhận:
   - Bị từ chối là bình thường
   - Không phải lỗi của bạn
   - Không định nghĩa giá trị bạn

2. Xử lý cảm xúc:
   - Cho phép bản thân buồn
   - Chia sẻ với người tin cậy
   - Viết nhật ký

3. Học hỏi:
   - Rút kinh nghiệm
   - Cải thiện bản thân
   - Thử lại với cách khác

4. Tập trung vào điều khác:
   - Phát triển sở thích
   - Kết nối với bạn bè
   - Làm điều tích cực

5. Kiên nhẫn:
   - Mọi thứ sẽ ổn
   - Cơ hội mới sẽ đến
   - Tự yêu thương bản thân`,
    category: 'emotions',
    tags: JSON.stringify(['từ chối', 'cảm xúc', 'vượt qua', 'học hỏi']),
    source: 'manual'
  },
  {
    title: 'Cân bằng học tập và giải trí',
    content: `Cân bằng giữa học và chơi giúp bạn sống hạnh phúc hơn:

1. Lập lịch:
   - Phân bổ thời gian hợp lý
   - Dành thời gian cho cả hai
   - Tránh học quá nhiều

2. Ưu tiên:
   - Học tập quan trọng
   - Nhưng giải trí cũng cần
   - Tìm điểm cân bằng

3. Giải trí lành mạnh:
   - Chơi thể thao
   - Đọc sách, xem phim
   - Gặp gỡ bạn bè
   - Chơi game (có chừng mực)

4. Tránh:
   - Nghiện game
   - Bỏ bê học tập
   - Quên chăm sóc bản thân

5. Tự điều chỉnh:
   - Theo dõi thời gian
   - Điều chỉnh khi cần
   - Tìm sự hỗ trợ nếu mất cân bằng`,
    category: 'study',
    tags: JSON.stringify(['học tập', 'giải trí', 'cân bằng', 'thời gian']),
    source: 'manual'
  },
  {
    title: 'Xử lý cảm giác không xứng đáng',
    content: `Cảm giác không xứng đáng có thể ảnh hưởng đến hạnh phúc:

1. Nhận diện:
   - "Mình không đủ tốt"
   - "Mình không xứng đáng"
   - Đây là suy nghĩ tiêu cực

2. Thách thức suy nghĩ:
   - Bằng chứng nào chứng minh?
   - Có phải do so sánh?
   - Có phải do kỳ vọng quá cao?

3. Tự nói chuyện tích cực:
   - "Mình xứng đáng hạnh phúc"
   - "Mình có giá trị"
   - "Mình đã cố gắng"

4. Nhận diện điểm mạnh:
   - Liệt kê điều tốt
   - Nhớ lại thành công
   - Tập trung vào tích cực

5. Tìm sự hỗ trợ:
   - Nói với người tin cậy
   - Tìm counselor
   - Tham gia nhóm hỗ trợ`,
    category: 'emotions',
    tags: JSON.stringify(['tự trọng', 'giá trị', 'tích cực', 'hỗ trợ']),
    source: 'manual'
  },
  {
    title: 'Xây dựng khả năng phục hồi',
    content: `Khả năng phục hồi giúp bạn vượt qua khó khăn:

1. Chấp nhận thay đổi:
   - Cuộc sống luôn thay đổi
   - Khó khăn là tạm thời
   - Có thể vượt qua

2. Tìm ý nghĩa:
   - Học từ khó khăn
   - Tìm điều tích cực
   - Phát triển từ thử thách

3. Xây dựng mạng lưới:
   - Kết nối với người tích cực
   - Tìm sự hỗ trợ
   - Giúp đỡ người khác

4. Chăm sóc bản thân:
   - Ăn uống, ngủ đủ
   - Tập thể dục
   - Thư giãn

5. Phát triển kỹ năng:
   - Giải quyết vấn đề
   - Quản lý cảm xúc
   - Tự yêu thương`,
    category: 'selfcare',
    tags: JSON.stringify(['phục hồi', 'vượt qua', 'khó khăn', 'phát triển']),
    source: 'manual'
  }
];

// Export để sử dụng trong migration script
export { knowledgeBase };

// Nếu chạy trực tiếp, log ra để copy vào SQL
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('-- Knowledge Base Seed Data');
  console.log('-- Copy các INSERT statements sau vào SQL migration:');
  console.log('');
  
  knowledgeBase.forEach((kb, idx) => {
    const sql = `INSERT INTO knowledge_base (title, content, category, tags, source) VALUES (
  '${kb.title.replace(/'/g, "''")}',
  '${kb.content.replace(/'/g, "''")}',
  '${kb.category}',
  '${kb.tags}',
  '${kb.source}'
);`;
    console.log(sql);
    console.log('');
  });
}

