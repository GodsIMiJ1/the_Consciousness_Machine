import React, { useRef, useEffect, useState } from 'react';
import * as monaco from 'monaco-editor';
import { EditorService } from '../../services/EditorService';
import { FileSystemService } from '../../services/FileSystemService';
import { CodeActionService } from '../../services/CodeActionService';

export interface MonacoEditorProps {
  value?: string;
  language?: string;
  theme?: 'vs-dark' | 'vs-light' | 'hc-black';
  onValueChange?: (value: string) => void;
  onCursorPositionChange?: (position: monaco.Position) => void;
  height?: string;
  width?: string;
  readOnly?: boolean;
  minimap?: boolean;
  fontSize?: number;
  wordWrap?: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  value = '',
  language = 'typescript',
  theme = 'vs-dark',
  onValueChange,
  onCursorPositionChange,
  height = '100%',
  width = '100%',
  readOnly = false,
  minimap = true,
  fontSize = 14,
  wordWrap = 'on',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [model, setModel] = useState<monaco.editor.ITextModel | null>(null);
  const editorService = EditorService.getInstance();
  const fileSystemService = FileSystemService.getInstance();
  const codeActionService = CodeActionService.getInstance();

  useEffect(() => {
    if (!editorRef.current) return;

    // Create Monaco editor instance
    const editorInstance = monaco.editor.create(editorRef.current, {
      value,
      language,
      theme,
      fontSize,
      wordWrap,
      minimap: { enabled: minimap },
      readOnly,
      automaticLayout: true,
      contextmenu: true,
      quickSuggestions: true,
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: 'on',
      tabCompletion: 'on',
      scrollBeyondLastLine: false,
      renderWhitespace: 'selection',
      renderControlCharacters: true,
      fontFamily: 'Fira Code, Monaco, Menlo, monospace',
      fontLigatures: true,
      formatOnPaste: true,
      formatOnType: true,
      rulers: [80, 120],
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true,
      },
    });

    setEditor(editorInstance);

    // Register editor with EditorService
    editorService.setEditor(editorInstance);

    // Setup event listeners
    const disposables = [
      // Content changes
      editorInstance.onDidChangeModelContent(() => {
        const newValue = editorInstance.getValue();
        onValueChange?.(newValue);
      }),

      // Cursor position changes
      editorInstance.onDidChangeCursorPosition((e) => {
        onCursorPositionChange?.(e.position);
      }),

      // Key bindings for Kodii integration
      editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
        showKodiiCommandPalette();
      }),

