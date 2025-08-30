/**
 * SovereignLink - Clinic Sync Protocol for AURA-BREE
 * Offline-first queue system with signed JWS payloads and hash-chain audit logging
 */

export interface CheckInPayload {
  v: number; // version
  patient: {
    device_id: string;
    phone_hash?: string;
    alias?: string;
  };
  visit: {
    ts: number;
    mood: string;
    notes: string;
    flags: string[];
  };
  client_side_hash: string;
}

export interface QueuedCheckIn {
  id: string;
  payload: CheckInPayload;
  jws: string;
  timestamp: number;
  attempts: number;
  lastAttempt?: number;
  error?: string;
}

export interface SyncStatus {
  queueSize: number;
  lastSync?: number;
  isOnline: boolean;
  clinicConnected: boolean;
  pendingCount: number;
  failedCount: number;
}

export interface ClinicConfig {
  serverUrl: string;
  endpoint: string;
  jwtIssuer: string;
  publicKey?: string;
  maxRetries: number;
  retryInterval: number;
  maxQueueSize: number;
}

// Configuration from environment
const config: ClinicConfig = {
  serverUrl: import.meta.env.VITE_CLINIC_SERVER_URL || "https://clinic.local",
  endpoint: import.meta.env.VITE_CLINIC_API_ENDPOINT || "/api/clinic/checkin",
  jwtIssuer: import.meta.env.VITE_CLINIC_JWT_ISSUER || "MethaClinic",
  publicKey: import.meta.env.VITE_CLINIC_JWT_PUBLIC_KEY,
  maxRetries: Number(import.meta.env.VITE_CLINIC_MAX_RETRY_ATTEMPTS ?? 5),
  retryInterval: Number(import.meta.env.VITE_CLINIC_RETRY_INTERVAL_MS ?? 30000),
  maxQueueSize: Number(import.meta.env.VITE_CLINIC_OFFLINE_QUEUE_MAX ?? 100)
};

// Storage keys
const QUEUE_KEY = "ab:clinic:queue";
const HASH_CHAIN_KEY = "ab:clinic:hash_chain";
const SYNC_STATUS_KEY = "ab:clinic:sync_status";

/**
 * Generate a simple hash for client-side hash chain
 */
async function generateHash(data: string, prevHash?: string): Promise<string> {
  const input = prevHash ? `${prevHash}||${data}` : data;
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(input));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Create a simple JWS-like signature (for demo - use proper crypto in production)
 */
