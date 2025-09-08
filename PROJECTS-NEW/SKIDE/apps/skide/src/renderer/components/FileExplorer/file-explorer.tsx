import React, { useState, useEffect } from 'react'
import { FileTree } from './file-tree'
import type { FileItem } from '../../types'

interface FileExplorerProps {
  projectPath: string | null
  onFileSelect: (filePath: string) => void
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  projectPath,
  onFileSelect
}) => {
  const [rootFiles, setRootFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (projectPath) {
      loadDirectory(projectPath)
    } else {
      setRootFiles([])
    }
  }, [projectPath])

  const loadDirectory = async (dirPath: string) => {
    setLoading(true)
    try {
      const result = await window.api.fs.readDir(dirPath)
      if (result.success && result.items) {
        // Filter out hidden files and common build directories
        const filteredItems = result.items.filter(item => 
          !item.name.startsWith('.') && 
          !['node_modules', 'dist', 'build', 'out', '__pycache__'].includes(item.name)
        )
        
        // Sort: directories first, then files
        const sortedItems = filteredItems.sort((a, b) => {
          if (a.isDirectory && !b.isDirectory) return -1
          if (!a.isDirectory && b.isDirectory) return 1
          return a.name.localeCompare(b.name)
        })
        
        setRootFiles(sortedItems)
      }
    } catch (error) {
      console.error('Error loading directory:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadChildren = async (item: FileItem): Promise<FileItem[]> => {
    if (!item.isDirectory) return []
    
    const result = await window.api.fs.readDir(item.path)
    if (result.success && result.items) {
      const filteredItems = result.items.filter(child => 
        !child.name.startsWith('.') && 
        !['node_modules', 'dist', 'build', 'out', '__pycache__'].includes(child.name)
      )
      
      return filteredItems.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1
        if (!a.isDirectory && b.isDirectory) return 1
        return a.name.localeCompare(b.name)
      })
    }
    
    return []
  }

  if (!projectPath) {
    return (
      <div className="file-explorer-empty">
        <p>No project opened</p>
        <p className="text-muted">Open a folder to get started</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="file-explorer-loading">
        <p>Loading project...</p>
      </div>
    )
  }

  return (
    <div className="file-explorer">
      <div className="project-name">
        {projectPath.split('/').pop() || 'Project'}
      </div>
      <FileTree
        items={rootFiles}
        onFileSelect={onFileSelect}
        onLoadChildren={loadChildren}
      />
    </div>
  )
}