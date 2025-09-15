import { EditorService, CodeAction, EditorContext } from './EditorService';
import { FileSystemService } from './FileSystemService';
import { TerminalService } from './TerminalService';
import * as monaco from 'monaco-editor';

export interface KodiiAction {
  id: string;
  title: string;
  description: string;
  type: 'code' | 'file' | 'terminal' | 'workspace';
  actions: CodeAction[];
  commands?: string[];
  files?: { path: string; content: string }[];
  confidence: number;
}

export interface CodeSuggestion {
  range: monaco.Range;
  suggestion: string;
  reason: string;
  type: 'fix' | 'improvement' | 'completion' | 'refactor';
}

export class CodeActionService {
  private static instance: CodeActionService;
  private editorService: EditorService;
  private fileSystemService: FileSystemService;
  private terminalService: TerminalService;
  private pendingActions = new Map<string, KodiiAction>();

  static getInstance(): CodeActionService {
    if (!CodeActionService.instance) {
      CodeActionService.instance = new CodeActionService();
    }
    return CodeActionService.instance;
  }

  constructor() {
    this.editorService = EditorService.getInstance();
    this.fileSystemService = FileSystemService.getInstance();
    this.terminalService = TerminalService.getInstance();
  }

  // Apply a single code action
  async applyCodeAction(action: CodeAction): Promise<boolean> {
    try {
      return await this.editorService.applyCodeAction(action);
    } catch (error) {
      console.error('Failed to apply code action:', error);
      return false;
    }
  }

  // Apply multiple related actions as a transaction
  async applyKodiiAction(kodiiAction: KodiiAction): Promise<boolean> {
    console.log(`🥷 Applying Kodii action: ${kodiiAction.title}`);
    
    try {
      // Apply code changes
      for (const action of kodiiAction.actions) {
        const success = await this.applyCodeAction(action);
        if (!success) {
          throw new Error(`Failed to apply action: ${action.description}`);
        }
      }

      // Execute terminal commands
      if (kodiiAction.commands) {
        for (const command of kodiiAction.commands) {
          await this.terminalService.executeAISuggestion(
            command,
            `Part of: ${kodiiAction.title}`
          );
        }
      }

      // Create/update files
      if (kodiiAction.files) {
        for (const file of kodiiAction.files) {
          await this.fileSystemService.writeFile(file.path, file.content);
        }
      }

      // Remove from pending actions
      this.pendingActions.delete(kodiiAction.id);

      console.log(`✅ Successfully applied: ${kodiiAction.title}`);
      return true;

    } catch (error) {
      console.error(`❌ Failed to apply Kodii action: ${error.message}`);
      return false;
    }
  }

  // Create a new React component
  async createReactComponent(
    componentName: string,
    props: string[] = [],
    directory: string = 'src/components'
  ): Promise<KodiiAction> {
    const fileName = `${componentName}.tsx`;
    const filePath = `${directory}/${fileName}`;
    
    const propsInterface = props.length > 0 
      ? `interface ${componentName}Props {\n  ${props.map(prop => `${prop}: any;`).join('\n  ')}\n}\n\n`
      : '';
    
    const propsParam = props.length > 0 ? `{ ${props.join(', ')} }: ${componentName}Props` : '';
    
    const componentContent = `import React from 'react';

${propsInterface}export const ${componentName}: React.FC${props.length > 0 ? `<${componentName}Props>` : ''} = (${propsParam}) => {
  return (
    <div className="${componentName.toLowerCase()}">
      <h2>${componentName}</h2>
      {/* Component content here */}
    </div>
  );
};
`;

    return {
      id: `create-component-${Date.now()}`,
      title: `Create ${componentName} Component`,
      description: `Create a new React component with ${props.length} props`,
      type: 'file',
      actions: [],
      files: [{ path: filePath, content: componentContent }],
      confidence: 0.9,
    };
  }

  // Add imports to current file
  async addImports(imports: string[]): Promise<KodiiAction> {
    const context = this.editorService.getCurrentContext();
    if (!context) {
      throw new Error('No active editor context');
    }

    const existingImports = this.extractExistingImports(context.content);
    const newImports = imports.filter(imp => !existingImports.includes(imp));
    
    if (newImports.length === 0) {
      throw new Error('All imports already exist');
    }

    const importStatements = newImports.join('\n') + '\n';
    const insertPosition = this.findImportInsertPosition(context.content);

    return {
      id: `add-imports-${Date.now()}`,
      title: 'Add Missing Imports',
      description: `Add ${newImports.length} import statements`,
      type: 'code',
      actions: [{
        type: 'insert',
        range: new monaco.Range(insertPosition, 1, insertPosition, 1),
        content: importStatements,
        description: 'Insert import statements',
      }],
      confidence: 0.95,
    };
  }

