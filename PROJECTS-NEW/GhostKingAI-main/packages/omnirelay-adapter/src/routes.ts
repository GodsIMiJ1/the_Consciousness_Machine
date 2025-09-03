import { Router } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { ingestHandler, batchIngestHandler } from './handlers/ingest.js';
import { emitHandler } from './handlers/emit.js';
import { createAllowlistMiddleware } from './security/allowlist.js';
import { createIdempotencyMiddleware, IdempotencyManager, MemoryIdempotencyStore } from './security/idempotency.js';

// Initialize idempotency manager
const idempotencyStore = new MemoryIdempotencyStore();
const idempotencyManager = new IdempotencyManager(idempotencyStore);

// Rate limiting for relay endpoints
const relayRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_RPM || '60', 10), // Default 60 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 'omari.rate_limited',
    message: 'Too many requests, please try again later.'
  },
  keyGenerator: (req) => {
    // Use device ID if available, otherwise fall back to IPv6-safe IP
    const deviceId = req.headers['x-device-id'];
    return deviceId ? `device:${deviceId}` : ipKeyGenerator(req);
  }
});

// Burst rate limiting (higher limit for short bursts)
const burstRateLimit = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 20, // 20 requests per 10 seconds
  standardHeaders: false,
  legacyHeaders: false,
  message: {
    code: 'omari.rate_limited',
    message: 'Request burst limit exceeded.'
  }
});

/**
 * Create Omnirelay adapter router
 */
export function createOmnirelayRouter(): Router {
  const router = Router();

  // Apply security middleware
  const allowlistMiddleware = createAllowlistMiddleware(
    process.env.OMNIRELAY_ALLOWED_IPS || ''
  );
  const idempotencyMiddleware = createIdempotencyMiddleware(idempotencyManager);

  // Apply middleware to all routes
  router.use(allowlistMiddleware);
  router.use(relayRateLimit);
  router.use(burstRateLimit);

  // Health endpoint (no additional auth required)
  router.get('/health', (req, res) => {
    const mode = process.env.OMARI_MODE || 'local';
    const storage = process.env.DATABASE_URL ? 'postgresql' : 'memory';
    
    res.json({
      status: 'ok',
      mode,
      storage,
      version: '1.0.0',
      protocol: '1.0',
      timestamp: new Date().toISOString()
    });
  });

  // Version endpoint
  router.get('/version', (req, res) => {
    res.json({
      version: '1.0.0',
      build: process.env.BUILD_SHA || 'development',
      protocol: '1.0'
    });
  });

  // Ingest single command
  router.post('/ingest', idempotencyMiddleware, ingestHandler);

  // Batch ingest multiple commands
  router.post('/batch', idempotencyMiddleware, batchIngestHandler);

  // Emit event to Omnirelay webhook
  router.post('/emit', emitHandler);

  // Error handling middleware
  router.use((err: any, req: any, res: any, next: any) => {
    console.error('Omnirelay router error:', err);
    
    const status = err.status || 500;
    const code = status === 500 ? 'omari.internal' : 'omari.bad_request';
    
    res.status(status).json({
      code,
      message: err.message || 'Internal server error',
      request_id: req.headers['x-request-id'] || 'unknown'
    });
  });

  return router;
}

/**
 * Setup periodic cleanup for idempotency records
 */
export function setupPeriodicCleanup(): void {
  // Clean up idempotency records every hour
  setInterval(async () => {
    try {
      await idempotencyManager.cleanup(24); // Keep records for 24 hours
      console.log('[CLEANUP] Idempotency records cleaned up');
    } catch (error) {
      console.error('[CLEANUP] Failed to cleanup idempotency records:', error);
    }
  }, 60 * 60 * 1000); // 1 hour
}

/**
 * Middleware to log all relay requests
 */
export function createRequestLogger() {
  return (req: any, res: any, next: any) => {
    const start = Date.now();
    const requestId = req.headers['x-request-id'] || 'unknown';
    const deviceId = req.headers['x-device-id'] || 'unknown';
    const operation = req.body?.op || 'unknown';

    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(
        `[RELAY] ${requestId} ${req.method} ${req.path} ${res.statusCode} ${duration}ms device:${deviceId} op:${operation}`
      );
    });

    next();
  };
}

/**
 * Create development router with additional debugging endpoints
 */
export function createDevelopmentRouter(): Router {
  const router = Router();

  // Debug endpoint to view current idempotency records
  router.get('/debug/idempotency', async (req, res) => {
    try {
      // This would need to be implemented in the idempotency store
      res.json({
        message: 'Idempotency debug endpoint',
        store_type: 'memory'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get idempotency debug info'
      });
    }
  });

  // Debug endpoint to test HMAC signing
  router.post('/debug/hmac', (req, res) => {
    try {
      const { method, path, body, timestamp, secret } = req.body;
      
      if (!method || !path || !body || !timestamp || !secret) {
        return res.status(400).json({
          error: 'Missing required fields: method, path, body, timestamp, secret'
        });
      }

      const { sign } = require('./security/hmac.js');
      const signature = sign({ method, path, body, timestamp, secret });

      res.json({
        signature,
        method,
        path,
        timestamp
      });
    } catch (error) {
      res.status(500).json({
        error: 'HMAC signing failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Debug endpoint to test allowlist
  router.get('/debug/allowlist', (req, res) => {
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const allowlist = process.env.OMNIRELAY_ALLOWED_IPS || '';
    
    res.json({
      client_ip: clientIP,
      allowlist: allowlist.split(',').map(ip => ip.trim()),
      allowed: true // If we reach here, IP is allowed
    });
  });

  return router;
}

/**
 * Create metrics router for monitoring
 */
export function createMetricsRouter(): Router {
  const router = Router();

  // Basic metrics endpoint
  router.get('/metrics', (req, res) => {
    // This would integrate with a metrics system like Prometheus
    res.json({
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    });
  });

  return router;
}
