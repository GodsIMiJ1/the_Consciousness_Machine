import React, { useState, useEffect, useRef } from 'react';
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ListBulletIcon,
  WrenchScrewdriverIcon,
  CodeBracketIcon,
  BeakerIcon,
  DocumentCheckIcon,
  TagIcon,
  SparklesIcon,
  CommandLineIcon,
  FolderIcon,
  GitBranchIcon
} from '@heroicons/react/24/outline';

interface KodiiCommand {
  id: string;
  title: string;
  description: string;
  category: 'workflow' | 'code' | 'git' | 'project' | 'system';
  icon: React.ReactNode;
  shortcut?: string;
  handler: () => Promise<void>;
  requiresFile?: boolean;
  requiresSelection?: boolean;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  currentFile: string | null;
  selectedText: string | null;
  workspacePath: string | null;
  onCommand: (commandId: string, args?: any) => Promise<void>;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  currentFile,
  selectedText,
  workspacePath,
  onCommand
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredCommands, setFilteredCommands] = useState<KodiiCommand[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Define all Kodii commands
  const commands: KodiiCommand[] = [
    // Workflow Commands
    {
      id: 'draft-prd',
      title: 'Draft PRD',
      description: 'Create a Product Requirements Document for a new feature',
      category: 'workflow',
      icon: <DocumentTextIcon className="w-5 h-5" />,
      shortcut: 'Ctrl+Shift+P',
      handler: async () => {
        await onCommand('draft-prd');
      }
    },
    {
      id: 'generate-tasks',
      title: 'Generate Task Graph',
      description: 'Break down a feature into implementable tasks',
      category: 'workflow',
      icon: <ListBulletIcon className="w-5 h-5" />,
      shortcut: 'Ctrl+Shift+T',
      handler: async () => {
        await onCommand('generate-tasks');
      }
    },
    {
      id: 'scaffold-feature',
      title: 'Scaffold Feature',
      description: 'Generate boilerplate code structure for a feature',
      category: 'workflow',
      icon: <WrenchScrewdriverIcon className="w-5 h-5" />,
      shortcut: 'Ctrl+Shift+S',
      handler: async () => {
        await onCommand('scaffold-feature');
      }
    },
    {
      id: 'implement-feature',
      title: 'Implement Feature',
      description: 'Generate complete implementation from tasks',
      category: 'workflow',
      icon: <CodeBracketIcon className="w-5 h-5" />,
      shortcut: 'Ctrl+Shift+I',
      handler: async () => {
        await onCommand('implement-feature');
      }
    },

    // Code Commands
    {
      id: 'explain-code',
      title: 'Explain Code',
      description: 'Get detailed explanation of selected code',
      category: 'code',
      icon: <SparklesIcon className="w-5 h-5" />,
      shortcut: 'Ctrl+Shift+E',
      requiresSelection: true,
      handler: async () => {
        await onCommand('explain-code', { text: selectedText });
      }
    },
    {
      id: 'optimize-code',
      title: 'Optimize Code',
      description: 'Suggest performance and readability improvements',
      category: 'code',
      icon: <CodeBracketIcon className="w-5 h-5" />,
      requiresSelection: true,
      handler: async () => {
        await onCommand('optimize-code', { text: selectedText });
      }
    },
    {
      id: 'generate-tests',
      title: 'Generate Tests',
      description: 'Create unit tests for selected code',
      category: 'code',
      icon: <BeakerIcon className="w-5 h-5" />,
      shortcut: 'Ctrl+Shift+T',
      requiresFile: true,
      handler: async () => {
        await onCommand('generate-tests', { file: currentFile, text: selectedText });
      }
    },
    {
      id: 'refactor-code',
      title: 'Refactor Code',
      description: 'Suggest refactoring opportunities',
      category: 'code',
      icon: <WrenchScrewdriverIcon className="w-5 h-5" />,
      requiresSelection: true,
      handler: async () => {
        await onCommand('refactor-code', { text: selectedText });
      }
    },
    {
      id: 'add-comments',
      title: 'Add Comments',
      description: 'Generate helpful code comments',
      category: 'code',
      icon: <DocumentTextIcon className="w-5 h-5" />,
      requiresSelection: true,
      handler: async () => {
        await onCommand('add-comments', { text: selectedText });
      }
    },

    // Git Commands
    {
      id: 'review-changes',
      title: 'Review Changes',
      description: 'AI-powered code review of current changes',
      category: 'git',
      icon: <DocumentCheckIcon className="w-5 h-5" />,
      shortcut: 'Ctrl+Shift+R',
      handler: async () => {
        await onCommand('review-changes');
      }
    },
    {
      id: 'generate-commit',
      title: 'Generate Commit Message',
      description: 'Create conventional commit message from changes',
      category: 'git',
      icon: <GitBranchIcon className="w-5 h-5" />,
      shortcut: 'Ctrl+Shift+C',
      handler: async () => {
        await onCommand('generate-commit');
      }
    },
    {
      id: 'release-notes',
      title: 'Generate Release Notes',
      description: 'Create release notes from git history',
      category: 'git',
      icon: <TagIcon className="w-5 h-5" />,
      handler: async () => {
        await onCommand('release-notes');
      }
    },

    // Project Commands
    {
      id: 'analyze-project',
      title: 'Analyze Project',
      description: 'Deep analysis of project structure and patterns',
      category: 'project',
      icon: <FolderIcon className="w-5 h-5" />,
      handler: async () => {
        await onCommand('analyze-project');
      }
    },
    {
      id: 'find-similar',
      title: 'Find Similar Code',
      description: 'Find similar code patterns in the project',
      category: 'project',
      icon: <MagnifyingGlassIcon className="w-5 h-5" />,
      requiresSelection: true,
      handler: async () => {
        await onCommand('find-similar', { text: selectedText });
      }
    },
    {
      id: 'generate-docs',
      title: 'Generate Documentation',
      description: 'Create project documentation',
      category: 'project',
      icon: <DocumentTextIcon className="w-5 h-5" />,
      handler: async () => {
        await onCommand('generate-docs');
      }
    },

    // System Commands
    {
      id: 'run-terminal',
      title: 'Run in Terminal',
      description: 'Execute command in integrated terminal',
      category: 'system',
      icon: <CommandLineIcon className="w-5 h-5" />,
      shortcut: 'Ctrl+`',
      handler: async () => {
        const command = prompt('Enter command to run:');
        if (command) {
          await onCommand('run-terminal', { command });
        }
      }
    },
    {
      id: 'open-file',
      title: 'Open File',
      description: 'Quick file opener with fuzzy search',
      category: 'system',
      icon: <DocumentTextIcon className="w-5 h-5" />,
      shortcut: 'Ctrl+P',
      handler: async () => {
        await onCommand('open-file');
      }
    }
  ];

  // Filter commands based on query and context
  const filterCommands = (searchQuery: string) => {
    const filtered = commands.filter(cmd => {
      // Check availability based on context
      if (cmd.requiresFile && !currentFile) return false;
      if (cmd.requiresSelection && !selectedText) return false;

      // Text search
      if (!searchQuery.trim()) return true;
      
      const query = searchQuery.toLowerCase();
      return (
        cmd.title.toLowerCase().includes(query) ||
        cmd.description.toLowerCase().includes(query) ||
        cmd.category.toLowerCase().includes(query)
      );
    });

    // Sort by relevance (exact matches first, then partial matches)
    return filtered.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const query = searchQuery.toLowerCase();

      if (aTitle.startsWith(query) && !bTitle.startsWith(query)) return -1;
      if (!aTitle.startsWith(query) && bTitle.startsWith(query)) return 1;
      
      return aTitle.localeCompare(bTitle);
    });
  };

  // Handle command execution
  const executeCommand = async (command: KodiiCommand) => {
    try {
      await command.handler();
      onClose();
    } catch (error) {
      console.error('Error executing command:', error);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex]);
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'workflow':
        return 'text-blue-600 bg-blue-50';
      case 'code':
        return 'text-green-600 bg-green-50';
      case 'git':
        return 'text-purple-600 bg-purple-50';
      case 'project':
        return 'text-orange-600 bg-orange-50';
      case 'system':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Effects
  useEffect(() => {
    setFilteredCommands(filterCommands(query));
    setSelectedIndex(0);
  }, [query, currentFile, selectedText]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-32 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Kodii Command Palette</h2>
              <p className="text-sm text-gray-600">
                Choose an action or start typing to search
              </p>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search commands..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            />
          </div>
        </div>

        {/* Commands List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No commands found</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="py-2">
              {filteredCommands.map((command, index) => (
                <div
                  key={command.id}
                  className={`mx-2 px-4 py-3 rounded cursor-pointer transition-colors ${
                    index === selectedIndex
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => executeCommand(command)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-gray-600">
                        {command.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">
                            {command.title}
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(command.category)}`}>
                            {command.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {command.description}
                        </p>
                        
                        {/* Context requirements */}
                        {(command.requiresFile || command.requiresSelection) && (
                          <div className="flex items-center space-x-2 mt-2">
                            {command.requiresFile && (
                              <span className={`text-xs px-2 py-1 rounded ${
                                currentFile ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {currentFile ? '✓ File open' : '⚠ Requires file'}
                              </span>
                            )}
                            {command.requiresSelection && (
                              <span className={`text-xs px-2 py-1 rounded ${
                                selectedText ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {selectedText ? '✓ Text selected' : '⚠ Requires selection'}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Shortcut */}
                    {command.shortcut && (
                      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {command.shortcut}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center space-x-4">
              <span>↑↓ Navigate</span>
              <span>↵ Execute</span>
              <span>Esc Close</span>
            </div>
            <div>
              {filteredCommands.length} commands available
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
    