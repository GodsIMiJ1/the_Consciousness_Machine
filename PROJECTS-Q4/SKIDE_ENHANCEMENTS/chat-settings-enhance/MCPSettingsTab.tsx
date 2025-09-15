import React, { useState, useEffect } from 'react';

export interface MCPSettingsTabProps {
  settings: any;
  onChange: (key: string, value: any) => void;
}

interface MCPTool {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  enabled: boolean;
  category: 'development' | 'research' | 'productivity' | 'system';
  icon: string;
  requiresAuth: boolean;
  status: 'available' | 'unavailable' | 'testing';
}

export const MCPSettingsTab: React.FC<MCPSettingsTabProps> = ({
  settings,
  onChange,
}) => {
  const [availableTools, setAvailableTools] = useState<MCPTool[]>([]);
  const [customTool, setCustomTool] = useState({
    name: '',
    endpoint: '',
    description: '',
  });

  const defaultTools: MCPTool[] = [
    {
      id: 'web-search',
      name: '🌐 Web Search',
      description: 'Search the web for current information and documentation',
      endpoint: 'http://localhost:3001/mcp/web-search',
      enabled: true,
      category: 'research',
      icon: '🔍',
      requiresAuth: false,
      status: 'available',
    },
    {
      id: 'github-api',
      name: '🐙 GitHub Integration',
      description: 'Create issues, PRs, and manage repositories',
      endpoint: 'http://localhost:3001/mcp/github',
      enabled: false,
      category: 'development',
      icon: '🐙',
      requiresAuth: true,
      status: 'unavailable',
    },
    {
      id: 'file-system',
      name: '📁 File System',
      description: 'Read, write, and manage local files safely',
      endpoint: 'http://localhost:3001/mcp/filesystem',
      enabled: true,
      category: 'system',
      icon: '📁',
      requiresAuth: false,
      status: 'available',
    },
    {
      id: 'terminal',
      name: '💻 Terminal Access',
      description: 'Execute shell commands with safety limits',
      endpoint: 'http://localhost:3001/mcp/terminal',
      enabled: false,
      category: 'system',
      icon: '💻',
      requiresAuth: false,
      status: 'testing',
    },
    {
      id: 'database',
      name: '🗄️ Database Query',
      description: 'Query and manage local databases',
      endpoint: 'http://localhost:3001/mcp/database',
      enabled: false,
      category: 'development',
      icon: '🗄️',
      requiresAuth: false,
      status: 'unavailable',
    },
    {
      id: 'code-analyzer',
      name: '🔬 Code Analyzer',
      description: 'Static code analysis and quality metrics',
      endpoint: 'http://localhost:3001/mcp/code-analyzer',
      enabled: true,
      category: 'development',
      icon: '🔬',
      requiresAuth: false,
      status: 'available',
    },
    {
      id: 'documentation',
      name: '📚 Documentation Generator',
      description: 'Generate and update project documentation',
      endpoint: 'http://localhost:3001/mcp/docs',
      enabled: true,
      category: 'productivity',
      icon: '📚',
      requiresAuth: false,
      status: 'available',
    },
  ];

  useEffect(() => {
    setAvailableTools(defaultTools);
  }, []);

  const testToolConnection = async (tool: MCPTool) => {
    // Update status to testing
    setAvailableTools(prev => 
      prev.map(t => t.id === tool.id ? { ...t, status: 'testing' } : t)
    );

    try {
      // Simulate testing the MCP endpoint
      const response = await fetch(`${tool.endpoint}/health`, {
        method: 'GET',
        timeout: 5000,
      });

      const status = response.ok ? 'available' : 'unavailable';
      
      setAvailableTools(prev =>
        prev.map(t => t.id === tool.id ? { ...t, status } : t)
      );

    } catch (error) {
      setAvailableTools(prev =>
        prev.map(t => t.id === tool.id ? { ...t, status: 'unavailable' } : t)
      );
    }
  };

  const toggleTool = (toolId: string, enabled: boolean) => {
    const updatedTools = availableTools.map(tool =>
      tool.id === toolId ? { ...tool, enabled } : tool
    );
    
    setAvailableTools(updatedTools);
    onChange('enabledTools', updatedTools.filter(t => t.enabled).map(t => t.id));
  };

  const addCustomTool = () => {
    if (!customTool.name || !customTool.endpoint) return;

    const newTool: MCPTool = {
      id: `custom-${Date.now()}`,
      name: `⚙️ ${customTool.name}`,
      description: customTool.description || 'Custom MCP tool',
      endpoint: customTool.endpoint,
      enabled: false,
      category: 'productivity',
      icon: '⚙️',
      requiresAuth: false,
      status: 'unavailable',
    };

    setAvailableTools(prev => [...prev, newTool]);
    setCustomTool({ name: '', endpoint: '', description: '' });
  };

  const removeCustomTool = (toolId: string) => {
    setAvailableTools(prev => prev.filter(t => t.id !== toolId));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return '🟢';
      case 'unavailable': return '🔴';
      case 'testing': return '🟡';
      default: return '⚫';
    }
  };

  const getCategoryTools = (category: string) => {
    return availableTools.filter(tool => tool.category === category);
  };

  const categories = [
    { id: 'development', name: '🔧 Development Tools', description: 'Code analysis, Git, databases' },
    { id: 'research', name: '🔍 Research Tools', description: 'Web search, documentation lookup' },
    { id: 'productivity', name: '📋 Productivity Tools', description: 'Task management, note-taking' },
    { id: 'system', name: '⚙️ System Tools', description: 'File system, terminal access' },
  ];

  return (
    <div className="mcp-settings-tab">
      {/* MCP Overview */}
      <div className="settings-section">
        <h3>🔌 Model Context Protocol (MCP)</h3>
        <p className="section-description">
          Extend your sensei's capabilities with external tools and services. All tools run locally to maintain sovereignty.
        </p>
        
        <div className="mcp-status">
          <div className="status-item">
            <span className="status-label">MCP Server:</span>
            <span className="status-value">
              {settings.mcpEnabled ? '🟢 Running' : '🔴 Disabled'}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Active Tools:</span>
            <span className="status-value">
              {availableTools.filter(t => t.enabled).length} / {availableTools.length}
            </span>
          </div>
        </div>

        <label className="checkbox-option">
          <input
            type="checkbox"
            checked={settings.mcpEnabled || false}
            onChange={(e) => onChange('mcpEnabled', e.target.checked)}
          />
          <div className="option-info">
            <div className="option-name">Enable MCP Integration</div>
            <div className="option-description">
              Allow sensei to use external tools for enhanced capabilities
            </div>
          </div>
        </label>
      </div>

      {/* Tool Categories */}
      {categories.map(category => (
        <div key={category.id} className="settings-section">
          <h4>{category.name}</h4>
          <p className="category-description">{category.description}</p>
          
          <div className="tools-grid">
            {getCategoryTools(category.id).map(tool => (
              <div key={tool.id} className={`tool-card ${tool.enabled ? 'enabled' : ''}`}>
                <div className="tool-header">
                  <div className="tool-info">
                    <div className="tool-name">{tool.name}</div>
                    <div className="tool-description">{tool.description}</div>
                  </div>
                  <div className="tool-status">
                    {getStatusIcon(tool.status)}
                  </div>
                </div>
                
                <div className="tool-details">
                  <div className="tool-endpoint">
                    <strong>Endpoint:</strong> {tool.endpoint}
                  </div>
                  {tool.requiresAuth && (
                    <div className="tool-auth">
                      🔐 Requires authentication
                    </div>
                  )}
                </div>
                
                <div className="tool-actions">
                  <button
                    className="test-tool-btn"
                    onClick={() => testToolConnection(tool)}
                    disabled={tool.status === 'testing'}
                  >
                    {tool.status === 'testing' ? '🔄 Testing...' : '🧪 Test'}
                  </button>
                  
                  <label className="tool-toggle">
                    <input
                      type="checkbox"
                      checked={tool.enabled}
                      onChange={(e) => toggleTool(tool.id, e.target.checked)}
                      disabled={tool.status === 'unavailable'}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  
                  {tool.id.startsWith('custom-') && (
                    <button
                      className="remove-tool-btn"
                      onClick={() => removeCustomTool(tool.id)}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Add Custom Tool */}
      <div className="settings-section">
        <h4>➕ Add Custom Tool</h4>
        <p className="section-description">
          Connect your own MCP-compatible tools and services
        </p>
        
        <div className="custom-tool-form">
          <div className="form-row">
            <input
              type="text"
              placeholder="Tool name"
              value={customTool.name}
              onChange={(e) => setCustomTool(prev => ({ ...prev, name: e.target.value }))}
              className="tool-input"
            />
            <input
              type="url"
              placeholder="http://localhost:3001/mcp/custom"
              value={customTool.endpoint}
              onChange={(e) => setCustomTool(prev => ({ ...prev, endpoint: e.target.value }))}
              className="tool-input"
            />
          </div>
          
          <textarea
            placeholder="Tool description (optional)"
            value={customTool.description}
            onChange={(e) => setCustomTool(prev => ({ ...prev, description: e.target.value }))}
            className="tool-textarea"
            rows={2}
          />
          
          <button
            className="add-tool-btn"
            onClick={addCustomTool}
            disabled={!customTool.name || !customTool.endpoint}
          >
            ➕ Add Custom Tool
          </button>
        </div>
      </div>

      {/* MCP Configuration */}
      <div className="settings-section">
        <h4>⚙️ MCP Configuration</h4>
        
        <div className="config-options">
          <div className="config-item">
            <label className="setting-label">MCP Server Port</label>
            <input
              type="number"
              value={settings.mcpPort || 3001}
              onChange={(e) => onChange('mcpPort', parseInt(e.target.value))}
              className="config-input"
              min="1000"
              max="65535"
            />
          </div>
          
          <div className="config-item">
            <label className="setting-label">Request Timeout (ms)</label>
            <input
              type="number"
              value={settings.mcpTimeout || 5000}
              onChange={(e) => onChange('mcpTimeout', parseInt(e.target.value))}
              className="config-input"
              min="1000"
              max="30000"
              step="1000"
            />
          </div>
          
          <label className="checkbox-option">
            <input
              type="checkbox"
              checked={settings.mcpLogging || false}
              onChange={(e) => onChange('mcpLogging', e.target.checked)}
            />
            <div className="option-info">
              <div className="option-name">Enable MCP Logging</div>
              <div className="option-description">
                Log MCP requests and responses for debugging
              </div>
            </div>
          </label>
          
          <label className="checkbox-option">
            <input
              type="checkbox"
              checked={settings.mcpSandbox || true}
              onChange={(e) => onChange('mcpSandbox', e.target.checked)}
            />
            <div className="option-info">
              <div className="option-name">Sandbox Mode</div>
              <div className="option-description">
                Restrict MCP tools to safe operations only
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Security Notice */}
      <div className="settings-section security-notice">
        <h4>🛡️ Security Notice</h4>
        <div className="security-content">
          <p>
            <strong>🥷 Sovereign Security:</strong> All MCP tools run locally to maintain your privacy and control. 
            Never enable tools that connect to external services unless you fully trust them.
          </p>
          <ul>
            <li>✅ File system access is sandboxed to your project directory</li>
            <li>✅ Terminal commands are filtered for safety</li>
            <li>✅ Network requests are logged and can be reviewed</li>
            <li>⚠️ Custom tools should be audited before enabling</li>
          </ul>
        </div>
      </div>
    </div>
  );
};