import express, { Express } from 'express';
import { createOmnirelayRouter, setupPeriodicCleanup, createRequestLogger, createDevelopmentRouter, createMetricsRouter } from './routes.js';

/**
 * Setup Omnirelay adapter middleware and routes
 */
export function setupOmnirelayAdapter(app: Express): void {
  console.log('[OMNIRELAY] Setting up adapter...');

  // Create request logger
  const requestLogger = createRequestLogger();

  // Mount the main adapter router
  const adapterRouter = createOmnirelayRouter();
  app.use('/api/relay/v1', requestLogger, adapterRouter);

  // Mount development router in development mode
  if (process.env.NODE_ENV === 'development') {
    const devRouter = createDevelopmentRouter();
    app.use('/api/relay/v1/debug', devRouter);
    console.log('[OMNIRELAY] Development debug endpoints enabled');
  }

  // Mount metrics router
  const metricsRouter = createMetricsRouter();
  app.use('/api/relay/v1', metricsRouter);

  // Setup periodic cleanup
  setupPeriodicCleanup();

  console.log('[OMNIRELAY] Adapter setup complete');
  console.log('[OMNIRELAY] Available endpoints:');
  console.log('  GET  /api/relay/v1/health');
  console.log('  GET  /api/relay/v1/version');
  console.log('  POST /api/relay/v1/ingest');
  console.log('  POST /api/relay/v1/batch');
  console.log('  POST /api/relay/v1/emit');
  console.log('  GET  /api/relay/v1/metrics');
  
  if (process.env.NODE_ENV === 'development') {
    console.log('  GET  /api/relay/v1/debug/idempotency');
    console.log('  POST /api/relay/v1/debug/hmac');
    console.log('  GET  /api/relay/v1/debug/allowlist');
  }
}

/**
 * Validate required environment variables
 */
export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required environment variables
  const required = [
    'OMNIRELAY_SHARED_SECRET',
    'OMNIRELAY_ALLOWED_IPS'
  ];

  for (const envVar of required) {
    if (!process.env[envVar]) {
      errors.push(`Missing required environment variable: ${envVar}`);
    }
  }

  // Validate OMNIRELAY_ALLOWED_IPS format
  if (process.env.OMNIRELAY_ALLOWED_IPS) {
    const allowlist = process.env.OMNIRELAY_ALLOWED_IPS.split(',');
    for (const cidr of allowlist) {
      const trimmed = cidr.trim();
      if (trimmed && !isValidCIDR(trimmed)) {
        errors.push(`Invalid CIDR format in OMNIRELAY_ALLOWED_IPS: ${trimmed}`);
      }
    }
  }

  // Validate rate limit setting
  if (process.env.RATE_LIMIT_RPM) {
    const rateLimit = parseInt(process.env.RATE_LIMIT_RPM, 10);
    if (isNaN(rateLimit) || rateLimit <= 0) {
      errors.push('RATE_LIMIT_RPM must be a positive integer');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Simple CIDR validation
 */
function isValidCIDR(cidr: string): boolean {
  const parts = cidr.split('/');
  if (parts.length !== 2) return false;
  
  const [ip, prefix] = parts;
  
  // Basic IP validation (IPv4)
  const ipParts = ip.split('.');
  if (ipParts.length !== 4) return false;
  
  for (const part of ipParts) {
    const num = parseInt(part, 10);
    if (isNaN(num) || num < 0 || num > 255) return false;
  }
  
  // Prefix validation
  const prefixNum = parseInt(prefix, 10);
  if (isNaN(prefixNum) || prefixNum < 0 || prefixNum > 32) return false;
  
  return true;
}

/**
 * Get adapter configuration summary
 */
export function getAdapterConfig(): any {
  return {
    mode: process.env.OMARI_MODE || 'local',
    storage: process.env.DATABASE_URL ? 'postgresql' : 'memory',
    webhook_url: process.env.OMNIRELAY_WEBHOOK_URL || null,
    rate_limit_rpm: parseInt(process.env.RATE_LIMIT_RPM || '60', 10),
    allowed_ips: process.env.OMNIRELAY_ALLOWED_IPS?.split(',').map(ip => ip.trim()) || [],
    development_mode: process.env.NODE_ENV === 'development'
  };
}

/**
 * Health check for the adapter
 */
export async function checkAdapterHealth(): Promise<{ healthy: boolean; checks: any }> {
  const checks = {
    environment: { status: 'ok', details: null },
    webhook: { status: 'unknown', details: null },
    storage: { status: 'ok', details: null }
  };

  // Check environment variables
  const envValidation = validateEnvironment();
  if (!envValidation.valid) {
    checks.environment.status = 'error';
    checks.environment.details = envValidation.errors;
  }

  // Check webhook connectivity (if configured)
  if (process.env.OMNIRELAY_WEBHOOK_URL) {
    try {
      const response = await fetch(process.env.OMNIRELAY_WEBHOOK_URL, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      checks.webhook.status = response.ok ? 'ok' : 'error';
      checks.webhook.details = `HTTP ${response.status}`;
    } catch (error) {
      checks.webhook.status = 'error';
      checks.webhook.details = error instanceof Error ? error.message : 'Unknown error';
    }
  }

  // Check storage (basic check)
  try {
    // This would check database connectivity if using PostgreSQL
    checks.storage.status = 'ok';
    checks.storage.details = process.env.DATABASE_URL ? 'postgresql' : 'memory';
  } catch (error) {
    checks.storage.status = 'error';
    checks.storage.details = error instanceof Error ? error.message : 'Unknown error';
  }

  const healthy = Object.values(checks).every(check => check.status === 'ok');

  return { healthy, checks };
}

/**
 * Graceful shutdown handler
 */
export function setupGracefulShutdown(): void {
  const shutdown = (signal: string) => {
    console.log(`[OMNIRELAY] Received ${signal}, shutting down gracefully...`);
    
    // Perform cleanup tasks here
    // - Close database connections
    // - Finish processing pending requests
    // - Clear intervals/timeouts
    
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

/**
 * Initialize the Omnirelay adapter
 */
export async function initializeAdapter(app: Express): Promise<void> {
  console.log('[OMNIRELAY] Initializing adapter...');

  // Validate environment
  const envValidation = validateEnvironment();
  if (!envValidation.valid) {
    console.error('[OMNIRELAY] Environment validation failed:');
    envValidation.errors.forEach(error => console.error(`  - ${error}`));
    throw new Error('Invalid environment configuration');
  }

  // Setup graceful shutdown
  setupGracefulShutdown();

  // Setup the adapter
  setupOmnirelayAdapter(app);

  // Log configuration
  const config = getAdapterConfig();
  console.log('[OMNIRELAY] Configuration:');
  console.log(`  Mode: ${config.mode}`);
  console.log(`  Storage: ${config.storage}`);
  console.log(`  Rate limit: ${config.rate_limit_rpm} RPM`);
  console.log(`  Allowed IPs: ${config.allowed_ips.length} entries`);
  console.log(`  Webhook URL: ${config.webhook_url ? 'configured' : 'not configured'}`);
  console.log(`  Development mode: ${config.development_mode}`);

  // Perform health check
  const health = await checkAdapterHealth();
  if (!health.healthy) {
    console.warn('[OMNIRELAY] Health check warnings:');
    Object.entries(health.checks).forEach(([check, result]) => {
      if (result.status !== 'ok') {
        console.warn(`  - ${check}: ${result.status} - ${result.details}`);
      }
    });
  }

  console.log('[OMNIRELAY] Adapter initialization complete');
}
