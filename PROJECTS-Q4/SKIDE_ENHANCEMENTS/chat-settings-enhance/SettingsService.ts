export interface DojoSettings {
  models: {
    currentModel: string;
    temperature: number;
    maxTokens: number;
    baseUrl: string;
  };
  dojo: {
    theme: 'ghostflow' | 'professional' | 'sensei-light' | 'cyber-dojo';
    personalityLevel: 'minimal' | 'balanced' | 'full-mystical' | 'custom';
    customPersonalityRules: string;
    responseStyle: 'detailed' | 'concise' | 'educational' | 'collaborative';
    autoContextInjection: boolean;
    streamingMode: boolean;
    codeHighlighting: boolean;
    smartSuggestions: boolean;
    memoryPersistence: boolean;
    animationLevel: 'none' | 'minimal' | 'medium' | 'full';
    particleEffects: boolean;
    typingSound: boolean;
  };
  mcp: {
    mcpEnabled: boolean;
    mcpPort: number;
    mcpTimeout: number;
    mcpLogging: boolean;
    mcpSandbox: boolean;
    enabledTools: string[];
  };
  rules: {
    rulesEnabled: boolean;
    ruleLogging: boolean;
    strictMode: boolean;
    customRules: any[];
  };
  advanced: {
    debugMode: boolean;
    maxConversationHistory: number;
    responseTimeout: number;
    autoSaveInterval: number;
    experimentalFeatures: boolean;
  };
}

export class SettingsService {
  private static readonly SETTINGS_KEY = 'skide-dojo-settings';
  
  static getDefaultSettings(): DojoSettings {
    return {
      models: {
        currentModel: 'sensei-kodii:latest',
        temperature: 0.8,
        maxTokens: 4096,
        baseUrl: 'http://localhost:11434',
      },
      dojo: {
        theme: 'ghostflow',
        personalityLevel: 'balanced',
        customPersonalityRules: '',
        responseStyle: 'detailed',
        autoContextInjection: true,
        streamingMode: true,
        codeHighlighting: true,
        smartSuggestions: true,
        memoryPersistence: true,
        animationLevel: 'medium',
        particleEffects: false,
        typingSound: false,
      },
      mcp: {
        mcpEnabled: false,
        mcpPort: 3001,
        mcpTimeout: 5000,
        mcpLogging: false,
        mcpSandbox: true,
        enabledTools: ['web-search', 'file-system', 'code-analyzer', 'documentation'],
      },
      rules: {
        rulesEnabled: true,
        ruleLogging: false,
        strictMode: false,
        customRules: [],
      },
      advanced: {
        debugMode: false,
        maxConversationHistory: 100,
        responseTimeout: 30000,
        autoSaveInterval: 10000,
        experimentalFeatures: false,
      },
    };
  }

  static async loadAllSettings(): Promise<DojoSettings> {
    try {
      const stored = localStorage.getItem(this.SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Merge with defaults to ensure all properties exist
        const defaults = this.getDefaultSettings();
        return this.deepMerge(defaults, parsed);
      }
    } catch (error) {
      console.error('Failed to load dojo settings:', error);
    }
    
    return this.getDefaultSettings();
  }

  static async saveAllSettings(settings: DojoSettings): Promise<void> {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
      
      // Trigger settings change event
      window.dispatchEvent(new CustomEvent('dojo-settings-changed', {
        detail: settings
      }));
      
    } catch (error) {
      console.error('Failed to save dojo settings:', error);
      throw error;
    }
  }

  static async saveCategorySettings(category: keyof DojoSettings, categorySettings: any): Promise<void> {
    try {
      const currentSettings = await this.loadAllSettings();
      currentSettings[category] = { ...currentSettings[category], ...categorySettings };
      await this.saveAllSettings(currentSettings);
    } catch (error) {
      console.error(`Failed to save ${category} settings:`, error);
      throw error;
    }
  }

  static async loadCategorySettings<T extends keyof DojoSettings>(category: T): Promise<DojoSettings[T]> {
    const allSettings = await this.loadAllSettings();
    return allSettings[category];
  }

  static async resetToDefaults(): Promise<void> {
    try {
      const defaults = this.getDefaultSettings();
      await this.saveAllSettings(defaults);
    } catch (error) {
      console.error('Failed to reset settings to defaults:', error);
      throw error;
    }
  }

  static async exportSettings(): Promise<string> {
    const settings = await this.loadAllSettings();
    return JSON.stringify({
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        source: 'SKIDE Dojo',
      },
      settings,
    }, null, 2);
  }

  static async importSettings(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.settings) {
        // Validate the structure
        const defaults = this.getDefaultSettings();
        const validatedSettings = this.deepMerge(defaults, data.settings);
        
        await this.saveAllSettings(validatedSettings);
      } else {
        throw new Error('Invalid settings file format');
      }
    } catch (error) {
      console.error('Failed to import settings:', error);
      throw error;
    }
  }

  static validateSettings(settings: any): boolean {
    try {
      const defaults = this.getDefaultSettings();
      
      // Check that all required categories exist
      const requiredCategories = Object.keys(defaults) as (keyof DojoSettings)[];
      for (const category of requiredCategories) {
        if (!settings[category] || typeof settings[category] !== 'object') {
          return false;
        }
      }
      
      return true;
    } catch {
      return false;
    }
  }

  static getSettingsBackupName(): string {
    const date = new Date().toISOString().split('T')[0];
    return `skide-dojo-settings-backup-${date}.json`;
  }

  static async createBackup(): Promise<void> {
    try {
      const exportData = await this.exportSettings();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = this.getSettingsBackupName();
      a.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to create settings backup:', error);
      throw error;
    }
  }

  // Listen for settings changes
  static onSettingsChange(callback: (settings: DojoSettings) => void): () => void {
    const handler = (event: CustomEvent) => {
      callback(event.detail);
    };
    
    window.addEventListener('dojo-settings-changed', handler as EventListener);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('dojo-settings-changed', handler as EventListener);
    };
  }

  // Utility function for deep merging objects
  private static deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  // Get specific setting with fallback
  static async getSetting<T>(path: string, fallback: T): Promise<T> {
    try {
      const settings = await this.loadAllSettings();
      const value = this.getNestedValue(settings, path);
      return value !== undefined ? value : fallback;
    } catch {
      return fallback;
    }
  }

  // Set specific setting
  static async setSetting(path: string, value: any): Promise<void> {
    try {
      const settings = await this.loadAllSettings();
      this.setNestedValue(settings, path, value);
      await this.saveAllSettings(settings);
    } catch (error) {
      console.error(`Failed to set setting ${path}:`, error);
      throw error;
    }
  }

  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private static setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      return current[key];
    }, obj);
    
    target[lastKey] = value;
  }
}