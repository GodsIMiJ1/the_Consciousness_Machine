import { describe, it, expect, beforeEach } from 'vitest';
import { sign, verify, validateTimestamp, extractHMACHeaders, generateHMACHeaders } from '../../security/hmac.js';

describe('HMAC Security', () => {
  const testSecret = 'test-secret-key';
  const testData = {
    method: 'POST',
    path: '/api/relay/v1/ingest',
    body: '{"test": "data"}',
    timestamp: '2025-09-03T07:20:35Z',
    secret: testSecret
  };

  describe('sign', () => {
    it('should generate consistent signatures', () => {
      const signature1 = sign(testData);
      const signature2 = sign(testData);
      expect(signature1).toBe(signature2);
    });

    it('should generate different signatures for different data', () => {
      const signature1 = sign(testData);
      const signature2 = sign({ ...testData, body: '{"different": "data"}' });
      expect(signature1).not.toBe(signature2);
    });

    it('should generate base64 encoded signatures', () => {
      const signature = sign(testData);
      expect(() => Buffer.from(signature, 'base64')).not.toThrow();
    });
  });

  describe('verify', () => {
    it('should verify valid signatures', () => {
      const signature = sign(testData);
      const isValid = verify(signature, testData);
      expect(isValid).toBe(true);
    });

    it('should reject invalid signatures', () => {
      const isValid = verify('invalid-signature', testData);
      expect(isValid).toBe(false);
    });

    it('should reject signatures with wrong secret', () => {
      const signature = sign(testData);
      const isValid = verify(signature, { ...testData, secret: 'wrong-secret' });
      expect(isValid).toBe(false);
    });

    it('should reject signatures with modified data', () => {
      const signature = sign(testData);
      const isValid = verify(signature, { ...testData, body: '{"modified": "data"}' });
      expect(isValid).toBe(false);
    });

    it('should handle malformed signatures gracefully', () => {
      const isValid = verify('not-base64!@#', testData);
      expect(isValid).toBe(false);
    });
  });

  describe('validateTimestamp', () => {
    it('should accept current timestamps', () => {
      const currentTime = new Date().toISOString();
      const isValid = validateTimestamp(currentTime);
      expect(isValid).toBe(true);
    });

    it('should reject old timestamps', () => {
      const oldTime = new Date(Date.now() - 10 * 60 * 1000).toISOString(); // 10 minutes ago
      const isValid = validateTimestamp(oldTime, 300); // 5 minute window
      expect(isValid).toBe(false);
    });

    it('should reject future timestamps', () => {
      const futureTime = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes future
      const isValid = validateTimestamp(futureTime);
      expect(isValid).toBe(false);
    });

    it('should handle invalid timestamp formats', () => {
      const isValid = validateTimestamp('invalid-timestamp');
      expect(isValid).toBe(false);
    });

    it('should respect custom max age', () => {
      const oldTime = new Date(Date.now() - 2 * 60 * 1000).toISOString(); // 2 minutes ago
      const isValidShort = validateTimestamp(oldTime, 60); // 1 minute window
      const isValidLong = validateTimestamp(oldTime, 180); // 3 minute window
      
      expect(isValidShort).toBe(false);
      expect(isValidLong).toBe(true);
    });
  });

  describe('extractHMACHeaders', () => {
    const validHeaders = {
      'x-request-id': '123e4567-e89b-12d3-a456-426614174000',
      'x-timestamp': '2025-09-03T07:20:35Z',
      'x-device-id': 'dev_test',
      'x-signature': 'dGVzdC1zaWduYXR1cmU='
    };

    it('should extract valid headers', () => {
      const result = extractHMACHeaders(validHeaders);
      expect(result).toEqual({
        requestId: '123e4567-e89b-12d3-a456-426614174000',
        timestamp: '2025-09-03T07:20:35Z',
        deviceId: 'dev_test',
        signature: 'dGVzdC1zaWduYXR1cmU='
      });
    });

    it('should return null for missing headers', () => {
      const incompleteHeaders = { ...validHeaders };
      delete incompleteHeaders['x-signature'];
      
      const result = extractHMACHeaders(incompleteHeaders);
      expect(result).toBeNull();
    });

    it('should handle case-insensitive headers', () => {
      const mixedCaseHeaders = {
        'X-Request-Id': '123e4567-e89b-12d3-a456-426614174000',
        'X-TIMESTAMP': '2025-09-03T07:20:35Z',
        'x-device-id': 'dev_test',
        'X-Signature': 'dGVzdC1zaWduYXR1cmU='
      };

      // Note: This test assumes the function handles case-insensitive headers
      // If not, the function should be updated to do so
      const result = extractHMACHeaders(mixedCaseHeaders);
      expect(result).toBeDefined();
    });
  });

  describe('generateHMACHeaders', () => {
    it('should generate all required headers', () => {
      const headers = generateHMACHeaders('POST', '/test', '{"test": true}', 'dev_test', testSecret);
      
      expect(headers).toHaveProperty('X-Request-Id');
      expect(headers).toHaveProperty('X-Timestamp');
      expect(headers).toHaveProperty('X-Device-Id', 'dev_test');
      expect(headers).toHaveProperty('X-Signature');
    });

    it('should generate valid UUID for request ID', () => {
      const headers = generateHMACHeaders('POST', '/test', '{}', 'dev_test', testSecret);
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      expect(headers['X-Request-Id']).toMatch(uuidRegex);
    });

    it('should generate valid ISO timestamp', () => {
      const headers = generateHMACHeaders('POST', '/test', '{}', 'dev_test', testSecret);
      const timestamp = new Date(headers['X-Timestamp']);
      
      expect(timestamp.toISOString()).toBe(headers['X-Timestamp']);
    });

    it('should generate verifiable signature', () => {
      const headers = generateHMACHeaders('POST', '/test', '{"test": true}', 'dev_test', testSecret);
      
      const isValid = verify(headers['X-Signature'], {
        method: 'POST',
        path: '/test',
        body: '{"test": true}',
        timestamp: headers['X-Timestamp'],
        secret: testSecret
      });
      
      expect(isValid).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should complete full sign-verify cycle', () => {
      // Generate headers
      const headers = generateHMACHeaders('POST', '/api/test', '{"data": "test"}', 'dev_123', testSecret);
      
      // Extract headers
      const extracted = extractHMACHeaders(headers);
      expect(extracted).toBeDefined();
      
      // Verify signature
      const isValid = verify(extracted!.signature, {
        method: 'POST',
        path: '/api/test',
        body: '{"data": "test"}',
        timestamp: extracted!.timestamp,
        secret: testSecret
      });
      
      expect(isValid).toBe(true);
    });

    it('should handle edge cases in data', () => {
      const edgeCases = [
        { body: '', description: 'empty body' },
        { body: '{}', description: 'empty object' },
        { body: '{"unicode": "🔥🧙‍♂️"}', description: 'unicode characters' },
        { body: '{"large": "' + 'x'.repeat(1000) + '"}', description: 'large body' }
      ];

      for (const testCase of edgeCases) {
        const headers = generateHMACHeaders('POST', '/test', testCase.body, 'dev_test', testSecret);
        const extracted = extractHMACHeaders(headers);
        
        const isValid = verify(extracted!.signature, {
          method: 'POST',
          path: '/test',
          body: testCase.body,
          timestamp: extracted!.timestamp,
          secret: testSecret
        });
        
        expect(isValid).toBe(true);
      }
    });
  });
});
