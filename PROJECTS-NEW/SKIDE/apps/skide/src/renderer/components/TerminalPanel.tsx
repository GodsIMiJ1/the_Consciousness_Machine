import React, { useEffect, useRef } from 'react';

interface TerminalPanelProps {
  height: number;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({ height }) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize terminal
    // For MVP, we'll show a simple terminal interface
    // Later: integrate with xterm.js or similar
  }, []);

  return (
    <div 
      className="terminal-panel bg-black text-green-400 font-mono text-sm"
      style={{ height: `${height}px` }}
    >
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2 border-t border-gray-700">
        <h3 className="text-white text-sm font-semibold">Terminal</h3>
        <div className="flex space-x-2">
          <button className="text-gray-400 hover:text-white text-xs">
            Clear
          </button>
          <button className="text-gray-400 hover:text-white text-xs">
            Split
          </button>
        </div>
      </div>
      
      <div 
        ref={terminalRef}
        className="p-4 overflow-y-auto"
        style={{ height: `${height - 40}px` }}
      >
        <div className="mb-2">
          <span className="text-blue-400">ghost@skide</span>
          <span className="text-white">:</span>
          <span className="text-green-400">~/project</span>
          <span className="text-white">$ </span>
          <span className="text-yellow-400">echo "SKIDE Terminal Ready"</span>
        </div>
        <div className="mb-2 text-white">
          SKIDE Terminal Ready
        </div>
        <div className="mb-2">
          <span className="text-blue-400">ghost@skide</span>
          <span className="text-white">:</span>
          <span className="text-green-400">~/project</span>
          <span className="text-white">$ </span>
          <span className="animate-pulse">_</span>
        </div>
        
        {/* Terminal content will be rendered here */}
        <div className="text-gray-400 text-xs mt-4">
          <p>Terminal integration coming soon...</p>
          <p>Features planned:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Full bash/zsh terminal emulation</li>
            <li>Multiple terminal tabs</li>
            <li>Terminal splitting</li>
            <li>Command history</li>
            <li>File system integration</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
