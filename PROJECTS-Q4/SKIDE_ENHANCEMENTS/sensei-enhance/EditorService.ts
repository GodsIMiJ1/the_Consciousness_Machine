import * as monaco from 'monaco-editor';

export interface EditorContext {
  activeFile: string | null;
  content: string;
  language: string;
  cursorPosition: monaco.Position;
  selection: monaco.Selection | null;
  visibleRange: monaco.Range;
  problems: monaco.editor.IMarker[];
}

export interface CodeAction {
  type: 'insert' | 'replace' | 'delete' | 'format' | 'refactor';
  range?: monaco.Range;
  content?: string;
  description: string;
}

export class EditorService {
  private static instance: EditorService;
  private editor: monaco.editor.IStandaloneCodeEditor | null = null;
  private activeModel: monaco.editor.ITextModel | null = null;
  private listeners: Array<(context: EditorContext) => void> = [];

  static getInstance(): EditorService {
    if (!EditorService.instance) {
      EditorService.instance = new EditorService();
    }
    return EditorService.instance;
  }

  setEditor(editor: monaco.editor.IStandaloneCodeEditor): void {
    this.editor = editor;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.editor) return;

    // Listen for cursor position changes
    this.editor.onDidChangeCursorPosition(() => {
      this.notifyContextChange();
    });

    // Listen for selection changes
    this.editor.onDidChangeCursorSelection(() => {
      this.notifyContextChange();
    });

    // Listen for content changes
    this.editor.onDidChangeModelContent(() => {
      this.notifyContextChange();
    });

