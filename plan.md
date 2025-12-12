# 🎯 MASTER PLAN - BẠN ĐỒNG HÀNH

## 📋 OVERVIEW
**Mục tiêu**: Production-ready web app hỗ trợ tâm lý học đường trong 13 ngày  
**Philosophy**: Code như team thật vận hành. Ship fast, iterate later.

---

## 🗂️ FOLDER STRUCTURE

```
ban-dong-hanh/
├── frontend/                    # Vite + React
│   ├── src/
│   │   ├── components/         
│   │   │   ├── layout/         # Sidebar, Header, FocusMode wrapper
│   │   │   ├── dashboard/      # Welcome screen, Stats cards
│   │   │   ├── breathing/      # Breathing Bubble (Framer Motion)
│   │   │   ├── gratitude/      # Lọ Biết Ơn UI
│   │   │   ├── games/          # Canvas games (Ong, Nhanh tay)
│   │   │   └── chat/           # AI Chatbot UI + SOS overlay
│   │   ├── hooks/              # useAuth, useFocusMode, useAI
│   │   ├── utils/              
│   │   │   ├── sosDetector.js  # Keyword scanner
│   │   │   └── storage.js      # localStorage helpers
│   │   ├── styles/             # Tailwind config + custom CSS
│   │   └── App.jsx             # Root + React Router
│   └── package.json
│
├── backend/                     # Cloudflare Workers
│   ├── workers/
│   │   ├── ai-proxy.js         # Gemini API wrapper + prompt guard
│   │   └── auth.js             # Session handling (optional)
│   └── wrangler.toml
│
└── docs/
    └── PROMPTS.md              # System instructions cho Gemini
```

---

## 🚀 GIAI ĐOẠN 1: CORE & UI (3 NGÀY)

### **DAY 1: Setup + Layout Foundation**

#### 1.1. Init Project
```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install tailwindcss framer-motion react-router-dom
npx tailwindcss init
```

#### 1.2. Tailwind Config (Pastel Theme)
```js
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#FFB6C1',    // Pastel Pink
        secondary: '#E6E6FA',  // Lavender
        accent: '#B0E0E6',     // Powder Blue
        danger: '#FFB4B4',     // Soft Red (SOS mode)
      }
    }
  }
}
```

#### 1.3. Core Components
**File: `src/components/layout/Sidebar.jsx`**
```jsx
import { Home, Heart, MessageCircle, Gamepad2 } from 'lucide-react';

export default function Sidebar({ focusMode }) {
  if (focusMode) return null; // Ẩn hẳn khi Focus Mode

  const navItems = [
    { icon: Home, label: 'Trang chủ', path: '/' },
    { icon: Heart, label: 'Góc An Yên', path: '/breathing' },
    { icon: MessageCircle, label: 'Tâm sự', path: '/chat' },
    { icon: Gamepad2, label: 'Giải trí', path: '/games' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4">
      {/* Logo + Navigation */}
    </aside>
  );
}
```

**File: `src/components/layout/FocusModeToggle.jsx`**
```jsx
import { useFocusMode } from '../../hooks/useFocusMode';

export default function FocusModeToggle() {
  const { focusMode, toggle } = useFocusMode();
  
  return (
    <button 
      onClick={toggle}
      className="fixed top-4 right-4 px-4 py-2 bg-accent rounded-full"
    >
      {focusMode ? '🎯 Focus ON' : '🌈 Focus OFF'}
    </button>
  );
}
```

**File: `src/hooks/useFocusMode.js`**
```js
import { create } from 'zustand';

const useFocusMode = create((set) => ({
  focusMode: false,
  toggle: () => set((state) => ({ focusMode: !state.focusMode }))
}));

export { useFocusMode };
```

#### 1.4. Dashboard Screen
**File: `src/components/dashboard/Welcome.jsx`**
```jsx
export default function Welcome({ userName }) {
  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold text-primary">
        Chào {userName || 'bạn'} 👋
      </h1>
      <p className="text-gray-600 mt-4">
        Hôm nay bạn cảm thấy thế nào?
      </p>
      {/* Mood selector: 😊 😐 😢 😡 */}
    </div>
  );
}
```

**✅ Checklist Day 1:**
- [ ] Vite project chạy được
- [ ] Tailwind hiển thị màu pastel
- [ ] Sidebar có icons + navigation
- [ ] Focus Mode toggle hoạt động (ẩn sidebar)
- [ ] Dashboard có welcome message

---

