import { describe, it, expect, beforeEach } from 'vitest';
import { 
  IdempotencyManager, 
  MemoryIdempotencyStore, 
  hashBody, 
  hashResult,
  createIdempotencyMiddleware 
} from '../../security/idempotency.js';

describe('Idempotency', () => {
  let store: MemoryIdempotencyStore;
  let manager: IdempotencyManager;

  beforeEach(() => {
    store = new MemoryIdempotencyStore();
    manager = new IdempotencyManager(store);
  });

  describe('hashBody', () => {
    it('should generate consistent hashes for same content', () => {
      const body = '{"test": "data"}';
      const hash1 = hashBody(body);
      const hash2 = hashBody(body);
      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different content', () => {
      const hash1 = hashBody('{"test": "data1"}');
      const hash2 = hashBody('{"test": "data2"}');
      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty strings', () => {
      const hash = hashBody('');
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });

    it('should handle unicode content', () => {
      const hash = hashBody('{"emoji": "🔥🧙‍♂️"}');
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });
  });

  describe('hashResult', () => {
    it('should hash string results', () => {
      const hash = hashResult('test result');
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });

    it('should hash object results', () => {
      const result = { status: 'ok', data: { test: true } };
      const hash = hashResult(result);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });

    it('should generate consistent hashes for same results', () => {
      const result = { test: 'data' };
      const hash1 = hashResult(result);
      const hash2 = hashResult(result);
      expect(hash1).toBe(hash2);
    });
  });

  describe('MemoryIdempotencyStore', () => {
    it('should store and retrieve records', async () => {
      const record = {
        id: 'test-key',
        bodyHash: 'test-hash',
        status: 200,
        resultHash: 'result-hash',
        createdAt: new Date()
      };

      await store.set('test-key', record);
      const retrieved = await store.get('test-key');
      
      expect(retrieved).toEqual(record);
    });

    it('should return null for non-existent keys', async () => {
      const result = await store.get('non-existent');
      expect(result).toBeNull();
    });

    it('should cleanup old records', async () => {
      const oldRecord = {
        id: 'old-key',
        bodyHash: 'old-hash',
        status: 200,
        resultHash: 'old-result',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      };

      const newRecord = {
        id: 'new-key',
        bodyHash: 'new-hash',
        status: 200,
        resultHash: 'new-result',
        createdAt: new Date()
      };

      await store.set('old-key', oldRecord);
      await store.set('new-key', newRecord);

      const cutoff = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
      await store.cleanup(cutoff);

      const oldResult = await store.get('old-key');
      const newResult = await store.get('new-key');

      expect(oldResult).toBeNull();
      expect(newResult).toEqual(newRecord);
    });
  });

  describe('IdempotencyManager', () => {
    it('should detect new requests', async () => {
      const result = await manager.checkIdempotency('new-key', '{"test": "data"}');
      expect(result.isReplay).toBe(false);
      expect(result.record).toBeUndefined();
      expect(result.conflict).toBeUndefined();
    });

    it('should detect replay with same body', async () => {
      const key = 'test-key';
      const body = '{"test": "data"}';
      
      // Store initial result
      await manager.storeResult(key, body, 200, { success: true });
      
      // Check for replay
      const result = await manager.checkIdempotency(key, body);
      expect(result.isReplay).toBe(true);
      expect(result.conflict).toBe(false);
      expect(result.record).toBeDefined();
      expect(result.record!.status).toBe(200);
    });

    it('should detect conflict with different body', async () => {
      const key = 'test-key';
      const originalBody = '{"test": "data1"}';
      const differentBody = '{"test": "data2"}';
      
      // Store initial result
      await manager.storeResult(key, originalBody, 200, { success: true });
      
      // Check with different body
      const result = await manager.checkIdempotency(key, differentBody);
      expect(result.isReplay).toBe(true);
      expect(result.conflict).toBe(true);
      expect(result.record).toBeDefined();
    });

    it('should store results correctly', async () => {
      const key = 'test-key';
      const body = '{"test": "data"}';
      const result = { success: true, data: 'test' };
      
      await manager.storeResult(key, body, 200, result);
      
      const stored = await store.get(key);
      expect(stored).toBeDefined();
      expect(stored!.id).toBe(key);
      expect(stored!.bodyHash).toBe(hashBody(body));
      expect(stored!.status).toBe(200);
      expect(stored!.resultHash).toBe(hashResult(result));
    });

    it('should cleanup old records', async () => {
      // This test would need to mock the store's cleanup method
      // or test with a real database store
      await expect(manager.cleanup(24)).resolves.not.toThrow();
    });
  });

  describe('createIdempotencyMiddleware', () => {
    it('should create middleware function', () => {
      const middleware = createIdempotencyMiddleware(manager);
      expect(typeof middleware).toBe('function');
      expect(middleware.length).toBe(3); // req, res, next
    });

    it('should pass through requests without idempotency key', async () => {
      const middleware = createIdempotencyMiddleware(manager);
      const req = { headers: {}, body: {} };
      const res = {};
      let nextCalled = false;
      const next = () => { nextCalled = true; };

      await middleware(req, res, next);
      expect(nextCalled).toBe(true);
    });

    it('should handle idempotent requests', async () => {
      const middleware = createIdempotencyMiddleware(manager);
      
      // First request
      const req1 = {
        headers: { 'idempotency-key': 'test-key' },
        body: { test: 'data' }
      };
      const res1 = {
        status: (code: number) => ({ json: (data: any) => ({ statusCode: code, data }) })
      };
      let next1Called = false;
      const next1 = () => { next1Called = true; };

      await middleware(req1, res1, next1);
      expect(next1Called).toBe(true);
      expect(req1).toHaveProperty('idempotency');

      // Store a result for the first request
      await manager.storeResult('test-key', JSON.stringify(req1.body), 200, { success: true });

      // Second identical request
      const req2 = {
        headers: { 'idempotency-key': 'test-key' },
        body: { test: 'data' }
      };
      let res2Response: any;
      const res2 = {
        status: (code: number) => ({
          json: (data: any) => {
            res2Response = { statusCode: code, data };
            return res2Response;
          }
        })
      };
      let next2Called = false;
      const next2 = () => { next2Called = true; };

      await middleware(req2, res2, next2);
      expect(next2Called).toBe(false); // Should not call next for cached response
      expect(res2Response).toBeDefined();
      expect(res2Response.statusCode).toBe(200);
    });

    it('should handle idempotency conflicts', async () => {
      const middleware = createIdempotencyMiddleware(manager);
      
      // Store initial result
      await manager.storeResult('conflict-key', '{"original": "data"}', 200, { success: true });

      // Request with same key but different body
      const req = {
        headers: { 
          'idempotency-key': 'conflict-key',
          'x-request-id': 'test-request-id'
        },
        body: { different: 'data' }
      };
      let resResponse: any;
      const res = {
        status: (code: number) => ({
          json: (data: any) => {
            resResponse = { statusCode: code, data };
            return resResponse;
          }
        })
      };
      let nextCalled = false;
      const next = () => { nextCalled = true; };

      await middleware(req, res, next);
      expect(nextCalled).toBe(false);
      expect(resResponse).toBeDefined();
      expect(resResponse.statusCode).toBe(409);
      expect(resResponse.data.code).toBe('omari.idempotency_conflict');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete idempotency flow', async () => {
      const key = 'integration-test';
      const body = '{"integration": "test"}';
      const result = { status: 'ok', data: 'test-result' };

      // Check new request
      const check1 = await manager.checkIdempotency(key, body);
      expect(check1.isReplay).toBe(false);

      // Store result
      await manager.storeResult(key, body, 200, result);

      // Check replay
      const check2 = await manager.checkIdempotency(key, body);
      expect(check2.isReplay).toBe(true);
      expect(check2.conflict).toBe(false);
      expect(check2.record!.status).toBe(200);

      // Check conflict
      const check3 = await manager.checkIdempotency(key, '{"different": "body"}');
      expect(check3.isReplay).toBe(true);
      expect(check3.conflict).toBe(true);
    });

    it('should handle concurrent requests with same idempotency key', async () => {
      // This test simulates concurrent requests with the same idempotency key
      // In a real scenario, this would test race conditions
      const key = 'concurrent-test';
      const body = '{"concurrent": "test"}';

      const promises = Array.from({ length: 5 }, () => 
        manager.checkIdempotency(key, body)
      );

      const results = await Promise.all(promises);
      
      // All should indicate no replay since no result is stored yet
      results.forEach(result => {
        expect(result.isReplay).toBe(false);
      });
    });
  });
});
