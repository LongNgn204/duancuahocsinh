// backend/workers/user-memory.js
// Chú thích: Module quản lý bộ nhớ dài hạn persistent cho từng user
// Hỗ trợ: load/save memory, extract facts từ conversations, format context cho AI

/**
 * Load user memory từ database
 * @param {Object} env - Cloudflare env với D1 binding
 * @param {number|string} userId - User ID
 * @returns {Promise<Object|null>} User memory object hoặc null
 */
export async function loadUserMemory(env, userId) {
    if (!userId) return null;

    try {
        const memory = await env.ban_dong_hanh_db.prepare(
            `SELECT * FROM user_memory WHERE user_id = ?`
        ).bind(parseInt(userId)).first();

        if (!memory) {
            // Tạo memory mới cho user mới
            return await createNewUserMemory(env, parseInt(userId));
        }

        return parseMemoryFromDB(memory);
    } catch (error) {
        console.error('[UserMemory] Load error:', error.message);
        return null;
    }
}

/**
 * Parse memory từ DB row sang object
 */
function parseMemoryFromDB(row) {
    return {
        displayName: row.display_name,
        ageRange: row.age_range,
        interests: safeParseJSON(row.interests, []),
        personalityNotes: row.personality_notes,
        memorySummary: row.memory_summary || '',
        keyTopics: safeParseJSON(row.key_topics, []),
        keyEmotions: safeParseJSON(row.key_emotions, []),
        currentStruggles: safeParseJSON(row.current_struggles, []),
        positiveAspects: safeParseJSON(row.positive_aspects, []),
        supportNetwork: safeParseJSON(row.support_network, []),
        firstInteractionAt: row.first_interaction_at,
        lastInteractionAt: row.last_interaction_at,
        totalConversations: row.total_conversations || 0,
        totalMessages: row.total_messages || 0,
        trustLevel: row.trust_level || 'new',
        preferredTone: row.preferred_tone || 'warm',
        preferredResponseLength: row.preferred_response_length || 'medium'
    };
}

/**
 * Safe JSON parse with fallback
 */
function safeParseJSON(str, fallback = []) {
    if (!str) return fallback;
    try {
        return JSON.parse(str);
    } catch (_) {
        return fallback;
    }
}

/**
 * Tạo memory mới cho user lần đầu chat
 */
async function createNewUserMemory(env, userId) {
    const now = new Date().toISOString();

    try {
        await env.ban_dong_hanh_db.prepare(`
      INSERT INTO user_memory 
      (user_id, first_interaction_at, last_interaction_at, total_conversations, total_messages, trust_level)
      VALUES (?, ?, ?, 1, 0, 'new')
    `).bind(userId, now, now).run();

        return {
            displayName: null,
            ageRange: null,
            interests: [],
            personalityNotes: null,
            memorySummary: '',
            keyTopics: [],
            keyEmotions: [],
            currentStruggles: [],
            positiveAspects: [],
            supportNetwork: [],
            firstInteractionAt: now,
            lastInteractionAt: now,
            totalConversations: 1,
            totalMessages: 0,
            trustLevel: 'new',
            preferredTone: 'warm',
            preferredResponseLength: 'medium'
        };
    } catch (error) {
        console.error('[UserMemory] Create error:', error.message);
        return null;
    }
}

/**
 * Update user memory với thông tin mới từ AI response
 * @param {Object} env - Cloudflare env
 * @param {number} userId - User ID
 * @param {Object} memoryUpdate - Update từ AI (shouldRemember, newFacts, displayName, etc.)
 * @param {string} currentMessage - User message hiện tại
 * @param {string} traceId - Trace ID cho logging
 */
