import React, { useState, useEffect } from 'react';
import { kodiiService } from '../../services/KodiiService';
import { AVAILABLE_MODELS } from '../../services/KodiiConfig';

export interface ModelSettingsTabProps {
  settings: any;
  onChange: (key: string, value: any) => void;
}

export const ModelSettingsTab: React.FC<ModelSettingsTabProps> = ({
  settings,
  onChange,
}) => {
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [ollamaLogs, setOllamaLogs] = useState<string[]>([]);

  useEffect(() => {
    loadModelData();
  }, []);

  const loadModelData = async () => {
    try {
      const models = await kodiiService.getAvailableModels();
      const status = kodiiService.getConnectionStatus();
      
      setAvailableModels(models);
      setConnectionStatus(status);
    } catch (error) {
      console.error('Failed to load model data:', error);
    }
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    setOllamaLogs([]);
    
    try {
      // Test basic connection
      addLog('🔍 Testing Ollama connection...');
      const response = await fetch('http://localhost:11434/api/tags');
      
      if (response.ok) {
        addLog('✅ Ollama service is running');
        
        const data = await response.json();
        addLog(`📊 Found ${data.models?.length || 0} models`);
        
        // Test current model
        if (settings.currentModel) {
          addLog(`🧠 Testing model: ${settings.currentModel}`);
          
          try {
            const testResponse = await fetch('http://localhost:11434/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: settings.currentModel,
                messages: [{ role: 'user', content: 'Test connection' }],
                stream: false,
              }),
            });
            
            if (testResponse.ok) {
              addLog('✅ Model responds successfully');
            } else {
              addLog(`❌ Model test failed: ${testResponse.statusText}`);
            }
          } catch (error) {
            addLog(`❌ Model test error: ${error.message}`);
          }
        }
        
      } else {
        addLog(`❌ Ollama not responding: ${response.statusText}`);
        addLog('💡 Try: ollama serve');
      }
      
    } catch (error) {
      addLog(`❌ Connection failed: ${error.message}`);
      addLog('💡 Make sure Ollama is installed and running');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const addLog = (message: string) => {
    setOllamaLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
  };

  const handleModelChange = async (modelName: string) => {
    onChange('currentModel', modelName);
    
    // Update model info
    const modelInfo = AVAILABLE_MODELS[modelName];
    if (modelInfo) {
      onChange('temperature', modelInfo.temperature);
      onChange('maxTokens', modelInfo.maxTokens);
    }
    
    // Try to switch the model in the service
    try {
      const success = await kodiiService.switchModel(modelName);
      if (success) {
        addLog(`🔄 Switched to ${modelName}`);
        await loadModelData();
      }
    } catch (error) {
      console.error('Failed to switch model:', error);
    }
  };

  const pullModel = async (modelName: string) => {
    addLog(`📥 Pulling model: ${modelName}`);
    
    try {
      // This would need to be implemented with proper Ollama pull API
      // For now, show instructions
      addLog(`💡 Run: ollama pull ${modelName}`);
    } catch (error) {
      addLog(`❌ Pull failed: ${error.message}`);
    }
  };

  return (
    <div className="model-settings-tab">
      <div className="settings-section">
        <h3>🤖 Model Configuration</h3>
        
        {/* Connection Status */}
        <div className="connection-status">
          <div className="status-row">
            <span className="status-label">Status:</span>
            <span className={`status-value ${connectionStatus?.connected ? 'connected' : 'disconnected'}`}>
              {connectionStatus?.connected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
            <button 
              className="test-button"
              onClick={testConnection}
              disabled={isTestingConnection}
            >
              {isTestingConnection ? '🔄 Testing...' : '🔍 Test Connection'}
            </button>
          </div>
          
          <div className="status-row">
            <span className="status-label">Provider:</span>
            <span className="status-value">{connectionStatus?.provider || 'None'}</span>
          </div>
          
          <div className="status-row">
            <span className="status-label">Current Model:</span>
            <span className="status-value">{connectionStatus?.model || 'None'}</span>
          </div>
        </div>

        {/* Model Selection */}
        <div className="model-selection">
          <label className="setting-label">Active Model</label>
          <select
            value={settings.currentModel || ''}
            onChange={(e) => handleModelChange(e.target.value)}
            className="model-select"
          >
            <option value="">Select a model...</option>
            {Object.values(AVAILABLE_MODELS).map((model: any) => (
              <option key={model.name} value={model.name}>
                {model.displayName} - {model.description}
              </option>
            ))}
          </select>
        </div>

        {/* Available Models */}
        <div className="available-models">
          <label className="setting-label">Available Models</label>
          <div className="models-list">
            {availableModels.length > 0 ? (
              availableModels.map((model) => (
                <div key={model.name} className="model-item">
                  <div className="model-info">
                    <div className="model-name">{model.name}</div>
                    <div className="model-meta">{model.size} • Modified: {model.modifiedAt}</div>
                  </div>
                  <div className="model-actions">
                    <button
                      className={`model-select-btn ${settings.currentModel === model.name ? 'active' : ''}`}
                      onClick={() => handleModelChange(model.name)}
                    >
                      {settings.currentModel === model.name ? '✅ Active' : 'Select'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-models">
                <p>No models found. Install models with:</p>
                <code>ollama pull sensei-kodii:latest</code>
              </div>
            )}
          </div>
        </div>

        {/* Model Parameters */}
        <div className="model-parameters">
          <h4>🎛️ Model Parameters</h4>
          
          <div className="parameter-group">
            <label className="setting-label">
              Temperature: {settings.temperature || 0.8}
              <span className="parameter-help">Higher = more creative, Lower = more focused</span>
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={settings.temperature || 0.8}
              onChange={(e) => onChange('temperature', parseFloat(e.target.value))}
              className="parameter-slider"
            />
          </div>
          
          <div className="parameter-group">
            <label className="setting-label">
              Max Tokens: {settings.maxTokens || 4096}
              <span className="parameter-help">Maximum response length</span>
            </label>
            <input
              type="range"
              min="512"
              max="8192"
              step="256"
              value={settings.maxTokens || 4096}
              onChange={(e) => onChange('maxTokens', parseInt(e.target.value))}
              className="parameter-slider"
            />
          </div>

          <div className="parameter-group">
            <label className="setting-label">
              Base URL
              <span className="parameter-help">Ollama server endpoint</span>
            </label>
            <input
              type="text"
              value={settings.baseUrl || 'http://localhost:11434'}
              onChange={(e) => onChange('baseUrl', e.target.value)}
              className="parameter-input"
              placeholder="http://localhost:11434"
            />
          </div>
        </div>

        {/* Suggested Models */}
        <div className="suggested-models">
          <h4>📦 Suggested Models</h4>
          <div className="suggestions-list">
            {[
              { name: 'sensei-kodii:latest', description: 'Custom SKIDE sensei (if available)', size: 'Custom' },
              { name: 'llama3.1:8b', description: 'General purpose model', size: '4.7GB' },
              { name: 'codellama:7b', description: 'Code-specialized model', size: '3.8GB' },
              { name: 'deepseek-coder:6.7b', description: 'Advanced coding model', size: '3.8GB' },
              { name: 'phi3:mini', description: 'Lightweight model', size: '2.3GB' },
            ].map((suggestion) => (
              <div key={suggestion.name} className="suggestion-item">
                <div className="suggestion-info">
                  <div className="suggestion-name">{suggestion.name}</div>
                  <div className="suggestion-desc">{suggestion.description}</div>
                  <div className="suggestion-size">Size: {suggestion.size}</div>
                </div>
                <button
                  className="pull-button"
                  onClick={() => pullModel(suggestion.name)}
                >
                  📥 Pull
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Connection Logs */}
        {ollamaLogs.length > 0 && (
          <div className="connection-logs">
            <h4>🔍 Connection Logs</h4>
            <div className="logs-container">
              {ollamaLogs.map((log, index) => (
                <div key={index} className="log-entry">
                  {log}
                </div>
              ))}
            </div>
            <button 
              className="clear-logs"
              onClick={() => setOllamaLogs([])}
            >
              🗑️ Clear Logs
            </button>
          </div>
        )}
      </div>
    </div>
  );
};