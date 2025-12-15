// backend/workers/analytics-insights.js
// Chú thích: AI-generated insights từ journal/gratitude history
// Sử dụng LLM để phân tích patterns và đưa ra recommendations

import { formatMessagesForLLM } from './memory.js';
import { estimateTokens } from './token-tracker.js';

/**
 * Generate AI insights từ user data
 * @param {Object} stats - User statistics
 * @param {Array} journalEntries - Recent journal entries
 * @param {Array} gratitudeEntries - Recent gratitude entries
 * @param {Object} env - Cloudflare env
 * @returns {Promise<Object>} Insights object
 */
export async function generateInsights(stats, journalEntries = [], gratitudeEntries = [], env) {
  // Tạo prompt cho LLM
  const prompt = `Phân tích dữ liệu sau và đưa ra insights ngắn gọn (50-100 từ) và 2-3 recommendations cụ thể:

THỐNG KÊ:
- Tập trung: ${stats.focus?.totalMinutes || 0} phút, ${stats.focus?.sessions || 0} phiên
- Nhật ký: ${stats.journal?.count || 0} entries
- Giấc ngủ: TB ${Math.round((stats.sleep?.avgMinutes || 0) / 60 * 10) / 10} giờ, chất lượng ${stats.sleep?.avgQuality || 0}/5
- Biết ơn: ${stats.gratitude?.count || 0} entries
- Hơi thở: ${stats.breathing?.sessions || 0} phiên

NHẬT KÝ GẦN ĐÂY (mood patterns):
${journalEntries.slice(-5).map(e => `- ${e.mood || 'neutral'}: ${(e.content || '').slice(0, 50)}`).join('\n')}

BIẾT ƠN GẦN ĐÂY:
${gratitudeEntries.slice(-5).map(e => `- ${(e.content || '').slice(0, 50)}`).join('\n')}

Trả về JSON:
{
  "insights": "Insight ngắn gọn về patterns và trends",
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "trends": "Xu hướng (cải thiện/ổn định/cần chú ý)"
}`;

  try {
    const messages = formatMessagesForLLM(
      'Bạn là chuyên gia phân tích dữ liệu sức khỏe tâm thần. Trả về JSON hợp lệ.',
      [],
      prompt
    );

    const result = await env.AI.run(env.MODEL || '@cf/meta/llama-3.1-8b-instruct', {
      messages,
      temperature: 0.5,
      max_tokens: 300,
    });

    // Parse JSON response
    const responseText = result.response || '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        insights: parsed.insights || 'Không có insights cụ thể',
        recommendations: Array.isArray(parsed.recommendations) 
          ? parsed.recommendations.slice(0, 3)
          : [],
        trends: parsed.trends || 'Ổn định',
      };
    }

    // Fallback
    return {
      insights: 'Dữ liệu đang được phân tích...',
      recommendations: [],
      trends: 'Ổn định',
    };
  } catch (error) {
    console.error('[Analytics] Generate insights error:', error.message);
    return {
      insights: 'Không thể tạo insights lúc này',
      recommendations: [],
      trends: 'Không xác định',
    };
  }
}