export async function updateUserMemory(env, userId, memoryUpdate, currentMessage, traceId = null) {
    if (!userId) return;

    // Nếu không có memoryUpdate hoặc không cần nhớ, chỉ update timestamps
    const shouldRemember = memoryUpdate?.shouldRemember !== false;

    try {
        // Lấy memory hiện tại
        const current = await env.ban_dong_hanh_db.prepare(
            `SELECT * FROM user_memory WHERE user_id = ?`
        ).bind(parseInt(userId)).first();

        if (!current) {
            await createNewUserMemory(env, parseInt(userId));
            return;
        }

        const updates = [];
        const params = [];

        // Luôn update timestamps
        updates.push('last_interaction_at = ?');
        params.push(new Date().toISOString());

        // Increment message count
        updates.push('total_messages = total_messages + 1');

        // Update trust level based on message count
        const newMsgCount = (current.total_messages || 0) + 1;
        if (newMsgCount >= 50 && current.trust_level !== 'trusted') {
            updates.push("trust_level = 'trusted'");
        } else if (newMsgCount >= 10 && current.trust_level === 'new') {
            updates.push("trust_level = 'familiar'");
        }

        if (shouldRemember && memoryUpdate) {
            // Update display name nếu AI detect được
            if (memoryUpdate.displayName && !current.display_name) {
                updates.push('display_name = ?');
                params.push(memoryUpdate.displayName);

                // Log name detection
                await logMemoryEvent(env, userId, 'name_detected', memoryUpdate.displayName, traceId);
            }

            // Merge new facts vào memory summary
            if (memoryUpdate.newFacts?.length > 0) {
                const existingSummary = current.memory_summary || '';
                const newSummary = compressMemorySummary(existingSummary, memoryUpdate.newFacts);
                updates.push('memory_summary = ?');
                params.push(newSummary);

                // Log facts
                for (const fact of memoryUpdate.newFacts) {
                    await logMemoryEvent(env, userId, 'fact_learned', fact, traceId);
                }
            }

            // Update key topics từ message
            const extractedTopics = extractTopicsFromMessage(currentMessage);
            if (extractedTopics.length > 0) {
                const existingTopics = safeParseJSON(current.key_topics, []);
                const mergedTopics = mergeLists(existingTopics, extractedTopics, 15);
                updates.push('key_topics = ?');
                params.push(JSON.stringify(mergedTopics));
            }

            // Update emotion pattern
            if (memoryUpdate.emotionPattern) {
                const existingEmotions = safeParseJSON(current.key_emotions, []);
                existingEmotions.push({
                    emotion: memoryUpdate.emotionPattern,
                    timestamp: new Date().toISOString()
                });
                // Keep last 30 emotions
                const recentEmotions = existingEmotions.slice(-30);
                updates.push('key_emotions = ?');
                params.push(JSON.stringify(recentEmotions));

                // Log emotion
                await logMemoryEvent(env, userId, 'emotion_expressed', memoryUpdate.emotionPattern, traceId);
            }

            // Update struggles/positive aspects nếu có
            if (memoryUpdate.currentStruggle) {
                const struggles = safeParseJSON(current.current_struggles, []);
                if (!struggles.includes(memoryUpdate.currentStruggle)) {
                    struggles.push(memoryUpdate.currentStruggle);
                    updates.push('current_struggles = ?');
                    params.push(JSON.stringify(struggles.slice(-10)));
                }
            }

            if (memoryUpdate.positiveAspect) {
                const positives = safeParseJSON(current.positive_aspects, []);
                if (!positives.includes(memoryUpdate.positiveAspect)) {
                    positives.push(memoryUpdate.positiveAspect);
                    updates.push('positive_aspects = ?');
                    params.push(JSON.stringify(positives.slice(-10)));
                }
            }
        }

        updates.push("updated_at = datetime('now')");
        params.push(parseInt(userId));

        await env.ban_dong_hanh_db.prepare(`
      UPDATE user_memory SET ${updates.join(', ')} WHERE user_id = ?
    `).bind(...params).run();

    } catch (error) {
        console.error('[UserMemory] Update error:', error.message);
    }
}

/**
 * Log memory event cho audit và fine-tuning
 */