async function createJWS(payload: CheckInPayload): Promise<string> {
  const header = {
    alg: "HS256",
    typ: "JWT"
  };

  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  
  // Simple signature for demo (use proper HMAC/RSA in production)
  const signature = await generateHash(`${encodedHeader}.${encodedPayload}`);
  const encodedSignature = btoa(signature);

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

/**
 * Get the current hash chain state
 */
function getHashChain(): string | null {
  try {
    return localStorage.getItem(HASH_CHAIN_KEY);
  } catch {
    return null;
  }
}

/**
 * Update the hash chain
 */
function updateHashChain(newHash: string): void {
  try {
    localStorage.setItem(HASH_CHAIN_KEY, newHash);
  } catch {
    console.warn("[SovereignLink] Failed to update hash chain");
  }
}

/**
 * Load the offline queue
 */
function loadQueue(): QueuedCheckIn[] {
  try {
    const stored = localStorage.getItem(QUEUE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

/**
 * Save the offline queue
 */
function saveQueue(queue: QueuedCheckIn[]): void {
  try {
    // Limit queue size
    const trimmed = queue.slice(-config.maxQueueSize);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(trimmed));
  } catch {
    console.warn("[SovereignLink] Failed to save queue");
  }
}

/**
 * Get current sync status
 */
export function getSyncStatus(): SyncStatus {
  const queue = loadQueue();
  const pending = queue.filter(item => item.attempts < config.maxRetries);
  const failed = queue.filter(item => item.attempts >= config.maxRetries);

  try {
    const stored = localStorage.getItem(SYNC_STATUS_KEY);
    const status = stored ? JSON.parse(stored) : {};
    
    return {
      queueSize: queue.length,
      lastSync: status.lastSync,
      isOnline: navigator.onLine,
      clinicConnected: status.clinicConnected || false,
      pendingCount: pending.length,
      failedCount: failed.length
    };
  } catch {
    return {
      queueSize: queue.length,
      isOnline: navigator.onLine,
      clinicConnected: false,
      pendingCount: pending.length,
      failedCount: failed.length
    };
  }
}

/**
 * Update sync status
 */
function updateSyncStatus(updates: Partial<SyncStatus>): void {
  try {
    const current = getSyncStatus();
    const updated = { ...current, ...updates };
    localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(updated));
  } catch {
    console.warn("[SovereignLink] Failed to update sync status");
  }
}

/**
 * Create a check-in payload
 */
export async function createCheckIn(
  deviceId: string,
  mood: string,
  notes: string,
  flags: string[] = [],
  phoneHash?: string,
  alias?: string
): Promise<void> {
  const payload: CheckInPayload = {
    v: 1,
    patient: {
      device_id: deviceId,
      phone_hash: phoneHash,
      alias: alias
    },
    visit: {
      ts: Date.now(),
      mood,
      notes,
      flags
    },
    client_side_hash: "" // Will be set below
  };

  // Generate client-side hash for audit chain
  const prevHash = getHashChain();
  const payloadString = JSON.stringify(payload);
  const newHash = await generateHash(payloadString, prevHash || undefined);
  payload.client_side_hash = newHash;

  // Create JWS
  const jws = await createJWS(payload);

  // Add to queue
  const queueItem: QueuedCheckIn = {
    id: `checkin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    payload,
    jws,
    timestamp: Date.now(),
    attempts: 0
  };

  const queue = loadQueue();
  queue.push(queueItem);
  saveQueue(queue);

  // Update hash chain
  updateHashChain(newHash);

  console.log("[SovereignLink] Check-in queued:", queueItem.id);

  // Try immediate sync if online
  if (navigator.onLine) {
    setTimeout(() => syncQueue(), 1000);
  }
}

/**
 * Sync the offline queue with the clinic server
 */
export async function syncQueue(): Promise<void> {
  if (!navigator.onLine) {
    console.log("[SovereignLink] Offline - skipping sync");
    return;
  }

  const queue = loadQueue();
  const pending = queue.filter(item => item.attempts < config.maxRetries);

  if (pending.length === 0) {
    console.log("[SovereignLink] No pending items to sync");
    return;
  }

  console.log(`[SovereignLink] Syncing ${pending.length} items...`);

  let syncedCount = 0;
  let errorCount = 0;

  for (const item of pending) {
    try {
      const response = await fetch(`${config.serverUrl}${config.endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${item.jws}`,
          "X-Flame-Client": "sovereign-aura-bree",
          "X-Flame-Version": "1.0.0"
        },
        body: JSON.stringify(item.payload)
      });

      if (response.ok) {
        // Success - remove from queue
        const index = queue.findIndex(q => q.id === item.id);
        if (index >= 0) {
          queue.splice(index, 1);
        }
        syncedCount++;
        console.log(`[SovereignLink] Synced: ${item.id}`);
      } else {
        // Server error - increment attempts
        item.attempts++;
        item.lastAttempt = Date.now();
        item.error = `HTTP ${response.status}: ${response.statusText}`;
        errorCount++;
        console.warn(`[SovereignLink] Failed to sync ${item.id}:`, item.error);
      }
    } catch (error) {
      // Network error - increment attempts
      item.attempts++;
      item.lastAttempt = Date.now();
      item.error = (error as Error).message;
      errorCount++;
      console.warn(`[SovereignLink] Network error for ${item.id}:`, error);
    }
  }

  // Save updated queue
  saveQueue(queue);

  // Update sync status
  updateSyncStatus({
    lastSync: Date.now(),
    clinicConnected: syncedCount > 0,
    pendingCount: queue.filter(item => item.attempts < config.maxRetries).length,
    failedCount: queue.filter(item => item.attempts >= config.maxRetries).length
  });

  console.log(`[SovereignLink] Sync complete: ${syncedCount} synced, ${errorCount} errors`);
}

/**
 * Check if clinic sync is enabled and configured
 */
export function isClinicSyncEnabled(): boolean {
  return !!(
    import.meta.env.VITE_CLINIC_SYNC_ENABLED === 'true' &&
    config.serverUrl &&
    config.serverUrl !== 'https://clinic.local'
  );
}

/**
 * Start automatic sync process
 */
export function startAutoSync(): void {
  if (!isClinicSyncEnabled()) {
    console.log("[SovereignLink] Clinic sync disabled");
    return;
  }

  console.log("[SovereignLink] Starting auto-sync...");

  // Sync on page load
  if (navigator.onLine) {
    setTimeout(() => syncQueue(), 2000);
  }

  // Sync periodically
  setInterval(() => {
    if (navigator.onLine) {
      syncQueue();
    }
  }, config.retryInterval);

  // Sync when coming back online
  window.addEventListener('online', () => {
    console.log("[SovereignLink] Back online - syncing queue");
    setTimeout(() => syncQueue(), 1000);
  });
}

/**
 * Clear failed items from queue (manual cleanup)
 */
export function clearFailedItems(): void {
  const queue = loadQueue();
  const filtered = queue.filter(item => item.attempts < config.maxRetries);
  saveQueue(filtered);
  
  updateSyncStatus({
    failedCount: 0,
    pendingCount: filtered.length
  });
  
  console.log("[SovereignLink] Cleared failed items from queue");
}
