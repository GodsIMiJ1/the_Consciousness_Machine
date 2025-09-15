import React, { useState, useEffect } from 'react';
import {
  WifiIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SparklesIcon,
  ClockIcon,
  CpuChipIcon,
  DocumentTextIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';

interface StatusBarProps {
  currentFile: string | null;
  cursorPosition: { line: number; column: number } | null;
  selectedText: string | null;
  workspacePath: string | null;
  kodiiStatus: 'ready' | 'thinking' | 'offline' | 'error';
  gitBranch: string | null;
  gitChanges: number;
  errors: number;
  warnings: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  currentFile,
  cursorPosition,
  selectedText,
  workspacePath,
  kodiiStatus,
  gitBranch,
  gitChanges,
  errors,
  warnings
}) => {
  const [time, setTime] = useState(new Date());
  const [cpuUsage, setCpuUsage] = useState<number | null>(null);
  const [memoryUsage, setMemoryUsage] = useState<number | null>(null);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Get system stats periodically
  useEffect(() => {
    const getSystemStats = async () => {
      try {
        const stats = await window.electronAPI.getSystemStats();
        setCpuUsage(stats.cpu);
        setMemoryUsage(stats.memory);
      } catch (error) {
        console.error('Error getting system stats:', error);
      }
    };

    getSystemStats();
    const interval = setInterval(getSystemStats, 5000);
    return () => clearInterval(interval);
  }, []);

  // Get Kodii status icon and color
  const getKodiiStatusDisplay = () => {
    switch (kodiiStatus) {
      case 'ready':
        return {
          icon: <SparklesIcon className="w-4 h-4" />,
          color: 'text-green-600',
          text: 'Kodii Ready'
        };
      case 'thinking':
        return {
          icon: <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />,
          color: 'text-blue-600',
          text: 'Kodii Thinking...'
        };
      case 'offline':
        return {
          icon: <WifiIcon className="w-4 h-4" />,
          color: 'text-gray-500',
          text: 'Kodii Offline'
        };
      case 'error':
        return {
          icon: <ExclamationTriangleIcon className="w-4 h-4" />,
          color: 'text-red-600',
          text: 'Kodii Error'
        };
    }
  };

  const kodiiDisplay = getKodiiStatusDisplay();

  // Get file language from extension
  const getFileLanguage = (filePath: string): string => {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      ts: 'TypeScript',
      tsx: 'TypeScript React',
      js: 'JavaScript',
      jsx: 'JavaScript React',
      py: 'Python',
      rs: 'Rust',
      go: 'Go',
      cpp: 'C++',
      c: 'C',
      java: 'Java',
      cs: 'C#',
      php: 'PHP',
      rb: 'Ruby',
      swift: 'Swift',
      kt: 'Kotlin',
      dart: 'Dart',
      css: 'CSS',
      scss: 'SCSS',
      html: 'HTML',
      json: 'JSON',
      xml: 'XML',
      md: 'Markdown',
      yaml: 'YAML',
      yml: 'YAML',
      toml: 'TOML',
      sh: 'Shell',
      bash: 'Bash',
      sql: 'SQL'
    };
    return languageMap[ext || ''] || (ext ? ext.toUpperCase() : 'Plain Text');
  };

  // Format file size
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Get workspace name
  const getWorkspaceName = (): string => {
    if (!workspacePath) return 'No Workspace';
    return workspacePath.split('/').pop() || 'Workspace';
  };

  return (
    <div className="h-6 bg-blue-600 text-white text-xs flex items-center justify-between px-3 select-none">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {/* Kodii Status */}
        <div className={`flex items-center space-x-1 ${kodiiDisplay.color}`}>
          {kodiiDisplay.icon}
          <span>{kodiiDisplay.text}</span>
        </div>

        {/* Workspace */}
        <div className="flex items-center space-x-1 text-blue-100">
          <DocumentTextIcon className="w-3 h-3" />
          <span>{getWorkspaceName()}</span>
        </div>

        {/* Git Status */}
        {gitBranch && (
          <div className="flex items-center space-x-1 text-blue-100">
            <span>⎇</span>
            <span>{gitBranch}</span>
            {gitChanges > 0 && (
              <span className="bg-blue-500 px-1 rounded text-xs">
                {gitChanges}
              </span>
            )}
          </div>
        )}

        {/* Errors & Warnings */}
        {(errors > 0 || warnings > 0) && (
          <div className="flex items-center space-x-2">
            {errors > 0 && (
              <div className="flex items-center space-x-1 text-red-300">
                <ExclamationTriangleIcon className="w-3 h-3" />
                <span>{errors}</span>
              </div>
            )}
            {warnings > 0 && (
              <div className="flex items-center space-x-1 text-yellow-300">
                <ExclamationTriangleIcon className="w-3 h-3" />
                <span>{warnings}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Center Section - Current File Info */}
      <div className="flex items-center space-x-4 text-blue-100">
        {currentFile ? (
          <>
            {/* File Name & Language */}
            <div className="flex items-center space-x-1">
              <CodeBracketIcon className="w-3 h-3" />
              <span>{currentFile.split('/').pop()}</span>
              <span className="text-blue-200">({getFileLanguage(currentFile)})</span>
            </div>

            {/* Cursor Position */}
            {cursorPosition && (
              <div className="flex items-center space-x-1">
                <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
              </div>
            )}

            {/* Selection Info */}
            {selectedText && (
              <div className="flex items-center space-x-1">
                <span>({selectedText.length} chars selected)</span>
              </div>
            )}
          </>
        ) : (
          <span className="text-blue-200">No file open</span>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4 text-blue-100">
        {/* System Stats */}
        {(cpuUsage !== null || memoryUsage !== null) && (
          <div className="flex items-center space-x-2">
            {cpuUsage !== null && (
              <div className="flex items-center space-x-1" title={`CPU Usage: ${cpuUsage.toFixed(1)}%`}>
                <CpuChipIcon className="w-3 h-3" />
                <span>{cpuUsage.toFixed(0)}%</span>
              </div>
            )}
            {memoryUsage !== null && (
              <div className="flex items-center space-x-1" title={`Memory Usage: ${formatBytes(memoryUsage)}`}>
                <span>RAM</span>
                <span>{formatBytes(memoryUsage)}</span>
              </div>
            )}
          </div>
        )}

        {/* Time */}
        <div className="flex items-center space-x-1" title={time.toLocaleString()}>
          <ClockIcon className="w-3 h-3" />
          <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        {/* Version */}
        <div className="text-blue-200 text-xs">
          SKIDE v0.1.0
        </div>
      </div>
    </div>
  );
};