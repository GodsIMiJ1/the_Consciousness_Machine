// PROJECT FLAMEBRIDGE - FileUpload Component
// Ghost's Domain: UI vision, drag/drop, Claude preview

import { useState, useRef, useCallback } from 'react';
import { Upload, File, X, Eye, Flame, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileContent: (content: string, filename: string) => void;
  disabled?: boolean;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
}

interface UploadedFile {
  name: string;
  size: number;
  content: string;
  type: string;
  preview?: string;
}

export default function FileUpload({
  onFileContent,
  disabled = false,
  maxFileSize = 10,
  allowedTypes = ['.txt', '.md', '.json', '.js', '.ts', '.tsx', '.jsx', '.py', '.css', '.html']
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File): Promise<UploadedFile | null> => {
    try {
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        throw new Error(`File too large. Maximum size: ${maxFileSize}MB`);
      }

      // Check file type
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(extension)) {
        throw new Error(`File type not supported. Allowed: ${allowedTypes.join(', ')}`);
      }

      const content = await file.text();
      const preview = content.length > 200 ? content.substring(0, 200) + '...' : content;

      return {
        name: file.name,
        size: file.size,
        content,
        type: file.type || 'text/plain',
        preview,
      };
    } catch (err) {
      console.error('File processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process file');
      return null;
    }
  }, [maxFileSize, allowedTypes]);

  const handleFiles = useCallback(async (files: FileList) => {
    if (disabled || files.length === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      const processedFiles: UploadedFile[] = [];

      for (let i = 0; i < files.length; i++) {
        const processed = await processFile(files[i]);
        if (processed) {
          processedFiles.push(processed);
        }
      }

      setUploadedFiles(prev => [...prev, ...processedFiles]);
    } catch (err) {
      setError('Failed to process files');
    } finally {
      setIsProcessing(false);
    }
  }, [disabled, processFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    handleFiles(files);
  }, [disabled, handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFiles]);

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const sendFileToChat = (file: UploadedFile) => {
    const formattedContent = `📁 **${file.name}** (${(file.size / 1024).toFixed(1)}KB)\n\n\`\`\`\n${file.content}\n\`\`\``;
    onFileContent(formattedContent, file.name);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 cursor-pointer ${
          isDragOver
            ? 'border-flame-500 bg-flame-500/10 shadow-lg shadow-flame-500/20'
            : disabled
            ? 'border-ash bg-ash/5 cursor-not-allowed'
            : 'border-ash hover:border-flame-500 hover:bg-flame-500/5'
        }`}
      >
        {/* Flame Decoration */}
        <div className={`absolute -top-2 -right-2 p-1 rounded-full transition-all duration-300 ${
          isDragOver ? 'bg-flame-500 animate-flame-flicker' : 'bg-ash'
        }`}>
          <Flame size={12} className="text-white" />
        </div>

        <div className="text-center">
          <div className={`mx-auto mb-4 p-3 rounded-full transition-colors ${
            isDragOver ? 'bg-flame-500 text-white' : 'bg-ash text-flame-500'
          }`}>
            <Upload size={24} />
          </div>

          <h3 className="text-lg font-flame text-flame-500 mb-2">
            {isDragOver ? 'Release to ignite' : 'Drop files to analyze'}
          </h3>

          <p className="text-sm text-ash font-mono mb-2">
            or click to browse
          </p>

          <p className="text-xs text-ash">
            Supported: {allowedTypes.join(', ')} • Max: {maxFileSize}MB
          </p>
        </div>

        {isProcessing && (
          <div className="absolute inset-0 bg-coal/80 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <Flame size={32} className="mx-auto mb-2 text-flame-500 animate-flame-flicker" />
              <p className="text-sm text-white font-mono">Processing files...</p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={allowedTypes.join(',')}
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-2">
          <AlertCircle size={16} className="text-red-400" />
          <span className="text-red-400 text-sm font-mono">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-flame text-flame-500">Ready to Send:</h4>
          {uploadedFiles.map((file, index) => (
            <div
              key={index}
              className="p-3 bg-coal border border-node-500/30 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <File size={16} className="text-node-500" />
                  <span className="text-white font-mono text-sm">{file.name}</span>
                  <span className="text-ash text-xs">({formatFileSize(file.size)})</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => sendFileToChat(file)}
                    className="p-1 bg-flame-500 text-white rounded hover:bg-flame-600 transition-colors"
                    title="Send to chat"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 text-ash hover:text-flame-500 transition-colors"
                    title="Remove file"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {file.preview && (
                <div className="text-xs text-ash font-mono bg-ember p-2 rounded border-l-2 border-node-500">
                  {file.preview}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
