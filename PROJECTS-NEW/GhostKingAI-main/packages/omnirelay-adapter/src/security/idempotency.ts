import { createHash } from 'crypto';

export interface IdempotencyRecord {
  id: string;
  bodyHash: string;
  status: number;
  resultHash: string;
  createdAt: Date;
}

export interface IdempotencyStore {
  get(key: string): Promise<IdempotencyRecord | null>;
  set(key: string, record: IdempotencyRecord): Promise<void>;
  cleanup(olderThan: Date): Promise<void>;
}

/**
 * In-memory idempotency store (for development/testing)
 */
export class MemoryIdempotencyStore implements IdempotencyStore {
  private store = new Map<string, IdempotencyRecord>();
  
  async get(key: string): Promise<IdempotencyRecord | null> {
    return this.store.get(key) || null;
  }
  
  async set(key: string, record: IdempotencyRecord): Promise<void> {
    this.store.set(key, record);
  }
  
  async cleanup(olderThan: Date): Promise<void> {
    for (const [key, record] of this.store.entries()) {
      if (record.createdAt < olderThan) {
        this.store.delete(key);
      }
    }
  }
}

/**
 * Database idempotency store (for production)
 */
export class DatabaseIdempotencyStore implements IdempotencyStore {
  constructor(private db: any) {}
  
  async get(key: string): Promise<IdempotencyRecord | null> {
    try {
      const result = await this.db.query(
        'SELECT id, body_hash, status, result_hash, created_at FROM relay_idempotency WHERE id = $1',
        [key]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0];
      return {
        id: row.id,
        bodyHash: row.body_hash,
        status: row.status,
        resultHash: row.result_hash,
        createdAt: row.created_at
      };
    } catch (error) {
      console.error('Failed to get idempotency record:', error);
      return null;
    }
  }
  
  async set(key: string, record: IdempotencyRecord): Promise<void> {
    try {
      await this.db.query(
        `INSERT INTO relay_idempotency (id, body_hash, status, result_hash, created_at) 
         VALUES ($1, $2, $3, $4, $5) 
         ON CONFLICT (id) DO UPDATE SET 
         body_hash = EXCLUDED.body_hash,
         status = EXCLUDED.status,
         result_hash = EXCLUDED.result_hash,
         created_at = EXCLUDED.created_at`,
        [record.id, record.bodyHash, record.status, record.resultHash, record.createdAt]
      );
    } catch (error) {
      console.error('Failed to set idempotency record:', error);
      throw error;
    }
  }
  
  async cleanup(olderThan: Date): Promise<void> {
    try {
      await this.db.query(
        'DELETE FROM relay_idempotency WHERE created_at < $1',
        [olderThan]
      );
    } catch (error) {
      console.error('Failed to cleanup idempotency records:', error);
    }
  }
}

/**
 * Generate hash for request body
 */
export function hashBody(body: string): string {
  return createHash('sha256').update(body, 'utf8').digest('hex');
}

/**
 * Generate hash for response result
 */
export function hashResult(result: any): string {
  const resultStr = typeof result === 'string' ? result : JSON.stringify(result);
  return createHash('sha256').update(resultStr, 'utf8').digest('hex');
}

/**
 * Idempotency manager
 */
export class IdempotencyManager {
  constructor(private store: IdempotencyStore) {}
  
  /**
   * Check if request is idempotent and return cached result if available
   */
  async checkIdempotency(
    idempotencyKey: string,
    requestBody: string
  ): Promise<{ isReplay: boolean; record?: IdempotencyRecord; conflict?: boolean }> {
    const existingRecord = await this.store.get(idempotencyKey);
    
    if (!existingRecord) {
      return { isReplay: false };
    }
    
    const currentBodyHash = hashBody(requestBody);
    
    // Check if body matches - if not, it's a conflict
    if (existingRecord.bodyHash !== currentBodyHash) {
      return { isReplay: true, record: existingRecord, conflict: true };
    }
    
    // Same body, return cached result
    return { isReplay: true, record: existingRecord, conflict: false };
  }
  
  /**
   * Store result for idempotency
   */
  async storeResult(
    idempotencyKey: string,
    requestBody: string,
    status: number,
    result: any
  ): Promise<void> {
    const record: IdempotencyRecord = {
      id: idempotencyKey,
      bodyHash: hashBody(requestBody),
      status,
      resultHash: hashResult(result),
      createdAt: new Date()
    };
    
    await this.store.set(idempotencyKey, record);
  }
  
  /**
   * Cleanup old idempotency records (should be called periodically)
   */
  async cleanup(maxAgeHours: number = 24): Promise<void> {
    const cutoffDate = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    await this.store.cleanup(cutoffDate);
  }
}

/**
 * Middleware factory for idempotency checking
 */
export function createIdempotencyMiddleware(manager: IdempotencyManager) {
  return async (req: any, res: any, next: any) => {
    const idempotencyKey = req.headers['idempotency-key'];
    
    if (!idempotencyKey) {
      return next(); // No idempotency key, proceed normally
    }
    
    try {
      const requestBody = JSON.stringify(req.body || {});
      const check = await manager.checkIdempotency(idempotencyKey, requestBody);
      
      if (check.isReplay && check.record) {
        if (check.conflict) {
          // Body differs from original request - return conflict
          return res.status(409).json({
            code: 'omari.idempotency_conflict',
            message: 'Idempotency key reused with different request body',
            request_id: req.headers['x-request-id'],
            location: `/api/relay/v1/idempotency/${idempotencyKey}`
          });
        }
        
        // Return cached result
        return res.status(check.record.status).json({
          status: 'ok',
          result: 'cached_result',
          idempotent: true
        });
      }
      
      // Store idempotency info for later use
      req.idempotency = {
        key: idempotencyKey,
        manager,
        requestBody
      };
      
      next();
    } catch (error) {
      console.error('Idempotency middleware error:', error);
      return res.status(500).json({
        code: 'omari.internal',
        message: 'Idempotency check failed',
        request_id: req.headers['x-request-id']
      });
    }
  };
}

/**
 * Helper to store result after successful processing
 */
export async function storeIdempotentResult(req: any, status: number, result: any): Promise<void> {
  if (req.idempotency) {
    try {
      await req.idempotency.manager.storeResult(
        req.idempotency.key,
        req.idempotency.requestBody,
        status,
        result
      );
    } catch (error) {
      console.error('Failed to store idempotent result:', error);
      // Don't throw - this shouldn't fail the request
    }
  }
}