async function logMemoryEvent(env, userId, logType, content, traceId) {
    try {
        await env.ban_dong_hanh_db.prepare(`
      INSERT INTO user_memory_logs (user_id, log_type, content, source_message_id)
      VALUES (?, ?, ?, ?)
    `).bind(parseInt(userId), logType, content, traceId).run();
    } catch (error) {
        console.error('[UserMemory] Log error:', error.message);
    }
}

/**
 * Increment conversation count (gọi khi bắt đầu session mới)
 */
export async function incrementConversationCount(env, userId) {
    if (!userId) return;

    try {
        await env.ban_dong_hanh_db.prepare(`
      UPDATE user_memory 
      SET total_conversations = total_conversations + 1,
          last_interaction_at = datetime('now'),
          updated_at = datetime('now')
      WHERE user_id = ?
    `).bind(parseInt(userId)).run();
    } catch (error) {
        console.error('[UserMemory] Increment conversation error:', error.message);
    }
}

/**
 * Format memory context cho system prompt
 * @param {Object} memory - User memory object
 * @returns {string} Formatted context string
 */
export function formatMemoryContext(memory) {
    if (!memory) return 'Đây là lần đầu tiên gặp user này. Hãy giới thiệu bản thân và hỏi tên họ.';

    const parts = [];

    // Relationship info
    parts.push(`📊 THỐNG KÊ:`);
    parts.push(`- Đã trò chuyện: ${memory.totalConversations} cuộc, ${memory.totalMessages} tin nhắn`);
    parts.push(`- Mức độ quen thuộc: ${translateTrustLevel(memory.trustLevel)}`);

    // Display name
    if (memory.displayName) {
        parts.push(`\n👤 THÔNG TIN:`);
        parts.push(`- Tên: ${memory.displayName}`);
        if (memory.ageRange) {
            parts.push(`- Độ tuổi: ${translateAgeRange(memory.ageRange)}`);
        }
    }

    // Key topics
    if (memory.keyTopics?.length > 0) {
        parts.push(`\n📌 CHỦ ĐỀ THƯỜNG THẢO LUẬN:`);
        parts.push(`- ${memory.keyTopics.slice(-8).join(', ')}`);
    }

    // Current struggles
    if (memory.currentStruggles?.length > 0) {
        parts.push(`\n⚠️ VẤN ĐỀ ĐANG GẶP:`);
        memory.currentStruggles.slice(-5).forEach(s => {
            parts.push(`- ${s}`);
        });
    }

    // Positive aspects
    if (memory.positiveAspects?.length > 0) {
        parts.push(`\n✨ ĐIỂM TÍCH CỰC:`);
        memory.positiveAspects.slice(-3).forEach(p => {
            parts.push(`- ${p}`);
        });
    }

    // Recent emotions
    if (memory.keyEmotions?.length > 0) {
        const recentEmotions = memory.keyEmotions.slice(-5).map(e =>
            typeof e === 'object' ? e.emotion : e
        );
        parts.push(`\n💭 CẢM XÚC GẦN ĐÂY: ${recentEmotions.join(' → ')}`);
    }

    // Memory summary
    if (memory.memorySummary) {
        parts.push(`\n📝 TÓM TẮT:`);
        parts.push(`${memory.memorySummary}`);
    }

    // Interaction guidance based on trust level
    parts.push(`\n🎯 HƯỚNG DẪN TƯƠNG TÁC:`);
    switch (memory.trustLevel) {
        case 'trusted':
            parts.push(`- User đã tin tưởng, có thể đi sâu hơn vào vấn đề`);
            parts.push(`- Có thể gợi ý giải pháp cụ thể hơn`);
            break;
        case 'familiar':
            parts.push(`- User đã quen thuộc, có thể hỏi sâu hơn`);
            parts.push(`- Nhắc lại context cũ nếu phù hợp`);
            break;
        default:
            parts.push(`- User còn mới, tập trung lắng nghe và xây dựng trust`);
            parts.push(`- Hỏi tên nếu họ chưa giới thiệu`);
    }

    return parts.join('\n');
}

