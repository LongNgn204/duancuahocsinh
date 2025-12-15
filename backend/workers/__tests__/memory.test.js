// backend/workers/__tests__/memory.test.js
// Unit tests cho memory/context compression module
import { describe, it, expect } from 'vitest';
import {
  getRecentMessages,
  createMemorySummary,
  formatMessagesForLLM,
  shouldUpdateSummary,
} from '../memory.js';

describe('memory module', () => {
  describe('getRecentMessages', () => {
    it('should return last N messages', () => {
      const history = [
        { role: 'user', content: 'msg1' },
        { role: 'assistant', content: 'reply1' },
        { role: 'user', content: 'msg2' },
        { role: 'assistant', content: 'reply2' },
        { role: 'user', content: 'msg3' },
      ];
      
      const recent = getRecentMessages(history, 3);
      
      expect(recent.length).toBe(3);
      expect(recent[0].content).toBe('reply2');
      expect(recent[1].content).toBe('msg3');
    });

    it('should return all messages if history is shorter than limit', () => {
      const history = [
        { role: 'user', content: 'msg1' },
        { role: 'assistant', content: 'reply1' },
      ];
      
      const recent = getRecentMessages(history, 10);
      
      expect(recent.length).toBe(2);
    });

    it('should handle empty history', () => {
      expect(getRecentMessages([])).toEqual([]);
      expect(getRecentMessages(null)).toEqual([]);
      expect(getRecentMessages(undefined)).toEqual([]);
    });

    it('should use default limit of 8', () => {
      const history = Array.from({ length: 20 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `msg${i}`,
      }));
      
      const recent = getRecentMessages(history);
      
      expect(recent.length).toBe(8);
    });
  });

  describe('createMemorySummary', () => {
    it('should create summary from old messages', () => {
      const history = Array.from({ length: 15 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i} về học tập và stress`,
      }));
      
      const summary = createMemorySummary(history, 8);
      
      expect(summary).toBeTruthy();
      expect(typeof summary).toBe('string');
      expect(summary.length).toBeGreaterThan(0);
    });

    it('should return empty string if history is too short', () => {
      const history = [
        { role: 'user', content: 'msg1' },
        { role: 'assistant', content: 'reply1' },
      ];
      
      const summary = createMemorySummary(history, 8);
      
      expect(summary).toBe('');
    });

    it('should extract key topics and emotions', () => {
      const history = Array.from({ length: 12 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: i < 4 
          ? 'Mình stress với học tập quá' 
          : 'Cảm thấy buồn và cô đơn',
      }));
      
      const summary = createMemorySummary(history, 8);
      
      // Summary should contain key information
      expect(summary.length).toBeGreaterThan(0);
    });

    it('should handle empty history', () => {
      expect(createMemorySummary([])).toBe('');
      expect(createMemorySummary(null)).toBe('');
    });
  });

  describe('formatMessagesForLLM', () => {
    it('should format messages with system prompt', () => {
      const systemPrompt = 'You are a helpful assistant';
      const history = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there' },
      ];
      const currentMessage = 'How are you?';
      
      const messages = formatMessagesForLLM(systemPrompt, history, currentMessage);
      
      expect(messages.length).toBeGreaterThan(0);
      expect(messages[0].role).toBe('system');
      expect(messages[0].content).toContain(systemPrompt);
    });

    it('should include memory summary in system prompt', () => {
      const systemPrompt = 'You are helpful';
      const memorySummary = 'Previous context: user was stressed';
      
      const messages = formatMessagesForLLM(systemPrompt, [], 'test', memorySummary);
      
      expect(messages[0].content).toContain(memorySummary);
      expect(messages[0].content).toContain('NGỮ CẢNH TRƯỚC ĐÓ');
    });

    it('should include recent history', () => {
      const history = [
        { role: 'user', content: 'msg1' },
        { role: 'assistant', content: 'reply1' },
      ];
      
      const messages = formatMessagesForLLM('System', history, 'msg2');
      
      expect(messages.length).toBeGreaterThan(2); // system + history + current
      expect(messages[1].content).toBe('msg1');
      expect(messages[2].content).toBe('reply1');
      expect(messages[3].content).toBe('msg2');
    });

    it('should handle empty history', () => {
      const messages = formatMessagesForLLM('System', [], 'test');
      
      expect(messages.length).toBe(2); // system + current
      expect(messages[1].content).toBe('test');
    });
  });

  describe('shouldUpdateSummary', () => {
    it('should return true when threshold reached', () => {
      expect(shouldUpdateSummary(20, 10, 8)).toBe(true);
      expect(shouldUpdateSummary(18, 10, 8)).toBe(true);
    });

    it('should return false when threshold not reached', () => {
      expect(shouldUpdateSummary(15, 10, 8)).toBe(false);
      expect(shouldUpdateSummary(17, 10, 8)).toBe(false);
    });

    it('should use default threshold of 8', () => {
      expect(shouldUpdateSummary(10, 0)).toBe(true);
      expect(shouldUpdateSummary(5, 0)).toBe(false);
    });
  });
});

