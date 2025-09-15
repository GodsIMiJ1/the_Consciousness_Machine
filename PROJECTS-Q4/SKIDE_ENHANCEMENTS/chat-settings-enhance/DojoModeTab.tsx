import React, { useState, useEffect } from 'react';

export interface DojoModeTabProps {
  settings: any;
  onChange: (key: string, value: any) => void;
}

export const DojoModeTab: React.FC<DojoModeTabProps> = ({
  settings,
  onChange,
}) => {
  const [previewTheme, setPreviewTheme] = useState('ghostflow');

  const themes = [
    {
      id: 'ghostflow',
      name: '🥷 GhostFlow Mystical',
      description: 'Dark mystical theme with ninja aesthetics and energy flows',
      preview: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      textColor: '#e0e0e0',
    },
    {
      id: 'professional',
      name: '💼 Professional',
      description: 'Clean, VSCode-inspired theme for focused development',
      preview: 'linear-gradient(135deg, #1e1e1e 0%, #252526 50%, #2d2d30 100%)',
      textColor: '#cccccc',
    },
    {
      id: 'sensei-light',
      name: '☀️ Sensei Light',
      description: 'Light theme with subtle mystical accents',
      preview: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%)',
      textColor: '#212529',
    },
    {
      id: 'cyber-dojo',
      name: '⚡ Cyber Dojo',
      description: 'High-contrast cyberpunk theme with neon accents',
      preview: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      textColor: '#00ff88',
    },
  ];

  const personalityLevels = [
    {
      id: 'minimal',
      name: '🤖 Minimal',
      description: 'Technical responses with minimal mystical elements',
      example: '"Here\'s the TypeScript implementation for your component..."',
    },
    {
      id: 'balanced',
      name: '🥷 Balanced',
      description: 'Mix of technical guidance and GhostFlow wisdom',
      example: '"Ghost King, let us craft this component with precise digital jutsu..."',
    },
    {
      id: 'full-mystical',
      name: '🌊 Full Mystical',
      description: 'Complete GhostFlow Jitsu immersion with rich metaphors',
      example: '"Ah, Ghost King, the energy flows through this technique like water through bamboo..."',
    },
    {
      id: 'custom',
      name: '⚙️ Custom',
      description: 'Define your own personality rules and responses',
      example: 'Fully customizable based on your preferences...',
    },
  ];

  const responseStyles = [
    {
      id: 'detailed',
      name: '📚 Detailed Explanations',
      description: 'Comprehensive responses with examples and context',
    },
    {
      id: 'concise',
      name: '⚡ Concise & Direct',
      description: 'Brief, to-the-point responses focused on action',
    },
    {
      id: 'educational',
      name: '🎓 Educational',
      description: 'Teaching-focused with step-by-step breakdowns',
    },
    {
      id: 'collaborative',
      name: '🤝 Collaborative',
      description: 'Interactive responses that ask clarifying questions',
    },
  ];

  const handleThemeChange = (themeId: string) => {
    onChange('theme', themeId);
    setPreviewTheme(themeId);
    
    // Apply theme preview to the modal
    applyThemePreview(themeId);
  };

  const applyThemePreview = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      const modal = document.querySelector('.settings-modal') as HTMLElement;
      if (modal) {
        modal.style.background = theme.preview;
        modal.style.color = theme.textColor;
      }
    }
  };

  const handleCustomPersonalityChange = (customRules: string) => {
    onChange('customPersonalityRules', customRules);
  };

  return (
    <div className="dojo-mode-tab">
      {/* Theme Selection */}
      <div className="settings-section">
        <h3>🎭 Dojo Theme</h3>
        <p className="section-description">
          Choose your visual style for the ultimate coding meditation experience
        </p>
        
        <div className="theme-grid">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className={`theme-card ${settings.theme === theme.id ? 'selected' : ''}`}
              onClick={() => handleThemeChange(theme.id)}
            >
              <div 
                className="theme-preview"
                style={{ background: theme.preview }}
              >
                <div className="theme-preview-text" style={{ color: theme.textColor }}>
                  Aa
                </div>
              </div>
              <div className="theme-info">
                <div className="theme-name">{theme.name}</div>
                <div className="theme-description">{theme.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Personality Level */}
      <div className="settings-section">
        <h3>🥷 Sensei Personality</h3>
        <p className="section-description">
          Configure how mystical and immersive you want your AI sensei to be
        </p>
        
        <div className="personality-levels">
          {personalityLevels.map((level) => (
            <div
              key={level.id}
              className={`personality-card ${settings.personalityLevel === level.id ? 'selected' : ''}`}
              onClick={() => onChange('personalityLevel', level.id)}
            >
              <div className="personality-header">
                <div className="personality-name">{level.name}</div>
                <div className="personality-description">{level.description}</div>
              </div>
              <div className="personality-example">
                <strong>Example:</strong> {level.example}
              </div>
            </div>
          ))}
        </div>

        {/* Custom Personality Rules */}
        {settings.personalityLevel === 'custom' && (
          <div className="custom-personality">
            <label className="setting-label">Custom Personality Rules</label>
            <textarea
              value={settings.customPersonalityRules || ''}
              onChange={(e) => handleCustomPersonalityChange(e.target.value)}
              className="custom-rules-textarea"
              placeholder="Define your custom sensei personality rules here...

Example:
- Always use specific technical terms
- Include code examples in responses
- Use martial arts metaphors sparingly
- Focus on performance optimization advice"
              rows={8}
            />
          </div>
        )}
      </div>

      {/* Response Style */}
      <div className="settings-section">
        <h3>💬 Response Style</h3>
        <p className="section-description">
          How would you like your sensei to structure responses?
        </p>
        
        <div className="response-styles">
          {responseStyles.map((style) => (
            <label key={style.id} className="response-style-option">
              <input
                type="radio"
                name="responseStyle"
                value={style.id}
                checked={settings.responseStyle === style.id}
                onChange={(e) => onChange('responseStyle', e.target.value)}
              />
              <div className="style-info">
                <div className="style-name">{style.name}</div>
                <div className="style-description">{style.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Advanced Behavior */}
      <div className="settings-section">
        <h3>⚙️ Advanced Behavior</h3>
        
        <div className="behavior-options">
          <label className="checkbox-option">
            <input
              type="checkbox"
              checked={settings.autoContextInjection || true}
              onChange={(e) => onChange('autoContextInjection', e.target.checked)}
            />
            <div className="option-info">
              <div className="option-name">🔍 Auto Context Injection</div>
              <div className="option-description">
                Automatically include workspace files and git status in conversations
              </div>
            </div>
          </label>

          <label className="checkbox-option">
            <input
              type="checkbox"
              checked={settings.streamingMode || true}
              onChange={(e) => onChange('streamingMode', e.target.checked)}
            />
            <div className="option-info">
              <div className="option-name">⚡ Streaming Responses</div>
              <div className="option-description">
                Show responses in real-time as they're generated
              </div>
            </div>
          </label>

          <label className="checkbox-option">
            <input
              type="checkbox"
              checked={settings.codeHighlighting || true}
              onChange={(e) => onChange('codeHighlighting', e.target.checked)}
            />
            <div className="option-info">
              <div className="option-name">🎨 Code Syntax Highlighting</div>
              <div className="option-description">
                Enable syntax highlighting in code blocks
              </div>
            </div>
          </label>

          <label className="checkbox-option">
            <input
              type="checkbox"
              checked={settings.smartSuggestions || true}
              onChange={(e) => onChange('smartSuggestions', e.target.checked)}
            />
            <div className="option-info">
              <div className="option-name">🧠 Smart Suggestions</div>
              <div className="option-description">
                Show contextual command suggestions based on workspace
              </div>
            </div>
          </label>

          <label className="checkbox-option">
            <input
              type="checkbox"
              checked={settings.memoryPersistence || true}
              onChange={(e) => onChange('memoryPersistence', e.target.checked)}
            />
            <div className="option-info">
              <div className="option-name">💾 Conversation Memory</div>
              <div className="option-description">
                Remember conversation history across sessions
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Mystical Animations */}
      <div className="settings-section">
        <h3>✨ Mystical Effects</h3>
        
        <div className="mystical-options">
          <div className="option-group">
            <label className="setting-label">
              Animation Level: {settings.animationLevel || 'medium'}
            </label>
            <select
              value={settings.animationLevel || 'medium'}
              onChange={(e) => onChange('animationLevel', e.target.value)}
              className="mystical-select"
            >
              <option value="none">🚫 No Animations</option>
              <option value="minimal">🔸 Minimal</option>
              <option value="medium">🔷 Medium</option>
              <option value="full">💫 Full Mystical</option>
            </select>
          </div>

          <label className="checkbox-option">
            <input
              type="checkbox"
              checked={settings.particleEffects || false}
              onChange={(e) => onChange('particleEffects', e.target.checked)}
            />
            <div className="option-info">
              <div className="option-name">✨ Particle Effects</div>
              <div className="option-description">
                Energy particles floating in the background
              </div>
            </div>
          </label>

          <label className="checkbox-option">
            <input
              type="checkbox"
              checked={settings.typingSound || false}
              onChange={(e) => onChange('typingSound', e.target.checked)}
            />
            <div className="option-info">
              <div className="option-name">🔊 Mystical Sounds</div>
              <div className="option-description">
                Subtle audio feedback for typing and responses
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Preview Section */}
      <div className="settings-section">
        <h3>👁️ Live Preview</h3>
        <div className="dojo-preview">
          <div className="preview-chat">
            <div className="preview-message user">
              <div className="message-content">
                Hello, Sensei! Can you help me debug this TypeScript error?
              </div>
            </div>
            <div className="preview-message kodii">
              <div className="sensei-avatar-preview">🥷</div>
              <div className="message-content">
                {settings.personalityLevel === 'minimal' && 
                  "Here's how to resolve that TypeScript error..."}
                {settings.personalityLevel === 'balanced' && 
                  "🥷 Ah, Ghost King, I sense shadow spirits in your code. Let me guide you..."}
                {settings.personalityLevel === 'full-mystical' && 
                  "🌊 The energy flows are disrupted, Ghost King. These shadow spirits whisper of type misalignment. Let us channel our debugging chakras..."}
                {settings.personalityLevel === 'custom' && 
                  "Custom personality response based on your rules..."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};