      // Add quick fix shortcut
      editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Period, () => {
        showQuickFix();
      }),

      // Add refactor shortcut
      editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyR, () => {
        showRefactorMenu();
      }),
    ];

    // Setup code lens provider
    setupCodeLensProvider();

    // Setup hover provider
    setupHoverProvider();

    // Setup completion provider
    setupCompletionProvider();

    // Cleanup function
    return () => {
      disposables.forEach(d => d.dispose());
      editorInstance.dispose();
    };
  }, []);

  // Update editor when props change
  useEffect(() => {
    if (editor && value !== editor.getValue()) {
      editor.setValue(value);
    }
  }, [value, editor]);

  useEffect(() => {
    if (editor) {
      monaco.editor.setModelLanguage(editor.getModel()!, language);
    }
  }, [language, editor]);

  useEffect(() => {
    if (editor) {
      monaco.editor.setTheme(theme);
    }
  }, [theme, editor]);

  const showKodiiCommandPalette = () => {
    const actions = [
      {
        id: 'kodii.explainCode',
        label: '🥷 Explain this code',
        run: () => explainSelectedCode(),
      },
      {
        id: 'kodii.improveCode',
        label: '⚡ Improve this code',
        run: () => improveSelectedCode(),
      },
      {
        id: 'kodii.generateTests',
        label: '🧪 Generate tests',
        run: () => generateTestsForCode(),
      },
      {
        id: 'kodii.refactor',
        label: '🌊 Refactor code',
        run: () => refactorCode(),
      },
      {
        id: 'kodii.addComments',
        label: '📝 Add comments',
        run: () => addCommentsToCode(),
      },
      {
        id: 'kodii.createComponent',
        label: '🎯 Create component',
        run: () => createNewComponent(),
      },
    ];

    // Show Monaco command palette with Kodii actions
    editor?.trigger('kodii', 'editor.action.quickCommand', {});
  };

  const showQuickFix = async () => {
    if (!editor) return;

    const position = editor.getPosition();
    if (!position) return;

    // Get TypeScript errors at current position
    const model = editor.getModel();
    if (!model) return;

    const markers = monaco.editor.getModelMarkers({ resource: model.uri });
    const markersAtPosition = markers.filter(marker => 
      marker.startLineNumber <= position.lineNumber &&
      marker.endLineNumber >= position.lineNumber
    );

    if (markersAtPosition.length > 0) {
      // Generate fixes for errors
      const fixes = await codeActionService.fixTypeScriptErrors();
      showCodeActionMenu(fixes);
    } else {
      // Show general improvement suggestions
      const suggestions = await generateCodeSuggestions();
      showCodeActionMenu(suggestions);
    }
  };

  const showRefactorMenu = () => {
    const refactorActions = [
      {
        title: '🔄 Extract Function',
        action: () => extractFunction(),
      },
      {
        title: '📦 Extract Component',
        action: () => extractComponent(),
      },
      {
        title: '🎣 Convert to Hooks',
        action: () => convertToHooks(),
      },
      {
        title: '🚀 Optimize Performance',
        action: () => optimizePerformance(),
      },
    ];

    // Show refactor menu
    showContextMenu(refactorActions);
  };

  const explainSelectedCode = () => {
    const selectedText = editorService.getSelectedText();
    const contextCode = editorService.getContextAroundCursor();
    
    // This would trigger Kodii to explain the code
    window.dispatchEvent(new CustomEvent('kodii-request', {
      detail: {
        type: 'explain',
        code: selectedText || contextCode,
        context: 'editor',
      }
    }));
  };

  const improveSelectedCode = async () => {
    const selectedText = editorService.getSelectedText();
    if (!selectedText) return;

    // This would trigger Kodii to suggest improvements
    window.dispatchEvent(new CustomEvent('kodii-request', {
      detail: {
        type: 'improve',
        code: selectedText,
        context: 'editor',
      }
    }));
  };

  const generateTestsForCode = async () => {
    const context = editorService.getCurrentContext();
    if (!context) return;

    // Extract function name from selection or cursor position
    const functionName = extractFunctionNameAtCursor();
    
    try {
      const testAction = await codeActionService.generateTests(functionName);
      await codeActionService.applyKodiiAction(testAction);
    } catch (error) {
      console.error('Failed to generate tests:', error);
    }
  };

  const refactorCode = () => {
    showRefactorMenu();
  };

  const addCommentsToCode = () => {
    const selectedText = editorService.getSelectedText();
    const contextCode = editorService.getContextAroundCursor();
    
    window.dispatchEvent(new CustomEvent('kodii-request', {
      detail: {
        type: 'comment',
        code: selectedText || contextCode,
        context: 'editor',
      }
    }));
  };

  const createNewComponent = async () => {
    const componentName = prompt('🥷 Enter component name:');
    if (!componentName) return;

    const props = prompt('Enter props (comma-separated):')?.split(',').map(p => p.trim()) || [];
    
    try {
      const componentAction = await codeActionService.createReactComponent(componentName, props);
      await codeActionService.applyKodiiAction(componentAction);
    } catch (error) {
      console.error('Failed to create component:', error);
    }
  };

  const extractFunction = () => {
    const selectedText = editorService.getSelectedText();
    if (!selectedText) {
      alert('🥷 Please select code to extract into a function');
      return;
    }

    const functionName = prompt('🥷 Enter function name:');
    if (!functionName) return;

    // Generate function extraction
    const extractedFunction = `
const ${functionName} = () => {
  ${selectedText}
};
`;

    // Replace selection with function call
    editorService.replaceSelection(`${functionName}();`);

    // Add function above current position
    const position = editor?.getPosition();
    if (position) {
      editorService.insertTextAtPosition(extractedFunction + '\n', new monaco.Position(position.lineNumber - 5, 1));
    }
  };

  const extractComponent = () => {
    const selectedText = editorService.getSelectedText();
    if (!selectedText) {
      alert('🥷 Please select JSX to extract into a component');
      return;
    }

    const componentName = prompt('🥷 Enter component name:');
    if (!componentName) return;

    // This would trigger more sophisticated component extraction
    window.dispatchEvent(new CustomEvent('kodii-request', {
      detail: {
        type: 'extract-component',
        code: selectedText,
        componentName,
        context: 'editor',
      }
    }));
  };

  const convertToHooks = async () => {
    const functionName = extractFunctionNameAtCursor();
    if (!functionName) {
      alert('🥷 Place cursor on a class component to convert to hooks');
      return;
    }

    try {
      const hooksAction = await codeActionService.refactorToHooks(functionName);
      await codeActionService.applyKodiiAction(hooksAction);
    } catch (error) {
      console.error('Failed to convert to hooks:', error);
    }
  };

  const optimizePerformance = async () => {
    try {
      const optimizations = await codeActionService.optimizePerformance();
      
      if (optimizations.length === 0) {
        alert('🥷 No performance optimizations found for this code');
        return;
      }

      // Show optimization options
      const choice = confirm(`🥷 Found ${optimizations.length} optimization opportunities. Apply all?`);
      if (choice) {
        for (const optimization of optimizations) {
          await codeActionService.applyKodiiAction(optimization);
        }
      }
    } catch (error) {
      console.error('Failed to optimize performance:', error);
    }
  };

  const generateCodeSuggestions = async () => {
    // This would generate AI-powered code suggestions
    return [];
  };

  const showCodeActionMenu = (actions: any[]) => {
    // This would show a context menu with code actions
    console.log('Code actions:', actions);
  };

  const showContextMenu = (actions: Array<{ title: string; action: () => void }>) => {
    // Simple context menu implementation
    const menu = document.createElement('div');
    menu.className = 'kodii-context-menu';
    menu.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #1e1e1e;
      border: 1px solid #464647;
      border-radius: 6px;
      padding: 8px;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    `;

    actions.forEach(action => {
      const item = document.createElement('div');
      item.textContent = action.title;
      item.style.cssText = `
        padding: 8px 12px;
        cursor: pointer;
        color: #cccccc;
        border-radius: 4px;
      `;
      item.onmouseenter = () => item.style.backgroundColor = '#094771';
      item.onmouseleave = () => item.style.backgroundColor = 'transparent';
      item.onclick = () => {
        action.action();
        document.body.removeChild(menu);
      };
      menu.appendChild(item);
    });

    document.body.appendChild(menu);

    // Remove menu when clicking outside
    const removeMenu = (e: MouseEvent) => {
      if (!menu.contains(e.target as Node)) {
        document.body.removeChild(menu);
        document.removeEventListener('click', removeMenu);
      }
    };
    setTimeout(() => document.addEventListener('click', removeMenu), 100);
  };

  const extractFunctionNameAtCursor = (): string | null => {
    const position = editor?.getPosition();
    if (!position) return null;

    const line = editorService.getLineAtCursor();
    const functionMatch = line.match(/(?:function\s+|const\s+|let\s+|var\s+)(\w+)/);
    
    return functionMatch?.[1] || null;
  };

  const setupCodeLensProvider = () => {
    monaco.languages.registerCodeLensProvider(language, {
      provideCodeLenses: (model) => {
        const lenses: monaco.languages.CodeLens[] = [];
        const content = model.getValue();
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          // Add code lens for functions
          if (line.match(/^(export\s+)?(function|const\s+\w+\s*=|class)/)) {
            lenses.push({
              range: new monaco.Range(index + 1, 1, index + 1, 1),
              command: {
                id: 'kodii.explainFunction',
                title: '🥷 Ask Kodii about this',
              },
            });
          }

          // Add code lens for React components
          if (line.match(/^(export\s+)?const\s+\w+.*React\.FC/)) {
            lenses.push({
              range: new monaco.Range(index + 1, 1, index + 1, 1),
              command: {
                id: 'kodii.generateTests',
                title: '🧪 Generate tests',
              },
            });
          }
        });

        return { lenses, dispose: () => {} };
      },
    });
  };

  const setupHoverProvider = () => {
    monaco.languages.registerHoverProvider(language, {
      provideHover: (model, position) => {
        const word = model.getWordAtPosition(position);
        if (!word) return null;

        // Provide contextual information
        return {
          range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
          contents: [
            { value: `**${word.word}**` },
            { value: '🥷 Ask Kodii for more information about this symbol' },
            { value: 'Press `Ctrl+K` to open Kodii command palette' },
          ],
        };
      },
    });
  };

  const setupCompletionProvider = () => {
    monaco.languages.registerCompletionItemProvider(language, {
      provideCompletionItems: (model, position) => {
        const suggestions: monaco.languages.CompletionItem[] = [
          {
            label: 'kodii-component',
            kind: monaco.languages.CompletionItemKind.Snippet,
            detail: '🥷 Kodii React Component',
            documentation: 'Generate a React component using Kodii',
            insertText: [
              'const ${1:ComponentName}: React.FC = () => {',
              '  return (',
              '    <div className="${2:component-name}">',
              '      $0',
              '    </div>',
              '  );',
              '};'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          },
          {
            label: 'kodii-hook',
            kind: monaco.languages.CompletionItemKind.Snippet,
            detail: '🥷 Kodii Custom Hook',
            documentation: 'Generate a custom React hook using Kodii',
            insertText: [
              'const use${1:HookName} = () => {',
              '  const [${2:state}, set${2/(.*)/${1:/capitalize}/}] = useState($3);',
              '',
              '  return { ${2:state}, set${2/(.*)/${1:/capitalize}/} };',
              '};'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          },
        ];

        return { suggestions };
      },
    });
  };

  return (
    <div 
      ref={editorRef} 
      style={{ 
        height, 
        width,
        border: '1px solid #464647',
        borderRadius: '4px',
      }} 
    />
  );
};