import React, { useState, useEffect, useCallback } from 'react';
import {
  FolderIcon,
  FolderOpenIcon,
  DocumentIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface FileNode {
  path: string;
  name: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  isExpanded?: boolean;
  size?: number;
  modified?: Date;
  kodiiScore?: number; // AI relevance score
}

interface FileExplorerProps {
  workspacePath: string | null;
  currentFile: string | null;
  onFileSelect: (filePath: string) => void;
  onFileCreate: (parentPath: string, name: string, type: 'file' | 'directory') => void;
  onFileDelete: (filePath: string) => void;
  onFileRename: (oldPath: string, newPath: string) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  workspacePath,
  currentFile,
  onFileSelect,
  onFileCreate,
  onFileDelete,
  onFileRename
}) => {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFiles, setFilteredFiles] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    node: FileNode;
  } | null>(null);
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');

  // Load file tree from file system
  const loadFileTree = useCallback(async () => {
    if (!workspacePath) return;

    setLoading(true);
    try {
      const tree = await window.electronAPI.getFileTree(workspacePath);
      
      // Enhance with Kodii intelligence
      const enhancedTree = await enhanceWithKodiiScores(tree);
      
      setFileTree(enhancedTree);
    } catch (error) {
      console.error('Error loading file tree:', error);
    } finally {
      setLoading(false);
    }
  }, [workspacePath]);

  // Enhance file tree with Kodii AI scores
  const enhanceWithKodiiScores = async (tree: FileNode[]): Promise<FileNode[]> => {
    try {
      const response = await window.electronAPI.kodiiAnalyze({
        analysisType: 'file_relevance',
        files: getAllFilePaths(tree),
        context: currentFile ? { currentFile } : undefined
      });

      if (response.success && response.scores) {
        return applyKodiiScores(tree, response.scores);
      }
    } catch (error) {
      console.error('Error getting Kodii scores:', error);
    }
    
    return tree;
  };

  // Recursively get all file paths
  const getAllFilePaths = (nodes: FileNode[]): string[] => {
    const paths: string[] = [];
    
    const traverse = (node: FileNode) => {
      if (node.type === 'file') {
        paths.push(node.path);
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    
    nodes.forEach(traverse);
    return paths;
  };

  // Apply Kodii relevance scores to file tree
  const applyKodiiScores = (tree: FileNode[], scores: Record<string, number>): FileNode[] => {
    return tree.map(node => ({
      ...node,
      kodiiScore: scores[node.path] || 0,
      children: node.children ? applyKodiiScores(node.children, scores) : undefined
    }));
  };

  // Search files with Kodii semantic search
  const searchFiles = useCallback(async (query: string) => {
    if (!query.trim() || !workspacePath) {
      setFilteredFiles([]);
      return;
    }

    try {
      const response = await window.electronAPI.kodiiSearch({
        query,
        workspacePath,
        type: 'files',
        limit: 50
      });

      if (response.success && response.results) {
        setFilteredFiles(response.results.map((r: any) => r.path));
      }
    } catch (error) {
      console.error('Error searching files:', error);
      setFilteredFiles([]);
    }
  }, [workspacePath]);

  // Toggle directory expansion
  const toggleDirectory = (path: string) => {
    setFileTree(prev => updateNodeInTree(prev, path, node => ({
      ...node,
      isExpanded: !node.isExpanded
    })));
  };

  // Update a specific node in the tree
  const updateNodeInTree = (
    tree: FileNode[],
    targetPath: string,
    updater: (node: FileNode) => FileNode
  ): FileNode[] => {
    return tree.map(node => {
      if (node.path === targetPath) {
        return updater(node);
      }
      if (node.children) {
        return {
          ...node,
          children: updateNodeInTree(node.children, targetPath, updater)
        };
      }
      return node;
    });
  };

  // Handle file/directory creation
  const handleCreate = (parentPath: string, type: 'file' | 'directory') => {
    const name = prompt(`Enter ${type} name:`);
    if (name) {
      onFileCreate(parentPath, name, type);
      loadFileTree(); // Reload tree
    }
  };

  // Handle file renaming
  const startRename = (node: FileNode) => {
    setRenamingFile(node.path);
    setNewFileName(node.name);
    setContextMenu(null);
  };

  const handleRename = () => {
    if (renamingFile && newFileName.trim()) {
      const newPath = renamingFile.replace(/[^/]+$/, newFileName);
      onFileRename(renamingFile, newPath);
      loadFileTree(); // Reload tree
    }
    setRenamingFile(null);
    setNewFileName('');
  };

  // Handle file deletion
  const handleDelete = (node: FileNode) => {
    if (confirm(`Are you sure you want to delete ${node.name}?`)) {
      onFileDelete(node.path);
      loadFileTree(); // Reload tree
    }
    setContextMenu(null);
  };

  // Context menu
  const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      node
    });
  };

  // Get file icon based on extension
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return '📘';
      case 'js':
      case 'jsx':
        return '📒';
      case 'json':
        return '📋';
      case 'md':
        return '📄';
      case 'css':
      case 'scss':
        return '🎨';
      case 'html':
        return '🌐';
      case 'py':
        return '🐍';
      case 'rs':
        return '🦀';
      default:
        return '📄';
    }
  };

  // Render file/directory node
  const renderNode = (node: FileNode, depth = 0) => {
    const isSelected = node.path === currentFile;
    const isFiltered = searchQuery && !filteredFiles.includes(node.path);
    const kodiiRelevance = node.kodiiScore || 0;

    if (searchQuery && node.type === 'file' && !filteredFiles.includes(node.path)) {
      return null;
    }

    return (
      <div key={node.path}>
        <div
          className={`flex items-center px-2 py-1 cursor-pointer hover:bg-gray-100 ${
            isSelected ? 'bg-blue-100 border-r-2 border-blue-500' : ''
          } ${isFiltered ? 'opacity-50' : ''}`}
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
          onClick={() => {
            if (node.type === 'file') {
              onFileSelect(node.path);
            } else {
              toggleDirectory(node.path);
            }
          }}
          onContextMenu={(e) => handleContextMenu(e, node)}
        >
          {/* Icon */}
          <div className="w-5 h-5 mr-2 flex items-center justify-center">
            {node.type === 'directory' ? (
              node.isExpanded ? (
                <FolderOpenIcon className="w-4 h-4 text-blue-600" />
              ) : (
                <FolderIcon className="w-4 h-4 text-blue-600" />
              )
            ) : (
              <span className="text-sm">{getFileIcon(node.name)}</span>
            )}
          </div>

          {/* Name */}
          {renamingFile === node.path ? (
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') setRenamingFile(null);
              }}
              className="flex-1 text-sm border border-blue-500 rounded px-1"
              autoFocus
            />
          ) : (
            <span className="flex-1 text-sm text-gray-900 truncate">
              {node.name}
            </span>
          )}

          {/* Kodii relevance indicator */}
          {kodiiRelevance > 0.5 && (
            <SparklesIcon 
              className="w-3 h-3 text-yellow-500 ml-1" 
              title={`Kodii relevance: ${Math.round(kodiiRelevance * 100)}%`}
            />
          )}

          {/* File size */}
          {node.type === 'file' && node.size && (
            <span className="text-xs text-gray-500 ml-2">
              {formatFileSize(node.size)}
            </span>
          )}
        </div>

        {/* Children */}
        {node.type === 'directory' && node.isExpanded && node.children && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
    return `${Math.round(bytes / (1024 * 1024))}MB`;
  };

  // Effects
  useEffect(() => {
    loadFileTree();
  }, [loadFileTree]);

  useEffect(() => {
    const timer = setTimeout(() => searchFiles(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchFiles]);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (!workspacePath) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <FolderIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No workspace open</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-gray-900 text-sm">Explorer</span>
          <button
            onClick={() => handleCreate(workspacePath, 'file')}
            className="p-1 hover:bg-gray-100 rounded"
            title="New File"
          >
            <PlusIcon className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading files...</p>
          </div>
        ) : (
          <div>
            {fileTree.map(node => renderNode(node))}
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white border border-gray-200 rounded shadow-lg py-1 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => startRename(contextMenu.node)}
            className="w-full px-3 py-1 text-left text-sm hover:bg-gray-100 flex items-center"
          >
            <PencilIcon className="w-3 h-3 mr-2" />
            Rename
          </button>
          <button
            onClick={() => handleDelete(contextMenu.node)}
            className="w-full px-3 py-1 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center"
          >
            <TrashIcon className="w-3 h-3 mr-2" />
            Delete
          </button>
          {contextMenu.node.type === 'directory' && (
            <>
              <hr className="my-1" />
              <button
                onClick={() => handleCreate(contextMenu.node.path, 'file')}
                className="w-full px-3 py-1 text-left text-sm hover:bg-gray-100 flex items-center"
              >
                <DocumentIcon className="w-3 h-3 mr-2" />
                New File
              </button>
              <button
                onClick={() => handleCreate(contextMenu.node.path, 'directory')}
                className="w-full px-3 py-1 text-left text-sm hover:bg-gray-100 flex items-center"
              >
                <FolderIcon className="w-3 h-3 mr-2" />
                New Folder
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};