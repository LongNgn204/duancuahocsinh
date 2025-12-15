// backend/workers/__tests__/validation.test.js
// Unit tests cho validation module
import { describe, it, expect } from 'vitest';
import { z, validateRequest } from '../validation.js';

describe('validation', () => {
  describe('StringValidator', () => {
    it('should validate string', () => {
      const validator = z().string('name');
      const result = validator.parse('test');
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('test');
    });

    it('should enforce min length', () => {
      const validator = z().string('name').min(5);
      const result = validator.parse('test');
      
      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('at least 5');
    });

    it('should enforce max length', () => {
      const validator = z().string('name').max(5);
      const result = validator.parse('toolong');
      
      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('at most 5');
    });

    it('should enforce regex pattern', () => {
      const validator = z().string('username').regex(/^[a-z]+$/);
      const result = validator.parse('Test123');
      
      expect(result.success).toBe(false);
    });

    it('should allow optional values', () => {
      const validator = z().string('name').optional();
      const result = validator.parse(null);
      
      expect(result.success).toBe(true);
      expect(result.data).toBe(null);
    });

    it('should reject non-string values', () => {
      const validator = z().string('name');
      const result = validator.parse(123);
      
      expect(result.success).toBe(false);
    });
  });

  describe('NumberValidator', () => {
    it('should validate number', () => {
      const validator = z().number('age');
      const result = validator.parse(25);
      
      expect(result.success).toBe(true);
      expect(result.data).toBe(25);
    });

    it('should enforce min value', () => {
      const validator = z().number('age').minValue(18);
      const result = validator.parse(15);
      
      expect(result.success).toBe(false);
    });

    it('should enforce max value', () => {
      const validator = z().number('age').maxValue(100);
      const result = validator.parse(150);
      
      expect(result.success).toBe(false);
    });

    it('should enforce integer', () => {
      const validator = z().number('age').integer();
      const result = validator.parse(25.5);
      
      expect(result.success).toBe(false);
    });

    it('should convert string to number', () => {
      const validator = z().number('age');
      const result = validator.parse('25');
      
      expect(result.success).toBe(true);
      expect(result.data).toBe(25);
    });
  });

  describe('ArrayValidator', () => {
    it('should validate array', () => {
      const validator = z().array('items');
      const result = validator.parse([1, 2, 3]);
      
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should enforce min length', () => {
      const validator = z().array('items').min(2);
      const result = validator.parse([1]);
      
      expect(result.success).toBe(false);
    });

    it('should validate array items', () => {
      const itemValidator = z().string('item');
      const validator = z().array('items', itemValidator);
      const result = validator.parse(['a', 'b', 'c']);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(['a', 'b', 'c']);
    });

    it('should fail if item validation fails', () => {
      const itemValidator = z().string('item');
      const validator = z().array('items', itemValidator);
      const result = validator.parse(['a', 123, 'c']);
      
      expect(result.success).toBe(false);
    });
  });

  describe('ObjectSchema', () => {
    it('should validate object schema', () => {
      const schema = z().object({
        name: z().string('name').min(3),
        age: z().number('age').minValue(0),
      });
      
      const result = schema.parse({
        name: 'John',
        age: 25,
      });
      
      expect(result.success).toBe(true);
      expect(result.data.name).toBe('John');
      expect(result.data.age).toBe(25);
    });

    it('should fail if required fields missing', () => {
      const schema = z().object({
        name: z().string('name'),
        age: z().number('age'),
      });
      
      const result = schema.parse({
        name: 'John',
      });
      
      expect(result.success).toBe(false);
    });

    it('should fail if validation fails', () => {
      const schema = z().object({
        name: z().string('name').min(5),
        age: z().number('age').minValue(18),
      });
      
      const result = schema.parse({
        name: 'Jo',
        age: 15,
      });
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateRequest', () => {
    it('should validate request body', async () => {
      const schema = z().object({
        message: z().string('message').min(1),
      });
      
      const request = new Request('https://example.com', {
        method: 'POST',
        body: JSON.stringify({ message: 'Hello' }),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const result = await validateRequest(request, schema);
      
      expect(result.success).toBe(true);
      expect(result.data.message).toBe('Hello');
    });

    it('should return error response for invalid data', async () => {
      const schema = z().object({
        message: z().string('message').min(10),
      });
      
      const request = new Request('https://example.com', {
        method: 'POST',
        body: JSON.stringify({ message: 'Hi' }),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const result = await validateRequest(request, schema);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Response);
      expect(result.error.status).toBe(400);
    });

    it('should return error for invalid JSON', async () => {
      const schema = z().object({
        message: z().string('message'),
      });
      
      const request = new Request('https://example.com', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const result = await validateRequest(request, schema);
      
      expect(result.success).toBe(false);
      expect(result.error.status).toBe(400);
    });
  });
});