    // Listen for model changes (file switches)
    this.editor.onDidChangeModel(() => {
      this.activeModel = this.editor?.getModel() || null;
      this.notifyContextChange();
    });
  }

  getCurrentContext(): EditorContext | null {
    if (!this.editor || !this.activeModel) return null;

    const position = this.editor.getPosition();
    const selection = this.editor.getSelection();
    const visibleRanges = this.editor.getVisibleRanges();
    const markers = monaco.editor.getModelMarkers({ resource: this.activeModel.uri });

    return {
      activeFile: this.getFileNameFromUri(this.activeModel.uri),
      content: this.activeModel.getValue(),
      language: this.activeModel.getLanguageId(),
      cursorPosition: position || new monaco.Position(1, 1),
      selection: selection,
      visibleRange: visibleRanges[0] || new monaco.Range(1, 1, 1, 1),
      problems: markers,
    };
  }

  getSelectedText(): string {
    if (!this.editor) return '';
    
    const selection = this.editor.getSelection();
    if (!selection || selection.isEmpty()) return '';
    
    return this.editor.getModel()?.getValueInRange(selection) || '';
  }

  getLineAtCursor(): string {
    if (!this.editor) return '';
    
    const position = this.editor.getPosition();
    if (!position) return '';
    
    return this.editor.getModel()?.getLineContent(position.lineNumber) || '';
  }

  async applyCodeAction(action: CodeAction): Promise<boolean> {
    if (!this.editor || !this.activeModel) return false;

    try {
      const edit: monaco.editor.IIdentifiedSingleEditOperation = {
        range: action.range || this.editor.getSelection() || new monaco.Range(1, 1, 1, 1),
        text: action.content || '',
      };

      switch (action.type) {
        case 'insert':
          this.editor.executeEdits('kodii-insert', [edit]);
          break;
        case 'replace':
          this.editor.executeEdits('kodii-replace', [edit]);
          break;
        case 'delete':
          this.editor.executeEdits('kodii-delete', [{
            range: action.range || this.editor.getSelection() || new monaco.Range(1, 1, 1, 1),
            text: '',
          }]);
          break;
        case 'format':
          await this.editor.getAction('editor.action.formatDocument')?.run();
          break;
        case 'refactor':
          // Apply refactoring edit
          this.editor.executeEdits('kodii-refactor', [edit]);
          break;
      }

      return true;
    } catch (error) {
      console.error('Failed to apply code action:', error);
      return false;
    }
  }

  insertTextAtPosition(text: string, position?: monaco.Position): void {
    if (!this.editor) return;

    const insertPosition = position || this.editor.getPosition();
    if (!insertPosition) return;

    this.editor.executeEdits('kodii-insert', [{
      range: new monaco.Range(
        insertPosition.lineNumber,
        insertPosition.column,
        insertPosition.lineNumber,
        insertPosition.column
      ),
      text,
    }]);
  }

  replaceSelection(text: string): void {
    if (!this.editor) return;

    const selection = this.editor.getSelection();
    if (!selection) return;

    this.editor.executeEdits('kodii-replace', [{
      range: selection,
      text,
    }]);
  }

  replaceRange(range: monaco.Range, text: string): void {
    if (!this.editor) return;

    this.editor.executeEdits('kodii-replace-range', [{
      range,
      text,
    }]);
  }

  insertSnippet(snippet: string, position?: monaco.Position): void {
    if (!this.editor) return;

    const insertPosition = position || this.editor.getPosition();
    if (!insertPosition) return;

    // Convert snippet to Monaco snippet format
    this.editor.trigger('kodii', 'editor.action.insertSnippet', {
      snippet,
      range: new monaco.Range(
        insertPosition.lineNumber,
        insertPosition.column,
        insertPosition.lineNumber,
        insertPosition.column
      ),
    });
  }

  goToLine(lineNumber: number): void {
    if (!this.editor) return;

    this.editor.revealLineInCenter(lineNumber);
    this.editor.setPosition({ lineNumber, column: 1 });
  }

  goToDefinition(): void {
    this.editor?.getAction('editor.action.revealDefinition')?.run();
  }

  showSuggestions(): void {
    this.editor?.trigger('kodii', 'editor.action.triggerSuggest', {});
  }

  addCodeLens(lineNumber: number, command: string, title: string): void {
    // This would integrate with Monaco's CodeLens provider
    // Implementation would depend on your Monaco setup
  }

  highlightRange(range: monaco.Range, className: string = 'kodii-highlight'): monaco.editor.IEditorDecorationsCollection | null {
    if (!this.editor) return null;

    return this.editor.createDecorationsCollection([{
      range,
      options: {
        className,
        isWholeLine: false,
        overviewRuler: {
          color: '#64ffda',
          position: monaco.editor.OverviewRulerLane.Right,
        },
        minimap: {
          color: '#64ffda',
          position: monaco.editor.MinimapPosition.Inline,
        },
      },
    }]);
  }

  onContextChange(callback: (context: EditorContext) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyContextChange(): void {
    const context = this.getCurrentContext();
    if (context) {
      this.listeners.forEach(callback => callback(context));
    }
  }

  private getFileNameFromUri(uri: monaco.Uri): string {
    const path = uri.path;
    return path.split('/').pop() || 'untitled';
  }

  // Get visible code range for context
  getVisibleCode(): string {
    if (!this.editor || !this.activeModel) return '';

    const visibleRanges = this.editor.getVisibleRanges();
    if (visibleRanges.length === 0) return '';

    const visibleRange = visibleRanges[0];
    return this.activeModel.getValueInRange(visibleRange);
  }

  // Get surrounding context around cursor
  getContextAroundCursor(linesBefore: number = 10, linesAfter: number = 10): string {
    if (!this.editor || !this.activeModel) return '';

    const position = this.editor.getPosition();
    if (!position) return '';

    const startLine = Math.max(1, position.lineNumber - linesBefore);
    const endLine = Math.min(
      this.activeModel.getLineCount(),
      position.lineNumber + linesAfter
    );

    const range = new monaco.Range(startLine, 1, endLine, Number.MAX_SAFE_INTEGER);
    return this.activeModel.getValueInRange(range);
  }

  // Find all occurrences of a pattern
  findInFile(pattern: string | RegExp): monaco.editor.FindMatch[] {
    if (!this.activeModel) return [];

    return this.activeModel.findMatches(
      typeof pattern === 'string' ? pattern : pattern.source,
      false,
      typeof pattern !== 'string',
      true,
      null,
      true
    );
  }

  // Get file statistics
  getFileStats(): { lines: number; characters: number; selection: number } {
    if (!this.editor || !this.activeModel) {
      return { lines: 0, characters: 0, selection: 0 };
    }

    const selection = this.editor.getSelection();
    const selectionText = selection && !selection.isEmpty() 
      ? this.activeModel.getValueInRange(selection) 
      : '';

    return {
      lines: this.activeModel.getLineCount(),
      characters: this.activeModel.getValueLength(),
      selection: selectionText.length,
    };
  }
}