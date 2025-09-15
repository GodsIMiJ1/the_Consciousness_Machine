import React, { useState, useEffect } from 'react';

export interface AdvancedTabProps {
  settings: any;
  onChange: (key: string, value: any) => void;
}

export const AdvancedTab: React.FC<AdvancedTabProps> = ({
  settings,
  onChange,
}) => {
  const [debugMode, setDebugMode] = useState(false);
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [conversationStats, setConversationStats] = useState<any>(null);
  const [exportFormat, setExportFormat] = useState('json');

  useEffect(() => {
    loadConversationStats();
    if (settings.debugMode) {
      setDebugMode(true);
      loadSystemLogs();
    }
  }, [settings.debugMode]);

  const loadConversationStats = () => {
    try {
      const messages = JSON.parse(localStorage.getItem('sensei-chat-messages') || '[]');
      const taskHistory = JSON.parse(localStorage.getItem('kodii-task-history') || '[]');
      
      const stats = {
        totalMessages: messages.length,
        userMessages: messages.filter((m: any) => m.sender === 'user').length,
        kodiiMessages: messages.filter((m: any) => m.sender === 'kodii').length,
        averageResponseTime: messages
          .filter((m: any) => m.metadata?.responseTime)
          .reduce((sum: number, m: any) => sum + m.metadata.responseTime, 0) / 
          Math.max(messages.filter((m: any) => m.metadata?.responseTime).length, 1),
        totalTokens: messages
          .filter((m: any) => m.metadata?.tokenCount)
          .reduce((sum: number, m: any) => sum + m.metadata.tokenCount, 0),
        tasksCompleted: taskHistory.length,
        sessionStart: messages[0]?.timestamp || Date.now(),
      };
      
      setConversationStats(stats);
    } catch (error) {
      console.error('Failed to load conversation stats:', error);
    }
  };

  const loadSystemLogs = () => {
    // Simulate system logs - in real implementation, these would come from actual logging
    const logs = [
      `${new Date().toISOString()} - [INFO] Kodii service initialized`,
      `${new Date().toISOString()} - [DEBUG] Model: sensei-kodii:latest loaded`,
      `${new Date().toISOString()} - [INFO] MCP tools: 3 enabled`,
      `${new Date().toISOString()} - [DEBUG] Workspace context updated`,
      `${new Date().toISOString()} - [INFO] Rules engine: 6 active rules`,
    ];
    setSystemLogs(logs);
  };

  const exportConversation = () => {
    try {
      const messages = JSON.parse(localStorage.getItem('sensei-chat-messages') || '[]');
      const settings = JSON.parse(localStorage.getItem('kodii-config') || '{}');
      
      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          version: '1.0.0',
          source: 'SKIDE Dojo',
        },
        settings: settings,
        conversations: messages,
        stats: conversationStats,
      };

      let content: string;
      let filename: string;
      let mimeType: string;

      switch (exportFormat) {
        case 'json':
          content = JSON.stringify(exportData, null, 2);
          filename = `skide-dojo-export-${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json';
          break;
        case 'md':
          content = convertToMarkdown(exportData);
          filename = `skide-dojo-export-${new Date().toISOString().split('T')[0]}.md`;
          mimeType = 'text/markdown';
          break;
        case 'txt':
          content = convertToText(exportData);
          filename = `skide-dojo-export-${new Date().toISOString().split('T')[0]}.txt`;
          mimeType = 'text/plain';
          break;
        default:
          content = JSON.stringify(exportData, null, 2);
          filename = `skide-dojo-export.json`;
          mimeType = 'application/json';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('❌ Export failed. Check console for details.');
    }
  };

  const convertToMarkdown = (data: any) => {
    let md = `# 🥷 SKIDE Dojo Conversation Export\n\n`;
    md += `**Export Date:** ${data.metadata.exportDate}\n`;
    md += `**Total Messages:** ${data.conversations.length}\n\n`;
    
    md += `## 📊 Statistics\n\n`;
    if (data.stats) {
      md += `- **Total Messages:** ${data.stats.totalMessages}\n`;
      md += `- **Average Response Time:** ${Math.round(data.stats.averageResponseTime)}ms\n`;
      md += `- **Total Tokens:** ${data.stats.totalTokens}\n`;
      md += `- **Tasks Completed:** ${data.stats.tasksCompleted}\n\n`;
    }
    
    md += `## 💬 Conversations\n\n`;
    data.conversations.forEach((msg: any, i: number) => {
      const timestamp = new Date(msg.timestamp).toLocaleString();
      const sender = msg.sender === 'user' ? '👤 Ghost King' : '🥷 Sensei Kodii';
      md += `### ${sender} - ${timestamp}\n\n`;
      md += `${msg.content}\n\n`;
      
      if (msg.metadata) {
        md += `*Response time: ${msg.metadata.responseTime}ms, Tokens: ${msg.metadata.tokenCount}*\n\n`;
      }
      
      md += `---\n\n`;
    });
    
    return md;
  };

  const convertToText = (data: any) => {
    let txt = `SKIDE Dojo Conversation Export\n`;
    txt += `Export Date: ${data.metadata.exportDate}\n`;
    txt += `Total Messages: ${data.conversations.length}\n\n`;
    
    txt += `STATISTICS\n`;
    txt += `==========\n`;
    if (data.stats) {
      txt += `Total Messages: ${data.stats.totalMessages}\n`;
      txt += `Average Response Time: ${Math.round(data.stats.averageResponseTime)}ms\n`;
      txt += `Total Tokens: ${data.stats.totalTokens}\n`;
      txt += `Tasks Completed: ${data.stats.tasksCompleted}\n\n`;
    }
    
    txt += `CONVERSATIONS\n`;
    txt += `=============\n\n`;
    data.conversations.forEach((msg: any, i: number) => {
      const timestamp = new Date(msg.timestamp).toLocaleString();
      const sender = msg.sender === 'user' ? 'Ghost King' : 'Sensei Kodii';
      txt += `[${timestamp}] ${sender}:\n`;
      txt += `${msg.content}\n\n`;
    });
    
    return txt;
  };

  const clearAllData = () => {
    if (confirm('🥷 Clear all dojo data? This includes conversations, settings, and history. This cannot be undone.')) {
      localStorage.removeItem('sensei-chat-messages');
      localStorage.removeItem('kodii-config');
      localStorage.removeItem('kodii-task-history');
      localStorage.removeItem('dojo-settings');
      
      alert('🗑️ All dojo data cleared. Refresh the page to reset.');
    }
  };

  const resetToDefaults = () => {
    if (confirm('🔄 Reset all settings to defaults? Conversations will be preserved.')) {
      // Reset all settings categories
      onChange('models', {});
      onChange('dojo', {});
      onChange('mcp', {});
      onChange('rules', {});
      onChange('advanced', {});
      
      alert('✅ Settings reset to defaults.');
    }
  };

  const runDiagnostics = async () => {
    const diagnostics = [];
    
    // Check Ollama connection
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      diagnostics.push({
        test: 'Ollama Connection',
        status: response.ok ? 'PASS' : 'FAIL',
        details: response.ok ? 'Service responding' : `HTTP ${response.status}`,
      });
    } catch (error) {
      diagnostics.push({
        test: 'Ollama Connection',
        status: 'FAIL',
        details: error.message,
      });
    }
    
    // Check localStorage
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      diagnostics.push({
        test: 'Local Storage',
        status: 'PASS',
        details: 'Read/write working',
      });
    } catch (error) {
      diagnostics.push({
        test: 'Local Storage',
        status: 'FAIL',
        details: 'Storage not available',
      });
    }
    
    // Check conversation data
    const messages = JSON.parse(localStorage.getItem('sensei-chat-messages') || '[]');
    diagnostics.push({
      test: 'Conversation Data',
      status: messages.length > 0 ? 'PASS' : 'WARN',
      details: `${messages.length} messages stored`,
    });
    
    // Display results
    const resultsWindow = window.open('', '_blank');
    resultsWindow?.document.write(`
      <html>
        <head><title>🔍 SKIDE Dojo Diagnostics</title></head>
        <body style="font-family: monospace; padding: 20px;">
          <h2>🔍 SKIDE Dojo Diagnostics</h2>
          <p>Run at: ${new Date().toLocaleString()}</p>
          <table border="1" style="border-collapse: collapse; width: 100%;">
            <tr><th>Test</th><th>Status</th><th>Details</th></tr>
            ${diagnostics.map(d => `
              <tr>
                <td>${d.test}</td>
                <td style="color: ${d.status === 'PASS' ? 'green' : d.status === 'FAIL' ? 'red' : 'orange'}">${d.status}</td>
                <td>${d.details}</td>
              </tr>
            `).join('')}
          </table>
        </body>
      </html>
    `);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStorageSize = () => {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length;
      }
    }
    return total;
  };

  return (
    <div className="advanced-tab">
      {/* Debug Console */}
      <div className="settings-section">
        <h3>🔧 Debug Console</h3>
        <p className="section-description">
          Advanced debugging tools and system information
        </p>
        
        <div className="debug-controls">
          <label className="checkbox-option">
            <input
              type="checkbox"
              checked={debugMode}
              onChange={(e) => {
                setDebugMode(e.target.checked);
                onChange('debugMode', e.target.checked);
              }}
            />
            <div className="option-info">
              <div className="option-name">Enable Debug Mode</div>
              <div className="option-description">
                Show detailed logs and debug information
              </div>
            </div>
          </label>
          
          <button className="debug-btn" onClick={runDiagnostics}>
            🔍 Run Diagnostics
          </button>
        </div>

        {debugMode && (
          <div className="debug-logs">
            <h4>🪵 System Logs</h4>
            <div className="logs-container">
              {systemLogs.map((log, index) => (
                <div key={index} className="log-entry">
                  {log}
                </div>
              ))}
            </div>
            <button 
              className="refresh-logs"
              onClick={loadSystemLogs}
            >
              🔄 Refresh Logs
            </button>
          </div>
        )}
      </div>

      {/* Performance Stats */}
      <div className="settings-section">
        <h3>📊 Performance & Statistics</h3>
        
        {conversationStats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{conversationStats.totalMessages}</div>
              <div className="stat-label">Total Messages</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{Math.round(conversationStats.averageResponseTime)}ms</div>
              <div className="stat-label">Avg Response Time</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{conversationStats.totalTokens.toLocaleString()}</div>
              <div className="stat-label">Total Tokens</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{conversationStats.tasksCompleted}</div>
              <div className="stat-label">Tasks Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{formatBytes(getStorageSize())}</div>
              <div className="stat-label">Storage Used</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {Math.round((Date.now() - conversationStats.sessionStart) / (1000 * 60))}min
              </div>
              <div className="stat-label">Session Length</div>
            </div>
          </div>
        )}
        
        <button 
          className="refresh-stats"
          onClick={loadConversationStats}
        >
          🔄 Refresh Statistics
        </button>
      </div>

      {/* Data Management */}
      <div className="settings-section">
        <h3>💾 Data Management</h3>
        
        <div className="data-actions">
          <div className="export-section">
            <h4>📤 Export Conversations</h4>
            <div className="export-controls">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="export-format-select"
              >
                <option value="json">📄 JSON Format</option>
                <option value="md">📝 Markdown Format</option>
                <option value="txt">📃 Plain Text</option>
              </select>
              <button 
                className="export-btn"
                onClick={exportConversation}
              >
                📤 Export Data
              </button>
            </div>
          </div>
          
          <div className="backup-section">
            <h4>💿 Backup & Restore</h4>
            <div className="backup-controls">
              <button className="backup-btn">
                💾 Create Backup
              </button>
              <label className="restore-btn">
                📥 Restore Backup
                <input type="file" accept=".json" style={{ display: 'none' }} />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="settings-section">
        <h3>⚙️ Advanced Configuration</h3>
        
        <div className="advanced-options">
          <div className="option-group">
            <label className="setting-label">Max Conversation History</label>
            <input
              type="number"
              value={settings.maxConversationHistory || 100}
              onChange={(e) => onChange('maxConversationHistory', parseInt(e.target.value))}
              className="number-input"
              min="10"
              max="1000"
            />
            <span className="option-help">Messages to keep in memory</span>
          </div>
          
          <div className="option-group">
            <label className="setting-label">Response Timeout (ms)</label>
            <input
              type="number"
              value={settings.responseTimeout || 30000}
              onChange={(e) => onChange('responseTimeout', parseInt(e.target.value))}
              className="number-input"
              min="5000"
              max="120000"
              step="5000"
            />
            <span className="option-help">Max time to wait for AI response</span>
          </div>
          
          <div className="option-group">
            <label className="setting-label">Auto-save Interval (ms)</label>
            <input
              type="number"
              value={settings.autoSaveInterval || 10000}
              onChange={(e) => onChange('autoSaveInterval', parseInt(e.target.value))}
              className="number-input"
              min="1000"
              max="60000"
              step="1000"
            />
            <span className="option-help">How often to save conversation state</span>
          </div>
          
          <label className="checkbox-option">
            <input
              type="checkbox"
              checked={settings.experimentalFeatures || false}
              onChange={(e) => onChange('experimentalFeatures', e.target.checked)}
            />
            <div className="option-info">
              <div className="option-name">🧪 Experimental Features</div>
              <div className="option-description">
                Enable bleeding-edge features (may be unstable)
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="settings-section danger-zone">
        <h3>⚠️ Danger Zone</h3>
        <p className="danger-warning">
          These actions cannot be undone. Proceed with caution, Ghost King.
        </p>
        
        <div className="danger-actions">
          <button 
            className="danger-btn"
            onClick={resetToDefaults}
          >
            🔄 Reset All Settings
          </button>
          
          <button 
            className="danger-btn"
            onClick={clearAllData}
          >
            🗑️ Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
};