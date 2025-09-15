import { useState, useEffect, useCallback } from 'react';

export interface FileSystemState {
  workspacePath: string | null;
  recentFiles: string[];
  watchedFiles: Set<string>;
  isWatching: boolean;
}

export interface FileSystemActions {
  openWorkspace: (path: string) => Promise<void>;
  closeWorkspace: () => void;
  readFile: (filePath: string) => Promise<string>;
  writeFile: (filePath: string, content: string) => Promise<void>;
  createFile: (filePath: string, content?: string) => Promise<void>;
  deleteFile: (filePath: string) => Promise<void>;
  renameFile: (oldPath: string, newPath: string) => Promise<void>;
  createDirectory: (dirPath: string) => Promise<void>;
  deleteDirectory: (dirPath: string) => Promise<void>;
  exists: (path: string) => Promise<boolean>;
  getFileStats: (filePath: string) => Promise<FileStats>;
  watchFile: (filePath: string) => void;
  unwatchFile: (filePath: string) => void;
  getRecentFiles: () => string[];
  addToRecentFiles: (filePath: string) => void;
}

export interface FileStats {
  size: number;
  modified: Date;
  created: Date;
  isDirectory: boolean;
  isFile: boolean;
  permissions: {
    readable: boolean;
    writable: boolean;
    executable: boolean;
  };
}

export interface FileChangeEvent {
  type: 'created' | 'modified' | 'deleted' | 'renamed';
  path: string;
  oldPath?: string; // For rename events
  stats?: FileStats;
}

export interface UseFileSystemOptions {
  onFileChange?: (event: FileChangeEvent) => void;
  onWorkspaceChange?: (workspacePath: string | null) => void;
  onError?: (error: Error, operation: string) => void;
  autoWatch?: boolean; // Auto-watch opened files
  maxRecentFiles?: number;
}