  // Fix TypeScript errors
  async fixTypeScriptErrors(): Promise<KodiiAction[]> {
    const context = this.editorService.getCurrentContext();
    if (!context) return [];

    const actions: KodiiAction[] = [];
    
    for (const problem of context.problems) {
      if (problem.severity === monaco.MarkerSeverity.Error) {
        const fix = await this.generateErrorFix(problem, context);
        if (fix) {
          actions.push(fix);
        }
      }
    }

    return actions;
  }

  // Refactor function to use hooks
  async refactorToHooks(functionName: string): Promise<KodiiAction> {
    const context = this.editorService.getCurrentContext();
    if (!context) {
      throw new Error('No active editor context');
    }

    // Find the function to refactor
    const functionRange = this.findFunctionRange(context.content, functionName);
    if (!functionRange) {
      throw new Error(`Function ${functionName} not found`);
    }

    const originalFunction = context.content.substring(
      this.getPositionOffset(context.content, functionRange.getStartPosition()),
      this.getPositionOffset(context.content, functionRange.getEndPosition())
    );

    const refactoredFunction = this.convertClassComponentToHooks(originalFunction);

    return {
      id: `refactor-hooks-${Date.now()}`,
      title: `Refactor ${functionName} to Hooks`,
      description: 'Convert class component to functional component with hooks',
      type: 'code',
      actions: [{
        type: 'replace',
        range: functionRange,
        content: refactoredFunction,
        description: 'Replace with hooks-based implementation',
      }],
      confidence: 0.8,
    };
  }

