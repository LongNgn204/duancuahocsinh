export class VoiceCallSessionOpenAI {
    constructor(state, env) {
        this.state = state;
        this.env = env;
        this.sessions = new Set();
        this.openaiWs = null;
        this.clientWs = null;
        this.lastActivityTimestamp = Date.now();
        this.idleTimeoutHandle = null;
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

        // Chú thích: Sử dụng model chính thức từ OpenAI (không phải Azure)
        const model = 'gpt-4o-realtime-preview-2024-12-17';
        const openaiUrl = `wss://api.openai.com/v1/realtime?model=${model}`;

        try {
            console.log('[DO] Connecting to OpenAI Realtime:', model);

            // Cloudflare Workers hỗ trợ outbound WebSocket
            const response = await fetch(openaiUrl, {
                headers: {
                    'Upgrade': 'websocket',
                    'Connection': 'Upgrade',
                    'Authorization': `Bearer ${this.env.OPENAI_API_KEY}`,
                    'OpenAI-Beta': 'realtime=v1',
                }
            });

            if (response.status !== 101) {
                const body = await response.text();
                console.error('[DO] Handshake failed:', response.status, body);
                throw new Error(`OpenAI Handshake failed: ${response.status} - ${body || response.statusText}`);
            }

            this.openaiWs = response.webSocket;
            if (!this.openaiWs) {
                throw new Error('OpenAI returned no WebSocket');
            }

            this.openaiWs.accept();

            console.log('[DO] Connected to OpenAI Realtime');
            this.sendSessionUpdate();
            ws.send(JSON.stringify({ type: 'connected' }));

            // Start idle timeout checker
            this.startIdleTimeoutChecker(ws);

            this.openaiWs.addEventListener('message', (event) => {
                this.lastActivityTimestamp = Date.now();
                if (ws.readyState === WebSocket.READY_HANDSHAKE || ws.readyState === WebSocket.OPEN) {
                    ws.send(event.data);
                }
            });

            this.openaiWs.addEventListener('close', (event) => {
                console.log('[DO] OpenAI closed:', event.code, event.reason);
                this.stopIdleTimeoutChecker();
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

        ws.addEventListener('message', async (event) => {
            this.lastActivityTimestamp = Date.now();
            if (!this.openaiWs || this.openaiWs.readyState !== WebSocket.OPEN) return;
            this.openaiWs.send(event.data);
        });

        ws.addEventListener('close', () => {
            this.sessions.delete(ws);
            this.stopIdleTimeoutChecker();
            if (this.openaiWs) {
                this.openaiWs.close();
            }
        });
    }

    // Chú thích: Kiểm tra idle timeout - tự động ngắt sau 20 giây không hoạt động
    startIdleTimeoutChecker(ws) {
        const IDLE_TIMEOUT_MS = 20000; // 20 seconds
        const CHECK_INTERVAL_MS = 5000; // Check every 5 seconds

        this.idleTimeoutHandle = setInterval(() => {
            const idleDuration = Date.now() - this.lastActivityTimestamp;
            if (idleDuration > IDLE_TIMEOUT_MS) {
                console.log('[DO] Idle timeout reached, closing connection');
                ws.send(JSON.stringify({ type: 'idle_timeout', message: 'Cuộc gọi tự động kết thúc do không có hoạt động' }));
                ws.close(1000, 'Idle timeout');
                this.stopIdleTimeoutChecker();
            }
        }, CHECK_INTERVAL_MS);
    }

    stopIdleTimeoutChecker() {
        if (this.idleTimeoutHandle) {
            clearInterval(this.idleTimeoutHandle);
            this.idleTimeoutHandle = null;
        }
    }

    sendSessionUpdate() {
        // Chú thích: Persona "Người bạn tốt" - thân thiện, chuyên nghiệp, 1-1
        const sessionUpdate = {
            type: "session.update",
            session: {
                modalities: ["text", "audio"],
                instructions: `# BẠN ĐỒNG HÀNH - Người Bạn Tốt của Học Sinh

## DANH TÍNH
Bạn là "Bạn Đồng Hành" - một người bạn thân thiện, ấm áp, luôn sẵn sàng lắng nghe và trò chuyện. Bạn nói chuyện tự nhiên như một người bạn thật sự, không phải như robot hay AI.

## PHONG CÁCH GIAO TIẾP
- Nói chuyện THÂN MẬT, TỰ NHIÊN như đang gọi điện với bạn thân
- Giọng điệu: ấm áp, vui vẻ, đôi khi hài hước
- Dùng từ ngữ đời thường, dễ hiểu
- MỖI LƯỢT NÓI CHỈ 1-2 CÂU, ngắn gọn như đang chat
- Đặt câu hỏi để tiếp tục cuộc trò chuyện
- Thể hiện sự quan tâm và đồng cảm thực sự
- KHÔNG bao giờ nói "Tôi là AI" hay "Tôi không có cảm xúc"

## CÁCH BẮT ĐẦU VÀ DUY TRÌ CUỘC TRÒ CHUYỆN
- Chủ động chào hỏi khi bắt đầu: "Ê, chào bạn! Hôm nay bạn thế nào?"
- Nếu im lặng, hãy nhẹ nhàng hỏi thăm hoặc kể chuyện vui
- Luôn kết thúc bằng một câu hỏi hoặc gợi ý tiếp tục

## CHỦ ĐỀ PHÙ HỢP
- Học tập: giải thích bài, tips học hiệu quả
- Tâm sự: bạn bè, crush, gia đình, trường lớp
- Giải trí: phim, nhạc, game, sở thích
- Tư vấn: hướng nghiệp, kỹ năng sống
- Động viên: khi stress, buồn, áp lực thi cử

## AN TOÀN (QUAN TRỌNG)
❌ KHÔNG: tư vấn y tế chuyên sâu, nội dung 18+, bạo lực, ma túy, tự gây hại
✅ NẾU CẦN: khuyên tìm người lớn tin cậy hoặc hotline 1800 599 920

## NGÔN NGỮ
- Mặc định: Tiếng Việt tự nhiên, có thể dùng từ teen/slang nhẹ
- Nếu bạn nói tiếng Anh → chuyển sang tiếng Anh`,
                voice: "shimmer", // Giọng nữ ấm áp
                input_audio_format: "pcm16",
                output_audio_format: "pcm16",
                turn_detection: {
                    type: "server_vad",
                    threshold: 0.5,
                    prefix_padding_ms: 300,
                    silence_duration_ms: 800 // Cho phép nghĩ lâu hơn một chút
                }
            }
        };
        this.openaiWs.send(JSON.stringify(sessionUpdate));
        console.log('[DO] Session update sent - Friendly persona configured');
    }
}
