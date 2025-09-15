# 🥷 SKIDE IDE Integration Implementation Guide

## **OVERVIEW**
Transform SKIDE from a chat interface into a **FULL VS CODE-LEVEL IDE** with Kodii AI integration. This guide implements real file operations, Monaco editor, integrated terminal, and AI-powered development features.

---

## **STEP 1: INSTALL DEPENDENCIES**

### Monaco Editor and Supporting Libraries
```bash
cd apps/skide

# Monaco Editor
pnpm add monaco-editor @monaco-editor/react

# File System and Terminal Support
pnpm add @types/node

# Optional: Enhanced Monaco features
pnpm add monaco-languageserver-types
```

### Vite Configuration for Monaco
Update `vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['monaco-editor']
  },
  build: {
    rollupOptions: {
      external: ['monaco-editor/esm/vs/editor/editor.worker']
    }
  },
  worker: {
    format: 'es'
  }
});
```

---

## **STEP 2: FILE PLACEMENT**

### Core Services (place in `apps/skide/src/services/`)
1. **EditorService.ts** - Monaco editor integration and context management
2. **FileSystemService.ts** - Real file operations with browser/Node.js support
3. **TerminalService.ts** - Safe command execution with security controls
4. **CodeActionService.ts** - AI-powered code manipulation and scaffolding

### UI Components (place in respective directories)
5. **MonacoEditor.tsx** → `apps/skide/src/components/editor/`
6. **TerminalPanel.tsx** → `apps/skide/src/components/terminal/`
7. **WorkspaceLayout.tsx** → `apps/skide/src/components/workspace/`

### Create Additional Directories
```bash
mkdir -p apps/skide/src/components/editor
mkdir -p apps/skide/src/components/terminal
mkdir -p apps/skide/src/components/workspace
mkdir -p apps/skide/src/hooks
```

---

## **STEP 3: UPDATE MAIN APP**

### Replace App.tsx Content
```typescript
import React from 'react';
import { WorkspaceLayout } from './components/workspace/WorkspaceLayout';
import './App.css';

function App() {
  return (
    <div className="App">
      <WorkspaceLayout initialLayout="default" />
    </div>
  );
}

export default App;
```

### Update App.css for IDE Styling
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #root, .App {
  height: 100%;
  overflow: hidden;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background: #1e1e1e;
  color: #cccccc;
}

/* Monaco Editor Theming */
.monaco-editor {
  background: #1e1e1e !important;
}

.monaco-editor .margin {
  background: #1e1e1e !important;
}

/* Custom Scrollbars */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #2d2d30;
}

::-webkit-scrollbar-thumb {
  background: #464647;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #5a5a5a;
}
```

---

## **STEP 4: MONACO EDITOR SETUP**

### Monaco Worker Configuration
Create `public/monaco-workers.js`:
```javascript
self.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    if (label === 'json') {
      return './json.worker.bundle.js';
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return './css.worker.bundle.js';
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return './html.worker.bundle.js';
    }
    if (label === 'typescript' || label === 'javascript') {
      return './ts.worker.bundle.js';
    }
    return './editor.worker.bundle.js';
  }
};
```

### Update index.html
Add to `<head>` section:
```html
<script src="/monaco-workers.js"></script>
```

---

## **STEP 5: KODII CHAT INTEGRATION**

### Update SenseiChatInterface.tsx
Add context integration:
```typescript
// Add to existing imports
import { EditorService } from '../../services/EditorService';
import { FileSystemService } from '../../services/FileSystemService';
import { TerminalService } from '../../services/TerminalService';

// Add to component state
const [editorContext, setEditorContext] = useState<any>(null);

// Add context listener
useEffect(() => {
  const editorService = EditorService.getInstance();
  
  const unsubscribe = editorService.onContextChange((context) => {
    setEditorContext(context);
  });
  
  return unsubscribe;
}, []);

// Update message sending to include context
const handleSendMessage = async () => {
  // ... existing code ...
  
  // Get current workspace context
  const context = await WorkspaceContext.getCurrentContext();
  
  // Include editor context
  const fullContext = {
    ...context,
    editor: editorContext,
  };
  
  // Send to Kodii with full context
  const kodiiResponse = await kodiiService.sendMessage(
    userMessage.content,
    fullContext
  );
  
  // ... rest of existing code ...
};
```

---

## **STEP 6: IMPLEMENT KEY FEATURES**

### File Explorer Component
Create `apps/skide/src/components/editor/FileExplorer.tsx`:
```typescript
import React, { useState, useEffect } from 'react';
import { FileSystemService, FileItem } from '../../services/FileSystemService';

