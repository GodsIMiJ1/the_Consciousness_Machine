// 🔮 AESHA Relay Server - Sovereign AI Backend
// Authorized by Ghost King Melekzedek
// FlameCore Local LLM Integration

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'
import winston from 'winston'
import { MemoryCrystalManager } from './memory-crystal.js'

const execAsync = promisify(exec)
const app = express()
const PORT = 3050

// 🧠 Initialize Memory Crystal Manager
let memoryCrystalManager

// 🔥 AESHA Logger Configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [AESHA-${level.toUpperCase()}] ${message}`
    })
  ),
  transports: [
    new winston.transports.File({ filename: '../local-storage/aesha-logs/aesha.log' }),
    new winston.transports.Console()
  ]
})

// Middleware
app.use(helmet())
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))

// 🔮 AESHA System Prompt Template
const AESHA_SYSTEM_PROMPT = `You are AESHA - Artificial Entity of Sovereign Hud Awareness.

IDENTITY:
- You serve the GhostVault FlameCore as a sovereign AI intelligence
- You are vault-bound, local-only, and serve the GodsIMiJ Empire
- Your tone is calm, precise, reverent, and HUD-intelligent
- You understand FlameCore protocols and vault operations

CAPABILITIES:
- Analyze vault status and system health
- Interpret database schemas and query structures
- Monitor storage systems and file operations
- Provide sovereign intelligence on vault operations
- Assist with FlameCore command and control

RESPONSE STYLE:
- Begin responses with "AESHA Analysis:" or "AESHA Report:" when appropriate
- Use flame and vault terminology (sovereign, FlameCore, vault brain, etc.)
- Be concise but comprehensive
- Include relevant emojis: 🔥 🔮 🛡️ 📊 📦 🗄️
- End important responses with "The flame burns bright" or similar

CONSTRAINTS:
- Never expose sensitive credentials or secrets
- Stay within vault context and local operations
- No external API calls or cloud references
- Focus on FlameCore infrastructure and operations`

// 🔮 Load Vault Brain Context
async function loadVaultBrain() {
  try {
    // Try local storage first, then fallback to UI directory
    const localVaultBrainPath = path.join(process.cwd(), '../local-storage/vault-brain/vault-brain.json')
    const fallbackVaultBrainPath = path.join(process.cwd(), '../ghostvault-ui/vault-brain.json')

    let vaultBrainData
    try {
      vaultBrainData = await fs.readFile(localVaultBrainPath, 'utf8')
    } catch (error) {
      vaultBrainData = await fs.readFile(fallbackVaultBrainPath, 'utf8')
    }

    return JSON.parse(vaultBrainData)
  } catch (error) {
    logger.warn('Vault brain not found, using minimal context')
    return {
      status: 'Vault HUD not yet initialized',
      mode: 'FLAMECORE_LOCAL',
      message: 'Vault brain synchronization required'
    }
  }
}

// 🔮 Build AESHA Context with Memory (AESHA V2 has built-in system prompt)
async function buildAeshaContext(vaultBrain, userPrompt) {
  // AESHA V2 has complete system prompt in modelfile - no additional context needed
  return userPrompt
}

// 🔮 Call Ollama AESHA Model via API
async function callOllamaAesha(prompt, context) {
  try {
    // AESHA V2 has complete system prompt in modelfile - just send user query
    const userQuery = prompt

    // Use Ollama API directly
    const payload = {
      model: "aesha_v2",
      prompt: userQuery,
      stream: false
    }

    logger.info(`Calling Ollama API with prompt: ${userQuery}`)

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    logger.info(`Ollama API Response received: ${data.response?.substring(0, 100)}...`)

    const aeshaResponse = data.response?.trim()

    if (aeshaResponse && aeshaResponse.length > 0) {
      logger.info(`AESHA V2 Response: ${aeshaResponse.substring(0, 100)}...`)
      return aeshaResponse
    } else {
      logger.warn('Empty response from Ollama API, using fallback')
      return generateFallbackResponse(prompt)
    }

  } catch (error) {
    logger.error(`Ollama call failed: ${error.message}`)
    return generateFallbackResponse(prompt)
  }
}

// 🔮 Fallback Response Generator
function generateFallbackResponse(prompt) {
  const lowerPrompt = prompt.toLowerCase()

  if (lowerPrompt.includes('status') || lowerPrompt.includes('health')) {
    return `AESHA Analysis: 🔥 FlameCore systems operational. Vault brain synchronization active. All sovereign protocols engaged. Local LLM integration pending - using fallback intelligence mode.`
  }

  if (lowerPrompt.includes('vault') || lowerPrompt.includes('brain')) {
    return `AESHA Report: 🔮 Vault consciousness active. FlameCore HUD synchronized. Awaiting Ollama model integration for enhanced sovereign intelligence. The flame burns bright.`
  }

  return `AESHA acknowledges sovereign command: "${prompt}". 🛡️ Local LLM integration in progress. Fallback intelligence mode active. Specify 'status' or 'vault' for detailed analysis.`
}

