import type { ProjectIndex, IndexedFile, SearchResult } from '../types'

export class ProjectBrain {
  private db: any = null
  private isInitialized = false

  async initialize(): Promise<boolean> {
    try {
      // Mock database initialization
      // In real implementation, this would connect to SQLite or PostgreSQL
      console.log('Initializing Project Brain...')
      
      // Create mock database structure
      this.db = {
        projects: new Map<string, ProjectIndex>(),
        files: new Map<string, IndexedFile>(),
        embeddings: new Map<string, number[]>()
      }

      this.isInitialized = true
      console.log('Project Brain initialized successfully')
      return true
    } catch (error) {
      console.error('Failed to initialize Project Brain:', error)
      return false
    }
  }

  async indexProject(projectPath: string): Promise<boolean> {
    if (!this.isInitialized) {
      console.warn('Project Brain not initialized')
      return false
    }

    try {
      console.log(`Indexing project: ${projectPath}`)
      
      // Create project index
      const projectIndex: ProjectIndex = {
        id: this.generateProjectId(projectPath),
        projectPath,
        files: [],
        lastUpdated: Date.now()
      }

      // Index all files in project
      const files = await this.scanProjectFiles(projectPath)
      projectIndex.files = files

      // Store in mock database
      this.db.projects.set(projectPath, projectIndex)
      
      console.log(`Indexed ${files.length} files in project`)
      return true
    } catch (error) {
      console.error('Failed to index project:', error)
      return false
    }
  }

  async searchCode(query: string, projectPath?: string): Promise<SearchResult[]> {
    if (!this.isInitialized) {
      console.warn('Project Brain not initialized')
      return []
    }

    try {
      console.log(`Searching for: "${query}"`)
      
      // Mock search implementation
      const results: SearchResult[] = []
      const projects = projectPath 
        ? [this.db.projects.get(projectPath)].filter(Boolean)
        : Array.from(this.db.projects.values())

      for (const project of projects) {
        if (!project) continue
        
        for (const file of project.files) {
          const matches = this.findMatches(file.content, query)
          if (matches.length > 0) {
            results.push({
              file,
              score: this.calculateScore(file, query, matches),
              matches
            })
          }
        }
      }

      // Sort by relevance score
      results.sort((a, b) => b.score - a.score)
      
      console.log(`Found ${results.length} search results`)
      return results.slice(0, 50) // Limit results
    } catch (error) {
      console.error('Search failed:', error)
      return []
    }
  }

  async getProjectStats(projectPath: string): Promise<any> {
    const project = this.db?.projects.get(projectPath)
    if (!project) return null

    const stats = {
      totalFiles: project.files.length,
      languages: this.getLanguageStats(project.files),
      totalLines: project.files.reduce((sum, file) => 
        sum + file.content.split('\n').length, 0
      ),
      lastIndexed: new Date(project.lastUpdated).toLocaleString()
    }

    return stats
  }

  private async scanProjectFiles(projectPath: string): Promise<IndexedFile[]> {
    const files: IndexedFile[] = []
    
    try {
      // Mock file scanning - in real implementation, recursively scan directory
      const mockFiles = [
        {
          path: `${projectPath}/src/main.ts`,
          language: 'typescript',
          content: 'export function main() {\n  console.log("Hello SKIDE!");\n}'
        },
        {
          path: `${projectPath}/package.json`,
          language: 'json',
          content: '{\n  "name": "example-project",\n  "version": "1.0.0"\n}'
        },
        {
          path: `${projectPath}/README.md`,
          language: 'markdown',
          content: '# Example Project\n\nThis is a sample project for SKIDE.'
        }
      ]

      for (const mockFile of mockFiles) {
        const file: IndexedFile = {
          path: mockFile.path,
          content: mockFile.content,
          language: mockFile.language,
          lastModified: Date.now(),
          embeddings: await this.generateEmbeddings(mockFile.content)
        }
        files.push(file)
      }
    } catch (error) {
      console.error('Error scanning project files:', error)
    }

    return files
  }

  private async generateEmbeddings(content: string): Promise<number[]> {
    // Mock embedding generation
    // In real implementation, this would use a local embedding model
    const hash = this.simpleHash(content)
    const embeddings = Array.from({ length: 384 }, (_, i) => 
      Math.sin(hash + i) * 0.5 + 0.5
    )
    return embeddings
  }

  private findMatches(content: string, query: string): any[] {
    const lines = content.split('\n')
    const matches: any[] = []
    const lowerQuery = query.toLowerCase()

    lines.forEach((line, lineNumber) => {
      const lowerLine = line.toLowerCase()
      let startIndex = 0
      
      while (true) {
        const index = lowerLine.indexOf(lowerQuery, startIndex)
        if (index === -1) break
        
        matches.push({
          line: lineNumber + 1,
          content: line,
          startColumn: index,
          endColumn: index + query.length
        })
        
        startIndex = index + 1
      }
    })

    return matches
  }

  private calculateScore(file: IndexedFile, query: string, matches: any[]): number {
    let score = matches.length * 10 // Base score from match count
    
    // Boost score for exact matches
    const exactMatches = matches.filter(match => 
      match.content.toLowerCase() === query.toLowerCase()
    )
    score += exactMatches.length * 20
    
    // Boost score for matches in file name
    if (file.path.toLowerCase().includes(query.toLowerCase())) {
      score += 50
    }
    
    // Boost score for preferred file types
    const preferredExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.rs']
    if (preferredExtensions.some(ext => file.path.endsWith(ext))) {
      score += 10
    }
    
    return score
  }

  private getLanguageStats(files: IndexedFile[]): Record<string, number> {
    const stats: Record<string, number> = {}
    
    files.forEach(file => {
      stats[file.language] = (stats[file.language] || 0) + 1
    })
    
    return stats
  }

  private generateProjectId(projectPath: string): string {
    return `project_${this.simpleHash(projectPath).toString(36)}`
  }

  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }
}