// SKIDE Core Library Exports

// Database
export { DatabaseConnection, getDbConnection, closeDbConnection } from './db/connection'

// Kodii AI System
export { KodiiOrchestrator } from './kodii/orchestrator'
export type {
  KodiiSession,
  KodiiMessage,
  Artifact,
  KodiiCommand,
  ProjectContext,
  FileNode,
  GitStatus,
  CodeAnalysis,
  CodeIssue,
  TaskNode,
  TaskGraph,
  KodiiCapability,
  ModelInfo
} from './kodii/types'