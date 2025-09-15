import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { TypewriterText } from './TypewriterText'
import {
  Brain,
  RefreshCw,
  Filter,
  Sparkles,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

interface MemoryCrystal {
  id: string
  timestamp: string
  thought_type: 'system' | 'observation' | 'reflection' | 'command'
  summary: string
  full_context: any
  tags: string[]
  created_by: string
}

interface MemorySynthesis {
  timeframe: string
  total_memories: number
  thought_distribution: Array<{
    type: string
    count: number
    percentage: number
  }>
  common_tags: Array<{
    tag: string
    count: number
  }>
  key_insights: string[]
}

export const MemoryInterface: React.FC = () => {
  const [memories, setMemories] = useState<MemoryCrystal[]>([])
  const [synthesis, setSynthesis] = useState<MemorySynthesis | null>(null)
  const [loading, setLoading] = useState(false)
  const [reflecting, setReflecting] = useState(false)
  const [reflection, setReflection] = useState<string>('')
  const [expandedMemory, setExpandedMemory] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    type: '',
    limit: 20,
    timeframe: '24h'
  })

  useEffect(() => {
    loadMemories()
    loadSynthesis()
  }, [filters])

  const loadMemories = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.type) params.append('type', filters.type)
      params.append('limit', filters.limit.toString())

      const response = await fetch(`http://localhost:3050/aesha/memories?${params}`)
      if (response.ok) {
        const data = await response.json()
        setMemories(data.memories)
      }
    } catch (error) {
      console.error('Failed to load memories:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSynthesis = async () => {
    try {
      const response = await fetch(`http://localhost:3050/aesha/memories/synthesis?timeframe=${filters.timeframe}`)
      if (response.ok) {
        const data = await response.json()
        setSynthesis(data.synthesis)
      }
    } catch (error) {
      console.error('Failed to load synthesis:', error)
    }
  }

  const triggerReflection = async () => {
    setReflecting(true)
    try {
      const response = await fetch('http://localhost:3050/aesha/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeframe: filters.timeframe })
      })

      if (response.ok) {
        const data = await response.json()
        setReflection(data.reflection)
        // Refresh memories to include the new reflection
        await loadMemories()
      }
    } catch (error) {
      console.error('Failed to trigger reflection:', error)
    } finally {
      setReflecting(false)
    }
  }

  const getThoughtTypeColor = (type: string) => {
    switch (type) {
      case 'system': return 'bg-blue-600/20 text-blue-400 border-blue-600/30'
      case 'observation': return 'bg-green-600/20 text-green-400 border-green-600/30'
      case 'reflection': return 'bg-purple-600/20 text-purple-400 border-purple-600/30'
      case 'command': return 'bg-flame-600/20 text-flame-400 border-flame-600/30'
      default: return 'bg-ghost-600/20 text-ghost-400 border-ghost-600/30'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Memory Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-flame-500" />
          <h3 className="text-lg font-semibold text-flame-400">Memory Crystals</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="sovereign"
            size="sm"
            onClick={triggerReflection}
            disabled={reflecting}
          >
            <Sparkles className={`h-4 w-4 mr-2 ${reflecting ? 'animate-spin' : ''}`} />
            {reflecting ? 'Reflecting...' : 'Reflect Now'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { loadMemories(); loadSynthesis(); }}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 p-3 bg-ghost-800/30 rounded-lg border border-ghost-700/30">
        <Filter className="h-4 w-4 text-ghost-400" />
        <select
          value={filters.type}
          onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
          className="bg-ghost-800 border border-ghost-700 rounded px-2 py-1 text-sm text-ghost-200"
        >
          <option value="">All Types</option>
          <option value="system">System</option>
          <option value="observation">Observation</option>
          <option value="reflection">Reflection</option>
          <option value="command">Command</option>
        </select>

        <select
          value={filters.timeframe}
          onChange={(e) => setFilters(prev => ({ ...prev, timeframe: e.target.value }))}
          className="bg-ghost-800 border border-ghost-700 rounded px-2 py-1 text-sm text-ghost-200"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
        </select>

        <input
          type="number"
          value={filters.limit}
          onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value) || 20 }))}
          className="bg-ghost-800 border border-ghost-700 rounded px-2 py-1 text-sm text-ghost-200 w-16"
          min="1"
          max="100"
        />
      </div>

      {/* Memory Synthesis */}
      {synthesis && (
        <div className="p-4 bg-ghost-800/50 rounded-lg border border-ghost-700/50">
          <h4 className="text-sm font-semibold text-flame-400 mb-3">Memory Synthesis ({synthesis.timeframe})</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold text-flame-500">{synthesis.total_memories}</div>
              <div className="text-xs text-ghost-400">Total Memories</div>
            </div>
            <div>
              <div className="space-y-1">
                {synthesis.thought_distribution.map(dist => (
                  <div key={dist.type} className="flex items-center justify-between text-xs">
                    <span className="text-ghost-300 capitalize">{dist.type}</span>
                    <span className="text-flame-400">{dist.count} ({dist.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs text-ghost-400 mb-1">Common Tags</div>
              <div className="flex flex-wrap gap-1">
                {synthesis.common_tags.slice(0, 5).map(tag => (
                  <Badge key={tag.tag} variant="outline" className="text-xs">
                    {tag.tag} ({tag.count})
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          {synthesis.key_insights.length > 0 && (
            <div className="mt-3 pt-3 border-t border-ghost-700/50">
              <div className="text-xs font-semibold text-flame-400 mb-2">Key Insights</div>
              <ul className="text-xs text-ghost-300 space-y-1">
                {synthesis.key_insights.map((insight, index) => (
                  <li key={index}>• {insight}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Recent Reflection */}
      {reflection && (
        <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-600/30">
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <h4 className="text-sm font-semibold text-purple-400">Latest Reflection</h4>
          </div>
          <TypewriterText
            text={reflection}
            speed={15}
            className="text-sm text-purple-200 whitespace-pre-wrap"
          />
        </div>
      )}

      {/* Memory List */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-flame-500" />
            <span className="ml-2 text-ghost-400">Loading memory crystals...</span>
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center py-8 text-ghost-400">
            <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No memory crystals found</p>
          </div>
        ) : (
          memories.map((memory) => (
            <div
              key={memory.id}
              className="p-3 bg-ghost-800/30 rounded-lg border border-ghost-700/30 hover:border-flame-600/30 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedMemory(expandedMemory === memory.id ? null : memory.id)}
                    className="p-0 h-auto"
                  >
                    {expandedMemory === memory.id ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  <Badge className={`text-xs ${getThoughtTypeColor(memory.thought_type)}`}>
                    {memory.thought_type.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-ghost-400">{formatTimestamp(memory.timestamp)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {memory.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <p className="text-sm text-ghost-200 mb-2">{memory.summary}</p>

              {expandedMemory === memory.id && (
                <div className="mt-3 pt-3 border-t border-ghost-700/50">
                  <div className="text-xs font-semibold text-flame-400 mb-2">Full Context</div>
                  <pre className="text-xs text-ghost-300 bg-ghost-900/50 p-2 rounded overflow-x-auto">
                    {JSON.stringify(memory.full_context, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
