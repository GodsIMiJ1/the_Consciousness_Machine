/**
 * MethaClinic Database Integration
 * Supabase/GhostVault tables, triggers, and realtime dashboard updates
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../index.js';

export interface Patient {
  id: string;
  device_id: string;
  phone_hash?: string;
  alias?: string;
  created_at: string;
  updated_at: string;
}

export interface Visit {
  id: string;
  patient_id: string;
  timestamp: string;
  mood: string;
  notes_redacted: string;
  notes_raw_encrypted?: string;
  flags: string[];
  source: string;
  client_hash: string;
  audit_id?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  payload: any;
  metadata: any;
  hash: string;
  prev_hash?: string;
  signature?: string;
}

// Supabase client configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: SupabaseClient | null = null;

/**
 * Initialize Supabase client
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    }
    
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    logger.info('Supabase client initialized');
  }
  
  return supabase;
}

/**
 * Upsert patient record
 */
export async function upsertPatient(data: {
  deviceId: string;
  phoneHash?: string;
  alias?: string;
}): Promise<Patient> {
  try {
    const supabase = getSupabaseClient();
    
    // First try to find existing patient by device_id
    const { data: existing, error: findError } = await supabase
      .from('patients')
      .select('*')
      .eq('device_id', data.deviceId)
      .single();

    if (findError && findError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw findError;
    }

    if (existing) {
      // Update existing patient
      const { data: updated, error: updateError } = await supabase
        .from('patients')
        .update({
          phone_hash: data.phoneHash || existing.phone_hash,
          alias: data.alias || existing.alias,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (updateError) throw updateError;
      
      logger.info('Patient updated', { patientId: updated.id, deviceId: data.deviceId });
      return updated;
    } else {
      // Create new patient
      const { data: created, error: createError } = await supabase
        .from('patients')
        .insert({
          device_id: data.deviceId,
          phone_hash: data.phoneHash,
          alias: data.alias
        })
        .select()
        .single();

      if (createError) throw createError;
      
      logger.info('Patient created', { patientId: created.id, deviceId: data.deviceId });
      return created;
    }
  } catch (error) {
    logger.error('Failed to upsert patient', { error: error.message, deviceId: data.deviceId });
    throw new Error(`Patient upsert failed: ${error.message}`);
  }
}

/**
 * Create visit record
 */
export async function createVisit(data: {
  patientId: string;
  timestamp: Date;
  mood: string;
  notes: string;
  flags: string[];
  source: string;
  clientHash: string;
  auditId?: string;
}): Promise<Visit> {
  try {
    const supabase = getSupabaseClient();
    
    // For now, we'll store notes as redacted (in production, implement proper encryption)
    const notesRedacted = data.notes; // TODO: Apply PII redaction
    
    const { data: visit, error } = await supabase
      .from('visits')
      .insert({
        patient_id: data.patientId,
        timestamp: data.timestamp.toISOString(),
        mood: data.mood,
        notes_redacted: notesRedacted,
        flags: data.flags,
        source: data.source,
        client_hash: data.clientHash,
        audit_id: data.auditId
      })
      .select()
      .single();

    if (error) throw error;
    
    logger.info('Visit created', { 
      visitId: visit.id, 
      patientId: data.patientId, 
      mood: data.mood,
      flags: data.flags 
    });

    // Trigger realtime notification
    await notifyDashboard('visit_created', {
      visit_id: visit.id,
      patient_id: data.patientId,
      mood: data.mood,
      timestamp: data.timestamp.toISOString(),
      source: data.source,
      flags: data.flags
    });

    return visit;
  } catch (error) {
    logger.error('Failed to create visit', { 
      error: error.message, 
      patientId: data.patientId 
    });
    throw new Error(`Visit creation failed: ${error.message}`);
  }
}

/**
 * Get patient visits
 */
export async function getPatientVisits(
  patientId: string, 
  limit: number = 50
): Promise<Visit[]> {
  try {
    const supabase = getSupabaseClient();
    
    const { data: visits, error } = await supabase
      .from('visits')
      .select('*')
      .eq('patient_id', patientId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    return visits || [];
  } catch (error) {
    logger.error('Failed to get patient visits', { 
      error: error.message, 
      patientId 
    });
    throw new Error(`Failed to get visits: ${error.message}`);
  }
}

/**
 * Get clinic statistics
 */
export async function getClinicStats(): Promise<{
  totalPatients: number;
  totalVisits: number;
  visitsToday: number;
  averageMood: number;
  flaggedVisits: number;
}> {
  try {
    const supabase = getSupabaseClient();
    
    // Get total patients
    const { count: totalPatients } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true });

    // Get total visits
    const { count: totalVisits } = await supabase
      .from('visits')
      .select('*', { count: 'exact', head: true });

    // Get today's visits
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count: visitsToday } = await supabase
      .from('visits')
      .select('*', { count: 'exact', head: true })
      .gte('timestamp', today.toISOString());

    // Get average mood (last 100 visits)
    const { data: recentVisits } = await supabase
      .from('visits')
      .select('mood')
      .order('timestamp', { ascending: false })
      .limit(100);

    let averageMood = 0;
    if (recentVisits && recentVisits.length > 0) {
      const moodValues = recentVisits.map(v => {
        // Convert mood categories to numbers
        switch (v.mood) {
          case 'excellent': return 9;
          case 'good': return 7;
          case 'neutral': return 5;
          case 'low': return 3;
          case 'critical': return 1;
          default: return 5;
        }
      });
      averageMood = moodValues.reduce((a, b) => a + b, 0) / moodValues.length;
    }

    // Get flagged visits (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: flaggedVisits } = await supabase
      .from('visits')
      .select('*', { count: 'exact', head: true })
      .gte('timestamp', thirtyDaysAgo.toISOString())
      .or('flags.cs.{low_mood,crisis,emergency}');

    return {
      totalPatients: totalPatients || 0,
      totalVisits: totalVisits || 0,
      visitsToday: visitsToday || 0,
      averageMood: Math.round(averageMood * 10) / 10,
      flaggedVisits: flaggedVisits || 0
    };
  } catch (error) {
    logger.error('Failed to get clinic stats', { error: error.message });
    throw new Error(`Failed to get stats: ${error.message}`);
  }
}

/**
 * Send realtime notification to dashboard
 */
export async function notifyDashboard(event: string, payload: any): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    
    // Send to realtime channel
    const channel = supabase.channel('clinic-dashboard');
    
    await channel.send({
      type: 'broadcast',
      event,
      payload: {
        ...payload,
        timestamp: new Date().toISOString(),
        source: 'sovereign-aura-bree'
      }
    });
    
    logger.debug('Dashboard notification sent', { event, payload });
  } catch (error) {
    logger.warn('Failed to send dashboard notification', { 
      error: error.message, 
      event 
    });
    // Don't throw - this is not critical
  }
}

/**
 * Initialize database schema (for development)
 */
export async function initializeDatabase(): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    
    // This would typically be done via migrations
    // For now, we'll just verify the tables exist
    
    const { data: patients } = await supabase
      .from('patients')
      .select('id')
      .limit(1);
    
    const { data: visits } = await supabase
      .from('visits')
      .select('id')
      .limit(1);
    
    const { data: auditLog } = await supabase
      .from('audit_log')
      .select('id')
      .limit(1);
    
    logger.info('Database schema verified', {
      patientsTable: !!patients,
      visitsTable: !!visits,
      auditLogTable: !!auditLog
    });
  } catch (error) {
    logger.error('Database initialization failed', { error: error.message });
    throw new Error(`Database init failed: ${error.message}`);
  }
}
