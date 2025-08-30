/**
 * JWS/JWT Verification Library
 * Handles verification of signed payloads from AURA-BREE clients
 */

import { jwtVerify, createRemoteJWKSet, decodeJwt } from 'jose';
import { logger } from '../index.js';

export interface JWKConfig {
  issuer: string;
  audience: string;
  jwksUri?: string;
  publicKey?: string;
  algorithm: string;
}

// Configuration from environment
const config: JWKConfig = {
  issuer: process.env.CLINIC_JWT_ISSUER || 'MethaClinic',
  audience: process.env.CLINIC_JWT_AUDIENCE || 'sovereign-aura-bree',
  jwksUri: process.env.CLINIC_JWKS_URI,
  publicKey: process.env.CLINIC_JWT_PUBLIC_KEY,
  algorithm: process.env.CLINIC_JWT_ALGORITHM || 'HS256'
};

/**
 * Simple hash-based verification for demo purposes
 * In production, use proper RSA/ECDSA signatures
 */
async function verifySimpleJWS(token: string): Promise<any> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWS format');
    }

    const [headerB64, payloadB64, signatureB64] = parts;
    
    // Decode header and payload
    const header = JSON.parse(atob(headerB64));
    const payload = JSON.parse(atob(payloadB64));
    
    // For demo purposes, we'll accept any properly formatted JWS
    // In production, verify the signature against a known key
    logger.debug('JWS verification (demo mode)', {
      algorithm: header.alg,
      type: header.typ,
      deviceId: payload.patient?.device_id
    });

    return payload;
  } catch (error) {
    throw new Error(`JWS verification failed: ${error.message}`);
  }
}

/**
 * Verify JWS token using JOSE library (production mode)
 */
async function verifyProductionJWS(token: string): Promise<any> {
  try {
    let verificationResult;

    if (config.jwksUri) {
      // Use remote JWKS
      const JWKS = createRemoteJWKSet(new URL(config.jwksUri));
      verificationResult = await jwtVerify(token, JWKS, {
        issuer: config.issuer,
        audience: config.audience
      });
    } else if (config.publicKey) {
      // Use static public key
      const publicKey = new TextEncoder().encode(config.publicKey);
      verificationResult = await jwtVerify(token, publicKey, {
        issuer: config.issuer,
        audience: config.audience
      });
    } else {
      throw new Error('No verification key configured');
    }

    return verificationResult.payload;
  } catch (error) {
    throw new Error(`JWT verification failed: ${error.message}`);
  }
}

/**
 * Main JWS verification function
 */
export async function verifyJWS(token: string): Promise<any> {
  if (!token) {
    throw new Error('No token provided');
  }

  // Log verification attempt
  logger.debug('Verifying JWS token', {
    tokenLength: token.length,
    algorithm: config.algorithm,
    issuer: config.issuer
  });

  try {
    // Decode without verification first to check structure
    const decoded = decodeJwt(token);
    
    // Check basic claims
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      throw new Error('Token expired');
    }

    if (decoded.nbf && Date.now() < decoded.nbf * 1000) {
      throw new Error('Token not yet valid');
    }

    // Choose verification method based on environment
    if (process.env.NODE_ENV === 'production' && (config.jwksUri || config.publicKey)) {
      return await verifyProductionJWS(token);
    } else {
      // Development/demo mode - simple verification
      logger.warn('Using simple JWS verification (not for production)');
      return await verifySimpleJWS(token);
    }
  } catch (error) {
    logger.warn('JWS verification failed', {
      error: error.message,
      tokenPreview: token.substring(0, 50) + '...'
    });
    throw error;
  }
}

/**
 * Extract claims from token without verification (for logging/debugging)
 */
export function extractClaims(token: string): any {
  try {
    return decodeJwt(token);
  } catch (error) {
    logger.warn('Failed to extract claims', { error: error.message });
    return null;
  }
}

/**
 * Validate token structure and required claims
 */
export function validateTokenStructure(payload: any): boolean {
  try {
    // Check required fields for AURA-BREE check-in
    const required = [
      'v',
      'patient.device_id',
      'visit.ts',
      'visit.mood',
      'visit.notes',
      'client_side_hash'
    ];

    for (const field of required) {
      const keys = field.split('.');
      let current = payload;
      
      for (const key of keys) {
        if (!current || typeof current !== 'object' || !(key in current)) {
          logger.warn(`Missing required field: ${field}`);
          return false;
        }
        current = current[key];
      }
    }

    return true;
  } catch (error) {
    logger.warn('Token structure validation failed', { error: error.message });
    return false;
  }
}

/**
 * Check if JWS verification is properly configured
 */
export function isJWSConfigured(): boolean {
  return !!(
    config.issuer &&
    config.audience &&
    (config.jwksUri || config.publicKey || process.env.NODE_ENV !== 'production')
  );
}

/**
 * Get current JWS configuration (for debugging)
 */
export function getJWSConfig(): Partial<JWKConfig> {
  return {
    issuer: config.issuer,
    audience: config.audience,
    algorithm: config.algorithm,
    hasJwksUri: !!config.jwksUri,
    hasPublicKey: !!config.publicKey
  };
}
