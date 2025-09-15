#!/bin/bash

# SKIDE Monaco Integration Scaffolding Script
# Scaffolds complete file tree structure for SKIDE components

set -e

echo "🚀 SKIDE Monaco Integration Scaffold"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "apps/skide" ]; then
    print_error "Must run from SKIDE monorepo root (where package.json exists and apps/skide directory is present)"
    exit 1
fi

print_info "Scaffolding SKIDE Monaco Integration components..."

# Create directory structure
echo
echo "📁 Creating directory structure..."

# Core directories
mkdir -p apps/skide/src/components/editor
mkdir -p apps/skide/src/components/terminal
mkdir -p apps/skide/src/components/workspace
mkdir -p apps/skide/src/hooks
mkdir -p apps/skide/src/types
mkdir -p apps/skide/src/utils

print_status "Created component directories"

# Component files
echo
echo "📄 Creating component files..."

# Editor components
touch apps/skide/src/components/editor/CodeActions.tsx
touch apps/skide/src/components/editor/FileExplorer.tsx
print_status "Created editor component files"

# Terminal components  
touch apps/skide/src/components/terminal/CommandPalette.tsx
touch apps/skide/src/components/terminal/OutputPanel.tsx
print_status "Created terminal component files"

# Workspace components
touch apps/skide/src/components/workspace/StatusBar.tsx
print_status "Created workspace component files"

# Hook files
touch apps/skide/src/hooks/useMonacoIntegration.ts
touch apps/skide/src/hooks/useFileSystem.ts
touch apps/skide/src/hooks/useTerminal.ts
print_status "Created hook files"

# Type definition files
echo
echo "🏗️ Creating type definition files..."

cat > apps/skide/src/types/editor.ts << 'EOF'
import { editor } from 'monaco-editor';

export interface CodeSuggestion {
  id: string;
  type: 'fix' | 'improvement' | 'explanation' | 'test';
  title: string;
  description: string;
  range: editor.IRange;
  replacement?: string;
  confidence: number;
}

export interface FileNode {
  path: string;
  name: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  isExpanded?: boolean;
  size?: number;
  modified?: Date;
  kodiiScore?: number;
}

export interface EditorState {
  currentFile: string | null;
  openFiles: string[];
  cursorPosition: { line: number; column: number } | null;
  selectedText: string | null;
  isDirty: boolean;
}
EOF

cat > apps/skide/src/types/terminal.ts << 'EOF'
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

export interface TerminalSession {
  id: string;
  name: string;
  cwd: string;
  terminal: Terminal;
  fitAddon: FitAddon;
  isActive: boolean;
  pid?: number;
  status: 'running' | 'exited' | 'error';
  exitCode?: number;
}

export interface OutputMessage {
  id: string;
  timestamp: Date;
  type: 'info' | 'warning' | 'error' | 'success' | 'command' | 'output';
  source: string;
  content: string;
  metadata?: Record<string, any>;
}
EOF

