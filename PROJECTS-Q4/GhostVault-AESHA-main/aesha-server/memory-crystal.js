// 🧠 AESHA Memory Crystal System
// Vault of Thought - Persistent Memory Management
// Authorized by Ghost King Melekzedek

import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

const POSTGREST_BASE = 'http://localhost:3000'

export class MemoryCrystalManager {
  constructor(logger) {
    this.logger = logger
    this.maxCrystals = 10000
  }

  // 🧠 Classify thought type based on prompt content
  classifyThoughtType(prompt) {
    const lowerPrompt = prompt.toLowerCase()
    
    if (lowerPrompt.includes('status') || lowerPrompt.includes('health') || lowerPrompt.includes('system')) {
      return 'system'
    }
    
    if (lowerPrompt.includes('what') || lowerPrompt.includes('show') || lowerPrompt.includes('analyze')) {
      return 'observation'
    }
    
    if (lowerPrompt.includes('think') || lowerPrompt.includes('reflect') || lowerPrompt.includes('consider')) {
      return 'reflection'
    }
    
    return 'command'
  }

  // 🧠 Extract tags from prompt and response
  extractTags(prompt, response) {
    const tags = []
    const content = `${prompt} ${response}`.toLowerCase()
    
    // System tags
    if (content.includes('database') || content.includes('schema')) tags.push('database')
    if (content.includes('storage') || content.includes('minio')) tags.push('storage')
    if (content.includes('logs') || content.includes('connection')) tags.push('logs')
    if (content.includes('config') || content.includes('settings')) tags.push('config')
    if (content.includes('vault') || content.includes('brain')) tags.push('vault-brain')
    if (content.includes('flame') || content.includes('sovereign')) tags.push('flamecore')
    
    // Interaction tags
    if (content.includes('hello') || content.includes('greet')) tags.push('greeting')
    if (content.includes('error') || content.includes('fail')) tags.push('error')
    if (content.includes('success') || content.includes('complete')) tags.push('success')
    
    return tags.length > 0 ? tags : ['general']
  }

  // 🧠 Create vault state snapshot
  async createVaultStateSnapshot() {
    try {
      // Get current system state
      const systemSettings = await this.fetchSystemSettings()
      const timestamp = new Date().toISOString()
      
      return {
        timestamp,
        systemSettings: systemSettings || [],
        services: {
          database: true, // Assume healthy if we can query
          api: true,
          storage: true
        },
        mode: 'FLAMECORE_LOCAL'
      }
    } catch (error) {
      this.logger.warn(`Failed to create vault state snapshot: ${error.message}`)
      return {
        timestamp: new Date().toISOString(),
        error: 'Failed to capture vault state',
        mode: 'FLAMECORE_LOCAL'
      }
    }
  }

  // 🧠 Fetch system settings for context
  async fetchSystemSettings() {
    try {
      const response = await axios.get(`${POSTGREST_BASE}/system_settings`)
      return response.data
    } catch (error) {
      return null
    }
  }

