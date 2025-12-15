-- D1 Database Schema cho Bạn Đồng Hành
-- Chú thích: Schema cho user data storage, auth, và token tracking

-- Bảng users: quản lý tài khoản đơn giản
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  is_admin INTEGER DEFAULT 0, -- 1 = admin có quyền quản trị
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
  tag TEXT, -- Tag phân loại: 'gia đình', 'bạn bè', 'sức khỏe', 'học tập', etc.
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

-- Bảng rate_limits: rate limiting cho API requests
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY, -- Format: 'user:123' hoặc 'ip:1.2.3.4'
  count INTEGER DEFAULT 1,
  reset_at INTEGER NOT NULL, -- Timestamp (milliseconds)
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_reset ON rate_limits(reset_at);

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

-- Bảng forum_reports: báo cáo vi phạm bài viết/bình luận
CREATE TABLE IF NOT EXISTS forum_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target_type TEXT NOT NULL, -- 'post' hoặc 'comment'
  target_id INTEGER NOT NULL, -- ID của post hoặc comment
  reporter_user_id INTEGER, -- NULL nếu khách báo cáo
  reason TEXT NOT NULL, -- Lý do báo cáo: 'spam', 'harassment', 'inappropriate', 'other'
  details TEXT, -- Chi tiết bổ sung (optional)
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved', 'dismissed'
  reviewed_by INTEGER, -- Admin đã xem xét
  reviewed_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (reporter_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_forum_reports_target ON forum_reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_forum_reports_status ON forum_reports(status);
CREATE INDEX IF NOT EXISTS idx_forum_reports_date ON forum_reports(created_at);

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

-- is_admin đã được thêm trực tiếp vào bảng users ở trên

-- =============================================================================
-- PHASE 2 ADDITIONS: Notifications, Stories, Games, SOS Logs
-- =============================================================================

-- Bảng notification_settings: cài đặt thông báo cho mỗi user
CREATE TABLE IF NOT EXISTS notification_settings (
  user_id INTEGER PRIMARY KEY,
  daily_reminder INTEGER DEFAULT 0, -- 1 = bật nhắc hàng ngày
  pomodoro_alerts INTEGER DEFAULT 1, -- 1 = bật thông báo Pomodoro
  sleep_reminder INTEGER DEFAULT 0, -- 1 = bật nhắc ngủ
  reminder_time TEXT, -- HH:MM format cho thời gian nhắc
  push_subscription TEXT, -- JSON Web Push subscription object
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bảng stories: thư viện truyện cho StoryTeller
CREATE TABLE IF NOT EXISTS stories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'short_story', -- 'folklore', 'fairy_tale', 'short_story', 'motivation'
  age_rating TEXT DEFAULT 'all', -- 'all', 'teen' (cho nội dung phức tạp hơn)
  is_ai_generated INTEGER DEFAULT 0, -- 1 = được tạo bởi AI
  likes_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_stories_category ON stories(category);
CREATE INDEX IF NOT EXISTS idx_stories_rating ON stories(age_rating);

-- Bảng game_scores: điểm số các minigame
CREATE TABLE IF NOT EXISTS game_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  game_type TEXT NOT NULL, -- 'space_control', 'bee_game', 'bubble_pop', 'color_match', 'doodle', 'reflex'
  score INTEGER NOT NULL,
  level_reached INTEGER DEFAULT 1,
  play_duration_seconds INTEGER, -- Thời gian chơi
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_game_scores_user ON game_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_type ON game_scores(game_type);
CREATE INDEX IF NOT EXISTS idx_game_scores_top ON game_scores(game_type, score DESC);

-- Bảng sos_logs: log sự kiện SOS để admin giám sát
CREATE TABLE IF NOT EXISTS sos_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER, -- NULL nếu khách không đăng nhập
  hashed_user_id TEXT, -- Hash ẩn danh để hiển thị
  event_type TEXT NOT NULL, -- 'overlay_opened', 'hotline_clicked', 'map_viewed', 'message_flagged'
  risk_level TEXT, -- 'red', 'yellow', 'critical'
  trigger_text TEXT, -- Từ khóa đã trigger (không lưu toàn bộ message)
  location_lat REAL, -- Vĩ độ nếu user cho phép
  location_lng REAL, -- Kinh độ nếu user cho phép
  metadata TEXT, -- JSON bổ sung (hotline clicked, action taken, etc.)
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sos_logs_date ON sos_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_sos_logs_level ON sos_logs(risk_level);
CREATE INDEX IF NOT EXISTS idx_sos_logs_user ON sos_logs(user_id);

-- Bảng random_cards_history: lịch sử thẻ wellness đã xem
CREATE TABLE IF NOT EXISTS random_cards_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  card_id TEXT NOT NULL, -- ID thẻ đã xem
  viewed_at TEXT DEFAULT (datetime('now')),
  action_taken INTEGER DEFAULT 0, -- 1 = user đã thực hiện hành động
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_random_cards_user ON random_cards_history(user_id);

-- Bảng user_stats: thống kê tổng hợp cho gamification
CREATE TABLE IF NOT EXISTS user_stats (
  user_id INTEGER PRIMARY KEY,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  breathing_total INTEGER DEFAULT 0, -- Tổng số lần thở
  gratitude_streak INTEGER DEFAULT 0, -- Streak hiện tại
  max_gratitude_streak INTEGER DEFAULT 0, -- Streak cao nhất
  journal_count INTEGER DEFAULT 0,
  focus_total_minutes INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  highest_game_score INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