export const useFileSystem = (
  options: UseFileSystemOptions = {}
): [FileSystemState, FileSystemActions] => {
  const [state, setState] = useState<FileSystemState>({
    workspacePath: null,
    recentFiles: [],
    watchedFiles: new Set(),
    isWatching: false
  });

  const {
    onFileChange,
    onWorkspaceChange,
    onError,
    autoWatch = true,
    maxRecentFiles = 10
  } = options;

  // Load initial state from storage
  useEffect(() => {
    const loadState = async () => {
      try {
        const saved = await window.electronAPI.getFileSystemState();
        if (saved) {
          setState(prev => ({
            ...prev,
            workspacePath: saved.workspacePath,
            recentFiles: saved.recentFiles || []
          }));
        }
      } catch (error) {
        console.error('Error loading file system state:', error);
      }
    };
    loadState();
  }, []);

  // Save state to storage when changed
  const saveState = useCallback(async (newState: Partial<FileSystemState>) => {
    try {
      await window.electronAPI.saveFileSystemState({
        workspacePath: newState.workspacePath ?? state.workspacePath,
        recentFiles: newState.recentFiles ?? state.recentFiles
      });
    } catch (error) {
      console.error('Error saving file system state:', error);
    }
  }, [state]);

  // Open workspace
  const openWorkspace = useCallback(async (path: string) => {
    try {
      const exists = await window.electronAPI.exists(path);
      if (!exists) {
        throw new Error(`Workspace path does not exist: ${path}`);
      }

      const stats = await window.electronAPI.getFileStats(path);
      if (!stats.isDirectory) {
        throw new Error(`Workspace path is not a directory: ${path}`);
      }

      setState(prev => ({ ...prev, workspacePath: path }));
      await saveState({ workspacePath: path });
      onWorkspaceChange?.(path);

      // Start watching workspace if auto-watch is enabled
      if (autoWatch) {
        await window.electronAPI.watchDirectory(path);
        setState(prev => ({ ...prev, isWatching: true }));
      }

    } catch (error) {
      onError?.(error as Error, 'openWorkspace');
      throw error;
    }
  }, [saveState, onWorkspaceChange, onError, autoWatch]);

  // Close workspace
  const closeWorkspace = useCallback(async () => {
    try {
      if (state.isWatching) {
        await window.electronAPI.unwatchDirectory(state.workspacePath!);
      }

      setState(prev => ({
        ...prev,
        workspacePath: null,
        watchedFiles: new Set(),
        isWatching: false
      }));
      
      await saveState({ workspacePath: null });
      onWorkspaceChange?.(null);

    } catch (error) {
      onError?.(error as Error, 'closeWorkspace');
    }
  }, [state.workspacePath, state.isWatching, saveState, onWorkspaceChange, onError]);

  // Read file content
  const readFile = useCallback(async (filePath: string): Promise<string> => {
    try {
      const content = await window.electronAPI.readFile(filePath);
      
      // Add to recent files
      addToRecentFiles(filePath);
      
      // Auto-watch if enabled
      if (autoWatch && !state.watchedFiles.has(filePath)) {
        watchFile(filePath);
      }

      return content;
    } catch (error) {
      onError?.(error as Error, 'readFile');
      throw error;
    }
  }, [autoWatch, state.watchedFiles, onError]);

  // Write file content
  const writeFile = useCallback(async (filePath: string, content: string) => {
    try {
      await window.electronAPI.writeFile(filePath, content);
      addToRecentFiles(filePath);
    } catch (error) {
      onError?.(error as Error, 'writeFile');
      throw error;
    }
  }, [onError]);

  // Create new file
  const createFile = useCallback(async (filePath: string, content = '') => {
    try {
      await window.electronAPI.writeFile(filePath, content);
      addToRecentFiles(filePath);
      
      // Notify of file creation
      onFileChange?.({
        type: 'created',
        path: filePath,
        stats: await getFileStats(filePath)
      });
    } catch (error) {
      onError?.(error as Error, 'createFile');
      throw error;
    }
  }, [onError, onFileChange]);

  // Delete file
  const deleteFile = useCallback(async (filePath: string) => {
    try {
      await window.electronAPI.deleteFile(filePath);
      
      // Remove from recent files
      setState(prev => ({
        ...prev,
        recentFiles: prev.recentFiles.filter(f => f !== filePath)
      }));
      
      // Stop watching
      unwatchFile(filePath);
      
      // Notify of file deletion
      onFileChange?.({
        type: 'deleted',
        path: filePath
      });
    } catch (error) {
      onError?.(error as Error, 'deleteFile');
      throw error;
    }
  }, [onError, onFileChange]);

  // Rename/move file
  const renameFile = useCallback(async (oldPath: string, newPath: string) => {
    try {
      await window.electronAPI.renameFile(oldPath, newPath);
      
      // Update recent files
      setState(prev => ({
        ...prev,
        recentFiles: prev.recentFiles.map(f => f === oldPath ? newPath : f)
      }));
      
      // Update watched files
      if (state.watchedFiles.has(oldPath)) {
        unwatchFile(oldPath);
        watchFile(newPath);
      }
      
      // Notify of file rename
      onFileChange?.({
        type: 'renamed',
        path: newPath,
        oldPath,
        stats: await getFileStats(newPath)
      });
    } catch (error) {
      onError?.(error as Error, 'renameFile');
      throw error;
    }
  }, [state.watchedFiles, onError, onFileChange]);

  // Create directory
  const createDirectory = useCallback(async (dirPath: string) => {
    try {
      await window.electronAPI.createDirectory(dirPath);
      
      // Notify of directory creation
      onFileChange?.({
        type: 'created',
        path: dirPath,
        stats: await getFileStats(dirPath)
      });
    } catch (error) {
      onError?.(error as Error, 'createDirectory');
      throw error;
    }
  }, [onError, onFileChange]);

  // Delete directory
  const deleteDirectory = useCallback(async (dirPath: string) => {
    try {
      await window.electronAPI.deleteDirectory(dirPath);
      
      // Remove from recent files (any files in the directory)
      setState(prev => ({
        ...prev,
        recentFiles: prev.recentFiles.filter(f => !f.startsWith(dirPath))
      }));
      
      // Stop watching files in directory
      state.watchedFiles.forEach(filePath => {
        if (filePath.startsWith(dirPath)) {
          unwatchFile(filePath);
        }
      });
      
      // Notify of directory deletion
      onFileChange?.({
        type: 'deleted',
        path: dirPath
      });
    } catch (error) {
      onError?.(error as Error, 'deleteDirectory');
      throw error;
    }
  }, [state.watchedFiles, onError, onFileChange]);

  // Check if path exists
  const exists = useCallback(async (path: string): Promise<boolean> => {
    try {
      return await window.electronAPI.exists(path);
    } catch (error) {
      onError?.(error as Error, 'exists');
      return false;
    }
  }, [onError]);

  // Get file statistics
  const getFileStats = useCallback(async (filePath: string): Promise<FileStats> => {
    try {
      return await window.electronAPI.getFileStats(filePath);
    } catch (error) {
      onError?.(error as Error, 'getFileStats');
      throw error;
    }
  }, [onError]);

  // Watch file for changes
  const watchFile = useCallback((filePath: string) => {
    if (state.watchedFiles.has(filePath)) return;

    setState(prev => ({
      ...prev,
      watchedFiles: new Set([...prev.watchedFiles, filePath])
    }));

    window.electronAPI.watchFile(filePath);
  }, [state.watchedFiles]);

  // Stop watching file
  const unwatchFile = useCallback((filePath: string) => {
    if (!state.watchedFiles.has(filePath)) return;

    setState(prev => {
      const newWatchedFiles = new Set(prev.watchedFiles);
      newWatchedFiles.delete(filePath);
      return { ...prev, watchedFiles: newWatchedFiles };
    });

    window.electronAPI.unwatchFile(filePath);
  }, [state.watchedFiles]);

  // Get recent files
  const getRecentFiles = useCallback(() => {
    return state.recentFiles;
  }, [state.recentFiles]);

  // Add file to recent files
  const addToRecentFiles = useCallback((filePath: string) => {
    setState(prev => {
      const filtered = prev.recentFiles.filter(f => f !== filePath);
      const updated = [filePath, ...filtered].slice(0, maxRecentFiles);
      
      // Save to storage asynchronously
      saveState({ recentFiles: updated });
      
      return { ...prev, recentFiles: updated };
    });
  }, [maxRecentFiles, saveState]);

  // Listen for file system events from main process
  useEffect(() => {
    const handleFileChange = (event: FileChangeEvent) => {
      onFileChange?.(event);
    };

    // Register file system event listener
    window.electronAPI.onFileSystemEvent?.(handleFileChange);

    return () => {
      // Cleanup listener
      window.electronAPI.removeFileSystemListener?.(handleFileChange);
    };
  }, [onFileChange]);

  const actions: FileSystemActions = {
    openWorkspace,
    closeWorkspace,
    readFile,
    writeFile,
    createFile,
    deleteFile,
    renameFile,
    createDirectory,
    deleteDirectory,
    exists,
    getFileStats,
    watchFile,
    unwatchFile,
    getRecentFiles,
    addToRecentFiles
  };

  return [state, actions];
};