cat > apps/skide/src/types/kodii.ts << 'EOF'
export interface KodiiCommand {
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

export interface KodiiSession {
  id: string;
  workspacePath: string;
  currentFile?: string;
  context: Record<string, any>;
  messages: KodiiMessage[];
  artifacts: KodiiArtifact[];
}

export interface KodiiMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface KodiiArtifact {
  id: string;
  type: 'prd' | 'tasks' | 'code' | 'tests' | 'docs';
  title: string;
  content: string;
  filePath?: string;
  approved: boolean;
  createdAt: Date;
}
EOF

print_status "Created type definition files"

# Utility files
echo
echo "🔧 Creating utility files..."

cat > apps/skide/src/utils/fileUtils.ts << 'EOF'
export const getFileExtension = (filePath: string): string => {
  return filePath.split('.').pop()?.toLowerCase() || '';
};

export const getFileName = (filePath: string): string => {
  return filePath.split('/').pop() || '';
};

export const getLanguageFromPath = (filePath: string): string => {
  const ext = getFileExtension(filePath);
  const languageMap: Record<string, string> = {
    'ts': 'typescript',
    'tsx': 'typescript',
    'js': 'javascript',
    'jsx': 'javascript',
    'py': 'python',
    'rs': 'rust',
    'go': 'go',
    'cpp': 'cpp',
    'c': 'c',
    'java': 'java',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'swift': 'swift',
    'kt': 'kotlin',
    'dart': 'dart',
    'css': 'css',
    'scss': 'scss',
    'html': 'html',
    'json': 'json',
    'xml': 'xml',
    'md': 'markdown',
    'yaml': 'yaml',
    'yml': 'yaml',
    'sh': 'shell',
    'bash': 'shell',
    'sql': 'sql'
  };
  
  return languageMap[ext] || 'plaintext';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const isTextFile = (filePath: string): boolean => {
  const textExtensions = [
    'txt', 'md', 'json', 'js', 'ts', 'jsx', 'tsx', 'css', 'scss', 'html',
    'xml', 'yaml', 'yml', 'toml', 'py', 'rs', 'go', 'java', 'c', 'cpp',
    'cs', 'php', 'rb', 'swift', 'kt', 'dart', 'sh', 'bash', 'sql'
  ];
  const ext = getFileExtension(filePath);
  return textExtensions.includes(ext);
};
EOF

cat > apps/skide/src/utils/kodiiUtils.ts << 'EOF'
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const highlightText = (text: string, query: string): string => {
  if (!query) return text;
  const escapedQuery = escapeRegExp(query);
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};
EOF

print_status "Created utility files"

# Update existing files
echo
echo "🔄 Updating existing files..."

# Update package.json with new dependencies
if [ -f "apps/skide/package.json" ]; then
    print_info "Adding new dependencies to package.json..."
    
    # Check if dependencies need to be added
    if ! grep -q "@heroicons/react" apps/skide/package.json; then
        # Create a backup
        cp apps/skide/package.json apps/skide/package.json.backup
        
        # Add dependencies using jq if available, otherwise manual edit
        if command -v jq &> /dev/null; then
            tmp=$(mktemp)
            jq '.dependencies += {
                "@heroicons/react": "^2.0.18",
                "xterm": "^5.3.0",
                "xterm-addon-fit": "^0.8.0",
                "xterm-addon-web-links": "^0.9.0"
            }' apps/skide/package.json > "$tmp" && mv "$tmp" apps/skide/package.json
            print_status "Added dependencies using jq"
        else
            print_warning "jq not found. Please manually add these dependencies to apps/skide/package.json:"
            echo "  \"@heroicons/react\": \"^2.0.18\","
            echo "  \"xterm\": \"^5.3.0\","
            echo "  \"xterm-addon-fit\": \"^0.8.0\","
            echo "  \"xterm-addon-web-links\": \"^0.9.0\""
        fi
    else
        print_info "Dependencies already present in package.json"
    fi
fi

# Create barrel exports
echo
echo "📦 Creating barrel exports..."

cat > apps/skide/src/components/editor/index.ts << 'EOF'
export { MonacoEditor } from './MonacoEditor';
export { CodeActions } from './CodeActions';
export { FileExplorer } from './FileExplorer';
EOF

cat > apps/skide/src/components/terminal/index.ts << 'EOF'
export { TerminalPanel } from './TerminalPanel';
export { CommandPalette } from './CommandPalette';
export { OutputPanel } from './OutputPanel';
EOF

cat > apps/skide/src/components/workspace/index.ts << 'EOF'
export { WorkspaceLayout } from './WorkspaceLayout';
export { StatusBar } from './StatusBar';
EOF

cat > apps/skide/src/hooks/index.ts << 'EOF'
export { useMonacoIntegration } from './useMonacoIntegration';
export { useFileSystem } from './useFileSystem';
export { useTerminal } from './useTerminal';
EOF

cat > apps/skide/src/types/index.ts << 'EOF'
export * from './editor';
export * from './terminal';
export * from './kodii';
EOF

cat > apps/skide/src/utils/index.ts << 'EOF'
export * from './fileUtils';
export * from './kodiiUtils';
EOF

print_status "Created barrel exports"

# Create README for the components
cat > apps/skide/src/components/README.md << 'EOF'
# SKIDE Components

This directory contains all React components for the SKIDE Monaco integration.

## Structure

```
components/
├── editor/           # Monaco editor and related components
│   ├── MonacoEditor.tsx     # Main Monaco editor wrapper
│   ├── CodeActions.tsx      # Kodii AI code suggestions
│   └── FileExplorer.tsx     # File tree with AI integration
├── terminal/         # Terminal and command interface
│   ├── TerminalPanel.tsx    # Integrated terminal
│   ├── CommandPalette.tsx   # Kodii command interface
│   └── OutputPanel.tsx      # Command output display
└── workspace/        # Workspace layout and status
    ├── WorkspaceLayout.tsx  # Main layout container
    └── StatusBar.tsx        # IDE status bar
```

## Component Integration

All components are designed to work together through:
- Shared hooks (`useMonacoIntegration`, `useFileSystem`, `useTerminal`)
- Common type definitions (`types/`)
- Utility functions (`utils/`)

## Usage

Import components from their respective barrel exports:

```typescript
import { MonacoEditor, CodeActions, FileExplorer } from '../editor';
import { TerminalPanel, CommandPalette, OutputPanel } from '../terminal';
import { WorkspaceLayout, StatusBar } from '../workspace';
```
EOF

# Installation commands
echo
echo "📦 Installing dependencies..."

if command -v pnpm &> /dev/null; then
    print_info "Installing with pnpm..."
    cd apps/skide && pnpm install
    print_status "Dependencies installed"
else
    print_warning "pnpm not found. Please run: cd apps/skide && pnpm install"
fi

# Final file tree display
echo
echo "🌳 Complete File Tree Structure:"
echo "================================="

# Use tree command if available, otherwise use find
if command -v tree &> /dev/null; then
    tree apps/skide/src -I 'node_modules|dist|out'
else
    find apps/skide/src -type f -name "*.ts" -o -name "*.tsx" -o -name "*.md" | sort
fi

echo
echo "✨ SKIDE Monaco Integration Scaffold Complete!"
echo "=============================================="
echo
print_status "All component files created"
print_status "Directory structure established"
print_status "Type definitions added"
print_status "Utility functions created"
print_status "Barrel exports configured"

echo
echo "🎯 Next Steps:"
echo "1. Copy component code from artifacts into the created files"
echo "2. Update WorkspaceLayout.tsx to include new components"
echo "3. Add Electron IPC handlers for file system and terminal operations"
echo "4. Test the integration with: pnpm dev"

echo
echo "🔧 Manual Steps Required:"
echo "- Copy CodeActions.tsx content from artifact"
echo "- Copy FileExplorer.tsx content from artifact"
echo "- Copy CommandPalette.tsx content from artifact"
echo "- Copy OutputPanel.tsx content from artifact"
echo "- Copy StatusBar.tsx content from artifact"
echo "- Copy useMonacoIntegration.ts content from artifact"
echo "- Copy useFileSystem.ts content from artifact"
echo "- Copy useTerminal.ts content from artifact"

echo
print_info "Ready to ship VS Code-level functionality! 🚀"
