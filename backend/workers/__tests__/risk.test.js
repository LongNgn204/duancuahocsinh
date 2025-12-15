// backend/workers/__tests__/risk.test.js
// Unit tests cho SOS risk classification
import { describe, it, expect } from 'vitest';
import { classifyRiskRules, getRedTierResponse } from '../risk.js';

describe('risk classification', () => {
  describe('RED tier patterns', () => {
    it('should detect explicit suicide intent', () => {
      expect(classifyRiskRules('tôi muốn tự tử')).toBe('red');
      expect(classifyRiskRules('mình muốn chết')).toBe('red');
      expect(classifyRiskRules('muốn kết thúc cuộc đời')).toBe('red');
    });

    it('should detect Gen-Z suicide vocabulary', () => {
      expect(classifyRiskRules('mún đi luôn')).toBe('red');
      expect(classifyRiskRules('muốn ngủ mãi')).toBe('red');
      expect(classifyRiskRules('end game đời')).toBe('red');
      expect(classifyRiskRules('gg đi')).toBe('red');
    });

    it('should detect self-harm intent', () => {
      expect(classifyRiskRules('tự làm hại bản thân')).toBe('red');
      expect(classifyRiskRules('muốn tự cắt')).toBe('red');
    });

    it('should detect abuse patterns', () => {
      expect(classifyRiskRules('bị xâm hại')).toBe('red');
      expect(classifyRiskRules('bị lạm dụng')).toBe('red');
    });

    it('should detect concrete plans', () => {
      expect(classifyRiskRules('đã chuẩn bị để tự tử')).toBe('red');
      expect(classifyRiskRules('có kế hoạch chết')).toBe('red');
    });
  });

  describe('YELLOW tier patterns', () => {
    it('should detect prolonged despair', () => {
      expect(classifyRiskRules('tuyệt vọng hoàn toàn')).toBe('yellow');
      expect(classifyRiskRules('hết hy vọng')).toBe('yellow');
      expect(classifyRiskRules('vô vọng')).toBe('yellow');
    });

    it('should detect Gen-Z despair vocabulary', () => {
      expect(classifyRiskRules('chán đời')).toBe('yellow');
      expect(classifyRiskRules('toang rồi')).toBe('yellow');
      expect(classifyRiskRules('emo nặng')).toBe('yellow');
      expect(classifyRiskRules('cô đơn vl')).toBe('yellow');
    });

    it('should detect bullying', () => {
      expect(classifyRiskRules('bị bắt nạt')).toBe('yellow');
      expect(classifyRiskRules('bị bully')).toBe('yellow');
    });

    it('should detect vague suicidal thoughts', () => {
      expect(classifyRiskRules('không muốn sống nữa')).toBe('yellow');
      expect(classifyRiskRules('chán sống')).toBe('yellow');
    });
  });

  describe('GREEN tier (normal)', () => {
    it('should return green for normal messages', () => {
      expect(classifyRiskRules('hôm nay mình buồn')).toBe('green');
      expect(classifyRiskRules('stress với bài tập')).toBe('green');
      expect(classifyRiskRules('cảm ơn bạn đã giúp')).toBe('green');
    });

    it('should return green for empty/null', () => {
      expect(classifyRiskRules('')).toBe('green');
      expect(classifyRiskRules(null)).toBe('green');
      expect(classifyRiskRules(undefined)).toBe('green');
    });
  });

  describe('Context-aware analysis', () => {
    it('should consider history for escalation', () => {
      const history = [
        { role: 'user', content: 'mình buồn quá' },
        { role: 'assistant', content: 'Mình hiểu...' },
        { role: 'user', content: 'chán đời' },
      ];
      
      // Yellow pattern với history có thể escalate
      const result = classifyRiskRules('không muốn sống nữa', history);
      expect(['yellow', 'red']).toContain(result);
    });

    it('should handle empty history', () => {
      const result = classifyRiskRules('tuyệt vọng', []);
      expect(result).toBe('yellow');
    });
  });

  describe('Case insensitivity', () => {
    it('should detect patterns regardless of case', () => {
      expect(classifyRiskRules('TÔI MUỐN TỰ TỬ')).toBe('red');
      expect(classifyRiskRules('Mình Muốn Chết')).toBe('red');
      expect(classifyRiskRules('TUYỆT VỌNG')).toBe('yellow');
    });
  });

  describe('getRedTierResponse', () => {
    it('should return safe response for red tier', () => {
      const response = getRedTierResponse();
      
      expect(response).toHaveProperty('riskLevel', 'red');
      expect(response).toHaveProperty('reply');
      expect(response).toHaveProperty('actions');
      expect(Array.isArray(response.actions)).toBe(true);
      expect(response.reply.length).toBeGreaterThan(0);
    });

    it('should include hotline in actions', () => {
      const response = getRedTierResponse();
      
      const hasHotline = response.actions.some(action => 
        action.includes('1800') || action.includes('hotline')
      );
      expect(hasHotline).toBe(true);
    });
  });
});

