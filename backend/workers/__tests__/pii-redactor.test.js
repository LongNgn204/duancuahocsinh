// backend/workers/__tests__/pii-redactor.test.js
// Unit tests cho PII redaction module
import { describe, it, expect } from 'vitest';
import {
  redactPII,
  redactPIIFromObject,
  containsPII,
} from '../pii-redactor.js';

describe('pii-redactor', () => {
  describe('redactPII', () => {
    it('should redact phone numbers', () => {
      const text = 'Số điện thoại của tôi là 0912345678';
      const redacted = redactPII(text, { redactPhone: true });
      
      expect(redacted).not.toContain('0912345678');
      expect(redacted).toContain('091****78');
    });

    it('should redact email addresses', () => {
      const text = 'Email của tôi là test@example.com';
      const redacted = redactPII(text, { redactEmail: true });
      
      expect(redacted).not.toContain('test@example.com');
      expect(redacted).toContain('te***@example.com');
    });

    it('should redact ID card numbers', () => {
      const text = 'CMND của tôi là 123456789012';
      const redacted = redactPII(text, { redactIdCard: true });
      
      expect(redacted).not.toContain('123456789012');
      expect(redacted).toContain('123****12');
    });

    it('should not redact when option is disabled', () => {
      const text = 'Số điện thoại: 0912345678, Email: test@example.com';
      const redacted = redactPII(text, {
        redactPhone: false,
        redactEmail: false,
      });
      
      expect(redacted).toContain('0912345678');
      expect(redacted).toContain('test@example.com');
    });

    it('should handle multiple PII in one text', () => {
      const text = 'Phone: 0912345678, Email: test@example.com, CMND: 123456789';
      const redacted = redactPII(text);
      
      expect(redacted).not.toContain('0912345678');
      expect(redacted).not.toContain('test@example.com');
      expect(redacted).not.toContain('123456789');
    });

    it('should return original text if no PII found', () => {
      const text = 'Đây là một câu bình thường không có thông tin nhạy cảm';
      const redacted = redactPII(text);
      
      expect(redacted).toBe(text);
    });

    it('should handle null/undefined', () => {
      expect(redactPII(null)).toBe('');
      expect(redactPII(undefined)).toBe('');
      expect(redactPII('')).toBe('');
    });
  });

  describe('redactPIIFromObject', () => {
    it('should redact PII from object', () => {
      const obj = {
        message: 'Call me at 0912345678',
        email: 'test@example.com',
        safeField: 'no PII here',
      };
      
      const redacted = redactPIIFromObject(obj);
      
      expect(redacted.message).not.toContain('0912345678');
      expect(redacted.email).not.toContain('test@example.com');
      expect(redacted.safeField).toBe('no PII here');
    });

    it('should redact PII from nested objects', () => {
      const obj = {
        user: {
          phone: '0912345678',
          email: 'test@example.com',
        },
        message: 'Contact me',
      };
      
      const redacted = redactPIIFromObject(obj);
      
      expect(redacted.user.phone).not.toContain('0912345678');
      expect(redacted.user.email).not.toContain('test@example.com');
    });

    it('should redact PII from arrays', () => {
      const obj = {
        contacts: ['0912345678', '0987654321', 'test@example.com'],
      };
      
      const redacted = redactPIIFromObject(obj);
      
      expect(redacted.contacts[0]).not.toContain('0912345678');
      expect(redacted.contacts[1]).not.toContain('0987654321');
      expect(redacted.contacts[2]).not.toContain('test@example.com');
    });

    it('should exclude specified keys from redaction', () => {
      const obj = {
        username: 'user123',
        email: 'test@example.com',
        phone: '0912345678',
      };
      
      const redacted = redactPIIFromObject(obj, {}, ['username']);
      
      expect(redacted.username).toBe('user123');
      expect(redacted.email).not.toContain('test@example.com');
      expect(redacted.phone).not.toContain('0912345678');
    });

    it('should handle string directly', () => {
      const text = 'Call 0912345678';
      const redacted = redactPIIFromObject(text);
      
      expect(redacted).not.toContain('0912345678');
    });
  });

  describe('containsPII', () => {
    it('should detect phone numbers', () => {
      expect(containsPII('Call me at 0912345678')).toBe(true);
      expect(containsPII('My number is +84912345678')).toBe(true);
    });

    it('should detect email addresses', () => {
      expect(containsPII('Email: test@example.com')).toBe(true);
    });

    it('should detect ID card numbers', () => {
      expect(containsPII('CMND: 123456789012')).toBe(true);
    });

    it('should return false for text without PII', () => {
      expect(containsPII('Đây là một câu bình thường')).toBe(false);
      expect(containsPII('Hello world')).toBe(false);
    });

    it('should handle null/undefined', () => {
      expect(containsPII(null)).toBe(false);
      expect(containsPII(undefined)).toBe(false);
      expect(containsPII('')).toBe(false);
    });
  });
});

