import React, { useState } from 'react'
import type { FileItem } from '../../types'

interface FileTreeProps {
  items: FileItem[]
  onFileSelect: (filePath: string) => void
  onLoadChildren: (item: FileItem) => Promise<FileItem[]>
  level?: number
}

interface FileTreeItemProps {
  item: FileItem
  onFileSelect: (filePath: string) => void
  onLoadChildren: (item: FileItem) => Promise<FileItem[]>
  level: number
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({
  item,
  onFileSelect,
  onLoadChildren,
  level
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [children, setChildren] = useState<FileItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    if (item.isDirectory) {
      if (!isExpanded) {
        setIsLoading(true)
        try {
          const childItems = await onLoadChildren(item)
          setChildren(childItems)
        } catch (error) {
          console.error('Error loading children:', error)
        } finally {
          setIsLoading(false)
        }
      }
      setIsExpanded(!isExpanded)
    } else {
      onFileSelect(item.path)
    }
  }

  const getFileIcon = (item: FileItem): string => {
    if (item.isDirectory) {
      return isExpanded ? '📂' : '📁'
    }
    
    const ext = item.name.split('.').pop()?.toLowerCase()
    const iconMap: Record<string, string> = {
      'ts': '🟦',
      'tsx': '🟦',
      'js': '🟨',
      'jsx': '🟨',
      'py': '🐍',
      'rs': '🦀',
      'go': '🐹',
      'java': '☕',
      'cpp': '⚡',
      'c': '⚡',
      'cs': '🔷',
      'php': '🐘',
      'rb': '💎',
      'sh': '🐚',
      'bash': '🐚',
      'yaml': '📋',
      'yml': '📋',
      'json': '📋',
      'xml': '📄',
      'html': '🌐',
      'css': '🎨',
      'scss': '🎨',
      'less': '🎨',
      'md': '📝',
      'sql': '🗄️',
      'txt': '📄',
      'log': '📜',
      'config': '⚙️',
      'env': '🔧'
    }
    
    return iconMap[ext || ''] || '📄'
  }

  return (
    <div className="file-tree-item">
      <div
        className={`file-tree-item-label ${!item.isDirectory ? 'file' : ''}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
      >
        <span className="file-icon">
          {isLoading ? '⏳' : getFileIcon(item)}
        </span>
        <span className="file-name">{item.name}</span>
      </div>
      
      {item.isDirectory && isExpanded && children.length > 0 && (
        <div className="file-tree-children">
          <FileTree
            items={children}
            onFileSelect={onFileSelect}
            onLoadChildren={onLoadChildren}
            level={level + 1}
          />
        </div>
      )}
    </div>
  )
}

export const FileTree: React.FC<FileTreeProps> = ({
  items,
  onFileSelect,
  onLoadChildren,
  level = 0
}) => {
  return (
    <div className="file-tree">
      {items.map((item) => (
        <FileTreeItem
          key={item.path}
          item={item}
          onFileSelect={onFileSelect}
          onLoadChildren={onLoadChildren}
          level={level}
        />
      ))}
    </div>
  )
}