import React, { useState, useEffect } from 'react';

export interface RulesEngineTabProps {
  settings: any;
  onChange: (key: string, value: any) => void;
}

interface Rule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  enabled: boolean;
  category: 'behavior' | 'safety' | 'productivity' | 'custom';
}

export const RulesEngineTab: React.FC<RulesEngineTabProps> = ({
  settings,
  onChange,
}) => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    trigger: '',
    action: '',
    category: 'custom' as Rule['category'],
  });
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);

  const defaultRules: Rule[] = [
    {
      id: 'no-external-apis',
      name: '🛡️ Block External API Suggestions',
      description: 'Prevent sensei from suggesting external API calls or cloud services',
      trigger: 'response_contains:["api.openai.com", "cloud", "external service"]',
      action: 'reject_response:{"reason": "Violates sovereignty principle"}',
      enabled: true,
      category: 'safety',
    },
    {
      id: 'prefer-local-tools',
      name: '🏠 Prefer Local Tools',
      description: 'Always suggest local alternatives before external solutions',
      trigger: 'user_mentions:["service", "tool", "platform"]',
      action: 'prepend_response:{"text": "For sovereignty, let me suggest local alternatives: "}',
      enabled: true,
      category: 'behavior',
    },
    {
      id: 'require-tests',
      name: '🧪 Enforce Testing',
      description: 'Always include test suggestions when providing code',
      trigger: 'response_contains_code:true',
      action: 'append_response:{"text": "\n\n🎯 Don\'t forget to validate this technique with proper tests!"}',
      enabled: true,
      category: 'productivity',
    },
    {
      id: 'mystical-greeting',
      name: '🥷 Mystical Greeting Enhancement',
      description: 'Add mystical flair to greetings and first interactions',
      trigger: 'conversation_start:true OR user_says:["hello", "hi", "hey"]',
      action: 'enhance_response:{"style": "mystical_greeting"}',
      enabled: true,
      category: 'behavior',
    },
    {
      id: 'code-security-check',
      name: '🔒 Code Security Warnings',
      description: 'Warn about potential security issues in code suggestions',
      trigger: 'code_contains:["eval(", "innerHTML", "dangerouslySetInnerHTML"]',
      action: 'prepend_response:{"text": "⚠️ Security Notice: This code contains potentially unsafe patterns. "}',
      enabled: true,
      category: 'safety',
    },
    {
      id: 'performance-tips',
      name: '⚡ Performance Optimization Hints',
      description: 'Suggest performance improvements for React components',
      trigger: 'code_contains:["React.Component", "useState", "useEffect"] AND user_context:["performance"]',
      action: 'append_response:{"text": "\n\n⚡ Performance Tip: Consider memoization and optimization techniques."}',
      enabled: false,
      category: 'productivity',
    },
  ];

  useEffect(() => {
    // Load rules from settings or use defaults
    const savedRules = settings.customRules || defaultRules;
    setRules(savedRules);
  }, [settings.customRules]);

  const toggleRule = (ruleId: string, enabled: boolean) => {
    const updatedRules = rules.map(rule =>
      rule.id === ruleId ? { ...rule, enabled } : rule
    );
    setRules(updatedRules);
    onChange('customRules', updatedRules);
  };

  const addNewRule = () => {
    if (!newRule.name || !newRule.trigger || !newRule.action) return;

    const rule: Rule = {
      id: `custom-${Date.now()}`,
      name: newRule.name,
      description: newRule.description,
      trigger: newRule.trigger,
      action: newRule.action,
      enabled: true,
      category: newRule.category,
    };

    const updatedRules = [...rules, rule];
    setRules(updatedRules);
    onChange('customRules', updatedRules);
    
    // Reset form
    setNewRule({
      name: '',
      description: '',
      trigger: '',
      action: '',
      category: 'custom',
    });
    setShowRuleBuilder(false);
  };

  const deleteRule = (ruleId: string) => {
    if (confirm('🥷 Delete this rule? This action cannot be undone.')) {
      const updatedRules = rules.filter(rule => rule.id !== ruleId);
      setRules(updatedRules);
      onChange('customRules', updatedRules);
    }
  };

  const duplicateRule = (rule: Rule) => {
    const duplicatedRule: Rule = {
      ...rule,
      id: `duplicate-${Date.now()}`,
      name: `${rule.name} (Copy)`,
      enabled: false,
    };

    const updatedRules = [...rules, duplicatedRule];
    setRules(updatedRules);
    onChange('customRules', updatedRules);
  };

  const exportRules = () => {
    const rulesData = JSON.stringify(rules, null, 2);
    const blob = new Blob([rulesData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skide-dojo-rules.json';
    a.click();
    
    URL.revokeObjectURL(url);
  };

  const importRules = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedRules = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedRules)) {
          setRules(importedRules);
          onChange('customRules', importedRules);
        }
      } catch (error) {
        alert('❌ Invalid rules file format');
      }
    };
    reader.readAsText(file);
  };

  const getCategoryRules = (category: Rule['category']) => {
    return rules.filter(rule => rule.category === category);
  };

  const categories = [
    { id: 'safety', name: '🛡️ Safety Rules', description: 'Security and privacy protection' },
    { id: 'behavior', name: '🎭 Behavior Rules', description: 'Response style and personality' },
    { id: 'productivity', name: '📈 Productivity Rules', description: 'Code quality and best practices' },
    { id: 'custom', name: '⚙️ Custom Rules', description: 'User-defined custom behaviors' },
  ];

  const triggerExamples = [
    'user_says:["help", "assist"]',
    'response_contains:["API", "service"]',
    'code_contains:["useState", "useEffect"]',
    'conversation_start:true',
    'user_context:["error", "bug"]',
    'file_type:"typescript"',
    'time_of_day:"morning"',
  ];

  const actionExamples = [
    'prepend_response:{"text": "🥷 Ghost King, "}',
    'append_response:{"text": "\\n\\nRemember to test!"}',
    'reject_response:{"reason": "Violates policy"}',
    'enhance_response:{"style": "mystical"}',
    'suggest_alternative:{"text": "Consider local tools"}',
    'log_event:{"type": "rule_triggered"}',
  ];

  return (
    <div className="rules-engine-tab">
      {/* Overview */}
      <div className="settings-section">
        <h3>📜 Dojo Rules Engine</h3>
        <p className="section-description">
          Define custom behaviors and guidelines for your AI sensei. Rules ensure responses align with your values and workflow.
        </p>
        
        <div className="rules-stats">
          <div className="stat-item">
            <span className="stat-number">{rules.length}</span>
            <span className="stat-label">Total Rules</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{rules.filter(r => r.enabled).length}</span>
            <span className="stat-label">Active Rules</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{rules.filter(r => r.category === 'custom').length}</span>
            <span className="stat-label">Custom Rules</span>
          </div>
        </div>

        <div className="rules-actions">
          <button
            className="rule-action-btn primary"
            onClick={() => setShowRuleBuilder(!showRuleBuilder)}
          >
            ➕ Add Custom Rule
          </button>
          <button className="rule-action-btn" onClick={exportRules}>
            📤 Export Rules
          </button>
          <label className="rule-action-btn">
            📥 Import Rules
            <input
              type="file"
              accept=".json"
              onChange={importRules}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {/* Rule Builder */}
      {showRuleBuilder && (
        <div className="settings-section rule-builder">
          <h4>🔧 Rule Builder</h4>
          
          <div className="builder-form">
            <div className="form-row">
              <input
                type="text"
                placeholder="Rule name"
                value={newRule.name}
                onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                className="rule-input"
              />
              <select
                value={newRule.category}
                onChange={(e) => setNewRule(prev => ({ ...prev, category: e.target.value as Rule['category'] }))}
                className="rule-select"
              >
                <option value="custom">⚙️ Custom</option>
                <option value="behavior">🎭 Behavior</option>
                <option value="productivity">📈 Productivity</option>
                <option value="safety">🛡️ Safety</option>
              </select>
            </div>
            
            <textarea
              placeholder="Rule description"
              value={newRule.description}
              onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
              className="rule-textarea"
              rows={2}
            />
            
            <div className="trigger-action-row">
              <div className="trigger-section">
                <label className="rule-label">Trigger Condition</label>
                <textarea
                  placeholder="user_says:[&quot;help&quot;] OR response_contains:[&quot;API&quot;]"
                  value={newRule.trigger}
                  onChange={(e) => setNewRule(prev => ({ ...prev, trigger: e.target.value }))}
                  className="rule-textarea"
                  rows={3}
                />
                <div className="examples">
                  <strong>Examples:</strong>
                  {triggerExamples.map((example, i) => (
                    <button
                      key={i}
                      className="example-btn"
                      onClick={() => setNewRule(prev => ({ ...prev, trigger: example }))}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="action-section">
                <label className="rule-label">Action</label>
                <textarea
                  placeholder="prepend_response:{&quot;text&quot;: &quot;🥷 Ghost King, &quot;}"
                  value={newRule.action}
                  onChange={(e) => setNewRule(prev => ({ ...prev, action: e.target.value }))}
                  className="rule-textarea"
                  rows={3}
                />
                <div className="examples">
                  <strong>Examples:</strong>
                  {actionExamples.map((example, i) => (
                    <button
                      key={i}
                      className="example-btn"
                      onClick={() => setNewRule(prev => ({ ...prev, action: example }))}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="builder-actions">
              <button
                className="rule-action-btn secondary"
                onClick={() => setShowRuleBuilder(false)}
              >
                Cancel
              </button>
              <button
                className="rule-action-btn primary"
                onClick={addNewRule}
                disabled={!newRule.name || !newRule.trigger || !newRule.action}
              >
                ✅ Add Rule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rules by Category */}
      {categories.map(category => (
        <div key={category.id} className="settings-section">
          <h4>{category.name}</h4>
          <p className="category-description">{category.description}</p>
          
          <div className="rules-list">
            {getCategoryRules(category.id as Rule['category']).map(rule => (
              <div key={rule.id} className={`rule-card ${rule.enabled ? 'enabled' : 'disabled'}`}>
                <div className="rule-header">
                  <div className="rule-info">
                    <div className="rule-name">{rule.name}</div>
                    <div className="rule-description">{rule.description}</div>
                  </div>
                  <label className="rule-toggle">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={(e) => toggleRule(rule.id, e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                
                <div className="rule-details">
                  <div className="rule-condition">
                    <strong>Trigger:</strong>
                    <code>{rule.trigger}</code>
                  </div>
                  <div className="rule-action-detail">
                    <strong>Action:</strong>
                    <code>{rule.action}</code>
                  </div>
                </div>
                
                <div className="rule-actions">
                  <button
                    className="rule-btn"
                    onClick={() => duplicateRule(rule)}
                  >
                    📋 Duplicate
                  </button>
                  
                  {rule.id.startsWith('custom-') && (
                    <button
                      className="rule-btn danger"
                      onClick={() => deleteRule(rule.id)}
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {getCategoryRules(category.id as Rule['category']).length === 0 && (
              <div className="no-rules">
                No rules in this category yet.
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Global Settings */}
      <div className="settings-section">
        <h4>🌐 Global Rule Settings</h4>
        
        <div className="global-settings">
          <label className="checkbox-option">
            <input
              type="checkbox"
              checked={settings.rulesEnabled !== false}
              onChange={(e) => onChange('rulesEnabled', e.target.checked)}
            />
            <div className="option-info">
              <div className="option-name">Enable Rules Engine</div>
              <div className="option-description">
                Apply custom rules to all sensei responses
              </div>
            </div>
          </label>

          <label className="checkbox-option">
            <input
              type="checkbox"
              checked={settings.ruleLogging || false}
              onChange={(e) => onChange('ruleLogging', e.target.checked)}
            />
            <div className="option-info">
              <div className="option-name">Rule Execution Logging</div>
              <div className="option-description">
                Log when rules are triggered for debugging
              </div>
            </div>
          </label>

          <label className="checkbox-option">
            <input
              type="checkbox"
              checked={settings.strictMode || false}
              onChange={(e) => onChange('strictMode', e.target.checked)}
            />
            <div className="option-info">
              <div className="option-name">Strict Mode</div>
              <div className="option-description">
                Reject responses that violate any safety rules
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Documentation */}
      <div className="settings-section documentation">
        <h4>📚 Rule Syntax Documentation</h4>
        
        <div className="docs-content">
          <div className="docs-section">
            <h5>Trigger Conditions</h5>
            <ul>
              <li><code>user_says:["keyword1", "keyword2"]</code> - User message contains keywords</li>
              <li><code>response_contains:["text"]</code> - Response would contain text</li>
              <li><code>code_contains:["function"]</code> - Code blocks contain patterns</li>
              <li><code>conversation_start:true</code> - First message in conversation</li>
              <li><code>user_context:["error"]</code> - Context suggests user state</li>
              <li><code>file_type:"typescript"</code> - Current file type</li>
            </ul>
          </div>
          
          <div className="docs-section">
            <h5>Actions</h5>
            <ul>
              <li><code>prepend_response:{"text": "prefix"}</code> - Add text before response</li>
              <li><code>append_response:{"text": "suffix"}</code> - Add text after response</li>
              <li><code>reject_response:{"reason": "why"}</code> - Block the response</li>
              <li><code>enhance_response:{"style": "mystical"}</code> - Apply style enhancement</li>
              <li><code>suggest_alternative:{"text": "suggestion"}</code> - Provide alternatives</li>
            </ul>
          </div>
          
          <div className="docs-section">
            <h5>Operators</h5>
            <ul>
              <li><code>AND</code> - Both conditions must be true</li>
              <li><code>OR</code> - Either condition can be true</li>
              <li><code>NOT</code> - Condition must be false</li>
              <li><code>()</code> - Group conditions for precedence</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};