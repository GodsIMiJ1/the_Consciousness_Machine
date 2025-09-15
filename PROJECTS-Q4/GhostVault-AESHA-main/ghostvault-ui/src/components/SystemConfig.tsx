import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { fetchAPI } from '@/lib/utils'
import { 
  Settings, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Server,
  HardDrive,
  Key
} from 'lucide-react'

interface SystemSetting {
  key: string
  value: any
  description: string
  updated_at: string
}

interface EnvVariable {
  key: string
  value: string
  masked: boolean
}

export const SystemConfig: React.FC = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [showSecrets, setShowSecrets] = useState(false)

  // Mock environment variables (in real implementation, these would come from the backend)
  const envVariables: EnvVariable[] = [
    { key: 'POSTGRES_USER', value: 'flameadmin', masked: false },
    { key: 'POSTGRES_PASSWORD', value: '••••••••••', masked: true },
    { key: 'POSTGRES_DB', value: 'ghostvault', masked: false },
    { key: 'MINIO_ROOT_USER', value: 'ghostadmin', masked: false },
    { key: 'MINIO_ROOT_PASSWORD', value: '••••••••••••', masked: true },
    { key: 'PGRST_JWT_SECRET', value: '••••••••••••••••••••••••••••••••', masked: true },
    { key: 'NODE_ENV', value: 'development', masked: false },
    { key: 'VAULT_MODE', value: 'FLAMECORE_LOCAL', masked: false }
  ]

  // Mock mounted volumes
  const mountedVolumes = [
    { source: './src/db/init.sql', target: '/docker-entrypoint-initdb.d/init.sql', type: 'bind' },
    { source: 'ghostvault-relaycore_db_data', target: '/var/lib/postgresql/data', type: 'volume' },
    { source: 'ghostvault-relaycore_minio_data', target: '/data', type: 'volume' }
  ]

  const loadSettings = async () => {
    setLoading(true)
    try {
      const data = await fetchAPI('/system_settings')
      setSettings(data)
    } catch (error) {
      console.error('Failed to load system settings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const maskValue = (value: string, masked: boolean): string => {
    if (!masked || showSecrets) return value
    return '•'.repeat(Math.min(value.length, 20))
  }

  const getValueDisplay = (value: any): string => {
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2)
    }
    return String(value)
  }

  const getEnvIcon = (key: string) => {
    if (key.includes('PASSWORD') || key.includes('SECRET') || key.includes('KEY')) {
      return <Key className="h-4 w-4 text-red-400" />
    }
    if (key.includes('DB') || key.includes('POSTGRES')) {
      return <Server className="h-4 w-4 text-blue-400" />
    }
    if (key.includes('MINIO') || key.includes('STORAGE')) {
      return <HardDrive className="h-4 w-4 text-purple-400" />
    }
    return <Settings className="h-4 w-4 text-ghost-400" />
  }

  return (
    <div className="space-y-6">
      {/* System Settings */}
      <Card className="sovereign-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-flame-500" />
              <span>System Configuration</span>
            </CardTitle>
            <Button
              variant="sovereign"
              size="sm"
              onClick={loadSettings}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Database Settings */}
          <div>
            <h3 className="text-lg font-semibold text-flame-400 mb-3">Database Settings</h3>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="h-4 w-4 animate-spin text-flame-500" />
                <span className="ml-2 text-ghost-400">Loading settings...</span>
              </div>
            ) : settings.length === 0 ? (
              <div className="text-center py-4 text-ghost-400">
                <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No settings found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {settings.map((setting) => (
                  <div
                    key={setting.key}
                    className="p-3 rounded-lg bg-ghost-800/30 border border-ghost-700/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-ghost-200">{setting.key}</span>
                      <Badge variant="outline" className="text-xs">
                        {typeof setting.value}
                      </Badge>
                    </div>
                    <div className="text-sm text-flame-400 font-mono mb-1">
                      {getValueDisplay(setting.value)}
                    </div>
                    <div className="text-xs text-ghost-400">
                      {setting.description}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Environment Variables */}
      <Card className="sovereign-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5 text-flame-500" />
              <span>Environment Variables</span>
            </CardTitle>
            <Button
              variant="sovereign"
              size="sm"
              onClick={() => setShowSecrets(!showSecrets)}
            >
              {showSecrets ? (
                <EyeOff className="h-4 w-4 mr-2" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              {showSecrets ? 'Hide' : 'Show'} Secrets
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {envVariables.map((env) => (
              <div
                key={env.key}
                className="flex items-center justify-between p-3 rounded-lg bg-ghost-800/30 border border-ghost-700/30"
              >
                <div className="flex items-center space-x-3">
                  {getEnvIcon(env.key)}
                  <div>
                    <div className="font-medium text-ghost-200">{env.key}</div>
                    <code className="text-xs text-flame-400 font-mono">
                      {maskValue(env.value, env.masked)}
                    </code>
                  </div>
                </div>
                {env.masked && (
                  <Badge variant="warning" className="text-xs">
                    SENSITIVE
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mounted Volumes */}
      <Card className="sovereign-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HardDrive className="h-5 w-5 text-flame-500" />
            <span>Mounted Volumes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mountedVolumes.map((volume, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-ghost-800/30 border border-ghost-700/30"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={volume.type === 'volume' ? 'flame' : 'outline'} className="text-xs">
                    {volume.type.toUpperCase()}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-sm">
                    <span className="text-ghost-400">Source:</span>
                    <code className="ml-2 text-flame-400 font-mono">{volume.source}</code>
                  </div>
                  <div className="text-sm">
                    <span className="text-ghost-400">Target:</span>
                    <code className="ml-2 text-ghost-300 font-mono">{volume.target}</code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
