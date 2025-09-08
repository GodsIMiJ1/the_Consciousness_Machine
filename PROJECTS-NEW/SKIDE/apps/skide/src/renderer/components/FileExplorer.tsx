import React, { useState } from 'react';

interface FileExplorerProps {
  onFileSelect: (filePath: string) => void;
}

interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileItem[];
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ onFileSelect }) => {
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  
  // Mock file structure for demo
  const [files] = useState<FileItem[]>([
    {
      name: 'src',
      path: 'src',
      type: 'directory',
      children: [
        {
          name: 'components',
          path: 'src/components',
          type: 'directory',
          children: [
            { name: 'App.tsx', path: 'src/components/App.tsx', type: 'file' },
            { name: 'Header.tsx', path: 'src/components/Header.tsx', type: 'file' }
          ]
        },
        { name: 'main.tsx', path: 'src/main.tsx', type: 'file' },
        { name: 'index.css', path: 'src/index.css', type: 'file' }
      ]
    },
    { name: 'package.json', path: 'package.json', type: 'file' },
    { name: 'README.md', path: 'README.md', type: 'file' }
  ]);

  const toggleDirectory = (path: string) => {
    const newExpanded = new Set(expandedDirs);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedDirs(newExpanded);
  };

  const renderFileItem = (item: FileItem, depth: number = 0) => {
    const isExpanded = expandedDirs.has(item.path);
    const paddingLeft = depth * 16 + 8;

    return (
      <div key={item.path}>
        <div
          className="file-item cursor-pointer hover:bg-gray-700 px-2 py-1 text-sm text-gray-300"
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={() => {
            if (item.type === 'directory') {
              toggleDirectory(item.path);
            } else {
              onFileSelect(item.path);
            }
          }}
        >
          <span className="mr-2">
            {item.type === 'directory' ? (
              isExpanded ? '📂' : '📁'
            ) : (
              '📄'
            )}
          </span>
          {item.name}
        </div>
        
        {item.type === 'directory' && isExpanded && item.children && (
          <div>
            {item.children.map(child => renderFileItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="file-explorer bg-gray-800 h-64 overflow-y-auto border-b border-gray-700">
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-white">Explorer</h3>
        <button className="text-gray-400 hover:text-white text-sm">
          +
        </button>
      </div>
      
      <div className="p-2">
        {files.map(file => renderFileItem(file))}
      </div>
      
      <div className="p-3 text-xs text-gray-400">
        <p>File explorer features:</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Project tree navigation</li>
          <li>File creation/deletion</li>
          <li>Search functionality</li>
          <li>Git status indicators</li>
        </ul>
      </div>
    </div>
  );
};
