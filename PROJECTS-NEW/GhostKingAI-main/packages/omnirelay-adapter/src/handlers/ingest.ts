import { Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { EnvelopeSchema, OPERATION_SCHEMAS, type Envelope, type OperationType } from '../schemas/envelope.js';
import { extractHMACHeaders, verify, validateTimestamp } from '../security/hmac.js';
import { storeIdempotentResult } from '../security/idempotency.js';
import { ChatHandler } from '../domain/chat.js';
import { MemoryHandler } from '../domain/memory.js';
import { PersonalityHandler } from '../domain/personality.js';
import { IntegrationHandler } from '../domain/integrations.js';
import { ConversationHandler } from '../domain/conversations.js';

export interface IngestRequest extends Request {
  body: Envelope;
  idempotency?: {
    key: string;
    manager: any;
    requestBody: string;
  };
}

export interface IngestResponse {
  status: 'ok' | 'error';
  result?: any;
  error?: string;
  request_id?: string;
}

/**
 * Main ingest handler for processing Omnirelay commands
 */
export async function ingestHandler(req: IngestRequest, res: Response): Promise<void> {
  const startTime = Date.now();
  let requestId: string;
  let deviceId: string;
  let operation: string;

  try {
    // Extract and validate HMAC headers
    const hmacHeaders = extractHMACHeaders(req.headers as Record<string, string>);
    if (!hmacHeaders) {
      return res.status(401).json({
        code: 'omari.unauthorized',
        message: 'Missing required authentication headers',
        request_id: uuidv4()
      });
    }

    requestId = hmacHeaders.requestId;
    deviceId = hmacHeaders.deviceId;

    // Validate timestamp
    if (!validateTimestamp(hmacHeaders.timestamp)) {
      return res.status(401).json({
        code: 'omari.unauthorized',
        message: 'Request timestamp is invalid or too old',
        request_id: requestId
      });
    }

    // Verify HMAC signature
    const secret = process.env.OMNIRELAY_SHARED_SECRET;
    if (!secret) {
      console.error('OMNIRELAY_SHARED_SECRET not configured');
      return res.status(500).json({
        code: 'omari.internal',
        message: 'Server configuration error',
        request_id: requestId
      });
    }

    const requestBody = JSON.stringify(req.body);
    const isValidSignature = verify(hmacHeaders.signature, {
      method: req.method,
      path: req.path,
      body: requestBody,
      timestamp: hmacHeaders.timestamp,
      secret
    });

    if (!isValidSignature) {
      return res.status(401).json({
        code: 'omari.unauthorized',
        message: 'Invalid HMAC signature',
        request_id: requestId
      });
    }

    // Validate envelope schema
    const envelopeResult = EnvelopeSchema.safeParse(req.body);
    if (!envelopeResult.success) {
      return res.status(400).json({
        code: 'omari.validation_failed',
        message: 'Invalid envelope format',
        request_id: requestId,
        details: envelopeResult.error.errors
      });
    }

    const envelope = envelopeResult.data;
    operation = envelope.op;

    // Validate operation-specific payload
    const operationSchema = OPERATION_SCHEMAS[envelope.op as OperationType];
    if (!operationSchema) {
      return res.status(400).json({
        code: 'omari.validation_failed',
        message: `Unsupported operation: ${envelope.op}`,
        request_id: requestId
      });
    }

    const payloadResult = operationSchema.safeParse(envelope.payload);
    if (!payloadResult.success) {
      return res.status(422).json({
        code: 'omari.validation_failed',
        message: 'Invalid payload for operation',
        request_id: requestId,
        details: payloadResult.error.errors
      });
    }

    // Validate device ID matches
    if (envelope.actor.device_id !== deviceId) {
      return res.status(403).json({
        code: 'omari.forbidden',
        message: 'Device ID mismatch',
        request_id: requestId
      });
    }

    // Route to appropriate handler
    const result = await routeOperation(envelope, payloadResult.data);

    // Store result for idempotency if key provided
    await storeIdempotentResult(req, 200, result);

    // Audit log
    await logAuditEvent(requestId, operation, deviceId, 200, Date.now() - startTime);

    res.json({
      status: 'ok',
      result,
      request_id: requestId
    });

  } catch (error) {
    console.error('Ingest handler error:', error);
    
    const status = error instanceof Error && 'status' in error ? (error as any).status : 500;
    const code = status === 500 ? 'omari.internal' : 'omari.bad_request';
    const message = error instanceof Error ? error.message : 'Unknown error';

    // Audit log for errors
    if (requestId && operation && deviceId) {
      await logAuditEvent(requestId, operation, deviceId, status, Date.now() - startTime);
    }

    res.status(status).json({
      code,
      message,
      request_id: requestId || uuidv4()
    });
  }
}

/**
 * Route operation to appropriate domain handler
 */
async function routeOperation(envelope: Envelope, payload: any): Promise<any> {
  const { op, actor, context } = envelope;
  const deviceId = actor.device_id;

  switch (op) {
    case 'omari.chat':
      return await ChatHandler.handleChat(deviceId, payload, context);

    case 'memory.query':
      return await MemoryHandler.queryMemory(deviceId, payload);

    case 'memory.add':
      return await MemoryHandler.addMemory(deviceId, payload);

    case 'memory.update':
      return await MemoryHandler.updateMemory(deviceId, payload);

    case 'memory.delete':
      return await MemoryHandler.deleteMemory(deviceId, payload);

    case 'personality.get':
      return await PersonalityHandler.getPersonality(deviceId);

    case 'personality.set':
      return await PersonalityHandler.setPersonality(deviceId, payload);

    case 'integration.invoke':
      return await IntegrationHandler.invokeIntegration(deviceId, payload);

    case 'device.get_settings':
      return await getDeviceSettings(deviceId);

    case 'conversation.create':
      return await ConversationHandler.createConversation(deviceId, payload);

    case 'conversation.list':
      return await ConversationHandler.listConversations(deviceId, payload);

    case 'conversation.delete':
      return await ConversationHandler.deleteConversation(deviceId, payload);

    case 'message.append':
      return await ConversationHandler.appendMessage(deviceId, payload);

    case 'message.list':
      return await ConversationHandler.listMessages(deviceId, payload);

    default:
      throw new Error(`Unsupported operation: ${op}`);
  }
}

/**
 * Get device settings (placeholder - integrate with existing storage)
 */
async function getDeviceSettings(deviceId: string): Promise<any> {
  // TODO: Integrate with existing storage system
  return {
    device_id: deviceId,
    settings: {
      autoSave: true,
      voiceEnabled: true,
      integrations: [],
      memoryLimit: 35
    }
  };
}

/**
 * Log audit event (placeholder - integrate with existing storage)
 */
async function logAuditEvent(
  requestId: string,
  operation: string,
  deviceId: string,
  status: number,
  latencyMs: number
): Promise<void> {
  try {
    // TODO: Integrate with existing storage system
    console.log(`[AUDIT] ${requestId} ${operation} ${deviceId} ${status} ${latencyMs}ms`);
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

/**
 * Batch ingest handler for processing multiple commands
 */
export async function batchIngestHandler(req: Request, res: Response): Promise<void> {
  try {
    const envelopes = req.body;
    
    if (!Array.isArray(envelopes)) {
      return res.status(400).json({
        code: 'omari.validation_failed',
        message: 'Request body must be an array of envelopes',
        request_id: uuidv4()
      });
    }

    if (envelopes.length > 50) {
      return res.status(400).json({
        code: 'omari.validation_failed',
        message: 'Batch size cannot exceed 50 envelopes',
        request_id: uuidv4()
      });
    }

    const results = [];
    
    for (const envelope of envelopes) {
      try {
        // Create a mock request for each envelope
        const mockReq = { ...req, body: envelope } as IngestRequest;
        const mockRes = {
          status: (code: number) => ({ json: (data: any) => ({ status: code, data }) }),
          json: (data: any) => ({ status: 200, data })
        } as any;

        await ingestHandler(mockReq, mockRes);
        results.push({ status: 'ok', result: mockRes.data || {} });
      } catch (error) {
        results.push({
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    res.json(results);
  } catch (error) {
    console.error('Batch ingest error:', error);
    res.status(500).json({
      code: 'omari.internal',
      message: 'Batch processing failed',
      request_id: uuidv4()
    });
  }
}
