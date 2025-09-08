interface ProjectBrainConfig {
  dbPath: string;
}

interface IndexedFile {
  path: string;
  content: string;
  lastModified: number;
  tokens: string[];
}

interface SearchResult {
  path: string;
  score: number;
  matches: string[];
}

export class ProjectBrain {
  private config: ProjectBrainConfig;
  private index: Map<string, IndexedFile> = new Map();

  constructor(config: ProjectBrainConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    // Initialize database connection
    // For MVP, using in-memory storage
    console.log('ProjectBrain initialized');
  }

  async indexFile(filePath: string): Promise<void> {
    try {
      // In a real implementation, this would read the file
      // For MVP, we'll simulate file indexing
      const mockContent = `// Mock content for ${filePath}`;
      const tokens = this.tokenize(mockContent);
      
      const indexedFile: IndexedFile = {
        path: filePath,
        content: mockContent,
        lastModified: Date.now(),
        tokens
      };

      this.index.set(filePath, indexedFile);
      console.log(`Indexed file: ${filePath}`);
    } catch (error) {
      console.error(`Failed to index file ${filePath}:`, error);
    }
  }

  async search(query: string): Promise<SearchResult[]> {
    const queryTokens = this.tokenize(query.toLowerCase());
    const results: SearchResult[] = [];

    for (const [path, file] of this.index) {
      const matches = queryTokens.filter(token => 
        file.tokens.some(fileToken => fileToken.includes(token))
      );

      if (matches.length > 0) {
        const score = matches.length / queryTokens.length;
        results.push({
          path,
          score,
          matches
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  private tokenize(content: string): string[] {
    return content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2);
  }

  async getFileContent(filePath: string): Promise<string | null> {
    const file = this.index.get(filePath);
    return file ? file.content : null;
  }

  async removeFile(filePath: string): Promise<boolean> {
    return this.index.delete(filePath);
  }

  async listIndexedFiles(): Promise<string[]> {
    return Array.from(this.index.keys());
  }
}
