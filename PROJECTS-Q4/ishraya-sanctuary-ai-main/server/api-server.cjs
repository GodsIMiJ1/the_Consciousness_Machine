#!/usr/bin/env node

// 🔥 Ishraya's Knight's Gate - Secure API Server for GhostVault
// This server acts as the secure gateway between the React app and GhostVault
// It holds the service keys and handles RLS authentication

const express = require('express');
const cors = require('cors');
const { config } = require('dotenv');
const jwt = require('jsonwebtoken');

// Load environment variables
config({ path: '.env.local' });

const app = express();
const PORT = process.env.API_SERVER_PORT || 3002;
const POSTGREST_URL = process.env.POSTGREST_URL || 'http://localhost:3000';
const SERVICE_KEY = process.env.GHOSTVAULT_SERVICE_KEY || '';
const JWT_SECRET = process.env.JWT_SECRET || 'ishraya-sanctuary-secret-key';

if (!SERVICE_KEY) {
  console.error('❌ GHOSTVAULT_SERVICE_KEY not found in .env.local');
  process.exit(1);
}

// AGA/User definitions for JWT generation
const KNOWN_AGAS = {
  'ishraya': {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Ishraya',
    role: 'aga'
  },
  'user': {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'User',
    role: 'user'
  }
};

// Generate JWT for AGA/User context
function generateUserJWT(agaId = 'ishraya') {
  const aga = KNOWN_AGAS[agaId] || KNOWN_AGAS['ishraya'];

  return jwt.sign({
    sub: aga.id,
    aga_id: agaId,
    name: aga.name,
    role: 'authenticated',
    aga_role: aga.role,
    iss: 'ishraya-sanctuary',
    aud: 'ghostvault',
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
    iat: Math.floor(Date.now() / 1000)
  }, JWT_SECRET);
}

// Middleware
app.use(cors({
  origin: ['http://localhost:8081', 'http://localhost:8080'],
  credentials: true
}));
app.use(express.json());