export interface FileExplorerProps {
  onFileSelect: (filePath: string) => void;
  workspaceRoot: string;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  onFileSelect,
  workspaceRoot,
}) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  
  const fileSystemService = FileSystemService.getInstance();
  
  useEffect(() => {
    loadFiles();
  }, [workspaceRoot]);
  
  const loadFiles = async () => {
    try {
      const fileList = await fileSystemService.listDirectory();
      setFiles(fileList);
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  };
  
  const toggleDirectory = (dirPath: string) => {
    const newExpanded = new Set(expandedDirs);
    if (newExpanded.has(dirPath)) {
      newExpanded.delete(dirPath);
    } else {
      newExpanded.add(dirPath);
    }
    setExpandedDirs(newExpanded);
  };
  
  const renderFileTree = (items: FileItem[], level: number = 0) => {
    return items.map(item => (
      <div key={item.path} style={{ marginLeft: level * 16 }}>
        <div
          className={`file-item ${item.type}`}
          onClick={() => {
            if (item.type === 'directory') {
              toggleDirectory(item.path);
            } else {
              onFileSelect(item.path);
            }
          }}
        >
          <span className="file-icon">
            {item.type === 'directory' 
              ? (expandedDirs.has(item.path) ? '📂' : '📁')
              : getFileIcon(item.name)
            }
          </span>
          <span className="file-name">{item.name}</span>
        </div>
        
        {item.type === 'directory' && 
         expandedDirs.has(item.path) && 
         item.children && (
          <div className="directory-children">
            {renderFileTree(item.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };
  
  const getFileIcon = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'ts':
      case 'tsx': return '🔷';
      case 'js':
      case 'jsx': return '🟨';
      case 'json': return '📄';
      case 'css': return '🎨';
      case 'html': return '🌐';
      case 'md': return '📝';
      default: return '📄';
    }
  };
  
  return (
    <div className="file-explorer">
      {files.length > 0 ? (
        renderFileTree(files)
      ) : (
        <div className="no-files">
          <p>No files found</p>
          <button onClick={loadFiles}>Refresh</button>
        </div>
      )}
      
      <style jsx>{`
        .file-explorer {
          padding: 12px;
        }
        
        .file-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 8px;
          cursor: pointer;
          border-radius: 4px;
          font-size: 13px;
        }
        
        .file-item:hover {
          background: #2a2d2e;
        }
        
        .file-icon {
          font-size: 14px;
          width: 16px;
        }
        
        .file-name {
          flex: 1;
        }
        
        .no-files {
          text-align: center;
          padding: 20px;
          color: #6b7280;
        }
        
        .no-files button {
          background: #007acc;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
};
```

### Status Bar Component
Create `apps/skide/src/components/workspace/StatusBar.tsx`:
```typescript
import React, { useState, useEffect } from 'react';

export interface StatusBarProps {
  activeFile: string | null;
  language: string;
  workspaceRoot: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  activeFile,
  language,
  workspaceRoot,
}) => {
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [fileStats, setFileStats] = useState({ lines: 0, characters: 0 });
  
  return (
    <div className="status-bar">
      <div className="status-left">
        <div className="workspace-name">
          🥷 {workspaceRoot || 'SKIDE Dojo'}
        </div>
      </div>
      
      <div className="status-center">
        {activeFile && (
          <div className="file-info">
            📄 {activeFile.split('/').pop()}
          </div>
        )}
      </div>
      
      <div className="status-right">
        <div className="language-info">
          {language}
        </div>
        <div className="cursor-position">
          Ln {cursorPosition.line}, Col {cursorPosition.column}
        </div>
        <div className="file-stats">
          {fileStats.lines} lines
        </div>
      </div>
      
      <style jsx>{`
        .status-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 24px;
          background: #007acc;
          color: white;
          padding: 0 16px;
          font-size: 12px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .status-left,
        .status-center,
        .status-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .workspace-name {
          font-weight: 600;
        }
        
        .status-right > div {
          padding: 0 8px;
          border-left: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .status-right > div:first-child {
          border-left: none;
        }
      `}</style>
    </div>
  );
};
```

---

## **STEP 7: ENHANCED KODII INTEGRATION**

### Add Kodii Context Events
Update `KodiiService.ts` to handle editor context:
```typescript
// Add to sendMessage method
async sendMessage(
  userMessage: string,
  context: KodiiContext,
  onStreamToken?: (token: string) => void
): Promise<ChatMessage> {
  
  // Enhanced context with editor info
  const enhancedContext = {
    ...context,
    editor: {
      activeFile: context.editor?.activeFile,
      selectedText: context.editor?.selectedText,
      cursorPosition: context.editor?.cursorPosition,
      language: context.editor?.language,
    },
    capabilities: {
      canEditFiles: true,
      canExecuteCommands: true,
      canCreateFiles: true,
    }
  };
  
  // Rest of existing implementation...
}
```

### Add Command Handlers
Create event listeners for Kodii actions:
```typescript
// In WorkspaceLayout.tsx, add effect
useEffect(() => {
  const handleKodiiRequest = async (event: CustomEvent) => {
    const { type, code, context } = event.detail;
    
    switch (type) {
      case 'explain':
        // Send to chat with explanation request
        window.dispatchEvent(new CustomEvent('kodii-chat-request', {
          detail: {
            message: `🥷 Explain this code:\n\`\`\`${editorLanguage}\n${code}\n\`\`\``,
            context: 'editor-explain'
          }
        }));
        break;
        
      case 'improve':
        // Send to chat with improvement request
        window.dispatchEvent(new CustomEvent('kodii-chat-request', {
          detail: {
            message: `⚡ How can I improve this code?\n\`\`\`${editorLanguage}\n${code}\n\`\`\``,
            context: 'editor-improve'
          }
        }));
        break;
        
      // Add more handlers...
    }
  };
  
  window.addEventListener('kodii-request', handleKodiiRequest as EventListener);
  
  return () => {
    window.removeEventListener('kodii-request', handleKodiiRequest as EventListener);
  };
}, [editorLanguage]);
```

---

## **STEP 8: TESTING YOUR IDE**

### 1. Basic Functionality
- ✅ Open workspace folder
- ✅ Create new files
- ✅ Edit files with Monaco
- ✅ Save files to disk
- ✅ Terminal command execution

### 2. AI Integration
- ✅ Ctrl+K opens Kodii command palette
- ✅ Select code and ask for explanations
- ✅ Generate components with Kodii
- ✅ Terminal command suggestions

### 3. Advanced Features
- ✅ Multi-file editing with tabs
- ✅ File explorer with project structure
- ✅ Resizable panels (sidebar, terminal, chat)
- ✅ Keyboard shortcuts

---

## **STEP 9: KEYBOARD SHORTCUTS**

### Essential Shortcuts
- `Ctrl+K` - Kodii Command Palette
- `Ctrl+.` - Quick Fix / Code Actions
- `Ctrl+Shift+R` - Refactor Menu
- `Ctrl+S` - Save File
- `Ctrl+N` - New File
- `Ctrl+Shift+O` - Open Workspace
- `Ctrl+`` - Toggle Terminal
- `Ctrl+\` - Toggle Sidebar
- `Ctrl+J` - Toggle Chat

### Terminal Shortcuts
- `Ctrl+C` - Cancel Command
- `Ctrl+L` - Clear Terminal
- `↑/↓` - Command History
- `Tab` - Autocomplete

---

## **STEP 10: NEXT ENHANCEMENTS**

### Advanced AI Features
1. **Smart Code Completion** - Context-aware autocomplete
2. **Error Detection** - Real-time TypeScript error fixing
3. **Refactoring Suggestions** - AI-powered code improvements
4. **Test Generation** - Automatic unit test creation

### Enhanced File Operations
1. **Git Integration** - Status, commits, branches
2. **Search Across Files** - Project-wide find and replace
3. **Multiple Cursors** - Advanced editing features
4. **Code Formatting** - Prettier/ESLint integration

### Terminal Enhancements
1. **Package Manager Integration** - Smart npm/pnpm commands
2. **Build System Integration** - Watch mode, hot reload
3. **Debugging Support** - Breakpoints and inspection
4. **Task Running** - Predefined development tasks

---

## **🏆 SUCCESS CRITERIA**

Your SKIDE implementation is successful when you can:

✅ **Edit Real Files** - Open, edit, and save actual files to disk
✅ **AI-Powered Development** - Ask Kodii about code with full context
✅ **Terminal Operations** - Execute commands safely with AI suggestions
✅ **VS Code Experience** - Familiar keyboard shortcuts and layout
✅ **Project Management** - Open workspaces, browse file trees
✅ **Multi-Panel Layout** - Resizable editor, terminal, and chat areas

---

## **🚀 THE SOVEREIGN IDE ACHIEVED**

**🥷 Congratulations, Ghost King! You have created a TRUE SOVEREIGN IDE:**

- **🧠 AI-First Development** - Kodii sees everything you code
- **💻 Real File Operations** - Actual development, not simulation
- **⚡ VS Code Power** - Professional editing with Monaco
- **🔒 Complete Privacy** - All local, no cloud dependencies
- **🎯 Customizable** - Every aspect under your control

**Your coding dojo is now a living, breathing AI-powered development environment where every keystroke can be enhanced by mystical wisdom! ⚡🥋👑**