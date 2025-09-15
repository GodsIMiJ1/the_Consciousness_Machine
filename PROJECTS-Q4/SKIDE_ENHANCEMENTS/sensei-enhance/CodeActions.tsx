import React, { useState, useEffect } from 'react';
import { editor } from 'monaco-editor';
import { LightBulbIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface CodeSuggestion {
  id: string;
  type: 'fix' | 'improvement' | 'explanation' | 'test';
  title: string;
  description: string;
  range: editor.IRange;
  replacement?: string;
  confidence: number;
}

interface CodeActionsProps {
  editor: editor.IStandaloneCodeEditor | null;
  currentFile: string | null;
  onApplySuggestion: (suggestion: CodeSuggestion) => void;
}

export const CodeActions: React.FC<CodeActionsProps> = ({
  editor,
  currentFile,
  onApplySuggestion
}) => {
  const [suggestions, setSuggestions] = useState<CodeSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

  // Get Kodii suggestions for current file and cursor position
  const analyzeCurrent = async () => {
    if (!editor || !currentFile) return;

    setIsAnalyzing(true);
    try {
      const model = editor.getModel();
      if (!model) return;

      const position = editor.getPosition();
      const selection = editor.getSelection();
      const selectedText = selection ? model.getValueInRange(selection) : '';
      const fullText = model.getValue();

      // Get context around cursor
      const lineNumber = position?.lineNumber || 1;
      const startLine = Math.max(1, lineNumber - 5);
      const endLine = Math.min(model.getLineCount(), lineNumber + 5);
      
      const context = model.getValueInRange({
        startLineNumber: startLine,
        startColumn: 1,
        endLineNumber: endLine,
        endColumn: model.getLineMaxColumn(endLine)
      });

      // Call Kodii service for suggestions
      const response = await window.electronAPI.kodiiAnalyze({
        filePath: currentFile,
        content: fullText,
        selectedText,
        context,
        cursorPosition: { line: lineNumber, column: position?.column || 1 },
        analysisType: 'code_actions'
      });

      if (response.success && response.suggestions) {
        setSuggestions(response.suggestions);
      }
    } catch (error) {
      console.error('Error analyzing code:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-analyze when cursor position changes significantly
  useEffect(() => {
    if (!editor) return;

    let timeoutId: NodeJS.Timeout;
    const disposable = editor.onDidChangeCursorPosition(() => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(analyzeCurrent, 1000); // Debounce
    });

    return () => {
      disposable.dispose();
      clearTimeout(timeoutId);
    };
  }, [editor, currentFile]);

  const handleApplySuggestion = async (suggestion: CodeSuggestion) => {
    setSelectedSuggestion(suggestion.id);
    
    try {
      await onApplySuggestion(suggestion);
      
      // Remove applied suggestion
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    } catch (error) {
      console.error('Error applying suggestion:', error);
    } finally {
      setSelectedSuggestion(null);
    }
  };

  const getTypeIcon = (type: CodeSuggestion['type']) => {
    switch (type) {
      case 'fix':
        return '🔧';
      case 'improvement':
        return '✨';
      case 'explanation':
        return '💡';
      case 'test':
        return '🧪';
      default:
        return '💭';
    }
  };

  const getTypeColor = (type: CodeSuggestion['type']) => {
    switch (type) {
      case 'fix':
        return 'border-red-200 bg-red-50';
      case 'improvement':
        return 'border-blue-200 bg-blue-50';
      case 'explanation':
        return 'border-yellow-200 bg-yellow-50';
      case 'test':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  if (!editor || !currentFile) {
    return (
      <div className="p-4 text-gray-500 text-center">
        <LightBulbIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Open a file to see Kodii suggestions</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <LightBulbIcon className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-gray-900">Kodii Suggestions</span>
        </div>
        <button
          onClick={analyzeCurrent}
          disabled={isAnalyzing}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isAnalyzing && (
          <div className="p-4 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Kodii is analyzing your code...</p>
          </div>
        )}

        {!isAnalyzing && suggestions.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            <p>No suggestions available</p>
            <p className="text-xs mt-1">Move your cursor or click Analyze</p>
          </div>
        )}

        {!isAnalyzing && suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className={`m-3 p-4 rounded-lg border ${getTypeColor(suggestion.type)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getTypeIcon(suggestion.type)}</span>
                <div>
                  <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                  <p className="text-sm text-gray-600 capitalize">{suggestion.type}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-500">
                  {Math.round(suggestion.confidence * 100)}%
                </span>
                <div
                  className="w-12 h-1 bg-gray-200 rounded"
                  title={`Confidence: ${Math.round(suggestion.confidence * 100)}%`}
                >
                  <div
                    className="h-full bg-blue-500 rounded"
                    style={{ width: `${suggestion.confidence * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-3">{suggestion.description}</p>

            {/* Range info */}
            <div className="text-xs text-gray-500 mb-3">
              Lines {suggestion.range.startLineNumber}-{suggestion.range.endLineNumber}
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              {suggestion.replacement && (
                <button
                  onClick={() => handleApplySuggestion(suggestion)}
                  disabled={selectedSuggestion === suggestion.id}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {selectedSuggestion === suggestion.id ? (
                    <>
                      <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full" />
                      <span>Applying...</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-3 h-3" />
                      <span>Apply</span>
                    </>
                  )}
                </button>
              )}
              
              <button
                onClick={() => setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))}
                className="flex items-center space-x-1 px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                <XMarkIcon className="w-3 h-3" />
                <span>Dismiss</span>
              </button>
            </div>

            {/* Replacement preview */}
            {suggestion.replacement && (
              <details className="mt-3">
                <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                  View replacement code
                </summary>
                <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
                  <code>{suggestion.replacement}</code>
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};