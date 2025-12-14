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

-- =============================================================================
-- PHASE 1 ADDITIONS: Sleep Logs, Forum, Admin
-- =============================================================================

-- Bảng sleep_logs: theo dõi giấc ngủ
CREATE TABLE IF NOT EXISTS sleep_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  sleep_time TEXT NOT NULL, -- Thời gian đi ngủ (HH:MM hoặc ISO timestamp)
  wake_time TEXT NOT NULL, -- Thời gian thức dậy
  duration_minutes INTEGER, -- Tổng thời gian ngủ (phút)
  quality INTEGER CHECK(quality >= 1 AND quality <= 5), -- Đánh giá 1-5 sao
  notes TEXT, -- Ghi chú thêm
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sleep_user ON sleep_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_date ON sleep_logs(created_at);

-- Bảng forum_posts: bài viết diễn đàn ẩn danh
CREATE TABLE IF NOT EXISTS forum_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER, -- NULL nếu hoàn toàn ẩn danh
  hashed_user_id TEXT, -- Hash để hiển thị "Người dùng #abc123"
  title TEXT, -- Tiêu đề bài viết (optional)
  content TEXT NOT NULL,
  tags TEXT, -- JSON array: ["học tập", "tâm sự"]
  upvotes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_locked INTEGER DEFAULT 0, -- 1 = khóa không cho comment
  is_hidden INTEGER DEFAULT 0, -- 1 = ẩn khỏi danh sách công khai
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_forum_posts_date ON forum_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_forum_posts_user ON forum_posts(user_id);

-- Bảng forum_comments: bình luận bài viết
CREATE TABLE IF NOT EXISTS forum_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  user_id INTEGER, -- NULL nếu ẩn danh
  hashed_user_id TEXT,
  content TEXT NOT NULL,
  is_hidden INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON forum_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_date ON forum_comments(created_at);

-- Bảng forum_upvotes: theo dõi ai đã upvote (tránh upvote nhiều lần)
CREATE TABLE IF NOT EXISTS forum_upvotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(post_id, user_id),
  FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bảng admin_logs: lịch sử hành động admin
CREATE TABLE IF NOT EXISTS admin_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_user_id INTEGER NOT NULL,
  action_type TEXT NOT NULL, -- 'delete_post', 'hide_comment', 'ban_user'
  target_type TEXT, -- 'post', 'comment', 'user'
  target_id INTEGER,
  reason TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (admin_user_id) REFERENCES users(id)
);

-- Bảng banned_users: danh sách user bị cấm
CREATE TABLE IF NOT EXISTS banned_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  reason TEXT,
  banned_by INTEGER,
  banned_until TEXT, -- NULL = vĩnh viễn
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (banned_by) REFERENCES users(id)
);

-- Thêm cột is_admin vào users table (nếu chưa có)
-- ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0;
