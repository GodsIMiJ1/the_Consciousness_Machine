import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { fetch } from 'undici';
import { generateHMACHeaders } from '../security/hmac.js';
import { EnvelopeSchema, type Envelope } from '../schemas/envelope.js';

export interface EmitRequest extends Request {
  body: Envelope;
}

/**
 * Emit handler for sending events to Omnirelay webhook
 */
export async function emitHandler(req: EmitRequest, res: Response): Promise<void> {
  try {
    // Validate envelope schema
    const envelopeResult = EnvelopeSchema.safeParse(req.body);
    if (!envelopeResult.success) {
      return res.status(400).json({
        code: 'omari.validation_failed',
        message: 'Invalid envelope format',
        request_id: uuidv4(),
        details: envelopeResult.error.errors
      });
    }

    const envelope = envelopeResult.data;
    
    // Get webhook URL from environment
    const webhookUrl = process.env.OMNIRELAY_WEBHOOK_URL;
    if (!webhookUrl) {
      return res.status(500).json({
        code: 'omari.internal',
        message: 'OMNIRELAY_WEBHOOK_URL not configured',
        request_id: envelope.id
      });
    }

    // Get shared secret for signing
    const secret = process.env.OMNIRELAY_SHARED_SECRET;
    if (!secret) {
      return res.status(500).json({
        code: 'omari.internal',
        message: 'OMNIRELAY_SHARED_SECRET not configured',
        request_id: envelope.id
      });
    }

    // Prepare request body
    const requestBody = JSON.stringify(envelope);
    
    // Generate HMAC headers
    const hmacHeaders = generateHMACHeaders(
      'POST',
      new URL(webhookUrl).pathname,
      requestBody,
      envelope.actor.device_id,
      secret
    );

    // Send webhook request
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...hmacHeaders
      },
      body: requestBody
    });

    if (!response.ok) {
      console.error(`Webhook delivery failed: ${response.status} ${response.statusText}`);
      return res.status(502).json({
        code: 'omari.webhook_failed',
        message: `Webhook delivery failed: ${response.status}`,
        request_id: envelope.id
      });
    }

    // Log successful delivery
    console.log(`[EMIT] Event ${envelope.op} delivered to ${webhookUrl} for device ${envelope.actor.device_id}`);

    res.status(204).send();
  } catch (error) {
    console.error('Emit handler error:', error);
    
    const requestId = req.body?.id || uuidv4();
    res.status(500).json({
      code: 'omari.internal',
      message: error instanceof Error ? error.message : 'Unknown error',
      request_id: requestId
    });
  }
}

/**
 * Create and emit an event envelope
 */
export async function createAndEmitEvent(
  eventType: string,
  deviceId: string,
  payload: any,
  context?: any
): Promise<boolean> {
  try {
    const envelope: Envelope = {
      v: "1.0",
      id: uuidv4(),
      ts: new Date().toISOString(),
      source: "omari",
      target: "omnirelay",
      op: eventType,
      actor: {
        device_id: deviceId,
        persona: "Omari",
        scopes: ["event:emit"]
      },
      context,
      payload,
      trace: {
        request_id: uuidv4()
      }
    };

    const webhookUrl = process.env.OMNIRELAY_WEBHOOK_URL;
    const secret = process.env.OMNIRELAY_SHARED_SECRET;

    if (!webhookUrl || !secret) {
      console.warn('Webhook URL or secret not configured, skipping event emission');
      return false;
    }

    const requestBody = JSON.stringify(envelope);
    const hmacHeaders = generateHMACHeaders(
      'POST',
      new URL(webhookUrl).pathname,
      requestBody,
      deviceId,
      secret
    );

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...hmacHeaders
      },
      body: requestBody
    });

    if (response.ok) {
      console.log(`[EMIT] Event ${eventType} delivered for device ${deviceId}`);
      return true;
    } else {
      console.error(`[EMIT] Failed to deliver event ${eventType}: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('Failed to emit event:', error);
    return false;
  }
}

/**
 * Emit message created event
 */
export async function emitMessageCreated(
  deviceId: string,
  conversationId: string,
  message: any
): Promise<void> {
  await createAndEmitEvent('omari.message.created', deviceId, {
    conversation_id: conversationId,
    message
  });
}

/**
 * Emit conversation created event
 */
export async function emitConversationCreated(
  deviceId: string,
  conversation: any
): Promise<void> {
  await createAndEmitEvent('omari.conversation.created', deviceId, {
    conversation
  });
}

/**
 * Emit memory changed event
 */
export async function emitMemoryChanged(
  deviceId: string,
  action: 'created' | 'updated' | 'deleted',
  memoryBlock: any
): Promise<void> {
  await createAndEmitEvent('omari.memory.changed', deviceId, {
    action,
    memory_block: memoryBlock
  });
}

/**
 * Emit integration executed event
 */
export async function emitIntegrationExecuted(
  deviceId: string,
  provider: string,
  action: string,
  result: any
): Promise<void> {
  await createAndEmitEvent('omari.integration.executed', deviceId, {
    provider,
    action,
    result
  });
}

/**
 * Emit error event
 */
export async function emitError(
  deviceId: string,
  error: string,
  context?: any
): Promise<void> {
  await createAndEmitEvent('omari.error', deviceId, {
    error,
    context
  });
}
