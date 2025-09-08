import type { KodiiCommand } from '../../types'

export const kodiiCommands: KodiiCommand[] = [
  // Workflow Commands
  {
    id: 'draft-prd',
    title: 'Draft PRD',
    description: 'Generate a Product Requirements Document for your feature',
    category: 'workflow',
    shortcut: 'Ctrl+Shift+D',
    action: { type: 'draft-prd' }
  },
  {
    id: 'generate-task-graph',
    title: 'Generate Task Graph',
    description: 'Break down features into implementable tasks with dependencies',
    category: 'workflow',
    action: { type: 'generate-task-graph' }
  },
  {
    id: 'scaffold-feature',
    title: 'Scaffold Feature',
    description: 'Create boilerplate code structure for new features',
    category: 'workflow',
    action: { type: 'scaffold-feature' }
  },
  {
    id: 'implement',
    title: 'Implement',
    description: 'Generate implementation code based on specifications',
    category: 'code',
    action: { type: 'implement' }
  },
  {
    id: 'write-tests',
    title: 'Write Tests',
    description: 'Generate comprehensive test coverage for your code',
    category: 'code',
    shortcut: 'Ctrl+Shift+T',
    action: { type: 'write-tests' }
  },
  {
    id: 'review-diff',
    title: 'Review & Diff',
    description: 'Compare changes and get intelligent code review feedback',
    category: 'git',
    action: { type: 'review-diff' }
  },
  {
    id: 'summarize-changes',
    title: 'Summarize Changes',
    description: 'Generate conventional commit messages from your changes',
    category: 'git',
    action: { type: 'summarize-changes' }
  },
  {
    id: 'prepare-release',
    title: 'Prepare Release Notes',
    description: 'Generate changelog and release documentation',
    category: 'project',
    action: { type: 'prepare-release' }
  },
  
  // AI-Powered Code Commands
  {
    id: 'explain-code',
    title: 'Explain Code',
    description: 'Get AI explanation of selected code or current file',
    category: 'ai',
    action: { type: 'custom', payload: { command: 'explain' } }
  },
  {
    id: 'optimize-code',
    title: 'Optimize Code',
    description: 'Suggest performance and quality improvements',
    category: 'ai',
    action: { type: 'custom', payload: { command: 'optimize' } }
  },
  {
    id: 'find-bugs',
    title: 'Find Bugs',
    description: 'Analyze code for potential issues and vulnerabilities',
    category: 'ai',
    action: { type: 'custom', payload: { command: 'bugs' } }
  },
  {
    id: 'generate-docs',
    title: 'Generate Documentation',
    description: 'Create comprehensive documentation for your code',
    category: 'ai',
    action: { type: 'custom', payload: { command: 'docs' } }
  },
  
  // Project Commands
  {
    id: 'analyze-project',
    title: 'Analyze Project',
    description: 'Get insights about project structure and dependencies',
    category: 'project',
    action: { type: 'custom', payload: { command: 'analyze' } }
  },
  {
    id: 'search-codebase',
    title: 'Search Codebase',
    description: 'Semantic search across all project files',
    category: 'project',
    shortcut: 'Ctrl+Shift+F',
    action: { type: 'custom', payload: { command: 'search' } }
  }
]

export const getCommandsByCategory = (category: string): KodiiCommand[] => {
  return kodiiCommands.filter(cmd => cmd.category === category)
}

export const searchCommands = (query: string): KodiiCommand[] => {
  const lowerQuery = query.toLowerCase()
  return kodiiCommands.filter(cmd => 
    cmd.title.toLowerCase().includes(lowerQuery) ||
    cmd.description.toLowerCase().includes(lowerQuery)
  )
}