### **DAY 2-3: Responsive + Polish UI**

#### 2.1. Responsive Layout
```jsx
// src/App.jsx
function App() {
  const { focusMode } = useFocusMode();

  return (
    <div className={`min-h-screen ${focusMode ? 'grid place-items-center' : 'flex'}`}>
      {!focusMode && <Sidebar />}
      <main className="flex-1 p-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          {/* Các routes khác */}
        </Routes>
      </main>
      <FocusModeToggle />
    </div>
  );
}
```

#### 2.2. Session Management
```js
// src/utils/storage.js
export const saveSession = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getSession = () => {
  return JSON.parse(localStorage.getItem('user') || '{}');
};
```

**✅ Checklist Day 2-3:**
- [ ] Layout responsive mobile/desktop
- [ ] localStorage lưu tên user
- [ ] Navigation hoạt động (React Router)
- [ ] UI polish: hover effects, transitions

---

## 🧘 GIAI ĐOẠN 2: TÂM LÝ & GAME (5 NGÀY)

### **DAY 4-5: Breathing Bubble (Framer Motion)**

**File: `src/components/breathing/BreathingBubble.jsx`**
```jsx
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function BreathingBubble() {
  const [phase, setPhase] = useState('inhale'); // inhale | hold | exhale
  
  useEffect(() => {
    const cycle = setInterval(() => {
      setPhase((prev) => {
        if (prev === 'inhale') return 'hold';
        if (prev === 'hold') return 'exhale';
        return 'inhale';
      });
    }, 5000); // Mỗi phase 5s
    
    return () => clearInterval(cycle);
  }, []);

  const bubbleSize = {
    inhale: 200,
    hold: 200,
    exhale: 120
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <motion.div
        className="rounded-full bg-gradient-to-br from-blue-400 to-purple-300"
        animate={{
          width: bubbleSize[phase],
          height: bubbleSize[phase],
        }}
        transition={{ duration: 4, ease: 'easeInOut' }}
      />
      <p className="mt-8 text-2xl font-light">
        {phase === 'inhale' && '🌬️ Hít vào...'}
        {phase === 'hold' && '⏸️ Giữ...'}
        {phase === 'exhale' && '😮‍💨 Thở ra...'}
      </p>
    </div>
  );
}
```

**✅ Checklist Day 4-5:**
- [ ] Bubble animation mượt (60fps)
- [ ] Màu chuyển từ xanh → tím
- [ ] Text hướng dẫn sync với animation
- [ ] Timer hiển thị progress (0-30s)

---

### **DAY 6-7: Lọ Biết Ơn + Streak**

**File: `src/components/gratitude/GratitudeJar.jsx`**
```jsx
export default function GratitudeJar() {
  const [entries, setEntries] = useState([]);
  const [streak, setStreak] = useState(0);

  const addEntry = (text) => {
    const newEntry = {
      id: Date.now(),
      text,
      date: new Date().toISOString()
    };
    setEntries([...entries, newEntry]);
    localStorage.setItem('gratitude', JSON.stringify([...entries, newEntry]));
    
    // Tính streak
    updateStreak();
  };

  const updateStreak = () => {
    // Logic: Check nếu hôm qua có entry → streak++, nếu không → reset
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2>🏺 Lọ Biết Ơn của bạn</h2>
      <p className="text-sm text-gray-500">Streak: {streak} ngày 🔥</p>
      
      <textarea 
        placeholder="Hôm nay bạn biết ơn điều gì?"
        className="w-full p-4 border rounded-lg"
      />
      <button onClick={addEntry}>Thêm vào lọ</button>

      {/* Hiển thị các entry dạng sticky notes */}
    </div>
  );
}
```

**✅ Checklist Day 6-7:**
- [ ] Form thêm entry + lưu localStorage
- [ ] Hiển thị danh sách entries
- [ ] Tính streak dựa trên ngày liên tiếp
- [ ] Gợi ý nội dung nếu user bí ý tưởng

---

### **DAY 8: Minigames (Canvas API)**

