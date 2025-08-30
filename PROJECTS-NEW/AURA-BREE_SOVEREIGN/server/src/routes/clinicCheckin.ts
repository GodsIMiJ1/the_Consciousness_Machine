/**
 * Clinic Check-in API Route
 * Handles signed JWS payloads from Sovereign AURA-BREE clients
 */

import express from 'express';
import { z } from 'zod';
import { verifyJWS } from '../lib/jwk.js';
import { writeAudit } from '../lib/audit.js';
import { upsertPatient, createVisit } from '../lib/database.js';
import { logger } from '../index.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

// Check-in payload schema
const CheckInPayloadSchema = z.object({
  v: z.number().min(1).max(1), // Version 1 only for now
  patient: z.object({
    device_id: z.string().uuid(),
    phone_hash: z.string().optional(),
    alias: z.string().max(100).optional()
  }),
  visit: z.object({
    ts: z.number().positive(),
    mood: z.string().min(1).max(50),
    notes: z.string().max(2000),
    flags: z.array(z.string().max(50)).max(10)
  }),
  client_side_hash: z.string().min(1)
});

type CheckInPayload = z.infer<typeof CheckInPayloadSchema>;

/**
 * POST /api/clinic/checkin
 * Accept signed check-in from AURA-BREE client
 */
router.post('/checkin', async (req: express.Request, res: express.Response) => {
  const startTime = Date.now();
  let auditData: any = {};

  try {
    // Extract JWS token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid Authorization header'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '
    
    // Verify JWS signature
    let payload: CheckInPayload;
    try {
      payload = await verifyJWS(token);
      logger.info('JWS verification successful', { 
        deviceId: payload.patient.device_id,
        timestamp: payload.visit.ts 
      });
    } catch (error) {
      logger.warn('JWS verification failed', { 
        error: error.message,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      });
    }

    // Validate payload structure
    const validationResult = CheckInPayloadSchema.safeParse(payload);
    if (!validationResult.success) {
      logger.warn('Invalid payload structure', { 
        errors: validationResult.error.errors,
        deviceId: payload?.patient?.device_id 
      });
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid payload structure',
        details: validationResult.error.errors
      });
    }

    const validPayload = validationResult.data;

    // Check timestamp (reject if too old or too far in future)
    const now = Date.now();
    const timeDiff = Math.abs(now - validPayload.visit.ts);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (timeDiff > maxAge) {
      logger.warn('Timestamp out of range', { 
        deviceId: validPayload.patient.device_id,
        timestamp: validPayload.visit.ts,
        timeDiff 
      });
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Timestamp out of acceptable range'
      });
    }

    // Prepare audit data
    auditData = {
      action: 'patient.checkin',
      actor: validPayload.patient.device_id,
      payload: {
        version: validPayload.v,
        mood: validPayload.visit.mood,
        flags: validPayload.visit.flags,
        notes_length: validPayload.visit.notes.length,
        client_hash: validPayload.client_side_hash
      },
      metadata: {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        clientVersion: req.get('X-Flame-Client'),
        timestamp: validPayload.visit.ts
      }
    };

    // Write to audit log and get hash chain
    const auditResult = await writeAudit(auditData);
    
    // Upsert patient record
    const patient = await upsertPatient({
      deviceId: validPayload.patient.device_id,
      phoneHash: validPayload.patient.phone_hash,
      alias: validPayload.patient.alias
    });

    // Create visit record
    const visit = await createVisit({
      patientId: patient.id,
      timestamp: new Date(validPayload.visit.ts),
      mood: validPayload.visit.mood,
      notes: validPayload.visit.notes,
      flags: validPayload.visit.flags,
      source: 'sovereign-aura-bree',
      clientHash: validPayload.client_side_hash,
      auditId: auditResult.id
    });

    // Log successful processing
    logger.info('Check-in processed successfully', {
      deviceId: validPayload.patient.device_id,
      patientId: patient.id,
      visitId: visit.id,
      processingTime: Date.now() - startTime
    });

    // Send response with hash chain header
    res.setHeader('X-Flame-Prev-Hash', auditResult.hash);
    res.setHeader('X-Flame-Audit-Id', auditResult.id);
    
    res.status(201).json({
      success: true,
      message: 'Check-in recorded successfully',
      data: {
        visitId: visit.id,
        patientId: patient.id,
        timestamp: visit.timestamp,
        auditId: auditResult.id
      },
      meta: {
        processingTime: Date.now() - startTime,
        serverTimestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Check-in processing failed', {
      error: error.message,
      stack: error.stack,
      auditData,
      processingTime: Date.now() - startTime
    });

    // Try to write error to audit log
    try {
      await writeAudit({
        action: 'patient.checkin.error',
        actor: auditData.actor || 'unknown',
        payload: { error: error.message },
        metadata: auditData.metadata || {}
      });
    } catch (auditError) {
      logger.error('Failed to write error audit', { error: auditError.message });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process check-in',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/clinic/status
 * Get clinic sync status and statistics
 */
router.get('/status', async (req: express.Request, res: express.Response) => {
  try {
    // This would typically require authentication in production
    const stats = {
      service: 'Sovereign AURA-BREE Clinic API',
      status: 'operational',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      features: {
        jwsVerification: true,
        auditLogging: true,
        hashChain: true,
        realtime: process.env.REALTIME_ENABLED === 'true'
      }
    };

    res.json(stats);
  } catch (error) {
    logger.error('Status check failed', { error: error.message });
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get status'
    });
  }
});

/**
 * POST /api/clinic/test
 * Test endpoint for development (remove in production)
 */
if (process.env.NODE_ENV === 'development') {
  router.post('/test', (req: express.Request, res: express.Response) => {
    logger.info('Test endpoint called', { 
      body: req.body,
      headers: req.headers 
    });
    
    res.json({
      message: 'Test endpoint working',
      receivedData: req.body,
      timestamp: new Date().toISOString()
    });
  });
}

export { router as clinicCheckinRouter };
