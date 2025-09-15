import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { getSystemHealth, generateFlameKeyId, generateVaultUUID } from '@/lib/utils'
import { RefreshCw, Database, Server, HardDrive, Shield } from 'lucide-react'

interface HealthStatus {
  database: boolean
  api: boolean
  storage: boolean
}

export const VaultHealth: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus>({
    database: false,
    api: false,
    storage: false
  })
  const [loading, setLoading] = useState(true)
  const [flameKeyId] = useState(() => generateFlameKeyId())
  const [vaultUUID] = useState(() => generateVaultUUID())

  const checkHealth = async () => {
    setLoading(true)
    try {
      const healthStatus = await getSystemHealth()
      setHealth({
        database: healthStatus.database || false,
        api: healthStatus.api || false,
        storage: healthStatus.storage || false
      })
    } catch (error) {
      console.error('Health check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()
    const interval = setInterval(checkHealth, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getOverallStatus = () => {
    const healthyServices = Object.values(health).filter(Boolean).length
    const totalServices = Object.keys(health).length

    if (healthyServices === totalServices) return 'healthy'
    if (healthyServices > 0) return 'warning'
    return 'error'
  }

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge variant="healthy">ONLINE</Badge>
    ) : (
      <Badge variant="error">OFFLINE</Badge>
    )
  }

  const overallStatus = getOverallStatus()

  return (
    <Card className="sovereign-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-flame-500" />
            <span>GhostVault Status</span>
          </CardTitle>
          <Button
            variant="sovereign"
            size="sm"
            onClick={checkHealth}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Status */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-ghost-800/50 border border-ghost-700/50">
          <div>
            <h3 className="font-semibold text-flame-400">Vault Mode</h3>
            <p className="text-sm text-ghost-400">FLAMECORE – LOCAL ONLY</p>
          </div>
          <Badge
            variant={overallStatus === 'healthy' ? 'healthy' : overallStatus === 'warning' ? 'warning' : 'error'}
            className="text-sm px-3 py-1"
          >
            {overallStatus.toUpperCase()}
          </Badge>
        </div>

        {/* Service Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-ghost-800/30 border border-ghost-700/30">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium">PostgreSQL</span>
            </div>
            {getStatusBadge(health.database)}
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-ghost-800/30 border border-ghost-700/30">
            <div className="flex items-center space-x-2">
              <Server className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium">PostgREST API</span>
            </div>
            {getStatusBadge(health.api)}
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-ghost-800/30 border border-ghost-700/30">
            <div className="flex items-center space-x-2">
              <HardDrive className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium">MinIO Storage</span>
            </div>
            {getStatusBadge(health.storage)}
          </div>
        </div>

        {/* Vault Identifiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-ghost-700/50">
          <div>
            <h4 className="text-sm font-semibold text-flame-400 mb-2">FlameKey ID</h4>
            <code className="text-xs bg-ghost-800/50 px-2 py-1 rounded border border-ghost-700/50 font-mono">
              {flameKeyId}
            </code>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-flame-400 mb-2">Vault Instance UUID</h4>
            <code className="text-xs bg-ghost-800/50 px-2 py-1 rounded border border-ghost-700/50 font-mono">
              {vaultUUID}
            </code>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