  // Generate unit tests
  async generateTests(functionName?: string): Promise<KodiiAction> {
    const context = this.editorService.getCurrentContext();
    if (!context) {
      throw new Error('No active editor context');
    }

    const testFileName = context.activeFile?.replace(/\.(ts|tsx)$/, '.test.$1') || 'component.test.tsx';
    const testFilePath = context.activeFile?.replace(/^src\//, 'src/__tests__/') || '__tests__/component.test.tsx';

    let testContent: string;
    
    if (functionName) {
      testContent = this.generateFunctionTests(functionName, context);
    } else {
      testContent = this.generateComponentTests(context);
    }

    return {
      id: `generate-tests-${Date.now()}`,
      title: `Generate Tests${functionName ? ` for ${functionName}` : ''}`,
      description: 'Create comprehensive unit tests',
      type: 'file',
      actions: [],
      files: [{ path: testFilePath, content: testContent }],
      confidence: 0.85,
    };
  }

  // Optimize performance
  async optimizePerformance(): Promise<KodiiAction[]> {
    const context = this.editorService.getCurrentContext();
    if (!context) return [];

    const optimizations: KodiiAction[] = [];

    // Check for React.memo opportunities
    const memoSuggestion = this.suggestReactMemo(context);
    if (memoSuggestion) optimizations.push(memoSuggestion);

    // Check for useMemo/useCallback opportunities
    const hookOptimizations = this.suggestHookOptimizations(context);
    optimizations.push(...hookOptimizations);

    // Check for unnecessary re-renders
    const rerenderFixes = this.suggestRerenderFixes(context);
    optimizations.push(...rerenderFixes);

    return optimizations;
  }

  // Setup project structure
  async scaffoldProject(projectType: 'react' | 'node' | 'nextjs'): Promise<KodiiAction> {
    const files: { path: string; content: string }[] = [];
    const commands: string[] = [];

    switch (projectType) {
      case 'react':
        files.push(
          { path: 'src/App.tsx', content: this.getReactAppTemplate() },
          { path: 'src/index.tsx', content: this.getReactIndexTemplate() },
          { path: 'package.json', content: this.getReactPackageTemplate() },
          { path: 'tsconfig.json', content: this.getTsConfigTemplate() },
          { path: '.gitignore', content: this.getGitIgnoreTemplate() }
        );
        commands.push('pnpm install');
        break;
      
      case 'node':
        files.push(
          { path: 'src/index.ts', content: this.getNodeIndexTemplate() },
          { path: 'package.json', content: this.getNodePackageTemplate() },
          { path: 'tsconfig.json', content: this.getTsConfigTemplate() }
        );
        commands.push('pnpm install');
        break;
      
      case 'nextjs':
        files.push(
          { path: 'pages/index.tsx', content: this.getNextJsPageTemplate() },
          { path: 'package.json', content: this.getNextJsPackageTemplate() },
          { path: 'next.config.js', content: this.getNextConfigTemplate() }
        );
        commands.push('pnpm install');
        break;
    }

    return {
      id: `scaffold-${projectType}-${Date.now()}`,
      title: `Scaffold ${projectType} Project`,
      description: `Create complete ${projectType} project structure`,
      type: 'workspace',
      actions: [],
      files,
      commands,
      confidence: 0.9,
    };
  }

  // Get pending actions
  getPendingActions(): KodiiAction[] {
    return Array.from(this.pendingActions.values());
  }

  // Store action for later execution
  storePendingAction(action: KodiiAction): void {
    this.pendingActions.set(action.id, action);
  }

  // Helper methods
  private extractExistingImports(content: string): string[] {
    const importRegex = /^import\s+.*?from\s+['"](.+?)['"];?$/gm;
    const imports: string[] = [];
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  private findImportInsertPosition(content: string): number {
    const lines = content.split('\n');
    let insertLine = 1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('import ')) {
        insertLine = i + 2; // After the last import
      } else if (line && !line.startsWith('//') && !line.startsWith('/*')) {
        break;
      }
    }
    
    return insertLine;
  }

  private async generateErrorFix(problem: monaco.editor.IMarker, context: EditorContext): Promise<KodiiAction | null> {
    // This would contain AI logic to analyze TypeScript errors and generate fixes
    // For now, return a simple example
    if (problem.message.includes('Cannot find name')) {
      const missingVar = problem.message.match(/'(.+?)'/)?.[1];
      if (missingVar) {
        return {
          id: `fix-undefined-${Date.now()}`,
          title: `Fix undefined variable: ${missingVar}`,
          description: `Add declaration for ${missingVar}`,
          type: 'code',
          actions: [{
            type: 'insert',
            range: new monaco.Range(problem.startLineNumber, 1, problem.startLineNumber, 1),
            content: `const ${missingVar} = undefined; // TODO: Define this variable\n`,
            description: 'Add variable declaration',
          }],
          confidence: 0.7,
        };
      }
    }
    
    return null;
  }

  private findFunctionRange(content: string, functionName: string): monaco.Range | null {
    // Simple regex to find function - would need more sophisticated parsing
    const functionRegex = new RegExp(`(function\\s+${functionName}|const\\s+${functionName}\\s*=|${functionName}\\s*[=:]\\s*function)`, 'g');
    const match = functionRegex.exec(content);
    
    if (match) {
      const lines = content.substring(0, match.index).split('\n');
      const startLine = lines.length;
      // Would need to find the end of the function properly
      return new monaco.Range(startLine, 1, startLine + 10, 1);
    }
    
    return null;
  }

  private getPositionOffset(content: string, position: monaco.Position): number {
    const lines = content.split('\n');
    let offset = 0;
    
    for (let i = 0; i < position.lineNumber - 1; i++) {
      offset += lines[i].length + 1; // +1 for newline
    }
    
    return offset + position.column - 1;
  }

  private convertClassComponentToHooks(classComponent: string): string {
    // Simple conversion example - would need more sophisticated transformation
    return classComponent
      .replace(/class\s+(\w+)\s+extends\s+React\.Component/g, 'const $1: React.FC = () =>')
      .replace(/this\.state\s*=/g, 'const [state, setState] = useState')
      .replace(/this\.setState/g, 'setState')
      .replace(/render\(\)\s*{/g, 'return (')
      .replace(/componentDidMount\(\)\s*{/g, 'useEffect(() => {');
  }

  private generateFunctionTests(functionName: string, context: EditorContext): string {
    return `import { ${functionName} } from './${context.activeFile?.replace(/\.(ts|tsx)$/, '') || 'index'}';

describe('${functionName}', () => {
  it('should work correctly', () => {
    // Test implementation here
    expect(${functionName}).toBeDefined();
  });

  it('should handle edge cases', () => {
    // Edge case tests here
  });
});
`;
  }

  private generateComponentTests(context: EditorContext): string {
    const componentName = this.extractComponentName(context.content);
    return `import React from 'react';
import { render, screen } from '@testing-library/react';
import { ${componentName} } from './${context.activeFile?.replace(/\.(ts|tsx)$/, '') || 'index'}';

describe('${componentName}', () => {
  it('renders correctly', () => {
    render(<${componentName} />);
    expect(screen.getByText('${componentName}')).toBeInTheDocument();
  });

  it('handles props correctly', () => {
    // Props testing here
  });
});
`;
  }

  private extractComponentName(content: string): string {
    const match = content.match(/export\s+(?:const|function)\s+(\w+)/);
    return match?.[1] || 'Component';
  }

  private suggestReactMemo(context: EditorContext): KodiiAction | null {
    // Logic to detect if React.memo would be beneficial
    return null;
  }

  private suggestHookOptimizations(context: EditorContext): KodiiAction[] {
    // Logic to suggest useMemo/useCallback optimizations
    return [];
  }

  private suggestRerenderFixes(context: EditorContext): KodiiAction[] {
    // Logic to suggest fixes for unnecessary re-renders
    return [];
  }

  // Template methods
  private getReactAppTemplate(): string {
    return `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>🥷 SKIDE React App</h1>
      <p>Your sovereign development journey begins here!</p>
    </div>
  );
}

export default App;
`;
  }

  private getReactIndexTemplate(): string {
    return `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
  }

  private getReactPackageTemplate(): string {
    return JSON.stringify({
      name: 'skide-react-app',
      version: '1.0.0',
      private: true,
      dependencies: {
        'react': '^18.2.0',
        'react-dom': '^18.2.0',
        'typescript': '^5.0.0',
        '@types/react': '^18.2.0',
        '@types/react-dom': '^18.2.0'
      },
      scripts: {
        'start': 'react-scripts start',
        'build': 'react-scripts build',
        'test': 'react-scripts test',
        'eject': 'react-scripts eject'
      },
      eslintConfig: {
        extends: ['react-app', 'react-app/jest']
      }
    }, null, 2);
  }

  private getTsConfigTemplate(): string {
    return JSON.stringify({
      compilerOptions: {
        target: 'es5',
        lib: ['dom', 'dom.iterable', 'es6'],
        allowJs: true,
        skipLibCheck: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        moduleResolution: 'node',
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: 'react-jsx'
      },
      include: ['src']
    }, null, 2);
  }

  private getGitIgnoreTemplate(): string {
    return `# Dependencies
node_modules/

# Build outputs
dist/
build/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db
`;
  }

  private getNodeIndexTemplate(): string {
    return `import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    message: '🥷 SKIDE Node.js Server',
    status: 'Sovereign and operational!'
  });
});

app.listen(port, () => {
  console.log(\`🥷 Server running on port \${port}\`);
});
`;
  }

  private getNodePackageTemplate(): string {
    return JSON.stringify({
      name: 'skide-node-app',
      version: '1.0.0',
      description: 'SKIDE Node.js application',
      main: 'dist/index.js',
      scripts: {
        'start': 'node dist/index.js',
        'dev': 'ts-node src/index.ts',
        'build': 'tsc',
        'test': 'jest'
      },
      dependencies: {
        'express': '^4.18.0'
      },
      devDependencies: {
        'typescript': '^5.0.0',
        'ts-node': '^10.9.0',
        '@types/express': '^4.17.0',
        '@types/node': '^20.0.0',
        'jest': '^29.0.0',
        '@types/jest': '^29.0.0'
      }
    }, null, 2);
  }

  private getNextJsPageTemplate(): string {
    return `import React from 'react';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>🥷 SKIDE Next.js App</title>
        <meta name="description" content="Sovereign development with Next.js" />
      </Head>
      
      <main>
        <h1>🥷 Welcome to SKIDE Next.js</h1>
        <p>Your sovereign full-stack development journey begins here!</p>
      </main>
    </>
  );
}
`;
  }

  private getNextJsPackageTemplate(): string {
    return JSON.stringify({
      name: 'skide-nextjs-app',
      version: '1.0.0',
      private: true,
      scripts: {
        'dev': 'next dev',
        'build': 'next build',
        'start': 'next start',
        'lint': 'next lint'
      },
      dependencies: {
        'next': '^14.0.0',
        'react': '^18.2.0',
        'react-dom': '^18.2.0',
        'typescript': '^5.0.0',
        '@types/react': '^18.2.0',
        '@types/react-dom': '^18.2.0',
        '@types/node': '^20.0.0'
      }
    }, null, 2);
  }

  private getNextConfigTemplate(): string {
    return `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
`;
  }
}