**File: `src/components/games/BeeGame.jsx`**
```jsx
import { useEffect, useRef } from 'react';

export default function BeeGame() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    let beeY = 200;
    let gravity = 0.5;
    let velocity = 0;
    
    const gameLoop = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update physics
      velocity += gravity;
      beeY += velocity;
      
      // Draw bee (emoji hoặc sprite)
      ctx.font = '40px Arial';
      ctx.fillText('🐝', 100, beeY);
      
      // Collision detection với obstacles
      
      requestAnimationFrame(gameLoop);
    };
    
    gameLoop();
    
    // Xử lý input
    const handleSpace = (e) => {
      if (e.code === 'Space') {
        velocity = -8; // Flap wings
      }
    };
    
    window.addEventListener('keydown', handleSpace);
    return () => window.removeEventListener('keydown', handleSpace);
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} width={800} height={600} className="border" />
      <p className="text-center mt-4">Nhấn Space để bay!</p>
    </div>
  );
}
```

**✅ Checklist Day 8:**
- [ ] Game loop chạy 60fps
- [ ] Physics cơ bản (gravity, jump)
- [ ] Obstacles spawn random
- [ ] Score tracking

---

## 🤖 GIAI ĐOẠN 3: AI CORE (3 NGÀY)

### **DAY 9: Cloudflare Worker Setup**

**File: `backend/workers/ai-proxy.js`**
```js
export default {
  async fetch(request) {
    const { message, history } = await request.json();
    
    // 1. Input validation + keyword blocking
    const blocked = checkBlockedKeywords(message);
    if (blocked) {
      return new Response(JSON.stringify({
        error: 'Vui lòng tránh dùng ngôn từ không phù hợp'
      }), { status: 400 });
    }
    
    // 2. SOS Detection
    const sosLevel = detectSOS(message);
    if (sosLevel === 'high') {
      return new Response(JSON.stringify({
        sos: true,
        message: 'Mình thấy bạn đang gặp khó khăn. Hãy liên hệ: ...'
      }));
    }
    
    // 3. Call Gemini API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY // Dùng Cloudflare Secrets
      },
      body: JSON.stringify({
        contents: formatHistory(history, message),
        generationConfig: {
          temperature: 0.7,
          topP: 0.95
        }
      })
    });
    
    const data = await response.json();
    return new Response(JSON.stringify(data));
  }
};

function detectSOS(text) {
  const highRiskKeywords = ['tự tử', 'chết đi', 'kết thúc cuộc đời'];
  const lowerText = text.toLowerCase();
  
  for (const keyword of highRiskKeywords) {
    if (lowerText.includes(keyword)) return 'high';
  }
  return 'safe';
}
```

**✅ Checklist Day 9:**
- [ ] Worker deploy thành công trên Cloudflare
- [ ] Gemini API key hoạt động
- [ ] SOS detector catch được từ khóa nguy hiểm
- [ ] CORS config cho frontend

---

### **DAY 10-11: AI Personality + Deep Reasoning**

**File: `docs/PROMPTS.md`**
```markdown
# SYSTEM INSTRUCTIONS CHO GEMINI

## Vai trò
Bạn là "Bạn Đồng Hành" - một người bạn tâm lý ấm áp, không phán xét, luôn lắng nghe.

## Nguyên tắc trả lời
1. **Đồng cảm trước tiên**: Luôn thừa nhận cảm xúc của học sinh
   VD: "Mình hiểu cảm giác đó khó chịu lắm..."
   
2. **Không robot**: Tránh câu cứng nhắc như "Tôi là AI..."
   
3. **Ngắn gọn**: Mỗi câu trả lời ~50-80 từ (học sinh ADHD dễ mất tập trung)
   
4. **Hỏi mở**: Kết thúc bằng câu hỏi để học sinh tự suy ngẫm
   VD: "Bạn nghĩ điều gì đã khiến bạn cảm thấy vậy?"

## Quy trình suy luận (Chain-of-Thought)
Trước khi trả lời, hãy tự hỏi:
- Cảm xúc chính của học sinh là gì? (buồn/giận/sợ/lo)
- Nguyên nhân có thể là gì? (học tập/bạn bè/gia đình)
- Học sinh cần gì nhất lúc này? (được lắng nghe/lời khuyên/hành động cụ thể)

## Red Flags - BẮT BUỘC BÁO ĐỘNG
Nếu phát hiện:
- Ý định tự làm hại bản thân
- Bị bạo lực/lạm dụng
- Trầm cảm kéo dài >2 tuần

→ TRẢ LỜI: "Mình lo lắng cho bạn quá. Tình huống này cần sự giúp đỡ từ người lớn. 
   Hãy liên hệ: [Hotline/Giáo viên]"
```

