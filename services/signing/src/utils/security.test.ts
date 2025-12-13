import { describe, it, expect } from '@jest/globals';
import {
  generateSecureToken,
  constantTimeCompare,
  isValidTokenFormat,
  generateSignerToken,
  hashSHA256,
} from './security.js';

describe('Security Utilities', () => {
  describe('generateSecureToken', () => {
    it('should generate a token of correct length', () => {
      const token = generateSecureToken(32);
      expect(token).toHaveLength(64); // 32 bytes = 64 hex characters
    });

    it('should generate unique tokens', () => {
      const token1 = generateSecureToken();
      const token2 = generateSecureToken();
      expect(token1).not.toBe(token2);
    });

    it('should generate tokens with only hex characters', () => {
      const token = generateSecureToken();
      expect(token).toMatch(/^[0-9a-f]+$/i);
    });

    it('should support custom byte lengths', () => {
      const token = generateSecureToken(16);
      expect(token).toHaveLength(32); // 16 bytes = 32 hex characters
    });
  });

  describe('constantTimeCompare', () => {
    it('should return true for identical strings', () => {
      const str = 'test-string-123';
      expect(constantTimeCompare(str, str)).toBe(true);
    });

    it('should return false for different strings', () => {
      expect(constantTimeCompare('abc', 'def')).toBe(false);
    });

    it('should return false for strings of different lengths', () => {
      expect(constantTimeCompare('short', 'muchlonger')).toBe(false);
    });

    it('should handle empty strings', () => {
      expect(constantTimeCompare('', '')).toBe(true);
      expect(constantTimeCompare('', 'nonempty')).toBe(false);
    });

    it('should return false for non-string inputs', () => {
      expect(constantTimeCompare(null as any, 'string')).toBe(false);
      expect(constantTimeCompare('string', undefined as any)).toBe(false);
      expect(constantTimeCompare(123 as any, 456 as any)).toBe(false);
    });

    it('should prevent timing attacks (basic test)', () => {
      // This is a simplified test - real timing attack testing is more complex
      const target = 'a'.repeat(1000);
      const close = 'a'.repeat(999) + 'b';
      const far = 'b'.repeat(1000);

      expect(constantTimeCompare(target, close)).toBe(false);
      expect(constantTimeCompare(target, far)).toBe(false);
    });
  });

  describe('isValidTokenFormat', () => {
    it('should validate correct token format', () => {
      const validToken = generateSecureToken(32);
      expect(isValidTokenFormat(validToken, 32)).toBe(true);
    });

    it('should reject tokens with incorrect length', () => {
      const shortToken = generateSecureToken(16);
      expect(isValidTokenFormat(shortToken, 32)).toBe(false);
    });

    it('should reject non-hex characters', () => {
      const invalidToken = 'g'.repeat(64); // 'g' is not a hex character
      expect(isValidTokenFormat(invalidToken, 32)).toBe(false);
    });

    it('should reject tokens with special characters', () => {
      const invalidToken = 'a'.repeat(63) + '!';
      expect(isValidTokenFormat(invalidToken, 32)).toBe(false);
    });

    it('should reject non-string inputs', () => {
      expect(isValidTokenFormat(null as any)).toBe(false);
      expect(isValidTokenFormat(undefined as any)).toBe(false);
      expect(isValidTokenFormat(123 as any)).toBe(false);
    });

    it('should handle different byte lengths', () => {
      const token16 = generateSecureToken(16);
      const token32 = generateSecureToken(32);

      expect(isValidTokenFormat(token16, 16)).toBe(true);
      expect(isValidTokenFormat(token32, 32)).toBe(true);
      expect(isValidTokenFormat(token16, 32)).toBe(false);
      expect(isValidTokenFormat(token32, 16)).toBe(false);
    });
  });

  describe('generateSignerToken', () => {
    it('should generate a valid signer token object', () => {
      const result = generateSignerToken();
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('createdAt');
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should generate valid token format', () => {
      const result = generateSignerToken();
      expect(isValidTokenFormat(result.token, 32)).toBe(true);
    });

    it('should generate unique tokens', () => {
      const result1 = generateSignerToken();
      const result2 = generateSignerToken();
      expect(result1.token).not.toBe(result2.token);
    });

    it('should have createdAt close to current time', () => {
      const before = new Date();
      const result = generateSignerToken();
      const after = new Date();

      expect(result.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(result.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('hashSHA256', () => {
    it('should generate consistent hashes for same input', () => {
      const input = 'test-data';
      const hash1 = hashSHA256(input);
      const hash2 = hashSHA256(input);
      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different inputs', () => {
      const hash1 = hashSHA256('input1');
      const hash2 = hashSHA256('input2');
      expect(hash1).not.toBe(hash2);
    });

    it('should generate 64-character hex string (256 bits)', () => {
      const hash = hashSHA256('test');
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]+$/i);
    });

    it('should handle empty strings', () => {
      const hash = hashSHA256('');
      expect(hash).toHaveLength(64);
      expect(hash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    });

    it('should be deterministic (known test vector)', () => {
      // SHA-256 of "hello" is known
      const hash = hashSHA256('hello');
      expect(hash).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
    });
  });
});
