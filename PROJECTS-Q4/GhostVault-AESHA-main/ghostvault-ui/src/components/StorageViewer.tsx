import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { formatBytes, formatDate } from '@/lib/utils'
import {
  Folder,
  File,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  HardDrive
} from 'lucide-react'

interface StorageItem {
  name: string
  type: 'folder' | 'file'
  size?: number
  lastModified?: string
  etag?: string
}

export const StorageViewer: React.FC = () => {
  const [items, setItems] = useState<StorageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPath] = useState('/')
  const [storageUsed, setStorageUsed] = useState(0)
  const [uploading, setUploading] = useState(false)

  // Mock data for demonstration - in real implementation, this would connect to MinIO
  const mockItems: StorageItem[] = [
    {
      name: 'configs',
      type: 'folder',
      lastModified: new Date().toISOString()
    },
    {
      name: 'logs',
      type: 'folder',
      lastModified: new Date().toISOString()
    },
    {
      name: 'backups',
      type: 'folder',
      lastModified: new Date().toISOString()
    },
    {
      name: 'vault-config.json',
      type: 'file',
      size: 2048,
      lastModified: new Date().toISOString(),
      etag: 'abc123'
    },
    {
      name: 'system.log',
      type: 'file',
      size: 15360,
      lastModified: new Date().toISOString(),
      etag: 'def456'
    }
  ]

  const loadItems = async () => {
    setLoading(true)
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))
      setItems(mockItems)
      setStorageUsed(1024 * 1024 * 128) // 128MB mock usage
    } catch (error) {
      console.error('Failed to load storage items:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [currentPath])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      // Mock upload process
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Add uploaded files to the list
      const newItems = Array.from(files).map(file => ({
        name: file.name,
        type: 'file' as const,
        size: file.size,
        lastModified: new Date().toISOString(),
        etag: Math.random().toString(36).substr(2, 9)
      }))

      setItems(prev => [...prev, ...newItems])
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
      // Reset file input
      event.target.value = ''
    }
  }

  const handleDelete = async (itemName: string) => {
    try {
      setItems(prev => prev.filter(item => item.name !== itemName))
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const getItemIcon = (item: StorageItem) => {
    if (item.type === 'folder') {
      return <Folder className="h-4 w-4 text-blue-400" />
    }
    return <File className="h-4 w-4 text-ghost-400" />
  }

  const storageQuota = 1024 * 1024 * 1024 // 1GB mock quota
  const usagePercentage = (storageUsed / storageQuota) * 100

  return (
    <Card className="sovereign-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <HardDrive className="h-5 w-5 text-flame-500" />
            <span>Storage Viewer (MinIO)</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              disabled={uploading}
            />
            <label htmlFor="file-upload">
              <Button
                variant="sovereign"
                size="sm"
                disabled={uploading}
                asChild
              >
                <span>
                  <Upload className={`h-4 w-4 mr-2 ${uploading ? 'animate-spin' : ''}`} />
                  {uploading ? 'Uploading...' : 'Upload'}
                </span>
              </Button>
            </label>
            <Button
              variant="sovereign"
              size="sm"
              onClick={loadItems}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Storage Usage */}
        <div className="p-4 rounded-lg bg-ghost-800/50 border border-ghost-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-flame-400">Storage Usage</span>
            <span className="text-sm text-ghost-400">
              {formatBytes(storageUsed)} / {formatBytes(storageQuota)}
            </span>
          </div>
          <div className="w-full bg-ghost-700 rounded-full h-2">
            <div
              className="bg-flame-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
          <div className="text-xs text-ghost-400 mt-1">
            {usagePercentage.toFixed(1)}% used
          </div>
        </div>

        {/* Current Path */}
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-ghost-400">Path:</span>
          <code className="bg-ghost-800/50 px-2 py-1 rounded border border-ghost-700/50 font-mono">
            {currentPath}
          </code>
        </div>

        {/* File List */}
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-flame-500" />
              <span className="ml-2 text-ghost-400">Loading storage contents...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-ghost-400">
              <Folder className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No items found in this directory</p>
            </div>
          ) : (
            items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-ghost-800/30 border border-ghost-700/30 hover:border-flame-600/30 transition-all duration-200"
              >
                <div className="flex items-center space-x-3 flex-1">
                  {getItemIcon(item)}
                  <div className="flex-1">
                    <div className="font-medium text-ghost-200">{item.name}</div>
                    <div className="text-xs text-ghost-400 flex items-center space-x-4">
                      {item.size && <span>{formatBytes(item.size)}</span>}
                      {item.lastModified && <span>{formatDate(item.lastModified)}</span>}
                      {item.type === 'folder' && <Badge variant="outline" className="text-xs">Folder</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {item.type === 'file' && (
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.name)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