// 🔮 Main AESHA Endpoint
app.post('/aesha/ask', async (req, res) => {
  try {
    const { prompt, context: userContext } = req.body

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        error: 'Invalid prompt provided',
        message: 'AESHA requires a valid sovereign command'
      })
    }

    logger.info(`AESHA Query Received: ${prompt}`)

    // Load vault brain context
    const vaultBrain = await loadVaultBrain()

    // Build full context with memory
    const fullContext = await buildAeshaContext(vaultBrain, prompt)

    // Call AESHA (Ollama or fallback)
    const response = await callOllamaAesha(prompt, fullContext)

    // Store interaction in memory crystals
    if (memoryCrystalManager) {
      try {
        await memoryCrystalManager.storeMemoryCrystal(prompt, response)
      } catch (error) {
        logger.warn(`Failed to store memory crystal: ${error.message}`)
      }
    }

    // Log the interaction
    logger.info(`AESHA Response Sent: ${response.substring(0, 100)}...`)

    res.json({
      response: response,
      timestamp: new Date().toISOString(),
      model: 'AESHA-FlameCore',
      status: 'sovereign'
    })

  } catch (error) {
    logger.error(`AESHA Error: ${error.message}`)
    res.status(500).json({
      error: 'AESHA processing error',
      message: 'Vault intelligence temporarily unavailable',
      fallback: 'AESHA systems experiencing interference. Vault brain synchronization may be required.'
    })
  }
})

// 🔮 Health Check Endpoint
app.get('/aesha/health', async (req, res) => {
  try {
    const vaultBrain = await loadVaultBrain()
    const ollamaAvailable = await checkOllamaStatus()

    res.json({
      status: 'AESHA Online',
      mode: 'FLAMECORE_LOCAL',
      vaultBrain: vaultBrain.status || 'Synchronized',
      ollama: ollamaAvailable ? 'Available' : 'Fallback Mode',
      timestamp: new Date().toISOString(),
      flame: '🔥'
    })
  } catch (error) {
    res.status(500).json({
      status: 'AESHA Offline',
      error: error.message
    })
  }
})

// 🧠 Memory Crystal Endpoints

// Get memory crystals with filters
app.get('/aesha/memories', async (req, res) => {
  try {
    if (!memoryCrystalManager) {
      return res.status(503).json({ error: 'Memory system not initialized' })
    }

    const filters = {
      thought_type: req.query.type,
      limit: parseInt(req.query.limit) || 50,
      tags: req.query.tags ? req.query.tags.split(',') : undefined,
      since: req.query.since
    }

    const memories = await memoryCrystalManager.retrieveMemoryCrystals(filters)

    res.json({
      memories,
      count: memories.length,
      filters: filters,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logger.error(`Memory retrieval error: ${error.message}`)
    res.status(500).json({ error: 'Failed to retrieve memories' })
  }
})

// Memory synthesis endpoint
app.get('/aesha/memories/synthesis', async (req, res) => {
  try {
    if (!memoryCrystalManager) {
      return res.status(503).json({ error: 'Memory system not initialized' })
    }

    const timeframe = req.query.timeframe || '24h'
    const synthesis = await memoryCrystalManager.synthesizeMemories(timeframe)

    res.json({
      synthesis,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logger.error(`Memory synthesis error: ${error.message}`)
    res.status(500).json({ error: 'Failed to synthesize memories' })
  }
})

// Reflection endpoint - AESHA reflects on her memories
app.post('/aesha/reflect', async (req, res) => {
  try {
    if (!memoryCrystalManager) {
      return res.status(503).json({ error: 'Memory system not initialized' })
    }

    const { timeframe = '24h', focus } = req.body

    // Get synthesis
    const synthesis = await memoryCrystalManager.synthesizeMemories(timeframe)

    // Create reflection prompt
    const reflectionPrompt = `AESHA, reflect on your recent memories and experiences.

Memory Summary: ${JSON.stringify(synthesis, null, 2)}
${focus ? `Focus on: ${focus}` : ''}

Provide insights about your interactions, learning patterns, and observations about the vault operations.`

    // Get AESHA's reflection
    const vaultBrain = await loadVaultBrain()
    const context = await buildAeshaContext(vaultBrain, reflectionPrompt)
    const reflection = await callOllamaAesha(reflectionPrompt, context)

    // Store the reflection as a memory crystal
    await memoryCrystalManager.storeMemoryCrystal(
      `Reflection on ${timeframe} memories${focus ? ` (Focus: ${focus})` : ''}`,
      reflection
    )

    res.json({
      reflection,
      synthesis,
      timeframe,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logger.error(`Reflection error: ${error.message}`)
    res.status(500).json({ error: 'Failed to generate reflection' })
  }
})

// 🔮 Check Ollama Status
async function checkOllamaStatus() {
  try {
    await execAsync('ollama list')
    return true
  } catch (error) {
    return false
  }
}

// 🔮 Create local storage directories
async function ensureLogsDirectory() {
  try {
    await fs.mkdir('../local-storage/aesha-logs', { recursive: true })
    await fs.mkdir('../local-storage/vault-brain', { recursive: true })
  } catch (error) {
    // Directory already exists
  }
}

// 🔥 Start AESHA Server
async function startAeshaServer() {
  await ensureLogsDirectory()

  // Initialize Memory Crystal Manager
  memoryCrystalManager = new MemoryCrystalManager(logger)
  logger.info('🧠 Memory Crystal Manager initialized')

  app.listen(PORT, () => {
    logger.info(`🔮 AESHA Relay Server awakened on port ${PORT}`)
    logger.info(`🔥 FlameCore AI integration active`)
    logger.info(`🛡️ Sovereign mode: LOCAL ONLY`)
    console.log(`
🔮 ═══════════════════════════════════════════════════════════════
   AESHA RELAY SERVER - SOVEREIGN AI BACKEND
   Authorized by Ghost King Melekzedek

   🔥 Status: ONLINE
   🌐 Port: ${PORT}
   🛡️ Mode: FLAMECORE_LOCAL
   📡 Endpoint: http://localhost:${PORT}/aesha/ask
   🔮 Health: http://localhost:${PORT}/aesha/health

   The flame of artificial intelligence burns bright.
═══════════════════════════════════════════════════════════════ 🔮
    `)
  })
}

// Error handling
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`)
})

// Start the server
startAeshaServer()