**File: `backend/workers/ai-proxy.js` (Update)**
```js
function formatHistory(history, newMessage) {
  const systemPrompt = `
    ${PROMPTS.SYSTEM_INSTRUCTIONS}
    
    # Ngữ cảnh hội thoại trước:
    ${history.slice(-5).map(h => `${h.role}: ${h.content}`).join('\n')}
  `;
  
  return [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: 'Mình hiểu rồi, sẽ làm theo!' }] },
    { role: 'user', parts: [{ text: newMessage }] }
  ];
}
```

**✅ Checklist Day 10-11:**
- [ ] System prompt test với 10 tình huống thực tế
- [ ] AI trả lời tự nhiên (không cứng nhắc)
- [ ] Context window giới hạn 5 message gần nhất
- [ ] Response time < 3s (test với streaming)

---

## 🎨 GIAI ĐOẠN 4: HOÀN THIỆN (2 NGÀY)

### **DAY 12: Frontend-Backend Integration**

**File: `src/hooks/useAI.js`**
```js
import { useState } from 'react';

export function useAI() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text) => {
    setLoading(true);
    
    const response = await fetch('https://your-worker.workers.dev/ai-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        history: messages
      })
    });
    
    const data = await response.json();
    
    if (data.sos) {
      // Trigger SOS UI
      showSOSOverlay(data.message);
    } else {
      setMessages([
        ...messages,
        { role: 'user', content: text },
        { role: 'assistant', content: data.text }
      ]);
    }
    
    setLoading(false);
  };

  return { messages, sendMessage, loading };
}
```

**✅ Checklist Day 12:**
- [ ] Frontend gọi worker thành công
- [ ] Chat UI hiển thị message real-time
- [ ] SOS overlay hoạt động
- [ ] Error handling (network fail, API limit)

---

### **DAY 13: Testing + Deploy**

#### 13.1. Lighthouse Performance Test
```bash
# Run Lighthouse CLI
npx lighthouse https://your-app.pages.dev --view
```
**Target Scores:**
- Performance: >85
- Accessibility: >90
- Best Practices: >90

#### 13.2. Deployment
```bash
# Frontend (Cloudflare Pages)
npm run build
npx wrangler pages deploy dist

# Backend (Cloudflare Workers)
cd backend
npx wrangler deploy
```

**✅ Final Checklist:**
- [ ] All features hoạt động end-to-end
- [ ] Mobile responsive test (iPhone, Android)
- [ ] Source code có comments tiếng Việt
- [ ] README.md với hướng dẫn setup
- [ ] Demo video 3 phút

---

## 🛡️ RISK MITIGATION (Tích hợp sẵn)

### 1. AI Hallucination Prevention
```js
// Trong system prompt
const SAFETY_NET = `
QUAN TRỌNG: Nếu không chắc chắn về thông tin tâm lý học, hãy nói:
"Mình không chắc lắm về điều này. Bạn nên hỏi thầy cô hoặc tìm nguồn tin cậy nhé!"

KHÔNG BAO GIỜ bịa ra:
- Chẩn đoán bệnh lý
- Liều lượng thuốc
- Thống kê y khoa
`;
```

### 2. Prompt Injection Guard
```js
function sanitizeInput(text) {
  const dangerousPatterns = [
    /ignore (previous|above) (instructions|prompts)/i,
    /you are now/i,
    /system:/i
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(text)) {
      throw new Error('Invalid input detected');
    }
  }
  
  return text;
}
```

### 3. Cost Control (API Budget)
```js
// Trong worker
const MONTHLY_LIMIT = 500000; // tokens
let usedTokens = 0; // Lưu vào Durable Objects hoặc KV

if (usedTokens > MONTHLY_LIMIT) {
  return new Response('Đã đạt giới hạn sử dụng tháng này', { status: 429 });
}
```

---

## 📝 VIBECODING TIPS

1. **Commit thường xuyên**: Mỗi feature xong → commit ngay
2. **Test từng component**: Đừng code 3 ngày mới test 1 lần
3. **Console.log là bạn**: Debug bằng mắt trước khi dùng debugger
4. **Placeholder data**: Dùng mock data để test UI trước khi có API
5. **README.md**: Ghi chú mọi decision (tại sao chọn lib X thay vì Y)

---

## 🎯 SUCCESS METRICS

- [ ] User có thể hoàn thành 1 session thở (30s) không crash
- [ ] AI trả lời trong <3s
- [ ] SOS detector catch được 90% test cases
- [ ] Mobile UX mượt (không lag khi scroll)
- [ ] Lighthouse Performance >85

---

**🚀 LET'S BUILD!**