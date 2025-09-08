// Kodii AI System Types

export interface KodiiSession {
  id: string
  projectId: string | null
  sessionType: string
  status: 'active' | 'completed' | 'cancelled' | 'error'
  contextData: string | null
  createdAt: number
  updatedAt: number
}

export interface KodiiMessage {
  id: string
  sessionId: string
  messageType: 'user' | 'kodii' | 'system'
  content: string
  metadata: string | null
  createdAt: number
}

export interface Artifact {
  id: string
  sessionId: string
  artifactType: 'prd' | 'task-graph' | 'code' | 'test' | 'docs' | 'scaffold'
  name: string
  description: string | null
  content: string
  filePath: string | null
  status: 'draft' | 'approved' | 'implemented' | 'rejected'
  createdAt: number
  updatedAt: number
}

export interface KodiiCommand {
  id: string
  name: string
  description: string
  category: 'workflow' | 'code' | 'git' | 'project' | 'ai'
  requiredContext?: string[]
  outputArtifacts?: string[]
}

export interface ProjectContext {
  projectId: string
  projectPath: string
  language: string
  framework?: string
  dependencies: string[]
  fileStructure: FileNode[]
  gitStatus?: GitStatus
  recentChanges?: string[]
}

export interface FileNode {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: FileNode[]
  language?: string
  size?: number
  lastModified?: number
}

export interface GitStatus {
  branch: string
  ahead: number
  behind: number
  staged: string[]
  unstaged: string[]
  untracked: string[]
}

export interface CodeAnalysis {
  complexity: number
  maintainability: number
  testCoverage: number
  dependencies: string[]
  patterns: string[]
  issues: CodeIssue[]
}

export interface CodeIssue {
  type: 'error' | 'warning' | 'info'
  severity: 'high' | 'medium' | 'low'
  message: string
  file: string
  line: number
  column: number
  rule?: string
}

export interface TaskNode {
  id: string
  title: string
  description: string
  estimate: number // hours
  dependencies: string[]
  assignee?: string
  status: 'todo' | 'in-progress' | 'done' | 'blocked'
  artifacts: string[]
}

export interface TaskGraph {
  id: string
  name: string
  description: string
  tasks: TaskNode[]
  totalEstimate: number
  criticalPath: string[]
  createdAt: number
}

export interface KodiiCapability {
  id: string
  name: string
  description: string
  category: string
  enabled: boolean
  modelRequired?: string
  localOnly: boolean
}

export interface ModelInfo {
  id: string
  name: string
  type: 'language' | 'embedding' | 'code' | 'specialized'
  size: number
  quantization?: string
  localPath?: string
  remoteUrl?: string
  capabilities: string[]
}