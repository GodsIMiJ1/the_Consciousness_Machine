import { EditorService } from './EditorService';

export interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  lastModified?: Date;
  children?: FileItem[];
}

export interface FileOperation {
  type: 'create' | 'read' | 'update' | 'delete' | 'rename' | 'move';
  path: string;
  content?: string;
  newPath?: string;
}

export class FileSystemService {
  private static instance: FileSystemService;
  private workspaceRoot: string = '';
  private fileCache = new Map<string, string>();
  private watchers = new Map<string, FileSystemWatcher>();

  static getInstance(): FileSystemService {
    if (!FileSystemService.instance) {
      FileSystemService.instance = new FileSystemService();
    }
    return FileSystemService.instance;
  }

  async initialize(workspaceRoot: string): Promise<void> {
    this.workspaceRoot = workspaceRoot;
    
    // Check if we have file system access
    if ('showDirectoryPicker' in window) {
      console.log('🥷 File System Access API available');
    } else {
      console.log('⚠️ File System Access API not available - using fallback');
    }
  }

  async openWorkspace(): Promise<string> {
    if ('showDirectoryPicker' in window) {
      try {
        // @ts-ignore - File System Access API
        const directoryHandle = await window.showDirectoryPicker();
        this.workspaceRoot = directoryHandle.name;
        return this.workspaceRoot;
      } catch (error) {
        console.error('Failed to open workspace:', error);
        throw error;
      }
    } else {
      // Fallback: use input element for file selection
      return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.webkitdirectory = true;
        input.onchange = (e) => {
          const files = (e.target as HTMLInputElement).files;
          if (files && files.length > 0) {
            const firstFile = files[0];
            const pathParts = firstFile.webkitRelativePath.split('/');
            this.workspaceRoot = pathParts[0];
            resolve(this.workspaceRoot);
          } else {
            reject(new Error('No workspace selected'));
          }
        };
        input.click();
      });
    }
  }

  async readFile(filePath: string): Promise<string> {
    // Check cache first
    if (this.fileCache.has(filePath)) {
      return this.fileCache.get(filePath)!;
    }

    try {
      if ('showDirectoryPicker' in window) {
        // Use File System Access API
        const content = await this.readFileWithFSA(filePath);
        this.fileCache.set(filePath, content);
        return content;
      } else {
        // Fallback: use fetch for public files or prompt user
        const content = await this.readFileWithFetch(filePath);
        this.fileCache.set(filePath, content);
        return content;
      }
    } catch (error) {
      console.error(`Failed to read file ${filePath}:`, error);
      throw error;
    }
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    try {
      if ('showDirectoryPicker' in window) {
        await this.writeFileWithFSA(filePath, content);
      } else {
        // Fallback: download file
        await this.writeFileWithDownload(filePath, content);
      }
      
      // Update cache
      this.fileCache.set(filePath, content);
      
      // Notify editor if this is the active file
      const editorService = EditorService.getInstance();
      const context = editorService.getCurrentContext();
      if (context && context.activeFile === filePath) {
        // Update editor content if needed
      }
      
    } catch (error) {
      console.error(`Failed to write file ${filePath}:`, error);
      throw error;
    }
  }

  async createFile(filePath: string, content: string = ''): Promise<void> {
    try {
      await this.writeFile(filePath, content);
      console.log(`🥷 Created file: ${filePath}`);
    } catch (error) {
      console.error(`Failed to create file ${filePath}:`, error);
      throw error;
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      if ('showDirectoryPicker' in window) {
        await this.deleteFileWithFSA(filePath);
      } else {
        // Fallback: just remove from cache
        this.fileCache.delete(filePath);
        console.log(`⚠️ File ${filePath} removed from cache (cannot delete in fallback mode)`);
      }
    } catch (error) {
      console.error(`Failed to delete file ${filePath}:`, error);
      throw error;
    }
  }

  async createDirectory(dirPath: string): Promise<void> {
    try {
      if ('showDirectoryPicker' in window) {
        await this.createDirectoryWithFSA(dirPath);
      } else {
        console.log(`⚠️ Directory creation not supported in fallback mode: ${dirPath}`);
      }
    } catch (error) {
      console.error(`Failed to create directory ${dirPath}:`, error);
      throw error;
    }
  }

  async listDirectory(dirPath: string = ''): Promise<FileItem[]> {
    try {
      if ('showDirectoryPicker' in window) {
        return await this.listDirectoryWithFSA(dirPath);
      } else {
        return await this.listDirectoryFallback(dirPath);
      }
    } catch (error) {
      console.error(`Failed to list directory ${dirPath}:`, error);
      return [];
    }
  }

  async renameFile(oldPath: string, newPath: string): Promise<void> {
    try {
      const content = await this.readFile(oldPath);
      await this.createFile(newPath, content);
      await this.deleteFile(oldPath);
      
      this.fileCache.delete(oldPath);
      this.fileCache.set(newPath, content);
      
      console.log(`🥷 Renamed file: ${oldPath} → ${newPath}`);
    } catch (error) {
      console.error(`Failed to rename file ${oldPath} to ${newPath}:`, error);
      throw error;
    }
  }

  async moveFile(filePath: string, newDirectory: string): Promise<void> {
    const fileName = filePath.split('/').pop() || '';
    const newPath = `${newDirectory}/${fileName}`;
    await this.renameFile(filePath, newPath);
  }

  // File watching
  watchFile(filePath: string, callback: (event: 'changed' | 'deleted') => void): () => void {
    // This would use file system watchers in a real implementation
    // For now, we'll simulate it with periodic checks
    const watcher = setInterval(async () => {
      try {
        const content = await this.readFile(filePath);
        const cachedContent = this.fileCache.get(filePath);
        
        if (content !== cachedContent) {
          this.fileCache.set(filePath, content);
          callback('changed');
        }
      } catch (error) {
        // File might be deleted
        if (this.fileCache.has(filePath)) {
          this.fileCache.delete(filePath);
          callback('deleted');
        }
      }
    }, 1000);

    return () => clearInterval(watcher);
  }

  // Get file info
  async getFileInfo(filePath: string): Promise<FileItem | null> {
    try {
      const stats = await this.getFileStats(filePath);
      return {
        name: filePath.split('/').pop() || '',
        path: filePath,
        type: 'file',
        size: stats.size,
        lastModified: stats.lastModified,
      };
    } catch (error) {
      return null;
    }
  }

  // Search files
  async searchFiles(pattern: string, directory: string = ''): Promise<FileItem[]> {
    try {
      const allFiles = await this.listDirectory(directory);
      const regex = new RegExp(pattern, 'i');
      
      return allFiles.filter(file => 
        file.type === 'file' && regex.test(file.name)
      );
    } catch (error) {
      console.error('Failed to search files:', error);
      return [];
    }
  }

  // Get workspace structure for AI context
  async getWorkspaceStructure(): Promise<string> {
    try {
      const files = await this.listDirectory();
      return this.formatFileTree(files);
    } catch (error) {
      return 'Unable to read workspace structure';
    }
  }

  private formatFileTree(files: FileItem[], indent: string = ''): string {
    return files.map(file => {
      const icon = file.type === 'directory' ? '📁' : '📄';
      let result = `${indent}${icon} ${file.name}`;
      
      if (file.children && file.children.length > 0) {
        result += '\n' + this.formatFileTree(file.children, indent + '  ');
      }
      
      return result;
    }).join('\n');
  }

  // File System Access API implementations
  private async readFileWithFSA(filePath: string): Promise<string> {
    // Implementation for File System Access API
    throw new Error('File System Access API implementation needed');
  }

  private async writeFileWithFSA(filePath: string, content: string): Promise<void> {
    // Implementation for File System Access API
    throw new Error('File System Access API implementation needed');
  }

  private async deleteFileWithFSA(filePath: string): Promise<void> {
    // Implementation for File System Access API
    throw new Error('File System Access API implementation needed');
  }

  private async createDirectoryWithFSA(dirPath: string): Promise<void> {
    // Implementation for File System Access API
    throw new Error('File System Access API implementation needed');
  }

  private async listDirectoryWithFSA(dirPath: string): Promise<FileItem[]> {
    // Implementation for File System Access API
    throw new Error('File System Access API implementation needed');
  }

  // Fallback implementations
  private async readFileWithFetch(filePath: string): Promise<string> {
    // Try to fetch the file if it's publicly accessible
    try {
      const response = await fetch(filePath);
      if (response.ok) {
        return await response.text();
      }
    } catch (error) {
      // Fallback: prompt user to select file
      return await this.promptUserForFile();
    }
    
    throw new Error('Cannot read file in fallback mode');
  }

  private async writeFileWithDownload(filePath: string, content: string): Promise<void> {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filePath.split('/').pop() || 'file.txt';
    a.click();
    
    URL.revokeObjectURL(url);
  }

  private async listDirectoryFallback(dirPath: string): Promise<FileItem[]> {
    // Return cached file list or empty array
    const files: FileItem[] = Array.from(this.fileCache.keys()).map(path => ({
      name: path.split('/').pop() || '',
      path,
      type: 'file' as const,
    }));
    
    return files;
  }

  private async promptUserForFile(): Promise<string> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.ts,.tsx,.js,.jsx,.json,.md,.css,.html';
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const content = await file.text();
          resolve(content);
        } else {
          reject(new Error('No file selected'));
        }
      };
      
      input.click();
    });
  }

  private async getFileStats(filePath: string): Promise<{ size: number; lastModified: Date }> {
    // Placeholder implementation
    return {
      size: this.fileCache.get(filePath)?.length || 0,
      lastModified: new Date(),
    };
  }
}