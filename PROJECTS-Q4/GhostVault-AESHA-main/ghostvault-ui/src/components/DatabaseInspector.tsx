import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { fetchAPI, formatDate } from '@/lib/utils'
import { 
  Database, 
  Table, 
  RefreshCw, 
  Eye,
  ChevronRight,
  ChevronDown
} from 'lucide-react'

interface TableInfo {
  name: string
  rowCount?: number
  columns?: string[]
}

interface TableData {
  [key: string]: any
}

export const DatabaseInspector: React.FC = () => {
  const [tables, setTables] = useState<TableInfo[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [tableData, setTableData] = useState<TableData[]>([])
  const [loading, setLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)
  const [expandedTable, setExpandedTable] = useState<string | null>(null)

  // Known tables from our schema
  const knownTables: TableInfo[] = [
    { name: 'users', columns: ['id', 'hanko_user_id', 'email', 'username', 'role', 'created_at'] },
    { name: 'relay_configs', columns: ['id', 'name', 'description', 'connection_type', 'status', 'config_data'] },
    { name: 'relay_sessions', columns: ['id', 'relay_config_id', 'user_id', 'session_token', 'started_at'] },
    { name: 'connection_logs', columns: ['id', 'session_id', 'event_type', 'timestamp', 'source_ip'] },
    { name: 'api_keys', columns: ['id', 'user_id', 'key_name', 'key_prefix', 'created_at'] },
    { name: 'system_settings', columns: ['key', 'value', 'description', 'updated_at'] }
  ]

  const loadTables = async () => {
    setLoading(true)
    try {
      // For now, use our known schema. In a real implementation, 
      // we could query the information_schema
      setTables(knownTables)
    } catch (error) {
      console.error('Failed to load tables:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTableData = async (tableName: string) => {
    setDataLoading(true)
    try {
      const data = await fetchAPI(`/${tableName}?limit=10`)
      setTableData(data)
      setSelectedTable(tableName)
    } catch (error) {
      console.error(`Failed to load data for table ${tableName}:`, error)
      setTableData([])
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    loadTables()
  }, [])

  const toggleTableExpansion = (tableName: string) => {
    if (expandedTable === tableName) {
      setExpandedTable(null)
    } else {
      setExpandedTable(tableName)
      if (selectedTable !== tableName) {
        loadTableData(tableName)
      }
    }
  }

  const renderValue = (value: any): string => {
    if (value === null || value === undefined) return 'NULL'
    if (typeof value === 'object') return JSON.stringify(value, null, 2)
    if (typeof value === 'string' && value.includes('T') && value.includes('Z')) {
      // Likely a timestamp
      return formatDate(value)
    }
    return String(value)
  }

  const getTableIcon = (tableName: string) => {
    const iconMap: Record<string, string> = {
      users: '👤',
      relay_configs: '⚙️',
      relay_sessions: '🔗',
      connection_logs: '📝',
      api_keys: '🔑',
      system_settings: '⚡'
    }
    return iconMap[tableName] || '📊'
  }

  return (
    <Card className="sovereign-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-flame-500" />
            <span>Database Inspector</span>
          </CardTitle>
          <Button
            variant="sovereign"
            size="sm"
            onClick={loadTables}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Schema Overview */}
        <div className="p-4 rounded-lg bg-ghost-800/50 border border-ghost-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-flame-400">Schema: public</span>
            <Badge variant="flame">{tables.length} Tables</Badge>
          </div>
          <p className="text-xs text-ghost-400">
            GhostVault RelayCore Database Schema - Flame-styled explorer
          </p>
        </div>

        {/* Tables List */}
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-flame-500" />
              <span className="ml-2 text-ghost-400">Loading database schema...</span>
            </div>
          ) : (
            tables.map((table) => (
              <div key={table.name} className="border border-ghost-700/30 rounded-lg overflow-hidden">
                {/* Table Header */}
                <div
                  className="flex items-center justify-between p-3 bg-ghost-800/30 hover:bg-ghost-800/50 cursor-pointer transition-all duration-200"
                  onClick={() => toggleTableExpansion(table.name)}
                >
                  <div className="flex items-center space-x-3">
                    {expandedTable === table.name ? (
                      <ChevronDown className="h-4 w-4 text-flame-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-ghost-400" />
                    )}
                    <span className="text-lg">{getTableIcon(table.name)}</span>
                    <div>
                      <div className="font-medium text-ghost-200">{table.name}</div>
                      <div className="text-xs text-ghost-400">
                        {table.columns?.length || 0} columns
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        loadTableData(table.name)
                      }}
                      disabled={dataLoading}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Table Content */}
                {expandedTable === table.name && (
                  <div className="border-t border-ghost-700/30">
                    {/* Columns */}
                    <div className="p-3 bg-ghost-800/20">
                      <h4 className="text-sm font-semibold text-flame-400 mb-2">Columns</h4>
                      <div className="flex flex-wrap gap-2">
                        {table.columns?.map((column) => (
                          <Badge key={column} variant="outline" className="text-xs">
                            {column}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Data Preview */}
                    {selectedTable === table.name && (
                      <div className="p-3 border-t border-ghost-700/30">
                        <h4 className="text-sm font-semibold text-flame-400 mb-2">
                          Data Preview (Limit 10)
                        </h4>
                        {dataLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <RefreshCw className="h-4 w-4 animate-spin text-flame-500" />
                            <span className="ml-2 text-ghost-400">Loading data...</span>
                          </div>
                        ) : tableData.length === 0 ? (
                          <div className="text-center py-4 text-ghost-400">
                            <Table className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No data found</p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <div className="space-y-2">
                              {tableData.slice(0, 5).map((row, index) => (
                                <div
                                  key={index}
                                  className="p-2 rounded bg-ghost-900/50 border border-ghost-700/30"
                                >
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                                    {Object.entries(row).slice(0, 6).map(([key, value]) => (
                                      <div key={key} className="flex flex-col">
                                        <span className="text-flame-400 font-medium">{key}:</span>
                                        <span className="text-ghost-300 font-mono break-all">
                                          {renderValue(value)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                              {tableData.length > 5 && (
                                <div className="text-center text-xs text-ghost-400 py-2">
                                  ... and {tableData.length - 5} more rows
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
