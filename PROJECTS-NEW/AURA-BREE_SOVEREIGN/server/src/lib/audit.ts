/**
 * Hash-Chain Audit System
 * Immutable audit logging with cryptographic hash chains for compliance
 */

import { createHash, randomBytes } from 'crypto';
import { logger } from '../index.js';
import { getSupabaseClient } from './database.js';

export interface AuditEntry {
  id: string;
  timestamp: Date;
  action: string;
  actor: string;
  payload: any;
  metadata: any;
  hash: string;
  prevHash: string | null;
  signature?: string;
}

export interface AuditResult {
  id: string;
  hash: string;
  prevHash: string | null;
  timestamp: Date;
}

// Hash algorithm configuration
const HASH_ALGORITHM = process.env.AUDIT_HASH_ALGORITHM || 'sha256';
const SIGNATURE_ALGORITHM = process.env.AUDIT_SIGNATURE_ALGORITHM || 'ed25519';

/**
 * Generate cryptographic hash for audit entry
 */
function generateHash(data: string, prevHash?: string): string {
  const input = prevHash ? `${prevHash}||${data}` : data;
  return createHash(HASH_ALGORITHM).update(input, 'utf8').digest('hex');
}

/**
 * Create audit entry payload for hashing
 */
function createAuditPayload(entry: Omit<AuditEntry, 'hash' | 'prevHash' | 'signature'>): string {
  return JSON.stringify({
    id: entry.id,
    timestamp: entry.timestamp.toISOString(),
    action: entry.action,
    actor: entry.actor,
    payload: entry.payload,
    metadata: entry.metadata
  });
}

/**
 * Get the last audit entry hash from database
 */
async function getLastAuditHash(): Promise<string | null> {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('audit_log')
      .select('hash')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    return data?.hash || null;
  } catch (error) {
    logger.error('Failed to get last audit hash', { error: error.message });
    return null;
  }
}

/**
 * Verify hash chain integrity
 */
export async function verifyHashChain(limit: number = 100): Promise<{
  isValid: boolean;
  totalChecked: number;
  errors: string[];
}> {
  try {
    const supabase = getSupabaseClient();
    
    const { data: entries, error } = await supabase
      .from('audit_log')
      .select('id, timestamp, action, actor, payload, metadata, hash, prev_hash')
      .order('timestamp', { ascending: true })
      .limit(limit);

    if (error) {
      throw error;
    }

    const errors: string[] = [];
    let prevHash: string | null = null;

    for (const entry of entries) {
      // Recreate the audit payload
      const payload = createAuditPayload({
        id: entry.id,
        timestamp: new Date(entry.timestamp),
        action: entry.action,
        actor: entry.actor,
        payload: entry.payload,
        metadata: entry.metadata
      });

      // Calculate expected hash
      const expectedHash = generateHash(payload, prevHash);

      // Verify hash matches
      if (entry.hash !== expectedHash) {
        errors.push(`Hash mismatch for entry ${entry.id}: expected ${expectedHash}, got ${entry.hash}`);
      }

      // Verify previous hash chain
      if (entry.prev_hash !== prevHash) {
        errors.push(`Previous hash mismatch for entry ${entry.id}: expected ${prevHash}, got ${entry.prev_hash}`);
      }

      prevHash = entry.hash;
    }

    const isValid = errors.length === 0;
    
    logger.info('Hash chain verification completed', {
      totalChecked: entries.length,
      isValid,
      errorCount: errors.length
    });

    return {
      isValid,
      totalChecked: entries.length,
      errors
    };
  } catch (error) {
    logger.error('Hash chain verification failed', { error: error.message });
    return {
      isValid: false,
      totalChecked: 0,
      errors: [`Verification failed: ${error.message}`]
    };
  }
}

/**
 * Write audit entry with hash chain
 */
