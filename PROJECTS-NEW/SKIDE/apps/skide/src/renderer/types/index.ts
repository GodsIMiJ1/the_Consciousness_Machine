// Core types for SKIDE

export interface FileItem {
  name: string
  path: string
  isDirectory: boolean
  children?: FileItem[]
}

export interface EditorTab {
  id: string
  filePath: string
  filename: string
  content: string
  isDirty: boolean
  language: string
}

export interface GitStatus {
  current: string
  files: GitFileStatus[]
  ahead: number
  behind: number
}

export interface GitFileStatus {
  path: string
  status: string
  working_dir: string
  index: string
}

export interface GitCommit {
  hash: string
  date: string
  message: string
  author_name: string
  author_email: string
}

export interface TerminalSession {
  id: string
  cwd: string
  history: TerminalOutput[]
}

export interface TerminalOutput {
  type: 'command' | 'output' | 'error'
  content: string
  timestamp: number
}

// Kodii Command System
export interface KodiiCommand {
  id: string
  title: string
  description: string
  category: 'workflow' | 'code' | 'git' | 'project' | 'ai'
  shortcut?: string
  action: KodiiAction
}

export type KodiiAction = 
  | { type: 'draft-prd'; payload?: any }
  | { type: 'generate-task-graph'; payload?: any }
  | { type: 'scaffold-feature'; payload?: any }
  | { type: 'implement'; payload?: any }
  | { type: 'write-tests'; payload?: any }
  | { type: 'review-diff'; payload?: any }
  | { type: 'summarize-changes'; payload?: any }
  | { type: 'prepare-release'; payload?: any }
  | { type: 'custom'; payload?: any }

// Project Brain Types
export interface ProjectIndex {
  id: string
  projectPath: string
  files: IndexedFile[]
  lastUpdated: number
}

export interface IndexedFile {
  path: string
  content: string
  language: string
  embeddings?: number[]
  lastModified: number
}

export interface SearchResult {
  file: IndexedFile
  score: number
  matches: SearchMatch[]
}

export interface SearchMatch {
  line: number
  content: string
  startColumn: number
  endColumn: number
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

// Window API Types (from preload)
declare global {
  interface Window {
    api: {
      fs: {
        readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>
        writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>
        readDir: (dirPath: string) => Promise<{ success: boolean; items?: FileItem[]; error?: string }>
        exists: (filePath: string) => Promise<{ success: boolean; exists?: boolean }>
      }
      dialog: {
        openDirectory: () => Promise<{ canceled: boolean; filePaths: string[] }>
        openFile: () => Promise<{ canceled: boolean; filePaths: string[] }>
      }
      git: {
        status: (repoPath: string) => Promise<{ success: boolean; status?: any; error?: string }>
        log: (repoPath: string, options?: any) => Promise<{ success: boolean; log?: any; error?: string }>
        diff: (repoPath: string, options?: any) => Promise<{ success: boolean; diff?: string; error?: string }>
      }
      terminal: {
        spawn: (command: string, args: string[], options?: any) => Promise<{
          success: boolean
          code?: number
          stdout?: string
          stderr?: string
          error?: string
        }>
      }
    }
  }
}