/**
 * Clear user memory (cho chức năng "Reset AI memory")
 */
export async function clearUserMemory(env, userId) {
    if (!userId) return false;

    try {
        await env.ban_dong_hanh_db.prepare(`
      DELETE FROM user_memory WHERE user_id = ?
    `).bind(parseInt(userId)).run();

        await env.ban_dong_hanh_db.prepare(`
      DELETE FROM user_memory_logs WHERE user_id = ?
    `).bind(parseInt(userId)).run();

        return true;
    } catch (error) {
        console.error('[UserMemory] Clear error:', error.message);
        return false;
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function translateTrustLevel(level) {
    const map = {
        new: 'Mới quen (đang tìm hiểu)',
        familiar: 'Quen thuộc (có thể trao đổi sâu hơn)',
        trusted: 'Tin tưởng (có thể thảo luận vấn đề nhạy cảm)'
    };
    return map[level] || 'Mới quen';
}

function translateAgeRange(range) {
    const map = {
        'under_15': 'Dưới 15 tuổi',
        '15_17': '15-17 tuổi',
        '18_plus': '18 tuổi trở lên'
    };
    return map[range] || range;
}

function compressMemorySummary(existing, newFacts) {
    // Append new facts
    let combined = existing;
    if (existing && !existing.endsWith('.')) {
        combined += '. ';
    }
    combined += newFacts.join('. ');

    // Keep last 500 chars, nhưng không cắt giữa câu
    if (combined.length > 500) {
        combined = combined.slice(-500);
        // Tìm điểm cắt hợp lý (sau dấu chấm)
        const firstSentenceEnd = combined.indexOf('. ');
        if (firstSentenceEnd > 0 && firstSentenceEnd < 100) {
            combined = combined.slice(firstSentenceEnd + 2);
        }
    }

    return combined.trim();
}

function extractTopicsFromMessage(message) {
    if (!message) return [];

    const topicKeywords = {
        'học tập': ['học', 'bài', 'thi', 'điểm', 'môn', 'trường', 'lớp', 'thầy', 'cô', 'giáo viên'],
        'gia đình': ['bố', 'mẹ', 'ba', 'má', 'anh', 'chị', 'em', 'ông', 'bà', 'gia đình', 'nhà'],
        'bạn bè': ['bạn', 'friend', 'crush', 'người yêu', 'nhóm'],
        'tình cảm': ['yêu', 'thích', 'crush', 'chia tay', 'tình', 'cặp'],
        'stress': ['stress', 'áp lực', 'mệt', 'kiệt sức', 'overwhelm'],
        'lo lắng': ['lo', 'sợ', 'bất an', 'hoang mang', 'lo lắng'],
        'buồn': ['buồn', 'khóc', 'tủi', 'chán', 'nản'],
        'cô đơn': ['cô đơn', 'một mình', 'không ai', 'lẻ loi'],
        'game': ['game', 'chơi', 'rank', 'đội'],
        'thể thao': ['đá bóng', 'bóng đá', 'gym', 'chạy', 'thể thao'],
        'âm nhạc': ['nhạc', 'hát', 'nghe', 'bài hát', 'ca sĩ'],
        'tương lai': ['tương lai', 'nghề nghiệp', 'đại học', 'sau này', 'ngành'],
        'sức khỏe': ['ốm', 'bệnh', 'đau', 'mất ngủ', 'ngủ', 'sức khỏe']
    };

    const msgLower = message.toLowerCase();
    const foundTopics = [];

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
        if (keywords.some(kw => msgLower.includes(kw))) {
            foundTopics.push(topic);
        }
    }

    return foundTopics;
}

function mergeLists(existing, newItems, limit = 15) {
    const merged = [...new Set([...existing, ...newItems])];
    return merged.slice(-limit);
}