export async function writeAudit(data: {
  action: string;
  actor: string;
  payload: any;
  metadata?: any;
}): Promise<AuditResult> {
  try {
    const supabase = getSupabaseClient();
    
    // Generate unique ID
    const id = `audit_${Date.now()}_${randomBytes(8).toString('hex')}`;
    const timestamp = new Date();
    
    // Get previous hash for chain
    const prevHash = await getLastAuditHash();
    
    // Create audit entry
    const auditEntry: Omit<AuditEntry, 'hash' | 'signature'> = {
      id,
      timestamp,
      action: data.action,
      actor: data.actor,
      payload: data.payload || {},
      metadata: data.metadata || {},
      prevHash
    };

    // Generate payload for hashing
    const auditPayload = createAuditPayload(auditEntry);
    
    // Calculate hash
    const hash = generateHash(auditPayload, prevHash);

    // Insert into database
    const { error } = await supabase
      .from('audit_log')
      .insert({
        id,
        timestamp: timestamp.toISOString(),
        action: data.action,
        actor: data.actor,
        payload: data.payload,
        metadata: data.metadata,
        hash,
        prev_hash: prevHash
      });

    if (error) {
      throw error;
    }

    logger.info('Audit entry written', {
      id,
      action: data.action,
      actor: data.actor,
      hash: hash.substring(0, 16) + '...',
      prevHash: prevHash?.substring(0, 16) + '...' || null
    });

    return {
      id,
      hash,
      prevHash,
      timestamp
    };
  } catch (error) {
    logger.error('Failed to write audit entry', {
      error: error.message,
      action: data.action,
      actor: data.actor
    });
    throw new Error(`Audit write failed: ${error.message}`);
  }
}

/**
 * Get audit entries with optional filtering
 */
export async function getAuditEntries(options: {
  action?: string;
  actor?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
} = {}): Promise<AuditEntry[]> {
  try {
    const supabase = getSupabaseClient();
    
    let query = supabase
      .from('audit_log')
      .select('*')
      .order('timestamp', { ascending: false });

    if (options.action) {
      query = query.eq('action', options.action);
    }

    if (options.actor) {
      query = query.eq('actor', options.actor);
    }

    if (options.startDate) {
      query = query.gte('timestamp', options.startDate.toISOString());
    }

    if (options.endDate) {
      query = query.lte('timestamp', options.endDate.toISOString());
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data.map(entry => ({
      id: entry.id,
      timestamp: new Date(entry.timestamp),
      action: entry.action,
      actor: entry.actor,
      payload: entry.payload,
      metadata: entry.metadata,
      hash: entry.hash,
      prevHash: entry.prev_hash
    }));
  } catch (error) {
    logger.error('Failed to get audit entries', { error: error.message });
    throw new Error(`Audit query failed: ${error.message}`);
  }
}

/**
 * Get audit statistics
 */
export async function getAuditStats(): Promise<{
  totalEntries: number;
  actionsToday: number;
  uniqueActors: number;
  lastEntry?: Date;
  chainIntegrity: boolean;
}> {
  try {
    const supabase = getSupabaseClient();
    
    // Get total count
    const { count: totalEntries } = await supabase
      .from('audit_log')
      .select('*', { count: 'exact', head: true });

    // Get today's actions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count: actionsToday } = await supabase
      .from('audit_log')
      .select('*', { count: 'exact', head: true })
      .gte('timestamp', today.toISOString());

    // Get unique actors count
    const { data: actors } = await supabase
      .from('audit_log')
      .select('actor')
      .not('actor', 'is', null);

    const uniqueActors = new Set(actors?.map(a => a.actor) || []).size;

    // Get last entry
    const { data: lastEntry } = await supabase
      .from('audit_log')
      .select('timestamp')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    // Quick chain integrity check (last 10 entries)
    const chainCheck = await verifyHashChain(10);

    return {
      totalEntries: totalEntries || 0,
      actionsToday: actionsToday || 0,
      uniqueActors,
      lastEntry: lastEntry ? new Date(lastEntry.timestamp) : undefined,
      chainIntegrity: chainCheck.isValid
    };
  } catch (error) {
    logger.error('Failed to get audit stats', { error: error.message });
    throw new Error(`Audit stats failed: ${error.message}`);
  }
}

/**
 * Initialize audit system (create genesis entry if needed)
 */
export async function initializeAuditSystem(): Promise<void> {
  try {
    const lastHash = await getLastAuditHash();
    
    if (!lastHash) {
      logger.info('Initializing audit system with genesis entry');
      
      await writeAudit({
        action: 'system.audit.genesis',
        actor: 'system',
        payload: {
          version: '1.0.0',
          algorithm: HASH_ALGORITHM,
          initialized: new Date().toISOString()
        },
        metadata: {
          server: 'sovereign-aura-bree',
          environment: process.env.NODE_ENV || 'development'
        }
      });
    }
  } catch (error) {
    logger.error('Failed to initialize audit system', { error: error.message });
    throw error;
  }
}
