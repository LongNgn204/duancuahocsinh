-- =============================================================================
-- PHASE 9: User Memory System cho AI Chat
-- Chú thích: Persistent memory để AI nhớ context từng user qua các phiên chat
-- =============================================================================

-- Bảng user_memory: Lưu trữ context/memory persistent cho từng user
CREATE TABLE IF NOT EXISTS user_memory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  
  -- Profile extraction từ conversations
  display_name TEXT,           -- Tên user muốn được gọi (nếu họ giới thiệu)
  age_range TEXT,              -- 'under_15', '15_17', '18_plus'
  interests TEXT,              -- JSON: ["học tập", "game", "âm nhạc"]
  personality_notes TEXT,      -- AI's notes về personality traits
  
  -- Memory summary (compressed context từ các cuộc hội thoại)
  memory_summary TEXT,         -- Summary tổng hợp (tối đa 500 chars)
  key_topics TEXT,             -- JSON: topics thường xuyên đề cập
  key_emotions TEXT,           -- JSON: emotional patterns gần đây
  
  -- Contextual information
  current_struggles TEXT,      -- JSON: vấn đề đang gặp phải
  positive_aspects TEXT,       -- JSON: điểm tích cực trong cuộc sống
  support_network TEXT,        -- JSON: nguồn hỗ trợ (gia đình, bạn bè, etc.)
  
  -- Relationship building
  first_interaction_at TEXT,   -- Timestamp lần đầu chat
  last_interaction_at TEXT,    -- Timestamp lần cuối chat
  total_conversations INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  trust_level TEXT DEFAULT 'new', -- 'new', 'familiar', 'trusted'
  
  -- Preferences
  preferred_tone TEXT DEFAULT 'warm', -- 'warm', 'casual', 'formal'
  preferred_response_length TEXT DEFAULT 'medium', -- 'short', 'medium', 'long'
  
  -- Timestamps
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index cho truy vấn nhanh
CREATE INDEX IF NOT EXISTS idx_user_memory_user ON user_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memory_trust ON user_memory(trust_level);
CREATE INDEX IF NOT EXISTS idx_user_memory_last_interaction ON user_memory(last_interaction_at);

-- Bảng user_memory_logs: Log chi tiết để fine-tune memory
CREATE TABLE IF NOT EXISTS user_memory_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  log_type TEXT NOT NULL,        -- 'name_detected', 'topic_mentioned', 'emotion_expressed', 'fact_learned'
  content TEXT NOT NULL,         -- Chi tiết log
  source_message_id TEXT,        -- Trace ID của message gốc
  confidence REAL DEFAULT 0.8,   -- Độ tin cậy của extraction
  created_at TEXT DEFAULT (datetime('now')),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_memory_logs_user ON user_memory_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_logs_type ON user_memory_logs(log_type);
