import { createHmac, timingSafeEqual } from 'crypto';

export interface HMACSignatureData {
  method: string;
  path: string;
  body: string;
  timestamp: string;
  secret: string;
}

/**
 * Generate HMAC-SHA256 signature for request authentication
 */
export function sign(data: HMACSignatureData): string {
  const { method, path, body, timestamp, secret } = data;
  
  // Create the string to sign: METHOD + PATH + BODY + TIMESTAMP
  const stringToSign = `${method.toUpperCase()}${path}${body}${timestamp}`;
  
  // Generate HMAC-SHA256 signature
  const hmac = createHmac('sha256', secret);
  hmac.update(stringToSign, 'utf8');
  
  // Return base64 encoded signature
  return hmac.digest('base64');
}

/**
 * Verify HMAC-SHA256 signature for request authentication
 */
export function verify(signature: string, data: HMACSignatureData): boolean {
  try {
    const expectedSignature = sign(data);
    
    // Use timing-safe comparison to prevent timing attacks
    const signatureBuffer = Buffer.from(signature, 'base64');
    const expectedBuffer = Buffer.from(expectedSignature, 'base64');
    
    // Ensure both buffers are the same length
    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }
    
    return timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch (error) {
    console.error('HMAC verification error:', error);
    return false;
  }
}

/**
 * Validate timestamp to prevent replay attacks
 */
export function validateTimestamp(timestamp: string, maxAgeSeconds: number = 300): boolean {
  try {
    const requestTime = new Date(timestamp).getTime();
    const currentTime = Date.now();
    const ageSeconds = (currentTime - requestTime) / 1000;
    
    // Check if timestamp is within acceptable range
    return ageSeconds >= 0 && ageSeconds <= maxAgeSeconds;
  } catch (error) {
    console.error('Timestamp validation error:', error);
    return false;
  }
}

/**
 * Extract and validate HMAC headers from request
 */
export interface HMACHeaders {
  requestId: string;
  timestamp: string;
  deviceId: string;
  signature: string;
}

export function extractHMACHeaders(headers: Record<string, string | undefined>): HMACHeaders | null {
  const requestId = headers['x-request-id'];
  const timestamp = headers['x-timestamp'];
  const deviceId = headers['x-device-id'];
  const signature = headers['x-signature'];
  
  if (!requestId || !timestamp || !deviceId || !signature) {
    return null;
  }
  
  return {
    requestId,
    timestamp,
    deviceId,
    signature
  };
}

/**
 * Generate HMAC headers for outgoing requests
 */
export function generateHMACHeaders(
  method: string,
  path: string,
  body: string,
  deviceId: string,
  secret: string
): Record<string, string> {
  const requestId = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  
  const signature = sign({
    method,
    path,
    body,
    timestamp,
    secret
  });
  
  return {
    'X-Request-Id': requestId,
    'X-Timestamp': timestamp,
    'X-Device-Id': deviceId,
    'X-Signature': signature
  };
}
