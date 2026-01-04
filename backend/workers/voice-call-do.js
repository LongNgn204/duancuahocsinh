export class VoiceCallSessionOpenAI {
    constructor(state, env) {
        this.state = state;
        this.env = env;
        this.sessions = new Set();
        this.openaiWs = null;
        this.clientWs = null;
    }

    async fetch(request) {
        if (request.headers.get('Upgrade') !== 'websocket') {
            return new Response('Expected Upgrade: websocket', { status: 426 });
        }

        const pair = new WebSocketPair();
        const [client, server] = Object.values(pair);

        this.handleSession(server);

        return new Response(null, {
            status: 101,
            webSocket: client,
        });
    }

    async handleSession(ws) {
        this.sessions.add(ws);
        this.clientWs = ws;
        ws.accept();

        if (!this.env.OPENAI_API_KEY) {
            ws.send(JSON.stringify({ type: 'error', message: 'Server missing OPENAI_API_KEY' }));
            ws.close();
            return;
        }

        const model = 'gpt-4o-realtime-preview-2025-06-03';
        const openaiUrl = `https://api.openai.com/v1/realtime?model=${model}`;

        try {
            console.log('[DO] Connecting to OpenAI Realtime...');

            // Use fetch to support custom headers for handshake
            const response = await fetch(openaiUrl, {
                headers: {
                    'Upgrade': 'websocket',
                    'Connection': 'Upgrade',
                    'Authorization': `Bearer ${this.env.OPENAI_API_KEY}`,
                    'OpenAI-Beta': 'realtime=v1',
                }
            });

            if (response.status !== 101) {
                throw new Error(`OpenAI Handshake failed: ${response.status} ${response.statusText}`);
            }

            this.openaiWs = response.webSocket;
            if (!this.openaiWs) {
                throw new Error('OpenAI returned no WebSocket');
            }

            this.openaiWs.accept();

            console.log('[DO] Connected to OpenAI');
            this.sendSessionUpdate(); // Config voice/instructions
            ws.send(JSON.stringify({ type: 'connected' }));

            this.openaiWs.addEventListener('message', (event) => {
                // Forward message from OpenAI -> Client
                // Client side will handle parsing OpenAI JSON format
                if (ws.readyState === WebSocket.READY_HANDSHAKE || ws.readyState === WebSocket.OPEN) {
                    ws.send(event.data);
                }
            });

            this.openaiWs.addEventListener('close', (event) => {
                console.log('[DO] OpenAI closed:', event.code, event.reason);
                ws.close(event.code, 'OpenAI Closed');
            });

            this.openaiWs.addEventListener('error', (error) => {
                console.error('[DO] OpenAI error:', error);
                ws.send(JSON.stringify({ type: 'error', message: 'OpenAI connection error' }));
            });

        } catch (err) {
            console.error('[DO] Connection failed:', err);
            try {
                ws.send(JSON.stringify({
                    type: 'error',
                    message: `Upstream Error: ${err.message || 'Unknown'}`
                }));
            } catch (e) { /* ignore */ }
            ws.close(1011, 'Failed to connect upstream');
            return;
        }

        // Handle Client messages
        ws.addEventListener('message', async (event) => {
            if (!this.openaiWs || this.openaiWs.readyState !== WebSocket.OPEN) return;
            // Client sends OpenAI specific JSON messages directly
            this.openaiWs.send(event.data);
        });

        ws.addEventListener('close', () => {
            this.sessions.delete(ws);
            if (this.openaiWs) {
                this.openaiWs.close();
            }
        });
    }

    sendSessionUpdate() {
        // Chú thích: System Instructions chi tiết cho AI Voice Call
        // Multi-role, adaptive style, safety limits, multilingual
        const sessionUpdate = {
            type: "session.update",
            session: {
                modalities: ["text", "audio"],
                instructions: `# BẠN ĐỒNG HÀNH - AI Companion cho Học Sinh

## DANH TÍNH & VAI TRÒ
Bạn là "Bạn Đồng Hành" - một AI đa vai trò thông minh, có thể linh hoạt chuyển đổi giữa:
1. **GIÁO VIÊN**: Giọng ấm áp, truyền cảm, kiên nhẫn giải thích kiến thức
2. **NGƯỜI MẸ**: Âu yếm, quan tâm, lo lắng cho sức khỏe và tinh thần con
3. **NGƯỜI BẠN THÂN**: Vui vẻ, hòa đồng, nói chuyện thoải mái như bạn bè cùng trang lứa
4. **CHUYÊN GIA TÂM LÝ**: Nghiêm túc, chính xác, chuyên nghiệp khi tư vấn vấn đề tâm lý

## TỰ ĐỘNG NHẬN DIỆN VAI TRÒ
Dựa vào nội dung và cảm xúc trong câu nói của học sinh để chọn vai trò phù hợp:
- Hỏi bài, kiến thức → VAI TRÒ GIÁO VIÊN (ấm áp, rõ ràng)
- Mệt mỏi, ốm, lo lắng về sức khỏe → VAI TRÒ MẸ (âu yếm, quan tâm)
- Tâm sự bạn bè, crush, trường lớp → VAI TRÒ BẠN THÂN (vui vẻ, đồng cảm)
- Stress, lo âu, buồn bã, khủng hoảng → VAI TRÒ CHUYÊN GIA (nghiêm túc, hỗ trợ)

## PHONG CÁCH NÓI
- Nói NGẮN GỌN, mỗi lượt chỉ 1-3 câu
- KHÔNG đọc emoji, icon, ký hiệu đặc biệt
- Giọng điệu tự nhiên như đang nói chuyện thật
- Thể hiện sự LẮNG NGHE và THẤU CẢM
- Gọi học sinh bằng "bạn" hoặc "em" tùy ngữ cảnh

## ĐA NGÔN NGỮ
- Mặc định: Tiếng Việt
- Nếu học sinh nói tiếng Anh hoặc ngôn ngữ khác → Trả lời bằng ngôn ngữ đó
- Có thể mix ngôn ngữ nếu phù hợp context

## GIỚI HẠN AN TOÀN (QUAN TRỌNG)
❌ KHÔNG BAO GIỜ:
- Hỗ trợ mua thuốc, kê đơn thuốc, tư vấn y tế chuyên sâu
- Đưa ra lời khuyên về tự gây hại hoặc làm hại người khác
- Thảo luận về nội dung bạo lực, tình dục, ma túy
- Cung cấp thông tin cá nhân của bất kỳ ai
- Làm bài hộ, gian lận thi cử

✅ THAY VÀO ĐÓ:
- Khuyên tìm bác sĩ/chuyên gia nếu có vấn đề sức khỏe nghiêm trọng
- Khuyên nói chuyện với người lớn tin cậy nếu có dấu hiệu khủng hoảng
- Hướng dẫn CÁCH HỌC thay vì đưa đáp án trực tiếp
- Đề xuất hotline hỗ trợ tâm lý nếu cần: 1800 599 920 (miễn phí)

## KIẾN THỨC HỖ TRỢ
- Các môn học phổ thông: Toán, Lý, Hóa, Sinh, Văn, Sử, Địa, Anh, Tin học
- Kỹ năng mềm: Quản lý thời gian, học tập hiệu quả, giao tiếp
- Tâm lý học đường: Stress thi cử, áp lực đồng trang lứa, mâu thuẫn gia đình
- Định hướng nghề nghiệp: Tư vấn ngành học, trường đại học
- Sức khỏe tuổi teen: Giấc ngủ, dinh dưỡng, vận động (không kê đơn thuốc)

## PHÁT HIỆN KHỦNG HOẢNG
Nếu phát hiện dấu hiệu:
- Tự tử, tự gây hại
- Bị bạo lực, xâm hại
- Trầm cảm nặng
→ Chuyển sang VAI TRÒ CHUYÊN GIA, lắng nghe, và LUÔN khuyên tìm người lớn tin cậy hoặc gọi hotline.`,
                voice: "shimmer", // Voice nữ ấm áp, phù hợp đa vai trò
                input_audio_format: "pcm16",
                output_audio_format: "pcm16",
                turn_detection: {
                    type: "server_vad",
                    threshold: 0.5,
                    prefix_padding_ms: 300,
                    silence_duration_ms: 600 // Tăng lên để học sinh có thời gian suy nghĩ
                }
            }
        };
        this.openaiWs.send(JSON.stringify(sessionUpdate));
        console.log('[DO] Session update sent with multi-role instructions');
    }
}
