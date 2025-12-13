-- D1 Database Schema cho Bạn Đồng Hành
-- Chú thích: Schema cho user data storage, auth, và token tracking

-- Bảng users: quản lý tài khoản đơn giản
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  created_at TEXT DEFAULT (datetime('now')),
  last_login TEXT
);

-- Index cho tìm kiếm nhanh username
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Bảng gratitude: lọ biết ơn
CREATE TABLE IF NOT EXISTS gratitude (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_gratitude_user ON gratitude(user_id);
CREATE INDEX IF NOT EXISTS idx_gratitude_date ON gratitude(created_at);

-- Bảng journal: nhật ký + mood tracker
CREATE TABLE IF NOT EXISTS journal (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  mood TEXT, -- 'happy', 'calm', 'neutral', 'sad', 'stressed'
  tags TEXT, -- JSON array: ["học tập", "gia đình"]
  sentiment_score REAL, -- 0.0 to 1.0 từ AI analysis
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_journal_user ON journal(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_date ON journal(created_at);

-- Bảng focus_sessions: lịch sử Pomodoro
CREATE TABLE IF NOT EXISTS focus_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  session_type TEXT DEFAULT 'focus', -- 'focus' hoặc 'break'
  completed INTEGER DEFAULT 1, -- 1 = hoàn thành, 0 = bỏ dở
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_focus_user ON focus_sessions(user_id);

-- Bảng breathing_sessions: lịch sử bài thở
CREATE TABLE IF NOT EXISTS breathing_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  exercise_type TEXT NOT NULL, -- '478', 'box', 'simple'
  duration_seconds INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_breathing_user ON breathing_sessions(user_id);

-- Bảng achievements: huy hiệu đã mở khóa
CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  achievement_id TEXT NOT NULL, -- 'gratitude_7', 'breathing_10', etc.
  unlocked_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, achievement_id) -- Mỗi user chỉ unlock 1 lần
);

CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);

-- Bảng token_usage: theo dõi chi phí AI
CREATE TABLE IF NOT EXISTS token_usage (
  month TEXT PRIMARY KEY, -- '2024-12'
  tokens INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Bảng settings: cài đặt user
CREATE TABLE IF NOT EXISTS user_settings (
  user_id INTEGER PRIMARY KEY,
  theme TEXT DEFAULT 'system', -- 'light', 'dark', 'system'
  notifications INTEGER DEFAULT 1,
  sound INTEGER DEFAULT 1,
  font_size TEXT DEFAULT 'medium', -- 'small', 'medium', 'large'
  settings_json TEXT, -- JSON cho các settings khác
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