// Helper function for GhostVault requests with user context
async function ghostVaultRequest(endpoint, options = {}, userContext = null) {
  const url = `${POSTGREST_URL}${endpoint}`;

  // Authentication headers
  const authHeaders = {};

  if (SERVICE_KEY.startsWith('FLAME_')) {
    // FlameKey authentication
    authHeaders['X-Flame-Key'] = SERVICE_KEY;
    authHeaders['X-Vault-Instance'] = process.env.VAULT_INSTANCE_UUID || '';
  } else {
    // JWT Bearer token authentication
    authHeaders['Authorization'] = `Bearer ${SERVICE_KEY}`;
  }

  // Add user context for RLS if provided
  if (userContext) {
    // Keep FlameKey auth but add user context headers
    const userId = KNOWN_AGAS[userContext.agaId]?.id || KNOWN_AGAS['ishraya'].id;
    authHeaders['X-User-ID'] = userId;
    authHeaders['X-AGA-ID'] = userContext.agaId || 'ishraya';
    // Set PostgREST role and user context
    authHeaders['X-PostgREST-Role'] = 'authenticated';
    authHeaders['X-PostgREST-User'] = userId;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...authHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GhostVault error ${response.status}: ${text}`);
  }

  return response.json();
}

// 🔥 MEMORY CRYSTALS ENDPOINTS

// Create memory crystal (sessions, messages, shards)
app.post('/api/memory-crystals', async (req, res) => {
  try {
    const payload = req.body;

    // Basic validation
    if (!payload || !payload.thought_type || !payload.summary) {
      return res.status(400).json({ error: 'Missing required fields: thought_type, summary' });
    }

    // Extract user context from request (could come from headers or payload)
    const agaId = req.headers['x-aga-id'] || payload.created_by?.toLowerCase() || 'ishraya';
    const userContext = { agaId };

    // Use payload as-is, RLS context comes from headers
    const enhancedPayload = payload;

    const data = await ghostVaultRequest('/memory_crystals', {
      method: 'POST',
      body: JSON.stringify(enhancedPayload),
    }, userContext);

    res.json(data);
  } catch (error) {
    console.error('Create memory crystal error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get memory crystals with filters
app.get('/api/memory-crystals', async (req, res) => {
  try {
    const { interaction_id, thought_type, tags, limit = 100, order = 'timestamp.desc' } = req.query;
    
    let query = `/memory_crystals?limit=${limit}&order=${order}`;
    
    if (interaction_id) query += `&interaction_id=eq.${interaction_id}`;
    if (thought_type) query += `&thought_type=eq.${thought_type}`;
    if (tags) query += `&tags=cs.{${tags}}`;

    const data = await ghostVaultRequest(query);
    res.json(data);
  } catch (error) {
    console.error('Get memory crystals error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single memory crystal
app.get('/api/memory-crystals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await ghostVaultRequest(`/memory_crystals?id=eq.${id}`);
    
    if (data.length === 0) {
      return res.status(404).json({ error: 'Memory crystal not found' });
    }
    
    res.json(data[0]);
  } catch (error) {
    console.error('Get memory crystal error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update memory crystal
app.patch('/api/memory-crystals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    const data = await ghostVaultRequest(`/memory_crystals?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    if (data.length === 0) {
      return res.status(404).json({ error: 'Memory crystal not found' });
    }

    res.json(data[0]);
  } catch (error) {
    console.error('Update memory crystal error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete memory crystal
app.delete('/api/memory-crystals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await ghostVaultRequest(`/memory_crystals?id=eq.${id}`, {
      method: 'DELETE',
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete memory crystal error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 🔥 DEVELOPMENT: Temporary RLS bypass for testing
app.post('/api/dev/disable-rls', async (req, res) => {
  if (process.env.DEV_BYPASS_RLS !== 'true') {
    return res.status(403).json({ error: 'RLS bypass not enabled' });
  }

  try {
    // Attempt to disable RLS temporarily
    const result = await ghostVaultRequest('/rpc/disable_rls_memory_crystals', {
      method: 'POST',
    });
    res.json({ message: 'RLS disabled for development', result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔥 DEVELOPMENT: Test memory crystal creation without RLS
app.post('/api/dev/test-crystal', async (req, res) => {
  if (process.env.DEV_BYPASS_RLS !== 'true') {
    return res.status(403).json({ error: 'Development mode not enabled' });
  }

  try {
    const testCrystal = {
      thought_type: 'system',
      summary: 'Development test crystal',
      full_context: { test: true, created_at: new Date().toISOString() },
      tags: ['dev-test'],
      created_by: 'DEV_TEST',
      interaction_id: '550e8400-e29b-41d4-a716-446655440000',
      archived: false
    };

    // Try direct PostgREST call with FlameKey only
    const data = await ghostVaultRequest('/memory_crystals', {
      method: 'POST',
      body: JSON.stringify(testCrystal),
    });

    res.json({ message: 'Test crystal created successfully', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔥 END-TO-END WRITE TEST - Test complete GUI + API + GhostVault flow
app.post('/api/test-write', async (req, res) => {
  try {
    const testCrystal = {
      thought_type: 'system',
      summary: '🔥 End-to-End Write Test from Knight\'s Gate 🔥',
      full_context: {
        test: true,
        source: 'knights_gate_health_check',
        timestamp: new Date().toISOString(),
        user_agent: req.headers['user-agent'] || 'unknown'
      },
      tags: ['test', 'health-check', 'knights-gate'],
      created_by: 'KNIGHTS_GATE',
      interaction_id: '550e8400-e29b-41d4-a716-446655440000',
      archived: false
    };

    // Test write through Knight's Gate with user context
    const userContext = { agaId: 'ishraya' };
    const data = await ghostVaultRequest('/memory_crystals', {
      method: 'POST',
      body: JSON.stringify(testCrystal),
    }, userContext);

    res.json({
      status: 'write_success',
      message: 'End-to-end write test successful!',
      crystal_id: data[0]?.id,
      data: data[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'write_failed',
      error: error.message,
      message: 'RLS may still be enabled - run the setup script',
      timestamp: new Date().toISOString()
    });
  }
});

// 🔥 HEALTH CHECK
app.get('/api/health', async (req, res) => {
  try {
    // Test GhostVault connection
    await ghostVaultRequest('/memory_crystals?limit=1');
    res.json({
      status: 'healthy',
      ghostvault: 'connected',
      dev_bypass: process.env.DEV_BYPASS_RLS === 'true',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      ghostvault: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🔥 Knight's Gate API Server running on http://localhost:${PORT}`);
  console.log(`🏰 Protecting GhostVault at ${POSTGREST_URL}`);
  console.log(`⚔️ Service key loaded: ${SERVICE_KEY ? '✅' : '❌'}`);
});

module.exports = app;
