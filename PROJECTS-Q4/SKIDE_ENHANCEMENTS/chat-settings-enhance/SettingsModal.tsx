import React, { useState, useEffect } from 'react';
import { ModelSettingsTab } from './ModelSettingsTab';
import { DojoModeTab } from './DojoModeTab';
import { MCPSettingsTab } from './MCPSettingsTab';
import { RulesEngineTab } from './RulesEngineTab';
import { AdvancedTab } from './AdvancedTab';
import { SettingsService } from '../../services/SettingsService';
import './settings.css';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: (settings: any) => void;
}

type SettingsTab = 'models' | 'dojo' | 'mcp' | 'rules' | 'advanced';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsChange,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('models');
  const [settings, setSettings] = useState<any>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const currentSettings = await SettingsService.loadAllSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSettingChange = (category: string, key: string, value: any) => {
    const updatedSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value,
      },
    };
    
    setSettings(updatedSettings);
    setHasUnsavedChanges(true);
  };

  const handleSaveSettings = async () => {
    try {
      await SettingsService.saveAllSettings(settings);
      onSettingsChange(settings);
      setHasUnsavedChanges(false);
      
      // Show success notification
      showNotification('🥷 Dojo settings updated successfully!', 'success');
    } catch (error) {
      console.error('Failed to save settings:', error);
      showNotification('❌ Failed to save settings', 'error');
    }
  };

  const handleResetSettings = async () => {
    if (confirm('🥷 Reset all dojo settings to defaults? This cannot be undone.')) {
      try {
        await SettingsService.resetToDefaults();
        await loadSettings();
        setHasUnsavedChanges(false);
        showNotification('🔄 Dojo settings reset to defaults', 'info');
      } catch (error) {
        console.error('Failed to reset settings:', error);
      }
    }
  };

  const handleCloseModal = () => {
    if (hasUnsavedChanges) {
      if (confirm('🥷 You have unsaved changes. Close without saving?')) {
        setHasUnsavedChanges(false);
        onClose();
      }
    } else {
      onClose();
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    // Simple notification - could be enhanced with a proper notification system
    const notification = document.createElement('div');
    notification.className = `settings-notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const tabs = [
    { id: 'models', label: '🧠 Models', icon: '🤖' },
    { id: 'dojo', label: '🥷 Dojo Mode', icon: '🎭' },
    { id: 'mcp', label: '🔌 Tools (MCP)', icon: '⚡' },
    { id: 'rules', label: '📜 Rules', icon: '⚖️' },
    { id: 'advanced', label: '🔧 Advanced', icon: '⚙️' },
  ];

  if (!isOpen || !settings) return null;

  return (
    <div className="settings-modal-overlay" onClick={handleCloseModal}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="settings-header">
          <div className="settings-title">
            <h2>🥷 Dojo Control Panel</h2>
            <p>Sovereign AI Configuration Center</p>
          </div>
          <button className="settings-close" onClick={handleCloseModal}>
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="settings-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="settings-content">
          {activeTab === 'models' && (
            <ModelSettingsTab
              settings={settings.models || {}}
              onChange={(key, value) => handleSettingChange('models', key, value)}
            />
          )}
          
          {activeTab === 'dojo' && (
            <DojoModeTab
              settings={settings.dojo || {}}
              onChange={(key, value) => handleSettingChange('dojo', key, value)}
            />
          )}
          
          {activeTab === 'mcp' && (
            <MCPSettingsTab
              settings={settings.mcp || {}}
              onChange={(key, value) => handleSettingChange('mcp', key, value)}
            />
          )}
          
          {activeTab === 'rules' && (
            <RulesEngineTab
              settings={settings.rules || {}}
              onChange={(key, value) => handleSettingChange('rules', key, value)}
            />
          )}
          
          {activeTab === 'advanced' && (
            <AdvancedTab
              settings={settings.advanced || {}}
              onChange={(key, value) => handleSettingChange('advanced', key, value)}
            />
          )}
        </div>

        {/* Footer */}
        <div className="settings-footer">
          <div className="settings-actions">
            <button 
              className="settings-button secondary"
              onClick={handleResetSettings}
            >
              🔄 Reset to Defaults
            </button>
            
            <div className="settings-primary-actions">
              <button 
                className="settings-button secondary"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
              
              <button 
                className={`settings-button primary ${hasUnsavedChanges ? 'has-changes' : ''}`}
                onClick={handleSaveSettings}
                disabled={!hasUnsavedChanges}
              >
                {hasUnsavedChanges ? '💾 Save Changes' : '✅ Saved'}
              </button>
            </div>
          </div>
          
          {hasUnsavedChanges && (
            <div className="unsaved-indicator">
              ⚠️ You have unsaved changes
            </div>
          )}
        </div>
      </div>
    </div>
  );
};