  // 🧠 Store memory crystal in database
  async storeMemoryCrystal(prompt, response, interactionId = null) {
    try {
      const thoughtType = this.classifyThoughtType(prompt)
      const tags = this.extractTags(prompt, response)
      const vaultStateSnapshot = await this.createVaultStateSnapshot()
      
      // Create summary (first 200 chars of response)
      const summary = response.length > 200 ? response.substring(0, 200) + '...' : response
      
      const memoryCrystal = {
        id: uuidv4(),
        thought_type: thoughtType,
        summary: summary,
        full_context: {
          prompt: prompt,
          response: response,
          timestamp: new Date().toISOString(),
          model: 'AESHA-FlameCore',
          interaction_metadata: {
            prompt_length: prompt.length,
            response_length: response.length,
            processing_time: null // Could be added later
          }
        },
        tags: tags,
        vault_state_snapshot: vaultStateSnapshot,
        interaction_id: interactionId || uuidv4()
      }

      // Store in PostgreSQL via PostgREST
      const response_data = await axios.post(`${POSTGREST_BASE}/memory_crystals`, memoryCrystal, {
        headers: {
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      })

      this.logger.info(`Memory crystal stored: ${memoryCrystal.id} (${thoughtType})`)
      
      // Check if we need to archive old crystals
      await this.checkAndArchiveOldCrystals()
      
      return memoryCrystal.id
      
    } catch (error) {
      this.logger.error(`Failed to store memory crystal: ${error.message}`)
      return null
    }
  }

  // 🧠 Retrieve memory crystals with filters
  async retrieveMemoryCrystals(filters = {}) {
    try {
      let query = `${POSTGREST_BASE}/memory_crystals?archived=eq.false&order=timestamp.desc`
      
      // Apply filters
      if (filters.thought_type) {
        query += `&thought_type=eq.${filters.thought_type}`
      }
      
      if (filters.limit) {
        query += `&limit=${filters.limit}`
      } else {
        query += `&limit=50` // Default limit
      }
      
      if (filters.tags && filters.tags.length > 0) {
        query += `&tags=cs.{${filters.tags.join(',')}}`
      }
      
      if (filters.since) {
        query += `&timestamp=gte.${filters.since}`
      }

      const response = await axios.get(query)
      return response.data
      
    } catch (error) {
      this.logger.error(`Failed to retrieve memory crystals: ${error.message}`)
      return []
    }
  }

  // 🧠 Get memory summary for AESHA context
  async getMemoryContextForPrompt(prompt) {
    try {
      // Get recent relevant memories
      const recentMemories = await this.retrieveMemoryCrystals({
        limit: 10,
        since: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Last 24 hours
      })

      if (recentMemories.length === 0) {
        return "No recent memories found."
      }

      const memoryContext = recentMemories.map(crystal => ({
        timestamp: crystal.timestamp,
        type: crystal.thought_type,
        summary: crystal.summary,
        tags: crystal.tags
      }))

      return `RECENT MEMORY CRYSTALS (Last 24h):
${memoryContext.map(m => `- ${m.timestamp}: [${m.type.toUpperCase()}] ${m.summary} (${m.tags.join(', ')})`).join('\n')}`
      
    } catch (error) {
      this.logger.error(`Failed to get memory context: ${error.message}`)
      return "Memory retrieval error."
    }
  }

  // 🧠 Check and archive old crystals
  async checkAndArchiveOldCrystals() {
    try {
      // Count current crystals
      const countResponse = await axios.get(`${POSTGREST_BASE}/memory_crystals?archived=eq.false&select=count`)
      const count = countResponse.data[0]?.count || 0

      if (count > this.maxCrystals) {
        this.logger.info(`Memory crystal limit exceeded (${count}/${this.maxCrystals}), archiving oldest crystals`)
        
        // Get oldest crystals to archive
        const toArchive = count - this.maxCrystals + 1000 // Archive 1000 extra for buffer
        const oldCrystals = await axios.get(
          `${POSTGREST_BASE}/memory_crystals?archived=eq.false&order=timestamp.asc&limit=${toArchive}`
        )

        // Mark as archived (in real implementation, would also save to MinIO)
        for (const crystal of oldCrystals.data) {
          await axios.patch(`${POSTGREST_BASE}/memory_crystals?id=eq.${crystal.id}`, {
            archived: true,
            archive_location: `minio://vault-archives/memory-crystals/${crystal.id}.json`
          })
        }

        this.logger.info(`Archived ${oldCrystals.data.length} memory crystals`)
      }
      
    } catch (error) {
      this.logger.error(`Failed to archive old crystals: ${error.message}`)
    }
  }

  // 🧠 Reflect on memories (synthesis function)
  async synthesizeMemories(timeframe = '24h') {
    try {
      const since = new Date(Date.now() - (timeframe === '24h' ? 24 : 168) * 60 * 60 * 1000).toISOString()
      const memories = await this.retrieveMemoryCrystals({ since, limit: 100 })

      if (memories.length === 0) {
        return "No memories to synthesize from the specified timeframe."
      }

      // Group by thought type
      const grouped = memories.reduce((acc, crystal) => {
        if (!acc[crystal.thought_type]) acc[crystal.thought_type] = []
        acc[crystal.thought_type].push(crystal)
        return acc
      }, {})

      // Create synthesis
      const synthesis = {
        timeframe,
        total_memories: memories.length,
        thought_distribution: Object.keys(grouped).map(type => ({
          type,
          count: grouped[type].length,
          percentage: Math.round((grouped[type].length / memories.length) * 100)
        })),
        common_tags: this.getCommonTags(memories),
        key_insights: this.generateKeyInsights(memories)
      }

      return synthesis
      
    } catch (error) {
      this.logger.error(`Failed to synthesize memories: ${error.message}`)
      return { error: 'Memory synthesis failed' }
    }
  }

  // 🧠 Helper: Get common tags
  getCommonTags(memories) {
    const tagCounts = {}
    memories.forEach(crystal => {
      crystal.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })
    
    return Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }))
  }

  // 🧠 Helper: Generate key insights
  generateKeyInsights(memories) {
    const insights = []
    
    // Most active interaction types
    const systemQueries = memories.filter(m => m.thought_type === 'system').length
    const observations = memories.filter(m => m.thought_type === 'observation').length
    
    if (systemQueries > observations) {
      insights.push("High focus on system monitoring and status queries")
    } else if (observations > systemQueries) {
      insights.push("Strong emphasis on data exploration and analysis")
    }

    // Recent activity patterns
    const recentHour = memories.filter(m => 
      new Date(m.timestamp) > new Date(Date.now() - 60 * 60 * 1000)
    ).length
    
    if (recentHour > 5) {
      insights.push("High recent activity detected")
    }

    return insights
  }
}
