import { useState, useEffect, useCallback, useRef } from 'react';
import { editor } from 'monaco-editor';

export interface MonacoState {
  editor: editor.IStandaloneCodeEditor | null;
  currentFile: string | null;
  cursorPosition: { line: number; column: number } | null;
  selectedText: string | null;
  isDirty: boolean;
  language: string | null;
}

export interface MonacoActions {
  openFile: (filePath: string, content: string) => void;
  saveFile: () => Promise<void>;
  closeFile: () => void;
  insertText: (text: string, position?: editor.IPosition) => void;
  replaceText: (range: editor.IRange, text: string) => void;
  selectRange: (range: editor.IRange) => void;
  formatDocument: () => void;
  undo: () => void;
  redo: () => void;
  findAndReplace: (findText: string, replaceText: string, replaceAll?: boolean) => void;
}

export interface UseMonacoIntegrationOptions {
  onFileChange?: (filePath: string, content: string) => void;
  onCursorPositionChange?: (position: { line: number; column: number }) => void;
  onSelectionChange?: (selectedText: string) => void;
  onSave?: (filePath: string, content: string) => Promise<void>;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export const useMonacoIntegration = (
  options: UseMonacoIntegrationOptions = {}
): [MonacoState, MonacoActions] => {
  const [state, setState] = useState<MonacoState>({
    editor: null,
    currentFile: null,
    cursorPosition: null,
    selectedText: null,
    isDirty: false,
    language: null
  });

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const fileContentsRef = useRef<Map<string, string>>(new Map());
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize editor instance
  const setEditor = useCallback((editorInstance: editor.IStandaloneCodeEditor | null) => {
    if (editorRef.current && editorRef.current !== editorInstance) {
      // Dispose previous editor
      editorRef.current.dispose();
    }

    editorRef.current = editorInstance;
    setState(prev => ({ ...prev, editor: editorInstance }));

    if (!editorInstance) return;

    // Set up event listeners
    const disposables = [
      // Cursor position changes
      editorInstance.onDidChangeCursorPosition((e) => {
        const position = { line: e.position.lineNumber, column: e.position.column };
        setState(prev => ({ ...prev, cursorPosition: position }));
        options.onCursorPositionChange?.(position);
      }),

      // Selection changes
      editorInstance.onDidChangeCursorSelection((e) => {
        const model = editorInstance.getModel();
        if (!model) return;

        const selectedText = model.getValueInRange(e.selection);
        setState(prev => ({ ...prev, selectedText: selectedText || null }));
        options.onSelectionChange?.(selectedText);
      }),

      // Content changes
      editorInstance.onDidChangeModelContent(() => {
        setState(prev => ({ ...prev, isDirty: true }));
        
        const model = editorInstance.getModel();
        if (model && state.currentFile) {
          const content = model.getValue();
          fileContentsRef.current.set(state.currentFile, content);
          options.onFileChange?.(state.currentFile, content);

          // Auto-save logic
          if (options.autoSave) {
            if (autoSaveTimeoutRef.current) {
              clearTimeout(autoSaveTimeoutRef.current);
            }
            autoSaveTimeoutRef.current = setTimeout(() => {
              saveFile();
            }, options.autoSaveDelay || 2000);
          }
        }
      }),

      // Model changes (file switches)
      editorInstance.onDidChangeModel((e) => {
        if (e.newModelUrl) {
          const filePath = e.newModelUrl.path;
          setState(prev => ({ 
            ...prev, 
            currentFile: filePath,
            language: e.newModelUrl?.path.split('.').pop() || null,
            isDirty: false
          }));
        }
      })
    ];

    // Clean up on unmount
    return () => {
      disposables.forEach(d => d.dispose());
    };
  }, [options, state.currentFile]);

  // Open file in editor
  const openFile = useCallback(async (filePath: string, content: string) => {
    if (!editorRef.current) return;

    try {
      // Store content
      fileContentsRef.current.set(filePath, content);

      // Get or create model
      const uri = editor.Uri.file(filePath);
      let model = editor.getModel(uri);

      if (!model) {
        // Determine language from file extension
        const language = getLanguageFromPath(filePath);
        model = editor.createModel(content, language, uri);
      } else {
        // Update existing model
        model.setValue(content);
      }

      // Set model to editor
      editorRef.current.setModel(model);

      setState(prev => ({
        ...prev,
        currentFile: filePath,
        language: model?.getLanguageId() || null,
        isDirty: false
      }));

    } catch (error) {
      console.error('Error opening file:', error);
    }
  }, []);

  // Save current file
  const saveFile = useCallback(async () => {
    if (!editorRef.current || !state.currentFile) return;

    try {
      const model = editorRef.current.getModel();
      if (!model) return;

      const content = model.getValue();
      
      if (options.onSave) {
        await options.onSave(state.currentFile, content);
      } else {
        // Default save behavior - call electron API
        await window.electronAPI.saveFile(state.currentFile, content);
      }

      setState(prev => ({ ...prev, isDirty: false }));
      
      // Clear auto-save timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = null;
      }

    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  }, [state.currentFile, options]);

  // Close current file
  const closeFile = useCallback(() => {
    if (!editorRef.current || !state.currentFile) return;

    const model = editorRef.current.getModel();
    if (model) {
      model.dispose();
    }

    fileContentsRef.current.delete(state.currentFile);
    
    setState(prev => ({
      ...prev,
      currentFile: null,
      language: null,
      isDirty: false,
      selectedText: null
    }));
  }, [state.currentFile]);

  // Insert text at cursor or specified position
  const insertText = useCallback((text: string, position?: editor.IPosition) => {
    if (!editorRef.current) return;

    const insertPosition = position || editorRef.current.getPosition();
    if (!insertPosition) return;

    editorRef.current.executeEdits('insert-text', [{
      range: {
        startLineNumber: insertPosition.lineNumber,
        startColumn: insertPosition.column,
        endLineNumber: insertPosition.lineNumber,
        endColumn: insertPosition.column
      },
      text,
      forceMoveMarkers: true
    }]);

    // Move cursor to end of inserted text
    const lines = text.split('\n');
    const endLine = insertPosition.lineNumber + lines.length - 1;
    const endColumn = lines.length === 1 
      ? insertPosition.column + text.length
      : lines[lines.length - 1].length + 1;

    editorRef.current.setPosition({ lineNumber: endLine, column: endColumn });
  }, []);

  // Replace text in specified range
  const replaceText = useCallback((range: editor.IRange, text: string) => {
    if (!editorRef.current) return;

    editorRef.current.executeEdits('replace-text', [{
      range,
      text,
      forceMoveMarkers: true
    }]);
  }, []);

  // Select range
  const selectRange = useCallback((range: editor.IRange) => {
    if (!editorRef.current) return;

    editorRef.current.setSelection(range);
    editorRef.current.revealRange(range);
  }, []);

  // Format document
  const formatDocument = useCallback(async () => {
    if (!editorRef.current) return;

    await editorRef.current.getAction('editor.action.formatDocument')?.run();
  }, []);

  // Undo
  const undo = useCallback(() => {
    if (!editorRef.current) return;
    editorRef.current.trigger('keyboard', 'undo', {});
  }, []);

  // Redo
  const redo = useCallback(() => {
    if (!editorRef.current) return;
    editorRef.current.trigger('keyboard', 'redo', {});
  }, []);

  // Find and replace
  const findAndReplace = useCallback((findText: string, replaceText: string, replaceAll = false) => {
    if (!editorRef.current) return;

    const model = editorRef.current.getModel();
    if (!model) return;

    const matches = model.findMatches(findText, true, false, true, null, true);
    
    if (matches.length === 0) return;

    if (replaceAll) {
      // Replace all matches
      editorRef.current.executeEdits('find-replace-all', 
        matches.map(match => ({
          range: match.range,
          text: replaceText,
          forceMoveMarkers: true
        }))
      );
    } else {
      // Replace first match
      editorRef.current.executeEdits('find-replace', [{
        range: matches[0].range,
        text: replaceText,
        forceMoveMarkers: true
      }]);
    }
  }, []);

  // Get language from file path
  const getLanguageFromPath = (filePath: string): string => {
    const ext = filePath.split('.').pop()?.toLowerCase();
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
      'toml': 'toml',
      'sh': 'shell',
      'bash': 'shell',
      'sql': 'sql'
    };
    
    return languageMap[ext || ''] || 'plaintext';
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    if (!editorRef.current) return;

    const editor = editorRef.current;

    // Add custom keybindings
    editor.addCommand(editor.KeyMod.CtrlCmd | editor.KeyCode.KeyS, saveFile);
    
  }, [saveFile]);

  const actions: MonacoActions = {
    openFile,
    saveFile,
    closeFile,
    insertText,
    replaceText,
    selectRange,
    formatDocument,
    undo,
    redo,
    findAndReplace
  };

  // Expose setEditor for component initialization
  (actions as any).setEditor = setEditor;

  return [state, actions];
};